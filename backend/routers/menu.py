from fastapi import APIRouter, Depends, HTTPException
import mysql.connector

from database import get_db

router = APIRouter(prefix="/api/canteens", tags=["Menu"])


def _cursor_to_dicts(cursor) -> list[dict]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


SOUTH_INDIAN_ITEMS = {
    "dosa",
    "masala dosa",
    "idly",
    "idli",
    "poori",
    "pongal",
    "vada",
    "south indian combo",
}

NORTH_INDIAN_ITEMS = {
    "chapatti",
    "paratha",
    "aloo paratha",
    "full meals",
    "limited meals",
    "variety rice",
    "biryani",
    "chicken biryani",
    "north indian thali",
}

BEVERAGE_ITEMS = {
    "tea",
    "coffee",
    "cool drinks",
    "cold drinks",
    "fresh juice",
    "lassi",
}


def _map_to_frontend_category(item_name: str, db_category: str) -> str:
    name = (item_name or "").strip().lower()
    if name in SOUTH_INDIAN_ITEMS:
        return "South Indian"
    if name in NORTH_INDIAN_ITEMS:
        return "North Indian"
    if name in BEVERAGE_ITEMS or db_category == "Beverage":
        return "Beverages"
    return "Fast Food"


# ---------------------------------------------------------------------------
# GET /api/menu/refresh-availability
# ---------------------------------------------------------------------------
@router.get("/refresh-availability", tags=["Menu"])
def refresh_availability(conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            UPDATE Menu_Item 
            SET Availability_Status = TRUE, available_after = NULL
            WHERE available_after IS NOT NULL 
              AND available_after <= NOW()
              AND Category IN ('Fast Food', 'Snacks', 'Beverages')
            """
        )
        conn.commit()
        return {"restored": cursor.rowcount}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# GET /api/canteens/{id}/menu
# ---------------------------------------------------------------------------
@router.get("/{canteen_id}/menu")
def get_menu(canteen_id: int, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        # Verify canteen exists
        cursor.execute(
            "SELECT Canteen_ID FROM Canteen WHERE Canteen_ID = %s", (canteen_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Canteen not found")

        # Refresh availability inline
        cursor.execute(
            """
            UPDATE Menu_Item 
            SET Availability_Status = TRUE, available_after = NULL
            WHERE available_after IS NOT NULL 
              AND available_after <= NOW()
              AND Category IN ('Fast Food', 'Snacks', 'Beverages')
            """
        )
        conn.commit()

        cursor.execute(
            """
            SELECT Item_ID as item_id, Canteen_ID as canteen_id, Item_Name as name, 
                   Price as price, Category as db_category, Availability_Status as is_available,
                   stock_count, available_after
            FROM Menu_Item
            WHERE Canteen_ID = %s
            ORDER BY Category, Item_Name
            """,
            (canteen_id,),
        )
        items = _cursor_to_dicts(cursor)
        # Convert Decimal → float for JSON serialisation
        for item in items:
            if item.get("price") is not None:
                item["price"] = float(item["price"])
            # Convert tinyint to boolean
            item["is_available"] = bool(item["is_available"])
            item["category"] = item.get("db_category", "") # Use DB category directly as it's now cleaned
            item.pop("db_category", None)
            
            # Format datetime for frontend
            if item.get("available_after") and hasattr(item["available_after"], "isoformat"):
                item["available_after"] = item["available_after"].isoformat()
            
        return items

    except HTTPException:
        raise
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()

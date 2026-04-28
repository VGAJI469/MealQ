import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List

import mysql.connector
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_current_student
from database import get_db

router = APIRouter(prefix="/api/orders", tags=["Orders"])

GST_RATE = Decimal("0.05")  # 5 %


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------
class OrderItem(BaseModel):
    item_id: int
    quantity: int


class CreateOrderRequest(BaseModel):
    canteen_id: int
    items: List[OrderItem]
    payment_method: str  # Cash | UPI | Card


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _generate_order_id() -> str:
    ts = int(time.time())
    suffix = random.randint(1000, 9999)
    return f"ORD{ts}{suffix}"


def _decimal_to_float(d):
    return float(d) if isinstance(d, Decimal) else d


def _student_pk_from_registration(cursor, registration_no: str):
    cursor.execute(
        "SELECT Student_ID FROM Student WHERE Registration_No = %s",
        (registration_no,),
    )
    row = cursor.fetchone()
    if row:
        return row[0]

    # Backward compatibility for older tokens that used numeric Student_ID.
    if registration_no.isdigit():
        cursor.execute(
            "SELECT Student_ID FROM Student WHERE Student_ID = %s",
            (int(registration_no),),
        )
        row = cursor.fetchone()
    return row[0] if row else None


def _is_canteen_open_now(open_time, close_time) -> bool:
    """Return True when current local time is within operating hours."""
    if not open_time or not close_time:
        return True

    if isinstance(open_time, timedelta):
        open_time = (datetime.min + open_time).time()
    if isinstance(close_time, timedelta):
        close_time = (datetime.min + close_time).time()

    now = datetime.now().time()
    # Normal same-day window: 09:00 -> 21:00
    if open_time <= close_time:
        return open_time <= now <= close_time
    # Overnight window: 20:00 -> 02:00
    return now >= open_time or now <= close_time


def _fetch_full_order(cursor, order_id: int) -> dict:
    """Return a fully-populated order dict including items."""
    # Find canteen from the first item (assuming all items in order from same canteen)
    cursor.execute(
        """
        SELECT o.Order_ID, o.Student_ID, o.order_date, o.status, o.Total_Amount,
               c.Canteen_ID, c.name
        FROM Orders o
        LEFT JOIN Order_Item oi ON o.Order_ID = oi.Order_ID
        LEFT JOIN Menu_Item mi ON oi.Item_ID = mi.Item_ID
        LEFT JOIN Canteen c ON mi.Canteen_ID = c.Canteen_ID
        WHERE o.Order_ID = %s
        LIMIT 1
        """,
        (order_id,),
    )
    row = cursor.fetchone()
    if not row:
        return None

    keys = [
        "order_id", "student_id", "order_date", "status", "total_amount",
        "canteen_id", "canteen_name"
    ]
    order = dict(zip(keys, row))
    order["order_id"] = str(order["order_id"])
    order["student_id"] = str(order["student_id"])
    order["total_amount"] = _decimal_to_float(order["total_amount"])
    order["subtotal"] = 0.0
    order["gst"] = 0.0

    # Fetch items
    cursor.execute(
        """
        SELECT oi.Item_ID, oi.Quantity, oi.Subtotal,
               mi.Item_Name, mi.Price, mi.Category
        FROM Order_Item oi
        JOIN Menu_Item mi ON oi.Item_ID = mi.Item_ID
        WHERE oi.Order_ID = %s
        """,
        (order_id,),
    )
    item_keys = ["item_id", "quantity", "subtotal", "name", "price", "category"]
    order["items"] = []
    for irow in cursor.fetchall():
        item = dict(zip(item_keys, irow))
        item["subtotal"] = _decimal_to_float(item["subtotal"])
        item["price"] = _decimal_to_float(item["price"])
        order["subtotal"] += item["subtotal"]
        order["items"].append(item)

    order["gst"] = round(max(order["total_amount"] - order["subtotal"], 0.0), 2)

    if order.get("order_date"):
        order["order_date"] = order["order_date"].isoformat()

    # Fetch payment method
    cursor.execute("SELECT Payment_Method FROM Payment WHERE Order_ID = %s", (order_id,))
    pay_row = cursor.fetchone()
    order["payment_method"] = pay_row[0] if pay_row else "Unknown"

    return order


# ---------------------------------------------------------------------------
# GET /api/orders  –  all orders for the logged-in student
# ---------------------------------------------------------------------------
@router.get("")
def list_orders(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    registration_no: str = current["sub"]
    cursor = conn.cursor()
    try:
        student_pk = _student_pk_from_registration(cursor, registration_no)
        if not student_pk:
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute(
            "SELECT Order_ID FROM Orders WHERE Student_ID = %s ORDER BY order_date DESC",
            (student_pk,),
        )
        order_ids = [r[0] for r in cursor.fetchall()]
        orders = []
        for oid in order_ids:
            o = _fetch_full_order(cursor, oid)
            if o:
                orders.append(o)
        return orders
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# POST /api/orders  –  place a new order (full transaction)
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(
    body: CreateOrderRequest,
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    registration_no: str = current["sub"]

    if not body.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    valid_methods = {"Cash", "UPI", "Card"}
    if body.payment_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"payment_method must be one of {valid_methods}",
        )

    cursor = conn.cursor()
    try:
        # ── START TRANSACTION ─────────────────────────────────────────────
        conn.start_transaction()
        student_pk = _student_pk_from_registration(cursor, registration_no)
        if not student_pk:
            raise HTTPException(status_code=404, detail="Student not found")

        # Validate canteen
        cursor.execute(
            """
            SELECT Canteen_ID, open_time, close_time
            FROM Canteen
            WHERE Canteen_ID = %s
            """,
            (body.canteen_id,),
        )
        canteen_row = cursor.fetchone()
        if not canteen_row:
            raise HTTPException(status_code=404, detail="Canteen not found")
        # Temporarily allow ordering regardless of canteen open/close hours.
        # Keep the fetched fields for easy rollback when needed.
        _, open_time, close_time = canteen_row

        # Lock menu item rows (SELECT … FOR UPDATE)
        item_ids = [str(i.item_id) for i in body.items]
        placeholders = ", ".join(["%s"] * len(item_ids))
        cursor.execute(
            f"""
            SELECT Item_ID, Item_Name, Price, Availability_Status, Canteen_ID, stock_count, Category
            FROM Menu_Item
            WHERE Item_ID IN ({placeholders})
            FOR UPDATE
            """,
            item_ids,
        )
        db_items = {row[0]: row for row in cursor.fetchall()}

        # Validate each requested item
        for req in body.items:
            if req.item_id not in db_items:
                raise HTTPException(
                    status_code=404, detail=f"Menu item {req.item_id} not found"
                )
            _, _, _, is_available, canteen_id, _, _ = db_items[req.item_id]
            if not is_available:
                raise HTTPException(
                    status_code=400,
                    detail=f"Menu item {req.item_id} is not available",
                )
            if canteen_id != body.canteen_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Menu item {req.item_id} does not belong to canteen {body.canteen_id}",
                )
            if req.quantity < 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"Quantity for item {req.item_id} must be at least 1",
                )
            
            # Stock check for limited items
            item_id, name, price, is_available, c_id, stock, category = db_items[req.item_id]
            if category in ('Fast Food', 'Snacks', 'Beverages') and stock < req.quantity:
                 raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {name}. Only {stock} left.",
                )

        # Calculate totals
        subtotal = Decimal("0.00")
        line_items = []
        for req in body.items:
            price = db_items[req.item_id][2]  # Decimal from DB
            line_sub = price * req.quantity
            subtotal += line_sub
            line_items.append((req.item_id, req.quantity, line_sub))

        gst = (subtotal * GST_RATE).quantize(Decimal("0.01"))
        total = (subtotal + gst).quantize(Decimal("0.01"))
        order_id = _generate_order_id()

        # ── SAVEPOINT ─────────────────────────────────────────────────────
        cursor.execute("SAVEPOINT before_insert")

        # Insert Orders row
        cursor.execute(
            """
            INSERT INTO Orders
              (Student_ID, status, Total_Amount)
            VALUES (%s, 'Preparing', %s)
            """,
            (student_pk, total),
        )
        order_id = cursor.lastrowid

        # Insert Order_Item rows
        for item_id, qty, line_sub in line_items:
            cursor.execute(
                """
                INSERT INTO Order_Item (Order_ID, Item_ID, Quantity, Subtotal)
                VALUES (%s, %s, %s, %s)
                """,
                (order_id, item_id, qty, line_sub),
            )

        # ── STOCK DEDUCTION & REFILL DELAY ────────────────────────────────
        for item_id, qty, _ in line_items:
            _, _, _, _, _, stock, category = db_items[item_id]
            
            if category in ('Fast Food', 'Snacks', 'Beverages'):
                new_stock = max(stock - qty, 0)
                cursor.execute(
                    "UPDATE Menu_Item SET stock_count = %s WHERE Item_ID = %s",
                    (new_stock, item_id)
                )
                
                if new_stock == 0:
                    # Delay: Fast Food -> 15, Snacks -> 10, Beverages -> 5
                    delay = 15 if category == 'Fast Food' else (10 if category == 'Snacks' else 5)
                    cursor.execute(
                        """
                        UPDATE Menu_Item 
                        SET Availability_Status = FALSE, 
                            available_after = NOW() + INTERVAL %s MINUTE,
                            stock_count = 10 -- Pre-set stock for when it returns
                        WHERE Item_ID = %s
                        """,
                        (delay, item_id)
                    )

        # Generate token number for today's canteen queue
        cursor.execute(
            """
            SELECT COUNT(*) AS daily_count
            FROM Orders
            WHERE DATE(order_date) = CURDATE()
              AND canteen_id = %s
            """,
            (body.canteen_id,),
        )
        token_row = cursor.fetchone()
        daily_count = int(token_row[0]) if token_row else 0
        token_number = f"TKN-{body.canteen_id}-{daily_count:03d}"

        # ── COMMIT ────────────────────────────────────────────────────────
        conn.commit()

        order_payload = _fetch_full_order(cursor, order_id)
        if not order_payload:
            return {
                "order_id": str(order_id),
                "status": "Preparing",
                "total_amount": _decimal_to_float(total),
                "token_number": token_number,
            }

        order_payload["token_number"] = token_number
        return order_payload

    except HTTPException:
        # Roll back to savepoint, then full rollback
        try:
            cursor.execute("ROLLBACK TO before_insert")
        except Exception:
            pass
        conn.rollback()
        raise
    except mysql.connector.Error as e:
        try:
            cursor.execute("ROLLBACK TO before_insert")
        except Exception:
            pass
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# GET /api/orders/{id}  –  single order with items + payment
# ---------------------------------------------------------------------------
@router.get("/{order_id}")
def get_order(
    order_id: str,
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    registration_no: str = current["sub"]
    cursor = conn.cursor()
    try:
        student_pk = _student_pk_from_registration(cursor, registration_no)
        if not student_pk:
            raise HTTPException(status_code=404, detail="Student not found")

        order = _fetch_full_order(cursor, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if int(order["student_id"]) != int(student_pk):
            raise HTTPException(status_code=403, detail="Access denied")

        # Attach payment info if exists
        cursor.execute(
            "SELECT * FROM Payment WHERE Order_ID = %s",
            (order_id,),
        )
        pay_row = cursor.fetchone()
        if pay_row:
            cols = [d[0].lower() for d in cursor.description]
            data = dict(zip(cols, pay_row))
            pay = {
                "payment_id": data.get("payment_id"),
                "method": data.get("payment_method", data.get("method")),
                "status": data.get("payment_status", data.get("status")),
                "amount": _decimal_to_float(data.get("amount")),
                "payment_time": None,
            }
            payment_time = data.get("payment_time") or data.get("payment_date")
            if payment_time and hasattr(payment_time, "isoformat"):
                pay["payment_time"] = payment_time.isoformat()
            elif payment_time:
                pay["payment_time"] = str(payment_time)
            order["payment"] = pay
        else:
            order["payment"] = None

        return order

    except HTTPException:
        raise
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# DELETE /api/orders/{id}  –  cancel (Pending only)
# ---------------------------------------------------------------------------
@router.delete("/{order_id}", status_code=status.HTTP_200_OK)
def cancel_order(
    order_id: str,
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    registration_no: str = current["sub"]
    cursor = conn.cursor()
    try:
        # ── START TRANSACTION ─────────────────────────────────────────────
        conn.start_transaction()
        student_pk = _student_pk_from_registration(cursor, registration_no)
        if not student_pk:
            raise HTTPException(status_code=404, detail="Student not found")

        cursor.execute(
            "SELECT Student_ID, status FROM Orders WHERE Order_ID = %s FOR UPDATE",
            (order_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")

        db_student_id, current_status = row
        if int(db_student_id) != int(student_pk):
            raise HTTPException(status_code=403, detail="Access denied")
        if current_status != "Pending":
            raise HTTPException(
                status_code=400,
                detail=f"Only Pending orders can be cancelled. Current status: {current_status}",
            )

        cursor.execute(
            "UPDATE Orders SET status = 'Cancelled' WHERE Order_ID = %s",
            (order_id,),
        )

        # ── COMMIT ────────────────────────────────────────────────────────
        conn.commit()
        return {"detail": "Order cancelled successfully", "order_id": order_id}

    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()

from fastapi import APIRouter, Depends, HTTPException
import mysql.connector

from database import get_db

router = APIRouter(prefix="/api/canteens", tags=["Canteens"])


def _cursor_to_dicts(cursor) -> list[dict]:
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


def _row_to_dict(cursor, row) -> dict:
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


# ---------------------------------------------------------------------------
# GET /api/canteens
# ---------------------------------------------------------------------------
@router.get("")
def list_canteens(conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT Canteen_ID as canteen_id, name, Location as location, 
                   open_time, close_time 
            FROM Canteen
            """
        )
        canteens = _cursor_to_dicts(cursor)
        
        # Calculate is_open for each canteen
        from datetime import datetime, time, timedelta
        now = datetime.now().time()
        for c in canteens:
            if c['open_time'] and c['close_time']:
                # mysql-connector returns timedelta for TIME columns
                o_time = c['open_time']
                c_time = c['close_time']
                
                if isinstance(o_time, timedelta):
                    o_time = (datetime.min + o_time).time()
                if isinstance(c_time, timedelta):
                    c_time = (datetime.min + c_time).time()
                
                c['is_open'] = o_time <= now <= c_time
                # Convert to strings for JSON
                c['open_time'] = str(c['open_time'])
                c['close_time'] = str(c['close_time'])
            else:
                c['is_open'] = True
        return canteens
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# GET /api/canteens/{id}
# ---------------------------------------------------------------------------
@router.get("/{canteen_id}")
def get_canteen(canteen_id: int, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT Canteen_ID as canteen_id, name, Location as location, 
                   open_time, close_time 
            FROM Canteen WHERE Canteen_ID = %s
            """,
            (canteen_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Canteen not found")
        
        canteen = _row_to_dict(cursor, row)
        
        from datetime import datetime, time, timedelta
        now = datetime.now().time()
        if canteen['open_time'] and canteen['close_time']:
            o_time = canteen['open_time']
            c_time = canteen['close_time']
            
            if isinstance(o_time, timedelta):
                o_time = (datetime.min + o_time).time()
            if isinstance(c_time, timedelta):
                c_time = (datetime.min + c_time).time()
                
            canteen['is_open'] = o_time <= now <= c_time
            canteen['open_time'] = str(canteen['open_time'])
            canteen['close_time'] = str(canteen['close_time'])
        else:
            canteen['is_open'] = True
            
        return canteen
    except HTTPException:
        raise
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()

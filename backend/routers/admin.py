from fastapi import APIRouter, Depends, HTTPException
import mysql.connector

from auth import get_current_student
from database import get_db

router = APIRouter()


@router.get("/logs/student")
def get_student_registration_logs(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT sl.log_id, sl.Student_ID, s.Name, sl.created_at
            FROM student_log sl
            JOIN Student s ON sl.Student_ID = s.Student_ID
            ORDER BY sl.created_at DESC
            """
        )
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


@router.get("/analytics/summary")
def get_analytics_summary(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_orders,
                SUM(Total_Amount) AS total_revenue,
                AVG(Total_Amount) AS avg_order_value,
                MAX(Total_Amount) AS highest_order,
                MIN(Total_Amount) AS lowest_order
            FROM Orders
            WHERE status != 'Cancelled'
            """
        )
        summary = cursor.fetchone() or {}

        cursor.execute(
            """
            SELECT m.Item_Name, COUNT(oi.Item_ID) AS times_ordered
            FROM Order_Item oi
            JOIN Menu_Item m ON oi.Item_ID = m.Item_ID
            GROUP BY oi.Item_ID
            ORDER BY times_ordered DESC
            LIMIT 5
            """
        )
        popular_items = cursor.fetchall()

        return {"summary": summary, "popular_items": popular_items}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


@router.get("/procedures/display-students")
def call_display_students(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("display_students")
        students = []
        for result in cursor.stored_results():
            rows = result.fetchall()
            if rows:
                students.extend(rows)
        return {"students": students}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


@router.get("/procedures/total-revenue")
def call_total_revenue_cursor(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("total_revenue_cursor")
        revenue = []
        for result in cursor.stored_results():
            rows = result.fetchall()
            if rows:
                revenue.extend(rows)
        return {"revenue": revenue}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


@router.get("/procedures/display-orders")
def call_display_orders(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc("display_orders")
        orders = []
        for result in cursor.stored_results():
            rows = result.fetchall()
            if rows:
                orders.extend(rows)
        return {"orders": orders}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


@router.get("/views/student-orders")
def get_student_order_view(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Student_Order_View")
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


@router.get("/views/payment-summary")
def get_payment_summary_view(
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Payment_Summary")
        return cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()

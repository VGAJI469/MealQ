from decimal import Decimal
from datetime import datetime, timedelta

import mysql.connector
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_current_student
from database import get_db

router = APIRouter(prefix="/api/payments", tags=["Payments"])
UPI_AUTO_COMPLETE_SECONDS = 60


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------
class CreatePaymentRequest(BaseModel):
    order_id: str
    method: str   # Cash | UPI | Card
    amount: float


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
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


def _row_to_payment(cursor, row):
    cols = [d[0].lower() for d in cursor.description]
    data = dict(zip(cols, row))
    payment = {
        "payment_id": data.get("payment_id"),
        "order_id": data.get("order_id"),
        "method": data.get("payment_method", data.get("method")),
        "status": data.get("payment_status", data.get("status")),
        "amount": _decimal_to_float(data.get("amount")),
    }
    payment_time = data.get("payment_time") or data.get("payment_date")
    if payment_time and hasattr(payment_time, "isoformat"):
        payment["payment_time"] = payment_time.isoformat()
    elif payment_time:
        payment["payment_time"] = str(payment_time)
    else:
        payment["payment_time"] = None
    return payment


def _maybe_auto_complete_upi(cursor, row) -> bool:
    """
    Move UPI payments from Pending -> Completed after a short delay.
    Returns True when an update is performed.
    """
    cols = [d[0].lower() for d in cursor.description]
    data = dict(zip(cols, row))

    method = data.get("payment_method", data.get("method"))
    payment_status = data.get("payment_status", data.get("status"))
    payment_id = data.get("payment_id")
    payment_time = data.get("payment_time") or data.get("payment_date")

    if method != "UPI" or payment_status != "Pending" or not payment_id or not payment_time:
        return False

    if isinstance(payment_time, datetime):
        elapsed = datetime.now(payment_time.tzinfo) - payment_time
        if elapsed >= timedelta(seconds=UPI_AUTO_COMPLETE_SECONDS):
            cursor.execute(
                "UPDATE Payment SET Payment_Status = 'Completed' WHERE Payment_ID = %s",
                (payment_id,),
            )
            return True
    return False


# ---------------------------------------------------------------------------
# POST /api/payments
# ---------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def create_payment(
    body: CreatePaymentRequest,
    current: dict = Depends(get_current_student),
    conn=Depends(get_db),
):
    registration_no: str = current["sub"]
    valid_methods = {"Cash", "UPI", "Card"}
    if body.method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"method must be one of {valid_methods}",
        )

    cursor = conn.cursor()
    try:
        # ── START TRANSACTION ─────────────────────────────────────────────
        conn.start_transaction()
        student_pk = _student_pk_from_registration(cursor, registration_no)
        if not student_pk:
            raise HTTPException(status_code=404, detail="Student not found")

        # Verify order ownership and eligibility
        cursor.execute(
            "SELECT Student_ID, status, Total_Amount FROM Orders WHERE Order_ID = %s FOR UPDATE",
            (body.order_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")

        db_student_id, order_status, total_amount = row
        if int(db_student_id) != int(student_pk):
            raise HTTPException(status_code=403, detail="Access denied")
        if order_status not in ("Pending", "Preparing"):
            raise HTTPException(
                status_code=400,
                detail=f"Payment cannot be made for an order with status '{order_status}'",
            )

        # Check no duplicate payment
        cursor.execute(
            "SELECT Payment_ID FROM Payment WHERE Order_ID = %s", (body.order_id,)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=409, detail="Payment already exists for this order"
            )

        # DB enum does not include "Preparing"; use "Pending" for in-progress payments.
        payment_status = "Pending" if body.method in {"Cash", "UPI"} else "Completed"

        # Insert Payment row
        cursor.execute(
            """
            INSERT INTO Payment (Order_ID, Payment_Method, Payment_Status, Amount)
            VALUES (%s, %s, %s, %s)
            """,
            (body.order_id, body.method, payment_status, body.amount),
        )
        payment_id = cursor.lastrowid

        # ── COMMIT ────────────────────────────────────────────────────────
        conn.commit()

        # Fetch the created payment to return
        cursor.execute(
            "SELECT * FROM Payment WHERE Payment_ID = %s",
            (payment_id,),
        )
        p_row = cursor.fetchone()
        return _row_to_payment(cursor, p_row)

    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# GET /api/payments/{order_id}
# ---------------------------------------------------------------------------
@router.get("/{order_id}")
def get_payment(
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

        # Verify order ownership
        cursor.execute(
            "SELECT Student_ID FROM Orders WHERE Order_ID = %s", (order_id,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        if int(row[0]) != int(student_pk):
            raise HTTPException(status_code=403, detail="Access denied")

        # Fetch payment
        cursor.execute(
            "SELECT * FROM Payment WHERE Order_ID = %s",
            (order_id,),
        )
        p_row = cursor.fetchone()
        if not p_row:
            raise HTTPException(status_code=404, detail="Payment not found for this order")

        if _maybe_auto_complete_upi(cursor, p_row):
            conn.commit()
            cursor.execute(
                "SELECT * FROM Payment WHERE Order_ID = %s",
                (order_id,),
            )
            p_row = cursor.fetchone()

        return _row_to_payment(cursor, p_row)

    except HTTPException:
        raise
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()

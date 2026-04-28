from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
import mysql.connector

from database import get_db
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    student_id: str  # Registration number
    name: str
    email: EmailStr
    phone: str | None = None
    password: str


class LoginRequest(BaseModel):
    student_id: str  # Registration number
    password: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _row_to_student(row: tuple, cursor) -> dict:
    cols = [d[0] for d in cursor.description]
    data = dict(zip(cols, row))
    data.pop("password_hash", None)
    return data


def _normalize_registration_no(value: str) -> str:
    return (value or "").strip().upper()


# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        registration_no = _normalize_registration_no(body.student_id)
        if not registration_no:
            raise HTTPException(status_code=400, detail="Registration number is required")

        # Check duplicate email
        cursor.execute(
            "SELECT Student_ID FROM Student WHERE Email = %s", (body.email,)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")

        # Check duplicate registration number
        cursor.execute(
            "SELECT Student_ID FROM Student WHERE Registration_No = %s",
            (registration_no,),
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Registration number already registered")

        password_hash = hash_password(body.password)

        cursor.execute(
            """
            INSERT INTO Student (Registration_No, Name, Email, Phone, password_hash, needs_rehash)
            VALUES (%s, %s, %s, %s, %s, FALSE)
            """,
            (registration_no, body.name, body.email, body.phone, password_hash),
        )
        conn.commit()
        student = {
            "student_id": registration_no,
            "name": body.name,
            "email": body.email,
            "phone": body.phone,
        }
        token = create_access_token(
            {"sub": registration_no, "email": body.email, "name": body.name}
        )
        return {"student": student, "access_token": token}

    except HTTPException:
        raise
    except mysql.connector.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------
@router.post("/login")
def login(body: LoginRequest, conn=Depends(get_db)):
    cursor = conn.cursor()
    try:
        registration_no = _normalize_registration_no(body.student_id)
        if not registration_no:
            raise HTTPException(status_code=400, detail="Registration number is required")

        cursor.execute(
            """
            SELECT Student_ID, Registration_No, Name, Email, Phone, password_hash
            FROM Student
            WHERE Registration_No = %s
            """,
            (registration_no,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        _sid, reg_no, name, email, phone, pw_hash = row
        if not verify_password(body.password, pw_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        student = {"student_id": reg_no, "name": name, "email": email, "phone": phone}
        token = create_access_token({"sub": reg_no, "email": email, "name": name})
        return {"student": student, "access_token": token}

    except HTTPException:
        raise
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.msg}")
    finally:
        cursor.close()

import os

import mysql.connector
from dotenv import load_dotenv


load_dotenv()


def normalize(value: str) -> str:
    return (value or "").strip().upper()


def main():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "mealq"),
    )
    cur = conn.cursor()
    try:
        conn.start_transaction()
        cur.execute("SHOW COLUMNS FROM Student LIKE 'Registration_No'")
        if not cur.fetchone():
            cur.execute("ALTER TABLE Student ADD COLUMN Registration_No VARCHAR(50) NULL")
            cur.execute(
                "UPDATE Student SET Registration_No = CONCAT('REG', Student_ID) "
                "WHERE Registration_No IS NULL OR Registration_No = ''"
            )

        cur.execute(
            "SELECT Student_ID, Registration_No FROM Student ORDER BY Student_ID ASC FOR UPDATE"
        )
        rows = cur.fetchall()

        seen = set()
        updates = []
        for sid, reg in rows:
            base = normalize(reg) or f"REG{sid}"
            candidate = base
            if candidate in seen:
                candidate = f"{base}-{sid}"
            seen.add(candidate)
            if candidate != reg:
                updates.append((candidate, sid))

        for reg, sid in updates:
            cur.execute(
                "UPDATE Student SET Registration_No = %s WHERE Student_ID = %s",
                (reg, sid),
            )

        cur.execute("ALTER TABLE Student MODIFY Registration_No VARCHAR(50) NOT NULL")

        cur.execute("SHOW INDEX FROM Student WHERE Key_name = 'unique_registration_no'")
        if not cur.fetchall():
            cur.execute(
                "ALTER TABLE Student ADD CONSTRAINT unique_registration_no UNIQUE (Registration_No)"
            )

        conn.commit()
        print(f"Registration numbers normalized. Rows updated: {len(updates)}")
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()

import os

import mysql.connector
from dotenv import load_dotenv

load_dotenv("e:/MealQ/backend/.env")

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "3306")),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "mealq"),
)
cur = conn.cursor()
try:
    cur.execute(
        """
        UPDATE Orders o
        JOIN Payment p ON p.Order_ID = o.Order_ID
        SET o.status = 'Preparing'
        WHERE p.Payment_Status = 'Pending'
        """
    )
    conn.commit()
    cur.execute("SELECT status, COUNT(*) FROM Orders GROUP BY status ORDER BY status")
    print(cur.fetchall())
finally:
    cur.close()
    conn.close()

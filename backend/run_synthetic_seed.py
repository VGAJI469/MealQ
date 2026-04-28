import os
import re

import mysql.connector
from dotenv import load_dotenv


load_dotenv("e:/MealQ/backend/.env")

sql = open("e:/MealQ/backend/synthetic_dataset.sql", "r", encoding="utf-8").read()

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "3306")),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "mealq"),
)
cur = conn.cursor()

try:
    cur.execute("START TRANSACTION")

    # Step 1
    cur.execute("DELETE FROM Order_Item WHERE Order_ID NOT IN (SELECT Order_ID FROM Payment)")
    cur.execute("DELETE FROM Orders WHERE Order_ID NOT IN (SELECT Order_ID FROM Payment)")

    # Step 2 from SQL file (big Orders INSERT)
    m = re.search(
        r"INSERT INTO Orders[\s\S]*?;\n\n-- =============================================================\n-- STEP 3",
        sql,
    )
    orders_stmt = m.group(0).split(
        "\n\n-- =============================================================\n-- STEP 3"
    )[0]
    cur.execute(orders_stmt)

    # Step 3 from SQL file (two Order_Item INSERTs)
    order_item_stmts = re.findall(r"INSERT INTO Order_Item[\s\S]*?;", sql)
    cur.execute(order_item_stmts[0])
    cur.execute(order_item_stmts[1])

    # Step 4 (trigger-safe): insert payments row-by-row
    cur.execute(
        """
        SELECT o.Order_ID, o.payment_method, o.Total_Amount, o.order_date, o.status
        FROM Orders o
        LEFT JOIN Payment p ON p.Order_ID = o.Order_ID
        WHERE p.Order_ID IS NULL
        """
    )
    rows = cur.fetchall()

    for order_id, method, amount, order_date, status in rows:
        payment_status = "Completed" if status == "Completed" else "Pending"
        if payment_status == "Completed":
            cur.execute(
                """
                INSERT INTO Payment
                  (Order_ID, Payment_Method, Payment_Status, Amount, Transaction_Time)
                VALUES (%s, %s, %s, %s, DATE_ADD(%s, INTERVAL 5 MINUTE))
                """,
                (order_id, method, payment_status, amount, order_date),
            )
        else:
            cur.execute(
                """
                INSERT INTO Payment
                  (Order_ID, Payment_Method, Payment_Status, Amount, Transaction_Time)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (order_id, method, payment_status, amount, order_date),
            )

    conn.commit()

    # Step 5 verification
    cur.execute("SELECT COUNT(*) FROM Orders")
    print("Total Orders:", cur.fetchone()[0])

    cur.execute("SELECT COUNT(*) FROM Payment")
    print("Total Payments:", cur.fetchone()[0])

    cur.execute("SELECT COUNT(*) FROM Order_Item")
    print("Total Items:", cur.fetchone()[0])

    cur.execute("SELECT status, COUNT(*) FROM Orders GROUP BY status ORDER BY status")
    print("Order Status Counts:", cur.fetchall())

    cur.execute(
        "SELECT Payment_Status, COUNT(*) FROM Payment GROUP BY Payment_Status ORDER BY Payment_Status"
    )
    print("Payment Status Counts:", cur.fetchall())
finally:
    cur.close()
    conn.close()

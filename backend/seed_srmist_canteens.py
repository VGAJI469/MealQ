from decimal import Decimal

import mysql.connector
from dotenv import load_dotenv
import os


load_dotenv()


CANTEENS = [
    (
        1,
        "SRMIST Canteen (Old Campus)",
        "Adjacent to Main Entrance (Near Gate No. 4, Opposite Potheri Railway Station)",
        "07:00:00",
        "17:00:00",
    ),
    (
        2,
        "SRMIST Canteen (University Building)",
        "Ground Floor, University Building",
        "07:00:00",
        "17:00:00",
    ),
    (
        3,
        "SRMIST Canteen (Tech Park)",
        "Ground Floor, Tech Park Building",
        "07:00:00",
        "17:00:00",
    ),
    (
        4,
        "Clock Tower Food Street",
        "Near the Clock Tower",
        "07:30:00",
        "20:00:00",
    ),
    (
        5,
        "The Royal Cafe Canteen (JVEC Campus)",
        "Near Valliammai Engineering College Entrance / Opposite SRM College of Pharmacy (Behind VEC)",
        "07:30:00",
        "16:30:00",
    ),
]


# DB category enum supports only: Veg | Non-Veg | Beverage
MENU_BY_CANTEEN = {
    1: [
        ("Dosa", Decimal("55.00"), "Veg"),
        ("Poori", Decimal("45.00"), "Veg"),
        ("Pongal", Decimal("50.00"), "Veg"),
        ("Idly", Decimal("35.00"), "Veg"),
        ("Vada", Decimal("30.00"), "Veg"),
        ("Samosa", Decimal("25.00"), "Veg"),
        ("Puff", Decimal("30.00"), "Veg"),
        ("Variety Rice", Decimal("75.00"), "Veg"),
        ("Full Meals", Decimal("110.00"), "Veg"),
        ("Biryani", Decimal("120.00"), "Non-Veg"),
        ("Chapatti", Decimal("35.00"), "Veg"),
        ("Paratha", Decimal("45.00"), "Veg"),
        ("Chocolates", Decimal("20.00"), "Veg"),
        ("Cool Drinks", Decimal("35.00"), "Beverage"),
        ("Ice Cream", Decimal("40.00"), "Veg"),
        ("Tea", Decimal("15.00"), "Beverage"),
        ("Coffee", Decimal("20.00"), "Beverage"),
    ],
    2: [
        ("Poori", Decimal("45.00"), "Veg"),
        ("Pongal", Decimal("50.00"), "Veg"),
        ("Idly", Decimal("35.00"), "Veg"),
        ("Samosa", Decimal("25.00"), "Veg"),
        ("Puff", Decimal("30.00"), "Veg"),
        ("Vada", Decimal("30.00"), "Veg"),
        ("Variety Rice", Decimal("75.00"), "Veg"),
        ("Limited Meals", Decimal("95.00"), "Veg"),
        ("Biryani", Decimal("120.00"), "Non-Veg"),
        ("Fried Rice", Decimal("90.00"), "Veg"),
        ("Chapatti", Decimal("35.00"), "Veg"),
        ("Paratha", Decimal("45.00"), "Veg"),
        ("Chocolates", Decimal("20.00"), "Veg"),
        ("Cool Drinks", Decimal("35.00"), "Beverage"),
        ("Ice Cream", Decimal("40.00"), "Veg"),
    ],
    3: [
        ("Poori", Decimal("45.00"), "Veg"),
        ("Pongal", Decimal("50.00"), "Veg"),
        ("Idly", Decimal("35.00"), "Veg"),
        ("Samosa", Decimal("25.00"), "Veg"),
        ("Puff", Decimal("30.00"), "Veg"),
        ("Vada", Decimal("30.00"), "Veg"),
        ("Variety Rice", Decimal("75.00"), "Veg"),
        ("Limited Meals", Decimal("95.00"), "Veg"),
        ("Biryani", Decimal("120.00"), "Non-Veg"),
        ("Fried Rice", Decimal("90.00"), "Veg"),
        ("Chapatti", Decimal("35.00"), "Veg"),
        ("Paratha", Decimal("45.00"), "Veg"),
        ("Chocolates", Decimal("20.00"), "Veg"),
        ("Cool Drinks", Decimal("35.00"), "Beverage"),
        ("Ice Cream", Decimal("40.00"), "Veg"),
    ],
    4: [
        ("Shawarma", Decimal("110.00"), "Non-Veg"),
        ("Aloo Paratha", Decimal("70.00"), "Veg"),
        ("Chicken Biryani", Decimal("140.00"), "Non-Veg"),
        ("Pizza", Decimal("120.00"), "Veg"),
        ("Subway Pizza", Decimal("140.00"), "Veg"),
        ("Desserts", Decimal("80.00"), "Veg"),
        ("Coffee", Decimal("25.00"), "Beverage"),
        ("Cool Drinks", Decimal("35.00"), "Beverage"),
    ],
    5: [
        ("South Indian Combo", Decimal("80.00"), "Veg"),
        ("North Indian Thali", Decimal("110.00"), "Veg"),
        ("Fried Rice", Decimal("90.00"), "Veg"),
        ("Paratha", Decimal("45.00"), "Veg"),
        ("Tea", Decimal("15.00"), "Beverage"),
        ("Coffee", Decimal("20.00"), "Beverage"),
        ("Fresh Juice", Decimal("45.00"), "Beverage"),
        ("Snacks", Decimal("40.00"), "Veg"),
    ],
}


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

        for cid, name, location, open_time, close_time in CANTEENS:
            cur.execute(
                """
                INSERT INTO Canteen (Canteen_ID, Canteen_Name, Location, Opening_Time, Closing_Time)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    Canteen_Name = VALUES(Canteen_Name),
                    Location = VALUES(Location),
                    Opening_Time = VALUES(Opening_Time),
                    Closing_Time = VALUES(Closing_Time)
                """,
                (cid, name, location, open_time, close_time),
            )

        # Replace menu for target canteens with curated items from user-provided list
        cur.execute("DELETE FROM Menu_Item WHERE Canteen_ID IN (1,2,3,4,5)")
        for cid, items in MENU_BY_CANTEEN.items():
            for item_name, price, category in items:
                cur.execute(
                    """
                    INSERT INTO Menu_Item (Item_Name, Price, Category, Availability_Status, Canteen_ID)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (item_name, price, category, 1, cid),
                )

        conn.commit()
        print("Seeded SRMIST canteens and menu items successfully.")
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()

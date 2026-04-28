import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()
_pool: pooling.MySQLConnectionPool | None = None


def _get_pool() -> pooling.MySQLConnectionPool:
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="mealq_pool",
            pool_size=10,
            pool_reset_session=True,
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "mealq"),
            autocommit=False,          # We manage transactions manually
            time_zone="+00:00",
        )
    return _pool


def get_connection() -> mysql.connector.MySQLConnection:
    """Borrow a connection from the pool."""
    return _get_pool().get_connection()

def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()   # Returns to pool

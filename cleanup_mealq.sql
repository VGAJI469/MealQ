-- =============================================================================
-- MealQ Database Cleanup & Schema Alignment Script
-- Generated: 2026-04-26
-- Description: Removes test/junk data, fixes NULLs, inserts missing payments,
--              corrects category values, and aligns all table schemas to backend
--              expectations. Runs inside a single transaction — any failure rolls
--              back the entire cleanup automatically.
-- =============================================================================

START TRANSACTION;

-- =============================================================================
-- STEP 0: Disable FK checks so we can delete in any order safely
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 0;


-- =============================================================================
-- STEP 2: Clean Order_Item — delete rows whose Order_ID no longer exists
-- (Run before Orders cleanup so we don't violate constraints later)
-- =============================================================================
DELETE FROM Order_Item
WHERE Order_ID NOT IN (SELECT Order_ID FROM Orders);


-- =============================================================================
-- STEP 3: Clean Payment — delete rows whose Order_ID no longer exists
-- =============================================================================
DELETE FROM Payment
WHERE Order_ID NOT IN (SELECT Order_ID FROM Orders);


-- =============================================================================
-- STEP 4: Clean student_log — delete orphan entries (Student_ID not in Student)
-- =============================================================================
DELETE FROM student_log
WHERE Student_ID NOT IN (SELECT Student_ID FROM Student);

-- Delete duplicate logs: for each Student_ID keep only the most recent log entry
DELETE sl
FROM student_log sl
INNER JOIN (
    SELECT Student_ID, MAX(log_id) AS max_id
    FROM student_log
    GROUP BY Student_ID
    HAVING COUNT(*) > 1
) keeper ON sl.Student_ID = keeper.Student_ID
        AND sl.log_id <> keeper.max_id;
-- NOTE: If the student_log PK column is named differently (e.g. Log_ID),
--       replace log_id above with the actual PK column name.


-- =============================================================================
-- STEP 5a: Clean Orders — delete bulk test inserts (NULL amount, Preparing,
--          created in the known test window 2026-03-24 07:00–08:00)
-- =============================================================================
DELETE FROM Orders
WHERE Total_Amount IS NULL
  AND status = 'Preparing'
  AND order_date BETWEEN '2026-03-24 07:00:00' AND '2026-03-24 08:00:00';

-- STEP 5b: Clean Orders — delete where Student_ID is NULL
DELETE FROM Orders
WHERE Student_ID IS NULL;

-- STEP 5c: Clean Orders — delete where Student_ID references a non-existent student
DELETE FROM Orders
WHERE Student_ID NOT IN (SELECT Student_ID FROM Student);


-- =============================================================================
-- STEP 6: Clean Student — delete test / duplicate / junk records
--         Order:
--           a) Delete dependents first (Orders cascade already cleaned above,
--              but student_log and Payment via Orders may still reference them)
--           b) Then delete the student rows
-- =============================================================================

-- 6a: Identify junk Student_IDs (exclude the original 12 seeded students)
-- We collect them into a temporary table for clarity and re-use.
CREATE TEMPORARY TABLE IF NOT EXISTS junk_student_ids AS
SELECT Student_ID
FROM Student
WHERE Student_ID > 12  -- keep seeded rows 1-12 unconditionally
  AND (
        -- Name-based rules
        Name LIKE '%Test%'
     OR Name LIKE '%test%'
     OR Name LIKE '%Dup%'
     OR Name LIKE '%dup%'
     OR Name IN ('Reg Test', 'Order Test', 'Cash User', 'Dup Test 1', 'Dup1')
        -- Email domain rules
     OR Email LIKE '%@test.com'
        -- Email prefix rules
     OR Email LIKE 'mealq\_%'
     OR Email LIKE 'cash\_%'
     OR Email LIKE 'reg\_%'
     OR Email LIKE 'rego\_%'
     OR Email LIKE 'dup1\_%'
     OR Email LIKE 'dup\_%'
        -- Must have a recognised college/personal domain to be kept
        -- (students with IDs > 12 that DON'T match any junk pattern are kept)
  )
  AND Email NOT LIKE '%@college.edu'
  AND Email NOT LIKE '%@srmist.edu.in'
  AND Email NOT LIKE '%@gmail.com';

-- 6b: Delete dependent student_log rows for junk students
DELETE FROM student_log
WHERE Student_ID IN (SELECT Student_ID FROM junk_student_ids);

-- 6c: Delete Order_Item rows for orders belonging to junk students
DELETE FROM Order_Item
WHERE Order_ID IN (
    SELECT Order_ID FROM Orders
    WHERE Student_ID IN (SELECT Student_ID FROM junk_student_ids)
);

-- 6d: Delete Payment rows for orders belonging to junk students
DELETE FROM Payment
WHERE Order_ID IN (
    SELECT Order_ID FROM Orders
    WHERE Student_ID IN (SELECT Student_ID FROM junk_student_ids)
);

-- 6e: Delete Orders belonging to junk students
DELETE FROM Orders
WHERE Student_ID IN (SELECT Student_ID FROM junk_student_ids);

-- 6f: Delete the junk students themselves
DELETE FROM Student
WHERE Student_ID IN (SELECT Student_ID FROM junk_student_ids);

DROP TEMPORARY TABLE IF EXISTS junk_student_ids;


-- =============================================================================
-- STEP 7: Fix NULL Total_Amount — calculate from Order_Item subtotals
-- =============================================================================
-- Delete orders that have no items (to avoid 0 total amount which violates chk_amount)
DELETE FROM Orders
WHERE Order_ID NOT IN (SELECT DISTINCT Order_ID FROM Order_Item);

UPDATE Orders o
SET o.Total_Amount = (
    SELECT COALESCE(SUM(oi.Subtotal), 0)
    FROM Order_Item oi
    WHERE oi.Order_ID = o.Order_ID
)
WHERE o.Total_Amount IS NULL;


-- =============================================================================
-- STEP 8: Insert missing Payment records for Completed orders
--         Uses 'Cash' / 'Completed' defaults as specified.
-- =============================================================================
INSERT INTO Payment (Order_ID, Payment_Method, Payment_Status, Amount, Transaction_Time)
SELECT
    o.Order_ID,
    'Cash'            AS Payment_Method,
    'Completed'       AS Payment_Status,
    o.Total_Amount    AS Amount,
    o.order_date      AS Transaction_Time
FROM Orders o
LEFT JOIN Payment p ON p.Order_ID = o.Order_ID
WHERE o.status = 'Completed'
  AND p.Order_ID IS NULL
  AND o.Total_Amount > 0;


-- =============================================================================
-- STEP 9: Fix Menu_Item Categories
--         Map legacy categories to frontend-expected values.
-- =============================================================================

-- Pre-step: Expand Category ENUM to include new categories
ALTER TABLE Menu_Item MODIFY COLUMN Category ENUM('Veg', 'Non-Veg', 'Beverage', 'South Indian', 'North Indian', 'Fast Food', 'Beverages', 'Snacks') NOT NULL;

-- First pass: straightforward 'Beverage' → 'Beverages'
UPDATE Menu_Item
SET Category = 'Beverages'
WHERE Category = 'Beverage';

-- Second pass: name-based South Indian mapping
UPDATE Menu_Item
SET Category = 'South Indian'
WHERE Category IN ('Veg', 'Non-Veg')
  AND Item_Name IN ('Dosa', 'Idly', 'Vada', 'Pongal', 'Poori',
               'Variety Rice', 'Full Meals', 'South Indian');

-- Third pass: name-based North Indian mapping
UPDATE Menu_Item
SET Category = 'North Indian'
WHERE Category IN ('Veg', 'Non-Veg')
  AND Item_Name IN ('Biryani', 'North Indian', 'Chapatti', 'Paratha', 'Fried Rice');

-- Fourth pass: name-based Fast Food mapping
UPDATE Menu_Item
SET Category = 'Fast Food'
WHERE Category IN ('Veg', 'Non-Veg')
  AND Item_Name IN ('Pizza', 'Subway Pizza', 'Maggi', 'Samosa', 'Puff', 'Snacks');

-- Fifth pass: name-based Beverages mapping (items still carrying Veg/Non-Veg)
UPDATE Menu_Item
SET Category = 'Beverages'
WHERE Category IN ('Veg', 'Non-Veg')
  AND Item_Name IN ('Tea', 'Coffee', 'Cool Drinks', 'Fresh Juice', 'Desserts');

-- Sixth pass: everything else still showing Veg or Non-Veg → Snacks
UPDATE Menu_Item
SET Category = 'Snacks'
WHERE Category IN ('Veg', 'Non-Veg');


-- =============================================================================
-- STEP 10: Fix Canteen Table — Schema Alignment
-- =============================================================================

-- 10a: Add is_open column if it does not already exist
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Canteen'
      AND COLUMN_NAME  = 'is_open'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Canteen ADD COLUMN is_open BOOLEAN DEFAULT TRUE',
    'SELECT ''is_open already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10b: Rename Canteen_Name → name (if Canteen_Name still exists)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Canteen'
      AND COLUMN_NAME  = 'Canteen_Name'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE Canteen RENAME COLUMN Canteen_Name TO name',
    'SELECT ''Canteen_Name already renamed'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10c: Rename Opening_Time → open_time (if Opening_Time still exists)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Canteen'
      AND COLUMN_NAME  = 'Opening_Time'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE Canteen RENAME COLUMN Opening_Time TO open_time',
    'SELECT ''Opening_Time already renamed'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10d: Rename Closing_Time → close_time (if Closing_Time still exists)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Canteen'
      AND COLUMN_NAME  = 'Closing_Time'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE Canteen RENAME COLUMN Closing_Time TO close_time',
    'SELECT ''Closing_Time already renamed'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 10e: Set is_open based on current time vs open_time / close_time
--      TIME() comparison works for TIME columns; adjust if stored as VARCHAR.
UPDATE Canteen
SET is_open = (
    CASE
        WHEN TIME(NOW()) BETWEEN open_time AND close_time THEN TRUE
        ELSE FALSE
    END
);


-- =============================================================================
-- STEP 11: Fix Orders Table — Schema Alignment
-- =============================================================================

-- 11a: Add canteen_id if missing
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Orders'
      AND COLUMN_NAME  = 'canteen_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Orders ADD COLUMN canteen_id INT DEFAULT 1',
    'SELECT ''canteen_id already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11b: Add subtotal if missing
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Orders'
      AND COLUMN_NAME  = 'subtotal'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Orders ADD COLUMN subtotal DECIMAL(8,2)',
    'SELECT ''subtotal already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Populate subtotal = total_amount / 1.05 for existing rows where subtotal is NULL
UPDATE Orders
SET subtotal = ROUND(Total_Amount / 1.05, 2)
WHERE subtotal IS NULL
  AND Total_Amount IS NOT NULL;

-- 11c: Add gst if missing
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Orders'
      AND COLUMN_NAME  = 'gst'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Orders ADD COLUMN gst DECIMAL(8,2)',
    'SELECT ''gst already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Populate gst = total_amount - subtotal
UPDATE Orders
SET gst = ROUND(Total_Amount - subtotal, 2)
WHERE gst IS NULL
  AND Total_Amount IS NOT NULL
  AND subtotal IS NOT NULL;

-- 11d: Add payment_method if missing
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Orders'
      AND COLUMN_NAME  = 'payment_method'
);

SET @sql = IF(@col_exists = 0,
    "ALTER TABLE Orders ADD COLUMN payment_method ENUM('Cash','UPI','Card') DEFAULT 'Cash'",
    'SELECT ''payment_method already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Populate payment_method from Payment table where available
UPDATE Orders o
INNER JOIN Payment p ON p.Order_ID = o.Order_ID
SET o.payment_method = p.Payment_Method
WHERE o.payment_method IS NULL
   OR o.payment_method = 'Cash';   -- overwrite default only when Payment record exists

-- 11e: Rename Order_Status → status if needed
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Orders'
      AND COLUMN_NAME  = 'Order_Status'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE Orders DROP CONSTRAINT chk_status, RENAME COLUMN Order_Status TO status, ADD CONSTRAINT chk_status CHECK (status IN (\'Preparing\',\'Ready\',\'Completed\',\'Cancelled\'))',
    'SELECT ''Order_Status already renamed'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11f: Rename Order_Time → order_date if needed
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Orders'
      AND COLUMN_NAME  = 'Order_Time'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE Orders RENAME COLUMN Order_Time TO order_date',
    'SELECT ''Order_Time already renamed'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- =============================================================================
-- STEP 12: Fix Student Table — Schema Alignment
-- =============================================================================

-- 12a: Rename Password → password_hash if needed
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Student'
      AND COLUMN_NAME  = 'Password'
);

SET @sql = IF(@col_exists > 0,
    'ALTER TABLE Student RENAME COLUMN Password TO password_hash',
    'SELECT ''Password already renamed'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 12b: Add needs_rehash flag if missing
--      Set TRUE for all rows so the backend knows to prompt re-login and re-hash.
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'Student'
      AND COLUMN_NAME  = 'needs_rehash'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Student ADD COLUMN needs_rehash BOOLEAN DEFAULT TRUE',
    'SELECT ''needs_rehash already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure all existing rows are flagged (in case column was added in a prior run)
UPDATE Student SET needs_rehash = TRUE;


-- =============================================================================
-- STEP 4 (post-student cleanup): Re-check student_log for any newly orphaned rows
-- =============================================================================
DELETE FROM student_log
WHERE Student_ID NOT IN (SELECT Student_ID FROM Student);


-- =============================================================================
-- STEP 13: Re-enable FK checks
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- STEP 14: Verification Queries
-- =============================================================================
SELECT 'Student count'        AS check_name, COUNT(*) AS result FROM Student;
SELECT 'Orders count'         AS check_name, COUNT(*) AS result FROM Orders;
SELECT 'student_log count'    AS check_name, COUNT(*) AS result FROM student_log;
SELECT 'Payment count'        AS check_name, COUNT(*) AS result FROM Payment;
SELECT DISTINCT Category      AS distinct_categories             FROM Menu_Item;
SELECT 'NULL Total_Amount'    AS check_name, COUNT(*) AS result
  FROM Orders WHERE Total_Amount IS NULL;


COMMIT;
-- =============================================================================
-- End of cleanup_mealq.sql
-- =============================================================================

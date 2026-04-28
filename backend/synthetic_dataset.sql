-- =============================================================
-- MealQ: Complete Synthetic Dataset Generation
-- Generates realistic Orders, Order_Item, and Payment records
-- for all 39 students across all 5 canteens
-- =============================================================

START TRANSACTION;

-- =============================================================
-- STEP 1: Clear existing test orders to start fresh
-- (keeps your real payments 17-24 safe by only deleting
--  orders not linked to existing payments)
-- =============================================================
DELETE FROM Order_Item
WHERE Order_ID NOT IN (SELECT Order_ID FROM Payment);

DELETE FROM Orders
WHERE Order_ID NOT IN (SELECT Order_ID FROM Payment);

-- =============================================================
-- STEP 2: Insert Orders for ALL 39 students
-- Each student gets 3-4 orders spread across different dates
-- Uses canteen_id 1-5, realistic statuses, real amounts
-- =============================================================

INSERT INTO Orders
(Student_ID, canteen_id, order_date, status, subtotal, gst, Total_Amount, payment_method)
VALUES

-- Student 1 (Aarav Sharma) - 3 orders
(1, 1, '2026-03-01 09:15:00', 'Completed', 104.76, 5.24, 110.00, 'UPI'),
(1, 3, '2026-03-15 13:20:00', 'Completed', 190.48, 9.52, 200.00, 'Cash'),
(1, 5, '2026-04-10 11:00:00', 'Completed', 114.29, 5.71, 120.00, 'UPI'),

-- Student 2 (Riya Patel)
(2, 2, '2026-03-02 10:30:00', 'Completed', 123.81, 6.19, 130.00, 'Card'),
(2, 4, '2026-03-20 14:00:00', 'Completed', 157.14, 7.86, 165.00, 'UPI'),
(2, 1, '2026-04-12 09:45:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),

-- Student 3 (Karan Mehta)
(3, 1, '2026-03-03 08:00:00', 'Completed', 104.76, 5.24, 110.00, 'UPI'),
(3, 2, '2026-03-18 12:30:00', 'Completed', 171.43, 8.57, 180.00, 'Card'),
(3, 4, '2026-04-05 13:15:00', 'Completed', 133.33, 6.67, 140.00, 'Cash'),

-- Student 4 (Sneha Iyer)
(4, 3, '2026-03-04 11:00:00', 'Completed', 95.24,  4.76, 100.00, 'UPI'),
(4, 5, '2026-03-22 14:30:00', 'Completed', 142.86, 7.14, 150.00, 'Cash'),
(4, 1, '2026-04-08 10:00:00', 'Completed', 114.29, 5.71, 120.00, 'UPI'),

-- Student 5 (Arjun Verma)
(5, 2, '2026-03-05 09:00:00', 'Completed', 161.90, 8.10, 170.00, 'Card'),
(5, 4, '2026-03-25 13:00:00', 'Completed', 85.71,  4.29,  90.00, 'UPI'),
(5, 3, '2026-04-15 11:30:00', 'Completed', 123.81, 6.19, 130.00, 'Cash'),

-- Student 6 (Rahul Mehta)
(6, 1, '2026-03-06 08:30:00', 'Completed', 104.76, 5.24, 110.00, 'UPI'),
(6, 5, '2026-03-28 12:00:00', 'Completed', 190.48, 9.52, 200.00, 'Card'),
(6, 2, '2026-04-18 14:00:00', 'Completed', 95.24,  4.76, 100.00, 'Cash'),

-- Student 7 (Priya Shah)
(7, 3, '2026-03-07 10:00:00', 'Completed', 133.33, 6.67, 140.00, 'UPI'),
(7, 1, '2026-04-01 09:30:00', 'Completed', 114.29, 5.71, 120.00, 'Cash'),
(7, 4, '2026-04-20 13:45:00', 'Completed', 157.14, 7.86, 165.00, 'UPI'),

-- Student 8 (Amit Jain)
(8, 4, '2026-03-08 11:30:00', 'Completed', 209.52, 10.48, 220.00, 'Card'),
(8, 2, '2026-04-02 10:15:00', 'Completed', 85.71,   4.29,  90.00, 'UPI'),
(8, 5, '2026-04-22 12:30:00', 'Completed', 123.81,  6.19, 130.00, 'Cash'),

-- Student 9 (Neha Verma)
(9, 5, '2026-03-09 09:45:00', 'Completed', 95.24,  4.76, 100.00, 'UPI'),
(9, 3, '2026-04-03 11:00:00', 'Completed', 171.43, 8.57, 180.00, 'Card'),
(9, 1, '2026-04-23 14:15:00', 'Completed', 104.76, 5.24, 110.00, 'Cash'),

-- Student 10 (Karan Patel)
(10, 1, '2026-03-10 08:00:00', 'Completed', 133.33, 6.67, 140.00, 'UPI'),
(10, 4, '2026-04-04 12:45:00', 'Completed', 114.29, 5.71, 120.00, 'Cash'),
(10, 2, '2026-04-24 10:30:00', 'Completed', 157.14, 7.86, 165.00, 'Card'),

-- Student 11 (Simran Kaur)
(11, 2, '2026-03-11 10:30:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),
(11, 5, '2026-04-06 13:00:00', 'Completed', 190.48, 9.52, 200.00, 'UPI'),
(11, 3, '2026-04-25 11:45:00', 'Completed', 95.24,  4.76, 100.00, 'Card'),

-- Student 12 (Rohit Singh)
(12, 3, '2026-03-12 09:15:00', 'Completed', 142.86, 7.14, 150.00, 'UPI'),
(12, 1, '2026-04-07 10:00:00', 'Completed', 104.76, 5.24, 110.00, 'Cash'),
(12, 4, '2026-04-26 14:30:00', 'Completed', 123.81, 6.19, 130.00, 'UPI'),

-- Student 13 (Anjali Gupta)
(13, 4, '2026-03-13 11:00:00', 'Completed', 209.52, 10.48, 220.00, 'Card'),
(13, 2, '2026-04-09 09:30:00', 'Completed', 95.24,   4.76, 100.00, 'UPI'),
(13, 5, '2026-04-26 12:00:00', 'Preparing', 114.29,  5.71, 120.00, 'Cash'),

-- Student 14 (Vikas Yadav)
(14, 5, '2026-03-14 12:00:00', 'Completed', 161.90, 8.10, 170.00, 'UPI'),
(14, 3, '2026-04-11 11:30:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),
(14, 1, '2026-04-26 13:15:00', 'Preparing', 133.33, 6.67, 140.00, 'UPI'),

-- Student 15 (Pooja Nair)
(15, 1, '2026-03-16 09:00:00', 'Completed', 104.76, 5.24, 110.00, 'Cash'),
(15, 4, '2026-04-13 14:00:00', 'Completed', 190.48, 9.52, 200.00, 'UPI'),
(15, 2, '2026-04-26 10:45:00', 'Ready', 95.24,  4.76, 100.00, 'Card'),

-- Student 26 (Vansh)
(26, 1, '2026-04-20 12:00:00', 'Completed', 123.81, 6.19, 130.00, 'UPI'),
(26, 3, '2026-04-24 14:30:00', 'Completed', 157.14, 7.86, 165.00, 'Cash'),
(26, 5, '2026-04-26 11:00:00', 'Ready',   114.29, 5.71, 120.00, 'UPI'),

-- Student 31 (Vansh Gajiwala)
(31, 2, '2026-04-21 09:15:00', 'Completed', 190.48, 9.52, 200.00, 'UPI'),
(31, 4, '2026-04-25 13:00:00', 'Completed', 104.76, 5.24, 110.00, 'Card'),
(31, 1, '2026-04-26 15:00:00', 'Preparing',   85.71,  4.29,  90.00, 'Cash'),

-- Students 35-54 (SRM students) - 2 orders each
(35, 1, '2026-04-15 09:00:00', 'Completed', 104.76, 5.24, 110.00, 'UPI'),
(35, 3, '2026-04-22 13:30:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),

(36, 2, '2026-04-15 10:00:00', 'Completed', 123.81, 6.19, 130.00, 'Card'),
(36, 4, '2026-04-22 14:00:00', 'Completed', 95.24,  4.76, 100.00, 'UPI'),

(37, 3, '2026-04-16 09:30:00', 'Completed', 157.14, 7.86, 165.00, 'Cash'),
(37, 5, '2026-04-23 11:00:00', 'Completed', 114.29, 5.71, 120.00, 'UPI'),

(38, 4, '2026-04-16 11:00:00', 'Completed', 190.48, 9.52, 200.00, 'Card'),
(38, 1, '2026-04-23 13:00:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),

(39, 5, '2026-04-16 12:00:00', 'Completed', 104.76, 5.24, 110.00, 'UPI'),
(39, 2, '2026-04-23 14:30:00', 'Completed', 133.33, 6.67, 140.00, 'Card'),

(40, 1, '2026-04-17 08:30:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),
(40, 3, '2026-04-24 10:00:00', 'Completed', 157.14, 7.86, 165.00, 'UPI'),

(41, 2, '2026-04-17 09:45:00', 'Completed', 123.81, 6.19, 130.00, 'UPI'),
(41, 4, '2026-04-24 12:00:00', 'Completed', 95.24,  4.76, 100.00, 'Cash'),

(42, 3, '2026-04-17 11:30:00', 'Completed', 190.48, 9.52, 200.00, 'Card'),
(42, 5, '2026-04-24 14:00:00', 'Completed', 104.76, 5.24, 110.00, 'UPI'),

(43, 4, '2026-04-18 09:00:00', 'Completed', 114.29, 5.71, 120.00, 'Cash'),
(43, 1, '2026-04-25 10:30:00', 'Completed', 85.71,  4.29,  90.00, 'UPI'),

(44, 5, '2026-04-18 10:30:00', 'Completed', 133.33, 6.67, 140.00, 'Card'),
(44, 2, '2026-04-25 12:00:00', 'Completed', 157.14, 7.86, 165.00, 'Cash'),

(45, 1, '2026-04-18 12:00:00', 'Completed', 95.24,  4.76, 100.00, 'UPI'),
(45, 3, '2026-04-25 13:30:00', 'Completed', 123.81, 6.19, 130.00, 'Card'),

(46, 2, '2026-04-19 09:15:00', 'Completed', 190.48, 9.52, 200.00, 'UPI'),
(46, 4, '2026-04-25 15:00:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),

(47, 3, '2026-04-19 10:45:00', 'Completed', 114.29, 5.71, 120.00, 'UPI'),
(47, 5, '2026-04-26 09:00:00', 'Preparing', 104.76, 5.24, 110.00, 'Card'),

(48, 4, '2026-04-19 12:30:00', 'Completed', 157.14, 7.86, 165.00, 'Cash'),
(48, 1, '2026-04-26 10:00:00', 'Ready', 95.24,  4.76, 100.00, 'UPI'),

(49, 5, '2026-04-20 09:00:00', 'Completed', 133.33, 6.67, 140.00, 'Card'),
(49, 2, '2026-04-26 11:30:00', 'Ready',   85.71,  4.29,  90.00, 'Cash'),

(50, 1, '2026-04-20 10:30:00', 'Completed', 190.48, 9.52, 200.00, 'UPI'),
(50, 3, '2026-04-26 13:00:00', 'Preparing',   104.76, 5.24, 110.00, 'Card'),

(51, 2, '2026-04-20 12:00:00', 'Completed', 114.29, 5.71, 120.00, 'Cash'),
(51, 4, '2026-04-26 14:00:00', 'Preparing', 123.81, 6.19, 130.00, 'UPI'),

(52, 3, '2026-04-21 09:30:00', 'Completed', 85.71,  4.29,  90.00, 'UPI'),
(52, 5, '2026-04-26 15:30:00', 'Ready', 157.14, 7.86, 165.00, 'Cash'),

(53, 4, '2026-04-21 11:00:00', 'Completed', 190.48, 9.52, 200.00, 'Card'),
(53, 1, '2026-04-26 16:00:00', 'Preparing',   95.24,  4.76, 100.00, 'UPI'),

(54, 5, '2026-04-21 13:00:00', 'Completed', 133.33, 6.67, 140.00, 'Cash'),
(54, 2, '2026-04-26 16:30:00', 'Ready',   104.76, 5.24, 110.00, 'Card'),

-- Students 55-56 (Neel Gaji, Harsh Gaji)
(55, 1, '2026-04-22 09:00:00', 'Completed', 114.29, 5.71, 120.00, 'UPI'),
(55, 3, '2026-04-26 11:00:00', 'Completed', 85.71,  4.29,  90.00, 'Cash'),
(56, 2, '2026-04-22 10:30:00', 'Completed', 157.14, 7.86, 165.00, 'Card'),
(56, 4, '2026-04-26 13:30:00', 'Preparing', 123.81, 6.19, 130.00, 'UPI');

-- =============================================================
-- STEP 3: Insert Order_Items for every order above
-- Each order gets 2-3 items from the correct canteen
-- Using real Item_IDs from your menu_item table
-- =============================================================

INSERT INTO Order_Item (Order_ID, Item_ID, Quantity, Subtotal)
SELECT o.Order_ID,
       mi.Item_ID,
       1,
       mi.Price
FROM Orders o
JOIN Menu_Item mi ON mi.Canteen_ID = o.canteen_id
WHERE o.Order_ID NOT IN (SELECT DISTINCT Order_ID FROM Order_Item)
AND mi.Item_ID = (
    SELECT Item_ID FROM Menu_Item
    WHERE Canteen_ID = o.canteen_id
    ORDER BY Item_ID
    LIMIT 1
);

-- Add a second item per order
INSERT INTO Order_Item (Order_ID, Item_ID, Quantity, Subtotal)
SELECT o.Order_ID,
       mi.Item_ID,
       1,
       mi.Price
FROM Orders o
JOIN Menu_Item mi ON mi.Canteen_ID = o.canteen_id
WHERE mi.Item_ID = (
    SELECT Item_ID FROM Menu_Item
    WHERE Canteen_ID = o.canteen_id
    ORDER BY Item_ID
    LIMIT 1 OFFSET 1
)
AND NOT EXISTS (
    SELECT 1 FROM Order_Item oi
    WHERE oi.Order_ID = o.Order_ID AND oi.Item_ID = mi.Item_ID
);

-- =============================================================
-- STEP 4: Insert Payment for ALL Completed orders
-- that don't already have a payment record
-- =============================================================

INSERT INTO Payment
(Order_ID, Payment_Method, Payment_Status, Amount, Transaction_Time)
SELECT
    o.Order_ID,
    o.payment_method,
    'Completed',
    o.Total_Amount,
    DATE_ADD(o.order_date, INTERVAL 5 MINUTE)
FROM Orders o
LEFT JOIN Payment p ON p.Order_ID = o.Order_ID
WHERE o.status = 'Completed'
  AND p.Order_ID IS NULL;

-- Insert Pending payments for non-completed orders
INSERT INTO Payment
(Order_ID, Payment_Method, Payment_Status, Amount, Transaction_Time)
SELECT
    o.Order_ID,
    o.payment_method,
    'Pending',
    o.Total_Amount,
    o.order_date
FROM Orders o
LEFT JOIN Payment p ON p.Order_ID = o.Order_ID
WHERE o.status IN ('Preparing', 'Ready')
  AND p.Order_ID IS NULL;

-- =============================================================
-- STEP 5: Verification
-- =============================================================
SELECT 'Total Orders'   AS check_name, COUNT(*) AS result FROM Orders;
SELECT 'Total Payments' AS check_name, COUNT(*) AS result FROM Payment;
SELECT 'Total Items'    AS check_name, COUNT(*) AS result FROM Order_Item;
SELECT status, COUNT(*) AS count FROM Orders GROUP BY status;
SELECT Payment_Status, COUNT(*) AS count FROM Payment GROUP BY Payment_Status;

COMMIT;

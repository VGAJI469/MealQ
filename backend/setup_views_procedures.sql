-- Run this file once on the target MySQL database.

CREATE TABLE IF NOT EXISTS student_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW Student_Order_View AS
SELECT s.Name, o.Order_ID, o.status AS Order_Status,
       o.order_date, o.Total_Amount, c.name AS Canteen_Name
FROM Student s
JOIN Orders o ON s.Student_ID = o.Student_ID
JOIN Canteen c ON o.canteen_id = c.Canteen_ID;

CREATE OR REPLACE VIEW Payment_Summary AS
SELECT o.Order_ID, s.Name AS Student_Name,
       p.Payment_Method, p.Payment_Status,
       p.Amount, p.Transaction_Time
FROM Payment p
JOIN Orders o ON p.Order_ID = o.Order_ID
JOIN Student s ON o.Student_ID = s.Student_ID;

DROP PROCEDURE IF EXISTS display_students;
DROP PROCEDURE IF EXISTS total_revenue_cursor;
DROP PROCEDURE IF EXISTS display_orders;
DROP TRIGGER IF EXISTS after_student_insert;

DELIMITER //

CREATE PROCEDURE display_students()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_student_id INT;
    DECLARE v_name VARCHAR(255);
    DECLARE v_email VARCHAR(255);

    DECLARE student_cur CURSOR FOR
        SELECT Student_ID, Name, Email
        FROM Student;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DROP TEMPORARY TABLE IF EXISTS tmp_display_students;
    CREATE TEMPORARY TABLE tmp_display_students (
        Student_ID INT,
        Name VARCHAR(255),
        Email VARCHAR(255)
    );

    OPEN student_cur;

    read_loop: LOOP
        FETCH student_cur INTO v_student_id, v_name, v_email;
        IF done THEN
            LEAVE read_loop;
        END IF;

        INSERT INTO tmp_display_students (Student_ID, Name, Email)
        VALUES (v_student_id, v_name, v_email);
    END LOOP;

    CLOSE student_cur;

    SELECT Student_ID, Name, Email
    FROM tmp_display_students;
END //

CREATE PROCEDURE total_revenue_cursor()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_amount DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_total_revenue DECIMAL(12,2) DEFAULT 0.00;

    DECLARE revenue_cur CURSOR FOR
        SELECT Total_Amount
        FROM Orders
        WHERE status = 'Completed';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN revenue_cur;

    revenue_loop: LOOP
        FETCH revenue_cur INTO v_amount;
        IF done THEN
            LEAVE revenue_loop;
        END IF;

        SET v_total_revenue = v_total_revenue + v_amount;
    END LOOP;

    CLOSE revenue_cur;

    SELECT v_total_revenue AS total_revenue;
END //

CREATE PROCEDURE display_orders()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_order_id INT;
    DECLARE v_student_name VARCHAR(255);
    DECLARE v_status VARCHAR(50);
    DECLARE v_total_amount DECIMAL(10,2);

    DECLARE orders_cur CURSOR FOR
        SELECT o.Order_ID, s.Name, o.status, o.Total_Amount
        FROM Orders o
        JOIN Student s ON o.Student_ID = s.Student_ID;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DROP TEMPORARY TABLE IF EXISTS tmp_display_orders;
    CREATE TEMPORARY TABLE tmp_display_orders (
        Order_ID INT,
        Student_Name VARCHAR(255),
        order_status VARCHAR(50),
        Total_Amount DECIMAL(10,2)
    );

    OPEN orders_cur;

    orders_loop: LOOP
        FETCH orders_cur INTO v_order_id, v_student_name, v_status, v_total_amount;
        IF done THEN
            LEAVE orders_loop;
        END IF;

        INSERT INTO tmp_display_orders (Order_ID, Student_Name, order_status, Total_Amount)
        VALUES (v_order_id, v_student_name, v_status, v_total_amount);
    END LOOP;

    CLOSE orders_cur;

    SELECT Order_ID, Student_Name, order_status AS status, Total_Amount
    FROM tmp_display_orders;
END //

CREATE TRIGGER after_student_insert
AFTER INSERT ON Student
FOR EACH ROW
BEGIN
    INSERT INTO student_log (Student_ID, created_at)
    VALUES (NEW.Student_ID, NOW());
END //

DELIMITER ;

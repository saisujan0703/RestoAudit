USE food_quality_db;

-- 1. Populating Departments
INSERT IGNORE INTO department (dept_id, dept_name) VALUES (1, 'Kitchen'), (2, 'Service'), (3, 'Management');

-- 2. Populating Branch Details
INSERT IGNORE INTO branch (branch_id, phone_no, street_no, pincode, address_line) VALUES (101, '9876543210', 'No. 12', '600001', 'Chennai-Main'), (102, '9876543211', 'No. 45', '600002', 'Chennai-T.Nagar');

-- 3. Populating Menu Items
INSERT IGNORE INTO menu_item (item_id, item_name, category, price) VALUES 
(1, 'Classic Burger', 'Main Course', 250.00), 
(2, 'Cheese Fries', 'Starter', 120.00),
(3, 'Margherita Pizza', 'Main Course', 350.00),
(4, 'Chicken Wings', 'Starter', 180.00),
(5, 'Caesar Salad', 'Salad', 150.00);

-- 4. Populating Users (Including Admin Profile)
-- Using branch_id and dept_id
INSERT IGNORE INTO users (user_id, first_name, last_name, email, phone_no, user_role, dept_id, branch_id) VALUES 
(1001, 'Nikhil', 'Karur', 'karurnikhil@mail.com', '9030620314', 'Admin', 3, 101),
(1002, 'Rahul', 'Verma', 'rahul@gmail.com', '9000033333', 'Customer', NULL, 101),
(1003, 'Sai Sujan', 'Balaji', 'saisujan@mail.com', '9123456780', 'Manager', 3, 101),
(1004, 'Priya', 'Sharma', 'priya@mail.com', '9876543212', 'Staff', 2, 101);

-- 5. Populating Ingredients
INSERT IGNORE INTO ingredient (ing_id, ing_name, stock_quantity, expiry_date) VALUES 
(1, 'Burger Bun', 150, '2026-05-10'),
(2, 'Cheese Slice', 80, '2026-06-01'),
(3, 'Potato', 30, '2026-05-20'),
(4, 'Lettuce', 12, '2026-05-02'),
(5, 'Tomato', 45, '2026-05-05');

-- 6. Recording Initial Transactions
INSERT IGNORE INTO orders (order_id, user_id, branch_id, order_timestamp, order_status) VALUES 
(5001, 1002, 101, '2026-05-01 14:30:00', 'Completed'),
(5002, 1002, 101, '2026-04-28 12:15:00', 'Completed'),
(5003, 1002, 101, '2026-04-25 19:45:00', 'Completed');

-- 7. Recording Order Details
INSERT IGNORE INTO order_details (order_id, item_id, quantity, subtotal) VALUES 
(5001, 1, 2, 500.00),
(5001, 2, 1, 120.00),
(5002, 3, 1, 350.00),
(5003, 4, 1, 180.00);

-- 8. Recording Initial Feedback
INSERT IGNORE INTO feedback (feedback_id, user_id, order_id, item_id, rating_score, text_comments) VALUES 
(1, 1002, 5001, 2, 2, 'Fries were salty and cold.'),
(2, 1002, 5002, 1, 5, 'Burger was perfectly cooked and juicy!'),
(3, 1002, 5003, 3, 4, 'Good pizza, but took a while to arrive.');

-- 9. Recording Complaint Logs
INSERT IGNORE INTO complaint_log (log_id, status, resolution_notes, feedback_id) VALUES 
(1, 'Open', 'Chef notified to reduce salt on fries batch #A4', 1);

-- 10. Populating Recipes
INSERT IGNORE INTO recipe (item_id, ing_id, quantity_required) VALUES 
(1, 1, 1.00), 
(1, 2, 1.00), 
(1, 4, 0.10), 
(1, 5, 0.20), 
(2, 3, 2.00), 
(2, 2, 2.00), 
(5, 4, 1.00);

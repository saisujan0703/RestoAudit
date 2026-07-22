USE food_quality_db;

-- Add a couple of more customers
INSERT IGNORE INTO users (user_id, first_name, last_name, email, phone_no, user_role, dept_id, branch_id) VALUES
(1005, 'Amit', 'Kumar', 'amitk@mail.com', '9888877777', 'Customer', NULL, 101),
(1006, 'Sneha', 'Reddy', 'snehar@mail.com', '9666655555', 'Customer', NULL, 102);

-- Insert Orders over the last 2 weeks (Dates: 2026-04-15 to 2026-04-26)
INSERT IGNORE INTO orders (order_id, user_id, branch_id, order_timestamp, order_status) VALUES
(5003, 1002, 101, '2026-04-15 13:30:00', 'Completed'),
(5004, 1005, 101, '2026-04-16 19:45:00', 'Completed'),
(5005, 1006, 102, '2026-04-18 14:15:00', 'Completed'),
(5006, 1002, 101, '2026-04-20 20:00:00', 'Completed'),
(5007, 1005, 101, '2026-04-22 13:00:00', 'Completed'),
(5008, 1006, 102, '2026-04-24 19:30:00', 'Completed'),
(5009, 1005, 101, '2026-04-25 18:45:00', 'Completed'),
(5010, 1002, 101, '2026-04-26 21:15:00', 'Completed');

-- Insert Order Details
INSERT IGNORE INTO order_details (order_id, item_id, quantity, subtotal) VALUES
(5003, 1, 1, 250.00), (5003, 2, 1, 120.00),
(5004, 3, 1, 350.00), (5004, 4, 1, 180.00),
(5005, 1, 1, 250.00),
(5006, 3, 1, 350.00), (5006, 1, 1, 250.00),
(5007, 5, 1, 150.00),
(5008, 3, 2, 700.00),
(5009, 1, 1, 250.00), (5009, 4, 1, 180.00),
(5010, 5, 2, 300.00);

-- Insert Payments
INSERT IGNORE INTO payment (payment_id, order_id, amount, payment_mode, payment_date) VALUES
(7003, 5003, 370.00, 'Card', '2026-04-15'),
(7004, 5004, 530.00, 'UPI', '2026-04-16'),
(7005, 5005, 250.00, 'Cash', '2026-04-18'),
(7006, 5006, 600.00, 'Card', '2026-04-20'),
(7007, 5007, 150.00, 'UPI', '2026-04-22'),
(7008, 5008, 700.00, 'Card', '2026-04-24'),
(7009, 5009, 430.00, 'UPI', '2026-04-25'),
(7010, 5010, 300.00, 'Cash', '2026-04-26');

-- Insert Feedback
INSERT IGNORE INTO feedback (feedback_id, order_id, user_id, item_id, rating_score, text_comments, created_at) VALUES
(8003, 5003, 1002, 1, 5, 'Great burger, very fresh!', '2026-04-15 15:00:00'),
(8004, 5004, 1005, 3, 4, 'Pizza was good but delivery was slightly late.', '2026-04-16 20:30:00'),
(8005, 5006, 1002, 3, 3, 'Food was okay, packaging could be better.', '2026-04-20 21:00:00'),
(8006, 5008, 1006, 3, 5, 'Amazing pizza as always!', '2026-04-24 20:15:00');

-- Insert Complaints
INSERT IGNORE INTO complaint_log (log_id, feedback_id, status, resolution_notes) VALUES
(9002, 8004, 'Resolved', 'Apologized to customer and offered 10% discount on next order.'),
(9003, 8005, 'In Progress', NULL);


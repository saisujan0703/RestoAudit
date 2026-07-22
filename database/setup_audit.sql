USE food_quality_db;

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    action_type VARCHAR(10) NOT NULL,
    record_id INT,
    action_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Trigger for users (INSERT)
DELIMITER //
DROP TRIGGER IF EXISTS after_user_insert//
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('users', 'INSERT', NEW.user_id, CONCAT('New user registered: ', NEW.first_name, ' (Role: ', NEW.user_role, ')'));
END//

-- Trigger for users (UPDATE)
DROP TRIGGER IF EXISTS after_user_update//
CREATE TRIGGER after_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('users', 'UPDATE', NEW.user_id, CONCAT('User updated: ', NEW.first_name, ' (', NEW.email, ')'));
END//

-- Trigger for users (DELETE)
DROP TRIGGER IF EXISTS after_user_delete//
CREATE TRIGGER after_user_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('users', 'DELETE', OLD.user_id, CONCAT('User deleted: ', OLD.first_name, ' (', OLD.email, ')'));
END//

-- Trigger for orders (INSERT)
DROP TRIGGER IF EXISTS after_order_insert//
CREATE TRIGGER after_order_insert
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('orders', 'INSERT', NEW.order_id, CONCAT('New order placed by user: ', NEW.user_id));
END//

-- Trigger for orders (UPDATE)
DROP TRIGGER IF EXISTS after_order_update//
CREATE TRIGGER after_order_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('orders', 'UPDATE', NEW.order_id, CONCAT('Order status changed from ', OLD.order_status, ' to ', NEW.order_status));
END//

-- Trigger for orders (DELETE)
DROP TRIGGER IF EXISTS after_order_delete//
CREATE TRIGGER after_order_delete
AFTER DELETE ON orders
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('orders', 'DELETE', OLD.order_id, CONCAT('Order deleted for user: ', OLD.user_id));
END//

-- Trigger for feedback (INSERT)
DROP TRIGGER IF EXISTS after_feedback_insert//
CREATE TRIGGER after_feedback_insert
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('feedback', 'INSERT', NEW.feedback_id, CONCAT('New feedback received with rating: ', NEW.rating_score));
END//

-- Trigger for feedback (UPDATE)
DROP TRIGGER IF EXISTS after_feedback_update//
CREATE TRIGGER after_feedback_update
AFTER UPDATE ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('feedback', 'UPDATE', NEW.feedback_id, CONCAT('Feedback updated. Rating: ', OLD.rating_score, ' -> ', NEW.rating_score));
END//

-- Trigger for feedback (DELETE)
DROP TRIGGER IF EXISTS after_feedback_delete//
CREATE TRIGGER after_feedback_delete
AFTER DELETE ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('feedback', 'DELETE', OLD.feedback_id, CONCAT('Feedback deleted for user: ', OLD.user_id));
END//

-- Trigger for complaint_log (INSERT)
DROP TRIGGER IF EXISTS after_complaint_insert//
CREATE TRIGGER after_complaint_insert
AFTER INSERT ON complaint_log
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('complaint_log', 'INSERT', NEW.log_id, CONCAT('New complaint logged for feedback: ', NEW.feedback_id));
END//

-- Trigger for complaint_log (UPDATE)
DROP TRIGGER IF EXISTS after_complaint_update//
CREATE TRIGGER after_complaint_update
AFTER UPDATE ON complaint_log
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('complaint_log', 'UPDATE', NEW.log_id, CONCAT('Complaint status changed from ', OLD.status, ' to ', NEW.status));
END//

-- Trigger for complaint_log (DELETE)
DROP TRIGGER IF EXISTS after_complaint_delete//
CREATE TRIGGER after_complaint_delete
AFTER DELETE ON complaint_log
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('complaint_log', 'DELETE', OLD.log_id, CONCAT('Complaint deleted for feedback: ', OLD.feedback_id));
END//

-- Trigger for department (INSERT)
DROP TRIGGER IF EXISTS after_department_insert//
CREATE TRIGGER after_department_insert
AFTER INSERT ON department
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('department', 'INSERT', NEW.dept_id, CONCAT('New department created: ', NEW.dept_name));
END//

-- Trigger for department (UPDATE)
DROP TRIGGER IF EXISTS after_department_update//
CREATE TRIGGER after_department_update
AFTER UPDATE ON department
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('department', 'UPDATE', NEW.dept_id, CONCAT('Department updated: ', OLD.dept_name, ' -> ', NEW.dept_name));
END//

-- Trigger for department (DELETE)
DROP TRIGGER IF EXISTS after_department_delete//
CREATE TRIGGER after_department_delete
AFTER DELETE ON department
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('department', 'DELETE', OLD.dept_id, CONCAT('Department deleted: ', OLD.dept_name));
END//

-- Trigger for branch (INSERT)
DROP TRIGGER IF EXISTS after_branch_insert//
CREATE TRIGGER after_branch_insert
AFTER INSERT ON branch
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('branch', 'INSERT', NEW.branch_id, CONCAT('New branch created: ', NEW.address_line));
END//

-- Trigger for branch (UPDATE)
DROP TRIGGER IF EXISTS after_branch_update//
CREATE TRIGGER after_branch_update
AFTER UPDATE ON branch
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('branch', 'UPDATE', NEW.branch_id, CONCAT('Branch updated: ', COALESCE(OLD.address_line, ''), ' -> ', COALESCE(NEW.address_line, '')));
END//

-- Trigger for branch (DELETE)
DROP TRIGGER IF EXISTS after_branch_delete//
CREATE TRIGGER after_branch_delete
AFTER DELETE ON branch
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('branch', 'DELETE', OLD.branch_id, CONCAT('Branch deleted: ', COALESCE(OLD.address_line, '')));
END//

-- Trigger for menu_item (INSERT)
DROP TRIGGER IF EXISTS after_menu_item_insert//
CREATE TRIGGER after_menu_item_insert
AFTER INSERT ON menu_item
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('menu_item', 'INSERT', NEW.item_id, CONCAT('New menu item: ', NEW.item_name, ' (', NEW.category, ')'));
END//

-- Trigger for menu_item (UPDATE)
DROP TRIGGER IF EXISTS after_menu_item_update//
CREATE TRIGGER after_menu_item_update
AFTER UPDATE ON menu_item
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('menu_item', 'UPDATE', NEW.item_id, CONCAT('Menu item updated: ', OLD.item_name, ' -> ', NEW.item_name));
END//

-- Trigger for menu_item (DELETE)
DROP TRIGGER IF EXISTS after_menu_item_delete//
CREATE TRIGGER after_menu_item_delete
AFTER DELETE ON menu_item
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('menu_item', 'DELETE', OLD.item_id, CONCAT('Menu item deleted: ', OLD.item_name));
END//

-- Trigger for ingredient (INSERT)
DROP TRIGGER IF EXISTS after_ingredient_insert//
CREATE TRIGGER after_ingredient_insert
AFTER INSERT ON ingredient
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('ingredient', 'INSERT', NEW.ing_id, CONCAT('New ingredient: ', NEW.ing_name, ' (Qty: ', NEW.stock_quantity, ')'));
END//

-- Trigger for ingredient (UPDATE)
DROP TRIGGER IF EXISTS after_ingredient_update//
CREATE TRIGGER after_ingredient_update
AFTER UPDATE ON ingredient
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('ingredient', 'UPDATE', NEW.ing_id, CONCAT('Ingredient updated: ', OLD.ing_name, ' (Qty: ', OLD.stock_quantity, ' -> ', NEW.stock_quantity, ')'));
END//

-- Trigger for ingredient (DELETE)
DROP TRIGGER IF EXISTS after_ingredient_delete//
CREATE TRIGGER after_ingredient_delete
AFTER DELETE ON ingredient
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('ingredient', 'DELETE', OLD.ing_id, CONCAT('Ingredient deleted: ', OLD.ing_name));
END//
DELIMITER ;

USE food_quality_db;

DELIMITER //
DROP TRIGGER IF EXISTS after_user_insert//
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action_type, record_id, details)
    VALUES ('users', 'INSERT', NEW.user_id, CONCAT('New user registered: ', NEW.first_name, ' (Role: ', NEW.user_role, ')'));
END//
DELIMITER ;

DELIMITER $$

DROP TRIGGER IF EXISTS after_order_update$$
CREATE TRIGGER after_order_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.order_status != NEW.order_status THEN
        INSERT INTO audit_log (table_name, action_type, record_id, details)
        VALUES ('orders', 'UPDATE', NEW.order_id, CONCAT('Order status changed from ', OLD.order_status, ' to ', NEW.order_status));
    END IF;
END$$

DROP TRIGGER IF EXISTS after_complaint_update$$
CREATE TRIGGER after_complaint_update
AFTER UPDATE ON complaint_log
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_log (table_name, action_type, record_id, details)
        VALUES ('complaint_log', 'UPDATE', NEW.log_id, CONCAT('Complaint status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END$$

DELIMITER ;

USE food_quality_db;

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    action_type VARCHAR(10) NOT NULL,
    record_id INT,
    action_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- Creates (or replaces) AFTER INSERT/UPDATE/DELETE audit triggers for every base table
-- in the current database schema, excluding the audit_log table itself.
--
-- Trigger names:
--   after_<table>_insert
--   after_<table>_update
--   after_<table>_delete
--
-- Notes:
-- - record_id is populated only when the table has a single-column numeric PRIMARY KEY.
--   Otherwise, record_id is NULL and the PK (if any) is captured in details JSON.
-- - details is stored as JSON text so the Admin dashboard can render it as a string.

DELIMITER //
DROP PROCEDURE IF EXISTS sp_create_audit_triggers_for_all_tables//
CREATE PROCEDURE sp_create_audit_triggers_for_all_tables()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE tbl VARCHAR(255);

    DECLARE cur CURSOR FOR
        SELECT t.table_name
        FROM information_schema.tables t
        WHERE t.table_schema = DATABASE()
          AND t.table_type = 'BASE TABLE'
          AND t.table_name <> 'audit_log';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- Allow building large JSON_OBJECT expressions
    SET SESSION group_concat_max_len = 1000000;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO tbl;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        -- Build JSON_OBJECT pairs for NEW and OLD rows
        SELECT GROUP_CONCAT(
                   CONCAT("'", c.column_name, "'", ", NEW.`", c.column_name, "`")
                   ORDER BY c.ordinal_position
                   SEPARATOR ', '
               )
        INTO @new_pairs
        FROM information_schema.columns c
        WHERE c.table_schema = DATABASE()
          AND c.table_name = tbl;

        SELECT GROUP_CONCAT(
                   CONCAT("'", c.column_name, "'", ", OLD.`", c.column_name, "`")
                   ORDER BY c.ordinal_position
                   SEPARATOR ', '
               )
        INTO @old_pairs
        FROM information_schema.columns c
        WHERE c.table_schema = DATABASE()
          AND c.table_name = tbl;

        -- Identify PRIMARY KEY (single-column only)
        SELECT COUNT(*), MAX(k.column_name)
        INTO @pk_count, @pk_col
        FROM information_schema.key_column_usage k
        WHERE k.table_schema = DATABASE()
          AND k.table_name = tbl
          AND k.constraint_name = 'PRIMARY';

        IF @pk_count = 1 THEN
            SELECT c.data_type
            INTO @pk_type
            FROM information_schema.columns c
            WHERE c.table_schema = DATABASE()
              AND c.table_name = tbl
              AND c.column_name = @pk_col
            LIMIT 1;
        ELSE
            SET @pk_type = NULL;
        END IF;

        SET @pk_is_numeric = (@pk_count = 1 AND @pk_type IN ('tinyint','smallint','mediumint','int','bigint'));

        SET @record_new_expr = IF(@pk_is_numeric, CONCAT('NEW.`', @pk_col, '`'), 'NULL');
        SET @record_old_expr = IF(@pk_is_numeric, CONCAT('OLD.`', @pk_col, '`'), 'NULL');

        SET @pk_new_str_expr = IF(@pk_count = 1, CONCAT('CAST(NEW.`', @pk_col, '` AS CHAR)'), 'NULL');
        SET @pk_old_str_expr = IF(@pk_count = 1, CONCAT('CAST(OLD.`', @pk_col, '` AS CHAR)'), 'NULL');

        SET @pk_col_literal = IF(@pk_count = 1, QUOTE(@pk_col), 'NULL');

        -- Drop existing triggers created by prior runs (or older scripts)
        SET @sql = CONCAT('DROP TRIGGER IF EXISTS `after_', tbl, '_insert`');
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

        SET @sql = CONCAT('DROP TRIGGER IF EXISTS `after_', tbl, '_update`');
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

        SET @sql = CONCAT('DROP TRIGGER IF EXISTS `after_', tbl, '_delete`');
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

        -- AFTER INSERT trigger
        SET @sql = CONCAT(
            'CREATE TRIGGER `after_', tbl, '_insert` AFTER INSERT ON `', tbl, '` FOR EACH ROW\n',
            'BEGIN\n',
            '  INSERT INTO audit_log (table_name, action_type, record_id, details) VALUES (',
            QUOTE(tbl),
            ", 'INSERT', ",
            @record_new_expr,
            ', ',
            'JSON_OBJECT(',
            "'pkColumn', ", @pk_col_literal, ', ',
            "'pk', ", @pk_new_str_expr, ', ',
            "'row', JSON_OBJECT(", @new_pairs, ")",
            ')',
            ');\n',
            'END'
        );
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

        -- AFTER UPDATE trigger
        SET @sql = CONCAT(
            'CREATE TRIGGER `after_', tbl, '_update` AFTER UPDATE ON `', tbl, '` FOR EACH ROW\n',
            'BEGIN\n',
            '  INSERT INTO audit_log (table_name, action_type, record_id, details) VALUES (',
            QUOTE(tbl),
            ", 'UPDATE', ",
            @record_new_expr,
            ', ',
            'JSON_OBJECT(',
            "'pkColumn', ", @pk_col_literal, ', ',
            "'pk', ", @pk_new_str_expr, ', ',
            "'old', JSON_OBJECT(", @old_pairs, "), ",
            "'new', JSON_OBJECT(", @new_pairs, ")",
            ')',
            ');\n',
            'END'
        );
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

        -- AFTER DELETE trigger
        SET @sql = CONCAT(
            'CREATE TRIGGER `after_', tbl, '_delete` AFTER DELETE ON `', tbl, '` FOR EACH ROW\n',
            'BEGIN\n',
            '  INSERT INTO audit_log (table_name, action_type, record_id, details) VALUES (',
            QUOTE(tbl),
            ", 'DELETE', ",
            @record_old_expr,
            ', ',
            'JSON_OBJECT(',
            "'pkColumn', ", @pk_col_literal, ', ',
            "'pk', ", @pk_old_str_expr, ', ',
            "'row', JSON_OBJECT(", @old_pairs, ")",
            ')',
            ');\n',
            'END'
        );
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

    END LOOP;

    CLOSE cur;
END//
DELIMITER ;

CALL sp_create_audit_triggers_for_all_tables();

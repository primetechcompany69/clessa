-- Allow NULL values for user_id column in audit_logs table
USE mobile_pos_system;

ALTER TABLE audit_logs 
MODIFY COLUMN user_id INT NULL;

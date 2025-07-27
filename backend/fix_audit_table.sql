-- Add missing user_agent column to audit_logs table
USE mobile_pos_system;

ALTER TABLE audit_logs 
ADD COLUMN user_agent TEXT NULL AFTER ip_address;

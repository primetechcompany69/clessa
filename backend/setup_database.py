#!/usr/bin/env python3
"""
Database setup script to create missing tables
"""
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_audit_log_table():
    """Create the audit_log table if it doesn't exist"""
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = conn.cursor()
        
        # Create audit_log table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS audit_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            action VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_action (action),
            INDEX idx_created_at (created_at)
        );
        """
        
        cursor.execute(create_table_query)
        conn.commit()
        
        print("✅ audit_log table created successfully!")
        
        # Verify table exists
        cursor.execute("SHOW TABLES LIKE 'audit_log'")
        result = cursor.fetchone()
        if result:
            print("✅ Table verification: audit_log table exists")
        else:
            print("❌ Table verification failed")
            
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("📝 Database connection closed")

if __name__ == "__main__":
    print("🔧 Setting up database tables...")
    create_audit_log_table()
    print("✅ Database setup complete!")

#!/usr/bin/env python3
"""
Script to check existing users and create default admin if needed
"""
import mysql.connector
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask import Flask

# Load environment variables
load_dotenv()

# Initialize Flask app and bcrypt for password hashing
app = Flask(__name__)
bcrypt = Bcrypt(app)

def check_and_create_users():
    """Check existing users and create default admin if needed"""
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = conn.cursor(dictionary=True)
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("[ERROR] 'users' table does not exist in the database!")
            print("You need to create the users table first.")
            return
        
        # Check existing users
        cursor.execute("SELECT email, role, full_name, is_active FROM users")
        existing_users = cursor.fetchall()
        
        print(f"[INFO] Found {len(existing_users)} users in database:")
        if existing_users:
            for user in existing_users:
                status = "ACTIVE" if user['is_active'] else "INACTIVE"
                print(f"  - {user['email']} ({user['role']}) - {status}")
        else:
            print("  [WARNING] No users found in database!")
            print("\n[INFO] Creating default admin user...")
            
            # Create default admin user
            default_email = 'admin@clessa.com'
            default_password = 'admin123'
            
            # Hash the password
            with app.app_context():
                password_hash = bcrypt.generate_password_hash(default_password).decode('utf-8')
            
            # Insert the admin user
            insert_query = """
            INSERT INTO users (email, password_hash, role, full_name, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """
            
            cursor.execute(insert_query, (
                default_email,
                password_hash,
                'admin',
                'System Administrator',
                True
            ))
            
            conn.commit()
            
            print(f"[OK] Default admin user created!")
            print(f"     Email: {default_email}")
            print(f"     Password: {default_password}")
            print(f"     Role: admin")
            print("\n[WARNING] Please change the password after first login!")
        
        print("\n" + "="*50)
        print("REQUIRED CREDENTIALS FOR LOGIN:")
        print("="*50)
        
        if existing_users:
            print("Use any of the existing user credentials shown above")
        else:
            print("Email: admin@clessa.com")
            print("Password: admin123")
        
        print("="*50)
        
    except mysql.connector.Error as err:
        print(f"[ERROR] Database error: {err}")
    except Exception as e:
        print(f"[ERROR] Error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    check_and_create_users()

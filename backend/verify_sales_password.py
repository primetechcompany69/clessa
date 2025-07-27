#!/usr/bin/env python3
"""
Script to verify and potentially reset sales user password
"""
import mysql.connector
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask import Flask

# Load environment variables
load_dotenv()

# Initialize Flask app and bcrypt
app = Flask(__name__)
bcrypt = Bcrypt(app)

def verify_and_reset_sales_password():
    """Verify sales password and reset if incorrect"""
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = conn.cursor(dictionary=True)
        
        email = "sales@gmail.com"
        expected_password = "user002"
        
        # Get user by email
        cursor.execute("SELECT email, password_hash, role, is_active FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"[ERROR] User with email '{email}' not found!")
            return
        
        print(f"[INFO] Found user: {user['email']} ({user['role']})")
        print(f"[INFO] Account status: {'ACTIVE' if user['is_active'] else 'INACTIVE'}")
        
        # Verify password
        with app.app_context():
            password_matches = bcrypt.check_password_hash(user['password_hash'], expected_password)
        
        if password_matches:
            print("[OK] Password is CORRECT!")
            print(f"     Email: {email}")
            print(f"     Password: {expected_password}")
            print(f"     Role: {user['role']}")
            print("[INFO] No reset needed - credentials are valid!")
        else:
            print("[WARNING] Password is INCORRECT - resetting now...")
            
            # Hash the new password
            password_hash = bcrypt.generate_password_hash(expected_password).decode('utf-8')
            
            # Update the password
            update_query = "UPDATE users SET password_hash = %s WHERE email = %s"
            cursor.execute(update_query, (password_hash, email))
            conn.commit()
            
            print(f"[OK] Password reset successfully!")
            print(f"     Email: {email}")
            print(f"     New Password: {expected_password}")
            print(f"     Role: {user['role']}")
        
        print("\n" + "="*50)
        print("SALES ACCOUNT CREDENTIALS:")
        print("="*50)
        print(f"Email: {email}")
        print(f"Password: {expected_password}")
        print(f"Role: {user['role']}")
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
    print("[INFO] Verifying sales account password...")
    verify_and_reset_sales_password()

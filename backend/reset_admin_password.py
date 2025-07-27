#!/usr/bin/env python3
"""
Script to reset the admin password to a known value
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

def reset_admin_password():
    """Reset the admin password to 'user001'"""
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = conn.cursor(dictionary=True)
        
        email = "clessaelectronics@gmail.com"
        new_password = "user001"
        
        # Check if user exists
        cursor.execute("SELECT email, role FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"[ERROR] User {email} not found!")
            return
        
        print(f"[INFO] Found user: {user['email']} ({user['role']})")
        
        # Hash the new password
        with app.app_context():
            password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update the password
        update_query = "UPDATE users SET password_hash = %s WHERE email = %s"
        cursor.execute(update_query, (password_hash, email))
        conn.commit()
        
        print(f"[OK] Password reset successfully!")
        print(f"     Email: {email}")
        print(f"     New Password: {new_password}")
        print(f"     Role: {user['role']}")
        print("\n[INFO] You can now log in with these credentials!")
        
    except mysql.connector.Error as err:
        print(f"[ERROR] Database error: {err}")
    except Exception as e:
        print(f"[ERROR] Error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    print("[INFO] Resetting admin password...")
    reset_admin_password()

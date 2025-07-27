#!/usr/bin/env python3
"""
Script to verify password for a specific user
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

def verify_user_password(email, password):
    """Verify if the provided password matches the stored hash"""
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = conn.cursor(dictionary=True)
        
        # Get user by email
        cursor.execute("SELECT email, password_hash, role, is_active FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            print(f"[ERROR] User with email '{email}' not found!")
            return False
        
        print(f"[INFO] Found user: {user['email']} ({user['role']})")
        print(f"[INFO] Account status: {'ACTIVE' if user['is_active'] else 'INACTIVE'}")
        
        if not user['is_active']:
            print("[ERROR] User account is inactive!")
            return False
        
        # Verify password
        with app.app_context():
            password_matches = bcrypt.check_password_hash(user['password_hash'], password)
        
        if password_matches:
            print("[OK] Password is CORRECT!")
            print("You should be able to log in with these credentials.")
            return True
        else:
            print("[ERROR] Password is INCORRECT!")
            print("The password you provided does not match the stored hash.")
            return False
        
    except mysql.connector.Error as err:
        print(f"[ERROR] Database error: {err}")
        return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    email = "clessaelectronics@gmail.com"
    password = "user001"
    
    print(f"[INFO] Verifying credentials for: {email}")
    print(f"[INFO] Password: {password}")
    print("-" * 50)
    
    verify_user_password(email, password)

#!/usr/bin/env python3
"""
Script to create a default admin user for the CLESAA system
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

def create_default_admin():
    """Create a default admin user if it doesn't exist"""
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = conn.cursor(dictionary=True)
        
        # Check if admin user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", ('admin@clessa.com',))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print("[OK] Admin user already exists!")
            print(f"   Email: admin@clessa.com")
            print(f"   Role: {existing_user['role']}")
            return
        
        # Create default admin user
        default_email = 'admin@clessa.com'
        default_password = 'admin123'  # You should change this after first login
        
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
        
        print("[OK] Default admin user created successfully!")
        print(f"   Email: {default_email}")
        print(f"   Password: {default_password}")
        print(f"   Role: admin")
        print("")
        print("[WARNING] IMPORTANT: Please change the default password after first login!")
        
    except mysql.connector.Error as err:
        print(f"[ERROR] Database error: {err}")
        print("Make sure the 'users' table exists in your database.")
    except Exception as e:
        print(f"[ERROR] Error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            print("[INFO] Database connection closed")

if __name__ == "__main__":
    print("[INFO] Creating default admin user...")
    create_default_admin()
    print("[OK] Setup complete!")

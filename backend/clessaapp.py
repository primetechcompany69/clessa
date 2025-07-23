import os
import mysql.connector
from flask import Flask, request, jsonify, make_response
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, create_refresh_token
)
from functools import wraps
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv
import re
from datetime import timedelta, datetime
import uuid
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# ========================
# Security Configuration
# ========================
app.config.update({
    'SECRET_KEY': os.getenv('SECRET_KEY'),
    'JWT_SECRET_KEY': os.getenv('JWT_SECRET'),
    'JWT_ACCESS_TOKEN_EXPIRES': timedelta(hours=1),
    'JWT_REFRESH_TOKEN_EXPIRES': timedelta(days=30),
    'RATELIMIT_DEFAULT': '200 per day;50 per hour',
    'SECURITY_PASSWORD_SALT': os.getenv('PASSWORD_RESET_SALT'),
})

# Security middleware
Talisman(app, 
    force_https=True,
    strict_transport_security=True,
    session_cookie_secure=True,
    content_security_policy={
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"]
    }
)
CORS(app, supports_credentials=True)

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
limiter = Limiter(app, key_func=get_remote_address)

# ========================
# Database Connection
# ========================
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )

def execute_query(query, params=None, fetch_one=False, fetch_all=False, lastrowid=False):
    """Safe query execution with parameterized queries"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        elif lastrowid:
            result = cursor.lastrowid
        else:
            result = None
        
        conn.commit()
        return result
    except Exception as e:
        if conn:
            conn.rollback()
        app.logger.error(f"Database error: {str(e)}")
        raise
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# ========================
# Security Utilities
# ========================
def validate_input(input_str, pattern):
    """Prevent SQL injection/XSS with regex validation"""
    if input_str is None:
        return False
    return re.match(pattern, input_str) is not None

def role_required(role):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user = get_jwt_identity()
            if current_user['role'] != role:
                return jsonify({"error": "Insufficient permissions"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

def log_security_action(user_id, action, request):
    """Log security-related actions"""
    ip_address = request.remote_addr
    user_agent = request.headers.get('User-Agent')
    
    execute_query(
        """INSERT INTO audit_log 
        (user_id, action, ip_address, user_agent)
        VALUES (%s, %s, %s, %s)""",
        (user_id, action, ip_address, user_agent)
    )

# ========================
# Authentication Endpoints
# ========================
@app.route('/api/auth/login', methods=['POST'])
@limiter.limit('5 per minute')
def login():
    """Secure login with email and rate limiting"""
    data = request.get_json()
    
    if not validate_input(data.get('email'), r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'):
        return jsonify({"error": "Invalid email format"}), 400
    
    if not validate_input(data.get('password'), r'^.{6,50}$'):
        return jsonify({"error": "Password must be 6-50 characters"}), 400
    
    user = execute_query(
        "SELECT * FROM users WHERE email = %s",
        (data['email'],),
        fetch_one=True
    )
    
    if user and bcrypt.check_password_hash(user['password_hash'], data['password']):
        access_token = create_access_token(identity={
            'user_id': user['user_id'],
            'role': user['role'],
            'email': user['email']
        })
        refresh_token = create_refresh_token(identity={
            'user_id': user['user_id'],
            'email': user['email']
        })
        
        log_security_action(user['user_id'], "login_success", request)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'email': user['email'],
                'role': user['role'],
                'full_name': user.get('full_name')
            }
        })
    
    log_security_action(None, "login_failed", request)
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user = get_jwt_identity()
    new_token = create_access_token(identity={
        'user_id': current_user['user_id'],
        'role': current_user['role'],
        'email': current_user['email']
    })
    return jsonify({'access_token': new_token})

@app.route('/api/auth/request-password-reset', methods=['POST'])
def request_password_reset():
    """Initiate password reset process"""
    email = request.json.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = execute_query(
        "SELECT user_id, email FROM users WHERE email = %s",
        (email,),
        fetch_one=True
    )
    
    if user:
        token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        execute_query(
            """INSERT INTO password_reset_tokens 
            (user_id, token, expires_at)
            VALUES (%s, %s, %s)""",
            (user['user_id'], token, expires_at)
        )
        
        # In production: Send email with reset link
        reset_link = f"{request.host_url}reset-password?token={token}"
        print(f"Password reset link: {reset_link}")  # For development
        
        log_security_action(user['user_id'], "password_reset_request", request)
    
    return jsonify({"message": "If the email exists, a reset link has been sent"}), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Complete password reset"""
    token = request.json.get('token')
    new_password = request.json.get('new_password')
    
    if not all([token, new_password]):
        return jsonify({"error": "Token and new password are required"}), 400
    
    if not validate_input(new_password, r'^.{8,50}$'):
        return jsonify({"error": "Password must be 8-50 characters"}), 400
    
    reset_token = execute_query(
        """SELECT * FROM password_reset_tokens 
        WHERE token = %s AND used = FALSE AND expires_at > UTC_TIMESTAMP()""",
        (token,),
        fetch_one=True
    )
    
    if not reset_token:
        return jsonify({"error": "Invalid or expired token"}), 400
    
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    execute_query(
        "UPDATE users SET password_hash = %s WHERE user_id = %s",
        (hashed_password, reset_token['user_id'])
    )
    
    execute_query(
        "UPDATE password_reset_tokens SET used = TRUE WHERE token_id = %s",
        (reset_token['token_id'],)
    )
    
    log_security_action(reset_token['user_id'], "password_reset_complete", request)
    
    return jsonify({"message": "Password updated successfully"}), 200

# ========================
# Product Endpoints
# ========================
@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    """Get all products with search"""
    search = request.args.get('search', '')
    if search and not validate_input(search, r'^[a-zA-Z0-9\s\-]{0,50}$'):
        return jsonify({"error": "Invalid search term"}), 400
    
    query = "SELECT * FROM products WHERE is_active = TRUE"
    params = ()
    if search:
        query += " AND name LIKE %s"
        params = (f'%{search}%',)
    
    products = execute_query(query, params, fetch_all=True)
    return jsonify(products)

@app.route('/api/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Get single product"""
    product = execute_query(
        "SELECT * FROM products WHERE product_id = %s AND is_active = TRUE",
        (product_id,),
        fetch_one=True
    )
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

@app.route('/api/products', methods=['POST'])
@role_required('admin')
def create_product():
    """Create new product (Admin only)"""
    data = request.get_json()
    required_fields = ['sku', 'name', 'category', 'base_price', 'cost_price']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        product_id = execute_query(
            """INSERT INTO products 
            (sku, name, description, category, base_price, cost_price, supplier_id, image_url, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                data['sku'], data['name'], data.get('description'),
                data['category'], data['base_price'], data['cost_price'],
                data.get('supplier_id'), data.get('image_url'), True
            ),
            lastrowid=True
        )
        return jsonify({"product_id": product_id}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400

# ========================
# Inventory Endpoints
# ========================
@app.route('/api/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    """Get inventory with variants"""
    query = """
    SELECT p.*, v.variant_id, v.color, v.model_compatibility, v.current_stock, v.low_stock_threshold
    FROM products p
    LEFT JOIN product_variants v ON p.product_id = v.product_id
    WHERE p.is_active = TRUE
    """
    inventory = execute_query(query, fetch_all=True)
    return jsonify(inventory)

# ========================
# Sales Endpoints
# ========================
@app.route('/api/sales', methods=['POST'])
@jwt_required()
def create_sale():
    """Process a new sale"""
    data = request.get_json()
    required_fields = ['items', 'cash_received']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Create transaction
        cursor.execute(
            """INSERT INTO transactions 
            (receipt_number, user_id, total_amount, cash_received, change_given, customer_phone, customer_email)
            VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                f"REC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                get_jwt_identity()['user_id'],
                data['total_amount'],
                data['cash_received'],
                data['cash_received'] - data['total_amount'],
                data.get('customer_phone'),
                data.get('customer_email')
            )
        )
        transaction_id = cursor.lastrowid
        
        # Add items and update stock
        for item in data['items']:
            cursor.execute(
                """INSERT INTO transaction_items 
                (transaction_id, variant_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)""",
                (transaction_id, item['variant_id'], item['quantity'], item['unit_price'])
            )
            
            cursor.execute(
                """UPDATE product_variants 
                SET current_stock = current_stock - %s 
                WHERE variant_id = %s""",
                (item['quantity'], item['variant_id'])
            )
        
        conn.commit()
        return jsonify({"transaction_id": transaction_id}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# ========================
# Report Endpoints
# ========================
@app.route('/api/reports/sales', methods=['GET'])
@role_required('admin')
def get_sales_report():
    """Generate sales report (Admin only)"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = """
    SELECT DATE(t.created_at) as date, 
           COUNT(*) as transactions,
           SUM(t.total_amount) as total_sales,
           SUM(ti.quantity) as items_sold
    FROM transactions t
    JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
    """
    
    params = []
    if start_date and end_date:
        query += " WHERE DATE(t.created_at) BETWEEN %s AND %s"
        params.extend([start_date, end_date])
    
    query += " GROUP BY DATE(t.created_at) ORDER BY date DESC"
    
    report = execute_query(query, params, fetch_all=True)
    return jsonify(report)

# ========================
# Error Handlers
# ========================
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": "Too many requests"}), 429

@app.errorhandler(400)
def bad_request_handler(e):
    return jsonify({"error": "Bad request"}), 400

@app.errorhandler(404)
def not_found_handler(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error_handler(e):
    app.logger.error(f"Server error: {str(e)}")
    return jsonify({"error": "Internal server error"}), 500

# ========================
# Startup
# ========================
if __name__ == '__main__':
    # Configure logging
    handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    
    app.run(ssl_context='adhoc', debug=True)
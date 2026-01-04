from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, timedelta
import jwt
import uuid
from app import db
from app.config import Config
from app.models.user import User
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({
                'success': False,
                'error': 'Email, password, and name are required'
            }), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 400
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=data['email'],
            name=data['name']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
        }, Config.JWT_SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'token': token
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
        }, Config.JWT_SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'token': token
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'success': True,
        'data': current_user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # For JWT, logout is handled client-side by removing the token
    # This endpoint exists for consistency
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200
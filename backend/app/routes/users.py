from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.utils.decorators import token_required
from werkzeug.security import generate_password_hash

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile (name, email)"""
    try:
        data = request.get_json()
        
        if 'name' in data:
            current_user.name = data['name']
        
        if 'email' in data:
            # Check if email is already taken
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != current_user.id:
                return jsonify({
                    'success': False,
                    'error': 'Email already in use'
                }), 400
            current_user.email = data['email']
            
        if 'homeLocation' in data:
            current_user.home_location = data['homeLocation']
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/password', methods=['PUT'])
@token_required
def update_password(current_user):
    """Update user password"""
    try:
        data = request.get_json()
        
        if not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({
                'success': False,
                'error': 'Current and new password are required'
            }), 400
            
        if not current_user.check_password(data['currentPassword']):
            return jsonify({
                'success': False,
                'error': 'Incorrect current password'
            }), 401
            
        current_user.set_password(data['newPassword'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@users_bp.route('/preferences', methods=['PUT'])
@token_required
def update_preferences(current_user):
    """Update user preferences (JSON)"""
    try:
        data = request.get_json()
        
        # Merge existing preferences with new ones
        preferences = dict(current_user.preferences or {})
        
        # Update specific fields or replace the whole settings
        for key, value in data.items():
            preferences[key] = value
            
        current_user.preferences = preferences
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': current_user.preferences
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

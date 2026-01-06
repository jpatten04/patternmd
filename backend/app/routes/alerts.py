from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from app import db
from app.models.alert import Alert
from app.utils.decorators import token_required

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/settings', methods=['GET'])
@token_required
def get_alert_settings(current_user):
    """Get alert settings for the current user"""
    try:
        # Default settings if none exist
        default_settings = {
            'missedDoseAlerts': True,
            'highSeverityAlerts': True,
            'patternDiscoveryAlerts': True,
            'environmentAlerts': True,
            'notificationMethod': 'app' # app, email, or both
        }
        
        settings = current_user.preferences.get('alertSettings', default_settings)
        return jsonify({
            'success': True,
            'data': settings
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@alerts_bp.route('/settings', methods=['PUT'])
@token_required
def update_alert_settings(current_user):
    """Update alert settings for the current user"""
    try:
        data = request.get_json()
        
        # Merge new settings with existing preferences
        preferences = dict(current_user.preferences or {})
        preferences['alertSettings'] = data
        
        current_user.preferences = preferences
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': preferences['alertSettings']
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@alerts_bp.route('', methods=['GET'])
@token_required
def get_alerts(current_user):
    """Get all alerts for the current user"""
    try:
        alerts = Alert.query.filter_by(user_id=current_user.id).order_by(Alert.timestamp.desc()).all()
        return jsonify({
            'success': True,
            'data': [alert.to_dict() for alert in alerts]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@alerts_bp.route('/<alert_id>/read', methods=['PUT'])
@token_required
def mark_alert_as_read(current_user, alert_id):
    """Mark a specific alert as read"""
    try:
        alert = Alert.query.filter_by(id=alert_id, user_id=current_user.id).first()
        if not alert:
            return jsonify({
                'success': False,
                'error': 'Alert not found'
            }), 404
        
        alert.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': alert.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@alerts_bp.route('/mark-all-read', methods=['PUT'])
@token_required
def mark_all_as_read(current_user):
    """Mark all unread alerts as read"""
    try:
        unread_alerts = Alert.query.filter_by(user_id=current_user.id, is_read=False).all()
        for alert in unread_alerts:
            alert.is_read = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Marked {len(unread_alerts)} alerts as read'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@alerts_bp.route('/<alert_id>', methods=['DELETE'])
@token_required
def delete_alert(current_user, alert_id):
    """Delete an alert"""
    try:
        alert = Alert.query.filter_by(id=alert_id, user_id=current_user.id).first()
        if not alert:
            return jsonify({
                'success': False,
                'error': 'Alert not found'
            }), 404
        
        db.session.delete(alert)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Alert deleted'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from app import db
from app.models.activity import ActivityLog
from app.utils.decorators import token_required

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('', methods=['GET'])
@token_required
def get_activity_logs(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 50, type=int)
        
        query = ActivityLog.query.filter_by(user_id=current_user.id).order_by(ActivityLog.timestamp.desc())
        paginated = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return jsonify({
            'success': True,
            'data': {
                'items': [log.to_dict() for log in paginated.items],
                'total': paginated.total,
                'page': page,
                'pageSize': page_size,
                'totalPages': paginated.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@activity_bp.route('', methods=['POST'])
@token_required
def create_activity_log(current_user):
    try:
        data = request.get_json()
        
        log = ActivityLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            activity_type=data['activityType'],
            duration_minutes=data['durationMinutes'],
            intensity=data['intensity'],
            timestamp=datetime.fromisoformat(data['timestamp']) if data.get('timestamp') else datetime.now(timezone.utc),
            notes=data.get('notes')
        )
        
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'success': True, 'data': log.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@activity_bp.route('/<log_id>', methods=['DELETE'])
@token_required
def delete_activity_log(current_user, log_id):
    try:
        log = ActivityLog.query.filter_by(id=log_id, user_id=current_user.id).first()
        if not log:
            return jsonify({'success': False, 'error': 'Log not found'}), 404
        
        db.session.delete(log)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
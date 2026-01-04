from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from app import db
from app.models.mood import MoodLog
from app.utils.decorators import token_required

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('', methods=['GET'])
@token_required
def get_mood_logs(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 50, type=int)
        
        query = MoodLog.query.filter_by(user_id=current_user.id).order_by(MoodLog.timestamp.desc())
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

@mood_bp.route('', methods=['POST'])
@token_required
def create_mood_log(current_user):
    try:
        data = request.get_json()
        
        log = MoodLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            mood_rating=data['moodRating'],
            emotions=data.get('emotions', []),
            timestamp=datetime.fromisoformat(data['timestamp']) if data.get('timestamp') else datetime.now(timezone.utc),
            notes=data.get('notes')
        )
        
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'success': True, 'data': log.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@mood_bp.route('/trends', methods=['GET'])
@token_required
def get_mood_trends(current_user):
    try:
        logs = MoodLog.query.filter_by(user_id=current_user.id).order_by(MoodLog.timestamp.asc()).all()
        
        if not logs:
            return jsonify({'success': True, 'data': {'average': 0, 'trend': 'stable'}}), 200
        
        avg_mood = sum(log.mood_rating for log in logs) / len(logs)
        
        # Simple trend
        mid = len(logs) // 2
        first_half = sum(log.mood_rating for log in logs[:mid]) / mid if mid > 0 else 0
        second_half = sum(log.mood_rating for log in logs[mid:]) / (len(logs) - mid) if len(logs) - mid > 0 else 0
        
        trend = 'improving' if second_half > first_half + 0.5 else 'declining' if second_half < first_half - 0.5 else 'stable'
        
        return jsonify({
            'success': True,
            'data': {
                'average': round(avg_mood, 1),
                'trend': trend
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
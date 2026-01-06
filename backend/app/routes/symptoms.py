from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, timedelta
import uuid
from app import db
from app.models.symptom import SymptomLog
from app.utils.decorators import token_required

symptoms_bp = Blueprint('symptoms', __name__)

@symptoms_bp.route('', methods=['GET'])
@token_required
def get_symptoms(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 50, type=int)
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        query = SymptomLog.query.filter_by(user_id=current_user.id)
        
        # Apply date filters if provided
        if start_date:
            # treat start_date as beginning of that day
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(SymptomLog.timestamp >= start_dt)
        if end_date:
            # treat end_date as inclusive of the full day by advancing to the next day
            end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)
            query = query.filter(SymptomLog.timestamp < end_dt)
        
        # Order by most recent first
        query = query.order_by(SymptomLog.timestamp.desc())
        
        # Paginate
        paginated = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return jsonify({
            'success': True,
            'data': {
                'items': [symptom.to_dict() for symptom in paginated.items],
                'total': paginated.total,
                'page': page,
                'pageSize': page_size,
                'totalPages': paginated.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@symptoms_bp.route('', methods=['POST'])
@token_required
def create_symptom(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('symptomName') or data.get('severity') is None:
            return jsonify({
                'success': False,
                'error': 'Symptom name and severity are required'
            }), 400
        
        # Create symptom log
        symptom = SymptomLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            symptom_name=data['symptomName'],
            severity=data['severity'],
            timestamp=datetime.fromisoformat(data['timestamp']) if data.get('timestamp') else datetime.now(timezone.utc),
            duration_minutes=data.get('durationMinutes'),
            notes=data.get('notes'),
            body_location=data.get('bodyLocation'),
            triggers=data.get('triggers', [])
        )
        
        db.session.add(symptom)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': symptom.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@symptoms_bp.route('/<symptom_id>', methods=['GET'])
@token_required
def get_symptom(current_user, symptom_id):
    try:
        symptom = SymptomLog.query.filter_by(id=symptom_id, user_id=current_user.id).first()
        
        if not symptom:
            return jsonify({
                'success': False,
                'error': 'Symptom not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': symptom.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@symptoms_bp.route('/<symptom_id>', methods=['PUT'])
@token_required
def update_symptom(current_user, symptom_id):
    try:
        symptom = SymptomLog.query.filter_by(id=symptom_id, user_id=current_user.id).first()
        
        if not symptom:
            return jsonify({
                'success': False,
                'error': 'Symptom not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields
        if 'symptomName' in data:
            symptom.symptom_name = data['symptomName']
        if 'severity' in data:
            symptom.severity = data['severity']
        if 'durationMinutes' in data:
            symptom.duration_minutes = data['durationMinutes']
        if 'notes' in data:
            symptom.notes = data['notes']
        if 'bodyLocation' in data:
            symptom.body_location = data['bodyLocation']
        if 'triggers' in data:
            symptom.triggers = data['triggers']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': symptom.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@symptoms_bp.route('/<symptom_id>', methods=['DELETE'])
@token_required
def delete_symptom(current_user, symptom_id):
    try:
        symptom = SymptomLog.query.filter_by(id=symptom_id, user_id=current_user.id).first()
        
        if not symptom:
            return jsonify({
                'success': False,
                'error': 'Symptom not found'
            }), 404
        
        db.session.delete(symptom)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Symptom deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@symptoms_bp.route('/stats', methods=['GET'])
@token_required
def get_symptom_stats(current_user):
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        query = SymptomLog.query.filter_by(user_id=current_user.id)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(SymptomLog.timestamp >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date) + timedelta(days=1)
            query = query.filter(SymptomLog.timestamp < end_dt)
        
        symptoms = query.all()
        
        if not symptoms:
            return jsonify({
                'success': True,
                'data': {
                    'totalLogs': 0,
                    'averageSeverity': 0,
                    'mostCommon': 'N/A',
                    'worstDay': 'N/A',
                    'trend': 'stable'
                }
            }), 200
        
        # Calculate stats
        total_logs = len(symptoms)
        avg_severity = sum(s.severity for s in symptoms) / total_logs
        
        # Most common symptom
        symptom_counts = {}
        for s in symptoms:
            symptom_counts[s.symptom_name] = symptom_counts.get(s.symptom_name, 0) + 1
        most_common = max(symptom_counts, key=symptom_counts.get)
        
        # Worst day (highest severity)
        worst_symptom = max(symptoms, key=lambda s: s.severity)
        worst_day = worst_symptom.timestamp.strftime('%Y-%m-%d')
        
        # Simple trend calculation (compare first half vs second half)
        mid_point = len(symptoms) // 2
        first_half_avg = sum(s.severity for s in symptoms[:mid_point]) / mid_point if mid_point > 0 else 0
        second_half_avg = sum(s.severity for s in symptoms[mid_point:]) / (len(symptoms) - mid_point) if len(symptoms) - mid_point > 0 else 0
        
        if second_half_avg < first_half_avg - 0.5:
            trend = 'improving'
        elif second_half_avg > first_half_avg + 0.5:
            trend = 'worsening'
        else:
            trend = 'stable'
        
        return jsonify({
            'success': True,
            'data': {
                'totalLogs': total_logs,
                'averageSeverity': round(avg_severity, 1),
                'mostCommon': most_common,
                'worstDay': worst_day,
                'trend': trend
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
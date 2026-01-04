from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from app import db
from app.models import SymptomLog, Medication, MedicationLog, FoodLog, ActivityLog, MoodLog
from app.utils.decorators import token_required

quick_log_bp = Blueprint('quick_log', __name__)

@quick_log_bp.route('', methods=['POST'])
@token_required
def quick_log(current_user):
    try:
        data = request.get_json()
        log_type = data.get('type')
        log_data = data.get('data')

        if not log_type or not log_data:
            return jsonify({
                'success': False,
                'error': 'Type and data are required'
            }), 400

        new_entry = None

        if log_type == 'symptom':
            if not log_data.get('symptomName') or log_data.get('severity') is None:
                return jsonify({'success': False, 'error': 'Symptom name and severity are required'}), 400
            
            new_entry = SymptomLog(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                symptom_name=log_data.get('symptomName'),
                severity=log_data.get('severity'),
                notes=log_data.get('notes'),
                body_location=log_data.get('bodyLocation'),
                duration_minutes=log_data.get('durationMinutes'),
                triggers=log_data.get('triggers', []),
                timestamp=datetime.now(timezone.utc)
            )

        elif log_type == 'medication':
            medication_id = log_data.get('medicationId')
            if not medication_id:
                return jsonify({'success': False, 'error': 'Medication ID is required'}), 400
            
            medication = Medication.query.filter_by(id=medication_id, user_id=current_user.id).first()
            if not medication:
                return jsonify({'success': False, 'error': 'Medication not found'}), 404

            new_entry = MedicationLog(
                id=str(uuid.uuid4()),
                medication_id=medication_id,
                user_id=current_user.id,
                status=log_data.get('status', 'taken'),
                notes=log_data.get('notes'),
                timestamp=datetime.now(timezone.utc)
            )

        elif log_type == 'food':
            if not log_data.get('foodName') or not log_data.get('mealType'):
                return jsonify({'success': False, 'error': 'Food name and meal type are required'}), 400
            
            new_entry = FoodLog(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                food_name=log_data.get('foodName'),
                meal_type=log_data.get('mealType'),
                portion_size=log_data.get('portionSize'),
                notes=log_data.get('notes'),
                timestamp=datetime.now(timezone.utc)
            )

        elif log_type == 'activity':
            if not log_data.get('activityType') or log_data.get('durationMinutes') is None:
                return jsonify({'success': False, 'error': 'Activity type and duration are required'}), 400
            
            new_entry = ActivityLog(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                activity_type=log_data.get('activityType'),
                duration_minutes=log_data.get('durationMinutes'),
                intensity=log_data.get('intensity', 5),
                notes=log_data.get('notes'),
                timestamp=datetime.now(timezone.utc)
            )

        elif log_type == 'mood':
            if log_data.get('moodRating') is None:
                return jsonify({'success': False, 'error': 'Mood rating is required'}), 400
            
            new_entry = MoodLog(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                mood_rating=log_data.get('moodRating'),
                emotions=log_data.get('emotions', []),
                notes=log_data.get('notes'),
                timestamp=datetime.now(timezone.utc)
            )
        else:
            return jsonify({'success': False, 'error': f'Invalid log type: {log_type}'}), 400

        if new_entry:
            db.session.add(new_entry)
            db.session.commit()
            return jsonify({
                'success': True,
                'message': f'{log_type.capitalize()} logged successfully',
                'data': new_entry.to_dict()
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

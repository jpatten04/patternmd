# backend/app/routes/medications.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone, date
import uuid
from app import db
from app.models.medication import Medication, MedicationLog
from app.models.alert import Alert
from app.utils.decorators import token_required
from sqlalchemy import func

medications_bp = Blueprint('medications', __name__)

def check_for_missed_doses(user):
    """Simple check for missed doses for 'once daily' medications"""
    try:
        # Respect user settings
        alert_settings = user.preferences.get('alertSettings', {})
        if not alert_settings.get('missedDoseAlerts', True):
            return

        today = date.today()
        # Find active medications that are 'once daily'
        active_meds = Medication.query.filter_by(user_id=user.id, active=True).all()
        
        for med in active_meds:
            if 'daily' in med.frequency.lower():
                # Check if there is a log for today
                start_of_today = datetime.combine(today, datetime.min.time())
                log_exists = MedicationLog.query.filter(
                    MedicationLog.medication_id == med.id,
                    MedicationLog.timestamp >= start_of_today
                ).first()
                
                if not log_exists and datetime.now().hour >= 12: # If past noon and no log
                    # Check if an alert already exists for today
                    existing_alert = Alert.query.filter(
                        Alert.user_id == user.id,
                        Alert.alert_type == 'medication',
                        Alert.message.like(f"%{med.name}%"),
                        Alert.timestamp >= start_of_today
                    ).first()
                    
                    if not existing_alert:
                        new_alert = Alert(
                            id=str(uuid.uuid4()),
                            user_id=user.id,
                            alert_type='medication',
                            message=f"Missed dose reminder: Have you taken your {med.name} today?",
                            severity='medium',
                            timestamp=datetime.now(timezone.utc),
                            is_read=False
                        )
                        db.session.add(new_alert)
        
        db.session.commit()
    except Exception as e:
        print(f"Error checking missed doses: {e}")
        db.session.rollback()

@medications_bp.route('', methods=['GET'])
@token_required
def get_medications(current_user):
    """Get all medications for the current user"""
    try:
        # Trigger reminder check
        check_for_missed_doses(current_user)
        
        # Query medications
        medications = Medication.query.filter_by(user_id=current_user.id).order_by(Medication.start_date.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [med.to_dict() for med in medications]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/<medication_id>', methods=['GET'])
@token_required
def get_medication(current_user, medication_id):
    """Get a specific medication"""
    try:
        medication = Medication.query.filter_by(
            id=medication_id,
            user_id=current_user.id
        ).first()
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': medication.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('', methods=['POST'])
@token_required
def create_medication(current_user):
    """Create a new medication"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'dosage', 'frequency', 'startDate']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'{field} is required'
                }), 400
        
        # Parse start date
        try:
            start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00')).date()
        except (ValueError, AttributeError):
            return jsonify({
                'success': False,
                'error': 'Invalid startDate format. Use ISO format (YYYY-MM-DD)'
            }), 400
        
        # Parse end date if provided
        end_date = None
        if data.get('endDate'):
            try:
                end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00')).date()
            except (ValueError, AttributeError):
                return jsonify({
                    'success': False,
                    'error': 'Invalid endDate format. Use ISO format (YYYY-MM-DD)'
                }), 400
        
        # Create medication
        medication = Medication(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            name=data['name'],
            dosage=data['dosage'],
            frequency=data['frequency'],
            start_date=start_date,
            end_date=end_date,
            active=data.get('active', True),
            purpose=data.get('purpose'),
            side_effects=data.get('sideEffects')
        )
        
        db.session.add(medication)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': medication.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/<medication_id>', methods=['PUT'])
@token_required
def update_medication(current_user, medication_id):
    """Update a medication"""
    try:
        medication = Medication.query.filter_by(
            id=medication_id,
            user_id=current_user.id
        ).first()
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            medication.name = data['name']
        if 'dosage' in data:
            medication.dosage = data['dosage']
        if 'frequency' in data:
            medication.frequency = data['frequency']
        if 'startDate' in data:
            try:
                medication.start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00')).date()
            except (ValueError, AttributeError):
                return jsonify({
                    'success': False,
                    'error': 'Invalid startDate format'
                }), 400
        if 'endDate' in data:
            if data['endDate']:
                try:
                    medication.end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00')).date()
                except (ValueError, AttributeError):
                    return jsonify({
                        'success': False,
                        'error': 'Invalid endDate format'
                    }), 400
            else:
                medication.end_date = None
        if 'active' in data:
            medication.active = data['active']
        if 'purpose' in data:
            medication.purpose = data['purpose']
        if 'sideEffects' in data:
            medication.side_effects = data['sideEffects']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': medication.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/<medication_id>', methods=['DELETE'])
@token_required
def delete_medication(current_user, medication_id):
    """Delete a medication"""
    try:
        medication = Medication.query.filter_by(
            id=medication_id,
            user_id=current_user.id
        ).first()
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        # Delete related alerts
        Alert.query.filter(
            Alert.user_id == current_user.id,
            Alert.alert_type == 'medication',
            Alert.message.like(f"%{medication.name}%")
        ).delete(synchronize_session=False)

        db.session.delete(medication)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Medication deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/<medication_id>/log', methods=['POST'])
@token_required
def log_dose(current_user, medication_id):
    """Log a medication dose (taken or missed)"""
    try:
        # Verify medication exists and belongs to user
        medication = Medication.query.filter_by(
            id=medication_id,
            user_id=current_user.id
        ).first()
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        data = request.get_json()
        
        # Validate required fields
        if 'taken' not in data:
            return jsonify({
                'success': False,
                'error': 'taken field is required (true/false)'
            }), 400
        
        # Parse timestamp if provided, otherwise use now
        timestamp = datetime.now(timezone.utc)
        if data.get('timestamp'):
            try:
                timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return jsonify({
                    'success': False,
                    'error': 'Invalid timestamp format'
                }), 400
        
        # Create medication log
        med_log = MedicationLog(
            id=str(uuid.uuid4()),
            medication_id=medication_id,
            user_id=current_user.id,
            timestamp=timestamp,
            taken=data['taken'],
            notes=data.get('notes')
        )
        
        db.session.add(med_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': med_log.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/adherence', methods=['GET'])
@token_required
def get_adherence(current_user):
    """Get medication adherence statistics"""
    try:
        medication_id = request.args.get('medicationId')
        
        if medication_id:
            # Get adherence for specific medication
            medications = [Medication.query.filter_by(
                id=medication_id,
                user_id=current_user.id
            ).first()]
            
            if not medications[0]:
                return jsonify({
                    'success': False,
                    'error': 'Medication not found'
                }), 404
        else:
            # Get adherence for all active medications
            medications = Medication.query.filter_by(
                user_id=current_user.id,
                active=True
            ).all()
        
        adherence_data = []
        
        for medication in medications:
            # Count total logs and taken logs
            total_logs = MedicationLog.query.filter_by(
                medication_id=medication.id
            ).count()
            
            taken_logs = MedicationLog.query.filter_by(
                medication_id=medication.id,
                taken=True
            ).count()
            
            # Calculate adherence rate
            adherence_rate = 0
            if total_logs > 0:
                adherence_rate = round((taken_logs / total_logs) * 100, 1)
            
            adherence_data.append({
                'medicationId': medication.id,
                'medicationName': medication.name,
                'adherenceRate': adherence_rate,
                'missedDoses': total_logs - taken_logs,
                'totalDoses': total_logs
            })
        
        return jsonify({
            'success': True,
            'data': adherence_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/logs', methods=['GET'])
@token_required
def get_all_medication_logs(current_user):
    """Get all medication logs for the current user"""
    try:
        logs = MedicationLog.query.filter_by(
            user_id=current_user.id
        ).order_by(MedicationLog.timestamp.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [log.to_dict() for log in logs]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@medications_bp.route('/<medication_id>/logs', methods=['GET'])
@token_required
def get_medication_logs(current_user, medication_id):
    """Get all logs for a specific medication"""
    try:
        # Verify medication exists and belongs to user
        medication = Medication.query.filter_by(
            id=medication_id,
            user_id=current_user.id
        ).first()
        
        if not medication:
            return jsonify({
                'success': False,
                'error': 'Medication not found'
            }), 404
        
        # Get logs
        logs = MedicationLog.query.filter_by(
            medication_id=medication_id
        ).order_by(MedicationLog.timestamp.desc()).all()
        
        return jsonify({
            'success': True,
            'data': [log.to_dict() for log in logs]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
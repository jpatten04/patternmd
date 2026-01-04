from datetime import datetime
from app import db

class SymptomLog(db.Model):
    __tablename__ = 'symptom_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    symptom_name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Integer, nullable=False)  # 1-10
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    duration_minutes = db.Column(db.Integer)
    notes = db.Column(db.Text)
    body_location = db.Column(db.String(100))
    triggers = db.Column(db.JSON, default=[])  # Array of trigger strings
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'symptomName': self.symptom_name,
            'severity': self.severity,
            'timestamp': self.timestamp.isoformat(),
            'durationMinutes': self.duration_minutes,
            'notes': self.notes,
            'bodyLocation': self.body_location,
            'triggers': self.triggers or []
        }
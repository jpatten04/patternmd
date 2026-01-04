from datetime import datetime
from app import db

class Medication(db.Model):
    __tablename__ = 'medications'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    active = db.Column(db.Boolean, default=True)
    purpose = db.Column(db.Text)
    side_effects = db.Column(db.Text)
    
    # Relationship
    logs = db.relationship('MedicationLog', backref='medication', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'startDate': self.start_date.isoformat(),
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'active': self.active,
            'purpose': self.purpose,
            'sideEffects': self.side_effects
        }

class MedicationLog(db.Model):
    __tablename__ = 'medication_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    medication_id = db.Column(db.String(36), db.ForeignKey('medications.id'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    taken = db.Column(db.Boolean, nullable=False)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'medicationId': self.medication_id,
            'userId': self.user_id,
            'timestamp': self.timestamp.isoformat(),
            'taken': self.taken,
            'notes': self.notes
        }
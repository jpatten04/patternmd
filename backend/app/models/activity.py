from datetime import datetime
from app import db

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    activity_type = db.Column(db.String(100), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    intensity = db.Column(db.Integer, nullable=False)  # 1-10
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'activityType': self.activity_type,
            'durationMinutes': self.duration_minutes,
            'intensity': self.intensity,
            'timestamp': self.timestamp.isoformat(),
            'notes': self.notes
        }
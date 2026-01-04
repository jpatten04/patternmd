from datetime import datetime
from app import db

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    alert_type = db.Column(db.String(50), nullable=False)  # prediction, pattern, medication, environment
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_read = db.Column(db.Boolean, default=False)
    related_pattern_id = db.Column(db.String(36), db.ForeignKey('patterns.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'alertType': self.alert_type,
            'message': self.message,
            'severity': self.severity,
            'timestamp': self.timestamp.isoformat(),
            'isRead': self.is_read,
            'relatedPatternId': self.related_pattern_id
        }
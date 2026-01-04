from datetime import datetime
from app import db

class Pattern(db.Model):
    __tablename__ = 'patterns'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    pattern_type = db.Column(db.String(50), nullable=False)  # correlation, trigger, trend, prediction
    description = db.Column(db.Text, nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)  # 0-1
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow)
    variables = db.Column(db.JSON, default={})
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'patternType': self.pattern_type,
            'description': self.description,
            'confidenceScore': self.confidence_score,
            'discoveredAt': self.discovered_at.isoformat(),
            'variables': self.variables or {},
            'isActive': self.is_active
        }
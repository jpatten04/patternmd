from datetime import datetime
from app import db

class MoodLog(db.Model):
    __tablename__ = 'mood_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    mood_rating = db.Column(db.Integer, nullable=False)  # 1-10
    emotions = db.Column(db.JSON, default=[])  # Array of emotion strings
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'moodRating': self.mood_rating,
            'emotions': self.emotions or [],
            'timestamp': self.timestamp.isoformat(),
            'notes': self.notes
        }
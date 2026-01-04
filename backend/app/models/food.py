from datetime import datetime
from app import db

class FoodLog(db.Model):
    __tablename__ = 'food_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    food_name = db.Column(db.String(200), nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)  # breakfast, lunch, dinner, snack
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    portion_size = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'foodName': self.food_name,
            'mealType': self.meal_type,
            'timestamp': self.timestamp.isoformat(),
            'portionSize': self.portion_size,
            'notes': self.notes
        }
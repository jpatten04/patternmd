from datetime import datetime
from app import db

class EnvironmentLog(db.Model):
    __tablename__ = 'environment_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    pressure = db.Column(db.Float, nullable=False)
    air_quality_index = db.Column(db.Integer)
    pollen_count = db.Column(db.Integer)
    weather_condition = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'timestamp': self.timestamp.isoformat(),
            'temperature': self.temperature,
            'humidity': self.humidity,
            'pressure': self.pressure,
            'airQualityIndex': self.air_quality_index,
            'pollenCount': self.pollen_count,
            'weatherCondition': self.weather_condition,
            'location': self.location
        }
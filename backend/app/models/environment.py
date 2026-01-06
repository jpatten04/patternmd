from datetime import datetime
from app import db

class EnvironmentLog(db.Model):
    __tablename__ = 'environment_logs'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    temperature = db.Column(db.Float, nullable=False)
    feels_like = db.Column(db.Float)
    humidity = db.Column(db.Float, nullable=False)
    pressure = db.Column(db.Float, nullable=False)
    wind_speed = db.Column(db.Float)
    visibility = db.Column(db.Float)
    pm2_5 = db.Column(db.Float)
    pm10 = db.Column(db.Float)
    air_quality_index = db.Column(db.Integer)
    uv_index = db.Column(db.Float)
    clouds = db.Column(db.Integer)
    pollen_count = db.Column(db.Integer)
    weather_condition = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'timestamp': self.timestamp.isoformat(),
            'temperature': self.temperature,
            'feelsLike': self.feels_like,
            'humidity': self.humidity,
            'pressure': self.pressure,
            'windSpeed': self.wind_speed,
            'visibility': self.visibility,
            'pm2_5': self.pm2_5,
            'pm10': self.pm10,
            'airQualityIndex': self.air_quality_index,
            'uvIndex': self.uv_index,
            'clouds': self.clouds,
            'pollenCount': self.pollen_count,
            'weatherCondition': self.weather_condition,
            'location': self.location
        }
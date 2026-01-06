from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    home_location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    preferences = db.Column(db.JSON, default={})

    # Relationships
    symptoms = db.relationship('SymptomLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    medications = db.relationship('Medication', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    food_logs = db.relationship('FoodLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    activity_logs = db.relationship('ActivityLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    mood_logs = db.relationship('MoodLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    environment_logs = db.relationship('EnvironmentLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    patterns = db.relationship('Pattern', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    reports = db.relationship('Report', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'homeLocation': self.home_location,
            'createdAt': self.created_at.isoformat(),
            'preferences': self.preferences
        }
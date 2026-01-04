import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "postgresql+psycopg://localhost/patternmd"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours
    
    # API Keys (all free)
    OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY')
    AIR_QUALITY_API_KEY = os.environ.get('AIR_QUALITY_API_KEY')
    HUGGINGFACE_TOKEN = os.environ.get('HUGGINGFACE_TOKEN')
    GOOGLE_GEMINI_KEY = os.environ.get('GOOGLE_GEMINI_KEY')
    
    # Celery
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL') or 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND') or 'redis://localhost:6379/0'
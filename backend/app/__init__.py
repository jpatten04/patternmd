from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extension
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Register blueprints
    from app.routes import auth_bp, symptoms_bp, medications_bp, food_bp, activity_bp, mood_bp, quick_log_bp, alerts_bp, environment_bp, users_bp, analysis_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(symptoms_bp, url_prefix='/api/symptoms')
    app.register_blueprint(medications_bp, url_prefix='/api/medications')
    app.register_blueprint(food_bp, url_prefix='/api/food')
    app.register_blueprint(activity_bp, url_prefix='/api/activity')
    app.register_blueprint(mood_bp, url_prefix='/api/mood')
    app.register_blueprint(quick_log_bp, url_prefix='/api/quick-log')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(environment_bp, url_prefix='/api/environment')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

    return app
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from app import db
from app.models.environment import EnvironmentLog
from app.utils.decorators import token_required
from app.utils.weather import fetch_weather_data, search_cities

environment_bp = Blueprint('environment', __name__)

@environment_bp.route('', methods=['GET'])
@token_required
def get_environment_logs(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 50, type=int)
        
        query = EnvironmentLog.query.filter_by(user_id=current_user.id).order_by(EnvironmentLog.timestamp.desc())
        paginated = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return jsonify({
            'success': True,
            'data': {
                'items': [log.to_dict() for log in paginated.items],
                'total': paginated.total,
                'page': page,
                'pageSize': page_size,
                'totalPages': paginated.pages
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@environment_bp.route('', methods=['POST'])
@token_required
def create_environment_log(current_user):
    try:
        data = request.get_json()
        
        log = EnvironmentLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            temperature=data['temperature'],
            feels_like=data.get('feelsLike'),
            humidity=data['humidity'],
            pressure=data['pressure'],
            wind_speed=data.get('windSpeed'),
            visibility=data.get('visibility'),
            pm2_5=data.get('pm2_5'),
            pm10=data.get('pm10'),
            air_quality_index=data.get('airQualityIndex'),
            uv_index=data.get('uvIndex'),
            clouds=data.get('clouds'),
            pollen_count=data.get('pollenCount'),
            weather_condition=data['weatherCondition'],
            location=data['location'],
            timestamp=datetime.fromisoformat(data['timestamp']) if data.get('timestamp') else datetime.now(timezone.utc)
        )
        
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'success': True, 'data': log.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@environment_bp.route('/location', methods=['POST'])
@token_required
def update_home_location(current_user):
    try:
        data = request.get_json()
        location = data.get('location')
        
        if not location:
            return jsonify({'success': False, 'error': 'Location is required'}), 400
            
        current_user.home_location = location
        db.session.commit()
        
        return jsonify({'success': True, 'data': current_user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@environment_bp.route('/auto-fetch', methods=['POST'])
@token_required
def auto_fetch_environment(current_user):
    try:
        # Check for recent auto-logs to save API calls (1 hour cooldown)
        last_log = EnvironmentLog.query.filter_by(user_id=current_user.id)\
            .order_by(EnvironmentLog.timestamp.desc()).first()
            
        if last_log:
            time_diff = datetime.now(timezone.utc) - last_log.timestamp.replace(tzinfo=timezone.utc)
            if time_diff.total_seconds() < 3600: # 1 hour
                return jsonify({
                    'success': True, 
                    'data': last_log.to_dict(),
                    'message': 'Data is already up to date (refreshed within the last hour)'
                }), 200

        location = current_user.home_location
        if not location:
            return jsonify({'success': False, 'error': 'Home location not set. Please set it in settings.'}), 400
            
        weather_data, error = fetch_weather_data(location)
        if error:
            return jsonify({'success': False, 'error': error}), 400
            
        log = EnvironmentLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            temperature=weather_data['temperature'],
            feels_like=weather_data.get('feels_like'),
            humidity=weather_data['humidity'],
            pressure=weather_data['pressure'],
            wind_speed=weather_data.get('wind_speed'),
            visibility=weather_data.get('visibility_mi'),
            pm2_5=weather_data.get('pm2_5'),
            pm10=weather_data.get('pm10'),
            air_quality_index=weather_data['air_quality_index'],
            uv_index=weather_data.get('uv_index'),
            clouds=weather_data.get('clouds'),
            weather_condition=weather_data['weather_condition'],
            location=weather_data['location'],
            timestamp=datetime.now(timezone.utc)
        )
        
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'success': True, 'data': log.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@environment_bp.route('/search-location', methods=['GET'])
@token_required
def search_location(current_user):
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({'success': True, 'data': []}), 200
            
        results, error = search_cities(query)
        if error:
            return jsonify({'success': False, 'error': error}), 400
            
        return jsonify({'success': True, 'data': results}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

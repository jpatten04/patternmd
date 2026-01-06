import requests
from flask import current_app

def fetch_weather_data(location_name):
    """
    Fetches weather and air quality data for a given location using OpenWeatherMap API.
    """
    api_key = current_app.config.get('OPENWEATHER_API_KEY')
    if not api_key:
        return None, "OpenWeatherMap API key not configured"

    try:
        # 1. Geocoding to get lat/lon
        query = location_name.strip()
        geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=1&appid={api_key}"
        geo_resp = requests.get(geo_url, timeout=10)
        
        if geo_resp.status_code != 200:
            return None, f"Geocoding API error: {geo_resp.status_code} - {geo_resp.text}"
            
        geo_data = geo_resp.json()

        if not geo_data:
            return None, f"Location '{location_name}' not found"

        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        
        # Build a more descriptive name for display
        name = geo_data[0]['name']
        state = geo_data[0].get('state', '')
        country = geo_data[0]['country']
        actual_name = f"{name}, {state}, {country}".replace(', ,', ',').strip(', ')

        # 2. Current Weather
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=imperial&appid={api_key}"
        weather_resp = requests.get(weather_url, timeout=10)
        if weather_resp.status_code != 200:
            return None, f"Weather API error: {weather_resp.status_code} - {weather_resp.text}"
        weather_data = weather_resp.json()

        # 3. Air Pollution & UV (UV is in One Call, but if we don't have One Call 3.0, we can use the UVI API)
        aqi_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"
        aqi_resp = requests.get(aqi_url, timeout=10)
        
        # 4. UV Index
        uvi_url = f"https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={api_key}"
        uvi_resp = requests.get(uvi_url, timeout=10)
        uv_index = None
        if uvi_resp.status_code == 200:
            uv_index = uvi_resp.json().get('value')

        if aqi_resp.status_code != 200:
            return None, f"AQI API error: {aqi_resp.status_code} - {aqi_resp.text}"
        aqi_data = aqi_resp.json()

        # OpenWeather returned units: temp in °F (because units=imperial), pressure in hPa, visibility in meters
        pressure_hpa = float(weather_data['main']['pressure'])
        # convert hPa to inHg for US-friendly unit
        pressure_inhg = round(pressure_hpa * 0.029529983071445, 2)

        wind_speed = None
        if 'wind' in weather_data and 'speed' in weather_data['wind']:
            # with units=imperial, wind speed should be in miles/hour
            wind_speed = round(float(weather_data['wind']['speed']), 2)

        visibility_mi = None
        if 'visibility' in weather_data:
            # OpenWeather visibility is in meters
            visibility_mi = round(float(weather_data['visibility']) / 1609.344, 2)

        # Extract components from AQI response if available
        components = aqi_data['list'][0].get('components', {}) if aqi_data.get('list') else {}

        result = {
            'temperature': round(float(weather_data['main']['temp']), 2),  # °F
            'feels_like': round(float(weather_data['main'].get('feels_like', weather_data['main']['temp'])), 2),
            'humidity': round(float(weather_data['main']['humidity']), 2),
            'pressure': pressure_inhg,  # inHg
            'weather_condition': weather_data['weather'][0]['main'],
            'air_quality_index': aqi_data['list'][0]['main']['aqi'],
            'uv_index': uv_index,
            'pm2_5': round(float(components.get('pm2_5', 0)), 2) if components else None,
            'pm10': round(float(components.get('pm10', 0)), 2) if components else None,
            'wind_speed': wind_speed,  # mph
            'visibility_mi': visibility_mi,
            'clouds': weather_data.get('clouds', {}).get('all', 0),
            'location': actual_name,
            'pollen_count': None
        }

        return result, None

    except requests.exceptions.RequestException as e:
        return None, f"API Request failed: {str(e)}"
    except (KeyError, IndexError) as e:
        return None, f"Data parsing failed: {str(e)}"

def search_cities(query):
    """
    Searches for cities using OpenWeatherMap Geocoding API.
    """
    api_key = current_app.config.get('OPENWEATHER_API_KEY')
    if not api_key:
        return [], "OpenWeatherMap API key not configured"

    try:
        url = f"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={api_key}"
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return [], f"Search API error: {resp.status_code} - {resp.text}"
        data = resp.json()

        results = []
        for item in data:
            name = item['name']
            state = item.get('state', '')
            country = item['country']
            display_name = f"{name}, {state}, {country}".replace(', ,', ',').strip(', ')
            results.append({
                'name': name,
                'state': state,
                'country': country,
                'display_name': display_name,
                'lat': item['lat'],
                'lon': item['lon']
            })

        return results, None
    except Exception as e:
        return [], str(e)

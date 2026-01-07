import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.models.symptom import SymptomLog
from app.models.food import FoodLog
from app.models.activity import ActivityLog
from app.models.mood import MoodLog
from app.models.environment import EnvironmentLog
from app.models.medication import MedicationLog, Medication

def get_user_data_df(user_id):
    """Fetch all user logs and convert to DataFrames"""
    symptoms = SymptomLog.query.filter_by(user_id=user_id).all()
    foods = FoodLog.query.filter_by(user_id=user_id).all()
    activities = ActivityLog.query.filter_by(user_id=user_id).all()
    moods = MoodLog.query.filter_by(user_id=user_id).all()
    env = EnvironmentLog.query.filter_by(user_id=user_id).all()
    med_logs = MedicationLog.query.filter_by(user_id=user_id).all()

    # Convert to list of dicts for pandas
    s_df = pd.DataFrame([s.to_dict() for s in symptoms])
    f_df = pd.DataFrame([f.to_dict() for f in foods])
    a_df = pd.DataFrame([a.to_dict() for a in activities])
    m_df = pd.DataFrame([m.to_dict() for m in moods])
    e_df = pd.DataFrame([e.to_dict() for e in env])
    ml_df = pd.DataFrame([ml.to_dict() for ml in med_logs])

    # Convert timestamps to datetime objects
    for df in [s_df, f_df, a_df, m_df, e_df, ml_df]:
        if not df.empty:
            df['timestamp'] = pd.to_datetime(df['timestamp'])

    return {
        'symptoms': s_df,
        'foods': f_df,
        'activities': a_df,
        'moods': m_df,
        'environment': e_df,
        'medication_logs': ml_df
    }

def analyze_correlations(user_id):
    """Find correlations between symptoms and other factors"""
    dfs = get_user_data_df(user_id)
    s_df = dfs['symptoms']
    
    if s_df.empty:
        return []

    results = []

    # 1. Analyze correlations with Mood
    m_df = dfs['moods']
    if not m_df.empty:
        # Merge on date
        s_daily = s_df.set_index('timestamp').resample('D')['severity'].mean().reset_index()
        m_daily = m_df.set_index('timestamp').resample('D')['moodRating'].mean().reset_index()
        merged = pd.merge(s_daily, m_daily, on='timestamp', how='inner')
        if len(merged) > 3:
            corr = merged['severity'].corr(merged['moodRating'])
            if abs(corr) > 0.3:
                results.append({
                    'type': 'correlation',
                    'factor': 'Mood',
                    'score': round(corr, 2),
                    'description': f"There is a {'strong' if abs(corr) > 0.6 else 'moderate'} {'negative' if corr < 0 else 'positive'} correlation ({round(corr, 2)}) between your mood and symptom severity."
                })

    # 2. Analyze correlations with Environment (Temp, Humidity, AQI)
    e_df = dfs['environment']
    if not e_df.empty:
        s_daily = s_df.set_index('timestamp').resample('D')['severity'].mean().reset_index()
        e_daily = e_df.set_index('timestamp').resample('D')[['temperature', 'humidity', 'airQualityIndex']].mean().reset_index()
        merged = pd.merge(s_daily, e_daily, on='timestamp', how='inner')
        
        for col in ['temperature', 'humidity', 'airQualityIndex']:
            if len(merged) > 3:
                corr = merged['severity'].corr(merged[col])
                if abs(corr) > 0.4:
                    results.append({
                        'type': 'correlation',
                        'factor': f'Environment ({col})',
                        'score': round(corr, 2),
                        'description': f"Symptom severity shows a correlation of {round(corr, 2)} with {col}."
                    })

    # 3. Trigger Analysis (Specific items preceding symptoms)
    # Check if certain foods often precede high severity symptoms (within 6 hours)
    f_df = dfs['foods']
    if not f_df.empty:
        triggers = {}
        high_severity = s_df[s_df['severity'] >= 7]
        for _, sym in high_severity.iterrows():
            window_start = sym['timestamp'] - timedelta(hours=6)
            recent_foods = f_df[(f_df['timestamp'] >= window_start) & (f_df['timestamp'] <= sym['timestamp'])]
            for _, food in recent_foods.iterrows():
                name = food['foodName']
                triggers[name] = triggers.get(name, 0) + 1
        
        # Filter for foods that appeared multiple times
        significant_triggers = {k: v for k, v in triggers.items() if v >= 2}
        for food, count in significant_triggers.items():
            results.append({
                'type': 'trigger',
                'factor': 'Food',
                'item': food,
                'count': count,
                'description': f"'{food}' was consumed within 6 hours of high-severity symptoms {count} times."
            })

    return results

def get_summary_data(user_id):
    """Aggregate all user data into a clean text summary for the AI model"""
    dfs = get_user_data_df(user_id)
    
    summary = "User Health Data Summary:\n\n"
    
    if not dfs['symptoms'].empty:
        summary += "Symptoms:\n"
        for _, row in dfs['symptoms'].tail(10).iterrows():
            summary += f"- {row['timestamp'].strftime('%Y-%m-%d %H:%M')}: {row['symptomName']} (Severity: {row['severity']})\n"
    
    if not dfs['foods'].empty:
        summary += "\nRecent Food:\n"
        for _, row in dfs['foods'].tail(10).iterrows():
            summary += f"- {row['timestamp'].strftime('%Y-%m-%d %H:%M')}: {row['foodName']} ({row['mealType']})\n"

    if not dfs['activities'].empty:
        summary += "\nRecent Activity:\n"
        for _, row in dfs['activities'].tail(10).iterrows():
            summary += f"- {row['timestamp'].strftime('%Y-%m-%d %H:%M')}: {row['activityType']} ({row['durationMinutes']} mins, Intensity: {row['intensity']})\n"

    if not dfs['moods'].empty:
        summary += "\nRecent Mood:\n"
        for _, row in dfs['moods'].tail(10).iterrows():
            summary += f"- {row['timestamp'].strftime('%Y-%m-%d %H:%M')}: Rating {row['moodRating']}\n"

    return summary

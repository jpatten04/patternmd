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

    # Create DataFrames directly from objects to preserve types (especially timestamps)
    s_df = pd.DataFrame([{
        'severity': s.severity, 
        'timestamp': s.timestamp, 
        'symptomName': s.symptom_name
    } for s in symptoms])
    
    f_df = pd.DataFrame([{
        'foodName': f.food_name, 
        'timestamp': f.timestamp, 
        'mealType': f.meal_type
    } for f in foods])
    
    a_df = pd.DataFrame([{
        'activityType': a.activity_type, 
        'timestamp': a.timestamp, 
        'durationMinutes': a.duration_minutes, 
        'intensity': a.intensity
    } for a in activities])
    
    m_df = pd.DataFrame([{
        'moodRating': m.mood_rating, 
        'timestamp': m.timestamp
    } for m in moods])
    
    e_df = pd.DataFrame([{
        'temperature': e.temperature, 
        'humidity': e.humidity, 
        'airQualityIndex': e.air_quality_index, 
        'timestamp': e.timestamp
    } for e in env])
    
    ml_df = pd.DataFrame([{
        'timestamp': ml.timestamp, 
        'taken': ml.taken,
        'medication_id': ml.medication_id
    } for ml in med_logs])

    # Ensure timestamp column exists even in empty DFs
    for df in [s_df, f_df, a_df, m_df, e_df, ml_df]:
        if df.empty:
            df['timestamp'] = pd.Series(dtype='datetime64[ns]')
        else:
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
    
    if s_df.empty or len(s_df) < 3: # Lowered from 5 to 3
        return []

    results = []
    
    # Prep daily symptom average
    s_daily = s_df.set_index('timestamp').resample('D')['severity'].mean().reset_index()

    # 1. Analyze correlations with Mood
    m_df = dfs['moods']
    if not m_df.empty:
        m_daily = m_df.set_index('timestamp').resample('D')['moodRating'].mean().reset_index()
        merged = pd.merge(s_daily, m_daily, on='timestamp', how='inner').dropna()
        
        if len(merged) >= 3: # Lowered from 5
            corr = merged['severity'].corr(merged['moodRating'])
            if abs(corr) > 0.3: # Lowered from 0.4
                direction = "lower" if corr < 0 else "higher"
                results.append({
                    'type': 'correlation',
                    'factor': 'Mood',
                    'score': round(corr, 2),
                    'description': f"Data suggests your symptoms are often {direction} when your mood rating is higher. (Correlation: {round(corr, 2)})"
                })

    # 2. Environment Impact & Delayed Effects
    e_df = dfs['environment']
    if not e_df.empty:
        e_daily = e_df.set_index('timestamp').resample('D')[['temperature', 'humidity', 'airQualityIndex']].mean().reset_index()
        merged = pd.merge(s_daily, e_daily, on='timestamp', how='inner').dropna()
        
        if len(merged) >= 3: # Lowered from 5
            for col in ['humidity', 'airQualityIndex']:
                corr = merged['severity'].corr(merged[col])
                if abs(corr) > 0.3: # Lowered from 0.5
                    impact = "aggravate" if corr > 0 else "improve"
                    results.append({
                        'type': 'correlation',
                        'factor': f'Environment ({col})',
                        'score': round(corr, 2),
                        'description': f"Increases in {col} tend to {impact} your symptoms. Consider monitoring this factor more closely."
                    })
        
        # Check for 24-hour delayed effect (e.g. yesterday's weather affects today's symptoms)
        e_delayed = e_daily.copy()
        e_delayed['timestamp'] = e_delayed['timestamp'] + timedelta(days=1)
        merged_delayed = pd.merge(s_daily, e_delayed, on='timestamp', how='inner').dropna()
        if len(merged_delayed) >= 3: # Lowered from 5
             for col in ['temperature', 'humidity']:
                corr = merged_delayed['severity'].corr(merged_delayed[col])
                if abs(corr) > 0.3: # Lowered from 0.5
                    results.append({
                        'type': 'correlation',
                        'factor': f'Delayed Environment ({col})',
                        'score': round(corr, 2),
                        'description': f"There is a delayed link: {col} levels from the *previous day* correlate with your symptoms today."
                    })

    # 3. Trigger Analysis (Specific items preceding symptoms)
    f_df = dfs['foods']
    if not f_df.empty:
        triggers = {}
        high_severity = s_df[s_df['severity'] >= 6] # Lowered from 7
        for _, sym in high_severity.iterrows():
            window_start = sym['timestamp'] - timedelta(hours=12)
            recent_foods = f_df[(f_df['timestamp'] >= window_start) & (f_df['timestamp'] <= sym['timestamp'])]
            for _, food in recent_foods.iterrows():
                name = food['foodName']
                triggers[name] = triggers.get(name, 0) + 1
        
        # Only show triggers that appear in at least 30% of high-severity episodes
        total_high = len(high_severity)
        if total_high >= 2: # Lowered from 3
            significant_triggers = {k: v for k, v in triggers.items() if (v / total_high) >= 0.3 and v >= 2} # Lowered v from 3
            for food, count in significant_triggers.items():
                results.append({
                    'type': 'trigger',
                    'factor': 'Food',
                    'item': food,
                    'count': count,
                    'description': f"'{food}' was logged shortly before {round((count/total_high)*100)}% of your most severe symptom episodes."
                })

    # 4. Multi-Factor Patterns (e.g. Environment + Activity)
    a_df = dfs['activities']
    if not a_df.empty and not e_df.empty:
        a_daily = a_df.set_index('timestamp').resample('D')['intensity'].mean().reset_index()
        e_daily = e_df.set_index('timestamp').resample('D')['humidity'].mean().reset_index()
        merged = pd.merge(s_daily, a_daily, on='timestamp', how='inner')
        merged = pd.merge(merged, e_daily, on='timestamp', how='inner').dropna()
        
        if len(merged) >= 3: # Lowered from 5
            # Check for a specific "Bad Combo": High humidity + High intensity
            high_combo = merged[(merged['humidity'] > merged['humidity'].mean()) & (merged['intensity'] > merged['intensity'].mean())]
            if len(high_combo) >= 1: # Lowered from 2
                avg_severity_combo = high_combo['severity'].mean()
                avg_severity_overall = merged['severity'].mean()
                if avg_severity_combo > avg_severity_overall + 1.0: # Lowered from 1.5
                    results.append({
                        'type': 'pattern',
                        'factor': 'Environmental/Activity Combo',
                        'description': "Your symptoms tend to be worse on days with both high humidity and high-intensity activity."
                    })

    # 5. Medication Adherence vs Symptoms
    ml_df = dfs['medication_logs']
    if not ml_df.empty:
        # Filter for non-"as needed" medications for adherence tracking
        meds = Medication.query.filter(
            Medication.user_id == user_id, 
            Medication.frequency.ilike('%daily%')
        ).all()
        med_ids = [m.id for m in meds]
        
        if med_ids:
            ml_filtered = ml_df[ml_df['medication_id'].isin(med_ids)]
            
            if not ml_filtered.empty:
                ml_daily = ml_filtered.set_index('timestamp').resample('D')['taken'].mean().reset_index()
                merged = pd.merge(s_daily, ml_daily, on='timestamp', how='inner').dropna()
                
                if len(merged) >= 3:
                    corr = merged['severity'].corr(merged['taken'])
                    if corr < -0.3:
                        results.append({
                            'type': 'correlation',
                            'factor': 'Medication Adherence',
                            'score': round(corr, 2),
                            'description': f"Consistent medication use shows a strong link to reduced symptom severity ({round(corr, 2)})."
                        })

    # Sort results by importance
    results.sort(key=lambda x: (
        0 if x['type'] == 'pattern' else (1 if x['type'] == 'correlation' else 2),
        -abs(x.get('score', 0)) if 'score' in x else -x.get('count', 0)
    ))

    return results

def calculate_correlation_matrix(user_id):
    """Generate a full correlation matrix for all numeric health variables"""
    dfs = get_user_data_df(user_id)
    
    # We want to correlate daily averages/states
    daily_data = []
    
    # 1. Symptoms (per symptom)
    s_df = dfs['symptoms']
    if not s_df.empty:
        for symptom_name in s_df['symptomName'].unique():
            s_sub = s_df[s_df['symptomName'] == symptom_name]
            s_daily = s_sub.set_index('timestamp').resample('D')['severity'].mean().rename(f"Symptom: {symptom_name}")
            daily_data.append(s_daily)
    
    # 2. Mood
    m_df = dfs['moods']
    if not m_df.empty:
        m_daily = m_df.set_index('timestamp').resample('D')['moodRating'].mean().rename("Mood")
        daily_data.append(m_daily)
        
    # 3. Activity
    a_df = dfs['activities']
    if not a_df.empty:
        a_daily = a_df.set_index('timestamp').resample('D')['intensity'].mean().rename("Activity Intensity")
        daily_data.append(a_daily)
        
    # 4. Environment
    e_df = dfs['environment']
    if not e_df.empty:
        e_daily = e_df.set_index('timestamp').resample('D')[['temperature', 'humidity', 'airQualityIndex']].mean()
        e_daily.columns = ["Temp", "Humidity", "AQI"]
        for col in e_daily.columns:
            daily_data.append(e_daily[col])
            
    # 5. Medication Adherence
    ml_df = dfs['medication_logs']
    if not ml_df.empty:
        ml_daily = ml_df.set_index('timestamp').resample('D')['taken'].mean().rename("Medication Adherence")
        daily_data.append(ml_daily)

    if not daily_data:
        return []

    # Merge all into one DataFrame
    full_df = pd.concat(daily_data, axis=1).dropna(how='all')
    
    # Calculate correlation matrix
    corr_matrix = full_df.corr().fillna(0)
    
    # Convert to the format expected by the frontend
    results = []
    variables = corr_matrix.columns.tolist()
    
    for i in range(len(variables)):
        for j in range(i + 1, len(variables)):
            v1 = variables[i]
            v2 = variables[j]
            coeff = corr_matrix.iloc[i, j]
            
            # Only include if not NaN and reasonably non-zero (or just include all for the matrix)
            results.append({
                'variable1': v1,
                'variable2': v2,
                'coefficient': float(coeff)
            })
            
    return results

def get_summary_data(user_id):
    """Aggregate all user data into a clean text summary for the AI model"""
    dfs = get_user_data_df(user_id)
    
    summary = "User Health Data Summary:\n\n"
    
    if not dfs['symptoms'].empty:
        summary += "Symptoms:\n"
        for _, row in dfs['symptoms'].tail(15).iterrows():
            summary += f"- {row['timestamp'].strftime('%Y-%m-%d %H:%M')}: {row['symptomName']} (Severity: {row['severity']})\n"
    
    if not dfs['foods'].empty:
        summary += "\nRecent Food:\n"
        for _, row in dfs['foods'].tail(15).iterrows():
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

import uuid
from datetime import datetime, timedelta
import random
from app import create_app, db
from app.models.user import User
from app.models.symptom import SymptomLog
from app.models.medication import Medication, MedicationLog
from app.models.food import FoodLog
from app.models.activity import ActivityLog
from app.models.mood import MoodLog
from app.models.environment import EnvironmentLog
from app.models.pattern import Pattern

def seed_data():
    app = create_app()
    with app.app_context():
        # Find or create temp user
        email = "test@example.com"
        user = User.query.filter_by(email=email).first()
        
        if user:
            print(f"Updating existing user: {email}")
            user.set_password("password123")
            # Clear existing logs for this user to avoid duplicates
            SymptomLog.query.filter_by(user_id=user.id).delete()
            MedicationLog.query.filter_by(user_id=user.id).delete()
            FoodLog.query.filter_by(user_id=user.id).delete()
            ActivityLog.query.filter_by(user_id=user.id).delete()
            MoodLog.query.filter_by(user_id=user.id).delete()
            EnvironmentLog.query.filter_by(user_id=user.id).delete()
            Pattern.query.filter_by(user_id=user.id).delete()
            # Also clear medications to refresh them
            Medication.query.filter_by(user_id=user.id).delete()
        else:
            print(f"Creating new user: {email}")
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                name="Test User",
                preferences={"theme": "light", "notifications": True}
            )
            user.set_password("password123")
            db.session.add(user)
        
        db.session.commit()
        user_id = user.id

        # Medications
        meds = [
            {"name": "Lisinopril", "dosage": "10mg", "frequency": "Daily", "purpose": "Blood Pressure"},
            {"name": "Zyrtec", "dosage": "10mg", "frequency": "As needed", "purpose": "Allergies"},
            {"name": "Magnesium", "dosage": "250mg", "frequency": "Daily", "purpose": "Sleep Support"}
        ]
        
        created_meds = []
        for med_data in meds:
            med = Medication(
                id=str(uuid.uuid4()),
                user_id=user_id,
                name=med_data["name"],
                dosage=med_data["dosage"],
                frequency=med_data["frequency"],
                start_date=(datetime.now() - timedelta(days=90)).date(),
                purpose=med_data["purpose"],
                active=True
            )
            db.session.add(med)
            created_meds.append(med)
        
        # Data categories
        foods = {
            "breakfast": ["Oatmeal", "Eggs and Toast", "Smoothie", "Greek Yogurt", "Pancakes"],
            "lunch": ["Chicken Salad", "Quinoa Bowl", "Turkey Sandwich", "Lentil Soup", "Sushi"],
            "dinner": ["Salmon and Asparagus", "Beef Stir-fry", "Pasta with Pesto", "Tofu Curry", "Steak and Potatoes"],
            "snack": ["Apple", "Almonds", "Protein Bar", "Dark Chocolate", "Hummus and Carrots"]
        }
        activities = ["Walking", "Yoga", "Swimming", "Cycling", "Strength Training"]
        emotions_list = ["Happy", "Anxious", "Calm", "Tired", "Energetic", "Irritated", "Productive", "Stressed"]
        weather_conditions = ["Sunny", "Cloudy", "Rainy", "Overcast", "Windy"]

        now = datetime.now()
        days_to_seed = 90
        print(f"Generating {days_to_seed} days of realistic health patterns...")
        
        for i in range(days_to_seed):
            current_date = now - timedelta(days=i)
            
            # --- ENVIRONMENTAL FACTORS ---
            # Simulate a rainy spell for joint pain patterns
            is_rainy_spell = (20 < i < 30) or (50 < i < 60)
            humidity = random.uniform(70, 90) if is_rainy_spell else random.uniform(30, 60)
            weather = "Rainy" if is_rainy_spell else random.choice(weather_conditions)
            
            env = EnvironmentLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                timestamp=current_date.replace(hour=12, minute=0),
                temperature=random.uniform(50, 75),
                humidity=humidity,
                pressure=random.uniform(29.8, 30.2),
                air_quality_index=random.randint(20, 60),
                weather_condition=weather,
                location="Cumming, Georgia, US"
            )
            db.session.add(env)

            # --- FOOD LOGS ---
            # User frequently eats "Pasta with Pesto" which we'll correlate with "Nausea"
            dinner_choice = "Pasta with Pesto" if (i % 3 == 0) else random.choice(foods["dinner"])
            
            for meal_type in ["breakfast", "lunch", "dinner"]:
                food = FoodLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    food_name=dinner_choice if meal_type == "dinner" else random.choice(foods[meal_type]),
                    meal_type=meal_type,
                    timestamp=current_date.replace(
                        hour={"breakfast": 8, "lunch": 13, "dinner": 19}[meal_type],
                        minute=random.randint(0, 59)
                    ),
                    portion_size="Medium"
                )
                db.session.add(food)

            # --- SYMPTOMS (PATTERNED) ---
            # Pattern 1: High humidity -> Joint Pain (70% correlation)
            if humidity > 65 and random.random() < 0.7:
                symptom = SymptomLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    symptom_name="Joint Pain",
                    severity=random.randint(6, 9),
                    timestamp=current_date.replace(hour=10, minute=0),
                    duration_minutes=240,
                    notes="High humidity today."
                )
                db.session.add(symptom)

            # Pattern 2: Pasta with Pesto -> Nausea (80% correlation)
            if dinner_choice == "Pasta with Pesto" and random.random() < 0.8:
                symptom = SymptomLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    symptom_name="Nausea",
                    severity=random.randint(5, 8),
                    timestamp=current_date.replace(hour=21, minute=30),
                    duration_minutes=120,
                    notes="After dinner."
                )
                db.session.add(symptom)
            
            # Pattern 3: Random mild fatigue
            if random.random() < 0.2:
                symptom = SymptomLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    symptom_name="Fatigue",
                    severity=random.randint(2, 4),
                    timestamp=current_date.replace(hour=15, minute=0),
                    duration_minutes=60
                )
                db.session.add(symptom)

            # --- MEDICATION (Realistic Adherence) ---
            # Adherence drops on weekends (pattern detection opportunity)
            is_weekend = current_date.weekday() >= 5
            adherence = 0.6 if is_weekend else 0.95
            
            for med in created_meds:
                if med.frequency == "Daily":
                    db.session.add(MedicationLog(
                        id=str(uuid.uuid4()),
                        user_id=user_id,
                        medication_id=med.id,
                        timestamp=current_date.replace(hour=8, minute=0),
                        taken=random.random() < adherence
                    ))

            # --- MOOD & ACTIVITY ---
            # Joint pain leads to lower mood
            mood_base = 4 if humidity > 65 else 7
            mood = MoodLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                mood_rating=max(1, min(10, mood_base + random.randint(-1, 2))),
                emotions=random.sample(emotions_list, 2),
                timestamp=current_date.replace(hour=20, minute=0)
            )
            db.session.add(mood)

            if random.random() > 0.3:
                db.session.add(ActivityLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    activity_type=random.choice(activities),
                    duration_minutes=random.choice([30, 45, 60]),
                    intensity=random.randint(3, 7),
                    timestamp=current_date.replace(hour=17, minute=0)
                ))

        db.session.commit()
        print(f"90 days of patterned data for '{email}' generated successfully!")

if __name__ == "__main__":
    seed_data()

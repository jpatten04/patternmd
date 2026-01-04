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
            {"name": "Metformin", "dosage": "500mg", "frequency": "Twice Daily", "purpose": "Diabetes Management"},
            {"name": "Zyrtec", "dosage": "10mg", "frequency": "As needed", "purpose": "Allergies"},
            {"name": "Vitamin D3", "dosage": "2000IU", "frequency": "Daily", "purpose": "Supplement"},
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
                start_date=(datetime.now() - timedelta(days=60)).date(),
                purpose=med_data["purpose"],
                active=True
            )
            db.session.add(med)
            created_meds.append(med)
        
        # Data categories
        symptom_types = ["Headache", "Fatigue", "Joint Pain", "Nausea", "Brain Fog", "Back Pain", "Anxiety", "Dizziness"]
        foods = {
            "breakfast": ["Oatmeal", "Eggs and Toast", "Smoothie", "Greek Yogurt", "Pancakes", "Breakfast Burrito"],
            "lunch": ["Chicken Salad", "Quinoa Bowl", "Turkey Sandwich", "Lentil Soup", "Sushi", "Taco Salad", "Burrito Bowl"],
            "dinner": ["Salmon and Asparagus", "Beef Stir-fry", "Pasta with Pesto", "Tofu Curry", "Steak and Potatoes", "Pizza", "Roasted Chicken"],
            "snack": ["Apple", "Almonds", "Protein Bar", "Dark Chocolate", "Hummus and Carrots", "Popcorn", "Berries"]
        }
        activities = ["Walking", "Yoga", "Swimming", "Cycling", "Strength Training", "Running", "Hiking", "Pilates"]
        emotions_list = ["Happy", "Anxious", "Calm", "Tired", "Energetic", "Irritated", "Productive", "Stressed", "Lonely"]
        weather_conditions = ["Sunny", "Cloudy", "Rainy", "Overcast", "Windy"]

        now = datetime.now()
        print("Generating 60 days of dense data...")
        
        # Increased to 60 days for better trend visualization
        for i in range(60):
            current_date = now - timedelta(days=i)
            
            # Medication Logs
            for med in created_meds:
                if med.frequency == "Daily":
                    log = MedicationLog(
                        id=str(uuid.uuid4()),
                        user_id=user_id,
                        medication_id=med.id,
                        timestamp=current_date.replace(hour=8, minute=0, second=0, microsecond=0),
                        taken=random.random() > 0.1 # 90% adherence
                    )
                    db.session.add(log)
                elif med.frequency == "Twice Daily":
                    for hour in [8, 20]:
                        log = MedicationLog(
                            id=str(uuid.uuid4()),
                            user_id=user_id,
                            medication_id=med.id,
                            timestamp=current_date.replace(hour=hour, minute=0, second=0, microsecond=0),
                            taken=random.random() > 0.15
                        )
                        db.session.add(log)
                elif med.frequency == "As needed" and random.random() > 0.6:
                    log = MedicationLog(
                        id=str(uuid.uuid4()),
                        user_id=user_id,
                        medication_id=med.id,
                        timestamp=current_date.replace(hour=random.randint(9, 21), minute=random.randint(0, 59)),
                        taken=True
                    )
                    db.session.add(log)
            
            # Symptom Logs (High frequency)
            num_symptoms = random.choices([0, 1, 2, 3, 4], weights=[5, 20, 35, 25, 15])[0]
            for _ in range(num_symptoms):
                symptom = SymptomLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    symptom_name=random.choice(symptom_types),
                    severity=random.randint(1, 10),
                    timestamp=current_date.replace(hour=random.randint(0, 23), minute=random.randint(0, 59)),
                    duration_minutes=random.randint(15, 480),
                    notes="Automated seed data."
                )
                db.session.add(symptom)

            # Food Logs (All meals)
            for meal_type, options in foods.items():
                food = FoodLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    food_name=random.choice(options),
                    meal_type=meal_type,
                    timestamp=current_date.replace(
                        hour={"breakfast": 8, "lunch": 13, "dinner": 19, "snack": 16}[meal_type],
                        minute=random.randint(0, 59)
                    ),
                    portion_size=random.choice(["Small", "Medium", "Large"])
                )
                db.session.add(food)

            # Activity Logs
            if random.random() > 0.15:
                activity = ActivityLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    activity_type=random.choice(activities),
                    duration_minutes=random.choice([15, 30, 45, 60, 90, 120]),
                    intensity=random.randint(2, 10),
                    timestamp=current_date.replace(hour=random.randint(6, 21), minute=random.randint(0, 59))
                )
                db.session.add(activity)

            # Mood Logs (Twice daily)
            for hour in [10, 22]:
                mood = MoodLog(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    mood_rating=random.randint(2, 10),
                    emotions=random.sample(emotions_list, random.randint(1, 4)),
                    timestamp=current_date.replace(hour=hour, minute=0)
                )
                db.session.add(mood)
            
            # Environment Logs
            env = EnvironmentLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                timestamp=current_date.replace(hour=12, minute=0),
                temperature=random.uniform(60, 85),
                humidity=random.uniform(30, 70),
                pressure=random.uniform(29.5, 30.5),
                air_quality_index=random.randint(20, 150),
                pollen_count=random.randint(0, 1000),
                weather_condition=random.choice(weather_conditions),
                location="New York, NY"
            )
            db.session.add(env)

        db.session.commit()
        print(f"Data for '{email}' refreshed successfully!")

if __name__ == "__main__":
    seed_data()

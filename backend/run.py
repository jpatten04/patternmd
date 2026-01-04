from app import create_app, db
from app.models import *

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'SymptomLog': SymptomLog,
        'Medication': Medication,
        'MedicationLog': MedicationLog,
        'FoodLog': FoodLog,
        'ActivityLog': ActivityLog,
        'MoodLog': MoodLog,
        'EnvironmentLog': EnvironmentLog,
        'Pattern': Pattern,
        'Alert': Alert,
        'Report': Report
    }

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
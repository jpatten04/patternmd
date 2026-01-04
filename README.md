# PatternMD

**AI-Powered Health Pattern Recognition for Chronic Illness Management**

PatternMD is a comprehensive health tracking application that helps individuals with chronic illnesses identify patterns, triggers, and effective interventions by analyzing symptoms, medications, diet, activities, environmental factors, and more.

## Project Vision

Living with chronic illness often means managing complex symptoms with unclear triggers. PatternMD empowers patients by:

-   **Tracking Everything**: Log symptoms, medications, food, activities, mood, and environmental data
-   **Finding Patterns**: AI-powered analysis identifies correlations between triggers and symptom flare-ups
-   **Predicting Flares**: Machine learning models predict when symptoms might worsen
-   **Generating Reports**: Create comprehensive PDF reports for doctors with visualizations and insights
-   **Research Integration**: Access relevant medical research and case studies

## Tech Stack

### Frontend

-   **Framework**: React 19 + TypeScript + Vite
-   **Styling**: TailwindCSS 4
-   **State Management**: Zustand
-   **Routing**: React Router v7
-   **Charts**: Recharts
-   **HTTP Client**: Axios
-   **Forms**: React Hook Form + Zod

### Backend

-   **Framework**: Flask 3.1 (Python)
-   **Database**: PostgreSQL
-   **ORM**: SQLAlchemy
-   **Authentication**: JWT tokens
-   **Background Tasks**: Celery + Redis
-   **Data Analysis**: Pandas + Scikit-learn

### AI/ML (100% Free)

-   **Local AI**: Ollama (Llama 3.2 for insights)
-   **Pattern Detection**: Scikit-learn
-   **Alternative**: Google Gemini (free tier)
-   **NLP**: Hugging Face Transformers

### External APIs (Free Tiers)

-   **Weather**: OpenWeatherMap
-   **Air Quality**: AirVisual or similar
-   **Research**: PubMed API

## Key Features

### 1. **Quick Logging System**

-   Floating action button accessible from anywhere
-   Log symptoms, medications, food, activities, or mood in seconds
-   Severity rating slider
-   Timestamp and notes

### 2. **Dashboard**

-   Overview of today's activity
-   Active medications and adherence rates
-   Recent symptoms and patterns
-   Upcoming alerts and reminders

### 3. **Tracking & Analysis**

-   Interactive charts showing symptom severity over time
-   Correlation matrix (symptoms vs. triggers)
-   Pattern discovery cards with AI-generated insights
-   Filter by date range, symptom type, severity

### 4. **Medication Management**

-   Track all medications with dosage and frequency
-   Log when doses are taken
-   Adherence statistics and trends
-   Side effect tracking

### 5. **Environment Monitoring**

-   Automatic weather data collection
-   Barometric pressure, humidity, temperature
-   Air quality index
-   Pollen count
-   Correlate environmental factors with symptoms

### 6. **Predictive Alerts**

-   ML models predict symptom flare-ups
-   Weather-based alerts
-   Medication reminders
-   Pattern-based warnings

### 7. **Research Integration**

-   Search PubMed for relevant studies
-   Bookmark and annotate articles
-   AI-generated summaries

### 8. **Medical Reports**

-   Generate comprehensive PDF reports
-   Include charts, patterns, and statistics
-   Customizable date ranges and sections
-   Perfect for doctor appointments

## Data Models

-   **Users**: Authentication and preferences
-   **Symptom Logs**: Name, severity (1-10), duration, body location, triggers
-   **Medications**: Name, dosage, frequency, purpose, side effects
-   **Medication Logs**: Adherence tracking
-   **Food Logs**: Meal type, portion size, notes
-   **Activity Logs**: Type, duration, intensity
-   **Mood Logs**: Rating, emotions, notes
-   **Environment Logs**: Weather, air quality, pollen
-   **Patterns**: AI-discovered correlations and trends
-   **Alerts**: Predictive warnings and reminders
-   **Reports**: Generated PDF reports

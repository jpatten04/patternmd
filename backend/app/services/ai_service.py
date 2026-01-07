import requests
import os
from dotenv import load_dotenv

load_dotenv()

# We use a capable but free model from Hugging Face
# Mistral-7B or Llama-3.2-3B are excellent choices for serverless inference
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

def generate_health_insights(summary_text, correlation_results):
    """Generate natural language insights using Hugging Face Inference API"""
    
    # Construct the prompt
    prompt = f"<s>[INST] You are a helpful health assistant. Below is a summary of a user's health logs and some statistical correlations found in their data. \n\n"
    prompt += "DATA SUMMARY:\n"
    prompt += summary_text + "\n\n"
    prompt += "STATISTICAL CORRELATIONS:\n"
    for res in correlation_results:
        prompt += f"- {res['description']}\n"
    
    prompt += "\nBased on this data, provide 3 concise, actionable insights or patterns you've noticed. Do not provide medical advice, just observations and suggestions for further tracking. Keep it professional but empathetic. [/INST]"

    if not HF_TOKEN:
        return "Insight generation is currently unavailable (API token missing). Please check your statistical correlations below."

    try:
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.95,
                "return_full_text": False
            }
        }
        
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=20)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', "Could not generate insights.")
            return "Unexpected response format from AI service."
        elif response.status_code == 503:
            return "The AI model is currently loading on Hugging Face servers. Please try again in a few minutes."
        else:
            print(f"HF API Error: {response.status_code} - {response.text}")
            return f"AI Insight generation encountered an error (Status {response.status_code})."
            
    except Exception as e:
        print(f"AI Service Exception: {e}")
        return "An error occurred while connecting to the AI service."

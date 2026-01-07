import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Using a capable and available model for the chat completion endpoint
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"
HF_AI_MODEL = "meta-llama/Llama-3.2-3B-Instruct"
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

def generate_health_insights(summary_text, correlation_results):
    """Generate natural language insights using Hugging Face Inference API"""
    
    if not HF_TOKEN:
        return "Insight generation is currently unavailable (API token missing). Please check your statistical correlations below."

    # Construct the context for the AI
    correlation_text = "\n".join([f"- {res['description']}" for res in correlation_results])
    
    try:
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        payload = {
            "model": HF_AI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a specialized health pattern analyst. Your goal is to provide 3 concise, actionable observations based on health logs. Use clear Markdown bullet points. Do not provide medical advice. Be professional, empathetic, and objective."
                },
                {
                    "role": "user",
                    "content": f"DATA SUMMARY:\n{summary_text}\n\nSTATISTICAL CORRELATIONS:\n{correlation_text}\n\nBased on this data, provide 3 concise insights or patterns as a bulleted list. Use **bolding** for key factors. Focus on possible triggers and lifestyle connections."
                }
            ],
            "max_tokens": 500,
            "temperature": 0.7,
            "top_p": 0.95
        }
        
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=20)
        
        if response.status_code == 200:
            result = response.json()
            # Chat completion format: result['choices'][0]['message']['content']
            if 'choices' in result and len(result['choices']) > 0:
                return result['choices'][0]['message']['content']
            return "Unexpected response format from AI service."
        elif response.status_code == 503:
            return "The AI model is currently loading on Hugging Face servers. Please try again in a few minutes."
        else:
            print(f"HF API Error: {response.status_code} - {response.text}")
            return f"AI Insight generation encountered an error (Status {response.status_code})."
            
    except Exception as e:
        print(f"AI Service Exception: {e}")
        return "An error occurred while connecting to the AI service."

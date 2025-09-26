# backend/config.py
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Gemini API Key configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Admin panel secret key (set a strong password in your .env file)
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "default-insecure-key-please-change")

# Basic validation to ensure the essential API key is set
if not GEMINI_API_KEY:
    raise ValueError("FATAL ERROR: GEMINI_API_KEY is not set in the .env file.")
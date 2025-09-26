# backend/main.py (DEBUGGING VERSION)
import io
import json
import sys
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

print("--- LOADING MAIN.PY ---")

try:
    from config import GEMINI_API_KEY
    from utils import log_activity, get_prompt_text, get_data_from_cloud, DICTIONARY_BIN_ID
    from admin_api import router as admin_router
    print("All imports successful.")
except ImportError as e:
    print(f"FATAL ERROR during import: {e}", file=sys.stderr)
    sys.exit(1)


if not GEMINI_API_KEY:
    print("FATAL ERROR: GEMINI_API_KEY is not set. Check your environment variables.", file=sys.stderr)
    raise ValueError("FATAL ERROR: GEMINI_API_KEY is not set.")

try:
    print("Configuring Generative AI...")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("Generative AI configured successfully.")
except Exception as e:
    print(f"FATAL ERROR configuring Generative AI: {e}", file=sys.stderr)
    sys.exit(1)

app = FastAPI(
    title="Handtalk Backend",
    description="Main API for Handtalk application.",
    version="2.0.1-debug"
)
print("FastAPI app initialized.")

# --- CORS Configuration ---
# You can uncomment and modify this later if needed
# origins = ["https://your-frontend-url.vercel.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://handtalk-wy4h.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("CORS middleware added.")

app.include_router(admin_router)
print("Admin router included.")

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...)):
    # ... (code inside remains the same)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    prompt_text = await get_prompt_text()
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        response = await model.generate_content_async([prompt_text, image])
        if not response.text:
            raise HTTPException(status_code=500, detail="AI model failed to analyze the image due to safety filters.")
        await log_activity("images_analyzed")
        return JSONResponse(content={"analysis_result": response.text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

def normalize_arabic(text: str) -> str:
    text = text.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
    text = text.replace('ة', 'ه').replace('ى', 'ي')
    return text

@app.get("/search-dictionary/")
async def search_cloud_dictionary(query: str = Query(..., min_length=1)):
    # ... (code inside remains the same)
    try:
        cloud_dictionary = await get_data_from_cloud(DICTIONARY_BIN_ID)
        search_query = normalize_arabic(query.lower().strip())
        results = [
            item for item in cloud_dictionary
            if search_query in normalize_arabic(item.get('word_ar', '').lower()) or \
               search_query in normalize_arabic(item.get('word_en', '').lower())
        ]
        formatted_results = [{"title": item.get("word_ar", "No Title"), "thumbnail_link": item.get("image_url", "")} for item in results]
        await log_activity("dictionary_searches")
        return JSONResponse(content={"results": formatted_results})
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while searching the dictionary.")

@app.get("/")
def root():
    print("Root endpoint '/' was accessed.")
    return {"message": "Welcome to Handtalk Main API"}

print("--- MAIN.PY LOADED. APP IS READY TO START. ---")

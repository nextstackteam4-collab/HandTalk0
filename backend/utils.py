# backend/utils.py (DEBUGGING VERSION)
import httpx
import os
import sys

# --- طباعة للتحقق من قراءة المتغيرات ---
print("--- LOADING UTILS.PY ---")
JSONBIN_API_KEY = os.getenv("JSONBIN_API_KEY")
DICTIONARY_BIN_ID = os.getenv("DICTIONARY_BIN_ID")
STATS_BIN_ID = os.getenv("STATS_BIN_ID")
PROMPT_BIN_ID = os.getenv("PROMPT_BIN_ID")
JSONBIN_BASE_URL = "https://api.jsonbin.io/v3/b"

# التحقق من وجود المتغيرات
if not all([JSONBIN_API_KEY, DICTIONARY_BIN_ID, STATS_BIN_ID, PROMPT_BIN_ID]):
    print("FATAL ERROR: One or more JSONBIN environment variables are missing!", file=sys.stderr)
else:
    print("All JSONBIN environment variables loaded successfully.")

# --- دوال للتواصل مع السحابة مع طباعة إضافية ---
async def get_data_from_cloud(bin_id: str):
    print(f"Attempting to GET data from BIN_ID: ...{bin_id[-4:]}")
    headers = {'X-Master-Key': JSONBIN_API_KEY}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{JSONBIN_BASE_URL}/{bin_id}/latest", headers=headers)
            response.raise_for_status()
            print(f"Successfully GOT data from BIN_ID: ...{bin_id[-4:]}")
            return response.json()['record']
    except httpx.HTTPStatusError as e:
        print(f"HTTP ERROR when getting data from BIN_ID ...{bin_id[-4:]}: {e.response.status_code} - {e.response.text}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"GENERIC ERROR when getting data from BIN_ID ...{bin_id[-4:]}: {e}", file=sys.stderr)
        raise

async def update_data_in_cloud(bin_id: str, data: dict or list):
    print(f"Attempting to UPDATE data in BIN_ID: ...{bin_id[-4:]}")
    headers = {'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(f"{JSONBIN_BASE_URL}/{bin_id}", headers=headers, json=data)
            response.raise_for_status()
            print(f"Successfully UPDATED data in BIN_ID: ...{bin_id[-4:]}")
            return response.json()
    except httpx.HTTPStatusError as e:
        print(f"HTTP ERROR when updating data in BIN_ID ...{bin_id[-4:]}: {e.response.status_code} - {e.response.text}", file=sys.stderr)
        raise
    except Exception as e:
        print(f"GENERIC ERROR when updating data in BIN_ID ...{bin_id[-4:]}: {e}", file=sys.stderr)
        raise

# --- الوظائف الرئيسية مع طباعة ---
async def log_activity(activity_type: str):
    print(f"Logging activity: {activity_type}")
    try:
        stats = await get_data_from_cloud(STATS_BIN_ID)
        stats[activity_type] = stats.get(activity_type, 0) + 1
        await update_data_in_cloud(STATS_BIN_ID, stats)
        print(f"Activity '{activity_type}' logged successfully.")
    except Exception as e:
        print(f"Error during cloud activity logging: {e}", file=sys.stderr)

async def get_prompt_text():
    print("Fetching prompt text from cloud...")
    try:
        prompt_data = await get_data_from_cloud(PROMPT_BIN_ID)
        print("Prompt text fetched successfully.")
        return prompt_data.get("prompt_text", "")
    except Exception as e:
        print(f"Failed to fetch prompt text: {e}", file=sys.stderr)
        return "Error: Could not load prompt." # Provide a fallback

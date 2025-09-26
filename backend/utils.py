# backend/utils.py
import httpx
import os

# --- المتغيرات ستقرأ من منصة الاستضافة لاحقاً ---
JSONBIN_API_KEY = os.getenv("JSONBIN_API_KEY")
DICTIONARY_BIN_ID = os.getenv("DICTIONARY_BIN_ID")
STATS_BIN_ID = os.getenv("STATS_BIN_ID")
PROMPT_BIN_ID = os.getenv("PROMPT_BIN_ID")
JSONBIN_BASE_URL = "https://api.jsonbin.io/v3/b"

# --- دوال للتواصل مع السحابة ---
async def get_data_from_cloud(bin_id: str):
    headers = {'X-Master-Key': JSONBIN_API_KEY}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{JSONBIN_BASE_URL}/{bin_id}/latest", headers=headers)
        response.raise_for_status()
        return response.json()['record']

async def update_data_in_cloud(bin_id: str, data: dict or list):
    headers = {'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY}
    async with httpx.AsyncClient() as client:
        response = await client.put(f"{JSONBIN_BASE_URL}/{bin_id}", headers=headers, json=data)
        response.raise_for_status()
        return response.json()

# --- الوظائف الجديدة للمشروع ---
async def log_activity(activity_type: str):
    try:
        stats = await get_data_from_cloud(STATS_BIN_ID)
        stats[activity_type] = stats.get(activity_type, 0) + 1
        await update_data_in_cloud(STATS_BIN_ID, stats)
    except Exception as e:
        print(f"Error logging to cloud: {e}")

async def get_prompt_text():
    prompt_data = await get_data_from_cloud(PROMPT_BIN_ID)
    return prompt_data.get("prompt_text", "")
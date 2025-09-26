# backend/admin_api.py
from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import FileResponse
from config import ADMIN_SECRET_KEY
from utils import (
    get_data_from_cloud, 
    update_data_in_cloud, 
    get_prompt_text,
    DICTIONARY_BIN_ID, 
    STATS_BIN_ID, 
    PROMPT_BIN_ID
)

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/data")
async def get_admin_data(secret_key: str = Body(..., embed=True)):
    if secret_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        stats = await get_data_from_cloud(STATS_BIN_ID)
        prompt_text = await get_prompt_text()
        dictionary = await get_data_from_cloud(DICTIONARY_BIN_ID)
        return {"stats": stats, "prompt": prompt_text, "dictionary": dictionary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {e}")

@router.post("/update-prompt")
async def update_prompt(secret_key: str = Body(...), new_prompt: str = Body(...)):
    if secret_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    await update_data_in_cloud(PROMPT_BIN_ID, {"prompt_text": new_prompt})
    return {"message": "Prompt updated in the cloud."}

@router.post("/update-dictionary")
async def update_dictionary(secret_key: str = Body(...), new_dictionary: list = Body(...)):
    if secret_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    await update_data_in_cloud(DICTIONARY_BIN_ID, new_dictionary)
    return {"message": "Dictionary updated in the cloud."}

@router.get("/", include_in_schema=False)
async def serve_admin_page():
    return FileResponse('frontend/admin.html')
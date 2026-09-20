"""
ScamShield AI - Health, System Info, and ASR Transcription Routes
"""

import os
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional, Dict, Any
from backend.services.ml_service import ml_service
from backend.services.speech_to_text import asr_service

router = APIRouter(tags=["System & Audio"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RESULTS_FILE = os.path.join(BASE_DIR, "ml", "evaluation", "results.json")
STATS_FILE = os.path.join(BASE_DIR, "dataset", "dataset_statistics.json")

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    loaded = ml_service.get_loaded_models_info()
    return {
        "status": "ok",
        "service": "ScamShield AI Backend",
        "version": "1.0.0",
        "models_loaded": loaded
    }

@router.get("/models", status_code=status.HTTP_200_OK)
def get_models_info():
    results = {}
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, "r") as f:
                results = json.load(f)
        except Exception:
            pass

    loaded = ml_service.get_loaded_models_info()
    return {
        "active_models": loaded,
        "evaluation_results": results
    }

@router.get("/dataset-info", status_code=status.HTTP_200_OK)
def get_dataset_info():
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r") as f:
                stats = json.load(f)
                return stats
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=404, detail="Dataset statistics not found.")

@router.post("/transcribe", status_code=status.HTTP_200_OK)
async def transcribe_audio(
    file: Optional[UploadFile] = File(None),
    demo: Optional[bool] = Form(False)
):
    """
    Accepts audio file (WAV / MP3) or demo flag.
    Returns speech-to-text transcript ready for /predict.
    """
    if file:
        content = await file.read()
        filename = file.filename or "uploaded.wav"
        return asr_service.transcribe_audio(content, filename)
    elif demo:
        return asr_service.transcribe_audio(b"demo", "scam_voice_call_rec.wav")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either an audio file must be uploaded or demo=true must be passed."
        )

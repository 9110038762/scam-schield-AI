"""
ScamShield AI - Prediction Route
Handles /predict endpoint for message & call transcript classification.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from backend.services.ml_service import ml_service

router = APIRouter(tags=["Prediction"])

class PredictRequest(BaseModel):
    text: str = Field(..., description="Message text or call transcript string to evaluate.")
    model_preference: Optional[str] = Field("best", description="Preferred classifier model: 'best', 'distilbert', 'logistic_regression', 'naive_bayes', 'svm'")
    input_type: Optional[str] = Field("SMS", description="Input channel type (SMS, Email, Voice Transcript, Chat, Call Transcript)")

class IndicatorItem(BaseModel):
    name: str
    description: str

class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    risk_score: int
    risk_level: str
    category: str
    category_description: str
    language: str
    indicators: List[IndicatorItem]
    indicator_count: int
    explanation: List[str]
    recommendation: str
    model_used: str
    model_probability: float
    latency_ms: float
    cleaned_text: str

@router.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK)
def predict_message(payload: PredictRequest):
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message text cannot be empty. Please provide a message or call transcript."
        )

    if len(raw_text) > 10000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message exceeds maximum allowed length of 10,000 characters."
        )

    try:
        result = ml_service.predict(raw_text, model_preference=payload.model_preference or "best")
        return result
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ScamShield ML Engine initialization error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal prediction failure: {str(e)}"
        )

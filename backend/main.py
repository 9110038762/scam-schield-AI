"""
ScamShield AI - FastAPI Application Server
Real-Time AI-Based Scam Detection Using NLP, Speech Analysis, and Machine Learning.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.predict import router as predict_router
from backend.routes.health import router as health_router
from backend.services.ml_service import ml_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ScamShieldApp")

app = FastAPI(
    title="ScamShield AI API",
    description="Real-time AI-based scam detection backend using classical ML and transformer models.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(predict_router)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing ScamShield AI ML Service...")
    ml_service.load_models()
    logger.info("ScamShield AI Backend is online and listening.")

@app.get("/")
def root():
    return {
        "project": "ScamShield AI",
        "description": "Real-Time AI-Based Scam Detection Using NLP, Speech Analysis and Machine Learning",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

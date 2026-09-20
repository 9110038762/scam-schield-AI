"""
ScamShield AI - Machine Learning Inference Service
Orchestrates model inference across DistilBERT, Logistic Regression, Naive Bayes, and SVM.
"""

import os
import time
import logging
import joblib
import numpy as np
import torch
from typing import Dict, Any, Optional

from backend.services.preprocessing import clean_text, detect_language
from backend.services.indicator_detector import detect_indicators
from backend.services.category_classifier import classify_category
from backend.services.risk_engine import compute_risk_score, generate_explanation, generate_recommendation

logger = logging.getLogger("MLService")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

class MLService:
    def __init__(self):
        self.vectorizer = None
        self.lr_model = None
        self.nb_model = None
        self.svm_model = None
        self.distilbert_model = None
        self.distilbert_tokenizer = None
        self.device = torch.device("mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu"))
        self.load_models()

    def load_models(self):
        # 1. Load TF-IDF & Classical Models
        vec_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
        lr_path = os.path.join(MODELS_DIR, "logistic_regression.pkl")
        nb_path = os.path.join(MODELS_DIR, "naive_bayes.pkl")
        svm_path = os.path.join(MODELS_DIR, "svm.pkl")

        if os.path.exists(vec_path) and os.path.exists(lr_path):
            try:
                self.vectorizer = joblib.load(vec_path)
                self.lr_model = joblib.load(lr_path)
                if os.path.exists(nb_path):
                    self.nb_model = joblib.load(nb_path)
                if os.path.exists(svm_path):
                    self.svm_model = joblib.load(svm_path)
                logger.info("Loaded classical ML models (LR, NB, SVM).")
            except Exception as e:
                logger.error(f"Error loading classical models: {e}")

        # 2. Check for DistilBERT
        distilbert_dir = os.path.join(MODELS_DIR, "distilbert")
        if os.path.exists(distilbert_dir) and (os.path.exists(os.path.join(distilbert_dir, "config.json")) or os.path.exists(os.path.join(distilbert_dir, "model.safetensors"))):
            try:
                from transformers import AutoTokenizer, AutoModelForSequenceClassification
                self.distilbert_tokenizer = AutoTokenizer.from_pretrained(distilbert_dir)
                self.distilbert_model = AutoModelForSequenceClassification.from_pretrained(distilbert_dir)
                self.distilbert_model.to(self.device)
                self.distilbert_model.eval()
                logger.info("Loaded fine-tuned DistilBERT transformer model.")
            except Exception as e:
                logger.warning(f"DistilBERT model not loaded yet: {e}")

    def is_ready(self) -> bool:
        return self.vectorizer is not None and (self.lr_model is not None or self.distilbert_model is not None)

    def get_loaded_models_info(self) -> Dict[str, bool]:
        return {
            "distilbert": self.distilbert_model is not None,
            "logistic_regression": self.lr_model is not None,
            "naive_bayes": self.nb_model is not None,
            "svm": self.svm_model is not None
        }

    def predict(self, raw_text: str, model_preference: str = "best") -> Dict[str, Any]:
        if not self.is_ready():
            raise RuntimeError("ScamShield ML models are not initialized.")

        cleaned = clean_text(raw_text)
        detected_lang = detect_language(cleaned)
        start_time = time.perf_counter()

        model_used = "Logistic Regression"
        scam_prob = 0.0

        # Select model
        use_distilbert = (
            (model_preference in ["best", "distilbert"]) and 
            self.distilbert_model is not None and 
            self.distilbert_tokenizer is not None
        )

        if use_distilbert:
            model_used = "DistilBERT (Fine-tuned)"
            with torch.no_grad():
                inputs = self.distilbert_tokenizer(
                    cleaned,
                    truncation=True,
                    max_length=128,
                    return_tensors="pt"
                ).to(self.device)
                outputs = self.distilbert_model(**inputs)
                probs = torch.softmax(outputs.logits, dim=-1)[0]
                scam_prob = float(probs[1].item())
        else:
            # Classical baseline fallback / selection
            features = self.vectorizer.transform([cleaned])
            if model_preference == "naive_bayes" and self.nb_model:
                model_used = "Multinomial Naive Bayes"
                probs = self.nb_model.predict_proba(features)[0]
                scam_prob = float(probs[1])
            elif model_preference == "svm" and self.svm_model:
                model_used = "Linear SVM (Calibrated)"
                probs = self.svm_model.predict_proba(features)[0]
                scam_prob = float(probs[1])
            else:
                model_used = "Logistic Regression"
                probs = self.lr_model.predict_proba(features)[0]
                scam_prob = float(probs[1])

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Classification decision
        prediction = "SCAM" if scam_prob >= 0.50 else "SAFE"
        confidence = round(max(scam_prob, 1.0 - scam_prob) * 100.0, 1)

        # Indicator analysis
        indicators, indicator_score = detect_indicators(raw_text)

        # Category classification
        cat_info = classify_category(raw_text, prediction, indicators)

        # Risk scoring
        risk_score, risk_level = compute_risk_score(scam_prob, indicator_score, prediction)

        # Explainable AI reasoning
        reasons = generate_explanation(prediction, indicators, cat_info["category"])
        recommendation = generate_recommendation(prediction, risk_level)

        return {
            "prediction": prediction,
            "confidence": confidence,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "category": cat_info["category"],
            "category_description": cat_info["description"],
            "language": detected_lang,
            "indicators": indicators,
            "indicator_count": len(indicators),
            "explanation": reasons,
            "recommendation": recommendation,
            "model_used": model_used,
            "model_probability": round(scam_prob, 4),
            "latency_ms": latency_ms,
            "cleaned_text": cleaned
        }

# Global singleton
ml_service = MLService()

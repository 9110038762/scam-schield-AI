"""
ScamShield AI - Comprehensive Test Suite
Tests detection of all threat categories, language handling, boundary conditions, and API behavior.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.preprocessing import clean_text, detect_language
from backend.services.indicator_detector import detect_indicators
from backend.services.category_classifier import classify_category
from backend.services.risk_engine import compute_risk_score, generate_explanation

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "models_loaded" in data

def test_empty_message_400():
    response = client.post("/predict", json={"text": "   "})
    assert response.status_code == 400

def test_safe_message():
    response = client.post("/predict", json={"text": "Hey, let's meet tomorrow at 10 AM in the college library."})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SAFE"
    assert data["risk_score"] < 40
    assert data["category"] == "SAFE"

def test_safe_hinglish():
    response = client.post("/predict", json={"text": "Bhai kal college aayega kya? Assignment submit karna hai."})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SAFE"
    assert data["language"] in ["Hinglish", "English"]

def test_otp_scam():
    text = "Dear customer, your bank transaction of Rs 15000 is pending. Share your OTP immediately to cancel."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] in ["OTP_FRAUD", "BANK_FRAUD"]
    assert any("OTP" in ind["name"] for ind in data["indicators"])
    assert data["risk_score"] >= 70

def test_kyc_fraud():
    text = "URGENT: Your SBI bank account will be suspended today. Update your KYC and verify Aadhaar immediately at http://sbi-kyc-verify.com"
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] in ["KYC_FRAUD", "BANK_FRAUD", "PHISHING"]
    assert any("KYC" in ind["name"] or "Account Blocking" in ind["name"] for ind in data["indicators"])

def test_upi_scam():
    text = "Sir accept this UPI collect request on PhonePe to receive your pending cashback of Rs 2500."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert any("UPI" in ind["name"] or "Refund" in ind["name"] for ind in data["indicators"])

def test_digital_arrest_scam():
    text = "This is Officer Sharma from Cyber Crime Branch Delhi. A money laundering case is registered against you. You are under digital arrest. Keep your video on."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] in ["DIGITAL_ARREST", "IMPERSONATION"]
    assert data["risk_score"] >= 80

def test_lottery_scam():
    text = "Congratulations! You have won a lucky draw prize of ₹5,00,000. Send processing fee of Rs 500 to claim your reward."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] == "LOTTERY_SCAM"

def test_electricity_scam():
    text = "Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Call electricity officer now."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] in ["ELECTRICITY_SCAM", "THREAT"]

def test_courier_customs_scam():
    text = "Your FedEx international parcel has been detained by customs due to suspicious contraband. Pay clearance duty immediately."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] == "COURIER_SCAM"

def test_blackmail_scam():
    text = "We have recorded your private video call. Pay 50000 rupees immediately or we will leak your video to all your contacts."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] == "BLACKMAIL"

def test_job_scam():
    text = "Work from home part time job. Earn 8000 daily. Pay registration fee of 999 to start."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] in ["JOB_SCAM", "OTHER_SCAM"]

def test_loan_scam():
    text = "Your instant pre-approved personal loan of Rs 5 Lakh is ready with zero interest. Pay processing charge."
    response = client.post("/predict", json={"text": text})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["category"] == "LOAN_SCAM"

def test_special_characters_and_unicode():
    text = "खाता तुरंत ब्लॉक हो जाएगा। OTP शेयर करें ₹5000"
    cleaned = clean_text(text)
    assert "₹5000" in cleaned or "₹" in cleaned
    lang = detect_language(text)
    assert lang == "Hindi"

def test_call_transcript_multi_speaker():
    transcript = """
    Caller: Hello, I am calling from SBI Fraud Prevention Department.
    Caller: Someone attempted an unauthorized transaction of ₹45,000 on your debit card.
    Caller: To stop this charge, you must share the 6-digit verification code sent to your phone.
    """
    response = client.post("/predict", json={"text": transcript, "input_type": "Call Transcript"})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "SCAM"
    assert data["risk_score"] >= 75
    assert len(data["indicators"]) >= 2

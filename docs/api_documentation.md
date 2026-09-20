# ScamShield AI — REST API Documentation

## Base URL
```
http://localhost:8000
```
Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check and model loading status |
| `POST` | `/predict` | Primary text and call transcript fraud classification |
| `GET` | `/models` | Available model metadata and empirical evaluation metrics |
| `GET` | `/dataset-info` | Ingestion counts, class balance, and split statistics |
| `POST` | `/transcribe` | Audio speech-to-text transcription interface (Whisper) |

---

## 2. Endpoint Details

### 2.1 `POST /predict`
Evaluates a message or call transcript, outputs Scam/Safe prediction, confidence, 17-class category, indicators, risk score, and reasoning.

#### Request Body
```json
{
  "text": "Hello sir, I am calling from your bank. Your KYC is incomplete and your account will be blocked today. Please share the OTP you received.",
  "model_preference": "best",
  "input_type": "Call Transcript"
}
```

#### Request Parameters
- `text` *(string, required)*: The communication body or call transcript (max 10,000 characters).
- `model_preference` *(string, optional)*: `"best"`, `"distilbert"`, `"logistic_regression"`, `"svm"`, or `"naive_bayes"`. Default: `"best"`.
- `input_type` *(string, optional)*: `"SMS"`, `"Email"`, `"Voice Transcript"`, `"Chat"`, or `"Call Transcript"`. Default: `"SMS"`.

#### Response (200 OK)
```json
{
  "prediction": "SCAM",
  "confidence": 99.3,
  "risk_score": 86,
  "risk_level": "CRITICAL",
  "category": "OTP_FRAUD",
  "category_description": "Attempts to harvest OTP, PIN, password, or authentication credentials.",
  "language": "Hinglish",
  "indicators": [
    {
      "name": "OTP Request",
      "description": "Requests one-time password, PIN, or verification passcode."
    },
    {
      "name": "KYC Verification Urgency",
      "description": "Prompts immediate KYC completion to avoid penalties."
    },
    {
      "name": "Account Blocking Threat",
      "description": "Threatens freezing, deactivating, or closing victim's account."
    }
  ],
  "indicator_count": 3,
  "explanation": [
    "Explicitly requests authentication credentials (OTP / PIN) which legitimate organizations never ask for.",
    "Creates artificial urgency by threatening imminent account suspension or banking closure."
  ],
  "recommendation": "🚨 CRITICAL THREAT: Do NOT share OTPs, PINs, or credentials. Do NOT send money. Disconnect immediately.",
  "model_used": "DistilBERT (Fine-tuned)",
  "model_probability": 0.9926,
  "latency_ms": 28.4,
  "cleaned_text": "Hello sir, I am calling from your bank. Your KYC is incomplete and your account will be blocked today. Please share the OTP you received."
}
```

#### Status Codes
- `200 OK`: Successful inference.
- `400 Bad Request`: Text is empty or exceeds 10,000 characters.
- `503 Service Unavailable`: ML models failed to load.

---

### 2.2 `GET /health`
Returns runtime service status and dictionary of currently active models.

#### Response (200 OK)
```json
{
  "status": "ok",
  "service": "ScamShield AI Backend",
  "version": "1.0.0",
  "models_loaded": {
    "distilbert": true,
    "logistic_regression": true,
    "naive_bayes": true,
    "svm": true
  }
}
```

---

### 2.3 `POST /transcribe`
Accepts an audio file (`.wav` or `.mp3`) or a demo flag and returns an ASR transcript ready for analysis.

#### Form Data
- `file` *(binary file, optional)*: Audio recording.
- `demo` *(boolean, optional)*: `true` to run simulation call audio.

#### Response (200 OK)
```json
{
  "status": "success",
  "transcript": "This is a verification call from your bank. Your account will be suspended...",
  "asr_engine": "OpenAI Whisper (Architecture Prototype)",
  "sample_rate_hz": 16000,
  "filename": "scam_voice_call_rec.wav",
  "is_simulated": true,
  "note": "ScamShield AI ASR module ready for live telephony integration upon deployment."
}
```

---

## 3. Client Integration Examples

### 3.1 cURL
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Your electricity bill is unpaid. Power disconnected tonight unless paid now."}'
```

### 3.2 Python (`requests`)
```python
import requests

url = "http://localhost:8000/predict"
payload = {
    "text": "Cyber Crime Branch se bol raha hoon. Aapke naam par warrant hai.",
    "model_preference": "best"
}
response = requests.post(url, json=payload)
data = response.json()
print(f"Prediction: {data['prediction']} (Risk Score: {data['risk_score']}/100)")
```

### 3.3 JavaScript (`fetch`)
```javascript
const res = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "URGENT: Verify your KYC immediately at http://fake-bank-login.com"
  })
});
const result = await res.json();
console.log(result.prediction, result.category, result.risk_score);
```

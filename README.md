# ScamShield AI

> **Real-Time AI-Based Scam Detection Using NLP, Speech Analysis, and Machine Learning**  
> An explainable, multi-modal research prototype for telecommunication fraud, digital arrest extortion, and Hinglish financial deception.

---

## Overview
**ScamShield AI** is an end-to-end artificial intelligence system engineered to identify, categorize, score, and explain fraudulent communications in real time. Designed specifically for modern cybercrime patterns—including bank KYC suspensions, OTP theft, UPI payment collect traps, police impersonation, and "digital arrest" extortion—the system processes both single SMS/email text messages and multi-turn phone call transcripts.

The project incorporates:
- A unified, leakage-free multi-source dataset (8,233 unique records derived from 21,633 raw records).
- Classical NLP baselines (TF-IDF with Logistic Regression, Naive Bayes, Calibrated SVM).
- A fine-tuned **DistilBERT** transformer model delivering **98.79% accuracy** and **97.74% SCAM F1-score**.
- A transparent, explainable **Scam Risk Scoring Engine** (0–100 scale).
- A high-performance **FastAPI backend** (`/predict`, `/health`, `/models`, `/transcribe`).
- A modern **React 19 + TypeScript + Tailwind CSS** interactive dashboard with dedicated **Call Transcript Mode**.

---

## Problem Statement
1. **Regional & Dialect Gaps:** Conventional spam filters are trained almost exclusively on English datasets and fail to recognize Indian cyber fraud nuances, such as `UPI`, `Aadhaar`, `KYC`, `Rs/₹` amounts, and phonetic Hinglish words (`hai`, `karo`, `paise`).
2. **Conversational Coercion:** Fraudsters increasingly rely on high-pressure phone calls (e.g., claiming to be CBI or customs officers putting the victim under "digital arrest") rather than obvious text links. Standard spam detectors lack conversational context.
3. **Lack of Explainability:** End-users need to know *why* a communication is flagged (e.g., "Demands OTP", "Uses urgent account-blocking threat", "Impersonates police") rather than trusting an opaque binary label.

---

## Objectives
- Aggregate, clean, and deduplicate multiple open-source fraud corpora into a standardized research dataset without train/test data leakage.
- Benchmark classical machine learning algorithms against deep transformer architectures on code-mixed and English data.
- Design an explainable 17-class threat taxonomy and formula-based Scam Risk Score.
- Connect an interactive web dashboard to a production-grade Python ML backend.
- Architect an ASR interface ready for future live telephony speech-to-text integration via OpenAI Whisper.

---

## Features
- **Dual Analysis Modes:**
  - *Single Message Mode:* Instant evaluation of SMS, emails, WhatsApp messages, and notifications.
  - *Call Transcript Mode:* Comprehensive multi-turn conversation parsing simulating spoken telephone scams.
- **Explainable AI (XAI) Indicators:** 19 weighted trigger markers identifying OTP requests, UPI links, authority impersonation, and extortion.
- **17-Class Fraud Taxonomy:** Categorizes threats into `DIGITAL_ARREST`, `KYC_FRAUD`, `OTP_FRAUD`, `UPI_FRAUD`, `LOTTERY_SCAM`, `COURIER_SCAM`, `BLACKMAIL`, etc.
- **Model Selector:** Live switching between DistilBERT Transformer, Logistic Regression, Linear SVM, and Multinomial Naive Bayes.
- **Transparent Risk Scoring:** Mathematical fusion of model probabilities and indicator weights.
- **Speech Pipeline Prototype:** Audio upload interface and Whisper speech-to-text integration hook.
- **Audit History Log:** Persistent session logging of evaluated communications with risk badges.

---

## Architecture

```
                       User Input (Text or Audio)
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
          Direct Text Input                   Spoken Phone Call
                 │                                   │
                 │                        Whisper ASR Audio Engine
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                      Data Cleaning & PII Masking
              (Preserves ₹, OTP, UPI, KYC; Masks PII)
                                   │
                                   ▼
                     NLP Classifier Inference Tier
         ├── DistilBERT Fine-Tuned Transformer (Primary)
         ├── Calibrated Linear SVM
         ├── Logistic Regression (TF-IDF Baseline)
         └── Multinomial Naive Bayes
                                   │
                                   ▼
                     17-Class Taxonomy Classification
                                   │
                                   ▼
                   Suspicious Indicator Detection (XAI)
                                   │
                                   ▼
                        Scam Risk Scoring Engine
              Risk Score = 0.70 × (P_scam × 100) + 0.30 × Score
                                   │
                                   ▼
                    FastAPI REST Backend (Port 8000)
                                   │
                                   ▼
                  React 19 Interactive Dashboard UI
```

---

## Dataset
The ScamShield unified corpus is an amalgamated, deduplicated research dataset:
- **Total Raw Records Ingested:** 21,633
- **Exact Duplicates Removed:** 13,383
- **Final Cleaned Unique Records:** 8,233
  - **SCAM:** 2,203 samples (26.76%)
  - **SAFE:** 6,030 samples (73.24%)
- **Data Partitions:**
  - **Training Split (80%):** 6,586 samples
  - **Validation Split (10%):** 823 samples
  - **Test Split (10%):** 824 samples (Held-out benchmark: 603 Safe, 221 Scam)

---

## Dataset Sources

| Dataset Name | Source URL | License | Raw Records | Language | Type | Citation |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UCI SMS Spam Collection** | [UCI ML Archive](https://archive.ics.uci.edu/dataset/228/sms+spam+collection) | CC BY 4.0 | 5,574 | English | Real SMS | Almeida & Hidalgo (2011) |
| **Scam/Spam India Dataset** | [Hugging Face](https://huggingface.co/datasets/anmolshrivastav/scam-hum-india) | Apache 2.0 | 2,272 | English, Hinglish | Real + Synthetic | Shrivastav (2024) |
| **Hinglish Financial Scam Dataset** | [Hugging Face](https://huggingface.co/datasets/bolewara/hinglish-scam-text-dataset) | CC BY 4.0 | 3,787 | English, Hindi, Hinglish | Financial Chat/SMS | Bolewara (2024) |
| **Indian Cyber Scam PhoneCall** | [Hugging Face](https://huggingface.co/datasets/ysangam/Indian_Cyber_Scam_PhoneCall_Hinglish_Dataset) | Apache 2.0 | 10,000 | Hinglish, Hindi | Call Transcripts | Sangam (2024) |

*Full license texts and attribution details are documented in [`dataset/LICENSES.md`](file:///Users/anandraj/Documents/scam-schield-AI/dataset/LICENSES.md).*

---

## Data Processing
1. **Standardization:** Unicode NFKC normalization and HTML entity conversion.
2. **PII Sanitization:** Automated masking of 10-digit mobile numbers (`[PHONE_NUMBER]`), email addresses (`[EMAIL_ADDRESS]`), 12-digit Aadhaar IDs (`[AADHAAR_NUMBER]`), and raw OTP numeric codes (`[OTP_CODE]`).
3. **Keyword Preservation:** Domain tokens (`₹`, `INR`, `OTP`, `UPI`, `KYC`, `Aadhaar`, `PAN`, `PIN`, `bank`, `police`) are deliberately preserved.
4. **Deduplication:** Removal of 13,383 duplicate rows before train/test splitting, strictly preventing evaluation leakage.
5. **Language Identification:** Rule-based classification into English, Hinglish, and Hindi based on Devanagari script and regional grammatical markers.

---

## Machine Learning
Classical NLP baselines were implemented using `scikit-learn`:
- **Feature Extraction:** Sublinear TF-IDF word n-grams (1, 2) up to 10,000 features.
- **Logistic Regression:** L-BFGS solver with balanced inverse class weights.
- **Multinomial Naive Bayes:** Additive Lidstone smoothing ($\alpha = 0.1$).
- **Linear SVM:** Calibrated via 3-fold Platt scaling (`CalibratedClassifierCV`) to output well-calibrated probabilities.

---

## Transformer Model
- **Base Architecture:** `distilbert-base-uncased` (6 transformer layers, 768 hidden dimensions, 12 attention heads, 66M parameters).
- **Fine-Tuning:** 2 epochs on 6,586 training samples with AdamW optimizer ($\text{lr}=3\times 10^{-5}$, linear warmup).
- **Hardware:** Accelerated using Apple Silicon Metal Performance Shaders (MPS).
- **Inference Latency:** 8.92 ms per message.
- **Confidence Metric:** Calibrated Softmax probability $\max(P_{\text{scam}}, 1 - P_{\text{scam}}) \times 100$.

---

## Risk Scoring
The **Scam Risk Score** (0–100) is calculated through a transparent formula:

$$\text{Risk Score} = 0.70 \times \left(P_{\text{SCAM}} \times 100\right) + 0.30 \times \text{IndicatorScore}$$

Where $\text{IndicatorScore}$ sums weighted indicators (capped at 100):
- Digital Arrest Extortion: $+25$
- Blackmail / Personal Coercion: $+22$
- OTP Request: $+20$
- Police / Legal Impersonation: $+20$
- Account Blocking Threat: $+18$
- UPI / QR Payment Request: $+18$
- KYC Verification Urgency: $+16$
- Suspicious URL: $+14$

### Risk Tiers
- **0 – 24:** `LOW` (Normal communication)
- **25 – 49:** `MEDIUM` (Exercise caution)
- **50 – 74:** `HIGH` (Probable fraud)
- **75 – 100:** `CRITICAL` (Immediate threat; hang up / do not pay)

---

## Backend API
Powered by **FastAPI** with CORS enabled:
- `POST /predict`: Classifies input text or call transcript; returns prediction, confidence, category, indicators, risk score, and explanation.
- `GET /health`: Health check and model readiness status.
- `GET /models`: Returns active models and benchmark metrics.
- `GET /dataset-info`: Returns unified corpus statistics.
- `POST /transcribe`: Speech-to-text audio upload interface.

*Detailed schemas and request examples are available in [`docs/api_documentation.md`](file:///Users/anandraj/Documents/scam-schield-AI/docs/api_documentation.md).*

---

## Frontend
Built with **React 19**, **TypeScript**, and **Tailwind CSS**:
- Interactive text and call transcript analyzer with live status badge.
- Model selector allowing comparison across DistilBERT, SVM, Logistic Regression, and Naive Bayes.
- Visual SVG risk gauge, confidence meters, and categorized indicator cards.
- Dataset explorer with Recharts distributions and 4-dataset source breakdown.
- Model evaluation tab displaying actual confusion matrices and isolation experiments.
- ASR voice panel for audio upload and call simulation.

---

## Installation

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.10$

### 1. Frontend Setup
```bash
npm install
```

### 2. Backend Setup
```bash
python3 -m venv .venv

# On macOS / Linux:
source .venv/bin/activate

# On Windows:
# .venv\Scripts\activate

pip install -r backend/requirements.txt
```

---

## Training
To re-train the models from scratch on the unified dataset:

```bash
# 1. Download raw public datasets
python ml/preprocessing/download_datasets.py

# 2. Clean, deduplicate, and split dataset (80/10/10)
python ml/preprocessing/clean_dataset.py

# 3. Train classical ML baselines (Logistic Regression, Naive Bayes, Linear SVM)
python ml/training/train_baseline.py

# 4. Fine-tune DistilBERT transformer
python ml/training/train_distilbert.py

# 5. Generate evaluation plots and comparison tables
python ml/evaluation/plots.py
python ml/training/compare_models.py
```

---

## Running the Application

### Start the FastAPI Backend (Port 8000)
```bash
source .venv/bin/activate
PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
```

### Start the React Dashboard (Port 5173)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Evaluation
Run the automated evaluation suite against the held-out test split (824 samples):

```bash
# Run standalone evaluation verifier
python ml/evaluation/evaluate.py

# Run comprehensive test suite (16 automated test cases)
PYTHONPATH=. pytest tests/test_predict.py -v
```

---

## Results
*Empirical evaluation on the held-out test set (824 unique samples: 603 Safe, 221 Scam):*

| Model | Accuracy | SCAM Precision | SCAM Recall | SCAM F1-Score | Inference Latency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **DistilBERT (Fine-Tuned)** | **98.79%** | **97.74%** | **97.74%** | **97.74%** | **8.92 ms** |
| **Linear SVM (Calibrated)** | 98.30% | 96.83% | 96.83% | 96.83% | 0.0010 ms |
| **Logistic Regression (TF-IDF)** | 98.06% | 96.38% | 96.38% | 96.38% | 0.0003 ms |
| **Multinomial Naive Bayes** | 97.82% | 97.21% | 94.57% | 95.87% | 0.0003 ms |

### DistilBERT Confusion Matrix
- **True Negatives (TN):** 598 (99.17% of actual safe messages correctly identified)
- **True Positives (TP):** 216 (97.74% of actual scams caught)
- **False Positives (FP):** 5 (0.83% false alarms)
- **False Negatives (FN):** 5 (2.26% missed scams)

---

## Limitations
1. **Conversational Synthesis:** Sections of the PhoneCall Hinglish corpus are based on structured dialogue templates and simulated recordings rather than telecommunication wiretaps.
2. **Spelling Variations in Hinglish:** Informal Romanized Hindi features unstandardized phonetic spelling (e.g., `bhejo`, `bhejiye`, `send karo`) which occasionally degrades bag-of-words representations.
3. **Telephony Interception:** Modern mobile operating systems restrict third-party background call interception. Real-world deployment requires VoIP proxying or carrier-grade integration.

---

## Privacy
- **Zero Raw PII Storage:** Mobile numbers, emails, Aadhaar numbers, and raw numeric OTPs are masked in-memory before inference.
- **In-Memory Inference:** Evaluated messages and call transcripts are processed transiently and not persisted to external databases.
- **Non-Invasive:** Does not access contacts, SMS databases, or device microphones without explicit user interaction.

---

## Future Work
- **Multilingual Foundation Models:** Fine-tuning Indian foundation transformers such as **Google MuRIL** (`google/muril-base-cased`) across native Indic scripts (Hindi, Tamil, Telugu, Bengali).
- **On-Device Whisper:** Deploying quantised `whisper.cpp` or `faster-whisper` for offline speech-to-text inference on edge devices.
- **Real-Time Telecom Gateways:** Partnering with telecommunications providers or VoIP gateways for real-time in-call warnings.

---

## References
1. Almeida, T. A., & Gómez Hidalgo, J. M. (2011). SMS Spam Collection. *UCI Machine Learning Repository*. DOI: 10.24432/C5CC84.
2. Sanh, V., Debut, L., Chaumond, J., & Wolf, T. (2019). DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter. *arXiv preprint arXiv:1910.01108*.
3. Radford, A., Kim, J. W., Xu, T., Brockman, G., McLeavey, C., & Sutskever, I. (2023). Robust speech recognition via large-scale weak supervision. *ICML 2023*.
4. Shrivastav, A. (2024). Scam-Hum-India Dataset. *Hugging Face Datasets*.
5. Bolewara, R. (2024). Hinglish & English Financial Scam/Fraud Text Dataset. *Hugging Face Datasets*.
6. Sangam, Y. (2024). Indian Cyber Scam PhoneCall Hinglish Dataset. *Hugging Face Datasets*.

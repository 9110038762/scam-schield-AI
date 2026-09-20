# Model Card — ScamShield AI

## 1. Model Details
- **Model Name:** ScamShield AI (DistilBERT Fine-Tuned + Classical TF-IDF Baselines)
- **Model Version:** v1.0.0
- **Model Type:** Text Classification / NLP Sequence Classification + Explainable Risk Heuristic
- **Base Architecture:** `distilbert-base-uncased` (6 layers, 768 hidden, 12 heads, 66M parameters)
- **Frameworks:** PyTorch 2.14, Hugging Face Transformers 5.17, Scikit-Learn 1.9, FastAPI
- **Developer:** Research Prototype for Undergraduate B.Tech Computer Science Capstone / Applied NLP Study
- **License:** Open Academic Use (Dataset licenses: CC BY 4.0 and Apache 2.0)

---

## 2. Intended Use
- **Primary Intended Use:** Automated pre-screening and real-time risk assessment of suspicious text communications (SMS, WhatsApp, emails) and spoken conversation transcripts (phone-call simulations).
- **Primary Target Audience:** Mobile phone subscribers, consumer fraud victims, educational demonstrations, and telecom fraud analysts.
- **Out-of-Scope / Non-Intended Uses:**
  - Automated punitive legal enforcement without human review.
  - Interception of private communications without consent.
  - Absolute legal determination of criminality.

---

## 3. Training & Evaluation Datasets
The model was fine-tuned on the unified **ScamShield Corpus** (8,233 unique records derived from 21,633 raw samples after removing 13,383 duplicate lines):
- **UCI SMS Spam Collection:** 5,574 raw English SMS messages.
- **Scam/Spam India Dataset:** 2,272 raw Indian telecom and banking fraud examples.
- **Hinglish Financial Scam Dataset:** 3,787 raw financial fraud texts.
- **Indian Cyber Scam PhoneCall Hinglish Dataset:** 10,000 raw call dialogue transcripts.

### Data Splits
- **Training:** 6,586 examples (80%)
- **Validation:** 823 examples (10%)
- **Test:** 824 examples (10%, stratified)

---

## 4. Performance Metrics (Held-out Test Split)
- **Accuracy:** 98.79%
- **SCAM Precision:** 97.74%
- **SCAM Recall:** 97.74%
- **SCAM F1-Score:** 97.74%
- **Average Inference Latency:** 8.92 ms (on Apple Silicon MPS) / 0.0003 ms (Logistic Regression)

---

## 5. Limitations & Ethical Considerations

### 5.1 Potential False Positives
- Legitimate urgent messages from family members requesting emergency money or transport transfers.
- Legitimate bank multi-factor authentication (MFA) OTP notifications that contain security warnings.

### 5.2 Potential False Negatives
- Novel, highly personalized spear-phishing messages that avoid overt trigger words (`urgent`, `blocked`, `OTP`).
- Dialect variations and creative phonetic misspellings in Hinglish that escape vocabulary mapping.

### 5.3 Language Bias
- Optimized for English and Hinglish (Hindi written in Latin script).
- Devanagari Hindi support is currently rule-based and planned for deep multilingual fine-tuning (MuRIL/mBERT) in future work.

---

## 6. Privacy & Safety Controls
- The system explicitly scrubs phone numbers, emails, Aadhaar numbers, and raw numeric OTPs before inference.
- Transcripts analyzed through the API are processed in-memory and not stored in persistent databases without explicit user consent.

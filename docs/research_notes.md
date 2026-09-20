# Research Notes — ScamShield AI: Real-Time AI-Based Scam Detection Using NLP, Speech Analysis, and Machine Learning

## Title
**ScamShield AI: An Explainable Multi-Modal Framework for Telecommunication Fraud and Digital Arrest Scam Detection in Code-Mixed Environments**

---

## 1. Abstract
The proliferation of telecommunications fraud—ranging from credential harvesting (OTP/PIN theft) and fake KYC account suspensions to modern coercive digital arrest schemes—poses severe financial and psychological threats to citizens globally, and particularly within the Indian subcontinent. Existing spam filters are predominantly trained on monolingual English corpora and fail on code-mixed Hinglish dialects and spoken conversational call dynamics. In this research, we introduce **ScamShield AI**, an explainable artificial intelligence system combining natural language processing, speech transcription architecture, and hybrid risk scoring. We assemble and rigorously deduplicate a composite multi-source benchmark corpus of 8,233 unique samples (from 21,633 raw records) across four public datasets. We train classical baselines (TF-IDF with Logistic Regression, Naive Bayes, and Calibrated SVM) alongside a fine-tuned DistilBERT transformer. On a held-out stratified test set of 824 instances, DistilBERT achieves **98.79% accuracy** and **97.74% SCAM F1-score** with 8.92 ms average latency. We couple the classifier with a 17-class taxonomy and a weighted Explainable AI (XAI) risk engine ($0.70 \times P_{\text{scam}} + 0.30 \times \text{IndicatorScore}$), rendering transparent threat indicators and actionable advice via an interactive React dashboard and FastAPI backend.

---

## 2. Problem Statement
1. **Regional Blind Spots:** Traditional SMS spam filters (e.g., standard SpamAssassin or naive keyword filters) are heavily biased toward international email/SMS formats and fail to detect Indian terminology such as UPI, Aadhaar, PAN card, and Devanagari/Hinglish vocabulary.
2. **Evolution toward Conversational Fraud:** Modern cybercrime has transitioned from crude text links to multi-turn phone call extortion (such as fake CBI/police digital arrest claims and customs courier holds), which exhibit distinct conversational linguistics that single-line classifiers fail to understand.
3. **Black-Box Opacity:** High-risk scam classification requires immediate explainability. Users need to know *why* a call is suspicious (e.g., "Requests OTP", "Impersonates Police") rather than a single unexplained probability.

---

## 3. Objectives
1. Build a deduplicated, unified research corpus integrating UCI SMS, India Scam, Hinglish Scam, and Indian Cyber Scam PhoneCall datasets without test-set leakage.
2. Develop and benchmark classical ML baselines against transformer models.
3. Implement a 17-class fraud taxonomy and transparent risk-scoring engine ($0-100$).
4. Provide a decoupled, student-understandable architecture (React 19 frontend + FastAPI backend + PyTorch/scikit-learn inference).
5. Lay an architectural foundation for future speech-to-text (ASR) call interception via Whisper.

---

## 4. Proposed Architecture & Methodology

```
Audio Recording / Text Message
              │
              ▼
   Speech-to-Text / Input Parsing
   (Whisper ASR / Multi-turn Transcript)
              │
              ▼
   Sanitization & Entity Masking
   (Preserves ₹, OTP, UPI, KYC; Masks PII)
              │
              ▼
   Classifier Inference Engine
   ├── Classical ML: TF-IDF + Logistic Regression / SVM
   └── Deep Learning: Fine-tuned DistilBERT
              │
              ▼
    Category & Indicator Engine
    ├── 17-class hierarchical taxonomy
    └── 19 weighted fraud trigger rules
              │
              ▼
    Explainable Risk Estimator
    Risk = 0.70 × (P_scam × 100) + 0.30 × Score
              │
              ▼
    FastAPI Endpoints ──► Interactive React Dashboard
```

---

## 5. Experimental Results Summary

| Model | Accuracy | SCAM Precision | SCAM Recall | SCAM F1 | Latency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **DistilBERT (Fine-Tuned)** | **98.79%** | **97.74%** | **97.74%** | **97.74%** | 8.92 ms |
| **Linear SVM (Calibrated)** | 98.30% | 96.83% | 96.83% | 96.83% | 0.001 ms |
| **Logistic Regression (Baseline)** | 98.06% | 96.38% | 96.38% | 96.38% | 0.0003 ms |
| **Multinomial Naive Bayes** | 97.82% | 97.21% | 94.57% | 95.87% | 0.0003 ms |

---

## 6. Academic Limitations & Future Directions
1. **Telephony Interception:** Current mobile OS privacy models (Android/iOS) restrict automated third-party call recording. Full on-device real-time interception requires specialized OS-level accessibility services or VoIP proxying.
2. **Multilingual Indian NLP:** Future work will expand to native Devanagari Hindi, Tamil, Telugu, and Bengali using Google's MuRIL (`google/muril-base-cased`).
3. **End-to-End ASR Integration:** Direct integration of on-device quantised Whisper (`faster-whisper` / `whisper.cpp`) to run transcription entirely offline on consumer hardware.

---

## 7. References
1. Almeida, T. A., & Gómez Hidalgo, J. M. (2011). SMS Spam Collection. *UCI Machine Learning Repository*. DOI: 10.24432/C5CC84.
2. Sanh, V., Debut, L., Chaumond, J., & Wolf, T. (2019). DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter. *arXiv preprint arXiv:1910.01108*.
3. Radford, A., Kim, J. W., Xu, T., Brockman, G., McLeavey, C., & Sutskever, I. (2023). Robust speech recognition via large-scale weak supervision. *International Conference on Machine Learning (ICML)*.
4. Shrivastav, A. (2024). Scam-Hum-India Dataset. *Hugging Face*.
5. Bolewara, R. (2024). Hinglish & English Financial Scam/Fraud Text Dataset. *Hugging Face*.
6. Sangam, Y. (2024). Indian Cyber Scam PhoneCall Hinglish Dataset. *Hugging Face*.

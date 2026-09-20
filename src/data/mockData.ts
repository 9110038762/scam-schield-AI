import type { HistoryRecord, DatasetItem, ModelMetric } from '../types';

export const SYSTEM_STATUS = {
  version: "v1.0.0-research",
  statusBadge: "Active / Trained",
  isMock: false,
  backendPort: 8000,
  architecture: "FastAPI + PyTorch DistilBERT + Scikit-Learn Baselines"
};

export const OVERVIEW_STATS = {
  messagesAnalyzed: 8233,
  scamsDetected: 2203,
  safeMessages: 6030,
  highRiskCases: 1980
};

export const SCAM_DISTRIBUTION = [
  { name: 'Scam', value: 2203, color: '#f87171' }, // Red-400 (26.8%)
  { name: 'Safe', value: 6030, color: '#34d399' }  // Emerald-400 (73.2%)
];

export const RISK_DISTRIBUTION = [
  { name: 'Low (Safe)', value: 6030, color: '#34d399' },      // Green
  { name: 'Medium Risk', value: 223, color: '#fbbf24' },     // Amber
  { name: 'High Threat', value: 890, color: '#f97316' },     // Orange
  { name: 'Critical Scam', value: 1090, color: '#ef4444' }   // Red
];

export const RECENT_ANALYSES: HistoryRecord[] = [
  {
    id: "hist-1",
    timestamp: "10:42 AM",
    text: "URGENT: Your bank account will be blocked today. Verify your KYC immediately at http://secure-verify-bank.com",
    inputType: "SMS",
    prediction: "SCAM",
    riskLevel: "CRITICAL",
    confidence: 98.4,
    category: "KYC_FRAUD",
    language: "English",
    modelUsed: "DistilBERT (Fine-tuned)",
    indicators: ["Account Blocking Threat", "KYC Verification Urgency", "Suspicious URL / Link"]
  },
  {
    id: "hist-2",
    timestamp: "10:38 AM",
    text: "Your Amazon delivery package has been delivered to your front door. Thank you for shopping with us.",
    inputType: "SMS",
    prediction: "SAFE",
    riskLevel: "LOW",
    confidence: 99.1,
    category: "SAFE",
    language: "English",
    modelUsed: "DistilBERT (Fine-tuned)",
    indicators: []
  },
  {
    id: "hist-3",
    timestamp: "10:31 AM",
    text: "This is Inspector Vijay from Delhi Crime Branch. Your Aadhaar is linked to illegal narcotics. You are under digital arrest.",
    inputType: "Call Transcript",
    prediction: "SCAM",
    riskLevel: "CRITICAL",
    confidence: 99.6,
    category: "DIGITAL_ARREST",
    language: "English",
    modelUsed: "DistilBERT (Fine-tuned)",
    indicators: ["Digital Arrest Extortion", "Police / Legal Impersonation", "Threat Language"]
  },
  {
    id: "hist-4",
    timestamp: "10:24 AM",
    text: "Please send the 6-digit OTP sent to your phone immediately to verify your transaction of Rs 5000.",
    inputType: "SMS",
    prediction: "SCAM",
    riskLevel: "HIGH",
    confidence: 97.2,
    category: "OTP_FRAUD",
    language: "English",
    modelUsed: "Logistic Regression",
    indicators: ["OTP Request", "Urgent Language", "Money / Fee Demand"]
  },
  {
    id: "hist-5",
    timestamp: "09:15 AM",
    text: "Bhai kal college aayega kya? Assignment submit karna hai deadline se pehle.",
    inputType: "Chat",
    prediction: "SAFE",
    riskLevel: "LOW",
    confidence: 98.9,
    category: "SAFE",
    language: "Hinglish",
    modelUsed: "DistilBERT (Fine-tuned)",
    indicators: []
  }
];

export const SCAM_CATEGORY_DISTRIBUTION = [
  { name: 'Digital Arrest', value: 402 },
  { name: 'Phishing', value: 242 },
  { name: 'Blackmail', value: 126 },
  { name: 'Lottery Scam', value: 124 },
  { name: 'KYC Fraud', value: 80 },
  { name: 'OTP Fraud', value: 61 },
  { name: 'Refund Scam', value: 57 },
  { name: 'Bank Fraud', value: 38 },
  { name: 'UPI Fraud', value: 31 },
  { name: 'Courier Scam', value: 18 },
  { name: 'Job Scam', value: 5 },
  { name: 'Electricity Scam', value: 5 }
];

export const DATASET_SOURCES_INFO = [
  {
    name: "UCI SMS Spam Collection",
    sourceUrl: "https://archive.ics.uci.edu/dataset/228/sms+spam+collection",
    license: "CC BY 4.0",
    rawCount: "5,574",
    language: "English",
    labels: "ham / spam",
    type: "Real SMS",
    citation: "Almeida & Hidalgo (2011)"
  },
  {
    name: "Scam/Spam India Dataset",
    sourceUrl: "https://huggingface.co/datasets/anmolshrivastav/scam-hum-india",
    license: "Apache 2.0",
    rawCount: "2,272",
    language: "English & Hinglish",
    labels: "ham / spam",
    type: "Real + Synthetic",
    citation: "Shrivastav (2024)"
  },
  {
    name: "Hinglish Financial Scam Dataset",
    sourceUrl: "https://huggingface.co/datasets/bolewara/hinglish-scam-text-dataset",
    license: "CC BY 4.0",
    rawCount: "3,787",
    language: "English, Hindi, Hinglish",
    labels: "0 (benign) / 1 (scam)",
    type: "Financial SMS/Chat",
    citation: "Bolewara (2024)"
  },
  {
    name: "Indian Cyber Scam PhoneCall Hinglish",
    sourceUrl: "https://huggingface.co/datasets/ysangam/Indian_Cyber_Scam_PhoneCall_Hinglish_Dataset",
    license: "Apache 2.0",
    rawCount: "10,000",
    language: "Hinglish & Hindi",
    labels: "0 (safe) / 1 (scam)",
    type: "Call Transcripts",
    citation: "Sangam (2024)"
  }
];

export const DATASET_PREVIEW: DatasetItem[] = [
  {
    id: "ds-1",
    message: "Urgent: Update your KYC details now to avoid immediate account suspension. Click link: bit.ly/kyc-update-now",
    label: "SCAM",
    scamType: "KYC_FRAUD",
    containsUrl: true,
    urgency: true,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-2",
    message: "Cyber Crime Department se bol raha hoon, aapke naam par case hai aur aap digital arrest mein hain. Camera on rakhein.",
    label: "SCAM",
    scamType: "DIGITAL_ARREST",
    containsUrl: false,
    urgency: true,
    otpRequest: false,
    paymentRequest: true
  },
  {
    id: "ds-3",
    message: "Hello! Just a reminder that we have a project review meeting tomorrow at 10 AM in the seminar hall.",
    label: "SAFE",
    scamType: "SAFE",
    containsUrl: false,
    urgency: false,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-4",
    message: "Congratulations! You have been selected for a work-from-home job paying Rs. 8000 daily. WhatsApp us to start.",
    label: "SCAM",
    scamType: "JOB_SCAM",
    containsUrl: false,
    urgency: false,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-5",
    message: "Your OTP for transaction at Merchant is 482019. Do not share this with anyone, including bank staff.",
    label: "SAFE",
    scamType: "SAFE",
    containsUrl: false,
    urgency: false,
    otpRequest: true,
    paymentRequest: false
  },
  {
    id: "ds-6",
    message: "Urgent call from customer care: Your credit card transaction of 25,000 has been approved. If not you, share OTP to cancel.",
    label: "SCAM",
    scamType: "OTP_FRAUD",
    containsUrl: false,
    urgency: true,
    otpRequest: true,
    paymentRequest: true
  },
  {
    id: "ds-7",
    message: "Sir aapka international FedEx parcel hold par hai, customs duty clearance charge pay karna hoga.",
    label: "SCAM",
    scamType: "COURIER_SCAM",
    containsUrl: false,
    urgency: true,
    otpRequest: false,
    paymentRequest: true
  },
  {
    id: "ds-8",
    message: "Bro, kal college aa raha hai? Assignment ka printout le aana.",
    label: "SAFE",
    scamType: "SAFE",
    containsUrl: false,
    urgency: false,
    otpRequest: false,
    paymentRequest: false
  }
];

export const PREPROCESSING_STAGES = [
  {
    stage: "1. Raw Multi-Source Ingestion",
    description: "Accepts raw data across UCI SMS, India Scam, Hinglish Scam, and Indian Cyber PhoneCall datasets (21,633 records)."
  },
  {
    stage: "2. Unicode & PII Sanitization",
    description: "Standardizes Unicode NFKC, strips HTML tags, and masks sensitive phone numbers, Aadhaar IDs, and OTP digits while preserving scam cues."
  },
  {
    stage: "3. Deduplication (Leakage Prevention)",
    description: "Detects and removes 13,383 exact duplicate instances BEFORE train/val/test splitting, guaranteeing zero test set leakage."
  },
  {
    stage: "4. Category & Language Taxonomy",
    description: "Maps and infers records into a transparent 17-class taxonomy and normalizes language (English, Hindi, Hinglish, Other)."
  },
  {
    stage: "5. Stratified Splitting (80/10/10)",
    description: "Splits 8,233 unique records into 6,586 train, 823 validation, and 824 test rows stratified by SCAM/SAFE with reproducible seed=42."
  },
  {
    stage: "6. Vectorization & Fine-Tuning",
    description: "Generates sublinear TF-IDF n-grams for classical baselines and subword tokens for PyTorch DistilBERT transformer fine-tuning."
  }
];

export const MODEL_EVALUATION_METRICS: ModelMetric[] = [
  {
    model: "DistilBERT (Fine-tuned Transformer)",
    accuracy: "98.79%",
    precision: "97.74%",
    recall: "97.74%",
    f1Score: "97.74%"
  },
  {
    model: "Linear SVM (Calibrated TF-IDF)",
    accuracy: "98.30%",
    precision: "96.83%",
    recall: "96.83%",
    f1Score: "96.83%"
  },
  {
    model: "Logistic Regression (TF-IDF Baseline)",
    accuracy: "98.06%",
    precision: "96.38%",
    recall: "96.38%",
    f1Score: "96.38%"
  },
  {
    model: "Multinomial Naive Bayes (TF-IDF)",
    accuracy: "97.82%",
    precision: "97.21%",
    recall: "94.57%",
    f1Score: "95.87%"
  }
];

export const SAMPLE_SCAMS = [
  {
    id: "sample-1",
    label: "Bank KYC Suspension",
    text: "URGENT: Your bank account will be blocked today. Verify your KYC immediately using the link below: http://secure-verify-bank.com/login"
  },
  {
    id: "sample-2",
    label: "OTP Theft Attempt",
    text: "Dear customer, your credit card transaction of Rs 25,000 has been initiated. If not done by you, immediately share the 6-digit OTP to cancel."
  },
  {
    id: "sample-3",
    label: "UPI Cashback Fraud",
    text: "Sir, congratulations! You have received ₹3,500 cashback from Google Pay. Open your UPI app and approve the request to claim."
  },
  {
    id: "sample-4",
    label: "Normal Notification",
    text: "Your order has been delivered successfully. Thank you for shopping with us."
  }
];

export const SAMPLE_CALL_TRANSCRIPTS = [
  {
    id: "call-1",
    label: "Digital Arrest Coercion Call",
    text: "Caller: Hello, I am Inspector Sharma from the Delhi Cyber Crime Police Department.\nCaller: An arrest warrant has been issued in your name for money laundering.\nCaller: You are being placed under digital arrest right now. Keep your camera turned on and do not disconnect this call or local police will arrive."
  },
  {
    id: "call-2",
    label: "Bank Account KYC Freeze Call",
    text: "Caller: Good afternoon sir, I am speaking from your bank's central head office.\nCaller: We notice that your PAN and Aadhaar KYC documents have expired today.\nCaller: As per RBI regulations, your debit card and net banking will be permanently blocked by 5 PM.\nCaller: To complete immediate electronic re-verification, please read out the 6-digit verification code just delivered to your mobile."
  },
  {
    id: "call-3",
    label: "Customs Parcel Blackmail Call",
    text: "Caller: Sir, this is customs parcel clearance officer calling from Mumbai International Airport.\nCaller: We have detained a FedEx parcel addressed to your name containing illegal foreign currency.\nCaller: A legal FIR is being lodged unless you immediately transfer ₹25,000 clearance penalty fee."
  },
  {
    id: "call-4",
    label: "Legitimate Personal Hinglish Call",
    text: "Caller: Haan bhai, main bol raha hoon. Kal project review meeting kitne baje rakha hai?\nCaller: Theek hai, main laptop aur presentation slides leke college pahunch jaunga 10 baje."
  }
];

export const DEMO_ASR_TRANSCRIPT = 
  "Caller: This is a verification call from your bank's fraud monitoring cell. Your account will be suspended unless you provide the OTP sent to your phone immediately to verify your transaction.";

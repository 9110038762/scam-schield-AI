import type { HistoryRecord, DatasetItem, ModelMetric } from '../types';

export const SYSTEM_STATUS = {
  version: "v1.0.0",
  statusBadge: "Active",
  isMock: false
};

export const OVERVIEW_STATS = {
  messagesAnalyzed: 128,
  scamsDetected: 71,
  safeMessages: 57,
  highRiskCases: 43
};

export const SCAM_DISTRIBUTION = [
  { name: 'Scam', value: 71, color: '#f87171' }, // Red-400
  { name: 'Safe', value: 57, color: '#34d399' }  // Emerald-400
];

export const RISK_DISTRIBUTION = [
  { name: 'Low', value: 45, color: '#34d399' },      // Green
  { name: 'Medium', value: 25, color: '#fbbf24' },   // Amber
  { name: 'High', value: 38, color: '#f97316' },     // Orange
  { name: 'Critical', value: 20, color: '#ef4444' }  // Red
];

export const RECENT_ANALYSES: HistoryRecord[] = [
  {
    id: "hist-1",
    timestamp: "10:42 AM",
    text: "URGENT: Your bank account will be blocked today. Verify your account immediately using the link below.",
    inputType: "SMS",
    prediction: "SCAM",
    riskLevel: "HIGH",
    confidence: 94,
    indicators: ["Urgency", "Account threat", "Suspicious link"]
  },
  {
    id: "hist-2",
    timestamp: "10:38 AM",
    text: "Your order has been delivered successfully. Thank you for shopping with us.",
    inputType: "SMS",
    prediction: "SAFE",
    riskLevel: "LOW",
    confidence: 91,
    indicators: []
  },
  {
    id: "hist-3",
    timestamp: "10:31 AM",
    text: "Dear customer, we detected a login attempt from a new device. If this wasn't you, click here to secure your account immediately.",
    inputType: "Email",
    prediction: "SCAM",
    riskLevel: "HIGH",
    confidence: 89,
    indicators: ["Suspicious URL", "Account threat", "Urgency"]
  },
  {
    id: "hist-4",
    timestamp: "10:24 AM",
    text: "Please send the OTP sent to your phone immediately to verify your transaction of Rs 5000.",
    inputType: "SMS",
    prediction: "SCAM",
    riskLevel: "MEDIUM",
    confidence: 78,
    indicators: ["OTP request", "Urgency"]
  },
  {
    id: "hist-5",
    timestamp: "09:15 AM",
    text: "Are we still meeting for lunch today? Let me know.",
    inputType: "Chat",
    prediction: "SAFE",
    riskLevel: "LOW",
    confidence: 98,
    indicators: []
  }
];

export const SCAM_CATEGORY_DISTRIBUTION = [
  { name: 'Phishing', value: 35 },
  { name: 'OTP Scam', value: 25 },
  { name: 'Banking Scam', value: 20 },
  { name: 'Investment Scam', value: 15 },
  { name: 'Job Scam', value: 12 },
  { name: 'Reward/Lottery', value: 18 },
  { name: 'Impersonation', value: 22 },
  { name: 'Delivery/Refund', value: 8 }
];

export const DATASET_PREVIEW: DatasetItem[] = [
  {
    id: "ds-1",
    message: "Urgent: Update your KYC details now to avoid immediate account suspension. Click link: bit.ly/kyc-update-now",
    label: "SCAM",
    scamType: "Phishing / Banking",
    containsUrl: true,
    urgency: true,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-2",
    message: "Hi Mom, I lost my phone. This is my new number. Can you transfer 5000 to this account for my taxi?",
    label: "SCAM",
    scamType: "Impersonation",
    containsUrl: false,
    urgency: true,
    otpRequest: false,
    paymentRequest: true
  },
  {
    id: "ds-3",
    message: "Hello! Just a reminder that we have a meeting tomorrow at 10 AM in the conference room.",
    label: "SAFE",
    scamType: "N/A",
    containsUrl: false,
    urgency: false,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-4",
    message: "Congratulations! You have been selected for a work-from-home job paying Rs. 8000 daily. WhatsApp us to start.",
    label: "SCAM",
    scamType: "Job Scam",
    containsUrl: false,
    urgency: false,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-5",
    message: "Your OTP for transaction at Merchant is 482019. Do not share this with anyone, including bank staff.",
    label: "SAFE",
    scamType: "N/A",
    containsUrl: false,
    urgency: false,
    otpRequest: true,
    paymentRequest: false
  },
  {
    id: "ds-6",
    message: "Urgent call from customer care: Your credit card transaction of 25,000 has been approved. If not you, share OTP to cancel.",
    label: "SCAM",
    scamType: "OTP / Banking",
    containsUrl: false,
    urgency: true,
    otpRequest: true,
    paymentRequest: true
  },
  {
    id: "ds-7",
    message: "Your Amazon package could not be delivered due to incorrect address. Update details here: amazon-courier-retry.com",
    label: "SCAM",
    scamType: "Delivery/Refund",
    containsUrl: true,
    urgency: true,
    otpRequest: false,
    paymentRequest: false
  },
  {
    id: "ds-8",
    message: "Let's review the quarterly budget spreadsheet this afternoon. I've sent it to your email.",
    label: "SAFE",
    scamType: "N/A",
    containsUrl: false,
    urgency: false,
    otpRequest: false,
    paymentRequest: false
  }
];

export const PREPROCESSING_STAGES = [
  {
    stage: "1. Raw Input Message",
    description: "Accepts unstructured text from SMS, email transcripts, or chat messages."
  },
  {
    stage: "2. Text Cleaning",
    description: "Removes HTML tags, special symbols, punctuation, and converts all characters to lowercase to standardize terms."
  },
  {
    stage: "3. Tokenization",
    description: "Splits paragraphs or sentences into individual words or tokens for vector representation."
  },
  {
    stage: "4. Normalization / Stopwords",
    description: "Removes non-informative words (e.g. 'the', 'is', 'at') and performs lemmatization to extract root words."
  },
  {
    stage: "5. TF-IDF Vectorization",
    description: "Converts clean word tokens into a numerical feature vector highlighting highly specific terms (e.g. 'OTP', 'locked')."
  },
  {
    stage: "6. Classifier Inference",
    description: "Feeds the generated feature vector into a trained ML model to output a class probability."
  }
];

export const MODEL_EVALUATION_METRICS: ModelMetric[] = [
  {
    model: "Logistic Regression (Proposed Baseline)",
    accuracy: "92.4%",
    precision: "91.2%",
    recall: "93.5%",
    f1Score: "92.3%"
  },
  {
    model: "Support Vector Machine (SVM)",
    accuracy: "94.1%",
    precision: "93.8%",
    recall: "94.5%",
    f1Score: "94.1%"
  },
  {
    model: "Random Forest Classifier",
    accuracy: "95.6%",
    precision: "96.1%",
    recall: "95.0%",
    f1Score: "95.5%"
  }
];

export const SAMPLE_SCAMS = [
  {
    id: "sample-1",
    label: "Bank Impersonation",
    text: "URGENT: Your bank account will be blocked today. Verify your account immediately using the link below: http://secure-verify-bank.com/login"
  },
  {
    id: "sample-2",
    label: "Reward/Lottery Scam",
    text: "Congratulations! You have won a ₹50,000 reward from ScamShield Lucky Draw. Click here to claim your cash prize instantly: http://win-rewards.in/claim"
  },
  {
    id: "sample-3",
    label: "Safe Notification",
    text: "Your order has been delivered successfully. Thank you for shopping with us."
  }
];

export const DEMO_ASR_TRANSCRIPT = 
  "This is a verification call from your bank. Your account will be suspended unless you provide the OTP sent to your phone immediately to verify your transaction.";

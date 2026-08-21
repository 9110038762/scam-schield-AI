# ScamShield AI — Scam Detection Dashboard

Welcome to the official repository for **ScamShield AI**, an AI-assisted detection system designed to identify and analyze fraudulent communication. This dashboard provides interface capabilities, database schemas, text-preprocessing operations, model-evaluation metrics, and voice-transcription integration.

## 🚀 Quick Start

### 1. Installation
Install all Node.js dependencies including Tailwind CSS v4, Lucide icons, and Recharts graph modules:
```bash
npm install
```

### 2. Run Locally in Development Mode
Launch the Vite local server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the dashboard.

### 3. Build for Production
Verify typescript compilation and build the static assets:
```bash
npm run build
```

---

## 🛠️ Project Tech Stack
- **Frontend Framework:** React 19 (TypeScript)
- **Bundler:** Vite
- **Styling Engine:** Tailwind CSS v4 (incorporating glassmorphism cards and custom scrollbars)
- **Icon Assets:** Lucide React icons
- **Visual Analytics:** Recharts (pie/donut distribution and horizontal category frequency bars)

---

## 📂 Core Project Directory Layout
```text
/
├── src/
│   ├── types/
│   │   └── index.ts          # Consolidated TypeScript type interfaces
│   ├── data/
│   │   └── mockData.ts       # Structured placeholder datasets and logs
│   ├── services/
│   │   └── scamDetection.ts  # Rule-based NLP pattern classifier
│   ├── components/
│   │   ├── Sidebar.tsx       # Global navigation bar
│   │   ├── Header.tsx        # Title banner and prototype badge status
│   │   ├── StatCard.tsx      # Overview KPIs
│   │   ├── RiskGauge.tsx     # Circular SVGs + linear risk bar (0-100)
│   │   ├── PredictionCard.tsx# SCAM/SAFE decision display
│   │   ├── IndicatorCard.tsx # Detailed Explainable AI trigger markers
│   │   ├── DatasetCharts.tsx # Recharts pie and horizontal bar charts
│   │   ├── ModelTable.tsx    # Multi-model evaluation and curve placeholders
│   │   ├── MessageAnalyzer.tsx# Text parser panel (sample load triggers)
│   │   ├── ASRPanel.tsx      # Experimental voice transcription parser
│   │   ├── OverviewTab.tsx   # Dashboard main screen compilation
│   │   ├── AnalyzeTab.tsx    # SMS/Email analyzer screen
│   │   ├── VoiceTab.tsx      # Voice call simulation screen
│   │   ├── DatasetTab.tsx    # Preprocessing flow and preview schemas
│   │   ├── ModelEvaluationTab# Metrics matrices and mathematical formulations
│   │   └── HistoryTab.tsx    # Searchable and filtered detection audit log
│   ├── index.css             # Tailwind v4 directives and CSS adjustments
│   ├── main.tsx              # Application index entry point
│   └── App.tsx               # State router linking dashboard pages
├── package.json              # Script directives and node packages
└── vite.config.ts            # Vite compile settings (Tailwind v4 integration)
```

---

## 🧠 Technical Pipeline & Mock Logic

### 1. Mock NLP Inference Engine
To deliver a fully functional dashboard prior to training completion, `src/services/scamDetection.ts` checks inputs for weighted trigger patterns:
* **OTP Tokens (Weight: 35):** Checks for `otp`, `pin`, `password`, `verification code`
* **Account Threats (Weight: 30):** Checks for `block`, `suspend`, `freeze`, `kyc`, `verification`
* **Urgency Signals (Weight: 20):** Checks for `urgent`, `immediately`, `now`, `today`
* **Reward Offers (Weight: 30):** Checks for `congratulations`, `win`, `winner`, `lottery`, `reward`
* **Suspicious Links (Weight: 25):** Checks for `http`, `https`, `www.`, `click here`
* **Payment Requests (Weight: 20):** Checks for `payment`, `transfer`, `money`, `rs`, `upi`

The cumulative score determines the risk category:
* **Risk Score ≥ 75:** `SCAM` Classification / `CRITICAL` Risk Level (88%–97% confidence)
* **Risk Score ≥ 45:** `SCAM` Classification / `HIGH` Risk Level (80%–91% confidence)
* **Risk Score ≥ 20:** `SCAM` Classification / `MEDIUM` Risk Level (65%–79% confidence)
* **Risk Score < 20:** `SAFE` Classification / `LOW` Risk Level (85%–97% confidence)

---

## 🔌 Real ML Integration Preparation

When the Python ML classifier backend is ready, replace `analyzeMessage` in `src/services/scamDetection.ts` with an asynchronous API fetch:

### Expected Flask / FastAPI Endpoint
- **Method:** `POST`
- **Route:** `/predict`
- **Request Format:**
  ```json
  {
    "text": "URGENT: Your bank account will be blocked today. Click http://bank-secure.com"
  }
  ```
- **Response Format:**
  ```json
  {
    "prediction": "SCAM",
    "confidence": 92.4,
    "risk_score": 87,
    "risk_level": "HIGH",
    "indicators": [
      { "name": "Urgent Language", "description": "Creates pressure for immediate action." },
      { "name": "Account Threat", "description": "Threatens account suspension to induce panic." },
      { "name": "Suspicious URL", "description": "Contains a link that should be independently verified." }
    ],
    "recommendation": "⚠ Recommended Action: Do NOT share OTPs, passwords, PINs, or banking credentials."
  }
  ```

### Code Replacement Example (`src/services/scamDetection.ts`)
```typescript
export async function analyzeMessage(text: string): Promise<AnalysisResult> {
  const response = await fetch('http://YOUR_API_IP:8000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error('Model inference service failed');
  return await response.json();
}
```

---

## 🎙️ Speech-to-Text / ASR Integration

The voice pipeline is modeled around standard audio recording capture translated into text transcripts. To replace the simulation:
1. Bind a Python Whisper ASR listener or leverage a public service (like Deepgram or OpenAI Whisper API).
2. Create a multipart upload endpoint in your server to transcribe audio files:
   - **Method:** `POST`
   - **Route:** `/transcribe`
   - **Form Data:** `{ "file": audio_binary }`
   - **Response:** `{ "transcript": "transcribed call text here" }`
3. Feed the resulting text transcript into the `/predict` NLP classification pipeline as illustrated in the ASR page flow diagram.

---

## 📊 Updating Dataset & Model Metrics

To replace the placeholder values shown on the **Dataset Explorer** and **Model Evaluation** pages once experimental results are recorded:
- **Dataset Splitting:** Update the `OVERVIEW_STATS` and `SCAM_DISTRIBUTION` values in `src/data/mockData.ts` with findings from your Exploratory Data Analysis (EDA).
- **Categories:** Add or modify categories inside the `SCAM_CATEGORY_DISTRIBUTION` array in `src/data/mockData.ts`.
- **Model Parameters:** Edit the `MODEL_EVALUATION_METRICS` table array in `src/data/mockData.ts` with real accuracy, precision, recall, and F1 scores when training completes.

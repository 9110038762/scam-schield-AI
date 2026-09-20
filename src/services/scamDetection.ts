import type { AnalysisResult, Indicator, RiskLevel, PredictionType, InputType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ online: boolean; models?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { online: true, models: data.models_loaded };
    }
  } catch {
    // Backend is currently offline
  }
  return { online: false };
}

export async function fetchModelBenchmarks(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/models`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return null if offline
  }
  return null;
}

export async function fetchDatasetInfo(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/dataset-info`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return null if offline
  }
  return null;
}

/**
 * Primary inference service connected to the ScamShield FastAPI ML backend.
 * Falls back to local heuristic detection if backend server is unreachable.
 */
export async function analyzeMessage(
  text: string,
  modelPreference: string = 'best',
  inputType: InputType = 'SMS'
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_preference: modelPreference,
        input_type: inputType,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        prediction: data.prediction as PredictionType,
        confidence: data.confidence,
        riskScore: data.risk_score,
        riskLevel: data.risk_level as RiskLevel,
        category: data.category,
        categoryDescription: data.category_description,
        language: data.language,
        indicators: data.indicators || [],
        explanation: data.explanation || [],
        recommendation: data.recommendation,
        modelUsed: data.model_used,
        latencyMs: data.latency_ms,
        isOfflineFallback: false,
      };
    }
  } catch (err) {
    console.warn('ScamShield API server unavailable, falling back to local heuristics:', err);
  }

  // Graceful offline fallback if FastAPI is not yet running
  return runOfflineFallback(text);
}

function runOfflineFallback(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  const detectedIndicators: Indicator[] = [];
  let riskScore = 0;

  if (/\b(otp|pin|password|passcode|credential)\b/.test(lowerText) || lowerText.includes("one time password")) {
    detectedIndicators.push({
      name: "OTP Request",
      description: "Requests a sensitive authentication code or credential."
    });
    riskScore += 35;
  }

  if (/\b(block|suspend|close|freeze|deactivate|expire|kyc|verify|verification)\b/.test(lowerText) || lowerText.includes("account blocked")) {
    detectedIndicators.push({
      name: "Account Threat / KYC",
      description: "Threatens account suspension or requires emergency verification."
    });
    riskScore += 30;
  }

  if (/\b(urgent|immediately|now|today|quick|hurry)\b/.test(lowerText)) {
    detectedIndicators.push({
      name: "Urgent Language",
      description: "Creates urgency to bypass deliberation."
    });
    riskScore += 20;
  }

  if (/\b(congratulations|won|winner|reward|prize|lottery|lucky draw)\b/.test(lowerText)) {
    detectedIndicators.push({
      name: "Reward Offer",
      description: "Promises financial gains or rewards to entice the victim."
    });
    riskScore += 30;
  }

  if (lowerText.includes("http") || lowerText.includes("www.") || lowerText.includes("click here")) {
    detectedIndicators.push({
      name: "Suspicious URL",
      description: "Directs to an external unverified web link."
    });
    riskScore += 25;
  }

  if (/\b(upi|gpay|phonepe|paytm|transfer|money|rs|rupees)\b/.test(lowerText)) {
    detectedIndicators.push({
      name: "Payment Request",
      description: "Asks for direct monetary transfers or financial transactions."
    });
    riskScore += 20;
  }

  if (lowerText.includes("digital arrest") || lowerText.includes("police") || lowerText.includes("cyber crime")) {
    detectedIndicators.push({
      name: "Digital Arrest / Authority",
      description: "Coercive impersonation claiming legal arrest or investigation."
    });
    riskScore += 40;
  }

  riskScore = Math.min(riskScore, 100);

  let prediction: PredictionType = 'SAFE';
  let riskLevel: RiskLevel = 'LOW';
  let confidence = 88;

  if (riskScore >= 75) {
    prediction = 'SCAM';
    riskLevel = 'CRITICAL';
    confidence = 94;
  } else if (riskScore >= 45) {
    prediction = 'SCAM';
    riskLevel = 'HIGH';
    confidence = 86;
  } else if (riskScore >= 20) {
    prediction = 'SCAM';
    riskLevel = 'MEDIUM';
    confidence = 74;
  } else {
    prediction = 'SAFE';
    riskLevel = 'LOW';
    confidence = 92;
    riskScore = Math.max(8, riskScore);
  }

  let category = "SAFE";
  if (prediction === 'SCAM') {
    if (lowerText.includes("digital arrest")) category = "DIGITAL_ARREST";
    else if (lowerText.includes("otp")) category = "OTP_FRAUD";
    else if (lowerText.includes("kyc") || lowerText.includes("aadhaar")) category = "KYC_FRAUD";
    else if (lowerText.includes("lottery") || lowerText.includes("won")) category = "LOTTERY_SCAM";
    else if (lowerText.includes("upi")) category = "UPI_FRAUD";
    else category = "OTHER_SCAM";
  }

  return {
    prediction,
    confidence,
    riskScore,
    riskLevel,
    category,
    categoryDescription: "Rule-based category assignment (offline heuristic mode).",
    language: "English",
    indicators: detectedIndicators,
    explanation: [
      prediction === 'SCAM' 
        ? "Flagged by local heuristic rule-base: detected urgent payment or identity harvesting patterns."
        : "No significant fraud triggers identified."
    ],
    recommendation: prediction === 'SCAM'
      ? "⚠ Recommended Action: Do NOT share OTPs, passwords, PINs, or banking credentials. Verify the sender through official channels."
      : "✓ Recommended Action: This message appears safe based on keyword analysis.",
    modelUsed: "Heuristic Baseline (Backend Offline)",
    latencyMs: 1.2,
    isOfflineFallback: true,
  };
}

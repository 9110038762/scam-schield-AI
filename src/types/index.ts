export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PredictionType = 'SCAM' | 'SAFE';
export type InputType = 'SMS' | 'Email' | 'Voice Transcript' | 'Chat';

export interface Indicator {
  name: string;
  description: string;
}

export interface AnalysisResult {
  prediction: PredictionType;
  confidence: number; // percentage (0-100)
  riskScore: number; // score (0-100)
  riskLevel: RiskLevel;
  indicators: Indicator[];
  recommendation: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  text: string;
  inputType: InputType;
  prediction: PredictionType;
  riskLevel: RiskLevel;
  confidence: number;
  indicators: string[];
}

export interface DatasetItem {
  id: string;
  message: string;
  label: PredictionType;
  scamType: string;
  containsUrl: boolean;
  urgency: boolean;
  otpRequest: boolean;
  paymentRequest: boolean;
}

export interface ModelMetric {
  model: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
}

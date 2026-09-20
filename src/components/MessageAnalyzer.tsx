import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronDown, ChevronUp, Cpu, RefreshCw, MessageSquare, PhoneCall, Radio } from 'lucide-react';
import { SAMPLE_SCAMS, SAMPLE_CALL_TRANSCRIPTS } from '../data/mockData';
import { analyzeMessage, checkBackendHealth } from '../services/scamDetection';
import type { AnalysisResult, InputType } from '../types';
import { PredictionCard } from './PredictionCard';
import { RiskGauge } from './RiskGauge';
import { IndicatorCard } from './IndicatorCard';
import { RecommendationCard } from './RecommendationCard';

interface MessageAnalyzerProps {
  onAnalysisSuccess?: (text: string, result: AnalysisResult, type: InputType) => void;
  defaultText?: string;
  inputType?: InputType;
}

export const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ 
  onAnalysisSuccess,
  defaultText = '',
  inputType = 'SMS'
}) => {
  const [text, setText] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [mode, setMode] = useState<'message' | 'call_transcript'>('message');
  const [selectedModel, setSelectedModel] = useState<string>('best');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.online));
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const activeInputType: InputType = mode === 'call_transcript' ? 'Call Transcript' : inputType;
      const analysis = await analyzeMessage(text, selectedModel, activeInputType);
      setResult(analysis);
      if (onAnalysisSuccess) {
        onAnalysisSuccess(text, analysis, activeInputType);
      }
    } catch (e) {
      console.error('Analysis error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  const loadSample = (sampleText: string) => {
    setText(sampleText);
    setResult(null);
  };

  const steps = [
    { label: "Raw Input", note: mode === 'call_transcript' ? "Multi-turn call transcript" : "SMS/Email raw string" },
    { label: "PII Masking", note: "Masks phone, Aadhaar, email" },
    { label: "Tokenization", note: "Subword / word n-grams" },
    { label: "Feature Extraction", note: "TF-IDF / Transformer embeddings" },
    { label: "Classifier Model", note: result?.modelUsed || "DistilBERT / LR" },
    { label: "Category Layer", note: "17-class taxonomy mapping" },
    { label: "Indicator Engine", note: "Weighted pattern scoring" },
    { label: "Risk Estimator", note: "Formula: 0.70*P + 0.30*Score" }
  ];

  return (
    <div className="space-y-6">
      {/* Mode & Backend Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setMode('message'); setText(''); setResult(null); }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'message'
                ? 'bg-cyan-600 text-slate-950 font-bold shadow'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Single Message Mode (SMS / Email)</span>
          </button>

          <button
            onClick={() => { setMode('call_transcript'); setText(''); setResult(null); }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'call_transcript'
                ? 'bg-cyan-600 text-slate-950 font-bold shadow'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Transcript Mode (Phone Audio)</span>
          </button>
        </div>

        {/* Model Selection Dropdown */}
        <div className="flex items-center space-x-3 text-xs">
          <label className="font-mono text-slate-400">Classifier:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="best">Auto / Best (DistilBERT)</option>
            <option value="distilbert">DistilBERT Transformer</option>
            <option value="logistic_regression">Logistic Regression (TF-IDF)</option>
            <option value="svm">Linear SVM (Calibrated)</option>
            <option value="naive_bayes">Multinomial Naive Bayes</option>
          </select>

          {/* Backend Status Badge */}
          <div className="flex items-center space-x-1.5 font-mono text-[11px] pl-2 border-l border-slate-800">
            {backendOnline ? (
              <span className="flex items-center text-emerald-400 font-semibold" title="FastAPI backend active on port 8000">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                FastAPI: Online
              </span>
            ) : backendOnline === false ? (
              <span className="flex items-center text-amber-400 font-semibold" title="Using local heuristic fallback">
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
                Offline Mode
              </span>
            ) : (
              <span className="text-slate-500">Connecting...</span>
            )}
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block">
            {mode === 'call_transcript' ? 'Phone Call Transcript (Simulated Conversation)' : 'Communication Message Text'}
          </label>
          {mode === 'call_transcript' && (
            <span className="text-[11px] text-cyan-400 font-mono flex items-center space-x-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Multi-turn Conversation Analysis</span>
            </span>
          )}
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            mode === 'call_transcript'
              ? "Paste conversation transcript here (e.g.,\nCaller: Hello, I am calling from your bank.\nCaller: Your KYC is incomplete and your account will be blocked today.\nCaller: Please share the OTP you received.)"
              : "Paste a suspicious SMS, email, chat message, or notification here..."
          }
          className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans resize-none transition-colors"
          maxLength={3000}
        />
        
        {/* Sample Loading Buttons */}
        <div className="flex flex-wrap justify-between items-center mt-3 gap-2">
          <span className="text-[11px] font-mono text-slate-500">
            {text.length} / 3000 characters
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 py-1 mr-1">Load Samples:</span>
            {(mode === 'call_transcript' ? SAMPLE_CALL_TRANSCRIPTS : SAMPLE_SCAMS).map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSample(sample.text)}
                className="text-[10px] font-semibold text-cyan-400/90 bg-cyan-950/20 border border-cyan-900/40 hover:bg-cyan-950/40 hover:text-cyan-300 px-2.5 py-1 rounded transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-5 pt-4 border-t border-slate-900">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running ScamShield Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-slate-950 fill-current" />
                <span>{mode === 'call_transcript' ? 'Analyze Call Transcript' : 'Analyze Message'}</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleClear}
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Metadata Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-slate-500 mr-1.5">Model:</span>
                <span className="text-cyan-300 font-bold">{result.modelUsed || "DistilBERT"}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">Language:</span>
                <span className="text-slate-300 font-semibold">{result.language || "English"}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">Category:</span>
                <span className="text-amber-400 font-bold">{result.category || "SAFE"}</span>
              </div>
            </div>
            {result.latencyMs !== undefined && (
              <div className="text-slate-400">
                <span>Inference Latency: </span>
                <span className="text-emerald-400 font-bold">{result.latencyMs} ms</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Prediction & Category Details */}
            <div className="lg:col-span-2 space-y-6">
              <PredictionCard 
                prediction={result.prediction} 
                confidence={result.confidence}
                category={result.category}
                categoryDescription={result.categoryDescription}
                modelUsed={result.modelUsed}
              />
              <RecommendationCard 
                recommendation={result.recommendation} 
                prediction={result.prediction} 
              />
            </div>
            
            {/* Column 2: Risk Scoring */}
            <div>
              <RiskGauge 
                score={result.riskScore} 
                level={result.riskLevel} 
                prediction={result.prediction} 
              />
            </div>
          </div>

          {/* Indicator Card & Explanation Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IndicatorCard 
              indicators={result.indicators} 
              prediction={result.prediction} 
            />

            {/* Explainable AI Reasoning Card */}
            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/80 flex flex-col h-full">
              <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-3">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Explainable AI Reasoning
                </h4>
              </div>

              {result.explanation && result.explanation.length > 0 ? (
                <div className="space-y-3 flex-1 font-sans text-xs">
                  {result.explanation.map((reason, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60 flex items-start space-x-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                      <p className="text-slate-300 leading-relaxed">{reason}</p>
                    </div>
                  ))}
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/40 border border-slate-900 text-[11px] font-mono text-slate-500">
                    Formula: <span className="text-slate-300">Scam Risk Score = 0.70 × (P_scam × 100) + 0.30 × Indicator_Score</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono py-6 text-center">
                  No automated explanation generated.
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Detection Pipeline Flow */}
          <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => setPipelineOpen(!pipelineOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-900/50 transition-colors text-left"
            >
              <div className="flex items-center space-x-2.5 text-slate-200">
                <Cpu className="w-4.5 h-4.5 text-cyan-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase">
                  Technical Pipeline Inspection (Research Model)
                </span>
              </div>
              {pipelineOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {pipelineOpen && (
              <div className="p-6 bg-slate-950/40 border-t border-slate-900 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {steps.map((s, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800/60 rounded p-2.5 text-center flex flex-col justify-between">
                      <span className="text-[10px] font-bold font-mono text-cyan-400 block mb-1">
                        {s.label}
                      </span>
                      <span className="text-[9px] text-slate-500 leading-normal font-sans">
                        {s.note}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-900 pt-4 text-xs font-mono">
                  <div className="bg-slate-900/20 p-3 rounded border border-slate-900/60">
                    <span className="text-slate-500 block mb-1">Inference Engine</span>
                    <span className="text-slate-300 font-semibold">{result.modelUsed || "DistilBERT"}</span>
                  </div>
                  <div className="bg-slate-900/20 p-3 rounded border border-slate-900/60">
                    <span className="text-slate-500 block mb-1">Scam Category</span>
                    <span className="text-amber-400 font-semibold">{result.category || "SAFE"}</span>
                  </div>
                  <div className="bg-slate-900/20 p-3 rounded border border-slate-900/60">
                    <span className="text-slate-500 block mb-1">Pipeline Latency</span>
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                      {result.latencyMs !== undefined ? `${result.latencyMs} ms` : "Near-real-time"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

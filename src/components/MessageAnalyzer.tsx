import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ChevronDown, ChevronUp, Cpu, RefreshCw, MessageSquare, PhoneCall } from 'lucide-react';
import { SAMPLE_SCAMS, SAMPLE_CALL_TRANSCRIPTS } from '../data/mockData';
import { analyzeMessage, checkBackendHealth } from '../services/scamDetection';
import type { AnalysisResult, InputType } from '../types';
import { PredictionCard } from './PredictionCard';
import { RiskGauge } from './RiskGauge';
import { IndicatorCard } from './IndicatorCard';
import { RecommendationCard } from './RecommendationCard';
import { CallAudioBar } from './CallAudioBar';
import { CallTurnViewer } from './CallTurnViewer';
import { CallAnalysisCard } from './CallAnalysisCard';

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

  // Audio Playback & Turn State for Call Transcript Mode
  const [activeTurnIndex, setActiveTurnIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState<string | undefined>(undefined);
  const [recordingSpeaker, setRecordingSpeaker] = useState<'Caller' | 'Victim'>('Caller');

  useEffect(() => {
    checkBackendHealth().then(res => setBackendOnline(res.online));
  }, []);

  // Cleanup audio on mode switch or unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [mode]);

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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveTurnIndex(null);
    setActiveSampleId(undefined);
    setRecordingSpeaker('Caller');
    setText('');
    setResult(null);
  };

  const loadSample = (sampleText: string, sampleId?: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveTurnIndex(null);
    setActiveSampleId(sampleId);
    setText(sampleText);
    setResult(null);
  };

  const handleReplayAudio = () => {
    if (!text.trim()) return;
    if (isPlayingAudio) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setActiveTurnIndex(null);
      return;
    }

    if (!window.speechSynthesis) {
      alert('Speech synthesis audio is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    setIsPlayingAudio(true);

    const speakTurn = (index: number) => {
      if (index >= lines.length) {
        setIsPlayingAudio(false);
        setActiveTurnIndex(null);
        return;
      }
      setActiveTurnIndex(index);
      const rawLine = lines[index];
      let speaker = 'Caller';
      let content = rawLine;
      if (rawLine.includes(':')) {
        const parts = rawLine.split(':');
        speaker = parts[0].trim();
        content = parts.slice(1).join(':').trim();
      }

      const isVictim = speaker.toLowerCase().includes('victim') || speaker.toLowerCase().includes('receiver') || speaker.toLowerCase().includes('user');
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'en-IN';

      if (isVictim) {
        utterance.rate = 0.98;
        utterance.pitch = 1.22;
      } else {
        utterance.rate = 1.05;
        utterance.pitch = speaker.toLowerCase().includes('police') || speaker.toLowerCase().includes('inspector') ? 0.86 : 1.0;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 1) {
        if (isVictim) {
          const victimVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Sangeeta')) && (v.lang.includes('IN') || v.lang.includes('en')));
          if (victimVoice) utterance.voice = victimVoice;
        } else {
          const callerVoice = voices.find(v => (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Rishi') || v.name.includes('George')) && (v.lang.includes('IN') || v.lang.includes('en')));
          if (callerVoice) utterance.voice = callerVoice;
        }
      }

      utterance.onend = () => {
        const pauseMs = isVictim ? 500 : 700;
        setTimeout(() => speakTurn(index + 1), pauseMs);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setActiveTurnIndex(null);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakTurn(0);
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
            onClick={() => { 
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              setMode('message'); 
              setText(''); 
              setResult(null); 
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'message'
                ? 'bg-cyan-600 text-slate-950 font-bold shadow'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Single Message Mode (SMS / Email)</span>
          </button>

          <button
            onClick={() => { 
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              setMode('call_transcript'); 
              setText(SAMPLE_CALL_TRANSCRIPTS[0].text); 
              setActiveSampleId(SAMPLE_CALL_TRANSCRIPTS[0].id);
              setResult(null); 
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-4">
        {mode === 'call_transcript' ? (
          <>
            {/* Phone Audio & ASR Interface Bar */}
            <CallAudioBar
              transcript={text}
              onTranscriptChange={(newText) => {
                setText(newText);
                setResult(null);
              }}
              onSampleSelect={(sample) => loadSample(sample.text, sample.id)}
              activeSampleId={activeSampleId}
              activeTurnIndex={activeTurnIndex}
              onActiveTurnChange={setActiveTurnIndex}
              isPlaying={isPlayingAudio}
              setIsPlaying={setIsPlayingAudio}
              recordingSpeaker={recordingSpeaker}
              onRecordingSpeakerChange={setRecordingSpeaker}
            />

            {/* Conversation Viewer & Editor */}
            <div className="pt-2">
              <CallTurnViewer
                text={text}
                onChangeText={(newText) => {
                  setText(newText);
                  setResult(null);
                }}
                activeTurnIndex={activeTurnIndex}
                isPlayingAudio={isPlayingAudio}
                recordingSpeaker={recordingSpeaker}
                onRecordingSpeakerChange={setRecordingSpeaker}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block">
                Communication Message Text
              </label>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a suspicious SMS, email, chat message, or notification here..."
              className="w-full h-40 bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans resize-none transition-colors"
              maxLength={3000}
            />
            
            {/* Sample Loading Buttons for Single Message */}
            <div className="flex flex-wrap justify-between items-center mt-3 gap-2">
              <span className="text-[11px] font-mono text-slate-500">
                {text.length} / 3000 characters
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 py-1 mr-1">Load Samples:</span>
                {SAMPLE_SCAMS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSample(sample.text, sample.id)}
                    className="text-[10px] font-semibold text-cyan-400/90 bg-cyan-950/20 border border-cyan-900/40 hover:bg-cyan-950/40 hover:text-cyan-300 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-slate-900">
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
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
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

          {/* Call Transcript Coercion Flow & Analysis Card */}
          {result.callAnalysis && (
            <CallAnalysisCard 
              result={result} 
              onReplayAudio={handleReplayAudio}
              isPlayingAudio={isPlayingAudio}
            />
          )}

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

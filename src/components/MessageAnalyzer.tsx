import React, { useState } from 'react';
import { Play, RotateCcw, ChevronDown, ChevronUp, Cpu, RefreshCw } from 'lucide-react';
import { SAMPLE_SCAMS } from '../data/mockData';
import { analyzeMessage } from '../services/scamDetection';
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

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeMessage(text);
      setResult(analysis);
      if (onAnalysisSuccess) {
        onAnalysisSuccess(text, analysis, inputType);
      }
    } catch (e) {
      console.error(e);
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
    { label: "Raw Input", note: "Raw SMS/Email string" },
    { label: "Text Cleaning", note: "Lowercase, remove punctuation" },
    { label: "Tokenization", note: "Split words into elements" },
    { label: "TF-IDF Vector", note: "Generate feature mapping" },
    { label: "Baseline ML Model", note: "Proposed Logistic Regression" },
    { label: "Prediction Score", note: "Sigmoid probability" },
    { label: "Risk Estimator", note: "Heuristic classification weights" },
    { label: "Explanation Generator", note: "Highlight suspicious features" }
  ];

  return (
    <div className="space-y-6">
      {/* Input Form Card */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80">
        <label className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block mb-2">
          Communication Message Text
        </label>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a suspicious SMS, email, chat message, or conversation here..."
          className="w-full h-36 bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans resize-none transition-colors"
          maxLength={1000}
        />
        
        {/* Underlay Info */}
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-[11px] font-mono text-slate-500">
            {text.length} / 1000 characters
          </span>
          <div className="flex space-x-2">
            {SAMPLE_SCAMS.map((sample) => (
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

        {/* Buttons */}
        <div className="flex space-x-3 mt-5 pt-4 border-t border-slate-900">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running NLP Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-slate-950 fill-current" />
                <span>Analyze Message</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Prediction Class */}
            <div className="lg:col-span-2 space-y-6">
              <PredictionCard 
                prediction={result.prediction} 
                confidence={result.confidence}
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

          {/* Indicators list */}
          <div>
            <IndicatorCard 
              indicators={result.indicators} 
              prediction={result.prediction} 
            />
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
                {/* Horizontal flow steps visual representation */}
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
                    <span className="text-slate-300 font-semibold">Logistic Regression</span>
                  </div>
                  <div className="bg-slate-900/20 p-3 rounded border border-slate-900/60">
                    <span className="text-slate-500 block mb-1">Feature Extraction</span>
                    <span className="text-slate-300 font-semibold">TF-IDF Vectorization</span>
                  </div>
                  <div className="bg-slate-900/20 p-3 rounded border border-slate-900/60">
                    <span className="text-slate-500 block mb-1">Pipeline Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                      Active / Online
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

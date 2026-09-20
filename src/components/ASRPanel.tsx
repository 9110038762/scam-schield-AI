import React, { useState, useRef } from 'react';
import { Upload, Mic, ArrowRight, RefreshCw, AudioLines } from 'lucide-react';
import { DEMO_ASR_TRANSCRIPT } from '../data/mockData';
import { analyzeMessage } from '../services/scamDetection';
import type { AnalysisResult } from '../types';
import { PredictionCard } from './PredictionCard';
import { RiskGauge } from './RiskGauge';
import { IndicatorCard } from './IndicatorCard';
import { RecommendationCard } from './RecommendationCard';

interface ASRPanelProps {
  onAnalysisSuccess?: (text: string, result: AnalysisResult) => void;
}

export const ASRPanel: React.FC<ASRPanelProps> = ({ onAnalysisSuccess }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setAudioFile(file);
      simulateASR();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const simulateASR = async (fileToUpload?: File) => {
    setIsTranslating(true);
    setTranscript('');
    setResult(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const formData = new FormData();
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      } else {
        formData.append('demo', 'true');
      }

      const res = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setTranscript(data.transcript);
        setIsTranslating(false);
        return;
      }
    } catch {
      // Fallback
    }

    // Local fallback delay
    setTimeout(() => {
      setIsTranslating(false);
      setTranscript(DEMO_ASR_TRANSCRIPT);
    }, 1200);
  };

  const handleUseDemo = () => {
    const demoFile = new File(["demo"], "scam_voice_call_rec.wav", { type: "audio/wav" });
    setAudioFile(demoFile);
    simulateASR();
  };

  const handleAnalyzeTranscript = async () => {
    if (!transcript) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeMessage(transcript, 'distilbert', 'Voice Transcript');
      setResult(analysis);
      if (onAnalysisSuccess) {
        onAnalysisSuccess(transcript, analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setAudioFile(null);
    setTranscript('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Pipeline Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-800/80 flex flex-col justify-between min-h-64">
          <div>
            <label className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block mb-3">
              Upload Voice Call Audio Recording
            </label>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".wav,.mp3" 
              className="hidden" 
            />

            <div 
              onClick={triggerFileInput}
              className="border-2 border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950/40 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-center"
            >
              <Upload className="w-8 h-8 text-cyan-400/80 mb-3" />
              <span className="text-sm font-semibold text-slate-200">
                {audioFile ? audioFile.name : "Drag and drop or browse files"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono mt-1">
                Supported formats: WAV / MP3 (Max 10MB)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-5">
            <button
              onClick={handleUseDemo}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1.5"
            >
              <AudioLines className="w-4 h-4" />
              <span>Use Demo Audio (Scam call simulation)</span>
            </button>

            {audioFile && (
              <button 
                onClick={handleClear}
                className="text-xs font-mono text-slate-500 hover:text-slate-400 transition-colors"
              >
                Clear Audio
              </button>
            )}
          </div>
        </div>

        {/* Pipeline Schema */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ASR-to-NLP Speech Pipeline
            </h4>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3 p-2 bg-slate-900/30 rounded border border-slate-800/50">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold">1</span>
                <div>
                  <p className="font-bold text-slate-200">Audio Payload</p>
                  <p className="text-[9px] text-slate-500">WAV / MP3 call recording</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 bg-slate-900/30 rounded border border-slate-800/50">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold">2</span>
                <div>
                  <p className="font-bold text-slate-200">Whisper ASR</p>
                  <p className="text-[9px] text-slate-500">Speech-to-Text inference</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2 bg-slate-900/30 rounded border border-slate-800/50">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold">3</span>
                <div>
                  <p className="font-bold text-slate-200">ScamShield ML</p>
                  <p className="text-[9px] text-slate-500">NLP classification scoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Translation Output */}
      {(isTranslating || transcript) && (
        <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2 text-slate-200">
              <Mic className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                ASR Transcript Output
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Demo Transcript
            </span>
          </div>

          {isTranslating ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Translating speech to text (Whisper model mock)...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800/60 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed italic">
                "{transcript}"
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyzeTranscript}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Classifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Transcript</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ASR Classification result */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          <div className="border-t border-slate-900 pt-6">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-4">
              ASR Transcript Scam Analysis Results
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            
            <div>
              <RiskGauge 
                score={result.riskScore} 
                level={result.riskLevel} 
                prediction={result.prediction} 
              />
            </div>
          </div>

          <div>
            <IndicatorCard 
              indicators={result.indicators} 
              prediction={result.prediction} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

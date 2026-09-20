import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { PredictionType } from '../types';

interface PredictionCardProps {
  prediction: PredictionType;
  confidence: number;
  category?: string;
  categoryDescription?: string;
  modelUsed?: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ 
  prediction, 
  confidence,
  category,
  categoryDescription,
  modelUsed
}) => {
  const isScam = prediction === 'SCAM';

  return (
    <div className={`rounded-xl p-6 border transition-all duration-300 ${
      isScam 
        ? 'bg-rose-950/20 border-rose-900/50 shadow-[0_0_20px_rgba(244,63,94,0.03)]' 
        : 'bg-emerald-950/15 border-emerald-900/40 shadow-[0_0_20px_rgba(16,185,129,0.02)]'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-lg border ${
            isScam 
              ? 'bg-rose-950/80 border-rose-800/40 text-rose-400' 
              : 'bg-emerald-950/80 border-emerald-800/40 text-emerald-400'
          }`}>
            {isScam ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] tracking-widest font-mono font-bold text-slate-400 block uppercase">
              System Prediction
            </span>
            <h3 className={`text-xl font-black tracking-wide ${isScam ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isScam ? 'POTENTIAL SCAM DETECTED' : 'LEGITIMATE / SAFE MESSAGE'}
            </h3>
          </div>
        </div>

        {category && (
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Identified Category</span>
            <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold mt-1 ${
              isScam ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              {category}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Confidence Indicator */}
        <div className="flex items-center justify-between bg-slate-900/60 rounded-lg p-3.5 border border-slate-800/60">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-400 font-medium block">
              Classifier Confidence
            </span>
            <p className="text-[10px] text-slate-500 font-mono">
              Model probability: {modelUsed || "DistilBERT / LR"}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-extrabold font-mono tracking-tighter ${isScam ? 'text-rose-400' : 'text-emerald-400'}`}>
              {confidence}%
            </span>
          </div>
        </div>

        {categoryDescription && isScam && (
          <p className="text-xs text-slate-400 font-sans italic bg-slate-950/40 p-2.5 rounded border border-slate-900">
            {categoryDescription}
          </p>
        )}
      </div>
    </div>
  );
};

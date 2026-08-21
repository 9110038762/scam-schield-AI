import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Indicator } from '../types';

interface IndicatorCardProps {
  indicators: Indicator[];
  prediction: string;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicators, prediction }) => {
  const isScam = prediction === 'SCAM';

  return (
    <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800/80 flex flex-col h-full">
      <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800 pb-3">
        <AlertCircle className="w-5 h-5 text-cyan-400" />
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Explainable Scam Indicators
        </h4>
      </div>

      {indicators.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
          <p className="text-xs font-mono">No suspicious patterns detected.</p>
          <p className="text-[11px] mt-1">Classification is based on lack of high-risk terms.</p>
        </div>
      ) : (
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
          {indicators.map((indicator, index) => (
            <div 
              key={index} 
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-start space-x-3 transition-colors hover:border-slate-800"
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-mono font-bold mt-0.5 ${
                isScam 
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              }`}>
                ✓
              </span>
              <div>
                <h5 className="text-xs font-bold text-slate-200 font-mono">
                  {indicator.name}
                </h5>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  {indicator.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

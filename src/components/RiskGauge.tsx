import React from 'react';
import type { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  prediction: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, prediction }) => {
  // Determine color based on risk level
  const getColorClasses = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return {
          stroke: 'stroke-rose-500',
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          barBg: 'bg-rose-500'
        };
      case 'HIGH':
        return {
          stroke: 'stroke-orange-500',
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          barBg: 'bg-orange-500'
        };
      case 'MEDIUM':
        return {
          stroke: 'stroke-amber-500',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          barBg: 'bg-amber-500'
        };
      case 'LOW':
      default:
        return {
          stroke: 'stroke-emerald-500',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          barBg: 'bg-emerald-500'
        };
    }
  };

  const theme = getColorClasses(level);
  
  // SVG Ring calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-slate-800/80">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Circular Dial */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-800 fill-none"
            strokeWidth="8"
          />
          {/* Active stroke progress */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`fill-none transition-all duration-700 ease-out ${theme.stroke}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Central Text */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold text-slate-100 block tracking-tighter">
            {score}
          </span>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 block">
            RISK SCORE
          </span>
        </div>
      </div>

      {/* Label and Horizontal meter */}
      <div className="w-full mt-5 text-center">
        <div className="flex justify-between items-center mb-1.5 text-xs font-mono text-slate-400">
          <span>0</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${theme.bg} ${theme.text} border ${theme.border}`}>
            {level} RISK
          </span>
          <span>100</span>
        </div>
        {/* Meter Line */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${theme.barBg}`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        {/* Context explanation */}
        <p className="text-xs text-slate-400 font-normal mt-4 italic">
          {prediction === 'SCAM' 
            ? "The message contains patterns strongly correlated with scam communication." 
            : "The message does not trigger typical scam pattern flags."}
        </p>
      </div>
    </div>
  );
};

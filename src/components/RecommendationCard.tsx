import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: string;
  prediction: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  prediction 
}) => {
  const isScam = prediction === 'SCAM';

  return (
    <div className={`rounded-xl p-5 border ${
      isScam 
        ? 'bg-amber-950/10 border-amber-800/35 text-amber-200' 
        : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${
          isScam 
            ? 'bg-amber-950/80 border border-amber-800/30 text-amber-400' 
            : 'bg-slate-900/80 border border-slate-800 text-slate-400'
        } mt-0.5`}>
          {isScam ? <ShieldAlert className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {isScam ? 'Security Recommendation' : 'General Recommendation'}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {recommendation}
          </p>
          {isScam && (
            <ul className="text-[11px] text-amber-500/80 list-disc list-inside mt-2 space-y-1 font-mono">
              <li>Do not click any hyper-links in the message body.</li>
              <li>Do not supply 2FA authentication tokens to external parties.</li>
              <li>Call your official service provider support directly if concerned.</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

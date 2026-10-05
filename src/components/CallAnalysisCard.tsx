import React from 'react';
import { PhoneCall, ShieldAlert, Activity, Volume2, AlertTriangle } from 'lucide-react';
import type { CallAnalysis, AnalysisResult } from '../types';

interface CallAnalysisCardProps {
  result: AnalysisResult;
  onReplayAudio?: () => void;
  isPlayingAudio?: boolean;
}

export const CallAnalysisCard: React.FC<CallAnalysisCardProps> = ({
  result,
  onReplayAudio,
  isPlayingAudio = false,
}) => {
  const callAnalysis: CallAnalysis | undefined = result.callAnalysis;

  if (!callAnalysis || !callAnalysis.turns || callAnalysis.turns.length === 0) {
    return null;
  }

  const { turns, total_turns, suspicious_turns_count, coercion_progression } = callAnalysis;

  return (
    <div className="glass-panel rounded-xl p-6 border border-cyan-900/60 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <span>Multi-Turn Call Coercion Analysis</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-semibold">
                Telephony Deep Dive
              </span>
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Turn-by-turn conversational social engineering & pressure progression
            </p>
          </div>
        </div>

        {/* Replay Audio Trigger */}
        {onReplayAudio && (
          <button
            type="button"
            onClick={onReplayAudio}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-cyan-950/50 hover:bg-cyan-900/60 border-cyan-800/80 text-cyan-300'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Stop Call Audio' : 'Replay Call Audio'}</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Total Spoken Turns</span>
          <span className="text-base font-bold font-mono text-cyan-400">{total_turns} Turns</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Coercive Turns</span>
          <span className={`text-base font-bold font-mono ${suspicious_turns_count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {suspicious_turns_count} Flagged
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Threat Density</span>
          <span className="text-base font-bold font-mono text-slate-200">
            {total_turns > 0 ? `${Math.round((suspicious_turns_count / total_turns) * 100)}%` : '0%'}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Audio Modality</span>
          <span className="text-xs font-bold font-mono text-emerald-400 block truncate">
            Telephony / ASR
          </span>
        </div>
      </div>

      {/* Coercion Flow Progression Timeline */}
      {coercion_progression && (
        <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-wider">Conversational Coercion Progression</span>
          </div>
          <p className="text-xs text-cyan-200/90 font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
            {coercion_progression}
          </p>
        </div>
      )}

      {/* Turn Breakdown List */}
      <div className="space-y-3">
        <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Turn-by-Turn Threat Inspection
        </h5>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {turns.map((turn, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs transition-all ${
                turn.is_threat_turn
                  ? 'bg-rose-950/20 border-rose-900/50'
                  : 'bg-slate-950/40 border-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Turn {idx + 1} ({turn.speaker})</span>
                </span>

                {turn.is_threat_turn ? (
                  <span className="flex items-center space-x-1 text-[10px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/60 font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{turn.indicators?.join(', ') || 'Suspicious Turn'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40">
                    Safe Turn
                  </span>
                )}
              </div>

              <p className="text-slate-300 font-sans italic pl-3 leading-relaxed">
                "{turn.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Telephony Safety Protocol Notice */}
      <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs font-sans text-slate-300 space-y-1.5">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono">
          <ShieldAlert className="w-4 h-4" />
          <span>Telephony Safety Advisory:</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Indian regulatory guidelines (RBI & TRAI) strictly dictate that legitimate banks, tax authorities, and law enforcement agencies will <strong>never</strong> request OTPs, banking PINs, or demand remote video isolation / "digital arrest" over phone calls.
        </p>
      </div>
    </div>
  );
};

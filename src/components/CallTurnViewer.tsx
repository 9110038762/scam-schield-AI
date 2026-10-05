import React, { useState } from 'react';
import { PhoneCall, User, ShieldAlert, Edit3, MessageCircle, Plus, Volume2 } from 'lucide-react';

interface CallTurnViewerProps {
  text: string;
  onChangeText: (text: string) => void;
  activeTurnIndex: number | null;
  isPlayingAudio: boolean;
}

export const CallTurnViewer: React.FC<CallTurnViewerProps> = ({
  text,
  onChangeText,
  activeTurnIndex,
  isPlayingAudio,
}) => {
  const [viewMode, setViewMode] = useState<'conversation' | 'editor'>('conversation');

  // Parse text into turns
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Parse text into turns with dynamic call elapsed timestamps
  let cumulativeSeconds = 0;
  const parsedTurns = lines.map((line, idx) => {
    let speaker = 'Caller';
    let content = line;
    if (line.includes(':')) {
      const parts = line.split(':');
      speaker = parts[0].trim();
      content = parts.slice(1).join(':').trim();
    } else {
      speaker = idx % 2 === 0 ? 'Caller' : 'Victim';
    }

    // Estimate realistic telephony spoken duration (~2.8 words per second + conversational pause)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const turnDuration = Math.max(2, Math.round(wordCount / 2.8));
    const startSec = cumulativeSeconds;
    cumulativeSeconds += turnDuration + 1; // 1s pause between turns

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const lower = content.toLowerCase();
    const threatFlags: string[] = [];
    if (/otp|pin|verification code/.test(lower)) threatFlags.push('OTP / Credential Request');
    if (/block|suspend|freeze|kyc/.test(lower)) threatFlags.push('Account Blocking / KYC Threat');
    if (/arrest|police|crime|warrant|camera/.test(lower)) threatFlags.push('Digital Arrest / Impersonation');
    if (/transfer|fee|penalty|₹|rs/.test(lower)) threatFlags.push('Money / Fine Demand');
    if (/urgent|immediately|today|now/.test(lower)) threatFlags.push('Coercive Urgency');

    return {
      speaker,
      text: content,
      is_threat_turn: threatFlags.length > 0,
      indicators: threatFlags,
      timestamp: formatTime(startSec),
      durationSec: turnDuration
    };
  });

  const handleAddTurn = (speaker: string) => {
    const defaultPlaceholder = speaker === 'Caller' 
      ? 'Please confirm the 6-digit verification code immediately to stop the block.'
      : 'Why is my account blocked? I have not authorized any transfer.';
    const newText = text ? `${text.trim()}\n${speaker}: ${defaultPlaceholder}` : `${speaker}: ${defaultPlaceholder}`;
    onChangeText(newText);
  };

  return (
    <div className="space-y-3">
      {/* View Mode Toggle & Turn Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setViewMode('conversation')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'conversation'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Conversation View ({parsedTurns.length} turns)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'editor'
                ? 'bg-cyan-600 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Raw Text Editor</span>
          </button>
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center space-x-1.5 text-[11px] font-mono">
          <span className="text-slate-500 mr-1">Insert Turn:</span>
          <button
            type="button"
            onClick={() => handleAddTurn('Caller')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>+ Caller</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddTurn('Victim')}
            className="px-2.5 py-1 rounded bg-slate-900 border border-emerald-900/50 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>+ Victim</span>
          </button>
        </div>
      </div>

      {/* Render View Mode */}
      {viewMode === 'conversation' ? (
        <div className="min-h-52 max-h-80 overflow-y-auto space-y-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 font-sans">
          {parsedTurns.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs font-mono">
              No conversation turns loaded. Select a scenario above or upload audio to parse turns.
            </div>
          ) : (
            parsedTurns.map((turn, idx) => {
              const isTurnActive = isPlayingAudio && activeTurnIndex === idx;
              const isCaller = !turn.speaker.toLowerCase().includes('victim') && !turn.speaker.toLowerCase().includes('receiver') && !turn.speaker.toLowerCase().includes('user');

              return (
                <div
                  key={idx}
                  className={`flex ${isCaller ? 'justify-start' : 'justify-end'} w-full`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] p-3.5 rounded-xl border transition-all ${
                      isCaller
                        ? isTurnActive
                          ? 'bg-cyan-950/50 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500'
                          : turn.is_threat_turn
                          ? 'bg-slate-900/70 border-rose-900/50'
                          : 'bg-slate-900/50 border-slate-800/80'
                        : isTurnActive
                        ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
                        : 'bg-slate-900/80 border-emerald-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-800/60 pb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${
                          isCaller 
                            ? 'bg-cyan-950 border border-cyan-800 text-cyan-400' 
                            : 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                        }`}>
                          {isCaller ? <PhoneCall className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        </div>
                        <div>
                          <span className={`text-xs font-bold font-mono ${isCaller ? 'text-cyan-300' : 'text-emerald-300'}`}>
                            {isCaller ? `${turn.speaker} (Caller)` : `${turn.speaker} (You / Receiver)`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Call Timeline Timestamp */}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          ⏱️ {turn.timestamp}
                        </span>

                        {isTurnActive && (
                          <span className={`flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded border animate-pulse ${
                            isCaller 
                              ? 'text-cyan-300 bg-cyan-950 border-cyan-700' 
                              : 'text-emerald-300 bg-emerald-950 border-emerald-700'
                          }`}>
                            <Volume2 className="w-3 h-3 mr-1" /> Speaking
                          </span>
                        )}
                        {turn.is_threat_turn && (
                          <span className="flex items-center text-[10px] font-mono text-rose-300 font-semibold px-2 py-0.5 rounded bg-rose-950/50 border border-rose-800/60">
                            <ShieldAlert className="w-3 h-3 mr-1 text-rose-400" />
                            {turn.indicators?.[0] || 'Coercion Cue'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${isCaller ? 'text-slate-200' : 'text-emerald-100/90'}`}>
                      "{turn.text}"
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Paste conversation transcript here (e.g.,\nCaller: Hello, I am calling from your bank.\nCaller: Your KYC is incomplete and your account will be blocked today.\nVictim: Why will it be blocked?\nCaller: Please share the OTP you received.)"
          className="w-full h-48 bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none transition-colors"
          maxLength={5000}
        />
      )}
    </div>
  );
};

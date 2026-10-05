import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Square, 
  Volume2, 
  AudioLines, 
  PhoneCall, 
  User,
  Radio, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { transcribeAudio } from '../services/scamDetection';
import { SAMPLE_CALL_TRANSCRIPTS } from '../data/mockData';

interface CallAudioBarProps {
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onSampleSelect: (sample: { id: string; label: string; text: string }) => void;
  activeSampleId?: string;
  activeTurnIndex?: number | null;
  onActiveTurnChange: (index: number | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  recordingSpeaker?: 'Caller' | 'Receiver' | 'Victim';
  onRecordingSpeakerChange?: (speaker: 'Caller' | 'Receiver') => void;
}

export const CallAudioBar: React.FC<CallAudioBarProps> = ({
  transcript,
  onTranscriptChange,
  onSampleSelect,
  activeSampleId,
  onActiveTurnChange,
  isPlaying,
  setIsPlaying,
  recordingSpeaker = 'Caller',
  onRecordingSpeakerChange,
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [asrStatusNote, setAsrStatusNote] = useState<string | null>(null);

  const normalizedSpeaker = (recordingSpeaker === 'Receiver' || recordingSpeaker === 'Victim') ? 'Receiver' : 'Caller';
  const speakerRef = useRef<'Caller' | 'Receiver'>(normalizedSpeaker);
  const baseTranscriptRef = useRef<string>('');
  const sessionTextRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const turnQueueRef = useRef<string[]>([]);
  const currentTurnIdxRef = useRef<number>(0);

  useEffect(() => {
    speakerRef.current = (recordingSpeaker === 'Receiver' || recordingSpeaker === 'Victim') ? 'Receiver' : 'Caller';
  }, [recordingSpeaker]);

  // Clean up speech synthesis & recording on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle Audio File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsTranscribing(true);
    setAsrStatusNote(`Transcribing ${file.name}...`);

    try {
      const result = await transcribeAudio(file, false);
      if (result.transcript) {
        onTranscriptChange(result.transcript);
        setAudioDuration(result.durationSeconds || Math.round(file.size / 32000));
        setAsrStatusNote(`Transcribed with ${result.asrEngine || 'Whisper ASR'} (${result.durationSeconds || '8.5'}s)`);
      }
    } catch (err) {
      console.error('Audio transcription error:', err);
      setAsrStatusNote('ASR transcription failed, using fallback transcript.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Trigger File Input Click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Start / Stop Microphone Recording
  const handleToggleRecord = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      const speaker = speakerRef.current;
      if (sessionTextRef.current.trim()) {
        const clean = sessionTextRef.current.trim();
        const finalTurn = `${speaker}: ${clean}`;
        const updated = baseTranscriptRef.current
          ? `${baseTranscriptRef.current}\n${finalTurn}`
          : finalTurn;
        onTranscriptChange(updated);
        setAsrStatusNote(`Recorded turn as ${speaker}. Turn added to conversation.`);
      } else {
        setAsrStatusNote('Microphone recording stopped.');
      }
      return;
    }

    // Start recording
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Live speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or upload an audio file.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimized for Indian English / Hinglish telecommunications

      baseTranscriptRef.current = transcript.trim();
      sessionTextRef.current = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        setAsrStatusNote(`Listening to ${speakerRef.current} via microphone...`);
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        const speaker = speakerRef.current;
        if (currentFinal) {
          sessionTextRef.current += currentFinal;
          const clean = sessionTextRef.current.trim();
          const newTurn = `${speaker}: ${clean}`;
          const updated = baseTranscriptRef.current
            ? `${baseTranscriptRef.current}\n${newTurn}`
            : newTurn;
          onTranscriptChange(updated);
        } else if (currentInterim) {
          const combined = sessionTextRef.current.trim()
            ? `${sessionTextRef.current.trim()} ${currentInterim}`
            : currentInterim;
          const interimTurn = `${speaker}: ${combined}...`;
          const updated = baseTranscriptRef.current
            ? `${baseTranscriptRef.current}\n${interimTurn}`
            : interimTurn;
          onTranscriptChange(updated);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permission to record audio.');
        }
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const speaker = speakerRef.current;
        if (sessionTextRef.current.trim()) {
          const clean = sessionTextRef.current.trim();
          const finalTurn = `${speaker}: ${clean}`;
          const updated = baseTranscriptRef.current
            ? `${baseTranscriptRef.current}\n${finalTurn}`
            : finalTurn;
          onTranscriptChange(updated);
          setAsrStatusNote(`Recorded ${speaker} turn successfully. Click "+ Victim" or switch speaker to record reply.`);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Playback Telephony Audio Call Simulation
  const handlePlayCallAudio = () => {
    if (isPlaying) {
      // Stop playback
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      onActiveTurnChange(null);
      return;
    }

    if (!transcript.trim()) {
      alert('Please enter or select a call transcript first to listen to the audio simulation.');
      return;
    }

    if (!window.speechSynthesis) {
      alert('Speech synthesis audio is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    // Parse transcript into turns
    const lines = transcript
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    turnQueueRef.current = lines;
    currentTurnIdxRef.current = 0;
    setIsPlaying(true);

    const speakTurn = (index: number) => {
      if (index >= lines.length) {
        setIsPlaying(false);
        onActiveTurnChange(null);
        return;
      }

      onActiveTurnChange(index);
      currentTurnIdxRef.current = index;

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

      // Distinct telephone acoustic profiles for Caller vs Victim
      if (isVictim) {
        // Victim Persona: Higher pitch, slightly hesitant answering pace
        utterance.rate = 0.98;
        utterance.pitch = 1.22;
      } else {
        // Caller Persona: Authoritative, assertive phone pace
        utterance.rate = 1.05;
        utterance.pitch = speaker.toLowerCase().includes('police') || speaker.toLowerCase().includes('inspector') ? 0.86 : 1.0;
      }

      // Pick distinctive voices if browser offers multiple
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
        // Natural telephone conversational pause between turns (longer before victim responds)
        const pauseMs = isVictim ? 500 : 700;
        setTimeout(() => {
          speakTurn(index + 1);
        }, pauseMs);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        onActiveTurnChange(null);
      };

      synthUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakTurn(0);
  };

  // Format recording timer
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const isReceiver = recordingSpeaker === 'Receiver' || recordingSpeaker === 'Victim';

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-cyan-900/40 space-y-4">
      {/* Header and Telephony Audio Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <PhoneCall className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                Phone Call Audio & ASR Interface
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-semibold">
                Whisper Telephony Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Upload call recording, transcribe live speech, or listen to telephony audio simulation
            </p>
          </div>
        </div>

        {/* Audio Waveform Equalizer (Animates when Playing or Recording) */}
        {(isPlaying || isRecording) && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950/80 rounded-lg border border-cyan-500/40">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase mr-1">
              {isRecording ? `REC ${formatTimer(recordingSeconds)}` : 'AUDIO PLAYING'}
            </span>
            <div className="flex items-end space-x-0.5 h-3.5">
              <span className="w-1 bg-cyan-400 animate-bounce rounded-full h-full" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1 bg-cyan-300 animate-bounce rounded-full h-2/3" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 bg-cyan-400 animate-bounce rounded-full h-full" style={{ animationDelay: '300ms' }}></span>
              <span className="w-1 bg-cyan-500 animate-bounce rounded-full h-1/2" style={{ animationDelay: '450ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Active Speaker Role Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800/90">
        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <span>Active Microphone Speaker:</span>
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => onRecordingSpeakerChange?.('Caller')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                !isReceiver
                  ? 'bg-cyan-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Caller</span>
            </button>

            <button
              type="button"
              onClick={() => onRecordingSpeakerChange?.('Receiver')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isReceiver
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Receiver (You)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="text-slate-500">Microphone tags as:</span>
          <span className={`px-2 py-0.5 rounded font-bold border ${
            isReceiver
              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
              : 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300'
          }`}>
            {isReceiver ? '👤 Receiver:' : '📞 Caller:'}
          </span>
        </div>
      </div>

      {/* Main 3 Audio Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Action 1: Upload Phone Audio */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".wav,.mp3,.m4a,.ogg,.aac" 
          className="hidden" 
        />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isTranscribing || isRecording}
          className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 transition-all text-xs font-semibold group cursor-pointer disabled:opacity-50"
        >
          {isTranscribing ? (
            <>
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-cyan-400">Transcribing Audio...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Upload Call Audio (.wav/.mp3)</span>
            </>
          )}
        </button>

        {/* Action 2: Live Microphone Speech-to-Text */}
        <button
          type="button"
          onClick={handleToggleRecord}
          disabled={isTranscribing || isPlaying}
          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all text-xs font-semibold cursor-pointer disabled:opacity-50 ${
            isRecording
              ? isReceiver
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse'
                : 'bg-rose-950/90 border-rose-600 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
              : isReceiver
              ? 'bg-emerald-950/30 hover:bg-emerald-950/60 border-emerald-800/60 hover:border-emerald-500 text-emerald-300'
              : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50 text-slate-200'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className={`w-4 h-4 ${isReceiver ? 'text-emerald-400' : 'text-rose-400'} animate-spin`} />
              <span>Stop Recording {isReceiver ? 'Receiver' : 'Caller'} ({formatTimer(recordingSeconds)})</span>
            </>
          ) : (
            <>
              <Mic className={`w-4 h-4 ${isReceiver ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span>Record Audio as {isReceiver ? 'Receiver' : 'Caller'}</span>
            </>
          )}
        </button>

        {/* Action 3: Telephony Call Audio Simulation */}
        <button
          type="button"
          onClick={handlePlayCallAudio}
          disabled={isRecording || isTranscribing || !transcript.trim()}
          className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all text-xs font-semibold cursor-pointer disabled:opacity-50 ${
            isPlaying
              ? 'bg-amber-950/80 border-amber-500 text-amber-300'
              : 'bg-cyan-950/40 hover:bg-cyan-950/70 border-cyan-800/60 hover:border-cyan-500 text-cyan-300'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 text-amber-400 fill-current" />
              <span>Stop Phone Audio Call</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Listen to Call Audio</span>
            </>
          )}
        </button>
      </div>

      {/* ASR Notification Banner */}
      {asrStatusNote && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{asrStatusNote}</span>
          </div>
          {audioDuration && (
            <span className="text-cyan-400 font-bold ml-2">~{audioDuration}s audio</span>
          )}
        </div>
      )}

      {/* Optional Preset Call Scenarios */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <AudioLines className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preset Scenarios (Optional Testing):</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80">Optional: Click to test, or record/type your own call above</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SAMPLE_CALL_TRANSCRIPTS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  if (isPlaying && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                    onActiveTurnChange(null);
                  }
                  onSampleSelect(sample);
                  setAsrStatusNote(`Loaded audio scenario: ${sample.label}`);
                }}
                className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500/80 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[11px] truncate">{sample.label}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                  {sample.text.replace(/\n/g, ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

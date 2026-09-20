import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/scamDetection';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(res => setOnline(res.online));
    const interval = setInterval(() => {
      checkBackendHealth().then(res => setOnline(res.online));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-900 bg-slate-950/20 backdrop-blur-md px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 mb-1">{title}</h2>
        <p className="text-sm text-slate-400 font-normal">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-3">
        {online ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 shadow-[0_0_10px_rgba(16,185,129,0.08)] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            ML Engine: Connected (Port 8000)
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/50 shadow-[0_0_10px_rgba(245,158,11,0.05)] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>
            Offline Fallback Mode
          </span>
        )}
      </div>
    </header>
  );
};

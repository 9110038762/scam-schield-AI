import React from 'react';
import { SYSTEM_STATUS } from '../data/mockData';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="border-b border-slate-900 bg-slate-950/20 backdrop-blur-md px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 mb-1">{title}</h2>
        <p className="text-sm text-slate-400 font-normal">{subtitle}</p>
      </div>
      <div className="flex items-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
          {SYSTEM_STATUS.statusBadge}
        </span>
      </div>
    </header>
  );
};

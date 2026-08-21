import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  colorClass?: string;
  borderColorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass = 'text-cyan-400',
  borderColorClass = 'border-slate-800'
}) => {
  return (
    <div className={`glass-panel rounded-xl p-5 border ${borderColorClass} flex items-start justify-between transition-all duration-300 hover:border-slate-700/60`}>
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
            {value}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-mono italic">
          {subtitle}
        </p>
      </div>
      <div className={`p-3 rounded-lg bg-slate-900/80 border border-slate-800 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

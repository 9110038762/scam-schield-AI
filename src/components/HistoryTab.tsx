import React, { useState } from 'react';
import type { HistoryRecord } from '../types';
import { Shield, Search } from 'lucide-react';

interface HistoryTabProps {
  history: HistoryRecord[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  const [filter, setFilter] = useState<'ALL' | 'SCAM' | 'SAFE' | 'HIGH_RISK'>('ALL');
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(row => {
    // 1. Text Search Filter
    const matchesSearch = row.text.toLowerCase().includes(search.toLowerCase()) || 
                          row.indicators.some(ind => ind.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;

    // 2. Status Filter
    if (filter === 'ALL') return true;
    if (filter === 'SCAM') return row.prediction === 'SCAM';
    if (filter === 'SAFE') return row.prediction === 'SAFE';
    if (filter === 'HIGH_RISK') return row.riskLevel === 'HIGH' || row.riskLevel === 'CRITICAL';
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'SCAM', 'SAFE', 'HIGH_RISK'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase transition-all duration-200 border ${
                filter === opt
                  ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400'
                  : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {opt.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Text Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-full md:w-64 bg-slate-950/60 border border-slate-900 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* History Table Card */}
      <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 bg-slate-900/10 border-b border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Detection Audit Log
            </h3>
            <p className="text-[10px] text-slate-500 font-mono italic">
              Showing {filteredHistory.length} of {history.length} audit records
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
            Audit Trail
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <Shield className="w-8 h-8 text-slate-700" />
            <p className="text-xs font-mono">No matching detection logs found.</p>
            <p className="text-[10px] text-slate-600">Try adjusting your filters or keyword query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                  <th className="p-4 font-bold w-20">Time</th>
                  <th className="p-4 font-bold w-28">Type</th>
                  <th className="p-4 font-bold">Input Message Text</th>
                  <th className="p-4 font-bold text-center w-24">Prediction</th>
                  <th className="p-4 font-bold text-center w-24">Risk</th>
                  <th className="p-4 font-bold text-center w-24">Confidence</th>
                  <th className="p-4 font-bold w-48">Scam Signals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-xs font-mono">
                {filteredHistory.map((row) => {
                  const isScam = row.prediction === 'SCAM';
                  return (
                    <tr key={row.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 text-slate-500">{row.timestamp}</td>
                      <td className="p-4">
                        <span className="bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded text-[10px]">
                          {row.inputType}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 max-w-md truncate" title={row.text}>
                        {row.text}
                      </td>
                      <td className="p-4 text-center font-bold">
                        <span className={isScam ? 'text-rose-400' : 'text-emerald-400'}>
                          {row.prediction}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] ${
                          row.riskLevel === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          row.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          row.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {row.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 text-center font-extrabold text-slate-200">{row.confidence}%</td>
                      <td className="p-4">
                        {row.indicators.length === 0 ? (
                          <span className="text-slate-600">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {row.indicators.map((ind, idx) => (
                              <span key={idx} className="bg-rose-950/10 border border-rose-900/35 text-rose-300 px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap">
                                {ind}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

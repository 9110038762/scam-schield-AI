import React from 'react';
import { 
  MessageSquare, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { OVERVIEW_STATS, RECENT_ANALYSES, RISK_DISTRIBUTION } from '../data/mockData';
import { StatCard } from './StatCard';
import { ClassDistributionChart } from './DatasetCharts';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from 'recharts';

interface OverviewTabProps {
  onNavigateToAnalyze: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateToAnalyze }) => {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Messages Analyzed"
          value={OVERVIEW_STATS.messagesAnalyzed}
          subtitle="Sample dataset count"
          icon={MessageSquare}
          colorClass="text-cyan-400"
          borderColorClass="border-slate-800"
        />
        <StatCard
          title="Scam Detected"
          value={OVERVIEW_STATS.scamsDetected}
          subtitle="Sample dataset count"
          icon={ShieldAlert}
          colorClass="text-rose-400"
          borderColorClass="border-rose-950/20"
        />
        <StatCard
          title="Safe Messages"
          value={OVERVIEW_STATS.safeMessages}
          subtitle="Sample dataset count"
          icon={ShieldCheck}
          colorClass="text-emerald-400"
          borderColorClass="border-emerald-950/20"
        />
        <StatCard
          title="High Risk Cases"
          value={OVERVIEW_STATS.highRiskCases}
          subtitle="Critical alert weight"
          icon={AlertTriangle}
          colorClass="text-amber-400"
          borderColorClass="border-amber-950/20"
        />
      </div>

      {/* Main Overview Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scam Detection Balance */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Scam Detection Distribution
                </h3>
                <p className="text-[10px] text-slate-500 font-mono italic">
                  Scam vs safe ratio in the training corpus
                </p>
              </div>
            </div>
            <ClassDistributionChart />
          </div>
        </div>

        {/* Risk Level Splits */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Risk Distribution
                </h3>
                <p className="text-[10px] text-slate-500 font-mono italic">
                  Distribution of warning classification levels
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RISK_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
                    {RISK_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 text-xs font-mono mt-1">
              {RISK_DISTRIBUTION.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Analyses Log */}
      <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 bg-slate-900/10 border-b border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Recent Analyses Log
            </h3>
            <p className="text-[10px] text-slate-500 font-mono italic">
              Log of recently evaluated communications
            </p>
          </div>
          <button
            onClick={onNavigateToAnalyze}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <span>Scan new message</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <th className="p-4 font-bold">Time</th>
                <th className="p-4 font-bold">Input Type</th>
                <th className="p-4 font-bold">Prediction</th>
                <th className="p-4 font-bold text-center">Risk Level</th>
                <th className="p-4 font-bold text-center">Confidence</th>
                <th className="p-4 font-bold">Key Indicators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs font-mono">
              {RECENT_ANALYSES.map((row) => {
                const isScam = row.prediction === 'SCAM';
                return (
                  <tr key={row.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 text-slate-400 font-medium">{row.timestamp}</td>
                    <td className="p-4 text-slate-300">
                      <span className="bg-slate-900/80 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">
                        {row.inputType}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold">
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
                    <td className="p-4 text-center font-bold text-slate-200">{row.confidence}%</td>
                    <td className="p-4">
                      {row.indicators.length === 0 ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {row.indicators.map((ind, idx) => (
                            <span key={idx} className="bg-rose-950/10 border border-rose-900/35 text-rose-300 px-2 py-0.5 rounded text-[10px]">
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
      </div>
    </div>
  );
};

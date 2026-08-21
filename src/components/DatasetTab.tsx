import React from 'react';
import { DATASET_PREVIEW, PREPROCESSING_STAGES } from '../data/mockData';
import { ClassDistributionChart, CategoryDistributionChart } from './DatasetCharts';
import { Database, Percent, Scale, Cpu } from 'lucide-react';
import { StatCard } from './StatCard';

export const DatasetTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Dataset Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Samples"
          value="1,420"
          subtitle="Curated dataset corpus"
          icon={Database}
          colorClass="text-cyan-400"
          borderColorClass="border-slate-800"
        />
        <StatCard
          title="Scam Samples"
          value="642"
          subtitle="Label: SCAM"
          icon={Scale}
          colorClass="text-rose-400"
          borderColorClass="border-rose-950/20"
        />
        <StatCard
          title="Legitimate Samples"
          value="778"
          subtitle="Label: SAFE"
          icon={Scale}
          colorClass="text-emerald-400"
          borderColorClass="border-emerald-950/20"
        />
        <StatCard
          title="Scam Ratio"
          value="45.2%"
          subtitle="Class balance ratio"
          icon={Percent}
          colorClass="text-amber-400"
          borderColorClass="border-amber-950/20"
        />
      </div>

      {/* Dataset Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
            Class Balance Distribution
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic mb-4">
            Proposed dataset balancing plan (Target split)
          </p>
          <ClassDistributionChart />
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
            Proposed Scam Type distribution
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic mb-4">
            Frequency weight by target threat categories
          </p>
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Preprocessing Visual Pipeline */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-6">
        <div className="flex items-center space-x-2.5">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            NLP Preprocessing Pipeline
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREPROCESSING_STAGES.map((stage, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-col justify-between transition-colors hover:border-slate-800/80"
            >
              <span className="text-xs font-mono font-bold text-cyan-400 mb-1">
                {stage.stage}
              </span>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 bg-slate-900/10 border-b border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Dataset Preview Schema
            </h3>
            <p className="text-[10px] text-slate-500 font-mono italic">
              Representative features extracted from the training corpus
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-400">
            Active Dataset Preview
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Message Snippet</th>
                <th className="p-4 font-bold">Label</th>
                <th className="p-4 font-bold">Scam Category</th>
                <th className="p-4 font-bold text-center">URL</th>
                <th className="p-4 font-bold text-center">Urgency</th>
                <th className="p-4 font-bold text-center">OTP</th>
                <th className="p-4 font-bold text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs font-mono">
              {DATASET_PREVIEW.map((item) => {
                const isScam = item.label === 'SCAM';
                return (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4 text-slate-500 font-bold">{item.id}</td>
                    <td className="p-4 text-slate-300 max-w-xs truncate" title={item.message}>
                      {item.message}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={isScam ? 'text-rose-400' : 'text-emerald-400'}>
                        {item.label}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{item.scamType}</td>
                    <td className="p-4 text-center">
                      <span className={item.containsUrl ? 'text-rose-400' : 'text-slate-600'}>
                        {item.containsUrl ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={item.urgency ? 'text-rose-400' : 'text-slate-600'}>
                        {item.urgency ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={item.otpRequest ? 'text-rose-400' : 'text-slate-600'}>
                        {item.otpRequest ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={item.paymentRequest ? 'text-rose-400' : 'text-slate-600'}>
                        {item.paymentRequest ? 'YES' : 'NO'}
                      </span>
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

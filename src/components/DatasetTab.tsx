import React from 'react';
import { DATASET_PREVIEW, PREPROCESSING_STAGES, DATASET_SOURCES_INFO } from '../data/mockData';
import { ClassDistributionChart, CategoryDistributionChart } from './DatasetCharts';
import { Database, Percent, Scale, Cpu, ExternalLink, ShieldAlert } from 'lucide-react';
import { StatCard } from './StatCard';

export const DatasetTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cleaned Unique Samples"
          value="8,233"
          subtitle="Deduplicated training corpus"
          icon={Database}
          colorClass="text-cyan-400"
          borderColorClass="border-slate-800"
        />
        <StatCard
          title="Scam Samples"
          value="2,203"
          subtitle="Label: SCAM (26.8%)"
          icon={Scale}
          colorClass="text-rose-400"
          borderColorClass="border-rose-950/20"
        />
        <StatCard
          title="Legitimate Samples"
          value="6,030"
          subtitle="Label: SAFE (73.2%)"
          icon={Scale}
          colorClass="text-emerald-400"
          borderColorClass="border-emerald-950/20"
        />
        <StatCard
          title="Raw Ingestion Count"
          value="21,633"
          subtitle="13,383 Duplicates Removed"
          icon={Percent}
          colorClass="text-amber-400"
          borderColorClass="border-amber-950/20"
        />
      </div>

      {/* Source Datasets Breakdown Cards */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Four Public Research Data Sources
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Merged with strict deduplication to prevent data leakage prior to 80/10/10 train/validation/test splitting.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
            Open-Access Academic Datasets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {DATASET_SOURCES_INFO.map((src, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">0{idx+1}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {src.license}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mt-2">{src.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1">Raw: <strong className="text-slate-200">{src.rawCount}</strong> records</p>
                <p className="text-[11px] text-slate-500 font-mono">Lang: {src.language}</p>
                <p className="text-[11px] text-slate-500 font-mono">Type: {src.type}</p>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">{src.citation}</span>
                <a 
                  href={src.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>Link</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300/90 flex items-start space-x-2.5 mt-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-mono text-[11px]">
            <strong>Academic Integrity Notice:</strong> Source datasets contain template repetitions and synthetic variations (total 21,633 raw lines). 
            ScamShield AI eliminated <strong>13,383 exact duplicate lines</strong> before partitioning into train (6,586), validation (823), and test (824) sets to prevent benchmark evaluation inflation.
          </p>
        </div>
      </div>

      {/* Dataset Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
            Class Balance Distribution
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic mb-4">
            Unified unique dataset (6,030 Safe vs 2,203 Scam)
          </p>
          <ClassDistributionChart />
        </div>

        <div className="glass-panel rounded-xl p-5 border border-slate-800/80">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
            Scam Category Breakdown
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic mb-4">
            Frequency distribution across mapped and inferred scam categories
          </p>
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Preprocessing Visual Pipeline */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-6">
        <div className="flex items-center space-x-2.5">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            ScamShield Data Processing & Cleaning Pipeline
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
              Unified Dataset Sample Schema
            </h3>
            <p className="text-[10px] text-slate-500 font-mono italic">
              Representative features extracted across SMS, chat, and phone call transcripts
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-400">
            8,233 Unique Entries Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Message / Transcript Snippet</th>
                <th className="p-4 font-bold">Label</th>
                <th className="p-4 font-bold">Category</th>
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

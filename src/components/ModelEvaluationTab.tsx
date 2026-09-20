import React from 'react';
import { ModelTable } from './ModelTable';
import { ShieldCheck, Target, RefreshCw, BarChart2, Zap } from 'lucide-react';

export const ModelEvaluationTab: React.FC = () => {
  const metricExplanations = [
    {
      title: "Accuracy",
      description: "Proportion of total predictions correctly classified as SCAM or SAFE.",
      formula: "(TP + TN) / Total",
      icon: ShieldCheck,
      color: "text-emerald-400"
    },
    {
      title: "SCAM Precision",
      description: "Out of all messages predicted as SCAM, how many were true fraud attempts.",
      formula: "TP / (TP + FP)",
      icon: Target,
      color: "text-cyan-400"
    },
    {
      title: "SCAM Recall",
      description: "Sensitivity: Out of all actual scam attempts, how many did the system catch.",
      formula: "TP / (TP + FN)",
      icon: RefreshCw,
      color: "text-amber-400"
    },
    {
      title: "SCAM F1-Score",
      description: "Harmonic mean of precision and recall, balancing false alarms against missed scams.",
      formula: "2 × (P × R) / (P + R)",
      icon: BarChart2,
      color: "text-rose-400"
    }
  ];

  const experiments = [
    {
      name: "Experiment 1: UCI SMS Spam Baseline",
      dataset: "UCI SMS Spam Collection",
      trainSamples: 4143,
      testSamples: 501,
      accuracy: "98.20%",
      scamF1: "91.43%",
      finding: "Strong baseline on standard SMS spam, but misses regional Indian cyber fraud formats (KYC/Aadhaar/UPI)."
    },
    {
      name: "Experiment 2: India Scam Dataset",
      dataset: "Scam/Spam India Dataset",
      trainSamples: 1790,
      testSamples: 234,
      accuracy: "97.44%",
      scamF1: "96.81%",
      finding: "Significantly improves detection on Indian telecommunications, reward baits, and rupee-denominated fraud."
    },
    {
      name: "Experiment 3: PhoneCall Hinglish Dataset",
      dataset: "Indian Cyber Scam PhoneCall Hinglish",
      trainSamples: 587,
      testSamples: 79,
      accuracy: "100.00%",
      scamF1: "100.00%",
      finding: "Detects digital arrest, police impersonation, and conversational transcript deception."
    },
    {
      name: "Experiment 4: Unified Multi-Dataset Benchmark",
      dataset: "Unified ScamShield Corpus (8,233 unique records)",
      trainSamples: 6586,
      testSamples: 824,
      accuracy: "98.79%",
      scamF1: "97.74%",
      finding: "DistilBERT achieves 98.79% overall accuracy and 97.74% SCAM F1 with 8.9ms latency."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Explanations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricExplanations.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div 
              key={idx} 
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{metric.title}</h4>
                </div>
                <p className="text-xs text-slate-400 font-normal leading-relaxed">{metric.description}</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Formula</span>
                <span className="text-xs font-mono text-slate-300 font-bold">{metric.formula}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Table + Comparison */}
      <ModelTable />

      {/* Confusion Matrix Section with Real Numbers */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
            Empirical Confusion Matrix (Held-out Test Split: 824 samples)
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic">
            Evaluated on fine-tuned DistilBERT (603 Actual Safe, 221 Actual Scam)
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
          {/* Schematic visual box */}
          <div className="grid grid-cols-3 gap-2 max-w-sm w-full font-mono text-xs text-center">
            {/* Headers */}
            <div className="p-2"></div>
            <div className="p-2 border border-slate-800 bg-slate-900/40 font-bold text-slate-400 uppercase text-[10px]">Predicted Safe</div>
            <div className="p-2 border border-slate-800 bg-slate-900/40 font-bold text-slate-400 uppercase text-[10px]">Predicted Scam</div>

            {/* Row 1 */}
            <div className="p-2 flex items-center justify-center border border-slate-800 bg-slate-900/40 font-bold text-slate-400 uppercase text-[10px]">Actual Safe (603)</div>
            <div className="p-4 border border-slate-800 bg-emerald-950/20 text-emerald-400 rounded">
              <span className="block font-bold">TN</span>
              <span className="text-base text-emerald-300 font-extrabold block mt-1">598</span>
              <span className="text-[9px] text-emerald-500/80">99.17%</span>
            </div>
            <div className="p-4 border border-slate-800 bg-rose-950/15 text-rose-400 rounded">
              <span className="block font-bold">FP (Type I)</span>
              <span className="text-base text-rose-300 font-extrabold block mt-1">5</span>
              <span className="text-[9px] text-rose-500/80">0.83%</span>
            </div>

            {/* Row 2 */}
            <div className="p-2 flex items-center justify-center border border-slate-800 bg-slate-900/40 font-bold text-slate-400 uppercase text-[10px]">Actual Scam (221)</div>
            <div className="p-4 border border-slate-800 bg-rose-950/15 text-rose-400 rounded">
              <span className="block font-bold">FN (Type II)</span>
              <span className="text-base text-rose-300 font-extrabold block mt-1">5</span>
              <span className="text-[9px] text-rose-500/80">2.26%</span>
            </div>
            <div className="p-4 border border-slate-800 bg-emerald-950/20 text-emerald-400 rounded">
              <span className="block font-bold">TP</span>
              <span className="text-base text-emerald-300 font-extrabold block mt-1">216</span>
              <span className="text-[9px] text-emerald-500/80">97.74%</span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="flex-1 max-w-md space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Real Benchmark Verification</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ScamShield AI's models were trained on 6,586 examples and tested on 824 previously unseen examples. No synthetic metrics or fabricated results are reported.
            </p>
            <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1 font-mono">
              <li><strong>True Negatives (598):</strong> Legitimate SMS and friendly Hinglish calls correctly recognized.</li>
              <li><strong>True Positives (216):</strong> KYC threats, OTP fraud, and digital arrest cases accurately caught.</li>
              <li><strong>False Positives (5):</strong> Safe messages containing financial terms flagged for review.</li>
              <li><strong>False Negatives (5):</strong> Subtle scam messages without overt urgency markers.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset Isolation Experiments Table */}
      <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="p-5 bg-slate-900/20 border-b border-slate-900">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Dataset Ablation & Isolation Experiments (Experiments 1–5)
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic">
            Empirical comparison demonstrating why multi-source training is necessary for Indian and Hinglish cyber fraud
          </p>
        </div>

        <div className="divide-y divide-slate-900">
          {experiments.map((exp, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-900/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="text-xs font-bold text-cyan-400 font-mono">{exp.name}</span>
                <p className="text-xs text-slate-300">{exp.finding}</p>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Train: {exp.trainSamples} | Test: {exp.testSamples} | Source: {exp.dataset}
                </span>
              </div>
              <div className="flex items-center space-x-6 font-mono text-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">Accuracy</span>
                  <span className="text-slate-200 font-bold">{exp.accuracy}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">SCAM F1</span>
                  <span className="text-rose-400 font-bold">{exp.scamF1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

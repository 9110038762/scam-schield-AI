import React from 'react';
import { ModelTable } from './ModelTable';
import { ShieldCheck, Target, RefreshCw, BarChart2 } from 'lucide-react';

export const ModelEvaluationTab: React.FC = () => {
  const metricExplanations = [
    {
      title: "Accuracy",
      description: "Overall correctness. Proportion of total predictions that were correct.",
      formula: "TP + TN / Total",
      icon: ShieldCheck,
      color: "text-emerald-400"
    },
    {
      title: "Precision",
      description: "Model specificity. Out of all predicted scams, how many were actually scams.",
      formula: "TP / (TP + FP)",
      icon: Target,
      color: "text-cyan-400"
    },
    {
      title: "Recall",
      description: "Model sensitivity. Out of all actual scams, how many did the system catch.",
      formula: "TP / (TP + FN)",
      icon: RefreshCw,
      color: "text-amber-400"
    },
    {
      title: "F1 Score",
      description: "Harmonic balance. Consolidated performance index combining Precision and Recall.",
      formula: "2 * (P * R) / (P + R)",
      icon: BarChart2,
      color: "text-rose-400"
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
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Mathematical formula</span>
                <span className="text-xs font-mono text-slate-300 font-bold">{metric.formula}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Table + Comparison Placeholder */}
      <ModelTable />

      {/* Confusion Matrix Section */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800/80 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
            Confusion Matrix Schema
          </h3>
          <p className="text-[10px] text-slate-500 font-mono italic">
            Metrics for evaluation error distribution
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
            <div className="p-2 flex items-center justify-center border border-slate-800 bg-slate-900/40 font-bold text-slate-400 uppercase text-[10px]">Actual Safe</div>
            <div className="p-4 border border-slate-800 bg-emerald-950/15 text-emerald-400 rounded">
              <span className="block font-bold">True Negative (TN)</span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-1">210</span>
            </div>
            <div className="p-4 border border-slate-800 bg-rose-950/10 text-rose-400 rounded">
              <span className="block font-bold">False Positive (FP)</span>
              <span className="text-[10px] text-rose-400/80 font-bold block mt-1">10</span>
            </div>

            {/* Row 2 */}
            <div className="p-2 flex items-center justify-center border border-slate-800 bg-slate-900/40 font-bold text-slate-400 uppercase text-[10px]">Actual Scam</div>
            <div className="p-4 border border-slate-800 bg-rose-950/10 text-rose-400 rounded">
              <span className="block font-bold">False Negative (FN)</span>
              <span className="text-[10px] text-rose-400/80 font-bold block mt-1">8</span>
            </div>
            <div className="p-4 border border-slate-800 bg-emerald-950/15 text-emerald-400 rounded">
              <span className="block font-bold">True Positive (TP)</span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-1">172</span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="flex-1 max-w-md space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Matrix Definition
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The confusion matrix is a tabular layout that enables visualization of the performance of a supervised learning classifier. Each row represents instances in an actual class, while each column represents instances in a predicted class.
            </p>
            <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-1 font-mono">
              <li><strong>TN:</strong> Correctly identified safe communication messages.</li>
              <li><strong>TP:</strong> Correctly identified fraudulent scam attempts.</li>
              <li><strong>FP (Type I Error):</strong> Safe messages misclassified as scam threats.</li>
              <li><strong>FN (Type II Error):</strong> Scam threats missed by the ML model.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

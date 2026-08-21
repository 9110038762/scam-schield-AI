import React from 'react';
import { MODEL_EVALUATION_METRICS } from '../data/mockData';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend,
  CartesianGrid 
} from 'recharts';

export const ModelTable: React.FC = () => {
  // Parse metrics to numbers for chart rendering
  const chartData = MODEL_EVALUATION_METRICS.map(metric => ({
    name: metric.model.split(' (')[0], // Extract main name
    Accuracy: parseFloat(metric.accuracy),
    Precision: parseFloat(metric.precision),
    Recall: parseFloat(metric.recall),
    'F1-Score': parseFloat(metric.f1Score)
  }));

  return (
    <div className="space-y-6">
      {/* Metrics Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-mono uppercase">
              <th className="p-4 font-bold">Classifier Model</th>
              <th className="p-4 font-bold text-center">Accuracy</th>
              <th className="p-4 font-bold text-center">Precision</th>
              <th className="p-4 font-bold text-center">Recall</th>
              <th className="p-4 font-bold text-center">F1-Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm font-mono">
            {MODEL_EVALUATION_METRICS.map((metric, idx) => (
              <tr key={idx} className="hover:bg-slate-900/25 transition-colors">
                <td className="p-4 font-medium text-slate-200">{metric.model}</td>
                <td className="p-4 text-center text-slate-400 font-bold">{metric.accuracy}</td>
                <td className="p-4 text-center text-slate-400 font-bold">{metric.precision}</td>
                <td className="p-4 text-center text-slate-400 font-bold">{metric.recall}</td>
                <td className="p-4 text-center text-slate-400 font-bold">{metric.f1Score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model comparison chart */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800/80">
        <h4 className="text-sm font-bold tracking-wider text-slate-200 uppercase mb-4">
          Model Comparison Chart (%)
        </h4>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
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
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '10px' }} />
              <Bar dataKey="Accuracy" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={25} />
              <Bar dataKey="Precision" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={25} />
              <Bar dataKey="Recall" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={25} />
              <Bar dataKey="F1-Score" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

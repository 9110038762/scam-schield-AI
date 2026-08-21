import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { SCAM_DISTRIBUTION, SCAM_CATEGORY_DISTRIBUTION } from '../data/mockData';

export const ClassDistributionChart: React.FC = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={SCAM_DISTRIBUTION}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {SCAM_DISTRIBUTION.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: '#1e293b',
              color: '#f8fafc',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center space-x-6 text-xs font-mono mt-1">
        {SCAM_DISTRIBUTION.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-300 font-medium">{item.name} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CategoryDistributionChart: React.FC = () => {
  // Sort data descending for better horizontal presentation
  const sortedData = [...SCAM_CATEGORY_DISTRIBUTION].sort((a, b) => b.value - a.value);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} tickLine={false} />
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
          <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {sortedData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={`rgba(6, 182, 212, ${1 - index * 0.08})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

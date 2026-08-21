import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Mic, 
  Database, 
  BarChart3, 
  History, 
  ShieldCheck
} from 'lucide-react';
import { SYSTEM_STATUS } from '../data/mockData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Message', icon: MessageSquareCode },
    { id: 'voice', label: 'Voice / ASR', icon: Mic },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },
    { id: 'evaluation', label: 'Model Evaluation', icon: BarChart3 },
    { id: 'history', label: 'Detection History', icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-900 flex items-center space-x-3">
        <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-md font-bold tracking-wider text-slate-100 m-0">SCAMSHIELD AI</h1>
          <p className="text-[10px] font-medium text-cyan-400 uppercase tracking-widest">AI Scam Detection</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                isActive 
                  ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50">
        <div className="rounded-lg bg-slate-900/40 border border-slate-800/60 p-3.5 text-center">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">System Status</p>
          <p className="text-xs font-mono font-bold text-cyan-400 mt-1">{SYSTEM_STATUS.version} Active</p>
        </div>
      </div>
    </aside>
  );
};

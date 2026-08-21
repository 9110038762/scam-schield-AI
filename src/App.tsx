import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { AnalyzeTab } from './components/AnalyzeTab';
import { VoiceTab } from './components/VoiceTab';
import { DatasetTab } from './components/DatasetTab';
import { ModelEvaluationTab } from './components/ModelEvaluationTab';
import { HistoryTab } from './components/HistoryTab';
import { RECENT_ANALYSES } from './data/mockData';
import type { AnalysisResult, HistoryRecord, InputType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [history, setHistory] = useState<HistoryRecord[]>(RECENT_ANALYSES);

  // Callback to register newly analyzed messages to the audit history log
  const handleAnalysisSuccess = (text: string, result: AnalysisResult, type: InputType = 'SMS') => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const newRecord: HistoryRecord = {
      id: `hist-${Date.now()}`,
      timestamp: timeStr,
      text,
      inputType: type,
      prediction: result.prediction,
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      indicators: result.indicators.map((ind) => ind.name)
    };

    setHistory((prev) => [newRecord, ...prev]);
  };

  // Helper to resolve header metadata dynamically based on active tab
  const getHeaderInfo = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return {
          title: "ScamShield AI Overview",
          subtitle: "AI-assisted detection of potentially fraudulent communication"
        };
      case 'analyze':
        return {
          title: "Analyze a Message",
          subtitle: "Check a suspicious message using the ScamShield AI detection pipeline"
        };
      case 'voice':
        return {
          title: "Voice Scam Analysis",
          subtitle: "Experimental ASR-to-NLP pipeline for future scam-call detection"
        };
      case 'dataset':
        return {
          title: "Dataset Explorer",
          subtitle: "Dataset preparation and analysis for scam classification"
        };
      case 'evaluation':
        return {
          title: "Model Evaluation",
          subtitle: "Baseline model comparison"
        };
      case 'history':
        return {
          title: "Detection History",
          subtitle: "History of messages evaluated by the classifier"
        };
      default:
        return {
          title: "ScamShield AI",
          subtitle: "Scam detection dashboard"
        };
    }
  };

  const headerInfo = getHeaderInfo(activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen bg-slate-950/20">
        {/* Sticky Page Header */}
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} />

        {/* Tab Routing Container */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewTab onNavigateToAnalyze={() => setActiveTab('analyze')} />
          )}
          {activeTab === 'analyze' && (
            <AnalyzeTab onAnalysisSuccess={(text, result, type) => handleAnalysisSuccess(text, result, type)} />
          )}
          {activeTab === 'voice' && (
            <VoiceTab onAnalysisSuccess={(text, result) => handleAnalysisSuccess(text, result, 'Voice Transcript')} />
          )}
          {activeTab === 'dataset' && (
            <DatasetTab />
          )}
          {activeTab === 'evaluation' && (
            <ModelEvaluationTab />
          )}
          {activeTab === 'history' && (
            <HistoryTab history={history} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

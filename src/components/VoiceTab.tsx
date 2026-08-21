import React from 'react';
import { ASRPanel } from './ASRPanel';
import type { AnalysisResult } from '../types';

interface VoiceTabProps {
  onAnalysisSuccess: (text: string, result: AnalysisResult) => void;
}

export const VoiceTab: React.FC<VoiceTabProps> = ({ onAnalysisSuccess }) => {
  return (
    <div className="space-y-6">
      <ASRPanel 
        onAnalysisSuccess={(text, result) => onAnalysisSuccess(text, result)}
      />
    </div>
  );
};

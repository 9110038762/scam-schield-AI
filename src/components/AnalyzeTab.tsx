import React from 'react';
import { MessageAnalyzer } from './MessageAnalyzer';
import type { AnalysisResult, InputType } from '../types';

interface AnalyzeTabProps {
  onAnalysisSuccess: (text: string, result: AnalysisResult, type: InputType) => void;
}

export const AnalyzeTab: React.FC<AnalyzeTabProps> = ({ onAnalysisSuccess }) => {
  return (
    <div className="space-y-6">
      <MessageAnalyzer 
        onAnalysisSuccess={onAnalysisSuccess} 
        inputType="SMS"
      />
    </div>
  );
};


import React from 'react';
import { Progress } from '@/components/ui/progress';

export interface PhaseProgressProps {
  progress: number;
}

const PhaseProgress: React.FC<PhaseProgressProps> = ({ progress }) => {
  const getProgressColor = (value: number) => {
    if (value < 25) return 'bg-red-500';
    if (value < 50) return 'bg-orange-500';
    if (value < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className={`h-2 ${getProgressColor(progress)}`} 
      />
    </div>
  );
};

export default PhaseProgress;


import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PhaseProgressProps {
  progress: number;
}

const PhaseProgress: React.FC<PhaseProgressProps> = ({ progress }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{progress}% completed</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-gray-200" 
        indicatorClassName={progress > 0 ? "bg-green-500" : ""}
      />
    </div>
  );
};

export default PhaseProgress;

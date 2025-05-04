
import React from 'react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface PhaseProgressProps {
  tasks: Task[];
  className?: string;
}

const PhaseProgress: React.FC<PhaseProgressProps> = ({ tasks, className }) => {
  const calculatePhaseProgress = () => {
    if (!tasks.length) return { percentage: 0, summary: 'No tasks' };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'complete').length;
    const inProgressTasks = tasks.filter(task => task.status === 'inprogress').length;
    const ongoingTasks = tasks.filter(task => task.status === 'ongoing').length;
    const notStartedTasks = tasks.filter(task => task.status === 'notstarted').length;
    
    let percentage = Math.round((completedTasks / totalTasks) * 100);
    
    // Contribute partial progress from in-progress and ongoing tasks
    percentage += Math.round((inProgressTasks * 0.5 + ongoingTasks * 0.25) / totalTasks * 100);
    
    // Ensure percentage is between 0 and 100
    percentage = Math.min(100, Math.max(0, percentage));

    const summary = `${completedTasks} completed, ${inProgressTasks} in progress, ${ongoingTasks} ongoing, ${notStartedTasks} not started`;
    
    return { percentage, summary };
  };

  const { percentage, summary } = calculatePhaseProgress();
  
  let progressColor = 'bg-red-500';
  if (percentage >= 75) progressColor = 'bg-green-500';
  else if (percentage >= 50) progressColor = 'bg-yellow-500';
  else if (percentage >= 25) progressColor = 'bg-orange-500';

  return (
    <div className={cn("mt-4", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">Phase Progress</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${progressColor}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {summary}
      </div>
    </div>
  );
};

export default PhaseProgress;

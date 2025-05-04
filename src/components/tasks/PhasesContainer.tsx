
import React from 'react';
import { Task, Phase } from '@/types';
import PhaseActions from '@/components/tasks/PhaseActions';
import TaskTable from '@/components/tasks/TaskTable';

interface PhasesContainerProps {
  phases: Phase[];
  filteredTasks: Task[];
  isAdmin: boolean;
  calculatePhaseProgress: (phaseId: string) => number;
  handleEditTask: (task: Task) => void;
  handleDeleteTaskClick: (task: Task) => void;
  handlePhaseSuccess: () => void;
}

const PhasesContainer: React.FC<PhasesContainerProps> = ({
  phases,
  filteredTasks,
  isAdmin,
  calculatePhaseProgress,
  handleEditTask,
  handleDeleteTaskClick,
  handlePhaseSuccess
}) => {
  return (
    <>
      {phases.map(phase => {
        const phaseTasks = filteredTasks.filter(task => task.phase_id === phase.id);
        const phaseProgress = calculatePhaseProgress(phase.id);
        
        return (
          <div key={phase.id} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                PHASE {phase.position}: {phase.name}
              </h2>
              {isAdmin && (
                <PhaseActions 
                  phase={phase} 
                  onSuccess={handlePhaseSuccess}
                  tasksExist={phaseTasks.length > 0}
                />
              )}
            </div>
            <div className="flex items-center mb-4">
              <div className="text-sm font-medium mr-4">{phaseProgress}% Complete</div>
              <div className="w-48 bg-muted rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full bg-primary" 
                  style={{ width: `${phaseProgress}%` }}
                ></div>
              </div>
            </div>
            
            <TaskTable 
              tasks={phaseTasks}
              isAdmin={isAdmin}
              onEdit={handleEditTask}
              onDelete={handleDeleteTaskClick}
              showPhaseColumn={false}
            />
          </div>
        );
      })}
    </>
  );
};

export default PhasesContainer;

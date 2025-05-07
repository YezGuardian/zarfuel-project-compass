
import React from 'react';
import { Phase, Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { PhaseHeader } from './PhaseHeader';
import PhaseProgress from './PhaseProgress';
import TaskTable from './TaskTable';
import EditPhaseDialog from './EditPhaseDialog';
import DeletePhaseDialog from './DeletePhaseDialog';

interface PhasesContainerProps {
  phases: Phase[];
  filteredTasks: Task[];
  isAdmin: boolean;
  calculatePhaseProgress: (phaseId: string) => number;
  handleEditTask: (task: Task) => void;
  handleDeleteTaskClick: (task: Task) => void;
  handlePhaseSuccess: () => void;
  onAddTask?: (phaseId: string) => void;
  onTaskOrderChange?: (tasks: Task[]) => void;
}

const PhasesContainer: React.FC<PhasesContainerProps> = ({
  phases,
  filteredTasks,
  isAdmin,
  calculatePhaseProgress,
  handleEditTask,
  handleDeleteTaskClick,
  handlePhaseSuccess,
  onAddTask,
  onTaskOrderChange
}) => {
  const [editPhase, setEditPhase] = React.useState<Phase | null>(null);
  const [deletePhase, setDeletePhase] = React.useState<Phase | null>(null);
  const [editPhaseDialogOpen, setEditPhaseDialogOpen] = React.useState(false);
  const [deletePhaseDialogOpen, setDeletePhaseDialogOpen] = React.useState(false);

  // Filter phases that have matching tasks (or include all phases if no tasks are filtered)
  const filteredPhaseIds = new Set(filteredTasks.map(task => task.phase_id));
  const visiblePhases = phases.filter(phase => 
    filteredTasks.length === 0 || filteredPhaseIds.has(phase.id)
  );

  const handleEditPhaseClick = (id: string, name: string) => {
    const phase = phases.find(p => p.id === id);
    if (phase) {
      setEditPhase(phase);
      setEditPhaseDialogOpen(true);
    }
  };

  const handleDeletePhaseClick = (id: string) => {
    const phase = phases.find(p => p.id === id);
    if (phase) {
      setDeletePhase(phase);
      setDeletePhaseDialogOpen(true);
    }
  };

  // Handle task order change within the same phase only
  const handleTaskOrderChange = (tasks: Task[]) => {
    // First verify all tasks are from the same phase
    if (tasks.length <= 1) return;
    
    const firstPhaseId = tasks[0]?.phase_id;
    const allSamePhase = tasks.every(task => task.phase_id === firstPhaseId);
    
    if (!allSamePhase) {
      console.warn('Cannot reorder tasks across different phases');
      return;
    }
    
    // Only call the prop function if tasks are in the same phase
    if (onTaskOrderChange && allSamePhase) {
      onTaskOrderChange(tasks);
    }
  };

  return (
    <div className="space-y-6">
      {visiblePhases.map((phase) => {
        const phaseTasks = filteredTasks.filter(task => task.phase_id === phase.id);
        const progress = calculatePhaseProgress(phase.id);

        return (
          <Card key={phase.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <PhaseHeader
                phase={phase}
                onEdit={handleEditPhaseClick}
                onDelete={handleDeletePhaseClick}
                tasksCount={phaseTasks.length}
                isAdmin={isAdmin}
                onAddTask={onAddTask}
              />
              
              <PhaseProgress progress={progress} />
              
              {phaseTasks.length > 0 && (
                <TaskTable
                  tasks={phaseTasks}
                  isAdmin={isAdmin}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTaskClick}
                  showPhaseColumn={false}
                  onTaskOrderChange={handleTaskOrderChange}
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Phase Dialog */}
      {editPhase && (
        <EditPhaseDialog
          phase={editPhase}
          onSubmit={(name) => {
            // Handle edit phase logic here
            handlePhaseSuccess();
            setEditPhaseDialogOpen(false);
          }}
          open={editPhaseDialogOpen}
          onOpenChange={setEditPhaseDialogOpen}
        />
      )}

      {/* Delete Phase Dialog */}
      {deletePhase && (
        <DeletePhaseDialog
          phase={deletePhase}
          onSubmit={() => {
            // Handle delete phase logic here
            handlePhaseSuccess();
            setDeletePhaseDialogOpen(false);
          }}
          open={deletePhaseDialogOpen}
          onOpenChange={setDeletePhaseDialogOpen}
        />
      )}
    </div>
  );
};

export default PhasesContainer;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import TaskFilters from '@/components/tasks/TaskFilters';
import ViewSelector from '@/components/tasks/ViewSelector';
import TaskTable from '@/components/tasks/TaskTable';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog';
import AddEditTaskDialog from '@/components/tasks/AddEditTaskDialog';
import AddPhaseDialog from '@/components/tasks/AddPhaseDialog';
import PhaseActions from '@/components/tasks/PhaseActions';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

const TasksPage: React.FC = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  
  // State for dialogs
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { isAdmin } = useAuth();
  const { tasks, phases, teams, isLoading, fetchData, handleDeleteTask } = useTasks();
  
  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = phaseFilter === 'all' || task.phase_id === phaseFilter;
    const matchesTeam = teamFilter === 'all' || (task.responsible_teams && task.responsible_teams.includes(teamFilter));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesPhase && matchesTeam && matchesStatus;
  });

  // Group tasks by phase for kanban view
  const tasksByPhase = phases.reduce((acc, phase) => {
    acc[phase.id] = filteredTasks.filter(task => task.phase_id === phase.id);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Calculate phase progress
  const calculatePhaseProgress = (phaseId: string) => {
    const phaseTasks = tasks.filter(task => task.phase_id === phaseId);
    if (phaseTasks.length === 0) return 0;
    
    const completedTasks = phaseTasks.filter(task => task.status === 'complete').length;
    return Math.round((completedTasks / phaseTasks.length) * 100);
  };
  
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setEditDialogOpen(true);
  };
  
  const handleDeleteTaskClick = (task: Task) => {
    setCurrentTask(task);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!currentTask || isProcessing) return;
    
    try {
      setIsProcessing(true);
      const success = await handleDeleteTask(currentTask.id);
      if (success) {
        setDeleteDialogOpen(false);
        toast.success('Task deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTaskSuccess = () => {
    setAddTaskDialogOpen(false);
    setEditDialogOpen(false);
    fetchData();
    toast.success(editDialogOpen ? 'Task updated successfully' : 'Task created successfully');
  };

  const handlePhaseSuccess = () => {
    fetchData();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Phases & Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage all project tasks across different phases
          </p>
        </div>
        
        {isAdmin() && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setAddPhaseDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
            <Button 
              className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
              onClick={() => setAddTaskDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        phaseFilter={phaseFilter}
        setPhaseFilter={setPhaseFilter}
        teamFilter={teamFilter}
        setTeamFilter={setTeamFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        phases={phases}
        teams={teams}
      />
      
      {/* View Selector */}
      <ViewSelector view={view} setView={setView} />
      
      {/* Tasks Views */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading tasks...</span>
        </div>
      ) : view === 'table' ? (
        phases.map(phase => {
          const phaseTasks = filteredTasks.filter(task => task.phase_id === phase.id);
          const phaseProgress = calculatePhaseProgress(phase.id);
          
          return (
            <div key={phase.id} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  PHASE {phase.position}: {phase.name}
                </h2>
                {isAdmin() && (
                  <PhaseActions 
                    phase={phase} 
                    onSuccess={handlePhaseSuccess}
                    tasksExist={tasks.some(task => task.phase_id === phase.id)}
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
                isAdmin={isAdmin()}
                onEdit={handleEditTask}
                onDelete={handleDeleteTaskClick}
                showPhaseColumn={false}
              />
            </div>
          );
        })
      ) : (
        <KanbanBoard
          phases={phases}
          tasksByPhase={tasksByPhase}
          isAdmin={isAdmin()}
          onEdit={handleEditTask}
          onDelete={handleDeleteTaskClick}
        />
      )}
      
      {/* Add/Edit Task Dialog */}
      <AddEditTaskDialog
        open={addTaskDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddTaskDialogOpen(false);
            setEditDialogOpen(false);
          }
        }}
        task={currentTask}
        mode={addTaskDialogOpen ? 'create' : 'edit'}
        onSuccess={handleTaskSuccess}
      />
      
      {/* Add Phase Dialog */}
      <AddPhaseDialog
        open={addPhaseDialogOpen}
        onOpenChange={setAddPhaseDialogOpen}
        onSuccess={handlePhaseSuccess}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={currentTask}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TasksPage;

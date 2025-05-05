
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { Task } from '@/types';
import TaskFilters from '@/components/tasks/TaskFilters';
import ViewSelector from '@/components/tasks/ViewSelector';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import AddEditTaskDialog from '@/components/tasks/AddEditTaskDialog';
import AddPhaseDialog from '@/components/tasks/AddPhaseDialog';
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog';
import PhasesContainer from '@/components/tasks/PhasesContainer';
import { supabase } from '@/integrations/supabase/client';

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
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
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
  
  const handleAddPhase = async (name: string) => {
    try {
      setIsProcessing(true);
      
      // Get the highest position
      const maxPosition = phases.reduce((max, phase) => 
        phase.position > max ? phase.position : max, 0
      );
      
      const { error } = await supabase.from('phases')
        .insert([{ name, position: maxPosition + 1 }]);
      
      if (error) throw error;
      
      toast.success('Phase added successfully');
      setAddPhaseDialogOpen(false);
      fetchData();
      return true;
    } catch (error) {
      console.error('Error adding phase:', error);
      toast.error('Failed to add phase');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddTaskForPhase = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setAddTaskDialogOpen(true);
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
              onClick={() => {
                setSelectedPhaseId(null);
                setAddTaskDialogOpen(true);
              }}
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
        <PhasesContainer 
          phases={phases}
          filteredTasks={filteredTasks}
          isAdmin={isAdmin()}
          calculatePhaseProgress={calculatePhaseProgress}
          handleEditTask={handleEditTask}
          handleDeleteTaskClick={handleDeleteTaskClick}
          handlePhaseSuccess={handlePhaseSuccess}
          onAddTask={handleAddTaskForPhase}
        />
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
        initialPhaseId={selectedPhaseId}
      />
      
      {/* Add Phase Dialog */}
      <Dialog open={addPhaseDialogOpen} onOpenChange={setAddPhaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription>
              Create a new phase to organize your tasks. The phase position will be assigned automatically.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-140px)]">
            <AddPhaseDialog
              onSubmit={handleAddPhase}
              onCancel={() => setAddPhaseDialogOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
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

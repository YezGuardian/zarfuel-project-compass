
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
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
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    fetchData();
    toast.success(editDialogOpen ? 'Task updated successfully' : 'Task created successfully');
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
          <Button 
            className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
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
        <TaskTable 
          tasks={filteredTasks}
          isAdmin={isAdmin()}
          onEdit={handleEditTask}
          onDelete={handleDeleteTaskClick}
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
        open={addDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
          }
        }}
        task={currentTask}
        mode={addDialogOpen ? 'create' : 'edit'}
        onSuccess={handleTaskSuccess}
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


import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import TaskForm from '@/components/tasks/TaskForm';
import { Search, LayoutGrid, List, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Task, Phase } from '@/types';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const TasksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const { isAdmin, user } = useAuth();
  
  // Fetch phases and tasks data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('phases')
        .select('*')
        .order('position');
        
      if (phasesError) throw phasesError;
      setPhases(phasesData as Phase[]);
      
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          phases:phase_id (name)
        `);
        
      if (tasksError) throw tasksError;
      
      // Transform tasks to match our Task type
      const formattedTasks = tasksData.map(task => ({
        ...task,
        phase: task.phases?.name,
        status: task.status as any,
      }));
      
      setTasks(formattedTasks as Task[]);
      
      // Extract unique teams
      const allTeams = new Set<string>();
      formattedTasks.forEach(task => {
        if (task.responsible_teams && Array.isArray(task.responsible_teams)) {
          task.responsible_teams.forEach(team => allTeams.add(team));
        }
      });
      setTeams(Array.from(allTeams));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up real-time updates for tasks
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks'
        }, 
        () => {
          fetchData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
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
  
  const handleDeleteTask = async () => {
    if (!currentTask) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', currentTask.id);
        
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== currentTask.id));
      toast.success('Task deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
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
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zarfuel-blue hover:bg-zarfuel-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to the project
                </DialogDescription>
              </DialogHeader>
              <TaskForm 
                onSuccess={() => {
                  setAddDialogOpen(false);
                  fetchData();
                }} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Tasks</CardTitle>
          <CardDescription>Filter the tasks by phase, team, status or search by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map(phase => (
                  <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="notstarted">Not Started</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* View Selector */}
      <div className="flex justify-end">
        <div className="bg-muted p-1 rounded-md inline-flex">
          <Button 
            variant={view === 'table' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('table')}
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button 
            variant={view === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setView('kanban')}
            className="flex items-center"
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Kanban
          </Button>
        </div>
      </div>
      
      {/* Tasks Views */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading tasks...</span>
        </div>
      ) : view === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phase</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Timeline</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progress</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    {isAdmin() && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">{task.phase}</td>
                        <td className="px-4 py-3 text-sm font-medium">{task.title}</td>
                        <td className="px-4 py-3 text-sm">
                          {task.responsible_teams?.join(', ') || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A'} - 
                          {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${task.progress}%`,
                                backgroundColor: 
                                  task.status === 'complete' ? '#10B981' :
                                  task.status === 'inprogress' ? '#F59E0B' :
                                  task.status === 'ongoing' ? '#3B82F6' : '#EF4444'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 inline-block">
                            {task.progress}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <TaskStatusBadge status={task.status} />
                        </td>
                        {isAdmin() && (
                          <td className="px-4 py-3 text-sm">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setCurrentTask(task);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setCurrentTask(task);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin() ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                        No tasks found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {phases.map(phase => (
            <Card key={phase.id} className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {phase.name} <span className="text-xs bg-muted rounded-full px-2 py-1 ml-2">{tasksByPhase[phase.id]?.length || 0}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasksByPhase[phase.id]?.length > 0 ? (
                  tasksByPhase[phase.id].map(task => (
                    <div key={task.id} className="bg-white border rounded-md p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        {isAdmin() && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setCurrentTask(task);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setCurrentTask(task);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-muted-foreground">
                          {task.responsible_teams?.join(', ') || 'No assigned team'}
                        </div>
                        <TaskStatusBadge status={task.status} className="ml-2" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {task.start_date && task.end_date ? (
                          <>
                            {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                          </>
                        ) : (
                          'No dates set'
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${task.progress}%`,
                            backgroundColor: 
                              task.status === 'complete' ? '#10B981' :
                              task.status === 'inprogress' ? '#F59E0B' :
                              task.status === 'ongoing' ? '#3B82F6' : '#EF4444'
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        {task.progress}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-sm">
                    No tasks in this phase
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details
            </DialogDescription>
          </DialogHeader>
          {currentTask && (
            <TaskForm 
              initialData={currentTask}
              mode="edit"
              onSuccess={() => {
                setEditDialogOpen(false);
                fetchData();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{currentTask?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteTask}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksPage;

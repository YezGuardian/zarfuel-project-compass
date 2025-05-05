
import { useState, useEffect, useCallback } from 'react';
import { Task, Phase } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { progressMap } from '@/components/tasks/TaskFormSchema';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<string[]>([]);
  
  // Fetch phases and tasks data
  const fetchData = useCallback(async () => {
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
      const formattedTasks = tasksData.map(task => {
        // Use the progressMap to determine progress based on status
        const progressValue = progressMap[task.status as keyof typeof progressMap] || 0;
        
        return {
          ...task,
          phase: task.phases?.name,
          status: task.status as any,
          // Add the progress property
          progress: progressValue,
          // Add progress_summary if it doesn't exist
          progress_summary: task.progress_summary || '',
          duration: task.duration || '' // Handle the duration field explicitly
        };
      });
      
      setTasks(formattedTasks as unknown as Task[]);
      
      // Extract unique teams
      const allTeams = new Set<string>();
      formattedTasks.forEach(task => {
        if (task.responsible_teams && Array.isArray(task.responsible_teams)) {
          task.responsible_teams.forEach(team => allTeams.add(team));
        }
      });

      // Add default teams if they don't exist
      ['ZARSOM', 'SAPPI', 'Afzelia', 'Executive Team'].forEach(team => allTeams.add(team));
      
      setTeams(Array.from(allTeams));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates for tasks
    const tasksChannel = supabase
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
      
    // Set up real-time updates for phases
    const phasesChannel = supabase
      .channel('phases-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'phases'
        }, 
        () => {
          fetchData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(phasesChannel);
    };
  }, [fetchData]);

  // Function to handle phase creation
  const handleCreatePhase = async (name: string) => {
    try {
      // Get max position from existing phases
      let maxPosition = 0;
      if (phases.length > 0) {
        maxPosition = Math.max(...phases.map(phase => phase.position));
      }
      
      const { data, error } = await supabase
        .from('phases')
        .insert({
          name,
          position: maxPosition + 1
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update phases locally
      setPhases(prev => [...prev, data as Phase]);
      toast.success(`Phase "${name}" created successfully`);
      return data;
    } catch (error: any) {
      console.error('Error creating phase:', error);
      toast.error('Failed to create phase');
      return null;
    }
  };

  // Function to handle phase update
  const handleUpdatePhase = async (phaseId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('phases')
        .update({ name })
        .eq('id', phaseId);
      
      if (error) throw error;
      
      // Update phases locally
      setPhases(prev => prev.map(phase => 
        phase.id === phaseId ? { ...phase, name } : phase
      ));
      
      toast.success('Phase updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating phase:', error);
      toast.error('Failed to update phase');
      return false;
    }
  };

  // Function to handle phase deletion
  const handleDeletePhase = async (phaseId: string) => {
    try {
      // Check if phase has tasks
      const hasTasksInPhase = tasks.some(task => task.phase_id === phaseId);
      
      if (hasTasksInPhase) {
        toast.error('Cannot delete phase with tasks. Delete all tasks in this phase first.');
        return false;
      }
      
      const { error } = await supabase
        .from('phases')
        .delete()
        .eq('id', phaseId);
      
      if (error) throw error;
      
      // Update phases locally
      setPhases(prev => prev.filter(phase => phase.id !== phaseId));
      
      toast.success('Phase deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      toast.error('Failed to delete phase');
      return false;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== taskId));
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  };

  return {
    tasks,
    phases,
    teams,
    isLoading,
    fetchData,
    handleDeleteTask,
    handleCreatePhase,
    handleUpdatePhase,
    handleDeletePhase
  };
};

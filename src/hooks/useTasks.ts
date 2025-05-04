
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
          progress_summary: task.progress_summary || ''
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
    handleDeleteTask
  };
};

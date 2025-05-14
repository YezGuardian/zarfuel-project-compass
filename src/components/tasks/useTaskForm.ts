import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Task, Phase } from '@/types';
import { taskFormSchema, defaultValues, TaskFormValues, progressMap } from './TaskFormSchema';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { createTaskNotification } from '@/utils/notificationService';

interface UseTaskFormProps {
  initialData?: Task | null;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export const useTaskForm = ({ initialData, mode = 'create', onSuccess }: UseTaskFormProps) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamSuggestions, setTeamSuggestions] = useState<string[]>([]);
  
  const { user, profile } = useAuth();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialData 
      ? {
          ...initialData,
          start_date: initialData.start_date || null,
          end_date: initialData.end_date || null,
          duration: initialData.duration || '',
          responsible_teams: initialData.responsible_teams || [],
        }
      : defaultValues,
  });

  // Set initial selected teams when initialData changes
  useEffect(() => {
    if (initialData?.responsible_teams) {
      setSelectedTeams(initialData.responsible_teams);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const { data, error } = await supabase
          .from('phases')
          .select('*')
          .order('position');
        
        if (error) throw error;
        setPhases(data || []);
      } catch (error) {
        console.error('Error fetching phases:', error);
        toast.error('Failed to load phases');
      }
    };
    
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('responsible_teams');
          
        if (error) throw error;
        
        // Extract unique teams
        const allTeams = new Set<string>();
        
        // Add default teams
        ['ZARSOM', 'SAPPI', 'Afzelia', 'Executive Team'].forEach(team => 
          allTeams.add(team)
        );
        
        data.forEach(item => {
          if (item.responsible_teams && Array.isArray(item.responsible_teams)) {
            item.responsible_teams.forEach(team => allTeams.add(team));
          }
        });
        
        setTeams([...allTeams]);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    
    fetchPhases();
    fetchTeams();
  }, []);

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => {
      const isSelected = prev.includes(team);
      const newTeams = isSelected 
        ? prev.filter(t => t !== team) 
        : [...prev, team];
      
      // Directly update the form value to ensure it's always in sync
      form.setValue('responsible_teams', newTeams);
      return newTeams;
    });
  };
  
  const filterTeamSuggestions = (query: string) => {
    if (!query.trim()) return [];
    
    return teams.filter(team => 
      team.toLowerCase().includes(query.toLowerCase()) && 
      !selectedTeams.includes(team)
    );
  };

  const onSubmit = async (values: TaskFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting task form with values:", values);
      
      // Prepare base submission data (without duration field which may cause issues)
      const submissionData = {
        title: values.title,
        description: values.description,
        phase_id: values.phase_id,
        responsible_teams: selectedTeams,
        start_date: values.start_date,
        end_date: values.end_date,
        status: values.status,
        progress_summary: values.progress_summary || '',
        updated_by: user?.id
      };
      
      // Ensure title is provided (required by the database)
      if (!submissionData.title) {
        throw new Error("Task title is required");
      }

      // Get the user's full name for notifications
      const performedBy = profile ? `${profile.first_name} ${profile.last_name}` : user?.email || 'A user';
      
      if (mode === 'create') {
        // Create new task
        try {
          const { data, error } = await supabase.from('tasks').insert({
            ...submissionData,
            created_by: user?.id,
            // Add duration if provided
            ...(values.duration ? { duration: values.duration } : {})
          }).select('id').single();
          
          if (error) {
            // If the error contains "duration" in the message, try without it
            if (error.message.includes('duration')) {
              console.warn('Error with duration field, trying without it');
              const { data: dataWithoutDuration, error: errorWithoutDuration } = await supabase.from('tasks').insert({
                ...submissionData,
                created_by: user?.id,
              }).select('id').single();
              
              if (errorWithoutDuration) throw errorWithoutDuration;
              
              // Success without duration
              if (dataWithoutDuration?.id) {
                await createTaskNotification({
                  taskId: dataWithoutDuration.id,
                  taskTitle: values.title,
                  action: 'created',
                  performedBy,
                  excludeUserId: user?.id
                });
              }
            } else {
              // Some other error
              throw error;
            }
          } else {
            // Success with duration
            if (data?.id) {
              await createTaskNotification({
                taskId: data.id,
                taskTitle: values.title,
                action: 'created',
                performedBy,
                excludeUserId: user?.id
              });
            }
          }
        } catch (error: any) {
          console.error('Error creating task:', error);
          throw new Error(`Failed to create task: ${error.message || 'Unknown error'}`);
        }
      } else if (initialData?.id) {
        // Check if the task is being marked as complete
        const isCompletingTask = initialData.status !== 'complete' && values.status === 'complete';
        
        // Update existing task
        try {
          const { error } = await supabase.from('tasks').update({
            ...submissionData,
            // Add duration if provided
            ...(values.duration ? { duration: values.duration } : {})
          }).eq('id', initialData.id);
          
          if (error) {
            // If the error contains "duration" in the message, try without it
            if (error.message.includes('duration')) {
              console.warn('Error with duration field, trying without it');
              const { error: errorWithoutDuration } = await supabase.from('tasks').update(submissionData)
                .eq('id', initialData.id);
                
              if (errorWithoutDuration) throw errorWithoutDuration;
            } else {
              // Some other error
              throw error;
            }
          }
          
          // Send appropriate notification
          await createTaskNotification({
            taskId: initialData.id,
            taskTitle: values.title,
            action: isCompletingTask ? 'completed' : 'updated',
            performedBy,
            excludeUserId: user?.id
          });
        } catch (error: any) {
          console.error('Error updating task:', error);
          throw new Error(`Failed to update task: ${error.message || 'Unknown error'}`);
        }
      }
      
      // Reset form for create mode
      if (mode === 'create') {
        form.reset(defaultValues);
        setSelectedTeams([]);
      }
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
      toast.success(`Task ${mode === 'create' ? 'created' : 'updated'} successfully`);
      
    } catch (error: any) {
      console.error('Error submitting task:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} task: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    phases,
    teams,
    selectedTeams,
    isSubmitting,
    toggleTeam,
    onSubmit,
    filterTeamSuggestions,
    setTeamSuggestions,
    teamSuggestions
  };
};

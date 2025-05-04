
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Task, Phase } from '@/types';
import { taskFormSchema, TaskFormValues, progressMap } from './TaskFormSchema';

interface UseTaskFormProps {
  initialData?: Task;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export const useTaskForm = ({ initialData, mode = 'create', onSuccess }: UseTaskFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [teams, setTeams] = useState<string[]>(['ZARSOM', 'SAPPI', 'Afzelia', 'Executive Team']);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      phase_id: initialData?.phase_id || '',
      responsible_teams: initialData?.responsible_teams || [],
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      end_date: initialData?.end_date ? new Date(initialData.end_date) : undefined,
      status: initialData?.status || 'notstarted',
      progress_summary: initialData?.description || '',
    },
  });
  
  // Fetch phases
  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const { data, error } = await supabase
          .from('phases')
          .select('*')
          .order('position');
          
        if (error) throw error;
        
        if (data) {
          setPhases(data as Phase[]);
        }
      } catch (error) {
        console.error('Error fetching phases:', error);
        toast.error('Failed to load phases');
      }
    };

    fetchPhases();
    
    // Set selected teams from initialData if available
    if (initialData?.responsible_teams) {
      setSelectedTeams(initialData.responsible_teams);
    }
  }, [initialData]);
  
  const toggleTeam = (team: string) => {
    const currentTeams = form.getValues('responsible_teams') || [];
    if (currentTeams.includes(team)) {
      const updatedTeams = currentTeams.filter(t => t !== team);
      form.setValue('responsible_teams', updatedTeams);
      setSelectedTeams(updatedTeams);
    } else {
      const updatedTeams = [...currentTeams, team];
      form.setValue('responsible_teams', updatedTeams);
      setSelectedTeams(updatedTeams);
    }
  };
  
  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // For create, make sure title is included (required by database schema)
        const { error } = await supabase
          .from('tasks')
          .insert({
            title: values.title,
            description: values.description,
            phase_id: values.phase_id,
            responsible_teams: values.responsible_teams,
            status: values.status,
            start_date: values.start_date ? values.start_date.toISOString() : null,
            end_date: values.end_date ? values.end_date.toISOString() : null,
            progress_summary: values.progress_summary,
            created_by: user.id,
            updated_by: user.id,
          });
          
        if (error) throw error;
        toast.success('Task created successfully');
      } else {
        if (!initialData?.id) throw new Error('Task ID is required for updates');
        
        // For update, make sure title is included (required by database schema)
        const { error } = await supabase
          .from('tasks')
          .update({
            title: values.title,
            description: values.description,
            phase_id: values.phase_id,
            responsible_teams: values.responsible_teams,
            status: values.status,
            start_date: values.start_date ? values.start_date.toISOString() : null,
            end_date: values.end_date ? values.end_date.toISOString() : null,
            progress_summary: values.progress_summary,
            updated_by: user.id,
          })
          .eq('id', initialData.id);
          
        if (error) throw error;
        toast.success('Task updated successfully');
      }
      
      if (onSuccess) onSuccess();
      
      // Reset form after successful submission
      if (mode === 'create') {
        form.reset({
          title: '',
          description: '',
          phase_id: '',
          responsible_teams: [],
          start_date: undefined,
          end_date: undefined,
          status: 'notstarted',
          progress_summary: '',
        });
        setSelectedTeams([]);
      }
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast.error(error.message || 'Failed to save task');
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
    onSubmit
  };
};

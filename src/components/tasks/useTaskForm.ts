
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Task, Phase } from '@/types';
import { taskFormSchema, defaultValues, TaskFormValues, progressMap } from './TaskFormSchema';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  
  const { user } = useAuth();

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
    
    // Set initial selected teams
    if (initialData?.responsible_teams) {
      setSelectedTeams(initialData.responsible_teams);
    }
  }, [initialData]);

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => {
      const isSelected = prev.includes(team);
      if (isSelected) {
        return prev.filter(t => t !== team);
      } else {
        return [...prev, team];
      }
    });
    
    // Update the form value
    form.setValue('responsible_teams', selectedTeams.includes(team) 
      ? selectedTeams.filter(t => t !== team) 
      : [...selectedTeams, team]
    );
  };

  const onSubmit = async (values: TaskFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Always set responsible_teams from our state
      values.responsible_teams = selectedTeams;
      
      // Calculate progress based on status
      const progress = progressMap[values.status as keyof typeof progressMap] || 0;
      
      if (mode === 'create') {
        const { error } = await supabase.from('tasks').insert({
          ...values,
          progress,
          created_by: user?.id,
          updated_by: user?.id,
        });
        
        if (error) throw error;
      } else if (initialData?.id) {
        const { error } = await supabase.from('tasks')
          .update({
            ...values,
            progress,
            updated_by: user?.id,
          })
          .eq('id', initialData.id);
        
        if (error) throw error;
      }
      
      // Reset form
      if (mode === 'create') {
        form.reset(defaultValues);
        setSelectedTeams([]);
      }
      
      // Call success callback
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error submitting task:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} task`);
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
  };
};

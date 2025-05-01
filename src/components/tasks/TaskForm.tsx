
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task, Phase } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  phase_id: z.string({ required_error: "Please select a phase" }),
  responsible_teams: z.array(z.string()).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  status: z.enum(['notstarted', 'inprogress', 'ongoing', 'complete']),
});

interface TaskFormProps {
  onSuccess?: () => void;
  initialData?: Task;
  mode?: 'create' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  onSuccess, 
  initialData, 
  mode = 'create' 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [teams, setTeams] = useState<string[]>(['ZARSOM', 'SAPPI', 'Environmental', 'Engineering', 'Logistics']);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      phase_id: initialData?.phase_id || '',
      responsible_teams: initialData?.responsible_teams || [],
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      end_date: initialData?.end_date ? new Date(initialData.end_date) : undefined,
      status: initialData?.status || 'notstarted',
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
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Calculate task progress based on status
    const progressMap = {
      notstarted: 0,
      inprogress: 50,
      ongoing: 70,
      complete: 100
    };
    
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the task..." 
                  className="min-h-[100px]" 
                  {...field} 
                  disabled={isSubmitting} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phase_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phase*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a phase" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {phases.map(phase => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsible_teams"
          render={() => (
            <FormItem>
              <FormLabel>Responsible Teams</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {teams.map(team => (
                  <Button
                    key={team}
                    type="button"
                    variant={selectedTeams.includes(team) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTeam(team)}
                    disabled={isSubmitting}
                  >
                    {team}
                  </Button>
                ))}
              </div>
              <FormDescription>
                Select the teams responsible for this task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={isSubmitting}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={isSubmitting}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status*</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="notstarted">Not Started</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </span>
          ) : (
            mode === 'create' ? 'Create Task' : 'Update Task'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TaskForm;

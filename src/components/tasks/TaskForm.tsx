
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Task } from '@/types';
import { useTaskForm } from './useTaskForm';
import TeamSelector from './TeamSelector';
import TaskDatePicker from './TaskDatePicker';
import StatusSelector from './StatusSelector';
import PhaseSelector from './PhaseSelector';

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
  const {
    form,
    phases,
    teams,
    selectedTeams,
    isSubmitting,
    toggleTeam,
    onSubmit
  } = useTaskForm({ initialData, mode, onSuccess });
  
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
            <PhaseSelector
              phases={phases}
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="responsible_teams"
          render={() => (
            <TeamSelector 
              teams={teams}
              selectedTeams={selectedTeams}
              onToggleTeam={toggleTeam}
              disabled={isSubmitting}
            />
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <TaskDatePicker
                date={field.value}
                onSelect={field.onChange}
                label="Start Date"
                disabled={isSubmitting}
              />
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <TaskDatePicker
                date={field.value}
                onSelect={field.onChange}
                label="End Date"
                disabled={isSubmitting}
              />
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <StatusSelector
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
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

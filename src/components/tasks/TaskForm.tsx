
import React, { useState, useEffect } from 'react';
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
import { Loader2, Plus, X } from 'lucide-react';
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
    onSubmit,
    filterTeamSuggestions,
    teamSuggestions,
    setTeamSuggestions
  } = useTaskForm({ initialData, mode, onSuccess });

  const [newTeam, setNewTeam] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  
  const handleAddTeam = () => {
    if (newTeam.trim()) {
      toggleTeam(newTeam.trim());
      setNewTeam('');
    }
    setIsAddingTeam(false);
    setTeamSuggestions([]);
  };
  
  const handleNewTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTeam(value);
    
    // Filter team suggestions based on input
    if (value.trim()) {
      const suggestions = filterTeamSuggestions(value);
      setTeamSuggestions(suggestions);
    } else {
      setTeamSuggestions([]);
    }
  };
  
  const selectTeamSuggestion = (team: string) => {
    toggleTeam(team);
    setNewTeam('');
    setIsAddingTeam(false);
    setTeamSuggestions([]);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name*</FormLabel>
              <FormControl>
                <Input placeholder="Task name" {...field} disabled={isSubmitting} />
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
            <FormItem>
              <FormLabel>Responsible Teams</FormLabel>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['ZARSOM', 'SAPPI', 'Afzelia', 'Executive Team'].map(team => (
                    <Button
                      key={team}
                      type="button"
                      size="sm"
                      variant={selectedTeams.includes(team) ? "default" : "outline"}
                      className={selectedTeams.includes(team) ? "" : "border-dashed"}
                      onClick={() => toggleTeam(team)}
                      disabled={isSubmitting}
                    >
                      {team}
                    </Button>
                  ))}
                  {selectedTeams
                    .filter(team => !['ZARSOM', 'SAPPI', 'Afzelia', 'Executive Team'].includes(team))
                    .map(team => (
                      <Button
                        key={team}
                        type="button"
                        size="sm"
                        variant="default"
                        className="flex items-center"
                        onClick={() => toggleTeam(team)}
                        disabled={isSubmitting}
                      >
                        {team}
                        <X className="ml-1 h-3 w-3" />
                      </Button>
                    ))
                  }
                  {!isAddingTeam ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-dashed"
                      onClick={() => setIsAddingTeam(true)}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Team
                    </Button>
                  ) : (
                    <div className="relative flex items-center space-x-2">
                      <Input
                        value={newTeam}
                        onChange={handleNewTeamChange}
                        placeholder="New team name"
                        className="h-9 w-[150px]"
                        autoFocus
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddTeam}
                        disabled={isSubmitting || !newTeam.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsAddingTeam(false);
                          setNewTeam('');
                          setTeamSuggestions([]);
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      
                      {/* Team suggestions dropdown */}
                      {teamSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 z-10 mt-1 w-[150px] bg-white dark:bg-gray-800 shadow-lg rounded-md border overflow-hidden">
                          <div className="max-h-[120px] overflow-y-auto">
                            {teamSuggestions.map(team => (
                              <div 
                                key={team}
                                className="px-3 py-2 hover:bg-muted cursor-pointer"
                                onClick={() => selectTeamSuggestion(team)}
                              >
                                {team}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <TaskDatePicker
                date={field.value}
                onSelect={(date) => field.onChange(date)}
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
                onSelect={(date) => field.onChange(date)}
                label="End Date"
                disabled={isSubmitting}
              />
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 2 weeks, 3 days, etc." 
                  {...field} 
                  disabled={isSubmitting} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                This will be displayed if no start/end dates are provided
              </p>
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
          name="progress_summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress Summary</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter progress summary..." 
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

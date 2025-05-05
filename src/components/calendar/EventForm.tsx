
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronDown, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TimePickerWrapper } from './TimePickerWrapper';

// Schema for event form
const eventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  location: z.string().optional(),
  start_date: z.date(),
  start_time: z.string(),
  end_date: z.date(),
  end_time: z.string(),
  is_meeting: z.boolean().default(false),
  participants: z.array(z.string()).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSuccess?: (data: any) => void;
  initialData?: Partial<EventFormValues> & { is_meeting?: boolean };
}

const EventForm: React.FC<EventFormProps> = ({ onSuccess, initialData }) => {
  const { user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(initialData?.participants || []);

  // Initialize form with default values
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      start_time: initialData?.start_time || '09:00',
      end_date: initialData?.end_date ? new Date(initialData.end_date) : new Date(),
      end_time: initialData?.end_time || '10:00',
      is_meeting: initialData?.is_meeting || false,
      participants: initialData?.participants || [],
    },
  });

  // Fetch users for participant selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .order('first_name');
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle form submission
  const onSubmit = async (values: EventFormValues) => {
    if (!user) {
      toast.error('You must be logged in to create an event');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the start and end datetimes
      const startDate = values.start_date;
      const endDate = values.end_date;
      
      // Create ISO strings for start and end times
      const [startHour, startMinute] = values.start_time.split(':').map(Number);
      const [endHour, endMinute] = values.end_time.split(':').map(Number);
      
      startDate.setHours(startHour, startMinute, 0);
      endDate.setHours(endHour, endMinute, 0);
      
      const eventData = {
        title: values.title,
        description: values.description || '',
        location: values.location || '',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        is_meeting: values.is_meeting,
        created_by: user.id,
      };
      
      if (onSuccess) {
        const success = await onSuccess(eventData);
        if (success && values.is_meeting && selectedParticipants.length > 0) {
          // Handle participants if it's a meeting
          // This part would be better handled by the parent component or with a transaction
        }
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle participant selection
  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    
    // Update form value for participants
    form.setValue('participants', 
      selectedParticipants.includes(userId)
        ? selectedParticipants.filter(id => id !== userId)
        : [...selectedParticipants, userId]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title*</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} disabled={isSubmitting} />
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
                  placeholder="Describe the event..."
                  className="min-h-[80px]"
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
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event location" {...field} disabled={isSubmitting} />
              </FormControl>
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
                <FormLabel>Start Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
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
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time*</FormLabel>
                <FormControl>
                  <TimePickerWrapper
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
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
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time*</FormLabel>
                <FormControl>
                  <TimePickerWrapper
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="is_meeting"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>This is a meeting</FormLabel>
                <FormDescription>
                  Mark as a meeting to add participants and meeting minutes
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {form.watch('is_meeting') && (
          <FormField
            control={form.control}
            name="participants"
            render={() => (
              <FormItem>
                <FormLabel>Participants</FormLabel>
                <FormDescription>
                  Select users to invite to this meeting
                </FormDescription>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`participant-${user.id}`}
                        checked={selectedParticipants.includes(user.id)}
                        onCheckedChange={() => toggleParticipant(user.id)}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor={`participant-${user.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {user.first_name} {user.last_name} ({user.email})
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;

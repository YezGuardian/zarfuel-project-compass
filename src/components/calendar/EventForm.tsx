
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Event, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  start_time: z.string(),
  end_date: z.date({ required_error: "End date is required" }),
  end_time: z.string(),
  location: z.string().optional(),
  is_meeting: z.boolean().default(false),
  participants: z.array(z.string()).optional(),
  send_invitations: z.boolean().default(false),
  is_weekly: z.boolean().default(false)
});

interface EventFormProps {
  onSuccess?: () => void;
  initialData?: Event;
  mode?: 'create' | 'edit';
}

const EventForm: React.FC<EventFormProps> = ({ 
  onSuccess, 
  initialData, 
  mode = 'create' 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      start_date: initialData?.start_time ? new Date(initialData.start_time) : new Date(),
      start_time: initialData?.start_time ? format(new Date(initialData.start_time), 'HH:mm') : '09:00',
      end_date: initialData?.end_time ? new Date(initialData.end_time) : addHours(new Date(), 1),
      end_time: initialData?.end_time ? format(new Date(initialData.end_time), 'HH:mm') : '10:00',
      location: initialData?.location || '',
      is_meeting: initialData?.is_meeting || false,
      participants: [],
      send_invitations: false,
      is_weekly: false
    },
  });
  
  // Fetch users for participant selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role')
          .order('email');
          
        if (error) throw error;
        
        if (data) {
          setUsers(data as User[]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    fetchUsers();
    
    // Set selected participants from initialData if available
    if (initialData?.participants) {
      const userIds = initialData.participants.map(p => p.user_id);
      setSelectedUsers(userIds);
      form.setValue('participants', userIds);
    }
  }, [initialData, form]);
  
  const toggleParticipant = (userId: string) => {
    const currentParticipants = form.getValues('participants') || [];
    if (currentParticipants.includes(userId)) {
      const updatedParticipants = currentParticipants.filter(id => id !== userId);
      form.setValue('participants', updatedParticipants);
      setSelectedUsers(updatedParticipants);
    } else {
      const updatedParticipants = [...currentParticipants, userId];
      form.setValue('participants', updatedParticipants);
      setSelectedUsers(updatedParticipants);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time for start and end
      const startDateTime = combineDateTime(values.start_date, values.start_time);
      const endDateTime = combineDateTime(values.end_date, values.end_time);
      
      if (mode === 'create') {
        // Create a new event
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert({
            title: values.title,
            description: values.description,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            location: values.location,
            is_meeting: values.is_meeting,
            created_by: user.id
          })
          .select()
          .single();
          
        if (eventError) throw eventError;
        
        // Add participants if selected
        if (values.participants && values.participants.length > 0) {
          const participantsToInsert = values.participants.map(userId => ({
            event_id: eventData.id,
            user_id: userId,
            response: 'pending'
          }));
          
          const { error: participantsError } = await supabase
            .from('event_participants')
            .insert(participantsToInsert);
            
          if (participantsError) throw participantsError;
          
          // TODO: Send email invitations if selected
          if (values.send_invitations) {
            // This would be implemented in a future feature
            console.log('Should send invitations to:', values.participants);
          }
        }
        
        toast.success('Event created successfully');
      } else {
        if (!initialData?.id) throw new Error('Event ID is required for updates');
        
        // Update event
        const { error: eventError } = await supabase
          .from('events')
          .update({
            title: values.title,
            description: values.description,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            location: values.location,
            is_meeting: values.is_meeting
          })
          .eq('id', initialData.id);
          
        if (eventError) throw eventError;
        
        // Delete existing participants
        const { error: deleteError } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', initialData.id);
          
        if (deleteError) throw deleteError;
        
        // Add updated participants
        if (values.participants && values.participants.length > 0) {
          const participantsToInsert = values.participants.map(userId => ({
            event_id: initialData.id,
            user_id: userId,
            response: 'pending'
          }));
          
          const { error: participantsError } = await supabase
            .from('event_participants')
            .insert(participantsToInsert);
            
          if (participantsError) throw participantsError;
          
          // TODO: Send email invitations if selected
          if (values.send_invitations) {
            // This would be implemented in a future feature
            console.log('Should send invitations to:', values.participants);
          }
        }
        
        toast.success('Event updated successfully');
      }
      
      if (onSuccess) onSuccess();
      
      // Reset form after successful creation
      if (mode === 'create') {
        form.reset({
          title: '',
          description: '',
          start_date: new Date(),
          start_time: '09:00',
          end_date: new Date(),
          end_time: '10:00',
          location: '',
          is_meeting: false,
          participants: [],
          send_invitations: false,
          is_weekly: false
        });
        setSelectedUsers([]);
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to combine date and time
  const combineDateTime = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    return newDate;
  };
  
  // Generate time options for select
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  return (
    <Form {...form}>
      <ScrollArea className="h-full max-h-[calc(85vh-100px)]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title*</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} disabled={isSubmitting} />
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
            name="is_meeting"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Mark as Meeting</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                              <span>Select date</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                              <span>Select date</span>
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
                          disabled={(date) => {
                            // Disable dates before start date
                            const startDate = form.getValues('start_date');
                            return date < new Date(startDate.setHours(0, 0, 0, 0));
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="is_weekly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Weekly Event</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
                  <Input placeholder="Meeting location" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="participants"
            render={() => (
              <FormItem>
                <FormLabel>Participants</FormLabel>
                <div className="border rounded-md p-4">
                  {users.length > 0 ? (
                    <div className="space-y-2">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleParticipant(user.id)}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor={`user-${user.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {user.first_name} {user.last_name} ({user.email})
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No users available</div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="send_invitations"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Send Email Invitations</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting || selectedUsers.length === 0}
                  />
                </FormControl>
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
              mode === 'create' ? 'Create Event' : 'Update Event'
            )}
          </Button>
        </form>
      </ScrollArea>
    </Form>
  );
};

export default EventForm;

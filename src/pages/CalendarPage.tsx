import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isSameMonth, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { CalendarClock, Plus } from 'lucide-react';
import { Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EventForm from '@/components/calendar/EventForm';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useTasks } from '@/hooks/useTasks';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_meeting: boolean;
  location?: string;
}

type CalendarItem = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  isTask?: boolean;
  status?: string;
  taskId?: string;
  location?: string;
  isMeeting?: boolean;
};

// Update TaskStatus type
import { Status as TaskStatus } from '@/types';

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [dayEvents, setDayEvents] = useState<CalendarItem[]>([]);
  const [monthItems, setMonthItems] = useState<CalendarItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const { isAdmin } = useAuth();
  const { tasks } = useTasks();
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  useEffect(() => {
    // Update items when selectedDate changes
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    // Combine events and tasks for current month
    const combinedItems: CalendarItem[] = [];
    
    // Add events for current month
    events.forEach(event => {
      const startDate = parseISO(event.start_time);
      if (isSameMonth(startDate, selectedDate)) {
        combinedItems.push({
          id: event.id,
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          isMeeting: event.is_meeting,
          location: event.location
        });
      }
    });
    
    // Add tasks with due dates
    tasks.forEach(task => {
      if (task.end_date) {
        const endDate = parseISO(task.end_date);
        if (isSameMonth(endDate, selectedDate)) {
          combinedItems.push({
            id: task.id,
            title: task.title,
            description: task.description,
            start_time: task.end_date, // Using end date for tasks
            isTask: true,
            status: task.status,
            taskId: task.id
          });
        }
      }
    });
    
    setMonthItems(combinedItems);
    
    // Set day events for selected date
    const selectedDayItems = combinedItems.filter(item => {
      const itemDate = parseISO(item.start_time);
      return isSameDay(itemDate, selectedDate);
    });
    
    setDayEvents(selectedDayItems);
  }, [selectedDate, events, tasks]);
  
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const handleCreateSuccess = () => {
    fetchEvents();
    setDialogOpen(false);
  };
  
  const getDaysWithEvents = () => {
    const daysWithEvents = new Set<string>();
    
    // Add event days
    events.forEach(event => {
      daysWithEvents.add(format(parseISO(event.start_time), 'yyyy-MM-dd'));
    });
    
    // Add task due dates
    tasks.forEach(task => {
      if (task.end_date) {
        daysWithEvents.add(format(parseISO(task.end_date), 'yyyy-MM-dd'));
      }
    });
    
    return daysWithEvents;
  };
  
  // Get upcoming events and tasks
  const getUpcomingItems = () => {
    const now = new Date();
    const upcomingItems: CalendarItem[] = [];
    
    // Add upcoming events
    events.forEach(event => {
      const startDate = parseISO(event.start_time);
      if (isAfter(startDate, now)) {
        upcomingItems.push({
          id: event.id,
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          isMeeting: event.is_meeting,
          location: event.location
        });
      }
    });
    
    // Add upcoming tasks
    tasks.forEach(task => {
      if (task.end_date) {
        const endDate = parseISO(task.end_date);
        if (isAfter(endDate, now)) {
          upcomingItems.push({
            id: task.id,
            title: task.title,
            description: task.description,
            start_time: task.end_date,
            isTask: true,
            status: task.status,
            taskId: task.id
          });
        }
      }
    });
    
    // Sort by date (ascending)
    return upcomingItems.sort((a, b) => 
      parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
    ).slice(0, 5); // Limit to 5 items
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage meetings, events, and task deadlines
          </p>
        </div>
        
        {isAdmin() && (
          <Button 
            className="bg-zarfuel-blue hover:bg-zarfuel-blue/90"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  modifiers={{
                    eventDay: (date) => 
                      getDaysWithEvents().has(format(date, 'yyyy-MM-dd')),
                    today: (date) => isToday(date),
                  }}
                  modifiersClassNames={{
                    eventDay: "bg-blue-100 text-blue-900 relative before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:bg-primary before:rounded-full",
                    today: "bg-primary text-primary-foreground font-bold",
                  }}
                />
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedItem ? "Item Details" : `Calendar Items for ${format(selectedDate, 'MMMM yyyy')}`}
                  </h3>
                </div>
                
                <ScrollArea className="h-[300px]">
                  {selectedItem ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-lg">{selectedItem.title}</h4>
                        {selectedItem.isTask && (
                          <StatusBadge status={selectedItem.status as TaskStatus || 'notstarted'} />
                        )}
                        {selectedItem.isMeeting && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Meeting
                          </div>
                        )}
                      </div>
                      
                      {selectedItem.description && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground font-medium">Description:</p>
                          <p className="text-sm">{selectedItem.description}</p>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">Date:</p>
                        <p className="text-sm">{format(parseISO(selectedItem.start_time), 'PPP')}</p>
                      </div>
                      
                      {selectedItem.end_time && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground font-medium">Time:</p>
                          <p className="text-sm">
                            {format(parseISO(selectedItem.start_time), 'p')} - {format(parseISO(selectedItem.end_time), 'p')}
                          </p>
                        </div>
                      )}
                      
                      {selectedItem.location && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground font-medium">Location:</p>
                          <p className="text-sm">{selectedItem.location}</p>
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                          Back to List
                        </Button>
                      </div>
                    </div>
                  ) : dayEvents.length > 0 ? (
                    <div className="space-y-2">
                      {dayEvents.map(item => (
                        <div 
                          key={item.id} 
                          className="p-3 border rounded-md cursor-pointer hover:border-primary"
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex justify-between">
                            <div className="font-medium">{item.title}</div>
                            {item.isTask ? (
                              <StatusBadge status={item.status as TaskStatus || 'notstarted'} />
                            ) : (
                              <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {item.isMeeting ? 'Meeting' : 'Event'}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format(parseISO(item.start_time), 'p')}
                            {item.end_time && ` - ${format(parseISO(item.end_time), 'p')}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : monthItems.length > 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">
                        No items scheduled for {format(selectedDate, 'PPP')}
                      </p>
                      <p className="text-sm mt-2">
                        Select a day with events to view details
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">
                        No events or deadlines this month
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <CalendarClock className="mr-2 h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {getUpcomingItems().length > 0 ? (
                  getUpcomingItems().map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && <Separator className="my-2" />}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.title}</span>
                          {item.isTask ? (
                            <StatusBadge status={item.status as TaskStatus || 'notstarted'} />
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {item.isMeeting ? 'Meeting' : 'Event'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(item.start_time), 'PPP')}
                        </div>
                        {item.end_time && (
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(item.start_time), 'p')} - {format(parseISO(item.end_time), 'p')}
                          </div>
                        )}
                        {item.location && (
                          <div className="text-xs text-muted-foreground">
                            Location: {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <CalendarClock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No upcoming events or deadlines
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(85vh-120px)]">
            <EventForm onSuccess={handleCreateSuccess} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;

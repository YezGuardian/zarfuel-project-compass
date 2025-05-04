import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MoreHorizontal, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, parseISO, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Event, Task, Status } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/calendar/EventForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Type for combined events (meetings and task deadlines)
interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  isTask: boolean;
  status?: Status;
  taskId?: string;
  eventId?: string;
  is_meeting?: boolean;
  participants?: any[];
}

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const { isAdmin } = useAuth();
  
  // Fetch events and tasks
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          participants:event_participants(
            id,
            user_id,
            response,
            user:user_id(
              first_name,
              last_name,
              email
            )
          )
        `)
        .order('start_time');
        
      if (eventsError) throw eventsError;

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          phases:phase_id (name)
        `)
        .not('end_date', 'is', null);
      
      if (tasksError) throw tasksError;
      
      // Set events and tasks
      setEvents(eventsData as unknown as Event[]);
      setTasks(tasksData.map(task => ({
        ...task,
        phase: task.phases?.name,
      })) as unknown as Task[]);

      // Convert events and task deadlines into calendar items
      const eventItems: CalendarItem[] = eventsData.map(event => ({
        id: `event-${event.id}`,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        isTask: false,
        eventId: event.id,
        is_meeting: event.is_meeting,
        participants: event.participants
      }));

      const taskItems: CalendarItem[] = tasksData
        .filter(task => task.end_date)
        .map(task => ({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          start_time: task.end_date!, // Use end_date as the calendar date
          isTask: true,
          status: task.status as Status, // Explicitly cast to Status type
          taskId: task.id
        }));

      setCalendarItems([...eventItems, ...taskItems]);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up real-time updates
    const eventsChannel = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'events'
        }, 
        () => {
          fetchData();
        }
      )
      .subscribe();

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
      
    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, []);
  
  // Filter items for the selected date
  const selectedDateItems = date 
    ? calendarItems.filter(item => isSameDay(parseISO(item.start_time), date))
    : [];
  
  // Filter upcoming items
  const upcomingItems = calendarItems
    .filter(item => {
      const itemDate = parseISO(item.start_time);
      return itemDate >= new Date();
    })
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
    .slice(0, 5);
  
  const handleDeleteEvent = async () => {
    if (!currentEvent) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', currentEvent.id);
        
      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== currentEvent.id));
      toast.success('Event deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleViewItem = (item: CalendarItem) => {
    setSelectedItem(item);
    setItemDetailsOpen(true);
  };
  
  // Helper function to get relative date string
  const getRelativeDateString = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    if (isThisMonth(date)) return format(date, 'MMMM d'); // Month day
    return format(date, 'MMM d, yyyy'); // Full date
  };
  
  // Get date has events/tasks to show on the calendar
  const getDateHasItems = (day: Date) => {
    return calendarItems.some(item => isSameDay(parseISO(item.start_time), day));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Calendar</h1>
          <p className="text-muted-foreground">
            View and manage project events, meetings, and task deadlines
          </p>
        </div>
        
        {isAdmin() && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zarfuel-blue hover:bg-zarfuel-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
              <ScrollArea className="max-h-[calc(85vh-40px)]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Add a new event to the calendar
                  </DialogDescription>
                </DialogHeader>
                <EventForm 
                  onSuccess={() => {
                    setAddDialogOpen(false);
                    fetchData();
                  }} 
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              View all project events, meetings, and task deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full pointer-events-auto"
                modifiers={{
                  hasItems: day => getDateHasItems(day),
                }}
                modifiersStyles={{
                  hasItems: { 
                    textDecoration: "underline", 
                    fontWeight: "bold" 
                  }
                }}
              />
            </div>
            
            {/* Selected Date Items */}
            {date && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Calendar items for {format(date, 'MMMM d, yyyy')}
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : selectedDateItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className={`h-1 w-full ${
                          item.isTask 
                            ? 'bg-zarfuel-gold' 
                            : item.is_meeting 
                              ? 'bg-zarfuel-blue' 
                              : 'bg-green-500'
                        }`}></div>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {item.isTask && (
                                <Badge variant="outline" className="mr-2">
                                  Task Deadline
                                </Badge>
                              )}
                              <h4 className="font-medium">{item.title}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 p-2"
                                onClick={() => handleViewItem(item)}
                              >
                                View Details
                              </Button>
                              
                              {!item.isTask && isAdmin() && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        const fullEvent = events.find(e => e.id === item.eventId);
                                        if (fullEvent) {
                                          setCurrentEvent(fullEvent);
                                          setEditDialogOpen(true);
                                        }
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        const fullEvent = events.find(e => e.id === item.eventId);
                                        if (fullEvent) {
                                          setCurrentEvent(fullEvent);
                                          setDeleteDialogOpen(true);
                                        }
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          
                          {item.isTask && (
                            <div className="flex items-center mt-2">
                              <TaskStatusBadge status={item.status || 'notstarted'} />
                            </div>
                          )}
                          
                          {!item.isTask && (
                            <div className="text-sm text-muted-foreground mt-2">
                              {format(parseISO(item.start_time), 'h:mm a')} - {format(parseISO(item.end_time!), 'h:mm a')}
                            </div>
                          )}
                          
                          {item.location && (
                            <div className="text-sm mt-2">📍 {item.location}</div>
                          )}
                          
                          {item.description && (
                            <div className="text-sm mt-2">{item.description}</div>
                          )}
                          
                          {!item.isTask && item.participants && item.participants.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground mb-1">Participants:</div>
                              <div className="flex flex-wrap gap-1">
                                {item.participants.map((participant) => (
                                  <Badge key={participant.id} variant="outline" className="text-xs">
                                    {participant.user?.first_name} {participant.user?.last_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No events or task deadlines for this day
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 calendar items</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingItems.length > 0 ? (
              <div className="space-y-4">
                {upcomingItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between border-b pb-2 last:border-b-0 cursor-pointer hover:bg-muted/30 p-2 rounded"
                    onClick={() => handleViewItem(item)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center">
                        {item.isTask ? (
                          <Clock className="w-3 h-3 mr-1 text-zarfuel-gold" />
                        ) : (
                          <CalendarIcon className="w-3 h-3 mr-1" />
                        )}
                        <p className="font-medium">{item.title}</p>
                      </div>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <span>
                          {getRelativeDateString(item.start_time)}, {item.isTask ? 'Due date' : format(parseISO(item.start_time), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      className={
                        item.isTask
                          ? "bg-zarfuel-gold/20 text-zarfuel-gold text-xs py-1 px-2 rounded"
                          : item.is_meeting 
                            ? "bg-zarfuel-blue/20 text-zarfuel-blue text-xs py-1 px-2 rounded" 
                            : "bg-green-500/20 text-green-600 text-xs py-1 px-2 rounded"
                      }
                    >
                      {item.isTask ? 'Task' : item.is_meeting ? 'Meeting' : 'Event'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming events scheduled
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Item Details Dialog */}
      <Dialog open={itemDetailsOpen} onOpenChange={setItemDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
          <ScrollArea className="max-h-[calc(85vh-40px)]">
            <DialogHeader>
              <DialogTitle>
                {selectedItem?.isTask ? 'Task Details' : 'Event Details'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedItem && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">{selectedItem.title}</h3>
                    {selectedItem.isTask ? (
                      <div className="flex items-center mt-2">
                        <p className="text-sm mr-2">Status:</p>
                        <TaskStatusBadge status={selectedItem.status || 'notstarted'} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {selectedItem.is_meeting ? 'Meeting' : 'Event'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-sm">
                        {format(parseISO(selectedItem.start_time), 'EEEE, MMMM d, yyyy')}
                        {!selectedItem.isTask && selectedItem.end_time && (
                          <>, {format(parseISO(selectedItem.start_time), 'h:mm a')} - {format(parseISO(selectedItem.end_time), 'h:mm a')}</>
                        )}
                      </p>
                    </div>
                    
                    {selectedItem.location && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        <p className="text-sm">{selectedItem.location}</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.description && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Description:</p>
                      <p className="text-sm">{selectedItem.description}</p>
                    </div>
                  )}

                  {!selectedItem.isTask && selectedItem.participants && selectedItem.participants.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Participants:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.participants.map((participant) => (
                          <Badge key={participant.id} variant="outline" className="text-xs">
                            {participant.user?.first_name} {participant.user?.last_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
          <ScrollArea className="max-h-[calc(85vh-40px)]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update event details
              </DialogDescription>
            </DialogHeader>
            {currentEvent && (
              <EventForm 
                initialData={currentEvent}
                mode="edit"
                onSuccess={() => {
                  setEditDialogOpen(false);
                  fetchData();
                }} 
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[85vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{currentEvent?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteEvent}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarPage;


import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import { Event } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/calendar/EventForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const { isAdmin } = useAuth();
  
  // Fetch events
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
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
        
      if (error) throw error;
      
      // Use a type assertion to handle the mismatch between API response and our Event type
      setEvents((data || []) as unknown as Event[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
    
    // Set up real-time updates for events
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'events'
        }, 
        () => {
          fetchEvents();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filter events for the selected date
  const selectedDateEvents = date 
    ? events.filter(event => isSameDay(parseISO(event.start_time), date))
    : [];
  
  // Filter upcoming events
  const upcomingEvents = events
    .filter(event => {
      const eventDate = parseISO(event.start_time);
      return eventDate >= new Date();
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
  
  // Helper function to get relative date string
  const getRelativeDateString = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    if (isThisMonth(date)) return format(date, 'MMMM d'); // Month day
    return format(date, 'MMM d, yyyy'); // Full date
  };
  
  // Get event date dots to show on the calendar
  const getDateHasEvents = (day: Date) => {
    return events.some(event => isSameDay(parseISO(event.start_time), day));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Calendar</h1>
          <p className="text-muted-foreground">
            View and manage all project events and deadlines
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
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to the calendar
                </DialogDescription>
              </DialogHeader>
              <EventForm 
                onSuccess={() => {
                  setAddDialogOpen(false);
                  fetchEvents();
                }} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View all project events and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
                modifiers={{
                  hasEvents: day => getDateHasEvents(day),
                }}
                modifiersStyles={{
                  hasEvents: { 
                    textDecoration: "underline", 
                    fontWeight: "bold" 
                  }
                }}
              />
            </div>
            
            {/* Selected Date Events */}
            {date && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Events for {format(date, 'MMMM d, yyyy')}
                </h3>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map(event => (
                      <Card key={event.id} className="overflow-hidden">
                        <div className={`h-1 w-full ${event.is_meeting ? 'bg-zarfuel-blue' : 'bg-zarfuel-gold'}`}></div>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="text-sm text-muted-foreground">
                                {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                              </div>
                            </div>
                            {isAdmin() && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setCurrentEvent(event);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setCurrentEvent(event);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {event.location && (
                            <div className="text-sm mt-2">📍 {event.location}</div>
                          )}
                          {event.description && (
                            <div className="text-sm mt-2">{event.description}</div>
                          )}
                          {event.participants && event.participants.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground mb-1">Participants:</div>
                              <div className="flex flex-wrap gap-1">
                                {event.participants.map((participant) => (
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
                    No events scheduled for this day
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 events in your calendar</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-2">
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        <span>
                          {getRelativeDateString(event.start_time)}, {format(parseISO(event.start_time), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      className={event.is_meeting 
                        ? "bg-zarfuel-blue/20 text-zarfuel-blue text-xs py-1 px-2 rounded" 
                        : "bg-zarfuel-gold/20 text-zarfuel-blue text-xs py-1 px-2 rounded"
                      }
                    >
                      {event.is_meeting ? 'Meeting' : 'Event'}
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
      
      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                fetchEvents();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
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


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, Users, Clock, MapPin, FileText, Download, MoreHorizontal, Edit, Trash2, Upload } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Event, MeetingMinute } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/calendar/EventForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Event[]>([]);
  const [meetingMinutes, setMeetingMinutes] = useState<Record<string, MeetingMinute[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [minutesDialogOpen, setMinutesDialogOpen] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Event | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { user, isAdmin } = useAuth();
  
  // Fetch meetings and meeting minutes
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
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
        .eq('is_meeting', true)
        .order('start_time');
        
      if (meetingsError) throw meetingsError;
      
      setMeetings(meetingsData as Event[] || []);
      
      // Fetch meeting minutes for all meetings
      const minutesMap: Record<string, MeetingMinute[]> = {};
      
      for (const meeting of meetingsData || []) {
        const { data: minutesData, error: minutesError } = await supabase
          .from('meeting_minutes')
          .select(`
            *,
            uploader:uploaded_by(
              first_name,
              last_name,
              email
            )
          `)
          .eq('event_id', meeting.id);
          
        if (minutesError) throw minutesError;
        
        minutesMap[meeting.id] = minutesData as MeetingMinute[];
      }
      
      setMeetingMinutes(minutesMap);
    } catch (error) {
      console.error('Error fetching meetings data:', error);
      toast.error('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up real-time updates
    const channel = supabase
      .channel('meetings-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'events',
          filter: 'is_meeting=eq.true'
        }, 
        () => {
          fetchData();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meeting_minutes'
        }, 
        () => {
          fetchData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Split meetings into upcoming and previous
  const now = new Date();
  const upcomingMeetings = meetings.filter(meeting => parseISO(meeting.start_time) >= now);
  const previousMeetings = meetings.filter(meeting => parseISO(meeting.start_time) < now);
  
  const handleDeleteMeeting = async () => {
    if (!currentMeeting) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', currentMeeting.id);
        
      if (error) throw error;
      
      setMeetings(meetings.filter(m => m.id !== currentMeeting.id));
      toast.success('Meeting deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentMeeting || !user) return;
    
    const file = e.target.files[0];
    setUploadingFile(true);
    
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `meeting_minutes/${currentMeeting.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project_documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('project_documents')
        .getPublicUrl(filePath);
      
      // Create record in meeting_minutes table
      const { error: dbError } = await supabase
        .from('meeting_minutes')
        .insert({
          event_id: currentMeeting.id,
          file_path: publicUrl.publicUrl,
          file_name: file.name,
          uploaded_by: user.id
        });
        
      if (dbError) throw dbError;
      
      toast.success('Meeting minutes uploaded successfully');
      setUploadDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload meeting minutes');
    } finally {
      setUploadingFile(false);
    }
  };
  
  // Helper function to format relative date
  const getRelativeDateString = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (date < addDays(now, 7)) return format(date, 'EEEE'); // Day name if within a week
    return format(date, 'MMM d, yyyy'); // Full date
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings & Minutes</h1>
          <p className="text-muted-foreground">
            Schedule and manage committee meetings
          </p>
        </div>
        
        {isAdmin() && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zarfuel-blue hover:bg-zarfuel-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
                <DialogDescription>
                  Add a new meeting to the calendar
                </DialogDescription>
              </DialogHeader>
              <EventForm 
                onSuccess={() => {
                  setAddDialogOpen(false);
                  fetchData();
                }} 
                initialData={{
                  is_meeting: true
                } as any}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading meetings...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Meetings */}
          <div>
            <h2 className="text-xl font-medium">Upcoming Meetings</h2>
            {upcomingMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {upcomingMeetings.map(meeting => (
                  <Card key={meeting.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
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
                                  setCurrentMeeting(meeting);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setCurrentMeeting(meeting);
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
                      {meeting.description && (
                        <CardDescription>{meeting.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {getRelativeDateString(meeting.start_time)} • {format(parseISO(meeting.start_time), 'h:mm a')} - {format(parseISO(meeting.end_time), 'h:mm a')}
                          </span>
                        </div>
                        {meeting.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {meeting.participants && meeting.participants.length > 0
                              ? `${meeting.participants.length} participant${meeting.participants.length !== 1 ? 's' : ''}`
                              : 'No participants'}
                          </span>
                        </div>
                        <div className="pt-2 flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setCurrentMeeting(meeting);
                              setMinutesDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming meetings scheduled
              </div>
            )}
          </div>
          
          {/* Previous Meetings */}
          <div>
            <h2 className="text-xl font-medium">Previous Meetings & Minutes</h2>
            {previousMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {previousMeetings.map(meeting => (
                  <Card key={meeting.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
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
                                  setCurrentMeeting(meeting);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentMeeting(meeting);
                                  setUploadDialogOpen(true);
                                }}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Minutes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setCurrentMeeting(meeting);
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
                      {meeting.description && (
                        <CardDescription>{meeting.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(parseISO(meeting.start_time), 'MMM d, yyyy')} • {format(parseISO(meeting.start_time), 'h:mm a')} - {format(parseISO(meeting.end_time), 'h:mm a')}
                          </span>
                        </div>
                        {meeting.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {meetingMinutes[meeting.id] && meetingMinutes[meeting.id].length > 0 
                              ? `${meetingMinutes[meeting.id].length} minute${meetingMinutes[meeting.id].length !== 1 ? 's' : ''} available`
                              : 'No minutes available'}
                          </span>
                        </div>
                        <div className="pt-2 flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setCurrentMeeting(meeting);
                              setMinutesDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                          {meetingMinutes[meeting.id] && meetingMinutes[meeting.id].length > 0 && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-none"
                              onClick={() => {
                                setCurrentMeeting(meeting);
                                setMinutesDialogOpen(true);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Minutes
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No previous meetings found
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Edit Meeting Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update meeting details
            </DialogDescription>
          </DialogHeader>
          {currentMeeting && (
            <EventForm 
              initialData={currentMeeting}
              mode="edit"
              onSuccess={() => {
                setEditDialogOpen(false);
                fetchData();
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
              This will permanently delete the meeting "{currentMeeting?.title}" and all associated minutes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteMeeting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Upload Minutes Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Meeting Minutes</DialogTitle>
            <DialogDescription>
              Upload meeting minutes for "{currentMeeting?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="minutes-file">Select File</label>
              <Input 
                id="minutes-file" 
                type="file" 
                accept=".pdf,.doc,.docx,.txt" 
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Upload PDF, Word documents, or text files only.
            </p>
            {uploadingFile && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Meeting Details & Minutes Dialog */}
      <Dialog open={minutesDialogOpen} onOpenChange={setMinutesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentMeeting?.title}</DialogTitle>
            <DialogDescription>
              Meeting details and available minutes
            </DialogDescription>
          </DialogHeader>
          {currentMeeting && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Date & Time</h4>
                <p className="text-sm">
                  {format(parseISO(currentMeeting.start_time), 'EEEE, MMMM d, yyyy')} • {format(parseISO(currentMeeting.start_time), 'h:mm a')} - {format(parseISO(currentMeeting.end_time), 'h:mm a')}
                </p>
              </div>
              
              {currentMeeting.location && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Location</h4>
                  <p className="text-sm">{currentMeeting.location}</p>
                </div>
              )}
              
              {currentMeeting.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm">{currentMeeting.description}</p>
                </div>
              )}
              
              {currentMeeting.participants && currentMeeting.participants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Participants</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentMeeting.participants.map((participant) => (
                      <Badge key={participant.id} variant="outline" className="text-xs">
                        {participant.user?.first_name} {participant.user?.last_name}
                        <span className="ml-1 text-muted-foreground">
                          ({participant.response})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Meeting Minutes</h4>
                  {isAdmin() && parseISO(currentMeeting.start_time) < now && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setMinutesDialogOpen(false);
                        setUploadDialogOpen(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  )}
                </div>
                
                {meetingMinutes[currentMeeting.id] && meetingMinutes[currentMeeting.id].length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {meetingMinutes[currentMeeting.id].map((minutes) => (
                      <div key={minutes.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{minutes.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {minutes.uploader?.first_name} {minutes.uploader?.last_name} on {format(parseISO(minutes.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                        >
                          <a href={minutes.file_path} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    No meeting minutes have been uploaded yet
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingsPage;

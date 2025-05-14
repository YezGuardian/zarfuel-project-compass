import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Event } from '@/types';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface MeetingMinutesFormProps {
  meeting: Event;
  onSuccess: () => void;
  existingContent?: string;
  editMode?: boolean;
  minuteId?: string;
}

const MeetingMinutesForm: React.FC<MeetingMinutesFormProps> = ({
  meeting,
  onSuccess,
  existingContent = '',
  editMode = false,
  minuteId
}) => {
  const [content, setContent] = useState(existingContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter meeting minutes content');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to record meeting minutes');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editMode && minuteId) {
        // Update existing minutes - without updated_at field (will be handled by database trigger)
        const { error } = await supabase
          .from('meeting_minutes')
          .update({
            content: content,
            source_type: 'text'
          } as any)
          .eq('id', minuteId);
          
        if (error) throw error;
        
        toast.success('Meeting minutes updated successfully');
      } else {
        // Create new minutes - without updated_at field (will be handled by database)
        const { error } = await supabase
          .from('meeting_minutes')
          .insert({
            event_id: meeting.id,
            content: content,
            uploaded_by: user.id,
            source_type: 'text',
            file_path: null,
            file_name: null
          } as any);
          
        if (error) throw error;
        
        toast.success('Meeting minutes recorded successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving meeting minutes:', error);
      toast.error(`Failed to save meeting minutes: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Meeting Information</h3>
        <div className="mt-2 text-sm text-muted-foreground space-y-1">
          <p><strong>Title:</strong> {meeting.title}</p>
          <p><strong>Date:</strong> {format(parseISO(meeting.start_time), 'PPP')}</p>
          <p><strong>Time:</strong> {format(parseISO(meeting.start_time), 'p')} - {format(parseISO(meeting.end_time), 'p')}</p>
          {meeting.location && <p><strong>Location:</strong> {meeting.location}</p>}
          <p><strong>Participants:</strong> {meeting.participants?.length || 0} invited</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="minutes">Meeting Minutes</Label>
        <Textarea
          id="minutes"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Record the meeting minutes here..."
          className="min-h-[250px]"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? 'Updating...' : 'Recording...'}
            </>
          ) : (
            editMode ? 'Update Minutes' : 'Record Minutes'
          )}
        </Button>
      </div>
    </form>
  );
};

export default MeetingMinutesForm; 
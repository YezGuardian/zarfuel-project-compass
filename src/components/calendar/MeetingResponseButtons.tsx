import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventParticipant } from '@/types';
import { toast } from 'sonner';

interface MeetingResponseButtonsProps {
  participant: EventParticipant;
  eventId: string;
  eventTitle: string;
  onResponseUpdate?: (response: 'accepted' | 'declined') => void;
}

const MeetingResponseButtons: React.FC<MeetingResponseButtonsProps> = ({
  participant,
  eventId,
  eventTitle,
  onResponseUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>(participant.response);
  const [eventCreatorId, setEventCreatorId] = useState<string | null>(null);
  
  // Fetch the event creator ID when component mounts
  useEffect(() => {
    const fetchEventCreator = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('created_by')
          .eq('id', eventId)
          .single();
          
        if (error) throw error;
        
        if (data && data.created_by) {
          setEventCreatorId(data.created_by);
        }
      } catch (error) {
        console.error('Error fetching event creator:', error);
      }
    };
    
    fetchEventCreator();
  }, [eventId]);
  
  const updateResponse = async (response: 'accepted' | 'declined') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Update the participant's response
      const { error } = await supabase
        .from('event_participants')
        .update({ response })
        .eq('id', participant.id);
        
      if (error) throw error;
      
      // Create a notification for the event creator if we have their ID
      if (eventCreatorId) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: eventCreatorId,
            type: 'meeting_response',
            content: `A participant ${response === 'accepted' ? 'accepted' : 'declined'} your meeting: ${eventTitle}`,
            link: `/meetings`
          }]);
      }
      
      // Update local state
      setCurrentResponse(response);
      
      if (onResponseUpdate) {
        onResponseUpdate(response);
      }
      
      toast.success(`You have ${response} the meeting invitation.`);
    } catch (error) {
      console.error('Error updating response:', error);
      toast.error('Failed to update response');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (currentResponse === 'accepted') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-green-600 font-medium flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Accepted
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => updateResponse('declined')}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-1" />
          Decline
        </Button>
      </div>
    );
  }
  
  if (currentResponse === 'declined') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-red-600 font-medium flex items-center">
          <X className="h-4 w-4 mr-1" />
          Declined
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => updateResponse('accepted')}
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => updateResponse('accepted')}
        disabled={isLoading}
        className="border-green-500 text-green-600 hover:bg-green-50"
      >
        <Check className="h-4 w-4 mr-1" />
        Accept
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => updateResponse('declined')}
        disabled={isLoading}
        className="border-red-500 text-red-600 hover:bg-red-50"
      >
        <X className="h-4 w-4 mr-1" />
        Decline
      </Button>
    </div>
  );
};

export default MeetingResponseButtons; 
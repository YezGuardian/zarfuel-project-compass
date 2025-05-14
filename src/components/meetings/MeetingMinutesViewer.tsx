import React from 'react';
import { MeetingMinute, Event } from '@/types';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pencil, FileDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateMeetingMinutesPDF } from '@/utils/pdfGenerator';

interface MeetingMinutesViewerProps {
  minute: MeetingMinute;
  meeting: Event;
  onEdit: () => void;
}

const MeetingMinutesViewer: React.FC<MeetingMinutesViewerProps> = ({
  minute,
  meeting,
  onEdit
}) => {
  const { user, isAdmin } = useAuth();

  // Format the content for display (preserving line breaks)
  const formattedContent = minute.content && minute.content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));
  
  // Check if current user can edit minutes
  const canEdit = isAdmin() || user?.id === minute.uploaded_by;

  const handleDownloadPDF = () => {
    generateMeetingMinutesPDF(meeting, minute);
  };

  // Get uploader name
  const uploaderName = minute.uploader ? 
    `${minute.uploader.first_name || ''} ${minute.uploader.last_name || ''}`.trim() : 
    'Unknown User';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Meeting Minutes</h3>
          <p className="text-sm text-muted-foreground">
            Recorded by {uploaderName}
            {minute.created_at && ` on ${format(new Date(minute.created_at), 'PPP')}`}
            {minute.updated_at && minute.updated_at !== minute.created_at && 
              ` (Updated ${format(new Date(minute.updated_at), 'PPP')})`}
          </p>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF}>
            <FileDown className="h-3.5 w-3.5 mr-1" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-muted/20 whitespace-pre-wrap">
        {formattedContent}
      </div>
    </div>
  );
};

export default MeetingMinutesViewer; 
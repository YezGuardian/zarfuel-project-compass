import { jsPDF } from 'jspdf';
import { Event, MeetingMinute } from '@/types';
import { format } from 'date-fns';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateMeetingMinutesPDF = (meeting: Event, minute: MeetingMinute) => {
  if (!meeting || !minute) {
    console.error('Cannot generate PDF: missing meeting or minutes data');
    return;
  }
  
  try {
    const doc = new jsPDF();
    
    // Add company logo/title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 100);
    doc.text('ZARFUEL PROJECT', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Meeting Minutes', 105, 30, { align: 'center' });
    
    // Add meeting information
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    const meetingDate = format(new Date(meeting.start_time), 'MMMM d, yyyy');
    const meetingTime = `${format(new Date(meeting.start_time), 'h:mm a')} - ${format(new Date(meeting.end_time), 'h:mm a')}`;
    
    // Meeting details
    doc.setFontSize(11);
    doc.text(`Meeting Title: ${meeting.title || 'Untitled Meeting'}`, 20, 45);
    doc.text(`Date: ${meetingDate}`, 20, 52);
    doc.text(`Time: ${meetingTime}`, 20, 59);
    
    if (meeting.location) {
      doc.text(`Location: ${meeting.location}`, 20, 66);
    }
    
    // Recorded by info - safely handle missing uploader info
    let recordedBy = 'Unknown User';
    if (minute.uploader) {
      const firstName = minute.uploader.first_name || '';
      const lastName = minute.uploader.last_name || '';
      if (firstName || lastName) {
        recordedBy = `${firstName} ${lastName}`.trim();
      }
    }
    
    doc.text(`Recorded by: ${recordedBy}`, 20, meeting.location ? 73 : 66);
    
    // Add participants if available - with safe handling
    let yPosition = meeting.location ? 80 : 73;
    
    if (meeting.participants && Array.isArray(meeting.participants) && meeting.participants.length > 0) {
      doc.setFontSize(11);
      doc.text(`Participants (${meeting.participants.length}):`, 20, yPosition);
      yPosition += 7;
      
      const participantsPerRow = 2;
      const participantWidth = 85;
      
      // Calculate how many rows we'll need
      const rows = Math.ceil(meeting.participants.length / participantsPerRow);
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < participantsPerRow; j++) {
          const index = i * participantsPerRow + j;
          if (index < meeting.participants.length) {
            const participant = meeting.participants[index];
            let displayName = 'Unknown User';
            
            if (participant && participant.user) {
              const firstName = participant.user.first_name || '';
              const lastName = participant.user.last_name || '';
              if (firstName || lastName) {
                displayName = `${firstName} ${lastName}`.trim();
              } else if (participant.user.email) {
                displayName = participant.user.email;
              }
            }
            
            const status = participant && participant.response === 'accepted' ? '✓' : 
                          participant && participant.response === 'declined' ? '✗' : '?';
            
            doc.text(`${status} ${displayName}`, 20 + (j * participantWidth), yPosition);
          }
        }
        yPosition += 7;
      }
    }
    
    // Add description if available
    if (meeting.description) {
      yPosition += 5;
      doc.setFontSize(11);
      doc.text('Description:', 20, yPosition);
      yPosition += 7;
      
      // Split description into multiple lines if needed
      const descriptionLines = doc.splitTextToSize(meeting.description, 170);
      doc.text(descriptionLines, 20, yPosition);
      yPosition += descriptionLines.length * 7;
    }
    
    // Add minutes content
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('MEETING MINUTES', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    if (minute.content) {
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      // Split content into multiple lines
      const contentLines = doc.splitTextToSize(minute.content, 170);
      doc.text(contentLines, 20, yPosition);
    } else {
      doc.text('No minutes content available.', 20, yPosition);
    }
    
    // Add footer with date
    const today = format(new Date(), 'MMMM d, yyyy');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${today} - ZARFUEL PROJECT`, 105, 285, { align: 'center' });
    
    // Save the PDF
    const pdfName = `minutes_${(meeting.title || 'meeting').replace(/[^a-zA-Z0-9]/g, '_')}_${meetingDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(pdfName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}; 
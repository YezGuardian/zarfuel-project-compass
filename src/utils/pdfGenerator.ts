import { jsPDF } from 'jspdf';
import { Event, MeetingMinute } from '@/types';
import { format, parseISO } from 'date-fns';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateMeetingMinutesPDF = (meeting: Event, minute: MeetingMinute) => {
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
  
  const meetingDate = format(parseISO(meeting.start_time), 'MMMM d, yyyy');
  const meetingTime = `${format(parseISO(meeting.start_time), 'h:mm a')} - ${format(parseISO(meeting.end_time), 'h:mm a')}`;
  
  // Meeting details
  doc.setFontSize(11);
  doc.text(`Meeting Title: ${meeting.title}`, 20, 45);
  doc.text(`Date: ${meetingDate}`, 20, 52);
  doc.text(`Time: ${meetingTime}`, 20, 59);
  
  if (meeting.location) {
    doc.text(`Location: ${meeting.location}`, 20, 66);
  }
  
  // Recorded by info
  const recordedBy = minute.uploader ? 
    `${minute.uploader.first_name} ${minute.uploader.last_name}` : 
    'Unknown';
  
  doc.text(`Recorded by: ${recordedBy}`, 20, meeting.location ? 73 : 66);
  
  // Add participants if available
  let yPosition = meeting.location ? 80 : 73;
  
  if (meeting.participants && meeting.participants.length > 0) {
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
          const displayName = participant.user ? 
            `${participant.user.first_name} ${participant.user.last_name}` : 
            'Unknown';
          
          const status = participant.response === 'accepted' ? '✓' : 
                         participant.response === 'declined' ? '✗' : '?';
          
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
  const pdfName = `minutes_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_${meetingDate.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(pdfName);
}; 

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Calendar</h1>
        <p className="text-muted-foreground">
          View and manage all project events and deadlines
        </p>
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
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 events in your calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-1">
                  <p className="font-medium">Committee Meeting</p>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span>Tomorrow, 10:00 AM</span>
                  </div>
                </div>
                <span className="bg-zarfuel-gold/20 text-zarfuel-blue text-xs py-1 px-2 rounded">Meeting</span>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-1">
                  <p className="font-medium">Phase 1 Completion</p>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span>May 15, 2025</span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs py-1 px-2 rounded">Deadline</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Clock, MapPin, FileText, Download } from 'lucide-react';

const MeetingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings & Minutes</h1>
          <p className="text-muted-foreground">
            Schedule and manage committee meetings
          </p>
        </div>
        
        <Button className="bg-zarfuel-blue hover:bg-zarfuel-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>
      
      <div className="space-y-5">
        <h2 className="text-xl font-medium">Upcoming Meetings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Progress Review Meeting</CardTitle>
              <CardDescription>Monthly committee progress review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>May 15, 2025 • 10:00 AM - 12:00 PM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>ZARSOM Conference Room</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>6 participants</span>
                </div>
                <div className="pt-2 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-medium mt-8">Previous Meetings & Minutes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Kickoff Meeting</CardTitle>
              <CardDescription>Project initialization meeting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>April 5, 2025 • 9:00 AM - 11:00 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>ZARSOM Conference Room</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Minutes available</span>
                </div>
                <div className="pt-2 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-none">
                    <Download className="h-4 w-4 mr-1" />
                    Minutes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;

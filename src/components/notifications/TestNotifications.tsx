import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TestNotifications: React.FC = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendTestNotifications = async () => {
    if (!user) {
      toast.error('You must be logged in to send test notifications');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending test notifications to user ID:', user.id);
      
      // Create 3 test notifications directly in the database
      const notifications = [
        {
          user_id: user.id,
          type: 'task_created',
          content: 'Test notification: A new task "Quarterly Report" has been created',
          link: '/tasks',
          is_read: false
        },
        {
          user_id: user.id,
          type: 'meeting_created',
          content: 'Test notification: New meeting "Project Review" scheduled for tomorrow',
          link: '/calendar',
          is_read: false
        },
        {
          user_id: user.id,
          type: 'risk_created',
          content: 'Test notification: New risk "Budget Overrun" has been identified',
          link: '/risks',
          is_read: false
        }
      ];
      
      // Insert all notifications at once
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
      
      if (insertError) {
        console.error('Error creating notifications:', insertError);
        throw new Error(`Failed to create notifications: ${insertError.message}`);
      }
      
      console.log('Notifications created successfully:', data);
      
      // Refresh notifications in the UI
      await supabase.auth.refreshSession();
      
      toast.success('Test notifications sent successfully!');
    } catch (error: any) {
      console.error('Error sending test notifications:', error);
      setError(error.message || 'Failed to send test notifications');
      toast.error('Failed to send test notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-md mb-4">
      <h3 className="text-lg font-medium mb-2">Test Notifications</h3>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-sm text-muted-foreground mb-4">
        Send test notifications to {profile?.first_name || user?.email} for testing purposes.
      </p>
      
      <div className="flex flex-col gap-2">
        <Button onClick={sendTestNotifications} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Test Notifications'}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-2">
          User ID: {user?.id || 'Not logged in'}
        </p>
      </div>
    </div>
  );
};

export default TestNotifications; 
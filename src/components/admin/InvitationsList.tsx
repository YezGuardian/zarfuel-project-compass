
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

type Invitation = {
  id: string;
  email: string;
  role: string;
  organization: string | null;
  position: string | null;
  created_at: string;
  expires_at: string;
};

const InvitationsList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvitations();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInvitations();
    setRefreshing(false);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setInvitations(invitations.filter(inv => inv.id !== id));
      toast.success('Invitation deleted');
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error('Failed to delete invitation');
    }
  };
  
  const handleResend = async (invitation: Invitation) => {
    try {
      // Call the edge function to resend the invitation
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: invitation.email,
          role: invitation.role,
          organization: invitation.organization,
          position: invitation.position
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success(`Invitation resent to ${invitation.email}`);
      handleRefresh();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error(error.message || 'Failed to resend invitation');
    }
  };
  
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            View and manage invitations sent to potential users
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No pending invitations found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell className="capitalize">{invitation.role}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {isExpired(invitation.expires_at) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleResend(invitation)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationsList;


import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { RefreshCcw, UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization: string | null;
  position: string | null;
  last_sign_in_at: string | null;
};

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || '?';
  };
  
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-6">
            <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-zarfuel-blue text-white">
                            {getInitials(user.first_name, user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.first_name || user.last_name ? 
                              `${user.first_name || ''} ${user.last_name || ''}` : 
                              'Unnamed User'}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.organization || '-'}
                    </TableCell>
                    <TableCell>
                      {user.position || '-'}
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

export default UsersList;

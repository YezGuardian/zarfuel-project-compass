
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MoreHorizontal, Search, Shield, User, UserCog } from 'lucide-react';

const UsersList = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviters, setInviters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all users with their profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*, invited_by')
        .order('first_name');

      if (error) throw error;

      // Fetch inviters data
      const inviterIds = data
        .filter(user => user.invited_by)
        .map(user => user.invited_by);

      if (inviterIds.length > 0) {
        const { data: invitersData, error: invitersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', inviterIds);

        if (invitersError) throw invitersError;

        // Create a lookup map for inviters
        const invitersMap = invitersData.reduce((acc: Record<string, any>, inviter) => {
          acc[inviter.id] = inviter;
          return acc;
        }, {});

        setInviters(invitersMap);
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ));

      toast.success(`User role updated to ${role}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Make Yezreel Shirinda a superadmin
  useEffect(() => {
    const makeYezreelSuperAdmin = async () => {
      const yezreel = users.find(user => 
        user.email?.toLowerCase() === 'yezreel@whitepaperconcepts.co.za' ||
        (user.first_name === 'Yezreel' && user.last_name === 'Shirinda')
      );
      
      if (yezreel && yezreel.role !== 'superadmin') {
        await updateUserRole(yezreel.id, 'superadmin');
      }
    };
    
    if (users.length > 0) {
      makeYezreelSuperAdmin();
    }
  }, [users]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchString = searchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchString) ||
      user.last_name?.toLowerCase().includes(searchString) ||
      user.email?.toLowerCase().includes(searchString) ||
      user.role?.toLowerCase().includes(searchString) ||
      user.organization?.toLowerCase().includes(searchString)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user accounts and roles</CardDescription>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-[200px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      {user.role === 'admin' ? (
                        <UserCog className="h-4 w-4 text-blue-500" />
                      ) : user.role === 'special' ? (
                        <Shield className="h-4 w-4 text-purple-500" />
                      ) : user.role === 'superadmin' ? (
                        <Shield className="h-4 w-4 text-red-500" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </TableCell>
                  <TableCell>{user.organization || '-'}</TableCell>
                  <TableCell>
                    {user.invited_by && inviters[user.invited_by] ? 
                      `${inviters[user.invited_by]?.first_name || ''} ${inviters[user.invited_by]?.last_name || ''}` : 
                      '-'}
                  </TableCell>
                  <TableCell>{user.created_at ? format(new Date(user.created_at), 'PP') : '-'}</TableCell>
                  <TableCell>
                    {isSuperAdmin() && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'viewer')}>
                            Set as Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                            Set as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'special')}>
                            Set as Special
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(user.id, 'superadmin')}>
                            Set as Super Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersList;

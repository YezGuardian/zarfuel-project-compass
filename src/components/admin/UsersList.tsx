
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  last_sign_in_at: string | null;
  created_at: string;
  inviter?: {
    id: string;
    email: string;
  } | null;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          role,
          first_name,
          last_name,
          created_at,
          inviter:invited_by(id, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get user auth data to merge with profiles
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      const usersWithAuth = data.map((profile: any) => {
        const authUser = authData?.users?.find((u: any) => u.id === profile.id);
        return {
          ...profile,
          last_sign_in_at: authUser?.last_sign_in_at || null
        };
      });
      
      setUsers(usersWithAuth);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(deleteUserId);
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== deleteUserId));
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteUserId(null);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge>Admin</Badge>;
      case 'superadmin':
        return <Badge variant="destructive">Super Admin</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleDisplay(user.role)}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {user.inviter?.email || 'Direct signup'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isSuperAdmin() && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDeleteUserId(user.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteUser}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersList;

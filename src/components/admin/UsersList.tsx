
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
import { RefreshCcw, UserIcon, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  organization: string | null;
  position: string | null;
  last_sign_in_at: string | null;
  invited_by: string | null;
  company?: string | null;
  title?: string | null;
  updated_at?: string;
  created_at?: string;
  phone?: string | null;
  inviter?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

interface UsersListProps {
  isSuperAdmin: boolean;
}

const UsersList: React.FC<UsersListProps> = ({ isSuperAdmin }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { user: currentUser } = useAuth();
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, inviter:profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }

      // Transform data to match UserProfile type
      const transformedData: UserProfile[] = (data || []).map(user => {
        // Fix the inviter property by providing a properly shaped object or null
        let formattedInviter = null;
        
        // First check if user.inviter exists at all
        if (user.inviter) {
          // Then check if it's an object with an error property
          if (typeof user.inviter === 'object' && !('error' in user.inviter)) {
            // We have valid inviter data - use type assertion to help TypeScript
            const inviterObj = user.inviter as Record<string, any>;
            formattedInviter = {
              first_name: inviterObj.first_name || null,
              last_name: inviterObj.last_name || null,
              email: inviterObj.email || ''
            };
          }
        }
        
        return {
          ...user,
          last_sign_in_at: null,
          inviter: formattedInviter
        };
      });

      setUsers(transformedData);
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
  
  const handleEditUser = (user: UserProfile) => {
    if (!isSuperAdmin) return;
    
    setEditUser(user);
    setEditUserRole(user.role);
    setEditDialogOpen(true);
  };
  
  const handleDeleteUser = (user: UserProfile) => {
    if (!isSuperAdmin) return;
    
    setDeleteUser(user);
    setDeleteDialogOpen(true);
  };
  
  const handleSaveUserEdit = async () => {
    if (!editUser || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: editUserRole })
        .eq('id', editUser.id);
        
      if (error) throw error;
      
      toast.success(`Updated ${editUser.first_name}'s role to ${editUserRole}`);
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteUserConfirm = async () => {
    if (!deleteUser || isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Delete the user from auth (which will cascade to profiles due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(
        deleteUser.id
      );
        
      if (error) throw error;
      
      toast.success(`User ${deleteUser.email} deleted successfully`);
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };
  
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
                  <TableHead>Invited By</TableHead>
                  {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
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
                        variant={user.role === 'admin' ? 'default' : user.role === 'special' ? 'outline' : 'secondary'}
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
                    <TableCell>
                      {user.inviter ? (
                        <span className="text-sm">
                          {user.inviter.first_name || ''} {user.inviter.last_name || ''}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      {/* Edit User Dialog */}
      {editUser && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {editUser.first_name} {editUser.last_name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-140px)] p-1">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>User Email</Label>
                  <p className="text-sm text-muted-foreground">{editUser.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-role">Role</Label>
                  <Select 
                    value={editUserRole} 
                    onValueChange={setEditUserRole}
                  >
                    <SelectTrigger id="user-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="special">Special User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUserEdit}
                disabled={isProcessing || editUserRole === editUser.role}
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete User Dialog */}
      {deleteUser && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deleteUser.first_name} {deleteUser.last_name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-140px)] p-1">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>User Email</Label>
                  <p className="text-sm text-muted-foreground">{deleteUser.email}</p>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteUserConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default UsersList;

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import UserAvatar from '@/components/ui/user-avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MoreHorizontal, Search, Shield, User, UserCog, Edit, Key, RefreshCcw } from 'lucide-react';
import { UserRole } from '@/utils/permissions';

const UsersList = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviters, setInviters] = useState<Record<string, any>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    organization: '',
    position: '',
    phone: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        email: selectedUser.email || '',
        organization: selectedUser.organization || '',
        position: selectedUser.position || '',
        phone: selectedUser.phone || '',
      });
    }
  }, [selectedUser]);

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

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleGeneratePassword = () => {
    // Generate a random 12-character password with letters, numbers, and symbols
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const saveUserProfile = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
          organization: editFormData.organization,
          position: editFormData.position,
          phone: editFormData.phone,
        })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...editFormData } : user
      ));
      
      setEditDialogOpen(false);
      toast.success('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update user profile');
    } finally {
      setSubmitting(false);
    }
  };

  const updateUserPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    setSubmitting(true);
    try {
      // Note: Updating password usually requires an admin function or API endpoint
      // This is just a placeholder for the actual implementation
      const { error } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { password: newPassword }
      );
      
      if (error) throw error;
      
      setPasswordDialogOpen(false);
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. This may require additional admin privileges.');
    } finally {
      setSubmitting(false);
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
              <TableHead>User</TableHead>
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
                    <div className="flex items-center gap-2">
                      <UserAvatar 
                        name={`${user.first_name || ''} ${user.last_name || ''}`.trim()} 
                        role={user.role as UserRole} 
                        className="h-8 w-8"
                      />
                      <span>{user.first_name} {user.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      {user.role === 'admin' ? (
                        <UserCog className="h-4 w-4 text-blue-500" />
                      ) : user.role === 'special' ? (
                        <Shield className="h-4 w-4 text-green-500" />
                      ) : user.role === 'superadmin' ? (
                        <Shield className="h-4 w-4 text-red-500" />
                      ) : (
                        <User className="h-4 w-4 text-amber-500" />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isSuperAdmin() && (
                          <>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {isSuperAdmin() && (
                          <>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'viewer')}>
                              Set as Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'special')}>
                              Set as Special
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                              Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, 'superadmin')}>
                              Set as Super Admin
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={editFormData.organization}
                onChange={(e) => setEditFormData({...editFormData, organization: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={editFormData.position}
                  onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserProfile} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="new_password">New Password</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="h-8"
                >
                  <RefreshCcw className="h-3 w-3 mr-2" />
                  Generate
                </Button>
              </div>
              <Input
                id="new_password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The new password will be applied immediately. The user will need to use this password for their next login.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateUserPassword} disabled={submitting || !newPassword}>
              {submitting ? 'Updating...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UsersList;

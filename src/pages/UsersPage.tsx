
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import InviteUserForm from '@/components/admin/InviteUserForm';
import InvitationsList from '@/components/admin/InvitationsList';
import UsersList from '@/components/admin/UsersList';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const UsersPage: React.FC = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Redirect non-admin users
  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users and invitations for the ZARFUEL committee dashboard
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Current Users</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>
          <div className="mt-6 mb-4 flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={isSuperAdmin() ? setDialogOpen : undefined}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Send an invitation email to add a new user to the system
                  </DialogDescription>
                </DialogHeader>
                <InviteUserForm onSuccess={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          <TabsContent value="users" className="space-y-4">
            <UsersList isSuperAdmin={isSuperAdmin()} />
          </TabsContent>
          <TabsContent value="invitations" className="space-y-4">
            <InvitationsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UsersPage;

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { serviceClient, hasServiceRoleKey } from "@/integrations/supabase/service-client";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.string().min(1, { message: "Please select a role." }),
  organization: z.string().optional(),
  position: z.string().optional(),
  defaultPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

interface InviteUserFormProps {
  onSuccess?: () => void;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isSuperAdmin, user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "viewer",
      organization: "",
      position: "",
      defaultPassword: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Check if the service role key is available
      if (!hasServiceRoleKey()) {
        toast.error('Service role key is not set. Please set up your environment variables.');
        return;
      }
      
      // Check if user with this email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', values.email.toLowerCase())
        .limit(1);
      
      if (checkError) {
        if (checkError.message.includes('permission denied')) {
          throw new Error('Permission denied: You do not have permission to check existing users. Please contact your administrator.');
        } else {
          throw new Error(checkError.message);
        }
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error(`User with email ${values.email} already exists`);
        return;
      }
      
      // Create the user in the auth system with the provided default password
      // Use service client for admin operations to bypass RLS
      const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
        email: values.email,
        password: values.defaultPassword,
        email_confirm: true,
        user_metadata: {
          invited_by: user?.id,
          needs_password_change: true
        },
      });
      
      if (authError) {
        if (authError.message.includes('not allowed')) {
          throw new Error('Permission denied: Your account does not have permission to create users. Please contact your administrator.');
        } else {
          throw new Error(authError.message);
        }
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // Create/update the profile with role and other information
      // Also use service client here to bypass RLS
      const { error: profileError } = await serviceClient
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: values.email.toLowerCase(),
          role: values.role,
          organization: values.organization || null,
          position: values.position || null,
          invited_by: user?.id,
          created_at: new Date().toISOString()
        });
      
      if (profileError) {
        if (profileError.message.includes('permission denied')) {
          throw new Error('Permission denied: You do not have permission to create user profiles. Please contact your administrator.');
        } else {
          throw new Error(profileError.message);
        }
      }
      
      // Also add to invitations table for tracking
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Expire in 7 days
      
      const { error: invitationError } = await serviceClient
        .from('invitations')
        .insert({
          email: values.email.toLowerCase(),
          role: values.role,
          organization: values.organization || null,
          position: values.position || null,
          invited_by: user?.id,
          created_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString()
        });
      
      if (invitationError) {
        console.error('Error adding invitation record:', invitationError);
        // Continue anyway, as the user has been created
      }
      
      toast.success(`User ${values.email} has been added successfully with a default password. They will be prompted to change it on first login.`);
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="email@example.com" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="defaultPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Enter a default password" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The user will be prompted to change this password on first login.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="special">Special User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isSuperAdmin() && <SelectItem value="superadmin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === "viewer" && "Viewers have read-only access to specific pages."}
                  {field.value === "special" && "Special users can edit specific pages."}
                  {field.value === "admin" && "Admins can manage most aspects of the system."}
                  {field.value === "superadmin" && "Super Admins have complete control of the system."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Organization name (optional)" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Position or role (optional)" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding User...
              </span>
            ) : 'Add User'}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default InviteUserForm;

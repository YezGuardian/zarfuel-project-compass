
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define the form schema with validation
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().nullable(),
  title: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable()
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface Contact {
  id?: string;
  name: string;
  email?: string | null;
  title?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
}

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSuccess?: () => void;
}

const ContactFormDialog: React.FC<ContactFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  contact = null,
  onSuccess 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(contact?.id);
  
  // Set up the form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: contact?.name || "",
      email: contact?.email || "",
      title: contact?.title || "",
      phone: contact?.phone || "",
      company: contact?.company || "",
      role: contact?.role || ""
    }
  });
  
  // Reset form when contact prop changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: contact?.name || "",
        email: contact?.email || "",
        title: contact?.title || "",
        phone: contact?.phone || "",
        company: contact?.company || "",
        role: contact?.role || ""
      });
    }
  }, [form, contact, open]);
  
  // Handle form submission
  const onSubmit = async (values: ContactFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (isEditMode && contact?.id) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', contact.id);
          
        if (error) throw error;
        toast.success('Contact updated successfully');
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            ...values,
            created_by: user.id
          });
          
        if (error) throw error;
        toast.success('Contact created successfully');
      }
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error saving contact:', error);
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update contact information in the directory.' 
              : 'Add a new contact to the directory.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Role in project" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  isEditMode ? 'Update Contact' : 'Create Contact'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;

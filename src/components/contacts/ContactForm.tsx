
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  title: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  visibility: z.enum(['public', 'admin_only', 'company_specific']),
  company_visibility: z.string().optional(),
});

interface ContactFormProps {
  onSuccess?: () => void;
  initialData?: Contact;
  mode?: 'create' | 'edit';
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  onSuccess, 
  initialData, 
  mode = 'create' 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      role: initialData?.role || '',
      visibility: initialData?.visibility || 'public',
      company_visibility: initialData?.company_visibility || '',
    },
  });
  
  const visibilityValue = form.watch('visibility');
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('You must be logged in to save contacts');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting contact form with values:", values);
      
      if (mode === 'create') {
        // Ensure name is always included as it's required
        const contactData = {
          ...values,
          created_by: user.id,
          name: values.name, // Explicitly include name to satisfy the type checker
        };
        
        console.log("Creating new contact:", contactData);
        
        const { data, error } = await supabase
          .from('contacts')
          .insert(contactData)
          .select();
          
        if (error) {
          console.error("Error creating contact:", error);
          throw error;
        }
        
        console.log("Contact created successfully:", data);
        toast.success('Contact created successfully');
      } else {
        if (!initialData?.id) throw new Error('Contact ID is required for updates');
        
        console.log("Updating contact with ID:", initialData.id);
        
        const { data, error } = await supabase
          .from('contacts')
          .update(values)
          .eq('id', initialData.id)
          .select();
          
        if (error) {
          console.error("Error updating contact:", error);
          throw error;
        }
        
        console.log("Contact updated successfully:", data);
        toast.success('Contact updated successfully');
      }
      
      if (onSuccess) onSuccess();
      
      // Reset form after successful submission
      if (mode === 'create') {
        form.reset({
          name: '',
          title: '',
          email: '',
          phone: '',
          company: '',
          role: '',
          visibility: 'public',
          company_visibility: '',
        });
      }
    } catch (error: any) {
      console.error('Error saving contact:', error);
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact name" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Role in committee" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who can view this contact" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public (All Members)</SelectItem>
                  <SelectItem value="admin_only">Admin Only</SelectItem>
                  <SelectItem value="company_specific">Specific Company Only</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Control who can see this contact in the directory
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {visibilityValue === 'company_specific' && (
          <FormField
            control={form.control}
            name="company_visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Visibility</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormDescription>
                  Only users from this company will be able to view this contact
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </span>
          ) : (
            mode === 'create' ? 'Create Contact' : 'Update Contact'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;

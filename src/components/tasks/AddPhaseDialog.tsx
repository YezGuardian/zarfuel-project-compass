
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

const phaseSchema = z.object({
  name: z.string().min(1, 'Phase name is required'),
});

type PhaseFormValues = z.infer<typeof phaseSchema>;

interface AddPhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddPhaseDialog: React.FC<AddPhaseDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: PhaseFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the highest position number
      const { data: phases, error: fetchError } = await supabase
        .from('phases')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      const nextPosition = phases && phases.length > 0 ? phases[0].position + 1 : 1;
      
      // Create new phase
      const { error } = await supabase
        .from('phases')
        .insert({
          name: values.name,
          position: nextPosition,
          created_by: user.id,
        });
        
      if (error) throw error;
      
      toast.success('Phase created successfully');
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating phase:', error);
      toast.error(error.message || 'Failed to create phase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Add New Phase</DialogTitle>
          <DialogDescription>
            Create a new project phase to organize your tasks
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phase name" 
                        {...field} 
                        disabled={isSubmitting} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Phase'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddPhaseDialog;

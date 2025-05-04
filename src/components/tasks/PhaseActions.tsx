
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Phase } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PhaseActionsProps {
  phase: Phase;
  onSuccess: () => void;
  tasksExist: boolean;
}

const PhaseActions: React.FC<PhaseActionsProps> = ({
  phase,
  onSuccess,
  tasksExist,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phaseName, setPhaseName] = useState(phase.name);
  
  const handleEdit = async () => {
    if (!phaseName.trim()) {
      toast.error("Phase name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('phases')
        .update({
          name: phaseName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', phase.id);
      
      if (error) throw error;
      
      toast.success("Phase updated successfully");
      setEditDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating phase:", error);
      toast.error(error.message || "Failed to update phase");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (tasksExist) {
      toast.error("Cannot delete phase with existing tasks. Please delete tasks first.");
      setDeleteDialogOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('phases')
        .delete()
        .eq('id', phase.id);
      
      if (error) throw error;
      
      toast.success("Phase deleted successfully");
      setDeleteDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting phase:", error);
      toast.error(error.message || "Failed to delete phase");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {
            setPhaseName(phase.name);
            setEditDialogOpen(true);
          }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Edit Phase Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-hidden">
          <ScrollArea className="max-h-[calc(85vh-40px)]">
            <DialogHeader>
              <DialogTitle>Edit Phase</DialogTitle>
              <DialogDescription>
                Update the phase name. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phase-name" className="text-right">
                  Phase Name
                </Label>
                <Input
                  id="phase-name"
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEdit}
                disabled={isSubmitting || !phaseName.trim()}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-h-[85vh] overflow-hidden">
          <ScrollArea className="max-h-[calc(85vh-40px)]">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {tasksExist 
                  ? "This phase has existing tasks. Please delete the tasks first before deleting the phase."
                  : `This will permanently delete the phase "${phase.name}". This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting || tasksExist}
                className={tasksExist ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PhaseActions;


import React from 'react';
import { Phase } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from '@/components/ui/dialog';

interface DeletePhaseDialogProps {
  phase: Phase;
  onSubmit: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeletePhaseDialog: React.FC<DeletePhaseDialogProps> = ({ phase, onSubmit, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Phase</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the phase "{phase.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit}>
            Delete Phase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePhaseDialog;


import React from 'react';
import { Phase } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface DeletePhaseDialogProps {
  phase: Phase;
  onSubmit: () => void;
}

const DeletePhaseDialog: React.FC<DeletePhaseDialogProps> = ({ phase, onSubmit }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete Phase</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the phase "{phase.name}"? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="pt-4">
        <Button variant="destructive" onClick={onSubmit}>
          Delete Phase
        </Button>
      </DialogFooter>
    </>
  );
};

export default DeletePhaseDialog;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Phase } from '@/types';

export interface DeletePhaseDialogProps {
  phase: Phase;
  onSubmit: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeletePhaseDialog = ({
  phase,
  onSubmit,
  open,
  onOpenChange
}: DeletePhaseDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Phase</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the phase <strong>{phase.name}</strong>? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete Phase'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeletePhaseDialog;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Phase } from '@/types';

interface DeletePhaseDialogProps {
  phase: Phase;
  onDelete: () => Promise<boolean>;
  onCancel: () => void;
}

const DeletePhaseDialog: React.FC<DeletePhaseDialogProps> = ({
  phase,
  onDelete,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Phase</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the phase "{phase.name}"? This action cannot be undone.
          Note that you cannot delete a phase that has tasks assigned to it.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
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

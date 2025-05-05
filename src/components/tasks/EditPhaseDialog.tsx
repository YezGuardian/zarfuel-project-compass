import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Phase } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EditPhaseDialogProps {
  phase: Phase;
  onSubmit: (name: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPhaseDialog = ({
  phase,
  onSubmit,
  open,
  onOpenChange
}: EditPhaseDialogProps) => {
  const [name, setName] = useState(phase.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <ScrollArea className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Phase</DialogTitle>
          <DialogDescription>
            Update the phase name. The phase position will remain the same.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phase-name">Phase Name</Label>
            <Input
              id="phase-name"
              placeholder="Enter phase name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Phase'
              )}
            </Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </DialogContent>
  );
};

export default EditPhaseDialog;

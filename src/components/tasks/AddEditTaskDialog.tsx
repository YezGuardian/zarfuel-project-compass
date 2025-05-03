
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TaskForm from '@/components/tasks/TaskForm';
import { Task } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddEditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

const AddEditTaskDialog: React.FC<AddEditTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  mode,
  onSuccess
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new task to the project' : 'Update task details'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
          {(mode === 'create' || (mode === 'edit' && task)) && (
            <TaskForm
              onSuccess={onSuccess}
              initialData={mode === 'edit' ? task : undefined}
              mode={mode}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTaskDialog;

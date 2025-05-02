
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new task to the project' : 'Update task details'}
          </DialogDescription>
        </DialogHeader>
        {(mode === 'create' || (mode === 'edit' && task)) && (
          <TaskForm
            onSuccess={onSuccess}
            initialData={mode === 'edit' ? task : undefined}
            mode={mode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTaskDialog;

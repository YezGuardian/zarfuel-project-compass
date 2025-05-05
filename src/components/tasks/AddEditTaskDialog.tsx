
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskForm from './TaskForm';
import { Task } from '@/types';

interface AddEditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  initialPhaseId?: string | null;
}

const AddEditTaskDialog: React.FC<AddEditTaskDialogProps> = ({ 
  open, 
  onOpenChange,
  task,
  mode,
  onSuccess,
  initialPhaseId
}) => {
  // If initialPhaseId is provided and mode is create, update the task with it
  const initialData = mode === 'create' && initialPhaseId ? 
    { ...task, phase_id: initialPhaseId } as Task : 
    task;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-80px)] pb-6">
          <div className="p-1">
            <TaskForm 
              mode={mode}
              initialData={initialData}
              onSuccess={onSuccess}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditTaskDialog;


import React, { useState } from 'react';
import { Phase, Task } from '@/types';
import { Edit, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EditPhaseDialog } from './EditPhaseDialog';
import { DeletePhaseDialog } from './DeletePhaseDialog';

interface PhaseHeaderProps {
  phase: Phase;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  tasksCount: number;
  isAdmin: boolean;
  onAddTask?: (phaseId: string) => void;
}

export function PhaseHeader({ 
  phase, 
  onEdit, 
  onDelete, 
  tasksCount, 
  isAdmin,
  onAddTask
}: PhaseHeaderProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditSubmit = (name: string) => {
    onEdit(phase.id, name);
    setEditDialogOpen(false);
  };

  const handleDeleteSubmit = () => {
    onDelete(phase.id);
    setDeleteDialogOpen(false);
  };
  
  const handleAddTask = () => {
    if (onAddTask) {
      onAddTask(phase.id);
    }
  };

  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <h3 className="font-medium">
          PHASE {phase.position}: {phase.name}
          <span className="text-xs rounded-full bg-muted px-2 py-0.5 ml-2">
            {tasksCount}
          </span>
        </h3>
      </div>
      {isAdmin && (
        <div className="flex space-x-2">
          {onAddTask && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={handleAddTask}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Phase
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Phase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Edit Phase Dialog */}
      <EditPhaseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        phase={phase}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Phase Dialog */}
      <DeletePhaseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        phase={phase}
        onSubmit={handleDeleteSubmit}
      />
    </div>
  );
}

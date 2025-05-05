import React from 'react';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Phase } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface PhaseHeaderProps {
  phase: Phase;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  tasksCount: number;
  isAdmin: boolean;
  onAddTask?: (phaseId: string) => void;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({
  phase,
  onEdit,
  onDelete,
  tasksCount,
  isAdmin,
  onAddTask
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold">{phase.name}</h2>
        {tasksCount > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            ({tasksCount} tasks)
          </span>
        )}
      </div>
      {isAdmin && (
        <div className="flex items-center space-x-2">
          {onAddTask && (
            <Button variant="outline" size="sm" onClick={() => onAddTask(phase.id)}>
              <Plus className="h-4 w-4 mr-2" />
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
              <DropdownMenuItem onClick={() => onEdit(phase.id, phase.name)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Phase
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(phase.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Phase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

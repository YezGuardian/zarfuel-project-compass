
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Phase } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import EditPhaseDialog from './EditPhaseDialog';
import DeletePhaseDialog from './DeletePhaseDialog';

interface PhaseHeaderProps {
  phase: Phase;
  tasksCount: number;
  isAdmin: boolean;
  onEdit: (phaseId: string, name: string) => Promise<boolean>;
  onDelete: (phaseId: string) => Promise<boolean>;
}

const PhaseHeader: React.FC<PhaseHeaderProps> = ({ 
  phase, 
  tasksCount,
  isAdmin,
  onEdit,
  onDelete
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-medium">
            PHASE {phase.position}: {phase.name} 
            <span className="text-xs bg-muted rounded-full px-2 py-1 ml-2">
              {tasksCount}
            </span>
          </h3>
        </div>
        
        {isAdmin && (
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
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <EditPhaseDialog 
          phase={phase} 
          onSave={async (name) => {
            const success = await onEdit(phase.id, name);
            if (success) setEditDialogOpen(false);
            return success;
          }}
          onCancel={() => setEditDialogOpen(false)}
        />
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DeletePhaseDialog
          phase={phase}
          onDelete={async () => {
            const success = await onDelete(phase.id);
            if (success) setDeleteDialogOpen(false);
            return success;
          }}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default PhaseHeader;

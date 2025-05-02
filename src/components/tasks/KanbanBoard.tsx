
import React from 'react';
import { Task, Phase } from '@/types';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface KanbanBoardProps {
  phases: Phase[];
  tasksByPhase: Record<string, Task[]>;
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  phases, 
  tasksByPhase, 
  isAdmin, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {phases.map(phase => (
        <Card key={phase.id} className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {phase.name} <span className="text-xs bg-muted rounded-full px-2 py-1 ml-2">{tasksByPhase[phase.id]?.length || 0}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksByPhase[phase.id]?.length > 0 ? (
              tasksByPhase[phase.id].map(task => (
                <div key={task.id} className="bg-white border rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{task.title}</h3>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(task)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-muted-foreground">
                      {task.responsible_teams?.join(', ') || 'No assigned team'}
                    </div>
                    <TaskStatusBadge status={task.status} className="ml-2" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {task.start_date && task.end_date ? (
                      <>
                        {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                      </>
                    ) : (
                      'No dates set'
                    )}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div 
                      className="h-1.5 rounded-full" 
                      style={{ 
                        width: `${task.progress}%`,
                        backgroundColor: 
                          task.status === 'complete' ? '#10B981' :
                          task.status === 'inprogress' ? '#F59E0B' :
                          task.status === 'ongoing' ? '#3B82F6' : '#EF4444'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 inline-block">
                    {task.progress}%
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-muted-foreground text-sm">
                No tasks in this phase
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KanbanBoard;

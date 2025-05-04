
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Phase } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete':
      return 'bg-status-complete text-white';
    case 'in_progress':
      return 'bg-status-inprogress text-white';
    case 'not_started':
      return 'bg-status-notstarted';
    case 'blocked':
      return 'bg-status-blocked text-white';
    case 'pending':
      return 'bg-status-pending';
    default:
      return 'bg-slate-200';
  }
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ phases, tasksByPhase, isAdmin, onEdit, onDelete }) => {
  const onDragEnd = (result: any) => {
    // Implement drag and drop functionality if needed
    console.log('Drag ended', result);
    // You would typically update task positions/phases here
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {phases.map((phase) => (
          <div key={phase.id} className="min-w-[300px] max-w-[300px]">
            <Card>
              <CardHeader className="py-3 flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  PHASE {phase.position}: {phase.name}
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5 ml-2">
                    {tasksByPhase[phase.id]?.length || 0}
                  </span>
                </CardTitle>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {/* Edit phase */}}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Phase
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {/* Delete phase */}}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Phase
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent className="px-3 py-2">
                <Droppable droppableId={phase.id}>
                  {(provided) => (
                    <div 
                      className="space-y-2" 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {tasksByPhase[phase.id]?.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`border rounded p-3 cursor-pointer hover:border-primary ${getStatusColor(task.status)}`}
                            >
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-xs px-2 py-1 rounded">
                                  {task.status.replace('_', ' ')}
                                </div>
                                {isAdmin && (
                                  <div className="flex space-x-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(task);
                                    }}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete(task);
                                    }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

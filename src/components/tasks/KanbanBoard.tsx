
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Phase } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal, Plus } from 'lucide-react';
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
  onAddTask?: (phaseId: string) => void;
  onEditPhase?: (id: string, name: string) => void;
  onDeletePhase?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'complete':
      return 'bg-green-500 text-white';
    case 'ongoing':
      return 'bg-blue-500 text-white';
    case 'inprogress':
      return 'bg-orange-500 text-white';
    case 'notstarted':
      return 'bg-red-500 text-white';
    default:
      return 'bg-slate-200';
  }
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  phases, 
  tasksByPhase, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onAddTask,
  onEditPhase,
  onDeletePhase 
}) => {
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
                  <div className="flex items-center">
                    {onAddTask && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-muted-foreground hover:text-foreground mr-1"
                        onClick={() => onAddTask(phase.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditPhase?.(phase.id, phase.name)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Phase
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeletePhase?.(phase.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Phase
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`border rounded p-3 cursor-pointer hover:bg-zarfuel-blue/10 ${getStatusColor(task.status)}`}
                            >
                              <h4 className="font-bold">{task.title}</h4>
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


import React, { useRef, useEffect } from 'react';
import { Task } from '@/types';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface TaskTableProps {
  tasks: Task[];
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  showPhaseColumn?: boolean;
  onTaskOrderChange?: (tasks: Task[]) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks, 
  isAdmin, 
  onEdit, 
  onDelete,
  showPhaseColumn = true,
  onTaskOrderChange
}) => {
  const [viewTask, setViewTask] = React.useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  
  const handleViewTask = (task: Task) => {
    setViewTask(task);
    setDetailsOpen(true);
  };
  
  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    // Dropped outside the list or no change handler
    if (!result.destination || !onTaskOrderChange) {
      return;
    }

    // Only reorder if all tasks are in the same phase
    const firstPhaseId = tasks[0]?.phase_id;
    const allTasksSamePhase = tasks.every(task => task.phase_id === firstPhaseId);
    
    if (!allTasksSamePhase) {
      console.warn('Cannot reorder tasks from different phases');
      return;
    }

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Use a timeout to prevent UI freeze
    setTimeout(() => {
      onTaskOrderChange(items);
    }, 0);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="overflow-x-auto">
              <Droppable droppableId="tasks-table" type="task">
                {(provided) => (
                  <table 
                    className="w-full border-collapse"
                    ref={(node) => {
                      // This ensures both refs are set properly
                      provided.innerRef(node);
                      if (tableRef.current !== node) {
                        tableRef.current = node as HTMLTableElement;
                      }
                    }}
                    {...provided.droppableProps}
                  >
                    <thead>
                      <tr className="border-b">
                        {showPhaseColumn && (
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phase</th>
                        )}
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Team</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Timeline</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progress Summary</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <tr 
                                key={task.id} 
                                className="border-b last:border-0 hover:bg-zarfuel-blue/10 cursor-pointer transition-colors"
                                onClick={() => handleViewTask(task)}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {showPhaseColumn && (
                                  <td className="px-4 py-3 text-sm">{task.phase}</td>
                                )}
                                <td className="px-4 py-3 text-sm font-bold">{task.title}</td>
                                <td className="px-4 py-3 text-sm">
                                  {task.responsible_teams?.join(', ') || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                                  {task.description || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {(task.start_date || task.end_date) ? (
                                    <>
                                      {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A'} - 
                                      {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'N/A'}
                                    </>
                                  ) : (
                                    task.duration || 'N/A'
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                                  {task.progress_summary || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <TaskStatusBadge status={task.status} />
                                </td>
                                <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewTask(task)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {isAdmin && (
                                        <>
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
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isAdmin ? (showPhaseColumn ? 8 : 7) : (showPhaseColumn ? 7 : 6)} className="px-4 py-8 text-center text-muted-foreground">
                            No tasks found matching your filters
                          </td>
                        </tr>
                      )}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>
      
      {/* Task Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
          <ScrollArea className="max-h-[calc(85vh-40px)]">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {viewTask && (
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-bold">{viewTask.title}</h3>
                  <div className="flex items-center mt-1">
                    <TaskStatusBadge status={viewTask.status} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phase</h4>
                    <p>{viewTask.phase || 'Not assigned'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Responsible Teams</h4>
                    <p>{viewTask.responsible_teams?.join(', ') || 'None assigned'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                  <p>
                    {viewTask.start_date || viewTask.end_date ? (
                      <>
                        {viewTask.start_date ? new Date(viewTask.start_date).toLocaleDateString() : 'No start date'} - 
                        {viewTask.end_date ? new Date(viewTask.end_date).toLocaleDateString() : 'No end date'}
                      </>
                    ) : (
                      viewTask.duration || 'No timeline specified'
                    )}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="whitespace-pre-wrap">{viewTask.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Progress Summary</h4>
                  <p className="whitespace-pre-wrap">{viewTask.progress_summary || 'No progress summary provided'}</p>
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                  {isAdmin && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDetailsOpen(false);
                          onEdit(viewTask);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          setDetailsOpen(false);
                          onDelete(viewTask);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskTable;

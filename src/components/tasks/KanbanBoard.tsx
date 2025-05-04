
import React from 'react';
import { Task, Phase } from '@/types';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [viewTask, setViewTask] = React.useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  
  const handleViewTask = (task: Task) => {
    setViewTask(task);
    setDetailsOpen(true);
  };
  
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {phases.map(phase => (
          <Card key={phase.id} className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                PHASE {phase.position}: {phase.name} <span className="text-xs bg-muted rounded-full px-2 py-1 ml-2">{tasksByPhase[phase.id]?.length || 0}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByPhase[phase.id]?.length > 0 ? (
                tasksByPhase[phase.id].map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white border rounded-md p-3 shadow-sm cursor-pointer"
                    onClick={() => handleViewTask(task)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
                    {task.progress_summary && (
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.progress_summary}
                      </div>
                    )}
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
                  <h3 className="text-lg font-semibold">{viewTask.title}</h3>
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
                    {viewTask.start_date ? new Date(viewTask.start_date).toLocaleDateString() : 'No start date'} - 
                    {viewTask.end_date ? new Date(viewTask.end_date).toLocaleDateString() : 'No end date'}
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

export default KanbanBoard;

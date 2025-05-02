
import React from 'react';
import { Task } from '@/types';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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

interface TaskTableProps {
  tasks: Task[];
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks, 
  isAdmin, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Phase</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Team</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Timeline</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Progress</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">{task.phase}</td>
                    <td className="px-4 py-3 text-sm font-medium">{task.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {task.responsible_teams?.join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'N/A'} - 
                      {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
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
                    </td>
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
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
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                    No tasks found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTable;

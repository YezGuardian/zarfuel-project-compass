
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Status } from '@/types';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: Status;
  showLabel?: boolean;
  className?: string;
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ 
  status, 
  showLabel = true,
  className
}) => {
  const statusConfig = {
    complete: {
      label: 'Complete',
      color: 'bg-green-500 text-white', // Green for completed tasks
    },
    inprogress: {
      label: 'In Progress',
      color: 'bg-orange-500 text-white', // Orange for in progress tasks
    },
    notstarted: {
      label: 'Not Started',
      color: 'bg-red-500 text-white', // Red for not started tasks
    },
    ongoing: {
      label: 'Ongoing',
      color: 'bg-blue-500 text-white', // Blue for ongoing tasks
    },
  };

  const config = statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: 'bg-gray-500 text-white',
  };

  return (
    <Badge className={cn(config.color, className)}>
      {showLabel ? config.label : ''}
    </Badge>
  );
};

export default TaskStatusBadge;

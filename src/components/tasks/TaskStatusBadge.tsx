
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
      color: 'bg-green-500 text-white',
    },
    inprogress: {
      label: 'In Progress',
      color: 'bg-blue-500 text-white',
    },
    notstarted: {
      label: 'Not Started',
      color: 'bg-slate-500 text-white',
    },
    ongoing: {
      label: 'Ongoing',
      color: 'bg-amber-500 text-white',
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

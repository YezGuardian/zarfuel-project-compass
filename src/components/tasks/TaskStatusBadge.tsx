
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
      color: 'bg-status-complete text-white',
    },
    inprogress: {
      label: 'In Progress',
      color: 'bg-status-inprogress text-white',
    },
    notstarted: {
      label: 'Not Started',
      color: 'bg-status-notstarted text-white',
    },
    ongoing: {
      label: 'Ongoing',
      color: 'bg-status-ongoing text-white',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn(config.color, className)}>
      {showLabel ? config.label : ''}
    </Badge>
  );
};

export default TaskStatusBadge;

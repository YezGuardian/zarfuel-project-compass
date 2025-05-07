
import React from 'react';
import { Status } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: Status;
  size?: 'sm' | 'default' | 'lg';
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, size = 'default' }) => {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'complete':
        return {
          label: 'Completed',
          className: 'bg-green-500 hover:bg-green-600 text-white',
        };
      case 'ongoing':
        return {
          label: 'Ongoing',
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
        };
      case 'inprogress':
        return {
          label: 'In Progress',
          className: 'bg-orange-500 hover:bg-orange-600 text-white',
        };
      case 'notstarted':
        return {
          label: 'Not Started',
          className: 'bg-red-500 hover:bg-red-600 text-white',
        };
      default:
        return {
          label: status ? String(status).replace(/_/g, ' ') : 'Unknown',
          className: 'bg-gray-500 hover:bg-gray-600 text-white',
        };
    }
  };

  const { label, className } = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <Badge
      variant="outline"
      className={cn(className, sizeClasses[size])}
    >
      {label}
    </Badge>
  );
};

export default TaskStatusBadge;

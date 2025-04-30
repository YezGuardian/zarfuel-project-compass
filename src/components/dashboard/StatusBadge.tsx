
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, X, RefreshCw } from 'lucide-react';
import { TaskStatus } from '@/data/mockData';

interface StatusBadgeProps {
  status: TaskStatus;
  showLabel?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showLabel = true, className }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'complete':
        return { label: 'Complete', icon: Check, color: 'bg-status-complete text-white' };
      case 'inprogress':
        return { label: 'In Progress', icon: Clock, color: 'bg-status-inprogress text-white' };
      case 'notstarted':
        return { label: 'Not Started', icon: X, color: 'bg-status-notstarted text-white' };
      case 'ongoing':
        return { label: 'Ongoing', icon: RefreshCw, color: 'bg-status-ongoing text-white' };
      default:
        return { label: 'Unknown', icon: Clock, color: 'bg-gray-500 text-white' };
    }
  };

  const { label, icon: Icon, color } = getStatusInfo();

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", color)}>
        <Icon className="w-3 h-3 mr-1" />
        {showLabel && label}
      </div>
    </div>
  );
};

export default StatusBadge;

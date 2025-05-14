import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserRole } from '@/utils/permissions';

interface UserAvatarProps {
  name: string;
  role?: UserRole;
  className?: string;
}

const getRoleColor = (role?: UserRole): string => {
  switch (role) {
    case 'superadmin':
      return 'bg-red-500 text-white'; // Red for superadmins
    case 'admin':
      return 'bg-blue-500 text-white'; // Blue for admins
    case 'special':
      return 'bg-green-500 text-white'; // Green for special users
    case 'viewer':
      return 'bg-amber-500 text-white'; // Amber/gold for viewers
    default:
      return 'bg-gray-500 text-white'; // Gray for unknown roles
  }
};

const getInitials = (name: string): string => {
  // Handle empty or null name
  if (!name) return '?';
  
  // Handle email addresses
  if (name.indexOf('@') !== -1) {
    return name.charAt(0).toUpperCase();
  }
  
  // Handle names
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  // Get first char of first and last parts
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name = "", role, className = '' }) => {
  const roleColorClass = getRoleColor(role as UserRole);
  const initials = getInitials(name);

  return (
    <Avatar className={className}>
      <AvatarFallback className={roleColorClass}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar; 
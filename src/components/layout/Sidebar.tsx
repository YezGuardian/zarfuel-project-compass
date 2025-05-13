import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  CalendarDays,
  FileText,
  DollarSign,
  Shield,
  FileArchive,
  Contact,
  Users,
  CalendarClock,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { isAdmin } = useAuth();
  
  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Phases & Tasks', path: '/tasks', icon: FileText },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Meetings', path: '/meetings', icon: CalendarClock },
    { name: 'Budget', path: '/budget', icon: DollarSign },
    { name: 'Risk Management', path: '/risks', icon: Shield },
    { name: 'Document Repository', path: '/documents', icon: FileArchive },
    { name: 'Contact Directory', path: '/contacts', icon: Contact },
    { name: 'Committee Forum', path: '/forum', icon: MessageSquare },
  ];

  const adminNavigation = [
    { name: 'User Management', path: '/users', icon: Users, requiresAdmin: true },
  ];
  
  const allNavItems = [...navigation, ...(isAdmin() ? adminNavigation : [])];

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-20 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-accent">ZARFUEL</h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="py-6 px-3">
        <ul className="space-y-1">
          {allNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-zarfuel-gold text-zarfuel-blue'
                      : 'text-sidebar-foreground hover:bg-sidebar-border'
                  )
                }
                end
              >
                <item.icon className="mr-3 h-5 w-5 dark:text-primary" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="border-t border-sidebar-border pt-4 text-center">
          <div className="text-xs text-sidebar-foreground/70">
            &copy; 2025 ZARFUEL Project
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

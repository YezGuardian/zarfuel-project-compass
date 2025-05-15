import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, profile } = useAuth();

  // Listen for the custom closeSidebar event to close the sidebar on mobile/tablet
  useEffect(() => {
    const handleCloseSidebar = () => {
      setSidebarOpen(false);
    };
    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => {
      window.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, []);

  // If user is not authenticated (this shouldn't happen due to ProtectedRoute)
  if (!user) {
    return null;
  }

  // Prepare user info for the header
  const userInfo = {
    name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email : user.email,
    role: profile?.role || 'viewer'
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          user={userInfo} 
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

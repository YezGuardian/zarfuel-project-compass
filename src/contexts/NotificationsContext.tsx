import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Notification } from '@/types';

// Define context type
type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
};


// Create context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider component
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setNotifications((data || []).map(item => ({
        id: item.id,
        type: item.type,
        content: item.content,
        link: item.link || undefined,
        is_read: item.is_read || false,
        created_at: item.created_at,
        user_id: item.user_id
      })));
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error(`Failed to load notifications: ${error.message}`);
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error(`Failed to update notification: ${error.message}`);
    }
  };
  
  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error(`Failed to update notifications: ${error.message}`);
    }
  };
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Subscribe to new notifications
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, async (payload) => {
        const userResponse = await supabase.auth.getUser();
        const userId = userResponse?.data?.user?.id;
        // Check if the notification is for the current user
        if (payload.new && payload.new.user_id === userId) {
          // Add to state
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Context value
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook function
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
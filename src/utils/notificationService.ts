import { supabase } from '@/integrations/supabase/client';
import { NotificationType } from '@/types';

/**
 * Notification service for creating in-app notifications
 */

// Define notification types
export const NOTIFICATION_TYPES = {
  // Task notifications
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_DELETED: 'task_deleted',
  
  // Meeting notifications
  MEETING_CREATED: 'meeting_created',
  MEETING_UPDATED: 'meeting_updated',
  MEETING_DELETED: 'meeting_deleted',
  
  // Budget notifications
  BUDGET_CREATED: 'budget_created',
  BUDGET_UPDATED: 'budget_updated',
  BUDGET_DELETED: 'budget_deleted',
  
  // Risk notifications
  RISK_CREATED: 'risk_created',
  RISK_UPDATED: 'risk_updated',
  RISK_DELETED: 'risk_deleted'
};

/**
 * Create a notification for a specific user
 */
export const createNotification = async ({
  userId,
  type,
  content,
  link
}: {
  userId: string;
  type: NotificationType;
  content: string;
  link?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Creating notification:', { userId, type, content, link });
    
    // First check if the user exists
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error checking if user exists:', userError);
      return { success: false, error: `User check failed: ${userError.message}` };
    }
    
    if (!userExists) {
      console.error('User does not exist:', userId);
      return { success: false, error: 'User does not exist' };
    }
    
    // Create the notification with service role if available
    const client = supabase.auth.getSession() ? supabase : supabase;
    
    const { error } = await client.from('notifications').insert({
      user_id: userId,
      type,
      content,
      link,
      is_read: false
    });

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Notification created successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error creating notification:', error);
    return { success: false, error: error.message || 'Failed to create notification' };
  }
};

/**
 * Create notifications for all users with specified roles
 */
export const createNotificationsForRoles = async ({
  roles,
  type,
  content,
  link,
  excludeUserId
}: {
  roles: string[];
  type: NotificationType;
  content: string;
  link?: string;
  excludeUserId?: string; // Optional user ID to exclude (e.g., the user who made the change)
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get all users with the specified roles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .in('role', roles);

    if (usersError) {
      console.error('Error fetching users for notifications:', usersError);
      return { success: false, error: usersError.message };
    }

    // Filter out the excluded user if provided
    const filteredUsers = excludeUserId
      ? users.filter(user => user.id !== excludeUserId)
      : users;

    // Create notifications for each user
    if (filteredUsers.length > 0) {
      const notifications = filteredUsers.map(user => ({
        user_id: user.id,
        type,
        content,
        link,
        is_read: false
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating multiple notifications:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error creating notifications for roles:', error);
    return { success: false, error: error.message || 'Failed to create notifications' };
  }
};

/**
 * Create a task notification
 */
export const createTaskNotification = async ({
  taskId,
  taskTitle,
  action,
  performedBy,
  excludeUserId
}: {
  taskId: string;
  taskTitle: string;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  performedBy: string;
  excludeUserId?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    let type: NotificationType;
    let content: string;
    let link = action !== 'deleted' ? `/tasks?task=${taskId}` : '/tasks';

    switch (action) {
      case 'created':
        type = NOTIFICATION_TYPES.TASK_CREATED;
        content = `${performedBy} created a new task: ${taskTitle}`;
        break;
      case 'updated':
        type = NOTIFICATION_TYPES.TASK_UPDATED;
        content = `${performedBy} updated task: ${taskTitle}`;
        break;
      case 'completed':
        type = NOTIFICATION_TYPES.TASK_COMPLETED;
        content = `${performedBy} marked task as complete: ${taskTitle}`;
        break;
      case 'deleted':
        type = NOTIFICATION_TYPES.TASK_DELETED;
        content = `${performedBy} deleted task: ${taskTitle}`;
        break;
      default:
        return { success: false, error: 'Invalid task action' };
    }

    // Create notifications for all admins, special users, and super admins
    return await createNotificationsForRoles({
      roles: ['admin', 'special', 'superadmin'],
      type,
      content,
      link,
      excludeUserId
    });
  } catch (error: any) {
    console.error('Error in createTaskNotification:', error);
    return { success: false, error: error.message || 'Failed to create task notification' };
  }
};

/**
 * Create a meeting notification
 */
export const createMeetingNotification = async ({
  meetingId,
  meetingTitle,
  action,
  performedBy,
  excludeUserId
}: {
  meetingId: string;
  meetingTitle: string;
  action: 'created' | 'updated' | 'deleted';
  performedBy: string;
  excludeUserId?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    let type: NotificationType;
    let content: string;
    let link = action !== 'deleted' ? `/calendar?event=${meetingId}` : '/calendar';

    switch (action) {
      case 'created':
        type = NOTIFICATION_TYPES.MEETING_CREATED;
        content = `${performedBy} scheduled a new meeting: ${meetingTitle}`;
        break;
      case 'updated':
        type = NOTIFICATION_TYPES.MEETING_UPDATED;
        content = `${performedBy} updated meeting: ${meetingTitle}`;
        break;
      case 'deleted':
        type = NOTIFICATION_TYPES.MEETING_DELETED;
        content = `${performedBy} cancelled meeting: ${meetingTitle}`;
        break;
      default:
        return { success: false, error: 'Invalid meeting action' };
    }

    // Create notifications for all admins, special users, and super admins
    return await createNotificationsForRoles({
      roles: ['admin', 'special', 'superadmin'],
      type,
      content,
      link,
      excludeUserId
    });
  } catch (error: any) {
    console.error('Error in createMeetingNotification:', error);
    return { success: false, error: error.message || 'Failed to create meeting notification' };
  }
};

/**
 * Create a budget notification
 */
export const createBudgetNotification = async ({
  budgetId,
  budgetTitle,
  action,
  performedBy,
  excludeUserId
}: {
  budgetId: string;
  budgetTitle: string;
  action: 'created' | 'updated' | 'deleted';
  performedBy: string;
  excludeUserId?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    let type: NotificationType;
    let content: string;
    let link = action !== 'deleted' ? `/budget?record=${budgetId}` : '/budget';

    switch (action) {
      case 'created':
        type = NOTIFICATION_TYPES.BUDGET_CREATED;
        content = `${performedBy} added a new budget record: ${budgetTitle}`;
        break;
      case 'updated':
        type = NOTIFICATION_TYPES.BUDGET_UPDATED;
        content = `${performedBy} updated budget record: ${budgetTitle}`;
        break;
      case 'deleted':
        type = NOTIFICATION_TYPES.BUDGET_DELETED;
        content = `${performedBy} deleted budget record: ${budgetTitle}`;
        break;
      default:
        return { success: false, error: 'Invalid budget action' };
    }

    // Create notifications for all admins, special users, and super admins
    return await createNotificationsForRoles({
      roles: ['admin', 'special', 'superadmin'],
      type,
      content,
      link,
      excludeUserId
    });
  } catch (error: any) {
    console.error('Error in createBudgetNotification:', error);
    return { success: false, error: error.message || 'Failed to create budget notification' };
  }
};

/**
 * Create a risk notification
 */
export const createRiskNotification = async ({
  riskId,
  riskTitle,
  action,
  performedBy,
  excludeUserId
}: {
  riskId: string;
  riskTitle: string;
  action: 'created' | 'updated' | 'deleted';
  performedBy: string;
  excludeUserId?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    let type: NotificationType;
    let content: string;
    let link = action !== 'deleted' ? `/risks?risk=${riskId}` : '/risks';

    switch (action) {
      case 'created':
        type = NOTIFICATION_TYPES.RISK_CREATED;
        content = `${performedBy} added a new risk: ${riskTitle}`;
        break;
      case 'updated':
        type = NOTIFICATION_TYPES.RISK_UPDATED;
        content = `${performedBy} updated risk: ${riskTitle}`;
        break;
      case 'deleted':
        type = NOTIFICATION_TYPES.RISK_DELETED;
        content = `${performedBy} deleted risk: ${riskTitle}`;
        break;
      default:
        return { success: false, error: 'Invalid risk action' };
    }

    // Create notifications for all admins, special users, and super admins
    return await createNotificationsForRoles({
      roles: ['admin', 'special', 'superadmin'],
      type,
      content,
      link,
      excludeUserId
    });
  } catch (error: any) {
    console.error('Error in createRiskNotification:', error);
    return { success: false, error: error.message || 'Failed to create risk notification' };
  }
}; 
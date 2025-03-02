import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export class NotificationService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }

    return data || [];
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Error fetching unread count: ${error.message}`);
    }

    return count || 0;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  static async createNotification(notification: NotificationInsert): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }

    return data;
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // CRM-specific notification methods
  static async notifyTaskDue(userId: string, taskId: string, clientId: string, taskTitle: string): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      title: 'Task Due',
      message: `Task "${taskTitle}" is due today`,
      type: 'task_due',
      entity_type: 'client_tasks',
      entity_id: taskId,
      is_read: false
    });
  }

  static async notifyTaskOverdue(userId: string, taskId: string, clientId: string, taskTitle: string): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      title: 'Task Overdue',
      message: `Task "${taskTitle}" is overdue`,
      type: 'task_overdue',
      entity_type: 'client_tasks',
      entity_id: taskId,
      is_read: false
    });
  }

  static async notifyFollowUpRequired(userId: string, eventId: string, clientId: string, clientName: string): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      title: 'Follow-up Required',
      message: `Follow-up required for client ${clientName}`,
      type: 'follow_up',
      entity_type: 'contact_events',
      entity_id: eventId,
      is_read: false
    });
  }

  static async notifyClientInactive(userId: string, clientId: string, clientName: string, daysSinceLastContact: number): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      title: 'Inactive Client',
      message: `No contact with ${clientName} for ${daysSinceLastContact} days`,
      type: 'client_inactive',
      entity_type: 'clients',
      entity_id: clientId,
      is_read: false
    });
  }
}

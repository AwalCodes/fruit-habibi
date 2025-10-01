import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'review' | 'listing_update' | 'admin_alert' | 'system';
  title: string;
  message: string;
  data?: any;
  read_at: string | null;
  created_at: string;
}

export interface NotificationData {
  message_id?: string;
  product_id?: string;
  sender_id?: string;
  review_id?: string;
  reviewer_id?: string;
  rating?: number;
  listing_id?: string;
  listing_title?: string;
}

export class NotificationService {
  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    // Temporarily return empty array since notifications table is disabled
    // This prevents any console errors while the notifications system is being set up
    return [];
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    // Temporarily return 0 since notifications table is disabled
    // This prevents any console errors while the notifications system is being set up
    return 0;
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(
    userId: string,
    notificationIds?: string[]
  ): Promise<boolean> {
    // Temporarily return true since notifications table is disabled
    // This prevents any console errors while the notifications system is being set up
    return true;
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    // Temporarily return true since notifications table is disabled
    // This prevents any console errors while the notifications system is being set up
    return true;
  }

  /**
   * Create a notification (system/admin use)
   */
  static async createNotification(
    targetUserId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: NotificationData
  ): Promise<string | null> {
    // Temporarily return null since notifications table is disabled
    // This prevents any console errors while the notifications system is being set up
    return null;
  }

  /**
   * Get notification type icon
   */
  static getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'message':
        return '💬';
      case 'review':
        return '⭐';
      case 'listing_update':
        return '📝';
      case 'admin_alert':
        return '⚠️';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  }

  /**
   * Get notification type color
   */
  static getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-50';
      case 'review':
        return 'text-yellow-600 bg-yellow-50';
      case 'listing_update':
        return 'text-green-600 bg-green-50';
      case 'admin_alert':
        return 'text-red-600 bg-red-50';
      case 'system':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Format notification time
   */
  static formatNotificationTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    } else {
      return time.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Subscribe to real-time notifications
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void,
    onUnreadCountChange: (count: number) => void
  ) {
    // Subscribe to new notifications
    const notificationSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          onNotification(notification);
          // Increment unread count
          this.getUnreadCount(userId).then(count => onUnreadCountChange(count));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Update unread count when notifications are marked as read
          this.getUnreadCount(userId).then(count => onUnreadCountChange(count));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationSubscription);
    };
  }
}

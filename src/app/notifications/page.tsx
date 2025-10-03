'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { NotificationService, Notification } from '@/lib/notifications';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchNotifications();
      
      // Subscribe to real-time updates
      const unsubscribe = NotificationService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
        },
        () => {} // We'll refresh the page data
      );

      return unsubscribe;
    }
  }, [user, authLoading, router]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await NotificationService.getUserNotifications(user.id, 50);
      setNotifications(data);
    } catch (error) {
      // Notifications system might not be available - set empty array
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await NotificationService.markAsRead(user.id, [notificationId]);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAsRead(user.id);
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      await NotificationService.deleteNotification(notificationId, user.id);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleBulkAction = async (action: 'read' | 'delete') => {
    if (!user || selectedNotifications.length === 0) return;

    try {
      if (action === 'read') {
        await NotificationService.markAsRead(user.id, selectedNotifications);
        setNotifications(prev => 
          prev.map(notification => 
            selectedNotifications.includes(notification.id)
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );
      } else if (action === 'delete') {
        for (const id of selectedNotifications) {
          await NotificationService.deleteNotification(id, user.id);
        }
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      }
      
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    const filteredNotifications = getFilteredNotifications();
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read_at);
    }
    return notifications;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    return NotificationService.getNotificationIcon(type);
  };

  const getNotificationColor = (type: Notification['type']) => {
    return NotificationService.getNotificationColor(type);
  };

  const formatTime = (timestamp: string) => {
    return NotificationService.formatNotificationTime(timestamp);
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.data) {
      // For message notifications, go directly to messages page with conversation params
      if (notification.type === 'message') {
        const productId = notification.data.product_id;
        const senderId = notification.data.sender_id;
        if (productId && senderId) {
          return `/messages?product_id=${productId}&other_user_id=${senderId}`;
        }
        return `/messages`;
      }
      // For review notifications, go to product page
      if (notification.type === 'review' && notification.data.product_id) {
        return `/listing/${notification.data.product_id}`;
      }
      // For other notifications with product_id, go to product page
      if (notification.data.product_id) {
        return `/listing/${notification.data.product_id}`;
      }
      // For message-related data
      if (notification.data.message_id) {
        return `/messages`;
      }
    }
    return '/notifications';
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read_at) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate to relevant page
    const link = getNotificationLink(notification);
    router.push(link);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-black py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Notifications</h1>
                <p className="text-emerald-200">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                      : 'text-emerald-200 hover:text-yellow-300 hover:bg-slate-700/50'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                      : 'text-emerald-200 hover:text-yellow-300 hover:bg-slate-700/50'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-emerald-200">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('read')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Mark read</span>
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="text-yellow-400 text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-emerald-200">
              {filter === 'unread' 
                ? 'You&apos;re all caught up!' 
                : 'Notifications will appear here when you receive messages, reviews, or updates.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 ${
                  !notification.read_at ? 'ring-2 ring-yellow-400/50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleNotificationSelection(notification.id);
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-emerald-200 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-emerald-300">
                            <span>{formatTime(notification.created_at)}</span>
                            {!notification.read_at && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                                Unread
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read_at && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-2 text-emerald-300 hover:text-yellow-400 transition-colors"
                              title="Mark as read"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="p-2 text-emerald-300 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Link */}
                {getNotificationLink(notification) !== '#' && (
                  <div className="px-6 py-3 bg-slate-700/30 border-t border-slate-600">
                    <Link
                      href={getNotificationLink(notification)}
                      className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                    >
                      View details →
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

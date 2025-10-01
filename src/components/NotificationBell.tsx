'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationService, Notification } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications and unread count
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to real-time updates
    const unsubscribe = NotificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      },
      (count) => {
        setUnreadCount(count);
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await NotificationService.getUserNotifications(user.id, 10);
      setNotifications(data);
    } catch (error) {
      // Notifications system might not be available - set empty array
      console.log('Notifications system not available - showing empty list');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await NotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      // Notifications system might not be available - set count to 0
      console.log('Notifications system not available - setting count to 0');
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await NotificationService.markAsRead(user.id, [notificationId]);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      await NotificationService.deleteNotification(notificationId, user.id);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if notification was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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

    // Close dropdown
    setIsOpen(false);

    // Navigate to relevant page
    const link = getNotificationLink(notification);
    router.push(link);
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-gray-400 text-4xl mb-2">🔔</div>
                  <p className="text-gray-600 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read_at ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read_at && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Mark as read"
                                >
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <span className="text-xs">×</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <Link 
                  href="/notifications"
                  className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

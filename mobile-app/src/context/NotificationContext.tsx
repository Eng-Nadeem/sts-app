import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  Notification, 
  NotificationSetting,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  toggleNotificationSetting,
  deleteNotificationSetting,
  configureLocalNotifications,
  sendLocalNotification,
  createDefaultNotificationSettings
} from '../services/notificationService';
import { 
  ScheduledNotification,
  getScheduledNotifications,
  createScheduledNotification,
  updateScheduledNotification,
  deleteScheduledNotification,
  toggleScheduledNotification
} from '../services/scheduledNotificationService';

interface NotificationContextType {
  // Notifications
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  sendNotification: (title: string, body: string, data?: any) => Promise<string>;
  simulateNotification: (type: string, title?: string, body?: string) => Promise<void>;
  unreadCount: number;
  
  // Notification Settings
  notificationSettings: NotificationSetting[];
  loadNotificationSettings: () => Promise<void>;
  toggleNotificationSetting: (id: string) => Promise<void>;
  deleteNotificationSetting: (id: string) => Promise<void>;
  createDefaultSettings: () => Promise<void>;
  
  // Scheduled Notifications
  scheduledNotifications: ScheduledNotification[];
  loadScheduledNotifications: () => Promise<void>;
  createScheduledNotification: (
    templateId: string,
    schedule: ScheduledNotification['schedule'],
    personalizations: Record<string, string>
  ) => Promise<ScheduledNotification | null>;
  updateScheduledNotification: (
    id: string,
    updates: Partial<Omit<ScheduledNotification, 'id'>>
  ) => Promise<ScheduledNotification | null>;
  deleteScheduledNotification: (id: string) => Promise<boolean>;
  toggleScheduledNotification: (id: string) => Promise<ScheduledNotification | null>;
}

// Create the notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider
export const NotificationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Set up notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Configure local notifications
        await configureLocalNotifications();
        
        // Set up notification handling
        const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
          // Refresh notifications when a new notification is received
          refreshNotifications();
        });
        
        // Initial data fetch
        refreshNotifications();
        loadNotificationSettings();
        loadScheduledNotifications();
        
        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    
    setupNotifications();
  }, []);
  
  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Refresh notifications
  const refreshNotifications = async () => {
    try {
      const notificationsData = await getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Clear all notifications
  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications();
      
      // Update local state
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  // Send notification
  const sendNotification = async (title: string, body: string, data?: any) => {
    try {
      const notificationId = await sendLocalNotification(title, body, data);
      await refreshNotifications();
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return '';
    }
  };
  
  // Simulate a notification (for testing)
  const simulateNotification = async (type: string, title?: string, body?: string) => {
    try {
      // Override defaults if provided
      const notificationTitle = title || 'Test Notification';
      const notificationBody = body || 'This is a test notification. You can dismiss it.';
      
      await sendNotification(notificationTitle, notificationBody, { type });
    } catch (error) {
      console.error('Error simulating notification:', error);
    }
  };
  
  // Load notification settings
  const loadNotificationSettings = async () => {
    try {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };
  
  // Toggle notification setting
  const handleToggleNotificationSetting = async (id: string) => {
    try {
      await toggleNotificationSetting(id);
      
      // Update local state
      setNotificationSettings(prevSettings => 
        prevSettings.map(setting => 
          setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
        )
      );
    } catch (error) {
      console.error('Error toggling notification setting:', error);
    }
  };
  
  // Delete notification setting
  const handleDeleteNotificationSetting = async (id: string) => {
    try {
      await deleteNotificationSetting(id);
      
      // Update local state
      setNotificationSettings(prevSettings => 
        prevSettings.filter(setting => setting.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification setting:', error);
    }
  };
  
  // Create default notification settings
  const createDefaultSettings = async () => {
    try {
      const settings = await createDefaultNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error creating default notification settings:', error);
    }
  };
  
  // Load scheduled notifications
  const loadScheduledNotifications = async () => {
    try {
      const scheduled = await getScheduledNotifications();
      setScheduledNotifications(scheduled);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };
  
  // Create scheduled notification
  const handleCreateScheduledNotification = async (
    templateId: string,
    schedule: ScheduledNotification['schedule'],
    personalizations: Record<string, string>
  ) => {
    try {
      const notification = await createScheduledNotification(
        templateId,
        schedule,
        personalizations
      );
      
      if (notification) {
        // Update local state
        setScheduledNotifications(prevNotifications => [...prevNotifications, notification]);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating scheduled notification:', error);
      return null;
    }
  };
  
  // Update scheduled notification
  const handleUpdateScheduledNotification = async (
    id: string,
    updates: Partial<Omit<ScheduledNotification, 'id'>>
  ) => {
    try {
      const notification = await updateScheduledNotification(id, updates);
      
      if (notification) {
        // Update local state
        setScheduledNotifications(prevNotifications => 
          prevNotifications.map(n => n.id === id ? notification : n)
        );
      }
      
      return notification;
    } catch (error) {
      console.error('Error updating scheduled notification:', error);
      return null;
    }
  };
  
  // Delete scheduled notification
  const handleDeleteScheduledNotification = async (id: string) => {
    try {
      const success = await deleteScheduledNotification(id);
      
      if (success) {
        // Update local state
        setScheduledNotifications(prevNotifications => 
          prevNotifications.filter(n => n.id !== id)
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting scheduled notification:', error);
      return false;
    }
  };
  
  // Toggle scheduled notification
  const handleToggleScheduledNotification = async (id: string) => {
    try {
      const notification = await toggleScheduledNotification(id);
      
      if (notification) {
        // Update local state
        setScheduledNotifications(prevNotifications => 
          prevNotifications.map(n => n.id === id ? notification : n)
        );
      }
      
      return notification;
    } catch (error) {
      console.error('Error toggling scheduled notification:', error);
      return null;
    }
  };
  
  return (
    <NotificationContext.Provider
      value={{
        // Notifications
        notifications,
        refreshNotifications,
        markAsRead,
        deleteNotification: handleDeleteNotification,
        clearAllNotifications: handleClearAllNotifications,
        sendNotification,
        simulateNotification,
        unreadCount,
        
        // Notification Settings
        notificationSettings,
        loadNotificationSettings,
        toggleNotificationSetting: handleToggleNotificationSetting,
        deleteNotificationSetting: handleDeleteNotificationSetting,
        createDefaultSettings,
        
        // Scheduled Notifications
        scheduledNotifications,
        loadScheduledNotifications,
        createScheduledNotification: handleCreateScheduledNotification,
        updateScheduledNotification: handleUpdateScheduledNotification,
        deleteScheduledNotification: handleDeleteScheduledNotification,
        toggleScheduledNotification: handleToggleScheduledNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook for using the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};
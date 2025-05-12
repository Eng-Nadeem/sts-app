import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_NOTIFICATIONS, MOCK_NOTIFICATION_SETTINGS, simulateApiDelay } from './mockDataService';

// Notification types
export type NotificationType =
  | 'low_balance'
  | 'payment_reminder'
  | 'consumption_alert'
  | 'meter_recharge'
  | 'price_update'
  | 'service_outage'
  | 'system';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

// Notification setting interface
export interface NotificationSetting {
  id: string;
  type: NotificationType;
  name: string;
  enabled: boolean;
}

// Storage keys
const NOTIFICATIONS_STORAGE_KEY = 'notifications';
const NOTIFICATION_SETTINGS_STORAGE_KEY = 'notification_settings';

// Flag to use mock data (set to true to always use mock data)
const USE_MOCK_DATA = true;

// Get notifications from storage
export async function getNotifications(): Promise<Notification[]> {
  try {
    // Use mock data if flag is true
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return [...MOCK_NOTIFICATIONS];
    }

    const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (notificationsJson) {
      return JSON.parse(notificationsJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting notifications from storage:', error);
    // Fallback to mock data on error
    await simulateApiDelay();
    return [...MOCK_NOTIFICATIONS];
  }
}

// Save notifications to storage
export async function saveNotifications(notifications: Notification[]): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
}

// Add a notification
export async function addNotification(notification: Notification): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    const notifications = await getNotifications();
    notifications.unshift(notification);
    await saveNotifications(notifications);
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      // Update mock data temporarily in memory
      for (let i = 0; i < MOCK_NOTIFICATIONS.length; i++) {
        if (MOCK_NOTIFICATIONS[i].id === id) {
          MOCK_NOTIFICATIONS[i].read = true;
          break;
        }
      }
      return;
    }
    
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });
    await saveNotifications(updatedNotifications);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Delete notification
export async function deleteNotification(id: string): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== id
    );
    await saveNotifications(updatedNotifications);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// Clear all notifications
export async function clearAllNotifications(): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    await saveNotifications([]);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

// Get notification settings
export async function getNotificationSettings(): Promise<NotificationSetting[]> {
  try {
    // Use mock data if flag is true
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return [...MOCK_NOTIFICATION_SETTINGS];
    }
    
    const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    
    // Create default settings if none exist
    const defaultSettings = await createDefaultNotificationSettings();
    return defaultSettings;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    // Fallback to mock data on error
    await simulateApiDelay();
    return [...MOCK_NOTIFICATION_SETTINGS];
  }
}

// Save notification settings
export async function saveNotificationSettings(settings: NotificationSetting[]): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Create default notification settings
export async function createDefaultNotificationSettings(): Promise<NotificationSetting[]> {
  if (USE_MOCK_DATA) {
    await simulateApiDelay();
    return [...MOCK_NOTIFICATION_SETTINGS];
  }
  
  const defaultSettings: NotificationSetting[] = [
    {
      id: generateId(),
      type: 'low_balance',
      name: 'Low Balance Alerts',
      enabled: true,
    },
    {
      id: generateId(),
      type: 'payment_reminder',
      name: 'Payment Reminders',
      enabled: true,
    },
    {
      id: generateId(),
      type: 'consumption_alert',
      name: 'Consumption Alerts',
      enabled: true,
    },
    {
      id: generateId(),
      type: 'meter_recharge',
      name: 'Meter Recharge Reminders',
      enabled: true,
    },
    {
      id: generateId(),
      type: 'price_update',
      name: 'Price Update Notifications',
      enabled: true,
    },
    {
      id: generateId(),
      type: 'service_outage',
      name: 'Service Outage Notices',
      enabled: true,
    },
    {
      id: generateId(),
      type: 'system',
      name: 'System Notifications',
      enabled: true,
    },
  ];
  
  await saveNotificationSettings(defaultSettings);
  return defaultSettings;
}

// Toggle notification setting
export async function toggleNotificationSetting(id: string): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      // Update mock data temporarily in memory
      for (let i = 0; i < MOCK_NOTIFICATION_SETTINGS.length; i++) {
        if (MOCK_NOTIFICATION_SETTINGS[i].id === id) {
          MOCK_NOTIFICATION_SETTINGS[i].enabled = !MOCK_NOTIFICATION_SETTINGS[i].enabled;
          break;
        }
      }
      return;
    }
    
    const settings = await getNotificationSettings();
    const updatedSettings = settings.map(setting => {
      if (setting.id === id) {
        return { ...setting, enabled: !setting.enabled };
      }
      return setting;
    });
    await saveNotificationSettings(updatedSettings);
  } catch (error) {
    console.error('Error toggling notification setting:', error);
  }
}

// Delete notification setting
export async function deleteNotificationSetting(id: string): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    const settings = await getNotificationSettings();
    const updatedSettings = settings.filter(setting => setting.id !== id);
    await saveNotificationSettings(updatedSettings);
  } catch (error) {
    console.error('Error deleting notification setting:', error);
  }
}

// Configure local notifications
export async function configureLocalNotifications(): Promise<void> {
  try {
    // Request permissions (iOS only)
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }
    }
    
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.error('Error configuring local notifications:', error);
  }
}

// Send local notification
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  try {
    // Even in mock mode, we'll actually try to show the notification UI
    // if notifications are available
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // null means send immediately
    });
    
    // Add to storage (or mock storage)
    const notification: Notification = {
      id: notificationId,
      type: data?.type || 'system',
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      data,
    };
    
    if (USE_MOCK_DATA) {
      // Add to mock notifications in memory
      MOCK_NOTIFICATIONS.unshift(notification);
      await simulateApiDelay();
    } else {
      await addNotification(notification);
    }
    
    return notificationId;
  } catch (error) {
    console.error('Error sending local notification:', error);
    
    // Return a fake ID in mock mode
    if (USE_MOCK_DATA) {
      const fakeId = generateId();
      
      // Add to mock notifications in memory
      const notification: Notification = {
        id: fakeId,
        type: data?.type || 'system',
        title,
        body,
        timestamp: new Date().toISOString(),
        read: false,
        data,
      };
      
      MOCK_NOTIFICATIONS.unshift(notification);
      return fakeId;
    }
    
    return '';
  }
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
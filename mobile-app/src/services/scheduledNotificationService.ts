import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  NotificationTemplate,
  personalizeTemplate,
  getTemplateById,
  getRandomEnergyTip
} from './notificationTemplates';
import { MOCK_SCHEDULED_NOTIFICATIONS, simulateApiDelay } from './mockDataService';

// Scheduled notification interface
export interface ScheduledNotification {
  id: string;
  templateId: string;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string; // 'HH:MM' format
    days?: number[]; // 0-6 for days of week
    date?: number; // 1-31 for day of month
    nextTriggerDate?: string; // ISO string
  };
  personalizations: Record<string, string>;
  enabled: boolean;
  notificationId?: string; // Expo notification identifier
}

// Storage key
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';

// Flag to use mock data (set to true to always use mock data)
const USE_MOCK_DATA = true;

// Save scheduled notifications
export async function saveScheduledNotifications(
  notifications: ScheduledNotification[]
): Promise<void> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return;
    }
    
    await AsyncStorage.setItem(
      SCHEDULED_NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.error('Error saving scheduled notifications:', error);
  }
}

// Get scheduled notifications
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      return [...MOCK_SCHEDULED_NOTIFICATIONS];
    }
    
    const data = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    // Fallback to mock data
    await simulateApiDelay();
    return [...MOCK_SCHEDULED_NOTIFICATIONS];
  }
}

// Create a scheduled notification
export async function createScheduledNotification(
  templateId: string,
  schedule: ScheduledNotification['schedule'],
  personalizations: Record<string, string>
): Promise<ScheduledNotification | null> {
  try {
    // Get template
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Validate schedule
    if (!validateSchedule(schedule)) {
      throw new Error('Invalid schedule');
    }

    // Validate personalizations
    if (template.needsPersonalization && template.personalizationFields) {
      for (const field of template.personalizationFields) {
        if (!personalizations[field] && field !== 'tip') {
          throw new Error(`Missing personalization field: ${field}`);
        }
      }
    }

    // Add energy saving tip if needed
    if (template.id === 'daily-energy-tip' && !personalizations.tip) {
      personalizations.tip = getRandomEnergyTip();
    }

    // Create scheduled notification
    const newNotification: ScheduledNotification = {
      id: Math.random().toString(36).substring(2, 15),
      templateId,
      schedule,
      personalizations,
      enabled: true,
    };

    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      // Add to mock data
      MOCK_SCHEDULED_NOTIFICATIONS.push(newNotification);
      return newNotification;
    }

    // Schedule the notification
    const notificationId = await scheduleExpoNotification(newNotification, template);
    if (notificationId) {
      newNotification.notificationId = notificationId;
    }

    // Save to storage
    const notifications = await getScheduledNotifications();
    await saveScheduledNotifications([...notifications, newNotification]);

    return newNotification;
  } catch (error) {
    console.error('Error creating scheduled notification:', error);
    return null;
  }
}

// Update a scheduled notification
export async function updateScheduledNotification(
  id: string,
  updates: Partial<Omit<ScheduledNotification, 'id'>>
): Promise<ScheduledNotification | null> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      // Update mock data
      const notificationIndex = MOCK_SCHEDULED_NOTIFICATIONS.findIndex(n => n.id === id);
      if (notificationIndex === -1) {
        throw new Error(`Notification with ID ${id} not found`);
      }
      
      const updatedNotification = {
        ...MOCK_SCHEDULED_NOTIFICATIONS[notificationIndex],
        ...updates,
      };
      
      MOCK_SCHEDULED_NOTIFICATIONS[notificationIndex] = updatedNotification;
      return updatedNotification;
    }
    
    const notifications = await getScheduledNotifications();
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    const notification = notifications[notificationIndex];
    
    // Cancel existing scheduled notification
    if (notification.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
    }

    // Update notification
    const updatedNotification: ScheduledNotification = {
      ...notification,
      ...updates,
    };

    // If the notification is enabled, reschedule it
    if (updatedNotification.enabled) {
      const template = getTemplateById(updatedNotification.templateId);
      if (template) {
        const notificationId = await scheduleExpoNotification(updatedNotification, template);
        if (notificationId) {
          updatedNotification.notificationId = notificationId;
        }
      }
    }

    // Save to storage
    notifications[notificationIndex] = updatedNotification;
    await saveScheduledNotifications(notifications);

    return updatedNotification;
  } catch (error) {
    console.error('Error updating scheduled notification:', error);
    return null;
  }
}

// Delete a scheduled notification
export async function deleteScheduledNotification(id: string): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      // Update mock data
      const index = MOCK_SCHEDULED_NOTIFICATIONS.findIndex(n => n.id === id);
      if (index === -1) {
        return false;
      }
      
      MOCK_SCHEDULED_NOTIFICATIONS.splice(index, 1);
      return true;
    }
    
    const notifications = await getScheduledNotifications();
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) {
      return false;
    }

    // Cancel existing scheduled notification
    if (notification.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
    }

    // Remove from storage
    const updatedNotifications = notifications.filter(n => n.id !== id);
    await saveScheduledNotifications(updatedNotifications);

    return true;
  } catch (error) {
    console.error('Error deleting scheduled notification:', error);
    return false;
  }
}

// Toggle scheduled notification enabled state
export async function toggleScheduledNotification(id: string): Promise<ScheduledNotification | null> {
  try {
    if (USE_MOCK_DATA) {
      await simulateApiDelay();
      // Update mock data
      const index = MOCK_SCHEDULED_NOTIFICATIONS.findIndex(n => n.id === id);
      if (index === -1) {
        throw new Error(`Notification with ID ${id} not found`);
      }
      
      MOCK_SCHEDULED_NOTIFICATIONS[index].enabled = !MOCK_SCHEDULED_NOTIFICATIONS[index].enabled;
      return MOCK_SCHEDULED_NOTIFICATIONS[index];
    }
    
    const notifications = await getScheduledNotifications();
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    const notification = notifications[notificationIndex];
    const updatedNotification = {
      ...notification,
      enabled: !notification.enabled,
    };

    // If enabling, schedule the notification
    if (updatedNotification.enabled) {
      // Cancel any existing notification
      if (notification.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      }
      
      // Reschedule
      const template = getTemplateById(updatedNotification.templateId);
      if (template) {
        const notificationId = await scheduleExpoNotification(updatedNotification, template);
        if (notificationId) {
          updatedNotification.notificationId = notificationId;
        }
      }
    } 
    // If disabling, cancel the scheduled notification
    else if (notification.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      updatedNotification.notificationId = undefined;
    }

    // Save to storage
    notifications[notificationIndex] = updatedNotification;
    await saveScheduledNotifications(notifications);

    return updatedNotification;
  } catch (error) {
    console.error('Error toggling scheduled notification:', error);
    return null;
  }
}

// Schedule notification via Expo
async function scheduleExpoNotification(
  notification: ScheduledNotification,
  template: NotificationTemplate
): Promise<string | undefined> {
  try {
    // Personalize template
    const { title, body } = personalizeTemplate(
      template,
      notification.personalizations
    );

    // Create trigger based on schedule
    const trigger = createNotificationTrigger(notification.schedule);
    if (!trigger) {
      throw new Error('Could not create notification trigger');
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          templateId: template.id,
          scheduledNotificationId: notification.id,
        },
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return undefined;
  }
}

// Create notification trigger based on schedule
function createNotificationTrigger(
  schedule: ScheduledNotification['schedule']
): Notifications.NotificationTriggerInput | null {
  try {
    // Parse time
    const [hoursStr, minutesStr] = schedule.time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format');
    }

    const now = new Date();
    let triggerDate: Date | null = null;

    switch (schedule.type) {
      case 'daily': {
        triggerDate = new Date();
        triggerDate.setHours(hours, minutes, 0, 0);

        // If time already passed today, schedule for tomorrow
        if (triggerDate <= now) {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }
        break;
      }

      case 'weekly': {
        if (!schedule.days || schedule.days.length === 0) {
          throw new Error('Weekly schedule requires days');
        }

        // Find the next day of the week to trigger
        const currentDay = now.getDay();
        const sortedDays = [...schedule.days].sort((a, b) => a - b);
        let nextDay = sortedDays.find(day => day > currentDay);

        if (nextDay === undefined) {
          // No days later in the current week, get the first day for next week
          nextDay = sortedDays[0];
          triggerDate = new Date();
          // Calculate days to add (nextDay + 7 - currentDay) % 7
          const daysToAdd = (nextDay + 7 - currentDay) % 7;
          triggerDate.setDate(triggerDate.getDate() + daysToAdd);
        } else {
          triggerDate = new Date();
          triggerDate.setDate(triggerDate.getDate() + (nextDay - currentDay));
        }

        // Set the time
        triggerDate.setHours(hours, minutes, 0, 0);

        // If time already passed today and the day is the current day, push to next week
        if (triggerDate <= now && nextDay === currentDay) {
          triggerDate.setDate(triggerDate.getDate() + 7);
        }
        break;
      }

      case 'monthly': {
        if (!schedule.date || schedule.date < 1 || schedule.date > 31) {
          throw new Error('Monthly schedule requires a valid date (1-31)');
        }

        triggerDate = new Date();
        triggerDate.setDate(schedule.date);
        triggerDate.setHours(hours, minutes, 0, 0);

        // If the date has already passed this month, move to next month
        if (triggerDate <= now) {
          triggerDate.setMonth(triggerDate.getMonth() + 1);
        }

        // Adjust for months with fewer days
        const month = triggerDate.getMonth();
        triggerDate.setDate(1); // Set to first day of next month
        triggerDate.setMonth(month + 1); // Move to first day of month after next
        triggerDate.setDate(0); // Move back to last day of next month
        const lastDayOfMonth = triggerDate.getDate();
        
        // Reset to correct date (or last day of month if date is greater)
        triggerDate.setDate(Math.min(schedule.date, lastDayOfMonth));
        triggerDate.setHours(hours, minutes, 0, 0);
        break;
      }

      case 'custom': {
        // For custom, we use the nextTriggerDate if provided
        if (schedule.nextTriggerDate) {
          triggerDate = new Date(schedule.nextTriggerDate);
        } else {
          // Default to tomorrow at the specified time
          triggerDate = new Date();
          triggerDate.setDate(triggerDate.getDate() + 1);
          triggerDate.setHours(hours, minutes, 0, 0);
        }
        break;
      }
    }

    if (!triggerDate) {
      throw new Error('Could not determine next trigger date');
    }

    // Calculate seconds from now
    const seconds = Math.max(
      1, // Minimum 1 second in the future
      Math.floor((triggerDate.getTime() - now.getTime()) / 1000)
    );

    if (Platform.OS === 'ios') {
      return {
        date: triggerDate,
      };
    } else {
      return {
        seconds,
      };
    }
  } catch (error) {
    console.error('Error creating notification trigger:', error);
    return null;
  }
}

// Validate schedule
function validateSchedule(schedule: ScheduledNotification['schedule']): boolean {
  try {
    // Validate time format
    const timeParts = schedule.time.split(':');
    if (timeParts.length !== 2) {
      return false;
    }

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return false;
    }

    // Validate schedule type
    switch (schedule.type) {
      case 'daily':
        // Daily only needs a time
        return true;

      case 'weekly':
        // Weekly needs days
        return Array.isArray(schedule.days) && 
               schedule.days.length > 0 &&
               schedule.days.every(day => day >= 0 && day <= 6);

      case 'monthly':
        // Monthly needs a date
        return typeof schedule.date === 'number' && 
               schedule.date >= 1 && 
               schedule.date <= 31;

      case 'custom':
        // Custom can have a nextTriggerDate
        if (schedule.nextTriggerDate) {
          const date = new Date(schedule.nextTriggerDate);
          return !isNaN(date.getTime());
        }
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error validating schedule:', error);
    return false;
  }
}

// Helper: format time string
export function formatTimeString(time: string): string {
  try {
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    return time;
  }
}

// Helper: format schedule text
export function formatScheduleText(schedule: ScheduledNotification['schedule']): string {
  const timeStr = formatTimeString(schedule.time);
  
  switch (schedule.type) {
    case 'daily':
      return `Daily at ${timeStr}`;
      
    case 'weekly': {
      if (!schedule.days || schedule.days.length === 0) {
        return `Weekly at ${timeStr}`;
      }
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = schedule.days.map(day => dayNames[day]).join(', ');
      return `Weekly on ${days} at ${timeStr}`;
    }
    
    case 'monthly': {
      if (!schedule.date) {
        return `Monthly at ${timeStr}`;
      }
      
      // Add suffix to day
      let suffix = 'th';
      if (schedule.date % 10 === 1 && schedule.date !== 11) {
        suffix = 'st';
      } else if (schedule.date % 10 === 2 && schedule.date !== 12) {
        suffix = 'nd';
      } else if (schedule.date % 10 === 3 && schedule.date !== 13) {
        suffix = 'rd';
      }
      
      return `Monthly on the ${schedule.date}${suffix} at ${timeStr}`;
    }
    
    case 'custom': {
      if (schedule.nextTriggerDate) {
        const date = new Date(schedule.nextTriggerDate);
        return `${date.toLocaleDateString()} at ${timeStr}`;
      }
      return `Custom schedule at ${timeStr}`;
    }
    
    default:
      return 'Unknown schedule';
  }
}
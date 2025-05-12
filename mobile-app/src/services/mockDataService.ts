// Mock data service for the prepaid meter mobile app
// This file provides simulated data when the real API is not available

import { Notification, NotificationSetting } from './notificationService';
import { ScheduledNotification } from './scheduledNotificationService';

// Mock notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notification-1',
    type: 'low_balance',
    title: 'Low Wallet Balance',
    body: 'Your wallet balance is below $10.00. Please top up to ensure continuous service.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: 'notification-2',
    type: 'payment_reminder',
    title: 'Payment Due Reminder',
    body: 'You have a payment of $45.00 due on May 15, 2025. Please make your payment to avoid service interruption.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    read: true,
  },
  {
    id: 'notification-3',
    type: 'consumption_alert',
    title: 'High Usage Alert',
    body: 'Your energy consumption is 25% higher than your usual average. Consider adjusting your usage patterns.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: false,
  },
  {
    id: 'notification-4',
    type: 'meter_recharge',
    title: 'Meter Credit Low',
    body: 'Your meter M-10254 is running low on credit. Estimated days remaining: 2 days.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
  },
  {
    id: 'notification-5',
    type: 'price_update',
    title: 'Electricity Price Update',
    body: 'Electricity rates will change effective June 1, 2025. New rate: $0.15 per kWh, a 5% increase from current rates.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    read: true,
  },
  {
    id: 'notification-6',
    type: 'service_outage',
    title: 'Scheduled Maintenance',
    body: 'There will be a scheduled maintenance in your area on May 20, 2025 from 02:00 AM to 05:00 AM. Please make necessary arrangements.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    read: false,
  },
];

// Mock notification settings
export const MOCK_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'setting-1',
    type: 'low_balance',
    name: 'Low Balance Alerts',
    enabled: true,
  },
  {
    id: 'setting-2',
    type: 'payment_reminder',
    name: 'Payment Reminders',
    enabled: true,
  },
  {
    id: 'setting-3',
    type: 'consumption_alert',
    name: 'Consumption Alerts',
    enabled: true,
  },
  {
    id: 'setting-4',
    type: 'meter_recharge',
    name: 'Meter Recharge Reminders',
    enabled: true,
  },
  {
    id: 'setting-5',
    type: 'price_update',
    name: 'Price Update Notifications',
    enabled: false,
  },
  {
    id: 'setting-6',
    type: 'service_outage',
    name: 'Service Outage Notices',
    enabled: true,
  },
];

// Mock scheduled notifications
export const MOCK_SCHEDULED_NOTIFICATIONS: ScheduledNotification[] = [
  {
    id: 'schedule-1',
    templateId: 'payment-reminder',
    schedule: {
      type: 'monthly',
      time: '09:00',
      date: 25,
    },
    personalizations: {
      date: 'the 30th of each month',
      amount: '$45.00',
    },
    enabled: true,
  },
  {
    id: 'schedule-2',
    templateId: 'monthly-consumption-report',
    schedule: {
      type: 'monthly',
      time: '10:00',
      date: 1,
    },
    personalizations: {
      month: 'April',
      amount: '320',
      percent: '5',
      change: 'lower',
    },
    enabled: true,
  },
  {
    id: 'schedule-3',
    templateId: 'weekly-usage-summary',
    schedule: {
      type: 'weekly',
      time: '09:00',
      days: [1], // Monday
    },
    personalizations: {
      amount: '80',
      peak_day: 'Wednesday',
      trend: 'meet',
    },
    enabled: false,
  },
  {
    id: 'schedule-4',
    templateId: 'daily-energy-tip',
    schedule: {
      type: 'daily',
      time: '08:00',
    },
    personalizations: {
      tip: 'Turn off lights when leaving a room to save electricity.',
    },
    enabled: true,
  },
];

// Mock meters data
export const MOCK_METERS = [
  {
    id: 1,
    number: 'M-10254',
    nickname: 'Home',
    balance: 25.45,
    status: 'active',
    lastRecharge: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastRechargeAmount: 50.00,
  },
  {
    id: 2,
    number: 'M-20789',
    nickname: 'Office',
    balance: 102.30,
    status: 'active',
    lastRecharge: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastRechargeAmount: 150.00,
  },
];

// Mock wallet data
export const MOCK_WALLET = {
  balance: 85.25,
  lastTopUp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  lastTopUpAmount: 100.00,
};

// Mock transactions
export const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: 'recharge',
    amount: 50.00,
    status: 'completed',
    meterNumber: 'M-10254',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reference: 'TRX-12345',
  },
  {
    id: 2,
    type: 'recharge',
    amount: 150.00,
    status: 'completed',
    meterNumber: 'M-20789',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reference: 'TRX-23456',
  },
  {
    id: 3,
    type: 'topup',
    amount: 100.00,
    status: 'completed',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reference: 'TOP-78901',
  },
];

// Mock debts
export const MOCK_DEBTS = [
  {
    id: 1,
    type: 'water',
    amount: 35.50,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'unpaid',
    description: 'Water bill for April 2025',
  },
  {
    id: 2,
    type: 'maintenance',
    amount: 20.00,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'unpaid',
    description: 'Monthly maintenance fee',
  },
  {
    id: 3,
    type: 'trash',
    amount: 15.75,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'overdue',
    description: 'Waste management services',
  },
];

// Mock user profile
export const MOCK_USER_PROFILE = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: '123 Main St, Anytown, USA',
  accountNumber: 'ACC-10001',
  joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
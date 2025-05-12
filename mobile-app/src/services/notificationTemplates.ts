import { NotificationType } from './notificationService';

// Notification template interface
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  description: string;
  canBeScheduled: boolean;
  needsPersonalization?: boolean;
  personalizationFields?: string[];
  defaultSchedule?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    time?: string; // HH:MM format
    days?: number[]; // 0-6 for days of week
    date?: number; // 1-31 for day of month
  };
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'low-balance-alert',
    name: 'Low Balance Alert',
    type: 'low_balance',
    title: 'Wallet Balance Alert',
    body: 'Your wallet balance has fallen below your set threshold. Consider adding funds to avoid service interruption.',
    description: 'Alert sent when your wallet balance falls below a specified threshold.',
    canBeScheduled: false
  },
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    type: 'payment_reminder',
    title: 'Payment Due Reminder',
    body: 'You have an upcoming payment due on {date}. The amount due is {amount}.',
    description: 'Reminds you about upcoming bill payments before they are due.',
    canBeScheduled: true,
    needsPersonalization: true,
    personalizationFields: ['date', 'amount'],
    defaultSchedule: {
      type: 'monthly',
      date: 25, // 25th of each month
      time: '09:00'
    }
  },
  {
    id: 'monthly-consumption-report',
    name: 'Monthly Consumption Report',
    type: 'consumption_alert',
    title: 'Your Monthly Energy Report',
    body: 'Your energy consumption for the month of {month} was {amount} kWh. This is {percent}% {change} compared to last month.',
    description: 'Monthly summary of your energy consumption with comparison to previous month.',
    canBeScheduled: true,
    needsPersonalization: true,
    personalizationFields: ['month', 'amount', 'percent', 'change'],
    defaultSchedule: {
      type: 'monthly',
      date: 1, // 1st of each month
      time: '10:00'
    }
  },
  {
    id: 'weekly-usage-summary',
    name: 'Weekly Usage Summary',
    type: 'consumption_alert',
    title: 'Weekly Energy Usage Summary',
    body: 'Your energy usage this week: {amount} kWh. Peak usage day: {peak_day}. You\'re on track to {trend} your monthly usage goal.',
    description: 'Weekly summary of your energy usage patterns with peak day information.',
    canBeScheduled: true,
    needsPersonalization: true,
    personalizationFields: ['amount', 'peak_day', 'trend'],
    defaultSchedule: {
      type: 'weekly',
      days: [1], // Monday
      time: '09:00'
    }
  },
  {
    id: 'meter-credit-low',
    name: 'Meter Credit Low',
    type: 'meter_recharge',
    title: 'Meter Credit Running Low',
    body: 'Your meter {meter_number} is running low on credit. Estimated days remaining: {days_left}.',
    description: 'Alert when your prepaid meter is running low on credit and needs recharging.',
    canBeScheduled: false,
    needsPersonalization: true,
    personalizationFields: ['meter_number', 'days_left']
  },
  {
    id: 'price-change-alert',
    name: 'Price Change Alert',
    type: 'price_update',
    title: 'Electricity Price Update',
    body: 'Electricity rates will change effective {effective_date}. New rate: {new_rate} per kWh, a {change}% {direction} from current rates.',
    description: 'Notifications about changes to electricity pricing and rates.',
    canBeScheduled: false,
    needsPersonalization: true,
    personalizationFields: ['effective_date', 'new_rate', 'change', 'direction']
  },
  {
    id: 'maintenance-reminder',
    name: 'Scheduled Maintenance',
    type: 'service_outage',
    title: 'Scheduled Maintenance Notice',
    body: 'There will be a scheduled maintenance in your area on {date} from {start_time} to {end_time}. Please make necessary arrangements.',
    description: 'Information about planned maintenance that may affect your electricity service.',
    canBeScheduled: true,
    needsPersonalization: true,
    personalizationFields: ['date', 'start_time', 'end_time'],
    defaultSchedule: {
      type: 'custom',
      time: '08:00'
    }
  },
  {
    id: 'daily-energy-tip',
    name: 'Daily Energy Saving Tip',
    type: 'consumption_alert',
    title: 'Today\'s Energy Saving Tip',
    body: '{tip}',
    description: 'Receive daily tips on how to save energy and reduce your electricity bills.',
    canBeScheduled: true,
    needsPersonalization: true,
    personalizationFields: ['tip'],
    defaultSchedule: {
      type: 'daily',
      time: '08:00'
    }
  }
];

// Energy saving tips for the daily tip notification
export const ENERGY_SAVING_TIPS = [
  'Turn off lights when leaving a room to save electricity.',
  'Use natural lighting during the day instead of artificial lighting.',
  'Set your refrigerator temperature to 3-5°C (38-41°F) for optimal efficiency.',
  'Unplug chargers and appliances when not in use to avoid phantom power usage.',
  'Replace incandescent bulbs with LED bulbs to use 75% less energy.',
  'Use a programmable thermostat to adjust temperature when you\'re away or asleep.',
  'Clean or replace air filters regularly to improve HVAC efficiency.',
  'Use power strips to easily turn off multiple devices at once.',
  'Wash clothes in cold water to save on water heating costs.',
  'Air-dry clothes instead of using a dryer when possible.',
  'Use ceiling fans to circulate air and reduce air conditioning needs.',
  'Seal gaps around doors and windows to prevent air leaks.',
  'Keep your freezer full - it runs more efficiently when well-stocked.',
  'Use a microwave instead of an oven for small meals to save energy.',
  'Turn off your computer or put it to sleep when not in use.',
  'Use smart power strips that cut power to devices in standby mode.',
  'Lower your water heater temperature to 120°F (49°C) to save energy.',
  'Use natural ventilation on mild days instead of air conditioning.',
  'Clean refrigerator coils annually to maintain efficiency.',
  'Use energy-efficient settings on dishwashers and washing machines.',
  'Install dimmer switches to reduce electricity usage for lighting.',
  'Cook with lids on pots to reduce cooking time and energy use.',
  'Open blinds on sunny winter days to use solar heat; close them in summer.',
  'Use a laptop instead of a desktop computer - they use less energy.',
  'Run dishwashers and washing machines only when full for maximum efficiency.',
  'Keep heating and cooling vents unblocked by furniture or curtains.',
  'Defrost freezers regularly to maintain efficiency.',
  'Use task lighting instead of lighting an entire room.',
  'Install water-efficient showerheads to reduce water heating costs.',
  'Use a toaster oven or air fryer instead of a conventional oven for small meals.'
];

// Get random energy saving tip
export function getRandomEnergyTip(): string {
  const randomIndex = Math.floor(Math.random() * ENERGY_SAVING_TIPS.length);
  return ENERGY_SAVING_TIPS[randomIndex];
}

// Get template by ID
export function getTemplateById(id: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(template => template.id === id);
}

// Personalize notification template
export function personalizeTemplate(
  template: NotificationTemplate,
  personalizations: Record<string, string>
): { title: string; body: string } {
  let { title, body } = template;
  
  // Replace placeholders in title and body
  Object.entries(personalizations).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(placeholder, value);
    body = body.replace(placeholder, value);
  });
  
  return { title, body };
}
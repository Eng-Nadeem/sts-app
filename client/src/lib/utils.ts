import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${numericAmount.toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  try {
    // Check if date is valid first
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDate:', date);
      return 'Invalid date';
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
      return `Today, ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      return `Yesterday, ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Date unavailable';
  }
}

export function validateMeterNumber(meterNumber: string): boolean {
  return meterNumber.length === 11 && /^\d+$/.test(meterNumber);
}

export function validateAmount(amount: string | number): boolean {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numericAmount) && numericAmount >= 5 && numericAmount <= 1000;
}

export function generateToken(length: number = 16): string {
  if (length === 20) {
    // For STS meter tokens, generate 20-digit code
    let token = '';
    for (let i = 0; i < 5; i++) {
      token += Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // Format the token with dashes every 4 digits for readability
    return token.match(/.{1,4}/g)?.join('-') || token;
  } else {
    // Default token format
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(Math.floor(1000 + Math.random() * 9000).toString());
    }
    return segments.join('-');
  }
}

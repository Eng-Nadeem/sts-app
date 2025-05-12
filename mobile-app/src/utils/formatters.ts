/**
 * Format a number or string as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Format a date string to a human-readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Validate a meter number
 * @param meterNumber The meter number to validate
 * @returns Boolean indicating if the meter number is valid
 */
export function validateMeterNumber(meterNumber: string): boolean {
  // Simple validation: meter number should be 11 digits
  return /^\d{11}$/.test(meterNumber);
}

/**
 * Validate an amount
 * @param amount The amount to validate
 * @returns Boolean indicating if the amount is valid
 */
export function validateAmount(amount: string | number): boolean {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return !isNaN(numericAmount) && numericAmount > 0;
}

/**
 * Generate a random token
 * @param length The length of the token to generate
 * @returns A random token
 */
export function generateToken(length: number = 16): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Format as XXX-XXX-XXX-XXX
  if (length === 16) {
    return token.match(/.{1,4}/g)!.join('-');
  }
  
  return token;
}
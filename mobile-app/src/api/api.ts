import { Alert } from 'react-native';

// Base URL for API
const API_BASE_URL = 'https://your-api-url.com/api';

// Interface for API response
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Generic fetch function with error handling
 */
async function fetchApi<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // In a real app, you might want to handle errors differently
    // Rather than showing an alert for every API error
    Alert.alert('Error', errorMessage);
    
    return { error: errorMessage };
  }
}

/**
 * Meters API
 */
export const metersApi = {
  getMeters: () => fetchApi<Meter[]>('/meters'),
  getMeterById: (id: number) => fetchApi<Meter>(`/meters/${id}`),
  addMeter: (data: Partial<Meter>) => fetchApi<Meter>('/meters', 'POST', data),
  updateMeter: (id: number, data: Partial<Meter>) => fetchApi<Meter>(`/meters/${id}`, 'PUT', data),
  deleteMeter: (id: number) => fetchApi<void>(`/meters/${id}`, 'DELETE'),
};

/**
 * Wallet API
 */
export const walletApi = {
  getBalance: () => fetchApi<{ balance: number }>('/wallet'),
  getTransactions: () => fetchApi<WalletTransaction[]>('/wallet/transactions'),
  topUp: (amount: number) => fetchApi<{ balance: number }>('/wallet/topup', 'POST', { amount }),
};

/**
 * Debts API
 */
export const debtsApi = {
  getDebts: () => fetchApi<Debt[]>('/debts'),
  getDebtById: (id: number) => fetchApi<Debt>(`/debts/${id}`),
  payDebt: (id: number) => fetchApi<void>(`/debts/${id}/pay`, 'POST'),
  payAllDebts: () => fetchApi<void>('/debts/pay-all', 'POST'),
};

/**
 * Transactions API
 */
export const transactionsApi = {
  getTransactions: () => fetchApi<Transaction[]>('/transactions'),
  getRecentTransactions: () => fetchApi<Transaction[]>('/transactions/recent'),
  getTransactionById: (id: number) => fetchApi<Transaction>(`/transactions/${id}`),
  createTransaction: (data: Partial<Transaction>) => 
    fetchApi<Transaction>('/transactions', 'POST', data),
};

/**
 * User profile API
 */
export const userApi = {
  getProfile: () => fetchApi<User>('/user/profile'),
  updateProfile: (data: Partial<User>) => fetchApi<User>('/user/profile', 'PUT', data),
};

/**
 * Interface definitions for API data types
 */
export interface Meter {
  id: number;
  meterNumber: string;
  nickname?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  meterNumber: string;
  meterNickname?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  token?: string;
  createdAt: string;
  type: 'recharge' | 'payment' | 'wallet';
}

export interface Debt {
  id: number;
  userId: number;
  meterNumber: string;
  meterNickname?: string;
  amount: number;
  category: 'electricity' | 'water' | 'maintenance' | 'trash';
  dueDate: string;
  isPaid: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
}
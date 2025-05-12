import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  MOCK_METERS, 
  MOCK_WALLET, 
  MOCK_TRANSACTIONS, 
  MOCK_DEBTS,
  MOCK_USER_PROFILE,
  simulateApiDelay 
} from '../services/mockDataService';

// Define types
export interface Meter {
  id: number;
  number: string;
  nickname: string;
  balance: number;
  status: string;
  lastRecharge: string;
  lastRechargeAmount: number;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  meterNumber?: string;
  timestamp: string;
  reference: string;
}

export interface WalletInfo {
  balance: number;
  lastTopUp: string;
  lastTopUpAmount: number;
}

export interface Debt {
  id: number;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  description: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  accountNumber: string;
  joinDate: string;
}

// API context interface
interface ApiContextType {
  // Meters
  meters: Meter[];
  loadMeters: () => Promise<void>;
  getMeterById: (id: number) => Promise<Meter | undefined>;
  getMeterByNumber: (number: string) => Promise<Meter | undefined>;
  addMeter: (meter: Omit<Meter, 'id' | 'lastRecharge'>) => Promise<Meter>;
  updateMeter: (id: number, updates: Partial<Meter>) => Promise<Meter | undefined>;
  
  // Wallet
  wallet: WalletInfo | null;
  loadWallet: () => Promise<void>;
  topUpWallet: (amount: number) => Promise<{ success: boolean; transaction?: Transaction }>;
  
  // Transactions
  transactions: Transaction[];
  loadTransactions: () => Promise<void>;
  getTransactionById: (id: number) => Promise<Transaction | undefined>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'reference'>) => Promise<Transaction>;
  
  // Debts
  debts: Debt[];
  loadDebts: () => Promise<void>;
  getDebtById: (id: number) => Promise<Debt | undefined>;
  payDebt: (id: number) => Promise<{ success: boolean; transaction?: Transaction }>;
  
  // User Profile
  userProfile: UserProfile | null;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  
  // Meter Operations
  rechargeMeter: (meterNumber: string, amount: number) => Promise<{
    success: boolean;
    transaction?: Transaction;
    token?: string;
  }>;
}

// Create the API context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// API provider component
export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [meters, setMeters] = useState<Meter[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Load initial data
  useEffect(() => {
    loadMeters();
    loadWallet();
    loadTransactions();
    loadDebts();
    loadUserProfile();
  }, []);
  
  // Load meters
  const loadMeters = async () => {
    try {
      await simulateApiDelay();
      setMeters([...MOCK_METERS]);
    } catch (error) {
      console.error('Error loading meters:', error);
    }
  };
  
  // Get meter by ID
  const getMeterById = async (id: number) => {
    try {
      await simulateApiDelay();
      return meters.find(meter => meter.id === id);
    } catch (error) {
      console.error('Error getting meter by ID:', error);
      return undefined;
    }
  };
  
  // Get meter by number
  const getMeterByNumber = async (number: string) => {
    try {
      await simulateApiDelay();
      return meters.find(meter => meter.number === number);
    } catch (error) {
      console.error('Error getting meter by number:', error);
      return undefined;
    }
  };
  
  // Add meter
  const addMeter = async (meter: Omit<Meter, 'id' | 'lastRecharge'>) => {
    try {
      await simulateApiDelay();
      
      // Create new meter
      const newMeter: Meter = {
        id: Math.max(0, ...meters.map(m => m.id)) + 1,
        number: meter.number,
        nickname: meter.nickname,
        balance: meter.balance || 0,
        status: meter.status || 'active',
        lastRecharge: new Date().toISOString(),
        lastRechargeAmount: 0,
      };
      
      // Update state
      setMeters([...meters, newMeter]);
      
      return newMeter;
    } catch (error) {
      console.error('Error adding meter:', error);
      throw error;
    }
  };
  
  // Update meter
  const updateMeter = async (id: number, updates: Partial<Meter>) => {
    try {
      await simulateApiDelay();
      
      // Find meter
      const meterIndex = meters.findIndex(meter => meter.id === id);
      if (meterIndex === -1) {
        return undefined;
      }
      
      // Update meter
      const updatedMeter = {
        ...meters[meterIndex],
        ...updates,
      };
      
      // Update state
      const updatedMeters = [...meters];
      updatedMeters[meterIndex] = updatedMeter;
      setMeters(updatedMeters);
      
      return updatedMeter;
    } catch (error) {
      console.error('Error updating meter:', error);
      return undefined;
    }
  };
  
  // Load wallet
  const loadWallet = async () => {
    try {
      await simulateApiDelay();
      setWallet({ ...MOCK_WALLET });
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };
  
  // Top up wallet
  const topUpWallet = async (amount: number) => {
    try {
      await simulateApiDelay();
      
      if (!wallet) {
        return { success: false };
      }
      
      // Update wallet
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance + amount,
        lastTopUp: new Date().toISOString(),
        lastTopUpAmount: amount,
      };
      
      // Create transaction
      const transaction: Transaction = {
        id: Math.max(0, ...transactions.map(t => t.id)) + 1,
        type: 'topup',
        amount,
        status: 'completed',
        timestamp: new Date().toISOString(),
        reference: `TOP-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      
      // Update state
      setWallet(updatedWallet);
      setTransactions([transaction, ...transactions]);
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error topping up wallet:', error);
      return { success: false };
    }
  };
  
  // Load transactions
  const loadTransactions = async () => {
    try {
      await simulateApiDelay();
      setTransactions([...MOCK_TRANSACTIONS]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };
  
  // Get transaction by ID
  const getTransactionById = async (id: number) => {
    try {
      await simulateApiDelay();
      return transactions.find(transaction => transaction.id === id);
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return undefined;
    }
  };
  
  // Add transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp' | 'reference'>) => {
    try {
      await simulateApiDelay();
      
      // Create new transaction
      const newTransaction: Transaction = {
        id: Math.max(0, ...transactions.map(t => t.id)) + 1,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status || 'completed',
        meterNumber: transaction.meterNumber,
        timestamp: new Date().toISOString(),
        reference: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      
      // Update state
      setTransactions([newTransaction, ...transactions]);
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };
  
  // Load debts
  const loadDebts = async () => {
    try {
      await simulateApiDelay();
      setDebts([...MOCK_DEBTS]);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };
  
  // Get debt by ID
  const getDebtById = async (id: number) => {
    try {
      await simulateApiDelay();
      return debts.find(debt => debt.id === id);
    } catch (error) {
      console.error('Error getting debt by ID:', error);
      return undefined;
    }
  };
  
  // Pay debt
  const payDebt = async (id: number) => {
    try {
      await simulateApiDelay();
      
      // Find debt
      const debtIndex = debts.findIndex(debt => debt.id === id);
      if (debtIndex === -1 || !wallet) {
        return { success: false };
      }
      
      const debt = debts[debtIndex];
      
      // Check wallet balance
      if (wallet.balance < debt.amount) {
        return { success: false };
      }
      
      // Update debt
      const updatedDebt = {
        ...debt,
        status: 'paid',
      };
      
      // Update wallet
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance - debt.amount,
      };
      
      // Create transaction
      const transaction: Transaction = {
        id: Math.max(0, ...transactions.map(t => t.id)) + 1,
        type: 'debt_payment',
        amount: debt.amount,
        status: 'completed',
        timestamp: new Date().toISOString(),
        reference: `DEBT-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      
      // Update state
      const updatedDebts = [...debts];
      updatedDebts[debtIndex] = updatedDebt;
      setDebts(updatedDebts);
      setWallet(updatedWallet);
      setTransactions([transaction, ...transactions]);
      
      return { success: true, transaction };
    } catch (error) {
      console.error('Error paying debt:', error);
      return { success: false };
    }
  };
  
  // Load user profile
  const loadUserProfile = async () => {
    try {
      await simulateApiDelay();
      setUserProfile({ ...MOCK_USER_PROFILE });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      await simulateApiDelay();
      
      if (!userProfile) {
        return null;
      }
      
      // Update profile
      const updatedProfile = {
        ...userProfile,
        ...updates,
      };
      
      // Update state
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  };
  
  // Recharge meter
  const rechargeMeter = async (meterNumber: string, amount: number) => {
    try {
      await simulateApiDelay();
      
      // Find meter
      const meterIndex = meters.findIndex(meter => meter.number === meterNumber);
      if (meterIndex === -1 || !wallet) {
        return { success: false };
      }
      
      // Check wallet balance
      if (wallet.balance < amount) {
        return { success: false };
      }
      
      // Update meter
      const updatedMeter = {
        ...meters[meterIndex],
        balance: meters[meterIndex].balance + amount,
        lastRecharge: new Date().toISOString(),
        lastRechargeAmount: amount,
      };
      
      // Update wallet
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance - amount,
      };
      
      // Create transaction
      const transaction: Transaction = {
        id: Math.max(0, ...transactions.map(t => t.id)) + 1,
        type: 'recharge',
        amount,
        status: 'completed',
        meterNumber,
        timestamp: new Date().toISOString(),
        reference: `RECHARGE-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      
      // Generate token
      const token = Math.random().toString(36).substring(2, 8).toUpperCase() +
                   Math.random().toString(36).substring(2, 8).toUpperCase() +
                   Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Update state
      const updatedMeters = [...meters];
      updatedMeters[meterIndex] = updatedMeter;
      setMeters(updatedMeters);
      setWallet(updatedWallet);
      setTransactions([transaction, ...transactions]);
      
      return { success: true, transaction, token };
    } catch (error) {
      console.error('Error recharging meter:', error);
      return { success: false };
    }
  };
  
  return (
    <ApiContext.Provider
      value={{
        // Meters
        meters,
        loadMeters,
        getMeterById,
        getMeterByNumber,
        addMeter,
        updateMeter,
        
        // Wallet
        wallet,
        loadWallet,
        topUpWallet,
        
        // Transactions
        transactions,
        loadTransactions,
        getTransactionById,
        addTransaction,
        
        // Debts
        debts,
        loadDebts,
        getDebtById,
        payDebt,
        
        // User Profile
        userProfile,
        loadUserProfile,
        updateUserProfile,
        
        // Meter Operations
        rechargeMeter,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

// Hook for using the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  
  return context;
};
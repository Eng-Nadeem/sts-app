import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  insertMeterSchema,
  insertTransactionSchema,
  insertDebtSchema,
  insertWalletTransactionSchema,
} from "@shared/schema";
import { generateToken } from "../client/src/lib/utils";

// Import mock data service for fallback
import {
  MOCK_METERS,
  MOCK_TRANSACTIONS,
  MOCK_DEBTS,
  MOCK_WALLET,
  MOCK_USER_PROFILE,
  simulateApiDelay
} from "../mobile-app/src/services/mockDataService";

export async function registerMockRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // API Routes - all prefixed with /api
  
  // Get recent meters
  app.get('/api/meters/recent', async (req, res) => {
    await simulateApiDelay();
    res.json(MOCK_METERS.slice(0, 5));
  });

  // Get all meters
  app.get('/api/meters', async (req, res) => {
    await simulateApiDelay();
    res.json(MOCK_METERS);
  });

  // Get meter by ID
  app.get('/api/meters/:id', async (req, res) => {
    await simulateApiDelay();
    const { id } = req.params;
    const meter = MOCK_METERS.find(m => m.id === parseInt(id));
    
    if (!meter) {
      return res.status(404).json({ error: 'Meter not found' });
    }
    
    res.json(meter);
  });

  // Create a new meter
  app.post('/api/meters', async (req, res) => {
    try {
      await simulateApiDelay();
      
      // Check if meter already exists
      const existingMeter = MOCK_METERS.find(m => m.number === req.body.meterNumber);
      
      if (existingMeter) {
        // If it exists and has no nickname but we're providing one, update it
        if (!existingMeter.nickname && req.body.nickname) {
          existingMeter.nickname = req.body.nickname;
          return res.json(existingMeter);
        }
        // Otherwise just return the existing meter
        return res.json(existingMeter);
      }
      
      // Create new meter
      const newMeter = {
        id: Math.max(0, ...MOCK_METERS.map(m => m.id)) + 1,
        number: req.body.meterNumber,
        nickname: req.body.nickname,
        balance: 0,
        status: 'active',
        lastRecharge: new Date().toISOString(),
        lastRechargeAmount: 0,
      };
      
      MOCK_METERS.push(newMeter);
      res.status(201).json(newMeter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating meter:', error);
      res.status(500).json({ error: 'Failed to create meter' });
    }
  });

  // Update meter
  app.put('/api/meters/:id', async (req, res) => {
    await simulateApiDelay();
    const { id } = req.params;
    const meterIndex = MOCK_METERS.findIndex(m => m.id === parseInt(id));
    
    if (meterIndex === -1) {
      return res.status(404).json({ error: 'Meter not found' });
    }
    
    // Update meter
    MOCK_METERS[meterIndex] = {
      ...MOCK_METERS[meterIndex],
      ...req.body,
    };
    
    res.json(MOCK_METERS[meterIndex]);
  });

  // Get all transactions with optional filtering
  app.get('/api/transactions', async (req, res) => {
    await simulateApiDelay();
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    
    let transactions = [...MOCK_TRANSACTIONS];
    
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }
    
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    res.json(transactions);
  });

  // Get recent transactions
  app.get('/api/transactions/recent', async (req, res) => {
    await simulateApiDelay();
    res.json(MOCK_TRANSACTIONS.slice(0, 5));
  });

  // Get transaction by ID
  app.get('/api/transactions/:id', async (req, res) => {
    await simulateApiDelay();
    const { id } = req.params;
    
    // Validate ID is a valid number
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }
    
    const transaction = MOCK_TRANSACTIONS.find(t => t.id === parsedId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  });

  // Create a new transaction
  app.post('/api/transactions', async (req, res) => {
    try {
      await simulateApiDelay();
      
      // Calculate estimated units (for demo purposes)
      const amount = parseFloat(req.body.amount.toString());
      const units = (amount / 0.45).toFixed(2);
      
      // If payment method is wallet, update wallet balance
      if (req.body.paymentMethod === 'wallet') {
        const walletBalance = MOCK_WALLET.balance;
        const total = parseFloat(req.body.total.toString());
        
        if (walletBalance < total) {
          return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
        
        // Update wallet balance
        MOCK_WALLET.balance -= total;
      }
      
      // Create new transaction
      const newTransaction = {
        id: Math.max(0, ...MOCK_TRANSACTIONS.map(t => t.id)) + 1,
        type: req.body.transactionType || 'recharge',
        amount: parseFloat(req.body.amount.toString()),
        status: Math.random() < 0.9 ? "success" : "failed", // 90% success rate for demo
        meterNumber: req.body.meterNumber,
        timestamp: new Date().toISOString(),
        reference: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
        token: generateToken(20),
        units,
      };
      
      // Add to mock data
      MOCK_TRANSACTIONS.unshift(newTransaction);
      
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  // Get transaction statistics
  app.get('/api/transactions/stats', async (req, res) => {
    await simulateApiDelay();
    
    // Calculate mock stats
    const totalAmount = MOCK_TRANSACTIONS
      .filter(t => t.status === 'completed' || t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCount = MOCK_TRANSACTIONS.length;
    
    const stats = {
      totalAmount,
      totalCount,
      averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
    };
    
    res.json(stats);
  });

  // Get debts for a user
  app.get('/api/debts', async (req, res) => {
    await simulateApiDelay();
    res.json(MOCK_DEBTS);
  });
  
  // Get debt by ID
  app.get('/api/debts/:id', async (req, res) => {
    await simulateApiDelay();
    const { id } = req.params;
    
    // Validate ID is a valid number
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid debt ID format' });
    }
    
    const debt = MOCK_DEBTS.find(d => d.id === parsedId);
    
    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    
    res.json(debt);
  });

  // Pay debt
  app.post('/api/debts/:id/pay', async (req, res) => {
    await simulateApiDelay();
    const { id } = req.params;
    
    // Validate ID is a valid number
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid debt ID format' });
    }
    
    const debtIndex = MOCK_DEBTS.findIndex(d => d.id === parsedId);
    
    if (debtIndex === -1) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    
    const debt = MOCK_DEBTS[debtIndex];
    
    if (debt.status === 'paid') {
      return res.status(400).json({ error: 'Debt has already been paid' });
    }
    
    const paymentMethod = req.body.paymentMethod;
    
    // If payment method is wallet, check if the user has enough balance
    if (paymentMethod === 'wallet') {
      const walletBalance = MOCK_WALLET.balance;
      const amount = parseFloat(debt.amount.toString());
      
      if (walletBalance < amount) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      
      // Update wallet balance
      MOCK_WALLET.balance -= amount;
    }
    
    // Update debt status
    MOCK_DEBTS[debtIndex] = {
      ...debt,
      status: 'paid',
    };
    
    // Create a transaction for the debt payment
    const newTransaction = {
      id: Math.max(0, ...MOCK_TRANSACTIONS.map(t => t.id)) + 1,
      type: 'debt_payment',
      amount: parseFloat(debt.amount.toString()),
      status: 'success',
      timestamp: new Date().toISOString(),
      reference: 'DEBT-' + Math.floor(100000 + Math.random() * 900000),
    };
    
    // Add transaction to mock data
    MOCK_TRANSACTIONS.unshift(newTransaction);
    
    res.json(MOCK_DEBTS[debtIndex]);
  });

  // Get wallet balance
  app.get('/api/wallet', async (req, res) => {
    await simulateApiDelay();
    res.json({
      balance: MOCK_WALLET.balance
    });
  });

  // Get wallet transactions
  app.get('/api/wallet/transactions', async (req, res) => {
    await simulateApiDelay();
    // Filter wallet-related transactions
    const walletTransactions = MOCK_TRANSACTIONS.filter(
      t => t.type === 'topup' || t.type === 'debt_payment'
    );
    res.json(walletTransactions);
  });

  // Add funds to wallet
  app.post('/api/wallet/add-funds', async (req, res) => {
    await simulateApiDelay();
    const { amount } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Update wallet balance
    const parsedAmount = parseFloat(amount);
    MOCK_WALLET.balance += parsedAmount;
    MOCK_WALLET.lastTopUp = new Date().toISOString();
    MOCK_WALLET.lastTopUpAmount = parsedAmount;
    
    // Create a transaction for the wallet top-up
    const newTransaction = {
      id: Math.max(0, ...MOCK_TRANSACTIONS.map(t => t.id)) + 1,
      type: 'topup',
      amount: parsedAmount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      reference: 'TOP-' + Math.floor(100000 + Math.random() * 900000),
    };
    
    // Add transaction to mock data
    MOCK_TRANSACTIONS.unshift(newTransaction);
    
    res.json({
      balance: MOCK_WALLET.balance,
      transaction: newTransaction
    });
  });

  // User profile endpoint
  app.get('/api/user/profile', async (req, res) => {
    await simulateApiDelay();
    res.json(MOCK_USER_PROFILE);
  });

  // Update user profile
  app.put('/api/user/profile', async (req, res) => {
    await simulateApiDelay();
    
    // Update profile
    const updatedProfile = {
      ...MOCK_USER_PROFILE,
      ...req.body,
    };
    
    // Save updated profile
    Object.assign(MOCK_USER_PROFILE, updatedProfile);
    
    res.json(updatedProfile);
  });

  return httpServer;
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertMeterSchema, 
  insertTransactionSchema, 
  insertDebtSchema,
  insertWalletTransactionSchema,
  meters, 
  transactions,
  debts,
  walletTransactions 
} from "@shared/schema";
import { generateToken } from "../client/src/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // API Routes - all prefixed with /api
  
  // Get recent meters
  app.get('/api/meters/recent', async (req, res) => {
    try {
      const recentMeters = await storage.getRecentMeters();
      res.json(recentMeters);
    } catch (error) {
      console.error('Error fetching recent meters:', error);
      res.status(500).json({ error: 'Failed to fetch recent meters' });
    }
  });

  // Get all meters
  app.get('/api/meters', async (req, res) => {
    try {
      const allMeters = await storage.getAllMeters();
      res.json(allMeters);
    } catch (error) {
      console.error('Error fetching all meters:', error);
      res.status(500).json({ error: 'Failed to fetch all meters' });
    }
  });

  // Get meter by ID
  app.get('/api/meters/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const meter = await storage.getMeterById(parseInt(id));
      
      if (!meter) {
        return res.status(404).json({ error: 'Meter not found' });
      }
      
      res.json(meter);
    } catch (error) {
      console.error('Error fetching meter:', error);
      res.status(500).json({ error: 'Failed to fetch meter' });
    }
  });

  // Create a new meter
  app.post('/api/meters', async (req, res) => {
    try {
      const userData = await storage.getUserProfile();
      const validatedData = insertMeterSchema.parse({
        ...req.body,
        userId: userData.id
      });
      
      // Check if meter already exists
      const existingMeter = await storage.getMeterByNumber(validatedData.meterNumber);
      
      if (existingMeter) {
        // If it exists and has no nickname but we're providing one, update it
        if (!existingMeter.nickname && validatedData.nickname) {
          const updatedMeter = await storage.updateMeterNickname(
            existingMeter.id,
            validatedData.nickname
          );
          return res.json(updatedMeter);
        }
        // Otherwise just return the existing meter
        return res.json(existingMeter);
      }
      
      // Create new meter
      const newMeter = await storage.createMeter(validatedData);
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
    try {
      const { id } = req.params;
      const updatedMeter = await storage.updateMeter(parseInt(id), req.body);
      res.json(updatedMeter);
    } catch (error) {
      console.error('Error updating meter:', error);
      res.status(500).json({ error: 'Failed to update meter' });
    }
  });

  // Get all transactions with optional filtering
  app.get('/api/transactions', async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const type = req.query.type as string | undefined;
      const transactions = await storage.getTransactions(status, type);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Get recent transactions
  app.get('/api/transactions/recent', async (req, res) => {
    try {
      const recentTransactions = await storage.getRecentTransactions();
      res.json(recentTransactions);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      res.status(500).json({ error: 'Failed to fetch recent transactions' });
    }
  });

  // Get transaction by ID
  app.get('/api/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID is a valid number
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid transaction ID format' });
      }
      
      const transaction = await storage.getTransactionById(parsedId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  });

  // Create a new transaction
  app.post('/api/transactions', async (req, res) => {
    try {
      const userData = await storage.getUserProfile();
      const paymentMethod = req.body.paymentMethod;
      let walletUpdate = null;
      
      // If payment method is wallet, check if the user has enough balance
      if (paymentMethod === 'wallet') {
        const user = await storage.getUserProfile();
        const walletBalance = parseFloat(user.walletBalance.toString());
        const amount = parseFloat(req.body.total.toString());
        
        if (walletBalance < amount) {
          return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
        
        // Create wallet transaction record for payment
        const walletTransaction = await storage.createWalletTransaction({
          userId: userData.id,
          amount: req.body.total,
          type: 'payment',
          description: `Meter recharge - ${req.body.meterNumber}`,
          reference: 'PAY' + Math.floor(Math.random() * 1000000)
        });
        
        // Update user's wallet balance
        walletUpdate = await storage.updateWalletBalance(userData.id, -parseFloat(req.body.total.toString()));
      }
      
      // Calculate estimated units (for demo purposes)
      const amount = parseFloat(req.body.amount.toString());
      const units = (amount / 0.45).toFixed(2);
      
      const transactionData = {
        ...req.body,
        userId: userData.id,
        status: Math.random() < 0.9 ? "success" : "failed", // 90% success rate for demo
        token: generateToken(20),
        units,
        transactionType: "recharge"
      };
      
      const validatedData = insertTransactionSchema.parse(transactionData);
      
      // Process the payment (in a real app, we would integrate with a payment provider here)
      const newTransaction = await storage.createTransaction(validatedData);
      
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
    try {
      const stats = await storage.getTransactionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      res.status(500).json({ error: 'Failed to fetch transaction stats' });
    }
  });

  // Get debts for a user
  app.get('/api/debts', async (req, res) => {
    try {
      const userData = await storage.getUserProfile();
      const userDebts = await storage.getUserDebts(userData.id);
      res.json(userDebts);
    } catch (error) {
      console.error('Error fetching user debts:', error);
      res.status(500).json({ error: 'Failed to fetch user debts' });
    }
  });
  
  // Get debt by ID
  app.get('/api/debts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID is a valid number
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid debt ID format' });
      }
      
      const debt = await storage.getDebtById(parsedId);
      
      if (!debt) {
        return res.status(404).json({ error: 'Debt not found' });
      }
      
      res.json(debt);
    } catch (error) {
      console.error('Error fetching debt:', error);
      res.status(500).json({ error: 'Failed to fetch debt' });
    }
  });

  // Pay debt
  app.post('/api/debts/:id/pay', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID is a valid number
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid debt ID format' });
      }
      
      const userData = await storage.getUserProfile();
      const debt = await storage.getDebtById(parsedId);
      
      if (!debt) {
        return res.status(404).json({ error: 'Debt not found' });
      }
      
      const paymentMethod = req.body.paymentMethod;
      
      // If payment method is wallet, check if the user has enough balance
      if (paymentMethod === 'wallet') {
        const walletBalance = parseFloat(userData.walletBalance.toString());
        const amount = parseFloat(debt.amount.toString());
        
        if (walletBalance < amount) {
          return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
        
        // Create wallet transaction for debt payment
        await storage.createWalletTransaction({
          userId: userData.id,
          amount: debt.amount,
          type: 'payment',
          description: `Debt payment - ${debt.meterNumber}`,
          reference: 'DEBT' + Math.floor(Math.random() * 1000000)
        });
        
        // Update user's wallet balance
        await storage.updateWalletBalance(userData.id, -parseFloat(debt.amount.toString()));
      }
      
      // Create a transaction record for the debt payment
      const transactionData = {
        userId: userData.id,
        meterNumber: debt.meterNumber,
        amount: debt.amount,
        total: debt.amount,
        status: "success",
        paymentMethod,
        transactionType: "debt_payment"
      };
      
      await storage.createTransaction(transactionData);
      
      // Mark debt as paid
      const paidDebt = await storage.markDebtAsPaid(parsedId);
      
      res.json(paidDebt);
    } catch (error) {
      console.error('Error paying debt:', error);
      res.status(500).json({ error: 'Failed to pay debt' });
    }
  });

  // Get wallet balance
  app.get('/api/wallet', async (req, res) => {
    try {
      const userData = await storage.getUserProfile();
      res.json({
        balance: userData.walletBalance
      });
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
  });

  // Get wallet transactions
  app.get('/api/wallet/transactions', async (req, res) => {
    try {
      const userData = await storage.getUserProfile();
      const transactions = await storage.getWalletTransactions(userData.id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      res.status(500).json({ error: 'Failed to fetch wallet transactions' });
    }
  });

  // Add funds to wallet
  app.post('/api/wallet/add-funds', async (req, res) => {
    try {
      const userData = await storage.getUserProfile();
      const { amount } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // Create wallet transaction for deposit
      const walletTransaction = await storage.createWalletTransaction({
        userId: userData.id,
        amount,
        type: 'deposit',
        description: 'Wallet top-up',
        reference: 'DEP' + Math.floor(Math.random() * 1000000)
      });
      
      // Update user's wallet balance
      const updatedUser = await storage.updateWalletBalance(userData.id, parseFloat(amount));
      
      res.json({
        balance: updatedUser.walletBalance,
        transaction: walletTransaction
      });
    } catch (error) {
      console.error('Error adding funds to wallet:', error);
      res.status(500).json({ error: 'Failed to add funds to wallet' });
    }
  });

  // User profile endpoint
  app.get('/api/user/profile', async (req, res) => {
    try {
      const user = await storage.getUserProfile();
      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Update user profile
  app.put('/api/user/profile', async (req, res) => {
    try {
      const updatedUser = await storage.updateUserProfile(req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  return httpServer;
}

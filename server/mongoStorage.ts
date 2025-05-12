import { User, Meter, Transaction, Debt, WalletTransaction } from '../db/mongodb';
import mongoose, { Types } from 'mongoose';

// Types
type ObjectIdOrString = mongoose.Types.ObjectId | string;

// Helper function to check if an ID is a valid MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to convert string to ObjectId if needed
const toObjectId = (id: ObjectIdOrString): Types.ObjectId => {
  if (typeof id === 'string') {
    return new Types.ObjectId(id);
  }
  return id;
};

// MongoDB storage implementation
export const mongoStorage = {
  // User operations
  async getUserProfile() {
    // Get first user or create one if none exists
    let user = await User.findOne();
    
    if (!user) {
      user = await User.create({
        username: 'demo_user',
        fullName: 'Demo User',
        email: 'demo@example.com',
        phone: '+1234567890',
        address: '123 Main St, Anytown, USA',
        walletBalance: 100.00
      });
    }
    
    return user;
  },
  
  async updateUserProfile(data: any) {
    const user = await this.getUserProfile();
    
    // Update user with new data
    Object.assign(user, data);
    await user.save();
    
    return user;
  },
  
  async updateWalletBalance(userId: ObjectIdOrString, amountChange: number) {
    const user = await User.findById(toObjectId(userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.walletBalance += amountChange;
    await user.save();
    
    return user;
  },
  
  // Meter operations
  async getRecentMeters(limit = 5) {
    return await Meter.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  },
  
  async getAllMeters() {
    return await Meter.find().sort({ createdAt: -1 });
  },
  
  async getMeterById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    
    return await Meter.findById(id);
  },
  
  async getMeterByNumber(meterNumber: string) {
    return await Meter.findOne({ meterNumber });
  },
  
  async createMeter(data: any) {
    // Get or create user if userId is not provided
    if (!data.userId) {
      const user = await this.getUserProfile();
      data.userId = user._id;
    }
    
    return await Meter.create(data);
  },
  
  async updateMeterNickname(id: string, nickname: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    
    return await Meter.findByIdAndUpdate(
      id,
      { nickname, updatedAt: new Date() },
      { new: true }
    );
  },
  
  async updateMeter(id: string, data: any) {
    if (!isValidObjectId(id)) {
      return null;
    }
    
    return await Meter.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  },
  
  // Transaction operations
  async getTransactions(status?: string, type?: string) {
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.transactionType = type;
    }
    
    return await Transaction.find(query).sort({ createdAt: -1 });
  },
  
  async getRecentTransactions(limit = 5) {
    return await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  },
  
  async getTransactionById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    
    return await Transaction.findById(id);
  },
  
  async createTransaction(data: any) {
    // Get or create user if userId is not provided
    if (!data.userId) {
      const user = await this.getUserProfile();
      data.userId = user._id;
    }
    
    // Convert amount and total to numbers if they're strings
    if (typeof data.amount === 'string') {
      data.amount = parseFloat(data.amount);
    }
    
    if (typeof data.total === 'string') {
      data.total = parseFloat(data.total);
    }
    
    return await Transaction.create(data);
  },
  
  async getTransactionStats() {
    const totalCount = await Transaction.countDocuments();
    
    const aggregation = await Transaction.aggregate([
      {
        $match: { status: 'success' }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalAmount = aggregation.length > 0 ? aggregation[0].totalAmount : 0;
    const successCount = aggregation.length > 0 ? aggregation[0].count : 0;
    
    return {
      totalAmount,
      totalCount,
      averageAmount: successCount > 0 ? totalAmount / successCount : 0
    };
  },
  
  // Debt operations
  async getUserDebts(userId: ObjectIdOrString) {
    return await Debt.find({ userId: toObjectId(userId) }).sort({ dueDate: 1 });
  },
  
  async getDebtById(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    
    return await Debt.findById(id);
  },
  
  async createDebt(data: any) {
    // Get or create user if userId is not provided
    if (!data.userId) {
      const user = await this.getUserProfile();
      data.userId = user._id;
    }
    
    // Convert amount to number if it's a string
    if (typeof data.amount === 'string') {
      data.amount = parseFloat(data.amount);
    }
    
    return await Debt.create(data);
  },
  
  async markDebtAsPaid(id: string) {
    if (!isValidObjectId(id)) {
      return null;
    }
    
    return await Debt.findByIdAndUpdate(
      id,
      { 
        status: 'paid',
        isPaid: true,
        updatedAt: new Date()
      },
      { new: true }
    );
  },
  
  // Wallet transaction operations
  async getWalletTransactions(userId: ObjectIdOrString) {
    return await WalletTransaction.find({ userId: toObjectId(userId) }).sort({ createdAt: -1 });
  },
  
  async createWalletTransaction(data: any) {
    // Get or create user if userId is not provided
    if (!data.userId) {
      const user = await this.getUserProfile();
      data.userId = user._id;
    }
    
    // Convert amount to number if it's a string
    if (typeof data.amount === 'string') {
      data.amount = parseFloat(data.amount);
    }
    
    return await WalletTransaction.create(data);
  },
  
  // Helper to seed initial data if needed
  async seedInitialData() {
    // Create demo user if none exists
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      await User.create({
        username: 'demo_user',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St, Anytown, USA',
        walletBalance: 85.25
      });
    }
    
    // Get user
    const user = await this.getUserProfile();
    
    // Create meters if none exist
    const meterCount = await Meter.countDocuments();
    
    if (meterCount === 0) {
      await Meter.create([
        {
          userId: user._id,
          meterNumber: 'M-10254',
          nickname: 'Home',
          status: 'active',
        },
        {
          userId: user._id,
          meterNumber: 'M-20789',
          nickname: 'Office',
          status: 'active',
        }
      ]);
    }
    
    // Create transactions if none exist
    const transactionCount = await Transaction.countDocuments();
    
    if (transactionCount === 0) {
      // Get meters
      const meters = await this.getAllMeters();
      
      if (meters.length > 0) {
        const homeDate = new Date();
        homeDate.setDate(homeDate.getDate() - 7);
        
        const officeDate = new Date();
        officeDate.setDate(officeDate.getDate() - 14);
        
        const walletDate = new Date();
        walletDate.setDate(walletDate.getDate() - 10);
        
        await Transaction.create([
          {
            userId: user._id,
            meterNumber: meters[0].meterNumber,
            amount: 50.00,
            total: 50.00,
            status: 'success',
            transactionType: 'recharge',
            paymentMethod: 'card',
            token: 'STS-1234-5678-9012',
            createdAt: homeDate
          },
          {
            userId: user._id,
            meterNumber: meters.length > 1 ? meters[1].meterNumber : meters[0].meterNumber,
            amount: 150.00,
            total: 150.00,
            status: 'success',
            transactionType: 'recharge',
            paymentMethod: 'wallet',
            token: 'STS-5678-9012-3456',
            createdAt: officeDate
          },
        ]);
        
        // Create wallet transaction
        await WalletTransaction.create({
          userId: user._id,
          amount: 100.00,
          type: 'deposit',
          description: 'Wallet top-up',
          reference: 'TOP-78901',
          createdAt: walletDate
        });
      }
    }
    
    // Create debts if none exist
    const debtCount = await Debt.countDocuments();
    
    if (debtCount === 0) {
      // Get meters
      const meters = await this.getAllMeters();
      
      if (meters.length > 0) {
        const dueDateFuture = new Date();
        dueDateFuture.setDate(dueDateFuture.getDate() + 5);
        
        const dueDateFuture2 = new Date();
        dueDateFuture2.setDate(dueDateFuture2.getDate() + 10);
        
        const dueDatePast = new Date();
        dueDatePast.setDate(dueDatePast.getDate() - 2);
        
        await Debt.create([
          {
            userId: user._id,
            meterNumber: meters[0].meterNumber,
            amount: 35.50,
            category: 'water',
            dueDate: dueDateFuture,
            status: 'pending',
            isPaid: false,
            description: 'Water bill for April 2025'
          },
          {
            userId: user._id,
            meterNumber: meters.length > 1 ? meters[1].meterNumber : meters[0].meterNumber,
            amount: 20.00,
            category: 'maintenance',
            dueDate: dueDateFuture2,
            status: 'pending',
            isPaid: false,
            description: 'Monthly maintenance fee'
          },
          {
            userId: user._id,
            meterNumber: meters[0].meterNumber,
            amount: 15.75,
            category: 'trash',
            dueDate: dueDatePast,
            status: 'overdue',
            isPaid: false,
            description: 'Waste management services'
          }
        ]);
      }
    }
  }
};
import { db } from "@db";
import { eq, desc, sql, and, or, isNull, ne } from "drizzle-orm";
import { 
  users, 
  meters, 
  transactions, 
  debts,
  walletTransactions,
  InsertMeter, 
  InsertTransaction,
  InsertDebt,
  InsertWalletTransaction,
  User
} from "@shared/schema";

export const storage = {
  // Meter operations
  async getRecentMeters(limit = 5) {
    return db.query.meters.findMany({
      orderBy: desc(meters.updatedAt),
      limit
    });
  },
  
  async getAllMeters() {
    return db.query.meters.findMany({
      orderBy: desc(meters.updatedAt)
    });
  },
  
  async getMeterById(id: number) {
    return db.query.meters.findFirst({
      where: eq(meters.id, id)
    });
  },
  
  async getMeterByNumber(meterNumber: string) {
    return db.query.meters.findFirst({
      where: eq(meters.meterNumber, meterNumber)
    });
  },
  
  async createMeter(data: InsertMeter) {
    const result = await db.insert(meters).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return result[0];
  },
  
  async updateMeterNickname(id: number, nickname: string) {
    const result = await db.update(meters)
      .set({ 
        nickname, 
        updatedAt: new Date() 
      })
      .where(eq(meters.id, id))
      .returning();
      
    return result[0];
  },

  async updateMeter(id: number, data: Partial<InsertMeter>) {
    const result = await db.update(meters)
      .set({ 
        ...data,
        updatedAt: new Date() 
      })
      .where(eq(meters.id, id))
      .returning();
      
    return result[0];
  },
  
  // Transaction operations
  async getTransactions(status?: string, type?: string) {
    let conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(transactions.status, status));
    }
    
    if (type && type !== 'all') {
      conditions.push(eq(transactions.transactionType, type));
    }
    
    if (conditions.length > 0) {
      return db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: desc(transactions.createdAt)
      });
    }
    
    return db.query.transactions.findMany({
      orderBy: desc(transactions.createdAt)
    });
  },
  
  async getRecentTransactions(limit = 5) {
    return db.query.transactions.findMany({
      orderBy: desc(transactions.createdAt),
      limit
    });
  },
  
  async getTransactionById(id: number) {
    return db.query.transactions.findFirst({
      where: eq(transactions.id, id)
    });
  },
  
  async createTransaction(data: InsertTransaction) {
    // Create the transaction
    const result = await db.insert(transactions).values({
      ...data,
      createdAt: new Date()
    }).returning();
    
    // Update the meter's lastUsed time
    await db.update(meters)
      .set({ updatedAt: new Date() })
      .where(eq(meters.meterNumber, data.meterNumber));
    
    return result[0];
  },
  
  async getTransactionStats() {
    try {
      // Get successful transactions total amount and count
      const successfulTransactionsResult = await db.select({
        totalSpent: sql<number>`COALESCE(sum(${transactions.amount}), 0)`,
        transactionCount: sql<number>`count(*)`
      })
      .from(transactions)
      .where(eq(transactions.status, 'success'));
      
      if (!successfulTransactionsResult || successfulTransactionsResult.length === 0) {
        return {
          totalSpent: 0,
          transactionCount: 0
        };
      }
      
      const stats = successfulTransactionsResult[0];
      
      // Ensure proper type handling for totalSpent
      let totalSpent = 0;
      if (stats.totalSpent !== null && stats.totalSpent !== undefined) {
        const parsed = parseFloat(String(stats.totalSpent));
        if (!isNaN(parsed)) {
          totalSpent = parsed;
        }
      }
      
      // Ensure proper type handling for transactionCount
      let count = 0;
      if (stats.transactionCount !== null && stats.transactionCount !== undefined) {
        const parsed = parseInt(String(stats.transactionCount));
        if (!isNaN(parsed)) {
          count = parsed;
        }
      }
      
      return {
        totalSpent: totalSpent,
        transactionCount: count
      };
    } catch (error) {
      console.error('Error calculating transaction stats:', error);
      return {
        totalSpent: 0,
        transactionCount: 0
      };
    }
  },
  
  // Debt operations
  async getUserDebts(userId: number) {
    return db.query.debts.findMany({
      where: and(
        eq(debts.userId, userId),
        eq(debts.isPaid, false)
      ),
      orderBy: desc(debts.createdAt)
    });
  },
  
  async getDebtById(id: number) {
    return db.query.debts.findFirst({
      where: eq(debts.id, id)
    });
  },
  
  async createDebt(data: InsertDebt) {
    const result = await db.insert(debts).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return result[0];
  },
  
  async markDebtAsPaid(id: number) {
    const result = await db.update(debts)
      .set({ 
        isPaid: true, 
        status: 'paid',
        updatedAt: new Date() 
      })
      .where(eq(debts.id, id))
      .returning();
      
    return result[0];
  },
  
  // Wallet operations
  async getWalletTransactions(userId: number) {
    return db.query.walletTransactions.findMany({
      where: eq(walletTransactions.userId, userId),
      orderBy: desc(walletTransactions.createdAt)
    });
  },
  
  async createWalletTransaction(data: InsertWalletTransaction) {
    const result = await db.insert(walletTransactions).values({
      ...data,
      createdAt: new Date()
    }).returning();
    
    return result[0];
  },
  
  async updateWalletBalance(userId: number, amountChange: number) {
    // Get current user data
    const userData = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    // Calculate new balance
    const currentBalance = parseFloat(userData.walletBalance.toString());
    const newBalance = currentBalance + amountChange;
    
    // Update user's wallet balance
    const result = await db.update(users)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(users.id, userId))
      .returning();
      
    return result[0];
  },
  
  // User operations
  async getUserProfile() {
    // In a real app, we'd get this from the session
    // For now, query the first user
    const user = await db.query.users.findFirst();
    if (!user) {
      throw new Error('No user found');
    }
    return user;
  },
  
  async updateUserProfile(data: Partial<User>) {
    // In a real app, we'd get the user ID from the session
    const userId = 1;
    
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
      
    return result[0];
  }
};

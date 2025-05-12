import { db } from "./index";
import { meters, transactions, users, debts, walletTransactions } from "@shared/schema";
import { generateToken } from "../client/src/lib/utils";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Seed a demo user
    const existingUsers = await db.query.users.findMany();
    let userId = 1;
    
    if (existingUsers.length === 0) {
      console.log("Creating demo user...");
      const result = await db.insert(users).values({
        username: "demo_user",
        password: "password123", // In a real app, this would be hashed
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        address: "123 Main St, Anytown, USA",
        walletBalance: "150.00",
        createdAt: new Date()
      }).returning({ id: users.id });
      
      userId = result[0].id;
    } else {
      userId = existingUsers[0].id;
    }

    // Seed sample meters
    const existingMeters = await db.query.meters.findMany();
    if (existingMeters.length === 0) {
      console.log("Creating sample meters...");
      await db.insert(meters).values([
        {
          userId,
          meterNumber: "12345678901",
          nickname: "Home",
          address: "123 Main St, Anytown, USA",
          customerName: "John Doe",
          type: "STS",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId,
          meterNumber: "09876543210",
          nickname: "Office",
          address: "456 Business Ave, Anytown, USA",
          customerName: "John Doe",
          type: "STS",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId,
          meterNumber: "55555555555",
          nickname: "Shop",
          address: "789 Commerce Blvd, Anytown, USA",
          customerName: "John Doe",
          type: "STS",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }

    // Seed sample transactions
    const existingTransactions = await db.query.transactions.findMany();
    if (existingTransactions.length === 0) {
      console.log("Creating sample transactions...");
      
      // Create dates for transactions
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      await db.insert(transactions).values([
        {
          userId,
          meterNumber: "12345678901",
          amount: "20.00",
          total: "20.50",
          status: "success",
          paymentMethod: "card",
          token: generateToken(20),
          units: "44.5",
          transactionType: "recharge",
          createdAt: today
        },
        {
          userId,
          meterNumber: "09876543210",
          amount: "35.00",
          total: "35.50",
          status: "success",
          paymentMethod: "wallet",
          token: generateToken(20),
          units: "77.8",
          transactionType: "recharge",
          createdAt: yesterday
        },
        {
          userId,
          meterNumber: "12345678901",
          amount: "15.00",
          total: "15.50",
          status: "failed",
          paymentMethod: "card",
          token: null,
          transactionType: "recharge",
          createdAt: lastWeek
        },
        {
          userId,
          meterNumber: "55555555555",
          amount: "50.00",
          total: "50.50",
          status: "success",
          paymentMethod: "mobile",
          token: generateToken(20),
          units: "111.1",
          transactionType: "recharge",
          createdAt: lastWeek
        }
      ]);
    }

    // Seed sample debts
    const existingDebts = await db.query.debts.findMany();
    if (existingDebts.length === 0) {
      console.log("Creating sample debts...");
      
      // Create dates for debts
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await db.insert(debts).values([
        {
          userId,
          meterNumber: "12345678901",
          amount: "45.75",
          dueDate: nextMonth,
          description: "Unpaid bill for January",
          status: "pending",
          isPaid: false,
          createdAt: today,
          updatedAt: today
        },
        {
          userId,
          meterNumber: "09876543210",
          amount: "63.20",
          dueDate: nextMonth,
          description: "Unpaid bill for January",
          status: "pending",
          isPaid: false,
          createdAt: today,
          updatedAt: today
        }
      ]);
    }

    // Seed sample wallet transactions
    const existingWalletTransactions = await db.query.walletTransactions.findMany();
    if (existingWalletTransactions.length === 0) {
      console.log("Creating sample wallet transactions...");
      
      // Create dates for wallet transactions
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      await db.insert(walletTransactions).values([
        {
          userId,
          amount: "100.00",
          type: "deposit",
          description: "Initial deposit",
          reference: "DEP" + Math.floor(Math.random() * 1000000),
          createdAt: lastWeek
        },
        {
          userId,
          amount: "35.00",
          type: "payment",
          description: "Meter recharge - Office",
          reference: "PAY" + Math.floor(Math.random() * 1000000),
          createdAt: yesterday
        },
        {
          userId,
          amount: "50.00",
          type: "deposit",
          description: "Wallet top-up",
          reference: "DEP" + Math.floor(Math.random() * 1000000),
          createdAt: today
        }
      ]);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();

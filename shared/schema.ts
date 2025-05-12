import { pgTable, text, serial, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
  walletBalance: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Meters table
export const meters = pgTable("meters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  meterNumber: text("meter_number").notNull().unique(),
  nickname: text("nickname"),
  address: text("address"),
  customerName: text("customer_name"),
  type: text("type").default("STS").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertMeterSchema = createInsertSchema(meters).pick({
  userId: true,
  meterNumber: true,
  nickname: true,
  address: true,
  customerName: true,
  type: true,
  status: true,
});

export type InsertMeter = z.infer<typeof insertMeterSchema>;
export type Meter = typeof meters.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  meterNumber: text("meter_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("card"),
  token: text("token"),
  units: decimal("units", { precision: 10, scale: 2 }),
  receiptUrl: text("receipt_url"),
  transactionType: text("transaction_type").default("recharge").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  meterNumber: true,
  amount: true,
  total: true,
  status: true,
  paymentMethod: true,
  token: true,
  units: true,
  receiptUrl: true,
  transactionType: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Debts table
export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  meterNumber: text("meter_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").default("electricity").notNull(), // 'electricity', 'water', 'maintenance', 'trash', 'other'
  dueDate: timestamp("due_date").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertDebtSchema = createInsertSchema(debts).pick({
  userId: true,
  meterNumber: true,
  amount: true,
  category: true,
  dueDate: true,
  description: true,
  status: true,
  isPaid: true,
});

export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type Debt = typeof debts.$inferSelect;

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'payment'
  description: text("description"),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true,
  reference: true,
});

export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  meters: many(meters),
  transactions: many(transactions),
  debts: many(debts),
  walletTransactions: many(walletTransactions)
}));

export const metersRelations = relations(meters, ({ one, many }) => ({
  user: one(users, {
    fields: [meters.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  debts: many(debts)
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  meter: one(meters, {
    fields: [transactions.meterNumber],
    references: [meters.meterNumber],
  })
}));

export const debtsRelations = relations(debts, ({ one }) => ({
  user: one(users, {
    fields: [debts.userId],
    references: [users.id],
  }),
  meter: one(meters, {
    fields: [debts.meterNumber],
    references: [meters.meterNumber],
  })
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  })
}));

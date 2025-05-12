import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: number;
  meterNumber: string;
  meterNickname?: string;
  amount: number;
  status: string;
  token?: string;
  createdAt: string;
  type: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const TransactionCard = ({ transaction, onPress }: TransactionCardProps) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
  };

  // Get icon based on transaction type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return 'flash';
      case 'payment':
        return 'card';
      case 'wallet':
        return 'wallet';
      default:
        return 'document-text';
    }
  };

  // Get color based on transaction status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'pending':
        return '#f59e0b'; // amber
      case 'failed':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Get color based on transaction type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recharge':
        return '#3b82f6'; // blue
      case 'payment':
        return '#8b5cf6'; // purple
      case 'wallet':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  // Get background color based on transaction type (lighter shade)
  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'recharge':
        return '#eff6ff'; // light blue
      case 'payment':
        return '#f5f3ff'; // light purple
      case 'wallet':
        return '#ecfdf5'; // light green
      default:
        return '#f9fafb'; // light gray
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(transaction)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getTypeBgColor(transaction.type) },
        ]}
      >
        <Ionicons
          name={getTypeIcon(transaction.type)}
          size={22}
          color={getTypeColor(transaction.type)}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.meterName}>
            {transaction.meterNickname || transaction.meterNumber}
          </Text>
          <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(transaction.status) },
              ]}
            />
            <Text
              style={[
                styles.status,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TransactionCard;
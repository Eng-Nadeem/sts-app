import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatCurrency } from '../utils/formatters';

const mockWalletBalance = 175.00;

const PayDebtScreen = ({ route, navigation }) => {
  const { debt } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(mockWalletBalance);
  
  // Get category info
  const getCategoryInfo = (category) => {
    switch (category) {
      case 'electricity':
        return { 
          name: 'Electricity Bill', 
          icon: 'flash', 
          color: '#4f46e5',
          gradient: ['#4f46e5', '#4338ca']
        };
      case 'water':
        return { 
          name: 'Water Bill', 
          icon: 'water', 
          color: '#0ea5e9',
          gradient: ['#0ea5e9', '#0284c7']
        };
      case 'maintenance':
        return { 
          name: 'Maintenance Fee', 
          icon: 'hammer', 
          color: '#f59e0b',
          gradient: ['#f59e0b', '#d97706']
        };
      case 'trash':
        return { 
          name: 'Trash Collection', 
          icon: 'trash', 
          color: '#10b981',
          gradient: ['#10b981', '#059669']
        };
      default:
        return { 
          name: 'Bill Payment', 
          icon: 'file-tray', 
          color: '#6b7280',
          gradient: ['#6b7280', '#4b5563']
        };
    }
  };
  
  const categoryInfo = getCategoryInfo(debt.category);
  const remainingBalance = walletBalance - debt.amount;
  const dueDate = new Date(debt.dueDate);
  const isOverdue = dueDate < new Date();
  
  const handlePayNow = () => {
    if (walletBalance < debt.amount) {
      Alert.alert(
        'Insufficient Balance',
        `Your wallet balance is ${formatCurrency(walletBalance)} but you need ${formatCurrency(debt.amount)} to pay this debt.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Top Up Wallet',
            onPress: () => navigation.navigate('Wallet')
          }
        ]
      );
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update wallet balance
      setWalletBalance(prevBalance => prevBalance - debt.amount);
      setIsProcessing(false);
      
      navigation.navigate('SuccessScreen', {
        type: 'debt_payment',
        amount: debt.amount,
        category: categoryInfo.name,
        date: new Date().toISOString(),
      });
    }, 1500);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LinearGradient
          colors={categoryInfo.gradient}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={categoryInfo.icon} size={32} color="white" />
            </View>
            <Text style={styles.headerTitle}>{categoryInfo.name}</Text>
            <Text style={styles.headerMeter}>{debt.meterNickname}</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Meter Number</Text>
            <Text style={styles.detailValue}>
              {debt.meterNumber.slice(0, 5)}...{debt.meterNumber.slice(-4)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <View style={styles.categoryBadge}>
              <Ionicons name={categoryInfo.icon} size={14} color={categoryInfo.color} />
              <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                {debt.category.charAt(0).toUpperCase() + debt.category.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
              {dueDate.toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amount}>{formatCurrency(debt.amount)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.walletSection}>
            <View style={styles.walletRow}>
              <View style={styles.walletLabelContainer}>
                <Ionicons name="wallet-outline" size={16} color="#6b7280" />
                <Text style={styles.walletLabel}>Current Balance</Text>
              </View>
              <Text style={styles.walletBalance}>{formatCurrency(walletBalance)}</Text>
            </View>
            
            <View style={styles.walletRow}>
              <View style={styles.walletLabelContainer}>
                <Ionicons name="remove-circle-outline" size={16} color="#6b7280" />
                <Text style={styles.walletLabel}>Payment Amount</Text>
              </View>
              <Text style={styles.paymentAmount}>- {formatCurrency(debt.amount)}</Text>
            </View>
            
            <View style={styles.walletRow}>
              <View style={styles.walletLabelContainer}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#6b7280" />
                <Text style={styles.walletLabel}>Remaining Balance</Text>
              </View>
              <Text style={[
                styles.remainingBalance,
                remainingBalance < 0 && styles.negativeBalance
              ]}>
                {formatCurrency(remainingBalance)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayNow}
          disabled={isProcessing || walletBalance < debt.amount}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="card-outline" size={20} color="white" />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerContent: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerMeter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  overdueText: {
    color: '#ef4444',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  amountSection: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  walletSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  remainingBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  negativeBalance: {
    color: '#ef4444',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  payButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PayDebtScreen;
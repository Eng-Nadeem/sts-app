import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';

// Mock data for demonstration purposes (in a real app, this would come from an API)
const mockWalletBalance = 75.00;
const mockWalletTransactions = [
  {
    id: 1,
    amount: 50.00,
    type: 'deposit',
    status: 'completed',
    createdAt: new Date().toISOString(),
    description: 'Wallet top-up'
  },
  {
    id: 2,
    amount: 25.00,
    type: 'deposit',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    description: 'Wallet top-up'
  },
  {
    id: 3,
    amount: 100.00,
    type: 'withdrawal',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    description: 'Electricity purchase'
  }
];

const WalletScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(mockWalletBalance);
  const [walletTransactions, setWalletTransactions] = useState(mockWalletTransactions);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Predefined amounts
  const quickAmounts = [10, 20, 50, 100];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, you would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleTopUp = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to top up your wallet.');
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const amountNum = parseFloat(amount);
      
      // Update wallet balance
      setWalletBalance(prevBalance => prevBalance + amountNum);
      
      // Add transaction to list
      const newTransaction = {
        id: Date.now(),
        amount: amountNum,
        type: 'deposit',
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: 'Wallet top-up'
      };
      
      setWalletTransactions(prev => [newTransaction, ...prev]);
      
      // Reset form
      setAmount('');
      setIsProcessing(false);
      
      // Show success message
      Alert.alert(
        'Top-Up Successful',
        `Your wallet has been credited with ${formatCurrency(amountNum)}.`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  const handleQuickAmountPress = (value) => {
    setAmount(value.toString());
  };

  const getTransactionIcon = (type, status) => {
    if (status !== 'completed') {
      return { name: 'time', color: '#f59e0b' };
    }
    
    switch (type) {
      case 'deposit':
        return { name: 'arrow-down', color: '#10b981' };
      case 'withdrawal':
        return { name: 'arrow-up', color: '#ef4444' };
      default:
        return { name: 'swap-horizontal', color: '#6b7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Balance Card */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceCardContent}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(walletBalance)}</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Recharge')}
              >
                <Ionicons name="flash-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Buy Electricity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Top Up Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Up Wallet</Text>
          
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
          
          <View style={styles.quickAmounts}>
            {quickAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmountPress(value)}
              >
                <Text style={styles.quickAmountText}>${value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.topUpButton,
              (isProcessing || !amount) && styles.topUpButtonDisabled
            ]}
            onPress={handleTopUp}
            disabled={isProcessing || !amount}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.topUpButtonText}>Top Up Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : walletTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {walletTransactions.map((transaction) => {
                const icon = getTransactionIcon(transaction.type, transaction.status);
                const isDeposit = transaction.type === 'deposit';
                const date = new Date(transaction.createdAt);
                
                return (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={[
                      styles.transactionIconContainer,
                      { backgroundColor: `${icon.color}10` }
                    ]}>
                      <Ionicons name={icon.name} size={20} color={icon.color} />
                    </View>
                    
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionType}>
                        {isDeposit ? 'Top Up' : 'Withdrawal'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    
                    <Text style={[
                      styles.transactionAmount,
                      isDeposit ? styles.depositAmount : styles.withdrawalAmount
                    ]}>
                      {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  balanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceCardContent: {
    padding: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#6b7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 12,
    color: '#1f2937',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickAmountButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: '22%',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  topUpButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  topUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  depositAmount: {
    color: '#10b981',
  },
  withdrawalAmount: {
    color: '#ef4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default WalletScreen;
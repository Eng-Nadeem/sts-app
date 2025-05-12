import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/formatters';

// Mock data for demonstration purposes (in a real app, this would come from an API)
const mockDebts = [
  {
    id: 1,
    userId: 1,
    meterNumber: '12345678901',
    meterNickname: 'Home Meter',
    amount: 75.00,
    category: 'electricity',
    dueDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    meterNumber: '12345678901',
    meterNickname: 'Home Meter',
    amount: 35.00,
    category: 'water',
    dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    meterNumber: '98765432109',
    meterNickname: 'Office Meter',
    amount: 120.00,
    category: 'electricity',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago (overdue)
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    userId: 1,
    meterNumber: '98765432109',
    meterNickname: 'Office Meter',
    amount: 45.00,
    category: 'maintenance',
    dueDate: new Date(Date.now() + 1209600000).toISOString(), // 14 days from now
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    userId: 1,
    meterNumber: '12345678901',
    meterNickname: 'Home Meter',
    amount: 25.00,
    category: 'trash',
    dueDate: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    userId: 1,
    meterNumber: '12345678901',
    meterNickname: 'Home Meter',
    amount: 50.00,
    category: 'electricity',
    dueDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago (paid)
    isPaid: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

const mockWalletBalance = 175.00;

const DebtsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debts, setDebts] = useState(mockDebts);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'paid'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'electricity', 'water', etc.
  const [walletBalance, setWalletBalance] = useState(mockWalletBalance);

  // Get filtered debts
  const filteredDebts = debts.filter(debt => {
    const statusMatch = 
      filter === 'all' || 
      (filter === 'pending' && !debt.isPaid) || 
      (filter === 'paid' && debt.isPaid);
    
    const categoryMatch = 
      categoryFilter === 'all' || 
      debt.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  // Calculate total for pending debts
  const totalPendingDebt = debts
    .filter(debt => !debt.isPaid)
    .reduce((sum, debt) => sum + debt.amount, 0);

  // Check if wallet has enough balance to pay all debts
  const hasEnoughBalance = walletBalance >= totalPendingDebt;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, you would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handlePaySingle = (debt) => {
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

    // Navigate to payment confirmation screen
    navigation.navigate('PayDebt', { debt });
  };

  const handlePayAll = () => {
    if (!hasEnoughBalance) {
      Alert.alert(
        'Insufficient Balance',
        `Your wallet balance is ${formatCurrency(walletBalance)} but you need ${formatCurrency(totalPendingDebt)} to pay all debts.`,
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

    Alert.alert(
      'Pay All Debts',
      `Are you sure you want to pay all pending debts for a total of ${formatCurrency(totalPendingDebt)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay All',
          style: 'destructive',
          onPress: () => {
            // Simulate processing
            setIsLoading(true);
            setTimeout(() => {
              // Update debts status
              const updatedDebts = debts.map(debt => 
                debt.isPaid ? debt : { ...debt, isPaid: true }
              );
              setDebts(updatedDebts);
              
              // Deduct from wallet
              setWalletBalance(prev => prev - totalPendingDebt);
              
              setIsLoading(false);
              
              // Show success message
              Alert.alert(
                'Payment Successful',
                `All debts have been paid successfully. Total amount: ${formatCurrency(totalPendingDebt)}.`,
                [{ text: 'OK' }]
              );
            }, 1500);
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electricity':
        return { name: 'flash', color: '#4f46e5' };
      case 'water':
        return { name: 'water', color: '#0ea5e9' };
      case 'maintenance':
        return { name: 'hammer', color: '#f59e0b' };
      case 'trash':
        return { name: 'trash', color: '#10b981' };
      default:
        return { name: 'file-tray', color: '#6b7280' };
    }
  };

  const getStatusInfo = (debt) => {
    if (debt.isPaid) {
      return { label: 'Paid', color: '#10b981', icon: 'checkmark-circle' };
    }
    
    const dueDate = new Date(debt.dueDate);
    const now = new Date();
    
    if (dueDate < now) {
      return { label: 'Overdue', color: '#ef4444', icon: 'alert-circle' };
    }
    
    // Due in less than 3 days
    if ((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 3) {
      return { label: 'Due Soon', color: '#f59e0b', icon: 'time' };
    }
    
    return { label: 'Pending', color: '#6b7280', icon: 'calendar' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryCardContent}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryLabel}>Total Pending Debts</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totalPendingDebt)}</Text>
              </View>
              <View style={styles.walletIndicator}>
                <Ionicons name="wallet-outline" size={16} color="white" />
                <Text style={styles.walletText}>{formatCurrency(walletBalance)}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.payAllButton,
                (!hasEnoughBalance || totalPendingDebt === 0 || isLoading) && styles.payAllButtonDisabled
              ]}
              onPress={handlePayAll}
              disabled={!hasEnoughBalance || totalPendingDebt === 0 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="white" />
                  <Text style={styles.payAllButtonText}>Pay All Debts</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'paid' && styles.activeFilter]}
              onPress={() => setFilter('paid')}
            >
              <Text style={[styles.filterText, filter === 'paid' && styles.activeFilterText]}>
                Paid
              </Text>
            </TouchableOpacity>

            <View style={styles.filterDivider} />

            <TouchableOpacity
              style={[styles.filterButton, categoryFilter === 'all' && styles.activeFilter]}
              onPress={() => setCategoryFilter('all')}
            >
              <Text style={[styles.filterText, categoryFilter === 'all' && styles.activeFilterText]}>
                All Categories
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, categoryFilter === 'electricity' && styles.activeFilter]}
              onPress={() => setCategoryFilter('electricity')}
            >
              <Ionicons 
                name="flash" 
                size={14} 
                color={categoryFilter === 'electricity' ? 'white' : '#4f46e5'} 
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, categoryFilter === 'electricity' && styles.activeFilterText]}>
                Electricity
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, categoryFilter === 'water' && styles.activeFilter]}
              onPress={() => setCategoryFilter('water')}
            >
              <Ionicons 
                name="water" 
                size={14} 
                color={categoryFilter === 'water' ? 'white' : '#0ea5e9'} 
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, categoryFilter === 'water' && styles.activeFilterText]}>
                Water
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, categoryFilter === 'maintenance' && styles.activeFilter]}
              onPress={() => setCategoryFilter('maintenance')}
            >
              <Ionicons 
                name="hammer" 
                size={14} 
                color={categoryFilter === 'maintenance' ? 'white' : '#f59e0b'} 
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, categoryFilter === 'maintenance' && styles.activeFilterText]}>
                Maintenance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, categoryFilter === 'trash' && styles.activeFilter]}
              onPress={() => setCategoryFilter('trash')}
            >
              <Ionicons 
                name="trash" 
                size={14} 
                color={categoryFilter === 'trash' ? 'white' : '#10b981'} 
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, categoryFilter === 'trash' && styles.activeFilterText]}>
                Trash
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Debts List */}
        <View style={styles.debtsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text style={styles.loadingText}>Loading debts...</Text>
            </View>
          ) : filteredDebts.length > 0 ? (
            filteredDebts.map((debt) => {
              const category = getCategoryIcon(debt.category);
              const status = getStatusInfo(debt);
              const dueDate = new Date(debt.dueDate);
              
              return (
                <View key={debt.id} style={styles.debtCard}>
                  <View style={styles.debtHeader}>
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: `${category.color}10` }
                    ]}>
                      <Ionicons name={category.name} size={20} color={category.color} />
                    </View>
                    
                    <View style={styles.debtTitleContainer}>
                      <Text style={styles.debtTitle}>
                        {debt.category.charAt(0).toUpperCase() + debt.category.slice(1)} Bill
                      </Text>
                      <Text style={styles.debtMeter}>{debt.meterNickname}</Text>
                    </View>
                    
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: `${status.color}20` }
                    ]}>
                      <Ionicons name={status.icon} size={12} color={status.color} />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.debtDetails}>
                    <View style={styles.debtInfoItem}>
                      <Text style={styles.debtInfoLabel}>Amount Due</Text>
                      <Text style={styles.debtAmount}>{formatCurrency(debt.amount)}</Text>
                    </View>
                    
                    <View style={styles.debtInfoItem}>
                      <Text style={styles.debtInfoLabel}>Due Date</Text>
                      <Text style={styles.debtInfoValue}>
                        {dueDate.toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.debtInfoItem}>
                      <Text style={styles.debtInfoLabel}>Meter</Text>
                      <Text style={styles.debtInfoValue}>
                        {debt.meterNumber.slice(0, 5)}...{debt.meterNumber.slice(-4)}
                      </Text>
                    </View>
                  </View>
                  
                  {!debt.isPaid && (
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => handlePaySingle(debt)}
                    >
                      <Ionicons name="card-outline" size={16} color="white" />
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={40} color="#d1d5db" />
              {filter === 'pending' ? (
                <>
                  <Text style={styles.emptyText}>No pending debts</Text>
                  <Text style={styles.emptySubtext}>
                    You're all caught up! There are no pending debts to pay.
                  </Text>
                </>
              ) : filter === 'paid' ? (
                <>
                  <Text style={styles.emptyText}>No paid debts</Text>
                  <Text style={styles.emptySubtext}>
                    Your payment history will appear here once you've paid your debts.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyText}>No debts found</Text>
                  <Text style={styles.emptySubtext}>
                    There are no debts matching your current filters.
                  </Text>
                </>
              )}
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
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryCardContent: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  walletIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  walletText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  payAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  payAllButtonDisabled: {
    opacity: 0.5,
  },
  payAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filters: {
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#4f46e5',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  filterIcon: {
    marginRight: 4,
  },
  activeFilterText: {
    color: 'white',
  },
  filterDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  debtsContainer: {
    gap: 16,
  },
  debtCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  debtTitleContainer: {
    flex: 1,
  },
  debtTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  debtMeter: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  debtDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  debtInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  debtInfoLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  debtAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  debtInfoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginVertical: 8,
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
    paddingHorizontal: 16,
  },
});

export default DebtsScreen;
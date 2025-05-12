import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import API and components
import { useApi } from '../context/ApiContext';
import MeterCard from '../components/MeterCard';
import TransactionCard from '../components/TransactionCard';
import QuickActionButton from '../components/QuickActionButton';

// TypeScript interfaces
interface QuickActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color?: string[];
}

const DashboardScreen = () => {
  const navigation = useNavigation();
  const {
    meters,
    transactions,
    walletBalance,
    userProfile,
    debts,
    isLoadingMeters,
    isLoadingTransactions,
    isLoadingWallet,
    isLoadingProfile,
    isLoadingDebts,
    refreshAll,
  } = useApi();

  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  // Format numbers to currency
  const formatCurrency = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) return '$0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(numValue) ? `$${numValue.toFixed(2)}` : '$0.00';
  };

  // Navigate to meter recharge
  const handleMeterSelect = (meter) => {
    navigation.navigate('Recharge', { meter });
  };

  // Navigate to other screens
  const handleRechargePress = () => {
    if (meters.length > 0) {
      navigation.navigate('Recharge', { meter: meters[0] });
    } else {
      navigation.navigate('Meters');
    }
  };

  const handlePayDebtPress = () => {
    navigation.navigate('Debts');
  };

  const handleTopUpPress = () => {
    navigation.navigate('Wallet');
  };

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  const isLoading =
    isLoadingMeters ||
    isLoadingTransactions ||
    isLoadingWallet ||
    isLoadingProfile ||
    isLoadingDebts;

  // Calculate total debt amount
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with wallet balance */}
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Hello, {userProfile?.fullName || 'User'}
            </Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              {isLoadingWallet ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.balanceAmount}>
                  {formatCurrency(walletBalance)}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Quick actions section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <QuickActionButton
              icon="flash"
              title="Buy Electricity"
              description="Recharge your prepaid meter"
              onPress={handleRechargePress}
              color={['#f59e0b', '#d97706']}
            />
            <QuickActionButton
              icon="card"
              title="Pay Debts"
              description={`${debts.length} unpaid bills`}
              onPress={handlePayDebtPress}
              color={['#ef4444', '#b91c1c']}
            />
            <QuickActionButton
              icon="wallet"
              title="Top Up Wallet"
              description="Add funds to your wallet"
              onPress={handleTopUpPress}
              color={['#10b981', '#047857']}
            />
            <QuickActionButton
              icon="time"
              title="History"
              description="View your transactions"
              onPress={handleHistoryPress}
              color={['#8b5cf6', '#6d28d9']}
            />
          </View>
        </View>

        {/* Your meters section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Meters</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Meters')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {isLoadingMeters ? (
            <ActivityIndicator color="#3b82f6" style={styles.loader} />
          ) : meters.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flash-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No meters found</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Meters')}
              >
                <Text style={styles.addButtonText}>Add a Meter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            meters.slice(0, 2).map((meter) => (
              <MeterCard
                key={meter.id}
                meter={meter}
                onSelect={handleMeterSelect}
              />
            ))
          )}
        </View>

        {/* Recent transactions section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={handleHistoryPress}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {isLoadingTransactions ? (
            <ActivityIndicator color="#3b82f6" style={styles.loader} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 3).map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() => {}}
              />
            ))
          )}
        </View>

        {/* Debt summary section (if there are debts) */}
        {debts.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.debtSummary}
              onPress={handlePayDebtPress}
            >
              <View style={styles.debtSummaryContent}>
                <View style={styles.debtIconContainer}>
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                </View>
                <View style={styles.debtTextContainer}>
                  <Text style={styles.debtTitle}>Outstanding Debts</Text>
                  <Text style={styles.debtDescription}>
                    You have {debts.length} unpaid bills totaling{' '}
                    {formatCurrency(totalDebtAmount)}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#ef4444"
                style={styles.debtArrow}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  balanceContainer: {
    width: '100%',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    marginRight: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  loader: {
    marginVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  debtSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  debtSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtIconContainer: {
    marginRight: 12,
  },
  debtTextContainer: {
    flex: 1,
  },
  debtTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c',
    marginBottom: 4,
  },
  debtDescription: {
    fontSize: 14,
    color: '#ef4444',
  },
  debtArrow: {
    marginLeft: 8,
  },
});

export default DashboardScreen;
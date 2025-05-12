import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApi } from '../context/ApiContext';

// Transaction history component for mobile app
const HistoryScreen = () => {
  const navigation = useNavigation();
  const { transactionsApi } = useApi();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await transactionsApi.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch transaction history');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = (filter) => {
    setActiveFilter(filter);
    setIsLoading(true);
    
    try {
      switch (filter) {
        case 'recharge':
          transactionsApi.getTransactionsByType('recharge').then(data => {
            setTransactions(data);
            setIsLoading(false);
          });
          break;
        case 'payment':
          transactionsApi.getTransactionsByType('payment').then(data => {
            setTransactions(data);
            setIsLoading(false);
          });
          break;
        case 'debt':
          transactionsApi.getTransactionsByType('debt_payment').then(data => {
            setTransactions(data);
            setIsLoading(false);
          });
          break;
        case 'all':
        default:
          transactionsApi.getAllTransactions().then(data => {
            setTransactions(data);
            setIsLoading(false);
          });
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to filter transactions');
      console.error(error);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'N/A';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'recharge':
        return 'flash-outline';
      case 'payment':
        return 'card-outline';
      case 'debt_payment':
        return 'receipt-outline';
      case 'wallet':
        return 'wallet-outline';
      default:
        return 'document-text-outline';
    }
  };

  const getTransactionStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return '#16A34A';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => {
        // Navigate to transaction details in future
      }}
    >
      <View style={styles.transactionIconContainer}>
        <Ionicons
          name={getTransactionTypeIcon(item.type || item.transactionType)}
          size={24}
          color="#3B82F6"
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionType}>
          {item.type === 'recharge' ? 'Meter Recharge' : 
           item.type === 'payment' ? 'Payment' :
           item.type === 'debt_payment' ? 'Debt Payment' :
           item.transactionType === 'recharge' ? 'Meter Recharge' :
           item.transactionType === 'payment' ? 'Payment' :
           item.transactionType === 'debt_payment' ? 'Debt Payment' :
           'Transaction'}
        </Text>
        
        <Text style={styles.transactionMeter}>
          {item.meterNumber ? `Meter: ${item.meterNumber}` : ''}
        </Text>
        
        <Text style={styles.transactionDate}>
          {formatDate(item.createdAt || item.timestamp)}
        </Text>
      </View>
      
      <View style={styles.transactionAmountContainer}>
        <Text style={styles.transactionAmount}>
          ${typeof item.amount === 'number' || typeof item.amount === 'string' 
            ? parseFloat(item.amount.toString()).toFixed(2) 
            : '0.00'}
        </Text>
        
        <Text
          style={[
            styles.transactionStatus,
            { color: getTransactionStatusColor(item.status) }
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={80} color="#CBD5E1" />
      <Text style={styles.emptyStateTitle}>No Transactions</Text>
      <Text style={styles.emptyStateDescription}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} /> {/* Empty view for flex spacing */}
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => filterTransactions('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'all' && styles.activeFilterButtonText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'recharge' && styles.activeFilterButton
            ]}
            onPress={() => filterTransactions('recharge')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'recharge' && styles.activeFilterButtonText
              ]}
            >
              Recharges
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'payment' && styles.activeFilterButton
            ]}
            onPress={() => filterTransactions('payment')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'payment' && styles.activeFilterButtonText
              ]}
            >
              Payments
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'debt' && styles.activeFilterButton
            ]}
            onPress={() => filterTransactions('debt')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'debt' && styles.activeFilterButtonText
              ]}
            >
              Debt Payments
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  transactionMeter: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  transactionAmountContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default HistoryScreen;
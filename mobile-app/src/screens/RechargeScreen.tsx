import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApi } from '../context/ApiContext';

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
  { id: 'wallet', name: 'Wallet Balance', icon: 'wallet-outline' },
  { id: 'mobile', name: 'Mobile Money', icon: 'phone-portrait-outline' }
];

const predefinedAmounts = [10, 20, 50, 100, 200];

const RechargeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { metersApi, transactionsApi, walletApi } = useApi();
  const [meter, setMeter] = useState(route.params?.meter || null);
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!meter) {
      // If no meter was passed, go back
      Alert.alert('Error', 'No meter selected');
      navigation.goBack();
    }
    
    fetchWalletBalance();
  }, [meter]);

  const fetchWalletBalance = async () => {
    try {
      const data = await walletApi.getWalletBalance();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const validateAmount = (value) => {
    setError('');
    
    if (!value || parseFloat(value) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (selectedPaymentMethod === 'wallet' && parseFloat(value) > walletBalance) {
      setError('Insufficient wallet balance');
      return false;
    }
    
    return true;
  };

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
    setIsCustomAmount(false);
    setError('');
  };

  const handleCustomAmountChange = (text) => {
    // Allow only numbers and decimals
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      setAmount(text);
      setError('');
    }
  };

  const handleContinue = async () => {
    if (!validateAmount(amount)) return;
    
    // If wallet payment, check balance
    if (selectedPaymentMethod === 'wallet' && parseFloat(amount) > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create transaction object
      const transactionData = {
        meterNumber: meter.meterNumber,
        amount: parseFloat(amount),
        total: parseFloat(amount),
        paymentMethod: selectedPaymentMethod,
        transactionType: 'recharge'
      };
      
      // Navigate to payment confirmation screen
      navigation.navigate('PaymentConfirmation', {
        transactionData,
        meter,
        returnTo: 'Dashboard'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process recharge request');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!meter) {
    return null; // Prevent rendering if no meter (will redirect in useEffect)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recharge Meter</Text>
        <View style={{ width: 40 }} /> {/* Empty view for flex spacing */}
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.meterInfoContainer}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.meterCard}
          >
            <View style={styles.meterCardContent}>
              <Text style={styles.meterLabel}>Meter Number</Text>
              <Text style={styles.meterNumber}>{meter.meterNumber}</Text>
              {meter.nickname && (
                <Text style={styles.meterNickname}>{meter.nickname}</Text>
              )}
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          
          <View style={styles.amountOptionsContainer}>
            {predefinedAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.amountOption,
                  parseFloat(amount) === value && !isCustomAmount && styles.selectedAmountOption
                ]}
                onPress={() => handleAmountSelect(value)}
              >
                <Text 
                  style={[
                    styles.amountOptionText,
                    parseFloat(amount) === value && !isCustomAmount && styles.selectedAmountOptionText
                  ]}
                >
                  ${value}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[
                styles.amountOption,
                isCustomAmount && styles.selectedAmountOption
              ]}
              onPress={() => setIsCustomAmount(true)}
            >
              <Text 
                style={[
                  styles.amountOptionText,
                  isCustomAmount && styles.selectedAmountOptionText
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          
          {isCustomAmount && (
            <View style={styles.customAmountContainer}>
              <Text style={styles.customAmountLabel}>Enter amount:</Text>
              <View style={styles.customAmountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.customAmountInput}
                  value={amount}
                  onChangeText={handleCustomAmountChange}
                  keyboardType="numeric"
                  placeholder="0.00"
                  autoFocus
                />
              </View>
            </View>
          )}
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodOption,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethodOption
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={selectedPaymentMethod === method.id ? "#3B82F6" : "#64748B"}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                  ]}
                >
                  {method.name}
                </Text>
                {method.id === 'wallet' && (
                  <Text style={styles.walletBalanceText}>
                    Balance: ${typeof walletBalance === 'number' ? walletBalance.toFixed(2) : '0.00'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.estimatedUnitsContainer}>
          <Text style={styles.estimatedUnitsLabel}>Estimated Units:</Text>
          <Text style={styles.estimatedUnitsValue}>
            {amount && !isNaN(parseFloat(amount)) 
              ? `~${(parseFloat(amount || '0') / 0.45).toFixed(2)} kWh` 
              : '0.00 kWh'}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isLoading || !amount || error !== ''}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue to Payment</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  meterInfoContainer: {
    marginBottom: 24,
  },
  meterCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  meterCardContent: {
    alignItems: 'center',
  },
  meterLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  meterNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  meterNickname: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
  },
  amountOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountOption: {
    width: '30%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedAmountOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  amountOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedAmountOptionText: {
    color: '#3B82F6',
  },
  customAmountContainer: {
    marginTop: 8,
  },
  customAmountLabel: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  customAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#64748B',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
  paymentMethodsContainer: {
    marginBottom: 16,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPaymentMethodOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 12,
  },
  selectedPaymentMethodText: {
    color: '#3B82F6',
  },
  walletBalanceText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 'auto',
  },
  estimatedUnitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
  },
  estimatedUnitsLabel: {
    fontSize: 16,
    color: '#475569',
  },
  estimatedUnitsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginLeft: 'auto',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RechargeScreen;
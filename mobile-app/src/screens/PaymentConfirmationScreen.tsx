import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApi } from '../context/ApiContext';

const PaymentConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionsApi } = useApi();
  const { transactionData, meter, returnTo } = route.params;
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Split into groups of 4
    const formatted = cleaned.match(/.{1,4}/g);
    // Join with spaces
    return formatted ? formatted.join(' ') : '';
  };

  const formatExpiryDate = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Insert slash after month
    if (cleaned.length > 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    if (transactionData.paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      if (!expiryDate || expiryDate.length < 5) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      } else {
        const [month, year] = expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (
          parseInt(year) < currentYear ||
          (parseInt(year) === currentYear && parseInt(month) < currentMonth) ||
          parseInt(month) < 1 ||
          parseInt(month) > 12
        ) {
          newErrors.expiryDate = 'Card has expired or date is invalid';
        }
      }

      if (!cvv || cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }

      if (!cardholderName) {
        newErrors.cardholderName = 'Please enter the cardholder name';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (transactionData.paymentMethod === 'card' && !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, simulate payment processing
      const response = await transactionsApi.createTransaction(transactionData);
      
      // Navigate to processing screen
      navigation.navigate('Processing', {
        transaction: response,
        returnTo
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };

  const renderCardForm = () => (
    <View style={styles.cardFormContainer}>
      <Text style={styles.sectionTitle}>Card Details</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={[styles.input, errors.cardNumber && styles.inputError]}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => {
            const formatted = formatCardNumber(text);
            if (formatted.length <= 19) { // 16 digits + 3 spaces
              setCardNumber(formatted);
            }
          }}
          keyboardType="number-pad"
          maxLength={19}
        />
        {errors.cardNumber && (
          <Text style={styles.errorText}>{errors.cardNumber}</Text>
        )}
      </View>
      
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={[styles.input, errors.expiryDate && styles.inputError]}
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={(text) => {
              const formatted = formatExpiryDate(text);
              if (formatted.length <= 5) {
                setExpiryDate(formatted);
              }
            }}
            keyboardType="number-pad"
            maxLength={5}
          />
          {errors.expiryDate && (
            <Text style={styles.errorText}>{errors.expiryDate}</Text>
          )}
        </View>
        
        <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[styles.input, errors.cvv && styles.inputError]}
            placeholder="123"
            value={cvv}
            onChangeText={(text) => {
              if (/^\d*$/.test(text) && text.length <= 4) {
                setCvv(text);
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
          {errors.cvv && (
            <Text style={styles.errorText}>{errors.cvv}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={[styles.input, errors.cardholderName && styles.inputError]}
          placeholder="John Doe"
          value={cardholderName}
          onChangeText={setCardholderName}
        />
        {errors.cardholderName && (
          <Text style={styles.errorText}>{errors.cardholderName}</Text>
        )}
      </View>
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
        <Text style={styles.headerTitle}>Payment Confirmation</Text>
        <View style={{ width: 40 }} /> {/* Empty view for flex spacing */}
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content}>
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Transaction Summary</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Meter Number</Text>
              <Text style={styles.summaryValue}>{meter.meterNumber}</Text>
            </View>
            
            {meter.nickname && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Meter Nickname</Text>
                <Text style={styles.summaryValue}>{meter.nickname}</Text>
              </View>
            )}
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>${transactionData?.amount ? parseFloat(transactionData.amount.toString()).toFixed(2) : '0.00'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Transaction Type</Text>
              <Text style={styles.summaryValue}>
                {transactionData.transactionType === 'recharge' ? 'Meter Recharge' : 
                 transactionData.transactionType === 'debt_payment' ? 'Debt Payment' : 
                 'Payment'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>
                {transactionData.paymentMethod === 'card' ? 'Credit/Debit Card' :
                 transactionData.paymentMethod === 'wallet' ? 'Wallet Balance' :
                 transactionData.paymentMethod === 'mobile' ? 'Mobile Money' :
                 'Other'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Estimated Units</Text>
              <Text style={styles.summaryValue}>
                ~{transactionData?.amount 
                  ? (parseFloat(transactionData.amount.toString()) / 0.45).toFixed(2) 
                  : '0.00'} kWh
              </Text>
            </View>
          </View>
          
          {transactionData.paymentMethod === 'card' && renderCardForm()}
          
          <View style={styles.noticeContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <Text style={styles.noticeText}>
              By proceeding, you agree to our terms and payment policies.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                Pay ${transactionData?.amount ? parseFloat(transactionData.amount.toString()).toFixed(2) : '0.00'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
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
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  cardFormContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  noticeText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  payButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default PaymentConfirmationScreen;
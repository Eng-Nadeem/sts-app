import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface SuccessScreenProps {
  route: {
    params: {
      title?: string;
      message?: string;
      amount?: number;
      meterNumber?: string;
      token?: string;
      type?: 'recharge' | 'payment' | 'wallet';
    };
  };
}

const SuccessScreen = ({ route }: SuccessScreenProps) => {
  const navigation = useNavigation();
  const {
    title = 'Success!',
    message = 'Your transaction was completed successfully.',
    amount = 0,
    meterNumber = '',
    token = '',
    type = 'recharge',
  } = route.params || {};

  // Animation values
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  // Format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  // Get color based on transaction type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recharge':
        return ['#3b82f6', '#1d4ed8']; // blue
      case 'payment':
        return ['#8b5cf6', '#6d28d9']; // purple
      case 'wallet':
        return ['#10b981', '#047857']; // green
      default:
        return ['#3b82f6', '#1d4ed8']; // blue
    }
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
        return 'checkmark-circle';
    }
  };

  // Run animations on component mount
  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // First, animate the circle
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Then, animate the checkmark
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Then, animate the details
      Animated.timing(detailsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Finally, animate the buttons
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Configure animations
  const circleAnimatedStyle = {
    transform: [
      {
        scale: circleScale.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };

  const checkmarkAnimatedStyle = {
    transform: [
      {
        scale: checkmarkScale,
      },
    ],
    opacity: checkmarkScale,
  };

  // Handle continue button press
  const handleContinue = () => {
    navigation.navigate('Home');
  };

  return (
    <LinearGradient
      colors={getTypeColor(type)}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Animated success circle */}
          <View style={styles.animationContainer}>
            <Animated.View style={[styles.circle, circleAnimatedStyle]}>
              <Animated.View style={checkmarkAnimatedStyle}>
                <Ionicons name="checkmark" size={80} color="white" />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Success message */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Transaction details */}
          <Animated.View style={[styles.detailsCard, { opacity: detailsOpacity }]}>
            {/* Amount */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Meter number (if applicable) */}
            {meterNumber ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Meter Number</Text>
                  <Text style={styles.detailValue}>{meterNumber}</Text>
                </View>
                <View style={styles.divider} />
              </>
            ) : null}

            {/* Token (if applicable) */}
            {token ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Token</Text>
                  <View style={styles.tokenContainer}>
                    <Text style={styles.tokenValue}>{token}</Text>
                    <TouchableOpacity style={styles.copyButton}>
                      <Ionicons name="copy-outline" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            ) : null}

            {/* Date */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: buttonsOpacity }]}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={18} color="white" />
              <Text style={styles.shareButtonText}>Share Receipt</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  animationContainer: {
    marginBottom: 32,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    width: '100%',
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 1,
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default SuccessScreen;
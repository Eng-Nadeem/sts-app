import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApi } from '../context/ApiContext';

const ProcessingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionsApi } = useApi();
  const { transaction, returnTo } = route.params;
  
  const [loadingStage, setLoadingStage] = useState(1);
  const [processingComplete, setProcessingComplete] = useState(false);
  const spinValue = new Animated.Value(0);

  // For animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);

  // For simulating processing stages
  useEffect(() => {
    const stages = [
      { stage: 1, delay: 1000 },
      { stage: 2, delay: 2000 },
      { stage: 3, delay: 1500 },
      { stage: 4, delay: 1000 }
    ];
    
    let timeout;
    
    const simulateProcessing = (index) => {
      if (index < stages.length) {
        timeout = setTimeout(() => {
          setLoadingStage(stages[index].stage);
          simulateProcessing(index + 1);
        }, stages[index].delay);
      } else {
        // Processing complete
        setProcessingComplete(true);
        navigateToSuccess();
      }
    };
    
    simulateProcessing(0);
    
    return () => clearTimeout(timeout);
  }, []);

  // Spin animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const navigateToSuccess = () => {
    // Allow a bit of time to see the 'Payment Successful' text
    setTimeout(() => {
      navigation.navigate('Success', {
        transaction,
        returnTo
      });
    }, 1000);
  };

  const getStageMessage = () => {
    switch (loadingStage) {
      case 1:
        return 'Initializing payment...';
      case 2:
        return 'Processing transaction...';
      case 3:
        return 'Verifying payment...';
      case 4:
        return 'Generating token...';
      default:
        return 'Processing...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!processingComplete ? (
          <>
            <Animated.View
              style={{
                transform: [{ rotate: spin }],
                marginBottom: 24
              }}
            >
              <Ionicons name="sync" size={80} color="#3B82F6" />
            </Animated.View>
            
            <Text style={styles.title}>Processing Payment</Text>
            <Text style={styles.message}>{getStageMessage()}</Text>
            
            <View style={styles.stagesContainer}>
              {[1, 2, 3, 4].map((stage) => (
                <View
                  key={stage}
                  style={[
                    styles.stageIndicator,
                    loadingStage >= stage && styles.activeStageIndicator
                  ]}
                />
              ))}
            </View>
            
            <Text style={styles.infoText}>
              Please do not close the app or navigate away from this screen.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#16A34A" />
            </View>
            
            <Text style={styles.title}>Payment Successful</Text>
            <Text style={styles.message}>Your payment has been processed successfully.</Text>
            
            <ActivityIndicator size="small" color="#3B82F6" style={{ marginTop: 24 }} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },
  activeStageIndicator: {
    backgroundColor: '#3B82F6',
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: '80%',
  },
  successIconContainer: {
    marginBottom: 24,
  },
});

export default ProcessingScreen;
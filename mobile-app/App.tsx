import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// API Provider
import { ApiProvider } from './src/context/ApiContext';
import { NotificationProvider } from './src/context/NotificationContext';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import WalletScreen from './src/screens/WalletScreen';
import MetersScreen from './src/screens/MetersScreen';
import DebtsScreen from './src/screens/DebtsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RechargeScreen from './src/screens/RechargeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PayDebtScreen from './src/screens/PayDebtScreen';
import PaymentConfirmationScreen from './src/screens/PaymentConfirmationScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import NotificationCenterScreen from './src/screens/NotificationCenter/NotificationCenterScreen';

// Import notification components
import NotificationBell from './src/components/notifications/NotificationBell';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab navigator
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Meters') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Debts') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Meters" component={MetersScreen} />
      <Tab.Screen name="Debts" component={DebtsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main app with navigation
export default function App() {
  return (
    <SafeAreaProvider>
      <ApiProvider>
        <NotificationProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Home" component={HomeTabs} />
              <Stack.Screen name="Recharge" component={RechargeScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="PayDebt" component={PayDebtScreen} />
              <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
              <Stack.Screen name="Processing" component={ProcessingScreen} />
              <Stack.Screen name="Success" component={SuccessScreen} />
              <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </ApiProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
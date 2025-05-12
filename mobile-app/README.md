# Prepaid Meter Mobile App

A React Native mobile application built with Expo for managing prepaid electricity meters, electricity purchases, bill payments, and wallet management.

## Features

- Dashboard with quick access to key features
- Electricity meter management (add, edit, view meters)
- Electricity recharge functionality
- Virtual wallet with top-up capability
- Debt tracking and payment
- Transaction history
- User profile management
- Animated success screens

## Tech Stack

- **React Native**: Core framework for building the mobile app
- **Expo**: Development platform for React Native
- **React Navigation**: Navigation between screens
- **Expo Linear Gradient**: For gradient UI elements
- **Expo Icons**: Ionicons for the UI
- **React Native Animated**: For smooth animations
- **TypeScript**: For type safety

## Installation

1. Install dependencies:
```
npm install
```

2. Start the Expo development server:
```
npm start
```

3. Use the Expo Go app on your mobile device or an emulator to view the application.

## App Structure

The app follows a clean, modular architecture:

### Navigation
- Bottom tab navigation for main sections (Dashboard, Wallet, Meters, Debts, Profile)
- Stack navigation for drill-down flows

### Screens
- **DashboardScreen**: Home screen with overview and quick actions
- **WalletScreen**: Manage wallet balance and view wallet transactions
- **MetersScreen**: View and manage electricity meters
- **DebtsScreen**: View and pay outstanding debts
- **RechargeScreen**: Purchase electricity for a meter
- **SuccessScreen**: Animated confirmation screen

### Components
- **MeterCard**: Reusable component for displaying meter information
- **TransactionCard**: Reusable component for displaying transaction information
- **QuickActionButton**: Gradient button with icon for dashboard actions

### Services
- **API Services**: Centralized API communication with error handling
- **Context Provider**: Global state management for app data

## Mobile-Specific Features

- Pull-to-refresh functionality for data updates
- Touch feedback with active states on buttons
- Native animations for smooth transitions
- Proper keyboard handling for form inputs
- Platform-specific styling (iOS/Android differences)
- Gradient elements using Expo LinearGradient
- Mobile-friendly forms and inputs

## Design Considerations

- Limited to 2 color gradients per element for visual consistency
- Clear action hierarchy with prominent CTAs
- Mobile-optimized typography and spacing
- Consistent iconography using Ionicons
- Proper error and empty states
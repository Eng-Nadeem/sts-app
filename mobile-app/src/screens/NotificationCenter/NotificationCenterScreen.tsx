import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  RefreshControl,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import NotificationList from '../../components/notifications/NotificationList';
import { Notification } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import NotificationSettingsList from './NotificationSettingsList';
import ScheduledNotificationsScreen from './ScheduledNotificationsScreen';

const { height } = Dimensions.get('window');

enum Tab {
  All = 'all',
  Scheduled = 'scheduled',
  Settings = 'settings',
}

const NotificationCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshNotifications, markAsRead, simulateNotification } = useNotifications();
  
  // Get initial tab from route params or default to All
  const initialTab = route.params?.initialTab || Tab.All;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Animated values for tab indicator
  const tabIndicatorPosition = useRef(new Animated.Value(
    initialTab === Tab.All ? 0 : initialTab === Tab.Scheduled ? 1 : 2
  )).current;
  
  // Update tab indicator when activeTab changes
  useEffect(() => {
    let toValue = 0;
    if (activeTab === Tab.Scheduled) toValue = 1;
    if (activeTab === Tab.Settings) toValue = 2;
    
    Animated.timing(tabIndicatorPosition, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);
  
  // Handle tab change
  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
  };
  
  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    setSelectedNotification(notification);
    setModalVisible(true);
    
    // Handle navigation based on notification type or data
    // This will depend on your app's navigation structure
    
    // Example:
    // if (notification.type === 'debt_due' && notification.data?.debtId) {
    //   navigation.navigate('PayDebt', { debtId: notification.data.debtId });
    // }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };
  
  // Calculate tab indicator position
  const tabIndicatorLeft = tabIndicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0%', '33.33%', '66.66%'],
  });
  
  // Test notification (development only)
  const handleTestNotification = () => {
    simulateNotification('payment_reminder');
    simulateNotification('low_balance', 'Wallet Balance Low', 'Your wallet balance is below $10. Consider adding funds to avoid service interruption.');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        {__DEV__ && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === Tab.All && styles.activeTab]}
          onPress={() => handleTabPress(Tab.All)}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={activeTab === Tab.All ? '#3b82f6' : '#6b7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === Tab.All && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === Tab.Scheduled && styles.activeTab]}
          onPress={() => handleTabPress(Tab.Scheduled)}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={activeTab === Tab.Scheduled ? '#3b82f6' : '#6b7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === Tab.Scheduled && styles.activeTabText,
            ]}
          >
            Scheduled
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === Tab.Settings && styles.activeTab]}
          onPress={() => handleTabPress(Tab.Settings)}
        >
          <Ionicons
            name="settings-outline"
            size={18}
            color={activeTab === Tab.Settings ? '#3b82f6' : '#6b7280'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === Tab.Settings && styles.activeTabText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              left: tabIndicatorLeft,
              width: '33.33%',
            },
          ]}
        />
      </View>
      
      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === Tab.All ? (
          <NotificationList
            onNotificationPress={handleNotificationPress}
          />
        ) : activeTab === Tab.Scheduled ? (
          <ScheduledNotificationsScreen />
        ) : (
          <NotificationSettingsList />
        )}
      </View>
      
      {/* Notification Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedNotification?.title}
              </Text>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                {selectedNotification?.body}
              </Text>
              
              {/* Additional content based on notification type could go here */}
            </View>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginRight: 40, // To balance with the back button
  },
  testButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {},
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#3b82f6',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  modalButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default NotificationCenterScreen;
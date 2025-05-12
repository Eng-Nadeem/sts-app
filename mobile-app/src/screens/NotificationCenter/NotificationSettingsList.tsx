import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationSetting } from '../../services/notificationService';

const NotificationSettingItem = ({
  setting,
  onToggle,
  onDelete,
}: {
  setting: NotificationSetting;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(setting.type) }]}>
          <Ionicons name={getTypeIcon(setting.type)} size={20} color="white" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{setting.name}</Text>
          <Text style={styles.settingDescription}>{getTypeDescription(setting.type)}</Text>
        </View>
      </View>
      <View style={styles.settingActions}>
        <Switch
          value={setting.enabled}
          onValueChange={() => onToggle(setting.id)}
          trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
          thumbColor={setting.enabled ? '#3b82f6' : '#9ca3af'}
        />
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(setting.id)}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Get notification type icon
const getTypeIcon = (type: string): any => {
  switch (type) {
    case 'low_balance':
      return 'wallet-outline';
    case 'payment_reminder':
      return 'calendar-outline';
    case 'consumption_alert':
      return 'flash-outline';
    case 'meter_recharge':
      return 'battery-charging-outline';
    case 'price_update':
      return 'pricetag-outline';
    case 'service_outage':
      return 'construct-outline';
    case 'system':
      return 'cog-outline';
    default:
      return 'notifications-outline';
  }
};

// Get notification type color
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'low_balance':
      return '#f59e0b'; // Amber
    case 'payment_reminder':
      return '#ef4444'; // Red
    case 'consumption_alert':
      return '#3b82f6'; // Blue
    case 'meter_recharge':
      return '#10b981'; // Green
    case 'price_update':
      return '#8b5cf6'; // Purple
    case 'service_outage':
      return '#f97316'; // Orange
    case 'system':
      return '#6b7280'; // Gray
    default:
      return '#3b82f6'; // Default blue
  }
};

// Get notification type description
const getTypeDescription = (type: string): string => {
  switch (type) {
    case 'low_balance':
      return 'Alerts about low wallet balance';
    case 'payment_reminder':
      return 'Reminders about upcoming payments';
    case 'consumption_alert':
      return 'Updates about energy consumption patterns';
    case 'meter_recharge':
      return 'Alerts about meter recharge needs';
    case 'price_update':
      return 'Updates about electricity price changes';
    case 'service_outage':
      return 'Information about service outages';
    case 'system':
      return 'System notifications';
    default:
      return 'General notifications';
  }
};

const NotificationSettingsList: React.FC = () => {
  const { 
    notificationSettings, 
    loadNotificationSettings, 
    toggleNotificationSetting,
    deleteNotificationSetting,
    createDefaultSettings
  } = useNotifications();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      await loadNotificationSettings();
      setIsLoading(false);
    };
    
    loadSettings();
  }, []);
  
  // Handle toggle notification setting
  const handleToggleSetting = async (id: string) => {
    await toggleNotificationSetting(id);
  };
  
  // Handle delete notification setting
  const handleDeleteSetting = (id: string) => {
    Alert.alert(
      'Delete Notification Setting',
      'Are you sure you want to delete this notification setting? You will no longer receive these types of notifications.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNotificationSetting(id);
          },
        },
      ]
    );
  };
  
  // Handle reset to defaults
  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to their default values? This will enable all standard notifications.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'default',
          onPress: async () => {
            await createDefaultSettings();
          },
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#3b82f6" />
      ) : (
        <>
          <ScrollView style={styles.settingsList} contentContainerStyle={styles.settingsListContent}>
            {notificationSettings.length > 0 ? (
              notificationSettings.map(setting => (
                <NotificationSettingItem
                  key={setting.id}
                  setting={setting}
                  onToggle={handleToggleSetting}
                  onDelete={handleDeleteSetting}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Notification Settings</Text>
                <Text style={styles.emptyText}>
                  You don't have any notification settings configured. Tap the button below to create default settings.
                </Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetToDefaults}
          >
            <Ionicons name="refresh" size={18} color="white" />
            <Text style={styles.resetButtonText}>Reset to Default Settings</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loader: {
    marginTop: 32,
  },
  settingsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingsListContent: {
    paddingTop: 16,
    paddingBottom: 80, // Space for reset button
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default NotificationSettingsList;
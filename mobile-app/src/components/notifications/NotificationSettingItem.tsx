import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationSetting, NotificationType } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationSettingItemProps {
  setting: NotificationSetting;
}

const NotificationSettingItem: React.FC<NotificationSettingItemProps> = ({ setting }) => {
  const { updateSetting } = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const [localThreshold, setLocalThreshold] = useState(
    setting.threshold ? setting.threshold.toString() : ''
  );
  const [localTiming, setLocalTiming] = useState(
    setting.timing ? setting.timing.toString() : ''
  );

  // Get icon based on notification type
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment_reminder':
        return 'calendar';
      case 'low_balance':
        return 'wallet';
      case 'meter_recharge':
        return 'flash';
      case 'debt_due':
        return 'card';
      case 'price_update':
        return 'pricetag';
      case 'service_outage':
        return 'warning';
      case 'consumption_alert':
        return 'pulse';
      default:
        return 'notifications';
    }
  };

  // Handle toggle switch
  const handleToggle = async (value: boolean) => {
    await updateSetting(setting.type, { enabled: value });
  };

  // Handle threshold change
  const handleThresholdChange = async (value: string) => {
    setLocalThreshold(value);
  };

  // Handle timing change
  const handleTimingChange = async (value: string) => {
    setLocalTiming(value);
  };

  // Save threshold when input blurs
  const handleThresholdBlur = async () => {
    const thresholdValue = parseFloat(localThreshold);
    if (!isNaN(thresholdValue) && thresholdValue >= 0) {
      await updateSetting(setting.type, { threshold: thresholdValue });
    } else {
      // Reset to original value if invalid
      setLocalThreshold(setting.threshold ? setting.threshold.toString() : '');
    }
  };

  // Save timing when input blurs
  const handleTimingBlur = async () => {
    const timingValue = parseInt(localTiming, 10);
    if (!isNaN(timingValue) && timingValue >= 0) {
      await updateSetting(setting.type, { timing: timingValue });
    } else {
      // Reset to original value if invalid
      setLocalTiming(setting.timing ? setting.timing.toString() : '');
    }
  };

  // Get settings label based on type
  const getSettingsLabel = () => {
    switch (setting.type) {
      case 'low_balance':
        return 'Alert when balance falls below:';
      case 'payment_reminder':
        return 'Remind me this many days before due:';
      case 'debt_due':
        return 'Alert me this many days before due:';
      case 'consumption_alert':
        return 'Alert when consumption increases by:';
      default:
        return null;
    }
  };

  // Get settings suffix based on type
  const getSettingsSuffix = () => {
    switch (setting.type) {
      case 'low_balance':
        return '$';
      case 'payment_reminder':
      case 'debt_due':
        return 'days';
      case 'consumption_alert':
        return '%';
      default:
        return '';
    }
  };

  const settingsLabel = getSettingsLabel();
  const settingsSuffix = getSettingsSuffix();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={getTypeIcon(setting.type)}
            size={22}
            color="#3b82f6"
          />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{setting.title}</Text>
          <Text style={styles.description} numberOfLines={1}>
            {setting.description}
          </Text>
        </View>
        
        <Switch
          value={setting.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
          thumbColor={setting.enabled ? '#3b82f6' : '#9ca3af'}
          ios_backgroundColor="#e5e7eb"
        />
        
        {(setting.threshold !== undefined || setting.timing !== undefined) && (
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {expanded && settingsLabel && setting.enabled && (
        <View style={styles.expandedContent}>
          <Text style={styles.settingLabel}>{settingsLabel}</Text>
          
          <View style={styles.inputContainer}>
            {setting.type === 'low_balance' && (
              <Text style={styles.inputPrefix}>{settingsSuffix}</Text>
            )}
            
            <TextInput
              style={styles.input}
              value={
                setting.type === 'low_balance' || setting.type === 'consumption_alert'
                  ? localThreshold
                  : localTiming
              }
              onChangeText={
                setting.type === 'low_balance' || setting.type === 'consumption_alert'
                  ? handleThresholdChange
                  : handleTimingChange
              }
              onBlur={
                setting.type === 'low_balance' || setting.type === 'consumption_alert'
                  ? handleThresholdBlur
                  : handleTimingBlur
              }
              keyboardType="numeric"
              returnKeyType="done"
              placeholder={
                setting.type === 'low_balance'
                  ? 'e.g., 10'
                  : setting.type === 'consumption_alert'
                  ? 'e.g., 20'
                  : 'e.g., 3'
              }
            />
            
            {setting.type !== 'low_balance' && (
              <Text style={styles.inputSuffix}>{settingsSuffix}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  expandButton: {
    marginLeft: 8,
    padding: 4,
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#4b5563',
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
});

export default NotificationSettingItem;
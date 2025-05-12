import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, NotificationType } from '../../services/notificationService';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };

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

  // Get color based on notification type
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'payment_reminder':
        return '#3b82f6'; // blue
      case 'low_balance':
        return '#ef4444'; // red
      case 'meter_recharge':
        return '#10b981'; // green
      case 'debt_due':
        return '#f59e0b'; // amber
      case 'price_update':
        return '#8b5cf6'; // purple
      case 'service_outage':
        return '#ef4444'; // red
      case 'consumption_alert':
        return '#06b6d4'; // cyan
      default:
        return '#6b7280'; // gray
    }
  };

  // Get background color based on notification type (lighter shade)
  const getTypeBgColor = (type: NotificationType) => {
    switch (type) {
      case 'payment_reminder':
        return '#eff6ff'; // light blue
      case 'low_balance':
        return '#fef2f2'; // light red
      case 'meter_recharge':
        return '#ecfdf5'; // light green
      case 'debt_due':
        return '#fffbeb'; // light amber
      case 'price_update':
        return '#f5f3ff'; // light purple
      case 'service_outage':
        return '#fef2f2'; // light red
      case 'consumption_alert':
        return '#ecfeff'; // light cyan
      default:
        return '#f9fafb'; // light gray
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.unreadContainer,
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getTypeBgColor(notification.type) },
        ]}
      >
        <Ionicons
          name={getTypeIcon(notification.type)}
          size={22}
          color={getTypeColor(notification.type)}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
        </View>
        
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(notification.id)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close" size={18} color="#9ca3af" />
      </TouchableOpacity>
      
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
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
  unreadContainer: {
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  body: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
});

export default NotificationItem;
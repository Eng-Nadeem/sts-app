import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../services/notificationService';

interface NotificationListProps {
  onNotificationPress: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
}) => {
  const { 
    notifications, 
    isLoading, 
    deleteNotification, 
    markAllAsRead, 
    clearAll,
    unreadCount
  } = useNotifications();

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.emptyText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyText}>
          You don't have any notifications yet. They will appear here when you receive them.
        </Text>
      </View>
    );
  };

  // Render header with actions
  const renderHeader = () => {
    if (notifications.length === 0) return null;

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Notifications</Text>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done" size={18} color="#3b82f6" />
              <Text style={styles.headerButtonText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.headerButton, styles.clearButton]}
            onPress={clearAll}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.headerButtonText, styles.clearButtonText]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={onNotificationPress}
          onDelete={deleteNotification}
        />
      )}
      ListEmptyComponent={renderEmptyState}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 4,
  },
  clearButton: {
    marginLeft: 16,
  },
  clearButtonText: {
    color: '#ef4444',
  },
});

export default NotificationList;
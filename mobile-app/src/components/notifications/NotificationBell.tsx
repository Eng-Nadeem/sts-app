import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationBellProps {
  color?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ color = '#3b82f6' }) => {
  const navigation = useNavigation();
  const { unreadCount } = useNotifications();
  
  // Animation reference
  const shake = useRef(new Animated.Value(0)).current;
  
  // Trigger animation when unreadCount changes
  useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 100, useNativeDriver: true })
      ]).start();
    }
  }, [unreadCount]);
  
  // Navigate to notification center
  const handlePress = () => {
    navigation.navigate('NotificationCenter');
  };
  
  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <Ionicons name="notifications-outline" size={24} color={color} />
        
        {unreadCount > 0 && (
          <View style={styles.badge}>
            {/* We're not showing the count, just indicating unread notifications */}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: 'white',
  }
});

export default NotificationBell;
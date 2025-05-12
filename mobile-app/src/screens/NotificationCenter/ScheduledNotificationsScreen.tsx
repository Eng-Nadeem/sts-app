import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import types and services
import {
  ScheduledNotification,
  getScheduledNotifications,
  toggleScheduledNotification,
  deleteScheduledNotification,
  createScheduledNotification,
  formatScheduleText,
  formatTimeString,
} from '../../services/scheduledNotificationService';
import {
  NotificationTemplate,
  NOTIFICATION_TEMPLATES,
} from '../../services/notificationTemplates';

const ScheduledNotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // States
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templatesModalVisible, setTemplatesModalVisible] = useState<boolean>(false);
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday as default
  const [selectedDate, setSelectedDate] = useState<number>(1);
  const [customDate, setCustomDate] = useState<Date>(new Date(Date.now() + 86400000)); // Tomorrow
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
  const [personalizations, setPersonalizations] = useState<Record<string, string>>({});
  
  // Load scheduled notifications
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const scheduledNotifications = await getScheduledNotifications();
      setNotifications(scheduledNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle notification enabled state
  const handleToggleNotification = async (id: string) => {
    try {
      await toggleScheduledNotification(id);
      loadNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
    }
  };
  
  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this scheduled notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheduledNotification(id);
              loadNotifications();
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };
  
  // Open create modal
  const handleCreateNotification = () => {
    setTemplatesModalVisible(true);
  };
  
  // Select template
  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setTemplatesModalVisible(false);
    setCreateModalVisible(true);
    
    // Reset form
    const now = new Date();
    setSelectedTime(now);
    setSelectedDays([1]); // Monday
    setSelectedDate(1);
    setCustomDate(new Date(Date.now() + 86400000)); // Tomorrow
    setPersonalizations({});
    
    // Set default schedule if available
    if (template.defaultSchedule) {
      setScheduleType(template.defaultSchedule.type);
      
      if (template.defaultSchedule.time) {
        const [hours, minutes] = template.defaultSchedule.time.split(':').map(Number);
        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        setSelectedTime(time);
      }
      
      if (template.defaultSchedule.days) {
        setSelectedDays(template.defaultSchedule.days);
      }
      
      if (template.defaultSchedule.date) {
        setSelectedDate(template.defaultSchedule.date);
      }
    }
  };
  
  // Handle time change
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };
  
  // Handle custom date change
  const handleCustomDateChange = (event: any, selectedDate?: Date) => {
    setShowCustomDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCustomDate(selectedDate);
    }
  };
  
  // Toggle day selection
  const toggleDaySelection = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  
  // Handle create notification
  const handleCreateNotificationSubmit = async () => {
    if (!selectedTemplate) return;
    
    try {
      // Prepare schedule
      const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
      
      let schedule: ScheduledNotification['schedule'] = {
        type: scheduleType,
        time: timeString,
      };
      
      // Add type-specific fields
      if (scheduleType === 'weekly') {
        schedule.days = selectedDays;
      } else if (scheduleType === 'monthly') {
        schedule.date = selectedDate;
      } else if (scheduleType === 'custom') {
        schedule.nextTriggerDate = customDate.toISOString();
      }
      
      // Create notification
      await createScheduledNotification(
        selectedTemplate.id,
        schedule,
        personalizations
      );
      
      // Close modal and refresh
      setCreateModalVisible(false);
      loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      Alert.alert('Error', 'Failed to create scheduled notification.');
    }
  };
  
  // Update personalization field
  const handlePersonalizationChange = (field: string, value: string) => {
    setPersonalizations({
      ...personalizations,
      [field]: value,
    });
  };
  
  // Render the scheduled notification item
  const renderNotificationItem = (notification: ScheduledNotification) => {
    const template = NOTIFICATION_TEMPLATES.find(t => t.id === notification.templateId);
    if (!template) return null;
    
    return (
      <View key={notification.id} style={styles.notificationItem}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{template.name}</Text>
          <Switch
            value={notification.enabled}
            onValueChange={() => handleToggleNotification(notification.id)}
            trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
            thumbColor={notification.enabled ? '#3b82f6' : '#9ca3af'}
          />
        </View>
        
        <Text style={styles.scheduleText}>
          {formatScheduleText(notification.schedule)}
        </Text>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(notification.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheduled Notifications</Text>
        <View style={styles.spacer} />
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        ) : (
          <>
            {notifications.length > 0 ? (
              notifications.map(renderNotificationItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Scheduled Notifications</Text>
                <Text style={styles.emptyText}>
                  You haven't scheduled any notifications yet. Tap the button below to create one.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateNotification}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.createButtonText}>Create Scheduled Notification</Text>
      </TouchableOpacity>
      
      {/* Templates Modal */}
      <Modal
        visible={templatesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTemplatesModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Template</Text>
              <TouchableOpacity
                onPress={() => setTemplatesModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {NOTIFICATION_TEMPLATES.filter(t => t.canBeScheduled).map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateItem}
                  onPress={() => handleSelectTemplate(template)}
                >
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Create Notification Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContainerInner}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Schedule Notification</Text>
                <TouchableOpacity
                  onPress={() => setCreateModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollContent}>
                {selectedTemplate && (
                  <>
                    <View style={styles.formSection}>
                      <Text style={styles.formSectionTitle}>Template</Text>
                      <View style={styles.templateItemSelected}>
                        <Text style={styles.templateName}>{selectedTemplate.name}</Text>
                        <Text style={styles.templateDescription}>{selectedTemplate.description}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.formSection}>
                      <Text style={styles.formSectionTitle}>Schedule Type</Text>
                      <View style={styles.scheduleTypeContainer}>
                        {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.scheduleTypeButton,
                              scheduleType === type && styles.scheduleTypeButtonActive,
                            ]}
                            onPress={() => setScheduleType(type as any)}
                          >
                            <Text
                              style={[
                                styles.scheduleTypeText,
                                scheduleType === type && styles.scheduleTypeTextActive,
                              ]}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.formSection}>
                      <Text style={styles.formSectionTitle}>Time</Text>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Ionicons name="time-outline" size={20} color="#3b82f6" />
                        <Text style={styles.timeButtonText}>
                          {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </TouchableOpacity>
                      
                      {showTimePicker && (
                        <DateTimePicker
                          value={selectedTime}
                          mode="time"
                          is24Hour={false}
                          display="default"
                          onChange={handleTimeChange}
                        />
                      )}
                    </View>
                    
                    {scheduleType === 'weekly' && (
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Days of Week</Text>
                        <View style={styles.daysContainer}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.dayButton,
                                selectedDays.includes(index) && styles.dayButtonSelected,
                              ]}
                              onPress={() => toggleDaySelection(index)}
                            >
                              <Text
                                style={[
                                  styles.dayButtonText,
                                  selectedDays.includes(index) && styles.dayButtonTextSelected,
                                ]}
                              >
                                {day}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {scheduleType === 'monthly' && (
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Day of Month</Text>
                        <View style={styles.dateInputContainer}>
                          <TextInput
                            style={styles.dateInput}
                            value={selectedDate.toString()}
                            onChangeText={(text) => {
                              const num = parseInt(text);
                              if (!isNaN(num) && num >= 1 && num <= 31) {
                                setSelectedDate(num);
                              }
                            }}
                            keyboardType="number-pad"
                            maxLength={2}
                          />
                          <Text style={styles.dateInputLabel}>
                            (1-31)
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {scheduleType === 'custom' && (
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Custom Date</Text>
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => setShowCustomDatePicker(true)}
                        >
                          <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                          <Text style={styles.timeButtonText}>
                            {customDate.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                        
                        {showCustomDatePicker && (
                          <DateTimePicker
                            value={customDate}
                            mode="date"
                            display="default"
                            onChange={handleCustomDateChange}
                            minimumDate={new Date()}
                          />
                        )}
                      </View>
                    )}
                    
                    {selectedTemplate.needsPersonalization && selectedTemplate.personalizationFields && (
                      <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>Personalization</Text>
                        {selectedTemplate.personalizationFields.map(field => {
                          // Skip the 'tip' field, as it will be auto-generated
                          if (field === 'tip') return null;
                          
                          return (
                            <View key={field} style={styles.inputContainer}>
                              <Text style={styles.inputLabel}>
                                {field.charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)}
                              </Text>
                              <TextInput
                                style={styles.input}
                                value={personalizations[field] || ''}
                                onChangeText={(text) => handlePersonalizationChange(field, text)}
                                placeholder={`Enter ${field.replace('_', ' ')}`}
                              />
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateNotificationSubmit}
              >
                <Text style={styles.submitButtonText}>Create Scheduled Notification</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  spacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Space for create button
  },
  loader: {
    marginTop: 32,
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
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  scheduleText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 4,
  },
  createButton: {
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
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainerInner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollContent: {
    padding: 16,
    maxHeight: '70%',
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  templateInfo: {
    flex: 1,
    marginRight: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  templateItemSelected: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  scheduleTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  scheduleTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  scheduleTypeButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  scheduleTypeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  scheduleTypeTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dayButtonTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 80,
    marginRight: 8,
  },
  dateInputLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    margin: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ScheduledNotificationsScreen;
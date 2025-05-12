import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MeterCard from '../components/MeterCard';
import { useApi } from '../context/ApiContext';

const MetersScreen = () => {
  const navigation = useNavigation();
  const { metersApi } = useApi();
  const [meters, setMeters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [formData, setFormData] = useState({
    meterNumber: '',
    nickname: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMeters();
  }, []);

  const fetchMeters = async () => {
    setIsLoading(true);
    try {
      const data = await metersApi.getAllMeters();
      setMeters(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch meters');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.meterNumber) {
      newErrors.meterNumber = 'Meter number is required';
    } else if (formData.meterNumber.length < 5) {
      newErrors.meterNumber = 'Meter number must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMeter = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      await metersApi.createMeter(formData);
      fetchMeters();
      setModalVisible(false);
      setFormData({ meterNumber: '', nickname: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to add meter');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMeter = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      await metersApi.updateMeter(selectedMeter.id, formData);
      fetchMeters();
      setModalVisible(false);
      setIsEditing(false);
      setSelectedMeter(null);
      setFormData({ meterNumber: '', nickname: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to update meter');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMeter = (meter) => {
    setSelectedMeter(meter);
    setFormData({
      meterNumber: meter.meterNumber,
      nickname: meter.nickname || '',
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleMeterSelect = (meter) => {
    navigation.navigate('Recharge', { meter });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="flash-outline" size={80} color="#CBD5E1" />
      <Text style={styles.emptyStateTitle}>No Meters Found</Text>
      <Text style={styles.emptyStateDescription}>
        Add your first meter to start managing your electricity
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setIsEditing(false);
          setFormData({ meterNumber: '', nickname: '' });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Your First Meter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Meters</Text>
        {meters.length > 0 && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              setIsEditing(false);
              setFormData({ meterNumber: '', nickname: '' });
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {isLoading && meters.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : meters.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={meters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MeterCard
              meter={item}
              onSelect={handleMeterSelect}
              onEdit={() => handleEditMeter(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Update Meter' : 'Add New Meter'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Meter Number</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.meterNumber ? styles.inputError : null,
                ]}
                value={formData.meterNumber}
                onChangeText={(text) => setFormData({...formData, meterNumber: text})}
                placeholder="Enter meter number"
                editable={!isEditing}
              />
              {errors.meterNumber ? (
                <Text style={styles.errorText}>{errors.meterNumber}</Text>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nickname (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.nickname}
                onChangeText={(text) => setFormData({...formData, nickname: text})}
                placeholder="E.g. Home, Office, etc."
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setErrors({});
                  if (isEditing) {
                    setIsEditing(false);
                    setSelectedMeter(null);
                  }
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={isEditing ? handleUpdateMeter : handleAddMeter}
              >
                <Text style={styles.buttonText}>
                  {isEditing ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 16,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#334155',
  },
});

export default MetersScreen;
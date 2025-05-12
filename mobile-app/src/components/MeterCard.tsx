import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Meter {
  id: number;
  meterNumber: string;
  nickname?: string;
  createdAt: string;
}

interface MeterCardProps {
  meter: Meter;
  onSelect: (meter: Meter) => void;
  onEdit?: (meter: Meter) => void;
}

const MeterCard = ({ meter, onSelect, onEdit }: MeterCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(meter)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="flash" size={24} color="#3b82f6" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.nickname}>
          {meter.nickname || `Meter ${meter.id}`}
        </Text>
        <Text style={styles.meterNumber}>{meter.meterNumber}</Text>
      </View>
      {onEdit ? (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(meter)}
          >
            <Ionicons name="pencil" size={16} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      ) : (
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  meterNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 16,
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
});

export default MeterCard;
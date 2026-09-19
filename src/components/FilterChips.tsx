// src/components/FilterChips.tsx
import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Amenity, RoomStatus } from '../types';

type FilterOption =
  | { type: 'status'; value: RoomStatus | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }
  | { type: 'amenity'; value: Amenity; label: string; icon: keyof typeof Ionicons.glyphMap }
  | { type: 'capacity'; value: number; label: string; icon: keyof typeof Ionicons.glyphMap };

const FILTER_OPTIONS: FilterOption[] = [
  { type: 'status', value: 'available', label: 'Còn trống', icon: 'checkmark-circle-outline' },
  { type: 'amenity', value: 'projector', label: 'Máy chiếu', icon: 'tv-outline' },
  { type: 'amenity', value: 'ac', label: 'Điều hòa', icon: 'snow-outline' },
  { type: 'amenity', value: 'whiteboard', label: 'Bảng trắng', icon: 'easel-outline' },
  { type: 'amenity', value: 'computer', label: 'Máy tính', icon: 'desktop-outline' },
  { type: 'amenity', value: 'printer', label: 'Máy in', icon: 'print-outline' },
  { type: 'capacity', value: 30, label: '≥ 30 chỗ', icon: 'people-outline' },
  { type: 'capacity', value: 50, label: '≥ 50 chỗ', icon: 'people-outline' },
];

interface Props {
  selectedAmenities: Amenity[];
  statusFilter: RoomStatus | 'all';
  minCapacity: number;
  onToggleAmenity: (a: Amenity) => void;
  onSetStatus: (s: RoomStatus | 'all') => void;
  onSetCapacity: (c: number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function FilterChips({
  selectedAmenities,
  statusFilter,
  minCapacity,
  onToggleAmenity,
  onSetStatus,
  onSetCapacity,
  onReset,
  hasActiveFilters,
}: Props) {
  const isActive = (opt: FilterOption): boolean => {
    if (opt.type === 'status') return statusFilter === opt.value;
    if (opt.type === 'amenity') return selectedAmenities.includes(opt.value as Amenity);
    if (opt.type === 'capacity') return minCapacity === opt.value;
    return false;
  };

  const handlePress = (opt: FilterOption) => {
    if (opt.type === 'status') {
      onSetStatus(isActive(opt) ? 'all' : (opt.value as RoomStatus));
    } else if (opt.type === 'amenity') {
      onToggleAmenity(opt.value as Amenity);
    } else if (opt.type === 'capacity') {
      onSetCapacity(isActive(opt) ? 0 : opt.value);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reset chip */}
        {hasActiveFilters && (
          <Pressable style={[styles.chip, styles.resetChip]} onPress={onReset}>
            <Ionicons name="close-outline" size={15} color="#EF4444" />
            <Text style={styles.resetText}>Xóa lọc</Text>
          </Pressable>
        )}

        {FILTER_OPTIONS.map((opt) => {
          const active = isActive(opt);
          return (
            <Pressable
              key={`${opt.type}-${opt.value}`}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => handlePress(opt)}
            >
              <Ionicons
                name={opt.icon}
                size={15}
                color={active ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    marginVertical: 6,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipPressed: {
    opacity: 0.75,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  chipLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resetChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});

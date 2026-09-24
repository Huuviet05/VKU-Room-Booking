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
  { type: 'amenity', value: 'computer', label: 'Dàn máy tính', icon: 'desktop-outline' },
  { type: 'amenity', value: 'smart_board', label: 'Smartboard', icon: 'tablet-landscape-outline' },
  { type: 'amenity', value: 'wifi6', label: 'Wifi 6', icon: 'wifi-outline' },
  { type: 'amenity', value: 'sound_system', label: 'Âm thanh', icon: 'volume-high-outline' },
  { type: 'amenity', value: 'vr_headset', label: 'Kính VR', icon: 'glasses-outline' },
  { type: 'amenity', value: 'projector', label: 'Máy chiếu', icon: 'tv-outline' },
  { type: 'amenity', value: 'ac', label: 'Điều hòa', icon: 'snow-outline' },
  { type: 'amenity', value: 'whiteboard', label: 'Bảng trắng', icon: 'easel-outline' },
  { type: 'amenity', value: 'printer', label: 'Máy in', icon: 'print-outline' },
  { type: 'capacity', value: 20, label: '≥ 20 chỗ', icon: 'people-outline' },
  { type: 'capacity', value: 40, label: '≥ 40 chỗ', icon: 'people-outline' },
  { type: 'capacity', value: 80, label: '≥ 80 chỗ', icon: 'people-outline' },
];

interface Props {
  selectedAmenities: Amenity[];
  statusFilter: RoomStatus | 'all';
  minCapacity: number;
  selectedBuilding: string;
  onSelectBuilding: (building: string) => void;
  onToggleAmenity: (a: Amenity) => void;
  onSetStatus: (s: RoomStatus | 'all') => void;
  onSetCapacity: (c: number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const BUILDINGS = [
  { id: 'all', label: 'Toàn trường', icon: 'business-outline' as const },
  { id: 'Khu A', label: '🏢 Khu A (CNTT & AI)', icon: 'hardware-chip-outline' as const },
  { id: 'Khu V', label: '🏛️ Khu V (Giảng đường)', icon: 'school-outline' as const },
  { id: 'Thư viện số', label: '📚 Thư viện số', icon: 'book-outline' as const },
  { id: 'Khu C', label: '🔬 Khu C', icon: 'flask-outline' as const },
  { id: 'Khu Sáng tạo', label: '💡 Sáng tạo', icon: 'bulb-outline' as const },
];

export default function FilterChips({
  selectedAmenities,
  statusFilter,
  minCapacity,
  selectedBuilding,
  onSelectBuilding,
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
      {/* 1. Building Selector Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buildingScroll}
      >
        {BUILDINGS.map((b) => {
          const isSelected = selectedBuilding === b.id;
          return (
            <Pressable
              key={b.id}
              style={[styles.buildingChip, isSelected && styles.buildingChipActive]}
              onPress={() => onSelectBuilding(b.id)}
            >
              <Text
                style={[
                  styles.buildingChipText,
                  isSelected && styles.buildingChipTextActive,
                ]}
              >
                {b.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 2. Detailed Amenity & Status Filter Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {/* Reset button */}
        {hasActiveFilters && (
          <Pressable style={[styles.chip, styles.resetChip]} onPress={onReset}>
            <Ionicons name="close-circle" size={14} color="#EF4444" />
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
                size={14}
                color={active ? '#FFFFFF' : '#475569'}
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
    gap: 8,
    marginBottom: 6,
  },
  buildingScroll: {
    gap: 8,
    paddingRight: 8,
  },
  buildingChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buildingChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  buildingChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  buildingChipTextActive: {
    color: '#FFFFFF',
  },
  filterScroll: {
    gap: 6,
    paddingRight: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  chipPressed: {
    backgroundColor: '#EEF2FF',
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  resetChip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
});

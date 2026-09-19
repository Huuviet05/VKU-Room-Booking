// src/components/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoomStatus } from '../types';

interface Props {
  status: RoomStatus;
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; bg: string; text: string; dot: string }> = {
  available: { label: 'Còn trống', bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  occupied:  { label: 'Đang dùng', bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  maintenance: { label: 'Bảo trì', bg: '#FEF9C3', text: '#CA8A04', dot: '#EAB308' },
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

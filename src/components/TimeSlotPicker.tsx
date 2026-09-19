// src/components/TimeSlotPicker.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Booking } from '../types';

interface Props {
  selectedSlots: string[]; // ["08:00", "09:00"]
  onToggleSlot: (slot: string) => void;
  existingBookings: Booking[];
  maxSlots?: number;
}

// Tạo danh sách khung giờ từ 07:00 đến 20:00
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 7; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

// Kiểm tra slot có bị đặt chưa
function isSlotBooked(slot: string, bookings: Booking[]): boolean {
  const slotHour = parseInt(slot.split(':')[0]);
  return bookings.some((b) => {
    const start = parseInt(b.startTime.split(':')[0]);
    const end = parseInt(b.endTime.split(':')[0]);
    return slotHour >= start && slotHour < end;
  });
}

// Kiểm tra slots được chọn có liên tiếp không
function areSlotsConsecutive(slots: string[]): boolean {
  if (slots.length <= 1) return true;
  const hours = slots.map((s) => parseInt(s.split(':')[0])).sort((a, b) => a - b);
  for (let i = 1; i < hours.length; i++) {
    if (hours[i] - hours[i - 1] !== 1) return false;
  }
  return true;
}

export default function TimeSlotPicker({
  selectedSlots,
  onToggleSlot,
  existingBookings,
  maxSlots = 3,
}: Props) {
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const handleToggle = (slot: string) => {
    const isSelected = selectedSlots.includes(slot);
    if (isSelected) {
      onToggleSlot(slot);
      return;
    }
    // Kiểm tra max slots
    if (selectedSlots.length >= maxSlots) return;
    // Kiểm tra consecutive sau khi thêm
    const newSlots = [...selectedSlots, slot];
    if (!areSlotsConsecutive(newSlots)) return;
    onToggleSlot(slot);
  };

  // Tính endTime từ selectedSlots
  const getTimeRange = (): string => {
    if (selectedSlots.length === 0) return '';
    const hours = selectedSlots.map((s) => parseInt(s.split(':')[0])).sort((a, b) => a - b);
    const start = `${String(hours[0]).padStart(2, '0')}:00`;
    const end = `${String(hours[hours.length - 1] + 1).padStart(2, '0')}:00`;
    return `${start} → ${end}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chọn khung giờ</Text>
        {selectedSlots.length > 0 && (
          <Text style={styles.range}>{getTimeRange()}</Text>
        )}
      </View>

      <Text style={styles.hint}>Tối đa {maxSlots} tiếng liên tiếp</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
        <View style={styles.slotsRow}>
          {timeSlots.map((slot) => {
            const booked = isSlotBooked(slot, existingBookings);
            const selected = selectedSlots.includes(slot);
            const hour = parseInt(slot.split(':')[0]);
            const endSlot = `${String(hour + 1).padStart(2, '0')}:00`;

            return (
              <Pressable
                key={slot}
                style={({ pressed }) => [
                  styles.slot,
                  selected && styles.slotSelected,
                  booked && styles.slotBooked,
                  !booked && !selected && pressed && styles.slotPressed,
                ]}
                onPress={() => !booked && handleToggle(slot)}
                disabled={booked}
              >
                <Text style={[
                  styles.slotTime,
                  selected && styles.slotTimeSelected,
                  booked && styles.slotTimeBooked,
                ]}>
                  {slot}
                </Text>
                <Text style={[
                  styles.slotEnd,
                  selected && styles.slotTimeSelected,
                  booked && styles.slotTimeBooked,
                ]}>
                  {endSlot}
                </Text>
                {booked && <Text style={styles.bookedLabel}>Đã đặt</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
          <Text style={styles.legendText}>Đã chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' }]} />
          <Text style={styles.legendText}>Đã đặt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]} />
          <Text style={styles.legendText}>Còn trống</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  range: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  hint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  slotsScroll: {
    marginTop: 4,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  slot: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 2,
  },
  slotSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  slotBooked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  slotPressed: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  slotEnd: {
    fontSize: 10,
    color: '#94A3B8',
  },
  slotTimeSelected: {
    color: '#FFFFFF',
  },
  slotTimeBooked: {
    color: '#FCA5A5',
  },
  bookedLabel: {
    fontSize: 9,
    color: '#F87171',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
  },
});

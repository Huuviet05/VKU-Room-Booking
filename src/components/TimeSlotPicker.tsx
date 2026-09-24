// src/components/TimeSlotPicker.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Booking } from '../types';
import { isSlotInPast, getLocalDateString, formatVietnameseDate } from '../utils/bookingLogic';

interface Props {
  selectedSlots: string[]; // ["08:00", "09:00"]
  onToggleSlot: (slot: string) => void;
  existingBookings: Booking[];
  maxSlots?: number;
  date?: string; // "2026-09-24"
}

// Tạo danh sách khung giờ từ 07:00 đến 20:00
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 7; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

// Kiểm tra slot có bị đặt chưa (chỉ tính các booking chưa bị hủy)
function isSlotBooked(slot: string, bookings: Booking[]): boolean {
  const slotHour = parseInt(slot.split(':')[0], 10);
  return bookings.some((b) => {
    if (b.status === 'cancelled') return false;
    const start = parseInt(b.startTime.split(':')[0], 10);
    const end = parseInt(b.endTime.split(':')[0], 10);
    return slotHour >= start && slotHour < end;
  });
}

// Kiểm tra slots được chọn có liên tiếp không
function areSlotsConsecutive(slots: string[]): boolean {
  if (slots.length <= 1) return true;
  const hours = slots.map((s) => parseInt(s.split(':')[0], 10)).sort((a, b) => a - b);
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
  date,
}: Props) {
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const activeDate = date || getLocalDateString();

  const handleToggle = (slot: string, isBooked: boolean, isPast: boolean) => {
    if (isBooked || isPast) return;

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

  // Tính endTime và tổng số giờ từ selectedSlots
  const getTimeRangeInfo = (): { range: string; duration: string } | null => {
    if (selectedSlots.length === 0) return null;
    const hours = selectedSlots.map((s) => parseInt(s.split(':')[0], 10)).sort((a, b) => a - b);
    const start = `${String(hours[0]).padStart(2, '0')}:00`;
    const end = `${String(hours[hours.length - 1] + 1).padStart(2, '0')}:00`;
    const count = hours.length;
    return {
      range: `${start} → ${end}`,
      duration: `${count} tiếng`,
    };
  };

  const rangeInfo = getTimeRangeInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Khung giờ mượn phòng</Text>
          <Text style={styles.dateBadgeText}>{formatVietnameseDate(activeDate)}</Text>
        </View>
        {rangeInfo && (
          <View style={styles.rangeBadge}>
            <Text style={styles.rangeDuration}>{rangeInfo.duration}</Text>
            <Text style={styles.range}>{rangeInfo.range}</Text>
          </View>
        )}
      </View>

      <Text style={styles.hint}>
        Mượn tối đa {maxSlots} tiếng liên tiếp · Khung giờ xanh là bạn đang chọn
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsScroll}>
        <View style={styles.slotsRow}>
          {timeSlots.map((slot) => {
            const hour = parseInt(slot.split(':')[0], 10);
            const isPast = isSlotInPast(hour, activeDate);
            const booked = isSlotBooked(slot, existingBookings);
            const selected = selectedSlots.includes(slot);
            const disabled = booked || isPast;
            const endSlot = `${String(hour + 1).padStart(2, '0')}:00`;

            return (
              <Pressable
                key={slot}
                style={({ pressed }) => [
                  styles.slot,
                  selected && styles.slotSelected,
                  booked && styles.slotBooked,
                  isPast && !booked && styles.slotPast,
                  !disabled && !selected && pressed && styles.slotPressed,
                ]}
                onPress={() => handleToggle(slot, booked, isPast)}
                disabled={disabled}
              >
                <Text
                  style={[
                    styles.slotTime,
                    selected && styles.slotTimeSelected,
                    booked && styles.slotTimeBooked,
                    isPast && !booked && styles.slotTimePast,
                  ]}
                >
                  {slot}
                </Text>
                <Text
                  style={[
                    styles.slotEnd,
                    selected && styles.slotTimeSelected,
                    booked && styles.slotTimeBooked,
                    isPast && !booked && styles.slotTimePast,
                  ]}
                >
                  {endSlot}
                </Text>
                {booked && <Text style={styles.bookedLabel}>Đã đặt</Text>}
                {isPast && !booked && <Text style={styles.pastLabel}>Đã qua</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
          <Text style={styles.legendText}>Đang chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' }]} />
          <Text style={styles.legendText}>Đã có người đặt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' }]} />
          <Text style={styles.legendText}>Đã qua giờ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' }]} />
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
    flexWrap: 'wrap',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  rangeDuration: {
    fontSize: 11,
    fontWeight: '800',
    color: '#312E81',
    backgroundColor: '#C7D2FE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  range: {
    fontSize: 13,
    fontWeight: '700',
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
    width: 66,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 2,
  },
  slotSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  slotBooked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    opacity: 0.85,
  },
  slotPast: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  slotPressed: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotEnd: {
    fontSize: 10,
    color: '#64748B',
  },
  slotTimeSelected: {
    color: '#FFFFFF',
  },
  slotTimeBooked: {
    color: '#EF4444',
  },
  slotTimePast: {
    color: '#94A3B8',
  },
  bookedLabel: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: '700',
  },
  pastLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});

// src/components/DateSelectorStrip.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLocalDateString } from '../utils/bookingLogic';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  daysCount?: number;
  label?: string;
}

interface DayItem {
  dateStr: string;
  dayLabel: string;
  dayNumber: number;
  monthLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  dayOfWeekName: string;
}

const WEEKDAYS_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function DateSelectorStrip({
  selectedDate,
  onSelectDate,
  daysCount = 14,
  label,
}: Props) {
  const days: DayItem[] = useMemo(() => {
    const list: DayItem[] = [];
    const today = new Date();
    const todayStr = getLocalDateString(today);

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = getLocalDateString(d);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayOfWeek = d.getDay();
      const dayOfWeekName = WEEKDAYS_VN[dayOfWeek];

      let dayLabel = dayOfWeekName;
      if (isToday) dayLabel = 'Hôm nay';
      else if (isTomorrow) dayLabel = 'Ngày mai';

      list.push({
        dateStr,
        dayLabel,
        dayNumber: d.getDate(),
        monthLabel: `Thg ${d.getMonth() + 1}`,
        isToday,
        isTomorrow,
        dayOfWeekName,
      });
    }

    return list;
  }, [daysCount]);

  const selectedItem = days.find((d) => d.dateStr === selectedDate);
  const formattedSelectedText = selectedItem
    ? `${selectedItem.dayLabel}, ${selectedItem.dayNumber}/${selectedItem.monthLabel.replace('Thg ', '')}`
    : selectedDate;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar-outline" size={16} color="#4F46E5" />
          <Text style={styles.title}>{label || 'Chọn ngày mượn phòng'}</Text>
        </View>
        <View style={styles.activeDateTag}>
          <Text style={styles.activeDateText}>{formattedSelectedText}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;

          return (
            <Pressable
              key={item.dateStr}
              style={({ pressed }) => [
                styles.dayCard,
                isSelected && styles.dayCardActive,
                pressed && styles.dayCardPressed,
              ]}
              onPress={() => onSelectDate(item.dateStr)}
            >
              {/* Day label: Hôm nay / Ngày mai / T2... */}
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelActive,
                  item.isToday && !isSelected && styles.dayLabelToday,
                ]}
              >
                {item.dayLabel}
              </Text>

              {/* Day number: 24, 25... */}
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberActive,
                ]}
              >
                {item.dayNumber}
              </Text>

              {/* Month: Thg 9 */}
              <Text
                style={[
                  styles.monthLabel,
                  isSelected && styles.monthLabelActive,
                ]}
              >
                {item.monthLabel}
              </Text>

              {/* Small dot for today */}
              {item.isToday && !isSelected && <View style={styles.todayDot} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeDateTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  activeDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  scrollContent: {
    gap: 8,
    paddingRight: 10,
    alignItems: 'center',
  },
  dayCard: {
    width: 64,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  dayCardActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  dayCardPressed: {
    backgroundColor: '#EEF2FF',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  dayLabelActive: {
    color: '#E0E7FF',
    fontWeight: '700',
  },
  dayLabelToday: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },
  monthLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94A3B8',
  },
  monthLabelActive: {
    color: '#C7D2FE',
    fontWeight: '600',
  },
  todayDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4F46E5',
  },
});

// src/screens/RoomDetailScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { Booking } from '../types';
import { createBooking, getRoomBookingsByDate } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import TimeSlotPicker from '../components/TimeSlotPicker';
import DateSelectorStrip from '../components/DateSelectorStrip';
import StatusBadge from '../components/StatusBadge';
import { RootStackParamList } from '../navigation/AppNavigator';
import { appNotify } from '../store/useNotificationStore';
import { useNotificationCenterStore } from '../store/useNotificationCenterStore';
import {
  isSlotInPast,
  getLocalDateString,
  formatVietnameseDate,
  formatShortVietnameseDate,
  BOOKING_PURPOSES,
} from '../utils/bookingLogic';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;
  route: RouteProp<RootStackParamList, 'RoomDetail'>;
};

const AMENITY_INFO: Record<string, { icon: string; label: string }> = {
  projector: { icon: 'tv-outline', label: 'Máy chiếu' },
  ac: { icon: 'snow-outline', label: 'Điều hòa' },
  whiteboard: { icon: 'easel-outline', label: 'Bảng trắng' },
  printer: { icon: 'print-outline', label: 'Máy in' },
  computer: { icon: 'desktop-outline', label: 'Máy tính' },
  camera: { icon: 'videocam-outline', label: 'Camera' },
  sound_system: { icon: 'volume-high-outline', label: 'Âm thanh' },
  smart_board: { icon: 'laptop-outline', label: 'Bảng tương tác' },
  wifi6: { icon: 'wifi-outline', label: 'Wi-Fi 6 tốc độ cao' },
  vr_headset: { icon: 'glasses-outline', label: 'Kính VR/AR' },
};

function getTodayString(): string {
  return getLocalDateString();
}

// ----- Animated Book Button (Week 6: spring scale trên UI thread) -----
interface BookButtonProps {
  range: { start: string; end: string } | null;
  selectedCount: number;
  selectedDate: string;
  loading: boolean;
  onPress: () => void;
}

function BookButton({ range, selectedCount, selectedDate, loading, onPress }: BookButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shortDate = formatShortVietnameseDate(selectedDate);

  return (
    <View style={styles.bookingBar}>
      {range && (
        <View style={styles.rangeInfo}>
          <Text style={styles.rangeLabel}>
            {shortDate} · {selectedCount} tiếng
          </Text>
          <Text style={styles.rangeValue}>{range.start} → {range.end}</Text>
        </View>
      )}
      <Pressable
        onPressIn={() => { if (selectedCount > 0) scale.value = withSpring(0.95, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        disabled={selectedCount === 0 || loading}
        style={{ flex: 1 }}
      >
        <Animated.View style={[
          styles.bookBtn,
          selectedCount === 0 && styles.bookBtnDisabled,
          animStyle,
        ]}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.bookBtnText}>
                {selectedCount === 0 ? 'Chọn khung giờ' : 'Đặt phòng ngay'}
              </Text>
            </>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function RoomDetailScreen({ navigation, route }: Props) {
  const { room, initialDate } = route.params;
  const { uid } = useAuth();
  const { filters, setSelectedDate: setStoreDate } = useAppStore();
  const { addNotification } = useNotificationCenterStore();

  // Ngày mượn phòng được chọn (mặc định lấy từ param, store hoặc ngày hôm nay)
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || filters.selectedDate || getTodayString()
  );

  // Mục đích mượn phòng & số người tham gia (nâng tầm trải nghiệm thực tế)
  const [selectedPurpose, setSelectedPurpose] = useState<string>(BOOKING_PURPOSES[0].id);
  const [attendeesCount, setAttendeesCount] = useState<number>(
    Math.min(4, Math.max(1, room.capacity))
  );

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [booking, setBooking] = useState(false);

  // Đồng bộ Firestore real-time bookings cho phòng này theo NGÀY ĐƯỢC CHỌN
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    getRoomBookingsByDate(room.id, selectedDate, (bookings) => {
      setExistingBookings(bookings);
    }).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
  }, [room.id, selectedDate]);

  // Xử lý đổi ngày: Reset slots đã chọn của ngày cũ để tránh nhầm lẫn
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setStoreDate(date);
  };

  const handleToggleSlot = useCallback((slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }, []);

  const getTimeRange = () => {
    if (selectedSlots.length === 0) return null;
    const hours = selectedSlots.map((s) => parseInt(s.split(':')[0], 10)).sort((a, b) => a - b);
    return {
      start: `${String(hours[0]).padStart(2, '0')}:00`,
      end: `${String(hours[hours.length - 1] + 1).padStart(2, '0')}:00`,
      durationHours: hours.length,
    };
  };

  const promptBookingConfirm = () => {
    if (selectedSlots.length === 0) return;
    const r = getTimeRange();
    if (!r) return;

    const firstHour = parseInt(r.start.split(':')[0], 10);
    if (isSlotInPast(firstHour, selectedDate)) {
      appNotify.error(
        'Khung giờ không hợp lệ',
        'Khung giờ bạn chọn đã trôi qua. Vui lòng chọn khung giờ trống tiếp theo.'
      );
      return;
    }

    const purposeObj = BOOKING_PURPOSES.find((p) => p.id === selectedPurpose);
    const purposeLabel = purposeObj ? purposeObj.label : 'Học nhóm & Đồ án';

    appNotify.alert({
      type: 'warning',
      title: 'Xác nhận mượn phòng',
      message: 'Vui lòng kiểm tra lại thông tin mượn phòng học trước khi gửi yêu cầu:',
      details: {
        roomName: `${room.name} (${room.building})`,
        date: formatVietnameseDate(selectedDate),
        timeRange: `${r.start} → ${r.end} (${r.durationHours} tiếng)`,
        purpose: purposeLabel,
        attendees: `${attendeesCount} sinh viên`,
      },
      buttons: [
        { text: 'Kiểm tra lại', style: 'cancel' },
        { text: 'Xác nhận đặt', style: 'primary', onPress: handleBook },
      ],
    });
  };

  const handleBook = async () => {
    if (!uid || selectedSlots.length === 0) return;
    const range = getTimeRange();
    if (!range) return;

    const firstHour = parseInt(range.start.split(':')[0], 10);
    if (isSlotInPast(firstHour, selectedDate)) {
      appNotify.error(
        'Khung giờ không hợp lệ',
        'Khung giờ bạn chọn đã trôi qua. Vui lòng chọn khung giờ trống tiếp theo.'
      );
      return;
    }

    const purposeObj = BOOKING_PURPOSES.find((p) => p.id === selectedPurpose);
    const purposeLabel = purposeObj ? purposeObj.label : 'Học nhóm & Đồ án';

    setBooking(true);
    try {
      await createBooking({
        roomId: room.id,
        roomName: room.name,
        roomBuilding: room.building,
        userId: uid,
        date: selectedDate,
        startTime: range.start,
        endTime: range.end,
        status: 'upcoming',
        purpose: purposeLabel,
        attendeesCount,
      });

      // Tự động thêm thông báo vào Hộp thư thông báo của sinh viên
      addNotification({
        type: 'booking_success',
        title: 'Đặt phòng thành công! 🎉',
        message: `Bạn đã đặt thành công phòng ${room.name} (${room.building}) vào ngày ${formatVietnameseDate(selectedDate)} từ ${range.start} đến ${range.end}.`,
        data: {
          roomId: room.id,
          roomName: `${room.name} (${room.building})`,
          date: selectedDate,
          timeRange: `${range.start} → ${range.end}`,
        },
      });

      setSelectedSlots([]);

      appNotify.alert({
        type: 'success',
        title: 'Đặt phòng thành công! 🎉',
        message: 'Lịch mượn phòng học đã được cập nhật thành công vào hệ thống VKU.',
        details: {
          roomName: `${room.name} (${room.building})`,
          date: formatVietnameseDate(selectedDate),
          timeRange: `${range.start} → ${range.end} (${range.durationHours} tiếng)`,
          purpose: purposeLabel,
        },
        buttons: [
          {
            text: 'Về danh sách',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Xem lịch đã đặt',
            style: 'primary',
            onPress: () => {
              navigation.goBack();
              const parent = navigation.getParent();
              if (parent) {
                (parent as any).navigate('BookingsTab');
              } else {
                (navigation as any).navigate('BookingsTab');
              }
            },
          },
        ],
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      const errMsg = err?.message || 'Đặt phòng thất bại. Vui lòng thử lại.';
      appNotify.error('Không thể đặt phòng', errMsg);
    } finally {
      setBooking(false);
    }
  };

  const range = getTimeRange();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: room.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            placeholder={room.blurHash}
            transition={400}
          />
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomName}>{room.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.locationText}>{room.building} · Tầng {room.floor}</Text>
              </View>
            </View>
            <StatusBadge status={room.status} />
          </View>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color="#4F46E5" />
              <Text style={styles.statValue}>{room.capacity}</Text>
              <Text style={styles.statLabel}>Chỗ ngồi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="construct-outline" size={20} color="#4F46E5" />
              <Text style={styles.statValue}>{room.amenities.length}</Text>
              <Text style={styles.statLabel}>Tiện nghi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#4F46E5" />
              <Text style={styles.statValue}>3h</Text>
              <Text style={styles.statLabel}>Tối đa / lần</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả phòng</Text>
          <Text style={styles.description}>{room.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Tiện nghi trang bị</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a) => (
              <View key={a} style={styles.amenityItem}>
                <Ionicons
                  name={(AMENITY_INFO[a]?.icon ?? 'checkmark-outline') as any}
                  size={18}
                  color="#4F46E5"
                />
                <Text style={styles.amenityLabel}>{AMENITY_INFO[a]?.label ?? a}</Text>
              </View>
            ))}
          </View>

          {room.status === 'available' && (
            <>
              {/* 1. Thanh chọn ngày mượn phòng (Lên tới 14 ngày tới) */}
              <View style={styles.sectionCard}>
                <DateSelectorStrip
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  label="1. Chọn ngày mượn phòng"
                />
              </View>

              {/* 2. Bộ chọn khung giờ */}
              <View style={styles.sectionCard}>
                <TimeSlotPicker
                  selectedSlots={selectedSlots}
                  onToggleSlot={handleToggleSlot}
                  existingBookings={existingBookings}
                  date={selectedDate}
                />
              </View>

              {/* 3. Mục đích mượn phòng */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="bookmark-outline" size={16} color="#4F46E5" />
                  <Text style={styles.subSectionTitle}>3. Mục đích mượn phòng</Text>
                </View>
                <View style={styles.purposeGrid}>
                  {BOOKING_PURPOSES.map((p) => {
                    const isSelected = selectedPurpose === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setSelectedPurpose(p.id)}
                        style={[
                          styles.purposeChip,
                          isSelected && styles.purposeChipSelected,
                        ]}
                      >
                        <Ionicons
                          name={p.icon as any}
                          size={15}
                          color={isSelected ? '#FFFFFF' : p.color}
                        />
                        <Text
                          style={[
                            styles.purposeText,
                            isSelected && styles.purposeTextSelected,
                          ]}
                        >
                          {p.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 4. Số lượng sinh viên tham gia */}
              <View style={styles.sectionCard}>
                <View style={styles.attendeeHeaderRow}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="people-outline" size={16} color="#4F46E5" />
                    <Text style={styles.subSectionTitle}>4. Số người tham gia</Text>
                  </View>
                  <Text style={styles.capacityHint}>Tối đa {room.capacity} bạn</Text>
                </View>

                <View style={styles.stepperWrap}>
                  <Pressable
                    style={[
                      styles.stepperBtn,
                      attendeesCount <= 1 && styles.stepperBtnDisabled,
                    ]}
                    onPress={() => setAttendeesCount((c) => Math.max(1, c - 1))}
                    disabled={attendeesCount <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={attendeesCount <= 1 ? '#CBD5E1' : '#0F172A'}
                    />
                  </Pressable>

                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueText}>{attendeesCount}</Text>
                    <Text style={styles.stepperValueUnit}>sinh viên</Text>
                  </View>

                  <Pressable
                    style={[
                      styles.stepperBtn,
                      attendeesCount >= room.capacity && styles.stepperBtnDisabled,
                    ]}
                    onPress={() => setAttendeesCount((c) => Math.min(room.capacity, c + 1))}
                    disabled={attendeesCount >= room.capacity}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={attendeesCount >= room.capacity ? '#CBD5E1' : '#0F172A'}
                    />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* Book button — Animated spring scale (UI thread, chạy ở 60/120fps) */}
      {room.status === 'available' && (
        <BookButton
          range={range}
          selectedCount={selectedSlots.length}
          selectedDate={selectedDate}
          loading={booking}
          onPress={promptBookingConfirm}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 250, backgroundColor: '#E2E8F0' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  content: { padding: 18, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  roomName: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 13, color: '#64748B' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#F8FAFC',
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B' },
  statDivider: { width: 1, height: 36, backgroundColor: '#E2E8F0' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  description: { fontSize: 13, color: '#475569', lineHeight: 20 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10,
  },
  amenityLabel: { fontSize: 12, fontWeight: '600', color: '#3730A3' },
  sectionCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  purposeChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  purposeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  purposeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  attendeeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.5,
  },
  stepperValueBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  stepperValueText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperValueUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bookingBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', padding: 14,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  rangeInfo: { flex: 1 },
  rangeLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  rangeValue: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  bookBtn: {
    backgroundColor: '#4F46E5', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
    justifyContent: 'center',
  },
  bookBtnDisabled: { backgroundColor: '#C7D2FE' },
  bookBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});


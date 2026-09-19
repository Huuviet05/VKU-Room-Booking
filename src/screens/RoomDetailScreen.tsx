// src/screens/RoomDetailScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { Booking } from '../types';
import { createBooking, getRoomBookingsByDate } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import TimeSlotPicker from '../components/TimeSlotPicker';
import StatusBadge from '../components/StatusBadge';
import { RootStackParamList } from '../navigation/AppNavigator';

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
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function RoomDetailScreen({ navigation, route }: Props) {
  const { room } = route.params;
  const { uid } = useAuth();

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [booking, setBooking] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const today = getTodayString();

  // Real-time bookings cho phòng này hôm nay
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    getRoomBookingsByDate(room.id, today, (bookings) => {
      setExistingBookings(bookings);
    }).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
  }, [room.id, today]);

  const handleToggleSlot = useCallback((slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }, []);

  const getTimeRange = () => {
    if (selectedSlots.length === 0) return null;
    const hours = selectedSlots.map((s) => parseInt(s.split(':')[0])).sort((a, b) => a - b);
    return {
      start: `${String(hours[0]).padStart(2, '0')}:00`,
      end: `${String(hours[hours.length - 1] + 1).padStart(2, '0')}:00`,
    };
  };

  const handleBook = async () => {
    if (!uid || selectedSlots.length === 0) return;
    const range = getTimeRange();
    if (!range) return;

    setBooking(true);
    setConfirmVisible(false);
    try {
      await createBooking({
        roomId: room.id,
        roomName: room.name,
        roomBuilding: room.building,
        userId: uid,
        date: today,
        startTime: range.start,
        endTime: range.end,
        status: 'upcoming',
      });
      setSelectedSlots([]);

      const msg = `Phòng: ${room.name}\nThời gian: ${range.start} → ${range.end}`;
      if (Platform.OS === 'web') {
        window.alert(`✅ Đặt phòng thành công!\n\n${msg}`);
        navigation.goBack();
      } else {
        Alert.alert('✅ Đặt phòng thành công!', msg, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      const errMsg = err?.message || 'Đặt phòng thất bại. Vui lòng thử lại.';
      if (Platform.OS === 'web') {
        window.alert(`❌ Lỗi: ${errMsg}`);
      } else {
        Alert.alert('Lỗi', errMsg);
      }
    } finally {
      setBooking(false);
    }
  };

  const range = getTimeRange();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Hero */}
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

          {/* Stats */}
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
              <Text style={styles.statLabel}>Tối đa</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{room.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Tiện nghi</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a) => (
              <View key={a} style={styles.amenityItem}>
                <Ionicons
                  name={(AMENITY_INFO[a]?.icon ?? 'checkmark-outline') as any}
                  size={22}
                  color="#4F46E5"
                />
                <Text style={styles.amenityLabel}>{AMENITY_INFO[a]?.label ?? a}</Text>
              </View>
            ))}
          </View>

          {/* Time Slot Picker */}
          {room.status === 'available' && (
            <>
              <Text style={styles.sectionTitle}>Khung giờ hôm nay ({today})</Text>
              <TimeSlotPicker
                selectedSlots={selectedSlots}
                onToggleSlot={handleToggleSlot}
                existingBookings={existingBookings}
              />
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Book button */}
      {room.status === 'available' && (
        <View style={styles.bookingBar}>
          {range && (
            <View style={styles.rangeInfo}>
              <Text style={styles.rangeLabel}>Đã chọn</Text>
              <Text style={styles.rangeValue}>{range.start} → {range.end}</Text>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.bookBtn,
              selectedSlots.length === 0 && styles.bookBtnDisabled,
              pressed && selectedSlots.length > 0 && styles.bookBtnPressed,
            ]}
            onPress={() => selectedSlots.length > 0 && setConfirmVisible(true)}
            disabled={selectedSlots.length === 0 || booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.bookBtnText}>
                  {selectedSlots.length === 0 ? 'Chọn khung giờ' : 'Đặt phòng ngay'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Confirm Modal */}
      <Modal visible={confirmVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Xác nhận đặt phòng</Text>
            <View style={styles.modalInfo}>
              <Text style={styles.modalRoom}>{room.name}</Text>
              <Text style={styles.modalDetail}>📍 {room.building}</Text>
              <Text style={styles.modalDetail}>📅 {today}</Text>
              {range && <Text style={styles.modalDetail}>🕐 {range.start} → {range.end}</Text>}
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleBook}>
                <Text style={styles.confirmText}>Xác nhận</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 260, backgroundColor: '#E2E8F0' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  content: { padding: 20, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
  roomName: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 13, color: '#64748B' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#F8FAFC',
    borderRadius: 16, padding: 16, marginVertical: 12, alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B' },
  statDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 8, marginBottom: 8 },
  description: { fontSize: 14, color: '#475569', lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12,
  },
  amenityLabel: { fontSize: 13, fontWeight: '500', color: '#3730A3' },
  bookingBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', padding: 16,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 8,
  },
  rangeInfo: { flex: 1 },
  rangeLabel: { fontSize: 11, color: '#94A3B8' },
  rangeValue: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  bookBtn: {
    backgroundColor: '#4F46E5', borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
    justifyContent: 'center',
  },
  bookBtnDisabled: { backgroundColor: '#C7D2FE' },
  bookBtnPressed: { opacity: 0.85 },
  bookBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  modalInfo: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 6,
  },
  modalRoom: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  modalDetail: { fontSize: 14, color: '#475569' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  confirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#4F46E5', alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

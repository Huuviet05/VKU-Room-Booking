// src/screens/MyBookingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, SectionList, StyleSheet,
  Alert, ActivityIndicator, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeInRight,
  FadeOutLeft,
} from 'react-native-reanimated';

import { Booking } from '../types';
import { subscribeToUserBookings, cancelBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import { appNotify } from '../store/useNotificationStore';

// ----- SwipeToCancel BookingCard -----
function BookingCard({
  booking,
  onCancel,
  index,
}: {
  booking: Booking;
  onCancel: () => void;
  index: number;
}) {
  const isUpcoming = booking.status === 'upcoming';
  const isCancelled = booking.status === 'cancelled';

  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // Hàm hiển thị xác nhận hủy phòng với phong cách riêng của VKU
  const triggerCancel = () => {
    appNotify.alert({
      type: 'warning',
      title: 'Hủy lịch đặt phòng?',
      message: 'Bạn có chắc chắn muốn hủy lịch mượn phòng này? Khung giờ sẽ được giải phóng cho sinh viên khác.',
      details: {
        roomName: booking.roomName,
        timeRange: `${booking.startTime} → ${booking.endTime}`,
        date: booking.date,
      },
      buttons: [
        {
          text: 'Giữ lại',
          style: 'cancel',
          onPress: () => {
            translateX.value = withSpring(0);
          },
        },
        {
          text: 'Hủy phòng ngay',
          style: 'destructive',
          onPress: () => {
            onCancel();
            appNotify.toast('Đã hủy lịch đặt phòng thành công', 'info');
          },
        },
      ],
    });
    translateX.value = withSpring(0);
  };

  // Pan gesture (Swipe left to cancel) — chạy trên native thread
  const pan = Gesture.Pan()
    .enabled(isUpcoming)
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      // Chỉ cho phép vuốt sang trái (giá trị âm)
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -100) {
        // Vuốt đủ xa → gọi hủy trên JS thread
        runOnJS(triggerCancel)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  // Màu indicator dọc theo trạng thái
  const indicatorColor = isUpcoming ? '#4F46E5' : isCancelled ? '#94A3B8' : '#22C55E';

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).springify()}
      style={{ overflow: 'hidden' }}
    >
      {/* Background hint khi đang vuốt trái */}
      {isUpcoming && (
        <View style={styles.swipeBg}>
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.swipeBgText}>Hủy đặt</Text>
        </View>
      )}

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.bookingCard,
            isCancelled && styles.cardCancelled,
            cardStyle,
          ]}
        >
          <View style={styles.bookingLeft}>
            <View style={[styles.statusLine, { backgroundColor: indicatorColor }]} />
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingRoom} numberOfLines={1}>{booking.roomName}</Text>
              <Text style={styles.bookingBuilding}>{booking.roomBuilding}</Text>
              <View style={styles.bookingMeta}>
                <Ionicons name="calendar-outline" size={12} color="#64748B" />
                <Text style={styles.bookingMetaText}>{booking.date}</Text>
                <Ionicons name="time-outline" size={12} color="#64748B" />
                <Text style={styles.bookingMetaText}>{booking.startTime} → {booking.endTime}</Text>
              </View>
            </View>
          </View>

          {isUpcoming && (
            <Pressable
              onPress={triggerCancel}
              style={({ pressed }) => [
                styles.swipeHint,
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={13} color="#EF4444" />
              <Text style={[styles.swipeHintText, { color: '#EF4444', fontWeight: '600' }]}>
                {Platform.OS === 'web' ? 'Hủy phòng' : 'Vuốt để hủy'}
              </Text>
            </Pressable>
          )}
          {!isUpcoming && (
            <View style={[styles.statusBadge, {
              backgroundColor: isCancelled ? '#F1F5F9' : '#DCFCE7',
            }]}>
              <Text style={[styles.statusBadgeText, {
                color: isCancelled ? '#94A3B8' : '#15803D',
              }]}>
                {isCancelled ? 'Đã hủy' : 'Hoàn thành'}
              </Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

// ----- Main Screen -----
export default function MyBookingsScreen() {
  const { uid, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToUserBookings(uid, (data) => {
      setBookings(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
  };

  const today = new Date().toISOString().split('T')[0];

  const upcoming = bookings.filter(
    (b) => b.status === 'upcoming' && b.date >= today
  );
  const past = bookings.filter(
    (b) => b.status !== 'upcoming' || b.date < today
  );

  const sections = [
    ...(upcoming.length > 0 ? [{ title: 'Sắp tới', data: upcoming }] : []),
    ...(past.length > 0 ? [{ title: 'Lịch sử', data: past }] : []),
  ];

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Đặt phòng của tôi</Text>
          <Text style={styles.subtitle}>{bookings.length} lần đặt phòng</Text>
        </View>

        {bookings.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Chưa có đặt phòng nào"
            subtitle="Hãy tìm phòng học phù hợp và đặt ngay nhé!"
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <BookingCard
                booking={item}
                index={index}
                onCancel={() => handleCancel(item.id)}
              />
            )}
            renderSectionHeader={({ section: { title, data } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionCount}>{data.length}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, marginTop: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  sectionCount: {
    fontSize: 12, fontWeight: '700', color: '#4F46E5',
    backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10,
  },
  // Nền đỏ lộ ra khi vuốt trái
  swipeBg: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: 100,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeBgText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bookingCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    shadowColor: '#1E293B', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardCancelled: { opacity: 0.6 },
  bookingLeft: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  statusLine: { width: 4, height: 50, borderRadius: 2 },
  bookingInfo: { flex: 1, gap: 3 },
  bookingRoom: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  bookingBuilding: { fontSize: 12, color: '#64748B' },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  bookingMetaText: { fontSize: 12, color: '#64748B' },
  swipeHint: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 8 },
  swipeHintText: { fontSize: 10, color: '#CBD5E1' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
});

// src/screens/MyBookingsScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  FadeInRight,
} from 'react-native-reanimated';

import { Booking, BookingStatus } from '../types';
import { subscribeToUserBookings, cancelBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import { appNotify } from '../store/useNotificationStore';
import {
  getBookingEffectiveStatus,
  canCancelBooking,
} from '../utils/bookingLogic';

type FilterType = 'all' | 'upcoming' | 'history';

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; bg: string; text: string; indicator: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  in_progress: {
    label: 'Đang diễn ra',
    bg: '#DCFCE7',
    text: '#15803D',
    indicator: '#16A34A',
    icon: 'time',
  },
  upcoming: {
    label: 'Sắp tới',
    bg: '#EEF2FF',
    text: '#4F46E5',
    indicator: '#4F46E5',
    icon: 'calendar',
  },
  completed: {
    label: 'Đã kết thúc',
    bg: '#F1F5F9',
    text: '#475569',
    indicator: '#94A3B8',
    icon: 'checkmark-done-circle',
  },
  cancelled: {
    label: 'Đã hủy',
    bg: '#FEE2E2',
    text: '#DC2626',
    indicator: '#EF4444',
    icon: 'close-circle',
  },
};

// ----- BookingCard Component -----
function BookingCard({
  booking,
  onCancel,
  index,
}: {
  booking: Booking;
  onCancel: () => void;
  index: number;
}) {
  const effectiveStatus = getBookingEffectiveStatus(booking);
  const canCancel = canCancelBooking(booking);
  const statusCfg = STATUS_CONFIG[effectiveStatus];

  const translateX = useSharedValue(0);

  // Hiển thị hộp thoại xác nhận hủy lịch mượn phòng chuẩn VKU
  const triggerCancel = () => {
    appNotify.alert({
      type: 'warning',
      title: 'Hủy lịch đặt phòng?',
      message: 'Bạn có chắc chắn muốn hủy lịch mượn phòng này? Khung giờ sẽ được giải phóng ngay lập tức cho sinh viên khác.',
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

  // Pan gesture (Chỉ cho phép vuốt khi ca học CHƯA diễn ra)
  const pan = Gesture.Pan()
    .enabled(canCancel)
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -90) {
        runOnJS(triggerCancel)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).springify().damping(14)}
      style={{ overflow: 'hidden', borderRadius: 16 }}
    >
      {/* Nền đỏ hiện ra khi swipe sang trái */}
      {canCancel && (
        <View style={styles.swipeBg}>
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.swipeBgText}>Hủy</Text>
        </View>
      )}

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.bookingCard,
            effectiveStatus === 'cancelled' && styles.cardCancelled,
            cardStyle,
          ]}
        >
          {/* Cột trái: vạch trạng thái + thông tin ca mượn */}
          <View style={styles.bookingLeft}>
            <View style={[styles.statusLine, { backgroundColor: statusCfg.indicator }]} />
            <View style={styles.bookingInfo}>
              <View style={styles.roomHeaderRow}>
                <Text style={styles.bookingRoom} numberOfLines={1}>
                  {booking.roomName}
                </Text>
                {effectiveStatus === 'in_progress' && (
                  <View style={styles.livePulseBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>ĐANG HỌC</Text>
                  </View>
                )}
              </View>

              <Text style={styles.bookingBuilding}>
                {booking.roomBuilding ? `Tòa ${booking.roomBuilding}` : 'Khu giảng đường VKU'}
              </Text>

              <View style={styles.bookingMeta}>
                <Ionicons name="calendar-outline" size={12} color="#64748B" />
                <Text style={styles.bookingMetaText}>{booking.date}</Text>
                <Ionicons name="time-outline" size={12} color="#64748B" />
                <Text style={styles.bookingMetaText}>
                  {booking.startTime} → {booking.endTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Cột phải: Nút hủy hoặc Badge trạng thái */}
          <View style={styles.bookingRight}>
            {canCancel ? (
              <Pressable
                onPress={triggerCancel}
                style={({ pressed }) => [
                  styles.cancelActionBtn,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                ]}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={13} color="#EF4444" />
                <Text style={styles.cancelActionText}>
                  {Platform.OS === 'web' ? 'Hủy phòng' : 'Vuốt để hủy'}
                </Text>
              </Pressable>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                <Ionicons name={statusCfg.icon} size={12} color={statusCfg.text} />
                <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                  {statusCfg.label}
                </Text>
              </View>
            )}
          </View>
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
  const [filter, setFilter] = useState<FilterType>('all');

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

  // Phân loại bookings theo đúng thực tế logic thời gian
  const { ongoing, upcoming, history } = useMemo(() => {
    const on: Booking[] = [];
    const up: Booking[] = [];
    const hist: Booking[] = [];

    bookings.forEach((b) => {
      const status = getBookingEffectiveStatus(b);
      if (status === 'in_progress') {
        on.push(b);
      } else if (status === 'upcoming') {
        up.push(b);
      } else {
        hist.push(b);
      }
    });

    return { ongoing: on, upcoming: up, history: hist };
  }, [bookings]);

  // Tạo các section hiển thị theo bộ lọc
  const sections = useMemo(() => {
    const list: { title: string; data: Booking[]; tagColor: string }[] = [];

    if (filter === 'all' || filter === 'upcoming') {
      if (ongoing.length > 0) {
        list.push({ title: 'Đang diễn ra', data: ongoing, tagColor: '#16A34A' });
      }
      if (upcoming.length > 0) {
        list.push({ title: 'Sắp tới', data: upcoming, tagColor: '#4F46E5' });
      }
    }

    if (filter === 'all' || filter === 'history') {
      if (history.length > 0) {
        list.push({ title: 'Lịch sử mượn phòng', data: history, tagColor: '#64748B' });
      }
    }

    return list;
  }, [filter, ongoing, upcoming, history]);

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const activeCount = ongoing.length + upcoming.length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Đặt phòng của tôi</Text>
          <Text style={styles.subtitle}>
            {bookings.length} lần đặt · {activeCount} ca đang & sắp hoạt động
          </Text>

          {/* Quick Filter Tabs */}
          <View style={styles.filterTabsRow}>
            <Pressable
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'all' && styles.filterChipTextActive,
                ]}
              >
                Tất cả ({bookings.length})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.filterChip, filter === 'upcoming' && styles.filterChipActive]}
              onPress={() => setFilter('upcoming')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'upcoming' && styles.filterChipTextActive,
                ]}
              >
                Sắp tới ({activeCount})
              </Text>
            </Pressable>

            <Pressable
              style={[styles.filterChip, filter === 'history' && styles.filterChipActive]}
              onPress={() => setFilter('history')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'history' && styles.filterChipTextActive,
                ]}
              >
                Lịch sử ({history.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Danh sách */}
        {bookings.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Chưa có đặt phòng nào"
            subtitle="Hãy tìm phòng học phù hợp và đặt ngay nhé!"
          />
        ) : sections.length === 0 ? (
          <EmptyState
            icon="filter-outline"
            title="Không có lịch đặt phù hợp"
            subtitle="Thử chuyển sang tab bộ lọc khác."
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
            renderSectionHeader={({ section: { title, data, tagColor } }) => (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionBullet, { backgroundColor: tagColor }]} />
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <Text style={[styles.sectionCount, { color: tagColor }]}>{data.length}</Text>
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
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 12 },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionBullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Nền đỏ lộ ra khi vuốt trái
  swipeBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  swipeBgText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardCancelled: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  bookingLeft: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  statusLine: { width: 4, height: 48, borderRadius: 2 },
  bookingInfo: { flex: 1, gap: 3 },
  roomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingRoom: { fontSize: 15, fontWeight: '700', color: '#0F172A', flexShrink: 1 },
  livePulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  bookingBuilding: { fontSize: 12, color: '#64748B' },
  bookingMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2 },
  bookingMetaText: { fontSize: 12, color: '#64748B' },
  bookingRight: {
    paddingLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

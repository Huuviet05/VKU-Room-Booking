// src/screens/MyBookingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, SectionList, StyleSheet, Pressable,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Booking } from '../types';
import { subscribeToUserBookings, cancelBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const isUpcoming = booking.status === 'upcoming';
  const isCancelled = booking.status === 'cancelled';

  return (
    <View style={[styles.bookingCard, isCancelled && styles.cardCancelled]}>
      <View style={styles.bookingLeft}>
        <View style={[styles.statusLine, {
          backgroundColor: isUpcoming ? '#4F46E5' : isCancelled ? '#94A3B8' : '#22C55E',
        }]} />
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
          style={styles.cancelBtn}
          onPress={onCancel}
          hitSlop={8}
        >
          <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
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
    </View>
  );
}

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

  const handleCancel = (bookingId: string, roomName: string) => {
    Alert.alert(
      'Hủy đặt phòng',
      `Bạn có chắc muốn hủy đặt phòng ${roomName}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đặt phòng',
          style: 'destructive',
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
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
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onCancel={() => handleCancel(item.id, item.roomName)}
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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 8 },
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
  cancelBtn: { padding: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
});

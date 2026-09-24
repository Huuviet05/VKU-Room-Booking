// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { appNotify } from '../store/useNotificationStore';
import { Booking } from '../types';
import { subscribeToUserBookings } from '../services/bookingService';
import { getBookingEffectiveStatus, calculateBookingHours } from '../utils/bookingLogic';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}
function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}
function MenuItem({ icon, label, onPress, destructive }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: destructive ? '#FEF2F2' : '#F1F5F9' }]}>
        <Ionicons name={icon} size={18} color={destructive ? '#EF4444' : '#475569'} />
      </View>
      <Text style={[styles.menuLabel, destructive && { color: '#EF4444' }]}>{label}</Text>
      {!destructive && (
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { uid } = useAuth();
  const shortId = uid ? uid.slice(0, 8).toUpperCase() : '--------';
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Lắng nghe dữ liệu booking thời gian thực của user
  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToUserBookings(uid, (data) => {
      setUserBookings(data);
    });
    return unsubscribe;
  }, [uid]);

  // Tính toán số liệu thống kê thực tế theo đúng dòng thời gian
  const upcomingCount = userBookings.filter(
    (b) => getBookingEffectiveStatus(b) === 'upcoming' || getBookingEffectiveStatus(b) === 'in_progress'
  ).length;
  const totalBookings = userBookings.length;
  const totalHours = userBookings
    .filter((b) => getBookingEffectiveStatus(b) !== 'cancelled')
    .reduce((sum, b) => sum + calculateBookingHours(b), 0);

  const handleAbout = () => {
    appNotify.alert({
      type: 'info',
      title: 'VKU Room Booking',
      message: 'Ứng dụng quản lý & mượn phòng học thông minh dành cho sinh viên trường Đại học CNTT & TT Việt - Hàn (VKU).',
      details: {
        roomName: 'Nguyễn Hữu Việt (23IT309)',
        building: 'Khoa Công nghệ Thông tin',
        timeRange: 'Học phần: Lập trình đa nền tảng',
        date: 'Phiên bản v1.0.0 · Expo SDK 57',
      },
      buttons: [{ text: 'Đóng', style: 'primary' }],
    });
  };

  const handleGuide = () => {
    appNotify.alert({
      type: 'info',
      title: 'Quy trình mượn phòng VKU',
      message: '1. Tra cứu phòng học theo khu A, V, hoặc tiện ích mong muốn.\n2. Chọn các khung giờ rảnh trong ngày hôm nay.\n3. Nhấn "Đặt phòng ngay" và xác nhận.\n4. Theo dõi và hủy phòng thuận tiện tại tab "Lịch của tôi".',
      buttons: [{ text: 'Đã hiểu', style: 'primary' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#4F46E5" />
            </View>
          </View>
          <Text style={styles.userName}>Nguyễn Hữu Việt</Text>
          <Text style={styles.userId}>MSSV: 23IT309 · Phiên: {shortId}</Text>
          <View style={styles.anonBadge}>
            <Ionicons name="lock-closed-outline" size={12} color="#7C3AED" />
            <Text style={styles.anonText}>Dữ liệu đồng bộ Firebase Realtime</Text>
          </View>
        </View>

        {/* Stats - Dữ liệu thực tế được tính toán từ các lịch mượn phòng */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="calendar-outline"
            value={totalBookings > 0 ? String(totalBookings) : '0'}
            label="Lịch mượn"
            color="#4F46E5"
          />
          <StatCard
            icon="time-outline"
            value={totalHours > 0 ? `${totalHours}h` : '0h'}
            label="Giờ đã học"
            color="#0EA5E9"
          />
          <StatCard
            icon="checkmark-circle-outline"
            value={upcomingCount > 0 ? String(upcomingCount) : '0'}
            label="Sắp tới"
            color="#10B981"
          />
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin sinh viên</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sinh viên</Text>
              <Text style={styles.infoValue}>Nguyễn Hữu Việt</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã sinh viên</Text>
              <Text style={styles.infoValue}>23IT309</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trường</Text>
              <Text style={styles.infoValue}>Đại học VKU</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khoa</Text>
              <Text style={styles.infoValue}>Công nghệ thông tin</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Môn học</Text>
              <Text style={styles.infoValue}>Lập trình đa nền tảng</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tiến độ</Text>
              <Text style={styles.infoValue}>Week 6 — State & Animations</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Thông báo"
              onPress={() => appNotify.toast('Tính năng nhận thông báo đẩy đang được phát triển', 'info')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="help-circle-outline"
              label="Hướng dẫn sử dụng"
              onPress={handleGuide}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="information-circle-outline"
              label="Về ứng dụng"
              onPress={handleAbout}
            />
          </View>
        </View>

        {/* Tech stack badge */}
        <View style={styles.techStack}>
          <Text style={styles.techTitle}>🛠 Tech Stack</Text>
          <View style={styles.techChips}>
            {['React Native', 'Expo', 'Firebase', 'TypeScript', 'Zustand'].map((t) => (
              <View key={t} style={styles.techChip}>
                <Text style={styles.techChipText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  profileHeader: {
    alignItems: 'center', paddingTop: 24, paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  userId: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontFamily: 'monospace' },
  anonBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 10, backgroundColor: '#F5F3FF',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  anonText: { fontSize: 12, color: '#7C3AED', fontWeight: '500' },
  statsContainer: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8,
  },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 4,
    borderTopWidth: 3,
    shadowColor: '#1E293B', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B' },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoCard: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 4,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
  },
  infoLabel: { fontSize: 13, color: '#64748B' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  infoDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 14 },
  menuCard: { backgroundColor: '#F8FAFC', borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 14,
  },
  menuItemPressed: { backgroundColor: '#F1F5F9' },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1E293B' },
  menuDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 14 },
  techStack: { marginTop: 20, paddingHorizontal: 16, alignItems: 'center' },
  techTitle: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 10 },
  techChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  techChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  techChipText: { fontSize: 11, fontWeight: '600', color: '#475569' },
});

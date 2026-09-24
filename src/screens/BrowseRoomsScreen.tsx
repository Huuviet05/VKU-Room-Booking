// src/screens/BrowseRoomsScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Room } from '../types';
import { subscribeToRooms } from '../services/roomService';
import { useAppStore } from '../store/useAppStore';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import RoomCard from '../components/RoomCard';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import EmptyState from '../components/EmptyState';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BrowseRooms'>;
};

export default function BrowseRoomsScreen({ navigation }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {
    filters,
    setSearch,
    setBuilding,
    toggleAmenity,
    setMinCapacity,
    setStatusFilter,
    resetFilters,
  } = useAppStore();

  const { columns, cardWidth, horizontalPadding } = useResponsiveLayout();

  // Lắng nghe dữ liệu phòng thời gian thực từ Firestore
  useEffect(() => {
    const unsubscribe = subscribeToRooms((data) => {
      setRooms(data);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(() => setRefreshing(true), []);

  // Bộ lọc đa chiều: Từ khóa + Tòa nhà + Sức chứa + Tiện nghi + Trạng thái
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // 1. Tìm kiếm theo tên hoặc khu nhà
      const searchMatch =
        !filters.search ||
        room.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.building.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.description.toLowerCase().includes(filters.search.toLowerCase());

      // 2. Lọc theo khu tòa nhà
      const buildingMatch =
        !filters.building ||
        filters.building === 'all' ||
        room.building === filters.building;

      // 3. Lọc theo tiện ích (phải đáp ứng tất cả tiện ích đã chọn)
      const amenityMatch =
        filters.amenities.length === 0 ||
        filters.amenities.every((a) => room.amenities.includes(a));

      // 4. Lọc theo sức chứa tối thiểu
      const capacityMatch = room.capacity >= filters.minCapacity;

      // 5. Lọc theo trạng thái phòng (còn trống / bảo trì / đang dùng)
      const statusMatch =
        filters.statusFilter === 'all' || room.status === filters.statusFilter;

      return searchMatch && buildingMatch && amenityMatch && capacityMatch && statusMatch;
    });
  }, [rooms, filters]);

  const hasActiveFilters =
    filters.amenities.length > 0 ||
    filters.minCapacity > 0 ||
    filters.statusFilter !== 'all' ||
    (Boolean(filters.building) && filters.building !== 'all');

  const availableCount = rooms.filter((r) => r.status === 'available').length;

  const renderRoom = ({ item, index }: { item: Room; index: number }) => (
    <RoomCard
      room={item}
      index={index}
      cardWidth={columns > 1 ? cardWidth : undefined}
      onPress={() => navigation.navigate('RoomDetail', { room: item })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải phòng học VKU...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Banner & Header */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.campusTagRow}>
          <View style={styles.vkuLogoWrap}>
            <Ionicons name="school" size={13} color="#4F46E5" />
          </View>
          <Text style={styles.campusTagText}>TRƯỜNG ĐH CNTT & TT VIỆT - HÀN (VKU)</Text>
          <View style={styles.badgeLive}>
            <View style={styles.badgeLiveDot} />
            <Text style={styles.badgeLiveText}>{availableCount} phòng trống</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Khám phá phòng học</Text>
        <Text style={styles.subTitle}>
          Mượn phòng máy tính, giảng đường và không gian học tập công nghệ cao
        </Text>

        {/* Thanh tìm kiếm */}
        <View style={styles.searchWrap}>
          <SearchBar value={filters.search} onChangeText={setSearch} />
        </View>
      </View>

      {/* Bộ lọc đa dạng: Khu nhà + Tiện nghi + Sức chứa */}
      <View style={{ paddingHorizontal: horizontalPadding }}>
        <FilterChips
          selectedAmenities={filters.amenities}
          statusFilter={filters.statusFilter}
          minCapacity={filters.minCapacity}
          selectedBuilding={filters.building}
          onSelectBuilding={setBuilding}
          onToggleAmenity={toggleAmenity}
          onSetStatus={setStatusFilter}
          onSetCapacity={setMinCapacity}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      {/* Danh sách phòng */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Không tìm thấy phòng phù hợp"
          subtitle="Thử đổi từ khóa hoặc nhấn 'Xóa lọc' để xem toàn bộ phòng học."
        />
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          numColumns={columns}
          key={columns}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={6}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4F46E5']}
              tintColor="#4F46E5"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  campusTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  vkuLogoWrap: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  badgeLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  badgeLiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
    lineHeight: 16,
  },
  searchWrap: {
    marginBottom: 4,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 36,
  },
  columnWrapper: {
    gap: 14,
  },
});

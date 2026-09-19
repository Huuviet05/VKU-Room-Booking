// src/screens/BrowseRoomsScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, FlatList, Text, StyleSheet, StatusBar,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

  const { filters, setSearch, toggleAmenity, setMinCapacity, setStatusFilter, resetFilters } = useAppStore();
  const { columns, cardWidth, horizontalPadding } = useResponsiveLayout();

  // Subscribe real-time
  useEffect(() => {
    const unsubscribe = subscribeToRooms((data) => {
      setRooms(data);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(() => setRefreshing(true), []);

  // Filter logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const searchMatch =
        !filters.search ||
        room.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.building.toLowerCase().includes(filters.search.toLowerCase());

      const amenityMatch =
        filters.amenities.length === 0 ||
        filters.amenities.every((a) => room.amenities.includes(a));

      const capacityMatch = room.capacity >= filters.minCapacity;

      const statusMatch =
        filters.statusFilter === 'all' || room.status === filters.statusFilter;

      return searchMatch && amenityMatch && capacityMatch && statusMatch;
    });
  }, [rooms, filters]);

  const hasActiveFilters =
    filters.amenities.length > 0 ||
    filters.minCapacity > 0 ||
    filters.statusFilter !== 'all';

  const renderRoom = ({ item }: { item: Room }) => (
    <RoomCard
      room={item}
      cardWidth={columns > 1 ? cardWidth : undefined}
      onPress={() => navigation.navigate('RoomDetail', { room: item })}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.titleRow}>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.resultCount}>{filteredRooms.length} phòng</Text>
        </View>
        <Text style={styles.title}>Đặt phòng học</Text>
        <View style={styles.searchWrap}>
          <SearchBar
            value={filters.search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter chips */}
      <FilterChips
        selectedAmenities={filters.amenities}
        statusFilter={filters.statusFilter}
        minCapacity={filters.minCapacity}
        onToggleAmenity={toggleAmenity}
        onSetStatus={setStatusFilter}
        onSetCapacity={setMinCapacity}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Room list */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Không tìm thấy phòng"
          subtitle="Thử thay đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm phòng học."
        />
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          numColumns={columns}
          key={columns} // Force remount when columns change
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B' },
  header: { paddingTop: 8, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#64748B' },
  resultCount: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 14, marginTop: 2 },
  searchWrap: {},
  listContent: { paddingTop: 12, paddingBottom: 32 },
  columnWrapper: { gap: 12 },
});

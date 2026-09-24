// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterState, Amenity, RoomStatus, RoomType, CapacityRange } from '../types';
import { getLocalDateString } from '../utils/bookingLogic';

interface AppStore {
  filters: FilterState;
  setSearch: (search: string) => void;
  setBuilding: (building: string) => void;
  setSelectedDate: (date: string) => void;
  setRoomType: (roomType: RoomType) => void;
  setCapacityRange: (capacityRange: CapacityRange) => void;
  toggleAmenity: (amenity: Amenity) => void;
  setMinCapacity: (capacity: number) => void;
  setStatusFilter: (status: RoomStatus | 'all') => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  search: '',
  building: 'all',
  selectedDate: getLocalDateString(),
  roomType: 'all',
  capacityRange: 'all',
  amenities: [],
  minCapacity: 0,
  statusFilter: 'all',
};

// Zustand store với persist middleware: Lưu các tùy chọn lọc vào AsyncStorage
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,

      setSearch: (search) =>
        set((state) => ({ filters: { ...state.filters, search } })),

      setBuilding: (building) =>
        set((state) => ({ filters: { ...state.filters, building } })),

      setSelectedDate: (selectedDate) =>
        set((state) => ({ filters: { ...state.filters, selectedDate } })),

      setRoomType: (roomType) =>
        set((state) => ({ filters: { ...state.filters, roomType } })),

      setCapacityRange: (capacityRange) =>
        set((state) => ({ filters: { ...state.filters, capacityRange } })),

      toggleAmenity: (amenity) =>
        set((state) => {
          const current = state.filters.amenities;
          const updated = current.includes(amenity)
            ? current.filter((a) => a !== amenity)
            : [...current, amenity];
          return { filters: { ...state.filters, amenities: updated } };
        }),

      setMinCapacity: (minCapacity) =>
        set((state) => ({ filters: { ...state.filters, minCapacity } })),

      setStatusFilter: (statusFilter) =>
        set((state) => ({ filters: { ...state.filters, statusFilter } })),

      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'vku-filter-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        filters: {
          ...state.filters,
          search: '', // Luôn reset từ khóa tìm kiếm khi mở lại app
        },
      }),
    }
  )
);

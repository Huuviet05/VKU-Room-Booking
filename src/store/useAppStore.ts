// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterState, Amenity, RoomStatus } from '../types';

interface AppStore {
  filters: FilterState;
  setSearch: (search: string) => void;
  toggleAmenity: (amenity: Amenity) => void;
  setMinCapacity: (capacity: number) => void;
  setStatusFilter: (status: RoomStatus | 'all') => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  search: '',
  amenities: [],
  minCapacity: 0,
  statusFilter: 'all',
};

// Zustand store với persist middleware: Lưu bộ lọc vào AsyncStorage
// Khi tắt app và mở lại, bộ lọc sẽ được khôi phục tự động
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,

      setSearch: (search) =>
        set((state) => ({ filters: { ...state.filters, search } })),

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
      name: 'vku-filter-storage', // Tên key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist filters (không persist search để tránh nhầm lẫn)
      partialize: (state) => ({
        filters: {
          ...state.filters,
          search: '', // Reset search mỗi lần mở app
        },
      }),
    }
  )
);

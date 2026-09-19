// src/store/useAppStore.ts
import { create } from 'zustand';
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

export const useAppStore = create<AppStore>((set) => ({
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
}));

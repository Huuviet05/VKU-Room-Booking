// src/types/index.ts

export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export type Amenity = 'projector' | 'ac' | 'whiteboard' | 'printer' | 'computer' | 'camera';

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  amenities: Amenity[];
  imageUrl: string;
  blurHash: string;
  status: RoomStatus;
  description: string;
}

export interface TimeSlot {
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomBuilding: string;
  userId: string;
  date: string;       // "2026-09-19"
  startTime: string;  // "09:00"
  endTime: string;    // "11:00"
  status: BookingStatus;
  createdAt: number;  // timestamp ms
}

export interface FilterState {
  search: string;
  amenities: Amenity[];
  minCapacity: number;
  statusFilter: RoomStatus | 'all';
}

// src/types/index.ts

export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type BookingStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export type Amenity =
  | 'projector'
  | 'ac'
  | 'whiteboard'
  | 'printer'
  | 'computer'
  | 'camera'
  | 'sound_system'
  | 'smart_board'
  | 'wifi6'
  | 'vr_headset';

export type RoomType =
  | 'all'
  | 'lab'          // Phòng máy tính & Lab chuyên sâu
  | 'lecture'      // Giảng đường & Hội trường lớn
  | 'seminar'      // Phòng Seminar & Báo cáo đồ án
  | 'discussion'   // Phòng thảo luận nhóm & Không gian mở
  | 'studio';      // Media, Podcast & Studio công nghệ

export type CapacityRange = 'all' | 'small' | 'medium' | 'large';

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  roomType?: RoomType;
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
  date: string;       // "2026-09-24"
  startTime: string;  // "09:00"
  endTime: string;    // "11:00"
  status: BookingStatus;
  purpose?: string;   // Mục đích mượn: Học nhóm, Ôn thi, NCKH, v.v.
  attendeesCount?: number; // Số lượng người tham gia
  notes?: string;     // Ghi chú yêu cầu thêm
  createdAt: number;  // timestamp ms
}

export interface FilterState {
  search: string;
  building: string;               // 'all' | 'Tòa A' | 'Tòa V' | 'Thư viện' | 'Khu K'
  selectedDate: string;           // "2026-09-24"
  roomType: RoomType;             // 'all' | 'lab' | 'lecture' | 'seminar' | 'discussion' | 'studio'
  capacityRange: CapacityRange;   // 'all' | 'small' (<25) | 'medium' (25-50) | 'large' (>50)
  amenities: Amenity[];
  minCapacity: number;
  statusFilter: RoomStatus | 'all';
}

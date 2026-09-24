// src/store/useNotificationCenterStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification, NotificationPreferences, NotificationType } from '../types';

interface NotificationCenterState {
  notifications: AppNotification[];
  preferences: NotificationPreferences;
  addNotification: (
    item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> & { id?: string; timestamp?: number }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (patch: Partial<NotificationPreferences>) => void;
}

const defaultPreferences: NotificationPreferences = {
  bookingReminders: true,
  bookingStatusChanges: true,
  campusAnnouncements: true,
  soundEnabled: true,
};

// Dữ liệu thông báo mẫu thực tế từ trường Đại học VKU
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'seed-vku-1',
    type: 'campus_news',
    title: 'Chào mừng bạn đến với VKU Room Booking',
    message: 'Hệ thống mượn phòng học công nghệ cao tại Khu A, Khu V và Thư viện số đã sẵn sàng phục vụ sinh viên.',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 giờ trước
    isRead: false,
  },
  {
    id: 'seed-vku-2',
    type: 'campus_news',
    title: 'Nâng cấp mạng Wi-Fi 6 tại Khu nhà V',
    message: 'Trung tâm Phát triển Phần mềm VKU vừa hoàn tất lắp đặt hệ thống Wi-Fi 6 tốc độ cao phục vụ các phòng máy.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 ngày trước
    isRead: true,
  },
  {
    id: 'seed-vku-3',
    type: 'campus_news',
    title: 'Quy định giữ gìn cơ sở vật chất phòng học',
    message: 'Sinh viên vui lòng tắt điều hòa, máy chiếu và xếp gọn bàn ghế trước khi rời khỏi phòng học.',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 ngày trước
    isRead: true,
  },
];

export const useNotificationCenterStore = create<NotificationCenterState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      preferences: defaultPreferences,

      addNotification: (item) => {
        const { preferences } = get();

        // Kiểm tra cài đặt người dùng trước khi nhận thông báo
        if (item.type === 'booking_reminder' && !preferences.bookingReminders) return;
        if (
          (item.type === 'booking_success' || item.type === 'booking_cancelled') &&
          !preferences.bookingStatusChanges
        )
          return;
        if (item.type === 'campus_news' && !preferences.campusAnnouncements) return;

        const newNotif: AppNotification = {
          id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: item.title,
          message: item.message,
          type: item.type,
          timestamp: item.timestamp || Date.now(),
          isRead: false,
          data: item.data,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAllNotifications: () =>
        set({
          notifications: [],
        }),

      updatePreferences: (patch) =>
        set((state) => ({
          preferences: { ...state.preferences, ...patch },
        })),
    }),
    {
      name: 'vku-notification-center-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

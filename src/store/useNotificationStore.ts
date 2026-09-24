// src/store/useNotificationStore.ts
import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  onPress?: () => void;
}

export interface AlertDetails {
  roomName?: string;
  building?: string;
  timeRange?: string;
  date?: string;
  capacity?: number;
  purpose?: string;
  attendees?: string;
}

export interface AlertConfig {
  title: string;
  message?: string;
  type?: AlertType;
  details?: AlertDetails;
  buttons?: AlertButton[];
  dismissible?: boolean;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationState {
  alert: AlertConfig | null;
  toasts: ToastItem[];
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  alert: null,
  toasts: [],

  showAlert: (config) => set({ alert: config }),
  hideAlert: () => set({ alert: null }),

  showToast: (message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Tự động tắt sau 3 giây
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Helper functions tiện lợi gọi bất kỳ đâu trong app
export const appNotify = {
  alert: (config: AlertConfig) => useNotificationStore.getState().showAlert(config),
  hideAlert: () => useNotificationStore.getState().hideAlert(),
  toast: (message: string, type: 'success' | 'error' | 'info' = 'info') =>
    useNotificationStore.getState().showToast(message, type),
  success: (title: string, message?: string, details?: AlertDetails, buttons?: AlertButton[]) =>
    useNotificationStore.getState().showAlert({
      type: 'success',
      title,
      message,
      details,
      buttons: buttons || [{ text: 'Đã hiểu', style: 'primary' }],
    }),
  error: (title: string, message?: string, buttons?: AlertButton[]) =>
    useNotificationStore.getState().showAlert({
      type: 'error',
      title,
      message,
      buttons: buttons || [{ text: 'Đóng', style: 'primary' }],
    }),
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    details?: AlertDetails,
    confirmText = 'Xác nhận'
  ) =>
    useNotificationStore.getState().showAlert({
      type: 'warning',
      title,
      message,
      details,
      buttons: [
        { text: 'Quay lại', style: 'cancel' },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ],
    }),
};

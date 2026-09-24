// src/utils/bookingLogic.ts
import { Booking, BookingStatus } from '../types';

/**
 * Trả về chuỗi ngày YYYY-MM-DD theo giờ địa phương (tránh sai lệch timezone UTC)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Lấy giờ dạng số thập phân của một mốc thời gian (ví dụ "13:30" -> 13.5)
 */
export function parseTimeToHours(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours + minutes / 60;
}

/**
 * Xác định trạng thái thực tế chính xác theo dòng thời gian của một booking
 */
export function getBookingEffectiveStatus(
  booking: Booking,
  now: Date = new Date()
): BookingStatus {
  if (booking.status === 'cancelled') {
    return 'cancelled';
  }

  const todayStr = getLocalDateString(now);
  const nowHours = now.getHours() + now.getMinutes() / 60;

  // Nếu ngày đặt đã qua ngày hôm nay -> Đã hoàn thành
  if (booking.date < todayStr) {
    return 'completed';
  }

  // Nếu ngày đặt trong tương lai -> Sắp tới
  if (booking.date > todayStr) {
    return 'upcoming';
  }

  // Nếu ngày đặt chính là hôm nay -> so sánh theo giờ
  const startHour = parseTimeToHours(booking.startTime);
  const endHour = parseTimeToHours(booking.endTime);

  if (nowHours >= endHour) {
    return 'completed'; // Ca mượn phòng đã kết thúc
  }

  if (nowHours >= startHour && nowHours < endHour) {
    return 'in_progress'; // Đang trong ca học/mượn phòng
  }

  return 'upcoming'; // Chưa tới giờ
}

/**
 * Kiểm tra xem một booking có được phép hủy hay không
 * Nghiệp vụ: Chỉ được hủy khi ca mượn phòng CHƯA diễn ra (upcoming).
 * Các ca đã kết thúc (completed), đang diễn ra (in_progress), hoặc đã hủy thì KHÔNG được hủy.
 */
export function canCancelBooking(
  booking: Booking,
  now: Date = new Date()
): boolean {
  const status = getBookingEffectiveStatus(booking, now);
  return status === 'upcoming';
}

/**
 * Kiểm tra xem một slot giờ có nằm trong quá khứ hay không
 * Nghiệp vụ: Không được phép đặt các khung giờ đã trôi qua
 */
export function isSlotInPast(
  slotHour: number,
  bookingDate: string,
  now: Date = new Date()
): boolean {
  const todayStr = getLocalDateString(now);
  if (bookingDate < todayStr) return true;
  if (bookingDate > todayStr) return false;

  // Nếu là hôm nay: slot 13:00 (13:00 -> 14:00)
  // Nếu hiện tại đã quá slotHour (ví dụ hiện tại 13:15) thì slot 13:00 đã trôi qua
  const currentHour = now.getHours();
  return slotHour <= currentHour;
}

/**
 * Tính số giờ mượn phòng của một booking
 */
export function calculateBookingHours(booking: Booking): number {
  const startH = parseTimeToHours(booking.startTime);
  const endH = parseTimeToHours(booking.endTime);
  return Math.max(0, endH - startH);
}

const WEEKDAYS_VN_FULL = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

/**
 * Định dạng ngày hiển thị tiếng Việt chi tiết (VD: "Hôm nay, 24/09", "Thứ Sáu, 25/09/2026")
 */
export function formatVietnameseDate(dateStr: string, now: Date = new Date()): string {
  if (!dateStr) return '';
  const todayStr = getLocalDateString(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);

  const targetDate = new Date(y, m - 1, d);
  const weekday = WEEKDAYS_VN_FULL[targetDate.getDay()] || '';

  if (dateStr === todayStr) {
    return `Hôm nay (${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')})`;
  }
  if (dateStr === tomorrowStr) {
    return `Ngày mai (${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')})`;
  }
  return `${weekday}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/**
 * Định dạng ngày ngắn gọn cho thẻ tag hoặc badge
 */
export function formatShortVietnameseDate(dateStr: string, now: Date = new Date()): string {
  if (!dateStr) return '';
  const todayStr = getLocalDateString(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);

  if (dateStr === todayStr) return 'Hôm nay';
  if (dateStr === tomorrowStr) return 'Ngày mai';
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

export interface BookingPurposeOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const BOOKING_PURPOSES: BookingPurposeOption[] = [
  { id: 'study_group', label: 'Học nhóm & Đồ án', icon: 'people-outline', color: '#4F46E5' },
  { id: 'exam_prep', label: 'Ôn thi & Bài tập lớn', icon: 'book-outline', color: '#059669' },
  { id: 'club_activity', label: 'Sinh hoạt CLB / Đội', icon: 'flash-outline', color: '#D97706' },
  { id: 'research', label: 'NCKH & Hội thảo', icon: 'bulb-outline', color: '#7C3AED' },
  { id: 'online_meeting', label: 'Phỏng vấn / Họp online', icon: 'videocam-outline', color: '#0284C7' },
];

// src/services/bookingService.ts
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, BookingStatus } from '../types';

const BOOKINGS_COLLECTION = 'bookings';

// Tạo booking mới
export async function createBooking(
  booking: Omit<Booking, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...booking,
    createdAt: Timestamp.now().toMillis(),
  });
  return docRef.id;
}

// Hủy booking
export async function cancelBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: 'cancelled' as BookingStatus,
  });
}

// Lấy bookings của 1 phòng theo ngày (kiểm tra conflict)
export async function getRoomBookingsByDate(
  roomId: string,
  date: string,
  callback: (bookings: Booking[]) => void
): Promise<() => void> {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('roomId', '==', roomId),
    where('date', '==', date),
    where('status', '==', 'upcoming')
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Booking[];
    callback(bookings);
  });
}

// Lắng nghe bookings của user theo real-time
export function subscribeToUserBookings(
  userId: string,
  callback: (bookings: Booking[]) => void
): () => void {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Booking[];

    // Sắp xếp tại máy: mới nhất lên đầu (không cần tạo Composite Index trên Firebase)
    bookings.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    callback(bookings);
  });
}

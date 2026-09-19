// src/services/roomService.ts
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Room } from '../types';
import { MOCK_ROOMS } from '../data/mockRooms';

const ROOMS_COLLECTION = 'rooms';

// Seed dữ liệu phòng vào Firestore (chỉ chạy 1 lần)
export async function seedRoomsIfEmpty(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, ROOMS_COLLECTION));
    if (!snapshot.empty) return; // Đã có dữ liệu rồi

    console.log('🌱 Seeding rooms into Firestore...');
    const promises = MOCK_ROOMS.map((room, index) => {
      const id = `room_${String(index + 1).padStart(3, '0')}`;
      return setDoc(doc(db, ROOMS_COLLECTION, id), {
        ...room,
        id,
        createdAt: Timestamp.now(),
      });
    });
    await Promise.all(promises);
    console.log('✅ Seeded', MOCK_ROOMS.length, 'rooms successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  }
}

// Real-time listener cho danh sách phòng
export function subscribeToRooms(callback: (rooms: Room[]) => void): () => void {
  const q = query(collection(db, ROOMS_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const rooms: Room[] = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Room[];

    // Sắp xếp: available → occupied → maintenance
    rooms.sort((a, b) => {
      const order = { available: 0, occupied: 1, maintenance: 2 };
      return order[a.status] - order[b.status];
    });

    callback(rooms);
  });
}

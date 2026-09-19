// src/config/firebase.ts
// ⚠️ QUAN TRỌNG: Thay thế các giá trị bên dưới bằng config Firebase của bạn
// Vào: https://console.firebase.google.com → Project Settings → Your apps → Web app

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDko9HhNERUMCyfjbUMV-2PxLGuAJbsWQ8",
  authDomain: "vku-room-booking-b10e7.firebaseapp.com",
  projectId: "vku-room-booking-b10e7",
  storageBucket: "vku-room-booking-b10e7.firebasestorage.app",
  messagingSenderId: "175027440788",
  appId: "1:175027440788:web:d9fa917f4f90718a637881",
  measurementId: "G-0YRTV13009"
};

// Tránh khởi tạo trùng lặp (Hot Reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

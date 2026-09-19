// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lắng nghe trạng thái auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // Tự động đăng nhập ẩn danh
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error('Anonymous auth error:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading, uid: user?.uid ?? null };
}

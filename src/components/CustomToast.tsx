// src/components/CustomToast.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, ToastItem } from '../store/useNotificationStore';

function SingleToast({ item }: { item: ToastItem }) {
  const hideToast = useNotificationStore((s) => s.hideToast);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const config = {
    success: { icon: 'checkmark-circle' as const, color: '#10B981', bg: '#064E3B' },
    error: { icon: 'alert-circle' as const, color: '#EF4444', bg: '#7F1D1D' },
    info: { icon: 'information-circle' as const, color: '#6366F1', bg: '#1E1B4B' },
  }[item.type];

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <Ionicons name={config.icon} size={20} color={config.color} />
      <Text style={styles.toastText}>{item.message}</Text>
    </Animated.View>
  );
}

export default function CustomToast() {
  const toasts = useNotificationStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((toast) => (
        <SingleToast key={toast.id} item={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 54,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999999,
    gap: 8,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    gap: 10,
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  toastText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
});

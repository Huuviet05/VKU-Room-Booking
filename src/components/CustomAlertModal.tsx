// src/components/CustomAlertModal.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, AlertType, AlertButton } from '../store/useNotificationStore';

const { width } = Dimensions.get('window');

const THEME_CONFIG: Record<
  AlertType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    accentColor: string;
    bgColor: string;
    tagLabel: string;
    borderColor: string;
  }
> = {
  success: {
    icon: 'checkmark-circle',
    accentColor: '#10B981',
    bgColor: '#ECFDF5',
    tagLabel: 'THÀNH CÔNG',
    borderColor: '#A7F3D0',
  },
  error: {
    icon: 'close-circle',
    accentColor: '#EF4444',
    bgColor: '#FEF2F2',
    tagLabel: 'CÓ LỖI XẢY RA',
    borderColor: '#FECACA',
  },
  warning: {
    icon: 'alert-circle',
    accentColor: '#F59E0B',
    bgColor: '#FFFBEB',
    tagLabel: 'XÁC NHẬN YÊU CẦU',
    borderColor: '#FDE68A',
  },
  info: {
    icon: 'information-circle',
    accentColor: '#4F46E5',
    bgColor: '#EEF2FF',
    tagLabel: 'THÔNG BÁO VKU',
    borderColor: '#C7D2FE',
  },
};

export default function CustomAlertModal() {
  const alert = useNotificationStore((s) => s.alert);
  const hideAlert = useNotificationStore((s) => s.hideAlert);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (alert) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [alert]);

  if (!alert) return null;

  const type: AlertType = alert.type || 'info';
  const theme = THEME_CONFIG[type];
  const buttons: AlertButton[] =
    alert.buttons && alert.buttons.length > 0
      ? alert.buttons
      : [{ text: 'Đã hiểu', style: 'primary' }];

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      setTimeout(() => btn.onPress!(), 50);
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      {/* Backdrop */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (alert.dismissible !== false) hideAlert();
        }}
      />

      {/* Modal Dialog Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        {/* Top Decorative App Bar */}
        <View style={styles.topBrandBar}>
          <View style={styles.brandRow}>
            <View style={styles.vkuLogoBadge}>
              <Ionicons name="school" size={13} color="#4F46E5" />
            </View>
            <Text style={styles.brandText}>VKU ROOM BOOKING</Text>
          </View>
          <View
            style={[
              styles.statusTag,
              { backgroundColor: theme.bgColor, borderColor: theme.borderColor },
            ]}
          >
            <Text style={[styles.statusTagText, { color: theme.accentColor }]}>
              {theme.tagLabel}
            </Text>
          </View>
        </View>

        {/* Big Animated Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconHalo, { backgroundColor: theme.bgColor }]}>
            <View style={[styles.iconBadge, { backgroundColor: theme.accentColor }]}>
              <Ionicons name={theme.icon} size={36} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Title & Message */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{alert.title}</Text>
          {alert.message ? <Text style={styles.message}>{alert.message}</Text> : null}
        </View>

        {/* Details Card (Nổi bật cho đặt phòng & hủy phòng) */}
        {alert.details && (
          <View style={styles.detailsBox}>
            {alert.details.roomName && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrapper}>
                  <Ionicons name="business" size={15} color="#4F46E5" />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Phòng mượn</Text>
                  <Text style={styles.detailValue}>
                    {alert.details.roomName}
                    {alert.details.building ? ` • Khu ${alert.details.building}` : ''}
                  </Text>
                </View>
              </View>
            )}

            {alert.details.timeRange && (
              <View style={styles.detailRow}>
                <View style={[styles.detailIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time" size={15} color="#D97706" />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Khung giờ</Text>
                  <Text style={styles.detailValue}>{alert.details.timeRange}</Text>
                </View>
              </View>
            )}

            {alert.details.date && (
              <View style={styles.detailRow}>
                <View style={[styles.detailIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="calendar" size={15} color="#059669" />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Ngày đặt</Text>
                  <Text style={styles.detailValue}>{alert.details.date}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={[
            styles.actionsContainer,
            buttons.length > 2 && { flexDirection: 'column' },
          ]}
        >
          {buttons.map((btn, index) => {
            const isCancel = btn.style === 'cancel';
            const isDestructive = btn.style === 'destructive';
            const isPrimary = btn.style === 'primary' || (!isCancel && !isDestructive);

            return (
              <Pressable
                key={index}
                onPress={() => handleButtonPress(btn)}
                style={({ pressed }) => [
                  styles.buttonBase,
                  isPrimary && styles.primaryBtn,
                  isCancel && styles.cancelBtn,
                  isDestructive && styles.destructiveBtn,
                  buttons.length === 2 && { flex: 1 },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
              >
                {isPrimary && (
                  <Ionicons
                    name="checkmark-outline"
                    size={17}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                )}
                {isDestructive && (
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.buttonText,
                    isPrimary && styles.primaryBtnText,
                    isCancel && styles.cancelBtnText,
                    isDestructive && styles.destructiveBtnText,
                  ]}
                >
                  {btn.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
    padding: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(6px)' } : {}),
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  topBrandBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vkuLogoBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconHalo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 21,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 1,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  buttonBase: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  destructiveBtn: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  destructiveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonText: {
    fontSize: 14,
  },
});

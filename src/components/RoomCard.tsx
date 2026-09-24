// src/components/RoomCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Room } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  room: Room;
  onPress: () => void;
  cardWidth?: number;
  index?: number;
}

const AMENITY_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  projector: { icon: 'tv-outline', label: 'Máy chiếu' },
  ac: { icon: 'snow-outline', label: 'Điều hòa' },
  whiteboard: { icon: 'easel-outline', label: 'Bảng trắng' },
  printer: { icon: 'print-outline', label: 'Máy in' },
  computer: { icon: 'desktop-outline', label: 'Máy tính' },
  camera: { icon: 'videocam-outline', label: 'Camera' },
  sound_system: { icon: 'volume-high-outline', label: 'Âm thanh' },
  smart_board: { icon: 'tablet-landscape-outline', label: 'Smartboard' },
  wifi6: { icon: 'wifi-outline', label: 'Wifi 6' },
  vr_headset: { icon: 'glasses-outline', label: 'Kính VR' },
};

const BUILDING_THEMES: Record<string, { bg: string; text: string; label: string }> = {
  'Khu A': { bg: 'rgba(30, 58, 138, 0.85)', text: '#DBEAFE', label: '🏢 Khu A' },
  'Khu V': { bg: 'rgba(88, 28, 135, 0.85)', text: '#F3E8FF', label: '🏛️ Khu V' },
  'Thư viện số': { bg: 'rgba(120, 53, 15, 0.85)', text: '#FEF3C7', label: '📚 Thư viện số' },
  'Khu C': { bg: 'rgba(15, 118, 110, 0.85)', text: '#CCFBF1', label: '🔬 Khu C' },
  'Khu Sáng tạo': { bg: 'rgba(159, 18, 57, 0.85)', text: '#FFE4E6', label: '💡 Sáng tạo' },
};

export default function RoomCard({ room, onPress, cardWidth, index = 0 }: Props) {
  const scale = useSharedValue(1);
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buildingTheme = BUILDING_THEMES[room.building] || {
    bg: 'rgba(15, 23, 42, 0.85)',
    text: '#F8FAFC',
    label: `📍 ${room.building}`,
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify().damping(13)}
      style={[
        styles.card,
        cardWidth ? { width: cardWidth } : null,
        animatedPressStyle,
      ]}
    >
      <Pressable
        style={{ flex: 1 }}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        android_ripple={{ color: 'rgba(79,70,229,0.08)', borderless: false }}
      >
        {/* Hero Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.imageUrl }}
            style={styles.image}
            contentFit="cover"
            placeholder={room.blurHash}
            transition={300}
          />

          {/* Building Zone Glass Tag */}
          <View style={[styles.buildingBadge, { backgroundColor: buildingTheme.bg }]}>
            <Text style={[styles.buildingBadgeText, { color: buildingTheme.text }]}>
              {buildingTheme.label}
            </Text>
          </View>

          {/* Status Overlay Badge */}
          <View style={styles.statusOverlay}>
            <StatusBadge status={room.status} />
          </View>

          {/* Floor & Capacity Quick Bar on image bottom */}
          <View style={styles.imageBottomRow}>
            <View style={styles.glassPill}>
              <Ionicons name="layers-outline" size={11} color="#FFFFFF" />
              <Text style={styles.glassPillText}>Tầng {room.floor}</Text>
            </View>
            <View style={styles.glassPill}>
              <Ionicons name="people-outline" size={11} color="#FFFFFF" />
              <Text style={styles.glassPillText}>{room.capacity} chỗ</Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.content}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>

          {/* Amenities Chips Row */}
          <View style={styles.amenitiesRow}>
            {room.amenities.slice(0, 4).map((amenity) => {
              const info = AMENITY_ICONS[amenity];
              return (
                <View key={amenity} style={styles.amenityChip}>
                  <Ionicons
                    name={info?.icon ?? 'checkmark-outline'}
                    size={11}
                    color="#4F46E5"
                  />
                  <Text style={styles.amenityChipText}>{info?.label ?? amenity}</Text>
                </View>
              );
            })}
            {room.amenities.length > 4 && (
              <View style={[styles.amenityChip, styles.amenityMoreChip]}>
                <Text style={styles.amenityMore}>+{room.amenities.length - 4}</Text>
              </View>
            )}
          </View>

          {/* Footer Action Row */}
          <View style={styles.footerRow}>
            <Text style={styles.availabilityText}>
              {room.status === 'available' ? 'Hôm nay: Sẵn sàng mượn' : 'Tạm thời không khả dụng'}
            </Text>
            <View style={styles.bookActionBtn}>
              <Text style={styles.bookActionText}>Chi tiết</Text>
              <Ionicons name="chevron-forward" size={13} color="#4F46E5" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 155,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buildingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
  },
  buildingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(6px)' } : {}),
  },
  glassPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 14,
    gap: 6,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  amenityChipText: {
    fontSize: 10,
    color: '#4338CA',
    fontWeight: '600',
  },
  amenityMoreChip: {
    backgroundColor: '#F1F5F9',
  },
  amenityMore: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  availabilityText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bookActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bookActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

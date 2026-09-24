// src/components/RoomCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
  index?: number; // Dùng để tính stagger delay cho animation
}

const AMENITY_ICONS: Record<string, { icon: string; label: string }> = {
  projector: { icon: 'tv-outline', label: 'Máy chiếu' },
  ac: { icon: 'snow-outline', label: 'Điều hòa' },
  whiteboard: { icon: 'easel-outline', label: 'Bảng trắng' },
  printer: { icon: 'print-outline', label: 'Máy in' },
  computer: { icon: 'desktop-outline', label: 'Máy tính' },
  camera: { icon: 'videocam-outline', label: 'Camera' },
};

export default function RoomCard({ room, onPress, cardWidth, index = 0 }: Props) {
  // Spring scale animation khi nhấn (chạy trên UI thread — không drop frame)
  const scale = useSharedValue(1);
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    // FadeInDown.delay stagger: Mỗi thẻ xuất hiện muộn hơn 80ms so với thẻ trước
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify().damping(12)}
      style={[
        styles.card,
        cardWidth ? { width: cardWidth } : null,
        animatedPressStyle,
      ]}
    >
      <Pressable
        style={{ flex: 1 }}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        android_ripple={{ color: 'rgba(79,70,229,0.08)', borderless: false }}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: room.imageUrl }}
          style={styles.image}
          contentFit="cover"
          placeholder={room.blurHash}
          transition={300}
        />

        {/* Status overlay */}
        <View style={styles.statusOverlay}>
          <StatusBadge status={room.status} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{room.building} · Tầng {room.floor}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{room.capacity} chỗ ngồi</Text>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesRow}>
            {room.amenities.slice(0, 4).map((amenity) => (
              <View key={amenity} style={styles.amenityChip}>
                <Ionicons
                  name={AMENITY_ICONS[amenity]?.icon as any ?? 'checkmark-outline'}
                  size={11}
                  color="#4F46E5"
                />
              </View>
            ))}
            {room.amenities.length > 4 && (
              <View style={styles.amenityChip}>
                <Text style={styles.amenityMore}>+{room.amenities.length - 4}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    flex: 1,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  statusOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  content: {
    padding: 12,
    gap: 5,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  amenityChip: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityMore: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

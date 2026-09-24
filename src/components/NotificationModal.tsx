// src/components/NotificationModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationCenterStore } from '../store/useNotificationCenterStore';
import { appNotify } from '../store/useNotificationStore';
import { AppNotification, NotificationType } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type TabKey = 'inbox' | 'settings';

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return 'Hôm qua';
  return `${days} ngày trước`;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string; label: string }
> = {
  booking_success: {
    icon: 'checkmark-circle',
    bg: '#DCFCE7',
    color: '#16A34A',
    label: 'Đặt phòng',
  },
  booking_reminder: {
    icon: 'alarm',
    bg: '#FEF3C7',
    color: '#D97706',
    label: 'Nhắc nhở',
  },
  booking_cancelled: {
    icon: 'close-circle',
    bg: '#FEE2E2',
    color: '#EF4444',
    label: 'Hủy phòng',
  },
  campus_news: {
    icon: 'megaphone',
    bg: '#EEF2FF',
    color: '#4F46E5',
    label: 'Tin trường VKU',
  },
};

export default function NotificationModal({ visible, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('inbox');

  const {
    notifications,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    addNotification,
  } = useNotificationCenterStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleTestNotification = () => {
    addNotification({
      type: 'booking_reminder',
      title: 'Nhắc nhở: Ca học sắp bắt đầu! ⏰',
      message: 'Phòng thực hành mạng Khu V của bạn sẽ bắt đầu trong 15 phút nữa. Chúc bạn có buổi học hiệu quả!',
      data: {
        roomName: 'Phòng Lab V.204',
        timeRange: '14:00 → 16:00',
      },
    });

    appNotify.toast('Đã gửi thông báo thử nghiệm thành công! 🔔', 'success');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.brandRow}>
              <View style={styles.vkuLogoWrap}>
                <Ionicons name="notifications" size={16} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.sheetTitle}>Thông báo sinh viên</Text>
                <Text style={styles.sheetSubtitle}>
                  {unreadCount > 0 ? `${unreadCount} tin chưa đọc` : 'Tất cả đã đọc'}
                </Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Tabs switch */}
          <View style={styles.tabsWrap}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'inbox' && styles.tabBtnActive]}
              onPress={() => setActiveTab('inbox')}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={activeTab === 'inbox' ? '#4F46E5' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'inbox' && styles.tabBtnTextActive,
                ]}
              >
                Hộp thư ({notifications.length})
              </Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
              onPress={() => setActiveTab('settings')}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={activeTab === 'settings' ? '#4F46E5' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'settings' && styles.tabBtnTextActive,
                ]}
              >
                Cài đặt nhận tin
              </Text>
            </Pressable>
          </View>

          {/* TAB 1: INBOX */}
          {activeTab === 'inbox' && (
            <View style={{ flex: 1 }}>
              {/* Actions row */}
              {notifications.length > 0 && (
                <View style={styles.actionsBar}>
                  {unreadCount > 0 && (
                    <Pressable
                      style={styles.actionLink}
                      onPress={markAllAsRead}
                      hitSlop={8}
                    >
                      <Ionicons name="checkmark-done" size={14} color="#4F46E5" />
                      <Text style={styles.actionLinkText}>Đọc tất cả</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={[styles.actionLink, { marginLeft: 'auto' }]}
                    onPress={clearAllNotifications}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={13} color="#94A3B8" />
                    <Text style={[styles.actionLinkText, { color: '#94A3B8' }]}>
                      Xóa sạch
                    </Text>
                  </Pressable>
                </View>
              )}

              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="notifications-off-outline" size={36} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
                  <Text style={styles.emptySubtitle}>
                    Các thông báo đặt phòng, nhắc nhở lịch học và tin tức VKU sẽ xuất hiện tại đây.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.notifList}
                >
                  {notifications.map((item) => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.campus_news;

                    return (
                      <Pressable
                        key={item.id}
                        style={[
                          styles.notifCard,
                          !item.isRead && styles.notifCardUnread,
                        ]}
                        onPress={() => markAsRead(item.id)}
                      >
                        <View style={[styles.notifIconWrap, { backgroundColor: cfg.bg }]}>
                          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                        </View>

                        <View style={styles.notifContent}>
                          <View style={styles.notifTopRow}>
                            <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                              <Text style={[styles.typeBadgeText, { color: cfg.color }]}>
                                {cfg.label}
                              </Text>
                            </View>
                            <Text style={styles.notifTime}>
                              {formatRelativeTime(item.timestamp)}
                            </Text>
                            {!item.isRead && <View style={styles.unreadDot} />}
                          </View>

                          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                            {item.title}
                          </Text>
                          <Text style={styles.notifMessage}>{item.message}</Text>

                          {/* Data pills */}
                          {Boolean(item.data?.roomName || item.data?.timeRange) && (
                            <View style={styles.notifDataRow}>
                              {Boolean(item.data?.roomName) && (
                                <View style={styles.dataPill}>
                                  <Ionicons name="location-outline" size={11} color="#4F46E5" />
                                  <Text style={styles.dataPillText}>{item.data?.roomName}</Text>
                                </View>
                              )}
                              {Boolean(item.data?.timeRange) && (
                                <View style={styles.dataPill}>
                                  <Ionicons name="time-outline" size={11} color="#4F46E5" />
                                  <Text style={styles.dataPillText}>{item.data?.timeRange}</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>

                        <Pressable
                          style={styles.deleteBtn}
                          onPress={() => deleteNotification(item.id)}
                          hitSlop={8}
                        >
                          <Ionicons name="close" size={16} color="#CBD5E1" />
                        </Pressable>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === 'settings' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.settingsContent}
            >
              <Text style={styles.settingsSectionTitle}>Tùy chọn nhận thông báo</Text>

              {/* Setting 1: Reminders */}
              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="alarm-outline" size={18} color="#4F46E5" />
                    <Text style={styles.settingLabel}>Nhắc nhở trước ca học</Text>
                  </View>
                  <Text style={styles.settingDesc}>
                    Nhận thông báo nhắc trước 15 phút khi đến giờ nhận phòng mượn.
                  </Text>
                </View>
                <Switch
                  value={preferences.bookingReminders}
                  onValueChange={(val) => updatePreferences({ bookingReminders: val })}
                  trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                  thumbColor={preferences.bookingReminders ? '#4F46E5' : '#FFFFFF'}
                />
              </View>

              {/* Setting 2: Status changes */}
              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="swap-horizontal-outline" size={18} color="#4F46E5" />
                    <Text style={styles.settingLabel}>Xác nhận & Hủy phòng</Text>
                  </View>
                  <Text style={styles.settingDesc}>
                    Nhận thông báo khi đặt phòng thành công hoặc khi hủy ca mượn phòng.
                  </Text>
                </View>
                <Switch
                  value={preferences.bookingStatusChanges}
                  onValueChange={(val) => updatePreferences({ bookingStatusChanges: val })}
                  trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                  thumbColor={preferences.bookingStatusChanges ? '#4F46E5' : '#FFFFFF'}
                />
              </View>

              {/* Setting 3: Campus news */}
              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="school-outline" size={18} color="#4F46E5" />
                    <Text style={styles.settingLabel}>Tin tức & Bảo trì VKU</Text>
                  </View>
                  <Text style={styles.settingDesc}>
                    Cập nhật lịch nâng cấp phòng học, thiết bị máy chiếu và mạng từ Nhà trường.
                  </Text>
                </View>
                <Switch
                  value={preferences.campusAnnouncements}
                  onValueChange={(val) => updatePreferences({ campusAnnouncements: val })}
                  trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                  thumbColor={preferences.campusAnnouncements ? '#4F46E5' : '#FFFFFF'}
                />
              </View>

              {/* Setting 4: Sound */}
              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="volume-high-outline" size={18} color="#4F46E5" />
                    <Text style={styles.settingLabel}>Âm thanh & Rung</Text>
                  </View>
                  <Text style={styles.settingDesc}>
                    Phát âm thanh và rung thông báo khi có tin mới.
                  </Text>
                </View>
                <Switch
                  value={preferences.soundEnabled}
                  onValueChange={(val) => updatePreferences({ soundEnabled: val })}
                  trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
                  thumbColor={preferences.soundEnabled ? '#4F46E5' : '#FFFFFF'}
                />
              </View>

              {/* Test button */}
              <Pressable
                style={({ pressed }) => [
                  styles.testBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleTestNotification}
              >
                <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
                <Text style={styles.testBtnText}>Gửi thông báo thử nghiệm</Text>
              </Pressable>

              <Text style={styles.settingsFootnote}>
                Hệ thống thông báo đẩy được tối ưu hóa cho ứng dụng VKU Room Booking.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    minHeight: 520,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vkuLogoWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  notifList: {
    padding: 16,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    alignItems: 'flex-start',
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#C7D2FE',
  },
  notifIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    marginLeft: 'auto',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  notifTitleUnread: {
    color: '#0F172A',
    fontWeight: '800',
  },
  notifMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  notifDataRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  dataPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dataPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  deleteBtn: {
    padding: 2,
  },
  settingsContent: {
    padding: 18,
    gap: 12,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
    gap: 3,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsFootnote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});

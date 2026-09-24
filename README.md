# 🏫 VKU Room Booking - Ứng Dụng Đặt Phòng Học Trực Tuyến

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)
![Reanimated](https://img.shields.io/badge/Animations-Reanimated_v3-blueviolet?style=for-the-badge)

**Ứng dụng đặt phòng học & phòng tự học thông minh cho sinh viên Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**

*Sản phẩm Mini-Project 2 - Môn Lập trình Ứng dụng Di động Đa nền tảng (Mobile Cross-Platform Development)*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Firebase_Hosting-0284C7?style=for-the-badge)](https://vku-room-booking-b10e7.web.app)
[![Vercel Demo](https://img.shields.io/badge/▲_Vercel_Mirror-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vku-room-booking-eight.vercel.app/)

</div>

---

## 🌟 Tính Năng Nổi Bật (Key Features)

- 🔍 **Tìm kiếm & Bộ lọc thông minh:**
  - Lọc theo từ khóa (tên phòng, khu tòa nhà: Khu A, Khu V, Thư viện số, Khu Sáng tạo).
  - Lọc theo tiện ích đi kèm: Máy chiếu, Điều hòa, Bảng trắng, Wi-Fi 6, Bảng tương tác, Kính VR...
  - Lọc theo sức chứa phòng và trạng thái phòng (Còn trống / Đang sử dụng).
- 📅 **Hệ thống đặt trước 14 ngày (Multi-day Advance Booking):**
  - Dải chọn ngày ngang hiện đại (`DateSelectorStrip`) cho phép sinh viên lên kế hoạch mượn phòng trong 14 ngày tới.
  - Đồng bộ ngày được chọn giữa trang Duyệt phòng và trang Chi tiết phòng.
  - Tự động mở các khung giờ sáng (07:00, 08:00...) cho những ngày trong tương lai mà không bị khóa nhầm do giờ quá khứ.
- 🎯 **Mục đích mượn & Bộ đếm thành viên thực tế:**
  - Lựa chọn mục đích sử dụng phòng: Học nhóm & Đồ án, Ôn thi & Bài tập lớn, Sinh hoạt CLB / Đội nhóm, NCKH & Hội thảo, Phỏng vấn / Họp online.
  - Bộ đếm (stepper) điều chỉnh số lượng sinh viên tham gia với cảnh báo theo sức chứa tối đa của phòng.
- ⚡ **Đồng bộ thời gian thực (Real-time Multi-user Sync):**
  - Sử dụng Firebase Firestore `onSnapshot`: Khi một người đặt phòng thành công, tất cả các thiết bị khác đang mở app sẽ lập tức thấy ca đó chuyển sang trạng thái đã đặt trong vòng **0.2 giây**!
- 🔔 **Trung tâm thông báo & Cài đặt nhận tin (Notification Center):**
  - Hộp thư thông báo cá nhân hóa (`NotificationModal`) hiển thị lịch sử đặt phòng thành công, hủy phòng và thông báo bảo trì từ VKU.
  - Bảng điều khiển bật/tắt nhắc nhở trước 15 phút, cập nhật trạng thái phòng và âm thanh/rung thông báo.
  - Biểu tượng chuông với huy hiệu (badge) đếm số tin chưa đọc trên thanh tiêu đề và hồ sơ.
- 💫 **Hiệu ứng cử chỉ mượt mà (Reanimated & Gesture Handler):**
  - Nút Đặt phòng tích hợp hiệu ứng nhún lò xo (spring physics) chạy 60/120fps trên UI thread.
  - Cử chỉ vuốt sang trái (Swipe-to-cancel) trên thẻ đặt phòng để mở nền đỏ và kích hoạt hủy ca mượn phòng trực quan.
- 👤 **Xác thực ẩn danh (Anonymous Authentication):**
  - Tự động cấp mã định danh duy nhất (UID) cho từng thiết bị mà không cần người dùng phải đăng ký tài khoản rườm rà.
  - Phân tách dữ liệu: Mỗi sinh viên chỉ quản lý và hủy được lịch đặt của chính mình.
- 📱 **Thiết kế Responsive hoàn hảo (Responsive Layout):**
  - Tự động nhận diện độ rộng màn hình qua hook `useResponsiveLayout`:
    - Điện thoại nhỏ (< 480px): Hiển thị lưới **1 cột**.
    - Điện thoại gập / Màn hình trung (480px - 768px): Hiển thị lưới **2 cột**.
    - Tablet / iPad (≥ 768px): Hiển thị lưới **3 cột**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Công nghệ / Thư viện | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- |
| **React Native** | 0.86.3 | Nền tảng xây dựng ứng dụng di động đa nền tảng |
| **Expo** | ~57.0 | Managed Workflow, New Architecture, Tooling |
| **TypeScript** | Strict Mode | Đảm bảo tính toàn vẹn kiểu dữ liệu |
| **React Navigation** | v7 | Bottom Tabs (3 tabs chính) + Native Stack |
| **Firebase Firestore** | 12.19.0 | NoSQL Cloud Database, Real-time listener |
| **Firebase Auth** | 12.19.0 | Anonymous Authentication |
| **Zustand** | 5.0 | Quản lý trạng thái bộ lọc và thông báo sinh viên |
| **AsyncStorage** | ~2.2.0 | Lưu trữ bền vững (Persistence) cho bộ lọc và thông báo |
| **React Native Reanimated** | ~4.2.1 | Hiệu ứng động chạy mượt mà 60/120fps trên UI thread |
| **React Native Gesture Handler** | ~2.30.0 | Xử lý cử chỉ vuốt chạm bản địa (Pan gesture) |
| **Expo Image** | ~57.0 | Tối ưu hiển thị ảnh phòng kèm hiệu ứng BlurHash |
| **Expo Vector Icons** | ^15.0 | Bộ biểu tượng Ionicons chuyên nghiệp |

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```text
VKURoomBooking/
├── assets/                  # Biểu tượng, icon adaptive, ảnh splash
├── src/
│   ├── components/          # Các UI components tái sử dụng
│   │   ├── CustomAlertModal.tsx # Hộp thoại xác nhận/thông báo chuẩn nhận diện VKU
│   │   ├── CustomToast.tsx      # Thanh thông báo Toast nổi
│   │   ├── DateSelectorStrip.tsx# Dải chọn ngày ngang thông minh (14 ngày tới)
│   │   ├── EmptyState.tsx       # Màn hình trống khi không tìm thấy dữ liệu
│   │   ├── FilterChips.tsx      # Thanh cuộn ngang các nút lọc tiện ích & tòa nhà
│   │   ├── NotificationModal.tsx# Modal trung tâm thông báo & cài đặt nhận tin
│   │   ├── RoomCard.tsx         # Thẻ hiển thị phòng học (ảnh, trạng thái, thiết bị)
│   │   ├── SearchBar.tsx        # Thanh tìm kiếm với nút xóa nhanh
│   │   ├── StatusBadge.tsx      # Huy hiệu trạng thái phòng (Còn trống / Đang dùng)
│   │   └── TimeSlotPicker.tsx   # Bộ chọn khung giờ 07:00 - 20:00 & chống trùng ca
│   ├── config/              # Cấu hình Firebase
│   │   └── firebase.ts          # Khởi tạo Firebase App, Firestore DB, Auth
│   ├── data/
│   │   └── mockRooms.ts         # 20 dữ liệu phòng học mẫu VKU (để auto-seed)
│   ├── hooks/               # Custom React Hooks
│   │   ├── useAuth.ts           # Tự động đăng nhập ẩn danh & lấy UID
│   │   └── useResponsiveLayout.ts # Tự động tính toán số cột và chiều rộng thẻ phòng
│   ├── navigation/          # Cấu hình điều hướng
│   │   └── AppNavigator.tsx     # BottomTab (Tìm phòng, Đặt phòng, Hồ sơ) + Stack
│   ├── screens/             # Các màn hình chính
│   │   ├── BrowseRoomsScreen.tsx# Danh sách phòng, chọn ngày, chuông thông báo
│   │   ├── RoomDetailScreen.tsx # Chi tiết phòng, chọn ngày, giờ, mục đích & số người
│   │   ├── MyBookingsScreen.tsx # Lịch đặt của tôi (vuốt để hủy, hiển thị ngày & mục đích)
│   │   └── ProfileScreen.tsx    # Thông tin sinh viên, thống kê & mở trung tâm thông báo
│   ├── services/            # Tầng giao tiếp dữ liệu Firebase
│   │   ├── bookingService.ts    # Tạo, hủy, lắng nghe lịch đặt phòng
│   │   └── roomService.ts       # Auto-seed 20 phòng & lắng nghe danh sách phòng
│   ├── store/               # Quản lý State Client-side (Zustand + Persist)
│   │   ├── useAppStore.ts       # Quản lý bộ lọc & ngày mượn phòng
│   │   ├── useNotificationStore.ts # Quản lý Custom Alert & Toast toàn app
│   │   └── useNotificationCenterStore.ts # Hộp thư thông báo & cài đặt nhận tin
│   └── types/
│       └── index.ts             # Định nghĩa Type / Interface (Room, Booking, Notifications...)
├── App.tsx                  # Root component (QueryClient, SafeArea, Auto-seed)
├── app.json                 # Cấu hình Expo App (Tên, Bundle ID, Splash, Icon)
├── tsconfig.json            # Cấu hình TypeScript Strict mode & Path aliases
└── package.json             # Danh sách dependencies & scripts
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Getting Started)

### 1. Cài đặt các gói phụ thuộc:
```bash
cd VKURoomBooking
npm install
```

### 2. Cấu hình Firebase:
Mở file `src/config/firebase.ts` và kiểm tra thông tin cấu hình Firebase:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

> **Lưu ý trên Firebase Console:**
> - Bật **Firestore Database** ở chế độ *Test Mode* (hoặc đặt Rules cho phép đọc/ghi).
> - Bật **Authentication ➔ Sign-in method ➔ Anonymous** (Bật Enable).

### 3. Chạy ứng dụng:
Khởi động Metro Bundler:
```bash
npx expo start -c
```

- **Trên điện thoại:** Mở app **Expo Go** trên Android/iOS và quét mã QR trên màn hình Terminal (hoặc mở trực tiếp từ mục Projects).
- **Trên trình duyệt máy tính:** Nhấn phím `w` trên bàn phím để mở phiên bản Web (`http://localhost:8081`).

---

## 👨‍💻 Tác Giả & Bản Quyền

- **Họ và tên sinh viên:** Nguyễn Hữu Việt
- **Mã sinh viên:** 23IT309
- **Lớp / Trường:** Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)
- **Học phần:** Lập trình Ứng dụng Di động Đa nền tảng (Mini-Project 2)

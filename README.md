# 🏫 VKU Room Booking - Ứng Dụng Đặt Phòng Học Trực Tuyến

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)

**Ứng dụng đặt phòng học & phòng tự học thông minh cho sinh viên Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**

*Sản phẩm Mini-Project 2 - Môn Lập trình Ứng dụng Di động Đa nền tảng (Mobile Cross-Platform Development)*

</div>

---

## 🌟 Tính Năng Nổi Bật (Key Features)

- 🔍 **Tìm kiếm & Bộ lọc thông minh:**
  - Lọc theo từ khóa (tên phòng, tòa nhà A3, B2, C1...).
  - Lọc theo tiện ích đi kèm: Máy chiếu, Điều hòa, Bảng trắng, Máy tính, Máy in...
  - Lọc theo sức chứa phòng (≥ 30 chỗ, ≥ 50 chỗ...) và trạng thái phòng (Còn trống / Đang sử dụng).
- ⚡ **Đồng bộ thời gian thực (Real-time Multi-user Sync):**
  - Sử dụng Firebase Firestore `onSnapshot`: Khi một người đặt phòng thành công, tất cả các thiết bị khác đang mở app sẽ lập tức thấy ca đó chuyển sang trạng thái đã đặt trong vòng **0.2 giây**!
- 📅 **Đặt phòng & Chống trùng ca (Conflict Prevention):**
  - Trực quan hóa ca học từ `07:00` đến `20:00`.
  - Tự động phát hiện và khóa các ca đã có người đặt trước.
  - Giới hạn đặt tối đa 3 tiếng liên tiếp/lần đặt nhằm đảm bảo công bằng tài nguyên phòng học.
- 👤 **Xác thực ẩn danh (Anonymous Authentication):**
  - Tự động cấp mã định danh duy nhất (UID) cho từng thiết bị mà không cần người dùng phải đăng ký tài khoản rườm rà.
  - Phân tách dữ liệu: Mỗi sinh viên chỉ quản lý và hủy được lịch đặt của chính mình.
- 📱 **Thiết kế Responsive hoàn hảo (Responsive Layout):**
  - Tự động nhận diện độ rộng màn hình qua hook `useResponsiveLayout`:
    - Điện thoại nhỏ (< 480px): Hiển thị lưới **1 cột**.
    - Điện thoại gập / Màn hình trung (480px - 768px): Hiển thị lưới **2 cột**.
    - Tablet / iPad (≥ 768px): Hiển thị lưới **3 cột**.
- 📋 **Quản lý lịch đặt (Booking Management):**
  - Xem danh sách ca sắp tới và lịch sử đặt phòng.
  - Thao tác hủy lịch với hộp thoại xác nhận an toàn.
- 🌱 **Tự động nạp dữ liệu (Auto-seeding):**
  - Tự động nạp 20 phòng học tiêu chuẩn của VKU (kèm hình ảnh chất lượng cao và BlurHash placeholder) lên Firestore ngay trong lần đầu chạy app.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Công nghệ / Thư viện | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- |
| **React Native** | 0.86.3 | Nền tảng xây dựng ứng dụng di động |
| **Expo** | ~57.0 | Managed Workflow, New Architecture, Tooling |
| **TypeScript** | Strict Mode | Đảm bảo tính toàn vẹn kiểu dữ liệu |
| **React Navigation** | v7 | Bottom Tabs (3 tabs chính) + Native Stack |
| **Firebase Firestore** | 12.19.0 | NoSQL Cloud Database, Real-time listener |
| **Firebase Auth** | 12.19.0 | Anonymous Authentication |
| **Zustand** | 5.0 | Quản lý trạng thái bộ lọc (Filter store) siêu nhẹ |
| **Expo Image** | ~57.0 | Tối ưu hiển thị ảnh phòng kèm hiệu ứng BlurHash |
| **Expo Vector Icons** | ^15.0 | Bộ biểu tượng Ionicons chuyên nghiệp |

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```text
VKURoomBooking/
├── assets/                  # Biểu tượng, icon adaptive, ảnh splash
├── src/
│   ├── components/          # Các UI components tái sử dụng
│   │   ├── EmptyState.tsx       # Màn hình trống khi không tìm thấy dữ liệu
│   │   ├── FilterChips.tsx      # Thanh cuộn ngang các nút lọc tiện ích & trạng thái
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
│   │   ├── BrowseRoomsScreen.tsx# Danh sách phòng, tìm kiếm, lọc
│   │   ├── RoomDetailScreen.tsx # Chi tiết phòng, xem lịch và đặt phòng
│   │   ├── MyBookingsScreen.tsx # Lịch đặt của tôi (Sắp tới & Lịch sử)
│   │   └── ProfileScreen.tsx    # Thông tin sinh viên, thống kê & cấu hình
│   ├── services/            # Tầng giao tiếp dữ liệu Firebase
│   │   ├── bookingService.ts    # Tạo, hủy, lắng nghe lịch đặt phòng
│   │   └── roomService.ts       # Auto-seed 20 phòng & lắng nghe danh sách phòng
│   ├── store/
│   │   └── useAppStore.ts       # Quản lý trạng thái bộ lọc bằng Zustand
│   └── types/
│       └── index.ts             # Định nghĩa Type / Interface (Room, Booking, Amenity...)
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
- **Lớp / Trường:** Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)
- **Học phần:** Lập trình Ứng dụng Di động Đa nền tảng (Mini-Project 2)

# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 2: Real-time Study Room Booking App  
**Team / Student Name:** Nguyen Huu Viet  
**Submission Date:** 19/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyen Huu Viet — Student ID: 23IT309 — Role: Full-stack Mobile Developer (System Architecture, UI/UX Design, State Management, Firebase Real-time Integration) — Contribution: 100%
* **🔗 Live Demo URL:** [Expo Go Project / exp://192.168.1.4:8081](https://github.com/huuviet05/VKU-Room-Booking.git)
* **💻 GitHub Repository:** [https://github.com/huuviet05/VKU-Room-Booking.git](https://github.com/huuviet05/VKU-Room-Booking.git)
* **🎥 Video Demo (Optional):** [Sẵn sàng demo trực tiếp trên thiết bị vật lý iPhone qua Expo Go]

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Responsive Viewport & Dynamic Grid** | ✅ Complete | Tự động tính toán bố cục qua custom hook `useResponsiveLayout`: Hiển thị 1 cột trên điện thoại (< 480px), 2 cột trên điện thoại gập/màn hình rộng (480–768px), và 3 cột trên iPad/Tablet (≥ 768px). Xử lý an toàn vùng tai thỏ qua `react-native-safe-area-context`. |
| 2 | **60fps Feed & Rich RoomCard** | ✅ Complete | Tối ưu danh sách phòng học bằng `FlatList` với hơn 20 phòng học VKU mẫu. `RoomCard` hiển thị hình ảnh chất lượng cao kèm `BlurHash` chống nháy giật hình ảnh (`expo-image`), huy hiệu trạng thái động (`StatusBadge`), biểu tượng thiết bị và hiệu ứng nhấn vi chạm mượt mà. |
| 3 | **Room Search & Filter Chips** | ✅ Complete | Tìm kiếm theo thời gian thực theo tên phòng, tòa nhà (A3, B2, C1...). Hệ thống chip lọc đa tham số cuộn ngang: Lọc theo tiện ích (Máy chiếu, Điều hòa, Bảng trắng, Máy tính, Máy in), sức chứa (≥ 30 chỗ, ≥ 50 chỗ), và trạng thái phòng (Còn trống / Đang sử dụng). |
| 4 | **Time-slot Picker & Conflict Prevention** | ✅ Complete | Bộ chọn khung giờ học từ 07:00 đến 20:00. Tự động kiểm tra xung đột thời gian thực: Khóa các ca đã có người đặt trước (chuyển xám, không cho nhấn), giới hạn sinh viên đặt tối đa 3 tiếng liên tiếp để đảm bảo tính công bằng tài nguyên. |
| 5 | **Real-time Multi-user Sync & Auto-seeding** | ✅ Complete | Tích hợp Firebase Firestore `onSnapshot`. Khi một sinh viên xác nhận đặt phòng, trạng thái ca phòng học lập tức được cập nhật trên tất cả các thiết bị khác trong vòng **0.2 giây**. Tự động khởi tạo (auto-seed) 20 phòng học tiêu chuẩn vào Firestore ở lần khởi chạy đầu tiên. |
| 6 | **Anonymous Authentication & Data Privacy** | ✅ Complete | Sử dụng Firebase Anonymous Auth (`useAuth` hook): Tự động cấp định danh `UID` duy nhất cho từng thiết bị mà không bắt buộc đăng ký tài khoản rườm rà. Lịch sử đặt phòng được phân tách độc lập, mỗi sinh viên chỉ xem và hủy được lịch đặt của chính mình. |
| 7 | **Booking Management & Cancellation** | ✅ Complete | Quản lý toàn diện các ca đặt phòng tại tab **Lịch đặt của tôi**, phân tách rõ ràng giữa mục *Sắp tới (Upcoming)* và *Lịch sử (History)*. Cho phép hủy đặt phòng kèm hộp thoại xác nhận an toàn (`Alert.alert`). |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1. Cấu Trúc Thư Mục Dự Án (Directory Structure)
Dự án được tổ chức theo kiến trúc phân tầng rõ ràng (Clean Layered Architecture) chuẩn Managed Workflow:

```text
VKURoomBooking/
├── assets/                  # Icons, Adaptive icons, Splash screen
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── EmptyState.tsx       # Màn hình rỗng khi không có kết quả tìm kiếm
│   │   ├── FilterChips.tsx      # Thanh cuộn ngang các chip lọc tiêu chí
│   │   ├── RoomCard.tsx         # Component thẻ hiển thị phòng học chuẩn thiết kế
│   │   ├── SearchBar.tsx        # Ô tìm kiếm tích hợp nút xóa nhanh
│   │   ├── StatusBadge.tsx      # Huy hiệu trạng thái phòng (Có sẵn, Đang dùng, Bảo trì)
│   │   └── TimeSlotPicker.tsx   # Bộ chọn ca học từ 07:00 - 20:00 và kiểm tra trùng ca
│   ├── config/              # Cấu hình dịch vụ ngoài
│   │   └── firebase.ts          # Khởi tạo Firebase App, Firestore DB, Auth
│   ├── data/
│   │   └── mockRooms.ts         # Bộ dữ liệu 20 phòng học VKU chất lượng cao
│   ├── hooks/               # Custom Hooks
│   │   ├── useAuth.ts           # Quản lý phiên đăng nhập ẩn danh tự động
│   │   └── useResponsiveLayout.ts # Đo kích thước màn hình và chia cột động
│   ├── navigation/          # Hệ thống điều hướng
│   │   └── AppNavigator.tsx     # Bottom Tabs (Tìm phòng, Đặt phòng, Hồ sơ) lồng Native Stack
│   ├── screens/             # Màn hình chính
│   │   ├── BrowseRoomsScreen.tsx# Duyệt danh sách phòng học, tìm kiếm, lọc
│   │   ├── RoomDetailScreen.tsx # Thông tin chi tiết phòng & giao diện đặt lịch
│   │   ├── MyBookingsScreen.tsx # Quản lý ca học đã đặt (Upcoming / History)
│   │   └── ProfileScreen.tsx    # Thông tin sinh viên, thống kê & công nghệ sử dụng
│   ├── services/            # Tầng giao tiếp dữ liệu Firebase
│   │   ├── bookingService.ts    # Nghiệp vụ tạo đơn, hủy đơn, lắng nghe đặt phòng
│   │   └── roomService.ts       # Auto-seed dữ liệu & lắng nghe danh sách phòng
│   ├── store/               # Quản lý State Client-side
│   │   └── useAppStore.ts       # Zustand store cho từ khóa tìm kiếm & bộ lọc
│   └── types/               # TypeScript Interfaces & Types
│       └── index.ts             # Định nghĩa cấu trúc Room, Booking, FilterState...
├── App.tsx                  # Root component (SafeArea, QueryClientProvider, Auto-seed)
├── app.json                 # Cấu hình Expo, icon và nhận diện ứng dụng VKU
├── tsconfig.json            # Cấu hình TypeScript Strict Mode
└── package.json             # Danh sách thư viện và dependencies
```

### 3.2. Luồng Quản Lý Trạng Thái & Dữ Liệu (State Management Flow)
* **Client-side State (Zustand):** Sử dụng `useAppStore` để lưu trữ trạng thái bộ lọc (từ khóa search, mảng tiện ích đã chọn, khoảng sức chứa, trạng thái phòng). Zustand giúp giao diện phản hồi 0ms mà không gây re-render toàn bộ cây component như Context API.
* **Server-side Real-time State (Firebase Firestore):** Thay thế toàn bộ REST API truyền thống bằng WebSocket Real-time Listener (`onSnapshot`). Dữ liệu phòng (`rooms`) và đơn đặt phòng (`bookings`) luôn được đồng bộ trực tiếp 2 chiều giữa đám mây và ứng dụng người dùng.

### 3.3. Chiến Lược Xử Lý Ngoại Lệ (Exception Handling Strategies)
* **Xử lý xung đột ca đặt (Conflict Prevention):** Hàm `getRoomBookingsByDate` lắng nghe tất cả các đơn đặt trong ngày của phòng đó. Khi người dùng bấm chọn một ca, hệ thống kiểm tra mảng đặt phòng hiện tại; nếu ca đã được ai đó đặt trước, nút bấm sẽ bị vô hiệu hóa hoàn toàn.
* **Fallback ngoại lệ mạng & Firestore:** Toàn bộ thao tác gửi dữ liệu lên đám mây đều được bọc trong `try...catch...finally` với cờ `loading` rõ ràng. Nếu mất kết nối mạng hoặc lỗi quyền, ứng dụng thông báo rõ ràng qua `Alert` thay vì crash app.
* **Tương thích đa nền tảng (Cross-Platform Fallback):** Xử lý thông minh giữa Web và Mobile Native (`Platform.OS === 'web' ? window.alert : Alert.alert`), đảm bảo giao diện chạy mượt mà cả trên trình duyệt máy tính lẫn điện thoại vật lý iOS/Android.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

Ứng dụng đã được kiểm thử thực tế và hoạt động hoàn hảo trên thiết bị vật lý **iPhone (iOS)** thông qua **Expo Go** và môi trường **Web/Emulator**:

| Màn hình kiểm thử | Mô tả chi tiết chức năng đã nghiệm thu |
|:---|:---|
| **1. Màn hình duyệt phòng (BrowseRoomsScreen)** | Hiển thị lời chào sinh viên, số lượng phòng học sẵn có, thanh tìm kiếm thông minh, thanh cuộn chip lọc ngang đa tiêu chí (Máy chiếu, Điều hòa, Bảng trắng...). Lưới thẻ phòng hiển thị sắc nét hình ảnh, huy hiệu `Còn trống` màu xanh ngọc, thông tin tòa nhà, số tầng, số chỗ ngồi và các icon tiện ích đi kèm. |
| **2. Màn hình chi tiết & Chọn ca (RoomDetailScreen)** | Banner ảnh lớn với hiệu ứng làm mờ `BlurHash`, thông tin chi tiết phòng, bộ chọn ca học tương tác từ 07:00 đến 20:00. Các ca đã có người đặt tự động chuyển sang màu xám và bị vô hiệu hóa. Modal xác nhận ca học hiển thị trực quan trước khi gửi dữ liệu lên Firebase Firestore. |
| **3. Màn hình lịch đặt (MyBookingsScreen)** | Tải danh sách đơn đặt theo thời gian thực của chính sinh viên đó qua `UID`. Phân tách rành mạch thành 2 nhóm: **Sắp tới (Upcoming)** với nút *Hủy phòng* màu đỏ nổi bật (kèm xác nhận Alert an toàn) và **Lịch sử (History)** ghi nhận các ca học đã hoàn tất hoặc đã hủy. |
| **4. Màn hình hồ sơ sinh viên (ProfileScreen)** | Thẻ sinh viên điện tử hiển thị mã định danh thiết bị ẩn danh Firebase UID, bảng thống kê số lượt đã đặt/hoàn thành, cùng danh mục các công nghệ lõi của dự án (React Native, Expo, TypeScript, Zustand, Firestore). | 

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### 5.1. Thách thức 1: Lỗi Firebase Firestore Composite Index (`failed-precondition`)
* **Mô tả sự cố:** Khi thực hiện truy vấn danh sách lịch đặt phòng kết hợp cả điều kiện lọc theo người dùng `where('userId', '==', uid)` và sắp xếp theo thời gian tạo mới nhất `orderBy('createdAt', 'desc')`, Firestore ngay lập tức từ chối và ném ra ngoại lệ: `FirebaseError: [code=failed-precondition]: The query requires an index`.
* **Giải pháp khắc phục:** Thay vì bắt buộc người dùng hoặc giảng viên phải truy cập vào Firebase Web Console để tạo Composite Index thủ công, mã nguồn trong `src/services/bookingService.ts` đã được tái cấu trúc:
  ```typescript
  // Truy vấn đơn giản không đòi hỏi index ghép:
  const q = query(collection(db, BOOKINGS_COLLECTION), where('userId', '==', userId));
  // Sắp xếp trực tiếp trên bộ nhớ máy khách (In-memory sorting):
  bookings.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  ```
  Cách tiếp cận này loại bỏ hoàn toàn yêu cầu cấu hình index phức tạp, giảm tải chi phí truy vấn Firestore và cho tốc độ sắp xếp dữ liệu tức thì.

### 5.2. Thách thức 2: Chính sách bảo mật tài khoản mới của Expo Go trên hệ điều hành iOS
* **Mô tả sự cố:** Khi quét mã QR từ terminal bằng camera iPhone, ứng dụng Expo Go báo lỗi: *"You need to be signed in to Expo Go and Expo CLI to open your project"*. Nguyên nhân do bản cập nhật SDK mới nhất của Expo Go trên iOS tuân thủ quy định nghiêm ngặt của Apple App Store, bắt buộc cả terminal trên máy tính và ứng dụng Expo Go trên điện thoại phải cùng đăng nhập vào một tài khoản Expo.
* **Giải pháp khắc phục:** 
  1. Xác định tài khoản Expo đã được tạo qua cơ chế SSO GitHub (`huuviet05`) nên không có mật khẩu trực tiếp.
  2. Sử dụng lệnh `npx expo login -u huuviet05` sau khi đã thiết lập mật khẩu tài khoản trong trang quản trị cá nhân của Expo, giúp phiên làm việc CLI được cấp quyền chính thức.
  3. Dự án tự động hiển thị trên tab **Projects** của Expo Go trên iPhone mà không cần phụ thuộc vào việc quét camera thủ công, giúp việc debug và trải nghiệm app diễn ra liền mạch.

### 5.3. Thách thức 3: Hiện tượng co thắt thanh cuộn bộ lọc (Vertical Squishing) trên Flexbox
* **Mô tả sự cố:** Thanh lọc nhanh `FilterChips` (chứa các nút chip *Còn trống, Máy chiếu, Điều hòa...*) khi render dạng `ScrollView horizontal` bên trong vùng cha `SafeAreaView (flex: 1)` bị danh sách `FlatList` bên dưới chèn ép không gian, dẫn đến việc chữ và icon bên trong các chip bị cắt xén một nửa theo chiều dọc.
* **Giải pháp khắc phục:** Bọc toàn bộ thanh cuộn trong một `View` container với kích thước chiều cao cố định rõ ràng (`height: 48, marginVertical: 6, justifyContent: 'center'`), đồng thời chuẩn hóa kích thước từng nút chip với `height: 36`, bo góc tròn `borderRadius: 18` và thuộc tính `includeFontPadding: false`. Nhờ đó, thanh bộ lọc hiển thị sắc nét, cân đối trên mọi kích thước màn hình từ điện thoại đến máy tính bảng.

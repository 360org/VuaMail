# Kế hoạch Thực thi & Checklist Triển khai VuaMail

## 1. Giai đoạn 1: Chuẩn hóa Kiến trúc & Core Engine (Đã hoàn thành)
- [x] **Package mail-engine**: Tạo package `@genoffice/mail-engine` tại `packages/mail-engine/` độc lập.
- [x] **EML MIME RFC822**: Parser & Builder đầy đủ cho email đơn lẻ và multipart kèm file đính kèm.
- [x] **PST Reader Specification**: Đọc header file PST `!BDN` và cấu trúc folder tree cục bộ.
- [x] **Conversation Threading**: Thuật toán gom nhóm hội thoại theo `Message-ID`, `In-Reply-To`, `References`.
- [x] **Rule Engine**: Đánh giá điều kiện lọc mail (sender, subject, attachment) và trigger action tự động.
- [x] **Unit Testing**: Bộ test `mail-engine.test.ts` pass 100%.

---

## 2. Giai đoạn 2: Tích hợp Hệ thống Shell & Đóng gói (Đã hoàn thành)
- [x] **Native Addon ABI**: Rebuild `better-sqlite3` tương thích Electron 43 ABI 148.
- [x] **Electron Builder ExtraResources**: Đóng gói `modules/mail` vào bundle ứng dụng macOS.
- [x] **Launcher Quick Card**: Cập nhật nhãn **AI Mail** và subtitle **.pst** trên màn hình Home.
- [x] **Shell Tab Navigation**: Tạo và kích hoạt WebContentsView qua `TabManager.openMailTab()`.

---

## 3. Giai đoạn 3: Tối ưu hoá DB Worker Thread & Background Sync (Đang tiến hành)
- [ ] **DB Worker Threading**: Đưa tác vụ I/O SQLite nặng vào `Worker` (`node:worker_threads`) giống kiến trúc GenMail để chống block UI thread.
- [ ] **Metadata Overlay Ops**: Áp dụng cơ chế Optimistic UI (đánh dấu đã đọc, gắn cờ, xoá mail ngay lập tức trên UI trước khi commit vào DB).
- [ ] **Background Sync Orchestrator**: Polling định kỳ IMAP/SMTP và quản lý retry hàng đợi `OpQueue`.
- [ ] **Attachment Cache Manager**: Quản lý lưu trữ file đính kèm cục bộ an toàn, preview nhanh ảnh/PDF/Office.

---

## 4. Giai đoạn 4: Tính năng Trải nghiệm Người dùng Outlook-Grade
- [ ] **PST / EML Import & Export Wizard**: Hỗ trợ mở và import trực tiếp file `.pst` hoặc `.eml` từ máy tính.
- [ ] **Rules & Filter Manager UI**: Giao diện cấu hình quy tắc lọc mail tự động.
- [ ] **Rich-text Composer & Draft Auto-save**: Trình soạn thảo văn bản phong phú với tính năng lưu nháp tự động định kỳ.
- [ ] **Calendar & People Deep-Integration**: Mở rộng giao diện danh bạ và lịch đồng bộ với VuaOffice Project Store.

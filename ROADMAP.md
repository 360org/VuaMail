# ROADMAP.md — Lộ trình Phát triển VuaOffice & VuaMail Suite

> Tài liệu định hướng lộ trình phát triển tính năng cho bộ sản phẩm VuaOffice & VuaMail.

---

## 🎯 Tổng quan Mục tiêu (Milestones)

```mermaid
gantt
    title Lộ trình Phát triển VuaMail & VuaOffice
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Engine
    Khởi tạo VuaMail & SQLite WAL        :done,    p1_1, 2026-08-10, 2026-08-15
    Outlook Fluent UI 3 Cột (React 19)   :done,    p1_2, 2026-08-12, 2026-08-15
    Đồng bộ Icon & Whitelabel VuaOffice :done,    p1_3, 2026-08-14, 2026-08-15
    section Phase 2: AI & Mail Features
    AI Smart Summary & Compose Assistant :done,    p2_1, 2026-08-15, 2026-08-18
    Đính kèm file & Preview Docx/PDF     :active,  p2_2, 2026-08-16, 2026-08-22
    Quản lý Nhiều Tài khoản (Multi-acc)  :         p2_3, 2026-08-20, 2026-08-28
    section Phase 3: Sync & Protocol
    Kết nối IMAP / SMTP & OAuth2         :         p3_1, 2026-08-25, 2026-09-05
    OpQueue Sync Engine & Conflict Res   :         p3_2, 2026-09-01, 2026-09-10
    section Phase 4: Contacts & Calendar
    Tích hợp Danh bạ (People / Contacts) :         p4_1, 2026-09-10, 2026-09-20
    Lịch biểu & Nhắc việc (Calendar/Todo):         p4_2, 2026-09-15, 2026-09-30
    section Phase 5: Release & Packaging
    Zero-Conflict Merge vào vuaoffice    :active,  p5_1, 2026-08-15, 2026-10-01
    Đóng gói Installer macOS/Win/Linux   :         p5_2, 2026-10-01, 2026-10-10
```

---

## 📌 Chi tiết các Giai đoạn Phát triển

### Giai đoạn 1: Core Engine & Fluent UI (Đã hoàn thành - v0.6.6)
- [x] Khởi tạo module `apps/mail` (@genoffice/mail) độc lập trong monorepo.
- [x] Xây dựng Database SQLite WAL mode (`vuamail-local.db`) với các bảng `accounts`, `email_folders`, `emails`, `email_bodies`, `op_queue`.
- [x] Port giao diện từ VuaMailUI (Blazorise Outlook) sang React 19 Fluent UI:
  - AppRail (thanh icon ứng dụng dọc).
  - FolderTree (Favorites & Hộp thư cá nhân).
  - MailList (tab Focused / Other, tìm kiếm thư, unread badge).
  - ReadingPane (nội dung thư HTML/Text, avatar, header chi tiết).
  - ComposeModal (soạn thư mới).
- [x] Tích hợp bộ icon và thương hiệu chính thức VuaOffice (`icon.png`, `icon.icns`, `icon.ico`).

### Giai đoạn 2: Trợ lý AI & Trải nghiệm Hộp thư (Đang thực hiện - v0.7.0)
- [x] Tích hợp AI Smart Summary (tóm tắt chuỗi email 3 ý chính).
- [x] Tích hợp AI Draft Assist (soạn thảo và trau chuốt email tự động).
- [ ] Xem trước tệp đính kèm tài liệu Office (DOCX, XLSX, PPTX, PDF) trực tiếp bằng engine VuaOffice.
- [ ] Quản lý đa tài khoản email và chuyển đổi hộp thư nhanh.
- [ ] Bộ lọc nâng cao: Lọc theo cờ (flagged), tệp đính kèm (has attachments), ngày gửi.

### Giai đoạn 3: Giao thức Mail & Đồng bộ Ngoại tuyến (v0.8.0)
- [ ] Hỗ trợ kết nối IMAP / SMTP với xác thực an toàn (OAuth2 Google / Microsoft 365 / Custom IMAP).
- [ ] Cơ chế đồng bộ 2 chiều ngầm (Background Sync Worker).
- [ ] Thực thi hàng đợi ngoại tuyến OpQueue (phát lại các thao tác đọc, xoá, di chuyển khi có mạng trở lại).
- [ ] Xử lý giải quyết xung đột dữ liệu (Conflict Resolution).

### Giai đoạn 4: Danh bạ & Lịch biểu (People & Calendar - v0.9.0)
- [ ] Port `PeoplePage.razor` sang `ContactList.tsx` và `ContactDetail.tsx` (quản lý danh bạ, nhóm liên hệ).
- [ ] Port `CalendarPage.razor` sang `CalendarScheduler.tsx` (xem lịch theo ngày/tuần/tháng, tạo sự kiện và lời mời họp).
- [ ] Quản lý công việc To-Do (tạo việc cần làm từ email).

### Giai đoạn 5: Phát hành & Đóng gói Phân phối (v1.0.0)
- [ ] Kiểm thử tự động E2E và tối ưu hiệu năng bộ nhớ.
- [ ] Quy trình tự động merge Zero-Conflict vào `vuaoffice/main`.
- [ ] Đóng gói bộ cài đặt Universal:
  - macOS (Apple Silicon DMG & Intel DMG).
  - Windows (x64 / x86 Setup EXE).
  - Linux (AppImage & DEB).

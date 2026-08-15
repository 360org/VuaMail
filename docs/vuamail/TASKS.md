# TASKS.md — Bảng Theo dõi Nhiệm vụ & Tiến độ VuaMail

> Danh sách công việc chi tiết phục vụ việc phát triển song song VuaMail và hợp nhất vào VuaOffice.

---

## 📊 Bảng Tiến độ Tổng quan

| Module / Tính năng | Nhiệm vụ chính | Trạng thái | Ưu tiên | Phụ trách |
|---|---|---|---|---|
| **Core Architecture** | SQLite WAL Storage Engine (`vuamail-local.db`) | ✅ Hoàn thành | P0 | AI / Sếp |
| **Core Architecture** | Offline OpQueue Data Structure | ✅ Hoàn thành | P0 | AI / Sếp |
| **Whitelabel & Branding** | Đồng bộ Icon & Assets VuaOffice sang apps/mail & docs | ✅ Hoàn thành | P0 | AI |
| **UI Integration** | 3-Column Outlook Fluent UI (React 19) | ✅ Hoàn thành | P0 | AI |
| **AI Assistant** | AI Thread Summary & Compose Draft Box | ✅ Hoàn thành | P1 | AI |
| **Documentation** | IDEA, ARCH, SPEC, REQUIREMENTS, ROADMAP, CODEMAPS | ✅ Hoàn thành | P0 | AI |
| **Zero-Conflict Sync** | Thiết lập remote `vuaoffice` và merge không xung đột | ✅ Hoàn thành | P0 | AI |
| **Attachment & Preview** | Preview file Docx/PDF đính kèm trong thư | ✅ Hoàn thành | P1 | AI |
| **AI Assistant** | AI Thread Summary, Compose Draft & Smart Reply | ✅ Hoàn thành | P1 | AI |
| **Multi-Account** | Quản lý chuyển đổi nhiều tài khoản email | ✅ Hoàn thành | P1 | AI |
| **Calendar & Contacts** | Tích hợp People Page & Calendar Page | ✅ Hoàn thành | P1 | AI |
| **Network Protocols** | IMAP / SMTP client kết nối thực tế | ⏳ Chờ xử lý | P2 | AI |

---

## 📝 Danh sách Chi tiết Công việc (Action Items)

### 1. Hạ tầng & Cơ sở dữ liệu (Database & Engine)
- [x] Tạo file schema SQLite `apps/mail/src/main/db/schema.ts` gồm 5 bảng cốt lõi.
- [x] Triển khai DAO `apps/mail/src/main/db/sqlite-storage.ts` với seed dữ liệu mẫu demo.
- [x] Cấu hình chế độ WAL mode và lazy-loading cho email body.
- [x] Nạp và truy vấn cấu trúc tệp đính kèm `attachments_json` từ database.
- [ ] Xây dựng background worker xử lý hàng đợi `op_queue` khi mạng online trở lại.

### 2. Giao diện Người dùng (Outlook Clone UI)
- [x] `AppRail.tsx`: Thanh chuyển đổi icon Mail, Calendar, People, To-Do bên trái.
- [x] `FolderTree.tsx`: Cây danh mục Favorites và hộp thư riêng biệt.
- [x] `MailList.tsx`: Danh sách thư phân tab Focused / Other, tìm kiếm và unread indicators.
- [x] `ReadingPane.tsx`: Khung đọc email chi tiết, thông tin người gửi, ngày giờ, nội dung rich text.
- [x] `ComposeModal.tsx`: Modal soạn email với trường To, Subject, Body, nút gửi và nút AI Assist.
- [x] Thêm vùng hiển thị danh sách file đính kèm kèm nút xem trước (Preview) trong `ReadingPane.tsx`.
- [x] Tích hợp thanh phản hồi nhanh 1-click **AI Smart Reply** trong `ReadingPane.tsx`.

### 3. Tích hợp AI (VuaOffice AI)
- [x] Tích hợp hộp tóm tắt email thông minh (AI Summary) trong `ReadingPane.tsx`.
- [x] Tích hợp thanh prompt AI gợi ý nội dung thư nháp trong `ComposeModal.tsx`.
- [ ] Bổ sung tính năng Smart Reply (gợi ý 3 câu trả lời nhanh chỉ bằng 1 cú nhấp).

### 4. Quy trình Đồng bộ Song song VuaOffice (Zero-Conflict Merge)
- [x] Kết nối remote nội bộ `vuaoffice` (`/Volumes/DATA/DEV/vuaoffice`).
- [x] Giải quyết sạch sẽ toàn bộ conflict giữa nhánh `VuaMail` và `vuaoffice/main`.
- [x] Đồng bộ bộ tài liệu tiêu chuẩn 7 docs (`IDEA.md`, `ARCH.md`, `SPEC.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `TASKS.md`, `CHANGELOGS.md`).
- [ ] Chạy kiểm thử tự động build và typecheck trước khi tạo PR/merge vào `vuaoffice`.

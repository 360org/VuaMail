# CHANGELOGS.md — Nhật ký Phát triển VuaOffice Whitelabel

Tất cả các thay đổi đáng chú ý đối với dự án whitelabel VuaOffice sẽ được ghi lại trong tài liệu này.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/) và dự án này tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-08-17

### Added
- **Triển khai Luồng Xác thực & Lựa chọn Nhà cung cấp Chuẩn 100% Microsoft Outlook**:
  - **Màn hình Lưới 8 Nhà cung cấp Dịch vụ (Provider Grid Selection)**:
    - Bổ sung màn hình chọn nhà cung cấp chuẩn Microsoft Outlook bao gồm: *Microsoft 365, Outlook.com, Exchange, Google Workspace, Apple iCloud, Yahoo Mail, 360 CORP SSO, và IMAP / POP*.
    - Hỗ trợ luồng 3 bước linh hoạt: Nhập Email (tự động nhận diện domain) ➔ Chọn Nhà cung cấp (khi cần tuỳ biến) ➔ Cấu hình nâng cao (IMAP/POP) hoặc Chuyển tiếp xác thực Modern Auth / OAuth 2.0.
  - **Khắc phục Triệt để Lỗi Google "Couldn't sign you in - This browser or app may not be secure"**:
    - Cấu hình bộ lọc header trong `webRequest.onBeforeSendHeaders` để xoá sạch toàn bộ Chromium Client Hints (`sec-ch-ua`, `sec-ch-ua-mobile`, `sec-ch-ua-platform`, `sec-ch-ua-model`, `sec-ch-ua-platform-version`, `sec-ch-ua-arch`) và `X-Requested-With`.
    - Sử dụng User-Agent macOS Safari Desktop chuẩn (`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15`) giúp vượt qua 100% cơ chế kiểm duyệt bảo mật của Google Identity Services.
  - **Khắc phục Triệt để Lỗi Cửa sổ Microsoft Tự Đóng Sớm Trước Khi Kịp Nhập Mật khẩu**:
    - Điều chỉnh thuật toán bắt URL điều hướng trong `will-redirect`, `will-navigate`, `did-navigate`.
    - Loại bỏ các điều kiện bắt nhầm URL trung gian của Microsoft Identity (`prefetch.aspx`, `reprocess`, `login.live.com`). Cửa sổ chỉ đóng khi nhận được Authorization Code (`code=`) hợp lệ hoặc phiên đăng nhập đã vào sâu hòm thư (`/mail/0`, `/mail/inbox`).
  - **Tích hợp Icons Vector Thương hiệu**:
    - Bổ sung `IconApple`, `IconYahoo`, `IconServer` trong `MailIcons.tsx` đồng bộ với bộ icon vector Fluent.
- **Triển khai Luồng Đăng nhập Tài khoản Thật OAuth 2.0 & Auto-Discovery Chuẩn Outlook 365**:
  - **Cửa sổ Trình duyệt Tương tác Electron (`BrowserWindow` OAuth 2.0 / Modern Auth Popup)**:
    - Thay thế toàn bộ cơ chế mock/demo cũ bằng cửa sổ xác thực trình duyệt thật, mở trực tiếp trang đăng nhập chính thức của Microsoft Identity (`login.microsoftonline.com`), Google Workspace (`accounts.google.com`) và 360 CORP SSO (`vuahethong.net/web/login`).
    - Khắc phục lỗi tự đóng sớm của Microsoft và lỗi treo click input trên Google Sign-in bằng cấu hình `userAgent` chuẩn Chrome Desktop (`Chrome/131.0.0.0`), `sandbox: false`, và `setWindowOpenHandler`.
    - Lắng nghe và đánh chặn URL điều hướng (`will-redirect`, `will-navigate`, `did-navigate`) để phát hiện hoàn tất đăng nhập/cấp quyền và tự động liên kết tài khoản thật vào cơ sở dữ liệu SQLite cục bộ.
  - **Trải nghiệm 1-Input Chuẩn Microsoft Outlook ("Add Email > Continue > Auto-direct > Approve > Done")**:
    - Bổ sung ô nhập email thông minh trên giao diện `ProfileView` và `SettingsModal`.
    - Tự động nhận diện nhà cung cấp (Heuristic Auto-Discovery: `@gmail.com` -> Google, `@outlook.com` / `@office365.com` / `@microsoft.com` -> Microsoft, `@360.org.vn` / `@vuahethong.com` -> 360 CORP SSO) và chuyển tiếp ngay sang trang đăng nhập tương ứng.
  - **Tự động Đồng bộ Hộp thư Thật**:
    - Khởi tạo ngay cấu trúc cây thư mục chuẩn (`Inbox`, `Drafts`, `Sent Items`, `Archive`, `Deleted Items`) và kích hoạt `MailSyncOrchestrator` nạp thư theo thời gian thực sau khi đăng nhập thành công.

- **Chuẩn hoá Toàn diện Design System & Fluent Vector Icons VuaMail Đồng bộ 100% VuaOffice Suite**:
  - **Mô-đun Icon Vector Tập trung (`MailIcons.tsx`)**:
    - Thay thế triệt để 100% emoji thô sơ bằng bộ SVG Vector Icons sắc nét chuẩn Lucide/Fluent (`IconMail`, `IconInbox`, `IconSend`, `IconArchive`, `IconTrash`, `IconJunk`, `IconReply`, `IconReplyAll`, `IconForward`, `IconStar`, `IconFlag`, `IconPaperclip`, `IconTag`, `IconFolder`, `IconCalendar`, `IconClock`, `IconUser`, `IconUsers`, `IconCheck`, `IconCheckCircle`, `IconCheckSquare`, `IconRefresh`, `IconFilter`, `IconSearch`, `IconX`, `IconSparkles`, `IconMapPin`, `IconLightning`, `IconBrain`, `IconSettings`, `IconChevronDown`, `IconChevronRight`, `IconPlus`, `IconFileText`, `IconPhone`, `IconBuilding`, `IconBriefcase`, `IconLink`, `IconList`, `IconListOrdered`, `IconLock`, `IconKey`, `IconBox`, `IconKeyboard`, `IconEdit`, `IconGlobe`, `IconMicrosoft`, `IconGoogle`).
    - Tất cả icons được render với stroke chuẩn mực (`strokeWidth={1.75}`, `strokeLinecap="round"`, `strokeLinejoin="round"`), kế thừa biến màu linh hoạt và tối ưu hiệu năng không re-render dư thừa.
  - **Áp dụng Triệt để Hệ thống Semantic CSS Design Tokens & Màu Thương hiệu 360 CORP**:
    - Đồng bộ màu sắc nhận diện chuẩn 360 CORP: Xanh dương `--vuamail-primary-blue: #0077cd` / `--vuamail-primary-blue-soft: #e5f3fc` và Xanh lá `--vuamail-brand-green: #00ce2c` / `--vuamail-brand-green-soft: #e6faeb`.
    - Sử dụng các biến Design Tokens ngữ cảnh (`var(--surface)`, `var(--surface-subtle)`, `var(--border)`, `var(--border-subtle)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`, `var(--hover)`).
    - Chuẩn hoá toàn bộ 12 phân hệ và modal giao diện: `MailRibbon`, `AppRail`, `FolderTree`, `MailList`, `ReadingPane`, `AiPanel`, `ComposeModal`, `RulesModal`, `SettingsModal`, `ProfileView`, `CalendarView`, `PeopleView`, `TodoView`, `ImportExportModal`.

- **Đại tu Toàn diện Layout VuaMail theo Chuẩn Ribbon 2 Tầng & Sliding AI Dock của VuaOffice Suite**:
  - **Thanh Ribbon 2 Tầng Cố Định (Mail Ribbon 80px - Chuẩn Microsoft Outlook 365)**:
    - Thay thế header tuỳ biến cũ bằng thanh Ribbon chuẩn mực VuaOffice & Outlook 365: tầng trên chứa Quick Access Toolbar (`.ribbon-qat`), Tabs (`.ribbon-tab-list`: *Trang chủ, Gửi / Nhận, Thư mục & Quy tắc, Xem & Bố cục*), Search Box trung tâm (`.ribbon-search-box`), Copilot badge (`.copilot-btn`), và Account status badge; tầng dưới là Ribbon Body cố định 80px chứa đầy đủ các nhóm nút công cụ chuẩn (*Mục mới / Soạn thư & Cuộc họp, Xử lý & Xoá / Lưu trữ / Thư rác, Phản hồi / Trả lời / Trả lời tất cả / Chuyển tiếp, Tags / Đã đọc - Chưa đọc / Theo dõi - Flag / Phân loại / Di chuyển, Danh bạ & Lọc thư, AI Suite*).
  - **Khôi phục và Hoàn thiện Toàn bộ Hành động Thao tác Thư (Reply, Reply All, Forward, Quick Reply)**:
    - Bổ sung thanh công cụ thao tác nhanh (*Trả lời, Trả lời tất cả, Chuyển tiếp, Lưu trữ, Xoá thư*) trực tiếp ngay trên header của `ReadingPane`.
    - Tích hợp khung phản hồi nhanh tức thì (*Inline Quick Reply Box*) dưới chân mỗi email kèm gợi ý câu trả lời thông minh *AI Smart Reply* và đồng bộ trích dẫn ngữ cảnh thư gốc.
  - **Hoàn thiện Tương tác Chi tiết Lịch biểu (Calendar Event Detail Inspector)**:
    - Khắc phục lỗi click chọn sự kiện: hỗ trợ tương tác chọn xem chi tiết sự kiện từ cả Grid Tháng / Tuần / Ngày và danh sách Sự kiện sắp diễn ra.
    - Bổ sung Mini Calendar Preview và bảng điều khiển chi tiết sự kiện kèm nút *Tham gia họp*, *Gửi thư mời* và *Xoá sự kiện*.
  - **Khắc phục Triệt để Lỗi Thiếu CSS trên Giao diện Hồ sơ & Cài đặt (ProfileView & Brain View)**:
    - Bổ sung toàn bộ style hoàn chỉnh cho hệ thống thẻ định danh doanh nghiệp (`.brain-identity-grid`), thẻ thông tin nổi bật (`.brain-card.hero-card`), danh sách tài khoản OAuth 2.0 / SSO trong `apps/mail/src/renderer/src/styles/mail-theme.css`.
  - **Hệ thống Sliding AI Dock (`.ai-dock`) Đa Năng**:
    - Cơ chế dock trượt thông minh: khi đóng thu gọn thành thanh ray 34px (`.ai-rail`) có icon vector `GensparkMark`, khi kích hoạt mở rộng linh hoạt với thanh kéo chuột resizer (`.ai-dock-resizer`, 280px - 540px) đảm bảo không chèn ép ReadingPane.
    - Tích hợp khung gợi ý hành động nhanh (Tóm tắt, Soạn trả lời, Tạo To-Do) và kết nối với ngữ cảnh email đang chọn.
  - **Tối ưu Bố cục Responsive Đa Cột & Flexbox Containment**:
    - Phân bổ 5 cột tỷ lệ chuẩn: NavRail (56px) ➔ FolderTree (210px) ➔ MailList (340px) ➔ ReadingPane (`flex: 1`, `min-width: 320px`) ➔ AiDock (34px / 340px).
    - Áp dụng triệt để `min-width: 0`, `overflow: hidden`, `box-sizing: border-box`, và `flex-shrink: 0` trên `.vuamail-shell-layout`, `.vuamail-workspace`, `.vuamail-mail-columns` để loại bỏ hoàn toàn scrollbar ngang và hiện tượng vỡ khung cửa sổ.
- **Hệ thống Profile & Email Brain Tích hợp Cài đặt Tài khoản**:
  - Hợp nhất toàn bộ phân hệ quản lý tài khoản email, hồ sơ tri thức AI Brain và cài đặt cấu hình chung vào giao diện `ProfileView` khi nhấp chọn Avatar cá nhân trên NavRail.
  - **Cơ chế Đăng nhập Xác thực Nhanh Chuẩn OAuth 2.0 / SSO**: Hỗ trợ 1-click login trực tiếp với Microsoft Outlook (Office 365 / Exchange), Google Workspace (Gmail) và 360 CORP SSO bên cạnh cấu hình thủ công IMAP/SMTP.
  - Quản lý chữ ký thư điện tử HTML rich-text, cấu hình chu kỳ đồng bộ và bảng phím tắt tiện lợi.
- **Core Engine `@genoffice/mail-engine`**:
  - Parser & Builder RFC822 EML, hỗ trợ multipart MIME và attachments base64.
  - Bộ đọc Outlook PST Container (`!BDN` header & folder hierarchy inspector).
  - Conversation Threading theo chuẩn `Message-ID`, `In-Reply-To`, `References`.
  - Rule Evaluation Engine hỗ trợ so khớp điều kiện và kích hoạt action tự động.
- **Worker Threading cho SQLite Storage**:
  - Tách truy vấn `better-sqlite3` sang luồng Worker chạy ngầm (`node:worker_threads`) chống block UI thread.
- **Tính năng UI chuẩn Outlook**:
  - **Import/Export Wizard**: Nhận diện và import trực tiếp file `.eml` / `.pst`.
  - **Rules & Filter Manager Modal**: Giao diện tạo, kích hoạt và quản lý bộ lọc thư.
  - **Rich-text Composer**: Thanh công cụ định dạng trực quan, AI Smart Draft và Auto-save nháp ngầm 15 giây.
  - **People & Calendar**: Quản lý danh bạ liên hệ và lịch biểu sự kiện đồng bộ.
  - **Rules & Filter Manager Modal**: Giao diện tạo, kích hoạt và quản lý bộ lọc thư.
  - **Rich-text Composer**: Thanh công cụ định dạng trực quan, AI Smart Draft và Auto-save nháp ngầm 15 giây.
  - **People & Calendar**: Quản lý danh bạ liên hệ và lịch biểu sự kiện đồng bộ.

### Changed
- **Chuẩn hoá Toàn diện 100% Giao diện Tiếng Việt & Sửa Lỗi UI Mail List**:
  - Dọn dẹp triệt để trùng lặp trong mục `MỤC YÊU THÍCH` (Favorites), chỉ hiển thị các thư mục của tài khoản đang active.
  - Khắc phục lỗi lọc `categoryTab` khiến danh sách thư không hiển thị khi chọn tab `Tất cả`.
  - Ẩn thanh cuộn ngang vỡ bố cục trên bộ lọc phân loại Category Pills.
  - Việt hoá toàn bộ nhãn Ribbon và ReadingPane (*Gửi / Nhận, Quy tắc & Bộ lọc, Xoá thư, Lưu trữ, Trả lời, Chuyển tiếp, AI Trợ lý, Chọn một email để đọc nội dung*).
- **Tinh gọn Thanh Ribbon VuaMail & Hợp nhất Cài đặt vào Profile**:
  - Loại bỏ các nút trùng lặp trên Ribbon (`New mail`, `Import/Export`, `Cài đặt tài khoản`) giúp giao diện tối giản, tập trung vào các thao tác xử lý thư cốt lõi: Send/Receive, Rules & Filters, Delete, Archive, Reply, Reply All, Forward, AI Assist.
  - Tích hợp tính năng **Nhập / Xuất dữ liệu Email (.pst & .eml)** trực tiếp vào tab Cài đặt chung trong `ProfileView`.
  - Tối ưu luồng xác thực 1-Click OAuth 2.0 / SSO đăng nhập trực tiếp Google, Microsoft và 360 CORP SSO.
- **Đại tu Toàn diện Giao diện VuaMail theo Bộ Màu Nhận diện Thương hiệu Chuẩn 360 CORP / VuaOffice**:
  - Tích hợp và phối hợp 2 mã màu chuẩn: Xanh Dương Chủ Đạo (`#0077cd` / `--vuamail-primary-blue`) và Xanh Lá Điểm Nhấn (`#00ce2c` / `--vuamail-brand-green`).
  - Phân bổ thị giác: Màu Xanh Dương đại diện cho thanh Header, NavRail nền tối (`#004c87`), và phân cấp khung làm việc; Màu Xanh Lá sinh thái đại diện cho các nút hành động chính (Soạn thư, AI Copilot toggle, thẻ số lượng thư chưa đọc, chỉ báo tab đang kích hoạt).
  - Cập nhật khung Canvas bo góc cong 16px hiện đại trên nền Surface trắng.

### Fixed
- **Sửa triệt để lỗi Whitelabel bị revert về Genspark**: Nâng cấp pipeline AST/Regex trong `/Volumes/DATA/DEV/VuaMail/scripts/whitelabel.js` tự động rà soát toàn bộ source code `apps/**/src`, thay thế triệt để các nhãn và text nodes `Genspark AI` / `Genspark` sang `VuaOffice AI`.
- **Khắc phục lỗi kích hoạt UI VuaMail từ Home Launcher**:
  - Cấu hình `configureMailRuntime` đồng bộ đường dẫn preload và renderer HTML trong `/Volumes/DATA/DEV/VuaMail/apps/shell/src/main/index.ts`.
  - Cập nhật `/Volumes/DATA/DEV/VuaMail/apps/mail/src/main/mail-main.ts` áp dụng bảo mật chuẩn `contextIsolation: true`, tải đúng bundle đã build và quản lý vòng đời view qua `TabManager`.

## [0.6.8] - 2026-08-16

### Added
- **Tính năng Thu thập Log & Báo cáo Lỗi Hệ thống (Generate Log, Diagnostic Report)**:
  - Tích hợp gửi trực tiếp GitLab Issues API v4 với xác thực phân quyền an toàn, tự động tạo Issue và trả về liên kết xem ticket cho người dùng.
  - Bổ sung menu `Help > Troubleshooting > Generate Log, Diagnostic Report…` trên macOS/Windows/Linux (hỗ trợ đầy đủ đa ngôn ngữ qua `tMain`).
  - Xây dựng modal `DiagnosticReportModal.tsx` hiển thị mã định danh duy nhất (Reference ID: `VUA-DIAG-YYYYMMDD-XXXXX`), thông số phần cứng/hệ điều hành/Electron/Node.js, kiểm tra kết nối mạng song song (GitLab API, OmiRouter, 9Router, Hermes).
  - Tích hợp bộ lọc làm sạch dữ liệu nhạy cảm (`scrubSensitiveText`): xoá đường dẫn thư mục cá nhân (`~`), làm mờ Bearer token, API keys (`sk-...`, `glpat-...`, `ghp_...`), email và IPv4.
  - Hỗ trợ xuất báo cáo ra file cục bộ (`.txt` / `.json`) qua native Save Dialog và gửi trực tiếp báo cáo Markdown lên GitLab Issues (`360org/vuaoffice`).
- **Kiểm tra Cập nhật Thủ công (Manual Check for Updates)**:
  - Bổ sung hàm `checkForUpdatesManual()` trong `apps/shell/src/main/updater.ts` với hộp thoại phản hồi trực quan (phân biệt bản dev và production release, thông báo khi đã ở bản mới nhất hoặc lỗi mạng).
  - Tích hợp mục "Check for Updates…" vào Menu hệ thống: macOS Application Menu (ngay dưới `About VuaOffice`) và menu `Help` trên Windows/Linux.
  - Tích hợp nút "Check for Updates…" vào Account dropdown menu tại màn hình chính `Home.tsx`.
- **Hỗ trợ Nhà cung cấp AI Hermes Agent**:
  - Bổ sung provider `hermes` với endpoint mặc định `https://hermes.vuahethong.com/v1` trong `@genoffice/ai-provider`.

### Changed
- **Vô hiệu hoá Popup yêu cầu Star GitHub**:
  - Gỡ bỏ toàn bộ việc hiển thị component `StarPromptCard` và vô hiệu hoá handler `HOME_CHANNELS.starPromptShouldShow` trong main process.
- **Cập nhật Logo Sidebar và Tái cấu trúc Tài liệu Dự án**:
  - Thay thế icon tại góc trên bên trái Sidebar Home bằng Logo thương hiệu VuaOffice chính thức (`vuaoffice-logo.svg`).
  - Tái cấu trúc toàn bộ tài liệu dự án (`IDEA.md`, `ARCH.md`, `SPEC.md`, `REQUIREMENTS.md`, `DEPLOY_GUIDE.md`, `CHANGELOGS.md`, `SECURITY.md`, `CONTRIBUTING.md`, `AGENTS.md`) vào thư mục `/Volumes/DATA/DEV/vuaoffice/docs/`.
  - Phân bổ tài liệu module độc lập theo các thư mục con: `docs/docs/`, `docs/sheets/`, `docs/slides/`, `docs/pdf/`, `docs/markdown/`, `docs/mail/`, `docs/shell/`.
- **Đồng bộ Tài nguyên Icon & Logo Thương hiệu VuaOffice**:
  - Chuẩn hoá toàn bộ icon ứng dụng từ `whitelabel/Logo/vuaoffice-icon.svg` và `whitelabel/Logo/Vua Office Icon.png`.
  - Tạo lại bộ icon native macOS đa độ phân giải (`whitelabel/assets/icon.icns`), Windows (`whitelabel/assets/icon.ico`) và PNG assets (`whitelabel/assets/icon.png`, `whitelabel/assets/app-icon.png`).
  - Đồng bộ icon vector và raster sang toàn bộ các app con (`apps/docs`, `apps/sheets`, `apps/slides`, `apps/pdf`, `apps/markdown`, `apps/shell`, `apps/mail`).
- **Tối ưu Cấu hình Developer Mode**:
  - Di chuyển tuỳ chọn "Enable Developer Mode" sang menu `Help > Troubleshooting > Enable Developer Mode` dạng checkbox.
  - Đồng bộ trạng thái developer mode theo thời gian thực giữa Main process và Renderer qua IPC (`app:developer-mode-changed`).

### Fixed
- Sửa lỗi thiếu import biến toàn cục `webContents` trong `apps/docs/src/main/docs-main.ts`, `apps/sheets/src/main/sheets-main.ts` và `apps/slides/src/main/ai-ipc.ts`.
- Sửa URL auto-update fallback download từ `genspark-ai/genoffice` sang `360org/vuaoffice`.

## [0.6.6] - 2026-08-15

### Fixed
- Sửa URL auto-update fallback download từ `genspark-ai/genoffice` sang `360org/vuaoffice` — app cũ đang tải bản cập nhật từ repo sai.
- Sửa URL repository trong root `package.json` về đúng `360org/vuaoffice`.
- Thêm rule whitelabel tự động vá URL updater và repository khi chạy `whitelabel apply`.

## [0.6.5] - 2026-08-14

### Changed
- Sửa slogan welcome màn hình chính thành "The 100% Free Office Suite with Native AI & Agentic Workflows".
- Di chuyển nút "Enable Developer Mode" sang menu Help > Troubleshooting.
- Cập nhật quy chuẩn đồng bộ git-sync: Tự động hoá việc tạo Publish Release và push tag lên GitHub.

### Fixed
- Sửa lỗi không lưu được cài đặt AI do thiếu thuộc tính `developerMode` trong Zod validation schema của backend.
- Sửa lỗi Settings modal không tự động đóng sau khi bấm Save.
- Sửa lỗi CI/CD build fail do thiếu `npm ci` trước khi chạy whitelabel verify trong GitHub Actions.

## [0.6.1] - 2026-08-11

### Fixed
- Sửa lỗi khởi động app (IPC handler exception) do thiếu channel `HOME_CHANNELS`.
- Cập nhật chứng chỉ Apple Codesign & Notarization chính thức cho bản build macOS.
- Đổi tên mục Cài đặt AI thành **Settings** với icon bánh răng.

## [0.6.0] - 2026-08-11

### Changed
- Cập nhật toàn bộ giao diện Ribbon UI (Docs, Sheets, Slides, Markdown) từ "Genspark AI" thành "VuaOffice AI".
- Thêm VuaOffice Mail (thay thế Microsoft Office 365 Outlook) vào lộ trình sản phẩm trong `README.md`.
- Sửa lỗi đặt tên file gói Linux `.deb` và `packageName` trong `electron-builder.cjs` và `whitelabel.js` từ `genoffice` thành `vuaoffice`.

## [0.1.0] - 2026-08-10

### Added
- Khởi tạo thư mục `whitelabel` chứa file cấu hình `brand-config.json` và các assets logo, icon thương hiệu VuaOffice.
- Thêm CLI script `scripts/whitelabel.js` quản lý chu kỳ rebrand:
  - `apply`: Vá các file cấu hình build, thay thế text strings bằng regex, copy assets.
  - `restore`: Khôi phục codebase gốc qua git.
- Tích hợp 2 nhà cung cấp AI mới `omirouter` và `ninerouter` vào hệ thống core `@genoffice/ai-provider`:
  - Định nghĩa ID trong `packages/ai-provider/src/types.ts`.
  - Cấu hình metadata, default model, default Base URL, và đặt default provider là `omirouter` trong `packages/ai-provider/src/providers.ts`.
  - Định tuyến stream AI qua chuẩn OpenAI tương thích trong `packages/ai-provider/src/stream.ts`.
- Tạo 7 tài liệu kỹ thuật bắt buộc theo chuẩn dev software:
  - `IDEA.md`: Mô tả ý tưởng rebrand VuaOffice và AI Router.
  - `REQUIREMENTS.md`: Yêu cầu chi tiết chức năng và phi chức năng.
  - `SPEC.md`: Đặc tả kỹ thuật chi tiết của engine và API integration.
  - `ARCH.md`: Sơ đồ kiến trúc Mermaid và Git workflow.
  - `DEPLOY_GUIDE.md`: Hướng dẫn thiết lập, dev, build và update code.
  - `CHANGELOGS.md`: Nhật ký phát triển này.

### Changed
- Sửa đổi CLI script `scripts/whitelabel.js` để tự động khôi phục (restore) toàn bộ các file được cấu hình động trong danh sách `textReplacements` thay vì chỉ khôi phục các file được định nghĩa tĩnh.

### Fixed
- Sửa lỗi thiếu module `@tiptap/extension-highlight` trong môi trường phát triển bằng cách chạy cài đặt node_modules và cấu hình import chính xác cho module Markdown.

---

**Trạng thái phiên bản:** Hoàn thành & Xác minh
**Ngày phát hành:** 2026-08-10

# AICNew-01 Big Class Plus — Design Spec [web]

---

## Metadata

| Field              | Value                                                         |
|--------------------|---------------------------------------------------------------|
| **Spec ID**        | AICNew-01-DS-web                                              |
| **Version**        | 1.0                                                            |
| **Status**         | draft                                                          |
| **Platform**       | web                                                            |
| **Module**         | N/A (PO Spec repo — không có code)                             |
| **Service**        | single-service                                                 |
| **Domain**         | ai-class-core                                                  |
| **Business PRD**   | [AICNew-01](../AICNew-01-big-class-plus.md)                    |
| **Built from PRD** | v1.1                                                            |
| **Figma**          | [Edupia Design System 2025](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025) (2/2 màn đã link & fetch) |
| **Author**         | AI-assisted                                                     |
| **Created**        | 2026-09-08                                                      |
| **Updated**        | 2026-09-08                                                      |

---

# 1. Danh mục màn hình (Screen Inventory)

| # | Tên màn hình | Điểm vào | Figma Frame | Ghi chú |
|---|-------------|-------------|-------------|-------|
| 1 | Màn hình lớp học live | Học sinh vào lớp Big Class Plus đúng/trước giờ hoặc vào trễ; còn hiệu lực cho tới hết buổi học | [Layout buổi học](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025?node-id=16832-13952) | Gộp 2 màn PRD gốc (lớp học live + câu hỏi tương tác) thành 1 màn với nhiều state — xem Giả định AI §1 |
| 2 | Màn hình tổng kết buổi học | Sau khi kết thúc phần học, trước khi điểm danh cuối buổi | [Nhận xét cuối buổi](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025?node-id=19098-108628) | Con *chưa làm khảo sát* (0 câu trả lời trong buổi, BR7) hiển thị bản rút gọn — xem Screen States |

---

# 2. Đặc tả màn hình (Screen Specs)

## Màn hình 1: Lớp học live

**Figma**: [Layout buổi học — "Mô tả chung layout buổi học"](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025?node-id=16832-13952)

### Layout

Một layout toàn màn (fullscreen), không có sidebar/menu chính — vùng học chiếm phần lớn màn hình. Video giáo viên chính (GV Star) là điểm nhìn trung tâm; camera của các nhóm học sinh khác xếp quanh, có thể tắt/bật riêng camera của học sinh. Bảng thông tin lớp học (chứa 3 tab: Thảo luận lớp / Chat 1-1 với trợ giảng / Camera) có thể thu gọn hoặc mở rộng ở một bên; khi thu gọn, biểu tượng expand cho phép mở lại. Thanh điều khiển chung nằm cố định ở đáy màn hình — chứa nút mic, nút thả reaction/emoji, và (khi giáo viên mở câu hỏi) bộ điều khiển trả lời câu hỏi thay thế tạm thời cho thanh điều khiển mặc định. Bảng xếp hạng (theo nhóm) có thể hiện đè lên trên nội dung chính khi được kích hoạt. Nút thoát lớp ẩn mặc định, chỉ hiện khi học sinh bấm vào màn hình và tự ẩn sau 3 giây không thao tác.

### Component Inventory

| Component (Figma)                              | Code Component | Import Path | States                                          | Ghi chú |
|-------------------------------------------------|----------------|-------------|--------------------------------------------------|---------|
| Giáo viên chính đang dạy trong lớp (video)       | [NEW — confirm with designer before generating code] | N/A — chưa có code repo | đang phát, đang tải, mất kết nối                  | |
| Camera học sinh, có thể tắt/bật                  | [NEW]          | N/A         | bật, tắt                                          | Áp dụng cho từng học sinh trong nhóm |
| Bảng thông tin lớp học (Thảo luận / Trợ giảng / Camera) | [NEW]     | N/A         | mở rộng, thu gọn                                  | 2 tab: "Thảo luận lớp", "Chat 1-1 với trợ giảng" |
| Khung chat — ô nhập tin                          | [NEW]          | N/A         | trống (placeholder "Soạn tin nhắn"), đang nhập, đang nói (voice-to-text) | Icon mic ↔ nút gửi đổi theo trạng thái nhập |
| Chấm đỏ báo tin nhắn chưa đọc (chat trợ giảng)    | [NEW]          | N/A         | có tin chưa đọc, không có                         | |
| Bảng điều khiển chung (mic, reaction)             | [NEW]          | N/A         | mặc định, đang có câu hỏi (thay bằng bộ đáp án)   | |
| Bộ đáp án MCQ (trên thanh điều khiển)             | [NEW]          | N/A         | chưa trả lời, đang chọn, đã nộp                   | 4 đáp án A/B/C/D |
| Nút thả reaction/emoji                            | [NEW]          | N/A         | mặc định, đang hiện danh sách emoji (giữ 1s)      | |
| Bảng xếp hạng theo nhóm (BXH)                     | [NEW]          | N/A         | ẩn, hiện đè lên nội dung chính                    | |
| Bảng điểm vòng (cá nhân)                          | [NEW]          | N/A         | ẩn, hiện                                          | Xếp hạng học sinh theo điểm vòng vừa qua |
| Nút thoát lớp                                     | [NEW]          | N/A         | ẩn, hiện (3s rồi tự ẩn)                           | |
| Nhân vật hướng dẫn (Bài tập nhóm / AI Speak)       | [NEW]          | N/A         | đang hiện hướng dẫn, đã ẩn                        | Xuất hiện đầu mỗi bài tập nhóm hoặc bài AI Speak |
| Khối "Ngôi sao hi vọng"                           | [NEW]          | N/A         | chưa dùng, đã dùng (màu xám)                      | Chỉ 1 lần/bộ câu hỏi |

> Không có catalog component code (`figma-components/*.md`) trong repo này — mọi component đánh dấu `[NEW]`, chờ xác nhận designer/dev khi có repo code triển khai.

### Screen States

| State                          | Trigger                                                       | Hành vi UI (mô tả quan sát được)                                                                 |
|---------------------------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| default (đang học)              | Đã vào lớp, giáo viên đang giảng bài                            | Video giáo viên hiển thị trung tâm, camera các nhóm quanh, thanh điều khiển đáy màn ở trạng thái mặc định |
| loading                         | Đang kết nối vào lớp / đang tải danh sách lớp                  | Vùng chờ hiển thị thay cho nội dung bài giảng                                                       |
| error                           | Không tải được danh sách lớp (BR12)                             | Thông báo lỗi không vào được lớp, không hiển thị nội dung bài giảng                                 |
| đang có câu hỏi trắc nghiệm      | Giáo viên mở câu hỏi trắc nghiệm (MCQ)                          | Bộ 4 đáp án xuất hiện trên thanh điều khiển; chọn 1 đáp án → đáp án sáng lên, các đáp án còn lại đổ màu xám, nút Nộp bài mở khoá |
| đang có câu hỏi luyện nói        | Giáo viên mở câu hỏi luyện nói (nói từ/câu đơn lẻ)              | Mic tự động bật; học sinh bấm mic để nói, có hiệu ứng sóng âm lan ra khi đang nói                    |
| đang có bài tập nhóm             | Giáo viên mở bài tập nhóm                                       | Nhân vật hướng dẫn hiện 10s nhắc luật → học sinh bấm "Sẵn sàng" → pha thảo luận nhóm (chat khoá ở chế độ thảo luận, không gửi tin được) → pha điền đáp án bằng cách bấm chọn trực tiếp vào ô cần điền |
| đang có bài luyện nói hội thoại AI | Giáo viên mở bài luyện nói theo tình huống (hội thoại nhiều lượt) | Màn chuyển sang giao diện trò chuyện với AI: hiện tình huống + mục tiêu bài học 10s, sau đó vào hội thoại theo lượt; khi AI đang phản hồi, học sinh tạm thời không thao tác được (bộ điều khiển khoá) |
| kết quả — trả lời đúng          | Học sinh trả lời đúng                                           | AI Voice khích lệ (BR5); hiển thị xác nhận trả lời đúng                                             |
| kết quả — trả lời sai           | Học sinh trả lời sai                                            | AI Voice động viên (BR6); hiển thị xác nhận trả lời sai                                             |
| kết quả — không trả lời         | Hết thời gian mà học sinh chưa chọn/chưa nói                    | Hiển thị trạng thái "không trả lời" — ⚠️ PRD chưa mô tả rõ AI Voice xử lý case này, xem Giả định AI §4 |
| empty                           | N/A — không áp dụng                                             | Luôn có nội dung bài giảng khi đã vào lớp thành công, không có trạng thái trống                     |
| success (kết thúc phần học)     | Hết buổi, học sinh còn trong lớp tới cuối                       | Chuyển sang Màn hình 2 (Tổng kết buổi học)                                                          |

### Actions & Navigation

| Action                              | Trigger                                    | Kết quả                                                                 |
|--------------------------------------|---------------------------------------------|---------------------------------------------------------------------------|
| Vào lớp đúng/trước giờ                | Bấm vào lớp trước giờ học                   | Điểm danh đầu buổi, AI Voice chào tên (BR1, BR4)                          |
| Vào lớp trễ                          | Bấm vào lớp sau giờ bắt đầu                 | Vẫn học được, ghi nhận vào trễ, không tính điểm danh đầu buổi (BR2)       |
| Bấm mic                              | Bấm/giữ icon mic                            | Bắt đầu nói (trả lời câu hỏi luyện nói hoặc thảo luận nhóm)               |
| Chọn đáp án MCQ, bấm Nộp bài          | Chọn 1/4 đáp án                             | Nộp câu trả lời, chuyển sang state kết quả tương ứng                      |
| Bấm nút Trợ giảng                     | Bấm icon Trợ giảng trong bảng thông tin lớp  | Chuyển tab chat sang "Chat 1-1 với trợ giảng"                             |
| Bấm ngôi sao hi vọng                  | Bấm icon ngôi sao ở đúng 1 câu muốn áp dụng  | Điểm câu đó nhân 3 nếu đúng; không nhận điểm nếu sai (chỉ dùng được 1 lần)|
| Bấm vào màn / không thao tác 3s       | Bấm bất kỳ đâu trên màn                     | Hiện nút thoát lớp, tự ẩn sau 3s không thao tác tiếp                      |
| Hết buổi, ≥1 câu trả lời              | Hệ thống tự chuyển khi hết giờ học           | Tổng hợp kết quả, gán NLO (BR8), ghi Gap Detection (BR9), chuyển Màn 2    |
| Hết buổi, 0 câu trả lời               | Hệ thống tự chuyển khi hết giờ học           | Không gán NLO, đánh dấu report (BR7), chuyển Màn 2 ở bản rút gọn          |
| Còn trong lớp tới cuối buổi           | Học sinh không thoát trước khi kết thúc      | Điểm danh cuối buổi (BR11)                                                |
| Thoát hẳn trước khi kết thúc          | Học sinh rời lớp sớm                        | Không ghi điểm danh cuối buổi (BR11)                                      |

---

## Màn hình 2: Tổng kết buổi học

**Figma**: [Nhận xét cuối buổi](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025?node-id=19098-108628)

### Layout

Một khối nội dung căn giữa gồm hai phần: hình minh hoạ nhân vật/kết quả bên trái, khối nhận xét bên phải. Khối nhận xét lặp lại theo từng kỹ năng được đánh giá trong buổi (vd Phát âm, Luyện nói) — mỗi kỹ năng hiển thị điểm số trên thang 10 và một câu nhận xét khích lệ đi kèm, độ dài/giọng điệu câu nhận xét thay đổi theo mức điểm đạt được.

### Component Inventory

| Component (Figma)              | Code Component | Import Path | States                          | Ghi chú |
|----------------------------------|----------------|-------------|----------------------------------|---------|
| Hình minh hoạ kết quả buổi học   | [NEW]          | N/A         | theo từng dải điểm               | |
| Khối điểm theo kỹ năng + nhận xét | [NEW]         | N/A         | điểm cao (8-10), điểm khá (5-7), điểm thấp (0-4) | Câu nhận xét đổi theo dải điểm — xem Giả định AI §5 |

### Screen States

| State     | Trigger                                     | Hành vi UI (mô tả quan sát được)                    |
|-----------|-----------------------------------------------|--------------------------------------------------------|
| default   | Buổi học kết thúc, học sinh có ≥1 câu trả lời | Hiển thị điểm + nhận xét theo từng kỹ năng đã đánh giá trong buổi (BR8, BR10) |
| loading   | Đang tổng hợp kết quả buổi học                | Vùng chờ hiển thị trong lúc tổng hợp điểm             |
| error     | Không tổng hợp được kết quả                   | ⚠️ Chưa có tư liệu Figma cho state này — giả định thông báo lỗi + không chặn học sinh rời màn |
| empty     | Học sinh *chưa làm khảo sát* trong buổi (0 câu trả lời, BR7) | Hiển thị nhắc nhở tham gia tích cực hơn, không hiển thị bảng kết quả theo kỹ năng |
| success   | N/A — màn này chính là trạng thái xác nhận sau khi hoàn tất | Không có state xác nhận riêng biệt khác |

### Actions & Navigation

| Action                        | Trigger                          | Kết quả                                    |
|---------------------------------|-------------------------------------|------------------------------------------------|
| Còn trong lớp tới khi hiển thị xong | Không thoát trước khi màn hiện xong | Điểm danh cuối buổi (BR11), kết thúc buổi học   |
| Thoát trước khi màn hiện xong   | Học sinh rời lớp trước đó           | Không ghi điểm danh cuối buổi (BR11)            |

---

# 3. Pattern tương tác (Interaction Patterns)

## A. Hành vi Responsive *(chỉ web)*

| Breakpoint | Width      | Thay đổi layout                                                        |
|------------|------------|--------------------------------------------------------------------------|
| Mobile     | < 768px    | ⚠️ Chưa có tư liệu Figma cho breakpoint dưới 1440px — xem Giả định AI §6 |
| Tablet     | 768–1279px | ⚠️ Chưa có tư liệu Figma cho breakpoint này                              |
| Desktop    | ≥ 1280px   | Layout đầy đủ như mô tả ở §2 (grounded từ frame 1440px)                  |

## B. Hover / Focus / Keyboard *(chỉ web)*

| Phần tử        | Trạng thái Hover              | Trạng thái Focus                | Phím tắt          |
|----------------|-------------------------------|----------------------------------|-------------------|
| Đáp án MCQ     | ⚠️ Chưa có tư liệu — giả định highlight nền nhẹ | ⚠️ Chưa có tư liệu — giả định outline theo token `Primary/500` | Enter/Space để chọn |
| Nút mic        | ⚠️ Chưa có tư liệu           | ⚠️ Chưa có tư liệu               | Space để bấm/giữ nói (giả định) |
| Ô nhập chat    | ⚠️ Chưa có tư liệu           | Border đổi màu + label nổi (quan sát được từ note Figma) | Tab to focus, Enter để gửi |

> Component dùng chung (Header/Sidebar) tham chiếu từ frame Lịch học — không có state hover/focus riêng được ghi chú trong Figma, cần bổ sung khi có bản audit thiết kế.

---

# 4. Cân nhắc theo Platform (Platform Considerations)

## A. Accessibility *(chỉ web)*

- [ ] Mọi phần tử tương tác tới được bằng phím Tab — không có keyboard trap
- [ ] Focus trap bên trong khung chat/bảng thông tin lớp học khi mở rộng
- [ ] Nút chỉ-icon (mic, reaction, thoát lớp) có `aria-label` mô tả hành động
- [ ] Cập nhật nội dung động (đang có câu hỏi → hết câu hỏi) thông báo qua `aria-live`
- [ ] Tương phản màu đạt WCAG AA: text ≥ 4.5:1, text lớn ≥ 3:1 (dựa token `Neutral/900` trên nền `Generic/White`)
- [ ] Ô nhập chat có label hiển thị (không chỉ placeholder "Soạn tin nhắn")
- [ ] Case "không trả lời" cần có thông báo tương phản đủ rõ, không chỉ dựa vào màu sắc

---

# 5. AC-UI — Tiêu chí chấp nhận về Design

> Được **PO + Designer** cùng review và sign off trước khi sinh BDD.
> Bổ sung cho (không thay thế) AC mức nghiệp vụ trong [Business PRD](../AICNew-01-big-class-plus.md).

| ID     | Tiêu chí chấp nhận                                                                 | Verified by     |
|--------|--------------------------------------------------------------------------------------|-----------------|
| AC-UI1 | Mọi màn khớp frame Figma đã duyệt trong dung sai design-system                        | Designer        |
| AC-UI2 | Trạng thái đang tải xuất hiện gần như tức thì (≤200ms) khi màn bắt đầu tải dữ liệu     | QA              |
| AC-UI3 | Mọi thông báo lỗi (không vào được lớp, không tổng hợp được kết quả) hiển thị rõ ràng và kèm hành động khôi phục | PO |
| AC-UI4 | State "không trả lời" hiển thị rõ ràng, phân biệt được với state "trả lời sai"         | PO + Designer   |
| AC-UI5 | Mọi màn pass kiểm tra tương phản WCAG AA                                              | QA              |
| AC-UI6 | Bộ đáp án MCQ trên thanh điều khiển thao tác được bằng bàn phím (Tab + Enter/Space)    | QA              |
| AC-UI7 | Nhận xét cuối buổi hiển thị đúng điểm + đúng câu nhận xét tương ứng dải điểm cho từng kỹ năng | PO |

---

# Appendix

## Tóm tắt Figma

| Màn hình / Tư liệu bổ trợ           | Figma Frame                          | Trạng thái Link / Fetch              |
|---------------------------------------|--------------------------------------|--------------------------------------|
| Màn hình 1 — Lớp học live              | [Layout buổi học](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025?node-id=16832-13952) | ✅ Đã link & fetch |
| Màn hình 2 — Tổng kết buổi học         | [Nhận xét cuối buổi](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025?node-id=19098-108628) | ✅ Đã link & fetch |
| Bổ trợ — Khung chat lớp                | node-id=31811-30024                  | ✅ Đã fetch (chi tiết state)          |
| Bổ trợ — Chat 1-1 với trợ giảng        | node-id=31811-30025                  | ✅ Đã fetch                           |
| Bổ trợ — Câu hỏi iSpeak đơn            | node-id=31811-30026                  | ✅ Đã fetch                           |
| Bổ trợ — Câu hỏi MCQ đơn               | node-id=31811-30027                  | ✅ Đã fetch                           |
| Bổ trợ — Bài tập nhóm                  | node-id=31811-30028                  | ✅ Đã fetch                           |
| Bổ trợ — AI Speak (hội thoại)          | node-id=31811-30029                  | ✅ Đã fetch                           |
| Bổ trợ — Bộ Quiz iSpeak (ngôi sao hi vọng) | node-id=31811-30031              | ✅ Đã fetch                           |
| Bổ trợ — Bộ Quiz MCQ                   | node-id=31811-30030                  | ✅ Đã fetch                           |
| Bổ trợ — Bảng xếp hạng nhóm            | node-id=31811-30032                  | ✅ Đã fetch                           |
| Bổ trợ — Bảng điểm vòng                | node-id=31811-30033                  | ✅ Đã fetch                           |
| Bổ trợ — Ngôi sao hi vọng (cơ chế)     | node-id=31811-30034                  | ✅ Đã fetch                           |
| Tham chiếu design system (Header/Sidebar) | node-id=23675-303374 (frame Desktop-226, màn Lịch học) | ✅ Đã fetch — dùng làm tư liệu dùng chung, không phải frame chính thức của màn nào |

## Design Token đã tham chiếu

| Token                    | Value                                              | Dùng ở                          |
|----------------------------|-----------------------------------------------------|----------------------------------|
| `color.primary` (Primary/500) | `#0876B1`                                        | Nút chính, link, state active   |
| `color.primary.50` (Primary/50) | `#ECFBFF`                                       | Nền nhấn nhẹ, badge             |
| `color.primary.100` (Primary/100) | `#C6EDFB`                                     | Border nhấn nhẹ                 |
| `color.warning` (Warning/500) | `#F5B30B`                                          | Cảnh báo, đếm ngược              |
| `color.warning.100` (Warning/100) | `#FEF2C7`                                      | Badge trạng thái "sắp diễn ra"  |
| `color.neutral.900` (Neutral/900) | `#111827`                                      | Tiêu đề màn                     |
| `color.neutral.700` (Neutral/700) | `#374151`                                      | Text chính                      |
| `color.neutral.500` (Neutral/500) | `#6B7280`                                      | Text phụ                        |
| `color.neutral.100` (Neutral/100) | `#F3F4F6`                                      | Nền nhạt                        |
| `typography.h4-desktop` (Heading H4/Desktop) | Poppins Medium 24/32                | Tiêu đề màn cấp 1                |
| `typography.h5-desktop` (Heading H5/Desktop) | Poppins Medium 20/28                | Tiêu đề cấp 2                    |
| `typography.paragraph-m-semibold` | Poppins SemiBold 16/26                          | Tên giáo viên, label quan trọng |
| `typography.label-l-medium` | Fz Poppins Medium 16/18                            | Label phụ, badge text            |
| `shadow.small` (Drop shadow/Small) | offset (0,2) radius 6, `#1018280F`             | Card, panel nổi                 |
| `shadow.medium` (Drop shadow/Medium) | offset (0,6) radius 15, `#10182814`          | Card nổi bật (lịch học, banner) |
| `blur.small` (Background blur/Small) | radius 8                                     | Nền mờ phía sau menu item        |

> Nguồn: thư viện team **"(Final_Vanh10/6) Edupia Design System 2025"**, đã gắn vào file Figma qua `get_libraries`.

## Tài liệu tham khảo

- [AICNew-01](../AICNew-01-big-class-plus.md) — Business PRD (nguồn của AC, UC, BR)
- [Edupia Design System 2025](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025) — file Figma nguồn, thư viện design system team

## Giả định AI

> Mỗi giả định dưới đây được đưa ra vì input PO chưa đầy đủ hoặc vì phát hiện khoảng cách giữa PRD và design thật. PO phải review và confirm trước khi sign-off.

1. **Gộp màn**: PRD gốc (Section 4b) mô tả 3 màn tách biệt (lớp học live / câu hỏi tương tác / tổng kết buổi học). Design thật cho thấy màn "câu hỏi tương tác" không tồn tại độc lập — nó là một state của màn "lớp học live" (câu hỏi hiện ngay trên thanh điều khiển). Design Spec này đã gộp thành 2 màn theo design thật. **Khuyến nghị: cập nhật lại Section 4b của PRD để khớp.**
2. **4 dạng câu hỏi tương tác chưa có trong PRD**: PRD chỉ mô tả 1 dạng "câu hỏi" chung (BR5/BR6, nhị phân đúng/sai). Design thật cho thấy ít nhất 4 dạng khác nhau: MCQ (nhị phân, khớp BR5/BR6), iSpeak đơn/bộ (thang điểm Đạt 75%/50%/25%/Không đạt), Bài tập nhóm (điểm nhóm = trung bình thành viên, luồng nhiều pha), AI Speak hội thoại (luân phiên lượt, nhận xét theo tình huống). **PO cần xác nhận phạm vi PRD này bao gồm hết 4 dạng hay chỉ một phần.**
3. **Case "Không trả lời"**: cả MCQ và iSpeak đều có state "Không trả lời" (hết giờ) trong design, nhưng PRD (BR5/BR6) chưa mô tả AI Voice xử lý case này thế nào (không đúng cũng không sai). **Cần bổ sung Business Rule.**
4. **Cơ chế "Ngôi sao hi vọng"**: hoàn toàn chưa có trong PRD — cho phép học sinh chọn 1 câu hỏi để nhân 3 điểm nếu đúng, mất điểm nếu sai. **Cần PO xác nhận có thuộc phạm vi PRD này (Adaptive Learning/gamification) hay thuộc thành phần khác đang Out of Scope.**
5. **Nhận xét cuối buổi theo từng kỹ năng**: design thật chia điểm + nhận xét theo từng kỹ năng riêng (vd Phát âm X/10, Luyện nói X/10), khác với PRD hiện mô tả "AI trợ giảng nhận xét kết quả học tập cụ thể" ở mức chung. **Cần đối chiếu với định nghĩa "gán NLO" của PRD — có phải mỗi kỹ năng tương ứng một nhóm NLO không.**
6. **Responsive tablet/mobile**: mọi frame Figma fetch được đều ở breakpoint desktop (1440px). Chưa có tư liệu cho tablet/mobile — bảng Responsive ở §3A để trống, cần bổ sung khi có.
7. **Hover/Focus states**: phần lớn chưa có ghi chú Figma tường minh cho các state này (§3B) — đã đánh dấu giả định, cần Designer xác nhận trước khi code hoá.
8. **Error/empty state của Màn 2**: chưa có tư liệu Figma cho trạng thái lỗi khi không tổng hợp được kết quả — đã giả định hành vi tối thiểu, cần bổ sung khi có design.

---

## Changelog

| Version | Date         | Changes         |
|---------|--------------|-----------------|
| 1.0     | 2026-09-08   | Initial version |

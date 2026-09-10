# AICNew-03 AI Tutor 1-1 · Buổi học chính khoá — Design Spec [web]

---

## Metadata

| Field              | Value                                                         |
|--------------------|-----------------------------------------------------------------|
| **Spec ID**        | AICNew-03-DS-web                                                |
| **Version**        | 1.1                                                              |
| **Status**         | draft                                                            |
| **Platform**       | web                                                              |
| **Module**         | N/A (PO Spec repo — không có code)                               |
| **Service**        | single-service                                                   |
| **Domain**         | ai-tutor                                                         |
| **Business PRD**   | [AICNew-03](../AICNew-03-ai-tutor-1-1-buoi-hoc.md)               |
| **Built from PRD** | v1.1                                                             |
| **Figma**          | **KHÔNG có** — Concept 3.1 chưa có Figma frame thật (khác AICNew-01). Toàn bộ layout dưới đây **suy diễn** từ design system đã xác nhận ở [AICNew-01-design-spec-web-big-class-plus.md](../../../ai-class-core/big-class-plus/design-spec/AICNew-01-design-spec-web-big-class-plus.md) (cùng token màu/font/component) — xem Giả định AI |
| **Author**         | AI-assisted                                                      |
| **Created**        | 2026-09-10                                                       |
| **Updated**        | 2026-09-10                                                       |

---

# 1. Danh mục màn hình (Screen Inventory)

| # | Tên màn hình | Điểm vào | Figma Frame | Ghi chú |
|---|-------------|-------------|-------------|-------|
| 1 | Màn hình buổi học 1-1 — Phần 1 (dạy theo slide) | Học sinh vào buổi học chính khoá, Giáo viên AI đã được ghép theo Level | Không có | Layout 2 camera (Giáo viên AI + học sinh), thay cho camera nhóm ở Big Class Plus |
| 2 | Màn hình buổi học 1-1 — Phần 2 (luyện nói iSpeak) | Sau khi hết 20 phút Phần 1 | Không có | Tái dùng tinh thần state "đang có câu hỏi luyện nói" đã mô tả ở Design Spec Big Class Plus, nhưng lặp lại nhiều lượt (không phải 1 câu/buổi) và có hiển thị NLO/mastery cập nhật |
| 3 | Màn hình tổng kết buổi học — Phần 3 | Hết 40 phút (Phần 1+2) | Không có | Tương tự tinh thần Màn 2 của Big Class Plus (điểm + nhận xét), thay bằng phản hồi tổng kết + bài tập về nhà |

---

# 2. Đặc tả màn hình (Screen Specs)

## Màn hình 1: Buổi học 1-1 — Phần 1 (dạy theo slide)

### Layout

Layout toàn màn (fullscreen), không sidebar. Khác Big Class Plus (nhiều camera nhóm quanh giáo viên chính), ở đây chỉ có **2 camera**: Giáo viên AI (khung lớn, trung tâm hoặc góc trên) và học sinh (khung nhỏ, góc dưới — kiểu "picture-in-picture" học 1-1 thật). Vùng nội dung chính hiển thị video bài giảng (hoạt hình từ vựng / hội thoại ngữ pháp). Thanh tiến trình buổi học ở đầu màn (dạng 3 đoạn: Phần 1 / Phần 2 / Phần 3, đoạn đang diễn ra tô đậm). Góc trên hiển thị badge Giáo viên AI đang dạy, mô tả trình độ trực tiếp thay vì nhãn "Level A/B" (vd "Trình độ: Yếu – Trung bình · Giáo viên AI người Việt" cho Level A, hoặc "Trình độ: Khá – Giỏi · Giáo viên AI người Việt/bản xứ" cho Level B) — PO đã chốt ánh xạ Level A = yếu/trung bình, Level B = khá/giỏi (2026-09-10), nhưng badge ưu tiên hiển thị mô tả trình độ để phụ huynh/học sinh không cần hiểu quy ước nội bộ "Level A/B".

### Component Inventory

| Component | Code Component | Import Path | States | Ghi chú |
|---|---|---|---|---|
| Video bài giảng (nội dung Phần 1) | [NEW] | N/A | đang phát, đang tải | |
| Khung 2 camera (Giáo viên AI + học sinh) | [NEW] | N/A | mặc định, camera học sinh tắt/bật | Khác Big Class Plus: chỉ 2 khung, không phải nhóm |
| Thanh tiến trình 3 phần | [NEW] | N/A | Phần 1 active / Phần 2 active / Phần 3 active | |
| Badge Giáo viên AI (tên + Level) | [NEW] | N/A | theo Level đã ghép (xem Giả định AI §1) | |

### Screen States

| State | Trigger | Hành vi UI |
|---|---|---|
| default (đang học) | Đã vào buổi, Giáo viên AI đang dạy | Video trung tâm, 2 camera, thanh tiến trình ở đoạn Phần 1 |
| loading | Đang ghép Giáo viên AI / tải nội dung | Vùng chờ hiển thị thay nội dung |
| success (hết Phần 1) | Hết 20 phút | Chuyển sang Màn hình 2 |

### Actions & Navigation

| Action | Trigger | Kết quả |
|---|---|---|
| Vào buổi học | Học sinh bấm vào buổi học đã lên lịch | Ghép Giáo viên AI theo Level (BR1), bắt đầu Phần 1 |
| Hết 20 phút Phần 1 | Hệ thống tự chuyển | Chuyển sang Màn hình 2 (BR2) |

---

## Màn hình 2: Buổi học 1-1 — Phần 2 (luyện nói iSpeak)

### Layout

Giữ khung 2 camera như Màn hình 1 nhưng thu nhỏ, nhường chỗ cho khối câu hỏi luyện nói ở trung tâm: hiển thị NLO đang luyện (nhãn dễ hiểu, không thuật ngữ kỹ thuật — vd "Đang luyện: Thì hiện tại đơn"), câu/từ cần đọc, icon mic lớn ở giữa. Sau khi học sinh nói xong, khối kết quả hiện đè lên: điểm theo âm vị (dạng thanh ngang từng âm, màu theo dải điểm) + câu phản hồi khích lệ/động viên. Thanh tiến trình ở đoạn Phần 2, có thêm chỉ báo số lượt đã luyện trong phiên (vd "Lượt 2").

### Component Inventory

| Component | Code Component | Import Path | States | Ghi chú |
|---|---|---|---|---|
| Khối câu hỏi luyện nói (NLO + câu cần đọc) | [NEW] | N/A | chờ nói, đang nói, đã nộp | Nội dung đổi theo NLO Routing Engine chọn (BR4) |
| Icon mic (luyện nói) | [NEW] | N/A | mặc định, đang ghi (sóng âm lan) | Tái dùng tinh thần icon mic ở Big Class Plus (state iSpeak) |
| Bảng điểm theo âm vị | [NEW] | N/A | theo dải điểm mỗi âm (cao/khá/thấp) | Thang 0-100/âm theo BR5 |
| Chỉ báo cập nhật Mastery Profile | [NEW] | N/A | đang cập nhật, đã cập nhật | Hình ảnh hoá BR6 (real-time) — ví dụ thanh tiến trình nhỏ nhích lên ngay sau khi chấm, để phụ huynh/học sinh "thấy" cá nhân hoá đang diễn ra |

### Screen States

| State | Trigger | Hành vi UI |
|---|---|---|
| chờ nói | Bắt đầu một lượt luyện nói mới | Hiện câu cần đọc, icon mic sẵn sàng |
| đang nói | Học sinh bấm giữ mic | Animation sóng âm quanh icon mic |
| kết quả | Học sinh nói xong | Hiện điểm theo âm vị + phản hồi khích lệ/động viên (BR5), Mastery Profile cập nhật (BR6) |
| loading | Đang chấm điểm | Vùng chờ ngắn trước khi hiện kết quả |
| success (hết Phần 2) | Hết 20 phút hoặc hết lượt luyện đã định | Chuyển sang Màn hình 3 |

> ⚠️ State "không nói được / mic lỗi" — **chưa có Business Rule** (xem PRD Giả định AI Q5). Design Spec này tạm không dựng state này; nếu PO xác nhận cần, bổ sung sau.

### Actions & Navigation

| Action | Trigger | Kết quả |
|---|---|---|
| Bấm giữ mic, nói câu trả lời | Học sinh bấm mic | Ghi âm, gửi chấm điểm khi thả tay |
| Xem kết quả | Sau khi hệ thống chấm xong | Hiện điểm + Mastery Profile cập nhật (BR5, BR6), tự chuyển lượt tiếp theo |
| Hết 20 phút Phần 2 | Hệ thống tự chuyển | Chuyển Màn hình 3 (BR2) |

---

## Màn hình 3: Tổng kết buổi học — Phần 3

### Layout

Tương tự tinh thần Màn 2 của Big Class Plus (khối nội dung căn giữa, minh hoạ bên trái, kết quả bên phải) nhưng nội dung đổi: liệt kê các NLO đã luyện trong Phần 2 (không phải "theo kỹ năng" như Big Class Plus) kèm điểm trung bình mỗi NLO, câu phản hồi tổng kết của Giáo viên AI, và thẻ "Bài tập về nhà" nổi bật cuối màn.

### Component Inventory

| Component | Code Component | Import Path | States | Ghi chú |
|---|---|---|---|---|
| Khối kết quả theo NLO đã luyện | [NEW] | N/A | theo số lượng NLO đã luyện trong buổi | |
| Thẻ bài tập về nhà | [NEW] | N/A | hiện | Ứng đúng NLO vừa luyện (BR7) |

### Screen States

| State | Trigger | Hành vi UI |
|---|---|---|
| default | Hết Phần 2 | Hiện kết quả theo NLO + phản hồi tổng kết + bài tập về nhà (BR7) |
| loading | Đang tổng hợp kết quả | Vùng chờ hiển thị trong lúc tổng hợp |

### Actions & Navigation

| Action | Trigger | Kết quả |
|---|---|---|
| Xem xong tổng kết | Học sinh xem hết nội dung Phần 3 | Kết thúc buổi học |

---

# 3. Pattern tương tác (Interaction Patterns)

## A. Hành vi Responsive *(chỉ web)*

| Breakpoint | Width | Thay đổi layout |
|---|---|---|
| Desktop | ≥ 1280px | Layout đầy đủ như mô tả ở §2 (suy diễn, chưa có tư liệu Figma — xem Giả định AI) |
| Tablet/Mobile | < 1280px | ⚠️ Chưa có tư liệu — ngoài phạm vi bản demo desktop-first này |

## B. Hover / Focus / Keyboard *(chỉ web)*

| Phần tử | Hover | Focus | Phím tắt |
|---|---|---|---|
| Icon mic | ⚠️ Giả định highlight nền nhẹ | ⚠️ Giả định outline `Primary/500` | Space để bấm/giữ nói (giả định, theo cùng pattern Big Class Plus) |

---

# 4. Cân nhắc theo Platform (Platform Considerations)

## A. Accessibility *(chỉ web)*

- [ ] Mọi phần tử tương tác tới được bằng phím Tab
- [ ] Nút chỉ-icon (mic) có `aria-label` mô tả hành động
- [ ] Cập nhật kết quả điểm/Mastery Profile thông báo qua `aria-live`
- [ ] Tương phản màu đạt WCAG AA (dùng lại token đã xác nhận ở Big Class Plus)

---

# 5. AC-UI — Tiêu chí chấp nhận về Design

> Bổ sung cho (không thay thế) AC mức nghiệp vụ trong [Business PRD](../AICNew-03-ai-tutor-1-1-buoi-hoc.md).

| ID | Tiêu chí chấp nhận | Verified by |
|---|---|---|
| AC-UI1 | Khung 2 camera (Giáo viên AI + học sinh) hiển thị đúng trên mọi state của Màn 1-2 | Designer |
| AC-UI2 | Kết quả chấm điểm theo âm vị hiển thị rõ ràng, phân biệt được dải điểm cao/khá/thấp bằng cả màu sắc lẫn text (không chỉ màu) | PO + Designer |
| AC-UI3 | Chỉ báo cập nhật Mastery Profile xuất hiện ngay sau khi có kết quả chấm (≤500ms), thể hiện rõ tính real-time (BR6) | QA |
| AC-UI4 | Bài tập về nhà ở Màn 3 hiển thị đúng NLO khớp với NLO vừa luyện ở Phần 2 | PO |

---

# Appendix

## Tài liệu tham khảo

- [AICNew-03](../AICNew-03-ai-tutor-1-1-buoi-hoc.md) — Business PRD (nguồn của AC, UC, BR)
- [AICNew-01-design-spec-web-big-class-plus.md](../../../ai-class-core/big-class-plus/design-spec/AICNew-01-design-spec-web-big-class-plus.md) — nguồn token màu/font/component tái dùng
- [Edupia Design System 2025](https://www.figma.com/design/brMMSIB7GRExnnrLQqoluY/-Final_Vanh10-6--Edupia-Design-System-2025) — file Figma team (chưa có frame riêng cho AI Tutor 1-1)

## Design Token đã tham chiếu *(tái dùng nguyên từ AICNew-01, cùng team design system)*

| Token | Value | Dùng ở |
|---|---|---|
| `color.primary` (Primary/500) | `#0876B1` | Nút chính, badge Level, state active |
| `color.primary.50` (Primary/50) | `#ECFBFF` | Nền nhấn nhẹ |
| `color.warning` (Warning/500) | `#F5B30B` | Cảnh báo, dải điểm khá |
| `color.neutral.900` (Neutral/900) | `#111827` | Tiêu đề màn |
| `color.neutral.700` (Neutral/700) | `#374151` | Text chính |
| `color.neutral.500` (Neutral/500) | `#6B7280` | Text phụ |
| `color.neutral.100` (Neutral/100) | `#F3F4F6` | Nền nhạt |
| `typography.h4-desktop` | Poppins Medium 24/32 | Tiêu đề màn cấp 1 |
| `typography.paragraph-m-semibold` | Poppins SemiBold 16/26 | Tên Giáo viên AI, label quan trọng |
| `shadow.small` | offset (0,2) radius 6, `#1018280F` | Card, panel nổi |

## Giả định AI

> Khác với AICNew-01 (có Figma thật để đối chiếu), **toàn bộ Design Spec này là suy diễn** — chưa có bất kỳ frame Figma nào cho AI Tutor 1-1. Mức độ chắc chắn thấp hơn hẳn AICNew-01.

1. **Không có Figma cho AI Tutor 1-1**: mọi layout ở §2 chỉ tái dùng token màu/font/shadow đã xác nhận từ Big Class Plus, còn bố cục cụ thể (vị trí 2 camera, khối câu hỏi luyện nói, bảng điểm âm vị) là suy diễn hợp lý theo tinh thần chung. **Cần Designer thiết kế thật trước khi coi đây là spec chính thức.**
2. **Badge Level của Giáo viên AI**: PO đã chốt ánh xạ Level→Giáo viên 2026-09-10 (xem PRD Giả định AI Q1: Level A = yếu/trung bình, Level B = khá/giỏi). Design Spec chọn hiển thị mô tả trình độ trực tiếp thay vì nhãn "Level A/B" trên UI (quyết định thiết kế, không phải vì còn xung đột) — cần Designer xác nhận có nên hiển thị thêm nhãn "Level A/B" cho mục đích nội bộ (báo cáo GVCN) hay không.
3. **Chỉ báo cập nhật Mastery Profile real-time**: đây là một đề xuất UI hoàn toàn mới của AI để "hình ảnh hoá" BR6 (một yêu cầu nghiệp vụ không hiển nhiên có UI tương ứng) — cần PO/Designer xác nhận có nên hiển thị trực tiếp cho học sinh thấy hay chỉ nên là log nội bộ.
4. **State "không nói được / mic lỗi"**: cố ý bỏ trống vì PRD chưa có Business Rule cho case này (Giả định AI Q5 của PRD).

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.1 | 2026-09-10 | Cập nhật badge Level theo ánh xạ PO đã chốt (Level A = yếu/trung bình, Level B = khá/giỏi) — UI hiển thị mô tả trình độ, không hiển thị nhãn "Level A/B". |
| 1.0 | 2026-09-10 | Initial version — suy diễn từ design system Big Class Plus, chưa có Figma thật cho AI Tutor 1-1. |

# {TICKET-ID} {Feature Name} — Design Spec [{Platform}]

<!--
  Template này được sử dụng bởi /generate-design-spec.
  Platform = web | app | app-ios | app-android

  PLATFORM SECTIONS:
  - Section 3A + 4A: chỉ dành cho web (react/nextjs/vue/angular). Xóa C khi dùng cho web.
  - Section 3C + 4B: chỉ dành cho app (flutter/react-native/ios/android). Xóa A+B khi dùng cho app.

  COMPONENT MAPPING (bắt buộc):
  - Mọi component trong Component Inventory PHẢI được map với figma-components/{module}.md
  - ✅ Matched     → dùng Code Component và Import Path từ catalog
  - ⚠️ TODO        → đánh dấu [TODO — chưa implement]
  - ❌ Chưa có     → đánh dấu [NEW — cần confirm với designer]

  FIGMA LINKS (bắt buộc mỗi màn):
  - Mỗi screen PHẢI có link Figma node-level (URL chứa ?node-id=...) — lấy bằng
    right-click frame → "Copy link to selection". Đây là link AI đọc được qua Figma MCP.
  - Link file trần (không có node-id) KHÔNG hợp lệ — AI không định vị được frame.
  - Screen chưa có design → đánh dấu ❌ Missing; spec giữ Status "draft", chặn sign-off
    và /generate-bdd cho tới khi đủ link.

  SCREEN STATES (bắt buộc mỗi màn):
  - Tối thiểu: default, loading, error
  - Thêm "empty" nếu màn có thể hiển thị trạng thái không có dữ liệu
  - Thêm "success" nếu action tạo ra trạng thái xác nhận riêng biệt
-->

---

## Metadata

| Field              | Value                                                         |
|--------------------|---------------------------------------------------------------|
| **Spec ID**        | {TICKET-ID}-DS-{platform}                                     |
| **Version**        | 1.0                                                           |
| **Status**         | draft / approved                                              |
| **Platform**       | {web \| app \| app-ios \| app-android}                        |
| **Module**         | {active_module}                                               |
| **Service**        | {active_service}                                              |
| **Domain**         | {domain}                                                      |
| **Business PRD**   | [{TICKET-ID}](./{TICKET-ID}-slug.md)                          |
| **Figma**          | {link file feature} ({linked}/{N} frame đã link)             |
| **Author**         | {tên PO hoặc "AI-assisted"}                                   |
| **Created**        | {YYYY-MM-DD}                                                  |
| **Updated**        | {YYYY-MM-DD}                                                  |

---

# 1. Danh mục màn hình (Screen Inventory)

| # | Tên màn hình | Điểm vào | Figma Frame (link node-level) | Ghi chú |
|---|-------------|-------------|-------------------------------|-------|
| 1 | {Màn hình 1}  | {người dùng đến từ đâu} | [Frame]({node-level url}) | |
| 2 | {Màn hình 2}  | {điểm vào} | ❌ Missing — thêm link node-id | |

---

# 2. Đặc tả màn hình (Screen Specs)

## Màn hình 1: {Tên màn hình}

**Figma**: [{Tên frame}]({figma_frame_url})

### Layout

{Grid / max-width / padding / spacing — tham chiếu design token nếu áp dụng được}

### Component Inventory

| Component (Figma)      | Code Component | Import Path            | States                          | Ghi chú |
|------------------------|----------------|------------------------|---------------------------------|---------|
| {Figma/Button/Primary} | Button         | @/components/ui/Button | default, loading, disabled      |         |
| {Figma/Input/Text}     | TextInput      | @/components/ui/Input  | default, focus, error, disabled |         |

### Screen States

| State     | Trigger                          | Hành vi UI                                              |
|-----------|----------------------------------|----------------------------------------------------------|
| default   | Màn đã load, có dữ liệu           | {Mô tả toàn bộ giao diện đã render}                      |
| loading   | API đang gọi                      | {Vị trí và kiểu skeleton / spinner}                      |
| error     | API thất bại / lỗi validation     | {Toast / lỗi inline / màn lỗi + CTA khôi phục}           |
| empty     | Không có dữ liệu trả về            | {Illustration + CTA — vd: "Chưa có mục nào. Thêm mới →"} |
| success   | Action hoàn tất (nếu có)          | {Toast xác nhận / điều hướng / thay đổi giao diện}       |

### Actions & Navigation

| Action          | Trigger                   | Kết quả                                           |
|-----------------|---------------------------|---------------------------------------------------|
| {Tên action}    | Tap/click {phần tử}       | Điều hướng tới {Màn hình N} / Mở {Tên modal}      |
| {Back/Cancel}   | Cử chỉ back / nút          | Quay lại {màn trước} mà không lưu                  |

---

<!--  Lặp lại ## Màn hình N cho mỗi màn bổ sung  -->

---

# 3. Pattern tương tác (Interaction Patterns)

<!-- === CHỈ WEB — xóa section này cho app === -->

## A. Hành vi Responsive  *(web)*

| Breakpoint | Width      | Thay đổi layout                             |
|------------|------------|---------------------------------------------|
| Mobile     | < 768px    | {1 cột, bottom nav, CTA full-width}         |
| Tablet     | 768–1279px | {grid 2 cột, sidebar thu gọn}               |
| Desktop    | ≥ 1280px   | {layout đầy đủ, max-width 1440px}           |

## B. Hover / Focus / Keyboard  *(web)*

| Phần tử        | Hover                         | Focus                           | Keyboard      |
|----------------|-------------------------------|---------------------------------|---------------|
| Primary button | Background → {color.hover}    | Outline 2px {color.focus}       | Enter / Space |
| Text input     | Border → {color.border.hover} | Border → {color.primary}        | Tab to focus  |

<!-- === CHỈ APP — xóa section A+B cho app === -->

## C. Cử chỉ & Điều hướng  *(app)*

| Cử chỉ               | Màn / Phần tử       | Hành vi                                     |
|----------------------|---------------------|---------------------------------------------|
| Cử chỉ back          | Mọi màn             | {Quay lại / hiện dialog "Discard changes?"} |
| Pull-to-refresh      | {Tên màn}           | Refresh dữ liệu, spinner ở trên cùng        |
| Swipe trái trên row  | {List item}         | Hiện action {Delete / Archive}              |

### Navigation Stack  *(app)*

```
{vd: BottomTab(Home) → ListPage → DetailPage → EditPage}
```

### Platform Conventions  *(app)*

| Khía cạnh        | iOS                                       | Android                             |
|------------------|-------------------------------------------|-------------------------------------|
| Navigation bar   | Nút back trên-trái, title canh giữa        | Mũi tên Up, title canh trái         |
| Bottom sheet     | UISheetPresentation, hiện grabber          | BottomSheet, drag handle            |
| Dialog           | Action canh phải                          | Action canh trái                    |

---

# 4. Cân nhắc theo Platform (Platform Considerations)

<!-- === CHỈ WEB === -->

## A. Accessibility  *(web)*

- [ ] Mọi phần tử tương tác đều tới được bằng phím Tab — không có keyboard trap
- [ ] Focus trap bên trong modal
- [ ] Nút chỉ có icon phải có `aria-label`
- [ ] Nội dung động thông báo qua `aria-live`
- [ ] Tương phản WCAG AA: text ≥ 4.5:1, text lớn ≥ 3:1
- [ ] Input form có label hiển thị (không chỉ dùng placeholder)

<!-- === CHỈ APP === -->

## B. Thiết bị & OS  *(app)*

- [ ] Áp dụng safe area insets (trên + dưới) ở mọi màn
- [ ] Touch target tối thiểu: 44×44pt (iOS) / 48×48dp (Android)
- [ ] Đã test trên 375pt (iPhone SE) và 360dp (Android nhỏ)
- [ ] Deep link: `{scheme}://{host}/{path}` → {tên màn}
- [ ] Permission: {Camera / Location / Notification} — nội dung lý do TBD
- [ ] Offline: {tên màn} hiện dữ liệu cache + banner; {action} bị disable kèm tooltip
- [ ] Đã test dark mode — không có màu hardcode

---

# 5. AC-UI — Tiêu chí chấp nhận về Design

> Được **PO + Designer** review và sign off trước khi sinh BDD.
> Bổ sung cho AC mức nghiệp vụ trong [Business PRD](./{TICKET-ID}-slug.md).

| ID     | Tiêu chí chấp nhận                                                       | Verified by     |
|--------|--------------------------------------------------------------------------|-----------------|
| AC-UI1 | Mọi màn khớp với frame Figma đã duyệt trong dung sai design-system        | Designer        |
| AC-UI2 | Trạng thái loading xuất hiện trong vòng 200ms kể từ khi gọi API           | QA              |
| AC-UI3 | Mọi thông báo lỗi đều hiển thị, rõ ràng, và kèm CTA khôi phục             | PO              |
| AC-UI4 | Empty state có illustration và call-to-action                            | PO + Designer   |
| AC-UI5 | {Tiêu chí riêng theo platform}                                           | QA              |

---

# Appendix

## Tóm tắt Figma

| Màn hình   | Figma Frame (node-level) | Trạng thái Link / Fetch         |
|------------|--------------------------|--------------------------------|
| {Màn hình 1} | [Link]({node-level url}) | ✅ Đã link & fetch             |
| {Màn hình 2} | —                        | ❌ Missing — không có link node-id |

## Design Token đã tham chiếu

| Token             | Value    | Dùng ở                     |
|-------------------|----------|----------------------------|
| `color.primary`   | {#hex}   | Button, link               |
| `spacing.md`      | {16px}   | Khoảng cách dọc tiêu chuẩn |

## Tài liệu tham khảo

- [{TICKET-ID}](./{TICKET-ID}-slug.md) — Business PRD

## Giả định AI

- {Giả định — [AI DRAFT]}

---

## Changelog

| Version | Date         | Changes         |
|---------|--------------|-----------------|
| 1.0     | {YYYY-MM-DD} | Initial version |

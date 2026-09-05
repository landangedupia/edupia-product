---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Non-Functional

Skill **tự chứa** để viết TC phi chức năng: performance, security, accessibility, compatibility.
Trọng tâm "hệ thống hoạt động TỐT thế nào". Chỉ cần load file này.

## Khi nào trigger
- Yêu cầu hiệu năng/tải, bảo mật, accessibility, tương thích; feature có SLA, dữ liệu nhạy cảm, hoặc data lớn

## Khi KHÔNG trigger
- Kiểm thử chức năng theo đặc tả → `functional/*` · tích hợp module → `integration/*`

---

## Format file TC (bắt buộc)
- Metadata **list**: Title · Feature · Priority · Status(Draft) · Author(AI) · Tags · **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx](DOC_GAP.md)`.
- **Test Data** dạng list · **Steps** `[Action]`/`[Verify]` · **Expected** 1 bullet có **ngưỡng đo cụ thể** (không "nhanh/ổn định").
- Cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.

## Kỹ thuật / loại
- **Performance:** response time dưới tải mục tiêu; danh sách lớn (max data); pagination; concurrency.
- **Security:** authZ/role (truy cập trái phép → chặn), injection, PII (SĐT) không lộ, session/timeout, rate limit.
- **Accessibility:** keyboard nav, focus, label/aria, contrast (WCAG).
- **Compatibility:** trình duyệt/thiết bị/độ phân giải mục tiêu.

## Phase 1 — Clarify
Loại non-functional + tiêu chí đo (ngưỡng cụ thể: thời gian, số user, WCAG level) · môi trường & công cụ
(load tool, scanner, axe/lighthouse) · dữ liệu/tải mẫu.

## Phase 2 — Write
Mỗi TC bám Format; **Expected có ngưỡng pass + công cụ đo**; đánh dấu TC cần môi trường/data đặc biệt.
Trace BR; gap chặn → 🚫 Block.

## Output
File TC non-functional trong `{qc_artifact_dir}test-cases/`. Mỗi TC ghi tiêu chí đo + ngưỡng + công cụ. Bàn giao `qa-reviewer`.

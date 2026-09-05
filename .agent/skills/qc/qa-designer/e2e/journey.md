---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — E2E Journey

Skill **tự chứa** để viết TC end-to-end: hành trình đầu→cuối xuyên nhiều màn/module
(mở → nhập → submit → verify tạo + định tuyến + đồng bộ + hiển thị). Chỉ cần load file này.

## Khi nào trigger
- "viết E2E cho [feature]" / nở danh sách journey trong TEST_PLAN thành TC chi tiết đầu-cuối

## Khi KHÔNG trigger
- Test 1 màn/field → `functional/*` · test riêng 1 điểm tích hợp → `integration/*`

---

## Format file TC (bắt buộc)
- Metadata **list**: Title · Feature · Priority · Status(Draft) · Author(AI) · Tags · **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx](DOC_GAP.md)`.
- **Test Data** dạng list (tài khoản/role, dữ liệu lớp/buổi…) · **Steps** `[Action]`/`[Verify]` xuyên các màn ·
  **Expected** 1 bullet = chuỗi verify point (tạo thành công, mã đúng, định tuyến đúng, đồng bộ đúng, hiển thị danh sách).
- ID journey `E2E-<FEATURE>-NN` · cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- **Use Case/Scenario:** mỗi journey = main + alternate + exception flow.
- **Decision Table** để chọn journey đại diện cho mỗi nhánh của **trục bao phủ** (vd Đối tượng × Bộ phận xử lý × lớp/buổi × role × CRM).
- **Verify points chung** (V1…Vn) áp cho mọi journey · **end-to-end data** (nhập màn A → hiện đúng màn B/DB/hệ thống ngoài).

## Phase 1 — Clarify
Lấy danh sách journey + trục bao phủ + verify points từ TEST_PLAN · mỗi journey: actor/role, tiền điều kiện
(data + tài khoản), bước chính, kết quả/định tuyến kỳ vọng · journey nào phụ thuộc gap Blocker.

## Phase 2 — Write
Mỗi journey → 1 TC bám Format; Expected = chuỗi verify point; chuẩn bị tiền điều kiện & cleanup, mỗi journey độc lập.
**Journey phụ thuộc gap vẫn viết + 🚫 Block: GAP-xx**, định tuyến ghi "dự kiến theo BR". Trace BR.

## Output
File TC e2e (hoặc nhóm E2E trong file feature) trong `{qc_artifact_dir}test-cases/`.
In bảng `E2E-ID | Journey | Pri | Trace | Block` + bảng TC block. Bàn giao `qa-reviewer`.

---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Integration API

Skill **tự chứa** để viết TC tích hợp qua API: caller → API → service/DB/hệ thống ngoài,
verify luồng dữ liệu & contract giữa các thành phần. Chỉ cần load file này.

## Khi nào trigger
- Test điểm tích hợp API ↔ service backend / hệ thống ngoài (vd LMS ↔ CRM)
- Verify dữ liệu sau gọi API lan tới chặng tiếp (DB/event)

## Khi KHÔNG trigger
- Chỉ verify request/response 1 endpoint → `functional/api`
- Verify riêng trạng thái DB → `integration/db` · message/event → `integration/kafka`

---

## Format file TC (bắt buộc)
- Metadata **list**: Title · Feature · Priority · Status(Draft) · Author(AI) · Tags · **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx](DOC_GAP.md)` (TC chặn vẫn viết đủ).
- **Test Data** dạng list · **Steps** `[Action]`/`[Verify]` · **Expected** 1 bullet nêu rõ chặng verify (response/bản ghi/event).
- Cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- **Interface/Contract:** verify schema request/response giữa caller↔callee.
- **Data flow verification:** theo sơ đồ data flow, mỗi chặng verify dữ liệu biến đổi đúng.
- **Decision Table** khi định tuyến/đồng bộ phụ thuộc nhiều điều kiện.
- **Error/Retry/Timeout/Concurrency:** failure point, thao tác đồng thời (sinh số không trùng).

## Phase 1 — Clarify
Chuỗi tích hợp (caller→API→service/DB/API ngoài) · contract mỗi interface · điều kiện định tuyến/đồng bộ
(vd điều kiện đổ CRM) · failure point (timeout, lỗi service ngoài, partial commit).

## Phase 2 — Write
Nhóm TC: happy (dữ liệu đúng đầu→cuối) → contract negative (input sai → mã lỗi đúng) → failure/timeout/retry
→ concurrency → điều kiện đồng bộ (đổ/không đổ). Mỗi TC bám Format; trace BR; gap chặn → 🚫 Block.

## Output
File TC integration trong `{qc_artifact_dir}test-cases/`. Ưu tiên P0 cho định tuyến & tiền-dữ liệu. Bàn giao `qa-reviewer`.

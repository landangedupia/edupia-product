---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Integration GUI ↔ Backend

Skill **tự chứa** để viết TC tích hợp UI ↔ backend: UI gọi API đúng, render đúng kết quả/
lỗi từ server, đồng bộ trạng thái hai chiều. Chỉ cần load file này.

## Khi nào trigger
- UI phản ánh đúng dữ liệu/lỗi backend (lookup, list, validate server-side); UI gọi đúng API + xử lý response

## Khi KHÔNG trigger
- Chỉ test layout/element tĩnh 1 màn → `functional/gui-screen`
- Chỉ test API không qua UI → `functional/api`/`integration/api`

---

## Format file TC (bắt buộc)
- Metadata **list**: Title · Feature · Priority · Status(Draft) · Author(AI) · Tags · **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx](DOC_GAP.md)`.
- **Test Data** dạng list · **Steps** `[Action]`/`[Verify]` · **Expected** 1 bullet (API liên quan + biểu hiện UI kỳ vọng).
- Cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- **Data flow UI→API→UI:** verify request gửi đúng + render response đúng.
- **Error handling:** lỗi server (4xx/5xx) → message UI đúng. **State:** loading/empty/error.

## Phase 1 — Clarify
Điểm UI gọi backend (action→API) · mapping response→hiển thị (list/dropdown/message) ·
trạng thái loading/empty/error · debounce/cancel khi đổi input.

## Phase 2 — Write
Nhóm TC: UI render đúng dữ liệu backend (happy) → empty state → lỗi server → message đúng → loading state
→ đổi input reset/cancel request → đồng bộ sau action (tạo xong → list cập nhật). Locator ưu tiên data-testid/role.
Mỗi TC bám Format; trace BR; gap chặn → 🚫 Block.

## Output
File TC trong `{qc_artifact_dir}test-cases/`. Mỗi TC nêu API liên quan + biểu hiện UI. Bàn giao `qa-reviewer`.

---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Integration DB

Skill **tự chứa** để viết TC verify **trạng thái dữ liệu trong DB** sau action:
insert/update/soft-delete đúng giá trị, side-effect, toàn vẹn. Chỉ cần load file này.

## Khi nào trigger
- Kiểm tra bản ghi DB sau thao tác (tạo ticket → ghi đúng bảng/cột); soft-delete, default, audit log

## Khi KHÔNG trigger
- Chỉ verify response API → `functional/api`/`integration/api` · message/event → `integration/kafka`

---

## Format file TC (bắt buộc)
- Metadata **list**: Title · Feature · Priority · Status(Draft) · Author(AI) · Tags · **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx](DOC_GAP.md)`.
- **Test Data** dạng list (giá trị input) · **Steps** `[Action]`/`[Verify]` · **Expected** 1 bullet nêu rõ **bảng.cột = giá trị**.
- Cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- **State/DB verification:** verify bản ghi sau action (giá trị từng cột, flag, timestamp).
- **Data flow:** dữ liệu từ input lan tới DB đúng. **Decision Table** nếu ghi phụ thuộc điều kiện.

## Phase 1 — Clarify
Bảng & cột bị ảnh hưởng + giá trị kỳ vọng · loại thao tác (insert/update/soft-delete/cascade) ·
side-effect (audit log, timestamp, người tạo/sửa) · cleanup/rollback dữ liệu test.

## Phase 2 — Write
Nhóm TC: ghi đúng giá trị (happy) → default/null đúng → update không đụng cột khác → soft-delete (flag đúng)
→ audit log → ràng buộc/unique (negative). Mỗi TC bám Format; trace BR; gap chặn → 🚫 Block.

## Output
File TC trong `{qc_artifact_dir}test-cases/`. Ghi rõ query kiểm tra DB + yêu cầu cleanup;
không hardcode ID, chuẩn bị/dọn data qua fixture. Bàn giao `qa-reviewer`.

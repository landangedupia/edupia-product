---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Functional GUI Screen (1 màn hình)

Skill **tự chứa** để viết TC functional cho 1 màn hình đơn lẻ (web/mobile). Chỉ cần load file này.

## Khi nào trigger
- "viết test case cho màn hình [X]" — feature gọn trong 1 screen (1 page web / 1 Activity/VC)

## Khi KHÔNG trigger
- Flow span ≥ 2 màn → `functional/gui-feature`
- API không qua UI → `functional/api`
- Tích hợp 2+ module → `integration/*` · hành trình đầu-cuối → `e2e/journey`

---

## Format file `TC_<FEATURE>.md` (bắt buộc)
- 1 file/feature · mỗi TC **1 concept** · metadata **list** (mỗi trường 1 dòng, không bảng/emoji):
  Title · Feature · Priority(P0/P1/P2) · Status(Draft) · Author(AI) · Tags · Trace · 🚫 Block(nếu có).
- **Trace:** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)`; TC không có BR → `⚠️ Chưa có Business Rule`.
- **🚫 Block:** TC phụ thuộc gap **vẫn viết đủ** + `[GAP-xx](DOC_GAP.md) — lý do`; chưa chạy tới khi gap Answered.
- **Test Data:** dạng **list** (`- **Trường:** giá trị`), không bảng.
- **Test Steps:** `**[Action]**` / `**[Verify]**`, KHÔNG `- *Expected:*` sau bước. **Expected:** 1 bullet cụ thể (không ✅/❌).
- Phân nhóm GUI/Functional · cuối file: **Trace matrix** (BR↔TC, ⚠️ TC thiếu BR) + **bảng TC bị block** · KHÔNG `#### Python Test Mapping` · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- Field có ràng buộc (độ dài/số/ngày) → **EP** (mỗi phân vùng 1 TC, tag `ep`) + **BVA** (4 TC min−1/min/max/max+1, tag `bva`).
- Logic nhiều điều kiện / cascade dropdown / permission → **Decision Table** (mỗi rule = 1 TC).
- Element/đối tượng có trạng thái enabled/disabled, vòng đời → **State Transition** (chuyển đổi hợp lệ + cấm).
- Luồng thao tác trên màn → **Use Case** (main P0 → alternate P1 → exception negative).

## Phase 1 — Clarify
Platform (web Playwright/mobile) · screen+route · domain (form-crud/listing/auth/settings) · CRUD scope ·
mutating actions OK? · cleanup policy. Thiếu → hỏi trước khi viết.

## Phase 2 — Explore
Dump element: buttons, inputs, dropdowns, table headers, modal states. Mỗi element →
chức năng (input/action/display/nav) · constraint (required/min-max/format/enabled) · state change · câu hỏi "what if".

## Phase 3 — Write
- **Nhóm 1 GUI:** title → buttons → inputs → date picker → dropdowns → bảng (header→row count→checkbox→từng cột) → pagination.
- **Nhóm 2 Functional:** filter (đơn→combined) → search → reset → pagination → data integrity → actions → negative.
- Phủ implicit: rate limit, concurrent, session, empty state, max data, special chars.
- Mỗi TC bám khối Format trên; trace BR; TC chặn bởi gap → 🚫 Block.

## Output
File `TC_<FEATURE>.md` trong `{qc_artifact_dir}test-cases/`. In bảng `TC_ID | Title | Priority | Tags | Trace`
+ Trace matrix + bảng TC block. Bàn giao `qa-reviewer` (test-case).

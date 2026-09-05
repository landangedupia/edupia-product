---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Functional GUI Feature (đa màn hình)

Skill **tự chứa** để viết TC functional cho feature có luồng span ≥ 2 màn hình
(wizard, master-detail, popup→list). Chỉ cần load file này.

## Khi nào trigger
- "viết test case cho feature [X]" mà flow đi qua nhiều màn/route, truyền state giữa bước

## Khi KHÔNG trigger
- Gọn trong 1 màn → `functional/gui-screen` · API thuần → `functional/api`
- Hành trình nghiệp vụ đầu-cuối + đồng bộ hệ thống → `e2e/journey`

---

## Format file `TC_<FEATURE>.md` (bắt buộc)
- 1 file/feature · mỗi TC **1 concept** · metadata **list** (không bảng/emoji): Title · Feature ·
  Priority(P0/P1/P2) · Status(Draft) · Author(AI) · Tags · Trace · 🚫 Block(nếu có).
- **Trace:** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)`; không có BR → `⚠️ Chưa có Business Rule`.
- **🚫 Block:** TC phụ thuộc gap vẫn viết đủ + `[GAP-xx](DOC_GAP.md) — lý do`.
- **Test Data:** dạng **list** (không bảng). **Steps:** `[Action]`/`[Verify]`, không `*Expected:*`/bước. **Expected:** 1 bullet cụ thể.
- Cuối file: **Trace matrix** (BR↔TC, ⚠️ TC thiếu BR) + **bảng TC bị block** · không `#### Python Test Mapping` · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- **Use Case** cho flow tổng: main (P0) → alternate (P1) → exception (negative).
- **Decision Table** cho điểm rẽ nhánh (điều kiện qua bước/nhảy màn).
- **State Transition** nếu có trạng thái xuyên bước (draft→submitted…).
- **EP/BVA** cho field trên từng màn.

## Phase 1 — Clarify
Liệt kê các màn/route + thứ tự điều hướng · state/dữ liệu truyền giữa màn (giữ/reset khi back) ·
điểm rẽ nhánh · platform · CRUD scope · cleanup.

## Phase 2 — Write
- Nhóm TC: GUI từng màn → **điều hướng** (forward/back/giữ-reset state, deep-link) → happy path xuyên flow → negative.
- Đặc biệt phủ: back có mất dữ liệu không, dữ liệu bắt buộc để qua bước sau, hủy giữa flow.
- Mỗi TC bám khối Format; trace BR; gap chặn → 🚫 Block.

## Output
File `TC_<FEATURE>.md` trong `{qc_artifact_dir}test-cases/`. In bảng TC + Trace matrix + bảng TC block.
Bàn giao `qa-reviewer` (test-case).

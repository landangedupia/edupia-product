---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Explore-to-Functional Pipeline

Skill **tự chứa**: khám phá feature (chưa/thiếu spec) → draft TC → QC review → feed
requirement → chuyển thành functional TC chính thức. Chỉ cần load file này.

## Khi nào trigger
- Feature KHÔNG có tài liệu/spec (legacy, take-over) hoặc spec mơ hồ/thiếu
- Cần bootstrap bộ TC nhanh cho hệ thống đang chạy · "khám phá [X] rồi tạo TC"

## Khi KHÔNG trigger
- Feature có spec rõ → `functional/gui-screen`/`gui-feature` trực tiếp
- Chỉ cần charter cho session → `exploratory/charter`

---

## Phase 1 — Explore (AI tự chạy)
Dựa trên mô tả feature: list TẤT CẢ chức năng (visible + ẩn + integration point) · mỗi chức năng
identify input/output/state/side-effect · sinh DRAFT TC (1 happy + 2–3 edge mỗi chức năng) ·
"what if" mỗi chức năng · list chức năng liên quan QC chưa nêu. → ĐỢI QC phản hồi.

## Phase 2 — QC Review + Bổ sung
Đợi QC confirm đúng/sai, thêm business edge case, cung cấp context → sửa → draft v2. → ĐỢI QC confirm/paste requirement.

## Phase 3 — Feed Requirement (nếu có)
So requirement vs draft: requirement chưa phủ → thêm TC · TC sai logic → sửa expected · thêm Trace BR ·
chỉnh Priority theo business. Không có requirement → giữ draft Phase 2.

## Phase 4 — Convert to Functional (format chuẩn)
Chuyển draft → TC chính thức bám **format file `TC_<FEATURE>.md`**:
- Metadata **list**: Title · Feature · Priority(P0/P1/P2) · Status(Draft) · Author(AI) · Tags ·
  **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có BR → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx]` nếu chặn.
- **Test Data** dạng list · **Steps** `[Action]`/`[Verify]` · **Expected** 1 bullet cụ thể.
- Phân nhóm GUI/Functional · cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.
- Đặt file `{qc_artifact_dir}test-cases/TC_<FEATURE>.md`.

## Output
File TC functional + bảng `TC_ID | Title | Priority | Technique | Trace`. Bàn giao `qa-reviewer`.

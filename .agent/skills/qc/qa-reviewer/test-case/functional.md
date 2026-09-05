---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Case — Functional
 
Review bộ functional TC và đánh giá chất lượng.
 
## Khi nào trigger
- "review TC cho [Feature]" / "check coverage"
- Sau khi qa-designer xong, trước khi PO approve hoặc trước khi qa-runner
 
## Khi KHÔNG trigger
- Review Python script → dùng qa-reviewer
- Review charter exploratory → dùng qa-reviewer/test-case/exploratory
 
---
 
## Phase 1 — Clarify
 
1. Đọc tất cả .Test.md trong folder được chỉ định
2. Đọc requirement/spec/user story nếu QC cung cấp
3. Nếu không có requirement → review dựa trên TC content (vẫn check internal consistency)
 
---
 
## Phase 2 — Review
 
Đánh giá theo 4 tiêu chí:
 
A. COVERAGE (quan trọng nhất):
- Requirement nào chưa được phủ?
- TC nào không trace được về requirement? (TC dư)
- Thiếu negative / edge / boundary test?
 
B. TECHNIQUE:
- Field có constraints → có EP + BVA không?
- Logic AND/OR → có Decision Table không?
- State → có transition hợp lệ VÀ forbidden không?
- Thiếu implicit requirement? (rate limit, concurrent, audit, session, security)
 
C. QUALITY:
- Title rõ scenario + expected?
- Expected result CỤ THỂ (2 QC test ra cùng kết luận)?
- Test data có giá trị cụ thể (không placeholder)?
- Mỗi TC chỉ verify 1 thing?
- Priority đúng (core function = P0)?
 
D. ANTI-PATTERN:
- TC chung chung, không actionable?
- Expected dạng "hiển thị đúng" (cảm tính)?
- Hardcode credentials/URL?
 
---

## Checklist format file `.md` (đối chiếu skill layer qa-designer)

- **Metadata:** đủ Title, Feature, Priority, Status, Author, Tags, **Trace**; Priority `P0/P1/P2` (không emoji); Status `Draft` text thuần; mỗi trường 1 dòng riêng.
- **Trace:** mỗi TC link `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)`; TC không có BR → phải có ⚠️ cảnh báo (không để trống/`—`).
- **TC bị block:** TC phụ thuộc gap có dòng `🚫 Block: [GAP-xx]`; cuối file có **Trace matrix** (BR↔TC) + **bảng TC bị block** (Gap↔TC).
- **Test Data:** dạng list (`- **Trường:** giá trị`), không dùng bảng.
- **Test Steps:** phân biệt `[Action]`/`[Verify]`; KHÔNG có `- *Expected:* ...` sau mỗi bước.
- **Expected Result:** 1 dòng bullet `-`, cụ thể; KHÔNG `✅ PASS/❌ FAIL`; không viết "hoạt động bình thường".
- **KHÔNG** có section `#### Python Test Mapping`.
- **1 concept/TC**; phân nhóm GUI / Functional.

---
 
## Output
 
Mỗi tiêu chí: ✅ PASS | ⚠️ PARTIAL | ❌ MISSING + evidence cụ thể
Score: A (excellent) / B (good) / C (needs improvement) / D (redo)
Đề xuất TC cần thêm/sửa/xoá, sắp theo priority. Liệt kê TC thiếu Trace BR (⚠️) cần bổ sung.


---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/acceptance-criteria.md
upstream_sha: 516f35cf78102d27aa5639bfb2818274399800c0
---

# Acceptance Criteria — Sinh tiêu chí chấp nhận

Chuyển yêu cầu đã phân tích thành acceptance criteria (Given/When/Then) làm cơ sở thiết kế TC.

## Khi nào trigger
- "viết acceptance criteria cho [X]" / "định nghĩa tiêu chí pass"
- Sau spec-breakdown + business-rules, là bước cuối của qa-analyst
- Cần điều kiện chấp nhận rõ ràng để qa-designer trace TC ngược về

## Khi KHÔNG trigger
- Cần bóc tách spec → dùng spec-breakdown
- Cần thiết kế test case chi tiết (steps cụ thể) → dùng qa-designer
- Cần phân tích rủi ro → dùng qa-planner

---

## Phase 1 — Tổng hợp

Gom đầu vào từ spec-breakdown, business-rules, data-flow:
- Mỗi chức năng/luồng → một nhóm acceptance criteria.
- Mỗi business rule (BR-xx) → ít nhất một AC kiểm chứng.

---

## Phase 2 — Viết AC

Dùng format Given/When/Then, mỗi AC kiểm chứng MỘT điều:

```
AC-01 (chức năng / BR-xx):
  Given <tiền điều kiện>
  When  <hành động + dữ liệu cụ thể>
  Then  <kết quả mong đợi CỤ THỂ>
```

Bắt buộc phủ:
- Happy path (điều kiện hợp lệ).
- Negative (vi phạm validation / authorization).
- Boundary (giá trị biên của giới hạn trong business-rules).
- Alternate flow (luồng phụ trong data-flow).

Mỗi AC gắn mã trace: chức năng + BR-xx để TC sau này map 1-1.

---

## Output

Ghi vào **mục Acceptance Criteria** của `{qc_artifact_dir}REQUIREMENT_ANALYSIS.md`
(KHÔNG tạo file riêng — qc-analyze chỉ trả 2 file: `REQUIREMENT_ANALYSIS.md` + `DOC_GAP.md`):

- Danh sách AC dạng Given/When/Then, có mã trace về chức năng, business rule (BR-xx)
  và scenario chính thức `{UC-ID}-SC{N}` của `.feature`.
- Bảng ma trận: BR / chức năng × AC để xác nhận không bỏ sót.
- Đây là đầu vào trực tiếp cho `qa-designer` (mỗi AC → ≥1 test case) và `qa-reviewer` (đối chiếu coverage).

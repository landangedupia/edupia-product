---
version: 1.0
updated: 2026-08-25
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/spec-breakdown.md
upstream_sha: 4a5fb9334fef1fdc3ac5e899e0463c643af80dad
---

# Spec Breakdown — Bóc tách yêu cầu

Bóc tách spec/PRD/user story thô thành mô tả yêu cầu có cấu trúc cho QC.

## Khi nào trigger
- "phân tích spec/PRD cho feature [X]" / "bóc tách yêu cầu"
- Nhận tài liệu thô (PRD, user story, mô tả Figma, email) cần làm rõ trước khi thiết kế TC
- Là bước ĐẦU TIÊN của pipeline, trước qa-planner

## Khi KHÔNG trigger
- Cần phân tích rủi ro / what-if → dùng qa-planner
- Cần trích riêng business rule → dùng business-rules
- Cần thiết kế test case → dùng qa-designer

---

## Phase 1 — Thu thập

1. Đọc toàn bộ tài liệu nguồn QC cung cấp (PRD, user story, mockup, ghi chú).
2. **Bỏ qua văn bản gạch ngang (strikethrough)** — đó là nội dung đã huỷ, KHÔNG đưa
   vào phân tích/BR/AC. Với file Confluence/HTML/MHTML: phát hiện qua thẻ `<s>`,
   `<strike>`, `<del>` hoặc style `text-decoration: line-through`.
3. Xác định: feature name, actor/role, mục tiêu nghiệp vụ, phạm vi (in/out scope).
4. Đánh dấu phần MƠ HỒ / THIẾU → ghi vào `DOC_GAP.md` (gap GAP-xx).

---

## Phase 2 — Bóc tách

Tách yêu cầu thành các khối:

A. TỔNG QUAN: mục tiêu, actor, giá trị nghiệp vụ.
B. CHỨC NĂNG: list từng chức năng (visible + ẩn + integration point).
C. INPUT/OUTPUT: mỗi chức năng có input gì, output gì, ràng buộc field. Với **mỗi field input** (kể cả tuỳ chọn): kiểm tra đủ `minlength`/`maxlength`, ký tự cho phép, trim, format. Field thiếu bất kỳ mục nào → ghi gap MISSING vào `DOC_GAP.md`.
D. TRẠNG THÁI & LUỒNG: các state, điều kiện chuyển, happy path + alternate flow.
E. PHỤ THUỘC: hệ thống/API/module liên quan.
F. GIẢ ĐỊNH & CÂU HỎI MỞ: điều suy ra được vs điều cần dev/BA xác nhận.

---

## Output

⚠️ `/qc-analyze` chỉ ghi **ĐÚNG 2 FILE** cho mỗi UC, đặt trong thư mục QC **lộ ra ngoài**
`{qc_artifact_dir}` (mặc định `docs/{TICKET-ID}/{platform}/` — gom theo **PRD**, KHÔNG để trong `.agent/` ẩn):
`REQUIREMENT_ANALYSIS.md` + `DOC_GAP.md`. KHÔNG tách mỗi bước phân tích thành file riêng.

Phần spec-breakdown là **mục đầu tiên** của `REQUIREMENT_ANALYSIS.md`:
- Bảng chức năng + input/output/constraint
- Sơ đồ/list luồng chính & phụ
- Danh sách giả định và câu hỏi mở (đánh dấu rõ điều CHƯA chắc)

Đồng thời ghi mọi khoảng trống phát hiện vào `{qc_artifact_dir}DOC_GAP.md`
(theo `{paths.qc_skills_dir}/qa-analyst/DOC_GAP.template.md`), mỗi gap có ID `GAP-xx`.

Kết thúc bằng gợi ý: feature đã đủ rõ để chuyển sang `qa-planner` (phân tích rủi ro) chưa.

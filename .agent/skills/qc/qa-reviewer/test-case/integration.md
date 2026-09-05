---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Case — Integration

Review bộ TC tích hợp (GUI↔Backend, API, DB) và đánh giá chất lượng.

## Khi nào trigger
- "review TC integration cho [Feature]" / "check TC tích hợp"
- Sau khi qa-designer/integration/* xong, trước khi qa-runner

## Khi KHÔNG trigger
- Review TC functional 1 màn/endpoint → `test-case/functional`
- Review E2E xuyên nhiều module → `test-case/e2e`

---

## Phase 1 — Clarify

1. Đọc tất cả TC integration trong folder chỉ định; xác định loại: GUI↔Backend / API / DB
2. Đọc REQUIREMENT_ANALYSIS + DOC_GAP nếu có
3. Xác định chuỗi tích hợp (caller → component → downstream)

---

## Phase 2 — Review

Đánh giá theo 4 tiêu chí:

A. COVERAGE:
- Mỗi điểm tích hợp (API call / DB write / event) trong chuỗi có TC tương ứng?
- Đủ nhóm: happy → empty state / null → lỗi server (4xx/5xx) → failure/timeout → concurrency?
- TC GUI↔Backend: có verify cả request gửi đúng lẫn render response đúng?

B. INTEGRATION DEPTH (theo loại):
- **GUI↔Backend:** Expected ghi rõ API liên quan + biểu hiện UI; state loading/empty/error đủ.
- **API:** schema request/response đúng; failure/retry/timeout có TC; định tuyến phụ thuộc điều kiện có Decision Table.
- **DB:** Expected ghi `bảng.cột = giá trị` cụ thể; có TC soft-delete, audit log, unique constraint; có hướng dẫn cleanup/query kiểm tra.

C. QUALITY:
- Expected CỤ THỂ (không "phản hồi đúng", "lưu thành công" chung chung)?
- Test Data đủ (endpoint, payload mẫu, bảng/cột kiểm tra, điều kiện định tuyến)?
- TC concurrency: mô tả rõ 2+ request đồng thời + kết quả kỳ vọng?

D. FORMAT & TRACE:
- Metadata đủ; Trace `[BR-xx]` hoặc `⚠️ Chưa có Business Rule`; `🚫 Block: [GAP-xx]` nếu bị chặn?
- Cuối file có Trace matrix + bảng TC block?
- Steps phân biệt `[Action]`/`[Verify]`; Expected 1 bullet; KHÔNG `✅/❌` inline.

---

## Checklist format file `.md`

- **Test Data:** dạng list; ghi rõ endpoint/payload/bảng cần kiểm tra.
- **Expected (DB):** phải có dạng `bảng.cột = giá trị` + query kiểm tra + cleanup instruction.
- **Expected (API):** ghi mã HTTP + cấu trúc response + downstream effect.
- **Expected (GUI):** ghi API gọi + biểu hiện UI (message/state/list cập nhật).

---

## Output

Mỗi tiêu chí: ✅ PASS | ⚠️ PARTIAL | ❌ MISSING + evidence (TC ID / điểm tích hợp)
Score: A (excellent) / B (good) / C (needs improvement) / D (redo)
Điểm tích hợp thiếu TC; TC Expected mờ nhạt; TC DB thiếu cleanup.
Kết luận: sẵn sàng cho `qa-runner` chưa.

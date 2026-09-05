---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Case — E2E Journey

Review bộ TC end-to-end và đánh giá chất lượng.

## Khi nào trigger
- "review TC E2E cho [Feature]" / "check coverage E2E"
- Sau khi qa-designer/e2e/journey xong, trước khi qa-runner

## Khi KHÔNG trigger
- Review TC functional 1 màn → `test-case/functional`
- Review charter exploratory → `test-case/exploratory`

---

## Phase 1 — Clarify

1. Đọc tất cả TC E2E (ID dạng `E2E-<FEATURE>-NN`) trong folder chỉ định
2. Đọc TEST_PLAN để lấy danh sách journey + trục bao phủ dự kiến
3. Đọc REQUIREMENT_ANALYSIS nếu có để đối chiếu BR

---

## Phase 2 — Review

Đánh giá theo 4 tiêu chí:

A. COVERAGE (quan trọng nhất):
- Mỗi journey trong TEST_PLAN có TC tương ứng không?
- Trục bao phủ (vd role × loại × bộ phận) có đủ không? (Decision Table)
- Còn alternate flow / exception flow nào chưa có TC?

B. END-TO-END INTEGRITY:
- Steps có xuyên suốt qua các màn/module liên quan không?
- Expected có verify **toàn chuỗi**: tạo → định tuyến → đồng bộ → hiển thị danh sách?
- Data nhập màn A → hiện đúng màn B/DB/hệ thống ngoài không?
- Verify points chung (V1…Vn) áp nhất quán cho mọi journey?

C. INDEPENDENCE & PRECONDITION:
- Mỗi journey có tiền điều kiện rõ (data + tài khoản/role) không?
- Journey phụ thuộc nhau thứ tự? (vi phạm test isolation)
- Có hướng dẫn cleanup/teardown sau mỗi journey?

D. FORMAT & TRACE:
- ID đúng dạng `E2E-<FEATURE>-NN`?
- Mỗi TC có `Trace: [BR-xx]`; nếu không có BR phải ghi `⚠️ Chưa có Business Rule`?
- TC phụ thuộc gap có dòng `🚫 Block: [GAP-xx]`?
- Cuối file có Trace matrix + bảng TC block?
- Expected là 1 bullet tổng hợp (không `✅ PASS/❌ FAIL`, không "hoạt động bình thường")?

---

## Checklist format file `.md`

- **Metadata:** Title · Feature · Priority · Status(Draft) · Author · Tags · Trace · Block — mỗi trường 1 dòng.
- **Test Data:** dạng list (không bảng); ghi cả tài khoản/role cần dùng.
- **Steps:** phân biệt `[Action]`/`[Verify]`; KHÔNG có `- *Expected:* ...` sau từng bước.
- **Expected:** 1 bullet; liệt kê chuỗi verify point rõ ràng.
- **KHÔNG** có section `#### Python Test Mapping`.

---

## Output

Mỗi tiêu chí: ✅ PASS | ⚠️ PARTIAL | ❌ MISSING + evidence (TC ID / journey)
Score: A (excellent) / B (good) / C (needs improvement) / D (redo)
Danh sách journey thiếu TC; TC cần sửa Expected; TC vi phạm isolation.
Kết luận: sẵn sàng cho `qa-runner` chưa.

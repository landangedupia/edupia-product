---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Script — E2E Journey

Review Python pytest script cho test end-to-end và đánh giá chất lượng code.

## Khi nào trigger
- "review script E2E cho [Feature]" / "check code E2E quality"
- Sau khi qa-runner sinh script E2E, trước khi merge

## Khi KHÔNG trigger
- Review script functional 1 màn → `script/functional`
- Review script integration → `script/integration`
- Review session note → `script/exploratory`

---

## Phase 1 — Clarify

1. Đọc file Python test E2E được chỉ định (thường `tests/<project>/e2e/test_*.py`)
2. Đọc các Page Object liên quan (nhiều PO cho nhiều màn)
3. Đọc TC E2E Markdown gốc để so sánh coverage journey

---

## Phase 2 — Review

Đánh giá theo 6 tiêu chí:

A. JOURNEY COVERAGE:
- Mỗi journey trong TC E2E có test function tương ứng không?
- Test function có traverse đủ các màn/module của journey không?
- Main flow / alternate flow / exception flow đủ không?

B. CROSS-MODULE DATA INTEGRITY:
- Data nhập ở Page A có được verify ở Page B/DB/hệ thống ngoài không?
- Assertion sau mỗi chặng (không chỉ assert ở bước cuối)?
- Không bỏ qua bước trung gian để "shortcut" đến màn cuối?

C. FIXTURE & PRECONDITION:
- Precondition phức tạp (nhiều entity) có fixture riêng, không inline trong test?
- Fixture tạo data → có teardown/cleanup tương ứng (yield + cleanup)?
- Không hardcode ID của entity đã tạo ở bước trước → dùng biến trả về fixture?
- Fixture scope đúng (`function` cho E2E, không dùng `session`)?

D. WAIT & TIMING:
- Timeout đủ dài cho navigation giữa màn (≥15s cho `networkidle`)?
- Không `time.sleep()`; dùng `wait_for_url` / `wait_for_load_state` / `expect(...).to_be_visible`?
- Không timeout ngắn (<5s) cho API call cross-module?

E. ASSERTION DEPTH:
- Không chỉ assert URL cuối; phải assert nội dung tại mỗi chặng?
- Verify đúng data flow: giá trị nhập màn A xuất hiện đúng ở màn B?
- Negative journey (thất bại giữa chừng): assert đúng màn dừng lại + thông báo lỗi?

F. CONVENTION:
- Marker `@pytest.mark.e2e` + `@pytest.mark.smoke` (nếu critical journey)?
- Marker phân loại = tên journey; docstring = TC ID + mô tả journey?
- `with step(...)` (`from utils.steps`) rõ từng chặng (màn nào → hành động nào)?
- Docstring ghi TC ID + mô tả journey ngắn?

---

## Checklist chi tiết

### Page Objects
- Mỗi màn có PO riêng; test không gọi `page.click()` / `page.fill()` trực tiếp.
- Selector constants khai báo đầu class; không rải rác trong test.
- Action method `return self` để chain; assertion method gọi `take_screenshot()` cuối.

### Test file
- Fixture `logged_in_page` hoặc fixture composite (vd `logged_in_as_teacher`) làm base.
- Không dùng biến global chia sẻ state giữa test function.
- Compile & collect trước submit: `python3 -m py_compile` + `pytest --collect-only -q`.
- Số journey collect = số TC E2E trong `.md`.

---

## Output

Mỗi issue: `file:line` | severity | mô tả | suggestion fix.
Severity: 🔴 fix ngay (missing cleanup, dữ liệu không verify cross-module, shortcut journey) · 🟠 quan trọng (timeout thiếu, assertion chỉ ở bước cuối) · 🟡 nhỏ (style, docstring/title sai).
Score: A/B/C/D · Top 5 issue cần fix trước merge.

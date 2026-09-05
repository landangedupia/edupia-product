---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Script — Non-Functional

Skill **tự chứa**: convert TC non-functional (performance/security/accessibility/compatibility) → script/đo. Chỉ cần load file này.

## Khi nào trigger
- Convert TC non-functional (output qa-designer non-functional) sang script/kịch bản đo; TC đã Reviewed

## Khi KHÔNG trigger
- Kiểm thử chức năng → `functional/*` · tích hợp → `integration.md`

## Quy ước script (bám CLAUDE.md)
- Tiền đề: `.Test.md` đã Reviewed, có **ngưỡng đo cụ thể**. KHÔNG hardcode → `Env.*`/`CONFIG`.
- Mỗi loại dùng công cụ phù hợp, gói trong fixture/helper:
  - **Performance:** đo response time / throughput (pytest + timer, hoặc tích hợp k6/locust); assert ngưỡng.
  - **Security:** test authZ (role không quyền → 403), input injection, PII không lộ, session/timeout, rate limit.
  - **Accessibility:** axe-core/lighthouse qua Playwright; assert vi phạm = 0 ở mức WCAG mục tiêu.
  - **Compatibility:** parametrize trình duyệt/thiết bị.
- Assert theo **ngưỡng pass** trong TC bằng `expect()`/`assert`; bọc bước `with step("…")` (`from utils.steps import step`, **KHÔNG Allure**); marker `@pytest.mark.{performance,security,accessibility}`.

## Phase 1 — Clarify
Đọc `.Test.md` · loại + ngưỡng + công cụ · môi trường/tải mẫu · data đặc biệt.

## Phase 2 — Generate
Mỗi TC → 1 test đo + assert ngưỡng; đánh dấu test cần môi trường/tải riêng (`@pytest.mark.slow`).

## Phase 3 — Verify
`py_compile` + collect · chạy (môi trường phù hợp) · cập nhật Status TC + số đo thực tế.

## Output
Script `tests/<project>/non_functional/test_<feature>.py` + helper đo/scan. Bàn giao `qa-reviewer`.

## Phase 4 — Report (bắt buộc sau khi chạy test)
Report = **Playwright Trace viewer + pytest-html** (KHÔNG Allure, KHÔNG dashboard tự viết).

1. Chạy test kèm pytest-html (trace đã bật sẵn ở conftest → mỗi test có `test-results/<nodeid>/trace.zip`):
   ```bash
   pytest tests/<project>/non_functional/test_<feature>.py --html=reports/<feature>/report.html --self-contained-html
   ```
2. Gửi cho người dùng:
   - HTML report: `reports/<feature>/report.html` (self-contained, mở trực tiếp) + số đo thực tế.
   - Trace từng test (debug step-by-step): `python3 -m playwright show-trace test-results/<nodeid>/trace.zip`.
   - Tóm tắt: **TOTAL / PASS / FAIL / SKIP** + duration.
3. TC Fail → mở trace tương ứng để xem timeline/DOM snapshot/network, phân loại script-bug vs product-gap; ghi mô tả lỗi tiếng Việt dễ hiểu + số đo vào Status/khối kết quả của `.Test.md`.

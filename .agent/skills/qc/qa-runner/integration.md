---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Script — Integration

Skill **tự chứa**: convert `.Test.md` tích hợp (API↔DB↔service↔queue↔UI) → Python pytest. Chỉ cần load file này.

## Khi nào trigger
- Convert TC integration (output qa-designer integration/*) sang script; TC đã Reviewed

## Khi KHÔNG trigger
- Chỉ 1 endpoint/UI đơn → `functional/*` · hành trình đầu-cuối → `e2e.md`

## Quy ước script (bám CLAUDE.md)
- Tiền đề: `.Test.md` đã Reviewed. KHÔNG hardcode endpoint/DSN/topic → `Env.*`/`CONFIG`.
- Mỗi hệ thống có client/helper riêng (API client, DB session, Kafka producer/consumer) gói trong fixture.
- Verify đúng chặng: response (assert), DB (query qua fixture), event (consume + assert payload).
- **Cleanup bắt buộc** sau khi tạo data; test độc lập; concurrency dùng thread/async khi cần.
- Bọc mỗi chặng `with step("…")` (`from utils.steps import step`, **KHÔNG Allure**); assertion `expect()`; marker `@pytest.mark.integration` + domain; naming `TestFeatureIntegration` / `test_TC<NNN>_<snake>`.

## Phase 1 — Clarify
Đọc `.Test.md` · chuỗi tích hợp & chặng cần verify · client/fixture (API/DB/Kafka) đã có chưa · setup/teardown data.

## Phase 2 — Generate
Mỗi TC → 1 test theo data flow: gọi action → verify từng chặng (response/DB/event). Nhóm happy/contract-negative/failure-retry/concurrency/đồng bộ.

## Phase 3 — Verify
`py_compile` + `pytest --collect-only -q` · chạy (cần môi trường staging/CRM/Kafka) · cập nhật Status TC.

## Output
Script `tests/<project>/integration/test_<feature>.py` + client/fixture (DB/Kafka/API) nếu mới. Bàn giao `qa-reviewer`.

## Phase 4 — Report (bắt buộc sau khi chạy test)
Report = **Playwright Trace viewer + pytest-html** (KHÔNG Allure, KHÔNG dashboard tự viết).

1. Chạy test kèm pytest-html (trace đã bật sẵn ở conftest → mỗi test có `test-results/<nodeid>/trace.zip`):
   ```bash
   pytest tests/<project>/integration/test_<feature>.py --html=reports/<feature>/report.html --self-contained-html
   ```
2. Gửi cho người dùng:
   - HTML report: `reports/<feature>/report.html` (self-contained, mở trực tiếp).
   - Trace từng test (debug step-by-step): `python3 -m playwright show-trace test-results/<nodeid>/trace.zip`.
   - Tóm tắt: **TOTAL / PASS / FAIL / SKIP** + duration.
3. TC Fail → mở trace tương ứng để xem timeline/DOM snapshot/network, phân loại script-bug vs product-gap; ghi mô tả lỗi tiếng Việt dễ hiểu vào Status/khối kết quả của `.Test.md`.

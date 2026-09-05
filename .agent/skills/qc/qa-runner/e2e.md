---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Script — E2E Journey

Skill **tự chứa**: convert journey `.Test.md` → Python pytest + Playwright đầu→cuối xuyên nhiều màn/module. Chỉ cần load file này.

## Khi nào trigger
- Convert TC E2E journey (output qa-designer e2e/journey) sang script; TC đã Reviewed

## Khi KHÔNG trigger
- Test 1 màn/field → `functional/*` · 1 điểm tích hợp → `integration.md`

## Quy ước script (bám CLAUDE.md)
- Tiền đề: `.Test.md` đã Reviewed. KHÔNG hardcode → `Env.*`/`CONFIG`; KHÔNG `time.sleep()` → `expect()`.
- Dùng chuỗi Page Object xuyên các màn; verify points (V1…Vn) thành các `assert_*()` rõ ràng.
- **Tiền điều kiện qua fixture** (tài khoản role, dữ liệu lớp/buổi); **cleanup** sau journey; mỗi journey độc lập.
- Cần verify hệ thống ngoài (DB/CRM) → client/fixture riêng. Bọc mỗi chặng `with step("…")` (`from utils.steps import step`, **KHÔNG Allure**); assertion `expect()`; marker `@pytest.mark.e2e`.
- Naming: class `TestFeatureE2E`, method `test_E2E_<NN>_<snake>`.

## Phase 1 — Clarify
Đọc journey `.Test.md` · các màn/PO + hệ thống verify · tài khoản role & data cần dựng · điểm cleanup.

## Phase 2 — Generate
Mỗi journey → 1 test; bọc từng bước `with step("…")`; cuối journey verify đủ V1…Vn (tạo/mã/định tuyến/đồng bộ/danh sách).
Journey còn phụ thuộc gap → tạo test `@pytest.mark.skip(reason="GAP-xx")` hoặc xfail.

## Phase 3 — Verify
`py_compile` + `pytest --collect-only -q` · chạy (môi trường staging + CRM) · cập nhật Status TC.
**Phân loại FAIL: script-bug vs product-gap** — journey fail vì 1 bước feature chưa wire = gap (giữ FAIL/skip + bằng chứng), không phải lỗi script; sai selector/state mới sửa script.

## Output
Script `tests/<project>/e2e/test_<feature>.py` + Page Object/client tái dùng. Bàn giao `qa-reviewer`.

## Phase 4 — Report (bắt buộc sau khi chạy test)
Report = **Playwright Trace viewer + pytest-html** (KHÔNG Allure, KHÔNG dashboard tự viết).

1. Chạy test kèm pytest-html (trace đã bật sẵn ở conftest → mỗi test có `test-results/<nodeid>/trace.zip`):
   ```bash
   pytest tests/<project>/e2e/test_<feature>.py --html=reports/<feature>/report.html --self-contained-html
   ```
2. Gửi cho người dùng:
   - HTML report: `reports/<feature>/report.html` (self-contained, mở trực tiếp).
   - Trace từng test (debug step-by-step): `python3 -m playwright show-trace test-results/<nodeid>/trace.zip`.
   - Tóm tắt: **TOTAL / PASS / FAIL / SKIP** + duration.
3. TC Fail → mở trace tương ứng để xem timeline/DOM snapshot/network, phân loại script-bug vs product-gap; ghi mô tả lỗi tiếng Việt dễ hiểu vào Status/khối kết quả của `.Test.md`.

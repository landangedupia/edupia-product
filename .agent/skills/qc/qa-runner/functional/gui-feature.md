---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Script — Functional GUI Feature (đa màn hình)

Skill **tự chứa**: convert `.Test.md` feature span ≥2 màn → Python pytest + Playwright. Chỉ cần load file này.

## Khi nào trigger
- Convert TC feature đa màn (output qa-designer gui-feature) sang script; TC đã Reviewed

## Khi KHÔNG trigger
- Gọn 1 màn → `functional/gui-screen.md` · API → `functional/api.md` · đầu-cuối + đồng bộ → `e2e.md`

## Quy ước script (bám CLAUDE.md)
- Tiền đề: `.Test.md` đã Reviewed. KHÔNG `time.sleep()` → `expect()`/auto-wait; KHÔNG hardcode → `Env.*`/`CONFIG`.
- **Một Page Object / màn**; điều hướng giữa màn là action trả về PO màn kế (`return NextPage(self.page)`).
- PO 3 lớp (kế thừa slim `BasePage`, **KHÔNG Allure**) + bọc bước `with step("…")` (`from utils.steps import step`); assertion `expect()`; mọi interaction qua PO; selector constants `UPPER_SNAKE`.
- Marker + fixture pytest-playwright từ root `tests/conftest.py` (`page`/`logged_in_page`/`logged_in_page_gv`/`login_page`/`dashboard`); test độc lập + cleanup; naming `Test*{...}` / `test_TC<NNN>_<snake>`.

## Phase 1 — Clarify
Đọc `.Test.md` · liệt kê các màn/PO cần · state truyền giữa màn · fixture dựng tiền điều kiện (data qua nhiều bước).
**Probe DOM thật trước khi viết selector** (SPA React/Next không `data-testid`): dump class/`aria-label`/role → BEM `feature__el`, carousel dot thường `role="tab"` + class `--active` (không `aria-selected`).

## Phase 2 — Generate
**PHỦ HẾT 100%**: 1 test cho **MỌI** TC trong file (`grep -cE "^#{2,4} *TC_"` = số test phải sinh), KHÔNG chọn tập đại diện, KHÔNG để TC nào Draft; TC bất khả thi → `pytest.skip`/`xfail` + lý do.
Bọc mỗi chặng bằng `with step("…")`; dùng chuỗi PO theo điều hướng.
Phủ TC điều hướng forward/back/giữ-reset state. Data từ `test_data/`. Marker mới (`bva ep e2e`…) đăng ký `pytest.ini`.

## Phase 3 — Verify
`py_compile` + `pytest --collect-only -q` (**số collect = tổng TC**; thiếu → sinh nốt) · chạy · cập nhật Status TC (verify KHÔNG còn Draft) · in mapping.
**Gom nhóm role/account** tự áp qua `utils/test_ordering.py` (root conftest); fixture auth mới → `register_auth_fixtures([...])`. ⚠️ Run dài bị **WSL suspend** có thể gây flaky login/timeout → re-run TC đó + merge report.
**Phân loại FAIL: script-bug (sửa selector/logic, chạy lại) vs product-gap** (feature chưa wire/defect → giữ FAIL + ghi bằng chứng vào khối "Kết quả thực thi" đầu `.Test.md`, không fake-pass).

## Output
Script + nhiều Page Object (mỗi màn) trong `pages/<project>/...`. Bàn giao `qa-reviewer` (script).

## Phase 4 — Report (bắt buộc sau khi chạy test)
Report = **Playwright Trace viewer + pytest-html** (KHÔNG Allure, KHÔNG dashboard tự viết).

1. Chạy test kèm pytest-html (trace đã bật sẵn ở conftest → mỗi test có `test-results/<nodeid>/trace.zip`):
   ```bash
   pytest tests/<project>/.../test_<feature>.py --html=reports/<feature>/report.html --self-contained-html
   ```
2. Gửi cho người dùng:
   - HTML report: `reports/<feature>/report.html` (self-contained, mở trực tiếp).
   - Trace từng test (debug step-by-step): `python3 -m playwright show-trace test-results/<nodeid>/trace.zip`.
   - Tóm tắt: **TOTAL / PASS / FAIL / SKIP** + duration.
3. TC Fail → mở trace tương ứng để xem timeline/DOM snapshot/network, phân loại script-bug vs product-gap; ghi mô tả lỗi tiếng Việt dễ hiểu vào Status/khối kết quả của `.Test.md`.

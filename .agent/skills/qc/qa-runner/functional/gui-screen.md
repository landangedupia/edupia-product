---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Script — Functional GUI Screen (1 màn hình)

Skill **tự chứa**: convert `.Test.md` (1 màn) → Python pytest + Playwright. Chỉ cần load file này.

## Khi nào trigger
- "generate script cho [Screen]" / convert TC sang Python; đã có `.Test.md` (output qa-designer gui-screen), TC đã Reviewed

## Khi KHÔNG trigger
- Chưa có TC `.md` → chạy qa-designer trước · TC chưa review → qa-reviewer trước
- Feature cross-screen → `functional/gui-feature.md` · API → `functional/api.md`

## Quy ước script (bám CLAUDE.md)
- Tiền đề: có `.Test.md` đã Reviewed. KHÔNG `time.sleep()` → `expect()`/auto-wait; KHÔNG hardcode → `Env.*`/`CONFIG`.
- Page Object 3 lớp (kế thừa slim `BasePage`, **KHÔNG Allure**): locators `_x()` → actions `verb_noun()`+`with step("…")`+`return self` → assertions `assert_x()`+`expect()`; mọi interaction **qua PO** (không `page.click()` trực tiếp); selector constants `UPPER_SNAKE` đầu class.
- Bọc bước bằng `with step("…")` (`from utils.steps import step`) — **KHÔNG Allure** · marker category+domain (đăng ký `pytest.ini`) · fixture pytest-playwright từ root `tests/conftest.py` (`page`/`logged_in_page`/`logged_in_page_gv`/`login_page`/`dashboard`) · test độc lập + cleanup.
- Naming: class `TestFeature{UI,Functional,Negative}`, method `test_TC<NNN>_<snake>`; docstring = TC title; comment TC_ID + link `.md`.

## Phase 1 — Clarify
Đọc `.Test.md` (confirm Reviewed) · platform (web Playwright/mobile) · Page Object đã có chưa → tạo nếu cần · fixture setup data?
**Probe DOM thật trước khi viết selector** (SPA không `data-testid`): dump class/`aria-label`/role bằng script Playwright tạm → ghi selector đúng (BEM `feature__el`; element interactive có thể `role="tab/menuitem"` + class `--active`).

## Phase 2 — Generate
**PHỦ HẾT 100%**: sinh 1 `test_TC<NNN>_<scenario>` cho **MỌI** TC trong file — KHÔNG chọn tập đại diện, KHÔNG bỏ TC nào. Đếm tổng TC đầu file (`grep -cE "^#{2,4} *TC_"`) = số test phải sinh.
TC không thể tự động hóa (precondition bất khả thi, cần data cố định, feature chưa wire) → vẫn viết 1 test với `pytest.skip("lý do")` / `pytest.mark.xfail` — KHÔNG để Draft.
Map nhóm GUI→`TestFeatureUI`, Functional→`TestFeatureFunctional`, Negative→`TestFeatureNegative`. Assertion qua `assert_*()` của PO; test data từ `test_data/`, không hardcode. Marker mới (`bva ep`…) đăng ký `pytest.ini`.

## Phase 3 — Verify
`py_compile` + `pytest --collect-only -q` (**số collect = tổng TC trong file**, nếu thiếu → quay lại Phase 2 sinh nốt) · chạy test · cập nhật **Status** TC (Pass/Fail/Skip) · in mapping TC_ID→function→file.
**Gom nhóm role/account**: thứ tự chạy đã tự gom cùng (role, account) liền nhau qua `utils/test_ordering.py` (hook ở root conftest) — fixture auth mới thì `register_auth_fixtures([...])`.
⚠️ Run dài có thể bị **WSL suspend** (máy ngủ) làm vài TC lỗi login/timeout = flaky (không phải gap SP) → re-run đúng các TC đó + merge vào report (xem `report/report.md`).
**Verify KHÔNG còn Draft**: `grep -c "Status: Draft" <file>.Test.md` = 0 trước khi bàn giao.
**Mỗi FAIL phân loại script-bug vs product-gap** (probe trực tiếp): sai selector/expectation → sửa script & chạy lại; feature không phản hồi sau timeout → giữ FAIL + ghi bằng chứng (không fake-pass).

## Output
Script `tests/<project>/.../test_<screen>.py` + Page Object `pages/<project>/.../<Screen>Page.py` (nếu mới).
Bàn giao `qa-reviewer` (script).

## Phase 4 — Report (bắt buộc sau khi chạy test)
Report = **Playwright Trace viewer + pytest-html** (KHÔNG Allure, KHÔNG dashboard tự viết).

1. Chạy test kèm pytest-html (trace đã bật sẵn ở conftest → mỗi test có `test-results/<nodeid>/trace.zip`):
   ```bash
   pytest tests/<project>/.../test_<screen>.py --html=reports/<feature>/report.html --self-contained-html
   ```
2. Gửi cho người dùng:
   - HTML report: `reports/<feature>/report.html` (self-contained, mở trực tiếp).
   - Trace từng test (debug step-by-step): `python3 -m playwright show-trace test-results/<nodeid>/trace.zip`.
   - Tóm tắt: **TOTAL / PASS / FAIL / SKIP** + duration.
3. TC Fail → mở trace tương ứng để xem timeline/DOM snapshot/network, phân loại script-bug vs product-gap; ghi mô tả lỗi tiếng Việt dễ hiểu vào Status/khối kết quả của `.Test.md`.

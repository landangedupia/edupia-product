---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Script — Functional
 
Review Python pytest script và đánh giá chất lượng code.
 
## Khi nào trigger
- "review script cho [Feature]" / "check code quality"
- Sau khi qa-runner xong, trước khi merge vào main
 
## Khi KHÔNG trigger
- Review TC nghiệp vụ → dùng qa-reviewer
- Review exploratory session note → dùng qa-reviewer/script/exploratory
 
---
 
## Phase 1 — Clarify
 
1. Đọc file Python test được chỉ định
2. Đọc Page Object liên quan
3. Đọc TC markdown gốc (để so sánh coverage)
 
---
 
## Phase 2 — Review
 
Đánh giá theo 6 tiêu chí:
 
A. LOCATOR:
- XPath dài/phức tạp → đề xuất data-testid / role
- Locator phụ thuộc text tiếng Việt → fragile khi đổi copy
- Locator nằm trong Page Object, KHÔNG hardcode trong test
- Dùng .first()/[n] → không reliable
 
B. WAIT & TIMING:
- time.sleep() → phải đổi sang Playwright auto-wait / expect
- Timeout quá ngắn (<3s) hoặc quá dài (>30s)
 
C. TEST INDEPENDENCE:
- Hardcode user ID/data ID → fragile
- Phụ thuộc thứ tự chạy (test_b cần test_a)
- Thiếu cleanup/teardown khi tạo data
- Global state
 
D. ASSERTION:
- assert True / not error → vô nghĩa
- Chỉ assert URL, không assert content → thiếu
- Thiếu negative assertion
 
E. CONVENTION:
- Marker đúng (@pytest.mark.functional + platform)?
- Tên: test_<feature>_<scenario>_<expected>?
- Docstring có TC_ID?
- Fixture từ conftest, không tự tạo browser?
 
F. PAGE OBJECT:
- Test gọi page.click() trực tiếp → phải qua PO
- PO method quá dài (>15 dòng) → tách
 
---

## Checklist chi tiết review code

### Phần 1 — Page Object (`pages/<feature>_page.py`)
- Kế thừa `BasePage`; selector constants `UPPER_SNAKE_CASE` tập trung đầu class (không rải rác).
- Tách 3 lớp: Locators (`_private()` chỉ trả `Locator`) → Actions (`public()` + `return self`, KHÔNG decorator) → Assertions (`assert_*()` + `expect()` + `take_screenshot()` cuối).
- Wait: KHÔNG `time.sleep()`; `wait_for_timeout()` chỉ khi cần (≤1000ms); sau nav/submit dùng `wait_for_load_state("networkidle")`; không `wait_for_timeout` ngay sau `networkidle`.
- KHÔNG hardcode URL/credential/timeout → `Env.*`, `CONFIG`.
- Column index dùng named constant (`COL_TTHAI = 7`), không magic number `cells[7]`.
- Assertion: dùng `expect()` cho element; `assert` Python cho logic (count/regex); screenshot tên `TC<NNN>_mo_ta`; KHÔNG silent fail → `raise AssertionError`, không `log.warning`.
- Lỗi assertion hay gặp: "ordered" phải verify thứ tự thật (`last_pos`); đúng cột; Counter ≠ Pagination total (không assert `==`); P0 strict / P1 `_or_empty`.
- Public API: có `get_row_count()`, `get_all_rows()` thay vì test gọi `_private()`; helper trả data là method thường (không cần bọc step).

### Phần 2 — Test file (`tests/test_<feature>.py`)
- Đủ class `TestFeatureUI` / `TestFeatureFunctional` / `TestFeatureNegative`; fixture scope `function`, base `logged_in_page`.
- KHÔNG Allure: phân loại/độ ưu tiên qua pytest markers (`smoke`/`regression`/domain); docstring/`__doc__` ghi `TC_FEATURE_NNN – …`; Priority khớp marker (P0→smoke, P1/P2→regression).
- Marker: ≥1 category (`smoke`/`regression`) + 1 domain (`ui`/`filter`/`search`/`pagination`/`action`/`negative`); đã đăng ký `pytest.ini`.
- Step: bọc bước bằng `with step("…")` (`from utils.steps import step`) rõ Action/Verify; KHÔNG step rỗng `: pass`.
- Isolation: độc lập thứ tự; không global state; không gọi `_private()` từ test.
- Logic nghiệp vụ nghi ngờ → `@pytest.mark.xfail(strict=False, reason=...)` giải thích rõ.

### Phần 4 — Tổng quát
- Compile & collect bắt buộc trước submit:
  `python3 -m py_compile pages/<f>_page.py tests/test_<f>.py` · `pytest tests/test_<f>.py --collect-only -q`
- Số test collect = số TC trong `.md`; không warning marker chưa đăng ký.
- Naming: class `PascalCase`+`Page`; method `test_TC<NNN>_<snake>`; constant `UPPER_SNAKE`; locator `_snake()`; action `verb_noun()`; assert `assert_condition()`.

### Lỗi phổ biến (TC_TRUCLOP)
empty step `:pass` · test gọi `_private()` · Counter≠Pagination → xfail · "ordered" không verify thứ tự · magic `cells[7]` · silent fail → raise · Reset thiếu domain marker · `wait_for_timeout` thừa sau networkidle · orphan selector constant.

---
 
## Output
 
Mỗi issue: file:line | severity | mô tả | suggestion fix.
Severity: 🔴 fix ngay (sai logic, POM breach, silent fail) · 🟠 quan trọng (fragile selector, wrong column, missing assert) · 🟡 nhỏ (style, thừa wait, orphan constant).
Score: A/B/C/D · Top 5 issue cần fix trước.

---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Script — Non-Functional

Review Python pytest script cho test phi chức năng (performance, security, accessibility, compatibility) và đánh giá chất lượng code.

## Khi nào trigger
- "review script non-functional cho [Feature]" / "check code performance/security/accessibility"
- Sau khi qa-runner sinh script non-functional, trước khi merge

## Khi KHÔNG trigger
- Review script functional → `script/functional`
- Review script integration → `script/integration`
- Review session note → `script/exploratory`

---

## Phase 1 — Clarify

1. Đọc file Python test non-functional được chỉ định
2. Xác định loại: performance / security / accessibility / compatibility
3. Đọc TC non-functional Markdown gốc để đối chiếu ngưỡng + công cụ đo

---

## Phase 2 — Review

Đánh giá theo 6 tiêu chí:

A. THRESHOLD ASSERTION — tiêu chí quan trọng nhất:
- Assertion có dùng **giá trị ngưỡng cụ thể** không? (`assert elapsed < 2.0`, `assert violations == []`)
- Không dùng assertion mơ hồ: `assert response` / `assert "ok" in text` / `assert True`?
- Ngưỡng khớp với TC Markdown gốc (không tự đặt giá trị khác)?

B. THEO LOẠI:
- **Performance:**
  - Đo thời gian bằng `page.wait_for_load_state` + `performance.timing` hoặc `time.perf_counter()` (không `time.sleep()`)?
  - Có parametrize tải mục tiêu (concurrent users / data volume)?
  - `pytest-benchmark` hoặc custom fixture đo rõ ràng?
  - Margin hợp lý (không `assert elapsed < 0.001` quá strict)?
- **Security:**
  - Payload injection được lưu trong fixture/constant, không inline magic string?
  - Test không thực sự tấn công server production; dùng môi trường test?
  - Assert bị chặn đúng: status 4xx, message lỗi, KHÔNG tạo được record?
  - PII test: assert response KHÔNG chứa SĐT/email raw?
- **Accessibility:**
  - Dùng `axe-playwright` (`AxeBuilder`) hoặc `pytest-axe`?
  - Assert `violations == []` hoặc filter đúng WCAG level (`wcag2a`, `wcag2aa`)?
  - Không assert bằng element count / class name (không liên quan accessibility)?
- **Compatibility:**
  - Parametrize `@pytest.mark.parametrize` trên browser/device/viewport?
  - Mỗi parameter = 1 target trong TC Markdown?
  - Dùng `playwright_browser_type` fixture, không hardcode `chromium`?

C. ENVIRONMENT GUARD:
- Test cần môi trường đặc biệt (load server, scanner) có `@pytest.mark.skipif` nếu env không đủ?
- Credentials/endpoint load test không hardcode → `Env.*` / `CONFIG`?
- Test security không gọi endpoint production?

D. DATA SETUP & TEARDOWN:
- Data lớn (performance) có fixture tạo trước, teardown sau?
- Không để lại data/artifact sau test (security test không tạo record rác)?

E. WAIT & TIMING:
- Không `time.sleep()` cho wait UI; dùng Playwright auto-wait?
- Đo elapsed time chính xác: bắt đầu/kết thúc đo rõ ràng, không bao gồm fixture setup?

F. CONVENTION:
- Marker `@pytest.mark.non_functional` + sub-domain (`performance`/`security`/`accessibility`/`compatibility`)?
- **KHÔNG Allure** (đã gỡ): không `@allure.*`; bọc bước bằng `with step("…")` (`from utils.steps import step`)?
- `with step(...)` rõ: setup tải → trigger → measure → assert ngưỡng?
- Docstring ghi TC ID + ngưỡng mục tiêu + công cụ đo?
- Report = Playwright Trace (`test-results/<nodeid>/trace.zip`, `playwright show-trace`) + pytest-html (`--html=… --self-contained-html`); không tham chiếu report tự viết/Allure?

---

## Checklist chi tiết

### Performance
```python
# ✅ Đúng
start = time.perf_counter()
page.goto(Env.BASE_URL + "/list")
page.wait_for_load_state("networkidle")
elapsed = time.perf_counter() - start
assert elapsed < 2.0, f"Load time {elapsed:.2f}s > 2.0s threshold"
```

### Security
```python
# ✅ Đúng — payload trong constant, assert bị block
INJECTION_PAYLOADS = ["<script>alert(1)</script>", "' OR 1=1--"]
# assert response.status == 400 hoặc record không tồn tại
```

### Accessibility
```python
# ✅ Đúng — axe-playwright
from axe_playwright_python.sync_playwright import Axe
results = Axe().run(page)
assert results.violations_count == 0, results.generate_report()
```

### Compatibility
```python
# ✅ Đúng — parametrize browser
@pytest.mark.parametrize("browser_name", ["chromium", "firefox", "webkit"])
def test_compatibility(browser_name, playwright):
    browser = getattr(playwright, browser_name).launch()
    ...
```

### Compile & collect
`python3 -m py_compile` + `pytest --collect-only -q`; số test collect = số TC non-functional `.md`.

---

## Output

Mỗi issue: `file:line` | severity | mô tả | suggestion fix.
Severity: 🔴 fix ngay (assertion không có ngưỡng, gọi production endpoint, hardcode credential) · 🟠 quan trọng (ngưỡng không khớp TC, thiếu parametrize, không teardown data) · 🟡 nhỏ (style, marker thiếu sub-domain, docstring thiếu ngưỡng).
Score: A/B/C/D · Top 5 issue cần fix trước merge.

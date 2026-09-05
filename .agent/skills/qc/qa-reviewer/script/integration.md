---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Script — Integration

Review Python pytest script cho test tích hợp (GUI↔Backend, API, DB) và đánh giá chất lượng code.

## Khi nào trigger
- "review script integration cho [Feature]" / "check code tích hợp"
- Sau khi qa-runner sinh script integration, trước khi merge

## Khi KHÔNG trigger
- Review script functional 1 màn/endpoint → `script/functional`
- Review script E2E xuyên nhiều module → `script/e2e`
- Review session note → `script/exploratory`

---

## Phase 1 — Clarify

1. Đọc file Python test integration được chỉ định
2. Đọc Page Object và API/DB utility liên quan
3. Đọc TC integration Markdown gốc để so sánh coverage

---

## Phase 2 — Review

Đánh giá theo 6 tiêu chí:

A. NO MOCK ON INTEGRATION:
- Không mock API/DB trong integration test (mock → đây là unit test, không phải integration)?
- Dùng real network call / real DB query / `page.expect_response()` để capture API thật?
- Network interception chỉ dùng để **observe** (verify request), không để **stub** response?

B. BACKEND STATE VERIFICATION:
- Sau action UI, có verify trạng thái backend không (DB query / API GET để re-fetch)?
- **GUI↔Backend:** verify cả request gửi đúng (method/URL/payload) lẫn render UI đúng?
- **DB:** dùng trực tiếp DB fixture/util để query `bảng.cột = giá trị`; không chỉ verify qua UI?
- **API:** verify response schema + status code + downstream effect (DB/event)?

C. ERROR STATE COVERAGE:
- Có test 4xx/5xx response → UI hiển thị message đúng?
- Có test empty state / loading state / timeout state?
- Concurrency test: mô tả rõ số request đồng thời; assert không race condition (vd unique constraint giữ)?

D. DATA SETUP & CLEANUP:
- Data test được tạo qua fixture (không hardcode ID)?
- Fixture `yield` + teardown xóa/rollback data sau mỗi test?
- Không dùng data production hoặc shared data giữa các test?

E. WAIT & TIMING:
- Không `time.sleep()`; chờ API response bằng `page.expect_response()` hoặc `wait_for_response()`?
- Sau action có side-effect backend, chờ đủ trước khi assert state (vd `wait_for_load_state("networkidle")`)?
- Timeout đủ cho network round-trip (≥10s)?

F. CONVENTION:
- Marker `@pytest.mark.integration` + sub-domain (`gui`, `api`, `db`)?
- Marker phân loại = loại tích hợp; docstring = TC ID + điểm tích hợp?
- `with step(...)` (`from utils.steps`) rõ hành động → API call → verify response/DB?
- Helper DB/API truy cập trong `utils/`, không rải trong test file?

---

## Checklist chi tiết

### GUI↔Backend
- Dùng `page.expect_response("**/api/endpoint")` để capture và assert request/response.
- Assert: status code + response payload + UI change sau response.

### API integration
- Dùng `requests` hoặc Playwright API context; không dùng UI để trigger API call.
- Assert schema với JSON schema validator hoặc `assert key in response.json()`.

### DB integration
- DB fixture trả connection/cursor; cleanup `DELETE WHERE id = created_id`.
- `assert cursor.fetchone()["column"] == expected_value`; không hardcode row position.

### Compile & collect
`python3 -m py_compile` + `pytest --collect-only -q`; số test collect = số TC integration `.md`.

---

## Output

Mỗi issue: `file:line` | severity | mô tả | suggestion fix.
Severity: 🔴 fix ngay (mock thay real call, missing DB verify, no cleanup) · 🟠 quan trọng (thiếu error state, hardcode ID, timeout ngắn) · 🟡 nhỏ (style, marker thiếu sub-domain).
Score: A/B/C/D · Top 5 issue cần fix trước merge.

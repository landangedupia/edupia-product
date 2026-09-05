---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Script — Functional API

Skill **tự chứa**: convert `.Test.md` API → Python pytest (requests/httpx), không qua UI. Chỉ cần load file này.

## Khi nào trigger
- Convert TC API (output qa-designer functional/api) sang script; TC đã Reviewed

## Khi KHÔNG trigger
- Test qua UI → `functional/gui-screen.md` · tích hợp đa thành phần → `integration.md`

## Quy ước script (bám CLAUDE.md)
- Tiền đề: `.Test.md` đã Reviewed. KHÔNG hardcode base URL/token → `Env.*`/`CONFIG`.
- Client API gói trong helper/fixture (base url, auth header); KHÔNG rải request rời rạc trong test.
- Assertion: `assert` cho status code + field response (jsonpath); `with step(...)` (`from utils.steps`) cho mỗi call.
- Marker `@pytest.mark.api` + category; fixture `function`; test độc lập (tạo→cleanup data qua API/teardown).
- Naming: class `TestFeatureAPI`, method `test_TC<NNN>_<snake>`.

## Phase 1 — Clarify
Đọc `.Test.md` · base url/auth/role · client/fixture đã có chưa · data setup/cleanup.

## Phase 2 — Generate
Mỗi TC → 1 test gọi endpoint với request từ Test Data; assert **status code + field body** theo Expected.
Nhóm happy/validation/auth/not-found/edge. Data từ `test_data/`.

## Phase 3 — Verify
`py_compile` + `pytest --collect-only -q` · chạy · cập nhật Status TC · in mapping.

## Output
Script `tests/<project>/functional/api/test_<feature>.py` + API client/fixture nếu mới. Bàn giao `qa-reviewer`.

---
version: 1.1
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Report — Playwright Trace + pytest-html (stack chuẩn)

Skill **tự chứa**: sinh report sau khi chạy test. Stack chuẩn dự án dùng **Playwright
Trace viewer** + **pytest-html** (KHÔNG Allure, KHÔNG dashboard tự viết). Chỉ cần load file này.

## Khi nào trigger
- Sau khi chạy test cần xuất report / xem lại bằng chứng (trace, screenshot).

## Cơ chế (đã dựng sẵn ở tests/conftest.py)
- **Trace viewer**: fixture `context` (root conftest) gọi `context.tracing.start(screenshots=True, snapshots=True, sources=True)`; teardown lưu `test-results/<nodeid>/trace.zip`.
  - Xem: `python3 -m playwright show-trace test-results/<...>/trace.zip` → timeline + DOM snapshot + network + console (UI giống Playwright report bản JS).
- **pytest-html**: 1 file HTML self-contained. Hook `pytest_runtest_makereport` (root conftest) đính screenshot full-page khi FAIL/SKIP.
  - Mặc định `reports/report.html` (pytest.ini). Theo feature: `--html=reports/<feature>/report.html --self-contained-html`.

## Quy trình
1. Chạy test với report theo feature:
   ```
   python3 -m pytest tests/<project>/<file>.py \
       --html=reports/<feature>/report.html --self-contained-html
   ```
   (Trace tự bật trong conftest → test-results/<nodeid>/trace.zip cho mọi test.)
2. Báo path:
   - HTML: `reports/<feature>/report.html` (on WSL, the Windows-accessible path is `\\wsl.localhost\<distro>\<repo-path>\reports\<feature>\report.html`).
   - Trace TC fail: `test-results/<nodeid>/trace.zip` + lệnh `playwright show-trace`.
   - Tóm tắt TOTAL / PASS / FAIL / SKIP + duration.

## Nguyên tắc
- KHÔNG dùng Allure, KHÔNG sinh dashboard HTML tự viết (đã bỏ utils/html_report.py & cộng sự).
- Evidence trung thực: trace + screenshot phản ánh đúng lần run; FAIL/gap giữ nguyên.
- `reports/` và `test-results/` đã gitignore (artifact nặng) — không commit.
- Interpreter `python3`; browser = the system/installed Chromium configured via `browser_type_launch_args` in the root conftest (see the qc-playwright module) — do not hard-code a binary path.

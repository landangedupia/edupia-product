---
description: Sinh unit và integration test từ BDD spec, chạy test suite và report kết quả, hoặc dev-smoke-test các API endpoint live trên service đang chạy. Trigger when: "/dev-gen-test", "/dev-run-test", "/dev-smoke-test", "tạo test", "viết test", "chạy test", "generate tests", "run tests", "test kết quả", "smoke test", "test API", "kiểm tra endpoint đang chạy".
---

# Test Skills — Generate, Run & Smoke (Dev Self-Check)

Skill này xử lý `/dev-gen-test`, `/dev-run-test`, `/dev-smoke-test` — **dev self-check** (`dev_selftest`), KHÔNG phải QC chính thức (`/qc-*`). Để **không lệch**, skill KHÔNG nhân bản — mỗi lệnh thực thi **y hệt** command.

## /dev-gen-test — Sinh test dev self-check
→ **Đọc và tuân theo `commands/dev-gen-test.md`** với cùng `$ARGUMENTS`.

## /dev-run-test — Chạy test & ghi `dev_selftest`
→ **Đọc và tuân theo `commands/dev-run-test.md`** với cùng `$ARGUMENTS`.
(Command lo: bảng phân tích lỗi theo platform · ghi `dev_selftest`/`dev_selftest_at` vào trace TSV.)

## /dev-smoke-test — Smoke test service/app đang chạy
→ **Đọc và tuân theo `commands/dev-smoke-test.md`** với cùng `$ARGUMENTS`.
(Command lo: flow theo từng platform — backend curl/health · web E2E Playwright/Cypress · mobile device/emulator · LLM pipeline.)

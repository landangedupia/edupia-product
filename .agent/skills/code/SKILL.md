---
description: Sinh implementation code từ BDD spec đã duyệt kèm tag traceability, hoặc review code read-only đối chiếu spec compliance và quy tắc kiến trúc. Trigger when: "/generate-code", "/review-code", "sinh code", "generate code", "viết code", "implement feature", "review code", "kiểm tra code", "code review", "check implementation".
---

# Code Skills — Generate & Review

Skill này xử lý `/generate-code` và `/review-code`. Để **không lệch schema/gate**, skill KHÔNG nhân bản — mỗi lệnh thực thi **y hệt** command tương ứng.

## /generate-code — Sinh Implementation Code

→ **Đọc và tuân theo `commands/generate-code.md`** với cùng `$ARGUMENTS`.

Command lo: guard mềm BDD `@trace.status` approved + Design Spec (approved/độ-tươi/sanity) cho FE/App · `--phase=ui`/`--phase=integration` · branch + build verify · trace TSV (22 cột) `@trace.implements`.

## /review-code — Code Review chỉ-đọc (READ-ONLY)

→ **Đọc và tuân theo `commands/review-code.md`** với cùng `$ARGUMENTS`.

Command lo: Pre-Review Scan · 4 lăng kính (Traceability · Layer Architecture · Coding Standards · Spec Compliance) · đề xuất ghi Lesson cho lỗi AI lặp.

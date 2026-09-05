---
description: Cài đặt framework Spec-Driven Development, và sinh/làm mới tài liệu kiến trúc (architecture.md SSOT). Trigger when: "/setup-ai-first", "/generate-architecture", "setup spec-driven workflow", "initialize ai-first framework", "cài đặt framework", "khởi tạo spec-driven", "set up this workflow", "how do I start using this framework", "sinh architecture", "tạo tài liệu kiến trúc", "generate architecture doc", "refresh architecture", "scan codebase architecture".
---

# /setup-ai-first · /generate-architecture — Foundation Skills (SA / Tech Lead)

Skill này xử lý `/setup-ai-first` và `/generate-architecture`. Để **không lệch** (umbrella/services routing, cấu trúc, trust-gate), skill KHÔNG nhân bản — mỗi lệnh thực thi **y hệt** command tương ứng.

## /setup-ai-first — Initialize SDD Framework in a Project

→ **Đọc và tuân theo `commands/setup-ai-first.md`** với cùng `$ARGUMENTS`.

Command lo: tạo cấu trúc thư mục + feature-package on demand · CLAUDE.md + `.agent/project-context.yaml` (gồm umbrella `services` routing) · seed `architecture.md` (Step 3.5) · nhắc PO đặt row `Domain` (bảng Metadata) khớp services config · verify môi trường.

## /generate-architecture — Sinh / làm mới Architecture Context (SSOT)

→ **Đọc và tuân theo `commands/generate-architecture.md`** với cùng `$ARGUMENTS`.

Command lo: phân giải target (single-service / per-service umbrella) · phát hiện greenfield vs brownfield · **scan codebase** (build-file/DI/middleware/config/CI) → draft từng section kèm bằng chứng · xoá section [OPTIONAL] không dùng · **trust-gate** `verified_by: AI-draft` · refresh có kiểm soát (không đè bản người đã verify) · bàn giao cho người verify.

---
description: Sinh PRD từ một product definition, hoặc phân tích một PRD có sẵn qua 4 lăng kính review (QA, DEV, SA, PO) để tìm gap và rủi ro. Trigger when: "/generate-prd", "/refine-prd", "tạo PRD", "generate PRD", "phân tích PRD", "review PRD", "refine PRD", "PRD có vấn đề gì không", "check PRD quality".
---

# PRD Skills — Generate & Refine

Skill này xử lý `/generate-prd` và `/refine-prd`. Để **không lệch logic/schema**, skill KHÔNG nhân bản — mỗi lệnh thực thi **y hệt** command tương ứng.

## /generate-prd — Sinh Product Requirements Document

→ **Đọc và tuân theo `commands/generate-prd.md`** với cùng `$ARGUMENTS`.

Command lo: guard discovery completed · phân giải API Source (existing/greenfield/partner) · Terminology Map · map §1c "Phụ thuộc liên service" + §4b Wireframe · slug kế thừa · template canonical (`templates/prd.template.md`) · Change Log rolling-window.

## /refine-prd — Phân tích PRD qua 4 lăng kính review

→ **Đọc và tuân theo `commands/refine-prd.md`** với cùng `$ARGUMENTS`.

Command lo: 4 lăng kính fan-out đa sub-agent + completeness-critic (findings đầy đủ 1 lần chạy) · schema findings đầy đủ (`uc_id`, `quote`, `auto_fixable`) cho Review Board · Resume Mode (apply → bump version → reset draft → changelog).

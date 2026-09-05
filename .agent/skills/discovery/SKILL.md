---
description: Dẫn dắt product discovery cho một feature mới qua Q&A có cấu trúc. Trigger when: "/define-product", "khám phá tính năng", "define new feature", "start new feature", "product discovery", "tôi muốn build tính năng mới", "let's define a feature", "begin feature discovery".
---

# /define-product — Feature Discovery (Q&A theo phase)

Lệnh này thực thi **y hệt** `commands/define-product.md` — không nhân bản logic ở đây để tránh lệch cấu trúc / phase / path output.

`commands/define-product.md` dẫn PO qua các phase Q&A có checkpoint:
Knowledge Sync → Feature Definition (Context/Problem/Goal/Actor/In&Out Scope/User Story/Phụ thuộc liên service) → User Flow (kèm Edge Cases) → Clarification Log → Business Rules → Business Logic → Acceptance Criteria → Validation Report.

Output ghi `{paths.product_definitions_dir}/{TICKET-ID}-{slug}.md` theo `templates/product-definition.template.md` — input cho `/generate-prd`.

→ **Đọc và tuân theo `commands/define-product.md`** với cùng `$ARGUMENTS`.

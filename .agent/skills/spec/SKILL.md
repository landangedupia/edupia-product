---
description: Sinh file BDD .feature từ một PRD đã duyệt, hoặc sinh tài liệu technical design. Trigger when: "/generate-bdd", "/generate-tech-docs", "tạo BDD", "tạo spec", "generate feature file", "write BDD scenarios", "tạo technical design", "tech design", "sinh tech docs", "API design", "sinh .feature".
---

# Spec Skills — BDD & Technical Design

Skill này xử lý `/generate-bdd` và `/generate-tech-docs`. Để **không lệch schema/gate**, skill KHÔNG nhân bản — mỗi lệnh thực thi **y hệt** command tương ứng.

## /generate-bdd — Sinh BDD Feature Files

→ **Đọc và tuân theo `commands/generate-bdd.md`** với cùng `$ARGUMENTS`.

Command lo: guard PRD approved + Design Spec (approved/độ-tươi/sanity) cho FE/App · Platform Selection web/app/system · System BDD synthesis (tổng hợp web+app, cross-platform conflict) · Version Check drift · proposal tester (chỉ `accepted`) · R1–R10 + C1–C5 + NHÓM grouping · `@trace` header đầy đủ + trace TSV.

## /generate-tech-docs — Sinh Technical Design Document

→ **Đọc và tuân theo `commands/generate-tech-docs.md`** với cùng `$ARGUMENTS`.

Command lo: platform-aware (BE = API contract · FE/App = client design GATED trên System BDD + BE contract) · §2b Test Selectors · brownfield reverse-document · review-tech-docs T1–T7 (T7 sign-off) sau đó.

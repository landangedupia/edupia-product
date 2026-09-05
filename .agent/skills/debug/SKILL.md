---
description: Fix bug với full workflow (branch, test, commit), phân tích debug nhanh các lỗi hoặc hành vi bất ngờ, hoặc kiểm chứng độ phủ traceability giữa spec và code. Trigger when: "/fix-bug", "/debug", "/validate-traces", "fix bug", "sửa bug", "debug lỗi", "phân tích lỗi", "tại sao lỗi này", "validate traces", "kiểm tra traceability", "coverage matrix", "trace drift".
---

# Debug & Quality Skills — Fix Bug, Debug, Validate Traces

Skill này xử lý `/fix-bug`, `/debug`, `/validate-traces`. Để **không lệch schema/flow**, skill KHÔNG nhân bản — mỗi lệnh thực thi **y hệt** command.

## /fix-bug — Full Bug Fix Workflow
→ **Đọc và tuân theo `commands/fix-bug.md`** với cùng `$ARGUMENTS`.
(Command lo: bug-type table theo platform · đọc `{BUG-ID}` report · regression test · build + push 2 tầng (umbrella) · BUG State `Open→Fixed`→`Closed` · đề xuất Lesson.)

## /debug — Phân tích nhanh
→ **Đọc và tuân theo `commands/debug.md`** với cùng `$ARGUMENTS`.
(Command lo: 4 path (stack trace / reproduce / test fail / câu hỏi code) · bảng lỗi theo từng platform/module · stack-trace đọc dưới-lên.)

## /validate-traces — Traceability Coverage
→ **Đọc và tuân theo `commands/validate-traces.md`** với cùng `$ARGUMENTS`.
(Command lo: đọc trace TSV 22 cột authoritative · tính OK/DRIFT/GAP/UNTRACKED + PRD/TECHDOC drift · sync `uc_status` ← `@trace.status` · aggregate dashboard.)

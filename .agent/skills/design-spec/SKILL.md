---
description: Sinh tài liệu Design Specification cho platform FE hoặc App từ một Business PRD. Trigger when: "/generate-design-spec", "tạo design spec", "generate design spec", "viết design spec", "tạo tài liệu thiết kế UI", "generate UI spec", "cần design spec cho", "tôi muốn spec UI", "tài liệu cho FE", "tài liệu cho app".
---

# /generate-design-spec — Generate Design Specification (FE / App)

Skill này xử lý `/generate-design-spec`. Để **không lệch gate/schema**, skill KHÔNG nhân bản — thực thi **y hệt** command.

→ **Đọc và tuân theo `commands/generate-design-spec.md`** với cùng `$ARGUMENTS`.

Command lo: guard PRD approved (mềm) · ghi `Built from PRD` + Version Check drift · Figma per-screen node-level link (`?node-id=`) fetch qua MCP, màn thiếu link → ❌ Missing → Status giữ `draft` · Screen Inventory/Specs/States · Interaction Patterns + Platform Considerations theo platform · AC-UI (Verified by) · **Self-Review Gate** trước khi ghi · chỉ FE/App (BE bị từ chối).

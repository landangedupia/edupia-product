---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Gen Test Charter — Exploratory
 
Sinh bộ test charter + SFDIPOT test ideas + What-If scenarios cho exploratory session.
 
## Khi nào trigger
- "generate charter cho [Feature]" / "chuẩn bị exploratory session"
- Trước khi bắt đầu exploratory session
- Feature mới chưa ai khám phá, hoặc feature có risk cao
 
## Khi KHÔNG trigger
- Cần sinh functional TC từ spec → dùng qa-designer-gui-screen / qa-designer-gui-feature
- Cần khám phá feature rồi CHUYỂN ĐỔI thành functional TC → dùng explore-to-functional
- Cần review charter đã viết → dùng qa-reviewer/test-case/exploratory
 
---
 
## Phase 1 — Clarify
 
Thu thập:
1. Feature name + mô tả ngắn
2. Tester level — junior / mid / senior (ảnh hưởng charter complexity)
3. Time-box — 30 / 60 / 90 phút
4. Môi trường — staging / production-like
5. Đã có functional TC coverage chưa (nếu có → exploratory focus vào edge case NGOÀI spec)
 
---
 
## Phase 2 — Analyze
 
Áp dụng SFDIPOT 7 dimension:
S - Structure: thành phần/module/page liên quan
F - Function: chức năng chính + phụ + ẩn
D - Data: edge data, boundary, empty, max, special chars
I - Interface: UI, API, integration point
P - Platform: browser, OS, device, network
O - Operations: ai dùng, khi nào, tần suất
T - Time: timeout, expiry, concurrent, timezone
 
Với mỗi dimension: 3-5 test idea CỤ THỂ.
 
Brainstorm 15-20 "What If" scenarios bất thường:
double click, network drop, 2 tab, back button, idle 2h, emoji input, device rotate...
 
---
 
## Phase 3 — Write
 
Sinh 3-5 charter, mỗi charter gồm:
- Format: "Explore <target> With <resource> To discover <information>"
- Whittaker Tour phù hợp (Money/FedEx/Saboteur/Couch Potato/Intellectual/...)
- Risk level: HIGH / MEDIUM / LOW
- Time-box: 30 / 60 / 90 phút
 
Sinh 10-15 câu hỏi cho dev/BA (assumptions, edge case, error handling, security)
 
---
 
## Output
 
Charter files: {paths.qc_dir}/exploratory/charters/<feature>_01.md, _02.md...
Ideas file: {paths.qc_dir}/exploratory/ideas/<feature>.md
Bảng tổng kết: STT | Charter | Tour | Risk | Time-box

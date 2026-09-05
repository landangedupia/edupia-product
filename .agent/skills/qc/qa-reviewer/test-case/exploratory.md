---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Charter — Exploratory
 
Review chất lượng test charter trước khi QC chạy session.
 
## Khi nào trigger
- "review charter cho [Feature]"
- Sau khi qa-designer/exploratory/charter xong, trước khi chạy session
 
## Khi KHÔNG trigger
- Review TC functional → dùng qa-reviewer/test-case/functional
- Review session note → dùng qa-reviewer/script/exploratory
 
---
 
## Phase 1 — Read
 
Đọc tất cả charter .md trong folder chỉ định + feature description nếu có.
 
---
 
## Phase 2 — Review
 
7 tiêu chí:
1. FOCUS: Charter đủ focus chưa? (quá rộng "Explore checkout" → cần narrow)
2. RISK ALIGNMENT: Target vào risk cao nhất? (tiền → Money Tour, input → Saboteur)
3. SFDIPOT COVERAGE: Tập hợp charter cover đủ 7 dimension?
4. TOUR FIT: Tour phù hợp charter?
5. OVERLAP: 2 charter cover cùng area? → merge
6. MISSING: Area nào chưa có charter?
7. TIME BUDGET: Tổng time-box fit resource QC?
 
---
 
## Output
 
Mỗi charter: ✅ PASS | 🔧 REWORK | ✂️ SPLIT | 🔗 MERGE + feedback cụ thể
Overall assessment + charter bổ sung nếu có gap

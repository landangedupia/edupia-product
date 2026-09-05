---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Session Note — Exploratory
 
Review session note sau khi test, coaching QC cải thiện kỹ năng.
 
## Khi nào trigger
- "review session note" / sau khi QC hoàn thành exploratory session
- Khi lead/senior muốn đánh giá chất lượng session của junior
 
## Khi KHÔNG trigger
- Review Python script → dùng qa-reviewer/script/functional
- Review charter → dùng qa-reviewer/test-case/exploratory
 
---
 
## Phase 1 — Read
 
Đọc session note .md được chỉ định.
 
---
 
## Phase 2 — Review
 
7 tiêu chí:
1. CHARTER COMPLETION: Đi đúng charter? Coverage %?
2. NOTE QUALITY: Ratio #TEST / #BUG ≥ 3:1? Mỗi #TEST có mô tả action + observation?
3. BUG QUALITY: Steps rõ? Expected/Actual cụ thể? Severity hợp lý?
4. OBSERVATION DEPTH: Có dùng FEW HICCUPPS? Hay chỉ test surface?
5. TIME ALLOCATION: Setup <15%, Test >70%, Investigation <15%?
6. FOLLOW-UP: #QUESTION gửi dev? #IDEA move vào ideas/?
7. DEBRIEF: Có Summary cuối? Coverage, risks, next recommendation?
 
---
 
## Output
 
Score: A (excellent) / B (good) / C (needs improvement) / D (redo)
Mỗi tiêu chí: ✅/⚠️/❌ + feedback cụ thể
Top 3 improvement suggestions (coaching tone)
Đề xuất charter tiếp theo nếu chưa đủ coverage

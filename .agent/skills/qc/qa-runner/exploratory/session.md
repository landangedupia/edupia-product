---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Session Template & Convert Findings — Exploratory

Skill **tự chứa**, 2 mode:
- **Mode 1:** sinh session note template trước khi test.
- **Mode 2:** convert findings (#BUG/#IDEA) → bug report + functional TC mới.

## Khi nào trigger
- Mode 1: "tạo template cho session" / trước exploratory session
- Mode 2: "convert findings" / "tạo bug report" / sau session

## Khi KHÔNG trigger
- Sinh charter → `qa-designer/exploratory/charter.md` · review session note → `qa-reviewer/script/exploratory.md`

---

## Mode 1 — Generate Session Template
Input: charter + tour + tester + time-box. Tạo file gồm: metadata (date/tester/charter/tour/env/data) ·
`#SETUP` (bước chuẩn bị) · `#TEST` (5–8 gợi ý theo tour) · `#BUG` template (title, severity, steps,
expected/actual) · `#QUESTION`, `#IDEA` placeholder · summary cuối session.
→ `{paths.qc_dir}/exploratory/sessions/<YYYY-MM-DD>_<tester>.md`

## Mode 2 — Convert Findings
Input: session note (#BUG + #IDEA).
- **Bug report** mỗi #BUG: title, severity, priority, steps to reproduce, expected/actual, hypothesis root cause.
- **Functional TC mới:** mỗi #BUG đã fix → 1–2 TC regression; mỗi #IDEA → TC nếu đủ rõ (hoặc backlog).
  Đặt đúng layer; bám format TC (Test Data list, Trace BR, 🚫 Block); trace "Origin: Exploratory session <date>".
- **Weekly summary** (nếu yêu cầu): overview, top findings, coverage gap, recommendations.

## Output
Mode 1: file session note. Mode 2: bug reports + file TC trong `{qc_artifact_dir}test-cases/` + summary.

---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Review Test Case — Non-Functional

Review bộ TC phi chức năng (performance, security, accessibility, compatibility) và đánh giá chất lượng.

## Khi nào trigger
- "review TC non-functional cho [Feature]" / "check TC hiệu năng/bảo mật/accessibility"
- Sau khi qa-designer/non-functional xong, trước khi qa-runner

## Khi KHÔNG trigger
- Review TC chức năng → `test-case/functional`
- Review TC tích hợp → `test-case/integration`

---

## Phase 1 — Clarify

1. Đọc tất cả TC non-functional trong folder chỉ định; xác định loại: performance / security / accessibility / compatibility
2. Đọc REQUIREMENT_ANALYSIS để lấy SLA, ngưỡng, môi trường mục tiêu
3. Xác định công cụ đo đã được thống nhất (load tool, scanner, axe, lighthouse…)

---

## Phase 2 — Review

Đánh giá theo 4 tiêu chí:

A. COVERAGE (theo loại):
- **Performance:** đủ scenario tải mục tiêu (normal / peak / max-data / concurrency / pagination)?
- **Security:** có TC cho authZ/role (truy cập trái phép), injection, PII không lộ, session/timeout, rate limit?
- **Accessibility:** có TC cho keyboard nav, focus order, label/aria, contrast (WCAG level rõ)?
- **Compatibility:** liệt kê đủ browser/device/độ phân giải mục tiêu; mỗi target có TC riêng?

B. MEASURABILITY — tiêu chí quan trọng nhất:
- Expected có **ngưỡng pass cụ thể** không? (vd `< 2s`, `0 critical issues`, `WCAG 2.1 AA`)
- Expected **không được** dùng: "nhanh", "ổn định", "hiển thị đúng", "bảo mật tốt"
- Có ghi công cụ đo kèm theo ngưỡng không?
- Performance TC: ghi rõ số user đồng thời, kích thước data, thời gian tải tối đa?
- Security TC: ghi rõ payload thử nghiệm (OWASP top 10 input mẫu)?

C. ENVIRONMENT & DATA:
- TC cần môi trường đặc biệt (load test server, staging) có ghi chú rõ không?
- TC cần data lớn / pre-populated data có hướng dẫn chuẩn bị?
- Cleanup / teardown sau mỗi TC (đặc biệt security test)?

D. FORMAT & TRACE:
- Metadata đủ; Trace `[BR-xx]` / SLA source rõ; `🚫 Block: [GAP-xx]` nếu bị chặn?
- Steps phân biệt `[Action]`/`[Verify]`; Expected 1 bullet; KHÔNG `✅/❌` inline?
- Cuối file có Trace matrix + bảng TC block?

---

## Checklist format file `.md`

- **Expected:** PHẢI có `ngưỡng + đơn vị + công cụ đo` — không có → ❌ MISSING.
- **Performance TC:** ghi `concurrent users`, `data volume`, `target response time`.
- **Security TC:** ghi `attack vector`, `input payload`, `expected block/response`.
- **Accessibility TC:** ghi `WCAG version + level`, `tool (axe/lighthouse)`.
- **Compatibility TC:** ghi `browser/OS version + device/resolution`.

---

## Output

Mỗi tiêu chí: ✅ PASS | ⚠️ PARTIAL | ❌ MISSING + evidence (TC ID)
Score: A (excellent) / B (good) / C (needs improvement) / D (redo)
Danh sách TC Expected mờ nhạt (thiếu ngưỡng); loại non-functional thiếu coverage.
Kết luận: sẵn sàng cho `qa-runner` chưa; ghi rõ TC nào cần môi trường đặc biệt.

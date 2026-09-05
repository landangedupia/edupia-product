---
version: 1.0
updated: 2026-08-25
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/spec-issue-reporter/DOC_GAPS.template.md
upstream_sha: c7ca6cfb798c609f18ffe20a38f64f95c76e1919
---

> **Template DUY NHẤT cho file gap của `/qc-analyze`** *(B9 — hợp nhất 2026-08-25)*.
> Bản 9 cột cũ đã bỏ: nó thiếu đúng hai thứ PO cần — cột *Giao cho đội* và ô câu hỏi 4 phần.
> Giữ một bản kém hơn làm mặc định là để người không biết có cờ nhận bản kém.
>
> **Một chỗ CỐ Ý khác upstream:** mức nặng nhất dùng từ **`Blocker`**, không phải `Critical`.
> Lý do: `/qc-run-test` đọc `🔴 Blocker` để đặt *"scenario đang chờ PO"* vào sổ kết quả trace.
> Đổi từ là đứt liên kết đó. Ba mức còn lại giữ nguyên upstream.
>
> **Phạm vi: MỘT file cho cả (PRD × nền)** *(B11)*, không phải một file mỗi UC. Đây là quay về
> đúng thiết kế upstream — chính ID `GAP-<UC>-…` của bản gốc chỉ có nghĩa khi một file chứa
> nhiều UC, và file thật của đội QC (`DOC_GAP_FEAT-02-3.md`) cũng không có hậu tố UC. Đường
> dẫn: `{paths.qc_dir}/{TICKET-ID}/{platform}/DOC_GAP.md`.

# DOC GAP -- <TICKET-ID> / <nền>: <Tên feature>

| Trường | Giá trị |
|---|---|
| Feature | `<TICKET-ID>` — `<Tên feature>` |
| Nền (platform) | `<web \| app \| system>` |
| Tài liệu nguồn | `<đường dẫn PRD>` · `<đường dẫn BDD nếu có>` · `<các file inputs/ liên quan>` |
| Ngày phân tích | `<YYYY-MM-DD>` |
| Tổng số gap | `<N>` (Blocker: x · High: y · Medium: z · Low: w) |
| Trạng thái chung | 🔴 Blocked / 🟠 Cần làm rõ / 🟢 Đủ rõ để thiết kế TC |

---

## Phạm vi phân tích

> **Một file gap phủ CẢ PRD** — mỗi UC là các hàng trong bảng gap, phân biệt bằng cột `UC`.
> Bảng dưới là **căn cứ độ phủ**: nó phân biệt *"đã xét, không thấy gap"* với *"chưa xét"*.
> UC nào có BDD chưa `approved` thì ghi `⏸ Chưa xét` — **KHÔNG bỏ khỏi bảng**.

| UC | Tên UC | `@trace.status` | Đã phân tích? | Số gap |
|---|---|---|---|---|
| `<UC-ID>` | … | `approved` | ✅ | `<n>` |
| `<UC-ID>` | … | `draft` | `⏸ Chưa xét` | — |

**Trong phạm vi: `<n>`/`<N>` UC.** Chưa xét: `<danh sách UC-ID>` — chạy lại sau khi BDD được duyệt, hoặc `--include-draft` để xét luôn bản nháp.

---

## Tài liệu đầu vào đã đọc để phân tích

> Liệt kê **đầy đủ** mọi file đã đọc để dựng phân tích gap (spec chính + mọi ref-link + transitive 1-hop). Đây là căn cứ độ phủ — mọi file đã mở đều phải có mặt, KHÔNG bỏ sót. Đường dẫn tính từ `{paths.specs_dir}`.

| # | Đường dẫn (từ `{paths.specs_dir}`) | Vai trò | Phiên bản |
|---|---|---|---|
| 1 | `<đường dẫn spec chính>` | **Spec chính** | `<vX.Y>` |
| 2 | `<đường dẫn ref>` | Ref bắt buộc — `<lý do>` | `—` |
| ... | ... | Transitive 1-hop — `<feature liền kề / dịch vụ tiêu thụ>` | `—` |

**Tổng: `<N>` tài liệu.** Lane API: `<có → liệt kê openapi.yaml/*.dbml/tdd | không có → SKIP, không đọc, không bịa endpoint>` *(chỉ áp khi framework đã nhận trục lane — xem B5)*. Không dùng làm evidence: Change log · Appendix · mục Giả định AI.

---

> **ID gap mang UC** — `GAP-UC{N}-{nnn}` (vd `GAP-UC1-001`). Gap thuộc **cả PRD**, không riêng
> UC nào → `GAP-GEN-{nnn}`. Đánh số **độc lập trong từng UC**: chạy lại phân tích cho UC1
> KHÔNG được làm đổi số gap của UC2 — test case đã có đang trỏ `🚫 Block: [GAP-UC2-003]`, đổi
> số là đứt liên kết đó trong im lặng.

| ID | UC | Loại | Vấn đề cần confirm | Câu hỏi / Lý do cần confirm & Gợi ý | Trích đoạn tài liệu (Evidence) | Giao cho đội | Mức độ | Người trả lời | Trạng thái | Câu trả lời |
|---|---|---|---|---|---|---|---|---|---|---|
| GAP-UC1-001 | `<UC-ID>` | MISSING / AMBIGUOUS / CONTRADICTORY / ASSUMPTION | Tiêu đề ngắn mô tả vấn đề | **Bối cảnh:** Ngữ cảnh dẫn đến gap này.<br/>**Vấn đề:** Điều gì chưa được spec hoặc mâu thuẫn.<br/>**Tại sao quan trọng:** Hậu quả nếu không làm rõ.<br/>**Gợi ý:** Ai cần làm gì để giải quyết. | `<đường dẫn file spec>` `<TÊN-BR hoặc AC gốc trong PRD, ví dụ FEAT-01-2-UC4-BR11>`: trích nguyên văn | Dev / PO / BA / Design | 🔴 Blocker | | Open | |

---

## Ưu tiên xử lý

| Mức độ | Gap ID |
|---|---|
| 🔴 Blocker | GAP-UC1-00x · GAP-UC3-00x · ... |
| 🟠 High | GAP-UC2-00x · ... |
| 🟡 Medium | GAP-UC1-00x · ... |
| ⚪ Low | GAP-GEN-00x · ... |

*Xếp theo mức độ trước, KHÔNG theo UC — người đọc cần biết "chặn gì" trước "chặn ở đâu".*

**Cần chốt trước khi viết test case:**
- GAP-UC1-00x (`<UC-ID>`): <lý do block>

---

## Chú thích (Legend)

### Loại Gap

| Loại | Mô tả |
|---|---|
| MISSING | Thông tin, chức năng, quy tắc, hoặc kịch bản chưa được mô tả trong bất kỳ tài liệu nào trong `{paths.specs_dir}`. |
| AMBIGUOUS | Mô tả mơ hồ, có thể hiểu theo nhiều cách, hoặc thiếu chi tiết để viết kịch bản kiểm thử. |
| CONTRADICTORY | Hai hoặc nhiều tài liệu trong `{paths.specs_dir}` mô tả cùng một hành vi nhưng mâu thuẫn nhau. |
| ASSUMPTION | Giả định do nhóm QA tự suy luận từ tài liệu trong `{paths.specs_dir}`, chưa được PO/Dev xác nhận tường minh. |

### Mức độ

| Mức | Ý nghĩa |
|---|---|
| 🔴 Blocker | Chặn viết kịch bản kiểm thử hoặc lập trình — không thể tiến hành nếu chưa có câu trả lời. |
| 🟠 High | Ảnh hưởng đến nhiều kịch bản kiểm thử hoặc logic nghiệp vụ chính — cần giải quyết trước khi viết test case. |
| 🟡 Medium | Ảnh hưởng đến một số kịch bản cụ thể — cần giải quyết trước sprint kiểm thử. |
| ⚪ Low | Ít ảnh hưởng — có thể ghi giả định tạm thời và xử lý trong sprint review. |

### Giao cho đội

| Ký hiệu | Đội |
|---|---|
| Dev | Đội phát triển (Frontend + Backend) |
| Architect | Kiến trúc sư hệ thống |
| PO | Product Owner |
| BA | Business Analyst |
| Design | Đội thiết kế UX/UI |
| Analytics | Nhóm dữ liệu / phân tích |

---

## ⚠️ Checklist bắt buộc trước khi lưu file

Trước khi lưu file gap, kiểm tra **từng hàng** trong bảng gap:

- [ ] **Có section `Tài liệu đầu vào đã đọc để phân tích`** – bảng liệt kê **đầy đủ** mọi file đã đọc (spec chính + ref-link + transitive 1-hop), có đường dẫn `{paths.specs_dir}`, vai trò, phiên bản; ghi tổng số + trạng thái lane API. KHÔNG bỏ sót file nào đã mở.
- [ ] **Có section `Phạm vi phân tích`** – bảng mỗi UC một hàng kèm `@trace.status` + Đã phân tích? + Số gap. UC chưa duyệt vẫn có hàng, ghi `⏸ Chưa xét`. Thiếu bảng này thì không ai phân biệt được *"đã xét, không thấy gap"* với *"chưa xét"*.
- [ ] **11 cột đủ** – đúng thứ tự: `ID | UC | Loại | Vấn đề cần confirm | Câu hỏi / Lý do cần confirm & Gợi ý | Trích đoạn tài liệu (Evidence) | Giao cho đội | Mức độ | Người trả lời | Trạng thái | Câu trả lời`
- [ ] **Cột 2 = `UC`** – mã UC đầy đủ (`<TICKET-ID>-UC{N}`), hoặc `— (toàn PRD)` cho gap `GAP-GEN-`. Mọi UC có gap phải khớp một hàng `✅` ở bảng *Phạm vi phân tích*.
- [ ] **ID dạng `GAP-UC{N}-{nnn}`** (hoặc `GAP-GEN-{nnn}`) – KHÔNG dùng `GAP-01` phẳng: số phẳng sẽ bị đánh lại khi phân tích lại một UC, làm đứt `🚫 Block: [GAP-xx]` trong test case đã có.
- [ ] **Cột 4 = `Vấn đề cần confirm`** – KHÔNG viết tắt thành `Vấn đề`
- [ ] **Cột 5 = `Câu hỏi / Lý do cần confirm & Gợi ý`** – bắt buộc có đủ 4 phần, tách bằng `<br/>`:
  ```
  **Bối cảnh:** ...<br/>**Vấn đề:** ...<br/>**Tại sao quan trọng:** ...<br/>**Gợi ý:** ...
  ```
  Không viết 4 mục liên tiếp trên cùng một dòng.
- [ ] **Cột 6 = `Trích đoạn tài liệu (Evidence)`** – KHÔNG viết tắt thành `Evidence`; dẫn nguyên văn + đường dẫn file `{paths.specs_dir}`; **dùng PRD source ID** (ví dụ `FEAT-01-2-UC4-BR11`), KHÔNG dùng internal analysis ID (ví dụ `BR-UC4-12`)
- [ ] **Cột Mức độ** (cột 8) – bắt buộc dùng emoji: `🔴 Blocker` / `🟠 High` / `🟡 Medium` / `⚪ Low`. Không được ghi text thuần.
- [ ] **Cột Giao cho đội** (cột 7) – dùng: `Dev` / `PO` / `BA` / `Design` / `Architect` / `Analytics` hoặc kết hợp. Nếu thấy "Open" ở đây → đang bị lệch cột.
- [ ] **Cột Người trả lời = vai trò** (PO / BA / Dev / Design / ...). Nếu thấy "Open" ở đây → đang bị lệch cột.
- [ ] **Cột Trạng thái** = `Open` / `Resolved` / `Out of Scope` / `Re-scoped → Covered`
- [ ] **Trạng thái chung** trong metadata có emoji: `🔴 Blocked` / `🟠 Cần làm rõ` / `🟢 Đủ rõ để thiết kế TC`
- [ ] **Có đủ 3 section cuối**: Ưu tiên xử lý · Chú thích (Legend) với bảng đầy đủ
- [ ] **KHÔNG có section "Change log"** và **KHÔNG có section "AI Assumptions"**
- [ ] **Evidence chỉ từ `{paths.specs_dir}`** – không dùng file trong `{paths.qc_dir}` nội bộ (TC_*.md, REQUIREMENT_ANALYSIS*.md, DOC_GAP*.md khác)

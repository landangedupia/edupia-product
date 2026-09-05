# Report Footer — Định dạng output chuẩn cho mọi lệnh

Mọi report của lệnh phải kết thúc bằng section footer chuẩn này.

## Model *(bắt buộc, một dòng)*

In model mà **bạn — agent vừa chạy lệnh này — thực sự đang dùng** (ghi nhận ở Gate Bước 0-B):

```
Model: {tên model đang chạy}
```

Nếu bạn biết mình **không** phải một model Opus, thêm cảnh báo ngay trên cùng dòng:

```
Model: {tên model}   ⚠️ lệnh này khuyến nghị Opus — model nhỏ hơn dễ bỏ sót edge case,
                        phân tích spec thiếu sót, vi phạm kiến trúc. Cân nhắc chạy lại
                        với /model → Opus trước khi dùng kết quả này.
```

> **Vì sao ở ĐÂY chứ không phải một prompt ở đầu lệnh (GAPS-v3 G41):** trước đây Gate hiện
> `⚙️ MODEL CHECK` rồi chờ `Y/S/N`. Nó **hỏi người dùng thứ agent đã biết**, câu trả lời
> **không kiểm chứng được**, và **cả `Y` lẫn `S` đều đi tiếp** — tức không chặn được ai, mà
> tốn một lần chặn ở mọi lệnh (20 lệnh cho một feature). Khai báo ở footer đúng nguồn hơn
> (agent tự khai, không phải người tự khai) và đúng chỗ hơn: nó nằm **cạnh kết quả** để
> người đọc cân nhắc có nên tin, thay vì nằm trước khi có kết quả để bấm cho xong.

## Status Badge

Chọn một theo kết quả:
- `✅ Complete` — mọi bước thành công, không có vấn đề
- `❌ Failed` — lệnh không hoàn thành được do lỗi chặn
- `⚠️ Warnings` — hoàn thành nhưng có vấn đề không chặn, nên review lại

## Output Artifacts

Liệt kê mọi file được tạo hoặc sửa bởi lệnh này:
```
Output Artifacts:
  {created|updated} {file-path} ({mô tả ngắn})
  {created|updated} {file-path} ({mô tả ngắn})
```

Nếu không ghi file nào (vd: lệnh review hoặc phân tích) → ghi `Output Artifacts: none (read-only)`.

## Pipeline Position

In một sơ đồ pipeline một dòng, đánh dấu phase của lệnh HIỆN TẠI bằng `◀ bạn ở đây`,
để người dùng luôn thấy lệnh này nằm ở đâu trong luồng end-to-end:

```
Discovery → PRD → [Design Spec] → BDD → Tech Design → Code → Dev Self-Check → QC → Trace Audit
```

Tìm lệnh hiện tại trong bảng phase dưới đây và đánh dấu **phase của nó** trong sơ đồ trên:

| Phase | Commands |
|-------|----------|
| Discovery | `/define-product` |
| PRD | `/generate-prd` · `/extend-prd` · `/refine-prd` · `/review-context` (PRD) |
| Design Spec | `/generate-design-spec` |
| BDD | `/generate-bdd` · `/review-context` (BDD) |
| Tech Design | `/generate-tech-docs` · `/map-testids` · `/review-tech-docs` |
| Code | `/generate-code` · `/review-code` |
| Dev Self-Check | `/dev-gen-test` · `/dev-run-test` · `/dev-smoke-test` |
| QC | `/qc-analyze` · `/qc-plan` · `/qc-design-test` · `/qc-review` · `/qc-run-test` · `/qc-report` |
| Trace Audit | `/validate-traces` |

Với **lệnh review**, thêm vòng review 3 bước và đánh dấu bước hiện tại, vd:
`Vòng review: [① phân tích ◀] → ② Review Board → ③ --resume`.

**Lệnh xuyên suốt** (`/sync`, `/update-framework`, `/fix-bug`, `/debug`, `/learn`,
`/report-bug`, `/propose-scenario`, `/generate-spec-manifest`) nằm ngoài pipeline tuyến tính —
**bỏ hẳn dòng Pipeline** cho các lệnh này (đừng cố nhét chúng vào sơ đồ).

## Gợi ý lệnh tiếp theo

Gợi ý lệnh kế tiếp hợp lý theo phase của workflow:

| Lệnh hiện tại           | Gợi ý lệnh tiếp theo                          |
|-------------------------|-----------------------------------------------|
| /setup-ai-first         | `/define-product` để bắt đầu feature đầu tiên |
| /define-product         | `/generate-prd {product-definition-file}`     |
| /generate-prd           | `/refine-prd {prd-file}` rồi `/review-context {prd-file}` |
| /extend-prd             | `/refine-prd {prd-file}` (soi phần vừa thêm) rồi `/review-context {prd-file}` → PO duyệt → `/generate-bdd` **chỉ cho UC MỚI**; UC cũ dùng `/validate-traces --realign-prd-version {UC-ID}` |
| /refine-prd             | Mở Review Board → cập nhật PRD → `/review-context {prd-file}` |
| /review-context (PRD)   | Khi 0 critical → PO đặt `Status: approved`, rồi FE/App: `/generate-design-spec {prd-file}` (→ design sign-off → BDD); BE: `/generate-bdd {prd-file}`. Còn critical/NEEDS_FIX → sửa PRD (giữ draft) |
| /generate-design-spec   | Designer review → xác nhận link Figma → PO + Designer sign-off → `/generate-bdd {prd-file}` |
| /generate-bdd           | `/review-context {feature-file}` để kiểm tra độ phủ |
| /review-context (BDD)   | `/generate-tech-docs {UC-ID}` nếu APPROVED; sinh lại nếu NEEDS_FIX |
| /qc-analyze             | `/qc-plan {UC-ID}` (xử lý các gap blocker 🔴 trước) |
| /qc-plan                | `/qc-design-test {UC-ID}`                     |
| /qc-design-test         | `/qc-review {UC-ID}` (review test-case)       |
| /qc-review (test-case)  | `/qc-run-test {UC-ID}` nếu APPROVED; sửa TC nếu NEEDS_FIX |
| /qc-run-test            | `/qc-report {UC-ID}` rồi `/qc-review {UC-ID}` (review script) |
| /qc-review (script)     | `/qc-report {UC-ID}` rồi tạo PR nếu APPROVED |
| /qc-report              | `/validate-traces {UC-ID}` để làm mới Living Docs (qc_status) |
| /map-testids            | `/qc-design-test {UC-ID}` (QC dựng Page Object từ contract §4.5.6 vừa ghi) |
| /generate-tech-docs     | `/review-tech-docs {tech-design-file}`        |
| /review-tech-docs       | `/generate-code {feature-file}` nếu APPROVED; sửa doc nếu NEEDS_FIX |
| /generate-code          | Lần gen đầu → `/review-code {UC-ID}`; gen lại → `/dev-gen-test {UC-ID}` |
| /dev-gen-test         | `/dev-run-test {UC-ID}`                          |
| /dev-run-test (passing)    | `/review-code {UC-ID}`                        |
| /dev-run-test (failing)    | `/fix-bug {ticket-id}` hoặc `/debug {error}`    |
| /review-code            | `/dev-smoke-test {UC-ID}` hoặc tạo PR            |
| /dev-smoke-test             | Tạo PR và link tới ticket                  |
| /validate-traces        | **Cờ 🔴 trước (chặn PR):** SEAM_UNWIRED → nối binding sang class thật, xoá/thay stub · STUB_UNRESOLVED → `/generate-code {owner_uc}` (lấp logic tại chỗ + xoá hàm song song) · ORPHANED/TRACE_ORPHAN → quyết định thủ công (xoá code+test, đưa scenario trở lại `.feature`, hoặc sửa `sc_id` của tag). **Rồi:** DRIFT/UNTRACKED → `/generate-code {UC-ID}` · BDD_DRIFT → `/generate-code {feature-file}` · tech-doc lỗi thời vs BDD → `/generate-tech-docs` → `/review-tech-docs` · PRD drift → `/generate-bdd {prd-file}` · GAP → `/dev-gen-test {UC-ID}`. **Chỉ tạo PR khi mọi cờ 🔴 = 0** |
| /fix-bug                | `/dev-run-test {UC-ID}` (dev_selftest vừa reset về not_run) → tạo PR; nếu fix một `{BUG-ID}` → QC chạy `/qc-run-test {UC-ID}` để verify + đóng bug |
| /debug                  | `/fix-bug {ticket-id}` nếu cần sửa          |
| /report-bug             | Gửi cho dev (`/fix-bug {BUG-ID}`); nếu thiếu coverage → `/propose-scenario {UC-ID}` |
| /propose-scenario       | **Case A** (thiếu scenario cho AC có sẵn) → báo PO/Dev review trong `feedback/bdd-proposals/`; `/generate-bdd` tự chèn khi `Status: accepted`. **Case B** (requirement mới) → `feedback/prd-change-requests/` — PO phải đưa vào PRD trước, KHÔNG tự vào BDD được; `/validate-traces` nhắc lại kèm số ngày chờ chừng nào `Status: Open` |
| /learn                  | Tiếp tục làm việc — lesson áp dụng ở lệnh kế tiếp |
| /sync                   | `/validate-traces` để xem độ phủ đầy đủ; xử lý mọi `📥 tester feedback` được nêu |
| /update-framework       | Review `git diff .agent/`, commit; `/sync` để đồng bộ nội dung dự án |

Định dạng footer như sau:
```
---
Status   : {badge}
{khối Output Artifacts}
Pipeline : Discovery → PRD → [BDD ◀ bạn ở đây] → Tech Design → Code → Dev Self-Check → QC → Trace Audit
           (lệnh review) Vòng review: [① phân tích ◀] → ② Review Board → ③ --resume
Next     : {lệnh gợi ý kèm ví dụ tham số}
```
*(Bỏ dòng `Pipeline` cho các lệnh xuyên suốt liệt kê ở trên.)*

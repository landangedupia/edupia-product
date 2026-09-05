---
version: 1.0
updated: 2026-08-25
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/spec-issue-reporter.md
upstream_sha: 5b5c0c886e92b474e0a5a8157ba58a7c3ce4b3f8
---

# Spec Issue Reporter — gom mọi điểm mơ hồ thành báo cáo gửi PO/BA/Dev

Gom mọi điểm mơ hồ / thiếu / mâu thuẫn phát hiện được trong lúc phân tích thành **một** báo cáo
có cấu trúc, đủ thông tin để người nhận trả lời được ngay.

> **`/qc-analyze` nạp file này** *(B9 — hợp nhất 2026-08-25)*. Nó là luật viết cho
> `DOC_GAP.template.md` — template **duy nhất** của file gap. Bản 9 cột cũ đã bỏ.
>
> **Một file gap phủ CẢ PRD** *(B11)* — `{paths.qc_dir}/{TICKET-ID}/{platform}/DOC_GAP.md`,
> mỗi UC là các hàng phân biệt bằng cột `UC`. Không còn một-file-mỗi-UC.
>
> **Một chỗ cố ý khác upstream:** mức nặng nhất dùng `🔴 Blocker`, không phải `Critical` —
> `/qc-run-test` đọc đúng từ đó để đặt *"scenario đang chờ PO"* vào sổ trace.

## Đầu vào

Mọi dấu `?`, chỗ thiếu mapping, chỗ mâu thuẫn mà các skill phân tích khác đã ghi nhận.

## Đầu ra

> ⛔ **BẮT BUỘC theo template — tự-validate trước khi lưu.** Đây là skill hay xuất **sai
> template** nhất: tự chế cột, gộp `Trạng thái` với `Câu trả lời`, thiếu `Giao cho đội` /
> `Người trả lời`, dùng Loại phi chuẩn (`SYNC` / `Drift` / `FEASIBILITY`), quên section
> *Ưu tiên xử lý* + *Chú thích*.
>
> TRƯỚC khi lưu: mở `{paths.qc_skills_dir}/qa-analyst/DOC_GAP.template.md`, chạy hết
> **"⚠️ Checklist bắt buộc trước khi lưu file"** ở cuối template, sửa cho khớp 100%.

Một file gap gồm:

1. **Section `Tài liệu đầu vào đã đọc để phân tích`** — BẮT BUỘC, đặt ngay sau metadata,
   **trước** bảng gap. Bảng liệt kê **đầy đủ** mọi file đã đọc (spec chính + mọi ref-link +
   transitive 1-hop): `# | Đường dẫn | Vai trò | Phiên bản`, kèm tổng số.
   KHÔNG bỏ sót file nào đã mở — đây là **căn cứ độ phủ**: không có nó thì không ai phân biệt
   được *"đã đọc và không thấy"* với *"chưa đọc"*.
2. **Bảng gap 11 cột**, đúng thứ tự:
   `ID | UC | Loại | Vấn đề cần confirm | Câu hỏi / Lý do cần confirm & Gợi ý | Trích đoạn tài liệu (Evidence) | Giao cho đội | Mức độ | Người trả lời | Trạng thái | Câu trả lời`
3. **Section `Phạm vi phân tích`** — BẮT BUỘC, giữa metadata và section trên. Mỗi UC của
   (PRD × nền) một hàng, kèm `@trace.status` + đã phân tích chưa + số gap. UC có BDD chưa
   `approved` **vẫn có hàng**, ghi `⏸ Chưa xét`.

## Quy tắc

- **Evidence bắt buộc** — dẫn **nguyên văn** in nghiêng + tham chiếu vị trí cụ thể
  (`〔file §section〕`). Dùng ✕ khi mâu thuẫn giữa hai chỗ. Không phán đoán chủ quan.
- **Cột 4 phải đủ bốn mục**, tách bằng `<br/>` thành từng dòng riêng trong cell:
  ```
  **Bối cảnh:** …<br/>**Vấn đề:** …<br/>**Tại sao quan trọng:** …<br/>**Gợi ý:** …
  ```
  Không viết bốn mục liên tiếp trên một dòng. Ngôn ngữ dễ hiểu cho PO/Design/Dev.
  *"Tại sao quan trọng"* là thứ cho phép người nhận **xếp ưu tiên**; *"Gợi ý"* là thứ cho phép
  họ **trả lời nhanh** thay vì nghĩ lại từ đầu.
- **Tham chiếu BR/AC dùng ID GỐC trong PRD** (vd `FT-001-UC4-BR11`), **không** dùng ID nội bộ
  do bước phân tích tự đánh số lại (vd `BR-UC4-12`). Hai hệ ID khác nhau; trộn vào là người
  đọc không tra ngược được về PRD.
- **Mức độ bắt buộc có emoji**: `🔴 Blocker` · `🟠 High` · `🟡 Medium` · `⚪ Low`.
- **ID gap mang UC**: `GAP-UC{N}-{nnn}` (vd `GAP-UC1-001`); gap thuộc cả PRD → `GAP-GEN-{nnn}`.
  Đánh số **độc lập trong từng UC** — phân tích lại UC1 KHÔNG được làm đổi số gap của UC2,
  vì test case đã có đang trỏ `🚫 Block: [GAP-UC2-003]` và đổi số là đứt liên kết trong im lặng.
  **Không dùng `GAP-01` phẳng.**
- **Cột `UC`** ghi mã UC đầy đủ (`{TICKET-ID}-UC{N}`), hoặc `— (toàn PRD)` cho `GAP-GEN-`.
  Mọi UC xuất hiện ở đây phải khớp một hàng `✅` trong bảng *Phạm vi phân tích*.
- **Pipe trong cell**: escape thành `\|` (vd `{a\|b\|c}`), nếu không sẽ vỡ bảng.
- **Thêm hàng vào bảng đã có**: nối **ngay liền sau hàng cuối**, TUYỆT ĐỐI không chèn dòng
  trắng giữa các hàng — dòng trắng làm Markdown tách thành hai bảng riêng và các gap mới
  **không render** trong bảng chính. Thêm xong cập nhật luôn *Tổng số gap* ở header và bảng
  *Ưu tiên xử lý*.
- **KHÔNG thêm section "Change log"** và **KHÔNG thêm section "AI Assumptions"** — mọi giả định
  AI tự suy là gap loại `ASSUMPTION` trong bảng, không tách thành section riêng.

## Trạng thái hợp lệ

`Open` · `Resolved` · `Out of Scope` · `Re-scoped → Covered`

**Khi một trường hợp đã đánh dấu `Out of Scope` được yêu cầu viết test:**

1. Kiểm PRD xem có ghi chú thay đổi phạm vi không — một change request có thể **dời trách
   nhiệm kiểm tra** từ UC này sang UC khác.
2. Có ghi chú rõ ràng → đổi trạng thái `Out of Scope` → `Re-scoped → Covered`, ghi test-case
   mới vào cột *Câu trả lời*.
3. Không tìm thấy ghi chú nhưng QC vẫn yêu cầu → **vẫn viết test** (QC chốt phạm vi), đồng
   thời ghi chú lại để truy vết.

## Xác định IN-SCOPE vs NGOÀI PHẠM VI — căn cứ SPEC, không dùng artifact tự sinh

> ⚠️ **Nguồn quyết định phạm vi là SPEC, không phải tài liệu do chính pipeline QC sinh ra.**

- Khi phán một hạng mục là in-scope hay ngoài phạm vi, phải trích **spec authority**: mục
  *Scope/Phạm vi* của PRD, `@trace.platform` của file `.feature`, hoặc design-spec nêu rõ nền
  tảng áp dụng.
  **TUYỆT ĐỐI KHÔNG** lấy `TEST_PLAN.md` / `*.Test.md` dưới `{paths.qc_dir}` làm căn cứ — chúng
  do chính pipeline này sinh ra, nên dùng chúng là **vòng lặp**: lấy *hệ quả* của phạm vi làm
  *nguồn* của phạm vi.
- **Bố cục file gap:** chỉ gap **in-scope** nằm trong bảng chính và tính vào *Ưu tiên xử lý*
  (đây là gap sẽ chặn hoặc đẻ ra test). Gap **thật nhưng ngoài phạm vi** (thuộc feature khác)
  và gap **lệch đồng bộ tài liệu** → gom vào section **"Ghi chú ngoài phạm vi"** riêng, không
  trộn vào bảng chính, không tính ưu tiên. **Giữ audit trail, đừng xoá.**
- Phân vân in hay out → mặc định **giữ in-scope + hỏi lại**. Loại nhầm ra ngoài phạm vi làm
  **mất coverage trong im lặng** — nguy hiểm hơn hẳn việc thừa một gap ngoài lề.

## Sau khi sinh file gap — BẮT BUỘC thẩm định

Chạy `steps/gap-verify.md` trên tập gap vừa sinh trước khi bàn giao. Skill này **tìm** gap;
nó không có cơ chế nào tự phát hiện gap mình vừa bịa ra. Xem `gap-verify` §"Nguyên tắc tối thượng".

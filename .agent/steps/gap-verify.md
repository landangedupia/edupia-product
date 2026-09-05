# Gap Verify — cổng thẩm định độc lập, chống finding bịa

**Vì sao có cái này:** `steps/review-fanout.md` chỉ có một chiều lực — vòng
completeness-critic ở Phase 2 luôn hỏi *"còn thiếu gì nữa?"*, nên nó đẩy **recall** lên
và **không có gì kéo precision lại**. Fan-out càng rộng, critic càng lặp, thì finding bịa
càng nhiều: khẳng định hành vi spec không nêu, trích evidence sai, hoặc gắn nhãn "gap"
cho thứ thực ra là chuyện làm-kỹ-test.

Bước này là nửa còn thiếu đó. Nó **mở lại tài liệu nguồn** và bắt mỗi finding tự chứng minh
trước khi được giữ.

> **Nguyên tắc tối thượng:** một finding chỉ hợp lệ khi có **ĐỦ 2 vế** —
> **(1)** spec nguồn nêu hoặc ngụ ý hành vi X, **VÀ** **(2)** không tài liệu nào trong nguồn
> trả lời/phủ X. Thiếu một trong hai → **không phải finding**.

> ⚠️ **Cấm dùng chính trường evidence/quote của finding làm bằng chứng.** Phải mở file nguồn
> và đọc lại đoạn được trích — evidence có thể bị diễn giải sai hoặc bịa. Đây là toàn bộ lý do
> bước này tồn tại; bỏ qua nó thì bước này chỉ là một vòng critic nữa.

*Ported từ `ui-automation-testing` — `skills/qa-tc-analyst/gap-verifier.md`.*

---

## Tham số lệnh gọi truyền vào

| Tham số | Bắt buộc | Nghĩa |
|---|:---:|---|
| `FINDINGS` | ✅ | Tập finding cần thẩm định. Chỉ xét cái đang ở trạng thái mở (`Open` / `pending`); bỏ qua cái đã đóng trừ khi được yêu cầu soát lại. |
| `EVIDENCE_ROOT` | ✅ | Nơi chứa **sự thật gốc** — mặc định `{paths.specs_dir}` (spec submodule của PO). Verifier chỉ được lấy căn cứ từ đây. |
| `VERDICT_FIELD` | ✅ | Ghi kết quả vào đâu. `/qc-analyze` → cột `Trạng thái` + `Câu trả lời` của bảng gap; `/refine-prd` · `/review-context` → `status` + `suggestion` của findings YAML. |
| `RERATE` | | `on` (mặc định) chạy GIAI ĐOẠN 1B — hiệu chỉnh mức độ. `off` bỏ qua, chỉ giữ/bỏ. |

> **Bỏ qua ở chế độ sub-agent:** nếu Gate Bước 0 đã set `_agent_mode: true`, orchestrator
> chịu trách nhiệm gọi bước này một lần trên tập finding đã hợp nhất — sub-agent **không**
> tự verify phần của mình (verify từng mảnh rời không thấy được T6 trùng lặp).

---

## RÀNG BUỘC NGUỒN

- **Chỉ `EVIDENCE_ROOT`** làm căn cứ. **KHÔNG** dùng artifact nội bộ do chính pipeline sinh ra
  (`{paths.qc_dir}/**`, `{paths.refinement_dir}/**`, test-case, report) — đó là vòng lặp:
  lấy kết luận của mình làm bằng chứng cho mình.
- **Bỏ qua** — không đọc, không trích làm căn cứ — các section **Change Log**, **Appendix**,
  và **Giả định AI / AI Assumptions** trong mọi tài liệu. Căn cứ chỉ lấy từ **thân bài**
  (AC · BR · UC · Wireframe · Screen Spec · Scenario).
  *Change log là "delta narrative", phải re-ground về thân bài; Appendix và Giả định AI là
  ghi chú nháp, không phải nguồn chân lý.*
- Đọc **cả tài liệu gốc cấp trên** (`{paths.product_definitions_dir}/`) và **tài liệu liên quan**
  (`{paths.business_dictionary}`, `{paths.core_entities}`) — một finding có thể đã được trả lời
  ở tài liệu khác, không riêng spec đang xét.

---

## 5 anti-pattern — nhận diện trước khi kết luận

| # | Anti-pattern | Dấu hiệu |
|---|---|---|
| **AP1** | Phạm vi tích hợp lẫn vào spec nghiệp vụ | Finding nói về API contract, queue, service-to-service, retry backend, webhook — thứ PRD đã khai "ngoài phạm vi" |
| **AP2** | Rule cha bị tính là thiếu ở con | *"PRD con không mô tả X"* mà X đã có trong `{paths.product_definitions_dir}/` — PRD con **kế thừa** cha theo thiết kế |
| **AP3** | Finding UI tạo ra mà chưa đọc design-spec | *"thiếu behavior/navigation/state X"* mà X được mô tả rõ trong design-spec §Actions / §Screen States |
| **AP4** | Bias "nhiều finding = làm kỹ" | Cố sinh nhiều để thể hiện thoroughness. **5 finding thật tốt hơn 22 finding với 20 cái ảo.** Không cần điền đủ K nếu thực tế chỉ có M < K |
| **AP5** | Trích từ nguồn cấm | Evidence tham chiếu §Giả định AI / AI Assumptions / Change Log |
| **AP6** | Nâng note thứ cấp thành finding | Một ghi chú *"nghi X lệch"* trong BDD/design-spec là **claim cần verify, KHÔNG phải bằng chứng**. Chưa mở nguồn sơ cấp (PRD·BR·contract·Figma) thì chưa được raise. Không mở được asset → ghi *"chưa verify — cần Designer xác nhận"*, KHÔNG khẳng định *"asset đang sai"* |

---

## 3 câu hỏi lọc bắt buộc

Mỗi finding phải vượt **cả ba**. Rớt bất kỳ câu nào → loại.

| Câu | Giữ khi | Rớt thì |
|---|---|---|
| **Q1** — *"X đã được spec ở design-spec / product-definition / tech-docs chưa?"* | **Chưa** — tìm khắp `EVIDENCE_ROOT` không thấy | `❌ INVALID — spec đã trả lời` |
| **Q2** — *"X có thuộc phạm vi spec này không?"* | **Có** — spec này đặc tả hành vi X | `❌ INVALID — ngoài phạm vi` |
| **Q3** — *"Người thực thi tự quyết được không cần PO/BA confirm?"* | **Không** — bắt buộc cần PO/BA chốt | `⚠️ RECLASSIFY` (xem T5d/T5e) |

> **Q3 là câu bảo vệ thời gian của PO.** Mọi thứ QC/dev tự quyết được mà vẫn đẩy lên PO
> đều là chi phí thuần — và tệ hơn, nó làm loãng những câu thật.

---

## GIAI ĐOẠN 1 — T1…T6 cho từng finding

Chạy tuần tự. Rớt bất kỳ test nào → không hợp lệ, ghi verdict tương ứng.

### T1 — Evidence có thật & đúng nội dung *(chống bịa trích dẫn)*
Mở đúng file/section mà finding trích. Tìm đoạn nguyên văn.
- **FAIL nếu:** trích dẫn không tồn tại · bị diễn giải sai lệch nghĩa · hoặc đoạn trích
  **không thực sự nói điều finding khẳng định**.
- **FAIL nếu evidence trích từ Change Log / Appendix / Giả định AI** — nguồn cấm.
  Phải re-ground về thân AC/BR/UC/Wireframe; thân bài không nói điều đó → finding sai.
- → `❌ INVALID — evidence bịa/sai/nguồn-cấm`

### T2 — Hành vi "thiếu" đúng là yêu cầu của spec *(chống bịa yêu cầu)*
Với finding MISSING/AMBIGUOUS: spec nguồn **có thật sự nêu hoặc ngụ ý** hành vi X không?
- **FAIL nếu:** X **không được tài liệu nào yêu cầu** — finding tự nghĩ ra một yêu cầu
  rồi than spec không mô tả nó.
- → `❌ INVALID — yêu cầu tự bịa`

### T3 — Chưa được trả lời ở nơi khác *(chống finding đã cover)*
Tìm khắp `EVIDENCE_ROOT` (gồm tài liệu gốc + liên quan) xem câu hỏi đã có lời đáp chưa —
kể cả **trả lời ngầm định** bằng cách diễn đạt điều kiện.
- → `❌ INVALID — spec đã trả lời` *(kèm trích nguồn trả lời)*

### T3b — Mâu thuẫn thật hay chỉ khác UC/pha *(chỉ áp cho finding CONTRADICTORY)*
Xác định **UC + pha** của TỪNG rule (chuẩn bị / thực hiện / nộp / công bố / quay lại).
- **FAIL nếu:** hai rule thuộc **UC/pha khác nhau** → thường là ngữ cảnh **tuần tự** hoặc
  **không giao nhau**, không phải mâu thuẫn tại cùng một thời điểm quyết định.
- → `❌ INVALID — khác UC/pha, không mâu thuẫn`

### T4 — Kế thừa tài liệu gốc *(chống "con không lặp lại cha")*
Rule đã định nghĩa trong `{paths.product_definitions_dir}/` thì việc spec con không lặp lại
**không phải finding**.
- → `❌ INVALID — đã có ở tài liệu gốc`

### T5 — Đúng loại *(chống phân loại nhầm)*

> ⚠️ **BẮT BUỘC xác định HƯỚNG trước khi gán loại** (tài liệu dẫn xuất so với PRD):
> - **THIẾU (dẫn xuất < PRD):** PRD yêu cầu màn/rule mà design/BDD KHÔNG có → `MISSING`.
>   Xử lý = bổ sung vào tài liệu dẫn xuất.
> - **THỪA (dẫn xuất > PRD):** design/BDD **tự thêm** hành vi PRD không sanction →
>   `CONTRADICTORY`, **KHÔNG dùng `MISSING`**. Xử lý = PO chốt giữ (định nghĩa hệ quả vào PRD)
>   hay gỡ.
>
> Sai hướng = framing sai — gọi *"design thiếu"* trong khi design **thừa**.

| Nhóm | Nghĩa | Verdict |
|---|---|---|
| **(a)** Finding nghiệp vụ thật | spec nêu hành vi, không tài liệu nào phủ | `✅ VALID` — giữ mở |
| **(b)** Lệch đồng bộ (SYNC) | PRD đã cập nhật nhưng design-spec / BDD chưa phản ánh nội dung mới | `✅ VALID — SYNC` — **giữ mở**, mức Low–Medium, giao đội spec. KHÔNG đóng: cần track để cập nhật |
| **(c)** Metadata lệch | chênh version header, sai tên trace, format — **nội dung nghiệp vụ vẫn đúng** | `⚠️ RECLASSIFY — metadata` |
| **(d)** Làm-kỹ-test | thêm giá trị biên, liệt kê đủ ô decision table, biến thể dữ liệu — mà **rule/behavior đã được phủ** | `⚠️ RECLASSIFY — làm-kỹ-test` |
| **(e)** Tech/UX tự quyết | số lần retry, timeout/delay, loading spinner, animation, exact-copy nút/label, xử lý crash, cơ chế lưu session — thuộc Dev/Design, không phải PO/BA | `⚠️ RECLASSIFY — tech/UX tự quyết` |

> **Ranh giới SYNC vs metadata:** SYNC = *nội dung* PRD mới chưa được phản ánh vào tài liệu
> dẫn xuất (section còn thiếu). Metadata = chỉ số version lệch, nội dung đã đúng.
>
> **Ranh giới (c)(d) vs (a):** nếu **bản thân hành vi/rule đã có scenario hoặc mô tả phủ**,
> mọi đề xuất *"thêm ca biên / thêm giá trị / đủ ô bảng"* đều là (d), KHÔNG phải finding.
>
> **Ngoại lệ GIỮ ở (e):** *ý chính / khung thông điệp* của popup do PO chốt intent;
> và mọi ranh giới pháp lý / privacy.

### T6 — Không trùng lặp *(chống double-count)*
So với các finding còn lại: cùng root cause → merge, giữ một, ghi rõ *"merge từ …"*.
- → `🔁 MERGE → {id}`

**Qua sạch T1–T6 (+T3b nếu CONTRADICTORY) → `✅ VALID`.**

---

## GIAI ĐOẠN 1B — Hiệu chỉnh mức độ *(chạy khi `RERATE=on`)*

T1–T6 quyết định finding **còn hay bỏ**; giai đoạn này quyết định cái còn lại **nặng hay nhẹ**.
Nhiều finding hợp lệ về mặt tồn tại nhưng **bị gán mức quá cao** — và một danh sách toàn
🔴 Critical thì không xếp được ưu tiên, tức mất luôn giá trị của cột mức độ.

Với **mỗi** finding còn mở, hạ mức hoặc chuyển sang "ghi chú phạm vi" nếu rơi vào một trong
năm nhóm sau — cả năm đều **không phải lỗ hổng của feature đang xét**:

| # | Nhóm | Dấu hiệu | Xử lý |
|---|---|---|---|
| **R1** | Lệch pha với tài liệu gốc | Mâu thuẫn thật giữa PRD con (đã duyệt, version mới hơn) và product-definition / dictionary về cùng một quan sát | → **Low**, nhãn *"master-sync"*. Con chi phối ⇒ không ảnh hưởng test. Không chặn |
| **R2** | Spec con tự rõ, chỉ nền domain lệch | PRD con phát biểu dứt khoát; chỉ dictionary/master mâu thuẫn | → **ghi chú phạm vi** (không phải finding của feature); đề nghị sync riêng nền domain |
| **R3** | Nguồn tự đánh dấu "giả định" | Evidence là mục trong design-spec có cảnh báo ⚠️ *"là giả định, cần Designer bổ sung"* | → **ghi chú phạm vi**, không lập finding *(đồng nhất luật AP5)* |
| **R4** | Nhánh phòng vệ bất-khả-đạt | Nhánh guard chỉ chạy trên dữ liệu **ngoài** enum hợp lệ; ca đạt tới được đã có phủ | → **Low**, nhãn *"test-design"* — vấn đề cách mô phỏng dữ liệu, không phải mơ hồ spec |
| **R5** | Greenfield thiếu tech-doc | Thiếu openapi/tech-doc cho hành động lõi ở feature xây mới | → nhãn *"feasibility"* — chặn **tự-động-hoá**, KHÔNG phải khuyết tật nghiệp vụ ở tầng PRD |

> **Mẹo chi phối:** một *pass-through rule* (hệ thống KHÔNG validate gì) làm tan phần lớn
> "mơ hồ" vì không có bề mặt test → hạ mạnh. Ngược lại, drift mà **chính PRD tự flag**, hoặc
> mơ hồ ở **luồng chính có giao diện**, là finding THẬT — giữ nguyên mức.

**Cách ghi:** GIỮ mô tả gốc (audit trail), thêm mục *"Phản biện & Re-rating"* liệt kê lý do
từng thay đổi mức, rồi cập nhật cột mức độ. Finding chuyển hẳn sang "ghi chú phạm vi" thì
đánh dấu rõ — **KHÔNG xoá**.

---

## GIAI ĐOẠN 2 — Bảng thẩm định

Xuất bảng verdict *(không chèn dòng trắng giữa các hàng — dòng trắng làm vỡ bảng Markdown)*:

| ID | Verdict | Test rớt | Bằng chứng thẩm định (mở file nguồn) |
|---|---|---|---|
| … | `✅ VALID` / `❌ INVALID` / `⚠️ RECLASSIFY` / `🔁 MERGE` | T1..T6 / — | trích đúng dòng trong `EVIDENCE_ROOT` chứng minh verdict |

**Số liệu tổng:** tổng verify = N · VALID = a · INVALID = b · RECLASSIFY = c · MERGE = d.

---

## GIAI ĐOẠN 3 — Áp verdict vào `VERDICT_FIELD`

**KHÔNG XOÁ finding nào** — giữ audit trail. Đóng kèm lý do thì kiểm chứng được; xoá thì không.

| Verdict | Áp thế nào |
|---|---|
| `✅ VALID` | giữ nguyên, trạng thái mở |
| `✅ VALID — SYNC` | giữ mở, loại `SYNC`, mức Low–Medium, giao đội spec; phần trả lời để trống |
| `❌ INVALID` | → **đóng**; ghi lý do ngắn + trích nguồn (vd *"Closed — spec đã trả lời tại §BR13: …"*) |
| `⚠️ RECLASSIFY` | → **đóng**; ghi rõ *"Không phải finding nghiệp vụ — [metadata / làm-kỹ-test / tech-UX tự quyết]"* + đề xuất chuyển sang mục việc tương ứng |
| `🔁 MERGE` | → **đóng**; ghi *"Trùng root cause với {id}"* |

Sau khi áp:
1. Cập nhật **tổng số** ở header + bảng **ưu tiên xử lý** — chỉ đếm cái còn mở.
2. Kiểm format bảng Markdown: **không có dòng trắng giữa các hàng**.
3. Nếu artifact có section liệt kê **tài liệu đã đọc**: verifier vừa mở trực tiếp nguồn nên
   đối chiếu lại — file đã dùng làm evidence mà **thiếu** trong bảng, hoặc file liệt kê nhưng
   không tồn tại → sửa cho khớp.

---

## Đầu ra + cam kết

In tóm tắt:

```
[GAP VERIFY] {artifact} — verify {N} finding đang mở:
  ✅ VALID: {a}  |  ❌ INVALID: {b}  |  ⚠️ RECLASSIFY: {c}  |  🔁 MERGE: {d}
  INVALID chi tiết: {id} (evidence bịa), {id} (spec đã trả lời), …
  Sau verify còn {a} finding nghiệp vụ đang mở.
```

**Cam kết cuối — bắt buộc in nguyên văn:**

> *"Đã mở trực tiếp file nguồn trong `{EVIDENCE_ROOT}` để kiểm chứng từng finding — KHÔNG dựa
> vào trường evidence của artifact. Mỗi finding còn mở đều có đủ 2 vế: spec nêu hành vi +
> không tài liệu nào phủ. Không giữ lại finding bịa/sai sự thật."*

Cam kết này **không phải nghi thức**: nó là chỗ duy nhất bước này tự khai đã làm đúng việc
mà không ai kiểm được từ bên ngoài. Không in được cam kết ⇒ chưa chạy đúng bước.

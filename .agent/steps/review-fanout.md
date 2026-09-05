# Review Fan-Out toàn diện + Hội tụ về độ đầy đủ

**Vì sao có cái này:** Một lượt review đơn không bao giờ liệt kê hết mọi vấn đề cùng lúc — model
dừng ở mức "đủ" findings, nên mỗi vòng review sau lại lòi ra vấn đề *mới*
(đập chuột chũi). Quy trình này ép review **hội tụ trong một lần chạy lệnh**:
fan out song song theo các chiều review, rồi lặp một critic độ-đầy-đủ cho tới khi một
vòng không sinh thêm gì mới, *trước khi* ghi file findings.

Lệnh gọi cung cấp hai thứ bắt buộc + hai tuỳ chọn:
- **DIMENSIONS** — danh sách các chiều review để fan out
  (`/refine-prd` → 4 lăng kính; `/review-context` → các P-check hoặc B-check; `/qc-analyze` → 3 lăng kính quét gap).
- **FINDINGS SCHEMA** — dạng YAML mà mỗi finding phải theo (định nghĩa trong lệnh).
- **GRANULARITY** *(tuỳ chọn, mặc định `auto`)* — `auto`: chọn độ mịn fan-out theo bảng ngưỡng kích thước ở Phase 1 (hành vi cũ). `per-uc`: **LUÔN** fan-out theo từng UC, **bỏ qua ngưỡng** — dùng cho review cần độ đầy đủ cao (`/refine-prd` truyền cái này để lần đầu đã quét sâu). Lệnh không truyền → `auto` → hành vi không đổi.
- **CHANGED_SCOPE** *(tuỳ chọn)* — danh sách UC/section đã thay đổi (review **delta**). Nếu được truyền, Phase 1 chỉ fan-out trên các phạm vi này + PRD-global; Phase 2 critic vẫn quét **toàn doc** làm lưới an toàn. Không truyền → quét toàn bộ như thường.
- **VERIFY** *(tuỳ chọn, mặc định `off`)* — `on` chèn **Phase 2.5** (`steps/gap-verify.md`) giữa critic và dedup: mỗi finding phải mở lại tài liệu nguồn tự chứng minh trước khi được giữ. Không truyền → hành vi không đổi.

> **Bỏ qua ở chế độ sub-agent:** Nếu Gate Bước 0 đã set `_agent_mode: true`, toàn bộ
> quy trình này bị **bỏ qua** — orchestrator đã chạy sẵn một dimension/UC cho mỗi
> sub-agent. Chạy các check của lệnh trực tiếp trên section đã giới hạn và trả về findings.

---

## Phase 1 — Quét dimension song song

**Bao nhiêu sub-agent:** *số lượng* agent không phải là đòn bẩy độ đầy đủ — bề rộng được
cố định bởi taxonomy DIMENSION (thêm agent vào cùng một dimension chỉ tìm lại cùng vấn đề),
còn *độ sâu* thuộc về vòng lặp critic ở Phase 2.

**Nếu `GRANULARITY = per-uc`:** **bỏ qua bảng ngưỡng dưới đây**, luôn dùng độ mịn **DIMENSION × phạm vi UC** (kể cả PRD nhỏ) — đảm bảo quét sâu, không bỏ sót ngay lần đầu. (Cái giá: nhiều agent hơn cho PRD nhỏ — chấp nhận để lần đầu đầy đủ.)

**Nếu `GRANULARITY = auto`** (mặc định): chọn **độ mịn fan-out** theo kích thước target, tái dùng ngưỡng của `steps/spawn-agent.md`:

| Kích thước target | Độ mịn | Số agent |
|-------------|-------------|-------------|
| ≤ 3 UC **và** ≤ 300 dòng | một agent cho mỗi DIMENSION trên cả file | = số dimension |
| > 3 UC **hoặc** > 300 dòng | một agent cho mỗi **DIMENSION × phạm vi UC** (các UC + một phạm vi PRD-global), gom batch để vừa giới hạn agent | `dimensions × (UCs + 1)`, có cap (xem dưới) |

Độ mịn lớn hơn giữ context của mỗi sub-agent nhỏ và quét nó vét cạn trên một
UC duy nhất — chính là điều ngăn bỏ sót trên các PRD lớn.

> **Các section global (không thuộc UC) — bắt buộc ở chế độ `DIMENSION × UC`.** Mỗi agent per-UC chỉ
> thấy một UC, nên các section toàn-PRD không thuộc UC nào (scope, success metric,
> problem statement, terminology, glossary, changelog) sẽ không được quét. Khi nào
> fan out theo UC, cũng phải thêm một phạm vi **"PRD-global"** (các section không thuộc UC, finding nhận
> `uc_id: ""`) bên cạnh danh sách UC. Nên số agent tự nhiên là `dimensions × (UCs + 1)`.
> (Không cần ở chế độ whole-file — ở đó mỗi agent đã thấy các section global rồi.)

### Agent cap — gom batch các UC khi fan-out quá rộng

`dimensions × (UCs + 1)` có thể bùng nổ trên PRD lớn (vd 6 check × (8 UC + 1) = 54
agent). Giới hạn mỗi wave ở **`AGENT_CAP = 12`** agent và gom batch các phạm vi UC cho vừa:

1. Dựng danh sách phạm vi = `[UC1, UC2, …, UCn, PRD-global]` (độ dài `UCs + 1`).
   - **Nếu `CHANGED_SCOPE` được truyền (review delta):** danh sách phạm vi = `[các UC trong CHANGED_SCOPE] + [PRD-global]` (chỉ các UC đã đổi + global), KHÔNG phải tất cả UC. Số agent tụt theo đó.
2. Tính số-phạm-vi-mỗi-bucket: `groups = max(1, floor(AGENT_CAP / dimensions))`.
   - Nếu `groups ≥ UCs + 1` → không cần batch, chạy một agent cho mỗi `DIMENSION × scope`.
   - Else chia danh sách phạm vi thành `groups` bucket liền kề kích thước xấp xỉ bằng nhau
     (giữ `PRD-global` ở bucket riêng nếu vừa; nếu không thì gắn vào bucket cuối).
     Mỗi agent khi đó xử lý **một DIMENSION trên một bucket UC**.
3. Kích thước wave kết quả = `dimensions × groups ≤ AGENT_CAP`.

Một agent đã batch review nhiều UC cùng lúc — vẫn giới hạn chặt hơn nhiều so với cả
file, nên độ phủ vẫn cao. `AGENT_CAP` là núm chỉnh duy nhất; tăng nếu host cho phép
concurrency nhiều hơn, giảm để tiết kiệm token. Chế độ whole-file (≤ 3 UC) không bao giờ chạm cap.

Spawn các sub-agent đã chọn bằng Agent tool (gửi trong một message duy nhất để chúng
chạy đồng thời). Mỗi sub-agent nhận một **context window mới** và quét phạm vi của nó
chỉ qua **một** dimension duy nhất — độ phủ sâu hơn một session phải tung hứng mọi
dimension cùng lúc (tránh lost-in-the-middle).

Template prompt cho sub-agent (điền vào các ngoặc):

```
You are a {DIMENSION_NAME} reviewer. Read the full target file at {target_file}.
Scope: review ONLY through the {DIMENSION_NAME} lens/check — {DIMENSION_DESCRIPTION}.
Be exhaustive: scan every section, every UC, every AC/BR/scenario. Do not stop early.
Project context (terminology, entities, architecture):
{slim_context — banned terms, canonical entities, layer order, domains}

Return a JSON array of findings, each:
{ "dimension": "{DIMENSION_NAME}", "severity": "critical|major|minor",
  "section": "...", "uc_id": "...", "quote": "<verbatim ≤120 chars>",
  "finding": "...", "suggestion": "...", "auto_fixable": true|false }
Return [] if this dimension is clean. Return ONLY the JSON array.
```

Gom mảng findings của mọi sub-agent vào một danh sách hợp nhất `ALL_FINDINGS`.

---

## Phase 2 — Vòng lặp hội tụ critic độ-đầy-đủ

Đây là bước chống đập-chuột-chũi. Lặp cho tới khi **hai vòng liên tiếp thêm 0 finding
mới**, hoặc tới cap cứng **3 vòng**, cái nào đến trước:

> **Lưu ý delta:** kể cả khi `CHANGED_SCOPE` giới hạn Phase 1 vào các UC đã đổi, completeness-critic ở Phase 2 **vẫn đọc TOÀN bộ doc** — đây là lưới an toàn bắt các vấn đề mà một fix ở UC đã đổi có thể làm lộ ra ở chỗ khác.

1. Spawn một sub-agent **completeness-critic** bằng Agent tool. Cho nó:
   - toàn bộ target file (`{target_file}`),
   - danh sách findings đã ghi nhận dưới dạng **slim JSON** — chỉ 3 fields cốt lõi
     đủ để critic nhận ra trùng lặp (không cần `quote`, `suggestion`, `auto_fixable`, `severity`):
     ```json
     [
       { "uc_id": "...", "section": "...", "finding": "..." },
       ...
     ]
     ```
     Nếu `ALL_FINDINGS` vượt 60 items, rút gọn `finding` xuống còn 80 ký tự đầu mỗi item.
   - cùng slim context (banned terms, canonical entities, layer order, domains).
   Prompt nó:
   ```
   Here is a document and a list of issues already found. Read the WHOLE document.
   List ONLY real, additional issues NOT already in the list — gaps, ambiguities,
   contradictions, missing edge/negative paths, coverage holes, terminology drift,
   structural omissions, and any issue that a fix to an existing finding would expose.
   ALSO flag ROLE-BOUNDARY / altitude violations (you are NOT limited to adding detail):
   content sitting in the WRONG section — detailed mechanism (retry counts, timeouts, flag
   names/owners, error branches) written INSIDE an acceptance criterion or a scope line
   instead of the Business Rule/Logic section; an AC that merely restates its referenced BR
   (same content, converged); a term definition crammed into In/Out Scope. For these, the
   suggestion must be to MOVE the detail to its proper section (AC keeps only the observable
   outcome + BR ref) — NOT to delete it, and NOT to add more detail.
   Do NOT repeat anything already listed. Return the same finding JSON shape, or [] if
   nothing new.
   ```
2. Thêm bất kỳ finding thực sự mới (chưa có trong `ALL_FINDINGS`) vào danh sách.
3. Nếu vòng này trả 0 finding mới → tăng bộ đếm dry-round; ngược lại reset về 0.
4. Dừng khi bộ đếm dry-round đạt 2, hoặc sau tổng cộng 3 vòng.

Ghi lại `convergence_rounds` (số vòng critic đã chạy) cho report.

---

## Phase 2.5 — Thẩm định *(chỉ chạy khi `VERIFY = on`)*

**Vì sao có bước này.** Phase 1 và Phase 2 chỉ có **một chiều lực**: fan-out mở rộng bề
ngang, critic lặp cho tới khi không còn gì mới — cả hai đều hỏi *"còn thiếu gì nữa?"*.
Không có gì hỏi ngược lại *"cái vừa tìm ra có thật không?"*. Nên quy trình này đẩy **recall**
lên mà **không có gì kéo precision lại**, và càng lặp critic thì tỉ lệ finding bịa càng cao —
đúng thứ nó tự sinh ra: khẳng định hành vi tài liệu không nêu, trích evidence sai, hoặc gắn
nhãn vấn đề cho thứ thực ra là chuyện làm-kỹ-hơn.

Chạy `steps/gap-verify.md` trên `ALL_FINDINGS` với:
- `FINDINGS` = `ALL_FINDINGS` (sau Phase 2)
- `EVIDENCE_ROOT` = `{paths.specs_dir}` — hoặc giá trị lệnh gọi chỉ định
- `VERDICT_FIELD` = trường trạng thái của FINDINGS SCHEMA mà lệnh định nghĩa
- `RERATE` = `on`

Finding bị `❌ INVALID` / `⚠️ RECLASSIFY` / `🔁 MERGE` **không đi tiếp sang Phase 3** — nhưng
**KHÔNG bị xoá**: chúng vào file findings với trạng thái đóng + lý do, để người đọc kiểm chứng
được vì sao chúng bị loại. Ghi lại số liệu verdict cho report.

> **Chạy TRƯỚC Phase 3, không phải sau.** Dedup và giải quyết xung đột là việc tốn suy luận;
> làm nó trên một tập còn lẫn finding bịa là vừa phí, vừa nguy hiểm — một finding ảo có thể
> "thắng" một finding thật ở bước giữ-cái-severity-cao-hơn.

---

## Phase 3 — Dedup, giải quyết xung đột, merge

Các sub-agent chạy **mù với nhau** (độc lập = độ phủ đa dạng). Chúng không bao giờ
trao đổi hay điều hoà giữa chúng — mọi xử lý trùng/xung đột diễn ra **ở đây trong
orchestrator**, nơi thấy toàn bộ tập findings.

1. **Khử trùng lặp** `ALL_FINDINGS`: hai finding là trùng nếu cùng nhắm tới cùng
   `section` + `uc_id` và mô tả cùng một vấn đề gốc. Giữ cái có `suggestion`
   phong phú hơn; nếu khác nhau về severity, giữ severity **cao hơn**.
2. **Giải quyết xung đột** — nhóm các finding còn lại theo `section` + `uc_id` và kiểm tra
   mâu thuẫn (hai finding có `suggestion` không thể cùng áp dụng, hoặc đề xuất sửa ngược nhau cho cùng một chỗ):
   - Nếu hai đề xuất có thể **merge** thành một bản sửa mạch lạc → merge thành một finding duy nhất.
   - Nếu chúng **loại trừ lẫn nhau** → phát ra **một** finding nêu cả hai phương án
     và set `auto_fixable: false` với `status: "needs_discussion"` (PRD) /
     `status: "pending"` (review) để con người chọn — không bao giờ âm thầm bỏ một bên.
   - Nếu một finding bị **vô hiệu** bởi finding khác (vd một finding cấu trúc nói một section
     bị thiếu, nhưng một finding khác trích dẫn nội dung từ chính section đó) → bỏ cái không hợp lệ.
3. **Sắp xếp** theo severity (critical → major → minor), rồi theo thứ tự `section` trong file.
4. **Gán ID ổn định** `F001, F002, …` theo thứ tự đã sắp đó.
5. Map `dimension` của mỗi finding vào field schema của lệnh
   (`lens` cho `/refine-prd`; `check_id` cho `/review-context`).
6. Ghi **một** file findings duy nhất theo FINDINGS SCHEMA mà lệnh định nghĩa.

Trong report cuối của lệnh, thêm một dòng:
```
Convergence: {convergence_rounds} vòng critic — file findings đã đầy đủ; chạy lại sẽ lòi ra 0 vấn đề mới.
```

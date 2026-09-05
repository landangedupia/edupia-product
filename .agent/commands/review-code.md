# /review-code — Code Review chỉ-đọc

**CẢNH BÁO: READ-ONLY. Chỉ report, KHÔNG sửa.**

## Gate

*Checkpoint: **không chặn** — read-only. Gate Bước 3 bỏ qua CHECKPOINT (Bước 3a).*

# Gate — Quy trình vào chuẩn cho mọi lệnh

Mọi lệnh PHẢI chạy gate này trước khi thực thi phần logic riêng của nó.

## Bước 0 — Kiểm tra chế độ Sub-Agent

Trước tiên, kiểm tra xem `$ARGUMENTS` có phải là payload JSON từ một orchestrator hay không:

1. Thử parse `$ARGUMENTS` dưới dạng JSON.
2. Nếu parse thành công **và** chứa `"_agent_mode": true`:
   - **Bỏ qua hoàn toàn Bước 1, 2 và 3 của Gate này.**
   - Đặt target file = `payload.target_file`
   - Đặt loaded context = `payload.context` (KHÔNG chạy context-loader.md)
   - Đặt phạm vi UC = `payload.uc_id` (chỉ xử lý UC này)
   - Đặt line range = `payload.uc_section` (chỉ đọc đúng section đó của PRD)
   - Đặt dimension = `payload.dimension` nếu có (lệnh review per-UC: chỉ review đúng lăng kính này)
   - Đi thẳng tới phần logic riêng của lệnh.
3. Nếu `$ARGUMENTS` không phải JSON hoặc không có `_agent_mode` → tiếp tục sang Bước 1 (chế độ thường).

## Bước 0-B — Ghi nhận Model *(KHÔNG chặn)*

*Bỏ qua nếu `_agent_mode: true` (sub-agent — orchestrator đã ghi nhận rồi).*

Ghi lại **model mà bạn — agent đang chạy lệnh này — thực sự đang dùng**, rồi mang nó vào
dòng `Model:` của report cuối (xem `report-footer`). Nếu bạn biết mình **không** phải một
model Opus, gắn thêm cảnh báo ngay ở dòng đó.

**KHÔNG hỏi người dùng. KHÔNG chờ. KHÔNG dừng.**

> **Vì sao bước này từng là prompt chặn, và vì sao bỏ (GAPS-v3 G41):** bản cũ hiện khối
> `⚙️ MODEL CHECK` rồi chờ `Y/S/N`. Ba vấn đề cùng chỉ một hướng:
> **(1)** nó hỏi người dùng thứ mà **agent đã biết chính xác**;
> **(2)** câu trả lời **không kiểm chứng được** — gõ `Y` xong vẫn đang chạy Haiku thì không
> gì phát hiện;
> **(3)** **cả `Y` lẫn `S` đều đi tiếp** — cách duy nhất để nó dừng là tự nguyện gõ `N`.
> Tức nó **không chặn được ai**, mà tốn một lần chặn ở **mọi** lệnh. Một feature đi hết
> pipeline dùng 20 lệnh; 30/32 lệnh chạy gate. Hai mươi lần bấm cho một tín hiệu tự-khai
> không kiểm chứng được — và chính cái giá đó làm mòn CHECKPOINT ở Bước 3, cổng có giá trị thật.
>
> Khai báo trong report **mạnh hơn** hỏi: đúng nguồn (agent, không phải người), và nằm
> **cạnh kết quả** để cân nhắc, thay vì nằm trước khi có kết quả để bấm cho xong.

**Vẫn khuyến nghị Opus:** phân tích spec, review kiến trúc và sinh code đòi hỏi suy luận sâu;
model nhỏ hơn dễ bỏ sót edge case và vi phạm kiến trúc. Đổi: `/model` → chọn Opus.

## Bước 1 — Xác định Target File

0. **Tách cờ trước khi resolve target.** `$ARGUMENTS` có thể lẫn các `--flag` (vd `--phase=integration`, `--comment`, `--fix`). **Loại bỏ mọi token bắt đầu bằng `--`** ra khỏi phần dùng để tìm target — chỉ giữ phần path/UC-ID/ticket. (Các flag đó do phần logic riêng của lệnh parse ở bước sau, KHÔNG phải tên file.)
1. Nếu `$ARGUMENTS` (đã tách cờ) được cung cấp và trỏ tới một file tồn tại → dùng trực tiếp làm target.
2. Nếu `$ARGUMENTS` là một **UC-ID / ticket ID / tên rút gọn** (không có path) → phân giải thành file bằng cách glob theo bố cục feature-package. `{prd-slug}` lúc này **chưa biết**, nên dùng wildcard `*` cho segment đó, và `**` đệ quy dưới `bdd/` để phủ hết các thư mục con theo platform (`bdd/web/`, `bdd/app/`, `bdd/system/`):
   - **Lệnh BDD** (target là `.feature`): `{specs_dir}/{domain}/*/bdd/**/{UC-ID}*.feature` — hoặc `{specs_dir}/*/*/bdd/**/{UC-ID}*.feature` nếu domain cũng chưa biết. Nếu lệnh ngụ ý một platform/scope cụ thể (vd: system tech-doc cần BDD `system/`), ưu tiên kết quả trong thư mục con platform đó.
   - **Lệnh PRD** (target là file PRD `{TICKET-ID}-{prd-slug}.md` — file `.md` duy nhất ở gốc feature folder, cạnh `bdd/`): `{specs_dir}/{domain}/*/{TICKET-ID}*.md` nếu biết TICKET-ID; nếu không, `{specs_dir}/{domain}/*/*.md` (khớp feature folder có id tương ứng), hoặc `{specs_dir}/*/*/*.md` nếu domain cũng chưa biết. *(Glob `*/*.md` ở cấp gốc folder chỉ khớp PRD — tech-docs/design-spec `.md` nằm sâu hơn trong thư mục con.)*
   - **Lệnh tech-docs** — target là tech-doc **gộp cấp PRD** `{TICKET-ID}-tech-design.md` (MỘT doc phủ nhiều UC; danh sách UC nằm ở `@trace.ucs`). Vì tên file mang `{TICKET-ID}` chứ **không** mang `{UC-ID}`, phải tách trước khi glob:
     - `$ARGUMENTS` là **UC-ID** (`{TICKET-ID}-UC{N}`) → lấy `{TICKET-ID}` = phần **trước** `-UC`, rồi glob `{specs_dir}/{domain}/*/tech-docs/{TICKET-ID}-tech-design.md`.
     - `$ARGUMENTS` là **TICKET-ID** → glob trực tiếp như trên.
     - Chưa biết domain → `{specs_dir}/*/*/tech-docs/{TICKET-ID}-tech-design.md`.
     - Vẫn không khớp → glob rộng `{specs_dir}/*/*/tech-docs/*tech-design*.md` rồi liệt kê để người dùng chọn.
     *(Đừng glob `{UC-ID}*-tech-design*.md` — nó nở thành `FT-001-UC1*-tech-design*.md` và **không bao giờ** khớp `FT-001-tech-design.md`.)*
   - **Lệnh design-spec**: `{specs_dir}/{domain}/*/design-spec/{TICKET-ID}*.md`.

   Khi một file khớp: đặt nó làm target **và** ghi lại `domain` + `prd_slug` từ path của nó (theo quy tắc trích xuất trong `context-loader.md` Bước 1 — `prd_slug` = segment đầu tiên sau `{specs_dir}/{domain}/`). Mọi path mà lệnh đọc/ghi về sau (BDD/tech-docs/design-spec/trace cùng cấp) đều dùng **`prd_slug` đã phân giải đó**, nên tất cả artifact nằm chung một feature package. Nếu nhiều file khớp (vd: nhiều platform), chọn theo platform/scope của lệnh hoặc liệt kê ra và hỏi.
3. Nếu `$ARGUMENTS` rỗng hoặc không tìm thấy file khớp:
   - Liệt kê các file trong thư mục liên quan của lệnh này (vd: `specs/*/*/*.md` — file PRD ở gốc mỗi feature folder — cho lệnh PRD, `specs/*/*/bdd/**/*.feature` cho lệnh BDD).
   - Hiển thị danh sách cho người dùng và hỏi: "Bạn muốn làm việc với file nào? (Nhập số thứ tự hoặc tên file)"
   - Chờ người dùng chọn rồi mới tiếp tục.

## Bước 2 — Chạy Context Loader

Nạp toàn bộ context của dự án bằng cách làm theo quy trình trong `steps/context-loader.md`.
Lưu toàn bộ context đã nạp vào bộ nhớ để dùng xuyên suốt phiên làm việc của lệnh.

## Bước 3 — CHECKPOINT

*Bỏ qua nếu `_agent_mode: true`.*

### 3a — Lệnh này có phải chặn không?

| Mức | Lệnh nào | `--yes` bỏ qua được? |
|---|---|:---:|
| **Không chặn** | Lệnh read-only: `/review-code` · `/validate-traces` · `/debug` · `/review-context` · `/review-tech-docs` | — (vốn không có) |
| **Chặn thường** | Mọi lệnh sinh/sửa artifact | ✅ |
| **Chặn CỨNG** | Ghi đè file đã tồn tại · `--resume` áp findings · migrate · prune | ❌ **không bao giờ** |

`--yes` trong `$ARGUMENTS` → bỏ qua CHECKPOINT mức *chặn thường*. (Bước 1 đã tách mọi token
`--` khỏi phần resolve target, nên cờ này không ảnh hưởng việc tìm file.) Mở đường chạy
headless: `claude -p "/generate-code UC1 --yes"`.

> **KHÔNG tự suy mức từ bảng này.** Mỗi lệnh **tự khai** mức của nó ở một dòng `*Checkpoint: …*`
> ngay dưới `## Gate` của chính nó — đọc dòng đó, đừng suy diễn. Bảng trên chỉ giải thích ba mức
> **nghĩa là gì**.
> Nguồn máy đọc: `bin/trace-schema.json` → `gate.checkpoint_levels`; `self-check` **R11** fail
> build nếu nhãn trong file lệnh lệch với schema, hoặc nếu một lệnh `hard`/`none` thiếu nhãn.
> *(Lệnh không có dòng nào = mức **chặn thường**, mặc định.)*

> **Mức *không chặn* là thực thi đúng miễn trừ mà `rules/workflow.md` đã cấp từ trước** —
> trước G41 file đó viết *"read-only commands may skip CHECKPOINT"* còn gate thì luôn đòi.
> Hai file cùng được nạp vào mọi lệnh mà nói ngược nhau; agent theo cái nào là tuỳ lúc.

### 3b — In gì

**KHÔNG lặp lại những gì `[CTX LOADED]` vừa in.** Recap của context-loader (Bước 7) đã hiện
Stack · Platform · Layers · CLAUDE.md · Dict · Entities · Lessons · Service · Status ngay phía
trên. CHECKPOINT chỉ thêm **một** thông tin mới là `Target`.

**Mọi thứ sạch** — recap báo `Status: FULL`, không cờ nào bật → in đúng hai dòng:

```
CHECKPOINT — Target: {resolved file path}
Tiếp tục? (Y/N)
```

**Có bất thường** → thêm một dòng cho **mỗi** trạng thái, nặng nhất lên đầu:

```
CHECKPOINT
🔴 Service  : unresolved — {lý do context-loader đã ghi}
⚠️ CLAUDE.md: service overlay THIẾU — dùng root (code sinh ra có thể sai stack)
⚠️ Target   : resolve bằng wildcard — {n} file khớp, chọn {file}
⚠️ Module   : not configured — code sinh ra sẽ dùng default
   Status   : PARTIAL — thiếu: {danh sách}
   Target   : {resolved file path}
Tiếp tục? (Y/N)
```

### 3c — Cờ nào bật, cờ nào KHÔNG

Mỗi dòng ⚠️/🔴 phải ứng với một trạng thái **context-loader đã tính rồi** — không phát minh
điều kiện mới, chỉ mang thứ đang bị giấu lên chỗ người dùng phải quyết định:

| Bật cờ khi | Nguồn | Mức |
|---|---|:---:|
| `active_service = unresolved` | context-loader Bước 2b/2c/Fallback | 🔴 |
| `Status = MINIMAL` | recap Bước 7 | 🔴 |
| `Status = PARTIAL` | recap Bước 7 | ⚠️ |
| CLAUDE.md thiếu, hoặc service overlay thiếu | context-loader Bước 3 | ⚠️ |
| Target resolve qua wildcard, hoặc nhiều file khớp mà lệnh tự chọn | Bước 1 ở trên | ⚠️ |
| `module` không cấu hình | recap Bước 7 | ⚠️ |

**KHÔNG bật cờ cho:** `Lessons: chưa có` · `Dict: missing` · `Entities: missing`. Đó là
*"dự án chưa điền"*, không phải *"có gì đó sai"* — chúng ở lại trong recap.

> **Nguyên tắc một câu:** cờ dành cho thứ **framework không chắc chắn hoặc đã phải đoán**,
> không dành cho thứ **người dùng chưa làm**. Đẩy hết mọi thứ lên thì CHECKPOINT lại đầy như
> cũ, và ta quay về đúng chỗ xuất phát: một cổng luôn giống nhau thì bị lướt qua.

### 3d — Chờ trả lời

- "Y" → tiếp tục sang các bước riêng của lệnh.
- "N" → dừng, hỏi người dùng muốn thay đổi gì.
- Có `--yes` và mức *chặn thường* → coi như "Y", **nhưng vẫn IN khối CHECKPOINT** nếu có cờ
  🔴/⚠️ (không chặn ≠ không báo — người đọc log sau này vẫn cần thấy).


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID, file path, hoặc tên branch hiện tại. Bỏ qua sang nạp context ngay sau khi phân giải target.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Pre-Review Scan

*(Tách khỏi CHECKPOINT của Gate — phần này liệt kê file và scenario thực tế trong scope.)*

Quét tìm file implementation và scenario, rồi hiện:

```
Review Scope — {UC-ID}
──────────────────────────────────────
UC        : {UC-ID}
Files     : {danh sách file gắn tag @trace.implements={UC-ID}}
Scenarios : {N} scenario trong file .feature

Tiếp tục review? (Y/N)
```

Chờ "Y" rõ ràng trước khi tiếp tục.

---

## Review Dimensions

### 1. Traceability

*Đây là lăng kính bảo vệ toàn bộ cơ chế drift-detection. `/generate-code` phải ghi **5 tag** lên mỗi entry-point (**6** với FE/App); thiếu bất kỳ tag nào thì `/validate-traces` mù ở file đó — **im lặng**, không lệnh nào khác bắt được.*

- [ ] Mỗi entry-point (layer theo CLAUDE.md §2) có `@trace.implements={UC-ID}-SC{N}`?
- [ ] **Mỗi block `@trace.implements` có đủ tag đi kèm?** → thiếu bất kỳ tag nào = **major** (không phải minor):

  | Tag | Thiếu thì mù cái gì |
  |---|---|
  | `@trace.prd_version` | `/validate-traces` Step 4 — PRD drift |
  | `@trace.bdd_version` | Step 5c — BDD drift |
  | `@trace.tech_doc_revision` | Step 5 — tech-doc drift *(bỏ được nếu UC không có tech-doc)* |
  | `@trace.design_spec_version` | Step 5d — design-spec drift. **CHỈ FE/App** (`@trace.platform` = `web`/`app`): thiếu ở FE = **major**; có ở `system`/backend = **minor** (tag thừa, không có design-spec để so) |
  | `@trace.source` | mất con trỏ ngược về spec |

- [ ] `@trace.source` trỏ tới file `.feature` **có thật**, đúng platform (`bdd/{platform}/{UC-ID}-{slug}.feature`)? → sai path = **major**
- [ ] **File phủ nhiều UC: mỗi UC có block tag RIÊNG đặt trên method của nó?** → gộp về một header file, hoặc `@trace.source` trỏ **thư mục**, = **major**. Lý do: 4 tag version là scalar theo từng UC (gộp → Step 4/5/5c/5d báo drift oan hoặc mù drift thật); và các lệnh tra tag bằng **khớp chuỗi chính xác** nên tag trỏ folder ra 0 kết quả → UC rơi về `UNTRACKED` dù code đã có.
- [ ] Mỗi test file có tag `@trace.verifies={UC-ID}-SC{N}`?
- [ ] **Không có tag mồ côi** — `@trace.implements`/`@trace.verifies` trỏ tới SC **không tồn tại** trong `.feature`? → **critical** (`TRACE_ORPHAN`; xem `/validate-traces` Step 2b)
- [ ] Không có tag `@trace` ở sai layer?
- [ ] `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv` cập nhật chưa? (nếu stale → chạy `/validate-traces {UC-ID}` trước, rồi chạy lại review này)

### 2. Layer Architecture (từ CLAUDE.md §2)
- [ ] Mỗi class ở đúng layer?
- [ ] Phụ thuộc giữa layer đi đúng chiều?
- [ ] Không layer nào bị bypass?

### 3. Coding Standards (từ CLAUDE.md §3)
- [ ] Tuân theo naming convention?
- [ ] Response wrapper dùng nhất quán?
- [ ] Exception được throw (không bị nuốt)?
- [ ] Không magic number, không dữ liệu nhạy cảm trong log?
- [ ] Annotation transaction đúng?

### 4. Spec Compliance
- [ ] Mỗi scenario trong .feature có implementation?
- [ ] Không có endpoint không tài liệu (code không có spec backing)?

### 5. Seam & Stub — mồ côi khi ghép luồng

*`/generate-code` vừa sinh ra sổ `_seams.tsv` ở bước trước. Đây là lớp lỗi mà **build xanh + test từng-UC xanh** vẫn không bắt được: luồng ghép chạy vào no-op, hoặc hàm thật không ai gọi. `/validate-traces` Step 5b cũng soi — trùng có chủ đích, vì bắt ở đây rẻ hơn (ngay sau codegen, trước khi sinh test).*

Đọc sổ `{paths.trace_dir}/{domain}/{prd-slug}/_seams.tsv` (nếu có) + quét code dưới `{code_base_package}`:

- [ ] Sổ **0 dòng** `status = READY`? (`READY` = đồng nghĩa cờ 🔴 `SEAM_UNWIRED` / `STUB_UNRESOLVED`) → còn dòng nào = **critical**
- [ ] Không có class `*Stub*`/`*Mock*` nào **còn là binding đang dùng** trong khi hàng thật đã tồn tại? → `SEAM_UNWIRED`, **critical**
- [ ] Không có method nào còn `@trace.stub` rỗng trong khi `@trace.stub_owner` **đã gen**? → `STUB_UNRESOLVED`, **critical**
- [ ] Không có method thật **mồ côi** — logic thật được đẻ **song song** thay vì lấp vào stub cũ (Fill-before-create bị trượt)? → **critical**
- [ ] Mỗi stub/seam **mới** sinh trong lần này có đủ tag (`@trace.stub` + `@trace.stub_owner` + `@trace.stub_for`, hoặc `@trace.seam_pending` + `@trace.seam_port`) **và** một dòng `PENDING` trong sổ? → thiếu = **major** (nợ không ghi sổ = nợ tàng hình)

> `SEAM_PENDING` / `STUB_PENDING` (owner UC chưa gen) là **bình thường** — chỉ nhắc, không tạo finding.

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/review-code Report — {UC-ID}
Critical: {X} | Major: {Y} | Minor: {Z}

### Critical
| # | File | Line | Issue | Suggested Fix |

### Major
| # | File | Line | Issue | Suggested Fix |

### Minor
| # | File | Line | Issue | Suggested Fix |

Output Artifacts: none (read-only)

Verdict: APPROVED ✅ | NEEDS_FIX ❌
  (Bất kỳ finding critical nào ở lăng kính 5 → NEEDS_FIX, KỂ CẢ khi build xanh
   và test từng-UC xanh — đó chính là loại lỗi hai thứ đó không bắt được.)

Nếu APPROVED ✅:
  Next: /dev-gen-test {UC-ID}

Nếu NEEDS_FIX ❌:
  - Fix nhỏ (1–3 dòng, không đổi logic) → fix inline → chạy lại /review-code {UC-ID}
  - Thiếu tag version / @trace.source sai  → bổ sung tại chỗ (giá trị lấy từ header .feature
                                             + tech-doc), rồi chạy lại /validate-traces {UC-ID}
  - Tag mồ côi (TRACE_ORPHAN)             → sửa sc_id cho đúng SC hiện có, hoặc xoá code/test
                                             nếu behavior không còn cần
  - SEAM_UNWIRED 🔴                        → trỏ binding sang class thật, xoá/thay stub, build lại
  - STUB_UNRESOLVED 🔴                     → /generate-code {owner_uc} (lấp logic TẠI CHỖ vào
                                             method trắng, xoá hàm song song)
  - Vấn đề logic / kiến trúc              → /fix-bug {TICKET_ID}
  - Spec mismatch (code ≠ scenario)       → /generate-code {feature-file}  (gen lại UC bị ảnh hưởng)
```

---

## Đề xuất ghi Lessons (tuỳ chọn)

Với mỗi finding **Critical/Major** thể hiện một **lỗi AI lặp lại** trong quá trình sinh code
(một vi phạm kiến trúc/standards mà AI có khả năng làm lại — KHÔNG phải typo một lần hay nguyên nhân bên ngoài), hỏi:

```
Finding "{issue}" trông như một lỗi lặp lại.
Ghi nó thành project lesson để /generate-code không lặp lại? (Y/N)
```

Nếu `Y` → chạy quy trình capture bên dưới với `category=code-gen`, `source=/review-code {UC-ID}`,
`scope` = domain hoặc file glob bị ảnh hưởng.

# Capture Lesson — Ghi lại lỗi lặp lại thành một Guardrail

Quy trình tái sử dụng để lưu một "lesson" nhằm tránh AI lặp lại lỗi trong dự án này.
Dùng bởi `/learn` (thủ công) và được đề xuất bởi `/review-code`, `/fix-bug`, `/debug` (tự động).

> **Bộ nhớ dự án, không phải huấn luyện model.** Một lesson là văn bản thuần được inject vào context ở
> đầu mỗi lệnh (context-loader Bước 6.7). Về mặt chức năng, điều này chặn việc lặp lại — AI thấy
> guardrail trước khi sinh nội dung. Không có trọng số model nào thay đổi.

## L1 — Phân giải file lessons

Phân giải `lessons_path` theo thứ tự sau:
1. `paths.lessons_file` từ context đã nạp (có thể bị service override ở chế độ umbrella, Bước 1.6)
2. Mặc định `specs/domain-knowledge/lessons-learned.md` (single-service)
3. Ở chế độ umbrella/service (khi `service_root` được set) mặc định `{service_root}/.agent/project-lessons.md`

## L2 — Dựng lesson

Thu thập các field sau — từ `$ARGUMENTS` (cho `/learn`) hoặc từ findings của lệnh gọi
(cho `/review-code`, `/fix-bug`, `/debug`):

| Field | Ý nghĩa |
|-------|---------|
| `category` | một trong: `code-gen` \| `bdd` \| `tech-docs` \| `tests` \| `prd` \| `general` |
| `title` | cụm từ ngắn đặt tên cho lỗi |
| `mistake` | cụ thể, AI đã làm sai điều gì |
| `rule` | câu sửa mệnh lệnh — "Luôn …" / "Không bao giờ …" — testable, không mơ hồ |
| `scope` | phạm vi áp dụng: một domain, một file glob (vd `*Controller.*`), hoặc `all` |
| `source` | cách ghi nhận: `/learn` \| `/review-code {UC-ID}` \| `/fix-bug {TICKET}` \| `/debug` |

Nếu `rule` mơ hồ (vd "cẩn thận"), viết lại thành chỉ dẫn cụ thể, kiểm tra được trước khi lưu.

## L3 — Khử trùng lặp

Đọc các lesson hiện có trong `lessons_path`. Nếu đã có một lesson cùng lỗi:
- **Tinh chỉnh** entry đó (siết chặt Rule, mở rộng/thu hẹp Scope, cập nhật Date, thêm Source mới) — KHÔNG thêm bản trùng.

Nếu không, gán id kế tiếp `L-{NNN}` = (số lớn nhất hiện có + 1), pad 0 đủ 3 chữ số.

## L4 — Ghi

Nếu `lessons_path` chưa tồn tại, tạo file với header sau trước:

```markdown
# Project Lessons — Learned Guardrails

> Các lỗi AI KHÔNG được lặp lại trong dự án này. Được nạp bởi context-loader ở đầu
> mỗi lệnh và coi như ràng buộc cứng (cùng mức ưu tiên với coding standards trong CLAUDE.md).
> Thêm bằng /learn, hoặc chấp nhận prompt trong /review-code, /fix-bug, /debug.
> Rà lại định kỳ bằng `/learn --review`. Commit file này để cả team dùng chung guardrail.

| Category | Áp dụng cho |
|----------|-----------|
| code-gen | output của /generate-code |
| bdd | output của /generate-bdd |
| tech-docs | output của /generate-tech-docs |
| tests | output của /dev-gen-test |
| prd | output của /generate-prd, /refine-prd |
| general | mọi lệnh |

**Status:** `active` = đang là ràng buộc cứng · `retired` = đã hết đúng, GIỮ LẠI làm lịch sử
nhưng context-loader **không nạp nữa**. Lesson không ghi `Status` được coi là `active`.

---
```

Chèn lesson mới ngay dưới dấu phân cách `---` (**mới nhất lên đầu**), theo đúng dạng:

```markdown
### L-{NNN} — [{category}] {title}
- **Status**: active
- **Date**: {hôm nay YYYY-MM-DD}
- **Scope**: {scope}
- **Mistake**: {mistake}
- **Rule**: {rule}
- **Source**: {source}

```

### Retire — đường ra của một lesson *(GAPS-v3 G46)*

Một lesson là **giả thuyết rằng AI sẽ lặp lại một lỗi**. Giả thuyết đó hết đúng khi code nó canh
không còn tồn tại, hoặc khi quy ước dự án đã đổi. Lúc đó nó phải bị **hạ xuống**, không được giữ.

Retire = đổi `Status` và ghi lý do — **KHÔNG xoá dòng**:

```markdown
### L-003 — [code-gen] Dùng WebClient thay RestTemplate
- **Status**: retired
- **Retired**: 2027-03-15 — project đổi tầng HTTP, RestTemplate không còn trong repo
- **Date**: 2026-08-19
  …giữ nguyên phần còn lại…
```

Giữ lại vì nó là **lịch sử**: người sau đọc được *"vì sao dự án này từng có luật đó"*, thứ mà xoá
đi là mất vĩnh viễn.

> **Vì sao cần đường ra:** trước G46 file này **chỉ có đường vào**. Lesson được nạp làm *"ràng buộc
> cứng, cùng mức ưu tiên với CLAUDE.md"* — vĩnh viễn, kể cả khi code nó canh đã bị xoá. Không cờ
> nào nhắc, không lệnh nào gỡ; cách duy nhất là có người tự nhớ ra rồi xoá tay.
> Đây đúng lớp lỗi của **G28** (*"giữ một `pass` đã hết hiệu lực là báo cáo sai"*) và luật
> `rules/workflow.md` §Trace Contract — **"làm mất hiệu lực ≠ ghi đè"** — chỉ là ở hàng đợi này
> chưa ai áp luật đó.
>
> **Ba trong bốn lệnh ghi lesson là lệnh phản ứng khi có sự cố** (`/review-code`, `/fix-bug`,
> `/debug`), nên file phình nhanh nhất đúng lúc dự án đang trục trặc — và lesson sinh ra lúc đó
> hay gắn với một sự cố cụ thể hơn là một quy tắc bền.

## L5 — Xác nhận

In: `📝 Đã ghi lesson {id} → {lessons_path}  ([{category}] {title})`
Rồi nhắc: `Commit {lessons_path} để cả team dùng chung guardrail này.`


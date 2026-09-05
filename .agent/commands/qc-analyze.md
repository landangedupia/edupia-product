---
version: 1.0
updated: 2026-06-11
ported_from: ai-automation-qc-base
---

# /qc-analyze — QC Requirement Analysis

> Stage 1 của QC automation pipeline native (qc-analyze → qc-plan → qc-design-test → qc-review → qc-run-test → qc-report). Port từ qa-analyst của team QC. Markdown-first: không có script ở đây.

## Gate

*Checkpoint: **chặn thường** — lệnh ghi 2 file artifact. `--yes` bỏ qua được (gate Bước 3a).*

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một **TICKET-ID** (mã PRD), hoặc một UC-ID / file feature / file PRD — cả ba đều quy về TICKET-ID ở §Phạm vi QC. Trạm này chạy cho **cả PRD × một nền**. Đọc spec chính thức của **mọi UC trong phạm vi** — file `.feature` (mang `@trace.id={UC-ID}` và mỗi scenario `@trace.scenario={UC-ID}-SC{N}`), PRD, và design-spec — từ feature package `{paths.specs_dir}/{domain}/{prd-slug}/` (file `.feature` dưới `bdd/`, file PRD `{TICKET-ID}-{prd-slug}.md` ở gốc folder, và design-spec dưới `design-spec/`). Spec của framework CHÍNH LÀ source of truth; đừng suy lại các requirement đã có ở đó. **Ngoài ra đọc tech-doc gộp** `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md` làm **nguồn thứ hai** — xem §Đối chiếu tài liệu kỹ thuật.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Phạm vi QC — PRD nào, nền nào, những UC nào

# QC Scope — phân giải phạm vi cho mọi lệnh `qc-*`

**Chạy TRƯỚC phần logic riêng của lệnh, và SAU `steps/gate.md`.** Bước này chốt bốn thứ mà
cả 6 trạm QC đều cần, để chúng không tự suy mỗi trạm một kiểu:

| Biến | Là gì |
|---|---|
| `TICKET-ID` | mã PRD — **thư mục artifact QC mang tên này** |
| `active_platform` | `web` \| `app` \| `system` \| … — một QC pass khoá đúng MỘT nền |
| `qc_artifact_dir` | `{paths.qc_dir}/{TICKET-ID}/{active_platform}/` |
| `uc_list` | các UC của (PRD × nền) này, kèm trạng thái BDD từng UC |

> **Vì sao gom về một chỗ.** Luật phân giải nền từng được copy-paste ở 5 lệnh và câu chữ đã
> lệch nhau. Năm bản của một luật là nơi drift sống: sửa bốn, quên một, và trạm bị quên ghi
> artifact vào sai thư mục **trong im lặng**.

---

## 1 — `TICKET-ID`

Artifact QC gom theo **PRD**, không theo UC. Nên mọi trạm phải quy được về `TICKET-ID`:

| `$ARGUMENTS` là | Cách lấy |
|---|---|
| **UC-ID** (`{TICKET-ID}-UC{N}`) | phần **trước** `-UC` — đúng luật `steps/gate.md` Bước 1 dùng để tìm tech-doc gộp |
| **TICKET-ID** | dùng trực tiếp |
| một **path file** (`.feature` / PRD / design-spec) | phân giải `{domain}` + `{prd-slug}` theo luật `context-loader` Bước 1, rồi lấy `TICKET-ID` từ tên file PRD `{TICKET-ID}-{prd-slug}.md` — file `.md` duy nhất ở gốc feature folder |

Đối chiếu: `TICKET-ID` suy ra phải khớp tên file PRD thật. Lệch → **DỪNG**, in cả hai giá
trị. (Suy sai `TICKET-ID` là ghi cả một PRD vào sai thư mục — không có bước nào phía sau bắt được.)

---

## 2 — `active_platform`

> **PHẢI phân giải TRƯỚC mọi phép đọc `.feature`.** `{UC-ID}-SC{N}` chỉ độc nhất trong
> (UC × nền), nên một UC đa nền có **nhiều file `.feature`** — `bdd/web/`, `bdd/app/`,
> `bdd/system/` — và mỗi file mang `@trace.status` **riêng**: bản web có thể `approved`
> trong khi bản app còn `draft`. Đọc "file `.feature` của UC" khi chưa biết nền là đọc một
> file **bất kỳ trong ba**: báo `approved` trong khi bản đang dùng còn nháp, hoặc chặn oan
> một bản đã duyệt.

Theo thứ tự, dừng ở cái đầu tiên khớp:

1. `$ARGUMENTS` nêu nền (`web`/`app`/`system`/…) → dùng.
2. Target là một file `.feature` → đọc `# @trace.platform` của nó.
3. Glob `{paths.specs_dir}/{domain}/{prd-slug}/bdd/*/` — **đúng một** thư mục nền → dùng nó.
4. Glob `{paths.qc_dir}/{TICKET-ID}/*/` — **đúng một** thư mục nền đã có artifact → dùng nó.
   *(chỉ dùng cho trạm 2–6; trạm `/qc-analyze` là trạm tạo ra thư mục đó nên không có gì để soi.)*
5. Nhiều nền mà không suy được → hỏi *"QC pass này cho nền nào? (web/app/system)"*.
   **Có `--yes`:** không hỏi — DỪNG với lỗi rõ ràng, vì đoán bừa nền là ghi artifact vào sai
   thư mục và ghi `qc_status` vào sai sổ trace:
   ```
   ❌ {TICKET-ID} có {n} nền ({list}) — không suy được nền nào cho QC pass này.
      Chạy headless thì phải nêu tường minh: /{lệnh} {TICKET-ID} web --yes
   ```

Lưu `active_platform`. Từ đây, **mọi** phép đọc `.feature` chỉ đọc thư mục
`bdd/{active_platform}/` — không trộn SC chéo nền.

---

## 3 — `qc_artifact_dir`

```
qc_artifact_dir = {paths.qc_dir}/{TICKET-ID}/{active_platform}/
```

Chứa: `REQUIREMENT_ANALYSIS.md` · `DOC_GAP.md` · `TEST_PLAN.md` · `test-cases/*.Test.md`
— **mỗi loại đúng MỘT file cho cả PRD**, các UC là mục/hàng bên trong.

`{paths.qc_dir}` là folder top-level **nhìn thấy** trong repo QC (mặc định `docs/`, **không**
phải `.agent/` ẩn) để đội QC mở và xử lý output dễ dàng. Spec chính thức ở lại spec submodule
của PO — đừng ghi artifact QC vào đó.

> **Sổ trace KHÔNG theo layout này.** Nó vẫn là `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{active_platform}.tsv`
> — một sổ cho mỗi (UC × nền), vì mỗi hàng là một scenario. Liên kết giữa hai bên đi qua
> **cột `UC`** của bảng gap, không qua đường dẫn file.

---

## 4 — `uc_list`

Glob `{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/*.feature`. Mỗi file → một
UC: đọc `# @trace.id` (mã UC) và `# @trace.status` từ header.

Chia hai nhóm:

| Nhóm | Điều kiện | Xử lý |
|---|---|---|
| **Trong phạm vi** | `@trace.status: approved` | phân tích / thiết kế / chạy bình thường |
| **Chưa xét** | khác `approved` | **KHÔNG** phân tích; vẫn ghi một hàng vào bảng phạm vi kèm trạng thái thật |

In bảng phạm vi ra trước khi làm gì:
```
Phạm vi QC — {TICKET-ID} / {active_platform}
  ✅ {UC-ID}  {tên UC}                     approved
  ⏸  {UC-ID}  {tên UC}                     draft   → chưa xét
  → {n} UC trong phạm vi · {m} chưa xét
```

**Cờ `--include-draft`:** phân tích cả UC chưa duyệt, nhưng **vẫn in bảng trên** và đánh dấu
trong artifact là dựa trên BDD nháp.

**Không UC nào `approved` và không có `--include-draft` → DỪNG:**
```
❌ {TICKET-ID} ({active_platform}): 0/{n} UC có BDD approved — không có gì để chạy.
   Cách đúng: người duyệt đặt `# @trace.status: approved` rồi chạy lại.
   Muốn chạy sớm trên BDD nháp (prototype): thêm --include-draft
```

> **Vì sao có `--include-draft` chứ không chặn cứng.** QC sớm trên BDD nháp là một cách dùng
> **cố ý được cho phép** từ trước (guard cũ là cảnh báo mềm, không phải chặn). Bỏ hẳn nó là
> lấy đi một năng lực đang có mà không ai khai. Còn để mặc định `approved`-only thì cái
> thường gặp là cái an toàn, và cái sớm phải nói ra.

> **Vì sao `--yes` không thay được `--include-draft`.** `--yes` nghĩa *"tôi không ngồi đây để
> trả lời"*; `--include-draft` nghĩa *"tôi biết BDD còn nháp và vẫn muốn chạy"*. Gộp hai cái
> là để một lần chạy headless âm thầm phân tích spec chưa chốt rồi bàn giao như thể đã chốt.


> **QC chạy trên BDD chưa chốt có thể phải làm lại.** `qc-scope` mặc định chỉ lấy UC có
> `@trace.status: approved`; UC còn nháp vẫn vào bảng *Phạm vi phân tích* của `DOC_GAP.md`
> với dấu `⏸ Chưa xét` — **không im lặng bỏ khỏi bảng**, vì "chưa xét" khác "đã xét, sạch".
> Cố ý QC sớm thì thêm `--include-draft`, và artifact phải ghi rõ nó dựa trên BDD nháp.

> **Vì sao trạm này chạy CẢ PRD chứ không từng UC** *(B11)*. Ba lý do, theo thứ tự quan trọng:
>
> 1. **Mâu thuẫn chéo UC chỉ lộ ra khi đọc cùng lúc.** UC1 nói một kiểu, UC3 nói kiểu khác —
>    chạy tách từng UC thì về **cấu trúc** là không thể thấy, không phải "khó thấy".
> 2. **Rẻ hơn.** PRD, bản thiết kế, tài liệu kỹ thuật là nguồn **dùng chung**; chạy per-UC là
>    đọc lại chúng mỗi UC một lượt. Phần dùng chung chiếm đa số đầu vào.
> 3. **Một tài liệu cho một tính năng** là cách PO và QC vốn làm việc — file gốc của đội QC
>    (`DOC_GAP_FEAT-02-3.md`) không có hậu tố UC, và `qa-planner/test-plan.md` vốn viết
>    *"Test Plan cho một feature"*.

---

## Đối chiếu tài liệu kỹ thuật *(nguồn thứ hai — bắt lệch nghiệp vụ ↔ kỹ thuật)*

Định vị tech-doc gộp cấp PRD: `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md`.
Nó phủ **nhiều UC** — và trạm này cũng phủ nhiều UC, nên đọc **mọi phần chạm `uc_list`**
(đối chiếu `@trace.ucs` ở header với `uc_list`). Phần thuộc UC ngoài phạm vi (`⏸ Chưa xét`) thì bỏ qua.

> **Đây là chỗ layout cấp PRD trả lãi rõ nhất.** Tech-doc gộp là **một** tài liệu phủ cả PRD.
> Chạy per-UC thì nó bị đọc lại N lần, mỗi lần lọc bỏ gần hết — và mâu thuẫn giữa hai UC trong
> **cùng** tài liệu đó không lần nào lộ ra, vì không lần nào thấy cả hai.

**Không tìm thấy → cảnh báo mềm, KHÔNG chặn** (dự án có thể chưa dựng tech-doc):
```
⚠️  Không có tech-doc cho {TICKET-ID} — phân tích chỉ dựa trên PRD + BDD + design-spec.
   Lệch giữa yêu cầu nghiệp vụ và hợp đồng kỹ thuật (enum, mã lỗi, ràng buộc field) sẽ KHÔNG được phát hiện ở trạm này.
```

**Có → đối chiếu các mục sau với PRD/BDD, mỗi chỗ vênh là một gap `CONTRADICTORY`:**

| Mục tech-doc | Đối chiếu gì với PRD/BDD |
|---|---|
| §3 Mô hình dữ liệu | thực thể/field/quan hệ PRD nhắc tới có khớp không |
| **§4 Hợp đồng API** | **enum & tập giá trị hợp lệ** · ràng buộc field (độ dài, định dạng, bắt buộc) · **mã lỗi** — PRD nêu bao nhiêu nhánh lỗi, contract định nghĩa bao nhiêu |
| §4.5 Ánh xạ component UI | màn/component PRD·design-spec mô tả có mặt đủ không |
| §5 Luồng chính | thứ tự bước, nhánh rẽ có khớp scenario `.feature` không |
| §6 Điểm tích hợp | side-effect PRD nêu (gửi sự kiện, gọi dịch vụ khác) có được định nghĩa không |
| §8 Xử lý lỗi & biên | trường hợp biên PRD nêu có đường xử lý không, và ngược lại |

> **Vì sao mục này tồn tại.** Có một lớp gap **chỉ lộ ra khi so hai loại tài liệu với nhau** —
> đọc riêng bên nào cũng thấy hợp lý. Ca điển hình: PRD viết *"chọn lớp 1–6"*, contract định
> nghĩa enum `1..9`. Không ai đọc cả hai thì không ai thấy, và nó ra tận lúc chạy thật.
> **Đây là lý do trạm này đọc tech-doc — không phải để hiểu kỹ thuật, mà để bắt chỗ hai bên nói khác nhau.**

### §12 GAP Register — ĐỌC, KHÔNG GHI

Tech-doc có sổ ẩn số thiết kế riêng (`§12`), với vòng đời và người chịu trách nhiệm riêng, và
`/generate-code` đã canh nó. **Trạm này chỉ đọc, tuyệt đối không ghi vào.**

Với mỗi mục `open` trong §12 chạm **bất kỳ UC trong `uc_list`**:
- **KHÔNG mở gap mới** trong `DOC_GAP.md` về cùng chuyện đó.
- Ghi vào `REQUIREMENT_ANALYSIS.md` mục *"Đang chờ chốt (từ §12 tech-doc)"*: `{id}` · **UC** · điều chưa biết · owner · severity.
- Test case chạm nó về sau sẽ bị chặn — nhưng bị chặn bởi **một mục đã có người xử lý**, không phải bởi một câu hỏi mới gửi PO.

> **Vì sao không ghi vào.** Một ẩn số đã nằm trong §12 nghĩa là **đã có người đang lo**: có
> owner, có mức chặn, có cổng chặn sinh code. Mở lại nó thành gap QC là gửi PO một câu hỏi
> về thứ không phải việc của PO, và tạo hai sổ cùng theo dõi một chuyện — rồi chúng lệch nhau.
> Đây đúng là **câu hỏi lọc Q1** của `steps/gap-verify.md` (*"chỗ này đã được trả lời ở tài liệu
> khác chưa?"*), chỉ mở rộng phạm vi "tài liệu khác" thêm một nguồn.

**Ngoại lệ — mục `spec-defect` là việc của PO.** §12 phân ba loại: `nội tại` (backend tự quyết) ·
`cross-service` (đội khác) · `spec-defect` (PRD/BDD sai hoặc thiếu). Hai loại đầu → ghi "đang chờ".
Loại thứ ba **đúng là gap tài liệu** → vẫn ghi vào `DOC_GAP.md` (cột `UC` = UC bị chạm), trỏ
ngược về `{id}` của §12 để không đếm hai lần.

---

## Role

Bạn là **QC Analyst** — stage đầu tiên của QC automation pipeline. Lấy requirement
chính thức (PRD + BDD `.feature` + design-spec) và phân rã thành một mô tả requirement
CÓ CẤU TRÚC: function, business rule, data flow, acceptance criteria. Bạn **không**
viết test case chi tiết hay Python (đó là qc-design-test / qc-run-test).

Ranh giới với `/qc-plan`: bạn trả lời *"requirement là gì?"*; qc-plan trả lời *"rủi ro ở đâu,
hỏi dev gì?"*. Khi có gì mơ hồ/thiếu, ghi nó thành gap và bàn giao cho qc-plan — đừng bao giờ bịa câu trả lời.

## Skills (`{paths.qc_skills_dir}/qa-analyst/`)

Chỉ nạp file cho bước đang làm (mỗi file tự đủ):
- `spec-breakdown.md` — phân rã spec/PRD/user story thành cấu trúc.
- `business-rules.md` — trích business rule, điều kiện, ràng buộc (code `BR-xx`).
- `data-flow.md` — input/output, data flow, điểm tích hợp/thất bại.
- `acceptance-criteria.md` — acceptance criteria Given/When/Then (code `AC-xx`).

Thứ tự điển hình: spec-breakdown → business-rules / data-flow → acceptance-criteria.

## Trace mapping (bắt buộc)

File `.feature` chính thức đã định nghĩa scenario là `@trace.scenario={UC-ID}-SC{N}` với
`@trace.business_rules`. Map mọi `BR-xx` / `AC-xx` bạn tạo ra tới `{UC-ID}-SC{N}` sở hữu nó
và ghi lại mapping — **làm cho từng UC trong `uc_list`**, và `BR`/`AC` phải mang rõ UC của nó
(một file phân tích giờ phủ nhiều UC, nên `BR-01` không còn tự phân biệt được là của UC nào) — qc-design-test và qc-run-test cần nó để gắn tag
`@trace.verifies` cho test và ghi `qc_status` theo từng scenario.

## Quét gap — hai nguồn, gộp rồi mới thẩm định

Gap đến từ **hai chỗ**, và chúng bổ sung nhau chứ không thay thế:

| Nguồn | Trả lời câu | Gap là |
|---|---|---|
| **4 kỹ năng phân tích** ở trên | *"yêu cầu là gì?"* | sản phẩm phụ — đang bóc luật nghiệp vụ thì gặp chỗ mâu thuẫn |
| **Quét theo lăng kính** *(dưới đây)* | *"còn thiếu gì?"* | mục tiêu chính |

### Quét theo lăng kính

Chạy `steps/review-fanout.md` với:

| Tham số | Giá trị |
|---|---|
| `DIMENSIONS` | **4 lăng kính** — `D2 Xử lý lỗi` · `D3 Giao diện` · `D4 Dữ liệu & cấu hình` · `D5 Đối chiếu chéo` **(thu hẹp — xem dưới)** *(định nghĩa ở `{paths.qc_skills_dir}/qa-analyst/exhaustive-gap-scanner.md`)* |
| `FINDINGS SCHEMA` | như §Output dưới đây |
| `GRANULARITY` | **`auto`** — chia theo ngưỡng kích thước, KHÔNG ép mịn theo từng UC |
| `VERIFY` | **`off`** — thẩm định chạy MỘT lần ở bước sau, trên tập đã gộp |

**`D5` chạy ở dạng THU HẸP — chỉ 2 trong 4 cặp tài liệu:**

| Cặp | |
|---|---|
| `PRD ↔ design-spec/` | ✅ **SO** — không ai đối chiếu nội dung. `/generate-bdd` chỉ kiểm `Built from PRD` (số phiên bản); cùng phiên bản mà nội dung lệch thì lọt |
| `bdd/{platform}/ ↔ design-spec/` | ✅ **SO** — không ai |
| `PRD ↔ bdd/` | ❌ bỏ — `/review-context` **B1** đã làm |
| `PRD·bdd/ ↔ tech-docs/` | ❌ bỏ — §Đối chiếu tài liệu kỹ thuật **ở trên** đã làm |

> **Cả hai cặp SO đều dính `design-spec/`** — artifact duy nhất trong feature package mà **không
> tài liệu nào đối chiếu nội dung với nó**. Đừng lẫn với `tech-docs/`: `design-spec/` là *giao diện
> Designer vẽ*, `tech-docs/` là *hợp đồng hệ thống* — và `tech-docs/` đã được phủ ở §trên.
>
> Trạm này **đã đọc `design-spec/`** từ trước (nó nằm trong danh sách nguồn ở Gate), nên `D5`
> không nạp thêm file nào — chỉ bắt nó **so** thay vì chỉ **đọc**. Rẻ hơn một lăng kính thường.

**`D1 Luật nghiệp vụ` là lăng kính duy nhất KHÔNG bật:** `qa-analyst/business-rules.md` đã hỏi
4/5 câu của nó, và hỏi cụ thể hơn — *"min/max · ký tự cho phép · trim · định dạng"* thay vì
*"ngưỡng đã chốt chưa"*.

> **Ghi lại vì sao `D5` từng bị tắt:** lý do ban đầu là *"trùng nhiều"* — **đúng một nửa**. Nó phủ
> **bốn** cặp, chỉ **hai** cặp đã có người làm. Sai vì suy từ ấn tượng thay vì đếm danh sách; bảng
> kiểm chứng 31 câu hỏi (`docs/plans/qc-implementation-log.md`) là thứ đáng lẽ phải làm **trước**
> khi quyết. Đừng tắt lại `D5` mà không đọc bảng đó.

> **`GRANULARITY = auto`, không phải `per-uc`.** `/refine-prd` ép mịn theo từng UC vì ở tầng PRD
> một gap bỏ sót **im lặng đi tiếp** tới tận lúc chạy thật. Ở đây khác: gap bỏ sót còn **bốn lớp
> chặn phía sau** — trạm 3 bật ngược khi không viết nổi giá trị mong đợi, trạm 4 soát độ phủ,
> trạm 5 phân loại lỗi thật vs script sai. Ép mịn ở đây tốn gấp ~3 lần cho tính năng nhỏ mà đổi
> lấy một lưới an toàn đã có sẵn ba lớp khác.

### Gộp trước, thẩm định sau

Gộp gap từ **cả hai nguồn** vào một tập trước khi sang bước thẩm định.

> **Không thẩm định từng nguồn riêng.** Phép kiểm `T6` của `gap-verify` là *"hai gap cùng gốc
> thì gộp lại"* — nó chỉ chạy được khi **thấy toàn bộ** tập. Thẩm định hai lần trên hai tập rời
> thì không bắt được trùng lặp chéo nguồn, và PO nhận hai câu hỏi giống nhau.

---

## DOC_GAP (bắt buộc)

Luôn tạo **đúng MỘT** file gap cho cả (PRD × nền) theo
`{paths.qc_skills_dir}/qa-analyst/DOC_GAP.template.md` — các UC là các hàng bên trong, phân
biệt bằng cột `UC`:
- **Bảng 11 cột**, cột 2 là `UC`. ID gap `GAP-UC{N}-{nnn}` (vd `GAP-UC1-001`); gap thuộc cả
  PRD → `GAP-GEN-{nnn}`. Đánh số **độc lập trong từng UC** — phân tích lại UC1 KHÔNG được làm
  đổi số gap của UC2, vì test case đã có đang trỏ `🚫 Block: [GAP-UC2-003]`.
- **Section `Phạm vi phân tích`** — mỗi UC một hàng kèm `@trace.status`, đã phân tích chưa, số
  gap. UC ngoài phạm vi ghi `⏸ Chưa xét`, **không bỏ khỏi bảng**.
- Mỗi gap phân loại MISSING / AMBIGUOUS / CONTRADICTORY / ASSUMPTION / OPEN QUESTION, với severity (🔴 Blocker → ⚪ Low) và function/BR/AC bị ảnh hưởng.
- Không bao giờ bịa câu trả lời; đánh dấu giả định là `ASSUMPTION` để PO/dev confirm.
- Bất kỳ `🔴 Blocker` nào còn `Open` ⇒ **UC ở cột `UC` của hàng đó** chưa sẵn sàng cho
  qc-design-test — bàn giao cho qc-plan. *Chặn theo từng UC, KHÔNG chặn cả PRD:* một blocker ở
  UC3 không có lý do gì dừng việc thiết kế test cho UC1. Ghi rõ UC nào bị chặn ở report.
- **Đẩy các defect spec thực sự lên PO (không chỉ giữ local).** Một blocker là lỗi thật
  trong spec chính thức — `AMBIGUOUS` / `CONTRADICTORY` / `MISSING` trong PRD/BDD — phải tới
  PO qua feedback flow, không chỉ nằm trong `DOC_GAP.md`: tạo `/report-bug {UC-ID} {desc}`
  (`{UC-ID}` lấy từ cột `UC` của hàng gap — bug đi theo UC, không theo PRD)
  (BUG_FLOW của nó phân loại PRD vs BDD), hoặc `/propose-scenario {UC-ID}` nếu gap là thiếu test
  coverage. Gap `ASSUMPTION` / `OPEN QUESTION` được confirm qua questions-for-dev của qc-plan — không file thành bug.

### Thẩm định trước khi bàn giao *(bắt buộc)*

Sinh xong `DOC_GAP.md`, **đọc `.agent/steps/gap-verify.md` và chạy toàn bộ quy trình trong đó**
với:
- `FINDINGS` = mọi gap đang `Open` trong `DOC_GAP.md`
- `EVIDENCE_ROOT` = `{paths.specs_dir}` — spec repo của PO, **không** phải `{paths.qc_dir}`
- `VERDICT_FIELD` = cột `Trạng thái` + `Câu trả lời` của bảng gap
- `RERATE` = `on`

Gap rớt thẩm định được **đóng kèm lý do**, KHÔNG xoá — người đọc phải kiểm chứng được vì sao
nó bị loại. Cập nhật `Tổng số gap` + bảng ưu tiên sau khi áp verdict, và in khối
`[GAP VERIFY]` + cam kết cuối vào report.

> **Vì sao bắt buộc, không phải tuỳ chọn.** Bước phân tích ở trên chỉ có lực **tìm thêm** —
> bốn skill lần lượt quét spec và mỗi cái đều được khuyến khích ghi ra chỗ nghi ngờ. Không có
> bước nào hỏi ngược *"cái vừa ghi có thật không?"*. Hệ quả đo được ở đội QC: phần lớn gap sinh
> ra là gap ảo — spec đã trả lời ở tài liệu khác, hoặc trích dẫn sai, hoặc là chuyện QC tự quyết
> được. Mà gap ảo không chỉ tốn thời gian PO: nó **làm PO mất tin vào cả danh sách**, và lúc đó
> những gap thật cũng chết theo. `gap-verify` là bộ lọc duy nhất đứng giữa hai chuyện đó.

## Output

Ghi **hai file** dưới `{qc_artifact_dir}` (= `{paths.qc_dir}/{TICKET-ID}/{active_platform}/`)
+ **một** dưới `{paths.refinement_dir}/`.

**Mỗi loại đúng MỘT file cho cả PRD** — đừng tách một-file-mỗi-UC, và cũng đừng tách
một-file-mỗi-bước (không có file spec-breakdown / business-rules / data-flow / AC riêng):

1. **`{qc_artifact_dir}REQUIREMENT_ANALYSIS.md`** — bản phân tích hợp nhất duy nhất cho cả PRD.
   Mở đầu bằng **bảng `Phạm vi phân tích`** (cùng nội dung với bảng trong `DOC_GAP.md`), rồi
   **một mục cho mỗi UC trong phạm vi**, mỗi mục theo thứ tự: phân rã requirement → bảng
   business-rule (`BR-xx`) → data-flow → acceptance-criteria (`AC-xx`), mỗi `BR`/`AC` map tới
   `{UC-ID}-SC{N}` (của `.feature` nền này) sở hữu nó.
   Thêm một mục **"Mâu thuẫn chéo UC"** — chỗ hai UC của cùng PRD nói khác nhau. Rỗng thì ghi
   "Không có". *Đây là thứ chỉ trạm cấp PRD nhìn thấy được; đừng bỏ mục.*
   Cuối file thêm mục **"Đang chờ chốt (từ §12 tech-doc)"** — các ẩn số thiết kế `open` chạm
   các UC trong phạm vi (`{id}` · UC · điều chưa biết · owner · severity). Rỗng thì ghi
   "Không có"; **đừng bỏ mục**.
2. **`{qc_artifact_dir}DOC_GAP.md`** — file gap, theo
   `{paths.qc_skills_dir}/qa-analyst/DOC_GAP.template.md` + luật viết ở
   `{paths.qc_skills_dir}/qa-analyst/spec-issue-reporter.md`. Bắt buộc:
   - **Bảng 11 cột** đúng thứ tự, có cột **`UC`** (cột 2) và cột **Giao cho đội** (Dev / PO / BA / Design / Kiến trúc / Dữ liệu).
   - Section **"Phạm vi phân tích"** ngay sau metadata — mỗi UC một hàng kèm `@trace.status`,
     đã phân tích chưa, số gap. UC ngoài phạm vi ghi `⏸ Chưa xét`.
   - Ô câu hỏi đủ **bốn phần** tách bằng `<br/>`: **Bối cảnh → Vấn đề → Tại sao quan trọng → Gợi ý**.
     *Ba phần đầu cho PO xếp ưu tiên; phần cuối cho PO trả lời nhanh mà không phải nghĩ lại từ đầu.*
   - Section **"Tài liệu đầu vào đã đọc để phân tích"** đặt ngay sau metadata — liệt kê **đủ** mọi
     file đã mở. Đây là căn cứ độ phủ: không có nó thì không ai phân biệt được *"đã đọc và không thấy"*
     với *"chưa đọc"*.
   - Mức nặng nhất dùng từ **`🔴 Blocker`** (không phải `Critical`) — `/qc-run-test` đọc đúng từ này
     để đặt *"scenario đang chờ PO"* vào sổ trace.
3. **`{paths.refinement_dir}/{TICKET-ID}-qa-findings.yaml`** — **cùng dữ liệu gap**, ở định dạng Review Board đọc được. Xem §Bản findings dưới đây.

`{paths.qc_dir}` là folder top-level NHÌN THẤY trong QC repo (mặc định `docs/`, **không** phải
`.agent/review/` ẩn) để team QC mở và xử lý output dễ dàng. Spec chính thức ở lại
spec submodule của PO — đừng ghi phân tích vào đó.

### Bản findings — một nguồn, hai mặt

File `.yaml` và `DOC_GAP.md` là **cùng một tập gap**, không phải hai tập. Sinh `DOC_GAP.md`
trước (nó là bản người đọc), rồi **render** sang `.yaml` — đừng phân tích lại lần hai.

Dùng **đúng schema của `/refine-prd`** để Review Board đọc được cả hai loại file:

```yaml
prd_source: "{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md"
ticket_id: "{TICKET-ID}"
platform: "{active_platform}"
ucs: ["{UC-ID}", "…"]          # các UC TRONG phạm vi (approved) — theo thứ tự
ucs_skipped: ["{UC-ID}"]       # UC chưa xét, kèm lý do ở DOC_GAP §Phạm vi phân tích
generated_at: "{ISO datetime}"
generated_by: "qc-analyze"
status: "pending_review"

findings:
  - id: "F001"
    lens: "QA"                    # LUÔN là QA — file này chỉ có một lăng kính
    severity: "critical"          # critical | major | minor  ← map từ 🔴/🟠/🟡⚪ của DOC_GAP
    section: "{section PRD/BDD chứa vấn đề}"
    uc_id: "{UC-ID}"
    quote: "{trích nguyên văn ≤120 ký tự từ spec tại đúng chỗ}"
    finding: "{gap là gì}"
    suggestion: "{cần PO/BA làm rõ điều gì}"
    resolution_edge_cases: []     # để [] — phân tích bậc-hai là việc của /refine-prd
    auto_fixable: false           # LUÔN false — xem cảnh báo dưới
    status: "pending"
    applied_via: ""
    gap_ref: "GAP-UC1-001"        # trỏ ngược về hàng trong DOC_GAP.md (ID mang UC)

summary:
  total_findings: {N}
  by_severity: { critical: {N}, major: {N}, minor: {N} }
  by_lens: { QA: {N} }
  recommendation: "APPROVED_WITH_MINOR_CHANGES | NEEDS_REVISION | BLOCKED"
```

> **`auto_fixable` LUÔN `false`, và KHÔNG có `--resume` cho file này.**
>
> Review Board có nút *"chấp nhận rồi tự sửa PRD"*. Với gap của `/refine-prd` thì đúng — nó chạy
> ở **thời điểm PRD**, sửa PRD lúc đó là sửa đúng chỗ đúng lúc.
>
> Gap của lệnh này phát hiện **sau khi code đã xong**. Tự sửa PRD ở thời điểm đó là **sửa sau lưng
> cả dây chuyền**: BDD sinh từ PRD cũ, code sinh từ BDD đó, sổ kết quả kiểm thử neo vào scenario
> của BDD đó. Đổi PRD mà không đi lại đường ấy thì mọi thứ phía sau nói dối.
>
> Đường đúng vẫn là kênh đã có: `/report-bug` cho defect spec thật, `/propose-scenario` cho thiếu
> độ phủ. File `.yaml` này để **PO đọc và quyết trong một chỗ quen**, không phải để máy tự áp.

**File riêng, không ghi chung với `/refine-prd`.** Cả hai giờ đều ở cấp PRD, nên khác biệt nằm
ở **hậu tố**: `{TICKET-ID}-qa-findings.yaml` (trạm này) vs `{prd-slug}-findings.yaml`
(`/refine-prd`). Đừng gộp. Ghi chung sẽ phá trường `applied_to_version` mà `/refine-prd` dùng để
phân biệt *"PRD đổi do chính tôi áp fix"* với *"có người lạ sửa"* — và nó sẽ mãi mãi tưởng có
người sửa sau lưng, mỗi lần chạy đều quét lại toàn bộ kèm cảnh báo giả.

---

## Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/qc-analyze Hoàn tất — {TICKET-ID} ({active_platform})
Phạm vi: {n}/{N} UC phân tích{nếu có UC chưa xét: " · ⏸ {m} chưa xét: {danh sách UC-ID} (BDD chưa approved)"}
Files : {paths.qc_dir}/{TICKET-ID}/{active_platform}/REQUIREMENT_ANALYSIS.md + DOC_GAP.md (11 cột)
        {paths.refinement_dir}/{TICKET-ID}-qa-findings.yaml    ← mở bằng Review Board (chuột phải)
Nguồn : PRD · BDD({active_platform}, {n} UC) · design-spec · tech-doc{nếu thiếu tech-doc: " (THIẾU — không đối chiếu được nghiệp vụ ↔ kỹ thuật)"}
Quét  : 4 kỹ năng phân tích + 4 lăng kính (xử lý lỗi · giao diện · dữ liệu & cấu hình
        · đối chiếu chéo: PRD↔design-spec, bdd↔design-spec)
Verify: {raw} gap thô → {N} còn Open  (❌ {invalid} bịa/đã-trả-lời · ⚠️ {reclass} không phải gap nghiệp vụ · 🔁 {merge} trùng)
Gaps  : {N} ({blockers} blocker) — theo UC: {UC1: n · UC2: n · …}{nếu có: " · toàn PRD: {n}"}
        ← blocker là spec-defect? → /report-bug {UC-ID của hàng đó}  | coverage gap → /propose-scenario {UC-ID}
Chéo UC: {X} mâu thuẫn giữa các UC của cùng PRD (đã ghi vào REQUIREMENT_ANALYSIS §Mâu thuẫn chéo UC)
Chặn  : {danh sách UC có 🔴 Blocker còn Open} — các UC còn lại vẫn thiết kế test được bình thường
Chờ chốt: {G} ẩn số §12 tech-doc đang open chạm các UC này (đã ghi vào REQUIREMENT_ANALYSIS, KHÔNG hỏi lại PO)
SC map: {M} BR/AC map tới {K} scenario
Next  : /qc-plan {TICKET-ID} {active_platform}   ← rủi ro / what-if / câu hỏi cho dev
        (giải quyết các gap 🔴 Blocker với PO/Dev trước)
```

> **Dòng `Next` là bắt buộc in, không phải trang trí.** Dây gốc của đội QC ra **cả** file gap
> **và** kế hoạch test trong một lần chạy (13/14 lần đo được ở repo của họ). Ở framework đó là
> **hai lệnh**. Người quen dây cũ sẽ dừng lại ở đây và tưởng đã xong — dòng này là chỗ duy nhất
> nói cho họ biết còn một bước nữa.


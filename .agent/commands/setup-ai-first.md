# /setup-ai-first — Khởi tạo SDD Framework trong một dự án

Dẫn người dùng qua một setup một-lần tạo mọi thư mục cần thiết, cài CLAUDE.md, và verify môi trường.

## Gate
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


*Lưu ý: Với lệnh này — **bỏ qua Gate Step 1, 2, và 3** (chưa có file input và chưa có project context). Chỉ chạy Step 0-B (model check). Project root là **thư mục làm việc hiện tại**. Đi thẳng tới Precondition Check bên dưới.*

---

## Precondition Check

Kiểm tra đã setup chưa:
- Nếu cả `CLAUDE.md` **và** `.agent/project-context.yaml` đều tồn tại → hỏi: "Dự án này đã được khởi tạo. Chạy lại setup để regenerate file config? (Y/N)"
  - N → dừng
  - Y → tiếp tục (file có sẵn được giữ — mỗi bước sẽ đề nghị merge/skip)
- Nếu chỉ có `specs/` hoặc phát hiện setup một phần → tiếp tục bình thường (an toàn chạy lại)

## Step 0.5 — Loại dự án

Hỏi người dùng:

```
Dự án này thuộc loại nào?
  1. Single-service  — một codebase, một platform (setup chuẩn)
  2. Umbrella repo   — repo này chứa nhiều service submodule (microservices / multi-app)
  3. PO Spec repo    — chỉ docs, không có code chạy được (chỉ PRD + design-spec)
```

Lưu câu trả lời thành `project_type`. Mặc định `1` nếu user không trả lời.

Dựa trên câu trả lời:

**project_type = 1 (Single-service):** Tiếp tục setup chuẩn bên dưới.

**project_type = 2 (Umbrella):** Hỏi các câu follow-up:
- "Path tới spec submodule (vd `free-trial-spec`)? Nhấn Enter để skip."
- "Một business-domain được triển khai trên NHIỀU platform (BE + Web + App) không? (Y/N)"
  - **N → dạng phẳng (FORM A):** "Liệt kê service dạng cặp `domain:module`, ngăn cách bởi dấu phẩy
    (vd `user:java-spring,order:java-spring`). Nhấn Enter để skip."
  - **Y → dạng map-theo-platform (FORM B):** "Liệt kê dạng bộ ba `domain:platform:module`
    (platform ∈ system|web|app), ngăn cách bởi dấu phẩy — lặp lại domain cho từng platform
    (vd `onboarding:system:java-spring,onboarding:web:nextjs,onboarding:app:flutter`). Nhấn Enter để skip."
    context-loader route theo `@trace.platform` của target `.feature` → chọn đúng submodule.
    **Giữ `@trace.domain` là business-domain** (KHÔNG bịa `onboarding-web`).
- "Có ô định tuyến nào ứng với NHIỀU repo không — tức cùng một domain (và cùng platform,
  nếu có) nhưng mỗi feature nằm ở một repo riêng? (vd mỗi mini-game webview một repo) (Y/N)"
  - **Y → dạng map-theo-prd_slug (FORM C):** "Liệt kê dạng `domain:platform:prd-slug:module`
    — bỏ trống đoạn platform nếu domain không chia platform (`domain::prd-slug:module`) —
    ngăn cách bởi dấu phẩy (vd
    `learning:webview:dap-chuot:phaser-game,learning:webview:ban-cung:phaser-game`).
    Nhấn Enter để skip."
    `prd-slug` là **tên thư mục feature-package** dưới `specs/{domain}/`, phải khớp chính xác.
    context-loader tra `@trace.platform` rồi tra tiếp `prd_slug` → chọn đúng repo.
    Không khớp slug nào thì lệnh DỪNG (`unresolved`) chứ không đoán repo gần giống.

Rồi:
- Skip tạo bất kỳ artifact `specs/` nào (mọi spec — PRD, BDD, tech-docs, design-spec — sống trong spec submodule theo bố cục feature-package `specs/{domain}/{prd-slug}/`)
- Chỉ tạo: `.trace/`, `.agent/review/` ở cấp umbrella
  *(Trừ khi user yêu cầu rõ tạo cấu trúc đầy đủ)*
- Sinh `.agent/project-context.yaml` ở umbrella mode với services (FORM A, B hoặc C — trộn được trong cùng một file) và spec_source đã cung cấp.
  **Sau khi sinh, MỞ file kiểm tra:** mỗi `services.{domain}.path` (hoặc `.{platform}.path`, hoặc `.by_prd_slug.{slug}.path`) phải trỏ **đúng tên thư mục submodule thật** — generator để placeholder `TODO-…` vì tên dir thường khác tên domain. Sửa cho khớp trước khi chạy lệnh generate.
- Skip tạo `CLAUDE.md` root (umbrella không có một tech stack đơn) — nhưng nhắc mỗi submodule code cần overlay `{path}/CLAUDE.md` riêng (thiếu thì code-gen fallback về default + cờ ⚠️, có thể sai coding-standards).
- Sau setup, nhắc: "Mở từng service submodule riêng trong Claude Code để cài framework/overlay ở đó nếu cần."

**project_type = 3 (PO Spec repo):**
- Tạo base dir: `specs/product-definition/`, `specs/domain-knowledge/`, `feedback/`, `.agent/review/`
- Artifact theo từng feature (`specs/{domain}/{prd-slug}/{ {TICKET-ID}-{prd-slug}.md, bdd/, tech-docs/, design-spec/}`) được tạo on demand bởi các lệnh generate — ĐỪNG tạo trước
- Skip: `.trace/` (theo service, sống cạnh code trong mỗi service submodule)
- Sinh `CLAUDE.md` tối thiểu chỉ với §1 (project overview) và §7 (git conventions)
- Hỏi người dùng: **"Liệt kê các business domain của bạn (vd auth, payment, loyalty):"** — lưu thành domain list cho `project-context.yaml` và nhắc PO các tên này phải được dùng nhất quán ở row `| **Domain** |` của bảng Metadata trong mọi PRD
- Thông báo:
  - Lệnh cho PO repo: `/define-product`, `/generate-prd`, `/review-context`, `/generate-design-spec`
  - **Quan trọng cho handoff team dev:** Mọi PRD phải có row `| **Domain** | {domain} |` trong **bảng Metadata**. Team dev dùng nó để route BDD/code sinh ra tới đúng service submodule. Tên domain không nhất quán sẽ phá routing.
  - Bảng Metadata PRD (do `/generate-prd` điền sẵn theo template):
    ```
    | **Domain** | {domain} |       ← phải khớp một key trong services config của team dev
    | **Ticket** | {TICKET-ID} |
    | **Status** | draft | approved |
    ```

## Step 1 — Tạo cấu trúc thư mục

Tạo các thư mục này (skip nếu đã tồn tại):

```
{project-root}/
├── specs/
│   ├── product-definition/   ← Output của /define-product
│   └── domain-knowledge/     ← business dictionary & domain context
├── .trace/                   ← .trace/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv
└── .agent/
    └── review/
```

**Bố cục feature-package** — artifact spec theo từng feature KHÔNG được tạo trước. Mỗi lệnh generate
tự tạo folder của nó on demand dưới `specs/{domain}/{prd-slug}/`:

```
specs/{domain}/{prd-slug}/
├── {TICKET-ID}-{prd-slug}.md ← /generate-prd  (vd SEG01-segment-scoring-service.md)
├── bdd/                      ← /generate-bdd (file .feature)
├── tech-docs/                ← /generate-tech-docs
└── design-spec/              ← /generate-design-spec (chỉ platform FE/App)
```

*Tạo base dir nào tuỳ theo `project_type` set ở Step 0.5:*

| project_type | Tạo | Skip |
|---|---|---|
| **1 — Single-service** | Cấu trúc base ở trên (`specs/product-definition/`, `specs/domain-knowledge/`, `.trace/`, `.agent/review/`) | folder theo feature (tạo on demand) |
| **2 — Umbrella** | Chỉ `.trace/` + `.agent/review/` (ở umbrella root) | Mọi thứ khác — **toàn bộ spec sống trong spec submodule (`spec_source`)** dưới `specs/{domain}/{prd-slug}/`; service submodule chỉ chứa **code + `.trace/`** |
| **3 — PO Spec repo** | `specs/product-definition/`, `specs/domain-knowledge/`, **`feedback/`**, `.agent/review/` (folder `specs/{domain}/{prd-slug}/` theo feature tạo on demand) | `.trace/` (theo service, sống cạnh code trong mỗi service submodule) |

### Step 1b — Luật merge cho sổ trace *(mọi project_type có tạo `.trace/`)*

Ngay khi tạo `.trace/`, tạo luôn `.trace/.gitattributes`:

```gitattributes
# Sổ trace — dữ liệu KHÔNG regenerate được. Hai luật, hai lý do khác nhau:
#
# merge=union — giữ row của CẢ HAI nhánh thay vì bắt người chọn một bên. Trùng sc_id sau
#   union là ca ĐÚNG VÀ ĐƯỢC MONG ĐỢI: `--lint-trace` T4 bắt nó, rồi /validate-traces
#   reconcile về một row. Mất row thì KHÔNG có gì bắt được. Đánh đổi có chủ ý — đừng "dọn".
#   (union là driver built-in của git: không ai cần chạy git config gì thêm.)
#
# text eol=lf — BẮT BUỘC đi kèm union. Thiếu nó: một máy ghi CRLF → git thấy MỌI dòng đã
#   đổi → union giữ cả hai bản → NHÂN ĐÔI CẢ FILE, gồm cả dòng header.
#
# KHÔNG thêm *.json — trace-report.json nằm cùng thư mục và union trên JSON tạo ra JSON
#   không hợp lệ. Nó sinh lại được: conflict thì chạy lại /validate-traces.
*.tsv    text eol=lf merge=union
*.jsonl  text eol=lf merge=union
```

**Vì sao làm ở đây, ngay lúc tạo thư mục:** sổ trace phải commit và được nhiều người ghi trên
nhiều nhánh song song. Không có luật này, lần merge song song đầu tiên sẽ conflict — và giải
conflict bằng "take mine" là **mất row của người kia, im lặng**. Đây là ca **chắc chắn xảy ra**
với team ≥3 người và không cần ai làm sai gì cả.

*Project đã cài từ trước → `/sync` Step 4c kiểm và tạo hộ.*

## Step 2 — Tạo CLAUDE.md

*Bỏ qua hoàn toàn step này nếu `project_type = 2` (Umbrella) — umbrella không có một tech stack đơn.*
*Với `project_type = 3` (PO Spec repo) — tạo CLAUDE.md tối thiểu chỉ với §1 (project overview) và §7 (git conventions). Skip §2–§6.*

Kiểm tra `CLAUDE.md` tồn tại chưa:
- Có → hỏi "Merge template hay skip?"
- Không → tạo từ template bên dưới

Sau khi tạo, hướng dẫn: "Mở CLAUDE.md và điền các giá trị `{{PLACEHOLDER}}` bằng thông tin dự án của bạn."

### CLAUDE.md Template

```
# §1. Project Overview
Project: {{PROJECT_NAME}}
Language: {{LANGUAGE}}
Framework: {{FRAMEWORK}}
Build: {{BUILD_COMMAND}}
Test: {{TEST_COMMAND}}
Domains: {{COMMA_SEPARATED_DOMAINS}}

# §2. Architecture
layers: "{{LAYER_STACK}}"
# Example: Controller → Facade → Service → Repository
rules:
  - "Controllers must not contain business logic"
  - "Services own transaction boundaries"

# §3. Coding Standards
naming:
  classes: "{{NAMING_CONVENTION}}"
  methods: "{{METHOD_CONVENTION}}"
response_wrapper: "{{WRAPPER}}"
forbidden:
  - "Magic numbers"
  - "Debug print statements"

# §4. Traceability
# Every entry-point method must carry the FULL block (repeat it per UC in a
# multi-UC file — the version tags are per-UC scalars, never merge them):
# @trace.implements={UC-ID}-SC{N}
# @trace.prd_version={PRD version} / @trace.bdd_version={BDD version} / @trace.tech_doc_revision={n}
# @trace.source=specs/{domain}/{prd-slug}/bdd/{platform}/{UC-ID}-{slug}.feature
#   ({platform} = web|app|system · adjust the root if specs_dir differs in .agent/project-context.yaml)
# Tests must be tagged:
# @trace.verifies={UC-ID}-SC{N}

# §5. Error Handling
not_found: "{{NOT_FOUND_EXCEPTION}}"
http_codes: { get: 200, create: 201, not_found: 404, validation: 400 }

# §6. Build & Test
build_command: "{{BUILD_COMMAND}}"
test_command: "{{TEST_COMMAND}}"
run_command: "{{RUN_COMMAND}}"

# §7. Git Conventions
branch_feature: "feature/{{TICKET_PREFIX}}-{N}-{slug}"
commit_feature: "feat({{TICKET_PREFIX}}-{N}): {description}"
```

## Step 3 — Tạo project-context.yaml

*Với `project_type = 2` (Umbrella):*
- *Nếu `.agent/project-context.yaml` đã được sinh bởi `--init --umbrella` → mở nó và verify/sửa section `services` (domain key, path, module). Skip copy template bên dưới.*
- *Nếu chưa sinh → hỏi: "Path spec submodule?" và "Services (cặp domain:module)?" rồi sinh config umbrella (xem Step 0.5 cho format).*

Tạo `.agent/project-context.yaml` dùng `.agent/templates/project-context.yaml` làm template nguồn.

Copy template và hướng dẫn: "Mở `.agent/project-context.yaml` và điền mọi giá trị `{{PLACEHOLDER}}`. Section `paths` đã được cấu hình sẵn với default hợp lý — chỉnh nếu dự án dùng tên thư mục khác."

## Step 4 — Tạo business-dictionary.md

*Skip Step 4 và 5 nếu `project_type = 2` (Umbrella) — business dictionary và core entities sống trong spec submodule và do team PO quản lý. Team dev đọc chúng từ `{spec_source}/specs/domain-knowledge/`.*


Tạo `specs/domain-knowledge/business-dictionary.md` nếu chưa tồn tại:

```markdown
# Business Dictionary — {{PROJECT_NAME}}

> Thuật ngữ chuẩn cho dự án này. Mọi PRD, BDD spec, và code phải theo các thuật ngữ này.
> Managed by: PO / SA team.

## Canonical Terms

| Canonical Term | Description / Context |
|----------------|----------------------|
| {Term}         | {Short description, usage scope} |

## Banned Terms

| ❌ Do NOT use | ✅ Use instead    | Reason |
|---------------|-------------------|--------|
| {banned}      | {canonical}       | {why}  |

## Status / Enum Registry

| Entity | Field   | Allowed Values     |
|--------|---------|--------------------|
| {Entity} | status | {value1, value2} |
```

Hướng dẫn: "Mở `specs/domain-knowledge/business-dictionary.md` và thêm thuật ngữ dự án của bạn. File này sẽ được mọi lệnh đọc để enforce naming nhất quán."

## Step 5 — Tạo core-entities.md

Tạo `specs/domain-knowledge/core-entities.md` nếu chưa tồn tại:

```markdown
# Core Entities — {{PROJECT_NAME}}

> Glossary entity máy-đọc-được cho phát triển có AI hỗ trợ.
> Được mọi lệnh nạp để AI biết domain model của bạn mà không cần đọc source code.
> Managed by: Tech Lead / Architect.
>
> HOW TO USE:
> - Add one `## Entity: {Name}` section per domain entity (aggregate root, value object, etc.)
> - Keep field descriptions concise — this is a REFERENCE, not API docs
> - Update this file whenever you add/rename fields or change business invariants

---

## Entity: {EntityName}

**Purpose**: {1-2 sentences — what this entity represents and why it exists in the domain}
**Domain**: {domain}
**Storage**: {e.g., `orders` table in PostgreSQL | `orders` collection in MongoDB}
**Owner service**: {service/module that owns this entity}

| Field        | Type    | Nullable | Description                         |
|--------------|---------|----------|-------------------------------------|
| id           | UUID    | No       | Primary key                         |
| {field_name} | {type}  | Yes/No   | {short description}                 |
| status       | Enum    | No       | See Status Registry in business-dictionary.md |

**Business invariants:**
- {Rule 1: e.g., "status can only transition: PENDING → ACTIVE → CLOSED"}
- {Rule 2: e.g., "total must equal sum of line items"}

**Relationships:**
- `{EntityA}` 1:N `{EntityB}` — {one sentence description}
- `{EntityA}` N:N `{EntityC}` via `{junction_table}` — {description}

---

## Entity: {AnotherEntity}

*(Add more entities following the same pattern above)*
```

Hướng dẫn: "Mở `specs/domain-knowledge/core-entities.md` và định nghĩa các domain entity chính. Bắt đầu với aggregate root. File này được mọi lệnh AI nạp — định nghĩa tốt ở đây tiết kiệm đáng kể qua-lại khi sinh code."

## Step 6 — Cài VS Code Extension (Khuyến nghị)

Khuyến nghị user cài extension VS Code **Spec Driven Docs Tools** — nó cung cấp panel Review Board + Living Documentation tích hợp với workflow này.

```bash
code --install-extension SpecDrivenDocsTools.spec-driven-docs-tool
```

Hoặc: VS Code → `Ctrl+Shift+P` → **"Extensions: Install from Marketplace"** → tìm **Spec Driven Docs Tools**.

**Nó làm gì:**
- 📋 **Review Board** — UI trực quan để review findings từ `/refine-prd`, `/review-context`, `/review-tech-docs`
- 📊 **Living Documentation** — dashboard traceability dựa trên `.trace/*.tsv`

## Step 6b — Cổng chặn bằng máy (Khuyến nghị mạnh)

*Skip nếu `project_type = 3` (PO Spec repo) — không có code thì không có PR cần chặn.*

Framework phát hiện được một lớp lỗi mà **build xanh + test từng-UC xanh KHÔNG thấy**: luồng
ghép chạy vào hàm rỗng (`SEAM_UNWIRED`, `STUB_UNRESOLVED`), hoặc code trỏ vào scenario đã bị
xoá (`ORPHANED`, `TRACE_ORPHAN`). Nhưng nếu việc phát hiện đó phụ thuộc vào **có người tự
nguyện chạy `/validate-traces` rồi đọc report bằng mắt**, thì sau sprint thứ ba không ai làm.

Hai file mẫu đã có sẵn. Hỏi user muốn cài cái nào:

```
Cài cổng chặn bằng máy? (khuyến nghị cả hai)
  1. pre-push hook  — chặn push khi sổ trace hỏng cấu trúc. Rẻ, 2 giây, offline được.
                      Bắt được marker conflict git trước khi nó vào nhánh chung.
  2. CI workflow    — chặn PR khi có cờ 🔴. Cần GitHub Actions.
  3. Cả hai         (khuyến nghị)
  4. Bỏ qua, cài sau
```

**Chọn 1 hoặc 3** — copy hook rồi cấp quyền chạy:
```bash
cp .agent/templates/hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```
*Nếu `trace_dir` của project không phải `.trace` (vd `../.trace` hay `{spec_source}/.trace`) →
mở file vừa copy và sửa biến `TRACE_DIR` ở đầu file cho khớp.*

**Chọn 2 hoặc 3** — copy workflow:
```bash
mkdir -p .github/workflows && cp .agent/templates/ci/trace-gate.yml .github/workflows/
```
*Rồi mở nó ra: sửa `src/**` ở job `require-fresh-audit` cho khớp layout project, và bỏ comment
`submodules: recursive` nếu spec/trace nằm trong submodule.*

> **Phải COPY RA khỏi `.agent/`** — `.agent/` bị ghi đè mỗi lần `/update-framework`, và
> `.git/hooks/` thì git không chạy từ chỗ khác. Copy ra rồi thì chúng là file của project.

Kiểm ngay sau khi cài (chưa có sổ trace thì cả hai thoát sạch, không phải lỗi):
```bash
npx @educa-corp/sdd-framework --lint-trace
```

Chi tiết + giới hạn của cổng → `docs/03-guides/architect.md` §Cắm vào CI.

## Step 7 — Verify

Checklist tuỳ theo `project_type`:

**project_type = 1 (Single-service):**
- [ ] `specs/` tồn tại
- [ ] `specs/product-definition/` tồn tại
- [ ] `specs/domain-knowledge/` tồn tại
- [ ] `.trace/` tồn tại
  *(folder `specs/{domain}/{prd-slug}/` theo feature tạo on demand — không check ở đây)*
- [ ] `.agent/project-context.yaml` tồn tại
- [ ] `CLAUDE.md` tồn tại
- [ ] `specs/domain-knowledge/business-dictionary.md` tồn tại
- [ ] `specs/domain-knowledge/core-entities.md` tồn tại

**project_type = 2 (Umbrella):**
- [ ] `.agent/project-context.yaml` tồn tại với `setup.mode: umbrella`
- [ ] Section `services` có ít nhất một entry với đúng domain key
- [ ] Path `spec_source` tồn tại (vd thư mục `my-project-specs/` có mặt)
- [ ] `.agent/review/` tồn tại
- [ ] Spec submodule đã init: `git submodule status` không hiện prefix `-`

**project_type = 3 (PO Spec repo):**
- [ ] `specs/product-definition/` tồn tại
- [ ] `specs/domain-knowledge/` tồn tại
- [ ] `feedback/` tồn tại
  *(folder `specs/{domain}/{prd-slug}/` theo feature tạo on demand — không check ở đây)*
- [ ] `.agent/review/` tồn tại
- [ ] `.agent/project-context.yaml` tồn tại
- [ ] `CLAUDE.md` tồn tại (tối thiểu)
- [ ] `specs/domain-knowledge/business-dictionary.md` tồn tại
- [ ] `specs/domain-knowledge/core-entities.md` tồn tại

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/setup-ai-first Hoàn tất ✅
```

Output tuỳ theo `project_type`:

**Single-service:**
```
Next:
  1. Điền CLAUDE.md (thay các giá trị {{PLACEHOLDER}})
  2. Điền .agent/project-context.yaml
  3. Điền specs/domain-knowledge/business-dictionary.md
  4. Điền specs/domain-knowledge/core-entities.md
  5. git add và commit 4 file đó
  6. Cài VS Code extension:
     code --install-extension SpecDrivenDocsTools.spec-driven-docs-tool
  7. /define-product để bắt đầu feature đầu tiên
```

**Umbrella:**
```
Next:
  1. Review .agent/project-context.yaml:
     - Cập nhật services[].path khớp tên thư mục submodule thực tế
     - Cập nhật domain key của services khớp row `Domain` (bảng Metadata) trong các file PRD
     - Xác nhận path spec_source đúng

  2. Chạy /sync — một lệnh lo mọi thứ còn lại:
     /sync
     → git pull + submodule init + spec submodule update
     → Tự tạo .agent/project-context.yaml cho mỗi service submodule
       (phát hiện module từ pom.xml / go.mod / package.json / pubspec.yaml v.v.)
     → Sync Living Docs panel
     → Refresh spec-manifest.yaml

  3. Bắt đầu sinh:
     /generate-bdd {spec_source}/specs/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md
```

**PO Spec repo:**
```
Next:
  1. Điền .agent/project-context.yaml:
     - domains: [liệt kê mọi business domain — chúng thành row `Domain` (bảng Metadata) trong PRD]
     - project.name, project.description
  2. Điền specs/domain-knowledge/business-dictionary.md  ← canonical terms
  3. Điền specs/domain-knowledge/core-entities.md        ← entity glossary
  4. git add và commit các file đó
  5. Cài VS Code extension:
     code --install-extension SpecDrivenDocsTools.spec-driven-docs-tool
  6. /define-product để bắt đầu feature đầu tiên

⚠️  Nhắc handoff team dev:
  - Mỗi PRD phải có row `Domain` (bảng Metadata) khớp một trong domains list của bạn
  - Khi team dev setup umbrella repo của họ, họ map các tên domain này
    tới path service submodule trong section services của project-context.yaml
  - Chia sẻ tên domain với team dev trước khi họ cấu hình umbrella
```

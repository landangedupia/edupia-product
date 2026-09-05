# /review-tech-docs — Review Technical Design Document

**Chế độ phân tích READ-ONLY — ghi file findings, KHÔNG sửa target.**
**Dùng `--resume` để áp dụng các finding được chấp nhận.**

## Gate

*Checkpoint: **không chặn** — read-only (ghi findings vào .agent/review/). Gate Bước 3 bỏ qua CHECKPOINT (Bước 3a).*

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


*Lưu ý: Với lệnh này, target ở Bước 1 là **file tech-design gộp của PRD** `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md` — MỘT doc full-stack phủ mọi UC của PRD (không còn per-UC / per-platform). Review chạy trên cả doc; findings gom theo từng UC (đọc §10 UC Coverage để biết finding thuộc UC nào).
Nếu `$ARGUMENTS` chứa `--resume` → bỏ qua sang Resume Mode bên dưới.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Nạp tài liệu Review

Sau khi nạp context nền, đọc các thứ sau theo thứ tự:

1. **Tech-doc target** — đọc đầy đủ. Trích từ header:
   - `@trace.ucs` → danh sách UC mà doc phủ (đối chiếu §10 UC Coverage)
   - `@trace.domain` → domain
   - `@trace.prd` → TICKET-ID của PRD nguồn
   - `@trace.platforms` → các platform có mặt (system / web / app)
   - `@trace.status` → status hiện tại (draft / in-review / approved)

2. **Các file BDD nguồn** — nạp **mọi** feature của PRD này: `{paths.specs_dir}/{domain}/{prd-slug}/bdd/**/*.feature` (system/web/app). Đây là nguồn đối chiếu cho T3/T7 — mỗi UC trong doc phải trace về scenario BDD tương ứng.

3. **Index endpoint cho T4 (KHÔNG nạp full doc khác)** — trích danh sách endpoint (§4.1) + entity chính của doc target. T4 sẽ `grep` các path đó trong `{paths.tech_docs_dir}/{domain}/*/tech-docs/*-tech-design.md` (các PRD khác) và chỉ nạp đoạn liên quan **khi có va chạm** — xem T4.

4. **Tham chiếu kiến trúc** — xác nhận lại CLAUDE.md §2: thứ tự layer, quy tắc kiến trúc.

5. **Core entities** — đã nạp trong context (Bước 6 của context-loader).

6. **PRD nguồn — §Business Rules (cho T8)** — nạp file PRD `{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md`, trích bảng Business Rule/Business Logic của các UC mà doc phủ. Đây là nguồn đối chiếu-ngược của **T8** (BR nào yêu cầu nguồn/sự kiện/generic-contract mà doc bỏ sót). Chỉ đọc §BR + §AC liên quan — KHÔNG cần toàn PRD.

Suy ra tên file findings (per-PRD):
`{paths.refinement_dir}/{TICKET-ID}-tech-review-findings.yaml`

---

## Review Dimensions

### T1 — Architecture Alignment *(luôn CRITICAL nếu vi phạm)*

Đối chiếu design đề xuất với quy tắc CLAUDE.md §2:

| Loại vi phạm | Severity |
|----------------|----------|
| Controller gọi Repository trực tiếp (skip layer) | Critical |
| Business logic trong Controller hoặc DTO | Critical |
| Pattern bị cấm từ §3 | Critical |
| Phụ thuộc đi ngược upstream (Service → Controller DTO) | Critical |
| Annotation transaction sai layer | Major |
| Thiếu tách lớp (không có Facade khi kiến trúc yêu cầu) | Major |

Với mỗi finding:
```
Component: {tên class hoặc method}
Violates:  "{rule text}" (CLAUDE.md §2)
Fix:       {layer/component nào nên sở hữu cái này}
```
→ **Không auto-fix.** Người phải quyết định fix cấu trúc. Bắt buộc note trong Review Board.

### T2 — Entity Consistency

Dùng catalog core-entities đã nạp:

| Vấn đề | Severity | Auto-fixable? |
|-------|----------|---------------|
| Entity được nhắc nhưng không có trong core-entities.md | Major | No — người confirm là DTO hay domain entity |
| Tên field khác core-entities.md | Major | Yes — đổi về canonical |
| Quan hệ được mô tả khác đi | Major | No — người quyết định |
| Entity mới được đưa ra nhưng chưa có trong core-entities.md | Minor | No — thêm vào core-entities trước |

### T3 — BDD Traceability

Đối chiếu với **mọi** feature BDD của PRD (system/web/app). Với mỗi UC trong §10 UC Coverage, kiểm tra design khớp scenario **2 chiều**.

> ⚠ **SC scope theo platform:** `{UC}-SC{N}` chỉ unique trong (UC × platform) — `system UC1-SC1` và `web UC1-SC1` là **hai scenario khác nhau**. Khi đối chiếu, match SC **trong đúng lane platform** (system SC ↔ system BDD, web SC ↔ web BDD, app SC ↔ app BDD). KHÔNG so chéo platform. §5 phải để mỗi SC trong lane 5.A/5.B/5.C của nó; §10 mỗi dòng có cột Platform.

| Vấn đề | Severity | Auto-fixable? |
|-------|----------|---------------|
| Tech-doc đề xuất behavior không có trong scenario BDD nào (cùng platform) | Major | No — tạo scenario trước |
| Tech-doc mâu thuẫn một scenario BDD | Critical | No — giải quyết conflict trước |
| Scenario (platform, SC) không có design tương ứng (thiếu ở §5 lane hoặc §10) | Minor | Yes — thêm design note còn thiếu |
| §10 UC Coverage sót một (platform, SC) đã có BDD | Major | Yes — thêm dòng coverage + section tương ứng |
| SC ghi trong §5/§10 **không kèm platform** (bare `UC1-SC1`) → nhập nhằng | Major | Yes — gắn platform vào SC ref |

### T3b — BDD Freshness *(tech-doc còn khớp BDD hiện tại không)*

*T3 kiểm **nội dung** khớp không. T3b kiểm **độ tươi**: doc này dựng từ BDD version nào, BDD giờ ở version nào. Đây là lỗ hổng cũ — không lệnh nào so hai giá trị này, nên tech-doc âm thầm lỗi thời mà vẫn giữ `@trace.status: approved`.*

Header tech-doc mang `@trace.bdd_versions` (**số nhiều** — map theo platform, vd `system=1.5, web=1.9`). Với **mỗi** entry trong map, đọc `@trace.bdd_version` (**số ít**, scalar) của `.feature` tương ứng (`{paths.specs_dir}/{domain}/{prd-slug}/bdd/{platform}/{TICKET-ID}-UC*.feature`):

| Điều kiện | Severity | Auto-fixable? |
|---|---|---|
| Map khớp `.feature` | *(sạch)* | — |
| `.feature` **mới hơn** map | **Major** | **No** — cần người review §4/§4.5 rồi bump `@trace.revision` |
| Platform có `.feature` nhưng **vắng** trong map | **Major** | Yes — thêm entry sau khi xác nhận §4 đã phủ platform đó |
| Map có platform mà **không** có `.feature` | Minor | Yes — xoá entry (BDD đã bỏ platform đó) |

Prose của finding "`.feature` mới hơn": *"tech-doc dựng từ BDD {platform}=v{old}, BDD giờ v{new} — §4 contract có thể đã lệch so với behavior đã chốt. Review lại §4.1–4.3 (+ §4.5 nếu FE) rồi bump `@trace.revision`."*

> **Vì sao là Major chứ không phải Minor:** `/generate-code` DS3 thấy tech-doc `@trace.status: approved` + 0 blocker-GAP thì lấy shape DTO/endpoint/error ở §4 **nguyên văn** làm contract "đã chốt". Contract dựng từ BDD cũ sẽ lan **thẳng** vào code, không cảnh báo. Đây là ca tệ hơn drift-về-code vì nó sai từ nguồn.

**Cổng chặn `approved` (chặn MỀM — đồng bộ với DS3/DS4 của `/generate-code`, không chặn cứng):** còn ≥1 finding T3b Major ở trạng thái `open` → khi người dùng định đặt `@trace.status: approved`, hiện CHECKPOINT:
```
⚠️  {n} platform có BDD mới hơn bản mà tech-doc này dựng từ:
      {platform}: doc dựng từ v{old} · .feature giờ v{new}
    Duyệt doc bây giờ = chốt một contract có thể đã lệch behavior.
    Vẫn đặt approved? (Y/N)
```
Chỉ tiếp khi `Y`. *(Khác GATE của §12 blocker-GAP — cái đó chặn cứng. Ở đây chặn mềm vì BDD có thể bump vì lý do không chạm contract, vd sửa từ ngữ step; người review là người biết.)*

### T4 — Cross-PRD Endpoint Conflict Check *(targeted, load-on-hit)*

Mỗi PRD giờ chỉ 1 doc → xung đột TRONG doc đã do **T5** lo. T4 chỉ soi xung đột **liên-PRD** theo cách rẻ, KHÔNG nạp full doc khác:

1. Trích danh sách endpoint (method + path, §4.1) + entity chính của doc target.
2. `grep` từng path/entity đó trong `{paths.tech_docs_dir}/{domain}/*/tech-docs/*-tech-design.md` (trừ target) — chỉ đọc dòng match.
3. **Chỉ khi có va chạm** (một path/entity xuất hiện ở doc PRD khác) → nạp đúng đoạn §4.1/§4.2 (hoặc §3) của doc đó để so shape.

| Vấn đề *(chỉ khi grep dính)* | Severity | Auto-fixable? |
|-------|----------|---------------|
| Cùng endpoint path, request/response khác shape giữa 2 PRD | Critical | No — người giải quyết |
| Cùng service method với behavior khác | Critical | No — người giải quyết |
| Status transition của cùng entity khác nhau giữa các doc PRD | Critical | No — người giải quyết |
| Trách nhiệm chồng lấn (2 PRD cùng nhận sở hữu 1 endpoint/logic) | Major | No — người giải quyết |

Không có va chạm grep → T4 pass, không nạp thêm gì.

### T5 — Internal Consistency

Trong nội bộ tech-doc:

| Check | Severity | Auto-fixable? |
|-------|----------|---------------|
| Sequence diagram thể hiện flow khác phần mô tả viết | Major | No |
| API spec return type khác code sketch | Major | Yes — căn chỉnh cái này theo cái kia |
| Section tham chiếu một component/concept không bao giờ được định nghĩa sau đó | Minor | Yes — thêm định nghĩa |
| Assumption được nêu nhưng không design nào xử lý nó | Minor | Yes — thêm note hoặc bỏ assumption |

### T6 — Structural Completeness

Kiểm tra tất cả section chuẩn có mặt và không rỗng:

| Section | Missing severity |
|---------|-----------------|
| Header (`@trace.prd`, `@trace.ucs`, `@trace.domain`, `@trace.status`) | Major |
| Overview / Context | Major |
| Architecture Decision kèm lý do | Major |
| Component Diagram hoặc Layer Description | Major |
| Sequence Diagram hoặc Flow Steps | Major |
| API Contract (nếu hướng HTTP) | Major |
| Data Model Changes (nếu entity đổi) | Major |
| Error Handling Strategy | Major |
| Open Questions / Assumptions | Minor |

→ Mọi finding section-thiếu T6 đều **auto-fixable**: AI thêm skeleton section kèm prompt.

### T7 — Cross-Team API Contract Review

*Chỉ áp dụng khi TẤT CẢ điều sau đúng:*
*1. Doc có phần backend/API (`@trace.platforms` gồm `system`, tức PRD có System BDD).*
*2. Header tech-doc KHÔNG có `@trace.api_source: existing`.*

*Nếu `@trace.api_source: existing` → **skip T7 hoàn toàn**. Contract đã được PO xác định trong PRD — không có API design mới để đồng thuận.*

Dimension này đảm bảo team FE, App, và BE đều đồng thuận API contract trước khi bắt đầu implement.

**Step 1 — Check status sign-off trong header tech-doc:**

Đọc block `@trace.sign_off` trong header tech doc. Nếu vắng → thêm như một finding (auto-fixable: thêm skeleton).

```yaml
# @trace.sign_off:
#   be_team:  pending    # author — set "done" khi BE hài lòng với design
#   fe_team:  pending    # FE/Web — phải confirm contract khớp expectation của web BDD
#   app_team: pending    # App — phải confirm contract khớp expectation của app BDD (nếu áp dụng)
#   sa:       pending    # SA/Tech Lead — approval cuối
```

**Step 2 — Contract vs BDD cross-check:**

Nạp web và app BDD cho TICKET-ID này (từ `{paths.specs_dir}/{domain}/{prd-slug}/bdd/web/` và `{paths.specs_dir}/{domain}/{prd-slug}/bdd/app/` trong spec submodule hoặc spec repo).

Với mỗi platform BDD, kiểm tra API contract của tech doc có thoả các mệnh đề `Then` của BDD không:

| Check | Severity |
|---|---|
| Field response trong API contract không phủ những gì web BDD `Then` mong | Critical |
| Field response trong API contract không phủ những gì app BDD `Then` mong | Critical |
| Shape error response không khớp những gì các platform BDD mong | Major |
| Annotation `@system.resolution` của System BDD mâu thuẫn với design API contract | Critical |

**Step 3 — Report sign-off pending:**

Sau review, liệt kê các sign-off còn `pending`:

```
⏳ Sign-off pending trước khi tech docs được approve:
  fe_team  — team FE/Web phải confirm API contract khớp expectation web BDD
  app_team — team App phải confirm API contract khớp expectation app BDD
  sa       — SA/Tech Lead approval cuối

Khi thu đủ sign-off → cập nhật @trace.sign_off trong header tech doc, rồi chạy lại /review-tech-docs.
Tech docs không thể set "approved" khi còn bất kỳ sign-off bắt buộc nào pending.
```

**Approval gate:**
- Nếu `be_team: done` VÀ `fe_team: done` VÀ `app_team: done` (hoặc N/A) VÀ `sa: done` → tech docs có thể set `approved`
- Ngược lại → `@trace.status` giữ `in-review` — `generate-code` bị chặn

### T8 — Reconciliation & Completeness

*Bắt lỗi "đóng kín" + "coverage ≠ completeness" — cái mà Self-Review Gate của `generate-tech-docs` (Cổng 1/4) đáng lẽ chặn. Đối chiếu doc với PRD Business Rules, core-entities, và seam UC anh em (đọc-ngược có giới hạn — không kéo toàn bộ BDD của PRD).*

> **Nguyên tắc:** "mọi SC được map" (T3) là *cần*, KHÔNG *đủ*. T8 fail một doc dù T3 pass, nếu nó thiếu/mâu thuẫn ở tầng rộng hơn lát BDD.

> **Thuật ngữ cross-service (đọc nhanh):** *dedup* = cùng event tới ≥2 lần chỉ xử lý 1 lần (idempotency key) · *ordering* = event đúng thứ tự phát ra, hoặc bên nhận chịu được lệch · *ack path* = bên nhận xong báo lại bên gửi để ngừng gửi lại (thiếu → mất event / gửi lại vô hạn) · *cross-field invariant* = ràng buộc luôn đúng giữa nhiều field (vd `paid ⇒ paid_at ≠ null`).

| Vấn đề | Severity | Auto-fixable? |
|---|---|---|
| Enum/trạng thái dùng trong doc nhưng **không có producer** (không luồng nào sinh giá trị đó) | Major | No — người xác định owner |
| Cột/field ghi nhưng **không có writer** (không luồng nào set) | Major | No |
| **PRD Business Rule** yêu cầu một nguồn/sự kiện mà doc **bỏ sót** | Critical | No — thêm design trước |
| PRD-BR đưa **hợp đồng chung** (generic envelope) nhưng doc tự làm **typed-per-thing** | Major | No |
| **Leak boundary** — kéo định danh nội bộ của service khác vào lookup của mình thay vì abstraction tầng mình | Major | No |
| Cross-service **không tách** bên nào own dedup/ordering, hoặc thiếu **ack path** | Major | No |
| **Cross-field invariant** giữa các field/entity không được nêu | Minor | Yes — thêm note |

### T9 — Gap Honesty & Constants

*Bắt "bịa lặng" + "hard-code" + "happy-only" — cái mà Self-Review Gate Cổng 2/3/4 đáng lẽ chặn.*

| Vấn đề | Severity | Auto-fixable? |
|---|---|---|
| Policy/type/giá trị nêu **như fact không nguồn** (bịa), lẽ ra phải là `[GAP]`/`[ASSUMPTION]` | Critical | No — người xác nhận nguồn hoặc giữ GAP |
| Chỗ đáng lẽ khai gap lại **bỏ trắng / chép hình dạng ở boundary** | Major | No |
| **Constant/literal inline** như luật (chưa vào catalog / chưa đặt tên) | Major | Yes — tách vào bảng constants/enum |
| **Happy-only** — API/flow thiếu partial + error case + rollback | Major | No — thiết kế nhánh lỗi trước |
| **Hàm cốt lõi** được đặt tên nhưng **không tả** điều kiện chọn / nhánh / kết quả (dừng ở tên hàm + sequence-diagram) | Major | No — cần người bổ sung impl-spec |
| BDD **mâu thuẫn** invariant kiến trúc mà doc **lặng chép** thay vì ghi conflict + escalate PO sửa `.feature` | Critical | No — escalate, không tự quyết |
| Citation/tham chiếu **không resolve** (trỏ tới thứ không được định nghĩa) / policy nêu như fact | Minor | Yes — thêm định nghĩa hoặc bỏ ref |
| `[GAP]`/`[ASSUMPTION]` inline **mồ côi** — không có dòng ở §12 GAP Register (hoặc dòng §12 không có marker inline) | Major | Yes — đồng bộ register ↔ marker |
| §12 GAP Register còn **🔴 blocker `open`** (chưa đóng) | Critical | No — chặn approve tới khi owner đóng. *(GAP đã khai đúng KHÔNG tính là "bịa" — đây là finding về gate, không phạt trung thực)* |

> **T8/T9 phản chiếu Self-Review Gate** (4 cổng) của `generate-tech-docs` và `project-lessons` **L-012** — nếu gen bỏ lọt, cổng review bắt lại. Đặt trong nguồn `.tmpl` nên bền qua `/update-framework`.

---

## Ghi File Findings

Sau khi chạy hết các check, ghi findings vào `{paths.refinement_dir}/{TICKET-ID}-tech-review-findings.yaml`:

```yaml
source_file: "{absolute path to tech-doc}"
prd_id: "{TICKET-ID}"
ucs: [{UC-ID list phủ bởi doc}]
domain: "{domain}"
generated_at: "{ISO datetime}"
review_type: "tech-design"
status: "pending_review"
is_system_bdd: {true | false}  # true nếu doc có phần backend (@trace.platforms gồm system)

sign_off:                       # chỉ có khi is_system_bdd: true
  be_team:  pending             # đọc từ @trace.sign_off trong header tech-doc
  fe_team:  pending
  app_team: pending             # "n/a" nếu dự án không có platform app
  sa:       pending
sign_off_gate: blocked          # blocked | ready — "ready" chỉ khi tất cả bắt buộc là "done"

findings:
  - id: "F001"
    check_id: "T1"           # T1 · T2 · T3 · T3b · T4 · T5 · T6 · T7 · T8 · T9
    severity: "critical"     # critical | major | minor
    section: "{section heading hoặc tên component nơi tìm thấy lỗi}"
    uc_id: "{UC-ID}"         # UC mà finding này thuộc về (một trong `ucs`; đọc §10 để xác định)
    quote: "{trích đoạn nguyên văn copy CHÍNH XÁC từ tech-doc tại vị trí lỗi, ≤120 ký tự}"
    finding: "{mô tả rõ ràng vi phạm hoặc gap}"
    suggestion: "{bản fix cụ thể — AI áp dụng khi --resume nếu được chấp nhận}"
    auto_fixable: false      # true = AI áp dụng được; false = người phải ghi quyết định trong note
    status: "pending"        # pending | accepted | modified | rejected | deferred

summary:
  total_findings: {N}
  by_severity: { critical: {N}, major: {N}, minor: {N} }
  auto_fixable: {N}
  requires_human_decision: {N}
  recommendation: "APPROVED | NEEDS_REVISION | BLOCKED"
  sign_off_gate: "{blocked — pending: fe_team, app_team, sa | ready}"
```

> **Field định vị (`quote` + `uc_id`) — bắt buộc cho source-jump của Review Board.**
> Với mỗi finding, copy một đoạn `quote` **nguyên văn** thẳng từ tech-doc tại đúng chỗ
> lỗi xảy ra — KHÔNG diễn giải lại; nó được so khớp với tài liệu để định vị dòng.
> Field này cho phép reviewer click một finding trong Review Board và nhảy tới đúng vị trí nguồn.

## Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/review-tech-docs Hoàn tất — {target file}
PRD: {TICKET-ID} | UCs: {UC list} | Domain: {domain}
Findings: {total} | 🔴 Critical: {N} | 🟡 Major: {N} | 🟢 Minor: {N}
Auto-fixable: {N} | Needs human decision: {N}

GAP Register (§12): {open_blocker} 🔴 blocker open / {total_open} open / {total} tracked
  {🔒 còn blocker open → chặn approve | ✅ 0 blocker open}

Sign-off gate (chỉ system BDD):
  be_team  : {done | pending}
  fe_team  : {done | pending}   ← {name / "needs sign-off" }
  app_team : {done | pending | n/a}
  sa       : {done | pending}
  Gate     : {🔒 BLOCKED — pending: fe_team, sa | ✅ READY}

File findings: {paths.refinement_dir}/{TICKET-ID}-tech-review-findings.yaml
Next: Mở trong Review Board → Accept/Modify/Reject từng finding
      Rồi chạy: /review-tech-docs --resume {tech-design-file}
      Sau khi thu đủ sign-off → cập nhật @trace.sign_off trong tech doc, chạy lại review
```

---

## Resume Mode — Áp dụng các Finding được chấp nhận

*Kích hoạt khi `$ARGUMENTS` chứa `--resume`.*
*Ví dụ: `/review-tech-docs --resume {paths.tech_docs_dir}/payment/{prd-slug}/tech-docs/PAY-123-tech-design.md`*

### Phase 1 — Đọc các finding được chấp nhận

1. Suy ra file findings từ target: `{paths.refinement_dir}/{TICKET-ID}-tech-review-findings.yaml`
2. Đọc file. Gom các finding có `status: "accepted"` hoặc `status: "modified"`.
3. Nếu không có → báo "No accepted findings. File unchanged." và dừng.

### Phase 2 — Áp dụng fix

Áp dụng theo thứ tự: critical → major → minor.

| check_id | Làm gì |
|----------|-----------|
| T1 (Architecture) | Áp dụng fix cấu trúc từ note finding — chuyển logic về đúng layer, cập nhật mô tả component |
| T2 (Tên field) | Đổi field về tên canonical từ core-entities.md xuyên suốt tài liệu |
| T3 (Thiếu design note) | Thêm design decision note cho scenario chưa phủ |
| T3b (map bdd_version) | **Chỉ 2 ca auto-fixable:** platform vắng trong map → thêm entry `{platform}={bdd_version hiện tại}`; platform không còn `.feature` → xoá entry. Ca **`.feature` mới hơn** thì KHÔNG được chỉ sửa số trong map — làm vậy là dán nhãn "đã đồng bộ" lên một contract chưa ai review. Chỉ cập nhật entry sau khi note của reviewer xác nhận §4 đã được đối chiếu lại. |
| T5 (Internal inconsistency) | Căn chỉnh các section mâu thuẫn theo quyết định nêu trong note |
| T6 (Thiếu section) | Thêm skeleton section với prompt placeholder cho tech lead điền |
| T8 (cross-field invariant) | Thêm note invariant còn thiếu *(chỉ mục minor auto-fixable; enum mồ côi / PRD-BR bỏ sót / leak boundary cần người)* |
| T9 (constant / citation) | Tách constant inline vào bảng catalog/enum; thêm định nghĩa cho citation không resolve |

**Finding T1, T2, T4 và các mục Critical/Major của T8/T9 có `auto_fixable: false`:** cần một resolution do người viết trong
note "Modify" của Review Board (enum mồ côi, PRD-BR bỏ sót, leak boundary, bịa-lặng, happy-only, BDD↔kiến trúc mâu thuẫn — không tự đoán). Áp dụng đúng những gì note nói. Đừng bịa fix.

### Phase 3 — Cập nhật header + TSV + Report

Sửa file tech-doc trực tiếp:
1. Tìm `@trace.revision:` trong header — tăng giá trị integer lên 1.
2. Tìm `@trace.status:` trong header. Set `approved` **chỉ khi CẢ HAI**:
   - (a) sign_off_gate = `ready` (tất cả sign-off done; hoặc doc không có phần system → không cần sign-off), **VÀ**
   - (b) §12 GAP Register **không còn 🔴 blocker nào ở trạng thái `open`** (đếm ở T9).
   Thiếu (a) hoặc (b) → set `in-review` (chặn `/generate-code`); ghi rõ lý do vào report (sign-off pending / còn N blocker-GAP open).
   **Ngoài ra — cổng T3b (chặn MỀM):** còn ≥1 finding T3b Major `open` (`.feature` mới hơn map `@trace.bdd_versions`) → hiện CHECKPOINT ở T3b và chỉ set `approved` khi người dùng chọn `Y`; chọn `N` → `in-review` + nêu lý do.
3. **Làm mới map `@trace.bdd_versions`** — chỉ cho các platform mà finding T3b đã được **giải quyết** (reviewer xác nhận §4 đã đối chiếu lại, hoặc là ca thêm/xoá entry auto-fixable). Platform còn finding `open` thì **giữ nguyên số cũ**: để nó lệch chính là thứ giữ cờ `TECHDOC_STALE_VS_BDD` của `/validate-traces` sáng đèn.
4. Nếu block `@trace.sign_off` vắng và đây là tech doc system BDD → thêm nó với tất cả giá trị `pending`.

Ghi cả hai thay đổi vào file.

Rồi cập nhật TSV cho **mọi UC mà doc phủ** (`@trace.ucs`) — doc gộp có một `@trace.revision` chung cho cả BE và client:
- Với mỗi UC trong `@trace.ucs`: glob **mọi sổ platform** `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-*.tsv` (system/web/app), và set `tech_doc_revision` thành integer `@trace.revision` mới cho mọi row trong từng sổ đó.
- **KHÔNG** đụng `fe_tech_doc_revision` ở đây — cột đó do `/generate-code --phase=integration` ghi khi FE thực sự wire adapter theo §4.5.4 (drift-detect riêng cho FE integration).
- Set `last_updated` thành ngày hôm nay (`YYYY-MM-DD`) cho các row vừa chạm.

In report sau khi hoàn tất mọi lần ghi file.

```
/review-tech-docs --resume Đã áp dụng — {target file}
PRD: {TICKET-ID} | UCs: {UC list}

Applied  : {N} findings ({critical} critical, {major} major, {minor} minor)
Skipped  : {N} rejected/deferred

Changes:
  - {change 1}
  - {change 2}

Revision : {old} → {new}
Status   : {approved | in-review}

Sign-off : {✅ Tất cả done — status set approved
           | 🔒 Pending: fe_team, sa — status set in-review
              Cập nhật @trace.sign_off trong tech doc khi mỗi team confirm, rồi chạy lại /review-tech-docs}

Chạy lại /review-tech-docs {file} để xác nhận 0 finding critical còn lại.
Next: {/generate-code {feature-file}  ← chỉ khi status = approved
      | Thu các sign-off pending → cập nhật @trace.sign_off → chạy lại /review-tech-docs}
      → nếu tech-doc sống trong spec repo dùng chung: commit + push lên spec submodule để FE/App `/sync` contract đã cập nhật
```

# /generate-tech-docs — Sinh Tài liệu Thiết kế Kỹ thuật (một doc gộp per-PRD)

> **Mô hình phạm vi:** MỘT tài liệu thiết kế kỹ thuật cho mỗi **PRD**, không phải
> per-UC — một blueprint **full-stack, gộp** (backend API/data/DB **và** client
> component/state/integration trong một file, nối bằng sequence diagram xuyên
> tầng) để bất kỳ dev nào đọc là implement được cả feature.
>
> **Tech lead trỏ lệnh vào (các) file BDD cụ thể cần thiết kế lúc này** — một file,
> hoặc một batch nhỏ (vd `system/` + `web/` + `app/` của cùng một UC). Lệnh chỉ nạp
> **đúng các file đó** (giữ context nhỏ) rồi ghi/mở rộng tài liệu tech-design duy
> nhất của PRD. Chạy lại cho (các) file BDD kế tiếp thì doc **lớn dần** — mỗi lần
> chạy là **append**, không bao giờ regenerate toàn bộ. Lệnh KHÔNG tự gom mọi BDD
> của PRD (sẽ nổ context).

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


*Với lệnh này, `$ARGUMENTS` là **input BDD tech lead chọn tường minh** — một hay nhiều path `.feature` và/hoặc UC-id (cách nhau bằng khoảng trắng), KHÔNG phải cả PRD để glob. Phân giải mỗi tham số thành một `.feature` (Gate Bước 1: `{paths.specs_dir}/{domain}/*/bdd/**/{UC-ID}*.feature`), gom vào `input_features` (batch), và suy `{domain}` + `{prd-slug}` + `{TICKET-ID}` từ (các) path khớp — tất cả PHẢI cùng một PRD. Output là doc gộp **duy nhất** của PRD; lần chạy này chỉ thiết kế (các) UC có trong `input_features`.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Bước 0 — Phân giải batch đầu vào (file mà tech lead trỏ vào)

1. Parse `$ARGUMENTS` thành danh sách feature tech lead chọn. Mỗi token là một path `.feature` hoặc một UC-id; phân giải mỗi cái thành file thật (Gate Bước 1). Danh sách này là `input_features` — **batch được thiết kế trong lần chạy này**. **Đừng** mở rộng nó bằng cách glob BDD anh em; chỉ nạp đúng các file này.
2. **Phân giải định danh từ header, KHÔNG từ tên file.** Với mỗi feature đọc `# @trace.prd` → `{TICKET-ID}` và `# @trace.id` → `{UC-ID}` (cả hai không chứa slug và là chuẩn; TICKET-ID như `FEAT-01-2` có dấu gạch, và slug/title của một UC có thể khác nhau theo platform — vd `…-UC3-sua-cau-bo-qua` (system) vs `…-UC3-sua-cau-quay-lai-bo-qua` (web), nên **đừng bao giờ** parse tên file bằng chuỗi). `{domain}` + `{prd-slug}` lấy từ path (Gate Bước 1). Gom batch thành các UC theo `@trace.id`, để cùng một UC trên system/web/app là **một** UC. Lấy **title** chuẩn của mỗi UC từ PRD (không phải title feature riêng theo platform).
   **Guard cùng-PRD:** nếu `@trace.prd` khác nhau trong batch → DỪNG: *"Các file thuộc PRD khác nhau ({list}). Chạy /generate-tech-docs mỗi PRD một lần."*
3. **Cảnh báo mềm cỡ batch (không chặn):** nếu `input_features` có **hơn 5** file:
   ```
   ⚠️  {N} file BDD trong một lần chạy. Batch lớn nạp nhiều context hơn và có thể
       làm giảm chất lượng thiết kế. Cân nhắc chia nhỏ (vd theo UC, hoặc theo platform).
       Tiếp tục với cả {N}? (Y/N)
   ```
   Y → tiếp tục với tất cả · N → để tech lead chạy lại với ít file hơn.
4. Với mỗi feature trong batch, đọc header + body: `@trace.service`, `@trace.module`, `@trace.platform`, `@trace.bdd_version`, `@trace.status`, `@trace.api_source`, UC id, các scenario (`SC{n}`), và business rule được tham chiếu (`BR{m}`).
5. Xác định **các platform có trong batch** — cái này quyết định lần chạy sinh ra gì:
   - feature `system/` → sinh/mở rộng các section **backend** (§2–§4.4, §6–§8) cho UC của nó.
   - feature `web/` và/hoặc `app/` → sinh/mở rộng block **client §4.5** cho platform đó, và thêm flow của platform đó vào lane **§5** (5.B/5.C).
   - batch không có feature client → không có việc §4.5 lần này (lần chạy sau trỏ vào BDD `web/`·`app/` sẽ append).
   - **batch không có feature `system/` (PRD chỉ client):** **đừng** bịa BE contract. §4.1 chỉ liệt kê các endpoint mà client **tiêu thụ** (external / bên thứ ba / của team khác / existing), reverse-document từ mệnh đề Then của client BDD + PRD và đánh dấu "consumed (external)"; nếu feature không gọi mạng → §4 = "N/A — client-only, không backend". §4.5.4 map tới bất cứ gì §4.1 liệt kê (hoặc không có).
   - Ghi `@trace.bdd_versions` (**số nhiều** — map theo platform, vd `system=1.5, web=1.9`) từ `@trace.bdd_version` (**số ít**, scalar) của mỗi feature — đừng làm phẳng về một số. *(Tên khác nhau là cố ý: cùng một tên cho hai kiểu dữ liệu sẽ làm vỡ mọi parser generic.)*
6. Đường dẫn output — doc **duy nhất** của PRD:
   ```
   {paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md
   ```
   *(Không có `{UC-ID}` và không có hậu tố `-{platform}` — một doc gộp per-PRD lớn dần qua các lần chạy.)*

Lưu `input_features`, `platforms_present`, danh sách scenario theo từng UC, và `output_path`.

---

## Bước 0.5 — [ARCH] Nạp Architecture Context (nếu có)

Tech-design chắt lọc kiến trúc hệ thống thành API contract + client design, nên đây là **nơi duy nhất** trong pipeline nạp `architecture.md` (SSOT cross-cutting sinh bởi `/generate-architecture`). Không nạp toàn cục ở context-loader — chỉ lệnh này cần nó ở mức sâu.

1. **Phân giải path:** `{paths.specs_dir}/architecture.md` (mặc định `specs/architecture.md`). Chế độ umbrella: context-loader đã trỏ `specs_dir`/`service_root` về service đang active → dùng `architecture.md` của chính service đó (kiến trúc là code-level, per-service).
2. **Nếu file KHÔNG tồn tại** → bỏ qua âm thầm, đặt `arch = none`. Vẫn dựa vào CLAUDE.md §2 (layers/rules) + core-entities như trước. (Gợi ý mềm một lần trong report cuối: "Chưa có architecture.md — cân nhắc chạy `/generate-architecture` để tech-design bám kiến trúc hệ thống.")
3. **Nếu tồn tại** → đọc **có chọn lọc theo tier** (mỗi mục có marker `<!-- tier: core|conditional|ops -->`):
   - **Nạp** thân các mục **`core` + `conditional`** — đây là phần ảnh hưởng code/API/data: layer boundaries + dependency direction, phân loại/nguồn dữ liệu, injection rules, luồng xác thực, response API chuẩn, caching/sharding/messaging, multi-tenant/identity-resolution.
   - **BỎ QUA** các mục **`ops`** (Observability, Triển khai & DevOps, Chiến lược kiểm thử, NFR) — không đổi thiết kế API/data-model, chỉ làm nhiễu context.
   - Các section §2–§4 (data model, API contract, integration) PHẢI nhất quán với phần đã nạp — KHÔNG tự suy khác.
4. **Mục đang STUB (`<!-- status: stub -->`):** nếu một UC trong batch **chạm** tới một concern mà mục tương ứng còn stub (vd UC có tenant scoping nhưng §Multi-tenant là stub) → **cảnh báo mềm** trong report: *"§{Mục} chưa tài liệu hoá trong architecture.md — chạy `/generate-architecture --section={slug}` để tech-design chính xác hơn."* Vẫn tiếp tục dựa vào CLAUDE.md.
5. **Trust-gate — đọc frontmatter `verified_by`:**
   - `verified_by: AI-draft` (hoặc trống) → nội dung do AI dựng từ config/tài liệu/code, CHƯA ai verify. Vẫn dùng làm tham chiếu nhưng **cảnh báo** trong report: *"⚠️ architecture.md còn là AI-draft chưa verify — tech-design có thể kế thừa giả định sai. Nên để Tech Lead verify (đổi `verified_by`) trước khi chốt."* Khi mâu thuẫn với CLAUDE.md/BDD thì ưu tiên CLAUDE.md/BDD.
   - `verified_by: {người thật}` → coi là ràng buộc kiến trúc chính thức.

Lưu `arch` (`none` | `ai-draft` | `verified`) để dùng ở các bước sinh section và report.

---

## Bước 1 — Chế độ Fresh vs Append

Kiểm tra `output_path` đã tồn tại chưa.

- **Chưa tồn tại → chế độ FRESH.** Tạo doc từ template, chỉ điền (các) UC trong `input_features`. (Section của các UC không thuộc batch này giữ placeholder `{…}` / được thêm ở lần chạy sau.)
- **Đã tồn tại → chế độ APPEND.** Doc là tăng dần — không bao giờ regenerate từ đầu (sẽ đè mất chỉnh tay và sign-off của reviewer). Đọc bảng **§10 UC Coverage** và **Changelog** hiện có → `covered_ucs`. Với mỗi UC trong `input_features`, phân loại:
  - **UC mới** (không có trong `covered_ucs`) → **thêm** các section của nó: sequence diagram §5 mới **đúng lane platform** (5.A/5.B/5.C, đánh số sau cái cuối cùng hiện có *trong lane đó*); với §4.5 — nếu **platform** này mới với doc → nhóm `### 4.5 — {platform}` mới, ngược lại thêm sub-block `§4.5.1.x {Screen} — {UC}` + row vào §4.5.6 dùng chung của nhóm platform đó (đừng lặp nhóm); row mới ở §3/§4.3/§8/§9. Rồi cập nhật §10 (row khoá theo platform×SC) và thêm một row Changelog **theo format ở Bước 1b**.
  - **UC đã phủ được trỏ lại** (có trong `covered_ucs`) → đây là refresh/mở rộng có chủ đích (vd tech lead giờ trỏ vào BDD `web/` của một UC mà backend đã thiết kế, hoặc BDD bump version). Xác nhận trước khi đụng nội dung có sẵn:
    ```
    ↻ {UC-ID} đã có trong {TICKET-ID}-tech-design.md.
      Lần chạy này sẽ {thêm block client {platform} (§4.5) | refresh cho BDD v{new}}.
      Cập nhật các section của UC này? (Y = merge/mở rộng · N = bỏ qua UC này)
    ```
    Y → merge (thêm platform/§ còn thiếu hoặc refresh phần đã đổi, giữ nguyên prose không liên quan) · N → bỏ qua UC đó.

Lưu `mode` (`fresh` | `append`) và, theo từng UC của batch, hành động của nó (`add-new` | `extend-platform` | `refresh` | `skip`). Nếu mọi UC đều `skip` → báo "không có gì để làm" và dừng.

---

## Bước 1b — Format row Changelog *(contract máy đọc — áp cho CẢ Fresh lẫn Append)*

Row Changelog của tech-doc **không phải ghi chú cho người đọc** — `/validate-traces` Step 5 đọc nó để quyết mỗi UC ăn cờ 🟠 `TECHDOC_DRIFT` hay ⓘ `TECHDOC_STALE_REF`.

Format *(contract: `bin/trace-schema.json` → `changelog_row_contract`)*:

```
| {revision} | {YYYY-MM-DD} | {changelog_scope} |
```

**`{changelog_scope}` — mỗi mệnh đề mở đầu bằng UC SỞ HỮU.** Nguồn: các UC trong `input_features` của batch vừa thêm/sửa (Bước 1 đã phân loại từng UC là `add-new` / `extend-platform` / `refresh` / `skip` — UC `skip` **KHÔNG** vào dòng này). Ngăn nhau bằng `;`. Nội dung không thuộc UC nào (§11 Cross-cutting, §2 kiến trúc chung) → `doc-global`.

| Ca | Ví dụ đúng |
|---|---|
| Fresh | `1 \| 2026-08-19 \| UC1, UC2: sinh lần đầu từ BDD system v1.4` |
| Thêm UC mới | `2 \| 2026-08-22 \| UC3: thêm §5.9 sequence + §10 coverage, từ BDD system v1.0` |
| Thêm platform cho UC đã phủ | `3 \| 2026-08-25 \| UC1: thêm block client web §4.5.1.2, từ BDD web v1.2` |
| Refresh vì BDD bump | `4 \| 2026-08-28 \| UC2: refresh §4.1 endpoint theo BDD system v1.6` |
| Chỉ sửa phần chung | `5 \| 2026-08-30 \| doc-global: bổ sung §11 chuẩn logging` |

*(Tech-doc **không** dùng hậu tố `[no-behavior]` — `doc-global` đã đủ: không nêu UC nào thì không UC nào ăn cờ. Marker đó chỉ dành cho producer biết chính xác `check_id` của từng fix mình vừa áp, tức `/review-context --fix`.)*

> **Vì sao khai format ở đây (G58).** Trước đó Bước 1 và §Sinh chỉ nói *"thêm một row Changelog"* — **không format, không ví dụ, không nhắc phải nêu UC**. Trong khi `/validate-traces` Step 5 lọc 🟠-vs-ⓘ **bằng chính row đó**, và chế độ APPEND bump `@trace.revision` chung cho cả doc nên **mọi UC cũ lệch revision** dù phần của chúng không đổi một dòng.
>
> Chỗ duy nhất có format là một **comment HTML** trong `templates/tech-design.template.md` — mà chế độ APPEND theo định nghĩa **không đọc lại template**. Nên contract đang phụ thuộc vào việc agent tình cờ nhìn thấy một dòng comment ở file khác. Chưa nổ vì ví dụ trong comment tình cờ đúng; đây là nợ chờ lệch, cùng lớp với G52/G53.
>
> Hai kiểu viết sai và hậu quả — **đối xứng hoàn toàn với phía PRD**:
> - **Mơ hồ** (`cập nhật tech design`) → Step 5 gắn 🟠 cho **MỌI** UC của doc. Ồn tới mức cờ mất giá trị.
> - **Nêu §/SC mà bỏ UC** (`thêm §5.9, §10`) → nêu đủ ID để **không** bị coi là mơ hồ, nhưng Step 5 khớp theo **UC**; nên UC vừa được thêm lại rơi vào ⓘ và `--realign-techdoc-revision` sẽ dán nhãn lại. Im lặng.

---

## Bước 2 — Cổng Chất lượng (mọi feature nguồn)

Với **mỗi** feature BDD trong scope:

1. Tìm `{paths.refinement_dir}/{uc-id}-{platform}-review-bdd-findings.yaml` — `{platform}` = `@trace.platform` của chính feature này (đọc ở Bước 0). Findings là **per (UC × platform)**: mỗi `.feature` của từng platform được review vào file riêng, nên kiểm đúng file khớp feature **này** — không phải của platform anh em (feature `system` phải được gác bởi findings `system`, không phải `web`).
   - **Thiếu** → cảnh báo mềm (không chặn):
     ```
     ⚠️  /review-context chưa chạy cho {uc-id}.feature.
     Khuyến nghị: chạy /review-context {feature-file} trước để kiểm chất lượng BDD.
     ```
   - **Có** → kiểm các finding critical chưa xử lý với `status: "pending"`. Nếu có → **DỪNG** và in (các) feature vi phạm:
     ```
     ❌ Cổng Chất lượng thất bại — {feature-file}
     Còn finding BDD critical chưa xử lý.
     Chạy: /review-context --fix {feature-file}   ← auto-fix những gì có thể
     Rồi: /review-context --resume {feature-file}
     Rồi chạy lại: /generate-tech-docs {đúng các feature file đó}
     ```
2. Đọc `# @trace.status:` của feature (tín hiệu duyệt chuẩn). Nếu feature nào ≠ `approved` → cảnh báo mềm (đồng bộ generate-code / qc-analyze): *"BDD {uc-id} chưa approved (@trace.status: {status}) — tech design dựng từ BDD chưa chốt có thể phải làm lại. Tiếp tục? (Y/N)"*.

Cổng này chỉ chạy cho `input_features` (batch) — không bao giờ quét BDD ngoài cái tech lead trỏ vào.

---

## Bước 3 — Điều kiện tiên quyết Client (chỉ khi batch có feature `web/` hoặc `app/`)

Các block client §4.5 (phân cấp component, map Figma → design-system, hình dạng state, test selector) được **suy ra** từ design spec. Định vị nó:

- **Design Spec** — `{paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}*.md`.
  - **Tìm thấy** → nạp; Screen Specs / Component Inventory / Screen States của nó cấp cho §4.5 và mô hình state client ở §4.5.3.
  - **Không thấy** → cảnh báo mềm (không chặn cứng — các section backend vẫn giá trị đầy đủ, và §4.5 có thể draft chỉ-text từ client BDD, đánh dấu degraded):
    ```
    ⚠️  Không tìm thấy design-spec cho {TICKET-ID}. §4.5 (map UI component, tham chiếu
        Figma, test selector) sẽ được draft chỉ từ BDD và đánh dấu
        "[DRAFT — no design-spec]". Chạy /generate-design-spec trước để đủ độ trung thực.
        Tiếp tục? (Y/N)
    ```

Cũng nạp, khi có, catalog Figma component (`figma-components/{module}.md`) và design token (đã nạp bởi context-loader Bước 6-B/6-C) để ưu tiên component trong catalog ở §4.5.1/§4.5.2 và token thật ở §4.5.5.

> **Lưu ý:** vì BE và FE giờ nằm trong **cùng** một tài liệu, không còn cổng "BE contract phải tồn tại trước" — backend contract (§4) và client design (§4.5) được sinh cùng nhau. §4.5.4 vẫn yêu cầu mỗi client service method map tới một endpoint **thật** khai báo ở §4.1 (đừng bịa endpoint).

---

## Bước 4 — Kiểm tra Brownfield

Đọc `@trace.api_source` ở header mỗi feature của batch, và kiểm bảng Metadata của PRD tìm `| **API Source** | existing |`.

| Giá trị | Chế độ |
|-------|------|
| `existing` | **Reverse-document** — API đã tồn tại; mô tả as-is, ghi chú gap so với BDD, không thiết kế mới |
| vắng / khác | **Greenfield** — thiết kế API từ scenario |

Lưu `active_mode`. Nếu `reverse-document`, nạp appendix "Existing API Contract" từ PRD làm input cho §4.

---

## CHECKPOINT — Kế hoạch Tech Design

Trước khi sinh, hiện kế hoạch và chờ **Y** rõ ràng:

```
Kế hoạch Tech Design — {TICKET-ID}  (doc full-stack / PRD)
──────────────────────────────────────────────────────
PRD        : {TICKET-ID} — {feature title}
Chế độ     : {Fresh (doc mới) | Append (mở rộng doc có sẵn)}
Batch      : {M} file feature lần này:
               - {input_features[0]}  ({platform} · UC{n} · {add-new|extend-platform|refresh})
               - {…}
Service    : {trace.service}      Module: {trace.module}
Platform   : {các platform trong batch}
Chế độ API : {Reverse-document (API existing) | Greenfield (thiết kế mới)}
Scenario   : {N} scenario trong batch
BDD ver    : {bdd_version lớn nhất trong batch}
Design-spec: {đã nạp | ⚠️ thiếu (§4.5 degraded) | n/a — batch không có feature client}
UC của doc : đã phủ → {covered_ucs hoặc "chưa (doc mới)"};  lần này → {batch UCs}
Output     : {output_path}   ({tạo | mở rộng})

Section sẽ {sinh | thêm} cho batch này:
  {backend (system trong batch): §1–§4.4, §6–§8}
  {client  (web/app trong batch): §4.5 cho {platform}}
  §5  Key Flows — {N} sequence diagram trong lane platform (5.A system/5.B web/5.C app), mỗi cái tiêu đề "platform · SC"
  §9  Design Decisions (row mới) · §10 UC Coverage (khoá theo platform×SC) · §11 Cross-cutting · Changelog
──────────────────────────────────────────────────────
Tiếp tục? (Y/N)
```

Chờ "Y" rõ ràng.

---

## Sinh

Ghi/mở rộng `{output_path}` dùng template dưới đây, chỉ sinh **nội dung cho (các) UC** trong `input_features`. Điền các placeholder `{…}` liên quan và xoá các comment hướng dẫn khi làm.

- Section **Backend** (§2–§4.4, §6–§8) đến từ feature `system/` trong batch (hoặc, brownfield, từ contract existing của PRD).
- Block **Client** §4.5 đến từ feature `web/`·`app/` trong batch + design-spec. Dùng **cùng** giá trị test-id giữa web/app cho cùng một element logic (chỉ khác attribute theo platform).
- **§5 Key Flows** — một mermaid sequence diagram cho mỗi scenario của batch, participant trải mọi tầng (client component → service → API → external API → DB). **Gom theo lane platform** (5.A system · 5.B web · 5.C app) và đặt tiêu đề mỗi diagram bằng **platform · SC** (vd `web · UC1-SC1`) — vì `{UC}-SC{N}` chỉ độc nhất trong (UC × platform): `system UC1-SC1` và `web UC1-SC1` là hai scenario khác nhau. Đừng bao giờ ghi trơ `UC1-SC1`. Chỉ tạo lane cho platform có BDD.
- **§1/§2** (Overview/Actors, Architecture) là cấp PRD: viết ở lần chạy đầu; các lần sau chỉ mở rộng nếu batch thêm actor/integration thật sự mới.
- **§10 UC Coverage** — một row UC (có cột Platforms) + bảng con coverage-scenario khoá theo **(platform, SC)** — mỗi platform×SC một row, vì cùng số SC ở platform khác nhau là scenario khác nhau. Đây là mỏ neo mà chế độ APPEND đọc. Luôn cập nhật nó cho (các) UC/platform của batch.

**Chế độ APPEND (doc đã tồn tại):** **đừng** viết lại section có sẵn. Chèn diagram §5 của UC batch **vào đúng lane platform** (5.A/5.B/5.C, đánh số sau cái cuối trong lane đó, tiêu đề `platform · SC`), các row mới ở §3/§4.3/§8/§9; với §4.5 — platform mới → nhóm `### 4.5 — {platform}` mới, ngược lại thêm sub-block `§4.5.1.x {Screen} — {UC}` + row vào §4.5.6 dùng chung của nhóm (không lặp nhóm); rồi cập nhật §10 (row khoá theo platform×SC) và thêm một row Changelog **theo format ở Bước 1b**. Bump `@trace.revision` và làm mới `@trace.ucs` / `@trace.platforms` ở header, và cập nhật entry của platform vừa đụng trong map `@trace.bdd_versions` (vd set `web=2.0`, giữ nguyên `system`).

<!--
  ════════════════════════════════════════════════════════════════════════════
  TEMPLATE: Tài liệu Thiết kế Kỹ thuật (per-PRD, full-stack, gộp)
  Dùng bởi: /generate-tech-docs
  ════════════════════════════════════════════════════════════════════════════

  MÔ HÌNH PHẠM VI
  - MỘT tài liệu cho mỗi PRD (không phải per-UC). Nó bao phủ MỌI use case của PRD
    trong một thiết kế full-stack gộp: backend (API, mô hình dữ liệu, DB) VÀ client
    (component, state, tích hợp API) đặt cạnh nhau, nối bằng sequence diagram xuyên
    tầng. Đây là "bản vẽ thi công" mà bất kỳ dev nào mở ra để implement cả feature.
  - ĐẦU VÀO là các file BDD của PRD (web/ · app/ · system/), KHÔNG phải văn xuôi PRD.
    PRD chỉ nạp để lấy bối cảnh Overview/Goals/Actors.

  TĂNG DẦN / APPEND
  - Khi BDD mới được thêm vào cùng PRD về sau, tài liệu này được MỞ RỘNG, không sinh
    lại: thêm section + sequence diagram của UC mới, cập nhật ma trận Độ phủ UC (§10)
    và Changelog. KHÔNG bao giờ đè nội dung có sẵn hay chỉnh tay.

  QUY TẮC ĐIỀN
  - Thay MỌI placeholder {…} bằng nội dung thật. Xoá các comment hướng dẫn.
  - THUẬT NGỮ: tuân 100% từ điển dự án (specs/domain-knowledge/business-dictionary.md).
    Giá trị status/enum → core-entities.md (Enum Registry). Entity → core-entities.md.
  - Giữ code/DTO/DB mẫu theo idiom stack của dự án (xem stack-profile của module đang
    dùng). Snippet C#/Angular bên dưới chỉ MANG TÍNH MINH HOẠ — thay bằng stack thật.
  - Section không áp dụng cho PRD này: GIỮ heading và viết "N/A — {lý do}" thay vì
    xoá, để cấu trúc luôn nhất quán, dễ đoán.
  - Mọi sequence diagram / API / rule phải truy vết được về một scenario: tham chiếu
    id SC (vd UC1-SC3) mà nó phục vụ.
-->

# {Feature Area} — Tài liệu Thiết kế Kỹ thuật: {PRD Title}

<!-- Khối @trace (cấp PRD). ucs = mọi UC mà doc này phủ; nối thêm id khi thêm UC. GIỮ NGUYÊN key @trace.* — máy đọc. -->
---
@trace.id: {TICKET-ID}
@trace.domain: {domain}
@trace.prd: {TICKET-ID}
@trace.ucs: {TICKET-ID}-UC1, {TICKET-ID}-UC2{, …}
@trace.service: {service — từ header BDD @trace.service}
@trace.module: {module liên quan — vd dotnet, angular}
@trace.platforms: {system | web | app | webview | … — tuỳ thư mục BDD nào tồn tại}
@trace.bdd_versions: {MAP theo từng platform — số nhiều, KHÁC @trace.bdd_version (scalar) của .feature — vd system=1.5, web=1.9, app=1.7; chỉ platform có mặt. Mỗi feature mang bdd_version riêng; đừng gộp về một số.}
@trace.api_source: {existing | —}
@trace.revision: 1
@trace.status: draft
@trace.generated_at: {YYYY-MM-DD}
---

> **Tài liệu liên quan:** {link các PRD / tech-design anh em mà doc này phụ thuộc, vd [OTHER-TICKET](../{other-slug}/tech-docs/{OTHER-TICKET}-tech-design.md)}. Xoá nếu không có.

## 1. Tổng quan (Overview)

<!-- 2–4 câu: feature làm gì, ai dùng, hình dạng kỹ thuật cốt lõi (nguồn dữ liệu,
     side effect chính). Nêu rõ dữ liệu đến từ đâu (DB vs API ngoài) và thao tác ghi
     chính. Nguồn: PRD + system BDD. -->

{Feature làm gì, tác nhân chính, và cơ chế kỹ thuật cốt lõi. Nêu rõ dữ liệu nào được
sở hữu (DB) vs lấy live (API ngoài), và thao tác ghi chính.}

### Mục tiêu (Goals)

<!-- Liệt kê mục tiêu kỹ thuật — suy từ mục tiêu PRD, diễn đạt thành thứ hệ thống
     phải đảm bảo. -->

- {Mục tiêu 1}
- {Mục tiêu 2}

### Tác nhân nghiệp vụ (Business Actors)

| Tác nhân | Mô tả | Kênh |
|-------|-------------|---------|
| {Actor} | {vai trò & quyền} | {đường vào, vd App → Widget → Portal → API} |

---

## 2. Tổng quan Kiến trúc (Architecture Overview)

### 2.1 Kiến trúc tổng thể (High-level Architecture)

<!-- ASCII (hoặc mermaid) topology thể hiện các hệ thống feature này chạm tới:
     client → gateway → service(s) → data store / API ngoài. Chỉ giữ các component
     mà PRD NÀY thực sự dùng. Nguồn: architecture.md / project-context.yaml (services, stack). -->

```
{Sơ đồ ASCII hoặc mermaid các component feature này chạm tới}
```

> **Lưu ý:** {chỉ ra dữ liệu nào lấy live từ API ngoài vs lưu trong DB sở hữu, và lớp cache + TTL nếu có.}

### 2.2 Mẫu giao tiếp (Communication Patterns)

| Mẫu | Dùng cho | Phạm vi (UC/SC) |
|---------|-------|---------------|
| {Client → Gateway → API} | {auth / action} | {UC1} |
| {API → API ngoài} | {lấy gì, cache TTL} | {UC1-SC…} |

---

## 3. Mô hình Dữ liệu (Data Model)

<!-- Nguồn: core-entities.md (entity sở hữu) + mệnh đề Then của BDD (state) + PRD.
     Phân biệt entity SỞ HỮU (trong DB) với model NGUỒN-API (lấy live, không lưu).
     Chỉ liệt kê field mà PRD này đọc hoặc ghi. -->

### 3.1 Thiết kế Entity (Entity Design)

#### {EntityName} ({DB entity | POCO nguồn-API})

{Một dòng: nó biểu diễn gì, và được lưu hay lấy live.}

| Field | Kiểu | Dùng trong {TICKET-ID} |
|-------|------|----------------------|
| `{field}` | `{type}` | {feature này dùng thế nào — đọc/ghi, SC nào} |

<!-- Lặp lại cho mỗi entity. Nếu feature có chuyển trạng thái đáng kể, thêm bảng/sơ đồ
     state nhỏ như dưới. -->

**Chuyển trạng thái (nếu có):**

```
{state A}:  {điều kiện}  → {kết quả / tín hiệu UI}
{state B}:  {điều kiện}  → {kết quả}
```

**Ràng buộc:**
- {invariant enforce ở tầng application/DB, vd đúng một primary cho mỗi tenant}

### 3.2 Quan hệ Entity (Entity Relationships)

```
{sơ đồ quan hệ — cardinality, khoá join, field nào read-only vs sở hữu}
```

### 3.3 Ranh giới Nguồn dữ liệu (Data Source Boundaries)

<!-- Phát biểu gọn PRD NÀY đọc gì vs ghi gì, và cái gì được uỷ thác nơi khác.
     Chống lem phạm vi. -->

**Phạm vi {TICKET-ID}: {ĐỌC … / GHI …}.**

| Trách nhiệm | Trong phạm vi? | Do ai xử lý |
|----------------|-----------|-----------|
| {đọc list đã gộp} | ✅ Có | {endpoint / service} |
| {ghi cờ X} | ✅ Có | {service} |
| {dữ liệu gốc} | ❌ Read-only | {API ngoài + cache} |
| {mối lo module khác} | ❌ Không | {module/team} |

### 3.4 Multi-tenant & Sharding

<!-- Chỉ khi dự án multi-tenant. Nếu không, viết "N/A — single tenant". -->

- {khoá tenant trên entity, cách ly bằng query-filter, phân giải shard — từ architecture.md}

---

## 4. Hợp đồng API (API Contracts)

<!-- Contract backend. Greenfield: thiết kế endpoint từ scenario BDD. Brownfield
     (@trace.api_source = existing): reverse-document API đang chạy as-is và ghi chú
     gap so với kỳ vọng BDD. Đánh dấu REUSE vs NEW rõ ràng.
     PRD CHỈ-CLIENT (không có BDD system/ — feature này không sở hữu backend): ĐỪNG
     bịa contract BE. §4.1 khi đó liệt kê các endpoint mà client TIÊU THỤ (ngoài /
     bên thứ ba / của team khác / có sẵn), đánh dấu "consumed (external)",
     reverse-document từ mệnh đề Then của BDD client + PRD; chỉ điền §4.2/§4.3 nếu
     biết shape. Nếu feature không gọi mạng gì cả → viết "N/A — client-only, no backend".
     §4.5.4 ánh xạ method client tới bất cứ gì §4.1 liệt kê (hoặc không có). -->


### 4.1 Endpoints

```
{METHOD} {/path}          # NEW | REUSE ({nguồn}) — {mục đích một dòng}
```

### 4.2 Model Request/Response (Request/Response Models)

<!-- Thể hiện shape DTO theo idiom của stack. Ghi rõ field nào đến từ DB vs API ngoài. -->

```{lang}
{định nghĩa DTO kèm comment nguồn từng field}
```

### 4.3 Validation & Mã lỗi (Validation & Error Codes)

**Quy tắc validation:**

```{lang}
{quy tắc validation, theo idiom stack (vd FluentValidation / class-validator)}
```

| Code | HTTP Status | Mô tả | Trace |
|------|-------------|-------------|-------|
| `{ERROR_CODE}` | {4xx/5xx} | {khi nào phát sinh} | {UC1-SC…} |

### 4.4 Logic Handler (endpoint chính)

<!-- Với các thao tác ghi không tầm thường, viết rõ các bước có thứ tự (validation →
     transaction → commit/rollback → return). Giữ sequence diagram và code khớp nhau. -->

**{HandlerName}:**
1. {bước}
2. {bước — ranh giới transaction nếu có}

### 4.5 Ánh xạ Component UI (UI Component Mapping) — {platform} ({framework})

<!-- Thiết kế CLIENT, NHÓM THEO PLATFORM: một section "### 4.5 … — {platform}" cho mỗi
     platform client có trong BDD (một nhóm web, một nhóm app). ĐỪNG đặt tên heading
     này theo màn hình — màn hình/UC nằm ở các sub-block bên dưới.
     Bên trong một nhóm platform:
       • §4.5.1 Cây Component — lặp sub-block theo màn hình/UC:
         "#### 4.5.1.x {Screen} — {UC}". Một PRD nhiều màn hình/UC → nhiều sub-block
         trong CÙNG nhóm platform (không bao giờ tạo nhóm 4.5 thứ hai cho cùng platform).
       • §4.5.2–§4.5.5 — tương tự theo màn hình/UC ở chỗ chúng khác nhau.
       • §4.5.6 Test Selectors — MỘT bảng dùng chung cho cả nhóm platform; cột
         "Phục vụ SC" mang (UC · SC) để consumer per-UC lọc row của mình.
     Append: platform mới → nhóm "### 4.5 — {platform}" mới; màn hình/UC mới trong
     platform đã có → thêm sub-block + row vào §4.5.6 (đừng lặp nhóm).
     Bỏ hẳn §4.5 với PRD backend-only. -->

> **Nguồn:** {file Figma + node id, từ design-spec}
> **Stack:** {framework, state primitive, thư viện component}
> <!-- @figma.url: {url figma cấp node} -->

#### 4.5.1 Cây Component (Component Hierarchy) — {Screen} ({UC})

<!-- Lặp sub-block này theo màn hình/UC trong nhóm platform này (4.5.1.a, 4.5.1.b …). -->

```
{cây component — container vs presentational, con có điều kiện}
```

#### 4.5.2 Ánh xạ file Component (Component File Mapping)

| Component | Path | Loại | Trách nhiệm |
|-----------|------|------|---------|
| `{Component}` | `{path}` | {Feature/Child} | {trách nhiệm} |

#### 4.5.3 Quản lý State (State Management) ({state primitive})

<!-- Shape state suy từ mệnh đề Then của System BDD + shape response từ §4.2.
     Thể hiện giá trị dẫn xuất/tính toán và input của chúng. -->

```{lang}
{khai báo state kèm comment nguồn (mỗi cái map tới field BDD / field BE nào)}
```

#### 4.5.4 Tầng tích hợp API (API Integration Layer — port/adapter)

<!-- Cấu hình modal/route + bản đồ tích hợp API: mỗi method service client → một
     endpoint THẬT từ §4.1 (đừng bịa endpoint). Lỗi → state UI theo từng SC.
     Bảng này là thứ /generate-code --phase=integration đọc để wire adapter thật. -->

| Method client | Endpoint (§4.1) | Map request | Response → model | Lỗi → UI |
|---------------|-----------------|-------------|------------------|-----------|
| {svc.getX()} | {GET /…} | {params} | {DTO → ViewModel} | {4xx → state/toast} |

#### 4.5.5 Ánh xạ Figma → Design System

| Element Figma | Class/token design system | Ghi chú |
|---------------|---------------------------|-------|
| {element} | {class / token} | {size, màu, state} |

#### 4.5.6 Test Selectors — id element cho phần tử có action (hợp đồng QC)

<!-- Test-id ổn định cho mỗi element tương tác để QC định vị trực tiếp (không scan
     runtime). Quy ước: {uc-lower}-{screen}-{element}-{type}; ĐỪNG nhúng số scenario.
     Attribute theo platform: web data-testid · RN testID · Flutter Key/Semantics ·
     iOS accessibilityIdentifier. Dùng lại CÙNG giá trị id trên web/app cho cùng một
     element logic.
     MỘT bảng dùng chung cho cả nhóm platform (phủ mọi màn hình/UC của platform này).
     Cột "Phục vụ SC" mang (UC · SC) để consumer per-UC (generate-code / qc) lọc row
     của mình qua §10. Nhóm §4.5 này vốn đã theo platform, nên platform là ngầm định
     (khối web → web · SC). -->

| Test-ID | Element | Component (§4.5.1.x) | Action | Phục vụ SC (UC · SC) |
|---------|---------|----------------------|--------|---------------------|
| `{uc}-{screen}-{element}-{type}` | {Nút submit} | {Component} | {submit} | {UC1 · SC1, UC1 · SC3} |

---

## 5. Luồng chính (Key Flows — Sequence Diagrams)

<!-- MỘT mermaid sequence diagram cho mỗi scenario đáng kể. Participant xuyên tầng:
     component client → service → API → API ngoài → DB.
     ⚠ id SC chỉ duy nhất trong phạm vi (UC × platform): `{UC}-SC1` ở `system` và
     `{UC}-SC1` ở `web` là HAI scenario KHÁC nhau. Nên gom luồng vào các LANE PLATFORM
     (5.A system · 5.B web · 5.C app) và LUÔN ghi kèm platform với SC, vd
     "(web · UC1-SC1)". Đừng bao giờ viết "UC1-SC1" trơ ở đây — mơ hồ.
     Chỉ đưa các lane có BDD tồn tại trong PRD này. -->

### 5.A Luồng System

<!-- Một diagram cho mỗi scenario system-BDD. Bỏ lane này nếu không có BDD system/. -->

#### 5.A.1 {tên} (system · {UC}-SC…)

```mermaid
sequenceDiagram
    participant {A} as {Actor}
    {…}
```

### 5.B Luồng Web

<!-- Một diagram cho mỗi scenario web-BDD. Bỏ lane này nếu không có BDD web/. -->

#### 5.B.1 {tên} (web · {UC}-SC…)

```mermaid
sequenceDiagram
    {…}
```

### 5.C Luồng App

<!-- Một diagram cho mỗi scenario app-BDD. Bỏ lane này nếu không có BDD app/. -->

#### 5.C.1 {tên} (app · {UC}-SC…)

```mermaid
sequenceDiagram
    {…}
```

<!-- Đánh số trong từng lane: 5.A.1, 5.A.2 … / 5.B.1 … / 5.C.1 …. Với scenario mà
     hiệu ứng lấn sang module khác, ghi "(covered by {OTHER-UC})". -->

**Điểm tích hợp chính (bảng tuỳ chọn cho mỗi luồng):**

| Bước | Chuyển trạng thái | Verify bởi (platform · SC) |
|------|------------------|-----------------------------|
| {bước} | {trước → sau} | {web · UC1-SC…} |

---

## 6. Điểm tích hợp (Integration Points)

| Tích hợp | Chiều | Phương thức | Mô tả |
|-------------|-----------|--------|-------------|
| {Client → API} | Outbound (client) | {REST/Bearer} | {gì} |
| {API → Ngoài} | Outbound (server) | {REST + header} | {gì, cache TTL} |

### 6.1 Event Bus / Messaging

<!-- Event Kafka/queue mà feature này produce/consume. "N/A — no events" nếu không có. -->

{events, hoặc N/A}

### 6.2 Phụ thuộc Cross-Service (Cross-Service Dependencies)

| Service phụ thuộc | Cần gì | Contract | Trạng thái |
|-------------------|---------------|----------|--------|
| {service} | {cần} | {endpoint} | {✅ Có / ⚠️ pending} |

---

## 7. Bảo mật & Phân quyền (Security & Authorization)

### 7.1 Xác thực (Authentication)

{Luồng auth + loại token/TTL. Nguồn: auth PRD + rule dự án.}

### 7.2 Quy tắc Phân quyền (Authorization Rules)

| Action | Role/quyền yêu cầu | Mô tả | Trace |
|--------|--------------------------|-------------|-------|
| {action} | {role} | {enforce thế nào, ở đâu} | {UC1-SC… / ngoài phạm vi} |

---

## 8. Xử lý lỗi & Trường hợp biên (Error Handling & Edge Cases)

<!-- Một row cho mỗi scenario lỗi / biên / âm trong BDD. Phải khớp với mã lỗi §4.3
     và các sequence diagram lỗi §5. -->

| Scenario | Chiến lược | Chi tiết | Trace |
|----------|----------|---------|-------|
| {điều kiện} | {cách xử lý} | {hành vi, message, side effect} | {UC1-SC…, BR…} |

---

## 9. Quyết định Thiết kế (Design Decisions)

<!-- Cái "vì sao" đằng sau các lựa chọn không hiển nhiên, kèm phương án đã cân nhắc.
     Nguồn: alternatives/assumptions của PRD + lập luận lúc sinh. Đây là thứ giúp
     reviewer tin tưởng thiết kế. -->

| # | Quyết định | Lý do | Phương án đã cân nhắc |
|---|----------|-----------|-------------------------|
| 1 | **{quyết định}** | {vì sao} | {phương án — vì sao loại} |

### Ánh xạ NFR → Thiết kế (NFR-to-Design Mapping)

| Nhóm NFR | Yêu cầu PRD | Quyết định thiết kế |
|--------------|-----------------|-----------------|
| {vd Cách ly multi-tenant} | {yêu cầu} | {cơ chế} |

---

## 10. Độ phủ UC (UC Coverage)

<!-- ĐIỂM NEO ĐỂ APPEND **và là MỤC LỤC cho consumer per-UC**. Mọi UC của PRD có một
     row; mọi scenario map tới (các) section thiết kế nó.
     - /generate-tech-docs dùng nó để phát hiện cái gì đã phủ vs còn thiếu.
     - /generate-code, /map-testids, /qc-* làm việc trên MỘT UC của doc cấp-PRD — chúng
       tra UC này Ở ĐÂY trước để định vị scenario của nó → các section/lane-§5 (và do đó
       các endpoint §4.1 mà luồng §5 của nó gọi) thuộc về nó. Đừng lấy
       endpoint/section của UC khác.
     ⚠ Độ phủ scenario khoá theo (platform, SC) vì id SC lặp giữa các platform —
     cột Platform để phân biệt. -->

| UC | Feature | Platforms | Section phủ | Trạng thái |
|----|---------|-----------|------------------|--------|
| {TICKET-ID}-UC1 | {title} | {system, web, app, webview…} | §… | ✅ Covered |

### Độ phủ Scenario UC1

<!-- Một row cho mỗi (platform, SC). Cùng số SC ở platform khác nhau = scenario khác
     nhau → row riêng. -->

| Platform | Scenario | Section | Business rule |
|----------|----------|---------|---------------|
| system | {UC}-SC1: {tên} | §5.A.1 | {BR…} |
| web | {UC}-SC1: {tên} | §4.5 (web), §5.B.1 | {BR…} |

<!-- Lặp một khối scenario-coverage cho mỗi UC. -->

---

## 11. Cross-cutting & Giả định (Tham chiếu ngoài phạm vi)

<!-- Các mối lo upstream mà PRD này PHỤ THUỘC VÀO nhưng không implement (cổng admin,
     UI downstream ở module khác, snapshot đơn hàng…). Giữ để có bối cảnh liên team.
     Tham chiếu UC/team sở hữu + doc. Nguồn: out-of-scope của PRD + ghi chú BR
     "out of scope" trong BDD. -->

### 11.1 {Mối lo}

> {Trích câu BDD/PRD đã scope nó ra ngoài.}

{Giải thích ranh giới + một sequence diagram tham chiếu nếu hữu ích.}

**Sở hữu bởi:** {team / module}. Xem {link}.

---

## 12. GAP Register — ẩn số thiết kế chưa chốt

<!--
  Mọi [GAP: Gn] / [ASSUMPTION: An] đánh dấu inline trong doc PHẢI có đúng MỘT dòng ở đây
  (và ngược lại — không marker mồ côi, không dòng thừa). Đây là sổ quản lý vòng đời ẩn số.

  - Loại:
      • nội tại      — BE tự quyết (đóng: BE điền giá trị, thay marker)
      • cross-service — cần team/partner khác (đóng: qua T7 sign-off của owner)
      • spec-defect  — BDD/PRD sai/thiếu (KHÔNG tự đóng: escalate PO sửa .feature/PRD → regen; xem §9 Conflict)
  - Severity:
      • 🔴 blocker    — code BẮT BUỘC phải có mới đúng → CHẶN approve
      • 🟢 non-blocker — đoán tạm chạy được, chỉ cần confirm → không chặn
    (Nhãn GAP/ASSUMPTION KHÔNG tự quyết severity — một ASSUMPTION vẫn có thể là blocker nếu đoán sai sẽ vỡ.)
  - Status: open → resolved (owner điền giá trị thật → thay marker inline → bump @trace.revision).

  GATE: còn ≥1 🔴 blocker ở trạng thái `open` → @trace.status KHÔNG được lên `approved`
        (giữ `in-review`) → generate-code bị chặn. Cùng pattern design-spec giữ `draft` khi còn ❌ Missing.
-->

| id | Dùng ở (§) | Điều chưa biết | Loại | Owner confirm | Severity | Status | Đóng thế nào |
|----|-----------|----------------|------|---------------|----------|--------|--------------|
| G1 | {§4.3} | {shape lỗi khi partner từ chối} | cross-service | {team-payment} | 🔴 blocker | open | {T7 sign-off — owner cung cấp contract} |
| A1 | {§4.1} | {timeout mặc định 30s} | nội tại | {BE lead} | 🟢 non-blocker | open | {BE xác nhận, thay giá trị} |

> Nếu doc **không có** ẩn số nào → ghi "Không có — mọi thiết kế đều có nguồn." **KHÔNG** bịa dòng để lấp trống.

---

## Tham chiếu Thiết kế Figma (Figma Design References)

<!-- @figma.url: {url figma cấp node cho mỗi màn hình} -->
- {Screen}: [Figma — {frame}]({url})
- Exported: {YYYY-MM-DD}

---

## Changelog

| Revision | Ngày | Thay đổi |
|----------|------|---------|
| 1 | {YYYY-MM-DD} | Sinh lần đầu từ BDD {TICKET-ID} (v{bdd_version}): {liệt kê UC đã phủ} |
<!-- Khi append: thêm một row cho mỗi lần mở rộng, vd "2 | {ngày} | Thêm UC3 (§5.9, §10) từ BDD mới v{n}" -->


---

## Self-Review Gate — REFUTE trước khi ghi *(bắt buộc; chạy cả Fresh lẫn Append)*

Trước khi finalize/append doc, **tự phản biện bản nháp** qua 4 cổng dưới — không phải "sinh rồi tin", mà "sinh rồi ĐỐI CHIẾU với ngữ cảnh rộng hơn + khai GAP tường minh". Nguyên tắc nền: **Completeness ≠ Coverage** — "mọi SC được map" là *cần*, KHÔNG *đủ*; trung thành với lát BDD trước mặt không phải là đúng khi nó chỉ là một lát cắt. Cổng nào không đạt → **sửa, hoặc khai `[GAP]` / `[ASSUMPTION: {owner} confirm]` ngay tại chỗ trong doc** — TUYỆT ĐỐI không bỏ trắng, không bịa lặng.

**Cổng 1 — RECONCILE (đối chiếu chéo, đọc-ngược CÓ GIỚI HẠN).**
Đọc-ngược **bounded** — chỉ 3 nguồn này, KHÔNG kéo toàn bộ BDD của PRD (giữ batch nhỏ):
- **PRD Business Rules** của UC → mọi BR có được §3/§4/§5 phản ánh? Nguồn/sự kiện nào BR yêu cầu mà doc thiếu → thêm, hoặc `[GAP]`.
- **core-entities.md** → mỗi enum/trạng thái doc dùng có **producer** (ai sinh ra giá trị)? Mỗi cột/field có **writer** (luồng nào set)? Enum mồ côi / cột không writer → sửa hoặc flag.
- **Seam UC anh em cùng domain** (chỉ endpoint/entity giao nhau) → không định nghĩa lại contract đã có ở UC khác; không tự mâu thuẫn enum mình vừa viết trong chính doc này.

**Cổng 2 — GAP-or-FLAG (trung thực, không bịa).**
Cần một type/giá trị/policy (auth, config, event, error code) mà **không có nguồn** → **không** chép hình dạng ở boundary, **không** bịa: ghi `[GAP]` hoặc `[ASSUMPTION: {owner} confirm]`. Nếu doc định thiết kế endpoint/flow mà **BDD không định nghĩa nghiệp vụ** (design vượt BDD) → khai GAP + escalate, đừng âm thầm hợp thức hoá.

**Cổng 2b — Client integration (§4.5.4) cũng phải đủ, không chỉ contract BE.** Với MỖI client method mà một màn hình/UC cần, §4.5.4 phải map đủ: **endpoint thật ở §4.1 · nguồn field request/response · error→UI**. Bất kỳ mảnh nào không suy được từ nguồn → khai `[GAP]` + một dòng §12 (đừng để §4.5.4 khuyết một phần rồi lọt xuống `/generate-code --phase=integration` — đó chính là chỗ FE bị hỏi live). **Severity blocker (🔴)** nếu màn hình không render/hoạt động được khi thiếu mapping đó (→ giữ `@trace.status: in-review`, chặn code-gen tới khi đóng); non-blocker (🟢) nếu chỉ là chi tiết phụ đoán tạm được. Đối xứng với contract BE: front-load ẩn số client về tech-docs, đừng đẩy sang lúc wire adapter.

**Cổng 3 — CATALOG (không hard-code).**
Literal & constant rải rác như luật → gom lại: **generic envelope** (đừng typed-per-thing khi PRD-BR đã đưa hợp đồng chung) + bảng catalog (vd `signal_type × source`) + constants **đặt tên**. Fail nếu còn hằng số/enum inline chưa vào catalog.

**Cổng 4 — CROSS-SERVICE & COMPLETENESS.**
- **Ranh giới:** không kéo định danh **nội bộ** service khác vào lookup của mình — dùng abstraction tầng mình. Tương tác 2 service: nói rõ **bên nào own dedup/ordering** + có **ack path** + cross-field invariant.

  > **Thuật ngữ (đọc nhanh):**
  > - **dedup** (khử trùng) — cùng một event/message tới **≥2 lần** thì chỉ được xử lý **một** lần (thường qua *idempotency key*). Thiếu → cộng đôi, ghi đôi.
  > - **ordering** (thứ tự) — event tới **đúng trình tự** phát ra; nếu có thể tới lệch thì chốt: bên nào sắp lại, hay bên nhận phải **chịu được** lệch. Thiếu → state sai (vd "hết hạn" xử lý trước "tạo mới").
  > - **ack path** (đường xác nhận) — bên nhận xử lý xong **báo lại** bên gửi ("đã nhận/đã xử lý") để bên gửi ngừng gửi lại. Thiếu → mất event, hoặc gửi lại vô hạn.
  > - **cross-field invariant** — ràng buộc phải **luôn đúng** giữa nhiều field/entity (vd `tổng các phần = tổng`, `trạng thái = paid ⇒ paid_at ≠ null`).
- **Không happy-only:** mỗi API/flow phải **xét đủ** nhánh happy + partial + error + rollback, kể cả khi BDD chỉ tả happy. Thiết kế nhánh lỗi **từ nguồn** (PRD-BR về xử lý thất bại · pattern rollback ở CLAUDE.md §2 · chuyển-trạng-thái entity ở core-entities). Chi tiết nào **không suy được từ nguồn** (error code/shape của service khác, quyết định retry-hay-fail…) → **khai `[GAP]`, KHÔNG bịa** (Cổng 2). *Bắt buộc CÓ nhánh lỗi ≠ bịa NỘI DUNG nhánh lỗi.*
- **Đủ chi tiết hàm:** hàm cốt lõi tả **điều kiện chọn / nhánh / kết quả**, không dừng ở tên hàm + sequence-diagram.

**Ghi sổ + cổng chặn (bắt buộc khi có GAP).** Mỗi `[GAP: Gn]`/`[ASSUMPTION: An]` khai inline PHẢI có đúng **một** dòng ở **§12 GAP Register** (không marker mồ côi), gán:
- **Loại**: `nội tại` (BE tự quyết) · `cross-service` (team/partner khác — đóng qua T7 sign-off) · `spec-defect` (BDD/PRD sai → escalate PO, xem Conflict register dưới).
- **Severity**: 🔴 `blocker` (code bắt buộc phải có mới đúng) · 🟢 `non-blocker` (đoán tạm chạy được, cần confirm). Nhãn GAP/ASSUMPTION **không** tự quyết severity — một ASSUMPTION vẫn có thể là blocker.
- **Owner** phải confirm + **Status** = `open`.

Nếu §12 còn **≥1 🔴 blocker `open`** → set `@trace.status: in-review` (KHÔNG để `approved`) — `generate-code` bị chặn tới khi đóng hết blocker. (Cùng pattern design-spec giữ `draft` khi còn ❌ Missing.) Nếu 0 ẩn số → §12 ghi "Không có", đừng bịa dòng.

> **Conflict register:** nếu BDD **mâu thuẫn** một invariant kiến trúc (CLAUDE.md §2 / core-entities) → ghi vào §9 Design Decisions như **conflict cần PO sửa `.feature`** (và một dòng §12 loại `spec-defect`), KHÔNG tự quyết, KHÔNG lặng chép.

> **Guardrail nguồn:** 4 cổng này phản chiếu `project-lessons` **L-012** (nếu project có) — nạp ở context-loader Bước 6.7 như ràng buộc cứng, sống sót qua `/update-framework`. Cổng ở đây là lớp framework; L-012 là lớp project-local; cả hai cùng hiệu lực. `/review-tech-docs` **T8/T9** bắt lại ở cổng review nếu gen bỏ lọt.

Ghi số `[GAP]`/`[ASSUMPTION]` đã khai vào report Output.

---

## Công bố — chia sẻ doc (umbrella + spec repo dùng chung)

Nếu `paths.tech_docs_dir` phân giải **dưới `setup.spec_source`** (vd `{spec_source}/specs/{domain}/{prd-slug}/tech-docs`), doc được ghi **bên trong spec submodule**. Công bố nó (commit 2 tầng) để cả team đọc qua `/sync` — tech design gộp per-PRD này là blueprint liên team (API contract cho BE, client design cho FE/App):

```bash
cd {spec_source}
git add {output_path}                   # {TICKET-ID}-tech-design.md
git commit -m "docs({TICKET-ID}): full-stack technical design ({mode})"
git push origin {spec_branch}           # branch teammate theo dõi trong .gitmodules
cd -
git add {spec_source} && git commit -m "chore: bump spec pointer ({TICKET-ID} tech design)"
```

Nếu `tech_docs_dir` là **local** — tức không có `setup.spec_source` (single-repo, hoặc một BE repo đa-service thuần không có spec module dùng chung) — bỏ qua bước này; không cần publish liên-repo.

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/generate-tech-docs hoàn tất — {TICKET-ID}  (tech design full-stack, {mode})
File: {output_path}
Lần này: {UC/platform của batch đã thiết kế}   |   Doc giờ phủ: {mọi UC trong §10}
Self-review: {n} [GAP]/[ASSUMPTION] đã khai   ← resolve/confirm với owner trước khi /review-tech-docs
Next: /review-tech-docs {output_path}
      ← cần SA/Lead review trước khi sinh code
      → nếu sống trong spec repo dùng chung: commit + push spec submodule (xem Công bố ở trên) để teammate đọc qua /sync
      → sau khi approved:
          BE → /generate-code {system .feature}
          FE → /generate-code {web|app .feature} --phase=integration   (wire API thật theo §4.5.4 của doc này)
```

# /generate-bdd — Sinh BDD Feature Files

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


## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

> **Proposal của tester (input tuỳ chọn):** trước khi sinh, quét `{paths.bdd_proposals_dir}/` (mặc định `{spec_source}/feedback/bdd-proposals/`) tìm `{UC-ID}-*.md`. Với mỗi proposal:
> - `Status: accepted` (PO/Dev đã duyệt) → chèn scenario vào `.feature` của UC, **normalize khi chèn** (xem dưới), rồi **lưu trữ**: chuyển file sang `{paths.bdd_proposals_dir}/archived/` + đặt `Status: incorporated`, và **commit + push** spec repo để gỡ khỏi feedback chung.
>
>   **Normalize — bắt buộc, nếu không scenario sẽ vô hình với trace:**
>   1. Gán `# @trace.scenario: {UC-ID}-SC{N}` với `{N}` = số SC **kế tiếp** trong file đó (thay placeholder `SC?`).
>   2. Giữ `# @trace.sc_version: 1.0`. Bổ sung `# @trace.business_rules` nếu proposal để `—` (suy từ AC mà dòng `# Covers:` trỏ tới); không suy được → để `—` và nêu trong report.
>   3. **Strip** tag `@proposed` / `@from-test` — chúng là nhãn vòng đời proposal, không thuộc BDD canonical.
>   4. Đặt scenario vào **đúng NHÓM** theo business theme (C.5), không nối vào cuối file.
>   5. **Append row TSV** cho SC mới (như nhánh "SC mới" ở Write Trace State: `spec_ver = 1.0`, mọi cột gen/test/qc = `—`, `status = UNTRACKED`).
>
>   **Backward-compat:** proposal cũ mang `@trace.uc=` / `@trace.ac=` (vocabulary trước đây, không thuộc contract `.feature`) → tự map sang canonical (`@trace.uc` bỏ — số UC đã có trong `sc_id`; `@trace.ac` → dòng `# Covers:`) và in một dòng cảnh báo khuyến nghị proposal sau viết theo format mới.
> - `Status: proposed`/`rejected` (hoặc thiếu `Status`) → **bỏ qua**, để nguyên cho PO/Dev xử lý (KHÔNG tự đoán, KHÔNG tự đưa vào).
> Bỏ qua sạch nếu folder rỗng.

---

## Sub-Agent Mode — dùng state từ payload *(nếu `_agent_mode`)*

*Chỉ khi Gate Step 0 phát hiện `_agent_mode: true` (đang chạy như sub-agent do orchestration spawn).* Orchestrator (session chính) đã chạy các Guard + chọn platform + nạp design-spec **một lần**; sub-agent KHÔNG lặp lại:
- `active_platform` = `payload.active_platform` → **bỏ qua** Platform Selection / Service Detection.
- `design_coverage` = `payload.design_coverage` → **bỏ qua** "Design Spec — Gate & Load"; nếu rỗng thì chỉ phủ Wireframe PRD.
- **Bỏ qua** Guard "PRD đã duyệt" + Guard Design-Spec bên dưới (orchestrator đã kiểm).
- Đi thẳng tới UC Decomposition + Generate cho `payload.uc_id`, dùng `design_coverage` để phủ Screen States + AC-UI.

---

## Guard — PRD đã duyệt chưa

Đọc `| **Status** |` từ bảng Metadata của PRD nguồn:
- `Status: approved` → tiếp tục bình thường.
- `Status: draft` (hoặc khác `approved`) → **CHECKPOINT cảnh báo mềm** (không chặn cứng — cho phép prototype):
  ```
  ⚠️  PRD đang ở Status: {status} (chưa duyệt). BDD sinh từ PRD chưa chốt có thể phải làm lại.
     Khuyến nghị: PO review xong đặt `| **Status** | approved |` rồi mới sinh BDD.
     Vẫn sinh BDD bây giờ? (Y/N)
  ```
  Chỉ tiếp tục khi người dùng chọn Y.

---

## Phát hiện Repo Mode

Sau khi nạp context, xác định chế độ hoạt động:

- **Spec repo mode**: `project-context.yaml` KHÔNG có section `services` HOẶC `setup.mode: spec`
- **Umbrella mode**: `project-context.yaml` CÓ section `services` VÀ `setup.mode: umbrella`

→ Spec repo mode → tới **Platform Selection** bên dưới (bỏ qua Service Detection)
→ Umbrella mode → tới **Service Detection** bên dưới (bỏ qua Platform Selection)

---

## Platform Selection (chỉ Spec Repo Mode)

*Bỏ qua section này nếu đang chạy umbrella mode.*

Hỏi người dùng chọn platform target:

```
BDD này dành cho platform nào?
  1. web     — FE/Web trong browser (React, Next.js, Angular, Vue, Nuxt)
  2. app     — Mobile native (Flutter, React Native, iOS, Android)
  3. webview — Bundle web NHÚNG trong app native (Phaser game, mini-app)
  4. system  — System/BE BDD (tổng hợp từ BDD client có sẵn)
```

*Chỉ hiện những platform project thực sự dùng: nếu `services.{domain}` là map-theo-platform (context-loader 2b) thì lấy đúng các sub-key của nó làm danh sách; ngược lại hiện đủ bốn. `webview` là một **delivery surface** riêng — không phải `web` (browser) và không phải `app` (native) — nên nó có BDD, design-spec và sổ trace riêng.*

Chờ người dùng chọn. Set `active_platform` = giá trị đã chọn.

**Output path (spec repo mode):**
`{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC{N}-{slug}.feature`

**Từ vựng theo platform:**

| Platform | "user action" | "type/input" | "observe" | "navigate" |
|---|---|---|---|---|
| web | "clicks" | "types into" / "enters" | "sees" / "the page shows" | "navigates to" / "goes to" |
| app | "taps" | "enters" / "inputs" | "sees" / "the screen shows" | "navigates to" / "opens" |
| system | N/A — dùng business event | — | "the system returns" / "receives response" | — |

---

## System BDD Synthesis (active_platform = system)

*Chỉ áp dụng khi platform = `system`. Bỏ qua với mọi platform client (`web`/`app`/`webview`/…).*

### Step S0 — Brownfield Check

Kiểm tra bảng Metadata của PRD nguồn tìm `| **API Source** | existing |`.

**Nếu `API Source: existing`:**
- API contract đã được PO ghi trong phần "Existing API Contract" của PRD.
- **Skip Steps S1–S3** — không cần scan FE/App BDD, không cần conflict resolution.
- Dùng bảng "Existing API Contract" trong PRD làm contract input cho Step S4.
- Set `# @trace.api_source: existing` trong header của file system BDD được gen.

**Nếu `API Source` không có hoặc không phải `existing`:**
- Tiếp tục Steps S1–S3 (normal synthesis flow).

---

### Step S1 — Scan các BDD FE/App có sẵn

Tìm các BDD có sẵn cho TICKET-ID này:
- Web BDD: `{paths.specs_dir}/{domain}/{prd-slug}/bdd/web/{TICKET-ID}-*.feature`
- App BDD: `{paths.specs_dir}/{domain}/{prd-slug}/bdd/app/{TICKET-ID}-*.feature`

Phân loại feature:

| Điều kiện | Mode |
|---|---|
| Tìm thấy cả web + app BDD | **Multi-platform** — tổng hợp từ cả hai |
| Chỉ tìm thấy web BDD | **Web-only** — tổng hợp từ web |
| Chỉ tìm thấy app BDD | **App-only** — tổng hợp từ app |
| Không tìm thấy FE/App BDD | **Backend-only** — gen trực tiếp từ PRD |

---

### Step S2 — Trích contract kỳ vọng theo từng platform

Với mỗi file BDD tìm thấy, trích:
- **Triggers**: hành động người dùng nào gọi backend? (map sang event "request" logic)
- **Expected response data**: mỗi mệnh đề `Then` cần field/shape gì từ hệ thống?
- **Error signals**: backend phải báo hiệu các trạng thái lỗi nào?
- **Business rules**: mỗi platform giả định hệ thống thực thi các invariant nào?

---

### Step S3 — Cross-Platform Conflict Check (chỉ multi-platform mode)

*Bỏ qua nếu web-only, app-only, hoặc backend-only.*

So sánh các contract đã trích giữa các platform. Gắn cờ conflict nếu bất kỳ cái nào khác nhau:

| Loại conflict | Ví dụ |
|---|---|
| **Response shape mismatch** | Web mong `{ token, redirect_url }`, App mong `{ token, user_profile }` |
| **Error semantics mismatch** | Web mong HTTP 423 cho lock, App mong custom error code `ACC_LOCKED` |
| **Business rule contradiction** | Web BDD nói "lock sau 5 lần", App BDD nói "lock sau 3 lần" |
| **Data field conflict** | Web mong `expires_in: seconds`, App mong `expires_at: ISO timestamp` |

**Nếu phát hiện conflict → CHECKPOINT (bắt buộc, không bỏ qua được):**

```
⚠️  CROSS-PLATFORM CONTRACT CONFLICT
──────────────────────────────────────────────────────────────────
Feature : {TICKET-ID} — {UC name}

Conflict 1: Response shape mismatch
  Web BDD (Then): user sees dashboard → implies { token, redirect_url }
  App BDD (Then): app navigates to HomeScreen → implies { token, user_profile }

Resolution options:
  A — Union response
      BE trả về tất cả field: { token, redirect_url, user_profile }
      Client bỏ qua field không dùng. Đơn giản, hơi over-fetch.
  B — Platform hint trong request
      Client gửi X-Platform: web|app trong header, BE tuỳ biến response.
      Response gọn hơn, nhiều BE logic hơn.
  C — Endpoint riêng
      POST /auth/login/web  và  POST /auth/login/app
      Linh hoạt tối đa, nhiều endpoint phải bảo trì hơn.
  D — Custom: mô tả cách của bạn
──────────────────────────────────────────────────────────────────
Chọn resolution cho mỗi conflict (A/B/C/D):
```

Chờ PO giải quyết từng conflict. Ghi mỗi quyết định thành annotation `# @system.resolution:` trong file system BDD được gen.

**Nếu không có conflict → tới Step S4 trực tiếp.**

---

### Step S4 — Sinh các scenario System BDD

Sinh scenario dựa trên mode và các conflict đã giải quyết:

- **Multi-platform**: tổng hợp từ cả contract web + app, áp dụng các resolution đã chọn
- **Web-only / App-only**: suy ra từ contract của một platform
- **Backend-only**: suy ra trực tiếp từ AC/BR của PRD dùng ngôn ngữ business event (không phải HTTP)

Từ vựng step của System BDD (luôn dùng — bất kể từ vựng FE/App):
- Triggers: "the system receives {event}" / "a {actor} submits {action}"
- Assertions: "the system returns {data}" / "the system signals {error}" / "the system stores {state}"
- KHÔNG dùng từ UI (click, tap, see, navigate) trong system BDD

**Nếu multi-platform với resolution A (union):**
- System BDD thể hiện contract response đầy đủ: tất cả field từ mọi platform
- Thêm comment: `# @system.resolution: union — clients receive all fields`

**Nếu resolution B (platform hint):**
- Viết `Scenario Outline` riêng dùng Examples table cho biến thể response `web` vs `app`
- Thêm comment: `# @system.resolution: platform-hint — X-Platform header determines response shape`

**Nếu resolution C (endpoint riêng):**
- Viết Scenario riêng cho mỗi endpoint
- Ghi rõ việc tách endpoint trong phần SCOPE

---

## Service Detection (chỉ Umbrella Mode)

*Bỏ qua section này nếu đang chạy spec repo mode.*

Routing service là **domain-keyed** và **context-loader (Bước 1.5) đã phân giải sẵn** từ `@trace.domain`/Domain của PRD — KHÔNG re-resolve ở đây, chỉ dùng lại các biến đã set:
- `active_service` = path submodule đã phân giải (dạng phẳng), hoặc `"multi"` (dạng map-theo-platform ở cấp PRD — chưa chốt 1 platform), hoặc `"unresolved"` nếu domain không khớp entry nào, hoặc bỏ trống ở single-service.
- `active_module` = module của service (`services.{domain}.module`, đã override `tech_stack.module` ở Bước 1.5) — dùng cho từ vựng bên dưới. Với `"multi"` + `service_candidates_kind = platform`, lấy module theo từng platform từ `service_candidates.{platform}.module` khi sinh `bdd/{platform}/` (context-loader đã làm phẳng các entry `by_prd_slug` nên luôn có `.module` trực tiếp).

Chỉ cần kiểm tra trạng thái đã phân giải:

| Trạng thái (từ context-loader) | Hành động |
|---|---|
| `active_service` đã phân giải thành path service | Tiếp tục với `active_module` đã set. |
| `active_service = "multi"` **và** `service_candidates_kind = platform` (domain map-theo-platform, target PRD chưa gắn 1 platform) | Tiếp tục — BDD là artifact liên team, platform-split. Sinh `bdd/{platform}/` cho các platform có trong `service_candidates`; từ vựng lấy theo `service_candidates.{platform}.module`. KHÔNG cần chốt 1 service. Platform nào bị đánh dấu `unresolved` trong candidates (thiếu `prd_slug` tương ứng dưới `by_prd_slug`) → vẫn sinh BDD nhưng gắn ⚠️ nêu rõ chưa có repo nhận. |
| `active_service = "multi"` **và** `service_candidates_kind = prd_slug` | **DỪNG.** Candidates đang là map feature→repo, KHÔNG phải map platform — sinh `bdd/{slug}/` là sai bố cục. Yêu cầu người dùng chạy lại với target file cụ thể để `prd_slug` được xác định. |
| `active_service = "unrouted"` (chưa có mapping cho domain/platform/prd_slug này) | **TIẾP TỤC** — ghi `@trace.service: unrouted`, in ⚠️, **KHÔNG dừng**. Xem khối bên dưới. |
| `active_service = "unresolved"` (config **sai cấu trúc**: entry vừa có `path` vừa có `by_prd_slug`, hoặc `by_prd_slug` lồng nhau) | **DỪNG**, báo đúng key sai để người dùng sửa `project-context.yaml`. Đây là **bug cấu hình**, không phải trạng thái chờ. |
| Single-service (không có section `services`) | `active_module = tech_stack.module` (đã set ở Bước 6.5). Tiếp tục. |

#### `unrouted` — vì sao KHÔNG chặn ở đây *(G51)*

PRD và BDD là artifact **nghiệp vụ**. PO biết `domain` (auth, payment) và biết `platform`
(*"người dùng làm việc này trên web hay app?"*) — nhưng **không** biết code sẽ nằm repo nào,
và ở feature đầu tiên của một domain mới thì **chưa ai quyết**.

Chặn BDD vì lý do đó là đặt cổng **sai phase**: nó chặn phase KHÔNG CẦN biết, trong khi
`/generate-code` — phase **buộc phải** biết mới ghi được file — mới là chỗ đúng để chặn.

**Việc cần làm khi `unrouted`:**
1. `@trace.service: unrouted` vào header `.feature` (đừng để trống — cột 23 sẽ mất thông tin)
2. **`active_module` chưa biết** ⇒ hỏi người dùng `platform` trực tiếp (`web`/`app`/`system`) thay
   vì suy từ module. Đây là câu hỏi **nghiệp vụ**, PO trả lời được. Từ vựng step lấy theo platform:
   `web` → *clicks* · `app` → *taps* · `system` → *calls the API*.
3. In ⚠️ vào report:
   ```
   ⚠️ service: unrouted — chưa có mapping cho domain "{domain}"{ platform "{platform}"} trong
      services: của project-context.yaml.
      BDD đã sinh xong và ĐÚNG — đây là việc của architect, không phải của bạn.
      Architect thêm mapping → /validate-traces tự nâng unrouted → path, KHÔNG cần chạy lại lệnh này.
      /generate-code sẽ DỪNG cho tới khi có mapping (nó cần biết ghi vào repo nào).
   ```

> **Vì sao không cần chạy lại `/generate-bdd`:** `/validate-traces` đọc lại `services:` **mỗi lần
> chạy** và nâng `unrouted` → path khi mapping xuất hiện — cùng cách nó đã làm với `spec_ver`.
> Sổ **tự lành**.

### Phân giải `active_platform` (umbrella mode)

Umbrella mode không hỏi platform (khác spec repo mode) — nó **suy** từ module của service. Bắt buộc phải có giá trị: `active_platform` đi vào **path file**, vào **header `@trace.platform`**, và vào **tên sổ trace** `{UC-ID}-{platform}.tsv`.

| `active_module` | → `active_platform` |
|---|---|
| react · nextjs · vue · nuxt · angular | `web` |
| flutter · react-native · ios-swiftui · android-compose | `app` |
| java-spring · golang · dotnet · php-laravel | `system` |
| context-engineering · phaser-game | theo `platform_type` của stack-profile (`backend` → `system`, còn lại → `web`) |

- `active_service = "multi"` + `service_candidates_kind = platform` → **nhiều** `active_platform` (một cho mỗi platform trong `service_candidates`); sinh một file `.feature` cho mỗi platform, module lấy theo `service_candidates.{platform}.module`.
- Không suy được (module lạ, không có trong bảng và không có `platform_type`) → **DỪNG**, hỏi người dùng chọn `web`/`app`/`system`. **KHÔNG** ghi file khi chưa có `active_platform` — file thiếu platform sẽ vô hình với `/validate-traces` và va chạm tên với platform khác.

**Output path (umbrella mode):** `{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC{N}-{slug}.feature`

*(**Subfolder `{platform}/` LUÔN có — mọi mode.** `web` và `system` của cùng một UC là hai file khác nhau: nếu bỏ subfolder, chúng ra cùng filename và **ghi đè nhau**; ngoài ra trace tách theo platform (`{UC-ID}-{platform}.tsv`) nên bố cục spec phải tách tương ứng.*
*Cái KHÔNG thêm là subfolder theo **service**: feature-package đã domain-scoped sẵn ở `{domain}/`, mà service route 1-1 theo domain — thêm subfolder service chỉ lặp lại domain. `active_service` chỉ dùng cho `service_root`/từ vựng, KHÔNG vào path spec.)*

**Từ vựng theo platform** — điều chỉnh cách viết step BDD theo `active_module`:

| Platform type | Modules | "click" | "type" | "see" | "navigate" |
|---|---|---|---|---|---|
| Web | react, nextjs, vue, nuxt, angular | "clicks" | "types into" / "enters" | "sees" / "the page shows" | "navigates to" / "goes to" |
| Mobile | flutter, react-native, ios-swiftui, android-compose | "taps" | "enters" / "inputs" | "sees" / "the screen shows" | "navigates to" / "opens" |
| Backend / API | java-spring, golang, dotnet, php-laravel | *(không có UI step — dùng)* "submits a request" / "calls the API" | — | "receives response" / "the system returns" | — |

Áp dụng từ vựng này âm thầm khi viết step Gherkin. KHÔNG trộn từ web và mobile trong cùng một file feature.

---

## Design Spec — Gate & Load (chỉ FE/App)

*Chỉ chạy khi target platform là FE/App — spec mode: `active_platform` là platform client (mọi giá trị **trừ** `system` — `web`, `app`, `webview`, `app-ios`, `app-android`, …); umbrella mode: `active_module` là module FE/App (react/nextjs/vue/nuxt/angular/flutter/react-native/ios-swiftui/android-compose). Bỏ qua HOÀN TOÀN với `system` và backend/brownfield.*

**1. Định vị design-spec của platform:**
`{paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{active_platform}-{slug}.md`
- `app-ios`/`app-android` không có bản riêng → fallback bản `-app-`.

**2. Guard — sign-off & độ tươi (cảnh báo MỀM, đồng bộ Guard PRD — không chặn cứng):**
Đọc `| **Status** |` và `| **Built from PRD** |` từ Metadata design-spec.
- Không tìm thấy file, HOẶC `Status ≠ approved`, HOẶC design-spec còn màn ❌ Missing, HOẶC `Built from PRD` ≠ `| **Version** |` của PRD hiện tại (design-spec **lỗi thời** so với PRD) → CHECKPOINT:
  ```
  ⚠️  Design Spec cho {active_platform} chưa sẵn sàng (Status: {status} / không có / còn màn thiếu Figma / lỗi thời: dựng từ PRD v{old}, PRD giờ v{new}).
     BDD FE/App nên sinh từ design-spec đã approved & cập nhật để phủ đúng Screen States + AC-UI.
     Khuyến nghị: hoàn tất / cập nhật design-spec (chạy lại /generate-design-spec nếu PRD đã đổi) rồi mới sinh BDD.
     Vẫn sinh BDD bây giờ? (Y/N)
  ```
  Chỉ tiếp khi chọn Y. Nếu Y mà KHÔNG có design-spec → bỏ qua bước 3 (chỉ phủ Wireframe PRD §4b).
- `Status: approved` VÀ `Built from PRD` khớp PRD hiện tại → nạp design-spec, sang bước 2.5.

**2.5. Sanity-scan nội dung design-spec** (lớp soi độc lập — D1; soi nhanh ngay tại chỗ đã mở file, trước khi dùng):
Quét tìm cờ đỏ; nếu có → **cảnh báo mềm** (liệt kê + hỏi "Vẫn dùng design-spec này? (Y/N)"):
- Màn nào thiếu state `loading`/`error`/`empty`.
- AC-UI nào mơ hồ, không testable ("looks good" / "đẹp" / không pass-fail rõ).
- Component còn `[NEW]` / `[TODO]` (chưa chốt với designer).
- Còn `❌ Missing` frame (lẽ ra Status đã `draft` — approved mà vẫn Missing là bất thường).
Bắt lỗi design-spec **ngay trước khi nó lan xuống BDD**. Chọn N → quay lại hoàn thiện design-spec; chọn Y → sang bước 3.

**3. Trích coverage từ design-spec** (lưu thành `design_coverage`, dùng ở UC Decomposition + Coverage Matrix):
- **Screen States** ≠ `default` cho mỗi màn: `loading`, `error`, `empty`, `success` (cái nào có).
- **AC-UI behavioral**: giữ AC-UI mà cột `Verified by` là **PO/QA** và mô tả outcome quan sát được (lỗi + đường khôi phục, empty state + CTA, gesture điều hướng, có loading state). **LOẠI AC-UI visual thuần** (khớp Figma trong dung sai, tương phản WCAG, màu/pixel/animation — thường `Verified by: Designer`): Designer/QA review riêng, KHÔNG đưa vào Gherkin (giữ R3/R5/R6).
- **Dedup**: nếu một Screen State / AC-UI đã trùng một AC nghiệp vụ của PRD → không tạo SC mới, chỉ ghi nhận đã phủ.

---

## Orchestration Check

*Bỏ qua section này nếu đã ở sub-agent mode (Step 0 của Gate đã kích hoạt).*

Sau khi nạp context, kiểm tra PRD target có đủ lớn để cần sub-agent không:

1. Đếm các heading `#### {TICKET-ID}-UC` trong PRD → **UC count**.
2. Đếm tổng số dòng trong PRD → **line count**.
3. Nếu **UC count > 3** HOẶC **line count > 300**:
   - Chuyển sang orchestration mode — theo `steps/spawn-agent.md`.
   - Session chính trở thành orchestrator: spawn 1 sub-agent cho mỗi UC.
   - Mỗi sub-agent chạy `/generate-bdd` với payload `_agent_mode: true`.
   - Thu thập kết quả và hiện report đã merge.
   - **KHÔNG tiếp tục các bước bên dưới.**
4. Nếu UC count ≤ 3 VÀ line count ≤ 300 → tiếp tục Version Check bên dưới (single-session mode).

---

## Sub-Agent Return Format

*Section này áp dụng khi chạy như sub-agent (Gate Step 0 phát hiện `_agent_mode: true`).*

Sau khi sinh tất cả file `.feature` và `.tsv` cho UC được giao, trả về JSON kết quả có cấu trúc (theo `steps/spawn-agent.md` Step E):

```json
{ "uc_id": "{TICKET-ID}-UC{N}", "files_created": ["path/to/file1", "path/to/file2"], "status": "success | error", "errors": [] }
```

---

## Version Check

Trước khi sinh, kiểm tra các file `.feature` có sẵn cho PRD này:

1. Search path (**giống nhau ở cả hai mode** — bố cục `bdd/{platform}/` là chuẩn duy nhất):
   `{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC*.feature`
   > **Legacy:** nếu không khớp gì, thử thêm một lần ở bố cục phẳng cũ `…/bdd/{TICKET-ID}-UC*.feature`. Khớp → xử lý như file có sẵn **và** in cảnh báo: `⚠️ File .feature đang ở bố cục phẳng (trước v0.4.1). Chạy: npx sdd-framework --migrate-bdd-platform để chuyển sang bdd/{platform}/.` Đừng tự di chuyển file trong lệnh này.
2. Đọc `| **Version** |` hiện tại của PRD từ metadata (vd: `1.2`).

**Nếu không có file feature nào** → gen mới, tiếp tục bình thường. Dùng version PRD làm `@trace.prd_version`.

**Nếu tìm thấy file feature có sẵn**:
- Đọc `# @trace.prd_version:` từ header file feature có sẵn.
- So với version PRD hiện tại.
- Nếu **giống** → hỏi: "BDD đã sinh từ PRD v{version}. Gen lại? (Y/N)"
- Nếu **khác** (PRD đã cập nhật):
  1. Đọc `# Change Log` từ PRD — trích tất cả row mới hơn `@trace.prd_version` của BDD hiện có. **Nếu `@trace.prd_version` của BDD CŨ HƠN row cũ nhất còn trong bảng** (lịch sử đã bị cắt sang `changelog/`) → không thấy đủ diff → **khuyến nghị F** (gen lại toàn bộ), đừng tin Y một phần.
  2. Hiện CHECKPOINT:
     ```
     ⚠️  Phát hiện PRD version drift
     BDD được sinh từ PRD v{old}
     PRD giờ ở v{new}

     Thay đổi kể từ v{old}:
       {changelog rows}

     Options:
       Y — chỉ cập nhật các scenario bị ảnh hưởng
       F — gen lại toàn bộ scenario
       N — huỷ
     ```
  3. Tiếp tục theo lựa chọn của người dùng — nhưng **khuyến nghị Y hay F thì đọc `{changelog_scope}` của các row đó** *(contract: `bin/trace-schema.json` → `changelog_row_contract`; cùng dữ liệu `/validate-traces` Step 4 dùng để lọc 🟠 vs ⓘ)*:

     Mỗi mệnh đề trong `{changelog_scope}` mở đầu bằng đơn vị sở hữu (`{UC-ID}:` hoặc `PRD-global:`). Dựng `affected_ucs` **theo đúng ba bước của `/validate-traces` Step 4**, gồm cả bước 2 — phép phân giải **`BR/AC → UC sở hữu`**: `BR{n}` → UC có BR đó trong bảng Business Rule (PRD §3) · `AC{n}` → UC có AC đó ở dòng `**AC liên quan:**`. Rồi:

     | Tình trạng row trong khoảng | Khuyến nghị |
     |---|---|
     | **Bất kỳ** row **mơ hồ** (không nêu được đơn vị sở hữu, hoặc BR/AC không phân giải được về UC) | **F** — gen lại toàn bộ. Không chắc đổi ở đâu thì quét rộng |
     | UC của target **có** trong `affected_ucs` | **Y** — cập nhật đúng scenario của UC đó |
     | UC của target vào `affected_ucs` **CHỈ** qua mệnh đề mang hậu tố **`[no-behavior]`** | **N** — không có gì để gen lại; đó là thay đổi thuần cấu trúc, producer đã chứng minh không đổi hành vi |
     | UC của target **không** có trong `affected_ucs` | **N** — bump này không đụng UC này. Nhãn version lệch sẽ được `/validate-traces --realign-prd-version` dọn |

     > **Vì sao phải phân giải BR/AC (G53), không chỉ khớp UC-ID:** một row `thêm UC7: AC12-AC14; UC3: sửa BR8` là đúng contract. Nhưng nếu ai ghi thiếu `UC3:` — thành `…; sửa BR8` — thì row **không** mơ hồ (nó nêu đủ ID) mà UC3 vẫn không xuất hiện khi chỉ khớp UC-ID. Kết quả: khuyến nghị **N** cho đúng UC vừa bị đổi hành vi. Phân giải BR8 → UC3 là thứ chặn ca đó, và nó phải giống hệt phép phân giải của `/validate-traces` — hai consumer đọc cùng một dòng thì không được hiểu khác nhau.

---

## BDD Writing Rules (R1-R10 — enforce nghiêm)

| Rule | Name | Yêu cầu |
|------|------|-------------|
| R1 | Given/When/Then Semantics | Given=state, When=action, Then=outcome. Mỗi SC cần đủ G/W/T. |
| R2 | One Behavior Per Scenario | 1 SC = 1 behavior. KHÔNG chain When→Then→When→Then. |
| R3 | Ubiquitous Language | KHÔNG dùng UI selector / tên API / tech term trong step. |
| R4 | Outside-in Naming | Tên SC mô tả business outcome. Không "click" / "(Case X)" / tên component. |
| R5 | Declarative over Imperative | Mô tả WHAT (ý định nghiệp vụ), KHÔNG phải HOW (cơ chế UI). |
| R6 | Observable Outcomes Only | Then khẳng định outcome quan sát được. Không phải trạng thái UI trung gian / internal state. |
| R7 | Key Examples / Concrete | Dùng giá trị cụ thể. Không "valid data" mơ hồ. |
| R8 | Independence | SC chạy độc lập. Không phụ thuộc state từ SC khác. |
| R9 | Test Data Completeness | Data table có đủ field để suy ra Then kỳ vọng. |
| R10 | Scope Boundary Explicit | Cross-UC reference dùng cách diễn đạt navigation + comment Note. |

## Project Compliance (fail review nếu thiếu — C.1-C.5)

| Check | Rule |
|-------|------|
| C.1 Wireframe Coverage | Mỗi component/action trong Wireframe (PRD §4b) có ≥1 SC. **FE/App: mỗi Screen State (≠default) và mỗi AC-UI behavioral của design-spec (`design_coverage`) cũng phải có ≥1 SC** — dedup với AC nghiệp vụ PRD; bỏ AC-UI visual thuần. |
| C.2 PRD Traceability | Mỗi AC **thuộc UC này** (đúng tập ở `**AC liên quan:**` của UC trong PRD §3) và mỗi BR trong bảng Business Rule của UC này map tới ≥1 SC. **KHÔNG** phủ AC của UC khác — đó là việc của `.feature` UC đó. *(AC ở PRD là global cấp PRD, còn `.feature` là per-UC; enforce theo nghĩa "mọi AC của PRD" sẽ bắt AI bịa scenario ngoài scope hoặc báo MISSING giả.)* |
| C.3 Business Dictionary | Dùng đúng canonical term từ business-dictionary.md. |
| C.4 Banned Terms | 0 banned term trong file — grep trước khi gen. |
| C.5 NHÓM Grouping | Feature ≥3 SC → PHẢI có NHÓM grouping theo business theme. |

---

## NHÓM Grouping Convention (C.5 — bắt buộc cho ≥3 scenario)

Gom theo business theme, KHÔNG theo happy/negative/edge.

Format header (thụt 2 space, cùng cấp với Background):
```
  # ==========================================================
  # NHÓM N: <Business theme> (<BR refs nếu áp dụng>)
  # ==========================================================
```

Rules:
- Đánh số tuần tự NHÓM 1 → N. SC ID tuần tự xuyên suốt lifecycle (không reset theo từng NHÓM).
- Mỗi NHÓM có thể chứa @happy + @edge + @negative cùng theme.
- SC trong NHÓM không cần theo thứ tự ID (NHÓM 2 có thể chứa SC4, SC8, SC11 nếu cùng theme).

Pattern gợi ý (điều chỉnh theo UC):
- `Init / Save success — valid data combinations`
- `Validation / Block when invalid`
- `Error handling — API fail / system error`
- `Cancel changes / Close modal without saving`
- `Cross-system / Downstream effects`
- `Idempotency & Concurrency`

---

## UC Decomposition

Với mỗi UC trong PRD, trình bày outline SC **trước khi sinh**:
```
{TICKET-ID}-UC1: {Use Case Name}
  NHÓM 1: {Theme} (BR1, BR2)
    SC1 [@happy]:              {business outcome}
    SC2 [@happy @alternative]: {variant outcome}
  NHÓM 2: {Theme} (BR2, BR3)
    SC3 [@edge]:               {edge case}
    SC4 [@negative]:           {error handling}
  ACs covered: AC1, AC2
  BRs covered: {TICKET-ID}-UC1-BR1, BR2, BR3
```

*(FE/App: nếu đã nạp design-spec (xem "Design Spec — Gate & Load"), đưa Screen State ≠default (loading/error/empty) + AC-UI behavioral của `design_coverage` vào outline — dedup với AC nghiệp vụ, đừng tạo SC trùng.)*

CHECKPOINT: "Outline này đúng chưa? Bạn muốn thêm hay bớt SC nào không?" → **Chờ confirm trước khi sinh.**

---

## Generate

**Output path — MỘT bố cục duy nhất cho cả hai mode:**

```
{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC{N}-{slug}.feature
```

`{active_platform}` ∈ `web` | `app` | `system` — từ Platform Selection (spec repo mode) hoặc suy từ `active_module` (umbrella mode, xem §Service Detection). **Không có `active_platform` thì không ghi file.**

Với mỗi UC, ghi vào path trên và set `# @trace.platform: {active_platform}` trong header (**bắt buộc, mọi mode** — `/generate-code` dùng nó để quyết BE/FE và để định vị sổ trace; `/generate-tech-docs` và `context-loader` cũng đọc nó). Dùng từ vựng cho active platform.

```gherkin
# ============================================================
# @trace.id: {TICKET-ID}-UC{N}
# @trace.title: <Feature name>
# @trace.revision: 1  ← field tĩnh; version theo dõi bằng @trace.bdd_version
# @trace.domain: <domain>
# @trace.platform: {active_platform — web | app | system}   ← BẮT BUỘC mọi mode; phải khớp segment bdd/{platform}/ của path
# @trace.service: {service của ĐÚNG platform file này — BẮT BUỘC mọi mode. Nguồn của cột TSV `service`; trace gộp không tách theo service nên đây là chỗ DUY NHẤT mang thông tin sở hữu ở cấp row. Bốn giá trị: {path} · "unrouted" (chưa ai quyết repo — HỢP LỆ, cờ 🟠, KHÔNG chặn) · "unresolved" (config sai cấu trúc — bug) · "—" (single-service). KHÔNG ghi "multi": file này đã có MỘT platform xác định nên service_candidates.{platform}.path đã biết — ghi path đó (G51)}
# @trace.module: {active_module trong umbrella mode; "unknown" trong spec repo mode}
# @trace.status: draft
# @trace.author: AI-generated
# @trace.created_at: {YYYY-MM-DD}
# @trace.prd: {TICKET-ID}
# @trace.prd_version: {đọc từ metadata PRD "| **Version** |"}
# @trace.bdd_version: {cấp FILE — 1.0 nếu gen mới; tăng 0.1 khi gen lại. Khác @trace.sc_version (cấp từng SC) bên dưới}
# @trace.business_rules: {TICKET-ID}-UC{N}-BR{m}, {TICKET-ID}-UC{N}-BR{m+1}   ← {m} lấy NGUYÊN từ PRD §3: BR đánh số LIÊN TỤC toàn PRD, KHÔNG reset theo UC
# @trace.dataset: {domain}.testdata.yaml
# ============================================================

# === CONTEXT ===
# Actor:     <vai trò thực hiện hành động, vd: Consumer, Staff, System>
# Screens:   <các màn liên quan, vd: Cart → Confirm Order → Order Detail>
# Entities:  <business entity, vd: Order, OrderItem, Consumer>
# Pre-state: <state dùng chung trước khi vào các scenario>

# === SCOPE ===
# In:  <UC này phủ gì>
# Out: <cái gì KHÔNG thuộc UC này — link tới UC/feature khác (R10)>

# === BUSINESS DEFINITION ===
# Tham chiếu nhanh các term dùng trong feature này. Chi tiết SoT: business-dictionary.md
# <Term 1>: <định nghĩa ngắn>
# <Term 2>: <định nghĩa ngắn>
#
# --- Popup/Modal Lifecycle (tùy chọn — BẮT BUỘC nếu feature là popup/modal; Pre-merge yêu cầu) ---
# - Open trigger:   <khi nào popup hiển thị, vd: click menu sidebar>
# - Close trigger:  <khi nào popup đóng, vd: F5 / click X / ESC / navigate away>
# - Refresh model:  <data refresh khi nào, vd: mỗi lần open (NO CACHE) / persisted / polling>
# - State reset:    <state nào reset khi đóng/mở lại, vd: pagination, expand, dropdown selection>
#
# --- Display Logic Matrix (tùy chọn — BẮT BUỘC nếu display logic phụ thuộc ≥2 chiều; Pre-merge yêu cầu) ---
# Liệt kê đủ ma trận N×M case + map mỗi case → SC. Tên SC theo pattern `<cấu trúc>: <outcome>` (KHÔNG dùng "(Case X)").
# | # | Dim1 | Dim2 | Format hiển thị        | SC   |
# |---|------|------|------------------------|------|
# | 1 | 0    | 0    | `Tên hàng`             | SC{} |
# | 2 | 0    | 1    | `Tên hàng (đơn vị)`    | SC{} |
# | ... | ...  | ...  | ...                    | ...  |

Feature: <Feature name>
  As a <role>
  I want to <action>
  So that <business value>

  Background:
    Given <precondition dùng chung — dùng alias từ dataset, không phải ID kỹ thuật>

  # ==========================================================
  # NHÓM 1: <Business theme> (<BR refs>)
  # ==========================================================

  # Side-effects: <liệt kê ngắn các Then side-effect cần verify>
  # @trace.scenario: {TICKET-ID}-UC{N}-SC1
  # @trace.sc_version: 1.0   ← cấp SCENARIO. Sửa thân SC này (tên/step/table/side-effect) thì +0.1, nếu không code cũ mãi hiện OK
  # @trace.business_rules: {TICKET-ID}-UC{N}-BR{m}
  @happy
  Scenario: <mô tả business outcome — dùng động từ chính xác: create/receive/assign/block>
    Given <input state — alias từ dataset>
    When <single action>
    Then <main observable outcome>
      And <side-effect 1 khai báo trong header>

  # Side-effects: <...>
  # @trace.scenario: {TICKET-ID}-UC{N}-SC2
  # @trace.sc_version: 1.0
  # @trace.business_rules: {TICKET-ID}-UC{N}-BR{m}
  @happy @alternative
  Scenario: <cùng theme NHÓM 1 nhưng path khác — vd: giá trị enum khác>
    Given <state>
    When <action>
    Then <outcome>

  # ==========================================================
  # NHÓM 2: <Business theme 2> (<BR refs>)
  # ==========================================================

  # Side-effects: <...>
  # @trace.scenario: {TICKET-ID}-UC{N}-SC3
  # @trace.sc_version: 1.0
  # @trace.business_rules: {TICKET-ID}-UC{N}-BR{m+2}
  @edge
  Scenario: <scenario boundary / error>
    Given <state>
    When <action>
    Then <expected error handling>

# === PRD COVERAGE (C.1 + C.2) ===
# AC mapping:
#   AC1 (...) → SC1, SC2
#   AC2 (...) → SC3
# BR mapping (mỗi bullet PHẢI có ≥1 SC — C.2):
#   {TICKET-ID}-UC{N}-BR{m}   (...) → SC1, SC2
#   {TICKET-ID}-UC{N}-BR{m+2} (...) → SC3
# Wireframe mapping (mỗi component/action ≥1 SC — C.1):
#   Screen "<screen name>":
#     [x] <action 1>  → SC1
#     [x] <action 2>  → SC2
#     [ ] <action 3>  → MISSING ← BLOCK MERGE
# Design Spec coverage (chỉ FE/App — C.1 mở rộng; bỏ khối này nếu không nạp design-spec):
#   Screen "<screen>": loading → SC?, error → SC?, empty → SC?
#   AC-UI behavioral: AC-UI3 (lỗi+khôi phục) → SC?, AC-UI4 (empty CTA) → SC?
#     (bỏ AC-UI visual thuần: AC-UI1 khớp Figma, AC-UI5 WCAG — Designer/QA review riêng)

# === PRE-MERGE CHECKLIST ===
# - [ ] Mỗi SC có Side-effects + @trace.scenario + @trace.sc_version + @trace.business_rules
# - [ ] SỬA nội dung một SC (tên / step / data table / side-effect) → đã bump @trace.sc_version của
#       CHÍNH SC đó (+0.1). Quên bump = code sinh từ SC cũ vẫn hiện OK, không ai biết phải regen.
#       (Đổi @trace.business_rules / tag / comment → KHÔNG bump: không đổi hành vi cần implement.)
# - [ ] Coverage Matrix: 0 dòng MISSING (C.1)
# - [ ] FE/App: mỗi Screen State (≠default) + AC-UI behavioral của design-spec có ≥1 SC (C.1 mở rộng)
# - [ ] Mỗi AC/BR map tới ≥1 SC (C.2)
# - [ ] 0 banned term (C.4) — grep file trước khi merge
# - [ ] Feature ≥3 SC có NHÓM grouping theo business theme (C.5)
# - [ ] Nếu popup/modal: khai báo Popup/Modal Lifecycle trong BUSINESS DEFINITION
# - [ ] Nếu display logic ≥2 chiều: Display Logic Matrix trong BUSINESS DEFINITION

```

> **Template này đến từ đâu — đọc trước khi định "customize":**
> Skeleton trên là **single-source** ở `templates/feature.template` **của repo framework**, được `{{include}}` **nướng cứng vào lệnh này lúc `npm run build`**. Muốn đổi cấu trúc mọi `.feature` sinh ra: sửa file đó **trong repo framework** rồi build lại + phát hành.
>
> **Sửa `.agent/templates/feature.template` trong project KHÔNG có tác dụng** — không lệnh nào đọc file đó; nó chỉ là bản tham khảo. Và nó **sẽ bị ghi đè im lặng** ở lần `/update-framework` kế tiếp (`--init` copy `core/` → `.agent/` vô điều kiện; file duy nhất được giữ là `.agent/project-context.yaml`).
>
> Coverage Matrix + Pre-merge Checklist nằm ở **cuối** template, thêm vào cuối mỗi file.

### Bump `@trace.sc_version` *(CHỈ khi gen lại — file `.feature` đã tồn tại)*

*Bỏ qua hoàn toàn khi gen mới: mọi SC nhận `1.0`.*

`@trace.sc_version` là version **của từng scenario** — nó là tín hiệu DUY NHẤT cho `/validate-traces` biết code của SC đó đã lỗi thời (`spec_ver != gen_ver` → `DRIFT`). Không bump = code sinh từ scenario cũ mãi mãi hiện `OK`. Phân biệt với `@trace.bdd_version` (version **cả file**, không đủ phân giải để biết SC nào cần regen).

Trước khi ghi file, với **mỗi** SC, so **thân scenario** bản mới vs bản trên disk theo 4 thành phần:

1. dòng `Scenario:` (tên)
2. chuỗi step `Given` / `When` / `Then` / `And` (nội dung + thứ tự)
3. nội dung data table (nếu có)
4. dòng `# Side-effects:`

| Kết quả so | Hành động |
|---|---|
| Khác ở **bất kỳ** thành phần nào | `@trace.sc_version` += `0.1` (vd `1.0` → `1.1`) |
| Giống hoàn toàn | **GIỮ NGUYÊN** — bump vô cớ sẽ tạo `DRIFT` giả, làm cờ mất giá trị |
| SC mới (chưa có trong bản cũ) | `1.0` |

*(Thay đổi ngoài 4 thành phần trên — `@trace.business_rules`, tag `@happy`/`@edge`, comment — KHÔNG bump: chúng không đổi hành vi mà code phải implement.)*

In danh sách SC được bump vào report cuối để người dùng biết cái nào sẽ hiện `DRIFT`.

---

## Write Trace State

Sau khi sinh tất cả file `.feature`, tạo hoặc cập nhật **sổ trace theo platform** `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{active_platform}.tsv` cho mỗi UC — một sổ riêng cho mỗi platform (`system` / `web` / `app` / `webview` / …). Vì `sc_id` = `{UC-ID}-SC{N}` chỉ độc nhất trong (UC × platform) (mỗi platform tự đánh số SC từ 1), **mỗi platform một file** để scenario platform này không đè/xoá platform khác. Lệnh luôn biết `active_platform` (từ Platform Selection / Service Detection) nên chỉ ghi đúng sổ của platform đang gen.

> **Umbrella + `spec_source`:** cả file `.feature` **và** trace `.tsv` đều ghi vào **spec repo** (`{spec_source}/specs/{domain}/{prd-slug}/bdd/…` và `{spec_source}/.trace/{domain}/{prd-slug}/…`, do context-loader phân giải) — một thao tác ghi **single-repo**, commit/push vào spec submodule. (Trace được gộp trong spec repo để PM quản lý mọi status ở một chỗ; các lệnh phía code cập nhật liên-repo sau.)

**Cột TSV (tab-separated, một header row + một data row cho mỗi scenario):**
```
sc_id\tsc_title\tspec_ver\tgen_ver\timplemented_by\ttest_count\ttest_classes\tdev_selftest\tdev_selftest_at\tqc_status\tqc_run_at\tqc_owner\tqc_blocked_by\tprd_version\tbdd_version\ttech_doc_revision\tfe_tech_doc_revision\tprd_status\tuc_status\tfe_phase\tstatus\tlast_updated\tservice\tdesign_spec_version
```

**Rules:**
- Nếu file chưa tồn tại → tạo với header row + tất cả scenario row.
- Nếu file tồn tại (gen lại) → với mỗi SC trong `.feature` mới:
  - SC đã có trong `.tsv` VÀ `spec_ver` không đổi → chỉ cập nhật: `sc_title`, `prd_version`, `bdd_version`, `prd_status`, `uc_status`, `service`, `design_spec_version`, `last_updated`. Giữ nguyên các cột khác. *(`service` + `design_spec_version` là sự thật cấp-file, làm mới theo `.feature`/design-spec hiện tại — chúng KHÔNG phải tín hiệu nghiệm thu nên làm mới chúng không che giấu gì.)*
  - SC đã có trong `.tsv` VÀ `spec_ver` đổi (scenario bị sửa) → cập nhật: `sc_title`, `spec_ver`, `prd_version`, `bdd_version`, `prd_status`, `uc_status`, `service`, `design_spec_version`, `last_updated` VÀ set `status = DRIFT` ngay (để TSV phản ánh drift mà không cần đợi `/validate-traces`). Giữ nguyên `gen_ver`, `implemented_by`, `test_count`, `test_classes`, `tech_doc_revision`, `fe_tech_doc_revision`.
    **VÀ hạ hiệu lực tín hiệu kiểm thử của đúng SC đó** — spec vừa đổi nên test/QC cũ đang nghiệm thu một hành vi **không còn tồn tại**:
    `dev_selftest → not_run` · `dev_selftest_at → —` · `qc_status → not_run` · `qc_run_at → —`.
    > **Vì sao bắt buộc** *(luật "Làm mất hiệu lực ≠ ghi đè", `rules/workflow.md`)*: không hạ thì chuỗi sau báo xanh sai — spec đổi → `DRIFT` → `/generate-code` sửa method → `gen_ver = spec_ver` → `/validate-traces` Rule 4 cho `OK` (vì `test_count` vẫn > 0) → dashboard hiện `OK · ✅ 10 tests · qc pass` trong khi hành vi mới **chưa được test lần nào**. Đây là lớp lỗi nguy hiểm hơn G1: G1 làm cờ im lặng, cái này làm cờ **nói dối**.
    > **KHÔNG** đụng `test_count`/`test_classes` (test vẫn nằm trên đĩa — số lượng không sai, chỉ nội dung cũ; hạ số sẽ làm tỷ lệ coverage nhảy loạn) và **KHÔNG** đụng `qc_owner`/`qc_blocked_by` (con trỏ tới bug — spec đổi không làm bug biến mất).
    In cảnh báo kèm: `⚠️ {test_count} test của {sc_id} viết cho spec cũ — /dev-gen-test rà lại trước khi chạy`.
  - SC mới (thêm trong lần gen lại này) → append row mới với `gen_ver`, `implemented_by`, `test_count`, `test_classes`, `dev_selftest`, `dev_selftest_at`, `qc_status`, `qc_run_at`, `qc_owner`, `qc_blocked_by`, `tech_doc_revision`, `fe_tech_doc_revision` đều set `—`.
  - SC không còn trong `.feature` (bị xoá / gộp / đổi số) → **phụ thuộc SC đó đã có code chưa:**
    - `implemented_by == —` (**chưa** có code) → **xoá row**. Không có gì mồ côi.
    - `implemented_by != —` (**ĐÃ** có code) → **GIỮ row**, set `status = ORPHANED`, giữ nguyên `implemented_by` / `test_count` / `test_classes` / các cột qc, cập nhật `last_updated`. **KHÔNG xoá** — xoá row thì method đó thành vô hình: không `UNTRACKED`, không `GAP`, không `DRIFT`, không xuất hiện ở report nào, mà vẫn nằm trong code và vẫn được caller gọi. Coverage còn *đẹp hơn* thực tế vì mẫu số nhỏ đi.
      In cảnh báo nổi bật ở report cuối:
      ```
      ⚠️  ORPHANED — {UC-ID}-SC{N} "{sc_title}" đã bị xoá khỏi .feature nhưng còn code:
           {implemented_by}  (+ {test_count} test: {test_classes})
         Không tự hết — chọn MỘT:
           (a) behavior không còn cần → xoá method + test, rồi xoá row khỏi .tsv
           (b) SC bị xoá do nhầm      → đưa scenario trở lại .feature (row về DRIFT/OK bình thường)
         (/validate-traces giữ cờ ORPHANED 🔴 và chặn "pass" tới khi xử lý xong.)
      ```
    *(An toàn: sổ này chỉ chứa scenario của `{active_platform}`, so với `.feature` của chính platform đó — không bao giờ đụng scenario platform khác.)*

**Giá trị ghi cho mỗi scenario:**

| Cột | Giá trị |
|--------|-------|
| `sc_id` | `{UC-ID}-SC{N}` |
| `sc_title` | text title của scenario |
| `spec_ver` | `@trace.sc_version` của scenario này |
| `gen_ver` | `—` (chưa gen) |
| `implemented_by` | `—` |
| `test_count` | `—` |
| `test_classes` | `—` |
| `dev_selftest` | `—` (chưa chạy test) |
| `dev_selftest_at` | `—` |
| `qc_status` | `—` (kết quả QC automation chính thức — set bởi `/qc-run-test`) |
| `qc_run_at` | `—` |
| `qc_owner` | `—` (SC chưa pass đang chờ ai: `dev` / `po` — set bởi `/qc-run-test` + `/report-bug`) |
| `qc_blocked_by` | `—` (`BUG-{id}` / `GAP-{id}` liên kết — set bởi `/qc-run-test` + `/report-bug`) |
| `prd_version` | `@trace.prd_version` từ header `.feature` |
| `bdd_version` | `@trace.bdd_version` từ header `.feature` |
| `tech_doc_revision` | `—` (revision tech-doc gộp `{TICKET-ID}-tech-design.md` — set bởi `/generate-code` + `/review-tech-docs`) |
| `fe_tech_doc_revision` | `—` (revision cùng tech-doc gộp, ghi khi FE `--phase=integration` wire theo §4.5.4 — set bởi `/generate-code`) |
| `prd_status` | đọc `\| **Status** \|` từ metadata PRD |
| `uc_status` | `draft` cho UC mới; giữ giá trị hiện có khi gen lại |
| `fe_phase` | `—` (set bởi `/generate-code --phase` khi FE implement) |
| `status` | `UNTRACKED` |
| `last_updated` | hôm nay `YYYY-MM-DD` |
| `service` | `@trace.service` từ header `.feature` — đội/submodule sở hữu scenario này. Bốn giá trị: `{path}` · **`unrouted`** (chưa ai quyết repo — hợp lệ, cờ 🟠) · `unresolved` (config sai cấu trúc — bug) · `—` (single-service). **Đừng bỏ trống** — trace gộp không tách theo service nên đây là chỗ DUY NHẤT mang thông tin sở hữu ở cấp row.<br>⚠️ **KHÔNG ghi `multi` vào file `.feature`** *(G51)*: khi split theo platform, mỗi file đã có **một** platform xác định nên `service_candidates.{platform}.path` **đã biết** — ghi path đó. `multi` chỉ là trạng thái trung gian ở cấp PRD trong bộ nhớ, không phải giá trị được ghi ra. |
| `design_spec_version` | `\| **Version** \|` của design-spec đã nạp ở §Design Spec — Gate & Load. `—` cho `system`/backend (không có design-spec), và `—` khi người dùng chọn "Y — vẫn sinh BDD" mà không có design-spec. |

## Refresh Panel Mirror
# Làm mới panel mirror của Living Docs *(local)*

> **Hai vị trí, HAI TÊN KHÁC NHAU — đọc trước khi sửa gì ở đây.**
>
> | Đường dẫn | Vai trò | Git |
> |---|---|---|
> | `{paths.trace_dir}` (`.trace/` hoặc `{spec_source}/.trace/`) | **AUTHORITATIVE** — TSV + `trace-history.jsonl`. Không regenerate được. | **PHẢI commit** |
> | `./.trace-mirror/` ở gốc workspace hiện tại | **MIRROR** — bản sao tiện cho panel VS Code. Sinh lại được bất cứ lúc nào. | **Luôn gitignore** |
>
> Trước v0.4.3 cả hai đều tên `.trace`, nên một luật gitignore theo tên có thể **xoá sạch sổ gốc**
> khi dev mở thẳng spec repo làm workspace (lúc đó hai path bằng nhau). Hai tên khác nhau làm
> luật git đọc được bằng mắt và **không còn ca nhập nhằng nào**: `.trace-mirror/` không bao giờ
> commit, `.trace/` không bao giờ gitignore.

## Khi nào CÓ mirror

Mirror chỉ tồn tại khi **`{paths.trace_dir}` nằm NGOÀI workspace hiện tại** — panel đọc từ workspace đang mở nên cần một bản sao ở đây.

| Tình huống | `{paths.trace_dir}` | Có mirror? |
|---|---|---|
| Single-service | `./.trace` — **trong** workspace | ❌ Không. Panel đọc thẳng `.trace/trace-report.json`. Bỏ qua cả file này. |
| Dev mở thẳng **spec repo** | `./.trace` — **trong** workspace | ❌ Không. Như trên. |
| Umbrella + `spec_source`, dev đứng ở umbrella hoặc service submodule | `{spec_source}/.trace` — **ngoài** workspace | ✅ Có |
| Umbrella legacy (không `spec_source`) | `.trace` theo từng service | ✅ Có |

Quy tắc một dòng: **phân giải `panel_mirror = ./.trace-mirror` ở gốc workspace hiện tại; nếu `{paths.trace_dir}` đã nằm trong workspace này thì bỏ qua toàn bộ bước mirror.**

---

Sau khi cập nhật TSV authoritative tại `{paths.trace_dir}`:

**Khi `setup.spec_source` được đặt (trace gộp — trường hợp phổ biến):**
`{paths.trace_dir}` phân giải về `{spec_source}/.trace` — vị trí authoritative duy nhất.
Lệnh này chạy từ `service_root`, nên thao tác ghi là **liên-repo vào spec submodule**;
commit/push spec submodule cho lần cập nhật trace (giống như `feedback/`).

1. Phân giải `panel_mirror = ./.trace-mirror` tại **gốc workspace hiện tại**.
2. Nếu `{paths.trace_dir}` **không** nằm trong workspace hiện tại, copy mỗi
   `{UC-ID}-{platform}.tsv` vừa cập nhật → `{panel_mirror}/{UC-ID}-{platform}.tsv` (tạo thư mục; ghi đè).
   Không namespace theo service — chỉ có một bộ trace; service sở hữu được mang ở
   **cột `service` (cột 23)** của chính từng row, do `/generate-bdd` ghi từ `@trace.service`.
3. **KHÔNG copy `trace-history.jsonl`.** Nó là dữ liệu tích luỹ, không phải thứ sinh lại được —
   nhân bản nó ra một thư mục gitignore là tạo hai lịch sử lệch nhau rồi mất bản thật.

**Legacy (không có `spec_source` — trace theo service):**
Copy mỗi `{UC-ID}-{platform}.tsv` vừa cập nhật → `{panel_mirror}/{service-name}/{UC-ID}-{platform}.tsv`
(namespace theo `active_service`).

Cách này giữ panel Living Docs của workspace đang mở luôn mới **giữa các lần sync** — nó chỉ là
một **mirror tiện lợi cục bộ**. File `trace-report.json` đã merge (canonical, trong
`{spec_source}/.living-docs/`) được build lại bởi `/sync` hoặc `/validate-traces`. Với các lệnh
được orchestrate, làm việc này một lần trong orchestrator sau khi tất cả sub-agent trả về — không phải
bên trong từng sub-agent.


## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/generate-bdd Hoàn tất

[Spec repo mode — platform: {active_platform}]
Files:
  {paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC1-{slug}.feature ({N} scenarios)
  {paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC2-{slug}.feature ({N} scenarios)
Trace:
  {paths.trace_dir}/{domain}/{prd-slug}/{TICKET-ID}-UC1-{active_platform}.tsv ({N} rows)
  {paths.trace_dir}/{domain}/{prd-slug}/{TICKET-ID}-UC2-{active_platform}.tsv ({N} rows)
Next (spec repo):
  → Chạy /generate-bdd lại cho các platform khác (web → app → system)
  → Sau khi gen hết platform: commit + push + báo team dev
  → Team dev đọc BDD từ spec submodule — không chạy /generate-bdd ở phía họ

[Umbrella mode — service: {active_service} · platform: {active_platform} (suy từ module {active_module})]
Files:
  {paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/{TICKET-ID}-UC1-{slug}.feature ({N} scenarios)
Trace:
  {paths.trace_dir}/{domain}/{prd-slug}/{TICKET-ID}-UC1-{active_platform}.tsv ({N} rows)
Next (umbrella):
  → /review-context {feature-file} để kiểm tra coverage
  → /generate-tech-docs {feature-file}
  → /generate-code {feature-file}

{chỉ khi gen lại VÀ có ≥1 SC bị bump — ngược lại bỏ cả khối}
🔄 sc_version đã bump (scenario đổi nội dung → code cũ lỗi thời):
  {UC-ID}-SC2  1.0 → 1.1   {sc_title}
  {UC-ID}-SC5  1.2 → 1.3   {sc_title}
  → {n} SC này sẽ hiện DRIFT ở /validate-traces. Sinh lại code: /generate-code {feature-file}

{cùng điều kiện — chỉ in các SC bump mà TRƯỚC ĐÓ có dev_selftest/qc_status khác "—"}
🔻 Tín hiệu kiểm thử bị hạ (spec vừa đổi — nghiệm thu cũ hết hiệu lực):
  {UC-ID}-SC2  dev_selftest pass→not_run · qc_status pass→not_run
  ⚠️  {n} test của các SC này viết cho spec CŨ — rà lại nội dung, đừng chỉ chạy lại.
  → sau khi /generate-code: /dev-gen-test (rà test) → /dev-run-test → QC /qc-run-test
  ℹ️  Coverage "đã kiểm đạt" sẽ TỤT trên dashboard — đó là số đúng; số cũ mới là số sai.
     (Tỷ lệ phủ code/test KHÔNG đổi — test_count giữ nguyên vì test vẫn nằm trên đĩa.)

📊 Living Docs: chạy /validate-traces (hoặc /sync) để push trace này lên dashboard spec-module.
```

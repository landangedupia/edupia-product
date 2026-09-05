# /generate-architecture — Sinh / làm mới Architecture Context (SSOT)

> **Mô hình phạm vi:** MỘT `architecture.md` cho mỗi codebase — nguồn chân lý (SSOT)
> cross-cutting cho kiến trúc, dùng cho cả AI code-gen lẫn ops. Lệnh **thu thập từ mọi
> nguồn sẵn có (config + tài liệu + code) → phỏng vấn lấp chỗ trống → draft → bàn giao
> cho người verify**. Tách khỏi `/setup-ai-first` để SA chạy lại nhiều lần (refresh /
> điền dần). Nó KHÔNG tự ký duyệt — con người là trust-gate.
>
> **Triết lý điền:** ưu tiên **hút cái đã biết**, chỉ **hỏi cái chưa biết**. SA không phải
> điền tay 140 ô — chỉ trả lời vài câu dễ hiểu về phần chưa nguồn nào trả lời được.
>
> **Khác `/generate-tech-docs`:** tech-docs là thiết kế **per-PRD/feature**; lệnh này mô tả
> **kiến trúc toàn hệ thống dùng chung**. Chi tiết per-repo (thư mục, namespace) vẫn ở
> `.ai-project-guide.md` / CLAUDE.md của từng repo — lệnh này chỉ lo phần cross-cutting.

## Gate

*Checkpoint: **chặn CỨNG** — ghi đè architecture.md đã verified_by một người thật. `--yes` KHÔNG bỏ qua được (gate Bước 3a).*

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


*Với lệnh này — **bỏ qua Gate Bước 1** (không có input feature-file). `$ARGUMENTS` là **tuỳ chọn**, có thể gồm:
- **service path** (chế độ umbrella, vd `user-service`) → target là `architecture.md` của service đó, scan giới hạn trong `{service}/`.
- `--from=<path/glob,...>` → danh sách **tài liệu có sẵn** để hút nội dung (README, wiki, ADR, doc thiết kế cũ). Vd `--from=docs/**/*.md,README.md`.
- `--section=<slug>` → chỉ lấp/refresh **đúng một mục** (điền dần). Danh sách slug ở Bước 5.
- `--interview` → ép chạy phỏng vấn kể cả brownfield.
Vẫn chạy Bước 0-B (model check) và Context Loader.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Bước 1 — Phân giải target, chế độ & tham số

1. **Target file:**
   - Mặc định → `{paths.specs_dir}/architecture.md` (thường `specs/architecture.md`). Umbrella: context-loader đã trỏ `specs_dir`/`service_root` về service active → target nằm cạnh code service.
   - `$ARGUMENTS` có **service path** → `target = {service}/specs/architecture.md`, scan giới hạn trong `{service}/`.
   - **Umbrella mà không truyền service path** → DỪNG, hỏi: *"Umbrella không có một stack đơn. Chạy `/generate-architecture {service-path}` cho từng service."*

2. **Parse cờ:** `--from` (danh sách nguồn tài liệu), `--section=<slug>` (chế độ 1-mục → nhảy Bước 5), `--interview` (ép phỏng vấn).

3. **Chế độ code:** brownfield (có build/manifest: `pom.xml`/`*.csproj`/`package.json`/`go.mod`/`pubspec.yaml`/`build.gradle`/`Cargo.toml`) vs greenfield (không có code để scan).

4. **File đã tồn tại?**
   - Chưa → tạo mới.
   - `verified_by: AI-draft` (hoặc trống) → được regenerate (xác nhận: *"architecture.md đang là AI-draft chưa verify — regenerate đè lên? (Y/N)"*).
   - `verified_by: {người thật}` → **KHÔNG đè** → nhảy **Bước 6** (refresh có kiểm soát).

---

## Bước 2 — Thu thập từ mọi nguồn (điền cái đã biết)

Gom dữ kiện cho từng section/field theo **thứ tự ưu tiên**. Với mỗi giá trị điền được, ghi lại **nguồn** + **độ chắc chắn** (chắc / cần xác nhận). KHÔNG bịa ngoài bằng chứng.

**Thứ tự nguồn:**

1. **Config dự án** (luôn có) — đọc `project-context.yaml` + `CLAUDE.md`:
   | Field template | Nguồn |
   |---|---|
   | Tech Stack (language/framework/db/build/test) | `project-context.yaml → tech_stack`, `conventions` |
   | Các tầng + rules kiến trúc | `CLAUDE.md §2` |
   | Quy ước đặt tên, response wrapper, error handling | `CLAUDE.md §3, §5` |
   | Quy ước Git/DB nếu có | `CLAUDE.md §6, §7` |

2. **Tài liệu có sẵn** (nếu có `--from`, hoặc hỏi 1 lần: *"Có tài liệu kiến trúc/thiết kế sẵn không? Trỏ path — README, wiki, ADR, doc cũ. Enter để bỏ qua."*) — đọc từng tài liệu, rút fact và **map vào section/field** tương ứng của template. Ghi chú nguồn theo dạng `<!-- nguồn: {đường-dẫn} -->` ở section được điền.

3. **Scan code** (chỉ brownfield) — quét có mục tiêu:
   | Nguồn quét | Section suy ra |
   |---|---|
   | build/manifest (dependencies) | **Tech Stack** |
   | cây thư mục + tên project/layer (`*.Domain`/`*.Application`… hoặc `controller/service/repository`) | **Các tầng** + chiều phụ thuộc |
   | DI registration (`Program.cs`/`Startup`/`*ServiceExtensions`) | **Đăng ký DI**, danh mục service/repo, **Ranh giới truy cập dữ liệu** |
   | middleware / filter / interceptor | **Luồng Xác thực**, correlation-id, gateway |
   | `appsettings*`/`application.yml`/`.env.example` | **Caching** (TTL), **Event Bus/Sharding**, **Feature Toggle** (chỉ ghi *tên* cấu hình, KHÔNG copy secret) |
   | response wrapper / base controller / global exception handler | **Response API chuẩn** |
   | entity/model (DbSet/@Entity) vs POCO/DTO từ API client | **Phân loại Entity**, **Identity Resolution** (nếu có external-id) |
   | CI (`.github/workflows`, `Jenkinsfile`…), Dockerfile, k8s | **Triển khai & DevOps** |

**Xử lý xung đột:** nếu ≥2 nguồn nói khác nhau (vd doc cũ "Redis TTL 10m" nhưng config "5m") → **KHÔNG tự chọn**. Đưa vào danh sách cần hỏi (Bước 3) hoặc gắn ⚠️ vào draft. Quy tắc chung: fact máy móc (tech stack, TTL, DI) ưu tiên **code/config**; phần ý đồ/narrative (data flow, rules, NFR) ưu tiên **tài liệu**.

**Sản phẩm Bước 2:** với mỗi section — trạng thái `đã-điền` (kèm nguồn) / `còn-trống` / `xung-đột`. Đây là đầu vào cho phỏng vấn (chỉ hỏi phần còn-trống/xung-đột).

---

## Bước 3 — Phỏng vấn thích ứng (chỉ hỏi cái chưa biết)

### 3.0 — Báo cáo coverage trước khi hỏi

```
Đã điền từ config/tài liệu/code : {X}/{tổng} mục
Còn cần hỏi                     : §{A}, §{B}, §{C}
Xung đột cần xác nhận           : §{D} (nguồn 1 nói …, nguồn 2 nói …)
```

### 3.1 — Cách đặt câu hỏi (BẮT BUỘC: dễ hiểu, không thuật ngữ trần)

Mỗi câu là một **thẻ giải thích**: tên mục + 1–2 câu nghĩa + ví dụ cụ thể + Có/Không nghĩa là gì. Ví dụ mẫu:
```
【 Hệ thống có Multi-tenant không? 】
Một hệ thống phục vụ NHIỀU khách hàng/chi nhánh, dữ liệu mỗi bên tách riêng,
không bên nào thấy của bên kia (vd: app SaaS bán hàng — mỗi shop chỉ thấy đơn của mình).
  • CÓ    → phục vụ nhiều bên, cần cách ly dữ liệu
  • KHÔNG → chỉ phục vụ một tổ chức duy nhất
```
Áp dụng phong cách này cho MỌI câu. Tuyệt đối không hỏi kiểu "Multi-tenant? [Y/N]" trơ trọi.

### 3.2 — Pha 1: Sàng lọc (quyết mục conditional nào bật)

Hỏi các thẻ dưới đây, **BỎ câu nào đã có đáp án** từ Bước 2 (config/tài liệu/code). Mỗi thẻ quyết định (các) section:

| Thẻ hỏi (diễn đạt dễ hiểu như 3.1) | Bật section |
|---|---|
| Kiểu kiến trúc? (Layered/Clean/Hexagonal/Component-based) | §Các tầng (chọn sơ đồ mẫu) |
| Backend có expose REST API cho client gọi? | §Response API + §Quy ước API |
| Multi-tenant (nhiều khách hàng, dữ liệu tách riêng)? | §Multi-tenant |
| Có tích hợp hệ ngoài có ID riêng (partner/hệ cũ)? | §Phân loại Entity + §Identity Resolution + §Nguồn dữ liệu + §Ranh giới truy cập dữ liệu |
| Có xử lý bất đồng bộ qua message bus (Kafka/RabbitMQ…)? | §Event Bus |
| Dữ liệu chia nhiều DB / sharding? | §Sharding |
| Có bật/tắt tính năng bằng feature flag lúc chạy? | §Feature Toggle |
| Có API Gateway đứng trước các service? | §API Gateway |
| Có cache riêng (Redis…) để tăng tốc? | §Caching |
| Nhiều repo / nhiều service? | §Repos + §Trách nhiệm service + §Giao tiếp giữa service |

Trả lời KHÔNG → section tương ứng để **STUB** (không hỏi thêm về nó nữa).

### 3.3 — Pha 2: Đào sâu (drill loop, tới khi ĐỦ-ĐỂ-VIẾT)

Với **mỗi mục được bật (CÓ)** mà nội dung còn thiếu để viết đúng, hỏi tiếp bằng thẻ dễ hiểu — **lặp tới khi đủ**. Ví dụ sau khi CÓ multi-tenant:
```
Bạn nói CÓ multi-tenant. Để viết đúng phần này, cho hỏi thêm:
1. Mỗi bản ghi phân biệt khách hàng bằng cột nào? (vd TenantId, MerchantId, OrgId)
2. Cách ly kiểu gì? [tự động lọc mọi truy vấn / mỗi khách một DB riêng / khác]
(Chưa rõ thì gõ "để sau" — mục này để trống, bổ sung sau bằng --section=multi-tenant)
```

**Ràng buộc loop (BẮT BUỘC — tránh lan man/phiền):**
- **Chỉ đào sâu trong phạm vi mục SA đã trả lời CÓ.** KHÔNG tự mở chủ đề mới. Mục SA nói KHÔNG → không bao giờ hỏi lại.
- **Chỉ hỏi khi mơ hồ THỰC SỰ cản việc viết đúng** mục đó — không hỏi chi tiết "cho vui".
- **Gộp 2–3 câu/lượt** theo cụm, không hỏi lắt nhắt từng cái.
- **Luôn có lối thoát:** SA gõ "để sau / chưa rõ" → mục đó thành **STUB**, dừng đào sâu ngay. → Loop chắc chắn kết thúc.
- Follow-up cũng **skip-if-answered**: nếu tài liệu/config/code đã trả lời thì không hỏi.

**Kết thúc phỏng vấn khi:** mọi mục CÓ đều (a) đủ để viết, hoặc (b) SA chủ động hoãn (→ stub). Xung đột ở 3.0 cũng được hỏi xác nhận trong pha này.

---

## Bước 4 — Lắp ráp theo tier

Nguồn khung: `.agent/templates/architecture.template.md` (đọc marker `<!-- tier: core|conditional|ops -->` mỗi mục).

1. **core** → **luôn viết**, pre-fill từ Bước 2 + đáp án. Field nào vẫn chưa rõ → giữ `{{PLACEHOLDER}}` + comment (không stub cả mục core).
2. **conditional** → nếu mục được bật (Bước 2 có nguồn HOẶC phỏng vấn CÓ) → viết đầy đủ; ngược lại → **STUB**:
   ```
   ## {Tên mục}  <!-- tier: conditional --> <!-- status: stub -->
   > ⏳ Chưa tài liệu hoá. Chạy `/generate-architecture --section={slug}` khi cần, hoặc điền tay.
   ```
3. **ops** → mặc định **STUB** (không ép điền upfront). Chỉ điền nếu Bước 2 đã có nguồn rõ ràng (vd CI config, logging setup) — khi đó điền luôn, bỏ stub.
4. **Provenance:** mỗi section điền từ tài liệu ngoài → chèn `<!-- nguồn: {path} -->`. Section có xung đột chưa giải → chèn `<!-- ⚠️ xung đột: … -->`.
5. **Frontmatter — trust-gate:** `last_verified: {hôm nay}`; `verified_by: AI-draft` (khi có bất kỳ nội dung do AI hút/suy) hoặc `{{AUTHOR}}` (greenfield thuần tay chưa có gì).
6. Nhất quán thuật ngữ với `business-dictionary.md` + tên entity `core-entities.md`; KHÔNG dùng banned term.
7. Ghi ra `target`.

---

## Bước 5 — Chế độ `--section=<slug>` (điền dần một mục)

Khi `$ARGUMENTS` có `--section=<slug>`: bỏ qua lắp ráp toàn bộ, **chỉ** lấp/refresh đúng mục đó.
1. Định vị mục theo bảng slug bên dưới trong `target`.
2. Chạy thu thập (Bước 2) + phỏng vấn đào sâu (Bước 3.3) **giới hạn cho mục này**.
3. Thay khối stub bằng nội dung đã điền, gỡ `<!-- status: stub -->`. Nếu mục đã có nội dung → refresh theo chênh lệch, giữ chỉnh tay của người.
4. Cập nhật `last_verified`; nếu file đang `verified_by: {người}` → chỉ đề xuất diff (không tự đè).

**Bảng slug ↔ mục:** `tech-stack` · `layers` · `naming` · `api-response` · `api-conventions` · `database` (core) — `data-flow` · `repositories` · `entity-classification` · `data-access` · `service-responsibilities` · `di` · `multi-tenant` · `identity-resolution` · `api-gateway` · `caching` · `event-bus` · `sharding` · `feature-toggle` · `auth` (conditional) — `observability` · `deployment` · `testing` · `nfr` (ops).

---

## Bước 6 — Refresh có kiểm soát (khi file đã verify bởi người)

Nếu Bước 1.4 xác định `verified_by: {người thật}`:
- KHÔNG ghi đè. Chạy lại thu thập (Bước 2) và **so sánh** với nội dung hiện tại.
- Xuất **danh sách chênh lệch** (drift): mục nào trong code/config/tài liệu đã khác doc.
- Với mỗi drift, đề xuất câu chữ cập nhật để SA tự áp; KHÔNG tự đổi `verified_by`.

---

## Bước 7 — Bàn giao cho người verify

> Nếu frontmatter ghi `verified_by: AI-draft`:
> 1. Tech Lead/Architect **duyệt từng section**, sửa chỗ AI đoán sai (đối chiếu `<!-- nguồn: … -->` và `<!-- ⚠️ xung đột -->`).
> 2. Điền nốt `{{PLACEHOLDER}}` còn lại; lấp các mục STUB cần thiết bằng `--section=<slug>`.
> 3. Đổi `verified_by: AI-draft` → **tên bạn**, cập nhật `last_verified`. Commit.
>
> Chỉ khi `verified_by` là người thật, `/generate-tech-docs` (Bước 0.5 [ARCH]) mới coi doc là **ràng buộc kiến trúc chính thức**. Còn `AI-draft` thì bị gắn ⚠️ và ưu tiên CLAUDE.md/BDD khi mâu thuẫn.

## Output
**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

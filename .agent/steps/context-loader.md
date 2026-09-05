# Context Loader — Nạp toàn bộ context dự án

Thực hiện các bước theo đúng thứ tự. Lưu mọi thứ vào bộ nhớ trong suốt phiên làm việc của lệnh.

**Hướng dẫn ưu tiên (chống lost-in-middle):**
- Bước 1–2 là PROJECT-CONFIG — nạp trước, phân giải mọi path và metadata.
- Bước 3 là CRITICAL — kiến trúc + coding standards, là các sự thật ưu tiên cao nhất khi sinh nội dung.
- Bước 4 là SAFETY — quy tắc bảo vệ dữ liệu, thực thi ngầm suốt cả phiên.
- Bước 5–6 là DOMAIN KNOWLEDGE — thuật ngữ và định nghĩa entity.
- Bước 7 là WORKING MEMORY RECAP — chốt các sự thật quan trọng lên đầu bộ nhớ làm việc.

---

## Bước 1 — [PROJECT-CONFIG] Nạp project-context.yaml

Đọc `.agent/project-context.yaml`. Trích xuất và lưu:

**Tech Stack:**
- `tech_stack.language` → ngôn ngữ đang dùng (vd: Java 17, TypeScript, C#, Go)
- `tech_stack.framework` → framework đang dùng (vd: Spring Boot 3.2, Angular 17, .NET 8)
- `tech_stack.build_tool` → build tool (vd: Maven, npm, dotnet, go)
- `tech_stack.test_framework` → test framework (vd: JUnit 5 + Mockito, Jest, xUnit)
- `tech_stack.database` → database (vd: PostgreSQL, MySQL, MongoDB)
- `tech_stack.module` → module profile đang dùng (vd: java-spring, angular, dotnet, golang, context-engineering)

**Conventions:**
- `conventions.build_command` → cách compile/build
- `conventions.test_command` → cách chạy test
- `conventions.service_run` → cách khởi động service
- `conventions.ticket_prefix` → tiền tố ticket ID (vd: PROJ, FEAT, UC)

**Domains:**
- `domains` → danh sách các business domain đang hoạt động

**Paths (nếu có):**
- `paths.specs_dir` → gốc của spec artifact — PRD, BDD, tech-docs, design-spec. Cấu trúc: `{specs_dir}/{domain}/{prd-slug}/{ {TICKET-ID}-{prd-slug}.md | bdd/ | tech-docs/ | design-spec/}` (file PRD đặt tên `{TICKET-ID}-{prd-slug}.md`, là file `.md` duy nhất ở gốc feature folder)
- `paths.refinement_dir` → thư mục output cho findings/review
- `paths.qc_dir` → gốc artifact QC automation (ở top-level, gom theo **PRD**: `{qc_dir}/{TICKET-ID}/{platform}/` — một `DOC_GAP.md` / `TEST_PLAN.md` / `REQUIREMENT_ANALYSIS.md` cho cả PRD, các UC là mục bên trong. Xem `steps/qc-scope.md`)
- `paths.qc_skills_dir` → nơi các lệnh qc-* nạp QC skill (mặc định bundled `.agent/skills/qc`; override sang repo/submodule riêng của team QC để bản nâng cấp framework không ghi đè)
- `paths.product_definitions_dir` → gốc product definition
- `paths.domain_knowledge_dir` → gốc domain knowledge
- `paths.business_dictionary` → path tới business-dictionary.md
- `paths.core_entities` → path tới core-entities.md
- `paths.tech_docs_dir` → gốc tài liệu kỹ thuật (gộp với specs_dir trong bố cục feature-package — tech-docs nằm dưới `{specs_dir}/{domain}/{prd-slug}/tech-docs/`)
- `paths.src_dir` → gốc mã nguồn (nơi generate-code đặt & quét code; nguồn chính cho FE + phạm vi reuse-scan của DS5)
- `paths.trace_dir` → thư mục trạng thái trace; cấu trúc: `.trace/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv` (mỗi UC × platform một sổ)

Nếu không có section `paths`, dùng các giá trị mặc định:
- `specs_dir` = `specs`
- `refinement_dir` = `.agent/review`
- `qc_dir` = `docs`
- `qc_skills_dir` = `.agent/skills/qc`
- `product_definitions_dir` = `specs/product-definition`
- `domain_knowledge_dir` = `specs/domain-knowledge`
- `business_dictionary` = `specs/domain-knowledge/business-dictionary.md`
- `core_entities` = `specs/domain-knowledge/core-entities.md`
- `tech_docs_dir` = `specs`
- `src_dir` = `src`
- `trace_dir` = `.trace`

Lưu ý: Trong bố cục feature-package, `specs_dir` là gốc thống nhất. Mọi loại spec artifact (PRD, BDD, tech-docs, design-spec) đều nằm dưới `{specs_dir}/{domain}/{prd-slug}/`. `prd-slug` là tên folder feature-package, không phải một biến config riêng.

**Cách trích xuất `prd_slug` (đúng cho MỌI target file, bất kể độ sâu lồng nhau):** với một path target dạng `{specs_dir}/{domain}/{prd-slug}/...`, lấy **segment path đầu tiên sau `{specs_dir}/{domain}/`** — tức vị trí `{prd-slug}`. KHÔNG dùng folder cha trực tiếp của file, vì artifact BDD/tech-docs/design-spec lồng sâu hơn một hoặc hai cấp bên trong package. Ví dụ:
- `specs/payment/create-invoice/PAY01-create-invoice.md` → `prd_slug = create-invoice`
- `specs/payment/create-invoice/bdd/system/PAY-UC1.feature` → `prd_slug = create-invoice` *(KHÔNG phải `system`)*
- `specs/payment/create-invoice/bdd/web/PAY-UC1.feature` → `prd_slug = create-invoice` *(KHÔNG phải `web`)*
- `specs/payment/create-invoice/tech-docs/PAY01-tech-design.md` → `prd_slug = create-invoice` *(KHÔNG phải `tech-docs`)*
- `specs/payment/create-invoice/design-spec/PAY-design-spec-web.md` → `prd_slug = create-invoice`

Mọi artifact cùng cấp của một feature (PRD, BDD của từng platform, tech-docs BE + FE, design-spec, và trace TSV) đều phân giải về **cùng một `prd_slug`** — nên một BDD **system** hay tech-doc **system/BE** được tổng hợp sẽ nằm chung package `{specs_dir}/{domain}/{prd-slug}/` với các artifact web/app mà nó được suy ra từ đó.

Nếu `tech_stack.module` được đặt, đồng thời nạp `.agent/modules/{module}/stack-profile.yaml` nếu file tồn tại.

---

## Bước 1.5 — [SERVICE ROUTING] Phân giải path service (chế độ umbrella)

*Bỏ qua hoàn toàn bước này nếu `setup.mode` không phải `"umbrella"` và không có section `services` trong project-context.yaml.*

Nếu có section `services`:

**1. Phát hiện active domain** (theo thứ tự ưu tiên):
- Đọc `@trace.domain` từ frontmatter của target file (nếu Gate đã nạp một target file)
- Trích xuất từ path target file: `domain` = segment đầu tiên sau base path `specs_dir`; `prd_slug` = segment kế tiếp (folder feature-package). Điều này đúng ở mọi độ sâu target — xem quy tắc trích xuất `prd_slug` ở Bước 1.  
  *(vd: `specs/user/create-account/USR01-create-account.md` **và** `specs/user/create-account/bdd/system/UC1.feature` đều → domain = `user`, prd_slug = `create-account`)*
- Nếu `$ARGUMENTS` chứa một path, trích xuất segment domain sau `specs_dir`

**1b. Phát hiện active platform** (chỉ cần khi service ở dạng map-theo-platform — bước 2b):
- Đọc `@trace.platform` từ header của target `.feature` (`system` | `web` | `app`) — Gate đã resolve target trước bước này.
- Nếu target không mang `@trace.platform` (vd target là PRD `.md`), thử suy từ segment `bdd/{platform}/` trong path target.
- Nếu vẫn không xác định được → `active_platform = null`.

**2. Route tới service** — nếu active domain khớp một key trong `services`.

Hình dung việc này như **tra địa chỉ**: đi từ `domain`, có thể qua `platform`, có thể qua `prd_slug`, cho tới khi chỉ còn đúng một submodule.

Thứ trỏ tới đích gọi là một **service entry**. Nó chỉ có hai kiểu:

| Kiểu | Nhận ra bằng | Nghĩa |
|---|---|---|
| **Đã chốt** | có `path` | Xong — đây là submodule cần tìm |
| **Tra tiếp** | có `by_prd_slug` | Ô này còn nhiều submodule → tra thêm một nấc bằng `prd_slug` (2c) |

**Kiểm tra hợp lệ TRƯỚC khi dùng một entry** (làm ngay, đừng đợi tới 2a/2b/2c — sai ở đây mà đi tiếp là route nhầm repo mà không báo gì):

| Entry trông thế nào | Xử lý |
|---|---|
| có `path`, không có `by_prd_slug` | hợp lệ → dùng |
| có `by_prd_slug`, không có `path` | hợp lệ → tra tiếp (2c) |
| **có CẢ HAI** | ❌ lỗi cấu hình → `active_service = unresolved`. **KHÔNG** ưu tiên `path` rồi bỏ qua `by_prd_slug` — như vậy mọi feature sẽ âm thầm route về cùng một repo. Báo đúng key sai để người dùng sửa. |
| **không có cái nào** (và cũng không phải map platform) | ❌ lỗi cấu hình → `unresolved`, nêu rõ entry thiếu `path`/`by_prd_slug` |
| `by_prd_slug` chứa entry lại có `by_prd_slug` | ❌ lỗi cấu hình → `unresolved`. Chỉ tra đúng **một** nấc slug, không đệ quy |

Còn `services.{domain}` thì có thể là **một service entry** (chốt luôn ở cấp domain), hoặc **một map platform → service entry** (phải qua nấc platform trước). Nhận dạng theo đúng thứ tự này:

| Thấy gì trong `services.{domain}` | Đi nhánh |
|---|---|
| có `path` | **2a** — chốt luôn |
| có `by_prd_slug` | **2c** — tra bằng `prd_slug` |
| không có cả hai (chỉ có các sub-key `system`/`web`/`app`…) | **2b** — tra bằng `platform`, rồi lặp lại đúng bảng này cho entry con |

**2a. Dạng phẳng** — `services.{domain}` có **trực tiếp** `path`/`module` (một domain ↔ một service, mọi platform về cùng submodule). Route như cũ:
- Lưu `active_service` = `services.{domain}.path`
- Lưu `active_service_module` = `services.{domain}.module`
- Nếu service có `module` riêng → dùng nó làm `active_module` (override `tech_stack.module`)

**2b. Dạng map-theo-platform** — `services.{domain}` **KHÔNG** có `path` trực tiếp mà chứa các sub-key platform (`system` / `web` / `app`), mỗi cái là một **service entry** (một business-domain trải trên nhiều platform/submodule). Route theo `active_platform` (bước 1b):
- Nếu `active_platform` khớp một sub-key → `entry = services.{domain}.{active_platform}`. Nếu `entry` có `path` → lưu `active_service = entry.path`, `active_service_module = entry.module` (→ `active_module`, override `tech_stack.module`). Nếu `entry` có `by_prd_slug` → **đi tiếp sang 2c** với entry đó.
- Nếu `active_platform = null` (chưa xác định platform, vd đang thao tác cấp PRD) → **KHÔNG** chốt một service; đặt `active_service = multi`, `service_candidates_kind = platform`, và lưu `service_candidates` = map platform→`{path, module}`. **Làm phẳng luôn ở đây:** platform nào có entry `by_prd_slug` thì giải bằng `prd_slug` hiện tại (target cấp PRD vẫn nằm trong một feature-package nên `prd_slug` đã biết từ bước 1) → `service_candidates.{platform}` vẫn là `{path, module}` phẳng. Nếu `prd_slug` không khớp key nào, ghi platform đó là `unresolved` kèm lý do thay vì bỏ im. Nhờ vậy **mọi lệnh downstream chỉ cần biết một kiểu `service_candidates`**. Lệnh cần một service cụ thể (`/generate-code`, `/dev-*`, `/fix-bug`) luôn chạy trên target `.feature` có platform nên sẽ resolve được ở lần chạy đó; lệnh cấp PRD (`/generate-prd`, `/refine-prd`) không cần service cụ thể.
- Nếu `active_platform` xác định nhưng không có sub-key tương ứng → `active_service = unresolved` (xem Fallback) với lý do "domain `{domain}` chưa cấu hình platform `{active_platform}`".

**2c. Dạng map-theo-prd_slug** — một service entry chứa `by_prd_slug` thay cho `path`: **một ô của bảng định tuyến ứng với NHIỀU submodule**, mỗi feature-package một submodule. Dùng khi một platform (hoặc cả một domain) bị chia thành nhiều repo theo feature — ví dụ mỗi mini-game webview là một repo riêng.

Đến đây `prd_slug` đã được trích ở bước 1 (không cần detect thêm gì). Route:

- Nếu `prd_slug` khớp một key dưới `by_prd_slug` → `entry = {…}.by_prd_slug.{prd_slug}`; lưu `active_service = entry.path`, `active_service_module = entry.module` (→ `active_module`, override `tech_stack.module`).
  **"Khớp" ở đây là khớp CHÍNH XÁC toàn chuỗi, phân biệt hoa/thường.** KHÔNG prefix, KHÔNG bỏ hậu tố, KHÔNG so gần đúng: `dap-chuot-v2` **không** khớp key `dap-chuot`; `Ban-Cung` **không** khớp `ban-cung`. Feature mới tách ra từ một feature cũ là một repo khác cho tới khi có người khai nó vào bảng.
- Nếu `prd_slug = null` (chưa xác định feature-package — chỉ xảy ra khi không có target file, vd `$ARGUMENTS` rỗng) → **KHÔNG** chốt một service; đặt `active_service = multi`, `service_candidates_kind = prd_slug`, và lưu `service_candidates` = toàn map `by_prd_slug` (slug → `{path, module}`).
  ⚠️ Đây là kiểu `service_candidates` **khác** với 2b — lệnh nào duyệt `service_candidates` theo platform (vd `/generate-bdd` sinh `bdd/{platform}/`) phải kiểm `service_candidates_kind = platform` trước; gặp `prd_slug` thì DỪNG và yêu cầu người dùng chỉ rõ target, đừng coi slug là platform.
- Nếu `prd_slug` xác định nhưng **không** có key tương ứng → `active_service = unresolved` với lý do rõ: "domain `{domain}`{, platform `{active_platform}`} chưa cấu hình prd_slug `{prd_slug}`". **KHÔNG** tự đoán submodule gần đúng theo tên.

Vị trí đặt `by_prd_slug` — hợp lệ ở **cả hai cấp**:
- **Dưới một platform** (lồng trong 2b): `services.{domain}.{platform}.by_prd_slug` — platform đó có nhiều repo, các platform khác vẫn `{path, module}` như thường.
- **Ngay dưới domain** (thay cho `path` của 2a): `services.{domain}.by_prd_slug` — domain không chia platform nhưng vẫn nhiều repo theo feature.

*(`by_prd_slug` lồng trong `by_prd_slug` là vô nghĩa — nếu gặp, coi là lỗi cấu hình: `active_service = unresolved`, nêu rõ để người dùng sửa file. Một entry vừa có `path` vừa có `by_prd_slug` cũng là lỗi cấu hình — báo lỗi, không âm thầm ưu tiên cái nào.)*

Ví dụ (một domain trải nhiều platform, riêng `webview` chia theo feature):
```yaml
services:
  learning:
    system: { path: "backend",     module: "java-spring" }
    web:    { path: "web-app",     module: "nextjs" }
    webview:
      by_prd_slug:
        dap-chuot: { path: "games/whac-a-mole", module: "phaser-game" }
        ban-cung:  { path: "games/archery",     module: "phaser-game" }
```
→ target `specs/learning/dap-chuot/bdd/webview/UC1.feature` cho `domain = learning`,
`active_platform = webview`, `prd_slug = dap-chuot` → `active_service = games/whac-a-mole`.

*(Cả 2a/2b/2c: override `paths.specs_dir`/`paths.tech_docs_dir` per-service CHỈ khi `setup.spec_source` KHÔNG được đặt. Khi `spec_source` ĐƯỢC đặt, MỌI BDD/tech-doc là artifact liên team → để bước 4 route sang spec repo; KHÔNG pin per-service ở đây.)*

**3. Fallback** — **hai trạng thái khác nhau, đừng gộp** *(G51)*:

> `unrouted` = **chưa ai quyết** repo. Hợp lệ, bình thường ở feature đầu tiên của domain mới.
> `unresolved` = **config sai cấu trúc**. Là **bug** cần sửa file, không phải trạng thái chờ.
>
> Trước G51 cả hai dùng chung tên `unresolved` nên chịu chung hình phạt: `/generate-bdd` DỪNG HẲN.
> Nhưng PRD/BDD là artifact **nghiệp vụ** — PO biết `domain` và biết `platform`, **không** biết code
> sẽ nằm repo nào, và thường lúc đó chưa ai quyết. Cổng đặt sai phase.

**→ `unrouted`** (chưa có mapping — **không** phải lỗi):
- Không phát hiện được domain, hoặc domain **không khớp key nào** trong `services` → giữ path mặc định từ Bước 1, đặt `active_service = unrouted`.
- Domain khớp map-theo-platform (2b) nhưng thiếu sub-key cho `active_platform` → `active_service = unrouted`, ghi lý do rõ (không tự đoán platform).
- Entry là map-theo-prd_slug (2c) nhưng thiếu key cho `prd_slug` → `active_service = unrouted`, ghi lý do rõ (không tự đoán submodule).

**→ `unresolved`** (config **sai cấu trúc** — bug):
- Entry vừa có `path` vừa có `by_prd_slug`, hoặc `by_prd_slug` lồng nhau → `active_service = unresolved`, nêu đúng key sai để người dùng sửa `project-context.yaml`.

*Cả hai đều KHÔNG chặn việc nạp context. Lệnh nào chặn là quyết định của lệnh đó: `/generate-bdd`
đi tiếp với `unrouted` (Step 1.6) · `/generate-code` DỪNG ở cả hai (nó buộc phải biết ghi vào đâu).*

**4. Tự động override theo spec source** — nếu `setup.spec_source` được đặt VÀ path tương ứng chưa được set tường minh trong `paths:`:
- Override `paths.specs_dir` → `{spec_source}/specs` — **luôn khi `spec_source` được đặt.** Mọi spec artifact (PRD, BDD, tech-docs, design-spec) nằm dưới gốc spec thống nhất trong spec repo dùng chung theo bố cục feature-package: `{spec_source}/specs/{domain}/{prd-slug}/`. Mọi umbrella (FE/App/BE) đều đọc từ đây. *(`specs/` theo service chỉ khi không có `spec_source`.)*
- Override `paths.tech_docs_dir` → `{spec_source}/specs` — **luôn khi `spec_source` được đặt** (bước 2 không còn pin tech-docs theo service trong trường hợp này). Tech-docs nằm tại `{spec_source}/specs/{domain}/{prd-slug}/tech-docs/`. Tech-design CHÍNH LÀ API contract liên team: BE viết ở đây, FE/App đọc nó từ cùng spec submodule tại `/generate-code --phase=integration`. *(tech-docs theo service chỉ xảy ra khi không có `spec_source` — repo BE thuần đa-service không có spec module dùng chung.)*
- Override `paths.domain_knowledge_dir` → `{spec_source}/specs/domain-knowledge`
- Override `paths.business_dictionary` → `{spec_source}/specs/domain-knowledge/business-dictionary.md`
- Override `paths.core_entities` → `{spec_source}/specs/domain-knowledge/core-entities.md`
- Override `paths.bug_reports_dir` → `{spec_source}/feedback/bug-reports`
- Override `paths.bdd_proposals_dir` → `{spec_source}/feedback/bdd-proposals`
- Override `paths.prd_change_requests_dir` → `{spec_source}/feedback/prd-change-requests`
- Override `paths.trace_dir` → `{spec_source}/.trace` — **luôn khi `spec_source` được đặt.** Trace TSV được gộp vào spec repo (một nơi authoritative duy nhất, không tách theo service) để PM/PO có một chỗ duy nhất quản lý trạng thái. Cấu trúc bên trong: `.trace/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv`. Các lệnh phía code (`/generate-code`, `/dev-run-test`, `/qc-run-test`) chạy từ `service_root` nhưng **ghi trace row của chúng vào `{spec_source}/.trace/{domain}/{prd-slug}/`** — giống như chúng đã push `feedback/` vào đó. *(`.trace` theo service chỉ khi không có `spec_source`.)*
- Override `paths.refinement_dir` → `{spec_source}/.agent/review` — **luôn khi `spec_source` được đặt.** Findings review (`/refine-prd`, `/review-context`, `/review-tech-docs`) là artifact liên-team *về* tài liệu trong spec repo (PRD/BDD/tech-design) — thuộc cùng khu vực ghi với `.trace/` và `feedback/`. Các lệnh review chạy từ working dir của service (BE repo) nhưng **ghi findings vào `{spec_source}/.agent/review/`**, KHÔNG phải `.agent/review` của service repo. Bên trong flat, phân biệt bằng tên file đã prefix `{prd-slug}`/`{UC-ID}`/`{TICKET-ID}`. *(`.agent/review` theo service chỉ khi không có `spec_source`.)*

> **Vì sao đặt dưới `spec_source`:** PRD, BDD, tech-docs, design-spec, domain knowledge, feedback của tester, **trạng thái coverage `.trace/`**, **và findings review `.agent/review/`** đều là **artifact liên team** — chúng nằm trong **spec repo dùng chung** theo bố cục feature-package để mọi umbrella (FE/App/BE) và PM đọc từ một nguồn qua `/sync`. Trong bố cục feature-package, một folder `specs/{domain}/{prd-slug}/` gom tất cả loại artifact của một PRD, giúp spec repo tự đủ và dễ điều hướng theo feature. Service submodule chỉ chứa **code** (+ tooling build/test). `.trace/`, `.agent/review/` và `feedback/` là khu vực **ghi** của dev/QC/reviewer trong spec repo. Ở chế độ single-service (không có `spec_source`), mọi thứ mặc định dưới gốc repo — vẫn là một repo.

---

## Bước 1.6 — [SERVICE CONVENTIONS] Nạp convention riêng của service (chế độ umbrella)

*Bỏ qua hoàn toàn bước này nếu `active_service` là `"unresolved"` hoặc `"multi"` (chưa chốt một service — dạng map-theo-platform ở cấp PRD) hoặc context ở chế độ single-service.*

Khi `active_service` đã được phân giải thành một path thật ở Bước 1.5 (vd: `user-service/`):

**1. Định vị config của service** — thử theo thứ tự ưu tiên:
- `{active_service}/.agent/project-context.yaml`
- `{active_service}/project-context.yaml`

**2. Nếu tìm thấy, override bằng giá trị riêng của service:**

| Biến | Nguồn |
|----------|--------|
| `conventions.test_command` | `conventions.test_command` của service |
| `conventions.build_command` | `conventions.build_command` của service |
| `paths.trace_dir` | **Nếu `spec_source` được đặt → giữ route spec-repo của bước 4 (`{spec_source}/.trace`); bỏ qua mọi `trace_dir` cấp service.** Chỉ khi không có `spec_source`: `{active_service}/{service paths.trace_dir}` (mặc định `{active_service}/.trace`). |
| `paths.specs_dir` | **Nếu `spec_source` được đặt → giữ route spec-repo của bước 4 (`{spec_source}/specs`); bỏ qua mọi `specs_dir` cấp service** (mọi spec artifact đều liên team, không bao giờ theo service ở chế độ này). Chỉ khi không có `spec_source`: `{active_service}/{service paths.specs_dir}` nếu được set, else dùng override ở Bước 1.5. |
| `paths.refinement_dir` | **Nếu `spec_source` được đặt → giữ route spec-repo của bước 4 (`{spec_source}/.agent/review`); bỏ qua mọi `refinement_dir` cấp service** (findings review là artifact liên team). Chỉ khi không có `spec_source`: `{active_service}/.agent/review`. |

**3. Lưu** `service_root = {active_service}` làm mốc thư mục làm việc cho mọi lệnh phía sau:
- Các lệnh shell (`/dev-run-test`, `/dev-gen-test`) chạy **bên trong** `service_root`
- **File source/test** được ghi tương đối với `service_root`; **trace TSV** được ghi vào `{paths.trace_dir}` (là spec repo khi `spec_source` được đặt — một thao tác ghi liên-repo, commit/push vào spec submodule giống như `feedback/`).

**4. Nếu không tìm thấy config của service** — giữ mặc định umbrella, vẫn set `service_root = {active_service}` (luôn cần mốc path kể cả khi không có config override).

> ⚠️ **`service_root` KHÔNG BAO GIỜ được là một chuỗi trạng thái** *(G51)*. Nếu `active_service` là
> `unrouted` / `unresolved` / `multi` / `—` thì đặt **`service_root = null`** và giữ path mặc định
> umbrella — **đừng** nội suy giá trị đó thành tên thư mục.
> Bản trước đặt `service_root = {active_service}` vô điều kiện, nên `/generate-code` (ghi file
> **tương đối với `service_root`**) sẽ ghi source vào một thư mục tên đúng chữ `unresolved/`.
> `service_root = null` là tín hiệu để `/generate-code` DỪNG thay vì ghi bừa.

---

## Bước 2 — [PROJECT-CONFIG] Nạp module stack profile (có điều kiện)

Nếu `tech_stack.module` được đặt, đọc `.agent/modules/{module}/stack-profile.yaml`.
Merge các convention riêng của framework (layer pattern, test pattern, quy tắc đặt tên) vào context đã nạp.
Nếu file không tồn tại → bỏ qua âm thầm.

---

## Bước 3 — [CRITICAL] Nạp CLAUDE.md (phân tầng: root + service overlay)

*Đây là context ưu tiên cao nhất — nó định nghĩa CÁCH viết code và tài liệu cho dự án này.*

CLAUDE.md được nạp theo **hai tầng** để các quy tắc toàn-umbrella và kiến trúc/coding standards
riêng của service kết hợp đúng cách. Agent luôn đứng ở gốc umbrella, nhưng code triển khai nằm
trong một service submodule với stack, kiến trúc, và convention RIÊNG của nó — nên CLAUDE.md của
service phải thắng khi sinh code.

**Tầng 1 — [BASE] Root CLAUDE.md (toàn umbrella).**
Đọc `CLAUDE.md` ở gốc repo. Coi nội dung của nó là **nền tảng dùng chung** cho cả umbrella —
git convention, tư thế bảo vệ dữ liệu, quy tắc xuyên suốt, và (ở chế độ single-service) là
kiến trúc + coding standards duy nhất của dự án.

**Tầng 2 — [OVERLAY] Service CLAUDE.md (chỉ chế độ umbrella).**
*Chỉ chạy nếu `service_root` đã được set ở Bước 1.6 (tức đã route tới một service thật).*
Đọc `{service_root}/CLAUDE.md`. File này định nghĩa kiến trúc + coding standards của **stack
thực sự đang được triển khai** (vd: `user-service` = java-spring, `web` = nextjs).
Overlay nó lên trên Tầng 1: **khi có xung đột, giá trị của service THẮNG** cho kiến trúc,
coding standards, và error handling. Các giá trị Tầng 1 mà service không định nghĩa lại
(vd: git convention, banned pattern dùng chung toàn tổ chức) vẫn có hiệu lực.

Từ kết quả **đã merge**, trích xuất và lưu:

- **§1 Project Overview** → tên dự án, ngôn ngữ, framework, lệnh build/test, domains
- **§2 Architecture** → thứ tự layer (vd: Controller → Facade → Service → Repository), quy tắc kiến trúc — *service overlay thắng*
- **§2 Package Layout** → **base package** (vd `vn.edupia.{service}`) + **chiến lược đặt package** (by-layer / by-feature) + nơi code một domain sống. Đây là **quy ước đặt code trên đĩa**, PHẢI enforce khi sinh code. Nếu §2 chỉ nêu base package + thứ tự layer mà **không** nói tới sub-package theo feature → hiểu là **by-layer**: các layer đặt **TRỰC TIẾP** dưới base package (vd `vn.edupia.{service}.service`, `.repository`); feature/UC/prd-slug **KHÔNG** thành sub-package, chỉ phân biệt ở **tên class**. Lưu `code_base_package` + `package_strategy` — *service overlay thắng*.
- **§3 Coding Standards** → quy tắc đặt tên (class, method), kiểu response wrapper, pattern bị cấm — *service overlay thắng*
- **§5 Error Handling** → kiểu exception, mapping HTTP status code, tên class not-found exception — *service overlay thắng*
- **§7 Git Conventions** → pattern đặt tên branch, format commit message — *lấy theo root trừ khi service định nghĩa lại*

**Quy tắc phân giải:**
- Nếu cả hai tầng tồn tại → merge như trên; ghi `claude_md_source = root + {service_root}`.
- Nếu chỉ có service overlay (không có root CLAUDE.md) → dùng file service một mình; `claude_md_source = {service_root}`.
- Nếu `service_root` được set nhưng `{service_root}/CLAUDE.md` **thiếu** → fallback về root CLAUDE.md và gắn cờ ⚠️ trong recap Bước 7 (service không có định nghĩa kiến trúc/coding-standards — việc sinh code sẽ dùng mặc định umbrella, có thể sai stack).
- Nếu cả hai đều không tồn tại → ghi nhận CLAUDE.md thiếu và tiếp tục chỉ với dữ liệu từ project-context.yaml.

---

## Bước 4 — [SAFETY] Nạp quy tắc bảo vệ dữ liệu

Đọc `.agent/rules/data-protection.md` (hoặc `rules/data-protection.md` từ bản cài đặt framework).

Lưu các pattern file nhạy cảm — bạn **tuyệt đối không** đọc, ghi, hiển thị, hay tham chiếu nội dung từ các file khớp những pattern đó trong suốt cả phiên.

Nếu cả hai file đều không tồn tại → áp dụng mặc định built-in: không bao giờ truy cập `.env*`, `*.key`, `*.pem`, `*secret*`, `*password*`, `*credential*`.

---

## Bước 5 — [DOMAIN] Nạp Business Dictionary (có điều kiện)

Kiểm tra file business dictionary có tồn tại không (dùng `paths.business_dictionary` đã phân giải ở Bước 1).

Nếu tồn tại, đọc và trích xuất:
- **Canonical Terms** → danh sách đầy đủ các thuật ngữ chuẩn và định nghĩa
- **Banned Terms** → danh sách đầy đủ các thuật ngữ bị cấm và bản thay thế chuẩn
- **Status / Enum Registry** → các giá trị enum được phép theo từng entity

Lưu danh sách banned term để **thực thi chủ động** suốt phiên làm việc của lệnh:
- Khi sinh bất kỳ văn bản nào (PRD, BDD, comment code, tech docs), kiểm tra không có banned term nào xuất hiện
- Tự động thay banned term bằng bản chuẩn tương đương

Nếu file không tồn tại → bỏ qua âm thầm. Không cảnh báo hay chặn.

---

## Bước 6 — [DOMAIN] Nạp Core Entities (có điều kiện)

Kiểm tra file core entities có tồn tại tại `paths.core_entities` không (đã phân giải ở Bước 1).
Path mặc định: `specs/domain-knowledge/core-entities.md`.

Nếu tồn tại, đọc và lưu:
- **Entity catalog** → với mỗi entity: tên, mục đích, service sở hữu, các field chính (tên + kiểu), business invariant, và quan hệ
- **Field name registry** → tên field chuẩn dùng trong code và tài liệu được sinh ra
- **Relationship map** → cách các entity liên hệ với nhau (1:N, N:N, embedded, v.v.)

**Cách dùng catalog này:**
- Khi sinh code: dùng tên field, kiểu, và quan hệ định nghĩa ở đây — KHÔNG suy đoán từ code có sẵn
- Khi sinh PRD/BDD: tham chiếu tên entity từ catalog này để nhất quán
- Khi sinh tech-docs: dùng catalog này làm nguồn chân lý cho định nghĩa entity

Nếu file không tồn tại → bỏ qua âm thầm.

---

## Bước 6.5 — [PLATFORM] Suy ra active_module và platform_type

Dùng `tech_stack.module` đã nạp ở Bước 1, suy ra và lưu hai biến để mọi lệnh phía sau dùng:

```
active_module = tech_stack.module   (vd: "java-spring", "react", "flutter")
```

| `platform_type` | Modules |
|---|---|
| `backend` | `java-spring`, `golang`, `dotnet`, `php-laravel`, `context-engineering` |
| `web-frontend` | `react`, `nextjs`, `vue`, `nuxt`, `angular`, `phaser-game` |
| `mobile` | `flutter`, `react-native`, `ios-swiftui`, `android-compose` |

Nếu `tech_stack.module` rỗng hoặc không nhận diện được → set `platform_type = "unknown"` và gắn cờ ⚠️ trong recap Bước 7.

Hai biến này (`active_module`, `platform_type`) là nguồn chuẩn cho mọi logic rẽ nhánh trong các lệnh cần hành vi riêng theo platform (dev-gen-test, debug, fix-bug, dev-smoke-test).

---

## Bước 6.7 — [GUARDRAILS] Nạp Project Lessons (có điều kiện)

*Các lỗi tích luỹ mà AI không được lặp lại trong dự án này. Chúng được bổ sung dần qua `/learn`
hoặc được chấp nhận trong `/review-code`, `/fix-bug`, `/debug`.*

Phân giải path file lessons:
- Dùng `paths.lessons_file` nếu được set (có thể bị service override ở chế độ umbrella, Bước 1.6)
- Else mặc định `specs/domain-knowledge/lessons-learned.md`
- Ở chế độ umbrella/service (khi `service_root` được set), nếu `paths.lessons_file` chưa set, mặc định `{service_root}/.agent/project-lessons.md`

Nếu file tồn tại, **LỌC TRƯỚC KHI NẠP** — chỉ giữ lesson thoả **cả hai**:

1. **`Status: active`** (hoặc **không có** field `Status` → lesson cũ, coi là `active`)
2. **`category` khớp lệnh đang chạy**, hoặc `category: general`

Số còn lại mới nạp làm **GUARDRAIL ĐANG HOẠT ĐỘNG** cho phiên:
- Coi **Rule** của mỗi lesson là ràng buộc cứng — cùng mức ưu tiên với coding standards trong CLAUDE.md (Bước 3).
- Trước khi sinh hoặc sửa bất kỳ artifact nào (PRD, BDD, tech-doc, code, test), đối chiếu output với lesson đã nạp có **`scope` khớp target** (domain / file glob).
- Nếu output sinh ra vi phạm một lesson → sửa **trước khi** trình bày, và ghi rõ lesson nào (`L-NNN`) đã được áp dụng.

Ghi lại **hai** con số cho recap Bước 7: `{n_active_for_this_command}` và `{n_total_active}`.

Nếu file không tồn tại → bỏ qua âm thầm (chưa có lesson nào được ghi nhận).

> **Vì sao lọc ở ĐÂY chứ không phải lúc dùng (GAPS-v3 G46):** bản cũ viết *"đọc và lưu **TẤT CẢ**
> lesson"* ở dòng trên, rồi *"đối chiếu với mọi lesson có `category` khớp"* ở dòng dưới. Bộ lọc
> **đã tồn tại** — chỉ là chạy **sau** khi đã nạp hết. Có 6 category, nên `/generate-prd` đang nạp
> cả đống lesson `code-gen` mà nó không bao giờ dùng tới. Chuyển bộ lọc lên trước là thay đổi thứ
> tự, không phải thêm logic.
>
> **Và vì sao chỉ nạp `active`:** trước G46 file lessons **chỉ có đường vào**. Một lesson viết năm
> ngoái cho code đã bị xoá vẫn được nạp làm ràng buộc cứng, mãi mãi. Cùng lớp lỗi với G28 — giữ
> một tín hiệu đã hết đúng. Đường ra: `/learn --review` (xem `capture-lesson.md` §Retire).
>
> ⚠️ **Không bao giờ tự bỏ lesson vì file quá dài.** Nạp thiếu một guardrail trong im lặng đúng là
> thứ framework này tồn tại để chống. Vượt ngưỡng thì **cảnh báo** ở recap, người quyết retire.

---

## Bước 7 — [RECAP] Working Memory Recap (chống lost-in-middle)

Sau khi nạp toàn bộ context, tổng hợp và xuất một khối tóm tắt gọn.
Recap này đảm bảo các sự thật quan trọng nhất được nêu ở CUỐI quá trình nạp context
(hiệu ứng recency — tươi mới nhất trong bộ nhớ làm việc khi bắt đầu task).

Xuất đúng khối này:
```
[CTX LOADED]
Stack     : {language} / {framework} / {database}
Platform  : {active_module} ({platform_type})
Layers    : {thứ tự layer từ CLAUDE.md §2 đã merge, vd: Controller → Facade → Service → Repository}
Package   : {code_base_package}.{layer} · {by-layer | by-feature}  ← feature/UC → tên class, KHÔNG thành package (nếu by-layer)
CLAUDE.md : {root + {service_root} | chỉ {service_root} | chỉ root | ⚠️ service overlay THIẾU — dùng root | missing}
Ticket    : {ticket_prefix}-
Dict      : {loaded — N canonical terms, M banned terms | missing}
Entities  : {loaded — EntityA, EntityB, EntityC | missing}
Lessons   : {loaded — {n} active cho lệnh này ({tổng} tổng) | chưa có}
            {⚠️ CHỈ IN khi tổng ≥ 40: "{tổng} guardrail đang hoạt động — /learn --review để rà"}
Platform  : {active_platform: system | web | app | webview | … | — nếu chưa xác định}
Service   : {active_service} ({active_service_module}) [← domain{/platform}{/prd_slug} nếu route qua by_prd_slug] | multi (map-theo-platform hoặc map-theo-prd_slug, chốt khi target đủ platform/prd_slug) | single-service
Svc Root  : {service_root} — đã nạp conventions + trace_dir từ config service | —
Status    : {FULL | PARTIAL — thiếu: CLAUDE.md / business-dict / core-entities | MINIMAL}
```

Nếu bất kỳ file CRITICAL nào thiếu (CLAUDE.md), gắn cờ rõ ràng để người dùng quyết định có tiếp tục hay không.

---

## Hoàn tất nạp Context

Sau khi hoàn thành tất cả các bước, bạn đã nạp:
- Định danh dự án, tech stack, convention module
- Quy tắc kiến trúc và thứ tự layer  ← **[CRITICAL — giữ trong bộ nhớ làm việc]**
- Coding standards và quy tắc đặt tên  ← **[CRITICAL — giữ trong bộ nhớ làm việc]**
- Quy tắc bảo vệ dữ liệu (pattern file nhạy cảm không bao giờ truy cập)
- Quy tắc thuật ngữ kèm danh sách banned term  ← **[DOMAIN — áp dụng cho mọi từ được sinh ra]**
- Entity catalog (tên field, kiểu, invariant)  ← **[DOMAIN — dùng khi sinh code]**
- Toàn bộ path đã cấu hình

Tiếp tục sang bước kế tiếp của lệnh đang gọi.

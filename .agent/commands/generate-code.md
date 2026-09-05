# /generate-code — Sinh Implementation Code

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một file `.feature` hoặc UC-ID. Nếu `$ARGUMENTS` là UC-ID, tìm file feature khớp bằng cách glob `{paths.specs_dir}/{domain}/*/bdd/**/{UC-ID}*.feature` (wildcard `*` cho prd-slug chưa biết, `**` đệ quy để phủ các thư mục con platform `web/`·`app/`·`system/`); lấy `domain` + `prd_slug` từ path khớp. Cũng kiểm tra `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{@trace.platform}.tsv` tìm drift (new vs drifted vs synced).*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Scope Lock

Lệnh này giới hạn nghiêm ngặt trong **một file feature** được truyền qua `$ARGUMENTS`:

- File feature: `{path chính xác từ $ARGUMENTS}`
- UC: `{UC-ID}` (đọc từ `@trace.id` trong header file đó)

**KHÔNG đọc hay implement scenario từ bất kỳ file `.feature` nào khác** trong cùng folder domain, kể cả khi chúng dùng chung entity, khái niệm domain, hay tên service.

> **⚠️ Scope Lock CẤM implement UC khác — KHÔNG cấp phép XOÁ code UC khác.** Nhiều UC của cùng nghiệp vụ thường **dùng chung file code** (cùng Controller/Service). Khi một file như vậy đã tồn tại, **mọi member có sẵn là BẤT KHẢ XÂM PHẠM** — kể cả method mang `@trace.implements` của UC khác. Bảo toàn chúng là **YÊU CẦU BẮT BUỘC**, KHÔNG phải vi phạm scope. Bạn ĐƯỢC đọc các tag `@trace.implements` có sẵn trong file code (để biết member nào thuộc UC khác mà giữ) — điều bị cấm chỉ là **implement scenario** của `.feature` khác. Không bao giờ tái tạo file chung "chỉ gồm scenario của UC này" — đó là cách xoá nhầm nghiệp vụ UC trước.

---

## Context Load (bổ sung)

Đọc:
1. Chỉ file `.feature` đã giới hạn scope
2. Tech-doc gộp của PRD tại `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md` (nếu tồn tại) — **tra §10 UC Coverage làm mục lục** để định vị scenario/section của UC đang sinh; **endpoint liên quan = §4.1 entries mà §5 lane của UC này gọi tới** (đừng lấy endpoint/section của UC khác). Từ đó đọc §4 API, §4.5 client, §5 flow của đúng UC này. **Đọc thêm §7 (Security & Authorization)** — luật phân quyền/enforce của UC → áp vào code; **và §8 (Error Handling & Edge Cases)** — mỗi row lỗi/biên phải có nhánh xử lý tương ứng trong code (khớp §4.3 error code), đừng chỉ code happy-path.
3. CLAUDE.md §architecture + §coding_standards
4. **(chỉ FE/App)** Design Spec — nạp qua **Guard** bên dưới (gate approved/độ-tươi + sanity), là nguồn của màn hình, component inventory, và link Figma frame từng-màn.

> **Phạm vi vét nguồn (SRC-CHAIN):** khi một giá trị còn thiếu ở nguồn chính, được phép đọc thêm các artifact **cùng feature-package** `{paths.specs_dir}/{domain}/{prd-slug}/` — PRD `{TICKET-ID}-{prd-slug}.md`, các `.feature` khác (system/web/app), design-spec, tech-doc anh em — cùng `core-entities.md`/`business-dictionary.md`. Đọc **theo nhu cầu** để phân giải giá trị trước khi hỏi người (xem §Quy tắc nguồn giá trị).

---

## Guard — biết ghi code vào REPO NÀO chưa *(chặn CỨNG — G51)*

*Chỉ áp ở umbrella/multi-service (có section `services`). Single-service thì bỏ qua.*

Đọc `@trace.service` từ header `.feature` target (và `service_root` từ context-loader Bước 1.6):

| Giá trị | Hành động |
|---|---|
| `{path}` — đã route | Tiếp tục. |
| **`unrouted`** | **DỪNG.** Chưa ai quyết repo cho domain này. |
| **`unresolved`** | **DỪNG.** Config sai cấu trúc. |
| `service_root = null` | **DỪNG.** Không có mốc thư mục để ghi file. |

```
🔴 Chưa biết ghi code vào repo nào — service của {UC-ID} đang là "{value}".

   Lệnh này ghi file source TƯƠNG ĐỐI với service_root, nên không có mapping thì
   không có chỗ ghi. (Trước G51 nó ghi source vào một thư mục tên đúng chữ
   "unresolved/" — im lặng.)

   Sửa: thêm mapping cho domain "{domain}" vào `services:` của .agent/project-context.yaml
        rồi chạy /validate-traces (nó nâng unrouted → path, sổ tự lành), sau đó chạy lại lệnh này.

   BDD của bạn KHÔNG sai và KHÔNG cần sinh lại — đây là bước cấu hình của architect.
```

> **Vì sao cổng nằm ở ĐÂY chứ không ở `/generate-bdd`** *(G51)*: PRD/BDD là artifact **nghiệp vụ** —
> PO biết `domain` và `platform`, không biết repo, và ở feature đầu tiên của domain mới thì chưa ai
> quyết. Trước G51 cổng đặt ngược: `/generate-bdd` **dừng hẳn** (phase không cần biết) còn lệnh này
> **không kiểm gì** (phase buộc phải biết). Đây là chỗ duy nhất thật sự không chạy nổi khi thiếu.

---

## Guard — BDD & Design Spec đã sẵn sàng chưa *(cảnh báo MỀM — đồng bộ generate-bdd)*

**BDD (mọi platform) — DS1:** đọc `# @trace.status:` từ header `.feature` target.
- `approved` → tiếp tục. Khác `approved` → CHECKPOINT mềm:
  ```
  ⚠️  BDD {UC-ID} đang @trace.status: {status} (chưa duyệt). Code sinh từ BDD chưa chốt có thể phải làm lại.
     Vẫn sinh code bây giờ? (Y/N)
  ```
  Chỉ tiếp khi chọn Y.

**Design Spec (chỉ FE/App — `@trace.platform` = web/app) — DS2:** định vị `{paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{@trace.platform}-{slug}.md`, đọc `| **Status** |` + `| **Built from PRD** |`:
- Không có file, HOẶC `Status ≠ approved`, HOẶC còn màn ❌ Missing, HOẶC `Built from PRD` ≠ `| **Version** |` PRD hiện tại (lỗi thời) → CHECKPOINT mềm (liệt kê lý do + "Vẫn dùng design-spec này? (Y/N)"). Nếu Y mà KHÔNG có design-spec → sinh UI từ BDD + Wireframe PRD (thiếu chi tiết visual).
- **Sanity-scan** (như generate-bdd bước 2.5): màn thiếu state loading/error/empty, AC-UI không testable, component `[NEW]`/`[TODO]` chưa chốt, còn ❌ Missing frame → cảnh báo trong cùng CHECKPOINT.
- `Status: approved` VÀ `Built from PRD` khớp PRD hiện tại VÀ sạch cờ đỏ → dùng làm nguồn màn hình / component / Figma.

**Tech-doc contract (chỉ backend/system) — DS3:** *áp dụng khi lần sinh này tạo code **backend** — `@trace.platform = system` (nguồn chuẩn quyết BE/FE, xem Phase Detection). Bỏ qua FE (`@trace.platform` = `web`/`app`) — FE có nguồn shape riêng ở Phase Detection.*

Định vị tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md`, kiểm phần backend của UC này (§4.1 Endpoints / §4.2 Request-Response / §4.3 Error):
- **Brownfield** — nếu PRD Metadata `API Source: existing`: contract nằm ở Appendix "Existing API Contract" của PRD → nguồn hợp lệ, **bỏ qua DS3** (không cảnh báo).
- **Thiếu tech-doc, HOẶC thiếu §4 contract cho UC này** → CHECKPOINT chặn mềm:
  ```
  ⚠️  Sinh code BACKEND cho {UC-ID} mà chưa có contract chốt (thiếu tech-doc §4 API).
     Code BE không có contract sẽ phải TỰ CHẾ shape API/DTO/error → rủi ro bịa, rework nặng.
     Khuyến nghị: /generate-tech-docs {system .feature} → /review-tech-docs (approved) rồi sinh code.
     Vẫn sinh bây giờ? (Y/N)
  ```
  Chỉ tiếp khi Y. *(Khác FE: FE degrade êm để prototype qua mock; BE thì contract là sản phẩm chính → chặn mềm.)*
- **Có §4 nhưng `@trace.status = draft/in-review`, HOẶC §12 GAP Register còn 🔴 blocker `open` chạm UC này** → WARN (không chặn): "contract chưa chốt / còn {n} blocker-GAP open — có thể phải rework khi contract đổi."
- **Tech-doc lỗi thời so với BDD** — so entry `{@trace.platform}` trong map `@trace.bdd_versions` của tech-doc vs `@trace.bdd_version` của `.feature` target. Tech-doc **cũ hơn** → WARN (không chặn), kể cả khi `@trace.status: approved`:
  ```
  ⚠️  §4 contract dựng từ BDD v{old}, .feature này giờ v{new}.
     Doc vẫn 'approved' nên shape dưới đây được lấy nguyên văn — nhưng nó phản ánh
     behavior CŨ. Nếu BDD đổi request/response/error thì code sinh ra sẽ sai từ nguồn.
     Khuyến nghị: /generate-tech-docs {feature-file} → /review-tech-docs (cổng T3b) trước.
  ```
  *(Chỉ WARN chứ không chặn: BDD hay bump vì lý do không chạm contract — sửa từ ngữ step, thêm side-effect assertion. Người đọc warning là người biết. `/validate-traces` giữ cờ `TECHDOC_STALE_VS_BDD` song song.)*
- **Có §4 + `@trace.status: approved` + 0 blocker-GAP** → dùng §4 làm nguồn contract (shape DTO/endpoint/error lấy nguyên văn từ đây, KHÔNG tự chế).

---

## Phase Detection

> **Nguồn chuẩn quyết BE/FE = `@trace.platform` của FILE FEATURE** — **`system` → BE · MỌI platform khác → FE** (`web`, `app`, `webview`, và bất kỳ surface nào project khai thêm). Luật viết bằng **phủ định**, không phải liệt kê: liệt kê `web`/`app` làm platform thứ tư không khớp nhánh nào, và lệnh sẽ phải tự đoán — sinh sai loại code mà không cờ nào báo. KHÔNG dùng `platform_type` (suy từ module) để quyết BE/FE — nó chỉ dùng cho **idiom stack/module** (cú pháp, layer, thư viện). Lý do: repo fullstack một-module (vd Next.js có API route) có `platform_type` cố định một giá trị, nhưng vẫn có cả feature `system` (BE) lẫn `web` (FE) — chỉ tag của chính feature mới đúng.

Parse `$ARGUMENTS` tìm flag `--phase` và `--force`:

| Flag | Ý nghĩa |
|---|---|
| `--phase=ui` | FE Phase 1 — sinh UI + layer mock API từ System BDD contract |
| `--phase=integration` | FE Phase 2 — thay mock adapter bằng lời gọi API thật từ tech docs |
| `--force` | "Gen lại tường minh" — **CHỈ** bỏ qua guard status ở §Read Trace State (không skip row đang `OK`). Xem định nghĩa hẹp bên dưới. |
| *(không có)* | Default — full: **`system`** → full backend; **mọi platform khác** (`web`/`app`/`webview`/…) → **FE full** (sinh UI + wire API thật trong một lần, không qua bước mock) |

> **`--force` có phạm vi HẸP — đây là ranh giới cứng, không phải khuyến nghị.**
> Nó bỏ qua **đúng một** thứ: luật "row `OK` thì skip" ở §Read Trace State. **Mọi guard khác giữ nguyên hiệu lực:** Scope Lock (cấm implement scenario của `.feature` khác) · quy tắc EXTEND phi-phá-huỷ (đọc lại trước khi ghi · CẤM full Write trên file đã tồn tại · output phải là superset chặt) · Guard sau-ghi · Fill-before-create · Build Verify.
> `--force` **KHÔNG** phải "ghi đè tất cả". Không có cờ nào trong lệnh này cho phép điều đó — mất member/tag của UC khác luôn là lỗi chặn, kể cả với `--force`.
>
> Dùng khi: tech-doc bump revision có đụng thật phần điều khiển UC này, hoặc cần dựng lại code cho một scenario đang `OK`. **Đọc diff của nguồn TRƯỚC** — nếu revision bump không đụng UC này (vd chỉ thêm UC khác vào doc gộp) thì sinh lại code chỉ để đồng bộ một dòng nhãn là rủi ro không đáng.

**Xác định `fe_full`:** khi **KHÔNG** có `--phase` VÀ `@trace.platform` là `web`/`app` → đây là **FE full mode**. Sinh UI **và** wire API thật trong cùng một lần chạy, **bỏ qua** layer mock. Cụ thể: các section **sinh UI** chạy · **Mock API Layer** bị bỏ (chỉ dành `--phase=ui`) · **DS4** và **Integration Phase** VẪN chạy (xem điều kiện của từng section). BE/`system` ở default vẫn là full backend như trước.

**Nếu `--phase` được set — xác nhận platform:**
Đọc `@trace.platform` từ header file feature.
- Nếu `system` → cảnh báo: "Flag `--phase` không áp dụng cho system BDD (hướng BE). Tiếp tục với chế độ default." Coi như không có flag.
- Nếu `web` hoặc `app` → tiếp tục logic phase bên dưới.

**Nếu `--phase=ui`:**
Phân giải **nguồn shape của mock** (hybrid — ưu tiên contract thật, fallback về System BDD):
- **BE contract** — tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md`, phần backend của UC này (§4.1 Endpoints / §4.2 Request-Response / §4.3 Error). Nếu tồn tại, **shape** port/DTO của mock adapter (field request/response, type, error code) lấy từ đây → `mock_source = contract`. Chính xác nhất; không phải rework shape lúc integration.
- **System BDD** `{paths.specs_dir}/{domain}/{prd-slug}/bdd/system/{TICKET-ID}*.feature` — luôn nạp mệnh đề `Then` để lấy **behavior + giá trị fixture**. Nếu không có §4 API contract, shape cũng được infer từ đây → `mock_source = system-bdd`, và WARN:
  ```
  ⚠ Không tìm thấy §4 API contract — shape mock được infer chỉ từ System BDD.
    System BDD mô tả behavior, không phải full request/response shape — mock
    có thể khác API thật; dự kiến điều chỉnh ở --phase=integration.
    (Khuyến nghị: để BE publish {prd-slug}/tech-docs/{TICKET-ID}-tech-design.md (§4) trước để có mock chính xác.)
  ```
- Nếu System BDD cũng thiếu → cảnh báo "Không tìm thấy System BDD — layer mock sẽ dùng fixture placeholder." Tiếp tục.

Lưu `mock_source` (`contract` | `system-bdd`) cho các tag mock bên dưới.

**Rồi chạy Figma Dev Mode MCP Check bên dưới** trước khi sinh UI — link frame của Design
Spec là visual contract, và MCP local đọc chúng với độ trung thực cao hơn nhiều so với link web trần.

---

## Figma Dev Mode MCP Check *(chỉ sinh UI FE/App)*

*Chỉ chạy khi `platform` là `web`/`app` VÀ đang sinh UI (`--phase=ui`, hoặc chế độ default
cho feature FE/App). Bỏ qua hoàn toàn với BE / platform `system`.*

PO viết Design Spec từ **link web Figma** (read-only, giới hạn). Để codegen,
**Figma Dev Mode MCP server local** (tích hợp trong **app desktop** Figma) cho nhiều hơn
nhiều: layout chính xác, **variable/token** design, mapping component **Code Connect**,
selection context, và code snippet — những thứ một URL web đơn không trả về được.

**Step 1 — Phát hiện MCP local.** Kiểm tra xem Figma Dev Mode MCP server có kết nối không
(một Figma tool kiểu `get_design_context` / `get_code` sẵn có qua MCP).

**Step 2 — Nếu CHƯA kết nối → gợi ý dev bật nó, rồi chờ:**

```
🎨 Không phát hiện Figma Dev Mode MCP.
   Để có code FE chính xác (token, component, Code Connect thật), dùng server LOCAL:

   1. Mở app Figma DESKTOP (không phải browser)
   2. Mở file/frame của feature này
   3. Bật Dev Mode MCP server:
        Menu Figma → Preferences → "Enable Dev Mode MCP Server"
        (cần Dev hoặc Full seat; server chạy ở http://127.0.0.1:3845)
   4. Đảm bảo MCP server này đã được thêm vào config MCP của Claude Code
   5. Chọn frame của màn bạn đang implement, rồi tiếp tục

   Gõ C để tiếp tục khi đã bật, hoặc S để skip (fallback về link web + text spec).
```

- `C` → phát hiện lại; nếu giờ đã kết nối → tiếp tục dùng MCP local.
- `S` → tiếp tục ở **fallback mode**: chỉ dùng link frame web + text spec của Design Spec;
  thêm note ⚠️ trong report cuối rằng UI được sinh mà không có độ trung thực Figma local.

**Step 3 — Khi MCP local ĐÃ kết nối:** với mỗi màn đang implement, pull frame được chọn
qua Figma MCP và ground UI trên layout, variable, và mapping Code Connect trả về. Ưu tiên
component được map Code-Connect hơn là bịa markup; dùng tên token thật, không phải giá trị hardcode.

---

## Integration Gates — DS4 (contract) · DS5 (reuse)

*Áp dụng khi wire API thật: `--phase=integration` **HOẶC** `fe_full`. Bỏ qua `--phase=ui` và default BE.*

> **Sequencing ở `fe_full`:** hai cổng này chạy **trước** khi UI/adapter được sinh trong cùng lần chạy, nên chúng suy luận từ **BẢN THIẾT KẾ** (design-spec + tech-doc §4.5) — tức *kế hoạch*, KHÔNG phải code đã sinh. "Port do UI định nghĩa" và "mock adapter có sẵn" chỉ tồn tại ở luồng 2-pha (`--phase=integration` chạy sau `--phase=ui`); ở `fe_full` port thật được chốt tại bước Generate về sau.

Phân giải design điều khiển adapter từ **tech-doc gộp của PRD** `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md`:
- **Mapping port→endpoint→DTO→error** (ưu tiên): §4.5.4 (API Integration Layer của platform này) — mỗi client method → endpoint có thật.
- **Nguồn endpoint/shape**: §4.1 Endpoints + §4.2 Request-Response + §4.3 Error của cùng doc.

**Client contract gate — DS4** *(áp dụng khi `--phase=integration` **HOẶC** `fe_full`; KHÔNG áp dụng `--phase=ui` — UI vẫn degrade êm qua mock).* Đối xứng với DS3 của BE: soi §4.5.4 **đủ chưa** cho UC/platform này *trước khi* wire adapter thật.

1. **Xác định phạm vi cần:** các client method mà UC NÀY dùng — lấy từ §10 (định vị scenario của UC) → §4.5.4 rows. Nguồn interface port: `{UC-ID}ApiPort` của mock adapter (`--phase=integration`, đã có từ lần `--phase=ui` trước) HOẶC, ở `fe_full`, port do chính lần chạy này định nghĩa lúc sinh UI (§4.5.3 state + §4.5.4) — chưa có mock adapter.
2. **Kiểm tính đủ của §4.5.4 cho từng method:** có endpoint (resolve được ở §4.1) + map request + response→model + error→UI. *(Khác cảnh báo cũ: cái cũ chỉ bắt "thiếu HẲN §4.5.4"; DS4 bắt cả "thiếu MỘT PHẦN".)*
3. **Phân loại (giống DS3):**
   - **Đủ + `@trace.status: approved` + 0 🔴 blocker-GAP (§12) chạm §4.5.4/UC này** → dùng làm nguồn, KHÔNG hỏi.
   - **`@trace.status` = `draft`/`in-review`, HOẶC §12 còn 🔴 blocker `open` chạm UC này** → WARN (không chặn): "contract/mapping adapter chưa chốt / còn {n} blocker-GAP open — đảm bảo BE endpoint đã deploy hoặc confirm mapping thủ công; có thể rework khi §4.5.4 đổi."
   - **Thiếu §4.5.4, HOẶC khuyết một phần cho method UC cần** →
     a. Áp **SRC-CHAIN** (xem §Quy tắc nguồn giá trị) lấp phần thiếu từ nguồn khác (§4.1–4.3, PRD, BDD `Then`, core-entities, mock adapter đã sinh).
     b. Phần SRC-CHAIN giải quyết được → tiếp tục.
     c. Phần **thực sự còn trống** → **CHECKPOINT chặn mềm, GỘP mọi gap vào một lần** (mỗi gap ghi rõ "đã tìm ở: {nguồn}"):
        ```
        ⚠️  §4.5.4 chưa đủ cho {UC-ID}/{platform} — {n} mapping còn trống (đã vét SRC-CHAIN):
             - {client method} → {thiếu gì: endpoint/field/error→UI}
           Wire adapter thật với mapping chưa chốt sẽ phải rework.
           Khuyến nghị (front-load): /generate-tech-docs {web|app .feature} → bổ sung §4.5.4 → /review-tech-docs.
           Vẫn wire bây giờ? (Y = best-effort/giữ mock cho phần thiếu · N = dừng, đi hoàn thiện tech-docs)
        ```
        Chỉ tiếp khi Y. *(Đây là "tư thế BE": trỏ ngược tech-docs thay vì hỏi live từng câu.)*
**FE component/service reuse gate — DS5** *(áp dụng khi `--phase=integration` **HOẶC** `fe_full`; KHÔNG áp dụng `--phase=ui`).* **Phát hiện & tái dùng** code FE đang tồn tại trước khi dựng mới — chống đẻ adapter/service **song song, mồ côi**, không nối vào app đang chạy.

1. **Định vị mock adapter framework:** tìm `{UC-ID}MockApiAdapter` trong `{paths.src_dir}/{domain}/` (output `--phase=ui`).
2. **Discovery code FE có sẵn:** quét `{paths.src_dir}` (phạm vi domain/feature) tìm **component / service / hook / api-client** mà các màn của UC này dùng — đối chiếu: component inventory của **design-spec**, path ở tech-doc **§4.5.2**, tên màn/UC. Lập danh sách "đã tồn tại" vs "chưa có".
3. **Quyết định reuse-or-new:**
   - **CÓ mock adapter** (luồng 2-pha chuẩn) → tái dùng port/wiring của nó như cũ; **KHÔNG hỏi**.
   - **KHÔNG có mock adapter NHƯNG discovery thấy component/service có sẵn** (brownfield / chạy integration một mình trên app đang chạy) → **CHECKPOINT hỏi, KHÔNG tự dựng mới:**
     ```
     🔎 Thấy {N} phần FE đang tồn tại cho màn của {UC-ID}/{platform}:
          - {path}  ({component | service | hook | api-client})
        Wire API thật vào code CÓ SẴN này, hay dựng mới?
          R (reuse) — EXTEND/wire adapter vào component/service đang chạy  (khuyến nghị)
          N (new)   — dựng adapter/service mới  (chỉ khi code cũ không tái dùng được — ghi lý do)
     ```
     - **R** → set `reuse_target` = các file có sẵn; Integration Phase **EXTEND/wire vào chúng** (áp Quy tắc EXTEND phi-phá-huỷ + Guard sau-ghi ở §File Scan), KHÔNG tạo file song song.
     - **N** → dựng mới, ghi lý do vào report.
   - **KHÔNG có mock adapter VÀ discovery KHÔNG thấy gì** → greenfield thật → sinh real adapter từ đầu dùng contract tech-doc (không cần hỏi).
4. Lưu `reuse_target` (hoặc `none`) cho Integration Phase dùng ở bước wire-up.

---

## Read Trace State

Đọc `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{@trace.platform}.tsv` nếu tồn tại. Với mỗi scenario row, ghi nhận `status` hiện tại:

| Status | Ý nghĩa | Hành động trong lần chạy này |
|--------|---------|-------------------|
| `UNTRACKED` | `implemented_by == —` | Generate — scenario chưa có code |
| `DRIFT` | `spec_ver != gen_ver` | Sửa **tại chỗ đúng method** của scenario đó (Edit) — KHÔNG viết lại cả file (file chung sẽ mất method UC khác) |
| `OK` | đã implement + test | **Skip** — trừ khi có `--force` (xem §Phase Detection). Sinh lại thì sửa **tại chỗ đúng method** (Edit), như hàng `DRIFT`.<br/>*(Tới đây vì cờ ⓘ `PRD_STALE_REF`/`TECHDOC_STALE_REF`? **Sai lệnh.** Hai cờ đó nghĩa là version bump KHÔNG đụng UC này — dùng `/validate-traces --realign-prd-version {UC-ID}` (chỉ sửa dòng nhãn, không đụng logic). Chỉ dùng `--force` khi cờ là 🟠 `PRD_DRIFT`/`TECHDOC_DRIFT` — nội dung đổi thật.)* |
| `GAP` | đã implement, chưa test | Skip codegen — đã code rồi; chạy `/dev-gen-test` thay vì |
| `ORPHANED` | SC không còn trong `.feature` nhưng code còn | **Skip codegen** — không có scenario nào để implement. **KHÔNG xoá** code/row (cần người quyết định behavior đó còn cần hay không). Nêu ở report cuối: `⚠️ {sc_id} ORPHANED — code {implemented_by} còn tồn tại nhưng scenario đã bị xoá khỏi .feature. Xử: xoá code+test, hoặc đưa scenario trở lại. (/validate-traces giữ cờ 🔴.)` |

Dùng các status này để điền số **Scenarios** trong plan CHECKPOINT (`{X} new, {Y} drifted, {Z} synced-skip`).
Nếu `.tsv` không tồn tại → coi mọi scenario là `UNTRACKED`.

---

## Package Placement *(đặt code đúng convention — chống phân mảnh package)*

Trước khi định vị file, chốt **package đích** theo **Package Layout của CLAUDE.md §2** (context-loader đã trích: `code_base_package` + `package_strategy`):

- **Path code = `{code_base_package}.{layer}`** — vd `vn.edupia.segment.service`, `.repository`, `.facade`. `{layer}` theo thứ tự layer §2 (dto/entity/repository/service/facade/controller…).
- **CẤM đưa `{prd-slug}` / tên feature / `{UC-ID}` vào package** (đây là lỗi hay gặp: map bố cục spec `specs/{domain}/{prd-slug}/` thành package code → đẻ `…{service}.{feature}.{layer}`, nhân bản layer). Feature/UC **chỉ** phân biệt ở **TÊN CLASS**: `EventCollectionService`, `IdentityResolutionService` **cùng nằm trong** `…segment.service`, KHÔNG phải `…segment.eventcollection.service`.
- *(Chỉ khi §2 khai `package_strategy = by-feature` mới đặt sub-package theo feature — mặc định là **by-layer**.)*

**Quét module TÁI DÙNG trước khi tạo:** với mỗi layer, kiểm `{code_base_package}.{layer}` đã tồn tại trên disk chưa. Nếu đã có class phục vụ cùng entity/nghiệp vụ → **đặt member mới vào class đó (EXTEND)**, KHÔNG dựng cây layer / class song song. Chỉ tạo mới khi thực sự chưa có.

**Đặt code FE (`@trace.platform` = web/app):** quy tắc trên là cho BE (Java-style `{package}.{layer}`). FE đặt file theo thứ tự ưu tiên:
1. **Path ở tech-doc §4.5.2 (Component File Mapping)** — nếu có, dùng **nguyên văn** đường dẫn cột `Path` (đây là contract đặt file của FE).
2. **Else** → gốc `{paths.src_dir}` + quy ước thư mục của module/framework (vd `src/features/{domain}/…` React · `lib/{domain}/…` Flutter). Component/hook/service/adapter của cùng feature nằm gần nhau; **KHÔNG** rải mỗi file một nơi.
Adapter API mặc định tại `{paths.src_dir}/{domain}/` (khi §4.5.2 không chỉ định). Luôn **quét `{paths.src_dir}` tái dùng** như BE trước khi tạo mới (đồng bộ DS5).

---

## Seam & Stub Ledger — nối/lấp chỗ chưa implement *(chống mồ côi)*

*Chạy TRƯỚC khi tạo bất kỳ chỗ giả lập nào. Đây là chỗ vá hai lỗi kinh điển khi gen từng BDD: (a) **hàm trắng mồ côi** — callee để trắng vì logic thuộc BDD khác, ghép luồng thì chạy vào no-op; (b) **hàm thật mồ côi** — BDD sau đẻ hàm mới thay vì lấp hàm trắng cũ, thành ra hàm thật không ai gọi.*

Có **hai loại chỗ chưa implement**, ghi chung vào **một sổ** — cột `kind` phân biệt:

| kind | Là gì | Ví dụ |
|---|---|---|
| `seam` | Gọi ra một **port cross-UC** do UC khác sở hữu | `A` gọi `ScoreAccumulationPort` (UC scoring sở hữu) |
| `stub` | Một **method/hàm trắng nội-feature** — callee mà logic thuộc BDD **khác của chính feature này** | `SegmentService.calculateSegment()` để trắng vì logic thuộc BDD2 |

Scope Lock cấm **implement scenario** của `.feature` khác — nhưng KHÔNG cấm **nối vào / lấp code đã tồn tại** (đọc `@trace.implements` sẵn có; xem Scope Lock). Đó là chìa khoá để không đẻ mồ côi.

### Sổ chung `_seams.tsv`

`{paths.trace_dir}/{domain}/{prd-slug}/_seams.tsv` — tạo file + header nếu chưa có, tab-separated:

```
kind    name    consumer_uc    owner_uc    artifact    binding    status    last_updated
```

- `kind` = `seam` | `stub`
- `name` = tên port (seam) | trách nhiệm/tên logic ngắn (stub) — "cái gì đang thiếu"
- `consumer_uc` = UC có call-site / để trắng
- `owner_uc` = UC sở hữu logic thật (`?` nếu tech-doc chưa nói rõ)
- `artifact` = `StubClass` (seam) | `ClassName#method` (stub) — nơi tìm ra hàng giả
- `binding` = cách stub được wire, vd bean/config (seam) | `—` (stub lấp tại chỗ, không qua binding)
- `status` = `PENDING` (chưa có hàng thật — bình thường) · `READY` (hàng thật đã có nhưng chưa nối/lấp — 🔴) · `RESOLVED` (đã nối/lấp xong)

*(Sổ sống cạnh TSV trace — cùng `trace_dir`, cùng luật ghi liên-repo khi có `spec_source`.)*

### Loại A — Seam (port ra ngoài, cross-UC)

Khi scenario của `{UC-ID}` gọi qua một **port do UC khác sở hữu** (vd `ScoreAccumulationPort`):

**A1. Xác định port + chủ sở hữu.** Từ tech-doc gộp — §5 flow lane của UC này (participant nào bị gọi tới), §6.2 Cross-Service Dependencies, §11 Out-of-Scope Reference — lấy tên port và **UC nào sở hữu hàng thật**. Tech-doc không nói rõ chủ → `owner_uc = ?`.

**A2. Ngó vào kho TRƯỚC khi dán giấy nợ.** Quét disk tìm một class **thật** implement port đó dưới `{code_base_package}` — class KHÔNG phải `*Stub*`/`*Mock*` và mang `@trace.implements` của UC khác:
- **CÓ hàng thật → nối thẳng, KHÔNG tạo stub.** Wire DI binding của `{UC-ID}` vào class thật (constructor injection / `@Primary` bean / config hiện có). Đây là **cấu hình wiring của chính UC này** → không vi phạm Scope Lock/EXTEND.
- **CHƯA có hàng thật → tạo stub, NHƯNG ghi nợ** (A3).

**A3. Ghi sổ nợ (chỉ khi phải tạo stub).**
- Tag class stub: `@trace.seam_pending={owner_uc | ?}` + `@trace.seam_port={PortName}`.
- Append 1 dòng: `kind=seam` · `name={PortName}` · `consumer_uc={UC-ID}` · `owner_uc={owner|?}` · `artifact={StubClass}` · `binding={cách wire}` · `status=PENDING`.

**A4. Khi CHÍNH `{UC-ID}` là chủ nợ** (lần gen này sinh **hàng thật** của một port UC khác đã stub trước đó):
- Sinh class thật bình thường (đúng layer).
- Đọc sổ: mọi dòng `kind=seam` `status=PENDING` có `owner_uc == {UC-ID}` (hoặc `owner_uc == ?` mà `name` khớp port) → đổi `status → READY`.
- **KHÔNG tự sửa binding của UC consumer** (file/scope UC khác — tránh clobber). IN cảnh báo nổi bật ở report cuối:
  ```
  🔌 SEAM READY — {port}: hàng thật {RealClass} vừa sinh, nhưng {consumer_uc} còn wire vào {stub_class}.
     Nối: trỏ binding của {consumer_uc} sang {RealClass} (xoá/thay stub), rồi build lại.
     (/validate-traces giữ cờ SEAM_UNWIRED tới khi nối xong.)
  ```

### Loại B — Stub (method/hàm trắng nội-feature) 🆕

Khi một scenario buộc gọi tới một callee mà **logic thuộc BDD khác của chính feature này** → KHÔNG để trắng vô hình. Làm hàm trắng thành **hiện hình + có sổ**:

**B1. Class thật GIỮ NGUYÊN TÊN** (vd `SegmentService` — KHÔNG đổi thành `StubSegmentService`; class là thật, chỉ **method** là placeholder).

**B2. Chữ ký suy từ CALL-SITE** — đúng cái caller cần (tên method, tham số, kiểu trả về). Thân method là placeholder rõ ràng: `throw new UnsupportedOperationException("stub: {trách nhiệm}")` (hoặc tương đương theo stack). **KHÔNG bịa logic** — chỉ dựng chữ ký.

**B3. Tag lên method trắng:**
```
@trace.stub={UC-ID}                (ai để trắng — consumer)
@trace.stub_owner={owner_uc | ?}   (BDD/UC sẽ điền logic thật)
@trace.stub_for={trách nhiệm ngắn} (để owner nhận ra đây là chỗ cần lấp)
```

**B4. Ghi sổ:** append 1 dòng: `kind=stub` · `name={trách nhiệm}` · `consumer_uc={UC-ID}` · `owner_uc={owner|?}` · `artifact={ClassName#method}` · `binding=—` · `status=PENDING`.

> *Phần lấp stub (khi BDD owner chạy) + cổng kiểm mồ côi nằm ở "Fill-before-create" và `/validate-traces` — xem các mục sau.*

> **Mẹo vận hành (né hẳn):** gen BDD **sở hữu logic TRƯỚC**, BDD **gọi SAU** — khi đó không bao giờ cần để trắng, không phát sinh nợ. Cơ chế trên chỉ để chịu được thứ tự ngược.

---

## File Scan

Trước khi sinh, xác định file nào cần cho các scenario của UC này — **path theo Package Placement ở trên**. Kiểm tra mỗi file đã tồn tại trên disk chưa.

Phân loại mỗi file:

| Status | Ý nghĩa | Hành động |
|--------|---------|--------|
| `CREATE` | File chưa tồn tại | Sinh file mới đầy đủ |
| `EXTEND` | File tồn tại, cần method mới | Chỉ thêm method mới — KHÔNG viết lại code có sẵn |
| `FILL` | File tồn tại, chứa **method stub trắng** mà `{UC-ID}` là chủ logic | **Lấp logic thật vào chính method đó** (Edit) — KHÔNG đẻ method song song (xem Fill-before-create) |
| `SKIP` | File tồn tại và đã phủ tất cả scenario của UC | Để nguyên |

> **Quy tắc EXTEND (phi-phá-huỷ — BẮT BUỘC ở mức thao tác):**
> 1. **Đọc lại file trên disk NGAY TRƯỚC khi ghi** (không dựa vào trí nhớ từ đầu phiên — file có thể đã đổi).
> 2. **CHỈ dùng thao tác chèn/sửa từng phần (Edit) để THÊM member mới.** **CẤM tuyệt đối ghi đè cả file (full Write)** cho file đã tồn tại — đây là nguyên nhân số 1 xoá nghiệp vụ UC trước.
> 3. Output PHẢI là **superset chặt** của nội dung cũ: **mọi** method, field, annotation, import, và `@trace.implements` cũ (kể cả của UC khác) **còn nguyên si**. Chỉ được **thêm**, không xoá/sửa member không thuộc `{UC-ID}` này.
> 4. Gắn `@trace.implements={UC-ID}-SC{N}` lên mỗi method **mới**.
>
> **Guard sau-ghi (lưới an toàn — chạy sau khi ghi mỗi file EXTEND):** đọc lại file vừa ghi, đối chiếu với bản trước khi sửa: **mọi `@trace.implements` và member cũ phải vẫn còn**. Nếu **mất bất kỳ member/tag cũ nào** (đặc biệt của UC khác) → **DỪNG NGAY, khôi phục file về bản cũ** (`git checkout -- {file}` nếu đã commit, hoặc hoàn tác edit), báo lỗi: *"EXTEND làm mất {member/tag} của {UC khác} — đã chặn clobber. Sửa lại theo add-only rồi chạy lại."* KHÔNG tiếp tục sinh các file sau khi chưa khôi phục.

> **Fill-before-create (chống hàm thật mồ côi — BẮT BUỘC trước khi tạo BẤT KỲ method mới nào):**
>
> Trước khi sinh một method mới cho scenario của `{UC-ID}`, phải kiểm tra: nó có phải là **logic thật cần lấp vào một stub đã tồn tại** không — thay vì đẻ một method song song mồ côi (nửa B của bug: BDD sau tạo hàm mới thay vì lấp hàm trắng cũ → hàm cũ được caller gọi mà rỗng, hàm mới không ai gọi).
>
> 1. **Quét chỗ chờ lấp** (hai nguồn):
>    - Sổ `_seams.tsv`: dòng `kind=stub` `status=PENDING` có `owner_uc == {UC-ID}` (hoặc `owner_uc == ?` mà `name`/trách nhiệm khớp scenario đang làm).
>    - Scan disk dưới `{code_base_package}`: method mang `@trace.stub_owner == {UC-ID}` (hoặc `?`) và `@trace.stub_for` khớp trách nhiệm.
> 2. **KHỚP → lấp TẠI CHỖ (Edit), KHÔNG tạo mới.** Ghi logic thật vào **đúng thân method stub đó**, **giữ nguyên chữ ký** (caller đang gọi vào đó — đổi chữ ký = gãy call-site). Gỡ 3 tag `@trace.stub*`, thay bằng `@trace.implements={UC-ID}-SC{N}`. **CẤM tạo method mới cùng trách nhiệm** — đó chính là hàm mồ côi.
> 3. **Cập nhật sổ:** dòng tương ứng `status → RESOLVED`, `owner_uc = {UC-ID}`, `last_updated`. *(Caller ở UC khác KHÔNG cần đổi — vẫn gọi đúng method cũ, giờ có logic; đây là điểm khác với seam: stub lấp tại chỗ, không cần rewire binding.)*
> 4. **Không khớp stub nào → tạo method mới bình thường** (theo EXTEND/CREATE ở trên).
>
> **Guard sau-lấp:** sau khi lấp, KHÔNG được còn method trắng cùng trách nhiệm, cũng KHÔNG được có method song song mới cùng trách nhiệm. Lỡ tạo song song → gộp về một, xoá method thừa (chỉ khi chắc chắn cùng trách nhiệm).
>
> *Nghi ngờ khớp mà không chắc (tên/chữ ký lệch nhiều) → KHÔNG tự ý xoá/gộp; giữ nguyên cả hai + để `/validate-traces` gắn cờ cho người soát.*

---

## CHECKPOINT — Code Generation Plan

Trước khi sinh code, hiện:

```
Code Generation Plan — {UC-ID}
──────────────────────────────────────────────────────
Feature  : {name}
Ticket   : {TICKET_ID nếu biết}
Domain   : {domain}
UC       : chỉ {UC-ID}  ← các file feature khác trong folder này KHÔNG được đọc
Tech     : {language} / {framework}
Package  : {code_base_package}.{layer} · {by-layer | by-feature}  ← feature/UC ở TÊN CLASS, KHÔNG thành package (nếu by-layer)
Phase    : {UI — mock layer | Integration — real API | FE full — UI + real API | BE full}   ← FE full = default trên web/app; bỏ dòng này với default BE
Scenarios: {N} total ({X} new, {Y} drifted, {Z} synced-skip)
Layer    : {từ CLAUDE.md §2}
Client   : {chỉ integration/fe_full — reuse: {reuse_target hoặc "dựng mới"} · gaps §4.5.4: {n còn trống hoặc "đủ"}}   ← bỏ dòng này với BE / --phase=ui

Files:
  CREATE  {N} file mới
    + {path/FileName.ext}
  EXTEND  {M} file có sẵn  (ADD-ONLY — chỉ Edit thêm, CẤM full Write)
    ~ {path/FileName.ext}  — thêm: {methodA}, {methodB}
        ↳ GIỮ NGUYÊN (member có sẵn, gồm UC khác): {methodX [UC-other], methodY …}   ← sẽ không bị đụng
  FILL    {F} stub trắng  (lấp logic TẠI CHỖ — KHÔNG đẻ method song song)
    ⟲ {path/FileName.ext}#{method}  — lấp: {trách nhiệm}  (stub của {consumer_uc})
  SKIP    {K} file  (không cần đổi)
    = {path/FileName.ext}
──────────────────────────────────────────────────────
Proceed? (Y/N)
```

Chờ "Y" rõ ràng trước khi sinh.

## Branch
```bash
git checkout -b feature/{TICKET_ID}-{slug}
```

## Generate (thứ tự layer từ CLAUDE.md §2)

Thứ tự mặc định (override từ CLAUDE.md nếu khác):
DTOs → Entity/Model → Repository → Service interface → Service impl → Facade (nếu áp dụng) → Controller

**Với file `CREATE`:** sinh file đầy đủ.

**Với file `EXTEND`:** áp **Quy tắc EXTEND phi-phá-huỷ** (xem File Scan) — đọc lại file trên disk → **chỉ Edit thêm** method mới cho `{UC-ID}` → **KHÔNG full Write**, không đụng member cũ → chạy **Guard sau-ghi** để chắc không mất member/tag của UC khác.

**Với file `FILL`:** áp **Fill-before-create** (xem File Scan) — Edit logic thật vào **đúng thân method stub** đã có, giữ nguyên chữ ký, gỡ `@trace.stub*` → `@trace.implements`, cập nhật sổ `RESOLVED`. **KHÔNG** đẻ method mới cùng trách nhiệm.

**Tag traceability trên controller/handler (theo cú pháp comment của ngôn ngữ bạn):**
```
@trace.implements={UC-ID}-SC{N}
@trace.prd_version={đọc @trace.prd_version từ header file .feature}
@trace.bdd_version={đọc @trace.bdd_version từ header file .feature}
@trace.tech_doc_revision={đọc @trace.revision từ header tech-doc, hoặc bỏ nếu không có tech-doc}
@trace.design_spec_version={CHỈ FE/App (@trace.platform = web|app): đọc | **Version** | từ Metadata design-spec đã nạp. BỎ HẲN dòng này với system/backend}
@trace.source={paths.specs_dir}/{domain}/{prd-slug}/bdd/{@trace.platform}/{UC-ID}-{slug}.feature
```

`@trace.prd_version` ghi code này được viết theo version PRD nào.
`@trace.bdd_version` ghi code này được sinh từ version BDD nào.
`@trace.tech_doc_revision` ghi code này theo revision tech-design nào.
`@trace.design_spec_version` *(chỉ FE/App)* ghi code này dựng theo version design-spec nào — nguồn của `DESIGNSPEC_DRIFT`. **Vì sao cần:** design-spec là input BẮT BUỘC của code FE (màn hình, component inventory, link Figma frame) và của cả BDD FE/App, nhưng trước đây nó là artifact upstream **DUY NHẤT** không có cột TSV, không có tag trong code, không có cờ drift — designer sửa design-spec sau khi code đã sinh thì không gì phát hiện được.
`/validate-traces` sẽ gắn cờ drift nếu bất kỳ artifact upstream nào được cập nhật lên version mới hơn.

> **Quy tắc entry-point:** `@trace.implements` phải xuất hiện ở **layer entry-point** như định nghĩa trong `CLAUDE.md §2`. Với REST API → Controller. Với module event-driven → event handler / consumer class. Với context-engineering → hàm orchestration prompt. Không bao giờ chỉ đặt ở layer trong.

> **File phủ NHIỀU UC → lặp CẢ BLOCK 5 tag, đặt trên method của từng UC. CẤM trỏ thư mục, CẤM gộp về một header file.**
>
> Đây là hình dạng đúng:
> ```
> // @trace.implements=USR-UC1-SC3
> // @trace.prd_version=1.2   @trace.bdd_version=1.4   @trace.tech_doc_revision=3
> // @trace.source=specs/user/create-account/bdd/system/USR-UC1-create-account.feature
> public AccountDto createAccount(...) { }
>
> // @trace.implements=USR-UC3-SC1
> // @trace.prd_version=2.0   @trace.bdd_version=2.1   @trace.tech_doc_revision=5
> // @trace.source=specs/user/create-account/bdd/system/USR-UC3-verify-email.feature
> public void verifyEmail(...) { }
> ```
>
> **Vì sao không được gộp:** 3 tag version là **scalar theo từng UC**. Một file phủ UC1 + UC3 mà chỉ có một header thì không diễn đạt được "UC1 ở bdd v1.4, UC3 ở v2.1" → `/validate-traces` Step 4/5/5c báo drift oan hoặc **mù** drift thật. Version phải nằm cạnh member nó mô tả.
>
> **Vì sao không được trỏ thư mục** (`@trace.source=…/bdd/system/`): độ phân giải của trace là `UC × SC`, thư mục làm mất cả hai bậc. Và các lệnh tra tag bằng **khớp chuỗi chính xác** (`/dev-gen-test`, `/dev-smoke-test`, `/review-code` đều tìm "file gắn `@trace.implements={UC-ID}`") → tag trỏ folder ra 0 kết quả, UC rơi về `UNTRACKED` dù code đã có.
>
> Quy tắc EXTEND ở §File Scan vốn đã yêu cầu giữ **nguyên si** mọi `@trace.implements` cũ *kể cả của UC khác* — tức là thiết kế vốn là **tích luỹ nhiều block**, không phải gộp lại.

> **Quy tắc nguồn giá trị (chống hard-code):** MỌI giá trị cụ thể (endpoint path, error code, tên field/DTO, enum, limit/timeout, header) phải lấy từ **nguồn đã chốt** — **KHÔNG bịa inline**. Nếu một hằng số nghiệp vụ lặp lại hoặc mang ý nghĩa (retry count, ngưỡng, key) → **đặt tên hằng số** (constant/config), không rải magic number/string trong code.
>
> **VÉT CẠN NGUỒN TRƯỚC KHI HỎI (SRC-CHAIN) — bắt buộc.** Khi một giá trị chưa thấy ở nguồn chính, PHẢI quét lần lượt các nguồn đã có trong context/spec-package theo thứ tự sau, **dừng ngay khi tìm thấy** (skip-if-answered), KHÔNG hỏi người ngay:
> 1. Tech-doc gộp §4 (contract: §4.1 endpoint · §4.2 request/response · §4.3 error · §4.5.4 client integration)
> 2. `core-entities.md` (tên field / type / enum) · `business-dictionary.md` (thuật ngữ chuẩn)
> 3. PRD của UC (nhất là Appendix "Existing API Contract" khi `API Source: existing`, và metadata)
> 4. Design-spec (FE/App: field/label/state màn hình)
> 5. System/platform BDD — mệnh đề `Then` (behavior + giá trị fixture)
> 6. Code/adapter đã sinh ở lần chạy trước (vd mock adapter `--phase=ui` đã chốt shape port/DTO) · config/env
> 7. Tech-doc anh em cùng domain
>
> Chỉ giá trị **thật sự không nguồn nào có** mới là GAP. **Gom TẤT CẢ GAP còn lại vào MỘT checkpoint** (mỗi GAP ghi rõ "đã tìm ở: {các nguồn}"), hỏi một lượt — KHÔNG hỏi lắt nhắt từng câu, KHÔNG chế bừa (đồng bộ Cổng 2 của generate-tech-docs). *(DS3 đã đảm bảo có §4 contract trước khi tới đây với BE.)*

### Test Selectors — emit element ID ổn định *(chỉ UI FE/App)*

*Áp dụng khi `platform` là `web`/`app` và đang sinh UI (`--phase=ui`, hoặc chế độ default FE/App). Bỏ qua với BE.*

Mỗi element **có action** (button, input, link, select, toggle, form-submit) PHẢI mang một **test-id ổn định** để QC định vị trực tiếp (không scan runtime):

1. **Nguồn id.** Nếu tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md` có **§4.5.6 Test Selectors** cho platform này, lấy id **nguyên văn** từ bảng đó (contract). Nếu chưa có (vd `--phase=ui` trước khi §4.5 được vẽ), **sinh id theo quy ước** `{uc-lower}-{screen}-{element}-{type}` (vd `ft001-login-submit-btn`) để QC vẫn có handle ổn định — chúng sẽ được đối chiếu với §4.5.6 của tech-design lúc integration.
2. **Emit qua attribute platform** — chọn attribute theo **`active_module`** (bảng dưới, mặc định). Chỉ override khi header `.feature` khai tường minh `@trace.testid_attr={attr}` (hiếm; dùng cho stack lai). Không có khai báo → theo module:
   - web (`react`/`nextjs`/`vue`/`angular`) → `data-testid="..."`
   - React Native → `testID="..."`
   - Flutter → `Key('...')` (+ `Semantics(identifier: '...')` khi action cần)
   - native iOS → `accessibilityIdentifier = "..."`
3. Chỉ element có action; đừng spam id lên text tĩnh. Giữ id giống hệt map của tech-design để QC Page Object khớp ngay lần đầu.
4. **Component catalog tái dùng?** Truyền id qua **forwarding prop** của nó (xem section catalog `## Test-ID Forwarding` — vd `<Button testId="ft001-login-submit-btn">`), không phải attribute thô. Nếu component không forward test-id, hoặc bạn đang backfill màn **existing/brownfield** (không phải sinh mới ở đây), đó là việc của `/map-testids {UC-ID}` — chạy nó thay vì sửa component dùng chung inline.

## Mock API Layer (chỉ `--phase=ui`)

*Bỏ qua hoàn toàn section này nếu `--phase` không phải `ui`.*

Dựng mock từ `mock_source` đã phân giải ở Phase Detection — **shape** từ §4 API contract (tech-doc gộp) khi có, **giá trị fixture + behavior** luôn từ mệnh đề `Then` của System BDD:

1. **Định nghĩa shape port** `{UC-ID}ApiPort` (DTO request/response + error code):
   - `mock_source = contract` → tên field / type / error code lấy **nguyên văn từ tech-doc gộp** §4.1 (Endpoints) / §4.2 (Request-Response) / §3 (Data Model) — shape thật.
   - `mock_source = system-bdd` → shape **infer** từ mệnh đề `Then` của System BDD (tạm — xem cảnh báo ở trên).
2. **Trích dữ liệu fixture** theo từng scenario từ mệnh đề `Then` của System BDD — response success + error (BDD là source of truth cho *giá trị / behavior*, bất kể nguồn shape).
3. **Sinh mock adapter** tại `{paths.src_dir}/{domain}/{UC-ID}MockApiAdapter.{ext}`:
   - Implements interface `{UC-ID}ApiPort` (cùng interface mà real adapter sẽ implement)
   - Mỗi method trả về fixture data khớp mệnh đề `Then` của BDD, theo shape của port
   - Gồm cả trạng thái success và error (map sang các error scenario trong BDD)
   - Tag traceability:
     ```
     @trace.mock_for={UC-ID}
     @trace.mock_source={contract | system-bdd}
     @trace.system_bdd={paths.specs_dir}/{domain}/{prd-slug}/bdd/system/{UC-ID}*.feature
     {@trace.be_contract={TICKET-ID}-tech-design.md   # chỉ khi mock_source=contract}
     ```
4. **Wire vào layer service/hook** qua environment flag hoặc DI:
   ```
   const adapter = IS_MOCK ? new {UC-ID}MockApiAdapter() : new {UC-ID}ApiAdapter()
   ```
   - `IS_MOCK` mặc định `true` ở môi trường development/test cho tới khi real adapter được sinh.

> Tester dùng mock adapter để test mọi FE scenario mà không cần đợi BE **deploy**.
> Shape lấy từ §4 API contract (tech-doc gộp) khi có (chính xác, không rework integration); else từ System BDD (tạm — điều chỉnh ở `--phase=integration`). Giá trị fixture luôn từ System BDD — BDD là source of truth cho behavior.

---

## Integration Phase (`--phase=integration` HOẶC `fe_full`)

*Bỏ qua hoàn toàn section này nếu KHÔNG phải `--phase=integration` và KHÔNG phải `fe_full` (vd `--phase=ui`, hoặc default BE/`system`).*

*Hai chế độ vào section này:*
- **`--phase=integration`** — đã có mock adapter + UI từ lần `--phase=ui` trước → **thay** mock bằng real (có lật wire-up).
- **`fe_full`** — UI vừa được sinh trong CHÍNH lần chạy này, **không có bước mock** → wire real adapter **thẳng** (không có mock để thay/lật).

1. **Đọc integration design.** Trong tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md`: ưu tiên §4.5.4 (mapping port→endpoint→DTO→error của platform), dùng §4.1/§4.2/§4.3 làm nguồn endpoint / request-response / error-code. Nếu doc chưa có §4.5.4 cho platform này, trích endpoint + shape + error code trực tiếp từ §4.1–§4.3.
   - **Tính đủ của §4.5.4 đã được cửa DS4 kiểm + vét SRC-CHAIN + gộp-hỏi TỪ TRƯỚC.** Ở bước này dùng thẳng kết quả đã phân giải của DS4 — **KHÔNG mở checkpoint/hỏi lại**. Nếu DS4 kết luận một mapping vẫn trống mà người đã chọn Y (best-effort) → ở `--phase=integration` giữ mock cho phần đó; ở `fe_full` để adapter trả stub, tag `@trace.stub`, ghi sổ seam; đừng bịa giá trị.
2. **Nguồn interface port `{UC-ID}ApiPort`:**
   - `--phase=integration` (có mock) → đọc từ mock adapter có sẵn (output `--phase=ui`). Real adapter implements **cùng** interface → shape port/DTO đã cố định, **không hỏi lại shape**.
   - `reuse_target` (DS5 chọn **R**) → dùng interface/kiểu mà **service/hook có sẵn** đang khai báo; adapter mới phải khớp chữ ký chúng đang gọi (không đổi hợp đồng của code đang chạy).
   - `fe_full` greenfield → port do UI vừa sinh trong lần này định nghĩa (§4.5.3/§4.5.4). Không có mock adapter để đọc.
3. **Sinh / lắp real API adapter** — theo kết quả **DS5**:
   - **`reuse_target` = none** (greenfield / DS5 chọn N) → sinh file mới `{paths.src_dir}/{domain}/{UC-ID}ApiAdapter.{ext}`, implements `{UC-ID}ApiPort`.
   - **`reuse_target` có file** (DS5 chọn R) → **EXTEND vào service/api-client/hook đang chạy** (áp Quy tắc EXTEND phi-phá-huỷ + Guard sau-ghi ở §File Scan): thay lời gọi mock/placeholder bằng lời gọi HTTP thật **tại chỗ**, giữ nguyên mọi member cũ; **KHÔNG** tạo `{UC-ID}ApiAdapter` song song.
   - Chung: gọi HTTP thật tới endpoint từ contract tech-doc; map field response sang shape port/service khai báo; tag:
     ```
     @trace.implements={UC-ID}-SC{N}
     @trace.tech_doc_revision={đọc từ header tech-doc}
     ```
4. **Wire-up:**
   - `--phase=integration` (có mock) → **lật** DI binding / env flag để service/hook dùng adapter thật thay vì mock. **KHÔNG xoá mock adapter** — giữ cho unit test.
   - `reuse_target` (DS5 chọn R) → wiring đã nằm trong chính component/service có sẵn (đã EXTEND ở bước 3) → **không thêm binding song song**; chỉ chỉnh cấu hình bật đường thật nếu code cũ có cờ mock.
   - `fe_full` greenfield → wire service/hook thẳng vào `{UC-ID}ApiAdapter` (thật); không sinh mock adapter (unit test dùng stub/fake tại chỗ khi cần).

---

## Self-Review (3 vòng)
- [ ] Mỗi scenario có endpoint tương ứng
- [ ] @trace.implements trên mọi endpoint
- [ ] Tôn trọng quy tắc layer kiến trúc (CLAUDE.md §2)
- [ ] Error handling khớp CLAUDE.md §5
- [ ] **Không hard-code:** giá trị cụ thể lấy từ tech-doc §4 / core-entities / config; hằng số nghiệp vụ được đặt tên; 0 magic number/string inline; không debug logging
- [ ] **Add-only cho file EXTEND:** đọc lại file trên disk; mọi member + `@trace.implements` cũ (gồm UC khác) còn nguyên; Guard sau-ghi đã chạy, không mất member nào
- [ ] **Seam/Stub ledger:** không tạo giả lập khi hàng thật đã tồn tại (đã nối/lấp thẳng); mọi seam mới có `@trace.seam_pending` + dòng `kind=seam PENDING`; mọi method trắng có `@trace.stub`/`@trace.stub_owner`/`@trace.stub_for` + dòng `kind=stub PENDING` trong `_seams.tsv`; nếu UC này là chủ nợ (seam) → đã set `READY` + in cảnh báo
- [ ] **Fill-before-create:** trước khi tạo method mới đã quét sổ + `@trace.stub` — có stub khớp thì **lấp tại chỗ** (giữ chữ ký, gỡ `@trace.stub*` → `@trace.implements`, sổ `RESOLVED`); KHÔNG còn method song song cùng trách nhiệm
- [ ] **Ghi sổ xong và đã KIỂM LẠI:** §Write Trace State đã chạy, và Guard sau-ghi cho sổ xác nhận mọi `sc_id` vừa implement có `gen_ver` + `implemented_by` ≠ `—`. Footer có dòng `📓 Sổ trace: đã ghi {n}/{m}`. *(Bước này ở cuối lệnh nên dễ rơi nhất — rơi là dashboard đếm thiếu vĩnh viễn, xem G60.)*

## Build Verify
```bash
{conventions.build_command}   # từ project-context.yaml, tối đa 3 retry
```

> **GATE build (BẮT BUỘC):** chỉ khi build **SUCCESS** mới được đi tiếp sang **Write Trace State** và **Commit**.
> - Fail → sửa lỗi rồi retry (tối đa 3 lần).
> - **Vẫn fail sau 3 retry → DỪNG.** KHÔNG ghi trace, KHÔNG commit (trace/repo không được nói "đã xong" khi chưa build được). Xuất:
>   ```
>   ❌ Build FAIL sau 3 lần thử — không ghi trace, không commit.
>      Lỗi cuối: {tóm tắt}
>      File đã sinh giữ nguyên trên working tree để bạn sửa tay hoặc chạy /debug.
>
>      ⚠️  Code đã có tag @trace.implements nhưng SỔ CHƯA GHI. Nếu bạn sửa tay cho build
>          pass rồi commit mà KHÔNG chạy lại lệnh này, sổ sẽ đứng ở "chưa có code" vĩnh
>          viễn — không lệnh nào tự dọn. Hai đường ra:
>            · chạy lại /generate-code {UC-ID} --force  (ghi sổ đúng đường chính thức), hoặc
>            · /validate-traces --reconcile-code        (điền sổ từ tag, KHÔNG set status)
>   ```
>   Đặt Status badge = ❌ ở report cuối và dừng (bỏ qua Write Trace / Refresh Panel / Commit).
>
> **Vì sao đường thoát này phải chỉ cửa ra (G60):** trạng thái nó để lại — *code có tag, sổ
> trống* — là trạng thái **duy nhất** trong framework mà không bước nào sau đó sửa. Đo trên một
> project thật: 504 scenario ở đúng trạng thái này, làm dashboard đếm thiếu 28 điểm phủ code.
> Một ngõ cụt được tài liệu hoá mà không chỉ cửa ra thì người dùng sẽ tự chọn cửa sai (bôi xanh
> sổ bằng tay, kể cả những scenario chưa có test).

## Write Trace State

Cập nhật `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{@trace.platform}.tsv` — với mỗi scenario đã implement, tìm row có sẵn theo `sc_id` và chỉ cập nhật các cột sau. *(Umbrella + `spec_source`: `trace_dir` phân giải về `{spec_source}/.trace` — lệnh này chạy từ `service_root` nhưng ghi trace row vào **spec repo** (liên-repo); commit/push spec submodule cho lần cập nhật trace, cùng với push code 2 tầng.)*

| Cột | Giá trị |
|--------|-------|
| `gen_ver` | copy `spec_ver` từ row `.tsv` hiện tại (= version scenario tại thời điểm codegen) |
| `implemented_by` | `{ControllerClass}.{methodName}` |
| `bdd_version` | `@trace.bdd_version` từ header `.feature` |
| `tech_doc_revision` | `@trace.revision` từ tech-doc gộp `{TICKET-ID}-tech-design.md` (§4 backend đã điều khiển codegen của UC này), hoặc `—` nếu chưa có doc |
| `fe_tech_doc_revision` | `@trace.revision` của cùng tech-doc gộp, ghi khi sinh FE có wire adapter theo §4.5.4 (`--phase=integration` **hoặc** `fe_full`); `—` cho BE, hoặc cho FE `--phase=ui` / chưa có §4.5.4 |
| `fe_phase` | `ui` nếu `--phase=ui` \| **`integrated`** nếu `--phase=integration` **hoặc** `fe_full` (đều đã wire real adapter) \| `—` cho BE |
> ⚠️ Giá trị cột là **`integrated`** — có hậu tố **-ed**. Dạng không -ed chỉ thuộc về **cờ** `--phase=integration`, không bao giờ là giá trị của cột; vocabulary của cột chỉ có `ui` \| `integrated` (`trace-schema.json` → `vocabularies.fe_phase`). Ghi sai giá trị thì `--lint-trace` T3 báo lỗi, và `fe_integrated` ở `/validate-traces` Step 7 đếm `integrated` nên sẽ **mãi bằng 0 trong im lặng**.
| `last_updated` | hôm nay `YYYY-MM-DD` |

Giữ nguyên mọi cột khác (`sc_title`, `spec_ver`, `prd_version`, `prd_status`, `uc_status`, `test_count`, `test_classes`, `dev_selftest`, `dev_selftest_at`, `qc_status`, `qc_run_at`, `qc_owner`, `qc_blocked_by`) — **trừ ngoại lệ có kiểm soát ngay dưới đây**: khi logic vừa đổi thật (lấp stub, hoặc sửa method vì `DRIFT`), 4 cột nghiệm thu `dev_selftest`/`dev_selftest_at`/`qc_status`/`qc_run_at` **phải bị hạ** về "chưa biết". Giữ một `pass` đã hết hiệu lực là báo cáo sai, không phải tôn trọng quyền sở hữu cột.
`status` được tính bởi `/validate-traces` — không set ở đây.

**Hạ hiệu lực tín hiệu kiểm thử khi logic vừa đổi thật.** Áp cho **HAI** trường hợp — cùng một lý do, cùng một tập cột *(luật "Làm mất hiệu lực ≠ ghi đè", `rules/workflow.md`)*:

| Trường hợp | Phạm vi scenario bị ảnh hưởng |
|---|---|
| **A. Lấp stub** (Fill-before-create — dòng sổ `→ RESOLVED`) | **Mọi** scenario chạy qua method vừa lấp — gồm cả scenario của **consumer_uc** (UC đã để trắng, thường nằm ở file TSV khác `{consumer_uc}-{platform}.tsv`) |
| **B. Sửa method vì row đang `DRIFT`** (spec đổi sau lần gen trước) | Đúng các SC vừa được sửa method trong lần chạy này |

Với mỗi scenario trong phạm vi:
- `dev_selftest → not_run` · `dev_selftest_at → —` · `qc_status → not_run` · `qc_run_at → —`.
- **CHỈ** đụng 4 cột này — ngoại lệ có kiểm soát của luật "giữ nguyên cột khác" ở trên; là thao tác an-toàn (không sửa code UC khác, chỉ hạ cờ nghiệm thu đã hết hiệu lực).
- **KHÔNG** đụng `test_count`/`test_classes` (test vẫn tồn tại — số lượng không sai, chỉ nội dung cũ; hạ số sẽ làm tỷ lệ coverage nhảy loạn) và **KHÔNG** đụng `qc_owner`/`qc_blocked_by` (con trỏ tới bug — code đổi không làm bug biến mất).
- Gom danh sách `{consumer_uc}` bị ảnh hưởng (trường hợp A) để in ở "Next".

> **Vì sao trường hợp B cũng phải hạ:** lý do giống hệt A — logic vừa đổi thật, nên test cũ đang nghiệm thu một hành vi không còn tồn tại. Trước đây chỉ A được xử lý, nên chuỗi "spec đổi → `DRIFT` → sửa code → `OK`" kết thúc với `qc_status = pass` từ lần QC chạy trên **spec cũ**, và dashboard hiện xanh hoàn toàn. `/fix-bug` đã làm đúng việc này từ trước với chính lời giải thích đó: *"code vừa đổi nên tín hiệu self-test cũ hết hiệu lực"*.

Bất kể trường hợp nào, in khối này ở report cuối để dev không tưởng là hệ thống hỏng:
```
🔻 Tín hiệu kiểm thử bị hạ ({spec vừa đổi | vừa lấp stub} — nghiệm thu cũ hết hiệu lực):
   {sc_id}: dev_selftest pass→not_run · qc_status pass→not_run
   ⚠️  {n} test của các SC này viết cho bản cũ — rà lại nội dung, đừng chỉ chạy lại.
   → /dev-run-test {UC-ID}   rồi   QC chạy /qc-run-test {UC-ID}
   ℹ️  Coverage "đã kiểm đạt" trên dashboard sẽ TỤT sau lần này — đó là số đúng;
      số cũ mới là số sai. (Tỷ lệ phủ code/test không đổi — test_count giữ nguyên.)
```

### Guard sau-ghi cho SỔ *(bắt buộc — không có nó thì bước này bỏ qua được trong im lặng)*

*Lệnh này **đã** có Guard sau-ghi cho **file code** (§File Scan: đọc lại, đối chiếu, mất member thì
khôi phục). Sổ thì chưa có — mà sổ mới là thứ dashboard và cổng PR đọc.*

Ngay sau khi ghi TSV, **đọc lại file trên disk** và kiểm đúng một điều: **mọi `sc_id` vừa implement
trong lần chạy này đều có `gen_ver` ≠ `—` VÀ `implemented_by` ≠ `—`.**

| Kết quả | Hành động |
|---|---|
| Đủ hết | tiếp Refresh Panel / Commit. In dòng tổng ở footer (dưới). |
| **Thiếu bất kỳ row nào** | **DỪNG. Đặt Status badge = ❌.** KHÔNG commit, KHÔNG báo "xong". In: `❌ Ghi sổ THẤT BẠI — {n}/{m} scenario chưa có gen_ver/implemented_by: {danh sách sc_id}. Code đã sinh nhưng sổ chưa ghi; chạy lại /generate-code {UC-ID} --force, hoặc /validate-traces --reconcile-code.` |
| Không tìm thấy file TSV | **DỪNG** cùng cách — sổ phải tồn tại từ `/generate-bdd`; không có nghĩa là chạy sai UC/platform, đừng tạo sổ mới ở đây. |

**In ở footer report, mọi lần chạy, kể cả khi đủ:**
```
📓 Sổ trace: đã ghi {n}/{m} scenario vào {UC-ID}-{platform}.tsv
```

> **Vì sao một dòng đếm lại quan trọng (G60):** ghi sổ là **động tác cuối** của lệnh dài nhất trong
> bộ, nằm **sau** cổng build. Khi nó bị rơi, mọi thứ khác vẫn xanh: code có, build pass, commit
> xong, report báo ✅ — và **không có dòng nào trong transcript nói rằng sổ chưa được ghi**. Ba tuần
> sau dashboard hiện thiếu, không ai truy được lượt chạy nào. Đo trên một project thật: **504
> scenario** ở đúng trạng thái đó, và người phát hiện là một dev thấy dashboard nói "chưa có code"
> trong khi tự mình mở code ra thì tag đủ cả.
>
> Đây cũng là lý do guard này **phải chặn** (khác T14 ở `lint-trace`, cố ý chỉ WARN): ở đây không có
> nợ tồn nào để sợ — ta đang nói về **đúng lượt chạy vừa rồi**, và nó vừa thất bại thật.

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


## Commit
```bash
git add {files}
git commit -m "{commit_format}: {description}"
```

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/generate-code Hoàn tất — {UC-ID}
Files: created={N}, extended={M}, filled={F} stub, skipped={K} | Build: SUCCESS
Branch: feature/{TICKET_ID}-{slug}
Phase    : {UI (mock layer) | Integration (real API) | FE full (UI + real API) | BE full}
fe_phase : {ui | integrated (--phase=integration | fe_full) | —}
Figma    : {Dev Mode MCP local (grounded) | ⚠️ chỉ link web + text spec (không có MCP local) | n/a cho BE}   ← chỉ UI FE/App

Next:
  --phase=ui xong:
    → Báo tester: FE test được qua mock adapter
    → Thu sign-off BE → /review-tech-docs {tech-design-file}
    → Khi BE sẵn sàng → /generate-code {feature-file} --phase=integration

  --phase=integration xong:
    → /review-code {UC-ID}   ← cần code review
    → /dev-gen-test {UC-ID}  ← bộ integration test

  Default (không có flag phase):
    → /review-code {UC-ID}   ← cần code review trước khi test
    → /dev-gen-test {UC-ID}

  Nếu lần này LẤP stub (filled > 0):
    → /dev-gen-test {owner_uc}      ← test cho logic vừa lấp
    → /dev-gen-test {consumer_uc}   ← RE-GEN: test cũ của {consumer_uc} viết trên hàm trắng, giờ đã cũ
    (dev_selftest các scenario này đã bị reset → not_run; /validate-traces sẽ hiện chúng là GAP tới khi test lại)

📊 Living Docs: chạy /validate-traces (hoặc /sync) để push trace này lên dashboard spec-module.
```

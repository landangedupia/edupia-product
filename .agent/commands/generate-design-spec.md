# /generate-design-spec — Sinh Design Specification (FE / App)

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


*Lưu ý: Với lệnh này, target file là một Business PRD (`{TICKET-ID}-{prd-slug}.md` — file `.md` ở gốc feature folder) dưới `{paths.specs_dir}/{domain}/{prd-slug}/`. Phân giải từ `$ARGUMENTS` hoặc liệt kê thư mục và hỏi. Chỉ hỗ trợ PRD của FE và mobile — PRD của BE sẽ bị từ chối ở bước Platform Check.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

*Context bổ sung cho lệnh này: Đọc toàn bộ PRD target. Trích xuất: **TICKET-ID**, **domain**, **tên feature**, **Service** và **Module** từ metadata PRD (row `| **Service** |` và `| **Module** |`), User Flow (Section 4a), và tên màn hình Wireframe (Section 4b).*

*Quy tắc trích xuất Service (giống /generate-prd):*
- *Nếu metadata PRD có `| **Service** |` → dùng làm `active_service` và `| **Module** |` làm `active_module`.*
- *Nếu vắng VÀ `services` được định nghĩa trong `project-context.yaml` → hỏi: "Design Spec này dành cho service nào?" (chỉ liệt kê service FE/App, chờ chọn).*
- *Nếu dự án single-service → `active_service = "default"`, `active_module = tech_stack.module`.*

---

## Guard — PRD đã duyệt chưa

Đọc `| **Status** |` từ bảng Metadata của Business PRD nguồn:
- `Status: approved` → tiếp tục bình thường.
- `Status: draft` (hoặc khác `approved`) → **CHECKPOINT cảnh báo mềm** (không chặn cứng — cho phép prototype song song):
  ```
  ⚠️  Business PRD đang ở Status: {status} (chưa duyệt). Design Spec dựng trên PRD chưa chốt có thể phải làm lại theo PRD.
     Khuyến nghị: PO duyệt PRD (đặt `| **Status** | approved |`) rồi mới sinh Design Spec.
     Vẫn sinh Design Spec bây giờ? (Y/N)
  ```
  Chỉ tiếp tục khi người dùng chọn Y.

---

## Platform Check

Dùng `active_module` và `platform_type` suy ra từ context loading:

1. Nếu `platform_type = "backend"` → **STOP**. Xuất:
   ```
   ❌ Design Spec chỉ dành cho platform FE và mobile.
   Với service BE, API contract thuộc về Business PRD (Use Case → section Business Logic).
   ```

2. Nếu `platform_type = "web-frontend"` → set `active_platform = "web"`.

3. Nếu `platform_type = "mobile"`:
   - `flutter` hoặc `react-native` → set `active_platform = "app"`
   - `ios-swiftui` → set `active_platform = "app-ios"`
   - `android-compose` → set `active_platform = "app-android"`

4. Nếu `platform_type = "unknown"` → hỏi: "Design Spec này dành cho platform nào?"
   ```
   Options:
     1 — web    (React / Next.js / Vue / Angular)
     2 — app    (Flutter / React Native)
     3 — app-ios     (iOS SwiftUI)
     4 — app-android (Android Compose)
   ```
   Chờ chọn. Map lựa chọn sang `active_platform` và suy ra `active_module` nếu được.

---

## Version Check (PRD drift)

Trước khi sinh, kiểm tra design-spec đã tồn tại cho platform này:
`{paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{active_platform}-{slug}.md`
Đọc `| **Version** |` hiện tại của PRD từ Metadata (vd `1.3`).

- **Không tồn tại** → sinh mới; ghi `| **Built from PRD** | v{prd_version hiện tại} |`.
- **Tồn tại** → đọc row `| **Built from PRD** |` của nó, so với `| **Version** |` PRD hiện tại:
  - **Bằng nhau** → hỏi: "Design Spec đã dựng từ PRD v{x}. Sinh lại? (Y/N)".
  - **Khác** (PRD đã đổi) → CHECKPOINT drift:
    ```
    ⚠️  Phát hiện PRD version drift
    Design Spec dựng từ PRD v{old}; PRD giờ ở v{new}.
    Thay đổi kể từ v{old} (đọc # Change Log của PRD):
      {changelog rows}
    Options:
      Y — cập nhật phần ảnh hưởng (màn / flow đổi)
      F — sinh lại toàn bộ
      N — huỷ
    ```
- Khi sinh / sinh lại → cập nhật `| **Built from PRD** | v{prd_version hiện tại} |`, bump `| **Version** |` Design Spec, **reset `| **Status** | draft |`** (design đổi → sign-off lại), thêm row Changelog.

---

## Screen Discovery

Từ Section 4 của PRD (User Flow + Wireframe), trích xuất mọi tên screen / page / modal được nhắc tới.

Trình bày danh sách và hỏi PO xác nhận:

```
Screens detected from PRD:
  1. {Screen name 1}
  2. {Screen name 2}
  ...

Đây đã đủ các màn cho platform {active_platform} chưa?
Thêm màn còn thiếu, bỏ màn không áp dụng, hoặc xác nhận bằng Y.
```

Chờ xác nhận. Lưu danh sách đã xác nhận là `screen_list`.

---

## Figma Frame Links *(bắt buộc — một link node-level đọc được cho mỗi màn)*

Một Design Spec chỉ tốt ngang với design mà nó trỏ tới. AI **không đọc được link file
trần** (`figma.com/design/{fileKey}/...` không có `node-id`) — nó cần một
**link node-level tới từng frame cụ thể** để fetch layout, component, và token thật của
frame đó qua Figma MCP. Vậy nên thu thập một link **mỗi màn**, không phải một
link cho cả feature.

**Hỏi PO, liệt kê mọi màn trong `screen_list`:**

```
Dán link Figma frame cho từng màn bên dưới.

  Trong Figma: chọn frame → chuột phải → "Copy link to selection"
  (URL phải chứa  ?node-id=...  — đó là link per-frame mà AI đọc được)

  1. {Screen 1} : ____
  2. {Screen 2} : ____
  ...

Nếu một màn chưa có design, gõ  none  cho màn đó.
```

**Với mỗi câu trả lời:**

1. **Validate format** — URL phải khớp `figma.com/design/{fileKey}/...?node-id={nodeId}`.
   - Hợp lệ → lưu thành `figma_frames[{screen}] = {url}`, parse ra `fileKey` + `nodeId`.
   - Link file **không có `node-id`** → từ chối: "Link này trỏ tới cả file, không phải một frame. Copy lại qua chuột phải → Copy link to selection." Hỏi lại màn đó.
   - `none` → `figma_frames[{screen}] = "TBD"`, đánh dấu màn đó ❌ Missing.

2. **Fetch frame qua Figma MCP** (chỉ với link hợp lệ) — gọi `get_design_context`
   (và `get_screenshot` khi hữu ích) với `fileKey` + `nodeId` đã parse để đọc
   layout, tên component, và design token thật. Đặt mọi Screen Spec dựa trên dữ liệu
   đã fetch này; **đừng** bịa layout mà frame không thể hiện. Nếu fetch thất bại
   (permission / not found) → coi màn đó là ❌ Missing và ghi chú lỗi fetch.

3. Suy ra `figma_url` mức feature = link file (không có `node-id`) chung của các
   frame, cho row Metadata. Nếu các frame trải nhiều file, liệt kê từng cái.

**Gate bắt buộc (không abort — sinh ra draft):**
- Nếu **bất kỳ** màn nào ❌ Missing → spec được sinh dưới dạng **draft** với các màn đó
  được gắn cờ, `Status` giữ `draft` cho tới khi mọi màn có link frame đọc được, đã fetch.
  `/generate-bdd` FE/App sẽ **cảnh báo mềm** (đồng bộ Guard PRD) nếu sinh BDD khi design-spec chưa `approved`. Ghi `missing_frames = [screens]`.
- Thêm một AI Assumption cho mỗi màn thiếu: "Không có Figma frame đọc được cho {screen} — spec
  của màn này chỉ là text và không được sign off cho tới khi thêm link `node-id`."

---

## CHECKPOINT

```
CHECKPOINT — Design Spec
-------------------------
Target PRD  : {prd-file-path}
Platform    : {active_platform}
Module      : {active_module}
Service     : {active_service}
Domain      : {domain}
Screens     : {N} — {screen_list ngăn cách bởi dấu phẩy}
Figma       : {linked}/{N} màn có link frame đọc được{; missing: missing_frames ngăn cách bởi dấu phẩy}
Output path : {paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{active_platform}-{slug}.md

{Nếu missing_frames khác rỗng}:
⚠️  {count} màn không có link Figma frame đọc được — các màn này sẽ được sinh dưới dạng
   draft chỉ-text và spec không thể sign off cho tới khi thêm link node-id.

Generate? (Y/N)
```

Chờ Y rõ ràng trước khi tiếp tục.

---

## Ngôn ngữ — Language Guard *(áp khi viết mọi section)*
# Business Language Guard — chặn thuật ngữ kỹ thuật rò vào tài liệu nghiệp vụ

Tài liệu nghiệp vụ (PRD, product-definition) mô tả **WHAT** — chỉ ngôn ngữ nghiệp vụ. Guard này chạy **mỗi khi viết hoặc sửa** prose (gen mới, áp fix `--resume`, hiệu chỉnh): **quét và xử lý** các thuật ngữ kỹ thuật/UI phổ thông bên dưới **trước khi ghi**.

> Guard này là **baseline framework**, chạy **song song** với Banned Terms của `business-dictionary.md` (cơ chế dictionary giữ nguyên; project vẫn bổ sung term đặc thù vào đó). Khi cả hai cùng áp, ưu tiên bản chuẩn của dictionary nếu có.

## Bản đồ xử lý (4 nhóm)

**Nhóm 1 — Tương tác/triển khai → DIỄN ĐẠT LẠI sang nghiệp vụ (giữ nguyên nghĩa):**

| Kỹ thuật/UI | Cách nói nghiệp vụ |
|---|---|
| re-render / render lại / reload / refresh (màn) | "hiển thị lại {tên màn}" |
| timeout | "quá thời gian chờ" |
| lỗi mạng / network error | "lỗi kết nối" |
| UI / giao diện (khi chỉ một màn) | "màn" / "màn hình" |
| click / tap | "bấm" / "chọn" |
| popup / modal (nếu chỉ là khái niệm hiển thị) | "hộp thoại" / "thông báo" |
| disable / enable (nút) | "khoá" / "mở" thao tác |
| redirect / navigate | "chuyển tới {màn}" |

**Nhóm 2 — Visual thuần → CHUYỂN Design Spec (bỏ khỏi PRD, ghi nhận lại):**
`spinner`, `loading indicator`, `animation`, `fade/slide`, màu sắc, font, layout pixel, micro-interaction → *"Chi tiết visual này thuộc Design Spec — ghi nhận để tạo Design Spec sau."*

**Nhóm 3 — Backend/contract thuần → BỎ khỏi PRD (thuộc Tech Docs):**
`API`, `endpoint`, `token/JWT`, `HTTP status`, tên class/bảng/cột DB, query, payload, header.
*(Ngoại lệ DUY NHẤT: Appendix "Existing API Contract" khi `API Source: existing` — xem Platform Strategy.)*

**Nhóm 4 — Ẩn dụ dữ liệu/cài đặt cho trạng thái nghiệp vụ → XÉT THEO NGHĨA (KHÔNG phải bảng thay thế):**

Các từ như `cờ / flag`, `biến / trường / field`, `giá trị / value`, `trả về / return`, `đọc / ghi (cờ)` **đa nghĩa** — kỹ thuật ở ngữ cảnh này, nghiệp vụ ở ngữ cảnh khác. **ĐỪNG thay máy móc.** Một từ chỉ là leak khi **cả hai** điều sau đúng:
1. Nó chỉ một **artifact lưu trữ/cơ chế** (cờ, biến, trường, giá trị-trả-về, đọc/ghi) đứng thay cho một **trạng thái/khái niệm nghiệp vụ**; VÀ
2. Khái niệm đó **đã có tên nghiệp vụ** (trong business-dictionary hoặc hiển nhiên).

→ Cả hai đúng: viết lại theo **tên nghiệp vụ**, ưu tiên term chuẩn trong business-dictionary.
→ Từ **tự nó là khái niệm nghiệp vụ**: **GIỮ NGUYÊN**.

| Reframe (là leak) | Giữ nguyên (nghiệp vụ thật) |
|---|---|
| "cờ tình trạng = chưa làm" → "con *chưa làm khảo sát*" (có term Tình trạng khảo sát) | "giá trị đơn hàng", "giá trị hợp đồng" |
| "cờ trả giá trị lạ" → "không đọc được tình trạng khảo sát" | "khách trả về sản phẩm" (hoàn hàng) |
| "đọc cờ thất bại" → "không xác định được tình trạng" | "trả kết quả học tập cho phụ huynh" |

**Neo an toàn:** lái theo business-dictionary — nếu đang diễn giải một khái niệm **đã có entry** thì dùng đúng term đó. Hỏi *"khái niệm này có tên nghiệp vụ chưa"*, KHÔNG hỏi *"từ này có bị cấm không"*.

**Luật code-format:** trong prose nghiệp vụ, **không bọc backtick/`code`** quanh giá trị/trạng thái nghiệp vụ (`chưa làm`, `đã nộp`) — code-format báo hiệu "token kỹ thuật". Dùng *nghiêng* hoặc "trong ngoặc kép". Backtick chỉ dành cho định danh code/kỹ thuật thật.

## Quy tắc áp dụng
- Quét toàn bộ text sắp ghi (User Story, AC, BR, Business Logic, Scope, Edge Cases, Assumptions…).
- Nhóm 1 → thay tại chỗ, giữ nguyên nghĩa nghiệp vụ. **Đồng bộ cách diễn đạt** với chỗ đã có sẵn trong cùng tài liệu (vd nếu "quá thời gian chờ" đã dùng ở một BR → dùng nhất quán ở mọi nơi).
- Nhóm 2 → gỡ khỏi prose nghiệp vụ + nhắc chuyển Design Spec.
- Nhóm 3 → gỡ khỏi PRD (trừ ngoại lệ brownfield).
- Nhóm 4 → **xét ngữ cảnh, KHÔNG thay máy móc**: chỉ reframe khi là ẩn dụ dữ liệu cho một khái niệm đã có tên nghiệp vụ (ưu tiên term dictionary); **giữ nguyên** khi từ mang nghĩa nghiệp vụ thật. Đồng thời bỏ backtick khỏi giá trị nghiệp vụ trong prose.
- Nếu term không có trong bản đồ nhưng rõ ràng là tên kỹ thuật/triển khai → vẫn diễn đạt lại theo tinh thần Nhóm 1, đừng để lọt.

**Checklist (dùng ở Quality Checklist của lệnh):** 0 thuật ngữ kỹ thuật/UI (re-render, UI, timeout, spinner, API/endpoint/token…) trong prose nghiệp vụ — đã diễn đạt lại (Nhóm 1) / chuyển Design Spec (Nhóm 2) / bỏ về Tech Docs (Nhóm 3); 0 ẩn dụ dữ liệu cho trạng thái đã có tên nghiệp vụ (cờ/giá trị/đọc-ghi khi là artifact — Nhóm 4) và 0 backtick bọc giá trị nghiệp vụ.


**Design Language Guard — phân tầng bề mặt (bổ sung cho guard trên):**

Design Spec là cầu nối PRD → code, có **hai loại bề mặt** với ngôn ngữ khác nhau. Nguyên tắc: **không xoá chi tiết kỹ thuật — dồn về đúng tầng** (giống altitude AC/BR ở PRD).

- **Tầng A — bề mặt đọc (BẮT ngôn ngữ nghiệp vụ/UX):** §1 Screen Inventory (mọi cột), §2 Layout, cột "Hành vi UI" của Screen States, Actions & Navigation, blockquote mục đích màn, §5 AC-UI. Mô tả theo **vai trò/ý đồ** ("thanh tiến độ", "nút chính", "trạng thái chưa chọn đáp án"). **CẤM ở tầng này:** tên layer/variant Figma (`Q1--Selected`, `Base Design`), mã token/màu hex/số đo px-pt (`Primary/500 #0876B1`, `padding 16px`), định danh code, và ẩn dụ dữ liệu (Nhóm 4 của guard trên: cờ/giá trị/đọc-ghi khi là artifact).
- **Tầng B — cột/phụ lục kỹ thuật chuyên dụng (được giữ code):** Component Inventory (`Code Component`, `Import Path`), cột **Figma Frame** (link), bảng **Design Token** (phụ lục). Định danh Figma/code/token **chỉ** được xuất hiện ở đây.

Một state mô tả ở tầng A bằng lời ("chưa chọn đáp án → nút vô hiệu"); tên variant Figma của state đó (nếu cần) nằm ở cột Figma Frame / Component Inventory, KHÔNG lẫn vào prose.

## Generation Rules

Áp dụng các quy tắc này nhất quán khi sinh mọi section:

**Component mapping (C.M — bắt buộc):**
- Với mỗi component được tham chiếu, kiểm tra `figma-components/{active_module}.md` (đã nạp trong context).
- ✅ Matched → dùng đúng `Code Component` và `Import Path` từ catalog.
- ⚠️ Matched nhưng `[TODO]` → đánh dấu ô component là `[TODO — implementation pending]`.
- ❌ Không có trong catalog → đánh dấu `[NEW — confirm with designer before generating code]`.
- Không bao giờ bịa tên component hay import path.

**Section thích ứng theo platform:**
- Section 3 (Interaction Patterns) và Section 4 (Platform Considerations) thích ứng theo `active_platform`:
  - `web` → gồm responsive breakpoint, trạng thái hover/focus, keyboard navigation, accessibility.
  - `app` / `app-ios` / `app-android` → gồm gesture, safe area, touch target tối thiểu, navigation pattern, deep link, permission, hành vi offline.
  - Chỉ sinh section liên quan tới `active_platform`. Bỏ hẳn section của platform kia.

**Figma grounding (bắt buộc):**
- Với mỗi màn có frame đã fetch (`figma_frames[screen]` là link hợp lệ), dựa Layout,
  Component Inventory, và Screen States trên **dữ liệu Figma đã fetch** — tên component thật,
  token thật, cấu trúc frame thật. Đừng mâu thuẫn hay bịa layout.
- Dùng đúng URL `figma_frames[screen]` từng-màn trong Screen Inventory, header mỗi Screen
  Spec, và Figma Summary — không bao giờ dùng fragment giả `{figma_url}#screen1`.
- Với màn ❌ Missing: sinh draft chỉ-text từ PRD, thêm tiền tố vào Screen Spec
  `> [DRAFT — no Figma frame; do not sign off]`, và để ô Figma là ❌ Missing.

**Screen states (bắt buộc mỗi màn):**
- Mỗi màn phải mô tả tối thiểu: `default`, `loading`, `error`.
- Thêm `empty` khi màn có thể hiển thị trạng thái không dữ liệu.
- Thêm `success` khi một action hoàn tất tạo ra trạng thái xác nhận riêng biệt.
- Nếu một state không áp dụng → đánh dấu `N/A` kèm lý do ngắn.

---

## Generate

Ghi `{paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{active_platform}-{slug}.md`:

````markdown
# {TICKET-ID} {Feature Name} — Design Spec [{active_platform}]

---

## Metadata

| Field              | Value                                                         |
|--------------------|---------------------------------------------------------------|
| **Spec ID**        | {TICKET-ID}-DS-{active_platform}                              |
| **Version**        | 1.0                                                           |
| **Status**         | draft                                                         |
| **Platform**       | {active_platform}                                             |
| **Module**         | {active_module}                                               |
| **Service**        | {active_service}                                              |
| **Domain**         | {domain}                                                      |
| **Business PRD**   | [{TICKET-ID}](../{TICKET-ID}-{prd-slug}.md)                   |
| **Built from PRD** | v{prd_version — `\| **Version** \|` của PRD lúc sinh; dùng phát hiện drift} |
| **Figma**          | {figma_url — link file feature} ({linked}/{N} frame đã link)  |
| **Author**         | {tên PO hoặc "AI-assisted"}                                   |
| **Created**        | {YYYY-MM-DD}                                                  |
| **Updated**        | {YYYY-MM-DD}                                                  |

---

# 1. Danh mục màn hình (Screen Inventory)

> **Tầng A:** cột **Điểm vào** và **Ghi chú** viết bằng ngôn ngữ nghiệp vụ — mô tả điều kiện/ý đồ. KHÔNG liệt kê states, KHÔNG tên component/variant Figma (states thuộc §2; tên Figma thuộc cột Figma Frame / §2). Vd Điểm vào: "khi con *chưa làm khảo sát* và có ít nhất một câu hỏi" — KHÔNG "cờ tình trạng = `chưa làm`".

| # | Tên màn hình | Điểm vào | Figma Frame | Ghi chú |
|---|-------------|-------------|-------------|-------|
| 1 | {Màn hình 1}  | {điều kiện nghiệp vụ để vào màn — vd: "sau khi hoàn tất Nhập thông tin con và con chưa làm khảo sát"} | [Frame]({figma_frames[Screen 1]}) | {ghi chú nghiệp vụ nếu có — KHÔNG states/tên Figma} |
| 2 | {Màn hình 2}  | {điểm vào — ngôn ngữ nghiệp vụ} | [Frame]({figma_frames[Screen 2]}) / ❌ Missing | |

---

# 2. Đặc tả màn hình (Screen Specs)

<!--
  Lặp lại block này cho mỗi màn trong Screen Inventory.
  Mỗi màn phải có: Layout, Component Inventory, Screen States, Actions & Navigation.
-->

## Màn hình 1: {Tên màn hình}

**Figma**: [{Tên frame}]({figma_frames[Screen 1]})   <!-- ❌ Missing → thêm tiền tố cho màn này `> [DRAFT — no Figma frame; do not sign off]` -->

### Layout

{Mô tả layout theo CẤU TRÚC & Ý ĐỒ bằng lời: thứ tự section trên→dưới, vai trò từng vùng, hệ phân cấp thị giác, hành vi co giãn. **KHÔNG rải mã token / màu hex / số đo px** trong văn xuôi — số đo & token cụ thể đặt ở cột Component Inventory và bảng Design Token (phụ lục, Tầng B). Vd: "một cột dọc, thanh tiến độ ở đầu, khu nội dung chính giữa, nút hành động cố định đáy màn".}

### Component Inventory

| Component (Figma)   | Code Component  | Import Path            | States                          | Ghi chú            |
|---------------------|-----------------|------------------------|---------------------------------|--------------------|
| {Figma/Button/Primary} | Button       | @/components/ui/Button | default, loading, disabled      |                    |
| {Figma/Input/Text}  | TextInput       | @/components/ui/Input  | default, focus, error, disabled |                    |
| {Figma/Card/Order}  | OrderCard       | @/features/{domain}/components/OrderCard | default, skeleton |           |

### Screen States

<!-- Tầng A: Trigger & Hành vi UI mô tả bằng lời quan sát được. KHÔNG tên variant Figma (Q1--Selected), KHÔNG "API/render/spinner" (→ "đang tải / hiển thị lại / vùng chờ"). Tên component/variant nếu cần → cột Figma / Component Inventory. -->

| State     | Trigger                                     | Hành vi UI (mô tả quan sát được)                    |
|-----------|---------------------------------------------|------------------------------------------------------|
| default   | Màn đã hiển thị, có dữ liệu                   | {Mô tả giao diện người dùng thấy}                    |
| loading   | Đang tải dữ liệu                            | {Vùng chờ / vị trí báo đang tải}                     |
| error     | Tải dữ liệu thất bại / dữ liệu không hợp lệ  | {Thông báo lỗi + hành động khôi phục}                |
| empty     | Không có dữ liệu để hiển thị                 | {Trạng thái trống + lời mời hành động}               |
| success   | Thao tác hoàn tất (nếu có)                   | {Xác nhận / chuyển màn / đổi trạng thái}             |

### Actions & Navigation

| Action          | Trigger                        | Kết quả                                         |
|-----------------|--------------------------------|-------------------------------------------------|
| {Tên action}    | Tap/click {tên phần tử}        | Điều hướng tới {Màn hình N} / Mở {Tên modal}    |
| {Tên action}    | Swipe trái trên {list item}    | Hiện xác nhận xoá                               |
| {Back / Cancel} | Cử chỉ back / nút Cancel       | Quay lại {màn trước} mà không lưu               |

---

<!--  Lặp lại block ## Màn hình N cho mỗi màn bổ sung  -->

---

# 3. Pattern tương tác (Interaction Patterns)

<!--
  Platform web: gồm section A + B. Bỏ section C.
  Platform app: gồm section C. Bỏ section A + B.
-->

<!-- ═══════════════════════════ CHỈ WEB ═══════════════════════════ -->

## A. Hành vi Responsive  *(chỉ web)*

| Breakpoint | Width      | Thay đổi layout                                    |
|------------|------------|----------------------------------------------------|
| Mobile     | < 768px    | {1 cột, bottom navigation bar, CTA full-width}     |
| Tablet     | 768–1279px | {grid 2 cột, sidebar thu gọn, tab navigation}      |
| Desktop    | ≥ 1280px   | {layout đầy đủ, sidebar hiển thị, max-width 1440px}|

## B. Hover / Focus / Keyboard  *(chỉ web)*

| Phần tử        | Trạng thái Hover              | Trạng thái Focus                | Phím tắt          |
|----------------|-------------------------------|---------------------------------|-------------------|
| Primary button | Background → {color.hover}    | Outline 2px {color.focus}       | Enter / Space     |
| Text input     | Border → {color.border.hover} | Border → {color.primary}, label nổi | Tab to focus |
| Dropdown       | Highlight nền                 | Giống hover + ring              | Phím mũi tên điều hướng |

<!-- ═══════════════════════════ CHỈ APP ═══════════════════════════ -->

## C. Cử chỉ & Điều hướng  *(chỉ app)*

| Cử chỉ            | Màn / Phần tử             | Hành vi                                               |
|-------------------|---------------------------|-------------------------------------------------------|
| Cử chỉ back (iOS swipe-right / Android back) | Mọi màn | {Quay lại màn trước / Hiện dialog "Discard changes?"} |
| Pull-to-refresh   | {Tên màn}                 | Refresh dữ liệu, spinner ở trên cùng                  |
| Swipe trái trên row | {Tên list item}         | Hiện action {Delete / Archive}                        |
| Long press        | {Tên phần tử}             | {Context menu / chế độ chọn}                          |
| Pinch / zoom      | {Image viewer}            | Scale ảnh, double-tap để reset                        |

### Navigation Pattern  *(chỉ app)*

```
{Vẽ navigation stack cho feature này, vd:
  BottomTab(Home) → FeatureListPage → FeatureDetailPage → EditPage
  BottomTab(Home) → FeatureListPage ↘ (modal) CreatePage
}
```

Entry: {người dùng vào feature này thế nào — tab / deeplink / push từ màn khác}
Exit: {người dùng rời thế nào — back stack / chuyển tab / deeplink out}

### Platform Conventions  *(chỉ app)*

| Khía cạnh                | Hành vi iOS                             | Hành vi Android                         |
|--------------------------|-----------------------------------------|-----------------------------------------|
| Navigation bar           | {Nút back trên-trái, title canh giữa}   | {Mũi tên Up trên-trái, title canh trái} |
| Sheet / bottom modal     | {UISheetPresentation, hiện grabber}     | {BottomSheet, drag handle}              |
| Alert / confirm dialog   | {UIAlertController, action canh phải}   | {Material AlertDialog, action canh trái}|
| Loading indicator        | {UIActivityIndicatorView, center}       | {CircularProgressIndicator}             |
| Toast / snackbar         | {Custom toast, bottom center}           | {Material Snackbar, bottom}             |

---

# 4. Cân nhắc theo Platform (Platform Considerations)

<!--
  Web: gồm section A. App: gồm section B. Bỏ section không áp dụng.
-->

<!-- ═══════════════════════════ CHỈ WEB ═══════════════════════════ -->

## A. Accessibility  *(chỉ web)*

- [ ] Mọi phần tử tương tác tới được bằng phím Tab — không có keyboard trap
- [ ] Focus trap bên trong modal dialog (Tab chỉ chạy vòng trong modal)
- [ ] Nút chỉ-icon có `aria-label` mô tả hành động
- [ ] Cập nhật nội dung động (loading → loaded) thông báo qua `aria-live`
- [ ] Tương phản màu đạt WCAG AA: text ≥ 4.5:1, text lớn ≥ 3:1
- [ ] Input form có label hiển thị (không chỉ placeholder)
- [ ] Message lỗi liên kết với input qua `aria-describedby`

<!-- ═══════════════════════════ CHỉ APP ═══════════════════════════ -->

## B. Thiết bị & OS  *(chỉ app)*

- [ ] Áp dụng safe area insets ở mọi màn — trên (status bar) và dưới (home indicator)
- [ ] Touch target tối thiểu: 44×44pt (iOS) / 48×48dp (Android)
- [ ] Đã test trên màn nhỏ: rộng 375pt (iPhone SE) / rộng 360dp (Android phổ biến)
- [ ] Deep link entry: `{scheme}://{host}/{path}` → vào {tên màn} với {param} đã điền sẵn
- [ ] Permission gate: {liệt kê permission cần — Camera / Location / Notification}
  - {Permission}: yêu cầu ở {tên màn} với copy lý do: "{copy TBD}"
- [ ] Hành vi offline / không mạng:
  - {Tên màn}: hiện dữ liệu cache + banner offline
  - {Tên action}: disable nút, hiện tooltip "Requires connection"
- [ ] Dark mode: mọi màn đã test dark mode — không có màu hardcode

---

# 5. AC-UI — Tiêu chí chấp nhận về Design

> Được **PO + Designer** cùng review và sign off trước khi sinh BDD.
> Bổ sung cho (không thay thế) AC mức nghiệp vụ trong [Business PRD]({prd-path}).

| ID     | Tiêu chí chấp nhận                                                             | Verified by     |
|--------|--------------------------------------------------------------------------------|-----------------|
| AC-UI1 | Mọi màn khớp frame Figma đã duyệt trong dung sai design-system                  | Designer        |
| AC-UI2 | Trạng thái đang tải xuất hiện gần như tức thì (≤200ms) khi màn bắt đầu tải dữ liệu | QA              |
| AC-UI3 | Mọi message lỗi đều hiển thị, rõ ràng, và kèm action khôi phục                  | PO              |
| AC-UI4 | Empty state có illustration và call-to-action rõ ràng                          | PO + Designer   |
| AC-UI5 | {Riêng platform — vd web: "Mọi màn pass kiểm tra tương phản WCAG AA"}         | QA              |
| AC-UI6 | {Riêng platform — vd app: "Cử chỉ back ở mọi màn quay về đúng màn trước"}     | QA              |
| AC-UI7 | {Tiêu chí UI riêng của feature từ section wireframe của Business PRD}           | PO              |

---

# Appendix

## Tóm tắt Figma

| Màn hình        | Figma Frame                          | Trạng thái Link / Fetch              |
|-----------------|--------------------------------------|--------------------------------------|
| {Màn hình 1}    | [Link]({figma_frames[Screen 1]})     | ✅ Đã link & fetch                   |
| {Màn hình 2}    | —                                    | ❌ Missing — không có link node-id   |

## Design Token đã tham chiếu

| Token                 | Value         | Dùng ở                          |
|-----------------------|---------------|---------------------------------|
| `color.primary`       | {#hex}        | Primary button, link, active state |
| `color.surface`       | {#hex}        | Nền card                        |
| `spacing.md`          | {16px / 4}    | Khoảng cách dọc tiêu chuẩn      |
| `typography.heading2` | {font/size}   | Title màn hình                  |

## Tài liệu tham khảo

- [{TICKET-ID}]({prd-path}) — Business PRD (nguồn của AC, UC, BR)
- {[Design Spec khác](./other-ds.md) — nếu feature này dùng chung màn}

## Giả định AI

> Mỗi giả định dưới đây được đưa ra vì input PO chưa đầy đủ.
> PO phải review và confirm trước khi sign-off.

- {Giả định 1 — [AI DRAFT]}
- {Một dòng cho mỗi màn ❌ Missing: "Không có Figma frame đọc được cho {screen} — draft chỉ-text; chặn sign-off cho tới khi thêm link node-id."}

---

## Changelog

| Version | Date         | Changes         |
|---------|--------------|-----------------|
| 1.0     | {YYYY-MM-DD} | Initial version |

<!--
  NEXT STEPS:
  1. Điền các link Figma frame còn ❌ Missing (link node-id) — chạy lại để fetch & ground chúng.
  2. Chia sẻ với Designer — xác minh link Figma, cập nhật component inventory.
  3. PO + Designer sign off: đổi Status → "approved" (chỉ cho phép khi 0 màn ❌ Missing).
  4. Chạy /generate-bdd "{prd-file}" — BDD dùng AC-UI từ spec này cho FE scenario.
-->
````

---

## Self-Review Gate *(cổng tự-rà — bắt buộc chạy trước khi ghi)*

- [ ] Mọi màn trong Screen Inventory có Screen Spec đầy đủ ở Section 2
- [ ] Mọi màn có tối thiểu các state: default, loading, error
- [ ] Mọi component Figma đã map trong Component Inventory — chưa map thì gắn cờ `[NEW]` hoặc `[TODO]`
- [ ] Chỉ sinh section liên quan platform ở Section 3 (không có section web trong doc app, và ngược lại)
- [ ] Chỉ sinh section liên quan platform ở Section 4
- [ ] Các mục AC-UI testable (pass/fail rõ ràng, không phải "looks good")
- [ ] Link cross-reference Business PRD là relative path hợp lệ
- [ ] Mọi màn có link Figma frame node-level (`?node-id=`) — và các màn có link đã được fetch qua Figma MCP và dùng để ground spec
- [ ] Mỗi màn ❌ Missing được gắn cờ trong spec (`> [DRAFT — no Figma frame...]`), liệt kê trong Figma Summary, và có một AI Assumption
- [ ] Nếu bất kỳ màn nào ❌ Missing → Status giữ `draft` (generate-bdd FE/App cảnh báo mềm, không chặn cứng)
- [ ] **Ngôn ngữ Tầng A sạch:** không tên layer/variant Figma, mã token/hex/px, hay ẩn dụ dữ liệu (cờ/giá trị/đọc-ghi khi là artifact) lọt vào §1, Layout, Screen States, Actions, AC-UI — định danh kỹ thuật chỉ ở Component Inventory / Design Token / cột Figma. Backtick không bọc giá trị nghiệp vụ. Khái niệm đã có trong business-dictionary dùng đúng term chuẩn.

> **Đây là CỔNG, không phải nhắc nhở:** chạy từng mục trên TRƯỚC khi ghi file. Mục nào **FAIL** → **bắt buộc**:
> 1. ghi một dòng `⚠️ {mục thiếu — màn/section cụ thể}` vào section **"Giả định AI"** của file (đừng để lọt im lặng), VÀ
> 2. giữ `| **Status** | draft |` (chưa đủ điều kiện để PO+Designer sign-off `approved`).
> KHÔNG xuất design-spec như "hoàn chỉnh" khi còn mục fail chưa gắn cờ.

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

{Nếu missing_frames rỗng}:
```
/generate-design-spec Hoàn tất — {TICKET-ID} [{active_platform}]
---
Status : ✅ Complete — cả {N} màn đã link & fetch từ Figma
Output Artifacts:
  created {paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{active_platform}-{slug}.md  (v1.0)
Next   : Chia sẻ với Designer → PO + Designer sign-off (Status: approved)
         → /generate-bdd {prd-file}  (sinh BDD theo service; đọc AC-UI từ Design Spec)
```

{Nếu missing_frames khác rỗng}:
```
/generate-design-spec Hoàn tất (DRAFT) — {TICKET-ID} [{active_platform}]
---
Status : ⚠️ Warnings — {count} màn không có link Figma frame đọc được: {missing_frames ngăn cách bởi dấu phẩy}
Output Artifacts:
  created {paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{active_platform}-{slug}.md  (v1.0, draft)
Next   : 🔒 Khuyến nghị hoàn tất sign-off trước (đủ link Figma node-id); /generate-bdd FE/App sẽ cảnh báo nếu design-spec chưa approved.
         1. Trong Figma: chọn mỗi frame còn thiếu → chuột phải → Copy link to selection
         2. Chạy lại /generate-design-spec {prd-file} → AI fetch & ground các frame mới
```

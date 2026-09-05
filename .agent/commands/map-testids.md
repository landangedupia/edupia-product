# /map-testids — Định nghĩa/backfill test-id ổn định lên component FE tái dùng & có sẵn

> Đồng hành với contract *Test Selectors* §4.5.6 của tech-doc gộp. `/generate-tech-docs` và
> `/generate-code` gán test-id cho code **mới**; lệnh này lo phần còn lại: component catalog
> **tái dùng** (id sống ở usage site; component phải *forward* được test-id) và màn
> **đã có / brownfield** đã code mà chưa có test-id. Nó reverse-document những gì đang có,
> gán id ổn định ở chỗ còn thiếu, đảm bảo component tái dùng forward được id, ghi việc
> forwarding vào figma-components catalog, patch các usage site, và ghi map §4.5.6 — để QC
> định vị element bằng id thay vì scan lúc runtime.

Usage: `/map-testids {UC-ID}`

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID. Đọc `.feature` FE của UC (web/app), các màn Design Spec của nó, tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md` (§4.5.6 của platform, nếu có — bảng này gộp mọi UC của platform, **lọc theo cột "Serves SC" khớp SC của UC này** qua §10), và figma-components catalog cho `active_module`.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Step 0 — Platform guard

Phân giải `platform` từ `@trace.platform` / `platform_type`. Test-id là chuyện của **FE/App** — nếu `system` / backend → HALT:
```
❌ /map-testids chỉ áp dụng cho platform CLIENT (mọi platform trừ `system` — web/app/webview/…). BE không có UI test-id.
```
Phân giải attribute test-id từ `@trace.testid_attr` (hoặc theo module): web `data-testid` · React Native `testID` · Flutter `Key`/`Semantics(identifier:)` · native iOS `accessibilityIdentifier`.

## Step 1 — Thu thập element có action

Từ các step `When` trong `.feature` FE của UC + các màn Design Spec, liệt kê mọi element **có action** mà scenario chạm tới (button, input, link, select, toggle, form-submit). Bỏ qua text/label tĩnh. Với mỗi cái, phân giải component render và phân loại:
- **reused** — khớp một row trong figma-components catalog (component design-system dùng chung);
- **existing** — component riêng của feature đã có trong codebase (brownfield);
- **new** — chưa code (để `/generate-code` lo; chỉ ghi lại id dự kiến).

## Step 2 — Phân giải test-id ổn định cho mỗi element

- **Existing/brownfield:** đọc file component. Nếu element **đã** có test-id (trong attribute của platform) → **reverse-document** nó (dùng lại as-is). Nếu không, gán theo quy ước `{uc-lower}-{screen}-{element}-{type}` (vd `ft001-login-submit-btn`). Không bao giờ nhúng số scenario.
- **Reused:** id được áp ở **usage site** (không bake vào component dùng chung) → gán theo cùng quy ước.
- **Cross-platform:** nếu §4.5.6 của platform **kia** (block `web`/`app` trong cùng tech-doc gộp) đã có id cho cùng element logic, **dùng lại id value đó** (chỉ attribute khác theo platform) để web và app nhất quán và logic QC tái dùng được.

## Step 3 — Đảm bảo component tái dùng forward được test-id (catalog)

Với mỗi component **reused** có action, tra section **`## Test-ID Forwarding`** của catalog (`{paths.domain_knowledge_dir}/figma-components/{active_module}.md`):
- **Đã ghi prop forwarding** → dùng nó ở usage site (Step 4).
- **Chưa ghi** → kiểm tra source component:
  - Đã forward (spread `...props` / có prop `testId`/`testID` / truyền attribute qua) → **ghi** prop vào bảng Test-ID Forwarding của catalog.
  - **Không** forward → **patch component MỘT LẦN** để nhận + forward test-id (web: thêm prop `testId` → render `data-testid={testId}`; RN: `testID`; Flutter: truyền `Key`/`Semantics(identifier:)`; iOS: `accessibilityIdentifier`), rồi ghi vào catalog.

In mọi row catalog được thêm và mọi component dùng chung được patch (chúng đụng code dùng chung — nêu ra để review).

## Step 4 — Patch usage site (chỉ EXTEND)

Với mỗi element có action trong các màn **existing/reused** của UC này, thêm test-id ở usage site — attribute thô cho element thường, hoặc prop forwarding cho component tái dùng — với id từ Step 2. **EXTEND mode:** chỉ đụng attribute/prop; không refactor gì khác. Bỏ qua element đã mang đúng id (idempotent).

## Step 5 — Ghi/làm mới map §4.5.6 Test Selectors

Tạo hoặc cập nhật §4.5.6 (block platform tương ứng) trong tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md`:
- Nếu tech-doc tồn tại → cập nhật bảng §4.5.6 của platform này (thêm block §4.5 cho platform nếu chưa có).
- Nếu **chưa** tồn tại (pure brownfield) → ghi một file tối thiểu: header `@trace` (gồm `@trace.testid_attr`) + §4.5.6. `/generate-tech-docs` điền các section còn lại sau; nó không được ghi đè các id §4.5.6 mà lệnh này đã ghi.

Mỗi row: `Test-ID | Element | Component (reused/existing/new) | Action | Serves SC`.

## Step 6 — Handoff

Nếu tech-design sống trong spec repo dùng chung (`spec_source` được set), commit + push (2 tầng) như `/generate-tech-docs`. Patch component dùng chung đi vào FE service submodule (push 2 tầng, xem Sync & Update §4.4).

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/map-testids Hoàn tất — {UC-ID} ({platform})
Elements: {N} mapped — {reused} reused · {existing} existing (backfilled) · {new} để dành cho /generate-code
Forwarding: {M} component dùng chung được patch để forward test-id · {K} row catalog được ghi
§4.5.6: {paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md updated ({N} selectors, {platform})
Next: /review-tech-docs {tech-design}   ← review map §4.5.6 + patch component dùng chung
      /qc-design-test {UC-ID}            ← QC giờ định vị bằng test-id (không scan)
```

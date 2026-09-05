# /fix-bug — Workflow Fix Bug đầy đủ

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một ticket ID (vd `PROJ-123`), một **bug đã file `{BUG-ID}`** (một `{paths.bug_reports_dir}/{BUG-ID}.md` từ `/report-bug` — vd một QC product-gap), hoặc một mô tả bug từ `$ARGUMENTS`. Nếu cho `{BUG-ID}`, phân giải & đọc report đó để lấy spec context; ngược lại tiếp tục sang context loading.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Phase 1 — Gather Info
Nếu cho `{BUG-ID}`: đọc `{paths.bug_reports_dir}/{BUG-ID}.md` để lấy spec context, AC bị vi phạm, expected-vs-actual, và layer gợi ý — dùng làm chi tiết bug (không cần hỏi lại).
Nếu ticket: fetch chi tiết (hoặc nhờ user dán).
Nếu không có ticket / BUG-ID — CHECKPOINT:
1. Bug xảy ra ở đâu? (module, endpoint, flow)
2. Các bước tái hiện?
3. Expected vs Actual?
4. Error log / stack trace?

## Phase 2 — Root Cause Analysis

Dùng `active_module` từ context để chọn bảng liên quan.

### Nếu `platform_type = backend`

#### java-spring / golang / dotnet / php-laravel

| Bug Type | Vị trí thường gặp | Cách kiểm tra |
|----------|----------------|--------------|
| Wrong response data | Mapping layer | Kiểm tra field mapping, DTO conversion |
| 400 Bad Request | Input validation | Kiểm tra DTO constraint / validator |
| 401 Unauthorized | Auth filter | Kiểm tra token config, thứ tự filter |
| 403 Forbidden | Auth config | Kiểm tra rule role-based access |
| 404 Not Found | Repository query | Kiểm tra find method, kiểu ID |
| N+1 Query | Data access | Kiểm tra thiếu JOIN FETCH / eager load |
| Null Pointer | Optional chưa xử lý | Kiểm tra Optional.orElseThrow, null guard |
| Transaction rollback | Thiếu @Transactional | Kiểm tra transaction scope, propagation |
| Stale cache | Thiếu eviction | Kiểm tra trigger cache invalidation |
| Type mismatch | Filter / specification | Kiểm tra kiểu field trong predicate |

#### context-engineering (AI/LLM pipelines)

| Bug Type | Vị trí thường gặp | Cách kiểm tra |
|----------|----------------|--------------|
| Wrong pipeline output | Prompt template | Kiểm tra nội dung prompt; verify biến được substitute đúng |
| Missing context in output | Context assembly | Verify mọi context block bắt buộc có mặt và không rỗng |
| Schema validation failure | Output parser | So raw LLM output vs schema kỳ vọng; thêm output instruction chặt hơn |
| Flaky / non-deterministic results | LLM temperature | Kiểm tra temperature; dùng fixed seed/mock trong test |
| API rate limit errors | LLM client | Implement backoff; kiểm tra quota trên dashboard provider |
| Token limit exceeded | Prompt assembly | Giảm kích thước context; thêm chiến lược chunking |

### Nếu `platform_type = web-frontend`

| Bug Type | Vị trí thường gặp | Cách kiểm tra |
|----------|----------------|--------------|
| Wrong data displayed | State / store | Kiểm tra logic update state, selector |
| UI not re-rendering | Thiếu reactive dep | Kiểm tra deps array, state immutability |
| API data not loading | HTTP client / hook | Kiểm tra network tab, error handler |
| 401 on API call | Auth token | Kiểm tra token refresh, header injection |
| Form not submitting | Validation / handler | Kiểm tra form state, field bắt buộc, error |
| Route not found | Router config | Kiểm tra route definition, lazy import |
| Build / type error | TypeScript types | So type definition vs shape API thực tế |

### Nếu `platform_type = mobile`

| Bug Type | Vị trí thường gặp | Cách kiểm tra |
|----------|----------------|--------------|
| Screen shows stale data | State / BLoC / ViewModel | Kiểm tra event dispatch, state emit đúng |
| Crash on navigation | Thiếu route param | Kiểm tra param truyền, null safety |
| API call not firing | Repository / service layer | Thêm log trong repo method, kiểm tra network |
| UI not reflecting state | Widget không observe stream | Kiểm tra setup `BlocBuilder` / `StateObserver` |
| Crash on app resume | Lifecycle handler | Kiểm tra logic `onResume` / `viewDidAppear` |
| Auth token expired | Token refresh logic | Kiểm tra refresh flow, token storage |
| Permission denied | OS permission | Kiểm tra code request runtime permission |

CHECKPOINT — Root Cause Report:
```
Bug: {description} | Module: {name}
Root cause: {analysis}
Affected files: {list}
Proposed fix: {what to change}
Regression risk: Low / Medium / High
Proceed? (Y/N)
```

## Phase 3 — Fix

*Umbrella mode: code lỗi sống trong **service submodule** phân giải ở context-loader Bước 1.6 — tạo branch và chạy mọi bước git/build từ **trong** `{service_root}`. Single-service: bỏ `cd`.*

```bash
cd {service_root}                              # umbrella: the service submodule; single-service: omit
git checkout -b fix/{TICKET_ID}-{description}
```
Áp dụng fix. Thêm trace annotation nếu file có `@trace.implements`:
```
@trace.fixes={BUG-ID nếu fix từ một bug report đã file · else TICKET_ID}
@trace.root_cause={brief description}
```
*(Ưu tiên `{BUG-ID}`: khi fix bắt nguồn từ `/report-bug` thì thường **không có** ticket ID nào, và `{BUG-ID}` mới là thứ trace ngược được về spec context + AC bị vi phạm.)*

## Phase 4 — Regression Test
```
// @trace.verifies={UC-ID}
// @trace.regression={TICKET_ID}
Test: "Regression {TICKET_ID}: {bug description}"
```
Chạy test. Nếu fail → debug và fix (tối đa 3 vòng).

## Phase 4.5 — Cập nhật sổ trace

*Bỏ qua nếu fix không chạm SC nào có row trace (vd fix hạ tầng/config).*

Đây là lệnh **duy nhất** sinh test mà trước đây không ghi sổ — hệ quả: `test_count` under-report vĩnh viễn (SC đứng `GAP` dù vừa có regression test, rồi `/validate-traces` khuyên `/dev-gen-test` → dev sinh test trùng), và `dev_selftest` giữ `pass` cũ **trên code đã đổi**.

Định vị sổ platform `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv` — `{platform}` = platform của code vừa fix; không rõ → glob `{UC-ID}-*.tsv` tìm sổ nào chứa `sc_id` đó, khớp nhiều sổ → **hỏi** (cùng luật với `/report-bug` Step 5.5).

Với mỗi SC mà regression test phủ (theo `@trace.verifies` của test vừa viết):

| Cột | Giá trị |
|---|---|
| `test_count` | **+=** số test method regression vừa thêm (cộng dồn, không ghi đè) |
| `test_classes` | **append** tên test class/describe mới, giữ nguyên tên cũ |
| `dev_selftest` | `not_run` — code vừa đổi nên tín hiệu self-test cũ hết hiệu lực |
| `dev_selftest_at` | `—` |
| `last_updated` | hôm nay `YYYY-MM-DD` |

Giữ nguyên mọi cột khác. Đặc biệt:
- **KHÔNG** đụng `qc_status`/`qc_run_at`/`qc_owner`/`qc_blocked_by` — QC sở hữu; `/qc-run-test` sẽ flip khi re-verify (và chính nó đóng `{BUG-ID}` → `🟢 Closed`).
- **KHÔNG** đụng `spec_ver`/`gen_ver` — fix bug **không** đổi spec, nên không được tạo tín hiệu DRIFT giả.

Rồi làm mới panel mirror:
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

```bash
{conventions.build_command}   # tối đa 3 retry — chạy trong {service_root} ở umbrella mode
# Tầng 1 — push fix branch trong service submodule (nơi code sống):
git add {files}
git commit -m "fix({TICKET_ID}): {description}"
git push -u origin fix/{TICKET_ID}-{slug}      # rồi mở PR vào branch được track của service
```
> **Umbrella mode — Tầng 2 (bump umbrella pointer):** umbrella ghi một *commit* của service
> submodule, không phải branch. Sau khi PR fix-branch **merge** vào branch được track của service, bump
> pointer để đồng đội pull umbrella không gặp "commit not found":
> ```bash
> cd -                                          # back to umbrella root
> git add {service_root} && git commit -m "chore: bump {service_root} pointer (fix {TICKET_ID})"
> git push
> ```
> Single-service mode: không có umbrella pointer — Tầng 1 là toàn bộ push. Quy tắc đầy đủ: Sync & Update §4.4 (commit 2 tầng).

## Phase 5.5 — Đóng bug report (nếu fix một `{BUG-ID}` đã file)

*Bỏ qua nếu target là ticket/mô tả thường (không có file `{BUG-ID}`).*

Sau khi fix được commit, cập nhật `{paths.bug_reports_dir}/{BUG-ID}.md`:
- Set `State` → `🟡 Fixed` và thêm một **Resolution** ngắn (root cause + link commit/PR).
- Nó **chưa** `Closed` — QC sở hữu verification: khi `/qc-run-test` chạy lại và `qc_status`
  của SC liên kết flip thành `pass`, nó thành `🟢 Closed` (và `qc_owner`/`qc_blocked_by` clear).
- Commit report đã cập nhật vào spec repo (cùng push 2 tầng như `/report-bug`) để view
  "waiting-on" của PO/PM phản ánh nó trên `/sync`.

Đây là lần ghi duy nhất `/fix-bug` làm tới khu feedback — nó vẫn chỉ fix **code**,
không bao giờ sửa PRD/BDD (thay đổi spec là việc PO/Dev theo BUG_FLOW Case 2–4).

## Phase 6 — Đề xuất ghi Lesson (tuỳ chọn)

Nếu root cause là một **lỗi AI gây ra khi sinh và có thể lặp lại**
(vd nó sinh code skip layer, thiếu null guard, dùng sai pattern —
KHÔNG phải nguyên nhân bên ngoài như outage third-party hay input data sai), hỏi:

```
Root cause này trông như một lỗi AI lặp lại.
Ghi nó thành project lesson để không bị sinh lại? (Y/N)
```

Nếu `Y` → chạy quy trình capture bên dưới với `source=/fix-bug {TICKET_ID}`, một
`category` phù hợp (thường `code-gen`), và `scope` = domain hoặc file glob bị ảnh hưởng.

# Capture Lesson — Ghi lại lỗi lặp lại thành một Guardrail

Quy trình tái sử dụng để lưu một "lesson" nhằm tránh AI lặp lại lỗi trong dự án này.
Dùng bởi `/learn` (thủ công) và được đề xuất bởi `/review-code`, `/fix-bug`, `/debug` (tự động).

> **Bộ nhớ dự án, không phải huấn luyện model.** Một lesson là văn bản thuần được inject vào context ở
> đầu mỗi lệnh (context-loader Bước 6.7). Về mặt chức năng, điều này chặn việc lặp lại — AI thấy
> guardrail trước khi sinh nội dung. Không có trọng số model nào thay đổi.

## L1 — Phân giải file lessons

Phân giải `lessons_path` theo thứ tự sau:
1. `paths.lessons_file` từ context đã nạp (có thể bị service override ở chế độ umbrella, Bước 1.6)
2. Mặc định `specs/domain-knowledge/lessons-learned.md` (single-service)
3. Ở chế độ umbrella/service (khi `service_root` được set) mặc định `{service_root}/.agent/project-lessons.md`

## L2 — Dựng lesson

Thu thập các field sau — từ `$ARGUMENTS` (cho `/learn`) hoặc từ findings của lệnh gọi
(cho `/review-code`, `/fix-bug`, `/debug`):

| Field | Ý nghĩa |
|-------|---------|
| `category` | một trong: `code-gen` \| `bdd` \| `tech-docs` \| `tests` \| `prd` \| `general` |
| `title` | cụm từ ngắn đặt tên cho lỗi |
| `mistake` | cụ thể, AI đã làm sai điều gì |
| `rule` | câu sửa mệnh lệnh — "Luôn …" / "Không bao giờ …" — testable, không mơ hồ |
| `scope` | phạm vi áp dụng: một domain, một file glob (vd `*Controller.*`), hoặc `all` |
| `source` | cách ghi nhận: `/learn` \| `/review-code {UC-ID}` \| `/fix-bug {TICKET}` \| `/debug` |

Nếu `rule` mơ hồ (vd "cẩn thận"), viết lại thành chỉ dẫn cụ thể, kiểm tra được trước khi lưu.

## L3 — Khử trùng lặp

Đọc các lesson hiện có trong `lessons_path`. Nếu đã có một lesson cùng lỗi:
- **Tinh chỉnh** entry đó (siết chặt Rule, mở rộng/thu hẹp Scope, cập nhật Date, thêm Source mới) — KHÔNG thêm bản trùng.

Nếu không, gán id kế tiếp `L-{NNN}` = (số lớn nhất hiện có + 1), pad 0 đủ 3 chữ số.

## L4 — Ghi

Nếu `lessons_path` chưa tồn tại, tạo file với header sau trước:

```markdown
# Project Lessons — Learned Guardrails

> Các lỗi AI KHÔNG được lặp lại trong dự án này. Được nạp bởi context-loader ở đầu
> mỗi lệnh và coi như ràng buộc cứng (cùng mức ưu tiên với coding standards trong CLAUDE.md).
> Thêm bằng /learn, hoặc chấp nhận prompt trong /review-code, /fix-bug, /debug.
> Rà lại định kỳ bằng `/learn --review`. Commit file này để cả team dùng chung guardrail.

| Category | Áp dụng cho |
|----------|-----------|
| code-gen | output của /generate-code |
| bdd | output của /generate-bdd |
| tech-docs | output của /generate-tech-docs |
| tests | output của /dev-gen-test |
| prd | output của /generate-prd, /refine-prd |
| general | mọi lệnh |

**Status:** `active` = đang là ràng buộc cứng · `retired` = đã hết đúng, GIỮ LẠI làm lịch sử
nhưng context-loader **không nạp nữa**. Lesson không ghi `Status` được coi là `active`.

---
```

Chèn lesson mới ngay dưới dấu phân cách `---` (**mới nhất lên đầu**), theo đúng dạng:

```markdown
### L-{NNN} — [{category}] {title}
- **Status**: active
- **Date**: {hôm nay YYYY-MM-DD}
- **Scope**: {scope}
- **Mistake**: {mistake}
- **Rule**: {rule}
- **Source**: {source}

```

### Retire — đường ra của một lesson *(GAPS-v3 G46)*

Một lesson là **giả thuyết rằng AI sẽ lặp lại một lỗi**. Giả thuyết đó hết đúng khi code nó canh
không còn tồn tại, hoặc khi quy ước dự án đã đổi. Lúc đó nó phải bị **hạ xuống**, không được giữ.

Retire = đổi `Status` và ghi lý do — **KHÔNG xoá dòng**:

```markdown
### L-003 — [code-gen] Dùng WebClient thay RestTemplate
- **Status**: retired
- **Retired**: 2027-03-15 — project đổi tầng HTTP, RestTemplate không còn trong repo
- **Date**: 2026-08-19
  …giữ nguyên phần còn lại…
```

Giữ lại vì nó là **lịch sử**: người sau đọc được *"vì sao dự án này từng có luật đó"*, thứ mà xoá
đi là mất vĩnh viễn.

> **Vì sao cần đường ra:** trước G46 file này **chỉ có đường vào**. Lesson được nạp làm *"ràng buộc
> cứng, cùng mức ưu tiên với CLAUDE.md"* — vĩnh viễn, kể cả khi code nó canh đã bị xoá. Không cờ
> nào nhắc, không lệnh nào gỡ; cách duy nhất là có người tự nhớ ra rồi xoá tay.
> Đây đúng lớp lỗi của **G28** (*"giữ một `pass` đã hết hiệu lực là báo cáo sai"*) và luật
> `rules/workflow.md` §Trace Contract — **"làm mất hiệu lực ≠ ghi đè"** — chỉ là ở hàng đợi này
> chưa ai áp luật đó.
>
> **Ba trong bốn lệnh ghi lesson là lệnh phản ứng khi có sự cố** (`/review-code`, `/fix-bug`,
> `/debug`), nên file phình nhanh nhất đúng lúc dự án đang trục trặc — và lesson sinh ra lúc đó
> hay gắn với một sự cố cụ thể hơn là một quy tắc bền.

## L5 — Xác nhận

In: `📝 Đã ghi lesson {id} → {lessons_path}  ([{category}] {title})`
Rồi nhắc: `Commit {lessons_path} để cả team dùng chung guardrail này.`


## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/fix-bug Hoàn tất — {TICKET_ID}
Root Cause: {analysis}
Changes: {list}
✅ Regression test added | ✅ Build: SUCCESS
{Trace: {UC-ID}-{platform}.tsv updated — test_count +{n}, dev_selftest → not_run | nếu có chạm row trace}
{🐞 BUG-{id} → State: Fixed (pushed) — Closed sau khi /qc-run-test re-verify pass | nếu fix một bug đã file}
{📝 Lesson L-NNN recorded (nếu đã capture)}
Branch: fix/{TICKET_ID}-{slug}
Next: /dev-run-test {UC-ID}  ← dev_selftest vừa bị reset về not_run, chạy để lấy lại tín hiệu xanh
      Rồi tạo PR và link tới ticket. {QC: chạy lại /qc-run-test {UC-ID} để verify + đóng bug | nếu áp dụng}
```

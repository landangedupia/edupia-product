# /validate-traces — Traceability Coverage Matrix

Check read-only độ phủ giữa spec, code, và test — gồm cả PRD version drift.

## Gate

*Checkpoint: **không chặn** — read-only (ghi trace-report.json + TSV status, không đụng spec/code). Gate Bước 3 bỏ qua CHECKPOINT (Bước 3a).*

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


*Lưu ý: Lệnh này **không có target file đơn** — nó quét nhiều thư mục, nên gate Bước 1 không phân giải file. Phạm vi audit do **Step 0-A** phân giải từ `$ARGUMENTS` (`--domain` / `--prd` / `--uc`; không có cờ nào = toàn bộ).*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Process

### Step 0-A — Phân giải **phạm vi audit** *(chạy TRƯỚC Step 0)*

*Contract: `bin/trace-schema.json` → `gate.report_root_keys`. Đây là đầu PRODUCER của một sợi dây mà đầu CONSUMER (`gate-trace`) đã có sẵn từ trước.*

Parse `$ARGUMENTS` (đã tách các cờ khác ở gate Bước 1):

| Cờ | `scope.kind` | `scope.value` | Hẹp lại những gì |
|---|---|---|---|
| *(không có)* | `all` | `"all"` | Không hẹp — audit toàn bộ |
| `--domain {domain}` | `domain` | tên domain | Chỉ sổ + spec dưới `{domain}/` |
| `--prd {TICKET-ID}` | `prd` | TICKET-ID | Chỉ **một** feature-package (phân giải `{domain}/{prd-slug}` từ TICKET-ID) |
| `--uc {UC-ID}` | `uc` | UC-ID | Chỉ **một** UC — **mọi platform của nó** (`{UC-ID}-*.tsv`) |

Nhiều cờ scope cùng lúc → **DỪNG**, báo lỗi: chúng loại trừ nhau, và tự ý ưu tiên một cái là hẹp phạm vi mà người dùng không biết.

`--prd`/`--uc` không phân giải được về một package/UC có thật → **DỪNG** và liệt kê ứng viên. **KHÔNG** âm thầm rơi về `all` (chạy toàn bộ khi người ta xin một phần là đốt 30 phút không ai muốn) và **KHÔNG** âm thầm audit rỗng (báo cáo "sạch" trên 0 row).

**Token TRẦN (không mở đầu bằng `--`)** — vd `/validate-traces --reconcile-code LESS-06`:

| Token trần trông như | Xử |
|---|---|
| **UC-ID** (`{TICKET}-UC{n}`) | coi là `--uc {token}` |
| **TICKET-ID** phân giải được về đúng **một** feature-package | coi là `--prd {token}` |
| không phân giải được, hoặc khớp **nhiều** package | **DỪNG**, liệt kê ứng viên |
| có **cả** token trần **và** một cờ scope | **DỪNG** — hai nguồn phạm vi, không tự chọn hộ |

Hai hàng đầu **phải in một dòng** nói rõ đã tự suy, để người dùng thấy mình vừa được hiểu thế nào:
```
ⓘ Hiểu `{token}` là `--prd {token}` ({domain}/{prd-slug}). Gõ cờ tường minh nếu ý khác.
```

> **Vì sao không để token trần rơi về `all` (phát hiện 2026-08-27, lượt dùng `--reconcile-code` đầu tiên).**
> Gate Bước 1 loại mọi token `--` khỏi phần resolve target, và lệnh này **không có target file** — nên
> token trần trước đây **bị bỏ hoàn toàn** ⇒ `scope` = `all`. Người dùng gõ `--reconcile-code LESS-06`
> tin rằng đang chạy hẹp một PRD, trong khi lệnh sẽ **GHI vào sổ của cả 20+ PRD**, gồm cả phần của PO
> khác. Đây đúng điều chính step này cấm hai dòng ở trên — *"KHÔNG âm thầm rơi về `all`"* — chỉ khác là
> lỗ vào bằng cửa *"không có cờ nào"* thay vì cửa *"cờ không phân giải được"*.
>
> Với một lệnh **chỉ đọc** thì đó là đốt thời gian. Với `--reconcile-code` (có GHI) thì đó là ghi ra
> ngoài phạm vi mà người dùng nghĩ mình đã yêu cầu — hạng nặng hơn hẳn.

Lưu `scope` — mọi step sau dùng nó:

| Step | Hẹp thế nào |
|---|---|
| Step 0 / Step 1 | `all_trace_dirs` giữ nguyên, nhưng chỉ đọc TSV **khớp scope**: `{trace_dir}/{domain}/**` · `{trace_dir}/{domain}/{prd-slug}/**` · `{trace_dir}/**/{UC-ID}-*.tsv` |
| Step 1.0 (lint) | truyền `--trace` như cũ — **lint luôn chạy toàn bộ**. Sổ hỏng ở domain khác vẫn là sổ hỏng, và lint rẻ (không LLM) |
| Step 2b · 3.9 · 4 · 5* · 7 | chỉ các PRD/UC trong scope |
| Step 6 · 6b | chỉ ghi lại TSV + mốc của phần trong scope |
| Step 8 | ghi `scope` **và** `domain` vào biên bản (xem dưới) |

**In phạm vi ngay đầu run**, trước khi làm gì:
```
Phạm vi: {all | domain={d} | prd={TICKET-ID} | uc={UC-ID}}
         {n} PRD · {m} UC · {k} sổ  →  {ước lượng: toàn bộ repo | một phần}
```
*Không có dòng này thì người dùng không biết mình vừa gọi một lệnh cỡ nào — và đây là lệnh đắt nhất trong 33 lệnh (~33k token chỉ dẫn trước khi mở artifact nào).*

> **Vì sao step này là "nối dây", không phải "thêm tính năng" (GAPS-v4 G57).**
> Trước nó, **năm** chỗ trong lệnh này mô tả một *"domain argument"* / *"domain filter"* **không tồn
> tại**: ghi chú Gate (*"target là một tên domain hoặc UC-ID cụ thể từ `$ARGUMENTS`"*) · Step 1 đọc TSV
> *"khớp domain target"* · schema biên bản `"<domain argument, or 'all' if no filter>"` · Step 8
> *"nếu có domain filter, chỉ gồm các PRD đó"* · dòng `trace-history` mang field `domain`.
> Và `gate-trace` **đã** đọc `report.domain` rồi **chặn PR** nếu nó khác `all`.
>
> Nhưng Step 0 đặt `all_trace_dirs` = toàn bộ **vô điều kiện**, và chỗ duy nhất parse `$ARGUMENTS` là
> Step 5e cho hai cờ `--realign`. Nên ô đó **luôn** ghi `all`, và phần kiểm của gate **chưa bao giờ
> chạy một lần nào**.
>
> Đây đúng hình dạng **R1 fail build vì nó** — *"field có consumer mà không có producer"*, ca
> `@trace.sc_version` (3 consumer, 0 producer, sống qua nhiều version không ai bắt được). Nó sống
> được vì R1 chỉ canh field trong **sổ TSV** và tag trong **code**, không canh key ở cấp gốc **biên
> bản JSON**. `self-check` **R9(h)** giờ canh cả hai đầu.
>
> Và ghi chú Gate còn **tệ hơn im lặng** — nó gây nhầm: một agent đọc *"target là một tên domain hoặc
> UC-ID"* sẽ **tin rằng** scoping hoạt động.

---
### Step 0 — Umbrella Mode Detection

Kiểm tra mảng `services` có tồn tại trong `project-context.yaml` không.

**Nếu `services` tồn tại (umbrella mode):**
- Phân giải trace dir:
  - **Nếu `setup.spec_source` được set (consolidated trace):** `all_trace_dirs = [ {spec_source}/.trace ]` — một vị trí authoritative **duy nhất** trong spec repo. Không cần tách theo service vì **mỗi row TSV mang service sở hữu ở cột `service` (cột 23)** — `/generate-bdd` ghi nó từ `@trace.service` của header `.feature`. Đây là trường hợp phổ biến.
    > *Trước v0.4.3, câu này nói "scenario mang service qua `@trace.service`" nhưng TSV **không có cột nào** cho nó và JSON report cũng không — nên ở đúng chế độ phổ biến nhất, trace hoàn toàn không trả lời được "scenario này thuộc đội nào". Cột 23 là thứ làm câu trên trở thành sự thật.*
  - **Else (không có spec_source — legacy per-service trace):** một dir mỗi service — `services[N].trace_dir` nếu set, else `{services[N].path}/.trace`; `all_trace_dirs = [ dir1, dir2, … ]`, gắn tag tên service khi đọc.
- Step 1 đọc TSV từ `all_trace_dirs`.
- **Phân giải Living Docs home (vị trí report sinh ra):**
  - Nếu `setup.spec_source` được set → `living_docs_dir = {spec_source}/.living-docs`
    *(specs module dùng chung — mount trong mọi service/umbrella workspace, nên panel phân giải nó bất kể dev đứng ở submodule nào)*
  - Else (umbrella không có spec repo riêng) → `living_docs_dir = .living-docs` ở umbrella root
- **Phân giải panel mirror:** `panel_mirror = ./.trace-mirror` ở **gốc workspace hiện tại** (nơi lệnh chạy). Panel VS Code đọc report từ workspace đang mở — ghi ở đây là cái làm view không rỗng khi dev mở một service submodule trực tiếp.
  **Bỏ qua toàn bộ mirror nếu `{paths.trace_dir}` đã nằm trong workspace hiện tại** (single-service, hoặc dev mở thẳng spec repo) — panel đọc `.trace/trace-report.json` tại chỗ, không cần bản sao.
  > ⚠️ **`.trace-mirror` ≠ `.trace` — cố ý khác tên.** Trước v0.4.3 cả hai cùng tên `.trace`, nên một luật gitignore theo tên có thể xoá sạch sổ gốc khi hai path trùng nhau. Giờ luật git là tuyệt đối, không có ca nhập nhằng: `.trace-mirror/` **luôn** gitignore · `{paths.trace_dir}` **luôn** commit.

**Nếu không có key `services` (single-service mode):**
- Set `all_trace_dirs = [ {paths.trace_dir} ]`
- Không cần umbrella sync

---

### Step 1.0 — Lint sổ trace TRƯỚC khi đọc *(bắt buộc, không bỏ qua được)*

Chạy checker xác định trên mọi trace dir đã phân giải ở Step 0:

```bash
npx @educa-corp/sdd-framework --lint-trace --trace {all_trace_dirs, ngăn cách bởi dấu phẩy} --specs {paths.specs_dir} --code {code_roots, ngăn cách bởi dấu phẩy}
```

**Dựng `code_roots` — bắt buộc truyền, đây là chìa khoá kho của T14:**

| Chế độ | `code_roots` |
|---|---|
| **Umbrella** (có `services:`) | tập **duy nhất** mọi giá trị `path` xuất hiện trong `services:` — gồm cả `path` lồng trong `by_prd_slug`. Bỏ trùng (nhiều domain trỏ chung một submodule là chuyện thường). |
| **Single-service** | `{paths.src_dir}` |
| Không phân giải được cái nào | **truyền rỗng** — T14 tự bỏ qua và tự in một dòng nói rõ đã bỏ qua. **Đừng đoán** một thư mục nào đó: quét sai chỗ còn tệ hơn không quét. |

*`bin/` sống trong package npm, không được cài vào project — nên `npx` là đường duy nhất. Không có mạng / npx fail → **bỏ qua step này**, in `⚠️ Chưa lint được sổ trace (npx không khả dụng) — kết quả dưới đây chưa được kiểm cấu trúc` vào report, rồi tiếp Step 1. Đừng để nó chặn cả lệnh.*

> **Vì sao `--code` (G60).** Trước nó, checker xác định duy nhất mở file thật của dự án chỉ nhận
> `--trace` và `--specs` — nó **không thể thấy code**, nên ca *"code đã có tag mà sổ ghi
> `implemented_by` trống"* không có một mắt xác định nào canh. T14 là chiều ngược đó, ở mức
> **WARN**: nó **không được** chặn lệnh này, vì nợ tồn ở project đang chạy sẽ đỏ khắp nơi ở lần
> đầu và người ta sẽ tắt cổng — mất luôn T1–T13 thật.
> Cờ `LEDGER_BEHIND_CODE` ở Step 2b là bản LLM của cùng phép kiểm; `--reconcile-code` là đường ra.

**Exit 0 → tiếp Step 1.**

**Exit 1 → DỪNG NGAY.** Đừng nạp, đừng tính `status`, đừng ghi lại gì:

```
🔴 SỔ TRACE HỎNG — không phán trạng thái trên dữ liệu này.

{nguyên văn output của lint-trace}

Vì sao dừng thay vì cố đọc tiếp: Step 3 tính lại `status` rồi Step 6 GHI NGƯỢC
vào TSV. Chạy tiếp trên một row đã lệch cột sẽ nướng cái lệch đó vào sổ vĩnh viễn —
và sổ trace là dữ liệu KHÔNG regenerate được.

Sửa:
  1. Xem lần ghi nào làm hỏng : git log -p {file}
  2. Sửa file (thường là thêm/bớt một dấu tab, hoặc giữ cả hai row sau merge)
  3. Kiểm lại               : npx @educa-corp/sdd-framework --lint-trace
  4. Rồi chạy lại /validate-traces
```

> **Vì sao step này tồn tại (G38):** `bin/self-check.js` canh **contract** — nó đọc file lệnh
> và kiểm "lệnh có gọi đúng tên cột không". Nó không bao giờ mở một `.tsv` thật. Trong khi sổ
> 24 cột được ghi **bằng tay**, hàng chục lần mỗi feature. Một dấu tab thiếu ở ô 17 dồn mọi ô
> sau đó sang trái một bậc — ô 21 `status` nhận một ngày tháng — và **trước step này không gì
> báo lỗi**: lệnh đọc tiếp, in ra số, số chảy vào `trace-report.json` rồi vào dashboard.

---

### Step 1 — Nạp dữ liệu TSV

**Umbrella mode:** đọc tất cả file `{trace_dir}/**/*.tsv` từ mọi dir trong `all_trace_dirs`. Với mỗi TSV, gắn tag row với tên service gốc.

**Single-service mode:** đọc tất cả file `{paths.trace_dir}/{domain}/**/*.tsv` khớp domain target (hoặc `{paths.trace_dir}/**/*.tsv` cho mọi domain nếu không có domain filter).

Mỗi file cho trace state đã lưu của UC đó.

**Nếu không tìm thấy file `.tsv` nào** trong bất kỳ trace dir nào:
- Quét tất cả file `{paths.specs_dir}/**/*.feature` trong domain target để dựng list in-memory mọi scenario.
- Coi mọi scenario là `UNTRACKED` (chưa sinh code).
- In: "⚠️ No trace files found. All {N} scenarios across {M} UCs are UNTRACKED."
- Đề xuất: "Run `/generate-bdd {prd-file}` to initialize trace state, or `/generate-code {feature-file}` to generate code."
- **Bỏ qua hoàn toàn Step 2–6.** Đi thẳng tới Step 7 dùng state in-memory này — ĐỪNG abort.

### Step 2 — Reconcile với file `.feature` hiện tại

Mỗi file trace là `{UC-ID}-{platform}.tsv` (một sổ / UC × platform). Với mỗi row, đọc file `.feature` **của đúng platform đó** (`{specs_dir}/{domain}/{prd-slug}/bdd/{platform}/{UC-ID}*.feature` — platform lấy từ tên file TSV) và lấy `@trace.sc_version` **hiện tại** cho SC đó.
Nếu version SC trong `.feature` khác `spec_ver` của `.tsv` → cập nhật `spec_ver` trong memory (sẽ ghi lại).

Cũng phát hiện SC có trong `.feature` (platform đó) nhưng thiếu trong `.tsv` → thêm row mới với `status: UNTRACKED`. *(sc_id trùng số giữa các platform là 2 scenario khác nhau → mỗi sổ platform giữ tập SC riêng, không dedupe chéo platform.)*

### Step 2c — Phân giải lại `service` từ config hiện tại *(G51)*

*Cùng tinh thần Step 2 với `spec_ver`: cột TSV là **cache**, `services:` trong `project-context.yaml`
là **nguồn**. Mỗi lần chạy, đối chiếu lại.*

Với mỗi row có `service` ∈ (`unrouted`, `unresolved`), tra lại `services:` theo
`domain` + `platform` (từ tên file sổ) + `prd_slug`:

| Kết quả tra | Hành động |
|---|---|
| Giờ **khớp** một entry | **Cập nhật `service` = path đó** (in memory, ghi lại ở Step 6). Không cần chạy lại `/generate-bdd`. |
| Vẫn không khớp | Giữ `unrouted` → gắn cờ 🟠 `SERVICE_UNROUTED` |
| Config vẫn sai cấu trúc | Giữ `unresolved` → cùng cờ, nhưng lý do khác (bug config, không phải chờ quyết) |

> **Vì sao lệnh này được ghi một cột do `/generate-bdd` sở hữu:** đây là **ngoại lệ có chủ ý** với luật
> *"mỗi cột một chủ"* (`rules/workflow.md` §Trace Contract), và nó **không vi phạm tinh thần** của luật:
> lệnh này **không ghi một giá trị mới** — nó chỉ **phân giải một placeholder mà `/generate-bdd` đã cố ý
> để lại**. Khai tường minh trong `bin/trace-schema.json`: `service.written_by = [generate-bdd, validate-traces]`.
>
> Đây là thứ làm sổ **tự lành**: architect thêm mapping → lần `/validate-traces` kế tiếp nâng
> `unrouted` → path. Không sửa tay, không sinh lại BDD. Không có bước này thì `unrouted` **đọng lại
> vĩnh viễn** — đúng bệnh `TBD` mà G1/G28 đã chỉ ra.

### Step 2b — Reverse audit (hai câu hỏi trên cùng một lượt quét)

*Step 2 đi chiều **spec → code** (mỗi row TSV, SC đó implement tới đâu). Step này đi **chiều ngược** — bắt lớp lỗi mà Step 2 cấu trúc không thể thấy.*

**Một lượt quét, HAI câu hỏi.** Đừng dừng ở câu đầu:

| | Câu hỏi | Bắt được gì |
|---|---|---|
| **A** | *"Tag này trỏ vào SC có tồn tại không?"* | code trỏ vào scenario **đã bị xoá** → `ORPHANED` / `TRACE_ORPHAN` |
| **B** | *"Sổ có biết SC này đã có code chưa?"* | code đã làm mà **sổ chưa ghi** → `LEDGER_BEHIND_CODE` |

> **Vì sao câu B phải nằm ở đây, và vì sao nó từng thiếu (G60).** Bản trước chỉ có câu A. Câu B dùng
> **đúng dữ liệu đã nạp trong bộ nhớ** — không phát sinh thêm một lần I/O nào — nên bỏ nó là bỏ
> không vì lý do gì. Và không có nó thì lớp lỗi *"làm rồi mà không ghi sổ"* **không có một mắt nào
> canh**: `self-check` R1 hỏi *"ai được phép ghi"* (`implemented_by` có producer ⇒ xanh), còn
> `lint-trace` trước T14 thì không thấy được code. Đo trên một project thật: **504 scenario** có code
> mà sổ ghi trống, làm dashboard đếm thiếu **28 điểm** phủ code.

**Quét (gộp vào cùng lượt quét code của Step 5b — không thêm pass mới):** dưới `{code_base_package}` (CLAUDE.md §2) + `{paths.src_dir}`, thu mọi `@trace.implements={UC-ID}-SC{N}`; trong thư mục test thu mọi `@trace.verifies={UC-ID}-SC{N}`.

Với mỗi tag, hỏi: `SC{N}` đó có tồn tại trong `.feature` của đúng platform không?

| Điều kiện | Cờ | Ý nghĩa |
|---|---|---|
| SC không có trong `.feature`, **và** row TSV còn (đã mang `status = ORPHANED` do `/generate-bdd` giữ lại) | `ORPHANED` 🔴 | Đã được ghi nhận — đang chờ người quyết định |
| SC không có trong `.feature`, **và** không có row TSV nào | `TRACE_ORPHAN` 🔴 | Nợ cũ: row bị xoá bởi version trước, hoặc tag ghi sai UC/SC id ngay từ đầu. **Không có chỗ nào khác bắt được cái này.** |
| SC có trong `.feature` | *(sạch)* | |

**Với `TRACE_ORPHAN`:** đừng tự tạo row TSV (chưa biết nó nên là scenario nào) và **đừng** sửa/xoá code. Chỉ report kèm đúng hai đường ra ở §Output.

Không tìm thấy tag mồ côi nào → bỏ qua im lặng.

#### Câu B — sổ có theo kịp code chưa?

Với mỗi `@trace.implements={UC-ID}-SC{N}` mà `SC{N}` **có** trong `.feature` (tức đã qua câu A):

| Điều kiện | Cờ | Ý nghĩa |
|---|---|---|
| Row TSV tồn tại **và** `implemented_by != —` | *(sạch)* | Sổ khớp kho |
| Row TSV tồn tại **nhưng** `implemented_by == —` | `LEDGER_BEHIND_CODE` 🟠 | **Làm rồi mà không ghi sổ.** Row đang hiện `UNTRACKED`, dashboard đếm thiếu, và `/generate-code` sẽ coi là "chưa làm" rồi sinh lại |
| Không có row TSV nào | — | Step 2 đã thêm row `UNTRACKED` từ `.feature`; lượt sau sẽ vào hàng trên |

**Ghi lại cho mỗi cờ:** `sc_id` · `platform` (từ tên file sổ) · danh sách file code mang tag · và **`has_verifies`** = có `@trace.verifies` cho đúng SC đó hay không. Field cuối là thứ quyết định `--reconcile-code` điền row đó thành *có test* hay *chưa test* — thu ngay ở đây vì lượt quét này đã đọc cả hai loại tag.

**Nguyên nhân thường gặp, nêu luôn trong report** để người đọc không phải đoán: `/generate-code` dừng ở cổng build nên §Write Trace State chưa chạy; hoặc dev sửa tay cho build pass rồi commit mà không chạy lại lệnh.

**Cờ này 🟠 KHÔNG chặn PR** — xem lý do ở Step 7 (`ledger_behind_code_count`). Đường ra là `--reconcile-code` (Step 5f).

Không tìm thấy row nào lệch → bỏ qua im lặng.

### Step 3 — Tính `status` theo từng scenario

Áp dụng quy tắc theo thứ tự ưu tiên (first-match-wins):

| Rule | Status | Điều kiện |
|------|--------|-----------|
| 0 | `ORPHANED` | SC của row này **không còn trong `.feature`** (Step 2b) AND `implemented_by != —` — code trỏ vào scenario đã bị xoá |
| 1 | `UNTRACKED` | `implemented_by == —` (chưa sinh code) |
| 2 | `DRIFT` | `implemented_by != —` AND `spec_ver != gen_ver` (spec đã đổi sau lần codegen — code cũ, **ưu tiên regen trước khi test**) |
| 3 | `GAP` | `implemented_by != —` AND (`test_count == —` OR `test_count == 0`) |
| 4 | `OK` | tất cả: `spec_ver == gen_ver`, `implemented_by != —`, `test_count > 0` |

> **Vì sao ORPHANED là Rule 0 (xét TRƯỚC mọi rule khác):** 4 rule kia đều giả định scenario **còn tồn tại** — chúng trả lời "spec này implement tới đâu". `ORPHANED` trả lời câu ngược: "code này còn spec nào bảo lãnh không". Nếu để rule khác thắng, mỗi giá trị đều **route người dùng sang một lệnh vô nghĩa**: `GAP` → `/dev-gen-test` sinh test cho scenario không tồn tại · `DRIFT` → `/generate-code` cố sinh lại từ SC đã bị xoá · `OK` → coi là sạch và cho tạo PR. Row cũng KHÔNG được xoá — xoá đi thì code thành vô hình (chính là bug gốc).

> **Vì sao DRIFT xét trước GAP:** một scenario đã có code, chưa test, **và** spec vừa drift phải hiện `DRIFT` (không phải `GAP`) — vì `generate-code` xử `GAP` = "skip codegen, chạy /dev-gen-test" còn `DRIFT` = "regenerate". Nếu GAP thắng, code lỗi thời bị bỏ qua và test lại sinh trên code cũ. UNTRACKED vẫn phải là Rule 1 để scenario chưa code (gen_ver `—`) không lọt vào DRIFT.

### Step 3.9 — Phát hiện sửa spec ngoài đường chính thức *(chạy TRƯỚC Step 4)*

*Contract: `bin/trace-schema.json` → `spec_edit_detection`. Cờ: `PRD_UNTRACKED_EDIT`.*

**Vì sao bước này đứng TRƯỚC Step 4.** Step 4 và mọi bước sau nó đều dựa trên một giả định
**chưa được kiểm**: *nhãn `Version` của PRD phản ánh đúng nội dung hiện tại của nó.* Nếu ai sửa nội
dung mà không bump nhãn thì giả định đó sai, và Step 4 sẽ phán *"version khớp ⇒ sạch"* trên một tài
liệu đã đổi. Kiểm cấu trúc drift trên một nhãn không còn đúng thì cũng vô nghĩa như G1 kiểm cấu trúc
một quyển sổ sắp mất — nên hỏi trước.

**Điểm mù mà nó bịt (GAPS-v4 G54).** Toàn bộ lưới an toàn của framework so **nhãn version**, không so
**nội dung** — không có một content hash nào ở đâu. Nên một PRD bị sửa tay là điểm mù **tuyệt đối**:
Step 4 thấy `PRD Version == prd_version` ⇒ sạch · `gate-trace` thấy report khớp sổ ⇒ PASS ·
`require-fresh-audit` thấy PR không chạm tag ⇒ không đòi audit. **Cả ba tầng xanh, và cả ba đúng theo
định nghĩa của chính chúng.**

#### Đọc mốc của lần audit trước

Đọc khối **`spec_baseline`** trong `trace-report.json` của lần chạy trước (path:
`{living_docs_dir}/trace-report.json`). Mỗi entry: `prd_path` · `sha_at_audit` · `version_at_audit`.

- Khối **vắng** (lần audit đầu, hoặc report sinh bởi version cũ hơn) → **bỏ qua so sánh**, chỉ **ghi
  mốc mới** ở Step 6b. In một dòng: `ⓘ spec_baseline: lần đầu ghi mốc — check sửa-ngoài-đường bắt đầu có hiệu lực từ lần chạy sau.`

#### So — hai nguồn bằng chứng, cần cả hai

Với mỗi file PRD trong phạm vi, ở repo chứa `{paths.specs_dir}`:

| Nguồn | Lệnh | Bắt ca nào |
|---|---|---|
| **git diff** | `git -C {specs repo} diff --name-only {sha_at_audit}..HEAD -- {prd_path}` | sửa **đã commit** |
| **git status** | `git -C {specs repo} status --porcelain -- {prd_path}` | sửa **CHƯA commit** — ca thường gặp nhất, vì PO đang gõ |

Thiếu nguồn thứ hai là mù với cả một lớp ca: PO sửa xong, chưa commit, chạy audit — và audit nói sạch.

#### Phán

| Nội dung đổi? | `Version` hiện tại vs `version_at_audit` | Kết luận |
|:---:|---|---|
| **có** | **BẰNG NHAU** | 🔴 **`PRD_UNTRACKED_EDIT`** — có người sửa ngoài `/generate-prd` · `/extend-prd` · `/amend-prd` · `/refine-prd` · `/review-context` |
| có | khác | ✅ không cờ — đã đi đường chính thức. Step 4 tiếp quản bình thường |
| không | bất kỳ | ✅ không cờ |

**Không có báo oan:** ca duy nhất bật cờ là *"đổi nội dung, giữ nguyên nhãn"*. Sửa **và** bump
version thì `version != version_at_audit` ⇒ im.

#### Ca không kiểm được → nói rõ là đang mù

Không phải git repo · `sha_at_audit` không còn (history bị rewrite) · `git` không khả dụng →
**bỏ qua** check này và in:
```
⚠️  Chưa kiểm được sửa-ngoài-đường cho {n} PRD ({lý do}) — điểm mù G54 đang MỞ ở các file này.
```
**KHÔNG** bịa cờ, và **KHÔNG** im lặng. Im lặng là lựa chọn rẻ nhất và tệ nhất trong ba.

#### Đường ra — tự lành, cố ý KHÔNG có lệnh escape

Cách sửa đúng là **bump version + ghi một row changelog nêu UC bị ảnh hưởng** — tức đúng việc
`/amend-prd` làm hộ. Làm xong thì `version != version_at_audit` ⇒ cờ tự tắt, và logic `PRD_DRIFT`
bình thường tiếp quản (đúng, vì nội dung có đổi thật).

> **Vì sao KHÔNG có `--accept-edit`:** thêm nó là thêm một đường **dán nhãn lên thay đổi chưa ai
> xem** — đúng cái sai mà ba rào của `--realign` (Step 5e) tồn tại để chặn.

#### Vì sao cờ này KHÔNG nằm trong `gate.blocking`

Quyết định có chủ ý, ghi ở `spec_edit_detection.$comment`:

| | |
|---|---|
| `gate.blocking` nghĩa hẹp là **code đang hỏng** | Cờ này nói về **spec**; code có thể đang hoàn toàn đúng. R9(e) tồn tại để giữ đúng ranh giới đó |
| Nợ tồn khi mới bật | Mọi project đang chạy đều đã có PRD sửa tay ⇒ cờ chặn mới sẽ đỏ khắp nơi ở lần đầu ⇒ **người ta tắt cổng** ⇒ mất luôn 4 cờ 🔴 thật. Đó đúng là thất bại R9(e) được viết ra để chặn, chỉ đến bằng một cửa khác |
| Nhưng nó vẫn 🔴 | In mỗi lần chạy, có khối riêng trong report + counter trong `summary` — đủ để thấy, không đủ để làm tắt cổng |

Team nào đã dọn sạch nợ tồn thì tự thêm `prd_untracked_edit_count` vào `gate.blocking` (kèm `why`) —
`self-check` R13(e) canh việc đó.

---
### Step 4 — PRD version drift check

Với mỗi UC, so:
- PRD `| **Version** |` hiện tại từ `{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md`
- `prd_version` lưu trong `.tsv` (version tại thời điểm sinh BDD)
- `@trace.prd_version` trong các file code implement UC đó

Nếu layer nào sau version PRD hiện tại → trích các changelog entry kể từ version đó, rồi **lọc theo phạm vi ảnh hưởng** (dưới đây) để quyết `PRD_DRIFT` 🟠 hay `PRD_STALE_REF` ⓘ.

#### Lọc theo phạm vi changelog — chống báo động oan

*PRD là tài liệu **cấp feature** phủ nhiều UC, nhưng version của nó là **một scalar**. Nên thêm UC7 — không đụng một chữ nào của UC1–UC6 — vẫn làm cả 6 UC cũ lệch version. So version thuần thì cả 6 ăn cờ đỏ oan.*

Đọc các row `# Change Log` của PRD **từ version của layer cũ nhất tới hiện tại**. Mỗi row mang một `{changelog_scope}` — contract máy đọc, khai ở `bin/trace-schema.json` → `changelog_row_contract`; producer là `/refine-prd` Phase 3, `/extend-prd` Bước 6, `/review-context` Fix/Resume Phase 3, và **bắt buộc** ghi thông tin này chính vì mục đích ở đây. *(`/generate-bdd` Version Check đọc cùng dữ liệu.)*

**Dựng `affected_ucs` theo ba bước — KHÔNG bỏ bước 2:**

**1. Tách mệnh đề.** Mỗi row `{changelog_scope}` gồm các mệnh đề ngăn bằng `;`, mỗi mệnh đề mở đầu bằng đơn vị sở hữu: `{UC-ID}: {mô tả}` hoặc `PRD-global: {mô tả}`.

**2. Chuẩn hoá về UC — phép phân giải `BR/AC → UC sở hữu`.** Trong mỗi mệnh đề, ngoài UC-ID mở đầu còn có thể có BR/AC được nêu. Đưa **mọi** BR/AC về UC sở hữu **trước khi** so:

| Gặp | Phân giải thành |
|---|---|
| `BR{n}` | UC có `BR{n}` trong **bảng Business Rule** của nó (PRD §3) |
| `AC{n}` | UC có `AC{n}` ở dòng **`**AC liên quan:**`** của nó (PRD §3) |
| `PRD-global` | **không** thuộc UC nào — không thêm gì vào `affected_ucs` |
| BR/AC **không** phân giải được về UC nào *(ID đã bị xoá, hoặc PRD lệch cấu trúc)* | coi **cả row** là **mơ hồ** → hàng 3 dưới đây. **KHÔNG** bỏ qua im lặng mệnh đề đó |

*Không phát sinh I/O: Step 4 đã mở file PRD này ở đầu bước.*

**3. Phân loại từng UC** *(first-match-wins)*:

| Điều kiện | Cờ | Hành động |
|---|---|---|
| **Bất kỳ** row nào trong khoảng **mơ hồ** (không mệnh đề nào nêu được đơn vị sở hữu, hoặc bước 2 không phân giải được) | `PRD_DRIFT` 🟠 cho **MỌI** UC | Không suy đoán được thì quét rộng |
| UC này **có** trong `affected_ucs` | `PRD_DRIFT` 🟠 | Cần regen thật — theo bảng `drifted_layers` bên dưới |
| UC này có trong `affected_ucs` **CHỈ** qua (các) mệnh đề mang hậu tố **`[no-behavior]`** | `PRD_STALE_REF` ⓘ | Producer đã **chứng minh** thay đổi không đổi hành vi (chỉ thêm/bỏ vỏ cấu trúc). Xem `changelog_row_contract.neutral_checks` |
| UC này **không** có trong `affected_ucs`, **và** mọi row trong khoảng đều nêu rõ scope | `PRD_STALE_REF` ⓘ | Nội dung không đổi, chỉ con trỏ version cũ. **KHÔNG** route regen — dùng `--realign-prd-version` |

> **Vì sao bước 2 là bắt buộc (G53).** Bản cũ viết *"trích tập UC/AC/BR được nêu"* rồi so bằng phép thử *"**UC** này có trong tập?"*. Hai câu đó **không khớp nhau**: tập chứa lẫn UC, AC và BR, nhưng phép thử chỉ hỏi về UC. Nên một row như `thêm UC7: AC12-AC14; sửa BR8` cho tập `{UC7, AC12-14, BR8}` — và **UC3, chủ sở hữu BR8, không có trong đó**.
>
> Row đó nêu rất nhiều ID nên **không** rơi vào hàng "mơ hồ". Kết quả: UC3 → ⓘ *"không phải lỗi"*, trong khi BR mà nó sở hữu vừa đổi hành vi. Và ⓘ **mở cửa** cho `--realign-prd-version` (rào an toàn của nó chỉ **từ chối khi UC là 🟠**) ⇒ nhãn `prd_version` bị dán lại ở cả TSV lẫn tag code ⇒ **cờ sạch vĩnh viễn trên thay đổi chưa ai implement**.
>
> Đây là G1 đúng nghĩa — cờ **im lặng** — chỉ khác là lần này có thêm một lệnh tự động đóng dấu lên nó.

> **Vì sao hàng "mơ hồ" lên ĐẦU bảng.** Nó là điều kiện **cấp row**, không phải cấp UC: một row mơ hồ làm mọi phán đoán per-UC trong khoảng đó vô giá trị. Xét nó sau các hàng kia thì một UC có thể được xếp ⓘ **trước khi** ta biết là không suy đoán được gì — và ⓘ là hạng mở cửa cho `--realign`.

> **Hàng "mơ hồ" là lưới an toàn — hỏng theo hướng an toàn.** Changelog viết ẩu thì ta mất tính năng *lọc*, KHÔNG mất tính năng *cảnh báo*. Đồng bộ với `generate-bdd` Version Check: *"changelog row không nêu rõ scope (mơ hồ) → khuyến nghị F (gen lại toàn bộ)"*.
>
> ⚠️ **Nhưng lưới an toàn KHÔNG phải cái cớ để producer ghi bừa.** Nó đúng khi **thiếu** thông tin; nó sai khi producer **có** thông tin mà không ghi. Đó là G52: `/review-context --fix` từng ghi cứng `Auto-fix: applied {N} findings` — 0 scope — trong khi findings YAML của nó có `uc_id` bắt buộc cho từng finding. Một sửa từ trong UC5 làm **cả 8 UC** ăn 🟠. `self-check` R12 giờ fail build nếu producer nào không nhắc `{changelog_scope}`.

> **Hàng thứ ba là lưới an toàn — hỏng theo hướng an toàn.** Changelog viết ẩu thì ta mất tính năng *lọc*, KHÔNG mất tính năng *cảnh báo*. Đồng bộ với `generate-bdd` Version Check: *"changelog row không nêu rõ UC/AC/BR (mơ hồ) → khuyến nghị F (gen lại toàn bộ)"*.
>
> **Vì sao cần bước lọc này:** đây là G1 lộn ngược. G1 làm cờ **im lặng**; so-version-thuần làm cờ **ồn tới mức vô nghĩa** — sau vài lần thêm feature, `PRD_DRIFT` sáng thường trực, người đọc học cách bỏ qua, rồi lần lệch THẬT cũng bị bỏ qua cùng. Kết cục giống hệt nhau: không ai còn tin cờ. Và nó tệ dần theo thời gian — PRD càng nhiều UC, càng nhiều lần bump, nhiễu càng lớn, tức là đánh mạnh nhất vào chính những feature trưởng thành nhất.
> Framework **đã giải đúng bài này ở cấp scenario**: `sc_version` chỉ bump khi thân scenario thực sự đổi, với lý do ghi thẳng — *"bump vô cớ sẽ tạo DRIFT giả, làm cờ mất giá trị"*. Đây là bản tương ứng ở cấp PRD.

**Ghi rõ layer nào lệch** (`drifted_layers` trong JSON — `"tsv"` và/hoặc `"code"`). Đây là thứ quyết định người dùng phải chạy **một** lệnh hay **hai**:

| `drifted_layers` | Nghĩa | Hành động |
|---|---|---|
| `["tsv"]` | BDD chưa gen lại từ PRD mới; code vẫn khớp cột TSV | `/generate-bdd {prd-file}` là **đủ** |
| `["tsv","code"]` | Cả BDD lẫn code đều cũ | `/generate-bdd` **rồi** `/generate-code {UC-ID}` |
| `["code"]` | TSV đã cập nhật nhưng code chưa sinh lại | `/generate-code {UC-ID}` |

*Không ghi `drifted_layers` thì hai ca đầu trông hệt nhau — người dùng hoặc chạy thiếu (cờ không sạch) hoặc chạy thừa (sinh lại code không cần thiết).*

### Step 5 — Tech-doc revision drift check

Mỗi PRD có **một** tech-doc gộp `{paths.tech_docs_dir}/{domain}/{prd-slug}/tech-docs/{TICKET-ID}-tech-design.md` với một `@trace.revision` chung. So revision đó vs hai cột đã lưu:

- **Backend drift:** `@trace.revision` của doc vs `tech_doc_revision` trong `.tsv`.
- **FE integration drift:** `@trace.revision` của doc vs `fe_tech_doc_revision` trong `.tsv` (row FE `--phase=integration`, theo từng platform; §4.5.4).

Skip cột nào chưa có revision đã lưu (`—`), hoặc cả UC chưa có tech-doc.

#### Lọc theo phạm vi — ĐỐI XỨNG với Step 4

*Tech-doc có **đúng cùng hình dạng** với PRD: một doc **GỘP cấp PRD**, một `@trace.revision` chung cho nhiều UC. Chế độ **APPEND** (`generate-tech-docs` Bước 1) thêm UC mới vào doc đã có → revision bump → **mọi UC cũ lệch**, dù phần của chúng không đổi một dòng.*

Đọc **§10 UC Coverage** và **Changelog** của tech-doc. Mỗi row Changelog mang một `{changelog_scope}` cùng contract với PRD (`changelog_row_contract`); producer là `/generate-tech-docs` Bước 1b, đơn vị "global" ở đây tên là `doc-global` thay cho `PRD-global`.

Dựng `affected_ucs` **theo đúng ba bước của Step 4**, kể cả bước 2 (`BR/AC → UC sở hữu`) — tech-doc cũng nêu §/SC/BR trong mô tả, và một mệnh đề nêu `§5.9` mà bỏ UC thì UC đó rơi vào ⓘ y như ca BR8 ở Step 4. Rồi phân loại *(first-match-wins, cùng thứ tự)*:

| Điều kiện | Cờ |
|---|---|
| **Bất kỳ** row nào trong khoảng **mơ hồ** (không nêu được đơn vị sở hữu, hoặc bước 2 không phân giải được) | 🟠 cho **MỌI** UC (lưới an toàn) |
| UC này **có** trong `affected_ucs` | `TECHDOC_DRIFT` / `FE_TECHDOC_DRIFT` 🟠 |
| UC này có trong `affected_ucs` **CHỈ** qua mệnh đề mang hậu tố `[no-behavior]` | `TECHDOC_STALE_REF` ⓘ |
| UC này **không** có trong `affected_ucs`, mọi row nêu rõ scope | `TECHDOC_STALE_REF` ⓘ — dùng `--realign-techdoc-revision` |

> **`doc-global` là đường ra bình thường cho tech-doc, không phải ngoại lệ.** Sửa §11 Cross-cutting hay §2 kiến trúc chung thì không mệnh đề nào nêu UC ⇒ `affected_ucs` rỗng ⇒ mọi UC ở lại ⓘ. Nên `/generate-tech-docs` **không cần** dùng `[no-behavior]`; marker đó dành cho producer biết chính xác `check_id` của từng fix (`/review-context --fix`). Consumer vẫn phải **hiểu** marker vì cùng một hàng bảng phục vụ cả hai artifact.

### Step 5e — Realign mode *(chỉ chạy khi có flag)*

*Đường ra rẻ cho hai cờ ⓘ ở Step 4/5. Không có nó thì cờ `PRD_STALE_REF`/`TECHDOC_STALE_REF` **không bao giờ sạch được**: `/generate-bdd` cập nhật được cột TSV, nhưng tag trong code thì chỉ `/generate-code` ghi — mà nó thấy row `OK` là skip (`generate-code` §Read Trace State). Vòng lặp đóng, và lối ra duy nhất là ép sinh lại code cho hàng loạt UC không hề thay đổi.*

Parse `$ARGUMENTS`:

| Flag | Làm gì |
|---|---|
| `--realign-prd-version {UC-ID}` | Cập nhật cột `prd_version` của TSV **và** tag `@trace.prd_version` trong các file code của UC đó → version PRD hiện tại |
| `--realign-techdoc-revision {UC-ID}` | Tương tự với `tech_doc_revision`/`fe_tech_doc_revision` và tag `@trace.tech_doc_revision` → `@trace.revision` hiện tại |

**Ba rào an toàn — bắt buộc, đây là lệnh SỬA CODE:**

1. **Từ chối chạy** nếu UC đó có bất kỳ SC nào đang `DRIFT` hoặc `ORPHANED`, hoặc nếu Step 4/5 xếp nó là 🟠 (không phải ⓘ). Khi đó nội dung **có** đổi thật — dán nhãn lại là **che lỗi**. In:
   ```
   ❌ Từ chối realign {UC-ID}: UC này đang {PRD_DRIFT | có SC DRIFT | ORPHANED}.
      Realign chỉ dành cho ⓘ STALE_REF (nội dung KHÔNG đổi, chỉ con trỏ version cũ).
      Ở đây nội dung có đổi thật → /generate-bdd rồi /generate-code {UC-ID}.
   ```
2. **Chỉ sửa dòng bắt đầu bằng `@trace.`** — không đụng một dòng logic nào. **Guard sau-ghi:** đọc lại file, diff với bản trước; nếu có bất kỳ dòng nào **khác** ngoài các dòng `@trace.*` đã định → **khôi phục file** và dừng.
3. **In chính xác** file + dòng đã sửa vào report — realign im lặng là realign không kiểm chứng được.

Không đụng `dev_selftest`/`qc_status` (luật G28 không áp: **không có logic nào đổi** — đó chính là tiền đề của realign).

### Step 5f — Reconcile code mode *(chỉ chạy khi có `--reconcile-code`)*

*Đường ra cho cờ `LEDGER_BEHIND_CODE` (Step 2b câu B). Không có nó thì cờ đó **không bao giờ sạch được**: `implemented_by` chỉ `/generate-code` ghi, mà nó thấy row đã có code là skip — nên lối ra duy nhất là ép sinh lại code cho hàng loạt scenario đã làm xong. Đúng vòng lặp đóng mà `--realign` được viết ra để mở, chỉ ở một cột khác.*

`--reconcile-code` (không tham số → mọi row `LEDGER_BEHIND_CODE` **trong scope** của Step 0-A; dùng `--domain`/`--prd`/`--uc` để hẹp lại).

**Điền từ bằng chứng — 5 cột, không hơn:**

| Cột | Lấy từ đâu |
|---|---|
| `implemented_by` | tên class/hàm mang `@trace.implements` cho SC đó (nhiều file → nối bằng `,`, đúng khuôn `/generate-code` đang ghi) |
| `gen_ver` | copy `spec_ver` của **chính row đó** *(không phải version hiện tại của `.feature` — code sinh ra từ bản nào thì `spec_ver` lúc này là bản đó; Step 2 vừa đồng bộ nó)* |
| `fe_phase` | **`integrated`** nếu file code có wire adapter thật theo §4.5.4 · `ui` nếu còn `@trace.mock_for`/mock adapter · `—` cho `system`. **Không suy được** → để `—`, đừng đoán. *(Vocabulary chỉ có `ui` \| `integrated` — nhớ hậu tố **-ed**. Dạng không -ed thuộc về cờ `--phase=integration`, không phải cột này.)* |
| `test_count` · `test_classes` | **CHỈ khi `has_verifies` = true** (Step 2b đã thu). Số test + tên class lấy từ file mang `@trace.verifies`. `has_verifies` = false → **để trống**, tuyệt đối không điền 0-giả hay tên class phỏng đoán |

> ### ⚠️ Luật cứng: KHÔNG set `status`
>
> Điền xong 5 cột rồi **để Step 3 tự tính** `status`. Đây không phải chi tiết kỹ thuật — nó là điều
> quyết định lệnh này hữu ích hay có hại.
>
> Có **hai loại bằng chứng, hai người ghi**: `@trace.implements` = *"đã làm"* (do `/generate-code`) ·
> `@trace.verifies` = *"đã kiểm"* (do `/dev-gen-test`). **Không được suy cái này ra cái kia.**
>
> Đo trên một project thật: trong 910 row lệch, **446 có cả hai** ⇒ Step 3 tính ra `OK`; **464 chỉ
> có cái thứ nhất** ⇒ Step 3 tính ra `GAP`, tức **lộ ra 464 chỗ thiếu test** đang bị chữ `UNTRACKED`
> che. Nếu lệnh này tự viết `status = OK` thì 464 scenario chưa ai kiểm lên dashboard thành xong hết,
> và **cổng chặn PR — thứ tồn tại để bắt đúng loại lỗi này — mở cửa cho hàng chưa kiểm.**
>
> `/generate-code` đã phát biểu cùng luật này cho chính nó: *"`status` được tính bởi
> `/validate-traces` — không set ở đây."* Lệnh ghi bù cũng không được là ngoại lệ.

**Ba rào an toàn — bắt buộc, cùng khuôn Step 5e:**

1. **Chỉ chạm row đang `LEDGER_BEHIND_CODE`.** Từ chối mọi row khác. Row `DRIFT`/`ORPHANED`/`GAP`/`OK` đã có `implemented_by` — ghi lên đó là ghi đè việc của `/generate-code`, không phải ghi bù. In:
   ```
   ❌ Từ chối reconcile {sc_id}: row này đang {status}, không phải LEDGER_BEHIND_CODE.
      --reconcile-code chỉ điền vào row TRỐNG mà code đã có tag. Row này có chuyện khác.
   ```
2. **Chỉ ghi 5 cột trên.** **Guard sau-ghi:** đọc lại TSV, diff với bản trước; có bất kỳ ô nào **khác** ngoài 5 cột đã định (kể cả `status`, `last_updated` của row không thuộc phạm vi) → **khôi phục file** và dừng.
3. **In chính xác từng file + từng row đã sửa**, kèm cột nào điền giá trị gì và **bằng chứng nào**:
   ```
   📓 Đã ghi bù {n} row:
      {UC-ID}-{platform}.tsv:{dòng}  {sc_id}
        implemented_by ← {ClassName.method}      (từ {file}:{dòng})
        gen_ver        ← {spec_ver}
        fe_phase       ← {ui | integrated | —}
        test_count     ← {n} · test_classes ← {…}   (từ @trace.verifies ở {file})   [hoặc: bỏ trống — không có @trace.verifies]
   ```
   Ghi bù im lặng là ghi bù không kiểm chứng được.

**Không đụng** `dev_selftest`/`qc_status`/`qc_owner`/`qc_blocked_by`: luật G28 không áp vì **không có logic nào đổi** — code đã nằm đó từ trước, ta chỉ ghi lại sự thật vào sổ. Hạ tín hiệu nghiệm thu ở đây là trừng phạt một lượt dọn dẹp.

**Sau khi ghi, chạy tiếp Step 3 → Step 6 → Step 7 như thường** để `status` được tính lại và aggregate phản ánh số mới. In cảnh báo ở report:
```
ℓ Coverage sẽ NHẢY sau lượt này — code {cũ}% → {mới}%, test {cũ}% → {mới}%.
  Đây KHÔNG phải việc mới làm được: là việc đã làm rồi mà sổ chưa ghi. Và {n} row
  chuyển sang GAP là {n} chỗ thiếu test vừa lộ ra — phần "xấu đi" trên giấy chính
  là phần trước đó đang bị che.
```

### Step 5c — BDD version drift check

*Đối xứng với Step 4 (PRD drift). Trước đây tầng BDD là tầng DUY NHẤT không có cờ drift — dù `/generate-code` vẫn ghi `@trace.bdd_version` vào code và JSON report vẫn lưu nó. Dữ liệu có, chỉ thiếu phép so.*

**Chiều BDD → code.** Với mỗi UC × platform, so:
- `@trace.bdd_version` **hiện tại** của `.feature` (`bdd/{platform}/{UC-ID}*.feature`)
- `@trace.bdd_version` trong các file code implement UC đó

Code mang version cũ hơn → gắn cờ `BDD_DRIFT`. Kèm theo, liệt kê các SC của UC đó đang `DRIFT` (từ Step 3) để chỉ đúng chỗ cần regen — `bdd_version` nói "file đã đổi", `sc_version` nói "đổi ở SC nào".

> **Bổ trợ, không thay thế `sc_version`:** `sc_version` bắt thay đổi trong **thân scenario**. `bdd_version` bắt thay đổi ở **cấp file** mà `sc_version` không thấy: `Background`, `@trace.dataset`, khối BUSINESS DEFINITION, Popup/Modal Lifecycle, Display Logic Matrix, Coverage Matrix. Code sinh ra phụ thuộc cả hai.

**File code KHÔNG có tag `@trace.bdd_version`** (code sinh trước khi tag này bắt buộc) → không kết luận drift được. Đếm và in **một dòng** tổng hợp:
```
⚠️  {n} file thiếu tag @trace.bdd_version → drift detection mù ở các file này.
    Bổ sung tag khi sửa file lần tới (/review-code lăng kính Traceability sẽ bắt).
```

**Chiều BDD → tech-doc** *(chỉ report, cổng chặn nằm ở `/review-tech-docs`)*: đọc map `@trace.bdd_versions` của tech-doc gộp; platform nào có `.feature` **mới hơn** entry trong map → gắn cờ `TECHDOC_STALE_VS_BDD`. Đây là ca nguy hiểm hơn drift-về-code: `/generate-code` DS3 thấy tech-doc `approved` sẽ lấy shape §4 **nguyên văn** làm contract "đã chốt", nên contract dựng từ BDD cũ sẽ lan thẳng vào code.

### Step 5d — Design-spec drift check *(chỉ FE/App)*

*Bỏ qua hoàn toàn với `system`/backend — không có design-spec.*

*Đối xứng Step 5c. Design-spec là artifact upstream **cuối cùng** được đưa vào trace: nó điều khiển cả BDD FE/App (Screen States + AC-UI, xem `generate-bdd` §Design Spec — Gate & Load) lẫn code FE (màn hình, component inventory, link Figma frame), nhưng trước đây không có cột, không có tag, không có cờ. Nó **có** tự bảo vệ một chiều — `/generate-design-spec` reset `Status: draft` khi PRD đổi — nhưng chiều ngược lại (designer sửa design-spec SAU KHI BDD/code đã sinh) thì không gì bắt được.*

Đọc `| **Version** |` **hiện tại** từ Metadata design-spec tại `{paths.specs_dir}/{domain}/{prd-slug}/design-spec/{TICKET-ID}-design-spec-{platform}-{slug}.md` *(`app-ios`/`app-android` không có bản riêng → fallback bản `-app-`)*.

**Chiều design-spec → BDD.** So với cột `design_spec_version` của TSV:
- Cột **cũ hơn** → `DESIGNSPEC_STALE_VS_BDD` 🟠. BDD FE/App dựng từ design-spec cũ → có thể thiếu Screen State / AC-UI vừa thêm. Route: `/generate-bdd {prd-file}`.

**Chiều design-spec → code.** So với tag `@trace.design_spec_version` trong các file code FE implement UC đó:
- Tag **cũ hơn** → `DESIGNSPEC_DRIFT` 🟠. Route: `/generate-code {feature-file}`.

**Không kết luận khi thiếu đầu so:**
- Cột `design_spec_version` = `—` (TSV cũ, hoặc BDD sinh khi chưa có design-spec) → skip chiều BDD.
- File code FE **không có** tag `@trace.design_spec_version` (sinh trước khi tag này tồn tại) → skip chiều code, và đếm gộp **một dòng** — y hệt cách Step 5c xử `@trace.bdd_version` thiếu:
  ```
  ⚠️  {n} file FE thiếu tag @trace.design_spec_version → drift detection mù ở các file này.
      Bổ sung khi sửa file lần tới (/review-code lăng kính Traceability sẽ bắt).
  ```
- Không tìm thấy file design-spec → skip im lặng (feature có thể chưa cần design-spec; `/generate-bdd` đã cảnh báo mềm ở chỗ của nó).

### Step 5b — Seam & Stub Audit (mồ côi khi ghép luồng)

*Bắt lỗi "gen từng BDD thì đúng, ghép cả luồng thì hỏng": chỗ giả lập còn rỗng trong khi hàng thật đã tồn tại ở nơi khác — luồng chạy vào no-op / hàm thật không ai gọi. Build vẫn xanh, test từng-UC vẫn xanh, nên không cổng nào khác bắt được. Hai loại: `seam` (port cross-UC chưa nối) và `stub` (method trắng nội-feature chưa lấp).*

**Nguồn (dùng cái nào có, hợp nhất):**
1. Sổ chung `{trace_dir}/{domain}/{prd-slug}/_seams.tsv` — do `/generate-code` ghi (cột `kind` phân biệt `seam`/`stub`).
2. Quét code dưới `{code_base_package}` (từ CLAUDE.md §2 đã nạp) — bắt cả chỗ sinh **trước khi** có sổ:
   - **seam:** class mang `@trace.seam_pending` HOẶC tên khớp `*Stub*Adapter`.
   - **stub:** method mang `@trace.stub` (thân còn placeholder — `throw UnsupportedOperationException` / TODO / rỗng).

**Audit A — Seam (port cross-UC).** Với mỗi seam:
- Tìm **hàng thật**: class KHÁC (không `*Stub*`/`*Mock*`) implement cùng port/interface dưới `{code_base_package}`.
- Tìm **binding hiện tại**: stub có còn được tham chiếu như adapter đang dùng không (được inject / `@Primary` / đăng ký trong config) — hàng thật thì KHÔNG có đường vào?

| Điều kiện | Cờ | Ý nghĩa |
|---|---|---|
| Hàng thật CHƯA tồn tại | `SEAM_PENDING` | Bình thường — owner UC chưa gen. Chỉ nhắc. |
| Hàng thật ĐÃ tồn tại **và** stub vẫn là binding đang dùng | `SEAM_UNWIRED` 🔴 | **Lỗi thật** — hàng thật mồ côi, luồng chạy vào stub rỗng. |
| Binding đã trỏ hàng thật (stub chỉ còn cho test) | *(sạch)* | Đã nối xong. |

**Audit B — Stub (method trắng nội-feature).** Với mỗi method còn tag `@trace.stub`:
- Đọc `@trace.stub_owner` (UC lẽ ra phải lấp) + `@trace.stub_for` (trách nhiệm).
- **Owner đã gen chưa?** = có bất kỳ `@trace.implements={stub_owner}-*` nào trong codebase không.
- **Có hàng thật song song không?** = method KHÁC mang `@trace.implements` với thân thật cùng trách nhiệm `stub_for` (dấu hiệu BDD owner đã đẻ hàm song song thay vì lấp).

| Điều kiện | Cờ | Ý nghĩa |
|---|---|---|
| `stub_owner` chưa gen **và** không có hàng song song | `STUB_PENDING` | Bình thường — owner BDD chưa chạy. Chỉ nhắc. |
| `stub_owner` ĐÃ gen (hoặc có method song song cùng `stub_for`) mà method vẫn còn `@trace.stub` rỗng | `STUB_UNRESOLVED` 🔴 | **Lỗi thật** — hàm trắng mồ côi (caller chạy vào rỗng) và/hoặc hàm thật mồ côi (không ai gọi). Fill-before-create đã trượt. |
| Không còn method nào mang `@trace.stub` cho trách nhiệm đó | *(sạch)* | Đã lấp xong. |

- **Cập nhật sổ `_seams.tsv`** (nếu tồn tại). **Khớp dòng theo khoá `(kind, name, consumer_uc)`** — `name` là tên port (seam) hoặc trách nhiệm (stub). *Không khớp theo `artifact`: class/method stub có thể được đổi tên hoặc di chuyển giữa hai lần chạy, lúc đó ta sẽ append dòng mới thay vì cập nhật dòng cũ và sổ đẻ ra bản ghi ma.* Cập nhật `status` + `last_updated`; giữ nguyên `owner_uc`/`binding` (do `/generate-code` sở hữu). Theo `kind`:
  - `seam`: `PENDING`→`READY` khi hàng thật xuất hiện mà chưa nối; `→RESOLVED` khi binding đã trỏ hàng thật.
  - `stub`: `PENDING`→`READY` khi phát hiện `STUB_UNRESOLVED`; `→RESOLVED` khi method đã được lấp (hết `@trace.stub`).
  `READY` = đồng nghĩa cờ 🔴 tương ứng (`SEAM_UNWIRED` / `STUB_UNRESOLVED`).

Không tìm thấy seam/stub nào → bỏ qua im lặng.

### Step 6 — Ghi status lại vào TSV

*Bỏ qua step này nếu không có file TSV nào (đã xử lý bởi path no-TSV của Step 1).*

Với mỗi file `.tsv` đã xử lý: ghi `spec_ver`, `status`, `last_updated` đã cập nhật lại disk.
Đồng thời **đồng bộ `uc_status` ← `@trace.status`** của file `.feature` tương ứng (header `.feature` là nguồn-sự-thật về duyệt BDD — người đặt `approved` sau khi review sạch, giống PO đặt PRD Metadata `Status`). Nhờ vậy `approved_ucs` trên dashboard phản ánh đúng thay vì luôn = 0.
Và **đồng bộ `prd_status` ← `| **Status** |`** của PRD tương ứng (`{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md`) — đối xứng với `uc_status`: PRD Metadata là nguồn-sự-thật về duyệt PRD. Không có bước này thì `prd_status` là **write-once** (chỉ `/generate-bdd` ghi một lần) và sẽ giữ `approved` vĩnh viễn sau khi `/refine-prd` hay `/review-context --fix` reset PRD về `draft`. *(Step 4 đã đọc file PRD này rồi — không phát sinh I/O.)*
**Đừng** sửa `dev_selftest`/`dev_selftest_at` (do `/dev-run-test` sở hữu) hay `qc_status`/`qc_run_at`/`qc_owner`/`qc_blocked_by` (do `/qc-run-test` + `/report-bug` sở hữu); lệnh này chỉ đọc chúng cho report.

### Step 6b — Ghi mốc `spec_baseline` cho lần audit sau

*Đây là **nửa GHI** của check ở Step 3.9. Thiếu nó thì cờ `PRD_UNTRACKED_EDIT` **không bao giờ bật** — và mọi rule khác vẫn ✅, vì R6 chỉ canh "giá trị enum có xuất hiện" và R7 chỉ canh "cờ có counter". `self-check` R13 canh đúng nửa này.*

Với **mỗi** file PRD trong phạm vi lần chạy này, ghi một entry vào khối `spec_baseline` của `trace-report.json` (Step 8):

| Key | Giá trị |
|---|---|
| `prd_path` | path tương đối tới file PRD trong specs repo |
| `sha_at_audit` | `git -C {specs repo} rev-parse HEAD` — commit tại thời điểm audit |
| `version_at_audit` | `\| **Version** \|` hiện tại của PRD |

Không phải git repo / `git` không khả dụng → ghi `sha_at_audit: null` và **vẫn ghi** `version_at_audit` (lần sau Step 3.9 sẽ báo đang mù, không im lặng).

> **Ghi mốc là thao tác cuối, sau khi đã phán xong.** Ghi trước thì một lần chạy bị ngắt giữa đường sẽ để lại mốc mới mà chưa phán gì — và lần sau so với mốc đó thì thay đổi trong khoảng đó **biến mất khỏi tầm quan sát vĩnh viễn**.

### Step 7 — Tính aggregate cho dashboard

```
total_prds       = count distinct PRD files in {paths.specs_dir}/{domain}/*/*.md  (file .md ở gốc mỗi feature folder = PRD)
approved_prds    = PRDs with | Status | approved
total_ucs        = count distinct UC-IDs across all .tsv files (strip the -{platform} suffix from the filename)
approved_ucs     = UCs with uc_status == approved
draft_ucs        = UCs with uc_status == draft
total_scs        = rows across all .tsv files WHERE status != ORPHANED
                   # (a UC's SCs are counted per platform — no cross-platform dedupe by sc_id)
                   # ORPHANED bị LOẠI khỏi mẫu số: nó không còn là scope nữa (scenario đã bị xoá
                   # khỏi .feature). Tính vào mẫu số sẽ bóp méo coverage theo hướng xấu đi vì một
                   # thứ không ai cần implement. Nó được đếm riêng ở orphaned_count + cờ 🔴.
code_coverage    = rows where implemented_by != — / total_scs
test_coverage    = rows where test_count > 0 / total_scs
drift_count      = rows where status == DRIFT
untracked_count  = rows where status == UNTRACKED
gap_count        = rows where status == GAP
fe_on_mock       = rows where fe_phase == ui          # FE đã có UI nhưng CÒN DÙNG MOCK — chưa wire API thật
fe_integrated    = rows where fe_phase == integrated  # FE đã wire adapter thật theo tech-doc §4.5.4
# fe_phase trả lời câu của PM: "màn nào demo được nhưng chưa nối backend?". Row `ui` là
# công việc CHƯA XONG dù status có thể đã là OK (có code + có test trên mock).
orphaned_count   = rows where status == ORPHANED     # code còn, scenario đã bị xoá khỏi .feature (Step 2b/Rule 0)
trace_orphan_count = số tag @trace.implements/@trace.verifies trỏ vào SC không tồn tại VÀ không có row TSV (Step 2b)
ledger_behind_code_count = số row có @trace.implements trong code mà cột implemented_by còn trống
                   (Step 2b câu B). 🟠 — "làm rồi mà không ghi sổ". Sạch bằng --reconcile-code.
                   # KHÔNG vào gate.blocking, và đây là quyết định có chủ ý — đừng "sửa":
                   #   (1) gate.blocking nghĩa hẹp là CODE ĐANG HỎNG. Ở đây code hoàn toàn đúng
                   #       và đang chạy; chỉ có sổ nói sai về nó. Cùng ranh giới mà R9(e) giữ.
                   #   (2) Nợ tồn khi mới bật: mọi project đang chạy đều đã có sẵn hàng trăm row
                   #       loại này (đo thật: 504 scenario / 910 row ở một project) ⇒ cờ chặn mới
                   #       sẽ đỏ khắp nơi ở lần đầu ⇒ người ta tắt cổng ⇒ mất luôn 4 cờ 🔴 thật.
                   #   (3) Nhưng nó vẫn PHẢI thấy được: in mỗi lần chạy + counter ở summary, và
                   #       bản xác định của cùng phép kiểm là lint-trace T14 (cũng WARN).
                   # Team nào đã dọn sạch nợ tồn thì tự thêm counter này vào gate.blocking kèm
                   # `why` — self-check R13(e) canh việc đó.
prd_untracked_edit_count = số file PRD có nội dung đổi kể từ `sha_at_audit` mà `Version` KHÔNG đổi
                   (Step 3.9). 🔴 — có người sửa ngoài đường chính thức, nên MỌI phán đoán version
                   của Step 4/5 trên file đó đang dựa vào một nhãn không còn đúng.
prd_drift_count  = số UC bị cờ PRD_DRIFT (lệch version VÀ changelog nêu UC này — Step 4)
prd_stale_ref_count = số UC bị cờ PRD_STALE_REF (lệch version nhưng changelog KHÔNG nêu UC này —
                   nội dung không đổi, chỉ con trỏ cũ). ⓘ không phải lỗi; sạch bằng --realign-prd-version
techdoc_stale_ref_count = số UC bị cờ TECHDOC_STALE_REF (đối xứng, Step 5)
bdd_drift_count  = số UC×platform bị cờ BDD_DRIFT (code mang @trace.bdd_version cũ hơn .feature — Step 5c)
techdoc_drift_count = số UC bị cờ TECHDOC_DRIFT (code sinh từ tech_doc_revision cũ hơn @trace.revision — Step 5)
fe_techdoc_drift_count = số UC×platform bị cờ FE_TECHDOC_DRIFT (FE wire theo fe_tech_doc_revision cũ — Step 5)
techdoc_stale_vs_bdd_count = số platform mà tech-doc dựng từ bdd_version cũ hơn .feature hiện tại (Step 5c)
designspec_drift_count = số UC×platform FE bị cờ DESIGNSPEC_DRIFT (code FE mang design_spec_version cũ hơn — Step 5d)
designspec_stale_vs_bdd_count = số UC×platform FE mà BDD dựng từ design-spec cũ hơn bản hiện tại (Step 5d)
by_service       = map {service → {total_scs, coded_scs, tested_scs, drift_count}} — gom theo cột `service` (cột 23)
                   # Trả lời câu số MỘT của dự án nhiều đội: "đội nào còn bao nhiêu việc".
                   # Trước khi có cột 23, trace gộp (spec_source) KHÔNG mang thông tin sở hữu ở
                   # cấp row nên câu này không trả lời được. Bỏ qua map này ở single-service.
by_platform      = map {platform → {total_scs, coded_scs, tested_scs, drift_count}} — gom theo
                   platform (lấy từ TÊN FILE sổ `{UC-ID}-{platform}.tsv`, cùng nguồn với field
                   `platform` của mỗi scenario ở Step 8)
                   # CHỈ tạo ô cho platform THỰC SỰ có scenario — dự án chỉ có `web` thì chỉ một ô.
                   # Trả lời "web xong bao nhiêu %, system xong bao nhiêu %" — câu thường ngày khi
                   # làm FE và BE song song. Trước đó KHÔNG trả lời được từ `summary`: `by_service`
                   # là bảng chia nhóm DUY NHẤT, mà cột `service` là `—` ở mọi row của dự án
                   # single-service ⇒ nó gộp tất cả vào MỘT ô, và platform hoàn toàn vô hình.
                   # Đây là hình dạng của G33: dữ liệu có ở cấp row (G48 vừa thêm `platform` vào
                   # từng scenario) nhưng KHÔNG có ô tổng ⇒ dashboard chỉ đọc `summary` thì mù.
                   # Bắt dashboard tự duyệt prds[].ucs[].scenarios[] mà cộng lại chính là cái bẫy
                   # G33 đã chỉ ra: người viết dashboard đọc `summary`, thấy đủ, rồi tưởng xong.
                   # KHÔNG thay `by_service` — hai TRỤC khác nhau, cùng hữu ích ở umbrella nhiều đội.
seam_unwired_count = số seam bị cờ SEAM_UNWIRED (hàng thật đã có nhưng consumer còn wire vào stub — Step 5b)
seam_pending_count = số seam bị cờ SEAM_PENDING (owner UC chưa gen — ⓘ chưa phải lỗi; PM dùng để xếp thứ tự gen)
stub_unresolved_count = số stub bị cờ STUB_UNRESOLVED (method còn trắng dù owner đã gen / có hàm song song — Step 5b)
stub_pending_count = số stub bị cờ STUB_PENDING (owner BDD chưa gen — ⓘ chưa phải lỗi)
service_unrouted_count = số row có `service` ∈ (unrouted, unresolved) SAU khi đã phân giải lại ở
                   Step 2c. 🟠 KHÔNG chặn PR — "chưa ai quyết repo" là trạng thái hợp lệ ở feature
                   đầu tiên của một domain mới, không phải code hỏng. Nhưng phải NHÌN THẤY ĐƯỢC:
                   không có counter thì `unrouted` đọng lại vĩnh viễn và `by_service` có một ô rác
                   mà không ai để ý — đúng bệnh `TBD` (G51).
# LUẬT (rules/workflow.md §Trace Contract): MỌI giá trị trong vocabularies.audit_flags phải có
# một counter {flag_lowercase}_count ở đây VÀ trong summary của JSON. bin/self-check.js R7 ép
# điều này — thiếu counter = cờ không quan sát được ở tầng tổng hợp, dashboard không thấy.
dev_selftest_passing = rows where dev_selftest == pass
dev_selftest_failing = rows where dev_selftest == fail
dev_selftest_not_run = rows where dev_selftest in (not_run, —)
# NOTE: dev_selftest is the DEV self-check signal (did the dev run their own smoke tests),
# NOT official coverage — keep it labeled as such on the dashboard.
qc_passing       = rows where qc_status == pass
qc_failing       = rows where qc_status == fail
qc_skipped       = rows where qc_status == skip
qc_not_run       = rows where qc_status in (not_run, —)
# qc_status is the OFFICIAL QC automation result (set by /qc-run-test),
# shown alongside — never merged with — dev_selftest.
waiting_dev      = rows where qc_owner == dev      # PM view: QC-found, waiting on dev to fix
waiting_po       = rows where qc_owner == po       # PM view: blocked, waiting on PO to confirm/clarify
# qc_owner + qc_blocked_by trả lời "case nào đang chờ ai" — surface as a "Waiting on" column.
tech_docs_count  = count .md files in {paths.tech_docs_dir}/{domain}/*/tech-docs/
```

### Step 7b — Hàng đợi yêu cầu đổi PRD còn treo

*Không phải trạng thái trace — nhưng đây là hàng đợi DUY NHẤT trong framework không có lệnh nào quét lại nó, nên nó cần một chỗ để không chìm. Chọn lệnh này vì nó được chạy thường xuyên nhất.*

Quét `{paths.prd_change_requests_dir}/*.md` (mặc định `{spec_source}/feedback/prd-change-requests/`; **không** quét `archived/`). Thư mục không tồn tại hoặc rỗng → bỏ qua **im lặng**, không in gì.

Với mỗi file, đọc metadata: `UC / Ticket`, `Status`, và tiêu đề. Chỉ giữ `Status: Open` (bỏ qua `incorporated` / `rejected`).

Tính `days_waiting` = số ngày từ ngày file được tạo tới hôm nay. Nguồn ngày, theo thứ tự ưu tiên: (1) field ngày trong metadata nếu có · (2) `git -C {REPO} log --diff-filter=A --format=%ad --date=short -1 -- {file}` · (3) không lấy được → để `—`, đừng đoán.

Lưu danh sách này cho §Output. **Không** ghi nó vào `trace-report.json` — nó không phải trạng thái trace, và JSON là contract với panel VS Code.

> **Vì sao cần bước này:** ba hàng đợi feedback thì hai cái đã có người quét lại mỗi lần chạy — `/fix-bug` đọc `bug-reports/`, `/generate-bdd` quét `bdd-proposals/`. Riêng `prd-change-requests/` không có ai. Chỗ duy nhất nó từng xuất hiện là `/sync` Step 1d, mà Step 1d chỉ hiện những gì về **trong đúng lần pull đó** (`{old_sha}..{new_sha}`) — bỏ lỡ một lần là mất khỏi màn hình vĩnh viễn. Đây là loại yêu cầu **không cờ trace nào bắt được**: nó nói về hành vi chưa có AC nào phủ, nên theo mọi thước đo coverage thì nó không tồn tại.

### Step 8 — Ghi JSON report

Ghi `{paths.trace_dir}/trace-report.json` (ghi đè nếu tồn tại). File này là source of truth duy nhất cho web dashboard — nó chứa snapshot đầy đủ tại thời điểm `/validate-traces` chạy lần cuối.

Schema:

```json
{
  "generated_at": "<ISO-8601 timestamp>",
  "scope": {
    "kind": "all | domain | prd | uc",
    "value": "<giá trị scope, hoặc 'all'>"
  },
  "domain": "<domain trong scope, hoặc 'all'>",
  "summary": {
    "total_prds": 0,
    "approved_prds": 0,
    "total_ucs": 0,
    "approved_ucs": 0,
    "draft_ucs": 0,
    "total_scs": 0,
    "coded_scs": 0,
    "tested_scs": 0,
    "code_coverage_pct": 0,
    "test_coverage_pct": 0,
    "drift_count": 0,
    "gap_count": 0,
    "untracked_count": 0,
    "fe_on_mock": 0,
    "fe_integrated": 0,
    "orphaned_count": 0,
    "trace_orphan_count": 0,
    "ledger_behind_code_count": 0,
    "prd_untracked_edit_count": 0,
    "prd_drift_count": 0,
    "prd_stale_ref_count": 0,
    "bdd_drift_count": 0,
    "techdoc_drift_count": 0,
    "techdoc_stale_ref_count": 0,
    "fe_techdoc_drift_count": 0,
    "techdoc_stale_vs_bdd_count": 0,
    "designspec_drift_count": 0,
    "designspec_stale_vs_bdd_count": 0,
    "seam_unwired_count": 0,
    "seam_pending_count": 0,
    "stub_unresolved_count": 0,
    "stub_pending_count": 0,
    "service_unrouted_count": 0,
    "dev_selftest_passing": 0,
    "dev_selftest_failing": 0,
    "dev_selftest_not_run": 0,
    "qc_passing": 0,
    "qc_failing": 0,
    "qc_skipped": 0,
    "qc_not_run": 0,
    "waiting_dev": 0,
    "waiting_po": 0,
    "tech_docs_count": 0,
    "by_service": {
      "<service path, e.g. user-service>": {
        "total_scs": 0, "coded_scs": 0, "tested_scs": 0, "drift_count": 0
      }
    },
    "by_platform": {
      "<platform — web | app | system | webview | … ; CHỈ platform thực sự có scenario>": {
        "total_scs": 0, "coded_scs": 0, "tested_scs": 0, "drift_count": 0
      }
    }
  },
  "prds": [
    {
      "prd_id": "<e.g. PAY>",
      "prd_status": "approved | draft | other",
      "total_scs": 0,
      "coded_scs": 0,
      "tested_scs": 0,
      "drift_count": 0,
      "gap_count": 0,
      "untracked_count": 0,
      "ucs": [
        {
          "uc_id": "<e.g. PAY-UC01>",
          "uc_status": "approved | draft | other",
          "scenarios": [
            {
              "sc_id": "<e.g. PAY-UC01-SC1>",
              "platform": "web | app | system | webview | …",
              "sc_title": "<title>",
              "spec_ver": "<current version from .feature>",
              "gen_ver": "<version at codegen time>",
              "implemented_by": "<ClassName.method or null>",
              "test_count": 0,
              "test_classes": ["<TestClass1>", "<TestClass2>"],
              "dev_selftest": "pass | fail | not_run",
              "dev_selftest_at": "<YYYY-MM-DD or null>",
              "qc_status": "pass | fail | skip | not_run",
              "qc_run_at": "<YYYY-MM-DD or null>",
              "qc_owner": "dev | po | null",
              "qc_blocked_by": "<BUG-id / GAP-id or null>",
              "prd_version": "<prd version when BDD was generated>",
              "bdd_version": "<bdd version when code was generated>",
              "tech_doc_revision": 0,
              "fe_tech_doc_revision": 0,
              "service": "<đội/submodule sở hữu — cột 23; null nếu '—'>",
              "design_spec_version": "<version design-spec lúc sinh BDD — cột 24; null nếu '—'>",
              "status": "OK | DRIFT | GAP | UNTRACKED",
              "orphaned": false,
              "last_updated": "<YYYY-MM-DD>"
            }
          ]
        }
      ]
    }
  ],
  "spec_baseline": [
    {
      "prd_path": "<specs/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md>",
      "sha_at_audit": "<git rev-parse HEAD của specs repo, hoặc null nếu không phải git repo>",
      "version_at_audit": "<Version của PRD tại thời điểm audit>"
    }
  ],
  "issues": {
    "prd_untracked_edit": [
      {
        "prd_path": "<specs/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md>",
        "version": "<Version hiện tại — KHÔNG đổi kể từ lần audit>",
        "sha_at_audit": "<commit lần audit trước>",
        "evidence": "git diff | git status | cả hai",
        "affected_ucs": ["<mọi UC của PRD này — không suy đoán được ai bị đụng>"],
        "fix": "bump Version + ghi row changelog nêu UC bị ảnh hưởng (đó là việc /amend-prd làm hộ). KHÔNG có --accept-edit: dán nhãn lên thay đổi chưa ai xem là đúng cái rào của --realign tồn tại để chặn."
      }
    ],
    "drift": [
      {
        "sc_id": "<SC-ID>",
        "sc_title": "<title>",
        "spec_ver": "<current>",
        "gen_ver": "<at codegen>",
        "fix": "/generate-code <UC-ID>"
      }
    ],
    "gap": [
      {
        "sc_id": "<SC-ID>",
        "sc_title": "<title>",
        "implemented_by": "<method>",
        "fix": "/dev-gen-test <UC-ID>"
      }
    ],
    "untracked": [
      {
        "sc_id": "<SC-ID>",
        "sc_title": "<title>",
        "fix": "/generate-code <UC-ID>"
      }
    ],
    "prd_version_drift": [
      {
        "uc_id": "<UC-ID>",
        "current_prd_version": "<version in PRD file — mốc so sánh>",
        "tsv_prd_version": "<cột prd_version của TSV — version lúc sinh BDD>",
        "code_prd_version": "<tag @trace.prd_version trong code — version lúc sinh code>",
        "drifted_layers": ["tsv", "code"],
        "changelog_since": ["<v1.1: ...>", "<v1.2: ...>"],
        "in_changelog_scope": true,
        "fix": "chỉ [\"tsv\"] → /generate-bdd <prd-file> là đủ · có \"code\" → /generate-bdd rồi /generate-code <UC-ID>"
      }
    ],
    "prd_stale_ref": [
      {
        "uc_id": "<UC-ID>",
        "current_prd_version": "<version PRD file>",
        "tsv_prd_version": "<cột prd_version>",
        "code_prd_version": "<tag trong code>",
        "drifted_layers": ["code"],
        "changelog_since": ["<v2.0: thêm UC7 — không đụng UC1>"],
        "in_changelog_scope": false,
        "fix": "/validate-traces --realign-prd-version <UC-ID>   (chỉ sửa dòng nhãn, KHÔNG đụng logic)"
      }
    ],
    "techdoc_stale_ref": [
      {
        "uc_id": "<UC-ID>",
        "current_revision": 0,
        "code_revision": 0,
        "in_changelog_scope": false,
        "fix": "/validate-traces --realign-techdoc-revision <UC-ID>"
      }
    ],
    "bdd_drift": [
      {
        "uc_id": "<UC-ID>",
        "platform": "web | app | system | webview | …",
        "code_bdd_version": "<@trace.bdd_version trong code>",
        "current_bdd_version": "<@trace.bdd_version của .feature>",
        "drifted_scs": ["<SC đang DRIFT của UC này>"],
        "fix": "/generate-code <feature-file>"
      }
    ],
    "techdoc_stale_vs_bdd": [
      {
        "uc_id": "<UC-ID>",
        "platform": "web | app | system | webview | …",
        "techdoc_bdd_version": "<entry trong map @trace.bdd_version của tech-doc>",
        "current_bdd_version": "<@trace.bdd_version của .feature>",
        "fix": "/generate-tech-docs <feature-file> then /review-tech-docs"
      }
    ],
    "designspec_drift": [
      {
        "uc_id": "<UC-ID>",
        "platform": "web | app",
        "code_design_spec_version": "<@trace.design_spec_version trong code FE>",
        "current_design_spec_version": "<| **Version** | của design-spec>",
        "fix": "/generate-code <feature-file>"
      }
    ],
    "designspec_stale_vs_bdd": [
      {
        "uc_id": "<UC-ID>",
        "platform": "web | app",
        "bdd_design_spec_version": "<cột design_spec_version của TSV>",
        "current_design_spec_version": "<| **Version** | của design-spec>",
        "fix": "/generate-bdd <prd-file>  — BDD có thể thiếu Screen State / AC-UI vừa thêm"
      }
    ],
    "orphaned": [
      {
        "sc_id": "<SC-ID đã bị xoá khỏi .feature>",
        "platform": "web | app | system | webview | …",
        "implemented_by": "<ClassName.method còn tồn tại>",
        "test_classes": ["<test còn trỏ vào SC này>"],
        "fix": "xoá code + test, HOẶC đưa scenario trở lại .feature"
      }
    ],
    "trace_orphan": [
      {
        "tag": "@trace.implements | @trace.verifies",
        "sc_id": "<SC-ID không tồn tại>",
        "file": "<file mang tag>",
        "fix": "sửa sc_id cho đúng SC hiện có, HOẶC xoá code/test nếu không còn cần"
      }
    ],
    "ledger_behind_code": [
      {
        "sc_id": "<SC-ID>",
        "platform": "web | app | system | webview | …",
        "files": ["<file code mang @trace.implements cho SC này>"],
        "has_verifies": false,
        "would_become": "OK | GAP",
        "fix": "/validate-traces --reconcile-code   (điền implemented_by/gen_ver/fe_phase từ tag; test_count CHỈ khi có @trace.verifies; KHÔNG set status)"
      }
    ],
    "techdoc_drift": [
      {
        "uc_id": "<UC-ID>",
        "code_revision": 0,
        "current_revision": 0,
        "fix": "changelog KHÔNG nêu UC này → /validate-traces --realign-techdoc-revision <UC-ID> (rẻ, không đụng logic) · changelog CÓ nêu → /generate-code <UC-ID> --force"
      }
    ],
    "fe_techdoc_drift": [
      {
        "uc_id": "<UC-ID>",
        "platform": "web | app",
        "code_revision": 0,
        "current_revision": 0,
        "fix": "changelog KHÔNG nêu UC này → /validate-traces --realign-techdoc-revision <UC-ID> · CÓ nêu → /generate-code <UC-ID> --phase=integration --force"
      }
    ],
    "seam_unwired": [
      {
        "port": "<PortName>",
        "consumer_uc": "<UC còn gọi stub>",
        "owner_uc": "<UC sở hữu hàng thật>",
        "stub_class": "<StubClass>",
        "real_class": "<RealClass>",
        "fix": "Trỏ binding của <consumer_uc> sang <RealClass> (xoá/thay stub), build lại"
      }
    ],
    "service_unrouted": [
      {
        "sc_id": "<SC-ID>",
        "platform": "web | app | system | webview | …",
        "domain": "<domain của PRD>",
        "value": "unrouted | unresolved",
        "reason": "<lý do context-loader đã ghi — vd: domain chưa có entry trong services:>",
        "fix": "thêm mapping cho domain <domain> vào services: của .agent/project-context.yaml, rồi chạy lại /validate-traces (nó tự nâng unrouted → path). KHÔNG cần sinh lại BDD."
      }
    ],
    "stub_unresolved": [
      {
        "artifact": "<ClassName#method>",
        "stub_for": "<trách nhiệm>",
        "consumer_uc": "<UC để trắng>",
        "owner_uc": "<UC lẽ ra phải lấp>",
        "parallel_impl": "<ClassName#method hàm song song, hoặc null>",
        "fix": "/generate-code <owner_uc> — lấp logic vào <ClassName#method> tại chỗ (Fill-before-create), xoá hàm song song nếu có, build lại"
      }
    ]
  }
}
```

**Rules:**
- **`by_platform` là bắt buộc** (nếu có ít nhất một scenario). Cùng hình dạng `by_service`, khoá **động** — một ô cho mỗi platform tìm thấy, không phải một ô cố định cho mỗi giá trị vocabulary. Thêm platform thứ tư vào vocabulary thì nó tự có ô, không cần sửa gì ở đây.
  > Đây là lý do `by_platform` **không cần** một rule `self-check` riêng: khác cờ audit (mỗi cờ cần một counter mang tên riêng, nên R7 phải canh từng cái), ở đây không có gì để lệch.
- **`platform` (bắt buộc, mỗi scenario):** lấy từ **tên file sổ** `{UC-ID}-{platform}.tsv` — Step 2 đã đọc nó để tìm đúng `.feature`. Giá trị: `web` | `app` | `system`.
  > **Vì sao bắt buộc (G48):** `sc_id` **một mình không định danh được** một scenario. Chính Step 2 phát biểu điều đó: *"sc_id trùng số giữa các platform là 2 scenario khác nhau"*. Sổ TSV giải quyết bằng tên file; JSON thì làm phẳng mọi platform vào chung một cây `scenarios[]`, nên thiếu field này thì `AUTH-UC1-SC1` của web và của app **không phân biệt được** — panel hiện trùng lặp hoặc đè nhau, và không ai trả lời được *"SC1 của app xong chưa"*.
  > Bất đối xứng cũ: `issues.orphaned[]` và `issues.fe_techdoc_drift[]` **đã** mang `platform`; chỉ cây dữ liệu chính là không.
- `implemented_by`: dùng `null` (không phải `"—"`) trong JSON khi không có giá trị
- `test_count`: dùng integer `0` (không phải `"—"`) khi không có test
- `test_classes`: dùng `[]` (không phải `"—"`) khi không có test class
- `tech_doc_revision` / `fe_tech_doc_revision`: dùng integer; `0` nếu chưa sinh
- `code_coverage_pct` / `test_coverage_pct`: làm tròn về integer gần nhất (0–100)
- **`status` trong JSON CỐ TÌNH chỉ có 4 giá trị** `OK`/`DRIFT`/`GAP`/`UNTRACKED` — KHÔNG ghi `ORPHANED` vào field này. VS Code extension "Spec Driven Docs Tools" (sống **ngoài** repo này) switch trên `status`; thêm giá trị thứ 5 sẽ rơi vào nhánh không khớp và có thể làm row mất khỏi panel.
  Row `ORPHANED` xuất ra JSON là: `"status": "DRIFT"` + `"orphaned": true`. Panel chưa hỗ trợ vẫn hiện nó như `DRIFT` — đủ đúng về nghĩa ("code không khớp spec, cần xử lý") và **không im lặng**; panel có đọc `orphaned` thì hiện nhãn riêng. Chi tiết đầy đủ luôn có ở `orphaned[]` và ở report terminal.
  **TSV giữ nguyên chữ `ORPHANED`** trong cột `status` — TSV là nguồn-sự-thật, JSON chỉ là bản xuất cho panel.
- `orphaned` (boolean): `true` chỉ khi cột `status` của TSV là `ORPHANED`; mọi row khác ghi `false` (đừng bỏ trống — panel đọc field vắng dễ ra `undefined`).
- Luôn ghi vào `{paths.trace_dir}/trace-report.json` bất kể phạm vi — nếu có scope, chỉ gồm các PRD/UC đó trong `prds[]`, và ghi **cả hai** field:
  - **`scope`** = `{kind, value}` từ Step 0-A. Đây là field `gate-trace` dùng để quyết chặn — xem dưới.
  - **`domain`** = domain trong scope (`--domain` → chính nó · `--prd`/`--uc` → domain phân giải được · không scope → `all`). Giữ cho **tương thích ngược** với `gate-trace` bản cũ.

  > ⚠️ **Biên bản có scope KHÔNG BAO GIỜ được coi là biên bản đầy đủ.** `gate-trace` G2 fail nếu `scope.kind !== "all"`, **không ngoại lệ** — nó không nhìn xem trên đĩa có bao nhiêu domain. Vì sao tuyệt đối: bản cũ hỏi *"còn domain nào khác không"*, nên trong repo **một domain** thì `others` là **rỗng** ⇒ không fail ⇒ một biên bản hẹp-theo-PRD được nhận là *"toàn bộ"*. Đó đúng là *"cấp giấy xanh cho thứ chưa ai xem"* mà chú thích của chính gate cảnh báo. Thêm cờ scope mà không siết G2 là biến cổng thành **sân khấu** — đúng cái G39 dựng lên để chống.
- **TSV `"—"` mapping**: khi đọc file TSV, map giá trị dash sang kiểu JSON: `implemented_by: "—"` → `null`; `test_count: "—"` → `0`; `test_classes: "—"` → `[]`; `tech_doc_revision: "—"` → `0`; `fe_tech_doc_revision: "—"` → `0`; `dev_selftest: "—"` → `"not_run"`; `dev_selftest_at: "—"` → `null`; `qc_status: "—"` → `"not_run"`; `qc_run_at: "—"` → `null`; `qc_owner: "—"` → `null`; `qc_blocked_by: "—"` → `null`; `service: "—"` → `null`; `design_spec_version: "—"` → `null`
- **Backward-compat:** TSV cũ có thể thiếu cột mới hơn trong header — coi cột vắng nào là giá trị rỗng của nó (**đừng báo lỗi, đừng bỏ qua cả file**): `qc_owner`/`qc_blocked_by` (pre-19-col) → `null`; `fe_tech_doc_revision` (pre-22-col) → `0`; `service`/`design_spec_version` (pre-24-col) → `null`. Lần `/generate-bdd` gen lại tiếp theo nâng header lên layout **24 cột** hiện tại.
  > **Đọc theo TÊN CỘT ở header row, KHÔNG theo vị trí.** Header là dòng đầu mỗi `.tsv` — parse nó rồi tra theo tên. Đếm vị trí sẽ vỡ ở đúng file cũ mà luật này sinh ra để đỡ. Header thiếu hoàn toàn (file hỏng) → mới báo lỗi cho file đó và đi tiếp, không abort cả lệnh.
  > **Cột `service` = `null` không bằng "không có đội".** Nó nghĩa là *chưa biết* (TSV cũ hơn cột 23). Gom vào một nhóm `"(chưa xác định)"` trong `by_service` thay vì bỏ khỏi thống kê — bỏ đi thì tổng của `by_service` nhỏ hơn `total_scs` mà không ai giải thích được vì sao.

### Step 8b — Living Docs Sync *(chỉ umbrella mode)*

*Bỏ qua step này ở single-service mode.*

**Với `spec_source` được set,** các trace TSV authoritative đã sống ở **một** chỗ —
`{spec_source}/.trace/` (committed trong spec repo). **Không có merge theo service**:
mỗi scenario row mang service sở hữu ở **cột `service`** (cột 23, do `/generate-bdd` ghi từ
`@trace.service`). Step này chỉ (re)generate report và làm mới panel local.

1. **Ghi report** vào `{living_docs_dir}/trace-report.json` (`mkdir -p` trước) — dựng
   trực tiếp từ `{spec_source}/.trace/*.tsv`, với field `"service"` mỗi scenario row và
   các summary aggregate. *(Umbrella legacy không-`spec_source` vẫn merge mọi `trace-report.json`
   theo service thành một document, namespace theo service.)*

2. **Mirror tới panel location** `{panel_mirror}` (`./.trace-mirror` ở gốc workspace hiện tại)
   để dev mở *repo này* thấy data ngay: copy
   `{living_docs_dir}/trace-report.json` (+ các file `{UC-ID}-{platform}.tsv`) → `{panel_mirror}/`.
   **Skip nếu `{paths.trace_dir}` đã nằm trong workspace hiện tại** (dev đang đứng trong spec repo —
   panel đọc thẳng ở đó). **KHÔNG** copy `trace-history.jsonl` sang mirror (xem Step 8c).

3. **In sync summary:**
   ```
   Living Docs → {living_docs_dir}/trace-report.json  ({total} scenarios across {S} services)
   Trace (authoritative) → {spec_source}/.trace/   (committed in spec repo)
   Panel mirror → {panel_mirror}/trace-report.json  (current workspace)
   ```

> **Ranh giới git — tuyệt đối, không có ngoại lệ:**
>
> | Đường dẫn | Vai trò | Git |
> |---|---|---|
> | `{paths.trace_dir}/*.tsv` + `trace-history.jsonl` | **AUTHORITATIVE**, không regenerate được | **PHẢI commit** |
> | `{living_docs_dir}/` (`.living-docs/`) | report sinh ra | gitignore |
> | `{panel_mirror}/` (`.trace-mirror/`) | bản sao tiện cho panel | gitignore |
>
> Hai cái dưới được `/validate-traces` hoặc `/sync` dựng lại bất cứ lúc nào. Cái trên thì không —
> mất là mất vĩnh viễn. Từ v0.4.3 mirror đổi tên thành `.trace-mirror` chính vì lý do này:
> khi cả hai cùng tên `.trace`, một luật gitignore theo tên có thể xoá sổ gốc mà không ai biết.

### Step 8c — Ghi nhật ký lịch sử *(mọi mode)*

*`trace-report.json` bị **ghi đè** mỗi lần chạy (Step 8), và cột `last_updated` của TSV chỉ là một ngày bị 8 lệnh cùng ghi đè. Nên framework đo được **trạng thái** rất tốt nhưng không đo được **tốc độ** — không trả lời được "từ bao giờ", "đang lên hay xuống", "case này hỏng đi hỏng lại mấy lần". Step này thêm chiều thời gian với chi phí gần bằng 0.*

**Append** một dòng JSON (một bản ghi trọn vẹn trên một dòng) vào `{paths.trace_dir}/trace-history.jsonl`. Tạo file nếu chưa có.

**Chỉ ghi DELTA, không chép lại snapshot** — snapshot đầy đủ đã ở `trace-report.json`:

```json
{"at":"<ISO-8601>","domain":"<domain hoặc all>",
 "summary":{ …nguyên khối summary của Step 7… },
 "changed":[{"sc_id":"PAY-UC1-SC2","platform":"web","from":"OK","to":"DRIFT"},
            {"sc_id":"PAY-UC1-SC7","platform":"web","from":null,"to":"UNTRACKED"}],
 "flags_opened":["SEAM_UNWIRED:ScoreAccumulationPort"],
 "flags_closed":["STUB_UNRESOLVED:SegmentService#calculateSegment"]}
```

**Cách tính `changed` / `flags_opened` / `flags_closed`:** đọc **dòng cuối cùng** của chính file này (đọc ngược từ cuối — không parse cả file) và so với kết quả lần này. `from: null` = row mới xuất hiện. Nếu file chưa tồn tại → đây là baseline: ghi `summary`, để `changed`/`flags_*` là `[]`.

**Rotate:** file vượt **2000 dòng** → đổi tên thành `trace-history.{YYYY-MM}.jsonl` rồi bắt đầu file mới. Đừng xoá.

**Năm ràng buộc — đây là phần dễ làm sai:**

| Ràng buộc | Vì sao |
|---|---|
| Ghi **CHỈ** vào `{paths.trace_dir}` (nơi authoritative). **KHÔNG** copy sang `{panel_mirror}` hay `{living_docs_dir}` | Nó là dữ liệu tích luỹ, không phải thứ regenerate được. Nhân bản nó ra chỗ sinh-ra là tạo hai lịch sử lệch nhau. |
| Dòng vừa append **PHẢI kết thúc bằng newline** — file không bao giờ được kết thúc giữa dòng | File này là append-only và được merge bằng `merge=union` (xem `{paths.trace_dir}/.gitattributes`). Thiếu newline cuối thì lần append sau — hoặc một lần union merge — **nối hai bản ghi JSON thành một dòng**, và dòng đó không parse được. `--lint-trace` T8 bắt, nhưng đây là ca phòng được bằng một ký tự. |
| File này **PHẢI được commit** cùng TSV | Nó là **dữ liệu**, không phải mirror. Regenerate lại không được — mất là mất vĩnh viễn. ⚠️ Đừng để nó dính vào luật gitignore của `.living-docs/` hay panel mirror; hai cái đó là bản sinh ra, cái này thì không. |
| **Không đụng** TSV và `trace-report.json` | TSV là bảng **trạng thái** — giữ nó phẳng. Lịch sử là file riêng, format riêng, vòng đời riêng. `trace-report.json` là contract với panel VS Code. |
| **Không lệnh nào được ra quyết định dựa trên file này** | Nó để **quan sát**, không phải để gác cổng. Một cái cổng phụ thuộc file có thể bị xoá là cổng dở. Cổng chặn PR vẫn chỉ là 4 cờ 🔴. |

Ghi thất bại (không có quyền, đĩa đầy) → **cảnh báo mềm một dòng rồi đi tiếp**. Nhật ký hỏng không được làm hỏng lệnh audit.

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/validate-traces — {domain}

📄 {paths.trace_dir}/trace-report.json  ← updated

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  PRDs      Use Cases     Scenarios   Code Cov.  Test Cov.  Drift  Untracked  Gap   │
│  {N}       {N}           {N}         {N}%       {N}%       {N}    {N}        {N}   │
│  {A} appr  {A} appr                 {X}/{T} SCs {X}/{T} SCs                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
{in dòng GATE nếu BẤT KỲ cờ 🔴 nào > 0 (seam_unwired · stub_unresolved · orphaned · trace_orphan) — ngược lại bỏ cả khối}
🔴 GATE — có MỒ CÔI: {seam_unwired_count} SEAM_UNWIRED · {stub_unresolved_count} STUB_UNRESOLVED
              · {orphaned_count} ORPHANED · {trace_orphan_count} TRACE_ORPHAN
   Build xanh, test từng-UC xanh, coverage đẹp — nhưng luồng ghép chạy vào no-op,
   hoặc code đang trỏ vào scenario đã bị xoá. KHÔNG coi là pass tới khi CẢ BỐN = 0.
{in dòng ⓘ dưới đây chỉ khi drift_count + bdd_drift_count > 0 — để hai loại cờ đứng cạnh nhau thay vì ở hai đầu report}
   ⓘ  Ngoài cổng: {drift_count} DRIFT · {bdd_drift_count} BDD_DRIFT — "code CHƯA theo kịp spec".
      KHÔNG chặn PR (khác 4 cờ trên), nhưng cũng chưa xong.

{khối 📈 CHỈ in khi trace-history.jsonl đã có ≥1 dòng trước lần chạy này (Step 8c) — lần chạy
 đầu tiên là baseline, không có gì để so, bỏ cả khối. Dấu +/− lấy theo hướng thực tế.}
📈 So lần chạy trước ({ngày dòng cuối}): code {+2}% · test {−1}% · DRIFT {+3} · UNTRACKED {−5}
   Đèn mới bật: {SEAM_UNWIRED × 1}   ·   Đèn đã tắt: {STUB_UNRESOLVED × 2}
   {n} scenario đổi trạng thái — chi tiết: {paths.trace_dir}/trace-history.jsonl

| UC-ID       | SC   | Title (truncated)            | Spec  | Gen   | Code                 | Tests          | Status   |
|-------------|------|------------------------------|-------|-------|----------------------|----------------|----------|
| {UC}-UC1    | SC1  | {title...}                   | v1.0  | v1.0  | ✅ {Controller.fn}   | ✅ 10 tests    | OK       |
| {UC}-UC1    | SC2  | {title...}                   | v1.1  | v1.0  | ✅ {Controller.fn}   | ✅ 3 tests     | DRIFT    |
| {UC}-UC1    | SC6  | {title...}                   | v1.0  | —     | —                    | —              | UNTRACKED|
| {UC}-UC2    | SC1  | {title...}                   | v1.0  | v1.0  | ✅ {Controller.fn}   | —              | GAP      |
| {UC}-UC2    | SC7  | {title...}  ⚠ đã xoá khỏi spec| —     | v1.0  | ✅ {Controller.fn}   | ✅ 2 tests     | ORPHANED |

Drift Detail:
  {UC}-UC1-SC2 — spec v1.1 nhưng code sinh từ v1.0
    → Chạy lại: /generate-code {UC-ID}

BDD Version Drift (file .feature đổi ở cấp file — Background/dataset/business definition):
  {UC}-UC1 (web) — code sinh từ BDD v1.4, .feature giờ v1.6   [SC đang DRIFT: SC2, SC5]
    → /generate-code {feature-file}
  ⚠️  {n} file code thiếu tag @trace.bdd_version → drift detection mù ở các file này

Tech-doc lỗi thời so với BDD:
  {UC}-UC3 (system) — tech-doc dựng từ BDD v1.5, .feature giờ v2.0
    ⚠️  Nguy hiểm hơn drift-về-code: DS3 của /generate-code coi §4 approved là contract
        "đã chốt" và lấy shape NGUYÊN VĂN → contract từ BDD cũ lan thẳng vào code.
    → /generate-tech-docs {feature-file} → /review-tech-docs (cổng T-BDD)

Design-spec Drift (chỉ FE/App — designer sửa thiết kế SAU KHI BDD/code đã sinh):
  {UC}-UC1 (web) — code dựng từ design-spec v1.2, design-spec giờ v1.5
    → /generate-code {feature-file}
  {UC}-UC4 (app) — BDD dựng từ design-spec v2.0, design-spec giờ v2.3
    ⚠️  BDD có thể THIẾU Screen State / AC-UI vừa thêm — không phải chỉ lỗi thời nhãn.
    → /generate-bdd {prd-file}
  ⚠️  {n} file FE thiếu tag @trace.design_spec_version → drift detection mù ở các file này

{khối by_service CHỈ in ở umbrella mode (có section `services`) — bỏ ở single-service}
Theo đội (cột `service`):
  user-service    12/15 SC có code · 10 test ·  2 DRIFT
  web-app          8/8  SC có code ·  8 test ·  0 DRIFT
  (chưa xác định)  3/3  SC có code ·  3 test ·  0 DRIFT   ← TSV cũ hơn cột 23, chạy /generate-bdd để điền

FE còn dùng mock (fe_phase = ui — có UI + test nhưng CHƯA nối API thật):
  {UC}-UC1 (web) — {n} SC ở fe_phase=ui
    → /generate-code {feature-file} --phase=integration  (hoặc để trống --phase cho fe_full)
    ⚠️  Các SC này có thể đang hiện OK: có code, có test — nhưng test chạy trên mock.
        Đừng coi là xong tính năng.

Orphaned (scenario đã bị xoá khỏi .feature nhưng code còn):
  {UC}-UC2-SC7 (web) — "{sc_title}"
    Code : {ControllerClass}.{method}
    Test : {TestClass} (2 tests)
    Không tự hết — chọn MỘT:
      (a) code không còn cần  → xoá method + test, rồi xoá row khỏi .tsv
      (b) SC bị xoá do nhầm   → đưa scenario trở lại .feature → row về DRIFT/OK bình thường

Trace orphan (tag trỏ vào SC không tồn tại, KHÔNG có row .tsv nào):
  {file}:{line} — @trace.implements={UC}-UC1-SC9 nhưng .feature chỉ có tới SC5
    → Sửa sc_id cho đúng SC hiện có, HOẶC xoá code/test nếu không còn cần
    (Không lệnh nào khác bắt được cái này — row .tsv đã bị xoá bởi version cũ,
     hoặc tag ghi sai id ngay từ đầu.)

{khối dưới CHỈ in khi ledger_behind_code_count > 0 — else bỏ cả khối}
🟠 LEDGER_BEHIND_CODE — làm rồi mà sổ chưa ghi ({n} scenario):
     {UC}-UC1-SC3 (web)  code: {File.method}                   → sẽ thành OK
     {UC}-UC1-SC4 (web)  code: {File.method}   chưa có test     → sẽ thành GAP
     … {n} scenario, gom theo PRD: {LESS-06} 76 · {LESS-09} 65 · …
   Code đã có tag @trace.implements, nhưng cột implemented_by còn trống ⇒ các row này
   đang hiện UNTRACKED. Dashboard đếm THIẾU, và /generate-code coi là "chưa làm" nên
   sẽ sinh lại thứ đã có.
   Nguyên nhân thường gặp: /generate-code dừng ở cổng build nên §Write Trace State
   chưa chạy (build fail 3 lần → "KHÔNG ghi trace" là đường thoát hợp lệ), rồi dev
   sửa tay cho build pass và commit mà không chạy lại lệnh.
   → /validate-traces --reconcile-code            (cả scope hiện tại)
     /validate-traces --reconcile-code --domain {d}  (dọn từng domain cho dễ soi)
   ⚠️  {n} trong số này CHƯA có @trace.verifies → chúng sẽ thành GAP, không phải OK.
       Đó là số ĐÚNG: chỗ thiếu test vừa lộ ra, không phải chỗ mới hỏng.
   🟠 KHÔNG chặn PR — code đang chạy đúng, chỉ sổ nói sai về nó.

🔴 PRD_UNTRACKED_EDIT — nội dung PRD đổi mà nhãn Version KHÔNG đổi ({n} file):
  specs/payment/create-invoice/PAY01-create-invoice.md   Version 1.3 (không đổi từ lần audit)
    Bằng chứng : git status — sửa CHƯA commit
    Mốc cũ     : sha a1b2c3d · Version 1.3
    ⚠️  MỌI phán đoán version bên dưới cho PRD này đang dựa vào một nhãn không còn đúng.
        Không suy đoán được UC nào bị đụng → phải coi cả {n} UC của nó là chưa rõ.
    Sửa: bump Version + ghi một row changelog NÊU UC bị ảnh hưởng.
         Đó đúng là việc /amend-prd làm hộ (kèm kiểm va chạm + guard sau-ghi).
         Không có --accept-edit: dán nhãn lên thay đổi chưa ai xem là đúng cái rào của
         --realign tồn tại để chặn.

  (hoặc: ⚠️ Chưa kiểm được sửa-ngoài-đường cho {n} PRD ({lý do}) — điểm mù G54 đang MỞ)
  (hoặc: ⓘ spec_baseline: lần đầu ghi mốc — check có hiệu lực từ lần chạy sau)

PRD Version Drift (changelog CÓ nêu UC này — nội dung đổi thật):
  {UC}-UC2 — code ở PRD v1.0, PRD giờ ở v1.2   [lệch: tsv, code]
    Thay đổi kể từ v1.0:
      v1.1: {changelog entry}
      v1.2: {changelog entry}
    → /generate-bdd {prd-file} then /generate-code {UC-ID}

{khối ⓘ dưới CHỈ in khi prd_stale_ref_count > 0}
ⓘ PRD_STALE_REF — {n} UC mang con trỏ PRD cũ nhưng changelog KHÔNG nêu chúng:
  {UC}-UC1, {UC}-UC3, {UC}-UC4 — PRD v1.4 → v2.0 vì "thêm UC7", không đụng các UC này
    Nội dung KHÔNG đổi → không cần sinh lại code. Chỉ là nhãn version cũ.
    → /validate-traces --realign-prd-version {UC-ID}   (chỉ sửa dòng @trace.*, KHÔNG đụng logic)
  ⚠️  Đây KHÔNG phải lỗi. Nó tồn tại vì version PRD là MỘT số cho cả tài liệu nhiều UC —
      thêm một UC làm mọi UC cũ lệch số. Trước khi có bộ lọc này, cả {n} UC đều ăn cờ đỏ oan,
      và làm theo hướng dẫn cũng không tắt được (generate-code skip row đang OK).

Tech-Doc Revision Drift (changelog CÓ nêu UC này):
  {UC}-UC3 — code sinh từ tech-doc revision 2, giờ ở revision 4
    → /generate-code {UC-ID} --force

{khối ⓘ dưới CHỈ in khi techdoc_stale_ref_count > 0}
ⓘ TECHDOC_STALE_REF — {n} UC mang revision tech-doc cũ nhưng changelog KHÔNG nêu chúng:
  {UC}-UC5, {UC}-UC6 — revision 2 → 4 vì UC8 được APPEND vào doc gộp
    → /validate-traces --realign-techdoc-revision {UC-ID}

Seam & Stub Audit (mồ côi khi ghép luồng):
  🔴 SEAM_UNWIRED — {port}: {consumer_uc} còn gọi {stub_class} rỗng,
     hàng thật {real_class} ({owner_uc}) chưa được nối → luồng ghép chạy vào no-op
       → Trỏ binding {consumer_uc} sang {real_class}, xoá/thay stub, build lại
  ⓘ SEAM_PENDING — {port}: {consumer_uc} đang dùng stub, owner {owner_uc} chưa gen (chưa phải lỗi)
  🔴 STUB_UNRESOLVED — {ClassName#method} ({stub_for}): {consumer_uc} để trắng, owner {owner_uc} đã gen
     {parallel_impl → "đẻ hàm song song " + parallel_impl | ""}→ hàm trắng mồ côi / hàm thật không ai gọi
       → /generate-code {owner_uc} lấp logic vào {ClassName#method} tại chỗ, xoá hàm song song, build lại
  ⓘ STUB_PENDING — {ClassName#method} ({stub_for}): owner {owner_uc} chưa gen (chưa phải lỗi)

{khối dưới CHỈ in khi service_unrouted_count > 0 — else bỏ cả khối}
Routing chưa chốt ({service_unrouted_count} scenario) — 🟠 KHÔNG chặn PR:
  🟠 SERVICE_UNROUTED — {sc_id} ({platform}), domain "{domain}": {reason}
       → thêm mapping cho domain "{domain}" vào `services:` của .agent/project-context.yaml,
         rồi chạy lại /validate-traces — nó tự nâng unrouted → path. KHÔNG cần sinh lại BDD.
   BDD của các scenario này KHÔNG sai. Đây là bước cấu hình của architect, và nó chỉ CHẶN
   ở /generate-code (lệnh đó buộc phải biết ghi file vào repo nào).

{khối dưới CHỈ in khi Step 7b tìm thấy ≥1 request Status: Open — else bỏ cả khối}
📥 Yêu cầu đổi PRD đang chờ ({n} — chưa ai xử lý):
     {UC-ID} — "{title}"        chờ {days_waiting} ngày
     {UC-ID} — "{title}"        chờ {days_waiting} ngày
   Đây KHÔNG phải coverage gap: nó là requirement chưa có AC nào phủ, nên KHÔNG cờ
   trace nào bắt được — theo mọi thước đo coverage thì nó không tồn tại. Chỉ hết khi
   PO đưa vào PRD.
   → PO đọc request, đặt Status: accepted, rồi /extend-prd {prd-file}
     (nó tự nhặt request, chốt AC/BR, đánh số nối tiếp, bump version + changelog,
      và đóng dấu incorporated + archived/ — không phải làm tay bước nào).

Recommendations:
  - /validate-traces --reconcile-code  cho LEDGER_BEHIND_CODE 🟠  ← CHẠY CÁI NÀY TRƯỚC
      ↳ Nó chỉ ghi sổ theo tag đã có trong code, không sinh code. Chạy trước thì
        UNTRACKED/GAP bên dưới mới là số thật; chạy /generate-code trước sẽ sinh lại
        thứ đã tồn tại và có thể ghi đè code đang chạy.
  - /generate-code {UC-ID}       cho scenario DRIFT và UNTRACKED
  - /dev-gen-test {UC-ID}        cho GAP (thiếu test)
  - /generate-bdd {prd-file}     cho PRD_DRIFT 🟠 (changelog CÓ nêu UC này)
  - /validate-traces --realign-prd-version {UC-ID}       cho PRD_STALE_REF ⓘ
  - /validate-traces --realign-techdoc-revision {UC-ID}  cho TECHDOC_STALE_REF ⓘ
      ↳ Hai cái này chỉ sửa dòng @trace.*, KHÔNG đụng logic. Đừng /generate-code cho
        chúng — version bump không đụng UC này, sinh lại code là rủi ro không đáng.
  - /generate-code {feature-file} cho BDD_DRIFT (code sinh từ .feature cũ hơn)
  - /generate-code {feature-file} cho DESIGNSPEC_DRIFT · /generate-bdd cho DESIGNSPEC_STALE_VS_BDD
  - /generate-tech-docs + /review-tech-docs  cho tech-doc lỗi thời so với BDD
  - Nối binding thủ công         cho mỗi SEAM_UNWIRED 🔴 (hàng thật đã có, còn kẹt stub)
  - /generate-code {owner_uc}    cho mỗi STUB_UNRESOLVED 🔴 (lấp method trắng tại chỗ + xoá hàm song song)
  - Quyết định thủ công          cho mỗi ORPHANED / TRACE_ORPHAN 🔴 — xoá code+test, hoặc đưa
                                 scenario trở lại .feature, hoặc sửa sc_id của tag.
                                 KHÔNG có lệnh tự xử: cần người xác nhận behavior còn cần hay không.

⚠️  CỔNG TẠO PR = 4 cờ 🔴 đều = 0 (SEAM_UNWIRED · STUB_UNRESOLVED · ORPHANED · TRACE_ORPHAN).
    Đây là cổng "code đang HỎNG" — luồng ghép chạy vào hàm rỗng, hoặc code trỏ vào
    scenario đã bị xoá. Bốn cái này build xanh và test xanh vẫn không phát hiện được.

    Cổng này KHÔNG bao gồm DRIFT · BDD_DRIFT · PRD_DRIFT · TECHDOC_DRIFT — đó là
    "code CHƯA theo kịp spec", một loại nợ khác: nó không làm hỏng luồng đang chạy.
{dòng dưới CHỈ in khi (drift_count + bdd_drift_count + prd_drift + techdoc_drift) > 0}
    Hiện có {n} scenario/UC đang ở trạng thái đó — không chặn PR, nhưng xử trước khi
    coi tính năng là xong. "Hết cờ 🔴" ≠ "sạch".

📜 Lịch sử  → {paths.trace_dir}/trace-history.jsonl  (+1 dòng — {n} lần chạy đã ghi)
   Đây là DỮ LIỆU, không phải mirror: regenerate lại không được, mất là mất vĩnh viễn.
   PHẢI commit cùng TSV.

[Chỉ umbrella mode]
Living Docs canonical → {living_docs_dir}/  (specs module — shared, gitignored)
Panel mirror          → {panel_mirror}/trace-report.json  (.trace-mirror/, gitignored)
  Tip: chạy /validate-traces (hoặc /sync) sau mỗi phiên codegen để làm mới panel.
  ✅ Commit    : {paths.trace_dir}/  (*.tsv + trace-history.jsonl — authoritative)
  🚫 Gitignore : .living-docs/  và  .trace-mirror/   (sinh ra, dựng lại được)
```

# /report-bug — File một Bug có trace-spec (cho Tester & QC)

Dành cho **tester và QC** — gồm cả **product-gap** lòi ra từ pipeline `/qc-*`
(`/qc-run-test` FAIL phân loại product-gap, hoặc một spec-defect blocker `DOC_GAP` từ
`/qc-analyze`). Sinh một bug report có cấu trúc với đầy đủ spec context, phân loại layer
khả nghi, và lưu lại để handoff cho team dev.

**READ-ONLY trên spec và code.** Lệnh này không bao giờ sửa PRD, BDD, tech-docs, hay source.
Fix là việc của dev (`/fix-bug`); viết scenario là `/propose-scenario`.

Usage: `/report-bug {UC-ID hoặc TICKET} {mô tả ngắn}`
Ví dụ: `/report-bug FT-001 tài khoản khoá sau 6 lần login fail, spec nói 5`

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID / TICKET từ `$ARGUMENTS`. Phân giải file `.feature` khớp nếu có; nếu không, tiếp tục — bug vẫn file được.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Step 1 — Phân giải Spec Context

Định vị chuỗi spec cho UC/TICKET của bug. Ưu tiên `spec-manifest.yaml` (setup umbrella/tester) nếu có; else dùng `paths` đã phân giải.

Thu thập và lưu:
- `prd_path` + `Version` hiện tại của PRD
- `bdd_path` (file `.feature` của UC này) + tiêu đề **scenario fail** cụ thể, nếu có cái khớp
- `tech_doc_path` (nếu có)
- `service` / domain

Nếu không có scenario `.feature` nào khớp behavior báo cáo → set `coverage_gap = true` (behavior chưa được BDD test).

## Step 2 — Thu thập chi tiết Bug

Nếu chưa có trong `$ARGUMENTS`, hỏi tester (một prompt gọn):

```
File một bug — trả lời những gì bạn biết:
  1. Xảy ra ở đâu? (endpoint / screen / flow)
  2. Các bước tái hiện?
  3. Expected (theo spec) vs Actual?
  4. Error / log / status code?
  5. Environment? (staging / prod / local)
```

## Step 3 — Xác định AC bị vi phạm

Đọc PRD acceptance criteria cho UC này. Khớp bug với **AC** cụ thể nó vi phạm
(vd `AC3: "5 lần login fail → khoá 30m"`). Trích nguyên văn. Nếu behavior không map AC nào →
ghi "No AC covers this" và coi như một PRD gap khả dĩ.

## Step 4 — Phân loại Layer khả nghi (BUG_FLOW)

Áp dụng bảng quyết định BUG_FLOW để gợi ý root cause khả năng ở đâu — cái này route bug:

| Nếu… | Layer khả nghi | Route tới |
|------|-------------|----------|
| Code mâu thuẫn một BDD scenario | **Code bug** (Case 1) | Dev → `/fix-bug` |
| BDD scenario mâu thuẫn PRD AC | **BDD bug** (Case 2) | Dev/PO fix BDD |
| PRD AC mơ hồ / im lặng | **PRD ambiguity** (Case 3) | PO làm rõ PRD |
| Behavior đúng nhưng **không scenario nào phủ** | **BDD coverage gap** | Tester → `/propose-scenario` |
| UI ≠ Design Spec | **Design Spec bug** (Case 5) | Dev/Designer |
| Chỉ Env / data | **Environment** (Case 6) | DevOps |

Nêu phân loại như một gợi ý (dev confirm trong `/fix-bug`).

## Step 5 — Ghi Report

Gán `BUG-{today YYYYMMDD}-{NN}` (NN = sequence kế tiếp trong các report có sẵn).
Ghi vào `{paths.bug_reports_dir}/{BUG-ID}.md` (phân giải về `{spec_source}/feedback/bug-reports/` ở umbrella mode; tạo dir nếu cần) theo cấu trúc trong Output block, và cũng in nó ra để dán vào Jira/Slack.

## Step 5.5 — Backfill trace (link pending-view)

Nếu Step 1 khớp một scenario fail cụ thể `{UC-ID}-SC{N}`, xác định **sổ platform** cần cập nhật (trace tách theo platform: `{UC-ID}-{platform}.tsv`):
- `{platform}` = platform mà bug xảy ra (từ ngữ cảnh test/feature fail — `web`/`app`/`system`). Nếu biết → dùng thẳng.
- Nếu **không rõ platform**: glob `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-*.tsv` tìm sổ nào có `sc_id` = `{UC-ID}-SC{N}`. Khớp đúng **một** sổ → dùng nó. Khớp **nhiều** sổ (cùng số SC ở nhiều platform, là 2 scenario khác nhau) → **hỏi tester bug thuộc platform nào** rồi mới ghi.

Nếu tìm được đúng row trong sổ `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv`, cập nhật **chỉ** row đó để view "waiting-on" của PO/PM trỏ
tới bug này — giữ nguyên mọi cột khác (gồm `qc_status`):
- `qc_blocked_by` = `{BUG-ID}`
- `qc_owner` = `dev` nếu layer khả nghi ∈ {Code, BDD, Design Spec, Env} · `po` nếu layer khả nghi = PRD ambiguity

Skip âm thầm nếu không SC nào khớp hoặc không có file/row trace (bug vẫn file được). Đây là
lần ghi duy nhất lệnh này làm tới operational state — nó vẫn **không bao giờ** sửa PRD/BDD/code.

## Step 6 — Handoff (để PO/Dev thực sự thấy)

Report chỉ tới PO/Dev nếu được **commit và push lên spec repo dùng chung**. File local là dead drop.

Xác định repo sở hữu `{paths.bug_reports_dir}`:
- Umbrella mode → spec submodule tại `{spec_source}`
- Single-service → repo hiện tại

Rồi commit + push **repo đó**:

```bash
cd {spec_source}              # umbrella: spec submodule; single-service: bỏ
git add feedback/bug-reports/{BUG-ID}.md
git commit -m "qa(bug): {BUG-ID} — {short description}"
git push                      # → PO/Dev thấy nó ở lần /sync tiếp theo
```

- Nếu tester không có quyền push spec repo → mở PR / MR thay vì, hoặc đưa file cho người sở hữu. In fallback này.
- In chính xác các lệnh nếu bạn không tự chạy chúng.

> PO/Dev được thông báo qua routine bình thường: `/sync` liệt kê các bug report vừa pull về.

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
🐞 {BUG-ID}  →  {paths.bug_reports_dir}/{BUG-ID}.md  (trong spec repo dùng chung)

Feature  : {UC-ID} — {feature name}   |  Service: {service}   |  Severity: {Critical|Major|Minor}
State    : 🟢 Open   (lifecycle: Open → Fixed → Closed — set `Fixed` bởi /fix-bug, `Closed` sau khi /qc-run-test re-verify pass)

Spec context
  PRD      : {prd_path} (v{prd_version})
  BDD      : {bdd_path} → Scenario: "{scenario title}"   {hoặc: ⚠️ no scenario covers this}
  Tech Doc : {tech_doc_path}

AC bị vi phạm
  {AC-N}: "{AC text}"

Expected (theo spec) : {expected}
Actual               : {actual}
Steps to reproduce   : {1..N}
Environment          : {env}

Layer khả nghi : {Code | BDD | PRD | Design Spec | Env}  →  {route}

Handoff : {✅ committed + pushed to spec repo | ⚠️ chạy git command ở trên / mở PR}

---
Status : ✅ Complete (read-only trên specs/code — chỉ ghi file feedback)
Output Artifacts: created {paths.bug_reports_dir}/{BUG-ID}.md (pushed to shared spec repo)
Next   :
  - PO/Dev sẽ thấy nó ở lần /sync tiếp theo
  - Code bug      → dev chạy /fix-bug {BUG-ID}
  - PRD ambiguity → PO (BUG_FLOW Case 3)
  - Coverage gap  → /propose-scenario {UC-ID}
```

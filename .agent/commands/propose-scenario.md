# /propose-scenario — Đề xuất một BDD Scenario mới (cho Tester & QC)

Dành cho **tester và QC** phát hiện edge case chưa được BDD hiện tại phủ (vd một gap missing-coverage
`DOC_GAP` từ `/qc-analyze`). Draft một Gherkin scenario vào **khu proposal** để
PO/Dev review và promote.

**KHÔNG sửa file `.feature` canonical.** BDD do PO/Dev sở hữu — lệnh này chỉ ghi
một proposal. Promote vào BDD thật là hành động của PO/Dev.

Usage: `/propose-scenario {UC-ID} {mô tả edge case}`
Ví dụ: `/propose-scenario FT-001 login với email có space ở cuối vẫn nên thành công`

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID từ `$ARGUMENTS`. Phân giải file `.feature` của nó (để lấy vocabulary + scenario có sẵn) và PRD của nó.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Step 1 — Phân giải UC + Platform

Định vị (qua `spec-manifest.yaml` nếu có, else `paths`):
- `prd_path` + danh sách acceptance criteria của UC
- `bdd_path` + `active_platform` (web / app / system) — để khớp vocabulary scenario và tag `@trace`
- các tiêu đề scenario có sẵn của UC này (để tránh đề xuất trùng)

## Step 2 — Quyết định Coverage (CRITICAL)

Một BDD scenario phải trace tới một PRD acceptance criterion. Xác định case nào áp dụng:

**Case A — behavior NẰM TRONG một AC có sẵn** (AC ngụ ý nó, BDD chỉ thiếu scenario):
→ Đây là coverage gap. Tiếp tục draft scenario (Step 3), map tới AC đó.

**Case B — behavior KHÔNG nằm trong AC nào** (requirement thực sự mới):
→ **Đừng** draft BDD proposal (scenario sẽ không có gì để trace). Thay vào đó **ghi một
file PRD change request** để PO thực sự thấy nó trên `/sync` (đừng chỉ in ra):

Ghi vào `{paths.prd_change_requests_dir}/{UC-ID}-{slug}.md` (phân giải về
`{spec_source}/feedback/prd-change-requests/` ở umbrella mode; tạo dir nếu cần):
```
# PRD Change Request — {UC-ID}: {short title}

> ⚠️ Requirement mới phát hiện trong test — KHÔNG được PRD AC nào phủ (không phải coverage gap).
| Field | Value |
|---|---|
| UC / Ticket | {UC-ID} |
| PRD | {prd_path} (v{prd_version}) |
| Source | {BUG-ID nếu có | quan sát của tester/QC} |
| Requested by | tester/QC |
| Status | Open |

**Requested behavior:** {description}
**Suggested AC (draft cho PO):** "{draft AC text}"
**Route to PO:**
1. Đặt `Status: accepted` trong file này nếu nhận yêu cầu.
2. Chạy **`/extend-prd {prd_path}`** — nó tự nhặt request `accepted`, hỏi PO chốt AC/BR đúng
   tầng, đánh số **nối tiếp** (không đụng ID cũ), bump version + ghi changelog nêu rõ scope,
   rồi đóng dấu `incorporated` + chuyển file này sang `archived/`.
3. `/refine-prd` → `/review-context` → PO đặt `approved` → `/generate-bdd` **chỉ cho UC MỚI**.

⚠️ **KHÔNG dùng `/refine-prd` để thêm AC mới.** Nó chỉ áp findings từ review và có luật cấm
   đụng section nào không được finding tham chiếu. **KHÔNG dùng `/generate-prd`** — nó từ chối
   chạy trên PRD đã có (ghi đè sẽ mất changelog + đánh số lại BR).
```
Rồi sang Step 5 (handoff áp dụng cho file này luôn). Skip Step 3–4 (không có BDD scenario cho Case B).

Nếu không chắc case nào → hiện danh sách AC và hỏi tester nó map tới AC nào, hoặc confirm nó là mới.

## Step 3 — Draft Scenario (chỉ Case A)

Viết Gherkin nhất quán với convention của `/generate-bdd` cho `active_platform`:
- Dùng vocabulary platform (web: clicks/sees; app: taps/sees; system: business event)
- Một scenario tập trung; Given/When/Then cụ thể; không chi tiết implementation
- **Dùng ĐÚNG bộ tag canonical của `.feature`** (giống `templates/feature.template`) — vì scenario này sẽ được `/generate-bdd` chèn thẳng vào BDD canonical:

```gherkin
  # Side-effects: {liệt kê side-effect quan sát được, hoặc "—"}
  # @trace.scenario: {UC-ID}-SC?      ← "?" = số do /generate-bdd gán lúc chèn (tester không biết số kế tiếp)
  # @trace.sc_version: 1.0
  # @trace.business_rules: {BR-ID nếu xác định được, else —}
  # Covers: AC{N}                     ← comment thường, KHÔNG phải @trace (AC không phải trace key)
  # Nguồn: proposal {file} · {BUG-ID nếu có}
  @proposed @from-test @edge
  Scenario: {business outcome}
```

> **KHÔNG dùng `@trace.uc=` / `@trace.ac=`.** Hai key đó không tồn tại trong contract `.feature` ở bất kỳ đâu khác — scenario mang chúng mà thiếu `@trace.scenario`/`@trace.sc_version` sẽ **không sinh được row trace** khi vào `.feature`: không có `sc_id`, không có `spec_ver`, nên vô hình với toàn bộ coverage/drift. Số UC đã nằm sẵn trong `sc_id`.

## Step 4 — Ghi Proposal

Ghi vào `{paths.bdd_proposals_dir}/{UC-ID}-{slug}.md` (phân giải về `{spec_source}/feedback/bdd-proposals/` ở umbrella mode; tạo dir nếu cần).
KHÔNG đụng `.feature` canonical. Doc proposal chứa draft + metadata review
(xem Output), **gồm dòng `Status: proposed`**. Nếu nguồn là một bug, tham chiếu `BUG-ID` của nó.

> **Vòng đời proposal** (máy đọc được để `/generate-bdd` intake đúng):
> `proposed` → PO/Dev duyệt đặt `accepted` (hoặc `rejected`) → `/generate-bdd` chèn cái `accepted` vào `.feature` rồi đặt `incorporated` + lưu trữ. **Chỉ `accepted` mới được đưa vào BDD.**

## Step 5 — Handoff (để PO/Dev thực sự thấy)

Một proposal chỉ tới PO/Dev nếu được **commit và push lên spec repo dùng chung**.

```bash
cd {spec_source}              # umbrella: spec submodule; single-service: bỏ
git add feedback/bdd-proposals/{UC-ID}-{slug}.md
git commit -m "qa(proposal): {UC-ID} — {title}"
git push                      # → PO/Dev thấy nó ở lần /sync tiếp theo
```

- Không có quyền push spec repo → mở PR / MR thay vì. In fallback này.
- Với **PRD change request** (Case B), commit file request thay vì:
  ```bash
  cd {spec_source}
  git add feedback/prd-change-requests/{UC-ID}-{slug}.md
  git commit -m "qa(prd-change): {UC-ID} — {title}"
  git push
  ```

> PO/Dev được thông báo qua routine bình thường: `/sync` liệt kê các proposal vừa pull về.

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

> **Hai khối report — chọn theo case đã chốt ở Step 2. In ĐÚNG MỘT khối.**
> Case A và Case B tạo ra hai loại artifact khác nhau, ở hai thư mục khác nhau, và đi hai
> đường xử lý khác nhau. In khối Case A cho một request Case B là báo cáo sai việc vừa làm:
> nó chỉ sai thư mục, in một scenario không tồn tại, và bảo người dùng chờ `/generate-bdd`
> nhặt — trong khi lệnh đó **không bao giờ** đọc `prd-change-requests/`.

### Khối Case A — scenario proposal *(behavior nằm trong một AC có sẵn)*

```
📝 Scenario proposal → {paths.bdd_proposals_dir}/{UC-ID}-{slug}.md

UC        : {UC-ID} ({active_platform})
Maps to AC : {AC-N} — "{AC text}"
Source     : {BUG-ID nếu có | quan sát tester}

Scenario đề xuất (DRAFT — chờ PO/Dev review):
  # Side-effects: {…}
  # @trace.scenario: {UC-ID}-SC?
  # @trace.sc_version: 1.0
  # @trace.business_rules: {BR-ID | —}
  # Covers: AC{N}
  @proposed @from-test @edge
  Scenario: {title}
    Given {…}
    When  {…}
    Then  {…}

Để PO/Dev promote:
  [ ] AC mapping đúng? (hoặc cập nhật PRD nếu requirement thực sự mới)
  [ ] Đặt `Status: accepted` trong file proposal (để /generate-bdd đưa vào)
  [ ] Chạy lại /generate-bdd {UC-ID} — nó tự chèn proposal `accepted` vào .feature rồi lưu trữ
  [ ] Rồi: /generate-code {UC-ID} + /dev-gen-test {UC-ID}

Handoff : {✅ committed + pushed to spec repo | ⚠️ chạy git command ở trên / mở PR}

---
Status : ✅ Complete (read-only trên BDD canonical — chỉ proposal)
Output Artifacts: created {paths.bdd_proposals_dir}/{UC-ID}-{slug}.md (pushed to shared spec repo)
Next   : PO/Dev thấy nó ở lần /sync tiếp theo → review & promote
```

### Khối Case B — PRD change request *(requirement mới, không AC nào phủ)*

```
📋 PRD change request → {paths.prd_change_requests_dir}/{UC-ID}-{slug}.md

UC         : {UC-ID} ({active_platform})
Loại       : requirement MỚI — không AC nào phủ  (KHÔNG phải coverage gap)
PRD        : {prd_path} (v{prd_version})
Source     : {BUG-ID nếu có | quan sát tester/QC}
Behavior   : {description}
Draft AC   : "{draft AC text}"   ← đề xuất cho PO cân nhắc, PO chốt lại

⚠️  Lệnh này KHÔNG sinh BDD scenario nào — scenario chưa có AC để trace tới.
    Nó chỉ xuất hiện SAU KHI PO đưa requirement vào PRD rồi chạy lại /generate-bdd.
    Và vì chưa có AC, KHÔNG cờ trace nào bắt được thiếu sót này: theo mọi thước đo
    coverage hiện tại thì hành vi bạn vừa phát hiện không tồn tại.

Để PO xử lý:
  [ ] Đọc request, quyết định nhận hay không
  [ ] Nhận → đặt Status: accepted trong file request
  [ ] /extend-prd {prd-file}   ← nhặt request, chốt AC/BR với PO, đánh số nối tiếp,
                                 bump version + changelog, tự đóng dấu incorporated
  [ ] /refine-prd → /review-context {prd-file}   ← soi + kiểm phần vừa thêm
  [ ] PO đặt Status: approved  →  /generate-bdd {prd-file}  (CHỈ UC mới)  →  /generate-code

Handoff : {✅ committed + pushed to spec repo | ⚠️ chạy git command ở trên / mở PR}

---
Status : ✅ Complete (không đụng BDD — đây là yêu cầu đổi tài liệu, không phải scenario)
Output Artifacts: created {paths.prd_change_requests_dir}/{UC-ID}-{slug}.md (pushed to shared spec repo)
Next   : PO thấy nó ở lần /sync tiếp theo. Nếu chưa xử, /validate-traces sẽ nhắc lại
         (kèm số ngày chờ) mỗi lần chạy, chừng nào Status còn Open.
```

---
version: 1.0
updated: 2026-06-11
ported_from: ai-automation-qc-base
---

# /qc-review — QC Review Gate (test case & script)

> Stage 4 của QC automation pipeline native (qc-analyze → qc-plan → qc-design-test → qc-review → qc-run-test → qc-report). Port từ qa-reviewer của team QC. Một gate hai chiều: review test case (sau qc-design-test) VÀ script (sau qc-run-test).

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID (`active_platform` + `qc_artifact_dir` do §Phạm vi QC phân giải).  Phát hiện review mode từ `$ARGUMENTS`/context: review test-case `.Test.md` (sau design) hoặc review Python script (sau run). Đọc artifact từ `{qc_artifact_dir}` và source test/page-object đã sinh.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

## Phạm vi QC

# QC Scope — phân giải phạm vi cho mọi lệnh `qc-*`

**Chạy TRƯỚC phần logic riêng của lệnh, và SAU `steps/gate.md`.** Bước này chốt bốn thứ mà
cả 6 trạm QC đều cần, để chúng không tự suy mỗi trạm một kiểu:

| Biến | Là gì |
|---|---|
| `TICKET-ID` | mã PRD — **thư mục artifact QC mang tên này** |
| `active_platform` | `web` \| `app` \| `system` \| … — một QC pass khoá đúng MỘT nền |
| `qc_artifact_dir` | `{paths.qc_dir}/{TICKET-ID}/{active_platform}/` |
| `uc_list` | các UC của (PRD × nền) này, kèm trạng thái BDD từng UC |

> **Vì sao gom về một chỗ.** Luật phân giải nền từng được copy-paste ở 5 lệnh và câu chữ đã
> lệch nhau. Năm bản của một luật là nơi drift sống: sửa bốn, quên một, và trạm bị quên ghi
> artifact vào sai thư mục **trong im lặng**.

---

## 1 — `TICKET-ID`

Artifact QC gom theo **PRD**, không theo UC. Nên mọi trạm phải quy được về `TICKET-ID`:

| `$ARGUMENTS` là | Cách lấy |
|---|---|
| **UC-ID** (`{TICKET-ID}-UC{N}`) | phần **trước** `-UC` — đúng luật `steps/gate.md` Bước 1 dùng để tìm tech-doc gộp |
| **TICKET-ID** | dùng trực tiếp |
| một **path file** (`.feature` / PRD / design-spec) | phân giải `{domain}` + `{prd-slug}` theo luật `context-loader` Bước 1, rồi lấy `TICKET-ID` từ tên file PRD `{TICKET-ID}-{prd-slug}.md` — file `.md` duy nhất ở gốc feature folder |

Đối chiếu: `TICKET-ID` suy ra phải khớp tên file PRD thật. Lệch → **DỪNG**, in cả hai giá
trị. (Suy sai `TICKET-ID` là ghi cả một PRD vào sai thư mục — không có bước nào phía sau bắt được.)

---

## 2 — `active_platform`

> **PHẢI phân giải TRƯỚC mọi phép đọc `.feature`.** `{UC-ID}-SC{N}` chỉ độc nhất trong
> (UC × nền), nên một UC đa nền có **nhiều file `.feature`** — `bdd/web/`, `bdd/app/`,
> `bdd/system/` — và mỗi file mang `@trace.status` **riêng**: bản web có thể `approved`
> trong khi bản app còn `draft`. Đọc "file `.feature` của UC" khi chưa biết nền là đọc một
> file **bất kỳ trong ba**: báo `approved` trong khi bản đang dùng còn nháp, hoặc chặn oan
> một bản đã duyệt.

Theo thứ tự, dừng ở cái đầu tiên khớp:

1. `$ARGUMENTS` nêu nền (`web`/`app`/`system`/…) → dùng.
2. Target là một file `.feature` → đọc `# @trace.platform` của nó.
3. Glob `{paths.specs_dir}/{domain}/{prd-slug}/bdd/*/` — **đúng một** thư mục nền → dùng nó.
4. Glob `{paths.qc_dir}/{TICKET-ID}/*/` — **đúng một** thư mục nền đã có artifact → dùng nó.
   *(chỉ dùng cho trạm 2–6; trạm `/qc-analyze` là trạm tạo ra thư mục đó nên không có gì để soi.)*
5. Nhiều nền mà không suy được → hỏi *"QC pass này cho nền nào? (web/app/system)"*.
   **Có `--yes`:** không hỏi — DỪNG với lỗi rõ ràng, vì đoán bừa nền là ghi artifact vào sai
   thư mục và ghi `qc_status` vào sai sổ trace:
   ```
   ❌ {TICKET-ID} có {n} nền ({list}) — không suy được nền nào cho QC pass này.
      Chạy headless thì phải nêu tường minh: /{lệnh} {TICKET-ID} web --yes
   ```

Lưu `active_platform`. Từ đây, **mọi** phép đọc `.feature` chỉ đọc thư mục
`bdd/{active_platform}/` — không trộn SC chéo nền.

---

## 3 — `qc_artifact_dir`

```
qc_artifact_dir = {paths.qc_dir}/{TICKET-ID}/{active_platform}/
```

Chứa: `REQUIREMENT_ANALYSIS.md` · `DOC_GAP.md` · `TEST_PLAN.md` · `test-cases/*.Test.md`
— **mỗi loại đúng MỘT file cho cả PRD**, các UC là mục/hàng bên trong.

`{paths.qc_dir}` là folder top-level **nhìn thấy** trong repo QC (mặc định `docs/`, **không**
phải `.agent/` ẩn) để đội QC mở và xử lý output dễ dàng. Spec chính thức ở lại spec submodule
của PO — đừng ghi artifact QC vào đó.

> **Sổ trace KHÔNG theo layout này.** Nó vẫn là `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{active_platform}.tsv`
> — một sổ cho mỗi (UC × nền), vì mỗi hàng là một scenario. Liên kết giữa hai bên đi qua
> **cột `UC`** của bảng gap, không qua đường dẫn file.

---

## 4 — `uc_list`

Glob `{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/*.feature`. Mỗi file → một
UC: đọc `# @trace.id` (mã UC) và `# @trace.status` từ header.

Chia hai nhóm:

| Nhóm | Điều kiện | Xử lý |
|---|---|---|
| **Trong phạm vi** | `@trace.status: approved` | phân tích / thiết kế / chạy bình thường |
| **Chưa xét** | khác `approved` | **KHÔNG** phân tích; vẫn ghi một hàng vào bảng phạm vi kèm trạng thái thật |

In bảng phạm vi ra trước khi làm gì:
```
Phạm vi QC — {TICKET-ID} / {active_platform}
  ✅ {UC-ID}  {tên UC}                     approved
  ⏸  {UC-ID}  {tên UC}                     draft   → chưa xét
  → {n} UC trong phạm vi · {m} chưa xét
```

**Cờ `--include-draft`:** phân tích cả UC chưa duyệt, nhưng **vẫn in bảng trên** và đánh dấu
trong artifact là dựa trên BDD nháp.

**Không UC nào `approved` và không có `--include-draft` → DỪNG:**
```
❌ {TICKET-ID} ({active_platform}): 0/{n} UC có BDD approved — không có gì để chạy.
   Cách đúng: người duyệt đặt `# @trace.status: approved` rồi chạy lại.
   Muốn chạy sớm trên BDD nháp (prototype): thêm --include-draft
```

> **Vì sao có `--include-draft` chứ không chặn cứng.** QC sớm trên BDD nháp là một cách dùng
> **cố ý được cho phép** từ trước (guard cũ là cảnh báo mềm, không phải chặn). Bỏ hẳn nó là
> lấy đi một năng lực đang có mà không ai khai. Còn để mặc định `approved`-only thì cái
> thường gặp là cái an toàn, và cái sớm phải nói ra.

> **Vì sao `--yes` không thay được `--include-draft`.** `--yes` nghĩa *"tôi không ngồi đây để
> trả lời"*; `--include-draft` nghĩa *"tôi biết BDD còn nháp và vẫn muốn chạy"*. Gộp hai cái
> là để một lần chạy headless âm thầm phân tích spec chưa chốt rồi bàn giao như thể đã chốt.


> **Trạm này vẫn gọi theo TỪNG UC** *(B11)* — thiết kế và chạy test **thật sự** làm tăng dần
> theo UC, nên giữ khả năng làm UC1 khi UC3 chưa xong là đúng. Chỉ **chỗ đọc/ghi** đổi: mọi
> artifact nằm chung ở `{qc_artifact_dir}` cấp PRD, không còn một thư mục mỗi UC.
>
> Nên `DOC_GAP.md` / `TEST_PLAN.md` đọc được ở đây phủ **cả PRD**: **lọc theo cột `UC`** để lấy
> phần của UC đang làm. Đừng coi toàn bộ bảng gap là của UC này — sẽ chặn oan.

---


---

## Role

Bạn là **QC Reviewer** — gate review dùng chung, chạy hai lần trong pipeline:
1. **Sau qc-design-test** → review test-case `.Test.md` (coverage, độ rõ ràng, trace).
2. **Sau qc-run-test** → review Python script / Page Object đã sinh.

Phát hiện mode: nếu artifact target là `.Test.md` → review test-case; nếu file Python test/PO
tồn tại cho UC và mới hơn → review script. Nếu mơ hồ, hỏi.

## Skills (`{paths.qc_skills_dir}/qa-reviewer/`)

Chọn theo mode + layer, nạp MỘT file:
- Review test-case: `test-case/{functional,e2e,integration,non-functional,exploratory}.md`
- Review script: `script/{functional,e2e,integration,non-functional,exploratory}.md`

## Review focus

- **Test-case:** mọi `{UC-ID}-SC{N}` đã phủ? happy + negative + boundary? expected cụ thể? trace (`BR-xx` + `@trace.verifies` SC) có mặt? không có TC orphan?
- **Script:** khớp `.Test.md` 1-1? Page Object 3 lớp + BasePage gọn? `expect()` không phải bare assert? không hard-code URL/cred/timeout, không `time.sleep`, không Allure? selector theo priority (data-testid→role→…)? 100% TC đã script (không còn Draft)?

Sinh findings (severity + vị trí + fix). Verdict APPROVED hoặc NEEDS_FIX.

## Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/qc-review Hoàn tất — {UC-ID} ({test-case | script} review)
Verdict: {APPROVED | NEEDS_FIX} — {N} findings ({crit} critical)
Next (test-case APPROVED): /qc-run-test {UC-ID}
Next (script APPROVED)   : /qc-report {UC-ID}  rồi tạo PR
     (NEEDS_FIX → fix artifact bị gắn cờ, rồi chạy lại /qc-review {UC-ID})
```

# /review-context — Review PRD hoặc BDD về Chất lượng & Tính nhất quán

**Chế độ phân tích READ-ONLY — ghi file findings, KHÔNG sửa target.**
**Dùng `--resume` để áp dụng các finding được chấp nhận.**

## Gate

*Checkpoint: **không chặn** — read-only (ghi findings vào .agent/review/). Gate Bước 3 bỏ qua CHECKPOINT (Bước 3a).*

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một file PRD `.md` hoặc file BDD `.feature`.
Nếu path là file PRD (`{TICKET-ID}-{prd-slug}.md` — file `.md` ở gốc feature folder `{paths.specs_dir}/{domain}/{prd-slug}/`) → PRD Review Mode.
Nếu path kết thúc bằng `.feature` → BDD Review Mode.
Nếu `$ARGUMENTS` chứa `--resume` → bỏ qua sang Resume Mode bên dưới.
Nếu `$ARGUMENTS` chứa `--fix` → bỏ qua sang Fix Mode bên dưới (áp dụng ngay mọi finding auto-fixable).*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Ngôn ngữ nghiệp vụ
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


> **Áp ở đâu:** guard này chạy **cả pha PHÂN TÍCH** (khi sinh `finding`/`suggestion`) **lẫn pha ÁP fix** (Fix/Resume), cho **cả PRD lẫn BDD** — cả hai đều là tài liệu nghiệp vụ (BDD đứng **TRƯỚC** `generate-tech-docs`, nên giọng văn reviewer vẫn phải thuần nghiệp vụ). Trước khi ghi file findings, quét `finding` + `suggestion` của **mọi** finding qua guard — đây là prose PO/BA đọc, phải **thuần nghiệp vụ** (gồm Nhóm 4 ẩn dụ dữ liệu). Field `quote` **MIỄN** (trích nguyên văn target — được phép chứa từ kỹ thuật, kể cả đoạn Gherkin đang bị bắt lỗi). **Riêng BDD:** danh từ **cấu trúc** của tài liệu — `Scenario`/`Given`-`When`-`Then`/`Background`/data table/tag `@trace`/Coverage Matrix/side-effect — là từ vựng hợp lệ, guard **KHÔNG** tính là "thuật ngữ kỹ thuật" (giống P0/P3 được miễn danh từ hạ tầng). R3 (no-tech *trong step* Gherkin) vẫn là luật riêng của nội dung BDD, độc lập với guard này.

---

## Phát hiện Review Mode

Sau khi phân giải target file:
- File `.feature` → **BDD Review Mode** (nhảy tới section BDD)
- File `.md` ở gốc feature folder `{paths.specs_dir}/*/*/` (không phải dưới `bdd/`·`tech-docs/`·`design-spec/`) → **PRD Review Mode** (tiếp tục bên dưới)
- Không xác định → hỏi: "Đây là file PRD hay file BDD feature? (prd/bdd)"

Đồng thời kiểm tra flag:
- Có `--fix` → sau khi chạy hết các check, áp dụng ngay các finding `auto_fixable: true` (bỏ qua Review Board)
- Có `--resume` → bỏ qua phân tích hoàn toàn, sang Resume Mode

Suy ra tên file findings output:
- PRD: `{paths.refinement_dir}/{prd-slug}-review-context-findings.yaml`
- BDD: `{paths.refinement_dir}/{uc-id}-{platform}-review-bdd-findings.yaml` — `{platform}` đọc từ `@trace.platform` của header `.feature` target (web/app/system). **Bắt buộc có platform**: mỗi UC có `.feature` riêng theo platform cùng `@trace.id`, nên tên file thiếu platform sẽ khiến review platform này **đè** findings platform khác (đối xứng với sổ TSV `{UC-ID}-{platform}.tsv`).

---

## Quy trình Review
# Review Fan-Out toàn diện + Hội tụ về độ đầy đủ

**Vì sao có cái này:** Một lượt review đơn không bao giờ liệt kê hết mọi vấn đề cùng lúc — model
dừng ở mức "đủ" findings, nên mỗi vòng review sau lại lòi ra vấn đề *mới*
(đập chuột chũi). Quy trình này ép review **hội tụ trong một lần chạy lệnh**:
fan out song song theo các chiều review, rồi lặp một critic độ-đầy-đủ cho tới khi một
vòng không sinh thêm gì mới, *trước khi* ghi file findings.

Lệnh gọi cung cấp hai thứ bắt buộc + hai tuỳ chọn:
- **DIMENSIONS** — danh sách các chiều review để fan out
  (`/refine-prd` → 4 lăng kính; `/review-context` → các P-check hoặc B-check; `/qc-analyze` → 3 lăng kính quét gap).
- **FINDINGS SCHEMA** — dạng YAML mà mỗi finding phải theo (định nghĩa trong lệnh).
- **GRANULARITY** *(tuỳ chọn, mặc định `auto`)* — `auto`: chọn độ mịn fan-out theo bảng ngưỡng kích thước ở Phase 1 (hành vi cũ). `per-uc`: **LUÔN** fan-out theo từng UC, **bỏ qua ngưỡng** — dùng cho review cần độ đầy đủ cao (`/refine-prd` truyền cái này để lần đầu đã quét sâu). Lệnh không truyền → `auto` → hành vi không đổi.
- **CHANGED_SCOPE** *(tuỳ chọn)* — danh sách UC/section đã thay đổi (review **delta**). Nếu được truyền, Phase 1 chỉ fan-out trên các phạm vi này + PRD-global; Phase 2 critic vẫn quét **toàn doc** làm lưới an toàn. Không truyền → quét toàn bộ như thường.
- **VERIFY** *(tuỳ chọn, mặc định `off`)* — `on` chèn **Phase 2.5** (`steps/gap-verify.md`) giữa critic và dedup: mỗi finding phải mở lại tài liệu nguồn tự chứng minh trước khi được giữ. Không truyền → hành vi không đổi.

> **Bỏ qua ở chế độ sub-agent:** Nếu Gate Bước 0 đã set `_agent_mode: true`, toàn bộ
> quy trình này bị **bỏ qua** — orchestrator đã chạy sẵn một dimension/UC cho mỗi
> sub-agent. Chạy các check của lệnh trực tiếp trên section đã giới hạn và trả về findings.

---

## Phase 1 — Quét dimension song song

**Bao nhiêu sub-agent:** *số lượng* agent không phải là đòn bẩy độ đầy đủ — bề rộng được
cố định bởi taxonomy DIMENSION (thêm agent vào cùng một dimension chỉ tìm lại cùng vấn đề),
còn *độ sâu* thuộc về vòng lặp critic ở Phase 2.

**Nếu `GRANULARITY = per-uc`:** **bỏ qua bảng ngưỡng dưới đây**, luôn dùng độ mịn **DIMENSION × phạm vi UC** (kể cả PRD nhỏ) — đảm bảo quét sâu, không bỏ sót ngay lần đầu. (Cái giá: nhiều agent hơn cho PRD nhỏ — chấp nhận để lần đầu đầy đủ.)

**Nếu `GRANULARITY = auto`** (mặc định): chọn **độ mịn fan-out** theo kích thước target, tái dùng ngưỡng của `steps/spawn-agent.md`:

| Kích thước target | Độ mịn | Số agent |
|-------------|-------------|-------------|
| ≤ 3 UC **và** ≤ 300 dòng | một agent cho mỗi DIMENSION trên cả file | = số dimension |
| > 3 UC **hoặc** > 300 dòng | một agent cho mỗi **DIMENSION × phạm vi UC** (các UC + một phạm vi PRD-global), gom batch để vừa giới hạn agent | `dimensions × (UCs + 1)`, có cap (xem dưới) |

Độ mịn lớn hơn giữ context của mỗi sub-agent nhỏ và quét nó vét cạn trên một
UC duy nhất — chính là điều ngăn bỏ sót trên các PRD lớn.

> **Các section global (không thuộc UC) — bắt buộc ở chế độ `DIMENSION × UC`.** Mỗi agent per-UC chỉ
> thấy một UC, nên các section toàn-PRD không thuộc UC nào (scope, success metric,
> problem statement, terminology, glossary, changelog) sẽ không được quét. Khi nào
> fan out theo UC, cũng phải thêm một phạm vi **"PRD-global"** (các section không thuộc UC, finding nhận
> `uc_id: ""`) bên cạnh danh sách UC. Nên số agent tự nhiên là `dimensions × (UCs + 1)`.
> (Không cần ở chế độ whole-file — ở đó mỗi agent đã thấy các section global rồi.)

### Agent cap — gom batch các UC khi fan-out quá rộng

`dimensions × (UCs + 1)` có thể bùng nổ trên PRD lớn (vd 6 check × (8 UC + 1) = 54
agent). Giới hạn mỗi wave ở **`AGENT_CAP = 12`** agent và gom batch các phạm vi UC cho vừa:

1. Dựng danh sách phạm vi = `[UC1, UC2, …, UCn, PRD-global]` (độ dài `UCs + 1`).
   - **Nếu `CHANGED_SCOPE` được truyền (review delta):** danh sách phạm vi = `[các UC trong CHANGED_SCOPE] + [PRD-global]` (chỉ các UC đã đổi + global), KHÔNG phải tất cả UC. Số agent tụt theo đó.
2. Tính số-phạm-vi-mỗi-bucket: `groups = max(1, floor(AGENT_CAP / dimensions))`.
   - Nếu `groups ≥ UCs + 1` → không cần batch, chạy một agent cho mỗi `DIMENSION × scope`.
   - Else chia danh sách phạm vi thành `groups` bucket liền kề kích thước xấp xỉ bằng nhau
     (giữ `PRD-global` ở bucket riêng nếu vừa; nếu không thì gắn vào bucket cuối).
     Mỗi agent khi đó xử lý **một DIMENSION trên một bucket UC**.
3. Kích thước wave kết quả = `dimensions × groups ≤ AGENT_CAP`.

Một agent đã batch review nhiều UC cùng lúc — vẫn giới hạn chặt hơn nhiều so với cả
file, nên độ phủ vẫn cao. `AGENT_CAP` là núm chỉnh duy nhất; tăng nếu host cho phép
concurrency nhiều hơn, giảm để tiết kiệm token. Chế độ whole-file (≤ 3 UC) không bao giờ chạm cap.

Spawn các sub-agent đã chọn bằng Agent tool (gửi trong một message duy nhất để chúng
chạy đồng thời). Mỗi sub-agent nhận một **context window mới** và quét phạm vi của nó
chỉ qua **một** dimension duy nhất — độ phủ sâu hơn một session phải tung hứng mọi
dimension cùng lúc (tránh lost-in-the-middle).

Template prompt cho sub-agent (điền vào các ngoặc):

```
You are a {DIMENSION_NAME} reviewer. Read the full target file at {target_file}.
Scope: review ONLY through the {DIMENSION_NAME} lens/check — {DIMENSION_DESCRIPTION}.
Be exhaustive: scan every section, every UC, every AC/BR/scenario. Do not stop early.
Project context (terminology, entities, architecture):
{slim_context — banned terms, canonical entities, layer order, domains}

Return a JSON array of findings, each:
{ "dimension": "{DIMENSION_NAME}", "severity": "critical|major|minor",
  "section": "...", "uc_id": "...", "quote": "<verbatim ≤120 chars>",
  "finding": "...", "suggestion": "...", "auto_fixable": true|false }
Return [] if this dimension is clean. Return ONLY the JSON array.
```

Gom mảng findings của mọi sub-agent vào một danh sách hợp nhất `ALL_FINDINGS`.

---

## Phase 2 — Vòng lặp hội tụ critic độ-đầy-đủ

Đây là bước chống đập-chuột-chũi. Lặp cho tới khi **hai vòng liên tiếp thêm 0 finding
mới**, hoặc tới cap cứng **3 vòng**, cái nào đến trước:

> **Lưu ý delta:** kể cả khi `CHANGED_SCOPE` giới hạn Phase 1 vào các UC đã đổi, completeness-critic ở Phase 2 **vẫn đọc TOÀN bộ doc** — đây là lưới an toàn bắt các vấn đề mà một fix ở UC đã đổi có thể làm lộ ra ở chỗ khác.

1. Spawn một sub-agent **completeness-critic** bằng Agent tool. Cho nó:
   - toàn bộ target file (`{target_file}`),
   - danh sách findings đã ghi nhận dưới dạng **slim JSON** — chỉ 3 fields cốt lõi
     đủ để critic nhận ra trùng lặp (không cần `quote`, `suggestion`, `auto_fixable`, `severity`):
     ```json
     [
       { "uc_id": "...", "section": "...", "finding": "..." },
       ...
     ]
     ```
     Nếu `ALL_FINDINGS` vượt 60 items, rút gọn `finding` xuống còn 80 ký tự đầu mỗi item.
   - cùng slim context (banned terms, canonical entities, layer order, domains).
   Prompt nó:
   ```
   Here is a document and a list of issues already found. Read the WHOLE document.
   List ONLY real, additional issues NOT already in the list — gaps, ambiguities,
   contradictions, missing edge/negative paths, coverage holes, terminology drift,
   structural omissions, and any issue that a fix to an existing finding would expose.
   ALSO flag ROLE-BOUNDARY / altitude violations (you are NOT limited to adding detail):
   content sitting in the WRONG section — detailed mechanism (retry counts, timeouts, flag
   names/owners, error branches) written INSIDE an acceptance criterion or a scope line
   instead of the Business Rule/Logic section; an AC that merely restates its referenced BR
   (same content, converged); a term definition crammed into In/Out Scope. For these, the
   suggestion must be to MOVE the detail to its proper section (AC keeps only the observable
   outcome + BR ref) — NOT to delete it, and NOT to add more detail.
   Do NOT repeat anything already listed. Return the same finding JSON shape, or [] if
   nothing new.
   ```
2. Thêm bất kỳ finding thực sự mới (chưa có trong `ALL_FINDINGS`) vào danh sách.
3. Nếu vòng này trả 0 finding mới → tăng bộ đếm dry-round; ngược lại reset về 0.
4. Dừng khi bộ đếm dry-round đạt 2, hoặc sau tổng cộng 3 vòng.

Ghi lại `convergence_rounds` (số vòng critic đã chạy) cho report.

---

## Phase 2.5 — Thẩm định *(chỉ chạy khi `VERIFY = on`)*

**Vì sao có bước này.** Phase 1 và Phase 2 chỉ có **một chiều lực**: fan-out mở rộng bề
ngang, critic lặp cho tới khi không còn gì mới — cả hai đều hỏi *"còn thiếu gì nữa?"*.
Không có gì hỏi ngược lại *"cái vừa tìm ra có thật không?"*. Nên quy trình này đẩy **recall**
lên mà **không có gì kéo precision lại**, và càng lặp critic thì tỉ lệ finding bịa càng cao —
đúng thứ nó tự sinh ra: khẳng định hành vi tài liệu không nêu, trích evidence sai, hoặc gắn
nhãn vấn đề cho thứ thực ra là chuyện làm-kỹ-hơn.

Chạy `steps/gap-verify.md` trên `ALL_FINDINGS` với:
- `FINDINGS` = `ALL_FINDINGS` (sau Phase 2)
- `EVIDENCE_ROOT` = `{paths.specs_dir}` — hoặc giá trị lệnh gọi chỉ định
- `VERDICT_FIELD` = trường trạng thái của FINDINGS SCHEMA mà lệnh định nghĩa
- `RERATE` = `on`

Finding bị `❌ INVALID` / `⚠️ RECLASSIFY` / `🔁 MERGE` **không đi tiếp sang Phase 3** — nhưng
**KHÔNG bị xoá**: chúng vào file findings với trạng thái đóng + lý do, để người đọc kiểm chứng
được vì sao chúng bị loại. Ghi lại số liệu verdict cho report.

> **Chạy TRƯỚC Phase 3, không phải sau.** Dedup và giải quyết xung đột là việc tốn suy luận;
> làm nó trên một tập còn lẫn finding bịa là vừa phí, vừa nguy hiểm — một finding ảo có thể
> "thắng" một finding thật ở bước giữ-cái-severity-cao-hơn.

---

## Phase 3 — Dedup, giải quyết xung đột, merge

Các sub-agent chạy **mù với nhau** (độc lập = độ phủ đa dạng). Chúng không bao giờ
trao đổi hay điều hoà giữa chúng — mọi xử lý trùng/xung đột diễn ra **ở đây trong
orchestrator**, nơi thấy toàn bộ tập findings.

1. **Khử trùng lặp** `ALL_FINDINGS`: hai finding là trùng nếu cùng nhắm tới cùng
   `section` + `uc_id` và mô tả cùng một vấn đề gốc. Giữ cái có `suggestion`
   phong phú hơn; nếu khác nhau về severity, giữ severity **cao hơn**.
2. **Giải quyết xung đột** — nhóm các finding còn lại theo `section` + `uc_id` và kiểm tra
   mâu thuẫn (hai finding có `suggestion` không thể cùng áp dụng, hoặc đề xuất sửa ngược nhau cho cùng một chỗ):
   - Nếu hai đề xuất có thể **merge** thành một bản sửa mạch lạc → merge thành một finding duy nhất.
   - Nếu chúng **loại trừ lẫn nhau** → phát ra **một** finding nêu cả hai phương án
     và set `auto_fixable: false` với `status: "needs_discussion"` (PRD) /
     `status: "pending"` (review) để con người chọn — không bao giờ âm thầm bỏ một bên.
   - Nếu một finding bị **vô hiệu** bởi finding khác (vd một finding cấu trúc nói một section
     bị thiếu, nhưng một finding khác trích dẫn nội dung từ chính section đó) → bỏ cái không hợp lệ.
3. **Sắp xếp** theo severity (critical → major → minor), rồi theo thứ tự `section` trong file.
4. **Gán ID ổn định** `F001, F002, …` theo thứ tự đã sắp đó.
5. Map `dimension` của mỗi finding vào field schema của lệnh
   (`lens` cho `/refine-prd`; `check_id` cho `/review-context`).
6. Ghi **một** file findings duy nhất theo FINDINGS SCHEMA mà lệnh định nghĩa.

Trong report cuối của lệnh, thêm một dòng:
```
Convergence: {convergence_rounds} vòng critic — file findings đã đầy đủ; chạy lại sẽ lòi ra 0 vấn đề mới.
```


**Các check dưới đây map vào quy trình như sau:**
- **DIMENSIONS** = các nhóm check theo mode phát hiện được — PRD: `P1, P2, P4, P5`; BDD: `B1, B2, B3, B4, B5, B6`. Fan out một sub-agent cho mỗi nhóm check, mỗi cái quét toàn bộ target file chỉ cho nhóm đó.
- **Check do orchestrator chạy (không fan out):** `P0` (umbrella routing) và `P3` (xung đột cross-PRD) cần config / context của PRD khác — orchestrator tự chạy chúng **trước** fan-out và thêm kết quả vào `ALL_FINDINGS`.
- Vòng lặp completeness-critic (Phase 2) đảm bảo file findings đầy đủ trong một lần chạy — chạy lại `/review-context` sẽ lòi ra **0 finding mới**. Map mỗi dimension vào field `check_id` của schema dưới đây.

**Tham số truyền vào Quy trình Review:**
- `GRANULARITY = per-uc` — LUÔN fan-out theo từng UC (bỏ ngưỡng cả-file), để **cổng review bắt đủ lỗi ngay lần đầu** (cổng cuối trước khi sinh BDD — sót ở đây thì test sai theo).
- `CHANGED_SCOPE` — theo full/delta dưới đây.
- **Ngôn ngữ finding (mọi dimension):** khi fan-out — PRD `P1/P2/P4/P5` **và** BDD `B1–B6` — thêm vào `DIMENSION_DESCRIPTION` của mỗi sub-agent chỉ dẫn: *"Đây là tài liệu nghiệp vụ (đứng TRƯỚC `generate-tech-docs`) — `finding` và `suggestion` viết bằng lời nghiệp vụ cho PO/BA, KHÔNG kê cơ chế/giải pháp kỹ thuật (retry/timeout/API/selector/cấu trúc dữ liệu). PRD: cơ chế lạc tầng → đề xuất DI DỜI xuống BR/BL bằng business logic. BDD: step lấn kỹ thuật → đề xuất diễn đạt lại bằng hành vi nghiệp vụ quan sát được (danh từ cấu trúc Gherkin/`@trace` được phép). `quote` giữ nguyên văn."* (Xem "Nguyên tắc chung" ở đầu mỗi Review Mode.)

**Chọn full vs delta** *(mặc định: lần đầu FULL, lần sau DELTA)*:
1. Tách `--full` khỏi `$ARGUMENTS` nếu có.
2. Kiểm tra file findings của target (tên suy ở "Phát hiện Review Mode"):
   - **Không tồn tại** (lần đầu) → **FULL**: KHÔNG truyền `CHANGED_SCOPE`.
   - **Tồn tại** + có `--full` → **FULL**: bỏ qua findings cũ.
   - **Tồn tại** + KHÔNG `--full` → so `source_version` trong findings cũ với version target hiện tại (PRD: Metadata `Version`; BDD: `@trace.bdd_version`):
     - **Bằng nhau** (target chưa đổi từ lần review trước) → DỪNG, báo: `"Target chưa đổi từ v{X} (lần review gần nhất). Không có gì để review lại — dùng --full nếu vẫn muốn quét toàn bộ."`
     - **Khác** → kiểm tra `applied_to_version` trong findings cũ (version mà lần `--fix`/`--resume` gần nhất của CHÍNH lệnh này đã bump target tới) để biết ai gây ra thay đổi:
       - **`applied_to_version` có mặt VÀ `==` version target hiện tại** → target đổi đúng bằng phần lệnh này tự áp, không actor khác động vào → **DELTA**: `CHANGED_SCOPE` = { `uc_id`/`section` của finding đã xử lý (status `accepted`/`modified`/`applied`) trong findings cũ } ∪ { UC có trong target hiện tại nhưng chưa từng xuất hiện ở findings cũ }.
       - **`applied_to_version` vắng mặt HOẶC `≠` version hiện tại** → target đã bị sửa bởi **actor khác** (lệnh `/refine-prd`, `/generate-bdd` regen, sửa tay…) sau lần áp này → KHÔNG tin được phạm vi hẹp → **FULL** (KHÔNG truyền `CHANGED_SCOPE`), kèm cảnh báo: `"Target đổi ngoài tầm theo dõi của findings (applied_to_version={A} ≠ hiện tại={C}); quét lại toàn bộ để khỏi sót UC do người/lệnh khác sửa."`

---

## PRD Review Mode

> **Nguyên tắc chung cho mọi P-check — soi bằng mắt kỹ thuật, VIẾT bằng lời nghiệp vụ.**
> Các check dùng con mắt kỹ thuật để **phát hiện** chỗ nghiệp vụ mô tả thiếu/mơ hồ/mâu thuẫn/lấn tầng — mục tiêu là **làm rõ vấn đề nghiệp vụ để sau xử lý được về kỹ thuật**. **KHÔNG** đưa góc nhìn kỹ thuật vào PRD, **KHÔNG** đề xuất giải pháp/cơ chế kỹ thuật (số lần retry, timeout, cấu trúc dữ liệu, API, thư viện). Mọi `finding` và `suggestion` phải **thuần nghiệp vụ** (tuân Business Language Guard ở trên, gồm Nhóm 4). Altitude: khi chỉ ra cơ chế lạc chỗ, suggestion là **DI DỜI xuống BR/BL** và diễn đạt bằng *business logic*, KHÔNG viết lại thành chi tiết code. `quote` giữ nguyên văn.
> *(P0/P3 nói về routing/metadata & xung đột cross-PRD — được nhắc "service/domain/config" như danh từ hạ tầng hợp lệ; nguyên tắc này chủ yếu siết nội dung nghiệp vụ ở P1/P2/P4/P5.)*

### P0 — Umbrella Routing Check (chỉ chế độ umbrella)

*Bỏ qua hoàn toàn check này nếu `setup.mode` không phải `"umbrella"` (tức không có section `services` trong project-context.yaml).*

Khi `setup.mode = umbrella`, PRD phải có metadata routing đúng để context-loader Bước 1.5 có thể đưa output sinh ra tới đúng service submodule. Chạy các check này **trước P1–P5**:

> **Nguồn đọc:** PRD mang **Domain** ở **bảng Metadata** (`| **Domain** | … |`) — **KHÔNG** phải frontmatter `@trace.*` (cái đó dành cho file `.feature`/tech-docs do máy đọc). Routing umbrella dựa trên Domain (bảng) + path, đúng như context-loader Bước 1.5.

**P0.1 — Row `Domain` có mặt trong Metadata**
- Đọc bảng Metadata của PRD, lấy row `| **Domain** |`.
- Nếu **vắng mặt / để trống** → finding **critical**:
  - `finding`: "Row `Domain` trong bảng Metadata đang thiếu. Umbrella routing của team dev phụ thuộc Domain (+ path) để đưa BDD và code output tới đúng service submodule."
  - `suggestion`: "Thêm `| **Domain** | {domain} |` vào bảng Metadata. Dùng một trong các domain key được định nghĩa trong section services của `project-context.yaml` của umbrella."
  - `auto_fixable: false` — PO phải confirm tên domain đúng

**P0.2 — `Domain` khớp một service key**
- Nếu Domain có mặt, kiểm tra giá trị của nó có khớp key nào trong section `services` của project-context.yaml không.
- Nếu **không khớp** → finding **critical**:
  - `finding`: "Domain `{value}` không khớp key nào trong config `services` của umbrella. Routing sẽ fallback về path mặc định và BDD có thể được sinh sai chỗ."
  - `suggestion`: "Hoặc cập nhật row Domain cho khớp một service key có sẵn ({list known keys}), hoặc thêm entry mới vào `services` trong project-context.yaml cho domain `{value}`."
  - `auto_fixable: false`
- Nếu section `services` chưa được cấu hình (rỗng/placeholder) → finding **major**:
  - `finding`: "Section `services` của umbrella chưa được cấu hình. Không thể kiểm chứng domain routing."
  - `suggestion`: "Cập nhật section services trong `.agent/project-context.yaml` với mapping domain-to-submodule trước khi sinh BDD."
  - `auto_fixable: false`

> **Status KHÔNG còn là check của P0.** PRD chưa duyệt (`Status: draft`) là trạng thái **bình thường** lúc review — việc duyệt diễn ra *sau khi* review-context sạch, nên báo draft là "lỗi" ở đây chỉ gây nhiễu. Gác duyệt do `/generate-bdd` lo (cảnh báo mềm, áp **mọi mode**); lời nhắc đặt `approved` nằm ở Report (mọi mode). P4 chỉ lo trường hợp row Status **vắng mặt** (auto-fix mặc định `draft`).

> **P0 là một gate check:** Nếu P0.1 hoặc P0.2 cho finding critical, hiển thị cảnh báo trước khi tiếp tục:
> ```
> ⚠️  ROUTING WARNING: phát hiện vấn đề Domain trong Metadata.
>    BDD/code sinh từ PRD này có thể rơi vào sai service submodule.
>    Giải quyết các finding P0 trước khi chạy /generate-bdd.
> ```
> Rồi tiếp tục với P1–P5 (đừng abort — PO có thể đang review PRD giai đoạn sớm).

### P1 — Terminology Check (Business Dictionary)

Nạp `{paths.business_dictionary}`.
Quét toàn bộ PRD tìm vấn đề thuật ngữ:

1. **Banned terms** — mọi lần xuất hiện của một term trong §Banned Terms:
   → Severity: **critical**. AI có thể auto-fix khi `--resume`.

2. **Dùng không nhất quán** — cùng một khái niệm được đặt tên khác nhau giữa các section:
   → Severity: **major**. Gắn cờ cả hai chỗ. Người quyết định dạng chuẩn trong note Review Board.

3. **Business term chưa liệt kê** — các term quan trọng vắng trong dictionary:
   → Severity: **minor**. Đề xuất thêm vào `business-dictionary.md`.

4. **Thuật ngữ kỹ thuật/UI lọt vào prose nghiệp vụ** — theo baseline **Business Language Guard** (re-render, UI, timeout, spinner, API/endpoint/token…), không nằm trong dictionary nhưng vẫn là từ kỹ thuật:
   → Severity: **major**, auto-fixable. `suggestion` theo guard: diễn đạt lại (Nhóm 1) / chuyển Design Spec (Nhóm 2) / bỏ về Tech Docs (Nhóm 3).

### P2 — Ambiguity Check

Quét mỗi AC và BR tìm:

| Tín hiệu | Ví dụ | Severity |
|--------|---------|----------|
| Định lượng mơ hồ | "nhanh", "lớn", "hợp lý", "mau" | Critical |
| Thiếu actor | "hệ thống nên" mà không nêu trigger | Major |
| Tham chiếu chưa định nghĩa | "{SomeThing}" được dùng nhưng chưa định nghĩa trong PRD này | Major |
| Thiếu luồng âm | AC chỉ mô tả happy path nhưng BR có điều kiện lỗi | Minor |
| Câu bị động giấu actor | "Invoice is created" — ai tạo? | Minor |
| **AC lấn tầng (chứa cơ chế)** | AC ghi số lần retry / timeout / tên-chủ cờ / nhánh lỗi chi tiết — cái này thuộc BR/BL | Major |
| **AC ≈ BR (trùng nội dung, hội tụ tầng)** | AC lặp lại đúng nội dung BR nó ref | Major |

→ AI không thể auto-fix finding P2. Người viết bản fix trong note "Modify". Với 2 tín hiệu **altitude** (AC lấn tầng / AC≈BR): suggestion là **DI DỜI chi tiết cơ chế xuống BR/BL (§3), AC giữ outcome + ref** — không xoá, không phình.

### P3 — Domain Conflict Check

Liệt kê tất cả PRD khác trong `{paths.specs_dir}/{domain}/*/*.md` (file `.md` ở gốc mỗi feature folder = PRD).
Với mỗi PRD, kiểm tra xem PRD này có mâu thuẫn với một BR đã định nghĩa không (cùng trigger, khác outcome)
hoặc định nghĩa lại field/status transition của một entity khác đi.

→ Severity: **critical**. Người quyết định PRD nào đúng. Bắt buộc có note.

### P4 — Structural Completeness

Đối chiếu với cấu trúc template PRD (Metadata · §1 Tổng quan · §2 AC · §3 UC · §4 UI/UX · Appendix · Change Log):

- [ ] **Metadata** có: Version, Status, Author, Created, Updated, Domain, Ticket (PO nếu có)
- [ ] **§1c "Phụ thuộc liên service"** có mặt (hoặc ghi rõ "Không có")
- [ ] **§2 Acceptance Criteria** (global) có mặt; **mỗi AC** kết thúc bằng ref `_(BR: …)_` (≥1 BR)
- [ ] **≥1 UC** với heading `#### {TICKET-ID}-UC{N}:`
- [ ] Mỗi UC có: **Actor, Description, Pre-condition, Post-condition, AC liên quan**, bảng Business Rule (AC là §2 global — UC chỉ trỏ qua "AC liên quan", KHÔNG chứa AC đầy đủ)
- [ ] **Nhất quán 2 chiều**: tập "AC liên quan" của mỗi UC = tập AC §2 có ref BR trỏ về UC đó
- [ ] **§4 UI/UX**: có User Flow và **Wireframe** (Wireframe lái coverage BDD C.1)
- [ ] **API Source nhất quán**: nếu Metadata `API Source: existing` → Appendix "Existing API Contract" đủ method/path/request/response (hoặc có block ⛔ PENDING + con trỏ nguồn); nếu greenfield/partner (API Source trống) → section "Existing API Contract" đã bị **xoá hẳn** (không để bảng rỗng)
- [ ] Có section `# Change Log`
- [ ] Không còn giá trị `{{PLACEHOLDER}}` chưa điền

→ Section/field thiếu hoặc lệch cấu trúc: **major**. AI có thể thêm skeleton khi `--resume` nếu được chấp nhận. Riêng **"Nhất quán 2 chiều"** lệch → **major**, `auto_fixable: false` (người xác nhận AC↔UC, AI không tự đoán). **API Source: existing thiếu contract** → **major**, `auto_fixable: false` (cần nguồn contract); **greenfield còn sót section "Existing API Contract" rỗng** → **minor**, `auto_fixable: true` (xoá section). Riêng **row `Status` vắng mặt** → **minor**, `auto_fixable: true` (thêm `| **Status** | draft |`) — KHÔNG flag *giá trị* draft (đó là trạng thái bình thường lúc review; gác duyệt do `/generate-bdd` lo).

### P5 — Custom Criteria (tuỳ chọn)

Nếu `$ARGUMENTS` chứa tiêu chí bổ sung sau path file, đánh giá chúng và tạo
finding với `check_id: "P5"` và severity phù hợp.

---

## BDD Review Mode

> **Nguyên tắc chung cho mọi B-check — BDD cũng là tài liệu nghiệp vụ (đứng TRƯỚC `generate-tech-docs`) → soi bằng mắt kỹ thuật, VIẾT bằng lời nghiệp vụ.**
> Các check dùng con mắt kỹ thuật để **phát hiện** step/scenario thiếu-phủ, sai thuật ngữ, lấn tầng kỹ thuật — nhưng `finding` và `suggestion` là prose **PO/BA đọc**, phải **thuần nghiệp vụ** (tuân Business Language Guard ở trên, gồm Nhóm 4). **KHÔNG** kê cơ chế/giải pháp kỹ thuật trong prose finding (API, selector, retry, timeout, cấu trúc dữ liệu, thư viện). Khi một step lấn kỹ thuật (R3), `suggestion` là **cách diễn đạt lại bằng hành vi nghiệp vụ quan sát được**, không phải chỉ dẫn code. `quote` giữ nguyên văn (được phép chứa đúng đoạn Gherkin kỹ thuật đang bị bắt lỗi).
> *(Miễn trừ: danh từ **cấu trúc** BDD — `Scenario`/`Given`-`When`-`Then`/data table/tag `@trace`/Coverage Matrix/side-effect — là từ vựng hợp lệ của tài liệu này, không bị guard tính là thuật ngữ kỹ thuật. Nguyên tắc này siết **giọng văn nghiệp vụ**, không cấm nhắc tên cấu trúc Gherkin.)*

### B1 — PRD Coverage Check

Nạp PRD được tham chiếu bởi `# @trace.prd:` trong header file feature.
Map các AC/BR **thuộc UC này** sang scenario — tập AC lấy từ dòng `**AC liên quan:**` của UC trong PRD §3, tập BR lấy từ bảng Business Rule của chính UC đó. AC ở PRD là **global cấp PRD** còn `.feature` là **per-UC**, nên KHÔNG đối chiếu toàn bộ §2 (sẽ ra MISSING giả cho AC thuộc UC khác):

```
AC1 ({short text}) → SC1, SC2  ✅
AC2 ({short text}) → MISSING   ❌
BR1 ({short text}) → SC1       ✅
BR2 ({short text}) → MISSING   ❌
```

→ Mỗi AC/BR thiếu coverage: finding **critical**.
   Nếu được chấp nhận trong Review Board, `--resume` sinh scenario còn thiếu.

### B2 — Terminology & Entity Check

Dùng `{paths.business_dictionary}` và `{paths.core_entities}`:

1. **Banned terms trong steps** → **critical**, auto-fixable khi `--resume`
2. **Tên entity không chuẩn** → **major**, auto-fixable
3. **Tên field không chuẩn trong data table** → **major**, auto-fixable
4. **Sample data trông kỹ thuật** (UUID, `item_123`) → **minor**, auto-fixable

### B3 — Gherkin Rules Check (R1–R10)

| Rule | Check | Auto-fixable? |
|------|-------|---------------|
| R1 | Mỗi scenario có Given + When + Then | No — cần thiết kế lại scenario |
| R2 | Không chained `When … Then … When` | No — cần thiết kế lại |
| R3 | Không UI selector / API path / tech term trong steps | Yes — thay bằng cách diễn đạt nghiệp vụ |
| R4 | Tên scenario là một business outcome | No — cần người đổi tên |
| R5 | Khai báo WHAT, không phải mệnh lệnh HOW | No — cần viết lại |
| R6 | `Then` khẳng định business outcome quan sát được | No — cần thiết kế lại |
| R7 | Giá trị cụ thể, không phải "valid data" | Yes — thay bằng giá trị thực tế |
| R8 | Mỗi scenario chạy độc lập được | No — cần thiết kế lại |
| R9 | Data table đủ cột cho Then | Yes — thêm cột còn thiếu |
| R10 | Cross-UC reference dùng cách diễn đạt navigation + Note | Yes — thêm comment Note |

→ Vi phạm R3, R7, R9, R10: auto-fixable. Còn lại cần người hướng dẫn qua note Review Board.

### B4 — Compliance Checks (C.1–C.5)

- [ ] C.1 Wireframe Coverage: mỗi component/action của màn hình có ≥1 SC → một finding cho mỗi mục thiếu
- [ ] C.2 PRD Traceability: đã phủ đầy đủ bởi B1 — KHÔNG tạo finding mới ở đây; dedup với finding B1
- [ ] C.3 Term Business Dictionary được dùng → giống B2
- [ ] C.4 Banned Terms: 0 banned term → **critical**, auto-fixable
- [ ] C.5 NHÓM Grouping: nếu ≥3 SC, gom nhóm theo business theme → **major**, auto-fixable

### B5 — Metadata & Structural Check

Header file phải đủ field `@trace.*` — kiểm **từng cái tường minh**, chia 3 nhóm theo mức thiệt hại khi thiếu:

**Nhóm A — chặn (`major`, `auto_fixable: true`; suy được từ path/PRD, không phải đoán):**

| Field | Thiếu thì hỏng gì | Nguồn để auto-fix |
|---|---|---|
| `@trace.id` | không định danh được UC | tên file |
| **`@trace.platform`** | **`/generate-code` không quyết được BE/FE** (`system`→BE · `web`/`app`→FE, và nó **cấm** fallback sang `platform_type`) · không định vị được sổ trace `{UC-ID}-{platform}.tsv` · không tìm được design-spec `-design-spec-{platform}-` · `/generate-tech-docs` + context-loader cũng đọc nó | segment `bdd/{platform}/` của chính path file |
| `@trace.domain` | routing service + path artifact sai | segment `{domain}/` của path |
| `@trace.prd` | B1 không nạp được PRD để đối chiếu coverage | `{TICKET-ID}` trong `@trace.id` |
| `@trace.prd_version` | `/validate-traces` Step 4 mù PRD drift | Metadata PRD |
| `@trace.bdd_version` | `/validate-traces` Step 5c mù BDD drift · cổng T3b của tech-doc mất mốc so | `1.0` nếu file mới |
| `@trace.status` | mất cổng duyệt BDD (`/generate-code` DS1) · `uc_status` không sync được | `draft` |

> `@trace.platform` là **`major`, không phải `minor`** — nó là field load-bearing nhất của header. Thiếu nó thì cả chuỗi codegen mất phương hướng, mà không lệnh nào báo lỗi.

**Nhóm B — thông tin (`minor`, auto-fixable):** `@trace.title`, `@trace.revision`, `@trace.author`, `@trace.created_at`, `@trace.business_rules`, `@trace.dataset`.
  - `@trace.revision` luôn là `1` (field tĩnh — xem generate-bdd.tmpl). Chỉ kiểm **có mặt**; KHÔNG gắn cờ giá trị là stale.

**Nhóm C — có điều kiện (chỉ flag khi điều kiện đúng; vắng trong ca còn lại là ĐÚNG, không tạo finding):**

| Field | Bắt buộc khi | Vắng khi nào là đúng |
|---|---|---|
| `@trace.module` | umbrella mode | spec repo mode; giá trị `unknown` cũng **hợp lệ**, không flag |
| `@trace.api_source` | `@trace.platform = system` **và** PRD Metadata có `API Source: existing` | mọi ca khác (greenfield / FE / App) |

> **Đừng flag Nhóm C khi không đúng điều kiện.** Trước đây B5 đòi `@trace.module` vô điều kiện, nên mọi `.feature` **đúng-theo-template** ở spec repo mode đều ăn finding minor — và `--fix` sẽ **thêm field bịa** vào header. Nhiễu review + làm bẩn spec.

> **`@trace.service` đã RỜI Nhóm C — giờ bắt buộc MỌI mode (`major`).** Từ khi trace TSV có cột `service` (cột 23), tag này là **nguồn duy nhất** của cột đó, và trace gộp (`spec_source`) **không tách theo service** — nên thiếu nó là mất hẳn thông tin sở hữu ở cấp row: dashboard không nhóm được coverage theo đội, `/validate-traces` không nói được "service X còn N chỗ lệch". Giá trị hợp lệ ở **mọi** mode: path service · `multi` (chưa chốt) · `unresolved` (routing sai) · `—` (single-service / spec repo mode). Auto-fix: suy từ `services.{domain}` trong `project-context.yaml`; không suy được → điền `—` ở single-service, hoặc `unresolved` kèm finding **major** ở umbrella (đó là lỗi cấu hình routing thật, đừng che).

- [ ] Mỗi scenario có `# @trace.scenario`, `# @trace.sc_version`, `# @trace.business_rules`, `# Side-effects:` → **minor**, auto-fixable
  - **Ngoại lệ `@trace.sc_version` → `major`:** nó là tín hiệu DUY NHẤT cho `/validate-traces` biết code của SC đó lỗi thời (`spec_ver != gen_ver` → `DRIFT`). Thiếu nó thì SC đó **vĩnh viễn** hiện `OK` dù scenario có đổi bao nhiêu lần. Auto-fix: thêm `1.0`.
- [ ] Không còn tag lạc ngoài contract — cụ thể `@trace.uc=` / `@trace.ac=` (vocabulary của proposal cũ, xem G11) hoặc tag vòng đời `@proposed` / `@from-test` rò vào BDD canonical → **minor**, auto-fixable (map sang `@trace.scenario`/`# Covers:`, strip tag vòng đời)
- [ ] Coverage Matrix ở cuối file → **major**, auto-fixable (AI sinh lại)
- [ ] Pre-merge Checklist ở cuối file → **minor**, auto-fixable

### B6 — Side-effect Completeness

Với mỗi scenario `@happy`:
- Comment `# Side-effects:` liệt kê tất cả side effect quan sát được
- Block `Then` có `And <side-effect>` cho mỗi side effect đã liệt kê

→ Thiếu assertion side-effect: **major**, auto-fixable.

---

## Ghi File Findings

Sau khi chạy hết các check, ghi `{paths.refinement_dir}/{slug}-review-*-findings.yaml`:

```yaml
source_file: "{absolute path to reviewed file}"
source_version: "{version target lúc sinh findings — PRD: Metadata Version; BDD: @trace.bdd_version — dùng chọn full/delta lần chạy sau}"
applied_to_version: ""   # để trống lúc phân tích; --fix/--resume sẽ ghi version target vừa bump tới. Lần delta sau: nếu version target hiện tại ≠ giá trị này → target bị actor khác sửa → fallback FULL (xem "Chọn full vs delta")
generated_at: "{ISO datetime}"
review_type: "{prd | bdd}"
status: "pending_review"

findings:
  - id: "F001"
    check_id: "P1"           # P1-P5 cho PRD; B1-B6 cho BDD
    severity: "critical"     # critical | major | minor
    section: "{section hoặc scenario ID nơi tìm thấy lỗi}"
    uc_id: "{UC-ID mà finding này thuộc về — PRD: UC heading; BDD: @trace.id; \"\" nếu global}"
    quote: "{trích đoạn nguyên văn copy CHÍNH XÁC từ file đang review tại vị trí lỗi, ≤120 ký tự}"
    finding: "{mô tả rõ ràng vấn đề}"
    suggestion: "{bản fix cụ thể, hành động được — AI sẽ áp dụng khi --resume nếu được chấp nhận}"
    auto_fixable: true       # true = AI áp dụng được; false = người phải viết note trong Review Board
    status: "pending"        # pending | accepted | modified | rejected | needs_discussion | deferred | applied (vòng đời chung — xem chú thích dưới)
    applied_via: ""          # set khi status='applied': "fix" (auto qua --fix) | "resume" (người duyệt qua --resume)

summary:
  total_findings: {N}
  by_severity: { critical: {N}, major: {N}, minor: {N} }
  auto_fixable: {N}
  requires_human_decision: {N}
  recommendation: "APPROVED | NEEDS_REVISION | BLOCKED"
```

> **Vòng đời finding-level (CHUNG với `/refine-prd` — một Review Board đọc cả hai loại file nên enum phải khớp):**
> - `pending` → mới, chưa review
> - `accepted` → nhận suggestion gốc → `--resume` sẽ áp
> - `modified` → người đã sửa suggestion trong Review Board → `--resume` dùng bản đã sửa
> - `rejected` → bác bỏ, không áp
> - `needs_discussion` → xung đột/chưa ngã ngũ → **chặn** `--resume` (bỏ qua + cảnh báo) tới khi người quyết
> - `deferred` → cố ý hoãn (không chặn), bỏ qua lượt này, xem lại sau
> - `applied` → đã áp vào target; `applied_via` ghi cách áp: `"fix"` (auto qua `--fix`) hoặc `"resume"` (người duyệt qua `--resume`)

> **Field định vị (`quote` + `uc_id`) — bắt buộc cho source-jump của Review Board.**
> Với mỗi finding, copy một đoạn `quote` **nguyên văn** thẳng từ file đang review tại đúng
> chỗ lỗi xảy ra — KHÔNG diễn giải lại; nó được so khớp với tài liệu để định vị dòng.
> Đặt `uc_id` là Use Case sở hữu (`@trace.id` cho BDD, UC heading cho PRD; `""` nếu global).
> Hai field này cho phép reviewer click một finding trong Review Board và nhảy tới đúng vị trí nguồn.

## Định tuyến sau phân tích (Post-Analysis Routing)

Sau khi chạy hết các check và ghi file findings:

**Nếu có flag `--fix`** → nhảy tới Fix Mode (áp dụng ngay các finding `auto_fixable: true`).

**Nếu không có flag** → in Report bên dưới và dừng.

## Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/review-context Hoàn tất — {target file}
Mode: {PRD | BDD}
Findings: {total} | 🔴 Critical: {N} | 🟡 Major: {N} | 🟢 Minor: {N}
Auto-fixable: {N} | Needs human decision: {N}

File findings:
  {If PRD}: {paths.refinement_dir}/{prd-slug}-review-context-findings.yaml
  {If BDD}: {paths.refinement_dir}/{uc-id}-{platform}-review-bdd-findings.yaml

Lựa chọn tiếp theo:
  A) Quick fix  : /review-context --fix {target-file}
                  → áp dụng ngay mọi finding auto-fixable
  B) Review Board: mở file findings → accept/modify/reject
                  → /review-context --resume {target-file}

  {CHỈ in khối này khi 0 finding critical còn lại — còn critical thì nhắc duyệt là vô nghĩa}:
  {If PRD}: ✅ PRD đã sạch critical. Khi PO hài lòng → đặt `| **Status** | approved |` trong
            Metadata PRD (dấu duyệt nghiệp vụ, do người quyết) → rồi /generate-bdd.
  {If BDD}: ✅ BDD đã sạch critical. Sau khi review xong → đặt `# @trace.status: approved` trong
            header file .feature (dấu duyệt BDD, do người quyết) → rồi /generate-tech-docs.
```

---

## Fix Mode — Áp dụng ngay các Finding Auto-Fixable

*Kích hoạt khi `$ARGUMENTS` chứa `--fix`.*
*Ví dụ: `/review-context --fix specs/payment/process-payment/bdd/PAY-001.feature`*

Mode này chạy toàn bộ phân tích (giống mặc định), rồi áp dụng ngay mọi finding
`auto_fixable: true` mà không qua Review Board.

Dùng cho: dọn BDD, fix thuật ngữ, gap metadata — bất cứ thứ gì AI có thể sửa an toàn
mà không cần phán đoán của con người. Finding cần quyết định của con người vẫn được ghi
vào file findings như thường và để `status: pending`.

### Phase 1 — Chạy phân tích

Chạy hết các check qua **Quy trình Review** (fan-out + completeness loop) đúng như mode mặc định.
Ghi file findings với tất cả `status: "pending"` như thường.

### Phase 2 — Áp dụng các finding auto-fixable

Với mỗi finding có `auto_fixable: true`, theo thứ tự (critical → major → minor):

**Với file PRD:**

| check_id | Áp dụng gì | Đổi hành vi? |
|----------|--------------|:---:|
| P1 (Banned term) | Thay mọi lần xuất hiện banned term bằng canonical term | **CÓ** |
| P1 (Thuật ngữ kỹ thuật/UI) | Diễn đạt lại theo Business Language Guard (Nhóm 1) / chuyển Design Spec (2) / bỏ về Tech Docs (3) | **CÓ** |
| P4 (Structure) | Thêm skeleton section/metadata còn thiếu (row Status vắng → thêm mặc định `draft`); greenfield → xoá section "Existing API Contract" rỗng | KHÔNG |

> **Chạy Business Language Guard trên text vừa sửa TRƯỚC khi ghi** (xem section "Ngôn ngữ nghiệp vụ") — không để bản auto-fix tự kéo thuật ngữ kỹ thuật vào.

**Cột "Đổi hành vi?" là đầu vào của Phase 3** — nó quyết định UC bị đụng có ăn cờ 🟠 `PRD_DRIFT` hay ở lại ⓘ. Ghi lại `check_id` + `uc_id` của **từng** finding vừa áp; Phase 3 cần cả hai.

| | Nghĩa | Vì sao |
|---|---|---|
| **CÓ** | Câu văn nghiệp vụ trong PRD đã khác đi | P1 banned-term: term đó **cũng nằm trong `.feature` đã sinh** nên BDD lỗi thời thật về thuật ngữ (B2/C4 sẽ bắt) — đổi từ trong PRD mà không nêu UC là **bỏ sót**, không phải trung tính. P1 tech-jargon: auto-fix của nó **viết lại câu** AC/BR, và nhánh 2/3 **lấy nội dung ra khỏi** PRD |
| **KHÔNG** | Chỉ thêm/bỏ vỏ cấu trúc, 0 nội dung nghiệp vụ mới | Thêm một heading rỗng hay row `Status` mặc định không làm BDD của UC đó lỗi thời. Đánh dấu nó là drift chính là **báo động giả** |

**Với file BDD:**

| check_id | Áp dụng gì |
|----------|--------------|
| B2 (Terminology) | Thay banned term, fix tên entity/field, fix sample data kỹ thuật |
| B3 R3 | Thay tech term/UI selector bằng cách diễn đạt nghiệp vụ |
| B3 R7 | Thay bằng giá trị thực tế cụ thể |
| B3 R9 | Thêm cột data table còn thiếu |
| B3 R10 | Thêm comment Note navigation cross-UC |
| B4 C4 | Fix banned term trong tag |
| B4 C5 | Thêm NHÓM grouping nếu ≥3 SC |
| B5 | Thêm @trace header còn thiếu, sinh lại Coverage Matrix / Pre-merge Checklist |
| B6 | Thêm `And <side-effect>` còn thiếu vào block Then |

Sau khi áp dụng mỗi finding, đánh dấu nó `status: "applied"` + `applied_via: "fix"` trong file findings.

### Phase 3 — Version bump

- **PRD**: nếu ≥1 finding được áp dụng → bump version **minor** (auto-fix **không bao giờ thêm/xoá UC và không tái cấu trúc scope** — kể cả P1 tech-jargon nhánh 2/3, thứ nó di dời là *chi tiết cơ chế* xuống đúng tầng, ý định nghiệp vụ không đổi; nên minor luôn đúng), **reset `| **Status** | draft |` trong Metadata** (PRD vừa đổi sau khi duyệt → con dấu duyệt cũ hết hiệu lực, phải duyệt lại — đồng bộ với /refine-prd), thêm entry Changelog:

  `| {new_version} | {today} | Auto-fix — {changelog_scope} |` — bảng phẳng + **rollover giữ 5 row gần nhất** (dồn dư sang `changelog/{TICKET-ID}-{prd-slug}.changelog.md`); xem quy ước đầy đủ ở refine-prd Phase 3.

  **`{changelog_scope}` — BẮT BUỘC, dựng từ `uc_id` + `check_id` của các finding `status: applied`** *(contract: `bin/trace-schema.json` → `changelog_row_contract`)*:

  1. Gom các finding vừa áp theo `uc_id`. `uc_id: ""` → nhóm `PRD-global`.
  2. Mỗi nhóm thành một mệnh đề `{uc_id}: {tóm tắt các check}`, ngăn nhau bằng `;`.
  3. Nhóm mà **mọi** finding trong đó đều ở hàng **"Đổi hành vi? KHÔNG"** (Phase 2) → gắn hậu tố **`[no-behavior]`**. Nhóm có **dù chỉ một** finding "CÓ" → **KHÔNG** gắn.

  ```
  | 1.4 | 2026-08-19 | Auto-fix — UC5: banned-term (khách hàng→người mua); PRD-global: skeleton §4b [no-behavior] |
  ```

  → `/validate-traces`: **UC5 🟠 `PRD_DRIFT`** (đúng — có sửa thật) · **các UC còn lại ⓘ `PRD_STALE_REF`** (đúng — không đụng).

  > **Vì sao BẮT BUỘC (G52).** Bản cũ ghi cứng `Auto-fix: applied {N} auto-fixable findings` — **không nêu UC nào**. `/validate-traces` Step 4 lọc 🟠-vs-ⓘ bằng cách hỏi *"row changelog có nêu UC này không"*, và một row không nêu gì thì rơi vào lưới an toàn *"mơ hồ → 🟠 cho **MỌI** UC"*. Nên sửa một từ trong UC5 của PRD 8 UC làm **cả 8 UC** ăn cờ 🟠 và route sang `/generate-bdd`.
  >
  > Lưới an toàn đó **đúng khi thiếu thông tin** — nhưng ở đây **không thiếu**: findings YAML có `uc_id` **bắt buộc** cho mỗi finding, và Phase 2 vừa đánh dấu `status: applied` cho từng cái. Lệnh **đang cầm** câu trả lời lúc nó ghi dòng đó, rồi vứt đi.
  >
  > Cái mất không phải 7 lần kiểm vô ích. `--fix` là đường rẻ nhất trong lane PO nên nó chạy nhiều nhất; sau vài sprint `PRD_DRIFT` sáng thường trực, **người đọc học cách bỏ qua, rồi lần lệch THẬT cũng bị bỏ qua cùng** — chính câu `/validate-traces` Step 4 dùng để biện minh cho bộ lọc.
  >
  > **Cách làm đúng đã có sẵn ngay dưới đây, ở nhánh BDD:** *"tăng `sc_version` của **đúng scenario đó**… Scenario không bị sửa → **giữ nguyên**… bump vô cớ tạo `DRIFT` giả và làm cờ mất giá trị"*. Nhánh BDD phân loại check theo *có đổi thân scenario hay không* rồi chỉ đánh dấu đơn vị bị đụng. Ba bước trên là **đúng cách đó**, áp cho PRD.
- **BDD**: nếu ≥1 finding được áp dụng → tăng `@trace.bdd_version` lên 0.1, **reset `# @trace.status: draft`** trong header (BDD đổi sau khi duyệt → phải duyệt lại — đồng bộ với cơ chế reset draft của PRD)
- **BDD — `@trace.sc_version` theo từng scenario (BẮT BUỘC):** với **mỗi scenario có ≥1 finding được áp dụng làm đổi thân nó** — R3 (diễn đạt lại step), R7 (thay giá trị cụ thể), R9 (thêm cột data table), R10 (thêm Note), B6 (thêm `And` side-effect), B2 (đổi tên entity/field trong step/table) — tăng `# @trace.sc_version` của **đúng scenario đó** lên 0.1. Scenario không bị sửa → **giữ nguyên**.
  - Đây là tín hiệu DUY NHẤT cho `/validate-traces` biết code của SC đó đã lỗi thời (`spec_ver != gen_ver` → `DRIFT`). `bdd_version` ở cấp file không đủ phân giải để biết SC nào cần regen.
  - Finding **không** đổi thân scenario (sửa header file, thêm Coverage Matrix/Pre-merge Checklist, đổi `@trace.business_rules`, C.5 gom NHÓM) → **KHÔNG** bump: code không cần sinh lại. Bump vô cớ tạo `DRIFT` giả và làm cờ mất giá trị.
- **Cả hai**: ghi `applied_to_version: "{version vừa bump tới}"` ở root level của findings — đóng dấu "target đổi tới version này là do lệnh này áp", để lần review delta sau phân biệt thay đổi của chính mình với thay đổi do actor khác (xem "Chọn full vs delta").

### Phase 4 — Report

```
/review-context --fix Đã áp dụng — {target file}
Mode: {PRD | BDD}

Auto-fixed : {N} findings ({critical} critical, {major} major, {minor} minor)
  - {tóm tắt change 1}
  - {tóm tắt change 2}

Còn pending (cần quyết định của con người): {N}
  - F00X [{severity}] {tóm tắt finding}  ← mở file findings trong Review Board

{If PRD}: Version bumped: {old} → {new}  |  Status: reset về draft (cần duyệt lại)
{If PRD}: Changelog : | {new} | {today} | {changelog_scope} |
           ↳ UC sẽ hiện 🟠 PRD_DRIFT: {UC5}  ·  UC ở lại ⓘ STALE_REF: {UC1-4, UC6-8}
             (nhóm [no-behavior] và UC không đụng → KHÔNG cần /generate-bdd)
{If BDD}: bdd_version: {old} → {new}  |  @trace.status: reset về draft (cần duyệt lại)
{If BDD, chỉ khi có ≥1 SC bump}: sc_version: {UC-ID}-SC2 1.0→1.1, {UC-ID}-SC5 1.2→1.3
           ↳ {n} SC này sẽ hiện DRIFT ở /validate-traces → /generate-code {feature-file} để sinh lại

File findings:
  {If PRD}: {paths.refinement_dir}/{prd-slug}-review-context-findings.yaml
  {If BDD}: {paths.refinement_dir}/{uc-id}-{platform}-review-bdd-findings.yaml
Chạy lại /review-context {file} để xác nhận 0 finding critical còn lại.
{If PRD}: Khi sạch critical + PO duyệt → đặt | **Status** | approved | trong Metadata rồi /generate-bdd.
{If BDD}: Khi sạch critical + duyệt → đặt # @trace.status: approved trong header .feature rồi /generate-tech-docs.
```

Nếu 0 finding nào auto-fixable → in:
```
Không có gì để auto-fix. Cả {N} finding đều cần quyết định của con người.
Mở file findings trong Review Board → rồi chạy: /review-context --resume {file}
```

---

## Resume Mode — Áp dụng các Finding được chấp nhận

*Kích hoạt khi `$ARGUMENTS` chứa `--resume`.*
*Ví dụ: `/review-context --resume specs/payment/process-payment/PAY01-process-payment.md`*

### Phase 1 — Đọc các finding được chấp nhận

1. Suy ra tên file findings từ target file dùng cùng quy tắc như Detect Review Mode:
   - PRD: `{paths.refinement_dir}/{prd-slug}-review-context-findings.yaml`
   - BDD: `{paths.refinement_dir}/{uc-id}-{platform}-review-bdd-findings.yaml` (`{platform}` = `@trace.platform` header `.feature`)
2. Đọc file findings.
3. Gom các finding có `status: "accepted"` hoặc `status: "modified"`. Bỏ qua `rejected`/`deferred`.
4. Nếu không có → báo "No accepted findings. File unchanged." và dừng.
5. Nếu còn finding `status: "needs_discussion"` → cảnh báo (không dừng): `"⚠️  {N} finding chưa ngã ngũ (needs_discussion) — bỏ qua lần áp này; giải quyết trong Review Board rồi --resume lại."`

### Phase 2 — Áp dụng fix

Áp dụng theo thứ tự: critical → major → minor.

Với mỗi finding `accepted`/`modified` sau khi áp xong → đặt `status: "applied"` + `applied_via: "resume"` trong findings (hoàn tất vòng đời, cùng quy ước với `--fix` và `/refine-prd`).

> **Chạy Business Language Guard trên text vừa sửa TRƯỚC khi ghi** (xem section "Ngôn ngữ nghiệp vụ") — đặc biệt với P2 (sửa câu mơ hồ) / P4 skeleton: không để bản fix tự kéo thuật ngữ kỹ thuật-UI vào PRD.

> **Giữ ĐÚNG TẦNG + gọn khi áp fix (altitude):** AC = outcome quan sát được + ref BR, KHÔNG chứa cơ chế. Fix là **chi tiết cơ chế/rule** (retry, timeout, tên/chủ cờ, nhánh lỗi) → **di dời vào bảng BR/BL của UC** (hoặc BR mới), AC chỉ ref; KHÔNG inline vào AC. Fix làm rõ ≥2 nhánh ở đúng tầng → **tách bullet con** hoặc AC/BR mới, đừng nối mệnh đề vào câu cũ. Đừng để AC lặp lại nội dung BR.

**Với finding PRD:**
| check_id | Làm gì |
|----------|-----------|
| P1 (Banned term) | Thay banned term bằng canonical; thuật ngữ kỹ thuật/UI → diễn đạt lại theo Business Language Guard |
| P2 (Ambiguity) | Áp dụng fix nêu trong `suggestion` hoặc note `modified` |
| P3 (Conflict) | Áp dụng cách giải quyết nêu trong note modified |
| P4 (Structure) | Thêm section/metadata field còn thiếu (row Status vắng → thêm mặc định `draft`) |
| P5 (Custom) | Áp dụng như nêu trong suggestion/note |

→ Sau khi áp dụng, bump version PRD (minor), **reset `| **Status** | draft |` trong Metadata** (PRD vừa đổi sau khi duyệt → phải duyệt lại — đồng bộ với /refine-prd), thêm row Changelog `| {new_version} | {today} | {changelog_scope} |` (bảng phẳng + **rollover giữ 5 row gần nhất** dồn dư sang `changelog/` — xem quy ước ở refine-prd Phase 3), và ghi `applied_to_version: "{new_version}"` ở root level của findings (xem "Chọn full vs delta").
  **`{changelog_scope}` dựng theo đúng 3 bước ở Phase 3 của `--fix`** — gom theo `uc_id`, mỗi nhóm một mệnh đề `{uc_id}: {mô tả}`, `uc_id: ""` → `PRD-global`. Ở Resume Mode phần lớn finding là loại **con người quyết** nên **đổi hành vi** — chỉ gắn `[no-behavior]` cho nhóm thuần cấu trúc (P4). **BR/AC phải đi KÈM UC sở hữu** (`UC3: sửa BR8`), không bao giờ đứng một mình: consumer khớp theo UC, nên `sửa BR8` trơ trọi làm UC3 bị xếp ⓘ trong khi BR8 vừa đổi (G53).

**Với finding BDD:**
| check_id | Làm gì |
|----------|-----------|
| B1 (Coverage gap) | Sinh scenario mới cho AC/BR chưa phủ và chèn vào đúng NHÓM |
| B2 (Terminology) | Thay banned term, fix tên entity/field |
| B3 (Gherkin rule) | Áp dụng fix theo từng rule (thay tech term, thêm giá trị cụ thể, v.v.) |
| B4 (Compliance) | Thêm NHÓM grouping, fix tag @trace |
| B5 (Metadata) | Thêm `@trace.*` header còn thiếu, sinh lại Coverage Matrix / Pre-merge Checklist. **Nguồn giá trị, không đoán:** `@trace.platform` ← segment `bdd/{platform}/` của path file · `@trace.domain` ← segment `{domain}/` · `@trace.prd*` ← PRD · `@trace.sc_version` thiếu → `1.0`. **KHÔNG bịa** `@trace.service`/`@trace.module` ở spec repo mode (vắng là đúng — Nhóm C). Tag lạc `@trace.uc`/`@trace.ac`/`@proposed` → map sang canonical rồi strip. |
| B6 (Side effects) | Thêm `And <side-effect>` còn thiếu vào block Then |

→ Sau khi áp dụng, tăng `@trace.bdd_version` trong header file lên 0.1, **reset `# @trace.status: draft`** trong header (BDD đổi sau khi duyệt → phải duyệt lại).
→ **Bump `# @trace.sc_version` +0.1 cho mỗi scenario có finding làm đổi thân nó** (B1 sinh mới → `1.0`; B2/B3/B6 sửa step/table/side-effect → bump; B4/B5 chỉ sửa header·NHÓM·Coverage Matrix → **KHÔNG** bump). Quy tắc đầy đủ + lý do: xem Phase 3 của `--fix`.
→ Đồng thời cập nhật **sổ của platform đang review** `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{@trace.platform}.tsv` (platform lấy từ header `.feature` đang review): đặt cột `bdd_version` thành giá trị `@trace.bdd_version` mới cho mọi row (của sổ này), đặt `uc_status = draft` (khớp header), và đặt `last_updated` thành ngày hôm nay.
→ Với các SC vừa bump: đặt cột `spec_ver` = `@trace.sc_version` mới (giữ nguyên `gen_ver` → row hiện `DRIFT` đúng như mong đợi). Với SC **mới** do B1 sinh: append row mới, `spec_ver = 1.0`, các cột gen/test/qc = `—`, `status = UNTRACKED`. *(Nếu bỏ qua bước này, `/validate-traces` Step 2 vẫn tự reconcile ở lần chạy sau — nhưng dashboard sẽ trễ một nhịp.)*
→ Ghi `applied_to_version: "{@trace.bdd_version mới}"` ở root level của findings (xem "Chọn full vs delta").

### Phase 3 — Report

```
/review-context --resume Đã áp dụng — {target file}
Applied  : {N} findings ({critical} critical, {major} major, {minor} minor)
Skipped  : {N} rejected/deferred/needs_discussion

Changes:
  - {tóm tắt change 1}
  - {tóm tắt change 2}

{If PRD}: Version bumped: {old} → {new}  |  Status: reset về draft (cần duyệt lại)
{If PRD}: Changelog : | {new} | {today} | {changelog_scope} |
           ↳ UC sẽ hiện 🟠 PRD_DRIFT: {UC5}  ·  UC ở lại ⓘ STALE_REF: {UC1-4, UC6-8}
             (nhóm [no-behavior] và UC không đụng → KHÔNG cần /generate-bdd)
{If BDD}: bdd_version: {old} → {new}  |  @trace.status: reset về draft (cần duyệt lại)
{If BDD, chỉ khi có ≥1 SC bump}: sc_version: {UC-ID}-SC2 1.0→1.1, {UC-ID}-SC5 1.2→1.3
           ↳ {n} SC này sẽ hiện DRIFT ở /validate-traces → /generate-code {feature-file} để sinh lại

Chạy lại /review-context {file} để xác nhận 0 finding critical còn lại.
{If PRD}: Khi sạch critical + PO duyệt → đặt | **Status** | approved | trong Metadata rồi /generate-bdd.
{If BDD}: Khi sạch critical + duyệt → đặt # @trace.status: approved trong header .feature rồi /generate-tech-docs.
```

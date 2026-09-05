# /refine-prd — Phân tích PRD qua 4 lăng kính review

> **Ranh giới — lệnh này chỉ áp được fix cho vấn đề mà CHÍNH NÓ tìm ra.** Resume Mode Phase 2 tự
> cấm đụng bất kỳ section nào không được một finding chấp nhận trỏ tới, và findings sinh từ việc soi
> PRD hiện có — nên **không có đường nào để một ý định MỚI của PO đi vào**.
> Thêm UC/AC/BR mới → `/extend-prd`. **Đổi** một yêu cầu đang đúng cú pháp → **`/amend-prd`**.

## Gate

*Checkpoint: **chặn CỨNG** — --resume áp findings trực tiếp vào PRD. `--yes` KHÔNG bỏ qua được (gate Bước 3a).*

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


*Lưu ý: Với lệnh này, target file ở Bước 1 là một file PRD (`{TICKET-ID}-{prd-slug}.md` — file `.md` duy nhất ở gốc feature folder) dưới `{paths.specs_dir}/{domain}/{prd-slug}/`. Đọc toàn bộ PRD sau khi phân giải file.*

### Bước 0-C — Resume mode routing *(riêng /refine-prd, chạy ngay sau Bước 0 của Gate)*

Nếu `$ARGUMENTS` chứa `--resume`:
- Tách `--resume` ra, phần còn lại là `raw_target` (file path hoặc prd-slug).
- **Nạp minimal context:** đọc `.agent/project-context.yaml`, trích xuất `paths.refinement_dir`
  (default: `.agent/review` nếu không có hoặc file không tồn tại).
- Chạy **Bước 1** với `raw_target` để phân giải `prd-slug` và `target_file`.
  Nếu `raw_target` rỗng → liệt kê các file `*.yaml` trong `{paths.refinement_dir}/` và hỏi user chọn findings file nào.
- **Bỏ qua Bước 0-B, 2, 3** — apply findings là tác vụ cơ học, không cần model check hay load full context.
- → Nhảy thẳng tới **Resume Mode** ở cuối lệnh này.

Nếu `$ARGUMENTS` không chứa `--resume` → tiếp tục luồng review bình thường bên dưới.

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Ngôn ngữ nghiệp vụ *(áp khi viết/áp fix — gồm cả Resume Mode Phase 2)*
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


---

## Phân tích — 4 lăng kính (fan out cả bốn, rồi hội tụ)

Chạy review qua **Quy trình Review** ở trên (`steps/review-fanout.md`).

**Tham số truyền vào Quy trình Review:**
- `GRANULARITY = per-uc` — LUÔN fan-out theo từng UC (bỏ ngưỡng cả-file), để **ngay lần đầu đã lòi phần nhiều issue**, không dồn sang lần sau.
- `CHANGED_SCOPE` — xác định theo chế độ full/delta ngay dưới đây.

**Chọn full vs delta** *(mặc định: lần đầu FULL, lần sau DELTA)*:
1. Tách `--full` khỏi `$ARGUMENTS` nếu có.
2. Kiểm tra `{paths.refinement_dir}/{prd-slug}-findings.yaml`:
   - **Không tồn tại** (lần đầu review PRD này) → **FULL**: KHÔNG truyền `CHANGED_SCOPE`.
   - **Tồn tại** + có `--full` → **FULL**: bỏ qua findings cũ, không truyền `CHANGED_SCOPE` (ép quét lại toàn bộ).
   - **Tồn tại** + KHÔNG có `--full` → so `prd_version` trong findings cũ với `| **Version** |` của PRD hiện tại:
     - **Bằng nhau** (PRD chưa đổi từ lần review trước) → DỪNG, báo: `"PRD chưa đổi từ v{X} (lần review gần nhất). Không có gì để review lại — dùng --full nếu vẫn muốn quét toàn bộ."`
     - **Khác** → kiểm tra `applied_to_version` trong findings cũ (version mà lần `--resume` gần nhất của CHÍNH lệnh này đã bump PRD tới) để biết ai gây ra thay đổi:
       - **`applied_to_version` có mặt VÀ `==` version PRD hiện tại** → PRD đổi đúng bằng phần lệnh này tự áp, không actor khác động vào → **DELTA**: `CHANGED_SCOPE` = { `uc_id`/`section` của các finding `status: applied` trong findings cũ } ∪ { UC có trong PRD hiện tại nhưng chưa từng xuất hiện ở findings cũ }. Truyền `CHANGED_SCOPE` này vào Quy trình Review.
       - **`applied_to_version` vắng mặt HOẶC `≠` version hiện tại** → PRD đã bị sửa bởi **actor khác** (lệnh `/review-context`, sửa tay…) sau lần resume này → KHÔNG tin được phạm vi hẹp → **FULL** (KHÔNG truyền `CHANGED_SCOPE`), kèm cảnh báo: `"PRD đổi ngoài tầm theo dõi của findings (applied_to_version={A} ≠ hiện tại={C}); quét lại toàn bộ để khỏi sót UC do người/lệnh khác sửa."`

**DIMENSIONS** = 4 lăng kính dưới đây — fan out một sub-agent cho mỗi lăng kính, mỗi cái quét
toàn bộ PRD qua đúng lăng kính của nó:

- **Lăng kính QA (tầng nghiệm thu)** *(bật lại 2026-08-25 — xem `docs/plans/qc-implementation-log.md` B8)*: AC có nêu **outcome quan sát/kiểm được** chưa? — **KHÔNG** hỏi "AC đủ chi tiết chưa" (câu đó kéo cơ chế vào AC). Chi tiết cơ chế (số lần retry, timeout, tên/chủ cờ, nhánh lỗi vụn) thuộc **BR/BL**: nếu gap là cơ chế → suggestion phải **route sang BR/BL + AC ref**, KHÔNG phình AC. AC có lặp lại nội dung BR (trùng tầng) không → nếu có, đề xuất làm mỏng AC.

> **Phạm vi lăng kính QA — hẹp có chủ ý, đừng nới.** Nó hỏi về **HÌNH THỨC** của AC (*"phát biểu này kiểm chứng được không?"* · *"có lặp tầng không?"*), **KHÔNG** về **NỘI DUNG** (*"còn thiếu gì?"*).
>
> Lý do là thời điểm: ở đây **chỉ có PRD** — design-spec, BDD, tech-doc đều chưa tồn tại. Nên không thể phân biệt *"PRD thiếu X"* với *"PRD cố ý để X cho design-spec"*, và phép kiểm *"đã trả lời ở tài liệu khác chưa?"* **không có tài liệu khác để tra**.
>
> Số liệu thật (14 lần chạy ở repo QC): review chỉ-đọc-PRD ra **14 gap** trung bình, review đủ 4 nguồn ra **9,4** — khoảng 5 gap chênh lệch là câu hỏi mà tài liệu sau **trả lời hộ**. Nới lăng kính này sang câu hỏi nội dung là cố tình sinh ra 5 gap đó rồi gửi PO.
>
> Câu hỏi nội dung thuộc `/qc-analyze` (3 lăng kính: xử lý lỗi · giao diện · dữ liệu & cấu hình), nơi đã có đủ 4 nguồn để tra.
>
> **CÁCH TẮT LẠI QA** *(nếu cần)*: gỡ bullet QA ở trên · đổi `4 lăng kính`/`cả bốn` → `3`/`cả ba` ở
> dòng tiêu đề, heading `## Phân tích`, câu `DIMENSIONS = N lăng kính`, và `steps/review-fanout.md` ·
> gỡ `QA` khỏi enum `lens:` + `by_lens` + ghi chú `phán đoán QA/DEV/SA/PO` · sửa
> `docs/explain/03-refine-prd.md` cho khớp · rebuild `node bin/build.js`.

> **Nguyên tắc chung cho DEV & SA — đọc bằng mắt kỹ thuật, VIẾT bằng lời nghiệp vụ.**
> Hai lăng kính này dùng con mắt kỹ thuật để **phát hiện chỗ nghiệp vụ mô tả thiếu/mơ hồ/mâu thuẫn đến mức sẽ chặn triển khai** — mục tiêu là **làm rõ vấn đề nghiệp vụ để sau này xử lý được về mặt kỹ thuật**. **KHÔNG** đưa góc nhìn kỹ thuật vào PRD, **KHÔNG** đề xuất giải pháp/cơ chế kỹ thuật. Mọi `finding` và `suggestion` phải **thuần nghiệp vụ** (tuân Business Language Guard): mô tả *cái nghiệp vụ còn thiếu/chưa rõ* và *hỏi cần làm rõ gì*, chứ không nói *làm thế nào về kỹ thuật*.

- **Lăng kính DEV (tầng cơ chế nghiệp vụ)**: Đọc luồng như một dev sắp build — BR (WHAT) + Business Logic (HOW nghiệp vụ) đã **đủ & không mơ hồ để triển khai mà không phải đoán** chưa? Soi: nhánh nghiệp vụ còn thiếu, điều kiện biên chưa nói, đường xử lý khi có lỗi/ngoại lệ bị bỏ ngỏ (vd: "khi thanh toán bị từ chối thì đơn hàng được xử lý ra sao?"), business rule mâu thuẫn hoặc mơ hồ. Diễn đạt gap bằng **ngôn ngữ nghiệp vụ + đặt câu hỏi làm rõ** — **KHÔNG** đề xuất cơ chế kỹ thuật (số lần thử lại, timeout, cấu trúc dữ liệu, API, thư viện) và **KHÔNG** nhồi chi tiết kỹ thuật vào PRD.
- **Lăng kính SA (tính thông suốt & nhất quán nghiệp vụ)**: Đọc như một architect — toàn bộ luồng nghiệp vụ có **thông suốt & nhất quán** trên cả feature/domain không? Soi: tương tác nghiệp vụ giữa các UC/feature đã định nghĩa chưa, quan hệ giữa các thực thể nghiệp vụ (theo core-entities) có mâu thuẫn/bỏ trống không, trạng thái & vòng đời của đối tượng nghiệp vụ có nhất quán không, quy tắc **ai được làm gì / ai sở hữu gì** (nghiệp vụ đằng sau phân quyền) đã rõ chưa. **KHÔNG** phán về kiến trúc/security/mô hình dữ liệu kỹ thuật, **KHÔNG** đề xuất giải pháp kỹ thuật — chỉ nêu chỗ nghiệp vụ chưa nhất quán/chưa rõ bằng ngôn ngữ nghiệp vụ.
- **Lăng kính PO**: Scope đã khoanh vùng? Priority rõ chưa? Success metric đã định nghĩa? Rủi ro scope creep?

Vòng lặp completeness-critic (Phase 2) là cái đảm bảo file findings đầy đủ trong một lần chạy
— chạy lại `/refine-prd` sẽ lòi ra **0 finding mới**. Map mỗi dimension vào field `lens`
của schema dưới đây.

## File Output

Suy ra tên file output từ PRD slug:
- File PRD: `{paths.specs_dir}/payment/create-invoice/PAY01-create-invoice.md` → output: `{paths.refinement_dir}/create-invoice-findings.yaml`
- Quy tắc: lấy tên folder cha của PRD (prd-slug), thêm hậu tố `-findings.yaml`

Trước khi ghi file, xác định `recommendation` từ findings đã dedup và sắp xếp:
- `by_severity.critical ≥ 1` → `BLOCKED`
- `by_severity.critical = 0` và `by_severity.major ≥ 1` → `NEEDS_REVISION`
- `by_severity.critical = 0` và `by_severity.major = 0` → `APPROVED_WITH_MINOR_CHANGES`

Đảm bảo `{paths.refinement_dir}/` tồn tại — tạo thư mục nếu chưa có trước khi ghi file.

Ghi `{paths.refinement_dir}/{prd-slug}-findings.yaml`:

```yaml
prd_source: "{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md"
prd_version: "{đọc | **Version** | từ metadata PRD lúc sinh findings — dùng để chọn full/delta lần chạy sau}"
applied_to_version: ""   # để trống lúc phân tích; --resume sẽ ghi version PRD vừa bump tới. Lần delta sau: nếu version PRD hiện tại ≠ giá trị này → PRD bị actor khác sửa → fallback FULL (xem "Chọn full vs delta")
generated_at: "{ISO datetime}"
status: "pending_review"

findings:
  - id: "F001"
    lens: "DEV"          # QA | DEV | SA | PO
    severity: "major"    # critical | major | minor
    section: "§2. Acceptance Criteria"   # nhãn heading/section dạng người đọc
    uc_id: "{TICKET-ID}-UC{N}"           # UC mà finding thuộc về; "" nếu PRD-global (scope, metrics, problem statement)
    quote: "{trích đoạn nguyên văn copy CHÍNH XÁC từ PRD tại vị trí lỗi, ≤120 ký tự}"
    finding: "{mô tả gap hoặc vấn đề}"
    suggestion: "{đề xuất cải thiện cụ thể, hành động được}"
    resolution_edge_cases:   # CHỈ điền cho critical/major; minor → để [] (bỏ qua)
      # Phân tích bậc-hai (advisory, KHÔNG chặn): nếu áp `suggestion` này thì có thể đẻ ra
      # edge case / side-effect gì — path lỗi mới, va chạm với BR/UC khác, trạng thái biên,
      # hệ luỵ cross-section. PO đọc để cân nhắc trước khi accept; nếu muốn xử lý → tạo finding mới.
      - "{edge case có thể phát sinh nếu chốt phương án này}"
    auto_fixable: false
    # true  = AI tự tin cao vào suggestion này; Review Board có thể hiển thị nút "quick accept"
    # false = cần human đọc kỹ và ghi quyết định trước khi accept
    # Resume Mode luôn áp dụng theo status (accepted|modified), bất kể auto_fixable.
    # LƯU Ý: /refine-prd CỐ Ý không có `--fix` mode (khác /review-context) — finding 4 lăng kính
    #   là phán đoán QA/DEV/SA/PO, phải qua người duyệt ở Board; auto_fixable ở đây CHỈ là gợi ý
    #   quick-accept cho Board, KHÔNG để máy tự áp.
    status: "pending"
    applied_via: ""
    # Vòng đời finding-level (CHUNG với /review-context — Review Board đọc cả hai loại file nên enum phải khớp):
    #   pending          → finding mới, chưa được review
    #   accepted         → reviewer chấp nhận suggestion gốc → Resume sẽ apply
    #   modified         → reviewer đã sửa suggestion trong Review Board → Resume dùng suggestion đã sửa
    #   rejected         → reviewer bác bỏ, không apply
    #   needs_discussion → hai suggestion xung đột, CHẶN --resume (bỏ qua + cảnh báo) tới khi con người quyết
    #   deferred         → cố ý hoãn (không chặn), bỏ qua lượt này, xem lại sau
    #   applied          → đã áp vào PRD; applied_via ghi cách áp: "resume" (qua --resume) — /review-context còn dùng "fix" (qua --fix)

summary:
  total_findings: {N}
  by_severity: { critical: {N}, major: {N}, minor: {N} }
  by_lens: { QA: {N}, DEV: {N}, SA: {N}, PO: {N} }
  recommendation: "APPROVED_WITH_MINOR_CHANGES | NEEDS_REVISION | BLOCKED"
  # Rule: critical ≥ 1                       → BLOCKED
  #       critical = 0, major ≥ 1            → NEEDS_REVISION
  #       critical = 0, major = 0            → APPROVED_WITH_MINOR_CHANGES
```

> **Field định vị (`quote` + `uc_id`) — bắt buộc cho source-jump của Review Board.**
> Với mỗi finding, copy một đoạn `quote` **nguyên văn** thẳng từ PRD tại đúng chỗ
> lỗi xảy ra — KHÔNG diễn giải lại; nó được so khớp với tài liệu để định vị dòng. Đặt
> `uc_id` là Use Case sở hữu (hoặc `""` cho finding PRD-global). Hai field này cho phép reviewer click một
> finding trong Review Board và nhảy thẳng tới đúng vị trí trong PRD nguồn.

> **`resolution_edge_cases` — phân tích bậc-hai (chỉ critical/major).**
> Với mỗi finding `critical`/`major`, sau khi viết `suggestion`, nghĩ tiếp: *nếu PO chốt phương án này thì
> đẻ ra edge case / side-effect gì?* (path lỗi mới, va chạm BR/UC khác, trạng thái biên, hệ luỵ cross-section).
> Ghi vào `resolution_edge_cases` để PO **thấy trước khi accept**. Đây là **advisory** — KHÔNG chặn, KHÔNG tự
> tạo finding; PO đọc rồi quyết. Finding `minor` → để `[]`.
> *(Phần phản hồi cho phương án PO **tự sửa** (`modified`) đến ở vòng sau: sau `--resume`, lần `/refine-prd`
> kế chạy delta sẽ quét lại UC đã đổi + critic toàn-doc → tự lòi edge case mà phương án đó tạo ra.)*

## Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

Dùng footer chuẩn với hai field bổ sung `Findings` và `Review` đặt ngay sau `Status`:

```
---
Status   : {badge}
Findings : {total} | 🔴 Critical: {N} | 🟡 Major: {N} | 🟢 Minor: {N}
Review   : {paths.refinement_dir}/{prd-slug}-findings.yaml
Output Artifacts:
  created {paths.refinement_dir}/{prd-slug}-findings.yaml (findings từ 3-lens review)
Pipeline : Discovery → [PRD ◀ bạn ở đây] → Design Spec → BDD → Tech Design → Code → Dev Self-Check → QC → Trace Audit
           Vòng review: [① phân tích ◀] → ② Review Board → ③ --resume
Next     : Mở trong Review Board (chuột phải vào file) → Cập nhật PRD
           → /review-context {prd-file}   ← kiểm tra chất lượng PRD trước khi sinh BDD
           → khi sạch critical, PO đặt | **Status** | approved | → /generate-bdd {prd-file}
```

Nếu có finding nào có `status: "needs_discussion"`, thêm warning block sau footer:

```
⚠️  {N} finding(s) cần quyết định của bạn trước khi --resume:
   Mở {paths.refinement_dir}/{prd-slug}-findings.yaml
   Với mỗi finding có status "needs_discussion":
     1. Đọc cả hai phương án trong `suggestion`
     2. Chọn một (hoặc viết phương án khác) vào `suggestion`
     3. Đổi `status` → "accepted"
   Sau đó chạy: /refine-prd {prd-file} --resume
```
*(Bỏ warning block này nếu không có `needs_discussion` finding nào.)*

---

## Resume Mode — Áp dụng Findings & Bump Version

*Được route tới từ Bước 0-C — Resume mode routing. `prd-slug` và `target_file` đã được phân giải ở Bước 1 trước khi nhảy vào đây.*

### Phase 1 — Đọc các finding được chấp nhận

1. Kiểm tra `{paths.refinement_dir}/{prd-slug}-findings.yaml` có tồn tại không.
   Nếu không → báo lỗi rõ ràng và dừng:
   ```
   ❌ Không tìm thấy findings file tại {paths.refinement_dir}/{prd-slug}-findings.yaml
      Hãy chạy /refine-prd {prd-file} trước để tạo findings, rồi mới --resume.
   ```
2. Đọc file findings.
3. Gom tất cả finding có `status: "accepted"` hoặc `status: "modified"`.
4. Nếu không có finding nào được chấp nhận → báo "No accepted findings. PRD unchanged." và dừng.
5. Nếu còn finding nào có `status: "needs_discussion"` → cảnh báo (không dừng):
   ```
   ⚠️  {N} finding(s) chưa được giải quyết (needs_discussion) — sẽ bị bỏ qua lần apply này.
      Giải quyết chúng trong Review Board rồi chạy lại --resume để apply.
   ```

### Phase 2 — Áp dụng thay đổi vào PRD

Với mỗi finding được chấp nhận, theo thứ tự severity (critical → major → minor):
- Đi tới section PRD được chỉ định bởi `finding.section`.
- Áp dụng `finding.suggestion`. Với finding `status: "modified"`, người đã sửa sẵn `finding.suggestion` trong Review Board — giá trị đã sửa đó CHÍNH LÀ bản fix cần áp dụng.
- **Giữ ĐÚNG TẦNG + gọn khi áp fix (altitude):** AC = **outcome quan sát được + ref BR**, KHÔNG chứa cơ chế. Nếu fix là **chi tiết cơ chế/rule** (retry N, timeout, tên/chủ cờ, nhánh lỗi) → **ghi vào bảng BR/BL của UC** (hoặc tạo BR mới), AC chỉ **ref**; KHÔNG inline vào câu AC. Nếu fix làm rõ **≥2 điều kiện/nhánh** ở đúng tầng của nó → **tách bullet con** (mỗi ý một dòng `  - …`) hoặc **AC/BR mới**, đừng nối mệnh đề vào câu cũ. Một AC = một tiêu chí kiểm chứng; đừng để AC lặp lại nội dung BR.
- **Chạy Business Language Guard trên text mới TRƯỚC khi ghi** (xem section "Ngôn ngữ nghiệp vụ"): diễn đạt lại / gỡ thuật ngữ kỹ thuật-UI để fix không tự kéo theo term kỹ thuật vào PRD.
- Không thay đổi bất kỳ section nào không được tham chiếu bởi một finding được chấp nhận.

### Phase 2.5 — Cập nhật file findings

Với mỗi finding đã áp dụng (status là `accepted` hoặc `modified`):
- Đặt `status: "applied"` + `applied_via: "resume"` trong `{paths.refinement_dir}/{prd-slug}-findings.yaml`.

Cập nhật `status: "applied"` ở **root level** của file findings (không phải `summary.status`).
# Lifecycle file-level: pending_review → applied | partially_applied
# partially_applied khi có finding bị rejected hoặc needs_discussion còn sót lại.

### Phase 3 — Bump version & ghi entry changelog

1. Đọc giá trị `| **Version** |` hiện tại từ bảng metadata của PRD.
2. Xác định loại bump từ tập finding được chấp nhận:
   - **major** (X.0 → X+1.0 kế tiếp): thêm/xoá Use Case, tái cấu trúc scope, thay đổi BR breaking.
   - **minor** (x.Y → x.Y+1): làm rõ, thêm edge case, tinh chỉnh wording AC/BR.
3. Tính chuỗi version mới.
4. Cập nhật metadata PRD:
   - `| **Version** | {new_version} |`
   - `| **Updated**  | {today YYYY-MM-DD} |`
   - `| **Status**   | draft |` ← reset về draft, phải được duyệt lại
5. Cập nhật `# Change Log` của PRD — **bảng phẳng 1 dòng/version, cửa sổ trượt 5 entry** (nếu gặp format cũ `### v{X}` block → chuẩn hoá sang bảng phẳng khi cập nhật):
   - Thêm row mới lên **đầu** bảng:
     ```
     | {new_version} | {today} | {changelog_scope} |
     ```
     **`{changelog_scope}` — mỗi mệnh đề mở đầu bằng UC SỞ HỮU** *(contract: `bin/trace-schema.json` → `changelog_row_contract`)*. Nguồn: `uc_id` / `section` của các finding được chấp nhận. Ngăn nhau bằng `;`; finding global (`uc_id: ""`) → `PRD-global`.

     **Ví dụ đúng:** `UC2: sửa BR5, thêm AC7; PRD-global: làm rõ scope §1`

     ⚠️ **BR/AC không bao giờ đứng một mình.** `sửa BR5` (thiếu `UC2:`) nêu đủ nhiều ID để **không** bị coi là mơ hồ, nhưng `/validate-traces` Step 4 khớp bằng phép thử *"**UC** này có trong tập?"* — nên UC2 rơi vào ⓘ `PRD_STALE_REF` trong khi BR5 của nó vừa đổi, và `--realign-prd-version` (chỉ chặn 🟠) sẽ dán nhãn version lại lên đó. Đây là G53: mất bộ lọc theo hướng **im lặng**, nguy hiểm hơn hướng mơ hồ/ồn.

     *(Consumer của dòng này: `/generate-bdd` Version Check — biết scenario nào cần cập nhật; `/validate-traces` Step 4 — lọc 🟠 `PRD_DRIFT` vs ⓘ `PRD_STALE_REF`.)*
   - Cập nhật dòng đầu section: `> Hiện tại: **v{new_version}** ({today}) · Lịch sử đầy đủ → [changelog](./changelog/{TICKET-ID}-{prd-slug}.changelog.md)`
   - **Rollover (giữ PRD gọn — đây là chuẩn chung, /review-context cũng theo):** nếu bảng `# Change Log` có **> 5 row** → chuyển **mọi row vượt 5** (cũ nhất) sang **đầu** bảng của file kho `{paths.specs_dir}/{domain}/{prd-slug}/changelog/{TICKET-ID}-{prd-slug}.changelog.md` (giữ thứ tự mới→cũ); PRD chỉ giữ **5 row gần nhất**. Tạo thư mục `changelog/` + file kho nếu chưa có, theo skeleton:
     ```
     # Change Log (lịch sử) — {TICKET-ID}
     > PRD: [../{TICKET-ID}-{prd-slug}.md](../{TICKET-ID}-{prd-slug}.md) — 5 version gần nhất nằm trong PRD; đây là phần cũ hơn.

     | Version | Date | Changes |
     |---------|------|---------|
     ```
6. Ghi `applied_to_version: "{new_version}"` ở **root level** của findings — đóng dấu "PRD đổi tới version này là do lệnh này áp", để lần review delta sau phân biệt được thay đổi của chính mình với thay đổi do actor khác (xem "Chọn full vs delta").

### Phase 4 — Report

```
/refine-prd Đã áp dụng — {PRD name}
Version  : {old_version} → {new_version}
Applied  : {N} findings ({critical} critical, {major} major, {minor} minor)
Changes  :
  - {change 1}
  - {change 2}

💡 Vừa áp {N} phương án (gồm bản PO tự sửa) → chạy lại /refine-prd {prd-file}
   (delta tự động) để lòi edge case mà các phương án vừa áp có thể tạo ra.
⚠️  Status đã reset về draft (sửa rồi phải duyệt lại). BDD có thể đã lỗi thời. Chạy:
    /review-context {prd-file}   ← kiểm tra chất lượng PRD trước
    → PO đặt | **Status** | approved | khi hài lòng → /generate-bdd {prd-file}
```

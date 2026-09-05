# /amend-prd — Sửa tại chỗ một yêu cầu đã duyệt trong PRD

> **Nhánh thứ tư — đọc bảng này trước khi chọn lệnh:**
>
> | Tình huống | Lệnh | Thao tác ghi |
> |---|---|---|
> | PRD **chưa có** | `/generate-prd` | **Write** cả file |
> | PRD đã có, **thêm** UC/AC/BR mới | `/extend-prd` | **Edit add-only** — output là superset chặt |
> | PRD đã có, **sửa vấn đề review chỉ ra** | `/refine-prd` → Review Board → `--resume` | Edit trong phạm vi finding |
> | **PRD đã có, PO muốn ĐỔI một yêu cầu đang đúng cú pháp** | **`/amend-prd`** | **Edit tại chỗ** — output **KHÔNG** phải superset |
>
> **Vì sao phải là lệnh riêng (GAPS-v4 G54).** Ba lệnh kia đều **từ chối đúng việc này**:
> `/generate-prd` **DỪNG HẲN** trên file đã có (§Guard: *"Tồn tại → DỪNG. KHÔNG ghi, KHÔNG hỏi
> Y/N"* — vì ghi đè mất changelog, **đánh số lại BR**, phá `@trace.business_rules` trong mọi
> `.feature` đã sinh, cả ba không hoàn tác được) · `/extend-prd` chỉ **add-only**, luật
> Bước 5 §3 đòi output là *"superset chặt"* · `/refine-prd` tự cấm đụng section nào không được một
> finding trỏ tới, và findings sinh từ việc soi PRD hiện có nên **không có đường nào để một ý định
> MỚI của PO đi vào**.
>
> Trước lệnh này, hành vi hợp lý duy nhất còn lại là **mở file `.md` ra gõ** — và đó là con đường
> DUY NHẤT framework không nhìn thấy: mọi drift detector so **nhãn version**, không so **nội dung**
> (0 content hash trong toàn bộ codebase). Sửa tay không bump version ⇒ **0 cờ**, không 🔴 không 🟠
> không ⓘ. Nên nhánh thiếu không phải một tiện ích còn nợ; nó là **điểm mù mà chính thiết kế tạo ra**.
>
> **`/validate-traces` canh cửa sau** bằng cờ `PRD_UNTRACKED_EDIT` (schema → `spec_edit_detection`):
> nội dung PRD đổi mà `Version` không đổi ⇒ có người đi cửa sau. Cửa chính là lệnh này.

## Gate

*Checkpoint: **chặn CỨNG** — SỬA TẠI CHỖ một AC/BR/UC đã duyệt — thao tác ghi DUY NHẤT trong framework được phép làm output KHÔNG phải superset của bản cũ. `--yes` KHÔNG bỏ qua được (gate Bước 3a).*

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


*Lưu ý: Với lệnh này, target ở Bước 1 là **file PRD đã tồn tại** `{TICKET-ID}-{prd-slug}.md` (file `.md` duy nhất ở gốc feature folder). `$ARGUMENTS` rỗng → liệt kê `{specs_dir}/*/*/*.md` và hỏi. **Không tìm thấy file PRD → DỪNG** và chỉ sang `/generate-prd`.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Ngôn ngữ nghiệp vụ *(áp cho mọi text được sửa: AC, BR, Business Logic, Scope)*
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

## Bước 1 — Nạp PRD và **PO khai tường minh** cái cần sửa

Đọc target PRD, trích và lưu:

| Giá trị | Nguồn | Dùng để |
|---|---|---|
| `current_version` | Metadata `\| **Version** \|` | tính version mới ở Bước 5 |
| `current_status` | Metadata `\| **Status** \|` | cảnh báo nếu chưa `approved` |
| `existing_ucs` | danh sách UC-ID + tên | phân giải UC sở hữu · kiểm va chạm |
| `all_br` | mọi BR-ID + nội dung, theo UC sở hữu (bảng BR ở §3) | phân giải `BR{n}` → UC |
| `all_ac` | mọi AC-ID + nội dung, theo UC sở hữu (dòng `**AC liên quan:**`) | phân giải `AC{n}` → UC |
| `changelog_rows` | bảng `# Change Log` | biết PRD đã đi qua những gì |
| `bdd_generated` | glob `{specs_dir}/{domain}/{prd-slug}/bdd/*/{TICKET-ID}-UC*.feature` | tính blast radius ở Bước 6 |

### `amend_targets` — **BẮT BUỘC, không suy đoán**

PO phải nêu **chính xác ID** cần sửa. Đây là ràng buộc cứng nhất của lệnh: ID được khai
**trở thành `{changelog_scope}`** ở Bước 5, và cũng là **danh sách duy nhất** mà guard sau-ghi ở
Bước 4 cho phép nội dung thay đổi.

Nhận `amend_targets` theo thứ tự:

1. Từ `$ARGUMENTS` nếu PO đã nêu (vd `/amend-prd PAY01 UC3-BR8`).
2. Nếu không, **hỏi** — kèm danh sách để PO chọn, đừng để PO gõ mò:
   ```
   Sửa gì trong {TICKET-ID}? (nhập ID, cách nhau bằng dấu phẩy)

   UC3 "Xuất báo cáo"
     BR8   tối đa 5 file mỗi lần
     BR9   chỉ xuất được đơn đã duyệt
     AC5   người dùng xuất được nhiều đơn trong một lần
   UC4 …
   ```
3. **KHÔNG tự suy** target từ một mô tả mơ hồ (*"sửa cái giới hạn file ấy"*). Trình danh sách ứng
   viên rồi để PO chốt. Đoán sai ở đây là sửa sai một yêu cầu đã duyệt.

Với **mỗi** target, phân giải **UC sở hữu** ngay (dùng `all_br` / `all_ac`) và lưu vào
`affected_ucs`. ID không phân giải được về UC nào → **DỪNG**, báo ID sai; đừng sửa mò.

### Hai chế độ — và những gì lệnh này **KHÔNG** làm

| Chế độ | Cờ | Làm gì |
|---|---|---|
| **Sửa nội dung** *(mặc định)* | — | Đổi nội dung của ID đã có. ID **giữ nguyên**. |
| **Khai tử tại chỗ** | `--retire {ID}` | Đánh dấu ID là không còn hiệu lực **NHƯNG GIỮ NGUYÊN row/ID** (xem Bước 4). |

**Ngoài phạm vi — route đi chỗ khác, đừng làm ở đây:**

| PO muốn | Lệnh đúng | Vì sao không phải lệnh này |
|---|---|---|
| Thêm UC/AC/BR mới | `/extend-prd` | Nó có Discovery delta + đánh số nối tiếp. Lệnh này **không đánh số mới** bao giờ |
| **XOÁ HẲN** một dòng BR/AC/UC | *(không có, và có chủ ý)* | Xoá row làm `@trace.business_rules` trong mọi `.feature` đã sinh trỏ vào ID không còn ⇒ đúng hình dạng `TRACE_ORPHAN`. Dùng `--retire` — nó đạt cùng mục đích nghiệp vụ mà **không** phá liên kết |
| Sửa lỗi mà `/refine-prd` vừa chỉ ra | `/refine-prd --resume` | Nó đã có findings + `applied_to_version` để theo dõi delta |

**Guard — PRD chưa `approved`:** nếu `current_status != approved` → cảnh báo mềm, không chặn:
```
⚠️  PRD đang ở Status: {status} (chưa approved).
    Sửa một yêu cầu CHƯA được duyệt thì thường không cần lệnh này — cứ hoàn tất vòng review
    hiện tại (/review-context → /refine-prd → PO duyệt) là nội dung sẽ đúng.
    Vẫn sửa tại chỗ bây giờ? (Y/N)
```

---

## Bước 2 — Kiểm va chạm *(bắt buộc, không bỏ qua)*

*Tái dùng đúng **Bước 3.2** của `/extend-prd`, đảo hướng: ở đó câu hỏi là "phần THÊM có làm cái cũ
sai không"; ở đây là "cái SỬA có làm phần còn lại sai không". Cùng ba câu, cùng lý do — va chạm âm
thầm là cách một PRD tự mâu thuẫn.*

Với **mỗi** target, đối chiếu nội dung mới với toàn bộ PRD và hỏi PO:

1. **Mâu thuẫn ngược:** giá trị/hành vi mới có làm một BR **khác** trở nên sai hoặc không đủ không?
   *(BR8 nâng 5→20, nhưng BR12 nói "gộp tối đa 5 file vào một hoá đơn")* → nếu có, **BR12 cũng phải
   vào `amend_targets`**. Đây là lý do bước này không bỏ qua được: sửa một nửa của một cặp ràng buộc
   là tạo một PRD tự mâu thuẫn, và không cờ nào bắt được mâu thuẫn nội bộ của tài liệu.
2. **AC lệch theo:** AC nào đang ref target này có còn diễn tả đúng outcome không? → nếu không, AC đó
   vào `amend_targets`.
3. **Phụ thuộc liên service:** thay đổi có đụng cam kết ở **§1c** không? → cập nhật §1c (mức nghiệp vụ).

Mỗi câu trả lời "có" **mở rộng `amend_targets`** — và `affected_ucs` mở rộng theo. Chốt lại danh sách
trước khi sang CHECKPOINT.

### CHECKPOINT trước khi ghi

```
CHECKPOINT — Amend PRD {TICKET-ID}
─────────────────────────────────────────────────
PRD        : v{current_version} ({current_status}) — {n} UC
Sửa        : UC3-BR8  "tối đa 5 file"  →  "tối đa 20 file"
             UC3-AC5  {tóm tắt thay đổi}
Khai tử    : {UC4-BR15 (--retire) | không}
Va chạm    : {UC5-BR12 cũng phải sửa (mâu thuẫn với BR8 mới) | không}
UC ảnh hưởng: UC3, UC5           ← sẽ là {changelog_scope}
Version    : v{current} → v{new} ({major|minor}) · Status → draft

Sau khi ghi, các UC trên BẮT BUỘC:
  /generate-bdd  → /generate-code  → /dev-gen-test → /dev-run-test
  ❌ KHÔNG dùng --realign-prd-version cho chúng (nội dung đổi thật)

BDD đã sinh sẽ lỗi thời: {danh sách UC × platform}

Tiếp tục? (Y/N)
```

---

## Bước 3 — Altitude: sửa ở đúng tầng

*Giống `/extend-prd` Bước 5 và `/refine-prd` Phase 2 — nêu lại vì đây là chỗ dễ trôi nhất khi sửa
tại chỗ: PO thường mô tả thay đổi bằng cơ chế, và cách rẻ nhất là nhét cơ chế vào AC.*

| Tầng | Chứa gì | KHÔNG chứa gì |
|---|---|---|
| **AC** | outcome **quan sát/kiểm được** + ref `_(BR: …)_` | số lần retry, timeout, tên cờ, nhánh lỗi vụn, và **không lặp lại nội dung BR nó ref** |
| **BR** | quy tắc nghiệp vụ (WHAT) — giá trị, giới hạn, điều kiện | chi tiết kỹ thuật triển khai |
| **Business Logic** | trình tự nghiệp vụ (HOW **nghiệp vụ**) | API, cấu trúc dữ liệu, thư viện |

Thay đổi là **cơ chế** mà PO đang muốn nhét vào AC → **route xuống BR/BL**, AC chỉ giữ outcome + ref.

**Chạy Business Language Guard trên MỌI text mới TRƯỚC khi ghi.**

---

## Bước 4 — Ghi *(Edit tại chỗ · guard sau-ghi ĐẢO NGƯỢC)*

> **Đây là chỗ lệnh này khác MỌI thao tác ghi khác trong framework.** `/extend-prd` guard bằng
> *"output là **superset chặt** của bản cũ"*. Ở đây output **cố ý KHÔNG** phải superset — nên guard
> phải đảo: **mọi thứ giữ nguyên NGOẠI TRỪ đúng các ID trong `amend_targets`.**
>
> Guard yếu hơn không được: một lệnh được phép sửa nội dung đã duyệt mà không có rào chính xác là
> đúng cái `/generate-prd` bị chặn-cứng để tránh.

1. **Đọc lại file trên disk NGAY TRƯỚC khi ghi** — không dựa vào bản nạp ở Bước 1.
2. **CHỈ dùng Edit.** **CẤM tuyệt đối Write cả file.**
3. **KHÔNG đánh số lại bất kỳ ID nào.** Không thêm ID mới (đó là `/extend-prd`). Không xoá row.
4. Chế độ `--retire {ID}`: **giữ nguyên row và ID**, đổi nội dung thành dạng khai tử rõ ràng —
   `~~{nội dung cũ}~~ **(không còn hiệu lực từ v{new})**` — và thêm một dòng nêu lý do nghiệp vụ.
   *Không xoá row vì `@trace.business_rules` trong `.feature` đã sinh đang trỏ vào ID này; xoá nó
   biến một liên kết hợp lệ thành `TRACE_ORPHAN` 🔴.*

### Guard sau-ghi *(bắt buộc — DỪNG nếu fail)*

Đọc lại file vừa ghi, đối chiếu với bản trước khi sửa. Kiểm **hai chiều**:

| Chiều | Kiểm gì | Fail nghĩa là |
|---|---|---|
| **Bảo toàn** | Mọi UC-ID · BR-ID · AC-ID · row `# Change Log` cũ **vẫn còn** (kể cả ID vừa `--retire`) | Đã xoá thứ không được xoá |
| **Giới hạn** | **Mọi** nội dung đã đổi đều thuộc một ID trong `amend_targets` — **không có** chỗ nào khác đổi | Đã sửa lan ra ngoài phạm vi PO chốt |

Fail bất kỳ chiều nào → **DỪNG NGAY, khôi phục file về bản cũ** (`git checkout -- {file}` nếu đã
commit, hoặc hoàn tác edit), báo:
```
❌ AMEND vi phạm phạm vi — đã chặn.
   {Mất: UC3-BR9 | Sửa ngoài phạm vi: UC7-BR22 (không có trong amend_targets)}
   File đã khôi phục. Chỉ sửa đúng ID đã chốt rồi chạy lại.
```
**KHÔNG** tiếp tục sang Bước 5.

> **Vì sao chiều "Giới hạn" quan trọng bằng chiều "Bảo toàn":** `{changelog_scope}` ở Bước 5 dựng từ
> `amend_targets`. Nếu bản ghi lỡ sửa một UC không có trong danh sách đó, thì changelog **không nêu**
> UC ấy ⇒ `/validate-traces` xếp nó vào ⓘ `PRD_STALE_REF` ⇒ `--realign-prd-version` **mở cửa** và dán
> nhãn version lại lên một thay đổi chưa ai implement. Đúng hình dạng G53, chỉ đến từ một hướng khác.

---

## Bước 5 — Bump version & ghi changelog

1. Loại bump:
   - **major** (X.0 → X+1.0): đổi hành vi theo hướng **breaking** · `--retire` một BR/AC · tái cấu
     trúc scope. *(Đổi một giới hạn nghiệp vụ 5→20 là **major** — code hiện tại đang chặn ở 5, tức
     nó đang sai so với spec mới.)*
   - **minor** (x.Y → x.Y+1): làm rõ diễn đạt mà **không** đổi hành vi nghiệm thu được.
2. Cập nhật Metadata: `Version` = mới · `Updated` = hôm nay · **`Status` = `draft`**
   *(yêu cầu đã duyệt vừa đổi ⇒ con dấu duyệt cũ hết hiệu lực — đồng bộ `/refine-prd`, `/extend-prd`.)*
3. Thêm row lên **đầu** bảng `# Change Log`:
   ```
   | {new_version} | {today} | {changelog_scope} |
   ```
   **`{changelog_scope}` — mỗi mệnh đề mở đầu bằng UC SỞ HỮU** *(contract:
   `bin/trace-schema.json` → `changelog_row_contract`)*. Nguồn: `affected_ucs` đã chốt ở Bước 2 —
   tức **UC sở hữu của từng ID trong `amend_targets`**. Ngăn nhau bằng `;`. Thay đổi ở §1c/§1d
   (không thuộc UC nào) → `PRD-global`.

   **Ví dụ đúng**
   ```
   | 2.0 | 2026-08-19 | UC3: sửa BR8 (giới hạn 5→20 file), AC5 theo đó; UC5: sửa BR12 (bỏ ràng buộc gộp 5) |
   | 3.0 | 2026-08-22 | UC4: khai tử BR15 (không còn yêu cầu duyệt hai cấp) |
   ```

   ⚠️ **BR/AC không bao giờ đứng một mình.** `sửa BR8` (thiếu `UC3:`) nêu đủ ID để **không** bị coi
   là mơ hồ, nhưng consumer khớp theo **UC** — nên UC3 rơi vào ⓘ và `--realign` dán nhãn lại lên
   đúng thay đổi này. **Lệnh này là producer dễ mắc lỗi đó nhất**, vì đầu vào của nó *là* một BR-ID.

   ⚠️ **KHÔNG dùng hậu tố `[no-behavior]` ở lệnh này.** Nó dành cho fix mà producer **chứng minh
   được** là thuần cấu trúc (`changelog_row_contract.neutral_checks`). Lệnh này tồn tại để đổi **nội
   dung nghiệp vụ** — theo định nghĩa là có đổi hành vi.
4. Cập nhật dòng đầu section: `> Hiện tại: **v{new}** ({today}) · Lịch sử đầy đủ → [changelog](./changelog/{TICKET-ID}-{prd-slug}.changelog.md)`
5. **Rollover** (cửa sổ trượt 5 row) — theo đúng quy ước `/refine-prd` Phase 3.

---

## Bước 6 — Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

Ví dụ footer cho lệnh này:

```
/amend-prd Đã sửa — {TICKET-ID} {tên feature}

Version   : v1.3 → v2.0 (major) · Status → draft
Sửa       : UC3-BR8  "tối đa 5 file"  →  "tối đa 20 file"
            UC3-AC5  diễn đạt lại outcome theo BR8 mới
            UC5-BR12 bỏ ràng buộc gộp 5 (va chạm với BR8 mới — Bước 2 câu 1)
Khai tử   : không
Changelog : | 2.0 | 2026-08-19 | UC3: sửa BR8 (giới hạn 5→20 file), AC5 theo đó; UC5: sửa BR12 |

Guard sau-ghi : ✅ Bảo toàn — {n} UC · {m} AC · {k} BR · {j} changelog row cũ còn nguyên
                ✅ Giới hạn  — 0 chỗ đổi ngoài amend_targets

🔴 UC PHẢI làm lại (nội dung đổi thật): UC3, UC5
   /generate-bdd {prd-file}        ← BDD hiện tại đang nghiệm thu giới hạn 5
   → /generate-code {UC-ID}        ← code đang chặn ở 5
   → /dev-gen-test → /dev-run-test ← test đang assert 5 và vẫn PASS
   ❌ TUYỆT ĐỐI KHÔNG --realign-prd-version cho UC3/UC5 — đó là dán nhãn lên thay đổi
      chưa ai implement.

BDD sẽ lỗi thời: bdd/system/{TICKET-ID}-UC3.feature · bdd/web/{TICKET-ID}-UC3.feature

UC KHÔNG đổi ({n}): {UC1, UC2, UC4…}
   → ⓘ PRD_STALE_REF. Sạch bằng: /validate-traces --realign-prd-version {UC-ID}

⚠️  Status đã reset về draft — thay đổi chưa được duyệt lại.

---
Status   : ✅ Complete
Output Artifacts:
  updated {paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md (v2.0)
  updated {paths.specs_dir}/{domain}/{prd-slug}/changelog/… (nếu có rollover)
Pipeline : Discovery → [PRD ◀ bạn ở đây] → Design Spec → BDD → Tech Design → Code → Dev Self-Check → QC → Trace Audit
Next     : /review-context {prd-file}   ← kiểm chất lượng phần vừa sửa
           → khi sạch critical, PO đặt Status: approved
           → /generate-bdd {prd-file}   ← CHỈ cho UC3, UC5
```

---

## Quality Checklist *(kiểm trước khi ghi)*

- [ ] `amend_targets` do **PO khai tường minh** — không suy từ mô tả mơ hồ
- [ ] Mỗi target đã phân giải được **UC sở hữu**; ID không phân giải được → đã DỪNG
- [ ] Bước 2 đã hỏi đủ 3 câu va chạm, và mọi ID phát sinh **đã được thêm** vào `amend_targets`
- [ ] **KHÔNG** đánh số lại ID nào · **KHÔNG** thêm ID mới · **KHÔNG** xoá row nào
- [ ] `--retire` giữ nguyên row + ID (chỉ đổi nội dung sang dạng khai tử)
- [ ] Guard sau-ghi PASS **cả hai chiều**: Bảo toàn **và** Giới hạn
- [ ] Altitude đúng tầng: cơ chế nằm ở BR/BL, AC chỉ outcome + ref
- [ ] `{changelog_scope}`: mỗi mệnh đề **mở đầu bằng UC sở hữu**; **không** BR/AC đứng một mình; **không** `[no-behavior]`
- [ ] `Status` đã reset về `draft`
- [ ] Không có banned term; 0 thuật ngữ kỹ thuật/UI trong text mới
- [ ] Report nêu **UC PHẢI làm lại** kèm lệnh, và **cấm tường minh** `--realign` cho chúng

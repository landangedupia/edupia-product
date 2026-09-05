# /extend-prd — Thêm yêu cầu mới vào PRD đã duyệt

> **Ranh giới với `/refine-prd` — đọc trước khi chọn lệnh:**
>
> | Lệnh | Câu hỏi nó trả lời | Nguồn đầu vào |
> |---|---|---|
> | `/refine-prd` | *"PRD hiện tại có **vấn đề** gì?"* | 3 lăng kính review soi nội dung ĐANG CÓ |
> | **`/extend-prd`** | *"PRD hiện tại **thiếu** cái gì mới?"* | PO + hòm thư `prd-change-requests/` |
> | `/amend-prd` | *"một yêu cầu đang có cần **ĐỔI** thành gì?"* | PO khai tường minh ID cần sửa |
>
> **Ranh giới với `/amend-prd`:** lệnh này **chỉ THÊM** — Bước 5 §3 đòi output là *"superset chặt"*.
> Nó có **một** cửa sửa nội dung cũ (Bước 3.2 case 1, "mâu thuẫn rule") nhưng cửa đó **phái sinh**:
> chỉ mở khi phần THÊM làm một BR cũ sai. Muốn đổi một yêu cầu mà **không** thêm gì mới → `/amend-prd`.
>
> `/refine-prd` **không** thêm được UC/AC/BR mới — nó tự cấm ở Resume Mode Phase 2 (*"không thay đổi
> bất kỳ section nào không được tham chiếu bởi một finding được chấp nhận"*), và findings của nó sinh
> từ việc soi PRD hiện có nên **không có đường nào để một yêu cầu MỚI đi vào**.
>
> **Vì sao là lệnh riêng, không phải `/generate-prd --extend`:** hai chế độ ngược nhau về thao tác ghi
> — `/generate-prd` **Write cả file**, lệnh này **chỉ Edit add-only**. Trộn vào một `.tmpl` chính là
> hình dạng của G9 (một file, hai hành vi, người đọc chọn nhầm).

## Gate

*Checkpoint: **chặn CỨNG** — sửa PRD đã DUYỆT. `--yes` KHÔNG bỏ qua được (gate Bước 3a).*

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


*Lưu ý: Với lệnh này, target ở Bước 1 là **file PRD đã tồn tại** `{TICKET-ID}-{prd-slug}.md` (file `.md` duy nhất ở gốc feature folder). Nếu `$ARGUMENTS` rỗng → liệt kê `{specs_dir}/*/*/*.md` và hỏi. **Không tìm thấy file PRD → DỪNG** và chỉ sang `/generate-prd` (feature mới thì đi từ discovery, không phải từ đây).*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Ngôn ngữ nghiệp vụ *(áp cho mọi text mới: UC, AC, BR, Business Logic, Scope)*
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

## Bước 1 — Nạp trạng thái PRD hiện có

Đọc target PRD, trích và lưu:

| Giá trị | Nguồn | Dùng để |
|---|---|---|
| `current_version` | Metadata `\| **Version** \|` | tính version mới ở Bước 6 |
| `current_status` | Metadata `\| **Status** \|` | cảnh báo nếu đang `draft` (xem dưới) |
| `max_uc` | số UC lớn nhất trong §3 | UC mới = `max_uc + 1` |
| `max_br` | số BR lớn nhất **trên TOÀN PRD** | BR mới = `max_br + 1` |
| `max_ac` | số AC lớn nhất trong §2 | AC mới = `max_ac + 1` |
| `existing_ucs` | danh sách UC-ID + tên | phát hiện va chạm ở Bước 3 · báo "UC không đổi" ở Bước 7 |
| `changelog_rows` | bảng `# Change Log` | biết PRD đã đi qua những gì |
| `api_source` | Metadata `API Source` | quyết có cần hỏi contract cho phần thêm không |
| `bdd_generated` | glob `{specs_dir}/{domain}/{prd-slug}/bdd/*/{TICKET-ID}-UC*.feature` | **cảnh báo BR ID churn** + route ở Bước 7 |

**Guard — PRD đang `draft`:** nếu `current_status != approved` → cảnh báo mềm, không chặn:
```
⚠️  PRD đang ở Status: {status} (chưa approved).
    Thêm yêu cầu lên một PRD chưa chốt sẽ trộn hai việc: phần chưa duyệt + phần mới.
    Cân nhắc hoàn tất review vòng hiện tại trước (/review-context → PO duyệt).
    Vẫn thêm bây giờ? (Y/N)
```

**Guard — BDD đã sinh:** nếu `bdd_generated` không rỗng, hiện danh sách và nêu rõ hệ quả:
```
ℹ️  {n} file BDD đã sinh cho PRD này: {danh sách UC × platform}
    Lệnh này CHỈ đánh số nối tiếp (UC{max_uc+1}, BR{max_br+1}) — KHÔNG bao giờ đánh lại
    ID cũ, nên các liên kết @trace.business_rules hiện có KHÔNG bị ảnh hưởng.
    Sau khi thêm: /generate-bdd cho UC MỚI, VÀ cho mỗi UC cũ mà Bước 3.2 kết luận là
    "sửa BR/AC cũ" (BR đó đổi hành vi → BDD của nó lỗi thời thật → 🟠 PRD_DRIFT).
    UC cũ KHÔNG bị sửa gì thì không phải gen lại (ⓘ PRD_STALE_REF).
```

---

## Bước 2 — Nạp hòm thư `prd-change-requests/`

*Đây là **consumer** mà hàng đợi này thiếu suốt từ đầu: `/propose-scenario` Case B ghi vào đó, `/sync` thông báo lúc-đến, `/validate-traces` Step 7b đếm và nhắc — nhưng **không lệnh nào drain**. Đây là chỗ đó.*

Quét `{paths.prd_change_requests_dir}/*.md` (mặc định `{spec_source}/feedback/prd-change-requests/`; **không** quét `archived/`). Thư mục vắng/rỗng → bỏ qua **im lặng**.

Lọc theo PRD này: khớp `{TICKET-ID}` trong tên file hoặc field `UC / Ticket` của metadata request.

| `Status` của request | Xử lý |
|---|---|
| `accepted` | Đưa `Requested behavior` + `Suggested AC` vào làm **nguyên liệu** cho Bước 3. **KHÔNG chèn thẳng vào PRD** — đây là yêu cầu nghiệp vụ, phải qua PO chốt AC/BR đúng tầng. |
| `Open` (chưa ai xử) | **Trình cho PO ngay ở CHECKPOINT** kèm số ngày chờ: *"có {n} request chưa xử lý, đưa vào lần này không?"*. PO chọn từng cái. |
| `rejected` / `incorporated` | Bỏ qua. |

Lưu danh sách request sẽ xử lý (`incoming_requests`) — Bước 6.5 sẽ đóng dấu chúng.

---

## Bước 3 — Discovery delta *(CHỈ phần thêm)*

*Tái dùng đúng các phase của `/define-product` áp dụng được cho một phần thêm. **KHÔNG** lặp Phase 0 (Knowledge Sync — bối cảnh hệ thống đã có trong PRD), Phase 2 (User Flow toàn feature), Phase 7 (Validation Report toàn feature).*

**Áp Discovery Contract của `/define-product`:** input của PO (kể cả nội dung request ở Bước 2) là **nguyên liệu thô**, KHÔNG phải câu trả lời thay phỏng vấn. Item đã phủ → trình bản nháp `🤖 trích từ input` rồi hỏi PO xác nhận/sửa; chỉ khi PO chốt mới nâng thành `✅ PO xác nhận`. **Không có luật skip-if-answered.**

| Phase | Nội dung | Ghi chú |
|---|---|---|
| **3.1** | **Định nghĩa phần thêm** — bối cảnh · vấn đề · phạm vi in/out · actor · pre/post-condition | Tương ứng Phase 1 của `/define-product`, thu hẹp vào phần mới |
| **3.2** | **Va chạm với cái đã có** ⭐ | Xem dưới — đây là phase KHÔNG có trong `/define-product` |
| **3.3** | **Business Rule** cho phần thêm | Phase 4 |
| **3.4** | **Business Logic** | Phase 5 |
| **3.5** | **Acceptance Criteria** | Phase 6 — giữ tầng: AC = outcome quan sát được + ref BR, cơ chế nằm ở BR/BL |

### 3.2 — Kiểm va chạm *(bắt buộc, không bỏ qua)*

*`/define-product` không có phase này vì lúc đó chưa có gì để va chạm. Ở đây thì có — và va chạm âm thầm là cách một PRD tự mâu thuẫn.*

Đối chiếu phần thêm với `existing_ucs` + toàn bộ BR hiện có, hỏi PO ba câu:

1. **Mâu thuẫn rule:** phần thêm có làm một BR hiện có trở nên sai/không đủ không? *(vd BR cũ nói "tối đa 5 file", phần mới cần 20)* → nếu có, đây là **sửa BR cũ**, không phải thêm BR mới. Ghi rõ để Bước 5 sửa đúng chỗ và Bước 6 tính bump **major**.
2. **Trùng lặp:** phần thêm đã được một UC/AC hiện có phủ một phần chưa? → nếu có, hỏi PO: **mở rộng UC cũ** hay **tạo UC mới**. Đừng tự quyết.
3. **Phụ thuộc:** phần thêm có cần dữ liệu/năng lực từ UC khác hoặc service khác không? → bổ sung vào **§1c Phụ thuộc liên service**.

Kết quả 3.2 quyết định hình dạng thay đổi:

| Kết quả | Bước 5 làm gì |
|---|---|
| Thuần thêm mới | Append UC/AC/BR mới. Không đụng nội dung cũ. |
| Có sửa BR cũ | Sửa **tại chỗ** BR đó (Edit) **+** append phần mới. Nêu rõ trong changelog. |
| Mở rộng UC cũ | Append AC/BR mới **vào UC đó**, không tạo UC mới. |

**CHECKPOINT** trước khi ghi:
```
CHECKPOINT — Extend PRD {TICKET-ID}
─────────────────────────────────────────────────
PRD        : v{current_version} ({current_status}) — {n} UC hiện có
Thêm       : UC{max_uc+1} "{tên}"  [hoặc: mở rộng UC{k}]
             +{n} AC (AC{max_ac+1}…) · +{m} BR (BR{max_br+1}…)
Sửa cái cũ : {danh sách BR/AC bị sửa do va chạm — hoặc "không"}
Từ request : {danh sách file request được đưa vào — hoặc "không"}
Version    : {current} → {new} ({major|minor}) · Status → draft
BDD ảnh hưởng: /generate-bdd cho UC mới{, và cho UC{k} vì BR8 bị sửa}
             {n} UC cũ không đụng gì → KHÔNG phải gen lại

Tiếp tục? (Y/N)
```

---

## Bước 4 — Đánh số nối tiếp *(TUYỆT ĐỐI không đánh lại)*

| Loại | Quy tắc |
|---|---|
| UC | `UC{max_uc + 1}`, tăng dần |
| BR | `{TICKET-ID}-UC{n}-BR{max_br + 1}` — **`max_br` tính trên TOÀN PRD**, không reset theo UC |
| AC | `AC{max_ac + 1}` |

> **Đây là ràng buộc cứng nhất của lệnh này.** Đánh lại ID cũ — kể cả để "cho gọn" — sẽ phá:
> - `@trace.business_rules` trong mọi `.feature` đã sinh (BR ID churn)
> - dòng "AC liên quan" của từng UC
> - mọi cross-reference `[TICKET-ID](./file.md)` từ PRD khác trỏ tới AC/BR cụ thể
>
> Số bị bỏ trống (do UC cũ bị xoá ở version trước) **để trống vĩnh viễn**. Đừng lấp lại — ID đã từng
> tồn tại có thể còn bị tham chiếu ở BDD, code, bug report, hoặc PRD khác.

---

## Bước 5 — Ghi vào PRD *(Edit add-only, KHÔNG Write)*

> **Kỷ luật EXTEND — copy nguyên từ `/generate-code` §File Scan, cùng lý do:**
>
> 1. **Đọc lại file trên disk NGAY TRƯỚC khi ghi** (không dựa vào bản nạp ở Bước 1 — có thể đã đổi).
> 2. **CHỈ dùng Edit để THÊM.** **CẤM tuyệt đối Write cả file.** Đây là nguyên nhân số 1 xoá nghiệp vụ đã duyệt.
> 3. Output PHẢI là **superset chặt** của bản cũ: **mọi** UC, AC, BR, row bảng, dòng changelog, cross-reference cũ **còn nguyên si** — trừ đúng những chỗ Bước 3.2 kết luận là "sửa BR cũ", và chỉ đúng những chỗ đó.
> 4. **Guard sau-ghi (bắt buộc):** đọc lại file vừa ghi, đối chiếu với bản trước khi sửa. Kiểm: mọi UC-ID cũ · mọi BR-ID cũ · mọi AC cũ · mọi row `# Change Log` cũ **vẫn còn**. Nếu **mất bất kỳ cái nào** → **DỪNG NGAY, khôi phục file về bản cũ** (`git checkout -- {file}` nếu đã commit, hoặc hoàn tác edit), báo:
>    ```
>    ❌ EXTEND làm mất {UC/AC/BR/changelog row} — đã chặn clobber.
>       File đã khôi phục. Sửa lại theo add-only rồi chạy lại.
>    ```
>    **KHÔNG** tiếp tục sang Bước 6.

Vị trí ghi từng loại nội dung:

| Nội dung | Đặt ở đâu |
|---|---|
| UC mới | **Cuối §3**, sau UC hiện có cuối cùng. Đủ Actor · Description · Pre-condition · Post-condition · bảng BR · dòng "AC liên quan" |
| AC mới | **Cuối §2**, kèm ref `_(BR: …)_` trỏ về BR tương ứng |
| BR mới | Bảng BR của UC sở hữu. **Giữ đúng hình dạng bảng hiện có** (3 cột hay đã mở cột) — đừng đổi hình dạng ở lệnh này |
| Phụ thuộc mới | **§1c Phụ thuộc liên service** — append, mức nghiệp vụ |
| Màn hình mới | **§4b Wireframe** — nguồn coverage cho `/generate-bdd` C.1 |
| Quy ước mới dùng ≥2 chỗ | **§1d**, khai MỘT LẦN, AC/BR trỏ tới thay vì chép |

**Altitude khi viết** *(giống `/refine-prd` Phase 2)*: AC = **outcome quan sát/kiểm được + ref BR**, KHÔNG chứa cơ chế (số lần retry, timeout, tên cờ, nhánh lỗi vụn) — cơ chế nằm ở BR/BL. AC không lặp lại nội dung BR nó ref.

**Chạy Business Language Guard trên MỌI text mới TRƯỚC khi ghi** — đừng để phần thêm kéo thuật ngữ kỹ thuật/UI vào một PRD đang sạch.

---

## Bước 6 — Bump version & ghi changelog

*Tái dùng **nguyên** `### Phase 3` của `/refine-prd`. Không viết lại luật ở đây — dòng changelog là **contract**: `/generate-bdd` Version Check đọc nó để quyết cập nhật hẹp (Y) hay gen lại toàn bộ (F), và `/validate-traces` Step 4/5 đọc nó để lọc `PRD_DRIFT` 🟠 vs `PRD_STALE_REF` ⓘ. Viết kiểu khác là làm hỏng cả hai.*

1. Loại bump:
   - **major** (X.0 → X+1.0): thêm UC mới · sửa BR cũ theo hướng breaking · tái cấu trúc scope. *(Thêm UC là major theo định nghĩa của `/refine-prd` Phase 3.)*
   - **minor** (x.Y → x.Y+1): chỉ thêm AC/BR vào UC đã có, không đổi hành vi cũ.
2. Cập nhật Metadata: `Version` = mới · `Updated` = hôm nay · **`Status` = `draft`** *(thêm yêu cầu = phải duyệt lại)*.
3. Thêm row lên **đầu** bảng `# Change Log`:
   ```
   | {new_version} | {today} | {changelog_scope} |
   ```
   **`{changelog_scope}` — mỗi mệnh đề mở đầu bằng UC SỞ HỮU** *(contract: `bin/trace-schema.json` → `changelog_row_contract`)*. Nguồn: UC mới (Bước 4) + **UC sở hữu mỗi BR/AC bị sửa** (kết luận Bước 3.2). Ngăn nhau bằng `;`. Nội dung không thuộc UC nào (§1c phụ thuộc, §1d quy ước) → `PRD-global`.

   **Ví dụ đúng:**
   ```
   thêm UC7 (xuất nhiều file): AC12-AC14, BR21-BR23; UC3: sửa BR8 (nâng giới hạn 5→20)
   ```
   **Ví dụ SAI — mơ hồ:** `cập nhật theo yêu cầu mới` ← `/generate-bdd` sẽ khuyến nghị gen lại **toàn bộ**, và `/validate-traces` gắn `PRD_DRIFT` 🟠 cho **mọi** UC thay vì chỉ UC mới. Mất bộ lọc theo hướng **ỒN**.

   **Ví dụ SAI — nêu BR mà bỏ UC sở hữu:** `…; sửa BR8 (nâng giới hạn 5→20)` ← thiếu `UC3:`.

   > ⚠️ **Đây là ca nguy hiểm HƠN ca mơ hồ, và là lý do luật này thành contract (G53).** Row trên nêu rất nhiều ID nên **không** bị coi là mơ hồ. Nhưng `/validate-traces` Step 4 khớp bằng phép thử *"**UC** này có trong tập bị ảnh hưởng?"* — tập là `{UC7, AC12-14, BR21-23, BR8}`, và **UC3 không có trong đó**. Nên UC3 → ⓘ `PRD_STALE_REF` *"không phải lỗi"*, trong khi BR mà nó sở hữu **vừa đổi hành vi 5→20**.
   >
   > Và nó không dừng ở một cờ sai: rào an toàn của `--realign-prd-version` chỉ **từ chối khi UC là 🟠**. Ở đây nó là **ⓘ** ⇒ rào **mở cửa** ⇒ nhãn `prd_version` được dán lại trong cả TSV lẫn tag code ⇒ **cờ sạch vĩnh viễn trên một thay đổi chưa ai implement**. Mất bộ lọc theo hướng **IM LẶNG**.
   >
   > Viết `UC3:` là một tiền tố ba ký tự. Bỏ nó là mở một đường tự động che lỗi.
4. Cập nhật dòng đầu section: `> Hiện tại: **v{new}** ({today}) · Lịch sử đầy đủ → [changelog](./changelog/{TICKET-ID}-{prd-slug}.changelog.md)`
5. **Rollover** (cửa sổ trượt 5 row): bảng `# Change Log` vượt **5** row → chuyển mọi row vượt 5 (cũ nhất) sang **đầu** bảng của `{specs_dir}/{domain}/{prd-slug}/changelog/{TICKET-ID}-{prd-slug}.changelog.md`; PRD giữ 5 row gần nhất. Tạo dir + file theo skeleton của `/refine-prd` Phase 3 nếu chưa có.

---

## Bước 6.5 — Đóng dấu request đã xử lý

Với mỗi file trong `incoming_requests` đã được PO chốt và nội dung đã ghi vào PRD:

1. Đặt `Status: incorporated` trong file request.
2. Thêm dòng `Incorporated into: v{new_version}` — để lần sau tra được yêu cầu nào vào version nào.
3. Chuyển file sang `{paths.prd_change_requests_dir}/archived/` (tạo dir nếu cần).
4. **Commit + push** spec repo (giống `feedback/` — xem `/propose-scenario` Step 5): `git add feedback/prd-change-requests/ && git commit -m "po(prd-change): {TICKET-ID} — incorporated into v{new}" && git push`. Không có quyền push → mở PR/MR và in fallback.

Request mà PO **không** chốt lần này → **để nguyên** `Status: Open`. `/validate-traces` Step 7b sẽ tiếp tục nhắc kèm số ngày chờ.

---

## Bước 7 — Report

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

Ví dụ footer cho lệnh này:

```
/extend-prd Đã thêm — {TICKET-ID} {tên feature}

Version   : v{old} → v{new} ({major|minor}) · Status → draft
Thêm      : UC{N} "{tên}" · AC{a}-AC{b} · BR{c}-BR{d}
Sửa cũ    : {UC3: BR8 — nâng giới hạn 5→20 | không}   ← LUÔN nêu UC sở hữu
Request   : {2 file → archived/ (incorporated v{new}) | không}
Changelog : | v2.0 | 2026-08-19 | thêm UC7: AC12-AC14, BR21-BR23; UC3: sửa BR8 (giới hạn 5→20) |

Guard sau-ghi : ✅ {n} UC · {m} AC · {k} BR · {j} changelog row cũ — còn nguyên

UC BỊ SỬA nội dung ({n}): {UC3}
  → CẦN /generate-bdd rồi /generate-code cho các UC này — BR/AC của chúng vừa đổi hành vi.
    /validate-traces sẽ xếp chúng vào 🟠 PRD_DRIFT (đúng).
    ❌ TUYỆT ĐỐI KHÔNG dùng --realign-prd-version cho chúng — đó là dán nhãn lên thay đổi
       chưa ai implement.

UC KHÔNG đổi ({n}): {UC1, UC2, UC4…}   ← = existing_ucs TRỪ danh sách "UC BỊ SỬA" ở trên
  → KHÔNG cần /generate-bdd hay /generate-code cho các UC này.
    /validate-traces sẽ xếp chúng vào ⓘ PRD_STALE_REF (nhãn version cũ, nội dung không đổi).
    Sạch bằng: /validate-traces --realign-prd-version {UC-ID}

⚠️  Status đã reset về draft — phần thêm chưa được duyệt.

---
Status   : ✅ Complete
Output Artifacts:
  updated {paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md (v{new})
  updated {paths.specs_dir}/{domain}/{prd-slug}/changelog/… (nếu có rollover)
  updated {paths.prd_change_requests_dir}/archived/… (nếu có request)
Pipeline : Discovery → [PRD ◀ bạn ở đây] → Design Spec → BDD → Tech Design → Code → Dev Self-Check → QC → Trace Audit
Next     : /refine-prd {prd-file}        ← soi phần vừa thêm qua 3 lăng kính
           → /review-context {prd-file}  ← kiểm chất lượng trước khi sinh BDD
           → khi sạch critical, PO đặt Status: approved, rồi:
               • Feature CÓ màn hình → /generate-design-spec {prd-file} (design-spec sẽ tự
                 phát hiện lỗi thời vs PRD mới và bắt sign-off lại) rồi /generate-bdd
               • Thuần backend → /generate-bdd {prd-file} thẳng
           → gen BDD/code cho UC MỚI **và** UC cũ bị sửa BR/AC (xem "UC BỊ SỬA nội dung").
             CHỈ UC cũ không đụng gì mới dùng --realign-prd-version.
```

---

## Quality Checklist *(kiểm trước khi ghi)*

- [ ] **Không đánh lại BẤT KỲ ID cũ nào** — UC/AC/BR mới đều là `max + 1`; số bị bỏ trống vẫn để trống
- [ ] `max_br` tính trên **toàn PRD**, không reset theo UC
- [ ] Guard sau-ghi đã chạy và PASS: mọi UC/AC/BR/changelog row cũ còn nguyên
- [ ] Bước 3.2 đã hỏi đủ 3 câu va chạm (mâu thuẫn rule · trùng lặp · phụ thuộc)
- [ ] Mỗi AC mới có ≥1 ref `_(BR: …)_`; mỗi UC mới có dòng "AC liên quan"; hai chiều khớp nhau
- [ ] Dòng changelog: mỗi mệnh đề **mở đầu bằng UC sở hữu** (`UC3: sửa BR8`) — **không** BR/AC đứng một mình, **không** mơ hồ *(contract: `changelog_row_contract`; BR trơ trọi ⇒ UC đó thành ⓘ ⇒ `--realign` che lỗi)*
- [ ] `Status` đã reset về `draft`
- [ ] Hình dạng bảng BR giữ nguyên như cũ (không đổi 3-cột ↔ mở-cột ở lệnh này)
- [ ] Không có banned term; 0 thuật ngữ kỹ thuật/UI trong text mới
- [ ] Request đã xử lý → `incorporated` + `archived/` + commit; request chưa xử lý → giữ `Open`
- [ ] Report nêu **CẢ HAI** danh sách: **UC BỊ SỬA nội dung** (→ `/generate-bdd`, cấm `--realign`) và **UC không đổi** (→ `--realign-prd-version`). Danh sách thứ hai = `existing_ucs` **TRỪ** danh sách thứ nhất — không được lấy trọn `existing_ucs`

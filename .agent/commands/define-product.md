# /define-product — Khám phá tính năng (Q&A 8 Phase)

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


*Lưu ý: Với lệnh này, không có file input cần phân giải ở Bước 1. Bỏ qua sang Bước 2 (nạp context) rồi hỏi: **"Ticket ID và tên feature? (vd: LOYAL-29 Loyalty Points)"***

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Ngôn ngữ nghiệp vụ *(áp khi viết BR / AC / Business Logic / Scope)*
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

## Discovery Contract *(đọc trước — quyết định cách xử lý input của PO)*

Lệnh này là **khai vấn (discovery)**, KHÔNG phải thu thập dữ liệu. Giá trị nằm ở **quá trình hỏi** — nó ép PO nói ra những gì chưa viết (edge case, out-of-scope, phụ thuộc, rule mâu thuẫn). Vì vậy:

> **Input của PO là NGUYÊN LIỆU THÔ, KHÔNG phải câu trả lời thay thế phỏng vấn.**
> Dù PO dán tài liệu dày cỡ nào — **vẫn đi hết Phase 1→7, mọi CHECKPOINT vẫn phải nổ.** TUYỆT ĐỐI KHÔNG coi input là "đã trả lời" rồi nhảy phase. Đây là điểm khác biệt cốt lõi so với các lệnh thu thập dữ kiện (generate-code/architecture "vét nguồn rồi mới hỏi") — ở discovery, **không có luật skip-if-answered.**

**Cơ chế Confirm-vs-Ask** *(áp cho mọi câu hỏi ở Phase 1–6)*:
- **Item input ĐÃ phủ** → KHÔNG skip. Trình bản nháp đã trích, đánh dấu `🤖 trích từ input` và hỏi PO **xác nhận / sửa / bổ sung**:
  ```
  🤖 Trích từ input: "{nội dung AI hiểu được}"
  → Đúng chưa? Cần sửa/bổ sung gì không?
  ```
  Chỉ khi PO chốt mới nâng dấu thành `✅ PO xác nhận` và đi tiếp.
- **Item input CHƯA phủ** → hỏi mới bình thường.
- **Nghịch lý độ dày:** input càng dày → GAP tiềm ẩn càng nhiều (đó là thứ PO *chưa nghĩ tới*), nên phần soi hở ở **Phase 3 càng phải sâu**, KHÔNG được rút ngắn. Input dày tạo *ảo giác đủ* — đừng mắc bẫy.

**Phân biệt dấu (bắt buộc, để chống blitz):** trong file output, mỗi dữ kiện mang một trong hai dấu — `✅ PO xác nhận` (PO đã chốt trực tiếp) hoặc `🤖 AI trích — chờ PO chốt`. Một phase CHỈ được đóng khi mọi item của nó mang dấu `✅`. Không tự nâng `🤖`→`✅` thay PO.

---

## Phase 0 — Knowledge Sync *(AI tự điền — bối cảnh hệ thống, KHÔNG phải yêu cầu nghiệp vụ; không cần input PO)*

AI quét dự án và ghi:

- **Khái niệm / dữ liệu nghiệp vụ liên quan** — liệt kê khái niệm từ các PRD/domain-knowledge có sẵn liên quan tới feature này.
- **Phần hệ thống / feature liên quan** — liệt kê phần hệ thống/feature bị ảnh hưởng.
- **Rule / Logic có sẵn** — các rule từ PRD có sẵn mà feature này phải tôn trọng.
- **Chuẩn hoá thuật ngữ** — map mọi thuật ngữ trong input PO về thuật ngữ chuẩn từ business-dictionary.md.
  - **NEW TERM DETECTION:** nếu một thuật ngữ trong input PO lặp ≥2 lần và KHÔNG có canonical tương ứng trong business-dictionary.md → KHÔNG để trống/bịa. Ghi nó thành một câu hỏi trong **Phase 3 (Clarification Log)** để hỏi PO ngay khi còn trong buổi discovery:
    + Thuật ngữ đó nghĩa gì trong ngữ cảnh hệ thống?
    + English canonical term nên dùng là gì?
    + Có bổ sung vào business-dictionary.md không?
    Sau khi PO chốt → cập nhật business-dictionary.md (nếu đồng ý) + điền vào bảng map. *(Phase 0 chỉ phát hiện; việc hỏi dồn vào Phase 3 để không phá tính chất "không cần input PO" của Phase 0.)*

```
| Thuật ngữ trong input PO | Thuật ngữ chuẩn (business-dictionary) |
|--------------------------|---------------------------------------|
| {thuật ngữ gốc}          | {thuật ngữ chuẩn}                     |
```

Lưu bản đồ thuật ngữ này vào file product-definition output dưới section `### Chuẩn hoá thuật ngữ` (trong Phase 0) — `/generate-prd` sẽ tham chiếu nó trong bước **Quy tắc thuật ngữ** để đảm bảo nhất quán.

---

## Phase 1 — Feature Definition *(CHECKPOINT 1)*

Hỏi **lần lượt từng câu một**, đợi PO trả lời rồi mới hỏi câu kế. Giữ giọng nghiệp vụ, thân thiện; nếu PO lúng túng, đưa một ví dụ ngắn để gợi ý. Tránh hỏi về giải pháp kỹ thuật ở phase này.

> **Áp Confirm-vs-Ask (Discovery Contract):** với câu mà input PO đã phủ, ĐỪNG bỏ qua — trình bản nháp `🤖 trích từ input` rồi hỏi PO xác nhận/sửa/bổ sung; câu chưa phủ thì hỏi mới. Mọi câu 1–8 đều phải có một cú chạm xác nhận của PO trước khi tóm tắt.

1. **Context**: Bối cảnh / lý do vì sao cần feature này?
2. **Problem**: Vấn đề cụ thể cần giải quyết?
3. **Goal**: Khi feature chạy ổn, kết quả nghiệp vụ bạn muốn thấy là gì? Mô tả *thành quả*, chưa cần cách làm.
4. **Actors**: Những ai sẽ dùng feature này? Liệt kê từng vai trò, và đánh dấu ai là người dùng chính (Primary), ai phụ (Secondary).
5. **In Scope**: Feature này làm gì? (mỗi dòng một chức năng — chỉ những gì thuộc ticket này)
6. **Out of Scope**: Cái gì KHÔNG làm trong ticket này? Ghi rõ kèm lý do hoặc để dành pha/ticket sau — để tránh phình phạm vi.
7. **User Story**: Xác nhận theo format (mỗi ý một bullet):
   - **Là một (As a)** {vai trò}
   - **Tôi muốn (I want to)** {mục tiêu}
   - **Để (So that)** {giá trị nghiệp vụ}
8. **Phụ thuộc liên service**: Để chạy được, feature có cần **dữ liệu hay năng lực** gì từ feature/team khác không? Mô tả ở mức nghiệp vụ (cần gì, từ ai, vì sao) — chưa cần nói API hay kỹ thuật. Nếu không có → trả lời "Không có".

Sau câu 8 → **tóm tắt lại toàn bộ** cho PO → chờ xác nhận → ghi `✅ PO xác nhận: Có` → sang Phase 2.

---

## Phase 2 — User Flow Definition *(CHECKPOINT 2)*

> **Áp Confirm-vs-Ask (Discovery Contract):** input phủ bước nào → trình bản nháp `🤖 trích từ input` để PO xác nhận/sửa; bước nào input im lặng (đặc biệt Edge Cases) → hỏi mới, KHÔNG tự bịa cho đủ bảng.

Hỏi:
1. **Entry Point**: Người dùng bắt đầu tương tác với feature này ở đâu?
2. **Flow Steps**: Mô tả từng bước (dùng bảng):
   ```
   | Bước | Hành động | Trạng thái/Kết quả nghiệp vụ | Ghi chú |
   ```
3. **Màn hình & thành phần chính** *(mức nghiệp vụ — KHÔNG pixel/layout/màu)*: Feature gồm những **màn hình / bước giao diện** chính nào? Mỗi màn có **thành phần & hành động chính** gì (vd: ô nhập, nút, danh sách → bấm ra kết quả gì)? Đây là nguồn cho Wireframe của PRD và độ phủ BDD — nếu PO không chắc, AI gợi ý rồi PO xác nhận.
   ```
   | Màn hình | Thành phần chính | Hành động → kết quả nghiệp vụ |
   ```
4. **Exit Point**: Kết quả cuối khi flow hoàn thành là gì?
5. **Edge Cases**: Các kịch bản thất bại nghiệp vụ ngoài happy path? (input thiếu, điều kiện không thoả, thao tác đồng thời, phụ thuộc không sẵn sàng → kết quả nghiệp vụ kỳ vọng)

Xác nhận → ghi `✅ PO xác nhận: Có` → tiếp tục.

---

## Phase 3 — Clarification Log *(CHECKPOINT 3)*

Dựa trên Phase 1-2, AI xác định gap và hỏi các câu follow-up. Tiếp tục các vòng cho tới khi không còn Mục chưa giải quyết.

> **BẮT BUỘC chạy ≥1 vòng — KHÔNG được bỏ qua kể cả khi input rất dày.** Đây là nơi bắt GAP mà PO *chưa nghĩ tới*, nên độ dày input KHÔNG làm giảm nhu cầu hỏi — mà **làm tăng**. AI phải chủ động thách thức các **vùng input im lặng**, tối thiểu soi 4 nhóm:
> 1. **Edge case / luồng lỗi** chưa được nêu (input thiếu, điều kiện không thoả, thao tác đồng thời).
> 2. **Out-of-scope mơ hồ** — ranh giới ticket chưa rõ, dễ phình phạm vi.
> 3. **Phụ thuộc liên service** input ngầm giả định nhưng chưa xác nhận (dữ liệu/năng lực từ team khác).
> 4. **Rule mâu thuẫn / chồng chéo** giữa các phát biểu trong input.
>
> Với mỗi item `🤖 AI trích — chờ PO chốt` còn sót từ Phase 1–2 → gom vào đây để PO chốt dứt điểm. **Không được nâng dấu `🤖`→`✅` thay PO.**

```
### Vòng {N}
| # | Nhóm           | Câu hỏi    | PO trả lời |
|---|----------------|------------|------------|
| 1 | Context/Flow/Logic | {câu hỏi} | {trả lời} |
```

**BLOCK**: Nếu còn Mục chưa giải quyết → KHÔNG được sang Phase 4.

### Mục chưa giải quyết
- {mục — hoặc "None"}

Khi mọi Mục chưa giải quyết đã xử lý → ghi `✅ CHECKPOINT 3: Không còn mục tồn đọng` → sang Phase 4.

---

## Phase 4 — Business Rules *(CHECKPOINT 4)*

Suy ra từ Phase 1-3. Mỗi BR = một quy tắc (hệ thống PHẢI / KHÔNG được làm gì — WHAT):

```
| Rule ID | Hành động/Trigger   | Quy tắc                       | Điều kiện           |
|---------|---------------------|-------------------------------|---------------------|
| BR-1    | {hành động từ flow} | System MUST/MUST NOT...       | {điều kiện áp dụng} |
```

Xác nhận → ghi `✅ PO xác nhận: Có` → tiếp tục.

---

## Phase 5 — Business Logic *(CHECKPOINT 5)*

Map mỗi BR sang **logic nghiệp vụ** thực thi nó (rẽ nhánh / công thức / điều kiện — KHÔNG mô tả thay đổi dữ liệu hay hành vi UI; đó là kỹ thuật/design):

```
| Rule ID | Logic nghiệp vụ (rẽ nhánh / công thức / điều kiện) | Thông báo/kết quả nghiệp vụ khi lỗi |
|---------|---------------------------------------------------|-------------------------------------|
| BR-1    | {logic nghiệp vụ khi rule kích hoạt}              | {vd: báo "Số dư không đủ"}           |
```

Xác nhận → ghi `✅ PO xác nhận: Có` → tiếp tục.

---

## Phase 6 — Acceptance Criteria *(CHECKPOINT 6)*

Suy ra từ BR + User Story. Mỗi AC phải testable (pass/fail rõ ràng):

```
| AC ID | Mô tả                   | Hành vi kỳ vọng            | Bắt nguồn từ |
|-------|-------------------------|----------------------------|--------------|
| AC-1  | {mô tả tiêu chí}        | {hành vi hệ thống cần làm} | BR-{N}       |
```

Xác nhận → ghi `✅ PO xác nhận: Có` → tiếp tục.

---

## Phase 7 — Validation Report

Tự sinh ma trận độ phủ:

```
| Hành động Flow | Có Rule? | Có Logic? | Có AC? | Status |
|----------------|----------|-----------|--------|--------|
| {Hành động 1}  | ✅/❌    | ✅/❌     | ✅/❌  | OK/GAP |
```

- **Xung đột phát hiện**: liệt kê các rule xung đột, hoặc "None".
- **Mục còn thiếu**: liệt kê gap, hoặc "None".

Nếu phát hiện GAP → cảnh báo PO và giải quyết trước khi đánh dấu completed.

---

## Output

Ghi `{paths.product_definitions_dir}/{TICKET-ID}-{slug}.md` theo `templates/product-definition.template.md`.

> **Quy ước `slug`:** `slug` = kebab-case của tên feature (vd "Loyalty Points" → `loyalty-points`),
> viết thường, chỉ a-z 0-9 và dấu `-`. Đây là định danh feature-package dùng xuyên suốt pipeline —
> PRD, BDD, tech-docs, design-spec, trace của feature này đều kế thừa **nguyên văn** `slug` này
> (`/generate-prd` đặt `prd-slug = slug`). Sinh một lần ở đây, các bước sau KHÔNG tái sinh.
>
> **Ranh giới tên file:** tên file = `{TICKET-ID}-{slug}.md`. TICKET-ID **được phép chứa `-`**
> (vd Jira key `LOYAL-29` → `LOYAL-29-loyalty-points.md`). Khi tách lại slug, các bước sau strip
> **đúng chuỗi TICKET-ID** ở đầu, KHÔNG tách theo dấu `-` đầu tiên.

Điền tất cả section bằng dữ liệu thu thập qua các phase.

**Cập nhật Metadata theo tiến độ (cho phép resume):**
- Sau mỗi CHECKPOINT phase được chốt (`✅ PO xác nhận: Có`, hoặc với Phase 3 là `✅ CHECKPOINT 3: Không còn mục tồn đọng`) → cập nhật `Completed Phase` = số phase vừa xong và giữ `Status: in-progress`.
- **Chống blitz:** một phase CHỈ được tính là chốt khi mọi item của nó mang dấu `✅ PO xác nhận` — nếu còn bất kỳ item `🤖 AI trích — chờ PO chốt` nào, phase đó CHƯA xong, KHÔNG được tăng `Completed Phase`.
- Khi Phase 7 pass mà không còn GAP → đặt `Completed Phase: 7` và `Status: completed`.
- Nếu discovery bị ngắt giữa chừng, file vẫn được ghi với `Completed Phase` phản ánh phase cao nhất đã xác nhận — buổi sau resume tiếp từ phase kế tiếp.

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

Ví dụ footer cho lệnh này:

```
---
Status   : ✅ Complete
Output Artifacts:
  created {paths.product_definitions_dir}/{TICKET-ID}-{slug}.md (product definition, Phase 1-7)
Pipeline : [Discovery ◀ bạn ở đây] → PRD → Design Spec → BDD → Tech Design → Code → Dev Self-Check → QC → Trace Audit
Next     : /generate-prd {paths.product_definitions_dir}/{TICKET-ID}-{slug}.md
```

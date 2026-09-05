# /generate-prd — Sinh Product Requirements Document

## Gate

*Checkpoint: **chặn CỨNG** — ghi đè PRD đã có → mất changelog, ĐÁNH SỐ LẠI BR, phá @trace.business_rules trong mọi .feature đã sinh. `--yes` KHÔNG bỏ qua được (gate Bước 3a).*

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


*Lưu ý: Với lệnh này, target file ở Bước 1 là một file product-definition trong `{paths.product_definitions_dir}/`. Phân giải từ `$ARGUMENTS` hoặc liệt kê thư mục và hỏi.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

*Context bổ sung cho lệnh này: Đọc toàn bộ file product-definition. Trích xuất: **TICKET-ID**, **domain**, **tên feature**, **tên PO** (field `PO` ở Metadata), dữ liệu Phase 1-7, và bảng **Chuẩn hoá thuật ngữ** (Terminology Map ở Phase 0 — các cặp `thuật ngữ PO → thuật ngữ chuẩn`). Lưu bản đồ này để áp dụng ở bước Quy tắc thuật ngữ. **Nếu Phase 7 (Validation Report) còn `Xung đột phát hiện` / `Mục còn thiếu` khác "None" → diễn đạt lại mỗi mục thành một câu hỏi theo format `Q… — [AI DRAFT]` của section "Giả định AI" (nêu rõ độ vênh + cần PO chốt điều gì), thay vì dán thô. AI không tự quyết thay PO.***

**Map "Phụ thuộc liên service"** (Phase 1 câu 8 của product-definition) → **§1c "Phụ thuộc liên service"** của PRD, giữ nguyên mức nghiệp vụ (cần dữ liệu/năng lực gì, từ ai, vì sao — KHÔNG thêm chi tiết API/kỹ thuật). Nếu discovery ghi "Không có" → §1c ghi "Không có".

**Map "Màn hình & thành phần chính"** (Phase 2 của product-definition) → **§4b Wireframe** của PRD: mỗi màn hình thành một Screen với Components/Actions tương ứng. Đây là nguồn coverage cho `/generate-bdd` (C.1). Nếu phải **suy thêm** Screen/component mà discovery chưa nêu → đánh dấu rõ `*(AI đề xuất — PO review)*` cạnh phần đó, đừng để âm thầm thành chân lý coverage.

**Phân giải PO** (đọc trước, hỏi sau): lấy `PO` từ Metadata của product-definition. Nếu đã có giá trị → dùng luôn, KHÔNG hỏi lại. Nếu trống/thiếu → hỏi PO ngay ở CHECKPOINT dưới. Điền giá trị này vào field `PO` của PRD Metadata.

**Phân giải link tracker (hỏi cho MỌI ticket):** `TICKET-ID` là **định danh nội bộ** PO tự đặt lúc discovery — **KHÔNG đảm bảo** là một Jira key có thật, nên **TUYỆT ĐỐI KHÔNG tự dựng URL** kiểu `{base}/browse/{TICKET-ID}` (sẽ ra link rác trỏ tới ticket không tồn tại). Field `Ticket` **luôn giữ TICKET-ID dạng plain text**; link Jira (nếu có) chỉ **đặt thêm bên cạnh**. **Luôn hỏi PO**: *"Ticket {TICKET-ID} có link tracker thật (Jira/khác) không? Nếu có, dán vào."*
- PO **có** link → điền field `Ticket` dạng: `{TICKET-ID} ([Jira]({tracker_url}))` — plain ID đứng trước, link trong ngoặc bên cạnh.
- PO **không** có / để trống → điền plain text `{TICKET-ID}` (KHÔNG link, KHÔNG placeholder `{...}` lủng lẳng).

**Phân giải `slug`** (kế thừa, KHÔNG tái sinh): đọc `TICKET-ID` từ Metadata `Ticket` của product-definition, rồi lấy `slug` = phần tên file **sau khi strip đúng chuỗi `{TICKET-ID}-` ở đầu**. **KHÔNG tách theo dấu `-` đầu tiên** — vì TICKET-ID có thể chứa `-` (vd Jira key `LOYAL-29`): `LOYAL-29-loyalty-points.md` với TICKET-ID `LOYAL-29` → `slug = loyalty-points` (KHÔNG phải `29-loyalty-points`). Đặt `prd-slug = slug` này cho feature-package PRD, để folder `{specs_dir}/{domain}/{prd-slug}/` khớp 1-1 với product-definition. KHÔNG tự bịa slug mới — nếu tên file không bắt đầu bằng `{TICKET-ID}-`, dừng và hỏi người dùng.

**Guard — discovery phải hoàn tất:** đọc `Status` và `Completed Phase` từ Metadata của product-definition.
- Nếu `Status: completed` (Completed Phase = 7) → tiếp tục bình thường.
- Nếu `Status: in-progress` (Completed Phase < 7) → **DỪNG**, KHÔNG sinh PRD, báo:
  ```
  ❌ Product-definition chưa hoàn tất (Status: in-progress, Completed Phase: {N}/7).
     /generate-prd cần discovery đủ Phase 1-7 (BR, Business Logic, AC, Validation Report).
     Chạy lại /define-product {file} để resume từ Phase {N+1}, rồi mới sinh PRD.
  ```
  PRD là artifact ký duyệt — không sinh từ nguồn discovery chưa chốt.

**Phân giải `API Source` (brownfield / greenfield / partner song song):** hỏi PO **một** câu để chốt **loại** nguồn API — PO CHỈ chốt loại, **không bao giờ gõ chi tiết contract**:

> "API của feature này thuộc loại nào?
>   1. **existing** — API đã chạy production, contract cố định
>   2. **greenfield** — mình tự thiết kế contract mới
>   3. **partner** — đối tác đang phát triển song song, contract chưa có"

- **(1) existing** → set Metadata `API Source: existing`. Xin PO **con trỏ nguồn** contract (1 trong: file openapi/swagger, URL swagger, path service/repo BE, hoặc doc đính kèm). AI **trích as-is** vào Appendix "Existing API Contract" (ghi rõ nguồn từng row — KHÔNG bịa, KHÔNG thiết kế mới). *Người điền detail là AI từ artifact thật, KHÔNG phải PO.*
  - Nếu con trỏ **không truy cập được** từ context hiện tại → KHÔNG fabricate: ghi block `⛔ PENDING: contract chưa trích — nguồn: {pointer}; phải trích as-is trước /generate-bdd` vào section đó, vẫn giữ `API Source: existing`. Coi phần contract của PRD chưa hoàn tất tới khi bảng đủ.
- **(2) greenfield** → để trống `API Source`. **Xoá** Appendix "Existing API Contract" (template đã dặn). Contract sẽ được thiết kế ở `/generate-tech-docs`.
- **(3) partner song song** → ĐI LUỒNG greenfield (`API Source` để trống, **xoá** section Existing API Contract), **KHÔNG** set `existing`. Thêm:
  - Ghi phụ thuộc partner vào **§1c "Phụ thuộc liên service"** của PRD (mức nghiệp vụ): cần contract/năng lực gì từ partner nào, vì sao.
  - Một mục trong "Giả định AI": *"Contract do partner {X} phát triển song song; bản tech-docs sinh sau là ĐỀ XUẤT của ta để đàm phán (qua cổng T7 cross-team sign-off), chốt khi partner confirm — có thể thay đổi."*
  - Lý do KHÔNG dùng `existing`: `existing` làm `/review-tech-docs` **skip T7** — nhưng partner song song chính là lúc CẦN T7 để đàm phán contract.

> **`API Source` là field có vòng đời:** có thể bắt đầu greenfield/partner rồi **chuyển thành `existing`** khi contract được chốt (vd partner áp contract của họ và ta phải theo). Khi đó: chạy `/refine-prd` đổi `API Source → existing` + điền Existing API Contract từ nguồn partner (trích as-is) + bump Version; `/generate-bdd` (Version drift) và `/generate-tech-docs` (reverse-document) sẽ tự realign system BDD + tech-doc theo contract mới. FE/App BDD phần lớn không vỡ nhờ luật declarative (assert outcome quan sát được, không assert shape JSON).

CHECKPOINT trước khi sinh: "Sinh PRD cho **{TICKET-ID} — {feature}** (domain: {domain}), PO: **{tên PO — hoặc hỏi nếu product-definition để trống}**. API Source: **{existing — nguồn {pointer} | greenfield | partner song song}**. Link tracker: **{URL — hoặc 'không có, dùng plain ID'}**. Nguồn: discovery hoàn tất (Phase 7/7). Tiếp tục? (Y/N)"

---

## Quy tắc thuật ngữ *(áp dụng nếu business-dictionary.md tồn tại)*

- **Áp dụng Terminology Map từ product-definition**: với mỗi cặp `thuật ngữ PO → thuật ngữ chuẩn` trong bảng **Chuẩn hoá thuật ngữ** (Phase 0 của product-definition), dùng **thuật ngữ chuẩn** khi viết PRD. Đây là bản đồ PO đã xác nhận ở discovery — luôn ưu tiên áp dụng kể cả khi business-dictionary.md vắng mặt, để PRD nhất quán với product-definition. Nếu bảng trống/không có → bỏ qua âm thầm.
- **Thay banned term**: thay mọi banned term bằng bản chuẩn tương đương (xem dictionary § Banned Terms).
- **Dùng canonical term**: chỉ dùng các thuật ngữ được định nghĩa trong dictionary.
- **NEW TERM DETECTION (lưới an toàn — define-product lẽ ra đã bắt ở discovery Phase 3)**: Nếu vẫn còn thuật ngữ trong input PO xuất hiện ≥2 lần và KHÔNG có trong dictionary → **DỪNG** và hỏi PO:
  - Thuật ngữ đó nghĩa là gì trong ngữ cảnh hệ thống?
  - English canonical term nên dùng là gì?
  - Có cần bổ sung vào business-dictionary.md không?
  Sau khi PO confirm → cập nhật `business-dictionary.md` (nếu đồng ý) → tiếp tục sinh.
- Nếu không có banned term và tất cả thuật ngữ đều chuẩn → tiếp tục không gián đoạn.

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


## Quy tắc Cross-Reference

Bất kỳ chỗ nào nhắc tới một TICKET-ID khác trong PRD (pre-condition, BR, ghi chú, appendix) → **PHẢI** là inline link. Mỗi PRD sống trong feature-package riêng (`{paths.specs_dir}/{domain}/{prd-slug-khác}/`), nên link trỏ sang folder anh em:
```
[TICKET-ID khác](../{prd-slug-khác}/{TICKET-ID-khác}-{prd-slug-khác}.md)
```
Không bao giờ để TICKET-ID dạng plain text nếu file PRD tương ứng tồn tại trong `{paths.specs_dir}/{domain}/`.

## Quy ước đánh số UC và BR

- **UC ID**: `{TICKET-ID}-UC{N}` — N bắt đầu từ 1, tăng theo từng use case.
- **BR ID**: `{TICKET-ID}-UC{N}-BR{M}` — **M tăng liên tục trên toàn PRD** (KHÔNG reset theo từng UC).
  - Ví dụ: UC1 → BR1, BR2; UC2 → BR3, BR4 (KHÔNG phải BR1, BR2 lại từ đầu).

## Hình dạng bảng Business Rule *(3 cột mặc định — mở cột khi nội dung là bản ghi lặp)*

Bảng 3 cột `ID | Business Rule | Business Logic` là **mặc định**, KHÔNG phải luật cứng. Nó hoạt động tốt khi Business Logic là **văn xuôi** (mô tả luật bằng câu). Nó **gãy** khi Business Logic là một **bản ghi có cấu trúc lặp** — lúc đó ép vào một ô buộc phải serialize bản ghi thành chuỗi, và bảng mất khả năng đọc lướt / đếm / diff.

**Điều kiện kích hoạt mở cột** — cả hai phải đúng:
1. **Mọi** BR trong một UC chia sẻ **cùng một bộ thuộc tính** lặp lại (vd `trigger` / `data` / `tần suất` / `nguồn`); VÀ
2. Bộ thuộc tính đó là **cấu trúc đều**, không phải văn xuôi tự do.

**Dấu hiệu tự phát hiện (dùng khi tự kiểm trước khi ghi):** đang phải dùng `<br/>` để nhồi **nhiều hơn một bản ghi cùng cấu trúc** vào một ô Business Logic. Một `<br/>` ngăn cách các ý của **cùng một** luật thì bình thường — nhiều `<br/>` ngăn cách các **bản ghi ngang hàng** là tín hiệu sai hình dạng.

**Khi kích hoạt:** promote thuộc tính thành **cột**, một bản ghi = một **dòng**. Giữ nguyên hai cột `ID` + `Business Rule` (traceability phụ thuộc chúng); chỉ cột `Business Logic` được tách thành N cột. Giá trị dùng chung cho mọi dòng → đưa lên **§1d Quy ước**, đừng lặp trong từng ô.

**Khi KHÔNG kích hoạt:** giữ nguyên 3 cột. Phần lớn PRD tính năng rơi vào đây — BR của chúng là văn xuôi ("coi Landing là không sẵn sàng khi dịch vụ gặp sự cố; quá 3 giây chưa trả nội dung; hoặc trả nội dung rỗng"), không có bộ thuộc tính nào lặp. **Luật này tự kích hoạt theo hình dạng nội dung — không phải một cờ người dùng phải nhớ bật.**

> **⚠️ Guard — BR ID churn (BẮT BUỘC kiểm khi mở cột trên PRD ĐÃ TỒN TẠI):**
> Mở cột đúng nghĩa = một bản ghi một dòng ⇒ **số BR tăng**. Vì BR ID tăng liên tục trên toàn PRD (xem "Quy ước đánh số"), chèn dòng ở giữa sẽ **đánh số lại mọi BR phía sau**. BDD mang tag `@trace.business_rules: {TICKET}-UC1-BR1, …` — nếu PRD đã có BDD, mọi tag sau điểm chèn sẽ trỏ **sai trong im lặng**.
> Trước khi mở cột trên một PRD đã tồn tại → kiểm tra `{paths.specs_dir}/{domain}/{prd-slug}/bdd/`:
> - **Chưa có BDD** → mở cột tự do, không cần hỏi.
> - **Đã có BDD** → **DỪNG**, báo người dùng: *"Mở cột sẽ đánh số lại {N} BR; {M} file BDD đang ref BR ID cũ. Chọn: (1) mở cột + re-gen BDD, (2) giữ hình dạng cũ."* Chờ chọn.
>
> PRD sinh **mới** không bị ảnh hưởng — chưa có downstream nào ref BR ID.

## Quy ước tài liệu (§1d) & Note block *(hai slot tuỳ chọn)*

- **§1d Quy ước** — khi tài liệu có quy ước áp dụng **xuyên suốt mọi BR** (giá trị mặc định dùng chung, cách đọc cột, định nghĩa cục bộ), khai báo **một lần** ở đây. BR **không** lặp lại; AC **trỏ tới** thay vì chép lại. Không có quy ước xuyên suốt → **xoá hẳn section** (như `Existing API Contract` khi greenfield). Phân biệt: §1b Phạm vi = ranh giới; business-dictionary = thuật ngữ cấp domain; §1d = quy ước **cục bộ của tài liệu này**.
- **Note block sau bảng BR** — cho phép `> **Note {BR ref}:** …` ngay sau bảng để giải thích **quyết định đã chốt** (vì sao luật như vậy, ràng buộc nào dẫn tới). Đặt cạnh nơi phát sinh, đừng dồn xuống cuối file.
  **Ranh giới với "Giả định AI":** Note = quyết định **đã chốt**; Giả định AI = **độ vênh cần PO chốt**. Note KHÔNG được nuốt Giả định AI — nghi ngờ thì để ở Giả định AI, vì đó là thứ PO phải đọc.

## Traceability AC ↔ BR ↔ UC

- **Giữ link AC→BR từ discovery (KHÔNG vứt khi flatten):** Product Definition Phase 6 có cột "Bắt nguồn từ BR-{N}". Khi viết AC §2, **remap** mỗi `BR-{N}` (số discovery) sang **BR ID của PRD** (`{TICKET-ID}-UC{n}-BR{m}` sau khi đã phân BR vào UC) và gắn vào cuối AC: `_(BR: {ids})_`. Mỗi AC PHẢI có ≥1 ref BR.
- **Điền "AC liên quan" cho mỗi UC §3 (chiều ngược):** với mỗi UC, liệt kê các AC mà nó thoả.
- **Nhất quán 2 chiều (bắt buộc):** tập "AC liên quan" của UC{n} phải **đúng bằng** tập AC có ref BR trỏ về UC{n}. Vì BR ID đã chứa số UC, hai chiều này suy ra lẫn nhau — lệch là lỗi traceability, sửa trước khi ghi.

---

## Platform Strategy — PRD là tài liệu nghiệp vụ (không technical)

PRD mô tả **WHAT** (yêu cầu nghiệp vụ) — không nhét chi tiết **kỹ thuật** (API, token, endpoint, HTTP status, tên class/bảng/cột DB, query). Những thứ đó thuộc **Tech Docs**.
PRD **được phép** có User Flow + Wireframe ở mức nghiệp vụ (§4) để BA/QC/Dev cùng hình dung; chỉ **chi tiết visual** (màu sắc, layout pixel, animation, micro-interaction) mới thuộc **Design Spec**.

> **Ngoại lệ DUY NHẤT (brownfield):** khi `API Source: existing`, Appendix "Existing API Contract" ĐƯỢC PHÉP chứa chi tiết kỹ thuật (method, path, request/response shape, HTTP status, error code) — vì đó là contract **đã tồn tại**, AI chỉ **trích as-is** làm input cho trước, KHÔNG phải thiết kế mới. Ngoại lệ này CHỈ áp cho riêng section đó; AC, BR, và toàn bộ thân PRD vẫn thuần nghiệp vụ.

| ✅ Viết trong PRD (nghiệp vụ) | ❌ KHÔNG viết trong PRD |
|---|---|
| "Đăng nhập thành công → truy cập được tính năng" | "API trả về JWT token" ← Tech Docs |
| "Sai mật khẩu 5 lần → khoá tài khoản 30 phút" | "Hiển thị spinner khi loading" ← Design Spec |
| Wireframe mức nghiệp vụ: màn hình có gì, hành động ra kết quả gì | "Animation fade 300ms, màu #FF0000" ← Design Spec |

**Một PRD phục vụ tất cả platform:**
- **FE/App team** → đọc PRD + Design Spec → `/generate-bdd` (UI-level scenarios)
- **BE team** → đọc PRD trực tiếp → `/generate-bdd` (API-level scenarios)
- Design Spec là tài liệu **chi tiết visual** riêng cho FE/App — Wireframe nghiệp vụ trong PRD chỉ là khung.

Khi viết AC, nếu PO đề cập chi tiết visual (màu sắc, animation, layout pixel) → nhắc nhở:
*"Chi tiết visual này thuộc về Design Spec, không thuộc PRD. Ghi nhận lại để tạo Design Spec sau."*

---

## Guard — PRD đã tồn tại *(chạy TRƯỚC khi ghi bất cứ gì)*

Kiểm `{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md`.

**Tồn tại → DỪNG. KHÔNG ghi, KHÔNG hỏi Y/N.** Đọc `| **Version** |`, `| **Status** |`, và số row `# Change Log` để in:

```
❌ PRD đã tồn tại: {path}
   Hiện: v{version} · Status {status} · {n} row Change Log

   /generate-prd chỉ sinh PRD MỚI. Ghi đè sẽ mất:
     • toàn bộ # Change Log (và file changelog/ đã rollover)
     • Version thật → về 1.0 · Status approved → về draft
     • đánh số lại BR từ đầu → HỎNG mọi @trace.business_rules trong bdd/ đã sinh

   Muốn THÊM yêu cầu vào PRD này   → /extend-prd {path}
   Muốn sửa theo findings review    → /refine-prd {path}  rồi  --resume
   Thật sự muốn làm lại từ đầu      → xoá/đổi tên file cũ rồi chạy lại (tự chịu trách nhiệm)
```

> **Vì sao DỪNG HẲN chứ không hỏi Y/N:** ghi đè một PRD đã ký duyệt không phải thứ nên nằm sau một phím bấm. Ba mất mát trên đều **không thể hoàn tác** từ trong lệnh, và cái thứ ba (BR ID churn) lan ra ngoài file — nó phá liên kết ở mọi `.feature` đã sinh, mà chính lệnh này đã dựng một guard riêng để chống ở thao tác *mở cột bảng BR*. Cùng thiệt hại, cùng phải chặn.
> `rules/workflow.md` có luật chung *"Prefer editing existing files over replacing"*, nhưng đó là prose toàn cục — không phải guard trong lệnh, nên không chặn được ai.

---

## Generate

Ghi `{paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md` theo cấu trúc dưới đây.

> **Quy ước tên file PRD:** `{TICKET-ID}-{prd-slug}.md` — vd `SEG01-segment-scoring-service.md`. KHÔNG đặt tên `prd.md`. Mỗi feature-package có đúng **một** file PRD ở cấp gốc folder (cạnh `bdd/`, `tech-docs/`, `design-spec/`); tính duy nhất nằm ở cả tên folder lẫn TICKET-ID trong tên file.

---

````markdown
# {TICKET}-{N} {Feature Name}

<!--
  Template này được sử dụng bởi workflow /generate-prd.
  AI Agent sẽ điền các section dựa trên input từ PO.
  Các placeholder {…} cần được thay thế bằng nội dung thực tế.

  FORMAT BR: MẶC ĐỊNH bảng 3 cột — ID | Business Rule | Business Logic
    (KHÔNG tách Business Logic ra khối riêng).
    NGOẠI LỆ — MỞ CỘT: nếu MỌI BR trong một UC chia sẻ cùng một bộ thuộc tính lặp lại
    (vd trigger / data / tần suất), promote các thuộc tính đó thành CỘT RIÊNG —
    một bản ghi = một DÒNG. Dấu hiệu tự phát hiện: đang phải dùng <br/> để nhồi
    NHIỀU HƠN MỘT bản ghi cùng cấu trúc vào một ô. Chi tiết + cảnh báo BR ID churn:
    xem §3 "Business Rule" của template và mục "Hình dạng bảng Business Rule" của lệnh.

  TERMINOLOGY:
  - Tuân thủ 100% từ điển project: specs/domain-knowledge/business-dictionary.md
    (KHÔNG dùng từ điển của project khác). Thay banned term bằng canonical term;
    nếu phát hiện banned term trong input PO → thay + ghi chú trong "Giả định AI".
  - Status/Enum values → tham chiếu core-entities.md (Enum Registry).

  CROSS-REFERENCE (BẮT BUỘC): Bất kỳ chỗ nào nhắc đến một tính năng/ticket khác
    (pre-condition, business rule, giả định, AC, hay bất kỳ section nào) → PHẢI gắn inline link:
      [TICKET-ID khác](../{prd-slug-khác}/{TICKET-ID-khác}-{prd-slug-khác}.md)
    Không để TICKET-ID dạng plain text nếu tồn tại file PRD tương ứng. (Mỗi PRD nằm trong feature-package riêng nên link trỏ sang folder anh em `../{prd-slug-khác}/`.)
    Ngoài ra, ghi rõ quan hệ phụ thuộc trong "Tài liệu tham khảo" ở Appendix.

  NEW TERM DETECTION: Nếu input PO xuất hiện thuật ngữ CHƯA CÓ trong business-dictionary.md
    và lặp lại ≥ 2 lần → DỪNG lại, hỏi PO confirm trước khi tiếp tục:
      + Thuật ngữ đó nghĩa gì trong ngữ cảnh hệ thống?
      + English term chuẩn nên dùng là gì?
      + Có cần bổ sung vào business-dictionary.md không?
    Sau khi PO confirm → cập nhật business-dictionary.md (nếu PO đồng ý) rồi mới tiếp tục.

  NUMBERING:
  - UC ID: {TICKET}-{N}-UC{n}  (n bắt đầu từ 1, tăng theo từng use case)
  - BR ID: {TICKET}-{N}-UC{n}-BR{m}  (m tăng LIÊN TỤC xuyên suốt PRD, KHÔNG reset mỗi UC)
-->

---

## Metadata

| Field         | Value                                    |
|---------------|------------------------------------------|
| **PRD ID**    | {TICKET}-{N}                             |
| **Version**   | 1.0                                      |
| **Status**    | draft                                    |
| **Author**    | AI-assisted                              |
| **PO**        | {tên PO}                                 |
| **Domain**    | {domain}                                 |
| **Created**   | {date}                                   |
| **Updated**   | {date}                                   |
| **Ticket**    | {TICKET}-{N}{ — nếu PO có link tracker thật, thêm bên cạnh: `{TICKET}-{N} ([Jira]({tracker_url}))`} |
| **API Source** | *(để trống nếu greenfield — chỉ điền `existing` khi PRD bọc một API đã chạy production)* |

---

# Feature

**{Feature Name}**

{Đoạn mô tả tổng quan: feature làm gì, cho ai, giải quyết vấn đề gì — lấy từ product-definition.}

---

# 1. Tổng quan

## a. User Story

- **Là một (As a)** {persona}
- **Tôi muốn (I want to)** {action}
- **Để (So that)** {benefit}

## b. Phạm vi

> **Scope = ranh giới, KHÔNG phải đặc tả.** Mỗi mục một dòng ngắn "làm gì / không làm gì". Đừng nhét **cơ chế** (retry/timeout/nhánh lỗi → BR/BL) hay **định nghĩa thuật ngữ** (vd "điểm khởi tạo = …" → Business Definition / business-dictionary) vào đây.

**In Scope**
- {hạng mục trong phạm vi 1}
- {hạng mục trong phạm vi 2}

**Out of Scope** *(chỉ thêm khi có ranh giới cần nói rõ)*
- {hạng mục ngoài phạm vi + lý do / chủ sở hữu}

## c. Phụ thuộc liên service *(mức nghiệp vụ — KHÔNG mô tả API/event/kỹ thuật)*

> Kế thừa từ Product Definition Phase 1 ("Phụ thuộc liên service"). Nếu contract do đối tác phát triển song song (xem `API Source`), ghi phụ thuộc partner vào đây.

- {Cần {dữ liệu/năng lực} từ {feature/team/partner} — vì {lý do nghiệp vụ}} — hoặc "Không có"

## d. Quy ước *(TUỲ CHỌN — chỉ thêm khi tài liệu có quy ước áp dụng xuyên suốt; nếu không có → XOÁ HẲN section này)*

> Khai báo **MỘT LẦN** các quy ước áp dụng cho **mọi BR** ở §3. BR **KHÔNG** lặp lại nội dung đã khai ở đây,
> AC §2 **trỏ tới** quy ước thay vì chép lại. Đây là nơi chứa định nghĩa dùng chung, giá trị mặc định,
> và cách đọc các cột của bảng BR — những thứ trước đây bị xé nhỏ và lặp trong từng dòng.
>
> Phân biệt với **§1b Phạm vi** (ranh giới làm/không làm) và **business-dictionary** (định nghĩa thuật ngữ
> cấp domain, dùng chung nhiều PRD): §1d chỉ chứa quy ước **cục bộ của tài liệu này**.

- **{Tên quy ước}**: {nội dung áp dụng cho mọi BR bên dưới}
- **{Giá trị mặc định dùng chung}**: {…}

---

# 2. Acceptance Criteria

> Mỗi AC kế thừa liên kết "Bắt nguồn từ BR" của Product Definition (Phase 6), remap sang BR ID của PRD. Vì BR ID đã chứa số UC nên ref BR truy ngược được tới đúng UC.
>
> **1 AC = 1 tiêu chí NGHIỆM THU (outcome quan sát/kiểm được) + ref BR.** KHÔNG viết cơ chế trong AC (số lần retry, timeout, tên/chủ cờ, nhánh lỗi chi tiết) — cái đó thuộc **BR/BL** ở §3, AC chỉ trỏ tới. Nếu tiêu chí có **nhiều nhánh** → tách **bullet con** (mỗi ý một dòng), đừng dồn thành câu dài. Khi `/refine-prd` làm rõ thêm: chi tiết cơ chế → đẩy sang BR/BL; ở tầng AC thì tách bullet/AC mới — KHÔNG nối mệnh đề vào câu cũ (tránh AC thành "đoạn văn" và trùng BR).

**AC1:** {Tiêu chí nghiệm thu, văn xuôi, kiểm chứng được.} _(BR: {TICKET}-{N}-UC{n}-BR{m})_

**AC2:** {Tiêu chí có nhiều nhánh — tách bullet:} _(BR: {TICKET}-{N}-UC{n}-BR{m})_
  - {nhánh/điều kiện 1 → kết quả kỳ vọng}
  - {nhánh/điều kiện 2 → kết quả kỳ vọng}

---

# 3. Use Case

#### {TICKET}-{N}-UC1: {Tên use case}

**Actor:** {actor}

**Description:** {mô tả luồng}

**Pre-condition:**
- {điều kiện trước 1}

**Post-condition:**
- {kết quả sau 1}

**AC liên quan:** AC{x}, AC{y}  *(các AC mà UC này thoả — phải đúng bằng tập AC có ref BR trỏ về UC này ở §2)*

**Business Rule**

> **Hình dạng bảng — mặc định 3 cột.** Dùng dạng này khi Business Logic là **văn xuôi** (mô tả luật bằng câu).

| ID | Business Rule | Business Logic |
|----|---------------|----------------|
| {TICKET}-{N}-UC1-BR1 | {luật ngắn gọn} | - {logic chi tiết, xuống dòng bằng `<br/>`}<br/>- {…} |
| {TICKET}-{N}-UC1-BR2 | {…} | - {…} |

<!--
  NGOẠI LỆ — MỞ CỘT (dùng THAY cho bảng 3 cột ở trên, KHÔNG dùng cả hai):

  Điều kiện kích hoạt: MỌI BR trong UC này chia sẻ CÙNG một bộ thuộc tính lặp lại.
  Dấu hiệu tự phát hiện: đang phải dùng <br/> để nhồi NHIỀU HƠN MỘT bản ghi cùng
  cấu trúc vào một ô Business Logic.

  Khi kích hoạt: promote thuộc tính thành CỘT, một bản ghi = một DÒNG:

    | ID  | Business Rule | {Thuộc tính 1} | {Thuộc tính 2} | {Thuộc tính 3} |
    |-----|---------------|----------------|----------------|----------------|
    | BR1 | {luật ngắn}   | {giá trị}      | {giá trị}      | {giá trị}      |
    | BR2 | {luật ngắn}   | {giá trị}      | {giá trị}      | {giá trị}      |

  Hai cột ID + Business Rule LUÔN giữ (traceability phụ thuộc chúng). Chỉ cột
  Business Logic được tách thành N cột. Giá trị dùng chung cho mọi dòng → đưa lên
  §1d Quy ước, ĐỪNG lặp trong từng ô.

  ⚠️ CẢNH BÁO BR ID CHURN — đọc trước khi mở cột trên PRD ĐÃ TỒN TẠI:
  Mở cột đúng nghĩa = một bản ghi một dòng ⇒ số BR TĂNG. Vì BR ID tăng liên tục
  trên toàn PRD, chèn dòng ở giữa sẽ ĐÁNH SỐ LẠI mọi BR phía sau. Nếu PRD này đã có
  BDD downstream, mọi tag `@trace.business_rules` trong .feature sẽ trỏ SAI trong im lặng.
  → Trước khi mở cột trên PRD đã có: kiểm tra `{specs_dir}/{domain}/{prd-slug}/bdd/`.
    - Chưa có BDD → mở cột tự do.
    - ĐÃ có BDD → DỪNG, báo người dùng: cần re-gen BDD sau khi đổi, hoặc giữ nguyên hình dạng cũ.
  PRD sinh MỚI không bị ảnh hưởng (chưa có downstream).
-->

> **Note {BR ref}:** *(TUỲ CHỌN)* {giải thích **quyết định đã chốt** — vì sao luật này như vậy, ràng buộc
> nào dẫn tới nó, biên nào đã cân nhắc}. Đặt ngay sau bảng, cạnh nơi phát sinh.
>
> **Ranh giới với "Giả định AI" (Appendix):** Note = quyết định **đã chốt**, giải thích cho người đọc sau.
> Giả định AI = **độ vênh CẦN PO chốt**. Note **KHÔNG** được nuốt Giả định AI — nghi ngờ thì để ở Giả định AI.

---

#### {TICKET}-{N}-UC2: {Tên use case}

{lặp cấu trúc UC như trên; BR đánh số tiếp tục BR3, BR4…}

---

# 4. UI/UX Guidelines

## a. User Flow

```mermaid
flowchart TD
    START(["{điểm bắt đầu}"]) --> A{"{điểm quyết định}"}
    A -->|{nhánh}| B["{bước}"]
```

## b. Wireframe

> **KHÔNG nhân bản §3.** Wireframe liệt kê **màn + thành phần + hành động** — nó là nguồn coverage màn hình
> cho `/generate-bdd` (C.1), KHÔNG phải bản sao thứ hai của bảng Business Rule.
> Nếu một dòng Wireframe không thêm thông tin nào ngoài BR đã có → **tham chiếu BR ID, đừng chép nội dung**.
> Nếu cả §4b không thêm gì mới so với §3 → **xoá hẳn §4b** (hai nguồn sự thật cho cùng một dữ liệu sẽ lệch nhau
> ngay lần sửa đầu tiên).

### Screen 1: {Tên màn}

| Thành phần | Chi tiết |
|------------|----------|
| **Screen** | {tên/ngữ cảnh màn} |
| **Components** | - {thành phần 1}<br/>- {thành phần 2} |
| **Actions** | - {hành động 1 → kết quả}<br/>- {hành động 2 → kết quả} |

---

### Screen 2: {Tên màn}

{lặp bảng như trên cho từng màn}

---

# Appendix

## Input gốc từ PO

> {Trích nguyên văn input/ghi chú gốc của PO + đường dẫn product-definition nguồn.}

## Tài liệu tham khảo

- [{TICKET liên quan}](../{prd-slug-khác}/{TICKET-ID-khác}-{prd-slug-khác}.md) — {quan hệ: pre-condition / overlapping / related…}
- BDD: [`./bdd/`](./bdd/)
- Design spec: [`./design-spec/`](./design-spec/) — không áp dụng với feature thuần backend (không có màn hình)
- Từ điển nghiệp vụ: [`specs/domain-knowledge/business-dictionary.md`](../../domain-knowledge/business-dictionary.md)
- Domain knowledge: [`specs/domain-knowledge/{domain}.md`](../../domain-knowledge/{domain}.md)

## Existing API Contract *(CHỈ brownfield — điền khi API Source = existing; greenfield BỎ QUA cả section này)*

<!--
  Chỉ dùng khi PRD bọc một API đã tồn tại trên hệ thống. PO ghi lại contract để:
  - /generate-bdd (system) dùng trực tiếp làm input — không cần tổng hợp từ FE/App BDD;
  - /generate-tech-docs chạy mode reverse-document (mô tả lại as-is, không design mới);
  - /review-tech-docs bỏ qua cổng T7 cross-team sign-off (contract đã cố định).
  Nếu greenfield (thiết kế mới) → xoá toàn bộ section này.
-->

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| {GET/POST/PUT/DELETE} | {/api/v1/path} | {Bearer / none} | `{ field: type }` | `{ field: type }` |

**Error responses:**

| HTTP Status | Error Code | Khi nào xảy ra |
|-------------|------------|----------------|
| {4xx/5xx} | {ERR_CODE} | {condition} |

## Giả định AI

> {Giả định / độ vênh AI phát hiện khi đối chiếu product-definition với domain-knowledge — cần PO review. AI KHÔNG tự hoà giải.}

- **Q1 — [AI DRAFT] {tiêu đề}:** {mô tả độ vênh + nguồn}. **Cần PO chốt {điều gì}.**

_(Nếu không có độ vênh: ghi "Không có — toàn bộ nội dung đã được PO xác nhận qua Product Definition.")_

---

# Change Log

> Hiện tại: **v1.0** ({date}) · Lịch sử đầy đủ → [changelog](./changelog/{TICKET}-{N}-{slug}.changelog.md) *(file kho chỉ tạo khi changelog vượt 5 version)*

<!-- Bảng phẳng, MỘT dòng/version, MỚI NHẤT TRÊN CÙNG. Chỉ giữ tối đa 5 version gần nhất ở đây;
     cũ hơn → /refine-prd & /review-context tự dồn (rollover) sang file changelog/ ở link trên. -->

| Version | Date | Changes (UC/AC/BR bị ảnh hưởng) |
|---------|------|---------------------------------|
| 1.0 | {date} | Bản đầu — sinh từ product-definition. |

---

<!--
  NEXT STEPS:
  Khi PRD được approve (status: approved), chạy:
  /generate-bdd "specs/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md"
  để sinh BDD feature specs từ PRD này.
-->

````

---

## Quality Checklist *(kiểm tra trước khi ghi)*

- [ ] Mọi AC đều testable (pass/fail rõ ràng), không có chi tiết kỹ thuật (API/token/DB) hay visual chi tiết (màu sắc, font, animation)
- [ ] **Altitude (AC vs BR/BL)**: AC chỉ nêu **outcome quan sát/kiểm được + ref BR** — KHÔNG chứa cơ chế (số lần retry, timeout, tên/chủ cờ, nhánh lỗi chi tiết); cơ chế nằm ở **BR/BL** (§3). AC không lặp lại nội dung BR nó ref. **Scope** = ranh giới (KHÔNG định nghĩa thuật ngữ / KHÔNG cơ chế)
- [ ] Mỗi UC có Actor / Description / Pre-condition / Post-condition
- [ ] §1c "Phụ thuộc liên service" có mặt: kế thừa từ discovery Phase 1 câu 8 (hoặc "Không có" nếu discovery trống); case partner song song có ghi phụ thuộc partner ở đây
- [ ] Business Rule (WHAT) và Business Logic (HOW) nằm chung **một bảng** — KHÔNG tách Business Logic ra khối riêng
- [ ] **Hình dạng bảng BR đúng với nội dung**: 3 cột khi Business Logic là văn xuôi; **mở cột** (1 bản ghi = 1 dòng) khi mọi BR trong UC chia sẻ cùng bộ thuộc tính lặp. Kiểm cụ thể: **0 ô Business Logic chứa nhiều hơn một bản ghi cùng cấu trúc** (dấu hiệu: `<br/>` ngăn cách các bản ghi ngang hàng thay vì các ý của cùng một luật) — xem "Hình dạng bảng Business Rule"
- [ ] **Nếu mở cột trên PRD đã tồn tại**: đã kiểm `bdd/` và xử lý BR ID churn (chưa có BDD → tự do; đã có BDD → đã hỏi người dùng, không tự ý đổi)
- [ ] **§1d Quy ước**: nếu có quy ước xuyên suốt → khai báo MỘT LẦN ở §1d, 0 lần lặp lại trong ô BR, AC trỏ tới thay vì chép; nếu không có → section đã xoá hẳn (không để rỗng)
- [ ] BR ID tăng liên tục trên toàn PRD — không reset theo từng UC
- [ ] **Traceability AC↔BR↔UC**: mỗi AC §2 có ≥1 ref `_(BR: …)_`; mỗi UC §3 có dòng "AC liên quan"; và hai chiều khớp nhau (tập "AC liên quan" của UC = tập AC có ref BR trỏ về UC đó)
- [ ] Mọi cross-reference TICKET-ID đều là inline link `[TICKET-ID](./file.md)`
- [ ] **Tài liệu tham khảo (Appendix)** có mục **BDD** (`./bdd/`) và **Design spec** (`./design-spec/`) — trỏ sẵn dù artifact chưa sinh; giữ nguyên câu chú "không áp dụng với feature thuần backend (không có màn hình)" ở cuối dòng Design spec
- [ ] Không có banned term (nếu dictionary tồn tại)
- [ ] **Ngôn ngữ nghiệp vụ**: 0 thuật ngữ kỹ thuật/UI trong prose (re-render→hiển thị lại, UI→màn, timeout→quá thời gian chờ…) — xem Business Language Guard
- [ ] **API Source nhất quán**: nếu `existing` → bảng "Existing API Contract" đủ method/path/request/response (hoặc mang block ⛔ PENDING kèm con trỏ nguồn); nếu greenfield/partner → section "Existing API Contract" đã bị xoá hẳn (không để bảng rỗng), và case partner có dependency + assumption ghi rõ
- [ ] User Flow có cả luồng lỗi / luồng ngoại lệ
- [ ] Wireframe phủ tất cả màn hình liên quan tới Use Case
- [ ] **Wireframe không nhân bản §3**: 0 dòng §4b lặp lại nội dung đã có ở bảng Business Rule — không thêm thông tin thì ref BR ID; cả §4b không thêm gì mới thì xoá hẳn (tránh hai nguồn sự thật)
- [ ] **Định dạng (readability)**: User Story / AC / các field của UC (Actor, Description, Pre/Post-condition) viết dạng bullet `- **Label:** …` — mỗi ý MỘT dòng, KHÔNG viết các dòng liền nhau (sẽ bị dồn thành 1 đoạn khi render); có một dòng trống trước và sau mỗi bảng

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

Ví dụ footer cho lệnh này:

```
---
Status   : ✅ Complete
Output Artifacts:
  created {paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md (PRD v1.0)
Pipeline : Discovery → [PRD ◀ bạn ở đây] → Design Spec → BDD → Tech Design → Code → Dev Self-Check → QC → Trace Audit
Next     : /refine-prd {paths.specs_dir}/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md
           → rồi /review-context {prd-file}   ← kiểm tra chất lượng PRD trước khi sinh BDD
           → khi sạch critical, PO đặt | **Status** | approved | (PRD mới sinh đang draft):
               • Feature CÓ màn hình (FE/App) → /generate-design-spec {prd-file}  ← sinh + duyệt design-spec TRƯỚC
                 rồi /generate-bdd {prd-file}   (BDD FE/App cần design-spec đã duyệt để phủ Screen States + AC-UI)
               • Feature thuần backend (không màn hình) → /generate-bdd {prd-file} thẳng (bỏ qua design-spec)
```

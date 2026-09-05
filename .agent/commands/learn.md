# /learn — Ghi một Project Lesson (Guardrail)

Bắt một lỗi mà AI cứ lặp lại để nó **không bị lặp nữa**. Lesson được lưu trong file
lessons của dự án này và nạp vào context ở đầu mỗi lệnh.

Usage:
- `/learn {free-text}` — ghi lesson mới. Lý tưởng diễn đạt kiểu "AI làm X, nên làm Y".
  Ví dụ: `/learn AI cứ gọi repository trực tiếp từ controller — nó phải đi qua service layer`
- **`/learn --review`** — rà lại lesson đang có, đề nghị retire cái đã hết đúng.

> Đây là **bộ nhớ dự án**, không phải fine-tune model. Lesson trở thành guardrail đang hoạt động nhờ
> được inject vào context mỗi lần chạy (xem context-loader Bước 6.7).

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


*Lưu ý: Với lệnh này — bỏ qua Gate Bước 1 (không có target file). "Target" là text lesson trong `$ARGUMENTS`. Chạy model check và context loading, rồi tiếp tục.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Step 0 — Chế độ `--review` *(nếu `$ARGUMENTS` chứa `--review`)*

*Chạy nhánh này rồi DỪNG — không đi tiếp Step 1/2.*

Đọc `lessons_path` (đã phân giải ở context-loader Bước 6.7), parse **mọi** lesson kể cả
`Status: retired`. Với mỗi lesson `active`, phân loại:

**🔴 Đề nghị retire — kiểm được bằng máy.** `Scope` là một **file glob** (vd `*ServiceImpl.java`)
mà glob đó **không còn khớp file nào** trong repo → code lesson canh đã không còn tồn tại.

**⚠️ Rà lại — không tự kiểm được.** `Scope` là `all` hoặc một domain (không phải glob file), **và**
`Date` cũ hơn 6 tháng. Không suy ra được nó còn đúng hay không — chỉ liệt kê theo tuổi để người quyết.

**✅ Còn sống.** Scope là glob và còn khớp ≥1 file.

In:

```
/learn --review — {tổng} lesson ({n_active} active · {n_retired} retired)

🔴 Đề nghị retire — Scope không còn khớp file nào:
   L-003  [code-gen]  *RestTemplate*.java   · ghi 2026-08 · 0 file khớp
          Rule: Luôn dùng WebClient thay RestTemplate
   L-011  [tests]     *LegacyApiTest.java   · ghi 2026-11 · 0 file khớp

⚠️ Rà lại — scope rộng, không tự kiểm được:
   L-002  [general]   scope: all            · ghi 2026-07 (13 tháng)

✅ {n} lesson còn sống, scope vẫn khớp

Retire cái nào? (nhập id cách nhau bởi dấu phẩy, hoặc Enter để bỏ qua)
```

Người dùng nhập id → với mỗi id, **đổi `Status: active` → `retired`** và **chèn** dòng
`- **Retired**: {hôm nay} — {lý do ngắn}` ngay dưới. **KHÔNG xoá dòng nào** (xem
`capture-lesson.md` §Retire — lesson retired ở lại làm lịch sử).

Không có lesson nào → in `Chưa có lesson nào được ghi nhận.` rồi dừng.

> **Vì sao lệnh này tồn tại (GAPS-v3 G46):** trước nó, file lessons **chỉ có đường vào** —
> `/learn`, `/review-code`, `/fix-bug`, `/debug` đều ghi thêm được, không gì gỡ ra. Mỗi lesson
> được nạp làm *"ràng buộc cứng, cùng mức ưu tiên với CLAUDE.md"*, **vĩnh viễn**, kể cả khi code
> nó canh đã bị xoá. Nhóm 🔴 ở trên là **cơ học, không phải phỏng đoán**: glob không khớp file
> nào thì lesson đó đã chết, không cần tranh luận.

---

## Step 1 — Parse Lesson

Đọc `$ARGUMENTS` như một mô tả free-text.

Tách thành một **mistake** (AI làm sai gì) và một **rule** (câu sửa mệnh lệnh).
- Nếu `$ARGUMENTS` rỗng hoặc quá mơ hồ để tách, hỏi người dùng ngắn gọn:
  ```
  Ghi một project lesson. Trả lời 2 điều:
    1. AI làm sai gì?  (the mistake)
    2. Quy tắc đúng là gì?   (mệnh lệnh — "Luôn…/Không bao giờ…")
  ```
- Suy ra `category` (code-gen | bdd | tech-docs | tests | prd | general) và `scope` (domain / file glob / all)
  từ mô tả. Nếu mơ hồ, xác nhận với người dùng trong một dòng.

Hiện lesson đã parse và hỏi `Lưu lesson này? (Y/N)` trước khi ghi.

## Step 2 — Capture

# Capture Lesson — Ghi lại lỗi lặp lại thành một Guardrail

Quy trình tái sử dụng để lưu một "lesson" nhằm tránh AI lặp lại lỗi trong dự án này.
Dùng bởi `/learn` (thủ công) và được đề xuất bởi `/review-code`, `/fix-bug`, `/debug` (tự động).

> **Bộ nhớ dự án, không phải huấn luyện model.** Một lesson là văn bản thuần được inject vào context ở
> đầu mỗi lệnh (context-loader Bước 6.7). Về mặt chức năng, điều này chặn việc lặp lại — AI thấy
> guardrail trước khi sinh nội dung. Không có trọng số model nào thay đổi.

## L1 — Phân giải file lessons

Phân giải `lessons_path` theo thứ tự sau:
1. `paths.lessons_file` từ context đã nạp (có thể bị service override ở chế độ umbrella, Bước 1.6)
2. Mặc định `specs/domain-knowledge/lessons-learned.md` (single-service)
3. Ở chế độ umbrella/service (khi `service_root` được set) mặc định `{service_root}/.agent/project-lessons.md`

## L2 — Dựng lesson

Thu thập các field sau — từ `$ARGUMENTS` (cho `/learn`) hoặc từ findings của lệnh gọi
(cho `/review-code`, `/fix-bug`, `/debug`):

| Field | Ý nghĩa |
|-------|---------|
| `category` | một trong: `code-gen` \| `bdd` \| `tech-docs` \| `tests` \| `prd` \| `general` |
| `title` | cụm từ ngắn đặt tên cho lỗi |
| `mistake` | cụ thể, AI đã làm sai điều gì |
| `rule` | câu sửa mệnh lệnh — "Luôn …" / "Không bao giờ …" — testable, không mơ hồ |
| `scope` | phạm vi áp dụng: một domain, một file glob (vd `*Controller.*`), hoặc `all` |
| `source` | cách ghi nhận: `/learn` \| `/review-code {UC-ID}` \| `/fix-bug {TICKET}` \| `/debug` |

Nếu `rule` mơ hồ (vd "cẩn thận"), viết lại thành chỉ dẫn cụ thể, kiểm tra được trước khi lưu.

## L3 — Khử trùng lặp

Đọc các lesson hiện có trong `lessons_path`. Nếu đã có một lesson cùng lỗi:
- **Tinh chỉnh** entry đó (siết chặt Rule, mở rộng/thu hẹp Scope, cập nhật Date, thêm Source mới) — KHÔNG thêm bản trùng.

Nếu không, gán id kế tiếp `L-{NNN}` = (số lớn nhất hiện có + 1), pad 0 đủ 3 chữ số.

## L4 — Ghi

Nếu `lessons_path` chưa tồn tại, tạo file với header sau trước:

```markdown
# Project Lessons — Learned Guardrails

> Các lỗi AI KHÔNG được lặp lại trong dự án này. Được nạp bởi context-loader ở đầu
> mỗi lệnh và coi như ràng buộc cứng (cùng mức ưu tiên với coding standards trong CLAUDE.md).
> Thêm bằng /learn, hoặc chấp nhận prompt trong /review-code, /fix-bug, /debug.
> Rà lại định kỳ bằng `/learn --review`. Commit file này để cả team dùng chung guardrail.

| Category | Áp dụng cho |
|----------|-----------|
| code-gen | output của /generate-code |
| bdd | output của /generate-bdd |
| tech-docs | output của /generate-tech-docs |
| tests | output của /dev-gen-test |
| prd | output của /generate-prd, /refine-prd |
| general | mọi lệnh |

**Status:** `active` = đang là ràng buộc cứng · `retired` = đã hết đúng, GIỮ LẠI làm lịch sử
nhưng context-loader **không nạp nữa**. Lesson không ghi `Status` được coi là `active`.

---
```

Chèn lesson mới ngay dưới dấu phân cách `---` (**mới nhất lên đầu**), theo đúng dạng:

```markdown
### L-{NNN} — [{category}] {title}
- **Status**: active
- **Date**: {hôm nay YYYY-MM-DD}
- **Scope**: {scope}
- **Mistake**: {mistake}
- **Rule**: {rule}
- **Source**: {source}

```

### Retire — đường ra của một lesson *(GAPS-v3 G46)*

Một lesson là **giả thuyết rằng AI sẽ lặp lại một lỗi**. Giả thuyết đó hết đúng khi code nó canh
không còn tồn tại, hoặc khi quy ước dự án đã đổi. Lúc đó nó phải bị **hạ xuống**, không được giữ.

Retire = đổi `Status` và ghi lý do — **KHÔNG xoá dòng**:

```markdown
### L-003 — [code-gen] Dùng WebClient thay RestTemplate
- **Status**: retired
- **Retired**: 2027-03-15 — project đổi tầng HTTP, RestTemplate không còn trong repo
- **Date**: 2026-08-19
  …giữ nguyên phần còn lại…
```

Giữ lại vì nó là **lịch sử**: người sau đọc được *"vì sao dự án này từng có luật đó"*, thứ mà xoá
đi là mất vĩnh viễn.

> **Vì sao cần đường ra:** trước G46 file này **chỉ có đường vào**. Lesson được nạp làm *"ràng buộc
> cứng, cùng mức ưu tiên với CLAUDE.md"* — vĩnh viễn, kể cả khi code nó canh đã bị xoá. Không cờ
> nào nhắc, không lệnh nào gỡ; cách duy nhất là có người tự nhớ ra rồi xoá tay.
> Đây đúng lớp lỗi của **G28** (*"giữ một `pass` đã hết hiệu lực là báo cáo sai"*) và luật
> `rules/workflow.md` §Trace Contract — **"làm mất hiệu lực ≠ ghi đè"** — chỉ là ở hàng đợi này
> chưa ai áp luật đó.
>
> **Ba trong bốn lệnh ghi lesson là lệnh phản ứng khi có sự cố** (`/review-code`, `/fix-bug`,
> `/debug`), nên file phình nhanh nhất đúng lúc dự án đang trục trặc — và lesson sinh ra lúc đó
> hay gắn với một sự cố cụ thể hơn là một quy tắc bền.

## L5 — Xác nhận

In: `📝 Đã ghi lesson {id} → {lessons_path}  ([{category}] {title})`
Rồi nhắc: `Commit {lessons_path} để cả team dùng chung guardrail này.`


---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/learn — lesson đã ghi

📝 {id} — [{category}] {title}
   Rule  : {rule}
   Scope : {scope}
   File  : {lessons_path}

Guardrail này giờ được nạp ở đầu mỗi lệnh có category khớp (+ general).
Commit {lessons_path} để team dùng chung.

---
Status : ✅ Complete
Output Artifacts: updated {lessons_path}
Next   : tiếp tục làm việc — AI sẽ tôn trọng lesson này từ giờ
```

**Chế độ `--review`** dùng report riêng:

```
/learn --review — {n} lesson đã retire

🔻 L-003 [code-gen] active → retired
      lý do: Scope *RestTemplate*.java không còn khớp file nào
🔻 L-011 [tests]    active → retired

Chúng vẫn ở lại trong {lessons_path} làm lịch sử — chỉ thôi được nạp làm ràng buộc.
Còn lại {n_active} guardrail đang hoạt động.

---
Status : ✅ Complete
Output Artifacts: updated {lessons_path}
Next   : commit {lessons_path}
```

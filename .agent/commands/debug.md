# /debug — Phân tích Debug nhanh

Dùng cho: lỗi IDE, test fail, hành vi lạ, hoặc "tại sao code này làm X?"
Khác `/fix-bug`: chỉ phân tích, không full workflow, không cần ticket.

## Gate

*Checkpoint: **không chặn** — read-only. Gate Bước 3 bỏ qua CHECKPOINT (Bước 3a).*

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


*Lưu ý: Với lệnh này, target ở Bước 1 là input người dùng cung cấp (stack trace, output test fail, file path + mô tả, hoặc câu hỏi code). Không cần tìm file — đi thẳng sang context loading.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Step 1 — Phân loại loại debug

Sau khi nạp context, hiện prompt này và chờ user chọn:

```
DEBUG SESSION
──────────────────────────────────────────────────────────────
  Tình huống của bạn?

  1  Tôi đã có stack trace / error log  → dán nó
  2  Tôi cần reproduce lỗi trước        → chỉ tôi lệnh run
  3  Một test đang fail                 → tôi sẽ chạy test, rồi dán output
  4  Câu hỏi về code (không cần runtime) → hỏi luôn
──────────────────────────────────────────────────────────────
Nhập 1 / 2 / 3 / 4:
```

Chờ user chọn, rồi theo path tương ứng bên dưới.

---

### Path 1 — Đã có error output

Hỏi:
```
Dán stack trace / error log của bạn bên dưới:
```

Chờ input, rồi sang [Stack Trace Analysis](#stack-trace-analysis).

---

### Path 2 — Cần reproduce trước

Hiện lệnh run từ `conventions.service_run` trong `project-context.yaml`:

```
Khởi động service trước:

  {conventions.service_run}

(Nếu dùng Docker: `docker compose up -d`, rồi verify với `docker compose ps`)

Khi service đang chạy:
  1. Trigger hành vi gây lỗi
  2. Copy full stack trace hoặc error log
  3. Dán vào đây

Đang chờ error output của bạn...
```

Chờ user dán lỗi, rồi sang [Stack Trace Analysis](#stack-trace-analysis).

Nếu `conventions.service_run` chưa set → hiện:
```
⚠️  service_run chưa được cấu hình trong .agent/project-context.yaml.
    Thêm nó để lệnh này hiện đúng lệnh khởi động:

    conventions:
      service_run: "mvn spring-boot:run"   # or: npm run dev / go run . / etc.
```
Rồi nhờ user khởi động service thủ công và dán lỗi khi sẵn sàng.

---

### Path 3 — Test đang fail

Hiện lệnh test từ `conventions.test_command` trong `project-context.yaml`:

```
Chạy test của bạn trước:

  {conventions.test_command}

Khi chạy xong, dán full output test fail vào đây.

Đang chờ...
```

Chờ user dán output fail, rồi sang [Test Failure Analysis](#test-failure-analysis).

Nếu `conventions.test_command` chưa set → hiện:
```
⚠️  test_command chưa được cấu hình trong .agent/project-context.yaml.
    Thêm nó để lệnh này hiện đúng lệnh test:

    conventions:
      test_command: "mvn test"   # or: npm test / go test ./... / etc.
```
Rồi nhờ user chạy test thủ công và dán output khi sẵn sàng.

---

### Path 4 — Câu hỏi code

Hỏi:
```
Mô tả câu hỏi của bạn hoặc dán code snippet bạn đang hỏi:
```

Chờ input, rồi trả lời trực tiếp dùng project context đã nạp (quy tắc kiến trúc, thứ tự layer, coding standards từ CLAUDE.md).

---

## Stack Trace Analysis

Đọc từ **dưới lên** — `Caused by:` là root cause thật:
```
Caused by: {RealException}  ← bắt đầu ở đây
  at {class}.{method}({file}:{line})
```

## Common Error Patterns

Dùng `active_module` từ context để chọn bảng liên quan.

### Nếu `platform_type = backend`

#### java-spring / golang / dotnet / php-laravel

| Error | Nguyên nhân khả nghi | Hướng fix |
|-------|-------------|---------------|
| NullPointerException | Truy cập object null; Optional chưa xử lý | Kiểm tra Optional.orElseThrow, null guard |
| ClassCastException | Giả định sai kiểu | Kiểm tra type ở assignment/return |
| OutOfMemoryError | Load quá nhiều data | Thêm pagination |
| StackOverflowError | Đệ quy vô hạn | Tìm recursive call không có base case |
| Connection refused | Dependency chưa chạy | Kiểm tra config URL / khởi động service |
| 401 Unauthorized | Token hết hạn, sai config | Verify token, kiểm tra auth config |
| 403 Forbidden | Sai role | Kiểm tra auth annotation |
| DB constraint violation | Trùng key, null trong NOT NULL | Kiểm tra data và constraint |
| Serialization error | Circular reference | Kiểm tra config DTO/mapper |
| Test assertion mismatch | Sai mock hoặc sai expected | Đọc lại setup mock |

#### context-engineering (AI/LLM pipelines)

| Error | Nguyên nhân khả nghi | Hướng fix |
|-------|-------------|---------------|
| `APIError` / `RateLimitError` | Vượt quota LLM hoặc service down | Kiểm tra API key, rate limit; thêm exponential backoff |
| `TokenLimitError` / `context_length_exceeded` | Prompt input quá dài | Truncate/chunk input; review kích thước prompt template |
| `AuthenticationError` | API key không hợp lệ hoặc hết hạn | Kiểm tra env var; rotate key |
| Response validation / schema mismatch | Output LLM không khớp format kỳ vọng | Thêm output parser; retry với prompt chặt hơn |
| `JSONDecodeError` trên output LLM | Model trả về text non-JSON | Thêm post-processing trích JSON hoặc system prompt chặt hơn |
| Test treo / chậm | LLM thật bị gọi trong test thay vì mock | Verify `patch('...')` được áp; thêm timeout guard |
| Kết quả flaky giữa các lần chạy | Response LLM non-deterministic | Dùng mock cố định trong test; check temperature = 0 cho determinism |

### Nếu `platform_type = web-frontend`

| Error | Nguyên nhân khả nghi | Hướng fix |
|-------|-------------|---------------|
| `Cannot read properties of undefined` | Data chưa load | Thêm loading guard / optional chaining `?.` |
| `useEffect` infinite loop | Dependency array sai | Review deps, dùng stable ref / `useCallback` |
| `Cannot update state on unmounted component` | Async resolve sau unmount | Cancel trong cleanup / dùng AbortController |
| CORS error | API chưa cấu hình | Kiểm tra CORS config backend hoặc dev proxy |
| 401 Unauthorized | Token hết hạn hoặc thiếu | Refresh token / kiểm tra header Authorization |
| White screen / no output | Render error chưa xử lý | Kiểm tra console browser, thêm ErrorBoundary |
| Type error (Zod / TypeScript) | Shape response API mismatch | So response thực tế vs type definition |
| `act(...)` warning trong test | Async state update | Bọc trong `act(async () => {...})` |
| Module not found | Sai import path | Kiểm tra relative path / tsconfig alias |

### Nếu `platform_type = mobile`

#### Flutter
| Error | Nguyên nhân khả nghi | Hướng fix |
|-------|-------------|---------------|
| `Null check operator on null value` | Nullable chưa guard | Thêm `?` hoặc null check trước `!` |
| `pumpAndSettle timed out` | Async chưa hoàn thành trong test | Dùng `pump(Duration(...))` |
| `setState called after dispose` | Async tiếp tục sau khi widget bị bỏ | Cancel trong `dispose()` |
| `RenderFlex overflow` | Widget quá rộng so với màn | Bọc `Flexible`, `Expanded`, hoặc `SingleChildScrollView` |
| BLoC state không update | Event chưa dispatch | Verify `bloc.add(Event())` được gọi |
| `MissingPluginException` | Native plugin chưa link | Chạy `flutter clean && flutter pub get` |

#### React Native
| Error | Nguyên nhân khả nghi | Hướng fix |
|-------|-------------|---------------|
| `undefined is not an object` | Truy cập prop null | Thêm null check / optional chaining |
| Metro bundler error | Cache stale | `npx react-native start --reset-cache` |
| `VirtualizedLists nested` | FlatList trong ScrollView | Dùng `nestedScrollEnabled` hoặc tái cấu trúc |
| Navigation `undefined` | `useNavigation` ngoài navigator | Bọc component trong đúng navigator |
| `act(...)` warning | Async state update trong test | Bọc trong `act(async () => {...})` |

#### iOS / Android
| Error | Nguyên nhân khả nghi | Hướng fix |
|-------|-------------|---------------|
| `SIGABRT` / `EXC_BAD_ACCESS` (iOS) | Nil dereference | Thêm optional binding `if let` / `guard let` |
| `IllegalStateException` (Android) | Vi phạm lifecycle | Kiểm tra fragment/activity còn attached không |
| `NetworkOnMainThreadException` | Network call trên UI thread | Chuyển sang coroutine / background thread |
| Build fail sau pod install | Pod cache stale | `pod deintegrate && pod install` |
| `Hilt injection failed` | Thiếu `@AndroidEntryPoint` | Thêm annotation vào Activity/Fragment |

## Test Failure Analysis

```
Expected: {value}
Actual  : {value}
  at {test}.{method}(line {N})
```
1. Gap là gì? 2. Mock setup đúng chưa? 3. Assertion có đúng logic không?

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/debug Analysis

## Error
{description}

## Root Cause
{giải thích kỹ thuật}

## Location
File: {path} | Line: {N} | Layer: {Controller/Service/Repository/Test}

## Suggested Fix
{thay đổi code cụ thể}

## Related Rule
Xem CLAUDE.md §{section}

## Next Step
- Để fix hoàn toàn → /fix-bug {TICKET_ID}
- Chỉ cần phân tích → xong
```

---

## Đề xuất ghi Lesson (tuỳ chọn)

Nếu root cause là một **lỗi AI gây ra khi sinh code và có thể lặp lại**
(không phải vấn đề env/config hay nguyên nhân bên ngoài), hỏi:

```
Cái này trông như một lỗi AI lặp lại. Ghi nó thành project lesson? (Y/N)
```

Nếu `Y` → chạy quy trình capture bên dưới với `source=/debug`, một `category` phù hợp
(thường `code-gen`), và `scope` = domain hoặc file glob bị ảnh hưởng.

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


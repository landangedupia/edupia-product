# /dev-run-test — Chạy Dev Self-Check Tests & Report kết quả

> **Scope — dev self-check (smoke), không phải bộ test chính thức.** Chạy các test do
> `/dev-gen-test` sinh ra để dev xác nhận code mình chạy được trước khi review. Đây là một
> self-check của dev, **không** phải lần chạy test authoritative của QC/dev-team (flow riêng).
> Pass/fail được publish lên Living Docs như tín hiệu **dev self-test** — nó cho QC biết
> dev đã chạy check của họ; KHÔNG phải tuyên bố về độ phủ test chính thức.

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID hoặc tên service. Context loading cung cấp `conventions.test_command` và `tech_stack.module`.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Service Detection

Đọc `active_module` từ context (đã phân giải ở context-loader Bước 1).
Dùng nó để chọn đúng lệnh chạy và bảng phân tích lỗi bên dưới.

---

## Submodule Working Directory

*Bỏ qua section này nếu `service_root` chưa được set (single-service mode).*

Khi chạy ở **umbrella/submodule mode** (`service_root` được phân giải ở context-loader Bước 1.6):

- Mọi lệnh trong section **Run** bên dưới phải thực thi từ trong `{service_root}/`
- `conventions.test_command` được nạp từ `{service_root}/.agent/project-context.yaml` — đã riêng theo service
- Prefix mọi lệnh shell bằng `cd {service_root} &&`:

```bash
cd {service_root}

# Then run any of the commands in the Run section below, e.g.:
{conventions.test_command}
mvn test -Dtest={ClassName}            # java-spring
go test ./... -run Test{FunctionName}  # golang
npx vitest run src/...                 # web-frontend
flutter test test/{domain}/...         # flutter
```

> **Vì sao cd?** Session Claude Code mở ở umbrella root. Mỗi service submodule có build tool, test runner, và cây dependency riêng — test phải chạy từ trong thư mục service.

---

## Run

### Nếu `platform_type = backend`

```bash
# Run all tests for this UC
{conventions.test_command}

# Scoped to specific class (faster feedback)
# java-spring:
mvn test -Dtest={ClassName}
# golang:
go test ./... -run Test{FunctionName}
# dotnet:
dotnet test --filter "FullyQualifiedName~{ClassName}"
# php-laravel:
php artisan test --filter {ClassName}
# context-engineering (pytest):
pytest tests/{domain}/{test_file}.py -v
pytest tests/{domain}/{test_file}.py::{TestClass}::{test_method} -v
pytest tests/ --cov={source_dir} --cov-report=term-missing
```

### Nếu `platform_type = web-frontend`

```bash
# Run all tests
{conventions.test_command}

# Scoped (Vitest / Jest):
npx vitest run src/features/{domain}/{Component}.test.tsx
npx jest src/features/{domain}/{Component}.test.tsx

# E2E (Playwright):
npx playwright test {UC-ID}
# E2E (Cypress):
npx cypress run --spec "cypress/e2e/{UC-ID}*"
```

### Nếu `platform_type = mobile`

```bash
# Flutter:
flutter test test/{domain}/{UC-ID}_test.dart
flutter test integration_test/{UC-ID}_test.dart   # integration

# React Native:
npx jest {UC-ID}

# iOS (Xcode command line):
xcodebuild test -scheme {Scheme} -destination 'platform=iOS Simulator,name=iPhone 15'

# Android:
./gradlew test                              # unit tests
./gradlew connectedAndroidTest              # instrumented (device/emulator required)
```

> **Lưu ý cho Android instrumented test:** cần một emulator đang chạy hoặc device kết nối trước khi chạy `connectedAndroidTest`. Khởi động qua Android Studio hoặc: `emulator -avd {AVD_NAME} &`

---

## Analyze Failures

### Backend failure patterns

#### java-spring / golang / dotnet / php-laravel

| Error Pattern | Nguyên nhân thường gặp | Suggested Fix |
|---|---|---|
| `NullPointerException` | Thiếu setup mock | Kiểm tra `given(...)`/`coEvery`/`mockk` cho dependency null |
| `Bean not found` | Thiếu khai báo mock | Thêm `@MockBean` / inject mock |
| `Expected 200, got 401` | Thiếu setup auth | Thêm auth token/user vào test context |
| `Expected 200, got 400` | Request body fail validation | Kiểm tra field bắt buộc trong DTO |
| `Expected 200, got 403` | Sai role | Thêm đúng role cho test user |
| `LazyInitializationException` | Lazy collection ngoài transaction | Thêm `@Transactional` hoặc eager fetch |
| `Mapper not found` | Code chưa compile | Chạy build trước khi test |
| `DataIntegrityViolationException` | Trùng key trong DB setup | Dùng `@Transactional` + rollback, hoặc clean DB giữa các test |
| Assertion mismatch | Sai giá trị mock return | Đọc lại setup `given(...).willReturn(...)` |

#### context-engineering (AI/LLM pipelines)

| Error Pattern | Nguyên nhân thường gặp | Suggested Fix |
|---|---|---|
| `AssertionError` trên output mock LLM | Giá trị mock return không khớp schema | Kiểm tra lại setup `mock_llm.return_value` / `mock_llm.complete.return_value` |
| `ValidationError` trên response | Cấu trúc output LLM không khớp schema kỳ vọng | Siết schema check hoặc thêm retry logic trong test |
| `ConnectionError` / `APIError` | LLM API thật bị gọi trong test | Đảm bảo mock `patch('...')` được áp dụng — không bao giờ gọi LLM thật trong unit test |
| `TimeoutError` | Test gọi LLM endpoint live | Thêm mock; kiểm tra test fixture |
| Kết quả flaky / non-deterministic | Response LLM thật dùng trong assertion | Thay bằng giá trị mock return tất định |

### Web frontend failure patterns

| Error Pattern | Nguyên nhân thường gặp | Suggested Fix |
|---|---|---|
| `Unable to find role "..."` | Element chưa render | Bọc trong `await waitFor(() => ...)` |
| `TestingLibraryElementError: Found multiple elements` | Selector quá rộng | Dùng `getByRole(..., { name: '...' })` để thu hẹp |
| `Network request not intercepted` | Thiếu MSW handler / `cy.intercept` | Thêm handler cho endpoint |
| `act(...)` warning | State update sau khi test kết thúc | Await async event / `await userEvent.click(...)` |
| `Cannot read properties of undefined` | Component render trước khi data load | Thêm loading state hoặc mock data đã resolve |
| Playwright timeout | Page chưa navigate / element ẩn | Kiểm tra route, thêm `waitForSelector` |
| `expect(page.locator(...)).toBeVisible` fail | Sai selector | Dùng Playwright Inspector để tìm đúng locator |

### Mobile failure patterns

#### Flutter
| Error Pattern | Nguyên nhân thường gặp | Suggested Fix |
|---|---|---|
| `pumpAndSettle timed out` | Async operation chưa hoàn thành | Dùng `pump(Duration(...))` cho delay cụ thể |
| `No widget found` | Widget chưa render / sai finder | Kiểm tra `find.byType`, `find.text`, `find.byKey` |
| `setState called after dispose` | Widget bị dispose trước khi async xong | Cancel async trong `dispose()` |
| BLoC state mismatch | Sai event emit | Verify `mockBloc` nhận đúng event |

#### React Native
| Error Pattern | Nguyên nhân thường gặp | Suggested Fix |
|---|---|---|
| `Unable to find element` | Thiếu `testID` hoặc sai query | Thêm `accessibilityLabel` hoặc `testID` vào component |
| `act(...)` warning | Async state update | Bọc trong `act(async () => { ... })` |
| Thiếu navigation mock | `useNavigation` chưa mock | Thêm jest mock cho `@react-navigation/native` |

#### iOS / Android
| Error Pattern | Nguyên nhân thường gặp | Suggested Fix |
|---|---|---|
| `XCTAssertEqual failed` | Sai giá trị kỳ vọng | Kiểm tra output ViewModel cho mock đã cho |
| `Compose node not found` | Sai `contentDescription` / `testTag` | Thêm `Modifier.testTag(...)` vào composable |
| `Hilt injection failed` | Thiếu test module | Thêm `@UninstallModules` + `@BindValue` trong test class |
| Emulator not available | `connectedAndroidTest` không có device | Khởi động emulator trước, chờ nó boot |

---

## Write Trace State

Sau khi chạy, lưu kết quả vào **TSV authoritative** trong service để chúng tới được
report Living Docs ở spec module (qua `/sync` + `/validate-traces`). Các file test
ở lại trong service — chỉ *status* của lần chạy được report.

Cập nhật **sổ của platform đang test** `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv` (`{platform}` = platform của code/`.feature` đang test — `system` cho backend, mọi platform khác (`web`/`app`/`webview`/…) cho client; nếu `domain`/`prd_slug` không phân giải được từ spec target, định vị TSV bằng cách glob `{paths.trace_dir}/**/{UC-ID}-{platform}.tsv` — nó được tạo trước đó bởi `/generate-bdd`) — cho mỗi scenario row (khớp `sc_id` qua tag
`@trace.verifies={UC-ID}-SC{N}` của test). *(Umbrella + `spec_source`: `trace_dir` là `{spec_source}/.trace` — test chạy từ `service_root` nhưng update `dev_selftest` ghi vào **spec repo**; commit/push spec submodule cho nó.)*

### ĐỌC cột `status` của row TRƯỚC KHI GHI *(bắt buộc)*

*Contract: `bin/trace-schema.json` → `positive_assertion_guards`. Dữ liệu đã có trong sổ — không phát sinh I/O.*

`pass` **không** mang nghĩa *"test đã chạy và xanh"*. Nó mang nghĩa **"scenario này đã được nghiệm thu theo spec HIỆN TẠI"**. Nên trước khi ghi nó, đọc `status` của đúng row đó:

| `status` của row | `dev_selftest` ghi gì | `dev_selftest_at` |
|---|---|---|
| `OK` · `GAP` · `UNTRACKED` | `pass` nếu mọi test của SC này pass · `fail` nếu có cái fail · `not_run` nếu test bị skip/vắng | hôm nay |
| **`DRIFT`** | test **pass** → **`not_run`** *(KHÔNG ghi `pass`)* · test **fail** → **`fail`** như thường | `—` nếu ghi `not_run`; hôm nay nếu ghi `fail` |
| **`ORPHANED`** | **`not_run`** — scenario đã bị xoá khỏi `.feature`, không còn gì để nghiệm thu | `—` |

`last_updated` = hôm nay, mọi trường hợp.

**Tin xấu luôn hợp lệ.** Đây là guard cho lời khẳng định **DƯƠNG**, không phải lệnh *"bỏ qua kết quả khi DRIFT"*. Test đỏ trên row DRIFT vẫn là thông tin thật và phải được ghi. Chỉ `pass` cần giấy phép.

**Khi ghi `not_run` vì `DRIFT`/`ORPHANED`, in ngay:**
```
⚠️  {sc_id} — test XANH nhưng row đang {DRIFT | ORPHANED}, nên KHÔNG ghi pass.
    {DRIFT: spec đã đổi sau lần codegen (spec_ver {a} ≠ gen_ver {b}) — test hiện tại đang
     nghiệm thu một hành vi không còn tồn tại.
     Làm: /generate-code {UC-ID} → /dev-gen-test {UC-ID} → chạy lại lệnh này.}
    {ORPHANED: scenario đã bị xoá khỏi .feature nhưng code+test còn. Xử theo /validate-traces.}
```

> **Vì sao bước này bắt buộc (GAPS-v4 G55).** Bản cũ ghi `pass` chỉ dựa vào *test có xanh không*, và
> khai `dev_selftest` **trực giao** với `status`. Trực giao về *kết quả chạy* thì đúng — nhưng
> **không** trực giao về *quyền được khẳng định*.
>
> Chuỗi hỏng, mọi mắt nối đều là hành vi framework tự chỉ định: PO đổi AC → `/generate-bdd` đặt
> `status = DRIFT` và **hạ** `dev_selftest → not_run` (kèm cảnh báo *"test của SC này viết cho spec
> cũ"*) → sáng sau dev chạy lệnh này theo thói quen, **chưa** `/generate-code`, **chưa**
> `/dev-gen-test` → test cũ + code cũ xanh hết → ghi `pass` + **ngày hôm nay**.
>
> Tức **lệnh kế tiếp trong vòng lặp dev bình thường dựng lại đúng cái tín hiệu `/generate-bdd` vừa
> hạ xuống.** README §Philosophy: *"Một tín hiệu đã hết đúng phải bị hạ xuống, không được giữ"* —
> ở đây còn tệ hơn *giữ*: nó **tái phát hành** với dấu ngày mới.
>
> Và thứ duy nhất chở tín hiệu *"test đã lỗi thời"* là **một dòng terminal** từ một lần chạy có thể
> đã xảy ra tuần trước, trong session của người khác: sổ có 24 cột và **không cột nào** giữ *"test
> được viết cho `spec_ver` nào"*. Dev không có cách nào biết. Đọc `status` là cách rẻ nhất để biết.
>
> **Tầng thứ hai độc lập:** `lint-trace` **T12** bắt đúng trạng thái này ở sổ thật (`status` ∈
> {DRIFT, ORPHANED} mà `dev_selftest`/`qc_status` = `pass`), bất kể lệnh nào ghi ra — kể cả sổ sửa
> tay hoặc sổ sinh bởi version framework cũ hơn.

Giữ nguyên mọi cột khác — đặc biệt **không bao giờ** đụng `qc_status`/`qc_run_at`
(kết quả QC automation chính thức, do `/qc-run-test` sở hữu; nó có guard riêng cùng loại).
`dev_selftest` (dev smoke) và `qc_status` (QC chính thức) là hai tín hiệu riêng.

## Refresh Panel Mirror
# Làm mới panel mirror của Living Docs *(local)*

> **Hai vị trí, HAI TÊN KHÁC NHAU — đọc trước khi sửa gì ở đây.**
>
> | Đường dẫn | Vai trò | Git |
> |---|---|---|
> | `{paths.trace_dir}` (`.trace/` hoặc `{spec_source}/.trace/`) | **AUTHORITATIVE** — TSV + `trace-history.jsonl`. Không regenerate được. | **PHẢI commit** |
> | `./.trace-mirror/` ở gốc workspace hiện tại | **MIRROR** — bản sao tiện cho panel VS Code. Sinh lại được bất cứ lúc nào. | **Luôn gitignore** |
>
> Trước v0.4.3 cả hai đều tên `.trace`, nên một luật gitignore theo tên có thể **xoá sạch sổ gốc**
> khi dev mở thẳng spec repo làm workspace (lúc đó hai path bằng nhau). Hai tên khác nhau làm
> luật git đọc được bằng mắt và **không còn ca nhập nhằng nào**: `.trace-mirror/` không bao giờ
> commit, `.trace/` không bao giờ gitignore.

## Khi nào CÓ mirror

Mirror chỉ tồn tại khi **`{paths.trace_dir}` nằm NGOÀI workspace hiện tại** — panel đọc từ workspace đang mở nên cần một bản sao ở đây.

| Tình huống | `{paths.trace_dir}` | Có mirror? |
|---|---|---|
| Single-service | `./.trace` — **trong** workspace | ❌ Không. Panel đọc thẳng `.trace/trace-report.json`. Bỏ qua cả file này. |
| Dev mở thẳng **spec repo** | `./.trace` — **trong** workspace | ❌ Không. Như trên. |
| Umbrella + `spec_source`, dev đứng ở umbrella hoặc service submodule | `{spec_source}/.trace` — **ngoài** workspace | ✅ Có |
| Umbrella legacy (không `spec_source`) | `.trace` theo từng service | ✅ Có |

Quy tắc một dòng: **phân giải `panel_mirror = ./.trace-mirror` ở gốc workspace hiện tại; nếu `{paths.trace_dir}` đã nằm trong workspace này thì bỏ qua toàn bộ bước mirror.**

---

Sau khi cập nhật TSV authoritative tại `{paths.trace_dir}`:

**Khi `setup.spec_source` được đặt (trace gộp — trường hợp phổ biến):**
`{paths.trace_dir}` phân giải về `{spec_source}/.trace` — vị trí authoritative duy nhất.
Lệnh này chạy từ `service_root`, nên thao tác ghi là **liên-repo vào spec submodule**;
commit/push spec submodule cho lần cập nhật trace (giống như `feedback/`).

1. Phân giải `panel_mirror = ./.trace-mirror` tại **gốc workspace hiện tại**.
2. Nếu `{paths.trace_dir}` **không** nằm trong workspace hiện tại, copy mỗi
   `{UC-ID}-{platform}.tsv` vừa cập nhật → `{panel_mirror}/{UC-ID}-{platform}.tsv` (tạo thư mục; ghi đè).
   Không namespace theo service — chỉ có một bộ trace; service sở hữu được mang ở
   **cột `service` (cột 23)** của chính từng row, do `/generate-bdd` ghi từ `@trace.service`.
3. **KHÔNG copy `trace-history.jsonl`.** Nó là dữ liệu tích luỹ, không phải thứ sinh lại được —
   nhân bản nó ra một thư mục gitignore là tạo hai lịch sử lệch nhau rồi mất bản thật.

**Legacy (không có `spec_source` — trace theo service):**
Copy mỗi `{UC-ID}-{platform}.tsv` vừa cập nhật → `{panel_mirror}/{service-name}/{UC-ID}-{platform}.tsv`
(namespace theo `active_service`).

Cách này giữ panel Living Docs của workspace đang mở luôn mới **giữa các lần sync** — nó chỉ là
một **mirror tiện lợi cục bộ**. File `trace-report.json` đã merge (canonical, trong
`{spec_source}/.living-docs/`) được build lại bởi `/sync` hoặc `/validate-traces`. Với các lệnh
được orchestrate, làm việc này một lần trong orchestrator sau khi tất cả sub-agent trả về — không phải
bên trong từng sub-agent.


## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/dev-run-test Report — {UC-ID} ({active_module})
✅ Passed: {N} | ❌ Failed: {M} | ⏭️ Skipped: {K} | Duration: {X}s

## Failed Tests
| Test | Error | Root Cause |
|------|-------|------------|

## Recommendations
{fix cụ thể cho từng failure}

Trace: {paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv updated (dev_selftest, dev_selftest_at)

Next:
  Mọi test pass → /review-code {UC-ID}
  Test fail     → /fix-bug {TICKET_ID} (bug thật) hoặc fix test (sai expectation)

📊 Living Docs: chạy /validate-traces (hoặc /sync) để push trace này lên dashboard spec-module.
```

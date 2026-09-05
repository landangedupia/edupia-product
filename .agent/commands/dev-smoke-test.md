# /dev-smoke-test — Smoke Test Service hoặc App đang chạy

Dùng khi service/app **đang chạy sẵn**. Khác `/dev-run-test` (không cần live server).

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


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID từ `$ARGUMENTS`. Context loading cung cấp `conventions.service_run`, thông tin port, và `tech_stack.module`.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Service Detection

Đọc `active_module` từ context. Dùng để chọn đúng cách dev-smoke-test.

| Platform | Modules |
|---|---|
| `backend` | `java-spring`, `golang`, `dotnet`, `php-laravel`, `context-engineering` |
| `web-frontend` | `react`, `nextjs`, `vue`, `nuxt`, `angular` |
| `mobile` | `flutter`, `react-native`, `ios-swiftui`, `android-compose` |

---

## Nếu `platform_type = backend`

### Phase 1 — Xác minh service đang chạy

Đọc `conventions.service_run` từ project-context.yaml để xác định port.

```bash
# Try common health endpoints (use whichever applies):
curl -s http://localhost:{port}/health            # generic / Go / Node
curl -s http://localhost:{port}/actuator/health   # Spring Boot
curl -s http://localhost:{port}/ping              # some frameworks
```

Nếu chưa chạy → "Khởi động với `{conventions.service_run}` từ project root."

### Phase 2 — Xác định endpoint

Từ UC-ID → tìm controller/handler có `@trace.implements={UC-ID}`.
Liệt kê: method, path, auth/role bắt buộc.

### Phase 3 — Lấy auth token (nếu cần)

```
Endpoint yêu cầu auth. Lựa chọn:
1. Dán Bearer token (từ Postman/DevTools)
2. Dùng test/dev token từ local config
3. Skip — chỉ test endpoint public
```

### Phase 4 — Run

```bash
# GET
curl -s -X GET "http://localhost:{port}/v1/{resource}" \
  -H "Authorization: Bearer {token}" | {JSON_FORMATTER}

# POST
curl -s -X POST "http://localhost:{port}/v1/{resource}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"field1": "test_value"}'
```

| Kết quả | Ý nghĩa |
|--------|---------|
| 200/201 + đúng data | ✅ OK |
| 200 + sai data | ⚠️ Logic bug → /debug |
| 400 | Sai request body → kiểm tra field bắt buộc |
| 401 | Token hết hạn hoặc sai config |
| 403 | Sai role → kiểm tra auth rule |
| 500 | Server error → /debug |
| Connection refused | Service chưa chạy |

### Nếu `active_module = context-engineering`

#### Phase 1 — Xác minh entry point của pipeline tới được

Chạy prompt function trực tiếp với một input hợp lệ tối thiểu:

```bash
# Python (pytest / script):
python -c "from {module}.{function} import {function}; print({function}(input='{test_input}'))"

# Or using the project test command with a smoke marker:
{conventions.test_command} -m smoke -v
```

#### Phase 2 — Xác minh cấu trúc output

Kiểm tra output khớp schema kỳ vọng:

```
Expected output schema: {output fields from @trace or tech-doc}
Actual output: {paste output here}
```

#### Phase 3 — Diễn giải kết quả

| Kết quả | Ý nghĩa |
|--------|---------|
| Output khớp schema | ✅ OK |
| Output có nhưng sai format | ⚠️ Logic bug → /debug |
| `APIError` / `AuthenticationError` | API key không hợp lệ hoặc service unavailable |
| `TokenLimitError` | Input quá dài — kiểm tra kích thước prompt template |
| Exception / traceback | Lỗi code → /debug |

---

## Nếu `platform_type = web-frontend`

### Phase 1 — Xác minh dev server đang chạy

```bash
# Linux / macOS:
curl -s -o /dev/null -w "%{http_code}" http://localhost:{port}

# Windows (cmd / PowerShell):
curl -s -o NUL -w "%{http_code}" http://localhost:{port}

# Should return 200. If not: start with {conventions.service_run} (e.g., npm run dev)
```

### Phase 2 — Chạy E2E smoke test

Xác định E2E tool trong dự án (Playwright hoặc Cypress):

```bash
# Playwright — run scenarios tagged with this UC:
npx playwright test --grep "{UC-ID}"

# Cypress:
npx cypress run --spec "cypress/e2e/{UC-ID}*"
```

Nếu chưa có E2E test → mở browser và verify thủ công:
1. Điều hướng tới route của UC này
2. Thực hiện hành động chính của người dùng
3. Xác nhận kết quả kỳ vọng hiển thị

### Phase 3 — Diễn giải kết quả

| Kết quả | Ý nghĩa |
|--------|---------|
| Tất cả E2E test pass | ✅ OK |
| Assertion failed | ⚠️ Logic bug → /debug |
| `ERR_CONNECTION_REFUSED` | Dev server chưa chạy |
| API trả về 4xx/5xx | Vấn đề backend → kiểm tra backend service |

---

## Nếu `platform_type = mobile`

### Phase 1 — Xác minh device/emulator sẵn sàng

```bash
# Flutter:
flutter devices              # list connected devices/emulators
flutter install              # install current build on device

# React Native:
npx react-native run-android   # build + install on connected Android
npx react-native run-ios       # build + install on iOS simulator

# Android (Compose):
./gradlew installDebug         # install APK on connected device/emulator

# iOS (SwiftUI):
# Open Xcode → select simulator → Product → Run
```

### Phase 2 — Checklist dev-smoke-test thủ công

Với UC đang test, verify trên device:
1. Điều hướng tới màn của UC này
2. Thực hiện hành động chính từ Scenario `.feature` (step `When`)
3. Xác nhận kết quả kỳ vọng hiển thị (step `Then`)
4. Kiểm tra có crash hoặc dialog lỗi bất ngờ không

### Phase 3 — Bắt issue nếu phát hiện

```bash
# Flutter:
flutter logs

# Android:
adb logcat -d | grep -i "error\|exception\|crash"

# iOS:
# Copy crash log from Xcode → Devices and Simulators → View Device Logs
```

Dán output vào `/debug`.

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/dev-smoke-test Report — {UC-ID}
Platform: {backend | web-frontend | mobile}
| Endpoint / Flow       | Status      | Result  |
|-----------------------|-------------|---------|
| {method} {path/screen}| ✅/⚠️/❌   | {notes} |

Status legend: ✅ = OK  |  ⚠️ = Responded but wrong data / logic bug  |  ❌ = Error / not running

Issues: {mô tả các failure}
Next: /debug (dán lỗi tương tác) HOẶC /fix-bug {TICKET_ID} HOẶC sẵn sàng PR
```

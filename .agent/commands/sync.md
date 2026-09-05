# /sync — Sync & Refresh Umbrella Project

Một lệnh cho cả **setup lần đầu** lẫn **cập nhật hằng ngày** một umbrella repo có git submodule.
An toàn chạy lặp lại — tự phát hiện cần làm gì.

**Argument tuỳ chọn:** `/sync [spec-branch]` — branch của spec submodule để pull (vd `/sync develop`). Nếu bỏ, branch được phân giải tự động (xem Step 0-D).

---

## Step 0 — Pre-flight Checks

**A. Git repo check**

Xác minh thư mục hiện tại nằm trong git repo. Nếu không → dừng:
```
❌ Not a git repository. Open Claude Code from umbrella root and retry.
```

**B. Đọc project config sớm**

Đọc `.agent/project-context.yaml` trước khi chạy lệnh git nào. Trích:
- `setup.spec_source` → path của spec submodule (vd `"my-project-specs"`)
- `services` → map domain → `{path, module, ...}` cho mỗi service submodule

Cần cái này để phân biệt spec vs service submodule ở Step 1.

Nếu `.agent/project-context.yaml` không tồn tại → cảnh báo và set `spec_source = null`, `services = {}`.

**C. Submodule status scan**

Chạy `git submodule status --recursive` và phân loại mỗi entry theo ký tự đầu:

| Char | Ý nghĩa | Hành động |
|------|---------|--------|
| `-` | Chưa init | → **Setup mode** |
| ` ` | Khớp pointer đã ghi | → OK |
| `+` | Ahead của pointer đã ghi (local advance chưa commit) | → cảnh báo từng submodule |
| `U` | Merge conflict | → **STOP** |

Nếu **bất kỳ** entry nào có `U`:
```
❌ Merge conflict in submodule: {path}
   Resolve manually before running /sync:
     cd {path} && git status
```

Nếu **bất kỳ** entry nào có `+` (commit đang checkout khác pointer đã ghi):
```
ℹ️ {path} is ahead of the umbrella's recorded pointer.
   /sync classifies it in Step 1b — if you're on a branch there, it stays untouched.
```
Đừng xử lý `+` ở đây — Step 1b quyết định cách xử lý đúng cho từng submodule.

In mode phát hiện: `Mode: Setup (first-time init)` hoặc `Mode: Update (sync latest)`.

---

## Step 1 — Umbrella Pull

Ghi branch umbrella hiện tại trước (đây là cái `git pull` cập nhật):
`git rev-parse --abbrev-ref HEAD` → lưu thành `umbrella_branch` và hiển thị.

```bash
# 1. Pull latest umbrella (includes updated submodule pointer records)
git pull

# 2. Sync .gitmodules config into local git config
#    (needed when new submodules were added since last clone)
git submodule sync --recursive

# 3. Initialize any NOT-yet-cloned submodules ONLY (the '-' entries from Step 0-C).
#    Do NOT run a blanket `git submodule update --recursive` — that would detach
#    a submodule you are actively working in. Per-submodule handling is Step 1b.
git submodule update --init {paths that were '-' in Step 0-C}
```

Nếu `git pull` exit khác 0 → in lỗi và dừng với `❌`.

---

## Step 1b — Phân loại & Sync từng Submodule

**Ý tưởng cốt lõi:** `/sync` không bao giờ áp một branch lên submodule. Nó **kiểm tra checkout hiện tại của từng submodule** và tôn trọng nó. Đây là cách nó biết submodule nào bạn đang làm vs cái nào là dependency thụ động.

Với mỗi submodule (dùng `git submodule foreach` hoặc lặp các path), đọc state:

```bash
# Inside each submodule:
git symbolic-ref --short -q HEAD   # → branch name, or empty/non-zero if DETACHED
git status --porcelain             # → non-empty means uncommitted local changes
```

Phân loại vào một trong bốn case và xử lý tương ứng:

| Case | State phát hiện | Hành động |
|------|----------------|--------|
| **Spec submodule** | `path == spec_source` | Advance tới `spec_branch` (Step 1c bên dưới) |
| **Active (on a branch)** | HEAD là một branch, không detached | **KHÔNG checkout.** Đây là nơi bạn (hoặc đồng đội) đang code. Chỉ `git -C {path} fetch` và report branch + ahead/behind. Để working tree y nguyên. |
| **Passive (detached, clean)** | Detached HEAD, không có thay đổi local | An toàn align về pointer đã ghi của umbrella: `git submodule update {path}` |
| **Dirty (uncommitted changes)** | `git status --porcelain` non-empty | **Đừng đụng.** Cảnh báo: `⚠️ {path} has uncommitted changes — skipped. Commit or stash before syncing this submodule.` |

> **Vì sao quan trọng:** Một `git submodule update` toàn bộ checkout mọi submodule về **detached HEAD** ở pointer đã ghi. Nếu bạn đang checkout `feature/FEAT-01` trong `user-service/` và đang làm dở, cái đó sẽ âm thầm chuyển bạn khỏi branch. Phân loại trước bảo vệ công việc đang làm của bạn.

---

## Step 1c — Advance Spec Submodule *(chỉ khi `spec_source` được cấu hình)*

Spec submodule là submodule duy nhất ta cố ý advance tới một branch HEAD (PO push spec liên tục).

**Phân giải spec branch** (giờ submodule đã init), theo thứ tự ưu tiên:

1. **Command argument** — nếu `$ARGUMENTS` chứa tên branch → dùng nó (override một lần)
2. **`.gitmodules` config** — `git config -f .gitmodules --get submodule.{spec_source}.branch`. Nếu set → dùng nó (default committed của team)
3. **Remote default** — else branch default của spec repo: `git -C {spec_source} rev-parse --abbrev-ref origin/HEAD` (bỏ prefix `origin/`)

Lưu thành `spec_branch` + `spec_branch_source` (argument | .gitmodules | remote-default). Nếu nó rơi xuống remote-default mà không có gì pin, thêm hint này vào output:
```
ℹ️ Spec submodule branch not pinned in .gitmodules — using remote default '{spec_branch}'.
   To pin it for the whole team:
     git config -f .gitmodules submodule.{spec_source}.branch {spec_branch}
     git add .gitmodules && git commit -m "chore: pin spec submodule branch"
```

Rồi kiểm tra an toàn: nếu spec submodule có thay đổi chưa commit → cảnh báo và skip (dev nên coi spec là read-only). Ngược lại dùng **explicit checkout** (không phải `--remote` trần) để branch rõ ràng:

```bash
cd {spec_source}
git fetch origin
git checkout {spec_branch}        # branch resolved in Step 0-D
git pull origin {spec_branch}
cd -                              # back to umbrella root
```

In: `Spec submodule {spec_source}: pulled branch '{spec_branch}' (source: {spec_branch_source})`

> **Vì sao không `--remote` cho service submodule?** Service submodule bị version-lock bởi pointer đã ghi của umbrella — cố ý để mọi dev làm từ cùng commit. `--remote` sẽ bỏ qua lock này và tạo pointer drift chưa commit. Spec submodule là ngoại lệ: PO push liên tục, nên ta advance nó tới branch HEAD — nhưng làm bằng explicit `checkout {spec_branch}` thay vì `--remote` để nó không bao giờ âm thầm theo sai branch.

Nếu `git pull` hoặc `git submodule update` exit khác 0 → in lỗi và dừng với `❌`.

Thu từ output:
- Submodule nào đổi SHA
- Cái nào đã up to date
- `{old_sha}..{new_sha}` của spec submodule (cần cho Step 1d)

---

## Step 1d — Surface Feedback của Tester/QC *(bug report / scenario proposal / PRD change request)*

`/report-bug`, `/propose-scenario` của tester & QC (gồm cả PRD change request Case B) commit feedback vào spec repo. Step này cho PO/Dev biết cái gì tới trong **lần** pull này, để họ được thông báo qua routine bình thường. Nó phủ cả hai đối tượng:

- **Dev/tester trong umbrella** → feedback tới qua spec submodule advance (Step 1c)
- **PO làm trực tiếp trong spec repo** → feedback tới qua `git pull` của umbrella/current-repo (Step 1)

Chọn repo + range đã pull feedback:
- Umbrella có `spec_source` → `REPO={spec_source}`, range = spec submodule `{old_sha}..{new_sha}`
- Ngược lại (chạy trong chính spec repo) → `REPO=.`, range = `{old_sha}..{new_sha}` của `git pull` từ Step 1

Nếu `feedback/` không tồn tại trong REPO → skip âm thầm.

```bash
git -C {REPO} diff --name-status {old_sha}..{new_sha} -- feedback/bug-reports/ feedback/bdd-proposals/ feedback/prd-change-requests/
```

Với mỗi entry, đọc title/summary + `State` và report. **Bug report: chỉ surface `State: Open`** là cần chú ý; liệt kê `Fixed`/`Closed` riêng (hoặc bỏ) để PO/PM thấy cái gì còn pending:
```
📥 New feedback (pulled this sync):
   Bug reports (open):
     BUG-20260608-01  FT-001 — account locks after 6 fails (spec says 5)   [layer: Code · waiting: dev]
   Bug reports (fixed, awaiting QC re-verify): BUG-20260605-02
   Scenario proposals:
     FT-001-trailing-spaces.md  → maps to AC2  (pending review)
   PRD change requests:
     FT-001-bulk-export.md  → new requirement, needs an AC  (waiting: PO)
```

Nếu không có gì đổi → in `📥 Feedback: none new this sync`.

Nếu người đọc là PO/Dev, thêm một dòng nudge:
`→ Review feedback/ then act: /fix-bug {BUG-ID} · promote proposal via /generate-bdd · or add an AC to the PRD.`

---

## Step 1e — Spec delta: **tài liệu nào vừa đổi** *(hai mốc, hai câu hỏi khác nhau)*

*Câu hỏi số MỘT của dev sau mỗi lần sync là "tài liệu của phần tôi đang làm có đổi không?". Step này trả lời nó. Range `{old_sha}..{new_sha}` đã thu ở Step 1c — không phát sinh fetch.*

> **Vì sao step này tồn tại (GAPS-v4 G56).** Bản cũ diff **đúng ba** đường dẫn ở Step 1d —
> `feedback/bug-reports/`, `feedback/bdd-proposals/`, `feedback/prd-change-requests/` — và
> `specs/` **không có trong danh sách**. Tức `/sync` hỏi *"có góp ý gì mới không"* (đúng và hữu ích)
> rồi bỏ qua **chính tài liệu mà mọi lệnh downstream đọc**: PRD · BDD · tech-doc · design-spec.
>
> Nó **đang cầm sẵn câu trả lời**: Step 1c vừa thu cả hai đầu SHA, và Step 1d đã chạy một `git diff`.
> Thêm `specs/` là thêm **một tham số đường dẫn**.
>
> Thay vào đó, dòng `Next` in cứng `/validate-traces (full coverage check)` — **y hệt nhau** dù 0 file
> đổi hay 12 file đổi. Một lời nhắc không bao giờ thay đổi thì **không mang thông tin**, nên bị lướt.
> Đây đúng lập luận `gate.md` Bước 3b dùng để cắt CHECKPOINT xuống hai dòng khi mọi thứ sạch —
> *"cổng luôn in ra một bảng giống hệt nhau … nên `Y` thành phản xạ và cổng hỏng âm thầm"*. Nguyên
> tắc đó đã áp cho `gate`; đây là chỗ nó còn thiếu.
>
> Và tệ hơn: lệnh duy nhất được gợi ý là lệnh **đắt nhất** (quét cả repo). Nên con đường duy nhất
> được chỉ là con đường người ta sẽ không đi. Step này làm nó **có scope**.
>
> **Đây KHÔNG phải một detector bị hỏng** — mọi detector đều hoạt động đúng. Đây là một **công tắc
> bị thiếu**: không ai biết là cần bật.

Bỏ qua **im lặng** nếu `{paths.specs_dir}` không tồn tại trong REPO (chọn REPO + range theo đúng quy tắc Step 1d).

### 1e-A — Đổi gì kể từ lần **PULL** trước

```bash
git -C {REPO} diff --name-status {old_sha}..{new_sha} -- specs/
```

Nhóm kết quả theo **feature-package** (`specs/{domain}/{prd-slug}/`), và với mỗi file đổi, đọc **nhãn version ở hai đầu** — thứ dev cần không phải tên file mà là *nhãn đã nhảy chưa*:

| Loại file | Nhãn đọc ở đâu | Bản cũ đọc bằng |
|---|---|---|
| PRD (`.md` ở gốc package) | Metadata `\| **Version** \|` + row `# Change Log` đầu bảng | `git -C {REPO} show {old_sha}:{path}` |
| `.feature` | `# @trace.bdd_version` | như trên |
| `tech-docs/*-tech-design.md` | `@trace.revision` | như trên |
| `design-spec/*.md` | `\| **Version** \|` | như trên |

**Cap có công bố:** > **20** file đổi → **bỏ** phần đọc nhãn (mỗi file là một `git show`), chỉ liệt kê package + số file, và **in rõ là đã cap**:
`ⓘ {n} file đổi (> 20) — bỏ phần so nhãn version để không làm chậm sync. Chạy /validate-traces để có bản đầy đủ.`
*(Luật framework: cap thì phải nói ra. Một giới hạn im lặng đọc như "đã phủ hết" trong khi không phải.)*

### 1e-B — Đổi gì kể từ lần **AUDIT** gần nhất ⭐

*Đây là phần 1e-A **không** trả lời được, và là câu hỏi đúng hơn.*

Diff `{old_sha}..{new_sha}` **reset mỗi lần pull**. Pull thứ Hai, thứ Ba, thứ Tư mà không audit lần nào → đến thứ Năm cái thấy được chỉ là delta của **một ngày**, không phải nợ đã tích.

Đọc mốc **`spec_baseline`** trong `{living_docs_dir}/trace-report.json` — khối do `/validate-traces` Step 6b ghi (contract: `bin/trace-schema.json` → `spec_edit_detection`). Mỗi entry: `prd_path` · `sha_at_audit` · `version_at_audit`.

*Phân giải `living_docs_dir` bằng đúng quy tắc một dòng của Step 5: `{spec_source}/.living-docs` nếu `setup.spec_source` được set, else `.living-docs` ở gốc.*

Với mỗi PRD có entry: so `Version` **hiện tại** với `version_at_audit`.

| Điều kiện | In gì |
|---|---|
| Khác nhau | PRD này đã đổi kể từ lần audit — vào danh sách ⚠️ |
| Bằng nhau | Bỏ qua *(và `/validate-traces` Step 3.9 sẽ lo ca "nội dung đổi mà nhãn không đổi" — không phải việc của step này)* |
| Không có `trace-report.json`, hoặc khối `spec_baseline` vắng | In `ⓘ Chưa có mốc audit — chạy /validate-traces một lần để Step 1e-B có hiệu lực từ lần sau.` rồi bỏ qua |

**KHÔNG ghi gì cả.** Step này chỉ **đọc** mốc; chủ sở hữu của `spec_baseline` là `/validate-traces` Step 6b. `/sync` ghi mốc sẽ làm mốc audit trượt theo mỗi lần pull — tức phá đúng thứ nó đang dùng.

### Xuất

```
📄 Spec đã đổi (pulled this sync):
   payment/create-invoice   PRD v1.2 → v1.4
                            changelog: UC2: sửa BR5; UC7 mới
                            bdd/web/PAY01-UC2.feature   (bdd_version 1.3 → 1.4)
   user/create-account      tech-docs/USR01-tech-design.md   (revision 3 → 4)
   (hoặc: 📄 Spec: không đổi trong lần pull này)

⚠️  3 PRD đã đổi kể từ lần /validate-traces gần nhất (KHÔNG chỉ lần pull này):
       payment/create-invoice   audit tại v1.2 · giờ v1.4
       user/create-account      audit tại v2.0 · giờ v2.1
       order/bulk-export        audit tại v1.0 · giờ v1.3
    → /validate-traces {các PRD trên}
   (hoặc: ✅ Mọi PRD đã được audit ở version hiện tại)
```

---
## Step 2 — Post-sync State Check

Chạy `git status --short` và kiểm tra entry submodule bị modified (dòng bắt đầu bằng ` M` mà path khớp một submodule).

Nếu pointer submodule nào đổi (thường là spec submodule sau `--remote`):
```
⚠️ Submodule pointer(s) updated — commit to lock new version into umbrella:
   git add {spec_source} && git commit -m "chore: sync {spec_source} to latest"
```

Nếu không có thay đổi → `✅ Umbrella state clean — no commit needed`.

---

## Step 3 — Bootstrap Service Configs

*Skip nếu `services` rỗng.*

**Trước tiên — làm phẳng `services` thành danh sách submodule.** Một giá trị trong `services` có thể lồng tới ba tầng (xem `context-loader.md` Bước 1.5), nên duyệt nông sẽ **bỏ sót** submodule:

| Dạng | Cách lấy submodule |
|---|---|
| `services.{domain}.path` (2a) | một entry |
| `services.{domain}.{platform}.path` (2b) | một entry mỗi platform |
| `…by_prd_slug.{slug}.path` (2c) | một entry mỗi `slug` — ở cấp domain hoặc cấp platform |

Kết quả là tập các cặp `{path, module}` **duy nhất theo `path`** (nhiều domain/platform/slug có thể trỏ chung một submodule — chỉ xử lý một lần). Mọi bước dưới đây chạy trên danh sách đã làm phẳng này.

Với mỗi entry trong danh sách đó:

**A. Nếu `{service.path}/.agent/project-context.yaml` đã tồn tại:**
- Đọc `conventions.test_command` và `conventions.build_command`
- Report: `✅ {service.path} — test: {test_command} | build: {build_command}`

**B. Nếu thiếu — tự tạo:**

1. Xác định `module` từ umbrella `services[].module` (authoritative). Nếu không set, auto-detect từ file trong `{service.path}/`:

   | File có mặt | Module phát hiện | test_command | build_command |
   |---|---|---|---|
   | `pom.xml` | `java-spring` | `mvn test` | `mvn compile` |
   | `build.gradle` or `build.gradle.kts` | `java-spring` | `./gradlew test` | `./gradlew build` |
   | `go.mod` | `golang` | `go test ./...` | `go build ./...` |
   | `*.csproj` or `*.sln` | `dotnet` | `dotnet test` | `dotnet build` |
   | `composer.json` | `php-laravel` | `php artisan test` | `composer install` |
   | `pubspec.yaml` | `flutter` | `flutter test` | `flutter build apk` |
   | `angular.json` | `angular` | `npx ng test --watch=false` | `npm run build` |
   | `next.config.*` | `nextjs` | `npx vitest run` | `npm run build` |
   | `package.json` + `nest-cli.json` | `nestjs` | `npm test` | `npm run build` |
   | `package.json` (fallback) | `react` | `npx vitest run` | `npm run build` |
   | `requirements.txt` or `pyproject.toml` | `context-engineering` | `pytest tests/ -v` | `pip install -r requirements.txt` |
   | *(none matched)* | `unknown` | `{{TEST_COMMAND}}` | `{{BUILD_COMMAND}}` |

2. Tạo thư mục `{service.path}/.agent/` nếu chưa có.

3. Ghi `{service.path}/.agent/project-context.yaml`:

   ```yaml
   # Auto-generated by /sync — review and update as needed
   tech_stack:
     language: "{detected or from module}"
     framework: "{detected or from module}"
     module: "{module}"

   conventions:
     test_command: "{test_command}"
     build_command: "{build_command}"

   paths:
     trace_dir: ".trace"
     lessons_file: ".agent/project-lessons.md"   # per-service guardrails (see /learn)
   ```

4. Report:
   - Nếu auto-detect: `✅ Created {service.path}/.agent/project-context.yaml (module: {module}, test: {test_command})`
   - Nếu unknown/placeholder: `⚠️ Created {service.path}/.agent/project-context.yaml — fill in {{TEST_COMMAND}} and {{BUILD_COMMAND}}`

---

## Step 4 — Check luật git cho sổ trace

*Step 4a/4b kiểm **có được commit hay không** (hai chiều ngược nhau — nhầm chiều là mất dữ liệu).
Step 4c kiểm **merge thế nào khi hai người cùng ghi**. Cả hai đều là đường mất sổ, và 4c không
cần ai làm sai gì cả — chỉ cần hai người làm việc cùng lúc.*

*Đọc bảng trước:*

| Đường dẫn | Vai trò | Kỳ vọng |
|---|---|---|
| `{paths.trace_dir}` (`.trace/` hoặc `{spec_source}/.trace/`) | **AUTHORITATIVE** — TSV + `trace-history.jsonl`, không regenerate được | **PHẢI commit** — gitignore nó là **lỗi nghiêm trọng** |
| `.trace-mirror/` | bản sao tiện cho panel VS Code | phải gitignore |
| `.living-docs/` | report sinh ra | phải gitignore |

**4a. Cảnh báo mềm — mirror chưa gitignore.**
Kiểm `.trace-mirror/` trong `.gitignore` của repo hiện tại (hoặc `.git/info/exclude`), và `.living-docs/` trong `.gitignore` của **specs module** (khi `setup.spec_source` được set). Thiếu cái nào:
```
⚠️ Mirror chưa gitignore — chúng được sinh ra, đừng bao giờ commit:
   echo ".trace-mirror/" >> .gitignore
   echo ".living-docs/" >> {spec_source}/.gitignore   # specs module (nếu có spec_source)
```

**4b. 🔴 Báo động — sổ gốc ĐANG bị bỏ qua.**
Phân giải `{paths.trace_dir}`; nếu nó nằm trong một git repo, chạy `git -C {repo} check-ignore -q {trace_dir}`. **Trúng** (exit 0) → in ngay, mức chặn:
```
🔴 NGUY HIỂM — sổ gốc trace ĐANG bị git bỏ qua: {paths.trace_dir}
   Toàn bộ trạng thái theo dõi (spec_ver · gen_ver · implemented_by · test_count ·
   dev_selftest · qc_status) VÀ trace-history.jsonl KHÔNG được lưu vào git.
   Người khác clone repo về sẽ không thấy gì, và lịch sử thì KHÔNG dựng lại được.

   Sửa:
     1. Gỡ dòng khớp `.trace` khỏi .gitignore của {repo}
     2. git -C {repo} add -f {trace_dir} && git -C {repo} commit -m "restore trace state"
   Nguyên nhân thường gặp: bản trước v0.4.3 gọi panel mirror là `.trace` (trùng tên sổ gốc),
   nên gợi ý "gitignore .trace/" của chính lệnh này có thể đã nhắm trúng sổ gốc.
```
> **Vì sao cần báo động này:** trước v0.4.3, mirror và sổ gốc **cùng tên `.trace`**. Khi dev mở thẳng spec repo làm workspace thì hai path bằng nhau — và Step 4 (bản cũ) gợi ý gitignore theo **tên**, không theo vai trò. Làm theo là mất sổ gốc, **im lặng**: máy vẫn chạy, dashboard vẫn có số; chỉ người thứ hai clone về mới phát hiện. Bản v0.4.3 đổi tên mirror thành `.trace-mirror` để cái bẫy biến mất, nhưng **dự án đã dính từ trước thì vẫn dính** — 4b là để tìm ra chúng.

**4c. Luật merge cho sổ trace.**

Sổ trace **phải commit** (4b) và **được nhiều người ghi trên nhiều nhánh song song**. Git cần biết
merge nó thế nào — mặc định thì không biết, và mặc định là đường mất row.

Kiểm `{paths.trace_dir}/.gitattributes` có tồn tại và có đủ hai dòng dưới. **Thiếu → tạo/bổ sung
ngay** (đây là hành động ghi duy nhất của Step 4; nó chỉ thêm file luật, không đụng dữ liệu):

```gitattributes
# Sổ trace — dữ liệu KHÔNG regenerate được. Hai luật, hai lý do khác nhau:
#
# merge=union — giữ row của CẢ HAI nhánh thay vì bắt người chọn một bên. Trùng sc_id sau
#   union là ca ĐÚNG VÀ ĐƯỢC MONG ĐỢI: `--lint-trace` T4 bắt nó, rồi /validate-traces
#   reconcile về một row. Mất row thì KHÔNG có gì bắt được. Đánh đổi có chủ ý — đừng "dọn".
#   (union là driver built-in của git: không ai cần chạy git config gì thêm.)
#
# text eol=lf — BẮT BUỘC đi kèm union, không phải cho đẹp. Thiếu nó: một máy ghi CRLF →
#   git thấy MỌI dòng đã đổi → union giữ cả hai bản → NHÂN ĐÔI CẢ FILE, gồm cả dòng header.
#   Team mixed Windows/macOS gặp ca này mà không ai làm gì sai.
*.tsv    text eol=lf merge=union
*.jsonl  text eol=lf merge=union
```

> **Vì sao đặt `.gitattributes` BÊN TRONG `{paths.trace_dir}` thay vì gốc repo:** `trace_dir` là
> đường dẫn **cấu hình được** (`.trace/`, `../.trace`, `{spec_source}/.trace/`), nên một luật ở gốc
> repo phải nhắc lại đúng đường dẫn đó và sẽ lệch ngay khi ai đổi config. Đặt trong thư mục thì
> pattern là `*.tsv` thuần — không phụ thuộc `trace_dir` tên gì, nằm ở đâu, và **đi theo sổ** khi
> spec repo được mount vào một umbrella khác. Git đọc `.gitattributes` ở mọi cấp thư mục.

> **KHÔNG thêm `*.json`.** `trace-report.json` có thể nằm cùng thư mục và union trên JSON tạo ra
> **JSON không hợp lệ** — panel VS Code parse lỗi. Nó là file **sinh lại được**: conflict ở đó thì
> chạy lại `/validate-traces`, đừng merge tay.

In vào report:
```
  ✅ {paths.trace_dir}/.gitattributes  (merge=union + eol=lf)
  (hoặc: ✅ vừa tạo — sổ trace giờ merge được khi hai người cùng ghi)
```

---

## Step 5 — Refresh Living Docs *(chỉ umbrella mode)*

*Skip nếu `services` rỗng.*

**Phân giải Living Docs home (cùng quy tắc như `/validate-traces`):**
- `living_docs_dir` = `{spec_source}/.living-docs` nếu `setup.spec_source` được set, else `.living-docs` ở umbrella root. *(Specs module được mount trong mọi service workspace, nên panel phân giải nó kể cả khi dev mở một service submodule đơn.)*
- `panel_mirror` = `./.trace-mirror` ở gốc workspace hiện tại. *(Cố ý KHÁC tên `.trace` — xem Step 4.)*

1. Với mỗi service trong danh sách **đã làm phẳng** ở Step 3 (gồm cả các submodule nằm dưới `by_prd_slug` — bỏ sót chúng là mất trace của các repo chia theo feature): nếu `{service.path}/.trace/` có file `.tsv` → copy chúng vào `{living_docs_dir}/{service-name}/` (tạo dir nếu cần).
2. Ghi merged `{living_docs_dir}/trace-report.json`:
   - Tổng hợp TSV `.trace/` của mỗi service, thêm field `"service"` **và `"platform"`** (suy từ tên file `{UC-ID}-{platform}.tsv`) cho mỗi row, tính lại summary totals. **Không dedupe theo `sc_id` giữa các platform** — `web·SC1` và `system·SC1` là 2 row khác nhau; nhờ field `platform` dashboard hiển thị tách bạch coverage từng platform.
3. **Mirror tới panel location:** copy `{living_docs_dir}/trace-report.json` (+ TSV namespaced) → `{panel_mirror}/` để panel trong repo đang mở không rỗng. Skip nếu `panel_mirror` đã bằng `living_docs_dir`, hoặc nếu `{paths.trace_dir}` đã nằm trong workspace hiện tại (panel đọc thẳng ở đó). **KHÔNG** copy `trace-history.jsonl` — nó là dữ liệu tích luỹ, không phải thứ sinh lại được.

In kết quả sync:
```
Living Docs → {living_docs_dir}/ synced  (canonical, specs module)
  {service-name}: {N} TSVs
  trace-report.json: {total} scenarios across {S} services
Panel mirror → {panel_mirror}/  (current workspace)
```

Nếu không tìm thấy dir `.trace/` → `Living Docs: no trace data yet — run /generate-bdd then /generate-code first.`

---

## Step 6 — Refresh Spec Manifest *(nếu có spec_source)*

*Skip nếu `setup.spec_source` vắng.*

Nếu `spec-manifest.yaml` tồn tại HOẶC `setup.spec_source` được cấu hình:
- Re-scan các file PRD `{spec_source}/specs/*/*/*.md` (file `.md` ở gốc mỗi feature folder = PRD; tech-docs/design-spec `.md` nằm sâu hơn nên không bị quét nhầm)
- Rebuild `spec-manifest.yaml` map TICKET-ID → path PRD/BDD/tech-doc
- In: `spec-manifest.yaml refreshed — {N} features indexed`

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/sync — {Setup | Update}

Git
  ✅ git pull             — umbrella on branch '{umbrella_branch}'
  ✅ submodule sync       — .gitmodules config refreshed

Submodules (each handled by its current state)
  ✅ {spec_source}    [spec]            — pulled branch '{spec_branch}' ({spec_branch_source}) → {new-sha}
  ✋ user-service     [active]          — on 'feature/FEAT-01' — left untouched, fetched (↓2 behind origin)
  ✅ order-service    [passive]         — aligned to umbrella pointer {sha}
  ⚠️ payment-service  [dirty]           — uncommitted changes, skipped (commit/stash first)

Umbrella state
  ⚠️ Pointer changed: git add {spec_source} && git commit -m "chore: sync specs"
  (or: ✅ Clean — no commit needed)

Spec đã đổi (pulled this sync)                       ← Step 1e-A
  📄 payment/create-invoice   PRD v1.2 → v1.4
                              changelog: UC2: sửa BR5; UC7 mới
                              bdd/web/PAY01-UC2.feature (bdd_version 1.3 → 1.4)
     user/create-account      tech-docs/USR01-tech-design.md (revision 3 → 4)
  (hoặc: 📄 Spec: không đổi trong lần pull này)
  (hoặc: ⓘ 34 file đổi (> 20) — đã bỏ phần so nhãn version cho nhanh)

Nợ audit đã tích (KHÔNG chỉ lần pull này)             ← Step 1e-B
  ⚠️ 3 PRD đã đổi kể từ lần /validate-traces gần nhất:
       payment/create-invoice   audit tại v1.2 · giờ v1.4
       user/create-account      audit tại v2.0 · giờ v2.1
       order/bulk-export        audit tại v1.0 · giờ v1.3
  (hoặc: ✅ Mọi PRD đã được audit ở version hiện tại)
  (hoặc: ⓘ Chưa có mốc audit — chạy /validate-traces một lần để có hiệu lực từ lần sau)

Tester feedback (pulled this sync)
  📥 1 bug report:  BUG-20260608-01 FT-001 [Code]
     1 proposal:    FT-001-trailing-spaces → AC2 (pending review)
  (or: 📥 none new this sync)
  → /fix-bug {BUG-ID} · promote proposal into BDD · or update PRD

Service Configs
  ✅ user-service    — test: mvn test  | build: mvn compile
  ✅ order-service   — test: mvn test  | build: mvn compile
  ⚠️ payment-service — .agent/project-context.yaml missing
                       → create it so /dev-run-test works correctly

Luật git cho sổ trace
  ✅ .trace-mirror/ + .living-docs/ gitignored   (mirror — sinh lại được)
  ✅ {paths.trace_dir}/ KHÔNG bị gitignore       (sổ gốc — phải commit)
  ✅ {paths.trace_dir}/.gitattributes            (merge=union + eol=lf — hai người ghi song song)
  (hoặc: ⚠️ Thêm .trace-mirror/ vào .gitignore)
  (hoặc: 🔴 NGUY HIỂM — sổ gốc {paths.trace_dir} đang bị gitignore, xem Step 4b)
  (hoặc: ✅ vừa tạo .gitattributes — trước đó merge song song sẽ conflict và mất row)

Living Docs
  ✅ {panel_mirror}/ synced — {N} TSVs across {S} services
     (chạy /validate-traces để có report coverage đầy đủ)

Spec Manifest
  ✅ spec-manifest.yaml — {N} features indexed

---
Status : ✅ Complete | ⚠️ Warnings
Output Artifacts: updated .trace-mirror/ (panel mirror), spec-manifest.yaml
                  (Step 1e chỉ ĐỌC — nó không bao giờ ghi spec_baseline; chủ sở hữu là /validate-traces Step 6b)
Next   : {phụ thuộc kết quả Step 1e — KHÔNG in một hằng số}
           • có PRD trong danh sách 1e-B → /validate-traces {các PRD đó}
           • 1e-B sạch, 1e-A có đổi      → /generate-code {UC-ID} cho phần vừa đổi
           • cả hai sạch                 → ✅ Spec khớp audit — không cần audit lại
```

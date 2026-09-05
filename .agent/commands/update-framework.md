# /update-framework — Cập nhật SDD Framework Framework

Nâng cấp **framework tooling** (`.agent/commands/`, `steps/`, `modules/`, `hooks/`, `rules/`, `templates/`, `skills/`) lên version mới nhất publish trên npm.

> **Không giống `/sync`.**
> - `/sync` → pull **nội dung dự án** (code/specs submodule) + làm mới Living Docs. Chạy hằng ngày.
> - `/update-framework` → nâng cấp **chính các file command của framework**. Chạy thỉnh thoảng, khi có version framework mới.

Lệnh này wrap `npx @educa-corp/sdd-framework@latest --init`. Cần network + npm access.

---

## Step 0 — Phát hiện trạng thái hiện tại

1. Đọc `.agent/FRAMEWORK_VERSION` → version đang cài.
   - Nếu thiếu → dự án này không được cài qua `--init`. Dừng:
     ```
     ❌ .agent/FRAMEWORK_VERSION not found.
        This project was not set up with the framework installer.
        Run: npx @educa-corp/sdd-framework --init
     ```

2. Đọc `.agent/project-context.yaml` → trích `setup.mode` (`umbrella` / vắng = single) và `services`.

3. Liệt kê `.agent/modules/` → ghi tên các module đã cài (phải truyền lại khi nâng cấp để chúng cũng update).

In:
```
Current framework : v{current}
Mode              : {umbrella | single-service}
Installed modules : {list or "none"}
```

---

## Step 1 — Kiểm tra version mới nhất

Chạy:
```bash
npm view @educa-corp/sdd-framework version
```

So `current` vs `latest`:

| Kết quả | Hành động |
|--------|--------|
| Network/registry không tới được | Cảnh báo `⚠️ Could not reach npm registry — check connection.` và dừng |
| `current == latest` | In `✅ Already up to date (v{current}). Nothing to do.` và dừng |
| `latest > current` | In `Update available: v{current} → v{latest}` và tiếp tục |

Hỏi: `Proceed with upgrade? (Y/N)` — chờ `Y`.

---

## Step 2 — Umbrella Awareness *(chỉ umbrella mode)*

Nếu `setup.mode == umbrella`, in note này trước khi nâng cấp:

```
ℹ️ Umbrella mode — framework tooling lives ONLY at this umbrella root.
   Service submodules contain just .agent/project-context.yaml (config), not
   command files — they read commands from the umbrella root. No per-service
   framework update is needed here.

   Exception: if a teammate opens Claude Code directly INSIDE a service repo
   (outside the umbrella), that repo has its own .agent/ — its owning team runs
   /update-framework there independently.
```

---

## Step 3 — Pre-flight Git Check

Chạy `git status --short .agent/ .claude/commands/`.

Nếu có thay đổi chưa commit trong các path đó:
```
⚠️ Uncommitted changes in .agent/ or .claude/commands/.
   The upgrade overwrites framework files. Commit or stash first so you can
   cleanly review the upgrade diff:
     git add .agent/ .claude/commands/ && git commit -m "wip"  (or git stash)
```
Hỏi có tiếp tục không `(Y/N)`. Mặc định dừng.

---

## Step 4 — Chạy nâng cấp

Dựng module flag từ Step 0 (một `--module {name}` cho mỗi module đã cài), rồi chạy:

```bash
npx -y @educa-corp/sdd-framework@latest --init {--module X ...}
```

Cái này **ghi đè** (làm mới về version mới):
- `.agent/commands/`, `.agent/steps/`, `.agent/hooks/`, `.agent/rules/`, `.agent/templates/`, `.agent/skills/`, `.agent/modules/{installed}/`
- `.agent/FRAMEWORK_VERSION`
- `.claude/commands/` shortcuts

Cái này **KHÔNG đụng tới** (nội dung của bạn an toàn):
- `.agent/project-context.yaml`
- `CLAUDE.md`
- `specs/domain-knowledge/` (business-dictionary, core-entities)
- `.trace/`

Nếu lệnh npx exit khác 0 → in lỗi và dừng với `❌`.

---

## Step 5 — Review Changes

Chạy:
```bash
git diff --stat .agent/ .claude/commands/
```

Tóm tắt cho người dùng:
- **New commands** — file `.md` giờ có mà trước không
- **Updated commands** — file có nội dung thay đổi
- **Removed commands** — file bị xoá trong version mới

> **Từ v0.5.1, "Removed" là trạng thái CÓ THẬT.** Trước đó `installCore` chỉ copy, không có
> nhánh xoá nào — nên lệnh bị bỏ ở version mới nằm lại trong `.agent/commands/` và
> `.claude/commands/` **vĩnh viễn**: vẫn hiện trong menu `/`, vẫn chạy được, vẫn mang logic
> của version cũ, kể cả khi framework đã bỏ nó *vì nó sai*. Step này từng hứa báo cáo một
> trạng thái mà installer không thể tạo ra (GAPS-v3 G44).
> Giờ installer tự in ra ngay sau bước cài — đọc các dòng đó, chúng chính xác hơn `git diff`:
> ```
> 🗑️  {n} file framework đã bị BỎ ở version này — đã gỡ khỏi .agent/
> 🗑️  {n} shortcut của lệnh đã bị bỏ — đã gỡ khỏi .claude/commands/
> ⚠️  {n} file framework đã bị bỏ NHƯNG bạn đã sửa — GIỮ LẠI
> ```
> **Chỉ file còn nguyên bản mới bị gỡ.** File bạn đã sửa luôn được giữ + backup — thà để lại
> một file lạc còn hơn xoá thứ ai đó đã bỏ công viết.

Nếu có command mới xuất hiện (vd một slash command mới), nêu rõ để user biết nó giờ đã có.

**Kiểm file bị ghi đè.** `--init` copy `core/` → `.agent/` **vô điều kiện** — mọi thứ project đã sửa trong `.agent/` (trừ `project-context.yaml`) bị ghi đè. Từ v0.4.2 lệnh cài tự cứu chúng. Kiểm:

```bash
ls -d .agent/.overwritten-*/ 2>/dev/null
```

Nếu có → nêu **nổi bật** trong report (đây là thứ dễ trôi nhất trong một diff nâng cấp lớn):
```
⚠️  {n} file bạn sửa trong .agent/ đã bị bản nâng cấp ghi đè.
    Bản cũ: .agent/.overwritten-{version}-{date}/
    Xem diff: diff -r .agent/.overwritten-{version}-{date}/ .agent/
    Sửa trực tiếp trong .agent/ KHÔNG bền — nó là mirror sinh ra. Muốn giữ thay đổi:
    chuyển vào repo framework rồi phát hành, hoặc đặt ở CLAUDE.md /
    .agent/project-context.yaml / .agent/project-lessons.md (ba chỗ không bị ghi đè).
    Xử lý xong thì xoá thư mục backup.
```

Nếu **không** có thư mục nào → không in gì. *(Ranh giới vùng-sửa-được đầy đủ: `.agent/README.md`.)*

---

## Step 5.5 — Kiểm bố cục spec cần migrate

*Chỉ quét, KHÔNG tự chuyển file — di chuyển spec là việc người dùng chốt.*

Một số version thay đổi **bố cục** spec, không chỉ nội dung command. Quét nhanh hai dạng cũ và in hướng dẫn nếu gặp:

| Phát hiện | Nghĩa | Lệnh migrate (dry-run trước) |
|---|---|---|
| Có file `.feature` **trực tiếp** dưới `{paths.specs_dir}/*/*/bdd/` (không trong subfolder platform) | Bố cục phẳng trước v0.4.1. `web`/`system` cùng UC va tên nhau; `/validate-traces` không thấy file; System BDD Synthesis luôn rơi về Backend-only. | `npx @educa-corp/sdd-framework --migrate-bdd-platform` → xem plan → thêm `--apply` |
| Có `{paths.specs_dir}/prd/` hoặc `{paths.specs_dir}/bdd/` ở cấp gốc | Bố cục artifact-type-first (rất cũ) | `npx @educa-corp/sdd-framework --migrate-specs` → `--apply` |
| Có `{paths.trace_dir}/*.tsv` phẳng (không có `{domain}/{prd-slug}/`) | Trace layout cũ | `--migrate-specs` (xử luôn) |

Nếu sạch cả ba → không in gì.

Sau migrate, nhắc chạy `/validate-traces` để reconcile sổ trace với bố cục mới.

---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/update-framework — v{current} → v{latest}

✅ Framework upgraded
   Updated : {N} command files, {M} step files
   New     : {list any new commands, e.g. /some-new-command}
   Removed : {list any removed commands, or "none"}

Your content was preserved:
   project-context.yaml, CLAUDE.md, domain-knowledge/, .trace/ — untouched

Review & commit:
   git diff .agent/
   git add .agent/ .claude/commands/
   git commit -m "chore: upgrade spec-driven-docs v{current} → v{latest}"
   {umbrella mode: this is the umbrella root — service submodules need no framework update}

---
Status : ✅ Complete | ⚠️ Warnings
Output Artifacts: refreshed .agent/ framework files, .claude/commands/ shortcuts
Next   : review git diff, then commit | /sync to refresh project content
```

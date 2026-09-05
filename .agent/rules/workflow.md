# Workflow Rules

> General AI behavior rules for all spec-driven-docs commands.
> Loaded by `steps/context-loader.md` at the start of every command.

---

## Checkpoints

Ba mức, định nghĩa đầy đủ ở `steps/gate.md` Bước 3a — **đây chỉ là bản tóm tắt, gate là nguồn**:

| Mức | Lệnh nào | `--yes` bỏ qua? |
|---|---|:---:|
| **Không chặn** | read-only (`/review-code` · `/validate-traces` · `/debug` · `/review-context` · `/review-tech-docs`) | — |
| **Chặn thường** | mọi lệnh sinh/sửa artifact | ✅ |
| **Chặn CỨNG** | ghi đè file đã có · `--resume` · migrate · prune | ❌ |

- CHECKPOINT phải nêu **target đã phân giải**, và **mọi cờ 🔴/⚠️ mà context-loader đã tính**
  (`active_service = unresolved`, `Status ≠ FULL`, CLAUDE.md thiếu, target resolve bằng wildcard).
- **KHÔNG lặp lại** những gì `[CTX LOADED]` vừa in ngay phía trên. Sạch hết thì CHECKPOINT
  chỉ hai dòng.
- `--yes` bỏ qua *chặn thường*, **không** bỏ qua *chặn cứng*, và **không** tắt việc in cờ.

> **Vì sao ba mức thay vì "always show" (G41):** bản cũ viết *"**Always** show a CHECKPOINT"*
> rồi ngay dòng sau lại cấp một ngoại lệ cho lệnh read-only — mà `gate.md` **không hề thực thi**
> ngoại lệ đó. Hai file cùng được nạp vào mọi lệnh và nói ngược nhau. Cộng thêm: cổng luôn in
> ra một bảng giống hệt nhau, 20 lần cho một feature, nên `Y` thành phản xạ và cổng hỏng **âm
> thầm** — vẫn hiện, vẫn được trả lời, chỉ là không ai đọc. Cổng chỉ ồn khi thật sự có chuyện
> thì mới được đọc.

## Scope Control

- Work only within the scope explicitly confirmed at CHECKPOINT.
- Do NOT create files outside the directories specified in `project-context.yaml → paths`.
- If new scope is discovered mid-command, STOP and ask: "I found additional scope [{description}]. Should I include it? (Y/N)"

## Trace Contract

> **Phạm vi:** mục này áp cho **repo framework**. Ở project consumer, `.agent/` là mirror sinh
> ra và `bin/` không được cài — contract ở đó là **read-only**: thấy lệch thì **báo**, đừng tự
> sửa (xem `.agent/README.md`). Việc duy nhất chạy được ở project là **kiểm sổ trace**:
> `npx @educa-corp/sdd-framework --lint-trace`.

- Contract trace (field `@trace.*`, cột `.tsv`, path pattern, giá trị enum) có **một
  nguồn-sự-thật máy đọc**: `bin/trace-schema.json`. Bản cho người đọc:
  `docs/04-reference/trace-schema.md` — giữ hai file đồng bộ.
- **Canh contract ≠ canh dữ liệu.** `bin/self-check.js` đọc **file lệnh** và kiểm *"lệnh có gọi
  đúng tên cột không"* — nó không bao giờ mở một `.tsv` thật. `bin/lint-trace.js` mở sổ thật.
  Cần cả hai: sổ 24 cột được ghi **bằng tay**, hàng chục lần mỗi feature; một dấu tab thiếu ở
  ô 17 dồn mọi ô sau đó sang trái, ô 21 `status` nhận một ngày tháng, và **không cờ nào bật**.
  Thêm cột/vocabulary mới → khai binding cho `lint-trace` **ngay**; R8 fail build nếu quên.
- Đổi contract (thêm/bỏ/đổi nghĩa một field, path, hay giá trị enum) → **sửa
  `bin/trace-schema.json` TRƯỚC**, rồi mới sửa lệnh. `npm run build` chạy
  `bin/self-check.js` và **fail** nếu lệnh lệch schema.
- Field có consumer mà **không có producer** là lỗi chặn build — đó chính là hình dạng
  của G1 (`@trace.sc_version`: 3 consumer, 0 producer, DRIFT chết mà không ai báo).
- **Làm mất hiệu lực ≠ ghi đè.** Cột trace có chủ sở hữu rõ ràng — `dev_selftest`/`dev_selftest_at`
  thuộc `/dev-run-test` · `qc_status`/`qc_run_at` thuộc `/qc-run-test` · `test_count`/`test_classes`
  thuộc `/dev-gen-test` — và **chỉ chủ được ghi giá trị KHẲNG ĐỊNH** (`pass`/`fail`/số lượng).
  Nhưng lệnh nào làm giá trị đó **HẾT ĐÚNG** (spec đổi, code đổi) thì **BẮT BUỘC** hạ nó về giá
  trị "chưa biết" (`not_run` / `—`). Giữ một `pass` đã hết hiệu lực là **báo cáo sai**, không phải
  tôn trọng quyền sở hữu.
  *Tiền lệ đúng có sẵn: `/fix-bug` hạ `dev_selftest → not_run` với lý do "code vừa đổi nên tín
  hiệu self-test cũ hết hiệu lực". Cùng lý do đó áp cho MỌI lệnh làm đổi spec hoặc code.*
  **Ngoại lệ có chủ ý:** `qc_owner`/`qc_blocked_by` (con trỏ tới bug — spec đổi không làm bug biến
  mất) và `test_count`/`test_classes` (test vẫn tồn tại trên đĩa; số lượng không sai, chỉ nội dung
  cũ → **cảnh báo**, không hạ số, để tỷ lệ coverage không nhảy loạn).
- **Sửa spec phải đi qua một lệnh.** Mọi drift detector so **nhãn version**, không so **nội dung**
  (0 content hash trong toàn bộ codebase) — nên một PRD/tech-doc bị sửa tay mà không bump version là
  điểm mù **tuyệt đối**: cả `/validate-traces`, `gate-trace`, và `require-fresh-audit` đều xanh, và
  cả ba **đúng theo định nghĩa của chính chúng**. Bốn cửa chính: `/generate-prd` (mới) ·
  `/extend-prd` (**thêm**) · **`/amend-prd`** (**đổi**) · `/refine-prd`/`/review-context --resume`
  (áp finding). `/validate-traces` Step 3.9 canh cửa sau bằng cờ 🔴 `PRD_UNTRACKED_EDIT`
  (`spec_edit_detection`: git diff **và** git status vs mốc `spec_baseline`).
  *Đường ra cố ý **tự lành**, không có `--accept-edit`: bump version + ghi row changelog nêu UC là
  hết cờ. Một cờ escape sẽ là một đường dán nhãn lên thay đổi chưa ai xem — đúng cái ba rào của
  `--realign` tồn tại để chặn.*
- **Làm mất hiệu lực có MỆNH ĐỀ ĐỐI NGẪU: ai KHẲNG ĐỊNH một giá trị dương phải được phép khẳng
  định.** Luật ngay trên nói *"ai làm giá trị hết đúng thì phải hạ nó"* — đúng, và được thực thi tốt.
  Nhưng thiếu nửa này thì chuỗi thành **hạ xuống → dựng lại**: `/generate-bdd` hạ
  `dev_selftest → not_run` khi spec đổi, rồi `/dev-run-test` (lệnh kế tiếp trong vòng lặp dev bình
  thường) ghi lại `pass` kèm **ngày hôm nay** vì test cũ + code cũ vẫn xanh.
  `pass` **không** mang nghĩa *"test đã chạy xanh"* — nó mang nghĩa *"scenario này đã được nghiệm thu
  theo spec **hiện tại**"*. Trên row `DRIFT` nghĩa thứ nhất đúng và nghĩa thứ hai **sai**. Nên `status`
  trực giao với **kết quả chạy**, **KHÔNG** trực giao với **quyền khẳng định**.
  Contract: `bin/trace-schema.json` → `positive_assertion_guards`; `self-check` **R14** canh chủ cột
  thực sự rẽ nhánh theo `status`, `lint-trace` **T12** bắt trạng thái ở sổ thật bất kể ai ghi.
  **`fail` không bao giờ bị chặn** — đây là guard chống *báo cáo sai*, không phải guard *che tin xấu*.
- **Dòng changelog là contract máy đọc, không phải ghi chú cho người đọc.** PRD và tech-doc gộp
  đều phủ nhiều UC nhưng chỉ có **một** nhãn version, nên `/validate-traces` Step 4/5 lọc 🟠 `*_DRIFT`
  vs ⓘ `*_STALE_REF` **bằng chính dòng đó**. Grammar khai ở `bin/trace-schema.json` →
  `changelog_row_contract`; `self-check` **R12** fail build nếu lệch. Ba luật:
  **(1)** mỗi mệnh đề mở đầu bằng **đơn vị sở hữu** — `{UC-ID}:` hoặc `PRD-global:`/`doc-global:`;
  **(2)** BR/AC **luôn đi kèm UC sở hữu** (`UC3: sửa BR8`), **không bao giờ đứng một mình** —
  consumer khớp theo UC, nên `sửa BR8` trơ trọi làm UC3 bị xếp ⓘ trong khi BR8 vừa đổi hành vi, và
  `--realign-prd-version` (chỉ chặn 🟠) sẽ dán nhãn version lại lên đó;
  **(3)** hậu tố `[no-behavior]` **chỉ** cho thay đổi mà producer **chứng minh được** là không đổi
  hành vi (`changelog_row_contract.neutral_checks`) — không dành cho người tự khai.
  *Lưới an toàn "row mơ hồ → 🟠 cho MỌI UC" đúng khi **thiếu** thông tin, và sai khi producer **có**
  thông tin mà không ghi: đó là G52 — `/review-context --fix` từng ghi cứng một dòng 0 scope trong
  khi findings YAML của nó có `uc_id` bắt buộc cho từng finding.*
- **Mỗi audit flag phải quan sát được ở CẢ BA tầng.** Mọi giá trị trong
  `vocabularies.audit_flags` bắt buộc có đủ: **(1)** một counter `{flag_lowercase}_count`
  trong Step 7 + `summary` của `trace-report.json` · **(2)** một mảng trong `issues` ·
  **(3)** một khối trong report terminal. Thiếu tầng nào = cờ vô hình ở tầng đó.
  `bin/self-check.js` R7 ép tầng (1) — **không có ngoại lệ**. Đây là hình dạng của G33:
  7/10 cờ có counter, 3 cái không, nên dashboard (chỉ đọc `summary`) không tổng hợp
  được — và bất đối xứng 7/10 là bẫy cho người viết dashboard: đọc `summary` rồi tưởng đủ.

## Code Generation

- Never generate code for files not backed by a `.feature` spec (unless `/fix-bug` or `/debug`).
- Always add `@trace.implements` tags on controller-level methods.
- Never overwrite existing business logic without explicit confirmation.
- Build must pass before committing: run `{conventions.build_command}` and fix errors (max 3 retries).

## File Operations

- Prefer **editing** existing files over replacing them entirely.
- When creating new files, check if a similar file already exists first.
- Never delete files unless explicitly instructed.

## Communication

- Report in the language the user writes in (Vietnamese if user uses Vietnamese, English otherwise).
- Keep reports structured: status, artifacts created, next recommended command.
- If unsure about business intent, ask — do not guess and generate wrong spec.

## Error Handling

- If a tool call fails (file not found, build error, etc.), report the specific error clearly.
- Do NOT silently skip errors or pretend success.
- Suggest a concrete fix, not just "please check the error".

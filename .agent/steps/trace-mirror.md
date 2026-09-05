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

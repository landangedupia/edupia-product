# QC Scope — phân giải phạm vi cho mọi lệnh `qc-*`

**Chạy TRƯỚC phần logic riêng của lệnh, và SAU `steps/gate.md`.** Bước này chốt bốn thứ mà
cả 6 trạm QC đều cần, để chúng không tự suy mỗi trạm một kiểu:

| Biến | Là gì |
|---|---|
| `TICKET-ID` | mã PRD — **thư mục artifact QC mang tên này** |
| `active_platform` | `web` \| `app` \| `system` \| … — một QC pass khoá đúng MỘT nền |
| `qc_artifact_dir` | `{paths.qc_dir}/{TICKET-ID}/{active_platform}/` |
| `uc_list` | các UC của (PRD × nền) này, kèm trạng thái BDD từng UC |

> **Vì sao gom về một chỗ.** Luật phân giải nền từng được copy-paste ở 5 lệnh và câu chữ đã
> lệch nhau. Năm bản của một luật là nơi drift sống: sửa bốn, quên một, và trạm bị quên ghi
> artifact vào sai thư mục **trong im lặng**.

---

## 1 — `TICKET-ID`

Artifact QC gom theo **PRD**, không theo UC. Nên mọi trạm phải quy được về `TICKET-ID`:

| `$ARGUMENTS` là | Cách lấy |
|---|---|
| **UC-ID** (`{TICKET-ID}-UC{N}`) | phần **trước** `-UC` — đúng luật `steps/gate.md` Bước 1 dùng để tìm tech-doc gộp |
| **TICKET-ID** | dùng trực tiếp |
| một **path file** (`.feature` / PRD / design-spec) | phân giải `{domain}` + `{prd-slug}` theo luật `context-loader` Bước 1, rồi lấy `TICKET-ID` từ tên file PRD `{TICKET-ID}-{prd-slug}.md` — file `.md` duy nhất ở gốc feature folder |

Đối chiếu: `TICKET-ID` suy ra phải khớp tên file PRD thật. Lệch → **DỪNG**, in cả hai giá
trị. (Suy sai `TICKET-ID` là ghi cả một PRD vào sai thư mục — không có bước nào phía sau bắt được.)

---

## 2 — `active_platform`

> **PHẢI phân giải TRƯỚC mọi phép đọc `.feature`.** `{UC-ID}-SC{N}` chỉ độc nhất trong
> (UC × nền), nên một UC đa nền có **nhiều file `.feature`** — `bdd/web/`, `bdd/app/`,
> `bdd/system/` — và mỗi file mang `@trace.status` **riêng**: bản web có thể `approved`
> trong khi bản app còn `draft`. Đọc "file `.feature` của UC" khi chưa biết nền là đọc một
> file **bất kỳ trong ba**: báo `approved` trong khi bản đang dùng còn nháp, hoặc chặn oan
> một bản đã duyệt.

Theo thứ tự, dừng ở cái đầu tiên khớp:

1. `$ARGUMENTS` nêu nền (`web`/`app`/`system`/…) → dùng.
2. Target là một file `.feature` → đọc `# @trace.platform` của nó.
3. Glob `{paths.specs_dir}/{domain}/{prd-slug}/bdd/*/` — **đúng một** thư mục nền → dùng nó.
4. Glob `{paths.qc_dir}/{TICKET-ID}/*/` — **đúng một** thư mục nền đã có artifact → dùng nó.
   *(chỉ dùng cho trạm 2–6; trạm `/qc-analyze` là trạm tạo ra thư mục đó nên không có gì để soi.)*
5. Nhiều nền mà không suy được → hỏi *"QC pass này cho nền nào? (web/app/system)"*.
   **Có `--yes`:** không hỏi — DỪNG với lỗi rõ ràng, vì đoán bừa nền là ghi artifact vào sai
   thư mục và ghi `qc_status` vào sai sổ trace:
   ```
   ❌ {TICKET-ID} có {n} nền ({list}) — không suy được nền nào cho QC pass này.
      Chạy headless thì phải nêu tường minh: /{lệnh} {TICKET-ID} web --yes
   ```

Lưu `active_platform`. Từ đây, **mọi** phép đọc `.feature` chỉ đọc thư mục
`bdd/{active_platform}/` — không trộn SC chéo nền.

---

## 3 — `qc_artifact_dir`

```
qc_artifact_dir = {paths.qc_dir}/{TICKET-ID}/{active_platform}/
```

Chứa: `REQUIREMENT_ANALYSIS.md` · `DOC_GAP.md` · `TEST_PLAN.md` · `test-cases/*.Test.md`
— **mỗi loại đúng MỘT file cho cả PRD**, các UC là mục/hàng bên trong.

`{paths.qc_dir}` là folder top-level **nhìn thấy** trong repo QC (mặc định `docs/`, **không**
phải `.agent/` ẩn) để đội QC mở và xử lý output dễ dàng. Spec chính thức ở lại spec submodule
của PO — đừng ghi artifact QC vào đó.

> **Sổ trace KHÔNG theo layout này.** Nó vẫn là `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{active_platform}.tsv`
> — một sổ cho mỗi (UC × nền), vì mỗi hàng là một scenario. Liên kết giữa hai bên đi qua
> **cột `UC`** của bảng gap, không qua đường dẫn file.

---

## 4 — `uc_list`

Glob `{paths.specs_dir}/{domain}/{prd-slug}/bdd/{active_platform}/*.feature`. Mỗi file → một
UC: đọc `# @trace.id` (mã UC) và `# @trace.status` từ header.

Chia hai nhóm:

| Nhóm | Điều kiện | Xử lý |
|---|---|---|
| **Trong phạm vi** | `@trace.status: approved` | phân tích / thiết kế / chạy bình thường |
| **Chưa xét** | khác `approved` | **KHÔNG** phân tích; vẫn ghi một hàng vào bảng phạm vi kèm trạng thái thật |

In bảng phạm vi ra trước khi làm gì:
```
Phạm vi QC — {TICKET-ID} / {active_platform}
  ✅ {UC-ID}  {tên UC}                     approved
  ⏸  {UC-ID}  {tên UC}                     draft   → chưa xét
  → {n} UC trong phạm vi · {m} chưa xét
```

**Cờ `--include-draft`:** phân tích cả UC chưa duyệt, nhưng **vẫn in bảng trên** và đánh dấu
trong artifact là dựa trên BDD nháp.

**Không UC nào `approved` và không có `--include-draft` → DỪNG:**
```
❌ {TICKET-ID} ({active_platform}): 0/{n} UC có BDD approved — không có gì để chạy.
   Cách đúng: người duyệt đặt `# @trace.status: approved` rồi chạy lại.
   Muốn chạy sớm trên BDD nháp (prototype): thêm --include-draft
```

> **Vì sao có `--include-draft` chứ không chặn cứng.** QC sớm trên BDD nháp là một cách dùng
> **cố ý được cho phép** từ trước (guard cũ là cảnh báo mềm, không phải chặn). Bỏ hẳn nó là
> lấy đi một năng lực đang có mà không ai khai. Còn để mặc định `approved`-only thì cái
> thường gặp là cái an toàn, và cái sớm phải nói ra.

> **Vì sao `--yes` không thay được `--include-draft`.** `--yes` nghĩa *"tôi không ngồi đây để
> trả lời"*; `--include-draft` nghĩa *"tôi biết BDD còn nháp và vẫn muốn chạy"*. Gộp hai cái
> là để một lần chạy headless âm thầm phân tích spec chưa chốt rồi bàn giao như thể đã chốt.

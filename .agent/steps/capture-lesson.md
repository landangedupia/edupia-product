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

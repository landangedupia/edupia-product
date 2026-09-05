# Business Language Guard — chặn thuật ngữ kỹ thuật rò vào tài liệu nghiệp vụ

Tài liệu nghiệp vụ (PRD, product-definition) mô tả **WHAT** — chỉ ngôn ngữ nghiệp vụ. Guard này chạy **mỗi khi viết hoặc sửa** prose (gen mới, áp fix `--resume`, hiệu chỉnh): **quét và xử lý** các thuật ngữ kỹ thuật/UI phổ thông bên dưới **trước khi ghi**.

> Guard này là **baseline framework**, chạy **song song** với Banned Terms của `business-dictionary.md` (cơ chế dictionary giữ nguyên; project vẫn bổ sung term đặc thù vào đó). Khi cả hai cùng áp, ưu tiên bản chuẩn của dictionary nếu có.

## Bản đồ xử lý (4 nhóm)

**Nhóm 1 — Tương tác/triển khai → DIỄN ĐẠT LẠI sang nghiệp vụ (giữ nguyên nghĩa):**

| Kỹ thuật/UI | Cách nói nghiệp vụ |
|---|---|
| re-render / render lại / reload / refresh (màn) | "hiển thị lại {tên màn}" |
| timeout | "quá thời gian chờ" |
| lỗi mạng / network error | "lỗi kết nối" |
| UI / giao diện (khi chỉ một màn) | "màn" / "màn hình" |
| click / tap | "bấm" / "chọn" |
| popup / modal (nếu chỉ là khái niệm hiển thị) | "hộp thoại" / "thông báo" |
| disable / enable (nút) | "khoá" / "mở" thao tác |
| redirect / navigate | "chuyển tới {màn}" |

**Nhóm 2 — Visual thuần → CHUYỂN Design Spec (bỏ khỏi PRD, ghi nhận lại):**
`spinner`, `loading indicator`, `animation`, `fade/slide`, màu sắc, font, layout pixel, micro-interaction → *"Chi tiết visual này thuộc Design Spec — ghi nhận để tạo Design Spec sau."*

**Nhóm 3 — Backend/contract thuần → BỎ khỏi PRD (thuộc Tech Docs):**
`API`, `endpoint`, `token/JWT`, `HTTP status`, tên class/bảng/cột DB, query, payload, header.
*(Ngoại lệ DUY NHẤT: Appendix "Existing API Contract" khi `API Source: existing` — xem Platform Strategy.)*

**Nhóm 4 — Ẩn dụ dữ liệu/cài đặt cho trạng thái nghiệp vụ → XÉT THEO NGHĨA (KHÔNG phải bảng thay thế):**

Các từ như `cờ / flag`, `biến / trường / field`, `giá trị / value`, `trả về / return`, `đọc / ghi (cờ)` **đa nghĩa** — kỹ thuật ở ngữ cảnh này, nghiệp vụ ở ngữ cảnh khác. **ĐỪNG thay máy móc.** Một từ chỉ là leak khi **cả hai** điều sau đúng:
1. Nó chỉ một **artifact lưu trữ/cơ chế** (cờ, biến, trường, giá trị-trả-về, đọc/ghi) đứng thay cho một **trạng thái/khái niệm nghiệp vụ**; VÀ
2. Khái niệm đó **đã có tên nghiệp vụ** (trong business-dictionary hoặc hiển nhiên).

→ Cả hai đúng: viết lại theo **tên nghiệp vụ**, ưu tiên term chuẩn trong business-dictionary.
→ Từ **tự nó là khái niệm nghiệp vụ**: **GIỮ NGUYÊN**.

| Reframe (là leak) | Giữ nguyên (nghiệp vụ thật) |
|---|---|
| "cờ tình trạng = chưa làm" → "con *chưa làm khảo sát*" (có term Tình trạng khảo sát) | "giá trị đơn hàng", "giá trị hợp đồng" |
| "cờ trả giá trị lạ" → "không đọc được tình trạng khảo sát" | "khách trả về sản phẩm" (hoàn hàng) |
| "đọc cờ thất bại" → "không xác định được tình trạng" | "trả kết quả học tập cho phụ huynh" |

**Neo an toàn:** lái theo business-dictionary — nếu đang diễn giải một khái niệm **đã có entry** thì dùng đúng term đó. Hỏi *"khái niệm này có tên nghiệp vụ chưa"*, KHÔNG hỏi *"từ này có bị cấm không"*.

**Luật code-format:** trong prose nghiệp vụ, **không bọc backtick/`code`** quanh giá trị/trạng thái nghiệp vụ (`chưa làm`, `đã nộp`) — code-format báo hiệu "token kỹ thuật". Dùng *nghiêng* hoặc "trong ngoặc kép". Backtick chỉ dành cho định danh code/kỹ thuật thật.

## Quy tắc áp dụng
- Quét toàn bộ text sắp ghi (User Story, AC, BR, Business Logic, Scope, Edge Cases, Assumptions…).
- Nhóm 1 → thay tại chỗ, giữ nguyên nghĩa nghiệp vụ. **Đồng bộ cách diễn đạt** với chỗ đã có sẵn trong cùng tài liệu (vd nếu "quá thời gian chờ" đã dùng ở một BR → dùng nhất quán ở mọi nơi).
- Nhóm 2 → gỡ khỏi prose nghiệp vụ + nhắc chuyển Design Spec.
- Nhóm 3 → gỡ khỏi PRD (trừ ngoại lệ brownfield).
- Nhóm 4 → **xét ngữ cảnh, KHÔNG thay máy móc**: chỉ reframe khi là ẩn dụ dữ liệu cho một khái niệm đã có tên nghiệp vụ (ưu tiên term dictionary); **giữ nguyên** khi từ mang nghĩa nghiệp vụ thật. Đồng thời bỏ backtick khỏi giá trị nghiệp vụ trong prose.
- Nếu term không có trong bản đồ nhưng rõ ràng là tên kỹ thuật/triển khai → vẫn diễn đạt lại theo tinh thần Nhóm 1, đừng để lọt.

**Checklist (dùng ở Quality Checklist của lệnh):** 0 thuật ngữ kỹ thuật/UI (re-render, UI, timeout, spinner, API/endpoint/token…) trong prose nghiệp vụ — đã diễn đạt lại (Nhóm 1) / chuyển Design Spec (Nhóm 2) / bỏ về Tech Docs (Nhóm 3); 0 ẩn dụ dữ liệu cho trạng thái đã có tên nghiệp vụ (cờ/giá trị/đọc-ghi khi là artifact — Nhóm 4) và 0 backtick bọc giá trị nghiệp vụ.

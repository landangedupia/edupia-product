# {TICKET}-{N} {Feature Name}

<!--
  Template này được sử dụng bởi workflow /generate-prd.
  AI Agent sẽ điền các section dựa trên input từ PO.
  Các placeholder {…} cần được thay thế bằng nội dung thực tế.

  FORMAT BR: MẶC ĐỊNH bảng 3 cột — ID | Business Rule | Business Logic
    (KHÔNG tách Business Logic ra khối riêng).
    NGOẠI LỆ — MỞ CỘT: nếu MỌI BR trong một UC chia sẻ cùng một bộ thuộc tính lặp lại
    (vd trigger / data / tần suất), promote các thuộc tính đó thành CỘT RIÊNG —
    một bản ghi = một DÒNG. Dấu hiệu tự phát hiện: đang phải dùng <br/> để nhồi
    NHIỀU HƠN MỘT bản ghi cùng cấu trúc vào một ô. Chi tiết + cảnh báo BR ID churn:
    xem §3 "Business Rule" của template và mục "Hình dạng bảng Business Rule" của lệnh.

  TERMINOLOGY:
  - Tuân thủ 100% từ điển project: specs/domain-knowledge/business-dictionary.md
    (KHÔNG dùng từ điển của project khác). Thay banned term bằng canonical term;
    nếu phát hiện banned term trong input PO → thay + ghi chú trong "Giả định AI".
  - Status/Enum values → tham chiếu core-entities.md (Enum Registry).

  CROSS-REFERENCE (BẮT BUỘC): Bất kỳ chỗ nào nhắc đến một tính năng/ticket khác
    (pre-condition, business rule, giả định, AC, hay bất kỳ section nào) → PHẢI gắn inline link:
      [TICKET-ID khác](../{prd-slug-khác}/{TICKET-ID-khác}-{prd-slug-khác}.md)
    Không để TICKET-ID dạng plain text nếu tồn tại file PRD tương ứng. (Mỗi PRD nằm trong feature-package riêng nên link trỏ sang folder anh em `../{prd-slug-khác}/`.)
    Ngoài ra, ghi rõ quan hệ phụ thuộc trong "Tài liệu tham khảo" ở Appendix.

  NEW TERM DETECTION: Nếu input PO xuất hiện thuật ngữ CHƯA CÓ trong business-dictionary.md
    và lặp lại ≥ 2 lần → DỪNG lại, hỏi PO confirm trước khi tiếp tục:
      + Thuật ngữ đó nghĩa gì trong ngữ cảnh hệ thống?
      + English term chuẩn nên dùng là gì?
      + Có cần bổ sung vào business-dictionary.md không?
    Sau khi PO confirm → cập nhật business-dictionary.md (nếu PO đồng ý) rồi mới tiếp tục.

  NUMBERING:
  - UC ID: {TICKET}-{N}-UC{n}  (n bắt đầu từ 1, tăng theo từng use case)
  - BR ID: {TICKET}-{N}-UC{n}-BR{m}  (m tăng LIÊN TỤC xuyên suốt PRD, KHÔNG reset mỗi UC)
-->

---

## Metadata

| Field         | Value                                    |
|---------------|------------------------------------------|
| **PRD ID**    | {TICKET}-{N}                             |
| **Version**   | 1.0                                      |
| **Status**    | draft                                    |
| **Author**    | AI-assisted                              |
| **PO**        | {tên PO}                                 |
| **Domain**    | {domain}                                 |
| **Created**   | {date}                                   |
| **Updated**   | {date}                                   |
| **Ticket**    | {TICKET}-{N}{ — nếu PO có link tracker thật, thêm bên cạnh: `{TICKET}-{N} ([Jira]({tracker_url}))`} |
| **API Source** | *(để trống nếu greenfield — chỉ điền `existing` khi PRD bọc một API đã chạy production)* |

---

# Feature

**{Feature Name}**

{Đoạn mô tả tổng quan: feature làm gì, cho ai, giải quyết vấn đề gì — lấy từ product-definition.}

---

# 1. Tổng quan

## a. User Story

- **Là một (As a)** {persona}
- **Tôi muốn (I want to)** {action}
- **Để (So that)** {benefit}

## b. Phạm vi

> **Scope = ranh giới, KHÔNG phải đặc tả.** Mỗi mục một dòng ngắn "làm gì / không làm gì". Đừng nhét **cơ chế** (retry/timeout/nhánh lỗi → BR/BL) hay **định nghĩa thuật ngữ** (vd "điểm khởi tạo = …" → Business Definition / business-dictionary) vào đây.

**In Scope**
- {hạng mục trong phạm vi 1}
- {hạng mục trong phạm vi 2}

**Out of Scope** *(chỉ thêm khi có ranh giới cần nói rõ)*
- {hạng mục ngoài phạm vi + lý do / chủ sở hữu}

## c. Phụ thuộc liên service *(mức nghiệp vụ — KHÔNG mô tả API/event/kỹ thuật)*

> Kế thừa từ Product Definition Phase 1 ("Phụ thuộc liên service"). Nếu contract do đối tác phát triển song song (xem `API Source`), ghi phụ thuộc partner vào đây.

- {Cần {dữ liệu/năng lực} từ {feature/team/partner} — vì {lý do nghiệp vụ}} — hoặc "Không có"

## d. Quy ước *(TUỲ CHỌN — chỉ thêm khi tài liệu có quy ước áp dụng xuyên suốt; nếu không có → XOÁ HẲN section này)*

> Khai báo **MỘT LẦN** các quy ước áp dụng cho **mọi BR** ở §3. BR **KHÔNG** lặp lại nội dung đã khai ở đây,
> AC §2 **trỏ tới** quy ước thay vì chép lại. Đây là nơi chứa định nghĩa dùng chung, giá trị mặc định,
> và cách đọc các cột của bảng BR — những thứ trước đây bị xé nhỏ và lặp trong từng dòng.
>
> Phân biệt với **§1b Phạm vi** (ranh giới làm/không làm) và **business-dictionary** (định nghĩa thuật ngữ
> cấp domain, dùng chung nhiều PRD): §1d chỉ chứa quy ước **cục bộ của tài liệu này**.

- **{Tên quy ước}**: {nội dung áp dụng cho mọi BR bên dưới}
- **{Giá trị mặc định dùng chung}**: {…}

---

# 2. Acceptance Criteria

> Mỗi AC kế thừa liên kết "Bắt nguồn từ BR" của Product Definition (Phase 6), remap sang BR ID của PRD. Vì BR ID đã chứa số UC nên ref BR truy ngược được tới đúng UC.
>
> **1 AC = 1 tiêu chí NGHIỆM THU (outcome quan sát/kiểm được) + ref BR.** KHÔNG viết cơ chế trong AC (số lần retry, timeout, tên/chủ cờ, nhánh lỗi chi tiết) — cái đó thuộc **BR/BL** ở §3, AC chỉ trỏ tới. Nếu tiêu chí có **nhiều nhánh** → tách **bullet con** (mỗi ý một dòng), đừng dồn thành câu dài. Khi `/refine-prd` làm rõ thêm: chi tiết cơ chế → đẩy sang BR/BL; ở tầng AC thì tách bullet/AC mới — KHÔNG nối mệnh đề vào câu cũ (tránh AC thành "đoạn văn" và trùng BR).

**AC1:** {Tiêu chí nghiệm thu, văn xuôi, kiểm chứng được.} _(BR: {TICKET}-{N}-UC{n}-BR{m})_

**AC2:** {Tiêu chí có nhiều nhánh — tách bullet:} _(BR: {TICKET}-{N}-UC{n}-BR{m})_
  - {nhánh/điều kiện 1 → kết quả kỳ vọng}
  - {nhánh/điều kiện 2 → kết quả kỳ vọng}

---

# 3. Use Case

#### {TICKET}-{N}-UC1: {Tên use case}

**Actor:** {actor}

**Description:** {mô tả luồng}

**Pre-condition:**
- {điều kiện trước 1}

**Post-condition:**
- {kết quả sau 1}

**AC liên quan:** AC{x}, AC{y}  *(các AC mà UC này thoả — phải đúng bằng tập AC có ref BR trỏ về UC này ở §2)*

**Business Rule**

> **Hình dạng bảng — mặc định 3 cột.** Dùng dạng này khi Business Logic là **văn xuôi** (mô tả luật bằng câu).

| ID | Business Rule | Business Logic |
|----|---------------|----------------|
| {TICKET}-{N}-UC1-BR1 | {luật ngắn gọn} | - {logic chi tiết, xuống dòng bằng `<br/>`}<br/>- {…} |
| {TICKET}-{N}-UC1-BR2 | {…} | - {…} |

<!--
  NGOẠI LỆ — MỞ CỘT (dùng THAY cho bảng 3 cột ở trên, KHÔNG dùng cả hai):

  Điều kiện kích hoạt: MỌI BR trong UC này chia sẻ CÙNG một bộ thuộc tính lặp lại.
  Dấu hiệu tự phát hiện: đang phải dùng <br/> để nhồi NHIỀU HƠN MỘT bản ghi cùng
  cấu trúc vào một ô Business Logic.

  Khi kích hoạt: promote thuộc tính thành CỘT, một bản ghi = một DÒNG:

    | ID  | Business Rule | {Thuộc tính 1} | {Thuộc tính 2} | {Thuộc tính 3} |
    |-----|---------------|----------------|----------------|----------------|
    | BR1 | {luật ngắn}   | {giá trị}      | {giá trị}      | {giá trị}      |
    | BR2 | {luật ngắn}   | {giá trị}      | {giá trị}      | {giá trị}      |

  Hai cột ID + Business Rule LUÔN giữ (traceability phụ thuộc chúng). Chỉ cột
  Business Logic được tách thành N cột. Giá trị dùng chung cho mọi dòng → đưa lên
  §1d Quy ước, ĐỪNG lặp trong từng ô.

  ⚠️ CẢNH BÁO BR ID CHURN — đọc trước khi mở cột trên PRD ĐÃ TỒN TẠI:
  Mở cột đúng nghĩa = một bản ghi một dòng ⇒ số BR TĂNG. Vì BR ID tăng liên tục
  trên toàn PRD, chèn dòng ở giữa sẽ ĐÁNH SỐ LẠI mọi BR phía sau. Nếu PRD này đã có
  BDD downstream, mọi tag `@trace.business_rules` trong .feature sẽ trỏ SAI trong im lặng.
  → Trước khi mở cột trên PRD đã có: kiểm tra `{specs_dir}/{domain}/{prd-slug}/bdd/`.
    - Chưa có BDD → mở cột tự do.
    - ĐÃ có BDD → DỪNG, báo người dùng: cần re-gen BDD sau khi đổi, hoặc giữ nguyên hình dạng cũ.
  PRD sinh MỚI không bị ảnh hưởng (chưa có downstream).
-->

> **Note {BR ref}:** *(TUỲ CHỌN)* {giải thích **quyết định đã chốt** — vì sao luật này như vậy, ràng buộc
> nào dẫn tới nó, biên nào đã cân nhắc}. Đặt ngay sau bảng, cạnh nơi phát sinh.
>
> **Ranh giới với "Giả định AI" (Appendix):** Note = quyết định **đã chốt**, giải thích cho người đọc sau.
> Giả định AI = **độ vênh CẦN PO chốt**. Note **KHÔNG** được nuốt Giả định AI — nghi ngờ thì để ở Giả định AI.

---

#### {TICKET}-{N}-UC2: {Tên use case}

{lặp cấu trúc UC như trên; BR đánh số tiếp tục BR3, BR4…}

---

# 4. UI/UX Guidelines

## a. User Flow

```mermaid
flowchart TD
    START(["{điểm bắt đầu}"]) --> A{"{điểm quyết định}"}
    A -->|{nhánh}| B["{bước}"]
```

## b. Wireframe

> **KHÔNG nhân bản §3.** Wireframe liệt kê **màn + thành phần + hành động** — nó là nguồn coverage màn hình
> cho `/generate-bdd` (C.1), KHÔNG phải bản sao thứ hai của bảng Business Rule.
> Nếu một dòng Wireframe không thêm thông tin nào ngoài BR đã có → **tham chiếu BR ID, đừng chép nội dung**.
> Nếu cả §4b không thêm gì mới so với §3 → **xoá hẳn §4b** (hai nguồn sự thật cho cùng một dữ liệu sẽ lệch nhau
> ngay lần sửa đầu tiên).

### Screen 1: {Tên màn}

| Thành phần | Chi tiết |
|------------|----------|
| **Screen** | {tên/ngữ cảnh màn} |
| **Components** | - {thành phần 1}<br/>- {thành phần 2} |
| **Actions** | - {hành động 1 → kết quả}<br/>- {hành động 2 → kết quả} |

---

### Screen 2: {Tên màn}

{lặp bảng như trên cho từng màn}

---

# Appendix

## Input gốc từ PO

> {Trích nguyên văn input/ghi chú gốc của PO + đường dẫn product-definition nguồn.}

## Tài liệu tham khảo

- [{TICKET liên quan}](../{prd-slug-khác}/{TICKET-ID-khác}-{prd-slug-khác}.md) — {quan hệ: pre-condition / overlapping / related…}
- BDD: [`./bdd/`](./bdd/)
- Design spec: [`./design-spec/`](./design-spec/) — không áp dụng với feature thuần backend (không có màn hình)
- Từ điển nghiệp vụ: [`specs/domain-knowledge/business-dictionary.md`](../../domain-knowledge/business-dictionary.md)
- Domain knowledge: [`specs/domain-knowledge/{domain}.md`](../../domain-knowledge/{domain}.md)

## Existing API Contract *(CHỈ brownfield — điền khi API Source = existing; greenfield BỎ QUA cả section này)*

<!--
  Chỉ dùng khi PRD bọc một API đã tồn tại trên hệ thống. PO ghi lại contract để:
  - /generate-bdd (system) dùng trực tiếp làm input — không cần tổng hợp từ FE/App BDD;
  - /generate-tech-docs chạy mode reverse-document (mô tả lại as-is, không design mới);
  - /review-tech-docs bỏ qua cổng T7 cross-team sign-off (contract đã cố định).
  Nếu greenfield (thiết kế mới) → xoá toàn bộ section này.
-->

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| {GET/POST/PUT/DELETE} | {/api/v1/path} | {Bearer / none} | `{ field: type }` | `{ field: type }` |

**Error responses:**

| HTTP Status | Error Code | Khi nào xảy ra |
|-------------|------------|----------------|
| {4xx/5xx} | {ERR_CODE} | {condition} |

## Giả định AI

> {Giả định / độ vênh AI phát hiện khi đối chiếu product-definition với domain-knowledge — cần PO review. AI KHÔNG tự hoà giải.}

- **Q1 — [AI DRAFT] {tiêu đề}:** {mô tả độ vênh + nguồn}. **Cần PO chốt {điều gì}.**

_(Nếu không có độ vênh: ghi "Không có — toàn bộ nội dung đã được PO xác nhận qua Product Definition.")_

---

# Change Log

> Hiện tại: **v1.0** ({date}) · Lịch sử đầy đủ → [changelog](./changelog/{TICKET}-{N}-{slug}.changelog.md) *(file kho chỉ tạo khi changelog vượt 5 version)*

<!-- Bảng phẳng, MỘT dòng/version, MỚI NHẤT TRÊN CÙNG. Chỉ giữ tối đa 5 version gần nhất ở đây;
     cũ hơn → /refine-prd & /review-context tự dồn (rollover) sang file changelog/ ở link trên. -->

| Version | Date | Changes (UC/AC/BR bị ảnh hưởng) |
|---------|------|---------------------------------|
| 1.0 | {date} | Bản đầu — sinh từ product-definition. |

---

<!--
  NEXT STEPS:
  Khi PRD được approve (status: approved), chạy:
  /generate-bdd "specs/{domain}/{prd-slug}/{TICKET-ID}-{prd-slug}.md"
  để sinh BDD feature specs từ PRD này.
-->

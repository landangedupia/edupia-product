# {TICKET-ID} Product Definition — {Feature Name}

<!--
  Template này được dùng bởi workflow /define-product.
  AI Agent điền từng section qua Q&A theo từng phase với PO.
  Output là input có cấu trúc cho /generate-prd.

  QUY TẮC:
  - Mỗi section tương ứng với 1 phase trong workflow
  - Section chưa đủ → giữ placeholder, KHÔNG được sang phase tiếp theo
  - Trạng thái xác nhận của PO được ghi trong mỗi section
-->

---

## Metadata

| Field              | Value                          |
|--------------------|--------------------------------|
| **Ticket**         | {TICKET-ID}                    |
| **Feature**        | {tên tính năng}                |
| **Domain**         | {domain}                       |
| **PO**             | {tên PO}                       |
| **Created**        | {YYYY-MM-DD}                   |
| **Status**         | in-progress / completed        |
| **Completed Phase**| {số phase hoàn thành gần nhất} |

---

## Phase 0: Đồng bộ tri thức (Knowledge Sync)

> ⚙️ AI tự thu thập — đây là **bối cảnh hệ thống**, KHÔNG phải yêu cầu nghiệp vụ do PO viết. Mục đích: chuẩn hoá thuật ngữ và nhận biết phần đã có để tái sử dụng. Không cần input từ PO.

### Khái niệm / dữ liệu nghiệp vụ liên quan
- {Khái niệm 1} — {mô tả ngắn}
- {Khái niệm 2} — {mô tả ngắn}

### Phần hệ thống / feature liên quan
- {Phần 1}
- {Phần 2}

### Rule / Logic có sẵn
- {Rule/logic từ các PRD có sẵn hoặc domain knowledge}

### Chuẩn hoá thuật ngữ
| Thuật ngữ trong input PO | Thuật ngữ chuẩn (business-dictionary) |
|--------------------------|---------------------------------------|
| {thuật ngữ gốc}          | {thuật ngữ chuẩn}                     |

---

## Phase 1: Định nghĩa tính năng (Feature Definition)

> ✅ PO xác nhận: {Có/Không}

### Bối cảnh (Context)
{Bối cảnh nghiệp vụ dẫn đến tính năng này}

### Tuyên bố vấn đề (Problem Statement)
{Vấn đề cần giải quyết}

### Mục tiêu (Goal)
{Mục tiêu của tính năng}

### Actor
| Actor    | Vai trò            | Chính/Phụ |
|----------|--------------------|-----------|
| {Actor}  | {mô tả vai trò}    | Primary   |

### Phạm vi (In Scope)
- {Chức năng 1}
- {Chức năng 2}

### Ngoài phạm vi (Out of Scope)
- {Hạng mục KHÔNG làm trong ticket này — kèm lý do / để dành pha sau}

### User Story
- **Là một (As a)** {vai trò}
- **Tôi muốn (I want to)** {mục tiêu}
- **Để (So that)** {giá trị nghiệp vụ}

### Phụ thuộc liên service *(mức nghiệp vụ)*

> Feature này cần **dữ liệu/năng lực** gì từ feature/team khác — KHÔNG mô tả API/event/callback (đó là kỹ thuật, thuộc Tech-docs).

- {Cần {dữ liệu/năng lực} từ {feature/team} — vì {lý do nghiệp vụ}} — hoặc "Không có"

---

## Phase 2: Định nghĩa User Flow

> ✅ PO xác nhận: {Có/Không}

### Điểm vào (Entry Point)
{Người dùng bắt đầu tương tác với tính năng như thế nào}

### Các bước của Flow
| Bước | Hành động       | Trạng thái/Kết quả nghiệp vụ | Ghi chú    |
|------|-----------------|------------------------------|------------|
| 1    | {hành động}     | {trạng thái/kết quả nghiệp vụ} | {ghi chú}  |
| 2    | {hành động}     | {trạng thái/kết quả nghiệp vụ} | {ghi chú}  |

### Màn hình & thành phần chính
> Mức nghiệp vụ — nguồn cho Wireframe PRD (§4b) và độ phủ BDD (C.1). KHÔNG pixel/layout/màu.

| Màn hình | Thành phần chính | Hành động → kết quả nghiệp vụ |
|----------|------------------|-------------------------------|
| {màn 1}  | {thành phần}     | {hành động → kết quả}         |

### Điểm ra (Exit Point)
{Kết quả cuối khi flow hoàn thành}

### Edge Cases / Luồng lỗi & ngoại lệ
> Các kịch bản thất bại nghiệp vụ ngoài happy path — input thiếu, điều kiện không thoả, thao tác đồng thời, phụ thuộc không sẵn sàng.
- {Kịch bản: khi {điều kiện bất thường} → {kết quả nghiệp vụ kỳ vọng}}

---

## Phase 3: Nhật ký làm rõ (Clarification Log)

> Ghi lại mọi câu hỏi và câu trả lời qua các vòng.

### Vòng {N}
| # | Nhóm     | Câu hỏi    | PO trả lời |
|---|----------|------------|------------|
| 1 | Context  | {câu hỏi}  | {trả lời}  |
| 2 | Flow     | {câu hỏi}  | {trả lời}  |
| 3 | Logic    | {câu hỏi}  | {trả lời}  |

### Mục chưa giải quyết
- {Mục chưa giải quyết — nếu còn tồn đọng, KHÔNG được sang Phase 4}

---

## Phase 4: Business Rules

> ✅ PO xác nhận: {Có/Không}

| Rule ID | Hành động/Trigger   | Quy tắc             | Điều kiện              |
|---------|---------------------|---------------------|------------------------|
| BR-1    | {hành động từ flow} | {business rule}     | {điều kiện áp dụng}    |
| BR-2    | {hành động từ flow} | {business rule}     | {điều kiện áp dụng}    |

---

## Phase 5: Business Logic

> ✅ PO xác nhận: {Có/Không}

| Rule ID | Logic nghiệp vụ (rẽ nhánh / công thức / điều kiện) | Thông báo/kết quả nghiệp vụ khi lỗi |
|---------|---------------------------------------------------|-------------------------------------|
| BR-1    | {logic nghiệp vụ khi rule kích hoạt}              | {vd: báo "Số dư không đủ"}           |
| BR-2    | {logic nghiệp vụ khi rule kích hoạt}              | {…}                                 |

---

## Phase 6: Acceptance Criteria

> ✅ PO xác nhận: {Có/Không}

| AC ID | Mô tả                  | Hành vi kỳ vọng           | Bắt nguồn từ |
|-------|------------------------|---------------------------|--------------|
| AC-1  | {mô tả tiêu chí}       | {hành vi kỳ vọng}         | BR-{N}       |
| AC-2  | {mô tả tiêu chí}       | {hành vi kỳ vọng}         | BR-{N}       |

---

## Phase 7: Báo cáo kiểm chứng (Validation Report)

### Ma trận độ phủ (Coverage Matrix)
| Hành động Flow | Có Rule? | Có Logic? | Có AC? | Status |
|----------------|----------|-----------|--------|--------|
| {Hành động 1}  | ✅/❌    | ✅/❌     | ✅/❌  | OK/GAP |

### Xung đột phát hiện
- {Mô tả xung đột — hoặc "None"}

### Mục còn thiếu
- {Rule/AC/logic còn thiếu — hoặc "None"}

---

<!--
  NEXT STEPS:
  Khi Product Definition hoàn tất (Status: completed), chạy:
  /generate-prd {path-to-this-file}
  để sinh PRD từ Product Definition này.
-->

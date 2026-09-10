# AICNew-03 AI Tutor 1-1 · Buổi học chính khoá (45 phút)

> ⚠️ **Trạng thái: Bản dựng cho Prototype/Khảo sát.** PRD này phục vụ việc dựng prototype/demo cho Concept 3.1 (Edupia AI Tutor 1-1), theo cùng mục đích với [AICNew-01](../../ai-class-core/big-class-plus/AICNew-01-big-class-plus.md) (Big Class Plus) trong khảo sát phụ huynh T9/2026. **CHƯA phải bản đã được xác nhận đầy đủ thông tin chính thức để bàn giao cho đội Dev triển khai sản xuất.** Khác với AICNew-01, PRD này được sinh **trực tiếp từ tài liệu concept** (chưa qua phiên khám phá trực tiếp với PO — xem [Product Definition](../../../../00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md)). ✅ **PO đã chốt trực tiếp 2026-09-10**: ánh xạ Level→Giáo viên AI (Level A = yếu/trung bình, Level B = khá/giỏi — xem BR1, Giả định AI Q1). Trước khi handoff dev chính thức, vẫn cần: (1) PO trả lời 6 edge case chưa có nguồn (Giả định AI Q5), (2) rà soát Business Logic BR6 (Mastery Model) với đội thuật toán (Giả định AI Q2), (3) PO/Designer xác nhận Wireframe suy diễn (Giả định AI Q4).

---

## Metadata

| Field         | Value                                    |
|---------------|--------------------------------------------|
| **PRD ID**    | AICNew-03                                |
| **Version**   | 1.1                                       |
| **Status**    | draft                                     |
| **Author**    | AI-assisted                               |
| **PO**        | Đặng Ngọc Lân                             |
| **Domain**    | ai-tutor                                  |
| **Created**   | 2026-09-10                                |
| **Updated**   | 2026-09-10                                |
| **Ticket**    | AICNew-03                                 |
| **API Source** |                                           |

---

# Feature

**AI Tutor 1-1 — Buổi học chính khoá (45 phút)**

Buổi học chính khoá 1-kèm-1 thật sự (không phải học nhóm) của Edupia AI Tutor 1-1 (Concept 3.1): 45 phút/buổi, 2 buổi/tuần, chia 3 phần — dạy nội dung bám khung chương trình (SGK Global Success), luyện nói cá nhân hoá 100% theo đúng lỗ hổng kiến thức (NLO) của từng học sinh qua Routing Engine, chấm phát âm theo âm vị, và cập nhật Mastery Profile theo thời gian thực.

*(Xem `00_context/glossary.md`, mục "AI Tutor" — phân biệt rõ với "AI Bổ trợ 30 phút" ([AICNew-02](../../ai-class-core/ai-bo-tro-30-phut/AICNew-02-ai-bo-tro-30-phut.md), thuộc Concept 1.2) và với "Edupia Tutor 1-1" (họ sản phẩm gia sư người thật, khác phân khúc) — ba tên gần giống nhau nhưng là ba sản phẩm/tính năng khác nhau.)*

---

# 1. Tổng quan

## a. User Story

- **Là một (As a)** phụ huynh có con học Edupia AI Tutor 1-1
- **Tôi muốn (I want to)** con được học 1-kèm-1 thật sự với giáo viên AI phù hợp trình độ, mỗi buổi đều luyện đúng chỗ con đang yếu thay vì lặp lại cái con đã biết
- **Để (So that)** con vá đúng lỗ hổng kiến thức của riêng mình, với chi phí chỉ bằng một phần nhỏ gia sư người thật

## b. Phạm vi

**In Scope**
- Buổi học chính khoá 1-1, 45 phút, 2 buổi/tuần, bám khung chương trình SGK Global Success
- Phần 1 (20'): dạy nội dung theo slide (video hoạt hình từ vựng + video hội thoại ngữ pháp) bởi Giáo viên AI
- Phần 2 (20'): hỏi đáp & sửa lỗi qua iSpeak — Routing Engine chọn câu hỏi luyện nói theo đúng NLO học sinh đang yếu nhất; chấm điểm phát âm theo âm vị, phản hồi ngay trong buổi
- Phần 3 (5'): phản hồi tổng kết + giao bài tập về nhà (ngay sau buổi)
- Cập nhật Mastery Profile của học sinh theo Mastery Model, thời gian thực sau mỗi tương tác ở Phần 2
- Ghép đúng Giáo viên AI theo trình độ đầu vào (Level) của học sinh cho mỗi buổi

**Out of Scope**
- **Buổi chuyên sâu** (buổi thứ 5, sau mỗi 4 buổi chính khoá) — tài liệu nguồn chưa mô tả cấu trúc nội dung, chỉ nhắc tên gọi. *("4+1" là nhịp học đã xác nhận ở Concept 3.1, nhưng nội dung cụ thể của buổi chuyên sâu cần một PRD/bổ sung riêng khi có đủ thông tin.)*
- **Xây dựng cơ chế Routing Engine / Mastery Model** (thuật toán chọn NLO ưu tiên, giá trị decay...) — thuộc nền tảng chung Adaptive Learning Ecosystem, PRD riêng. Feature này chỉ **tiêu thụ** kết quả Routing Engine và **ghi** tín hiệu theo Mastery Model, không thiết kế lại các cơ chế đó.
- **AI Practice, AI Speak (nhập vai tình huống), Edupia Club, GVCN** — 4 thành phần còn lại của Concept 3.1; mỗi thành phần một PRD riêng.
- **Xác định Level đầu vào ban đầu** (bài kiểm tra phân loại trình độ khi học sinh mới bắt đầu) — feature này chỉ tiêu thụ Level đã có sẵn để chọn Giáo viên AI tương ứng.
- Nội dung 1.473 NLO (NLO Taxonomy) — đã có sẵn
- Cấu trúc chi tiết và cách lưu trữ Mastery Profile xuyên suốt các thành phần — thuộc nền tảng chung
- Gamification chi tiết trong buổi học (huy hiệu, thử thách real-time) — tài liệu nguồn chỉ nhắc tên, chưa mô tả cơ chế; xem Giả định AI Q3 về các chi tiết UI từ bản concept cũ (có thể đã lỗi thời)

## c. Phụ thuộc liên service *(mức nghiệp vụ)*

- Cần **Mastery Profile / Adaptive Learning** (nền tảng chung) đã tồn tại để Routing Engine đọc và để feature này ghi tín hiệu cập nhật vào
- Cần **Routing Engine** (nền tảng chung, hiện ◆ Pending BOD theo `00_context/glossary.md`) trả về đúng 1-2 NLO ưu tiên cho Phần 2 mỗi buổi
- Cần **NLO Taxonomy** (1.473 đơn vị) đã có sẵn
- Cần dữ liệu **Level đầu vào** của học sinh (nguồn xác định Level — ngoài phạm vi PRD này) để chọn đúng Giáo viên AI
- Cần dịch vụ **Giáo viên AI** (giọng nói + hình ảnh nhân hoá theo Level, gồm giọng bản xứ Anh/Mỹ cho nhánh liên quan) và dịch vụ **chấm phát âm theo âm vị** đã sẵn sàng — năng lực kỹ thuật lõi, cần rà soát cùng đội kỹ thuật trước khi bàn giao dev chính thức

## d. Quy ước

> Khai báo một lần các định nghĩa/ngưỡng dùng chung cho nhiều Business Rule ở §3.

- **Cấu trúc buổi học chính khoá**: 45 phút chia đúng 3 phần theo mốc thời gian — Phần 1: phút 0-20 (dạy theo slide); Phần 2: phút 20-40 (luyện nói iSpeak, cá nhân hoá theo Routing Engine); Phần 3: phút 40-45 (phản hồi tổng kết + giao bài tập). Không áp dụng cho buổi chuyên sâu (ngoài phạm vi PRD này).
- ✅ **PO chốt 2026-09-10** — ánh xạ Level → Giáo viên AI (áp dụng BR1, AC1): **Level A = trình độ yếu/trung bình → giáo viên AI người Việt**; **Level B = trình độ khá/giỏi → 1 buổi giáo viên AI người Việt (ngữ pháp chuyên sâu) + 1 buổi giáo viên AI bản xứ Anh/Mỹ (luyện giao tiếp)** — khớp Slide 15 của tài liệu nguồn, không dùng cách đọc ngược ở Slide 8 (xem Giả định AI Q1). Thứ tự cụ thể buổi nào trong tuần dùng giáo viên bản xứ (với Level B) vẫn **chưa có nguồn** — không tự suy diễn thêm.
- ⛔ **Cần xác nhận kỹ thuật** — giá trị `decay` và cách quy đổi điểm chấm âm vị (0-100) thành "tín hiệu mới" trong công thức Mastery Model (áp dụng BR6): tài liệu nguồn chỉ cho dạng công thức tổng quát `mastery_mới = mastery_cũ × decay + tín hiệu mới`, không cho giá trị cụ thể.

---

# 2. Acceptance Criteria

**AC1:** Học sinh Level A vào buổi học → hệ thống ghép giáo viên AI người Việt; học sinh Level B vào buổi học → hệ thống ghép giáo viên AI người Việt hoặc bản xứ theo đúng lịch xen kẽ 1-1 mỗi tuần. _(BR: AICNew-03-UC1-BR1)_

**AC2:** Buổi học chạy đúng thứ tự và mốc thời gian 3 phần: Phần 1 (0-20') → Phần 2 (20-40') → Phần 3 (40-45'). _(BR: AICNew-03-UC1-BR2)_

**AC3:** Nội dung Phần 1 đúng tiến độ khung chương trình SGK Global Success đã lên cho buổi đó (video hoạt hình từ vựng + video hội thoại ngữ pháp). _(BR: AICNew-03-UC1-BR3)_

**AC4:** Đầu Phần 2 → hệ thống hiển thị câu hỏi luyện nói đúng 1-2 NLO ưu tiên cao nhất mà Routing Engine vừa chọn theo Mastery Profile hiện tại của học sinh. _(BR: AICNew-03-UC1-BR4)_

**AC5:** Học sinh nói câu trả lời ở Phần 2 → hệ thống trả điểm 0-100 cho từng âm và hiển thị ngay trong buổi, không trễ tới cuối buổi. _(BR: AICNew-03-UC1-BR5)_

**AC6:** Ngay sau mỗi lượt chấm ở Phần 2 → Mastery Profile của học sinh được cập nhật theo công thức Mastery Model, không chờ tới cuối buổi mới ghi. _(BR: AICNew-03-UC1-BR6)_

**AC7:** Cuối buổi (Phần 3) → Giáo viên AI đưa phản hồi tổng kết và giao bài tập về nhà đúng NLO vừa luyện ở Phần 2. _(BR: AICNew-03-UC1-BR7)_

---

# 3. Use Case

#### AICNew-03-UC1: Học sinh tham gia buổi học chính khoá AI Tutor 1-1

**Actor:** Học sinh, Giáo viên AI (phân theo Level đầu vào), Routing Engine (hệ thống nền)

**Description:** Học sinh tham gia một buổi học 1-1 thật sự (45 phút) với Giáo viên AI được ghép theo Level đầu vào; buổi học chia 3 phần — dạy theo chương trình, luyện nói cá nhân hoá theo NLO đang yếu nhất (qua Routing Engine) kèm chấm phát âm theo âm vị, và phản hồi tổng kết + giao bài tập cuối buổi. Mastery Profile được cập nhật real-time trong suốt Phần 2.

**Pre-condition:**
- Học sinh đã đăng ký AI Tutor 1-1, có lịch học 2 buổi/tuần
- Level đầu vào của học sinh đã được xác định từ trước (nguồn xác định: ngoài phạm vi PRD này)
- Mastery Profile của học sinh đã tồn tại từ nền tảng chung

**Post-condition:**
- Giáo viên AI đã được ghép đúng theo Level của học sinh cho buổi học đó
- Buổi học đã chạy đủ 3 phần theo đúng thứ tự và mốc thời gian
- Mastery Profile của học sinh đã được cập nhật real-time theo kết quả luyện nói ở Phần 2
- Bài tập về nhà tương ứng NLO vừa luyện đã được giao ở cuối buổi

**AC liên quan:** AC1, AC2, AC3, AC4, AC5, AC6, AC7

**Business Rule**

| ID | Business Rule | Business Logic |
|----|---------------|----------------|
| AICNew-03-UC1-BR1 | Hệ thống PHẢI ghép đúng Giáo viên AI theo Level đầu vào đã có sẵn của học sinh: Level A (yếu/trung bình) → giáo viên AI người Việt; Level B (khá/giỏi) → 1 buổi giáo viên AI người Việt + 1 buổi giáo viên AI bản xứ Anh/Mỹ mỗi tuần | - Đọc Level đầu vào của học sinh (nguồn ngoài phạm vi PRD này) → nếu Level A: khởi tạo giáo viên AI người Việt cho cả 2 buổi/tuần; nếu Level B: khởi tạo giáo viên AI người Việt cho 1 buổi và giáo viên AI bản xứ cho 1 buổi còn lại (thứ tự cụ thể buổi nào: xem §1d, chưa có nguồn) |
| AICNew-03-UC1-BR2 | Buổi học PHẢI chạy đúng thứ tự 3 phần: Phần 1 (20') → Phần 2 (20') → Phần 3 (5') | - Đếm mốc thời gian buổi học theo quy ước tại §1d: 0-20' = Phần 1, 20-40' = Phần 2, 40-45' = Phần 3 |
| AICNew-03-UC1-BR3 | Phần 1, Giáo viên AI PHẢI dạy nội dung bám khung chương trình SGK Global Success | - Phát nội dung Phần 1 (video hoạt hình từ vựng + video hội thoại ngữ pháp) theo đúng tiến độ chương trình đã lên — không cá nhân hoá thứ tự bài, giống mọi học sinh cùng tiến độ |
| AICNew-03-UC1-BR4 | Bắt đầu Phần 2, Routing Engine PHẢI chọn 1-2 NLO ưu tiên cao nhất hiện tại của học sinh làm nội dung câu hỏi luyện nói | - Gọi Routing Engine với input = Mastery Profile hiện tại của học sinh → nhận về 1-2 NLO ưu tiên → map NLO sang bộ câu hỏi luyện nói (iSpeak) tương ứng |
| AICNew-03-UC1-BR5 | Khi học sinh trả lời câu hỏi luyện nói (Phần 2), hệ thống PHẢI chấm điểm phát âm theo âm vị và phản hồi ngay trong buổi | - Học sinh nói câu trả lời → mô hình chấm phát âm phân tích theo từng âm vị trong câu → trả điểm thang 0-100 cho mỗi âm → tổng hợp hiển thị cho học sinh ngay |
| AICNew-03-UC1-BR6 | Sau mỗi lượt chấm ở Phần 2, hệ thống PHẢI cập nhật Mastery Profile của học sinh theo Mastery Model ngay lập tức | - Với mỗi âm/NLO vừa chấm: `mastery_mới = mastery_cũ × decay + tín hiệu mới` (giá trị `decay` và cách quy đổi điểm chấm âm vị thành "tín hiệu mới": xem §1d, cần đội kỹ thuật xác nhận) → ghi đè giá trị mastery mới cho đúng NLO đó trong Mastery Profile, không chờ tới cuối buổi |
| AICNew-03-UC1-BR7 | Phần 3, Giáo viên AI PHẢI đưa phản hồi tổng kết buổi và giao bài tập về nhà tương ứng NLO vừa luyện ở Phần 2 | - Tổng hợp danh sách NLO vừa luyện ở Phần 2 (kèm điểm) → Giáo viên AI sinh phản hồi tổng kết + đề xuất bài tập về nhà tương ứng đúng NLO đó |

> **Note BR1:** Tài liệu nguồn (slide Concept 3.1 bản "final") mâu thuẫn giữa Slide 8 và Slide 15 về việc Level A là trình độ cao hay thấp hơn Level B — nghi là phần dư sót lại từ phương án cũ (Level A/B/C/D) chưa dọn hết. **PO đã chốt trực tiếp 2026-09-10: Slide 15 đúng** (Level A = yếu/trung bình, Level B = khá/giỏi) — Slide 8 không dùng (xem Giả định AI Q1). Thứ tự cụ thể buổi nào trong tuần dùng giáo viên bản xứ (Level B) vẫn chưa có nguồn.
>
> **Note BR6:** Công thức Mastery Model (`mastery_mới = mastery_cũ × decay + tín hiệu mới`) là công thức duy nhất được cấp trong tài liệu nguồn (Slide 17, "Adaptive Learning Ecosystem — BOD Deck") — nó mô tả *dạng* mô hình, không phải giá trị `decay` cụ thể hay cách quy đổi điểm âm vị 0-100 thành "tín hiệu mới". Đây là chi tiết thuật toán thuộc nền tảng chung Adaptive Learning (ngoài phạm vi PRD này theo §1b), ghi lại ở đây vì BR6 cần tham chiếu tới nó.

---

# 4. UI/UX Guidelines

## a. User Flow

```mermaid
flowchart TD
    START(["Học sinh vào buổi học chính khoá"]) --> LEVEL{"Level đầu vào?"}
    LEVEL -->|"A (yếu/TB)"| TVN["Giáo viên AI người Việt (BR1)"]
    LEVEL -->|"B (khá/giỏi)"| TMIX["Giáo viên AI người Việt hoặc bản xứ, xen kẽ mỗi tuần (BR1)"]
    P1["Phần 1 (0-20'): dạy theo slide — bám chương trình SGK Global Success (BR3)"]
    TVN --> P1
    TMIX --> P1
    P1 --> ROUTE["Routing Engine chọn 1-2 NLO ưu tiên cao nhất (BR4)"]
    ROUTE --> SPEAK["Học sinh luyện nói (iSpeak) theo đúng NLO vừa chọn"]
    SPEAK --> SCORE["Chấm điểm phát âm theo âm vị, phản hồi ngay (BR5)"]
    SCORE --> MASTERY["Cập nhật Mastery Profile real-time (BR6)"]
    MASTERY --> LOOP{"Còn trong khung 20-40'?"}
    LOOP -->|Có| ROUTE
    LOOP -->|Hết giờ Phần 2| P3["Phần 3 (40-45'): phản hồi tổng kết + giao bài tập về nhà (BR7)"]
    P3 --> END(["Buổi học kết thúc"])
```

## b. Wireframe

> *(AI đề xuất — CHƯA có Wireframe/Figma thật cho AI Tutor 1-1, xem Giả định AI Q4.)*

### Screen 1: Màn hình buổi học 1-1 — Phần 1 (dạy theo slide)

| Thành phần | Chi tiết |
|------------|----------|
| **Screen** | Học sinh xem Giáo viên AI dạy nội dung theo slide |
| **Components** | - Video bài giảng (Giáo viên AI)<br/>- Khung 2 camera (Giáo viên AI + học sinh) |
| **Actions** | - Học sinh vào buổi → hệ thống ghép Giáo viên AI theo Level (BR1)<br/>- Hết 20 phút → chuyển Phần 2 (BR2) |

---

### Screen 2: Màn hình buổi học 1-1 — Phần 2 (luyện nói iSpeak)

| Thành phần | Chi tiết |
|------------|----------|
| **Screen** | Học sinh luyện nói theo câu hỏi Routing Engine vừa chọn, xem kết quả chấm phát âm |
| **Components** | - Câu hỏi luyện nói (theo NLO ưu tiên)<br/>- Icon mic<br/>- Kết quả chấm điểm theo âm vị |
| **Actions** | - Học sinh nói → hệ thống chấm điểm + phản hồi ngay (BR5)<br/>- Sau chấm → Mastery Profile cập nhật (BR6), lặp lại câu hỏi tiếp theo tới hết 20 phút |

---

### Screen 3: Màn hình tổng kết buổi học — Phần 3

| Thành phần | Chi tiết |
|------------|----------|
| **Screen** | Hiển thị trước khi kết thúc buổi |
| **Components** | - Phản hồi tổng kết của Giáo viên AI<br/>- Bài tập về nhà được giao |
| **Actions** | - Hiển thị phản hồi tổng kết theo kết quả Phần 2 (BR7)<br/>- Giao bài tập về nhà đúng NLO vừa luyện (BR7) |

---

# Appendix

## Input gốc từ PO

> Nguồn: [`00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md`](../../../../00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md) (Product Definition, tổng hợp từ tài liệu 2026-09-10 — **chưa qua phiên khám phá trực tiếp với PO**, khác với AICNew-01/AICNew-02). Nguồn gốc: `03_product/concepts/slide-content-concept-3.1-product-dev-2026-09-04-final.md` (Slide 8-10, 14-15, 17).

## Tài liệu tham khảo

- Product Definition: [`00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md`](../../../../00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md)
- Slide content Concept 3.1: [`03_product/concepts/slide-content-concept-3.1-product-dev-2026-09-04-final.md`](../../../../03_product/concepts/slide-content-concept-3.1-product-dev-2026-09-04-final.md)
- Meeting note (nguồn tham khảo lịch sử — trước bản final, xem Giả định AI Q3): [`00_context/meeting-notes/2026-08-28-review-slide-concept-sale.md`](../../../../00_context/meeting-notes/2026-08-28-review-slide-concept-sale.md)
- Thành phần liên quan cùng nền tảng: [AICNew-01](../../ai-class-core/big-class-plus/AICNew-01-big-class-plus.md) (Big Class Plus, Concept 1.2) — tham khảo cách xử lý Routing Engine/Mastery Profile ở feature tương tự
- BDD: [`./bdd/`](./bdd/)
- Design spec: [`./design-spec/`](./design-spec/)
- Từ điển nghiệp vụ: [`00_context/glossary.md`](../../../../00_context/glossary.md)

## Giả định AI

- **Q1 — ✅ ĐÃ CHỐT 2026-09-10 (PO trả lời trực tiếp) — Xung đột ánh xạ Level → Giáo viên AI (§1d, BR1/AC1):** Slide 8 của tài liệu nguồn ghi "Level B/C/D học giáo viên AI người Việt; Level A học thêm 1 buổi giáo viên AI bản xứ" (Level A = trình độ cao hơn). Slide 15 ghi ngược lại: "Level A (yếu/trung bình): giáo viên AI người Việt; Level B (khá/giỏi): 1 buổi người Việt + 1 buổi bản xứ" (Level A = trình độ thấp hơn). Đây là mâu thuẫn thật trong chính tài liệu "final", nghi là phần dư sót lại từ phương án cũ (Level A/B/C/D, đã bị thay thế 2026-09-03). **PO xác nhận: Slide 15 đúng — Level A = yếu/trung bình, Level B = khá/giỏi.** Slide 8 không dùng. Còn lại một câu hỏi phụ chưa trả lời: thứ tự cụ thể buổi nào trong tuần (buổi 1 hay buổi 2) dùng giáo viên bản xứ cho Level B — chưa có nguồn, không ảnh hưởng nghiêm trọng tới BR1 vì không đổi bản chất ánh xạ.
- **Q2 — [AI DRAFT] Giá trị `decay` và cách quy đổi điểm âm vị thành tín hiệu Mastery Model (§1d, BR6):** tài liệu nguồn chỉ cho công thức dạng tổng quát `mastery_mới = mastery_cũ × decay + tín hiệu mới`, không có giá trị cụ thể. **Cần đội thuật toán/kỹ thuật xác nhận trước khi PRD được duyệt chính thức.**
- **Q3 — [AI DRAFT] Chi tiết UI/gamification từ meeting note 2026-08-28 có còn hiệu lực không:** meeting note (trước bản slide "final") mô tả giao diện "Cam học sinh, bảng tương tác thông minh, khung chat", cơ chế AI kiểm soát mic học sinh để sửa lỗi trực tiếp, và gamification (Bắn cung, Đào vàng, Chém hoa quả, Đua xe...) — nhưng đây là mô tả của bản concept **trước** khi Level A/B/C/D bị thay thế bằng Level A/B. PRD này **không** đưa các chi tiết đó vào Business Rule chính thức. **Cần PO xác nhận các chi tiết này còn áp dụng cho Concept 3.1 bản final hay đã bị bỏ.**
- **Q4 — [AI DRAFT] Wireframe (§4b) hoàn toàn do AI suy diễn, chưa có Figma/thiết kế thật cho AI Tutor 1-1** (khác với AICNew-01 đã có 2 Figma frame thật). **Cần PO/Designer cung cấp thiết kế thật hoặc xác nhận hướng suy diễn trước khi Designer bắt đầu Design Spec chính thức.**
- **Q5 — [AI DRAFT] 6 edge case chưa có nguồn xử lý** (vào trễ, mất kết nối, mic lỗi ở Phần 2, Level chưa xác định, buổi chuyên sâu có bị lùi lịch khi nghỉ buổi chính khoá, Routing Engine lỗi/timeout) — liệt kê đầy đủ tại Product Definition, Phase 2. **Cần PO trả lời trước khi bổ sung Business Rule tương ứng — PRD hiện KHÔNG có Business Rule cho các case này (khác với AICNew-01, nơi các case tương tự đã có câu trả lời PO xác nhận).**
- **Q6 — [AI DRAFT] Cấu trúc buổi chuyên sâu (buổi thứ 5, sau mỗi 4 buổi chính khoá):** tài liệu nguồn chỉ nhắc tên gọi, chưa mô tả nội dung/cấu trúc. **Cần PO bổ sung tài liệu nguồn hoặc xác nhận phạm vi này sẽ có PRD riêng.**

---

# Change Log

> Hiện tại: **v1.1** (2026-09-10)

| Version | Date | Changes (UC/AC/BR bị ảnh hưởng) |
|---------|------|---------------------------------|
| 1.1 | 2026-09-10 | PO chốt trực tiếp ánh xạ Level→Giáo viên AI (Level A = yếu/trung bình, Level B = khá/giỏi): cập nhật BR1, AC1, §1d, User Flow, Giả định AI Q1 (đánh dấu đã giải quyết). Còn lại Q2-Q6 vẫn mở. |
| 1.0 | 2026-09-10 | Bản đầu — sinh từ Product Definition (tổng hợp tài liệu, chưa qua phiên khám phá trực tiếp với PO). Phục vụ dựng prototype/demo — **chưa chốt chính thức để bàn giao dev** (xem banner đầu tài liệu và Giả định AI Q1-Q6). |

---

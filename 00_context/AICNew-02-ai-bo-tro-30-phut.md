# AICNew-02 Product Definition — AI Bổ trợ 30 phút

---

## Metadata

| Field              | Value                          |
|--------------------|--------------------------------|
| **Ticket**         | AICNew-02                      |
| **Feature**        | AI Bổ trợ 30 phút (tên tạm — chưa chốt tên chính thức bán hàng) |
| **Domain**         | ai-class-core                  |
| **PO**             | Đặng Ngọc Lân                   |
| **Created**        | 2026-09-08                     |
| **Status**         | completed                      |
| **Completed Phase**| 7                               |

> ⚠️ **Lưu ý phân biệt thuật ngữ (quan trọng):** "AI Bổ trợ 30 phút" ở đây là thành phần thuộc **Concept 1.2 (Big Class Plus)**, chạy ngay sau mỗi buổi Big Class Plus. Đây **KHÔNG** phải "**AI Tutor**" — tên đó đã được xác nhận dành riêng cho sản phẩm gia sư AI 1:1 độc lập của **Concept 3.1** (45 phút, trả phí riêng, không gắn sau buổi nào). Glossary (`00_context/glossary.md`) đã được cập nhật 2026-09-08 để phản ánh đúng 2 khái niệm này.

---

## Phase 0: Đồng bộ tri thức (Knowledge Sync)

> ⚙️ AI tự thu thập — bối cảnh hệ thống, không phải yêu cầu nghiệp vụ do PO viết.

### Khái niệm / dữ liệu nghiệp vụ liên quan
- **NLO** (Nano Learning Objective) — đơn vị kiến thức nhỏ nhất, glossary Confirmed.
- **Adaptive Learning** (Gap Detection + điều hướng nội dung) — glossary Confirmed, "đã thiết kế, chưa triển khai đại trà".
- **Mastery Profile / Mastery Map** — glossary, ◆ Pending BOD.
- **Routing Engine** — công thức `priority = ppct_weight × (1−mastery) × prereq_boost`; nguồn slide Concept 3.1 "Adaptive Learning Ecosystem — BOD Deck"; mới bổ sung vào glossary 2026-09-08.
- **Mastery decay** — công thức `mastery_mới = mastery_cũ × decay + tín hiệu mới`, cập nhật real-time sau mỗi tương tác.
- **BTVN Adaptive** — cơ chế giao bài cá nhân hoá (Staircase Difficulty, trộn NLO 40% yếu/40% mới/20% ôn), thuộc module Edupia Practice; mới bổ sung vào glossary 2026-09-08.
- **AICNew-01 Big Class Plus** — nguồn phát tín hiệu Gap Detection mà feature này tiêu thụ.
- **GV Star / AI Voice / Trợ giảng AI** — các vai trò AI đã phân biệt rõ trong glossary (entry "GV Star"), Trợ giảng AI là vai trò được kế thừa/mở rộng ở feature này.
- **AI Tutor** (Concept 3.1) — sản phẩm độc lập, KHÔNG thuộc phạm vi feature này.

### Phần hệ thống / feature liên quan
- AICNew-01 Big Class Plus (input — Gap Detection, trình tự bắt buộc trước)
- BTVN Adaptive / AI Practice (output — nhận bàn giao NLO ưu tiên)
- Parent Mode / Mastery Map (đọc dữ liệu do feature này ghi ra — ngoài phạm vi)
- Nền tảng chung Mastery Profile / Gap Detection / Routing Engine — "PRD Adaptive Learning" (chưa tồn tại, sẽ viết sau và tham khảo ngược lại tài liệu này)

### Rule / Logic có sẵn (từ AICNew-01, phải tôn trọng)
- Gap Detection cuối buổi Big Class Plus chỉ ghi NLO "chưa đạt", cộng dồn, không ghi đè lịch sử.
- BR13 (AICNew-01): học sinh chưa có Mastery Profile khởi tạo → vẫn học nhưng không ghi được Gap Detection, đánh dấu "Mastery Profile chưa khởi tạo" trong report buổi học.
- Slide Concept 1.2 (final 04/09) đã **quyết định** (không phải giả định): AI Bổ trợ 30 phút chạy mặc định cho mọi học sinh; rẽ 2 nhánh Khá giỏi/Trung bình-yếu theo Mastery Profile.

### Chuẩn hoá thuật ngữ

| Thuật ngữ trong input PO | Thuật ngữ chuẩn (business-dictionary) | Trạng thái |
|---|---|---|
| AI Bổ trợ 30 phút | Mới — đã thêm vào glossary 2026-09-08, đánh dấu ◆ tên tạm | ✅ PO xác nhận |
| AI Tutor | Đã có trong glossary — mô tả cũ bị lệch, đã sửa lại 2026-09-08 để chỉ nói về Concept 3.1 | ✅ PO xác nhận |
| Mastery Profile / Mastery Map | = glossary hiện có (◆ Pending BOD), không đổi | ✅ PO xác nhận |
| NLO | = glossary hiện có (Confirmed), không đổi | ✅ PO xác nhận |
| Gap Detection | thuộc "Adaptive Learning" (glossary Confirmed), không đổi | ✅ PO xác nhận |
| Routing Engine | Mới — đã thêm vào glossary 2026-09-08, ◆ Pending BOD (chưa có PRD chính thức) | ✅ PO xác nhận |
| BTVN Adaptive | Mới — đã thêm vào glossary 2026-09-08, cross-ref Edupia Practice | ✅ PO xác nhận |

---

## Phase 1: Định nghĩa tính năng (Feature Definition)

> ✅ PO xác nhận: Có

### Bối cảnh (Context)
Đề xuất từ chị Trang (GĐ trung tâm telesale) tại meeting Sale/Marketing 28/08/2026 (`00_context/meeting-notes/2026-08-28-review-slide-concept-sale.md`), sau đó được chốt vào slide Concept 1.2 bản final 04/09/2026 như một thành phần **mặc định** của gói Big Class Plus (không phải tuỳ chọn kích hoạt có điều kiện như bản slide trước đó).

### Tuyên bố vấn đề (Problem Statement)
Sau khi kết thúc buổi Big Class Plus, lỗ hổng NLO vừa phát hiện trong buổi (Gap Detection) không được xử lý ngay — học sinh nhóm trung bình/yếu về nhà tự làm BTVN mà không ai kèm, lỗ hổng có nguy cơ chồng chất qua các buổi tiếp theo, dẫn tới tình huống "không hiểu bài, không biết hỏi ai, bỏ cuộc". Đồng thời, học sinh nhóm khá/giỏi không có gì để học thêm/mở rộng ngay sau buổi dù đã sẵn sàng, gây lãng phí thời gian và giảm động lực học vượt.

### Mục tiêu (Goal)
Mọi học sinh, sau mỗi buổi Big Class Plus, đều được xử lý đúng nhu cầu cá nhân ngay trong 30 phút kế tiếp: học sinh có lỗ hổng NLO thì lỗ hổng được vá ngay trong ngày thay vì tồn đọng sang buổi sau; học sinh đã vững kiến thức thì được học mở rộng. Về lâu dài, phụ huynh nhìn thấy Mastery Profile của con cải thiện đều đặn sau mỗi buổi.

### Actor
| Actor    | Vai trò            | Chính/Phụ |
|----------|--------------------|-----------|
| Học sinh | Trực tiếp tham gia buổi AI Bổ trợ 30 phút, tương tác với nội dung/câu hỏi | Primary |
| Phụ huynh | Xem kết quả gián tiếp qua Parent Mode/Mastery Map (không thao tác trong buổi) | Secondary |
| GVCN | Theo dõi tiến độ, có thể can thiệp nếu một NLO tái diễn "chưa đạt" nhiều lần | Secondary |
| Trợ giảng AI | Tổng kết cuối buổi, giao BTVN Adaptive — vai trò kế thừa từ Big Class Plus | Secondary (actor hệ thống) |

### Phạm vi (In Scope)
- Tự động chạy ngay sau khi buổi Big Class Plus kết thúc, cho mọi học sinh (không cần điều kiện kích hoạt).
- Đọc Mastery Profile (mastery tổng hợp toàn môn, đa buổi) để xác định chân dung Khá giỏi / Trung bình-yếu.
- Xử lý trường hợp buổi đầu/chưa đủ dữ liệu: chạy thẳng nội dung Nâng cao/mở rộng (không có nhánh Củng cố riêng khi không có gap cụ thể).
- Rẽ nhánh nội dung: Khá giỏi → nâng cao/mở rộng; Trung bình/yếu → vá đúng NLO "chưa đạt" vừa phát hiện ở buổi liền trước.
- Khi có nhiều NLO gap hơn thời lượng cho phép: ưu tiên top NLO (Routing Engine), phần còn lại chuyển sang buổi kế tiếp + BTVN Adaptive.
- Tự động chuyển từ Củng cố sang Nâng cao khi học sinh xử lý hết NLO gap trước khi hết giờ.
- Hiển thị tóm tắt kết quả buổi Big Class Plus vừa học + mục tiêu buổi bổ trợ trước khi vào nội dung tương tác.
- Cho phép thoát/quay lại giữa buổi, tiếp tục đúng vị trí, không cộng dồn thời gian đã thoát vào 30 phút.
- Trợ giảng AI tổng kết cuối buổi + giao BTVN Adaptive tương ứng đúng NLO vừa xử lý.
- Ghi kết quả tương tác vào Mastery Profile theo thời gian thực (ngay sau mỗi tương tác, không chờ cuối buổi).

### Ngoài phạm vi (Out of Scope)
- Định nghĩa cấu trúc/schema chi tiết Mastery Profile — thuộc nền tảng chung, ◆ Pending BOD.
- Cơ chế/thuật toán Routing Engine chọn NLO ưu tiên — thuộc nền tảng chung Adaptive Learning.
- Nội dung NLO Taxonomy (danh mục 1.473 NLO) — thuộc tài liệu taxonomy riêng.
- Sửa đổi PRD AICNew-01 Big Class Plus (điểm danh, AI Voice, gán NLO cuối buổi).
- Concept 3.1 "AI Tutor" (gia sư AI 1:1 độc lập, 45 phút, trả phí riêng) — sản phẩm khác.
- Hiển thị/thông báo kết quả cho phụ huynh (Parent Mode/Mastery Map) — thuộc PRD Parent Mode riêng.
- Nội dung bài tập cụ thể của BTVN Adaptive/AI Practice — feature này chỉ giao đúng NLO ưu tiên.
- Chấm phát âm/luyện nói chi tiết — thuộc AI Speak.
- Cơ chế khởi tạo Mastery Profile lần đầu cho học sinh mới — **sẽ được định nghĩa trong PRD Adaptive Learning** (xác nhận của PO, không phải khoảng trống bỏ ngỏ).

### User Story
- **Là một (As a)** học sinh vừa hoàn thành buổi Big Class Plus
- **Tôi muốn (I want to)** được học bổ trợ 30 phút đúng với năng lực hiện tại của mình — vá đúng lỗ hổng nếu chưa vững, học nâng cao nếu đã vững — thay vì chương trình giống nhau cho mọi người
- **Để (So that)** không bị bỏ lại phía sau vì "không hiểu bài mà không ai giúp" (nhóm yếu), đồng thời không lãng phí thời gian/mất động lực (nhóm giỏi)

### Phụ thuộc liên service *(mức nghiệp vụ)*

| Phụ thuộc | Từ đâu | Tình trạng sẵn sàng |
|---|---|---|
| Đọc Mastery Profile (mastery tổng hợp toàn môn, đa buổi) | Nền tảng Adaptive Learning | ⚠️ Chưa có PRD chính thức (◆ Pending BOD) |
| Tín hiệu Gap Detection (NLO "chưa đạt") vừa ghi cuối buổi | AICNew-01 Big Class Plus | ✅ Có PRD (draft) — nhưng buổi Big Class Plus phải hoàn tất và ghi xong trước |
| Cơ chế chọn NLO ưu tiên (Routing Engine) | Nền tảng Adaptive Learning | ⚠️ Chưa có PRD chính thức — sẽ nằm trong PRD Adaptive Learning tương lai |
| Nhận bàn giao NLO ưu tiên để giao bài | BTVN Adaptive / AI Practice | ⚠️ Chưa xác nhận thành phần đó đã có PRD/khả năng nhận đúng format |
| Vai trò Trợ giảng AI tổng kết cuối buổi | Đã định hình ở AICNew-01 | ✅ Có sẵn, có thể cần mở rộng logic |

**Quyết định của PO (2026-09-08):** feature này viết PRD độc lập, không chờ PRD Adaptive Learning hoàn tất trước. PRD Adaptive Learning (viết sau) sẽ tham khảo ngược lại thông tin từ PRD này.

---

## Phase 2: Định nghĩa User Flow

> ✅ PO xác nhận: Có

### Điểm vào (Entry Point)
Ngay sau khi điểm danh cuối buổi Big Class Plus hoàn tất và Trợ giảng AI đưa ra nhận xét tổng kết — hệ thống chuyển thẳng học sinh sang màn AI Bổ trợ 30 phút, không cần học sinh tự bấm vào, không có bước chọn "có muốn học hay không".

### Các bước của Flow
| Bước | Hành động | Trạng thái/Kết quả nghiệp vụ | Ghi chú |
|------|-----------|------------------------------|---------|
| 1 | Hệ thống đọc Mastery Profile (mastery tổng hợp toàn môn) + tín hiệu Gap Detection vừa ghi từ buổi Big Class Plus | Xác định chân dung (Khá giỏi/TB-yếu) và danh sách NLO ưu tiên (nếu có) | Chưa có Mastery Profile/không có gap → mặc định nhánh Nâng cao (xem BR3) |
| 2 | Hệ thống chọn nhánh nội dung | Nâng cao (Khá giỏi, hoặc không có gap) hoặc Củng cố (TB-yếu, có gap) | |
| 3 | Hiển thị tóm tắt kết quả buổi Big Class Plus vừa học + mục tiêu buổi bổ trợ | Học sinh biết mình sẽ học gì trong 30 phút | BR13 |
| 4 | Học sinh tương tác nội dung theo nhánh, tập trung đúng NLO ưu tiên đã chọn | Ghi nhận kết quả tương tác (đúng/sai) theo từng NLO, cập nhật Mastery Profile real-time | Nâng cao: nội dung mở rộng. Củng cố: giải thích lại + hỏi đáp đúng lỗ hổng |
| 5 | Nếu còn NLO gap chưa xử lý hết trong 30 phút | Phần còn lại chuyển sang buổi AI Bổ trợ kế tiếp + BTVN Adaptive | |
| 5b | Nếu xử lý hết NLO gap ưu tiên trước khi hết giờ | Tự động chuyển sang nội dung Nâng cao (cùng nội dung nhánh Nâng cao) cho thời gian còn lại | BR6 |
| 6 | Trợ giảng AI tổng kết cuối buổi + giao BTVN Adaptive | Học sinh nhận bài tập đúng NLO vừa xử lý | |
| 7 | Ghi kết quả buổi vào Mastery Profile | NLO nào được xử lý, cải thiện hay còn gap — đã ghi real-time từ bước 4 | |
| 8 | Kết thúc buổi bổ trợ | Chuyển học sinh ra khỏi luồng | |

### Màn hình & thành phần chính
| Màn hình | Thành phần chính | Hành động → kết quả nghiệp vụ |
|----------|------------------|-------------------------------|
| Mở đầu buổi bổ trợ | Tóm tắt kết quả buổi Big Class Plus vừa học, thông báo nhánh (Nâng cao/Củng cố), nút bắt đầu | Bấm bắt đầu → vào màn tương tác |
| Tương tác nội dung | Khu vực hiển thị nội dung/câu hỏi theo đúng NLO ưu tiên, ô trả lời, nút gợi ý, thanh tiến trình thời lượng còn lại | Trả lời → ghi nhận đúng/sai theo NLO, chuyển câu/nội dung tiếp theo |
| Tổng kết cuối buổi | Danh sách NLO đã xử lý (đã cải thiện/còn gap), nhận xét của Trợ giảng AI, nút xem BTVN Adaptive | Bấm xem BTVN → chuyển sang BTVN Adaptive; kết thúc buổi |

### Điểm ra (Exit Point)
Học sinh đã xem xong tổng kết buổi bổ trợ; Mastery Profile đã được cập nhật với NLO vừa xử lý; BTVN Adaptive tương ứng đã được giao. Học sinh rời khỏi luồng AI Bổ trợ 30 phút, quay về màn lịch học/màn chính.

### Edge Cases / Luồng lỗi & ngoại lệ
- Học sinh thoát/đóng app giữa buổi rồi quay lại → tiếp tục đúng tại chỗ đã thoát; thời lượng 30 phút KHÔNG tính thời gian đã thoát ra (BR7).
- Hoàn thành hết NLO ưu tiên trước khi hết 30 phút → tự động chuyển sang nội dung mở rộng, giống nhánh Nâng cao (BR6).
- Mất kết nối giữa buổi → buổi bổ trợ không thực hiện điểm danh nên không cần đánh dấu hoàn thành; dữ liệu tương tác đã ghi trước đó được cập nhật vào Mastery Profile real-time, không phụ thuộc buổi có hoàn thành hay không (BR8, BR9).
- Học sinh không có buổi Big Class Plus nào ngay trước đó (nghỉ học...) → tính năng không khởi chạy, không có luồng truy cập độc lập (BR10).
- Nhiều NLO "chưa đạt" thuộc các kỹ năng khác nhau cùng mức ưu tiên → giao toàn quyền quyết định cho Routing Engine, không có luật ưu tiên kỹ năng riêng ở tầng feature này (BR11).

---

## Phase 3: Nhật ký làm rõ (Clarification Log)

### Vòng 1
| # | Nhóm | Câu hỏi | PO trả lời |
|---|------|---------|------------|
| 1 | Rule mâu thuẫn | BR13 (AICNew-01) nói "chưa có Mastery Profile" → không ghi Gap Detection. PO ở Phase 1 nói "buổi đầu chưa đủ dữ liệu" → nhánh Củng cố. Đây là 1 hay 2 tình huống khác nhau? | Mastery Profile chưa có dữ liệu → không có Gap Detection → chạy nhánh Củng cố |
| 2 | Edge case chồng lấn | Học sinh nhánh Củng cố hoàn thành sớm → "tự động chuyển sang mở rộng" — có phải cùng nội dung nhánh Nâng cao không? | Giống nhánh Khá giỏi, nếu học sinh đã củng cố hết gap |
| 3 | Out-of-scope mơ hồ | Edge case #4 "chặn" khi không có buổi Big Class Plus liền trước — nghĩa là tính năng không xuất hiện, hay có thông báo? | Theo hướng (a): tính năng không xuất hiện/không có gì để vào |
| 4 | Phụ thuộc liên service | Cập nhật Mastery Profile real-time giả định nền tảng Adaptive Learning đã hỗ trợ, nhưng PRD đó chưa tồn tại — feature này có chặn theo tiến độ đó không? | Cứ viết vào PRD này; khi tạo PRD Adaptive Learning sau sẽ tham khảo ngược lại từ PRD này |
| 5 | Thuật ngữ tồn đọng | (a) sửa mô tả glossary "AI Tutor"? (b) bổ sung "Routing Engine"? (c) bổ sung "BTVN Adaptive"? | Có — đã cập nhật glossary 2026-09-08 |

### Vòng 2
| # | Nhóm | Câu hỏi | PO trả lời |
|---|------|---------|------------|
| 1 | Logic | Ghép câu trả lời #1+#2 Vòng 1: nếu Củng cố không có gap cụ thể → có phải chạy thẳng Nâng cao ngay từ đầu (không phải "học xong Củng cố rồi mới chuyển")? | Xác nhận: chạy thẳng Nâng cao ngay từ đầu khi không có dữ liệu gap |

### Mục chưa giải quyết
- None

---

## Phase 4: Business Rules

> ✅ PO xác nhận: Có

| Rule ID | Hành động/Trigger | Quy tắc | Điều kiện |
|---------|---------------------|---------------------|------------------------|
| BR1 | Buổi Big Class Plus vừa kết thúc (điểm danh cuối buổi + trợ giảng AI đã tổng kết) | Hệ thống PHẢI tự động chuyển học sinh sang buổi AI Bổ trợ 30 phút ngay, không cần kích hoạt thủ công | Áp dụng mọi học sinh, mọi buổi Big Class Plus |
| BR2 | Bắt đầu buổi bổ trợ | Hệ thống PHẢI đọc Mastery Profile tổng hợp toàn môn (đa buổi, có decay) để xác định chân dung Khá giỏi / Trung bình-yếu | Mastery Profile đã có tín hiệu Gap Detection khả dụng |
| BR3 | Mastery Profile chưa khởi tạo, hoặc không có tín hiệu Gap Detection nào được ghi nhận | Hệ thống PHẢI bỏ qua bước xác định chân dung, chạy thẳng nội dung Nâng cao/mở rộng | Không có NLO "chưa đạt" nào khả dụng |
| BR4 | Chân dung xác định là Trung bình/yếu (có NLO gap) | Hệ thống PHẢI chọn nội dung Củng cố tập trung vào NLO ưu tiên cao nhất (theo Routing Engine) trong số NLO "chưa đạt" vừa phát hiện ở buổi Big Class Plus liền trước | — |
| BR5 | Số NLO gap cần xử lý nhiều hơn thời lượng 30 phút cho phép | Hệ thống PHẢI ưu tiên xử lý NLO có priority cao nhất; NLO gap còn lại PHẢI được chuyển sang buổi bổ trợ kế tiếp và giao vào BTVN Adaptive | — |
| BR6 | Học sinh nhánh Củng cố xử lý hết toàn bộ NLO gap ưu tiên trước khi hết 30 phút | Hệ thống PHẢI tự động chuyển sang nội dung Nâng cao/mở rộng (cùng nội dung với nhánh Nâng cao) cho thời gian còn lại | — |
| BR7 | Học sinh thoát khỏi buổi bổ trợ giữa chừng | Hệ thống PHẢI cho tiếp tục đúng tại điểm đã thoát khi quay lại; thời lượng 30 phút KHÔNG tính thời gian đã thoát ra | — |
| BR8 | Mất kết nối giữa buổi | Buổi bổ trợ KHÔNG yêu cầu đánh dấu hoàn thành/điểm danh (khác Big Class Plus) | — |
| BR9 | Kết thúc mỗi tương tác/câu hỏi trong buổi | Hệ thống PHẢI ghi nhận kết quả (đúng/sai theo NLO) vào Mastery Profile ngay lập tức (real-time), không đợi tổng kết cuối buổi | Áp dụng cả khi buổi bị gián đoạn/mất kết nối |
| BR10 | Không có buổi Big Class Plus nào diễn ra ngay trước (học sinh nghỉ học...) | Hệ thống KHÔNG khởi chạy buổi AI Bổ trợ 30 phút cho học sinh đó | Tính năng không xuất hiện, không có luồng truy cập độc lập |
| BR11 | Nhiều NLO "chưa đạt" thuộc kỹ năng khác nhau, cùng mức ưu tiên theo Routing Engine | Hệ thống giao quyết định hoàn toàn cho Routing Engine | Không có quy tắc ưu tiên loại kỹ năng riêng ở tầng nghiệp vụ feature này |
| BR12 | Kết thúc buổi bổ trợ (hết 30 phút hoặc hết nội dung) | Trợ giảng AI PHẢI đưa nhận xét tổng kết + giao BTVN Adaptive đúng NLO đã xử lý trong buổi | — |
| BR13 | Bắt đầu buổi bổ trợ, trước khi vào nội dung tương tác | Hệ thống PHẢI hiển thị tóm tắt kết quả buổi Big Class Plus vừa học và nêu rõ mục tiêu buổi bổ trợ (nội dung sẽ học, tương ứng nhánh đã chọn) | — |

---

## Phase 5: Business Logic

> ✅ PO xác nhận: Có

| Rule ID | Logic nghiệp vụ (rẽ nhánh / công thức / điều kiện) | Thông báo/kết quả nghiệp vụ khi lỗi |
|---------|---------------------------------------------------|-------------------------------------|
| BR1 | Sự kiện "buổi Big Class Plus kết thúc" (điểm danh cuối buổi ghi nhận thành công) kích hoạt chuyển tiếp tự động, không cần học sinh xác nhận | Chưa xác định — chưa thảo luận |
| BR2 | Đọc mastery trung bình các NLO liên quan (toàn môn, đa buổi) từ Mastery Profile, so ngưỡng để phân Khá giỏi/Trung bình-yếu | ⚠️ **Giả định AI**: ngưỡng số cụ thể chưa được xác định — cần PO chốt trước khi bàn giao dev |
| BR3 | Điều kiện: Mastery Profile không tồn tại HOẶC danh sách NLO "chưa đạt" rỗng → rẽ thẳng nhánh Nâng cao, bỏ qua bước phân chân dung (BR2) | — |
| BR4 | Từ danh sách NLO "chưa đạt" của buổi Big Class Plus liền trước, tính `priority` theo công thức Routing Engine, chọn NLO ưu tiên cao nhất làm nội dung Củng cố | — |
| BR5 | So số NLO ưu tiên với thời lượng còn lại; vượt quá thì xếp theo priority giảm dần, xử lý tới hết giờ, phần dư đẩy sang buổi kế tiếp + BTVN Adaptive | ⚠️ **Giả định AI**: thời lượng ước tính cho mỗi NLO chưa được định lượng |
| BR6 | Điều kiện: danh sách NLO ưu tiên (Củng cố) đã xử lý hết TRƯỚC khi hết 30 phút → chuyển sang cùng kho nội dung Nâng cao | — |
| BR7 | Khi thoát: lưu vị trí/tiến trình hiện tại + tạm dừng đếm thời lượng. Khi quay lại: khôi phục đúng vị trí, tiếp tục đếm thời lượng từ đó | — |
| BR8 | Không có bước "đánh dấu hoàn thành" trong luồng — buổi được coi là đã diễn ra bất kể hoàn thành hết nội dung hay không | — |
| BR9 | Mỗi lần hoàn tất một tương tác gắn với 1 NLO → gửi ngay tín hiệu cập nhật mastery của NLO đó vào Mastery Profile, không gộp chờ cuối buổi | — |
| BR10 | Điều kiện tại entry point: có bản ghi "buổi Big Class Plus vừa kết thúc" của học sinh hay không → không có thì không kích hoạt | — |
| BR11 | Khi Routing Engine trả về nhiều NLO cùng mức priority cao nhất, khác kỹ năng → dùng nguyên kết quả/thứ tự Routing Engine trả về, không áp luật riêng | — |
| BR12 | Khi buổi kết thúc → tổng hợp NLO đã xử lý + trạng thái (cải thiện/còn gap) → sinh nhận xét + danh sách BTVN Adaptive tương ứng | — |
| BR13 | Trước khi hiển thị nội dung tương tác → lấy dữ liệu buổi Big Class Plus liền trước (điểm/kỹ năng) + nhánh đã chọn ở BR2/BR3 → dựng nội dung tóm tắt + mục tiêu | — |

---

## Phase 6: Acceptance Criteria

> ✅ PO xác nhận: Có

| AC ID | Mô tả | Hành vi kỳ vọng | Bắt nguồn từ |
|-------|-------|------------------|--------------|
| AC1 | Tự động khởi chạy sau Big Class Plus | Học sinh được chuyển thẳng vào màn Mở đầu buổi bổ trợ ngay sau khi điểm danh cuối buổi Big Class Plus hoàn tất, không cần thao tác kích hoạt | BR1 |
| AC2 | Xác định đúng chân dung khi đủ dữ liệu | Học sinh có mastery đủ dữ liệu → hệ thống chọn đúng nhánh (Nâng cao/Củng cố) tương ứng | BR2 |
| AC3 | Xử lý đúng khi chưa có dữ liệu | Học sinh chưa có Mastery Profile hoặc không có NLO gap → hiển thị thẳng nội dung Nâng cao, không qua bước phân chân dung | BR3 |
| AC4 | Nội dung Củng cố đúng NLO ưu tiên | Học sinh có NLO "chưa đạt" từ buổi liền trước → nội dung Củng cố tập trung đúng NLO priority cao nhất (Routing Engine) | BR4 |
| AC5 | Xử lý khi nhiều NLO gap vượt thời lượng | Số NLO gap vượt quá thời lượng còn lại → chỉ xử lý NLO ưu tiên cao nhất; phần còn lại xuất hiện ở buổi kế tiếp + BTVN Adaptive giao cuối buổi hiện tại | BR5 |
| AC6 | Chuyển nhánh khi hoàn thành sớm | Xử lý xong toàn bộ NLO ưu tiên trước khi hết 30 phút → tự động hiển thị nội dung Nâng cao cho thời gian còn lại, không kết thúc sớm | BR6 |
| AC7 | Tiếp tục đúng vị trí sau khi thoát | Thoát và quay lại trong cùng buổi → đúng nội dung/vị trí đã dừng; đồng hồ 30 phút không cộng dồn thời gian đã thoát | BR7 |
| AC8 | Không yêu cầu điểm danh/hoàn thành | Buổi bổ trợ không hiển thị yêu cầu điểm danh hay trạng thái "phải hoàn thành" | BR8 |
| AC9 | Cập nhật Mastery Profile real-time | Ngay sau mỗi tương tác, Mastery Profile của NLO tương ứng được cập nhật, kể cả khi buổi bị ngắt giữa chừng | BR9 |
| AC10 | Không kích hoạt khi thiếu buổi Big Class Plus liền trước | Học sinh không có buổi Big Class Plus vừa hoàn thành trong ngày → không được đưa vào luồng này | BR10 |
| AC11 | Tôn trọng thứ tự Routing Engine | Nhiều NLO khác kỹ năng cùng priority cao nhất → nội dung theo đúng thứ tự Routing Engine trả về | BR11 |
| AC12 | Tổng kết + giao BTVN đúng NLO | Cuối buổi, học sinh nhận nhận xét Trợ giảng AI + BTVN Adaptive đúng các NLO đã xử lý trong buổi | BR12 |
| AC13 | Hiển thị tóm tắt + mục tiêu đầu buổi | Trước khi vào nội dung tương tác, học sinh thấy tóm tắt kết quả buổi Big Class Plus vừa học và mục tiêu buổi bổ trợ tương ứng nhánh đã chọn | BR13 |

---

## Phase 7: Báo cáo kiểm chứng (Validation Report)

### Ma trận độ phủ (Coverage Matrix)
| Hành động Flow | Có Rule? | Có Logic? | Có AC? | Status |
|----------------|----------|-----------|--------|--------|
| 1. Đọc Mastery Profile + Gap Detection, xác định chân dung/NLO ưu tiên | ✅ BR2, BR3 | ✅ | ✅ AC2, AC3 | OK |
| 2. Chọn nhánh nội dung | ✅ BR2-4, BR6 | ✅ | ✅ AC2-4, AC6 | OK |
| 3. Mở đầu buổi: tóm tắt kết quả + mục tiêu | ✅ BR13 | ✅ | ✅ AC13 | OK |
| 4. Tương tác nội dung theo nhánh | ✅ BR4, BR6 | ✅ | ✅ AC4, AC6 | OK |
| 5. Chuyển NLO gap dư sang buổi kế tiếp + BTVN | ✅ BR5 | ✅ | ✅ AC5 | OK |
| 6. Trợ giảng AI tổng kết + giao BTVN | ✅ BR12 | ✅ | ✅ AC12 | OK |
| 7. Ghi kết quả vào Mastery Profile | ✅ BR9 | ✅ | ✅ AC9 | OK |
| 8. Kết thúc buổi | — (điều hướng màn hình, không cần BR riêng) | — | — | OK |

### Xung đột phát hiện
- None

### Mục còn thiếu
- None (đã bổ sung BR13/AC13 để đóng GAP phát hiện ở lượt kiểm đầu tiên)

### Ghi chú còn treo cho `/generate-prd` (không chặn, nhưng cần PO chốt trước khi bàn giao dev)
- BR2: ngưỡng số phân chân dung Khá giỏi/Trung bình-yếu — chưa định lượng.
- BR5: thời lượng ước tính cho mỗi NLO (để tính "còn đủ giờ") — chưa định lượng.
- BR1: hành vi khi hệ thống lỗi không khởi chạy được buổi bổ trợ — chưa thảo luận.

---

<!--
  NEXT STEPS:
  /generate-prd 00_context/AICNew-02-ai-bo-tro-30-phut.md
-->

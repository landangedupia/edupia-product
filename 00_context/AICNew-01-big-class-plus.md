# AICNew-01 Product Definition — Big Class Plus

---

## Metadata

| Field              | Value                          |
|--------------------|--------------------------------|
| **Ticket**         | AICNew-01                      |
| **Feature**        | Big Class Plus                 |
| **Domain**         | ai-class-core                  |
| **PO**             | {tên PO — điền ở /generate-prd} |
| **Created**        | 2026-09-05                     |
| **Status**         | completed                      |
| **Completed Phase**| 7                               |

---

## Phase 0: Đồng bộ tri thức (Knowledge Sync)

> ⚙️ AI tự thu thập — bối cảnh hệ thống, không phải yêu cầu nghiệp vụ do PO viết.

### Khái niệm / dữ liệu nghiệp vụ liên quan
- **Big Class** — buổi học nhóm có giáo viên, hiện có 2-3 buổi/tuần (`00_context/glossary.md`)
- **NLO (Nano Learning Objective)** — đơn vị kiến thức nhỏ nhất, 1.473 NLO cho lớp 1-8
- **Mastery Profile / Mastery Map** — hồ sơ năng lực học sinh theo NLO (◆ phạm vi chính xác đang chờ BOD chốt)
- **Adaptive Learning (Gap Detection)** — chẩn đoán lỗ hổng kiến thức, điều hướng nội dung theo NLO
- **GVCN** — vai trò mở rộng ở Concept 1.2 (thuộc Thành phần 6, không nằm trong phạm vi PRD này)
- **Edupia Tutor family** — sản phẩm gia sư người thật riêng biệt, không nhầm với AI Tutor của Concept 1.2/3.1

### Phần hệ thống / feature liên quan
- Big Class Plus là **Thành phần 1** trong 6 thành phần của Concept 1.2 (Edupia AI Class Plus) — xem `03_product/concepts/slide-content-concept-1.2-product-dev-2026-09-04-final.md` (Slide 12-19)
- Phụ thuộc nền tảng chung **NLO & Mastery Profile** (Slide 13, Layer 1)
- Là điểm khởi đầu vòng lặp cá nhân hoá, nối tiếp sang **Thành phần 3 — AI Tutor 30 phút sau buổi học** (không thuộc phạm vi PRD này)

### Rule / Logic có sẵn
- Chưa có PRD nào trong repo trước đây — đây là PRD đầu tiên, không có rule cũ cần tôn trọng.

### Chuẩn hoá thuật ngữ
| Thuật ngữ trong input PO | Thuật ngữ chuẩn (business-dictionary) |
|--------------------------|---------------------------------------|
| Gap Detection            | Đã có — nằm trong định nghĩa "Adaptive Learning" (`00_context/glossary.md`) |
| Mastery Profile          | Đã có — glossary gọi "Mastery Profile / Mastery Map" |
| GV Star                  | Thuật ngữ mới — đã bổ sung entry vào `00_context/glossary.md` trong phiên khám phá này (xem Phase 3) |
| Routing Engine           | Thuật ngữ mới, thuộc phạm vi Adaptive Learning — **hoãn định nghĩa chính thức** sang PRD của thành phần liên quan (không thuộc phạm vi PRD này) |

---

## Phase 1: Định nghĩa tính năng (Feature Definition)

> ✅ PO xác nhận: Có

### Bối cảnh (Context)
Big Class hiện tại dạy đại trà cho ~14 học sinh/lớp; học sinh yếu ở những điểm khác nhau nhưng nhận cùng nội dung, cùng tốc độ. Giáo viên chỉ đánh giá cảm tính qua điểm tổng, không biết chính xác học sinh yếu ở đâu. Phụ huynh cần bằng chứng tiến bộ cụ thể để gia hạn. Đối thủ toàn cầu (Squirrel AI, Riiid, atama+, Alef Education) đã chứng minh mô hình chẩn đoán chi tiết hiệu quả. Big Class Plus nâng cấp buổi học hiện tại để trở thành điểm khởi đầu thu thập tín hiệu cho Adaptive Learning, đồng thời tăng cảm giác tương tác cá nhân — lấp khoảng trống "cá nhân hoá + giá đại trà (~390-400k)".

### Tuyên bố vấn đề (Problem Statement)
Buổi học Big Class hiện tại dạy đại trà — giáo viên không có cách nào nắm chính xác từng học sinh đang yếu ở NLO nào trong lúc dạy, và tương tác với từng con còn chung chung. Kết quả: buổi học không sinh ra tín hiệu để cá nhân hoá các thành phần học tập phía sau (BTVN Adaptive, AI Tutor 30 phút).

### Mục tiêu (Goal)
Mỗi buổi Big Class Plus vừa phát nội dung bài giảng theo chương trình (bám SGK Global Success) vừa gán được NLO cho từng học sinh dựa trên dữ liệu buổi học đó, sinh tín hiệu Gap Detection để nuôi Mastery Profile của học sinh — làm điểm khởi đầu cho vòng lặp cá nhân hoá. Đồng thời tăng cảm giác tương tác cá nhân với từng con qua AI Voice (gọi tên, khích lệ/động viên) dù nội dung là video quay sẵn.

### Actor
| Actor    | Vai trò            | Chính/Phụ |
|----------|--------------------|-----------|
| Học sinh | Tham gia buổi học, trả lời câu hỏi | Primary |
| AI Voice (giọng GV Star) | Chào tên đầu buổi; khích lệ khi đúng, động viên khi sai — theo thời gian thực | Primary |
| AI trợ giảng | Nhận xét kết quả học tập cụ thể cuối buổi + nhắc BTVN Adaptive | Primary |
| Phụ huynh | Nhận thông báo điểm danh đầu/cuối buổi (kèm ảnh) — xử lý bởi Parent Mode, ngoài phạm vi PRD này | Secondary |

### Phạm vi (In Scope)
- Buổi học trực tuyến nhóm, phát nội dung bài giảng (GV Star — video quay sẵn), 2 buổi/tuần, bám sát chương trình SGK Global Success.
- AI Voice tăng cảm giác tương tác cá nhân: chào tên đầu buổi, khích lệ khi trả lời đúng, động viên khi trả lời sai.
- Gán NLO cho từng học sinh dựa trên dữ liệu thu thập từ câu hỏi tương tác trong buổi học.
- Sinh tín hiệu Gap Detection từ dữ liệu gán NLO, ghi vào Mastery Profile của học sinh.
- Điểm danh đầu buổi và cuối buổi (kèm ảnh chụp học sinh).
- AI trợ giảng nhận xét kết quả học tập cụ thể cuối buổi + nhắc BTVN Adaptive tương ứng.

### Ngoài phạm vi (Out of Scope)
- **Xây dựng cơ chế Adaptive Learning / Routing Engine** (thuật toán chọn NLO ưu tiên) — thuộc nền tảng chung Layer 1, không phải việc của Big Class Plus. Feature này chỉ sinh tín hiệu đầu vào (gán NLO).
- **BTVN Adaptive & AI Practice, AI Tutor 30 phút, AI Speak, Edupia Club, GVCN & Parent Mode** — 5 thành phần còn lại của Concept 1.2, mỗi thành phần là một ticket/PRD riêng. Bao gồm cả việc **gửi thông báo tới điện thoại phụ huynh** (thuộc Parent Mode) — Big Class Plus chỉ ghi nhận dữ liệu (điểm danh, report buổi học), không tự gửi thông báo.
- **Nội dung 1.473 NLO (NLO Taxonomy)** — đã có sẵn, không phải việc của ticket này.
- **Cấu trúc Mastery Profile** (schema, cách lưu trữ xuyên suốt các thành phần) — thuộc nền tảng chung Layer 1.

### User Story
- **Là một (As a)** phụ huynh có con học Edupia AI Class Plus
- **Tôi muốn (I want to)** con được học buổi học tương tác cá nhân hơn (được gọi tên, khích lệ/động viên) và tự động phát hiện lỗ hổng kiến thức ngay trong buổi học
- **Để (So that)** con nhận được lộ trình cá nhân hoá đúng chỗ hổng ngay sau đó, thay vì học đại trà và đợi tới kỳ thi mới biết con yếu ở đâu

### Phụ thuộc liên service *(mức nghiệp vụ)*
- Cần **Mastery Profile / Adaptive Learning** (nền tảng chung) đã tồn tại để ghi tín hiệu NLO vào và để engine Adaptive Learning đọc tín hiệu đó — vì Big Class Plus không tự vá lỗ hổng, chỉ sinh tín hiệu đầu vào.
- Cần **NLO Taxonomy** (1.473 đơn vị) đã có sẵn để hệ thống gán đúng NLO cho học sinh.
- Cần **LMS** cung cấp danh sách học sinh thuộc lớp học — vì hệ thống cần biết đang gán NLO cho đúng học sinh nào trong buổi học đó.

---

## Phase 2: Định nghĩa User Flow

> ✅ PO xác nhận: Có

### Điểm vào (Entry Point)
Học sinh vào lớp học Big Class Plus đúng giờ buổi học đã lên lịch (2 buổi/tuần).

### Các bước của Flow
| Bước | Hành động | Trạng thái/Kết quả nghiệp vụ | Ghi chú |
|------|-----------|------------------------------|---------|
| 1 | Học sinh vào lớp | Hệ thống kiểm tra danh sách lớp từ LMS trước khi cho vào | Chặn vào lớp nếu LMS lỗi (BR-12) |
| 2 | Hệ thống ghi nhận điểm danh đầu buổi; AI Voice (giọng GV Star) gọi tên chào mừng học sinh | Điểm danh đầu buổi = Có (nếu đúng giờ), lưu ảnh chụp học sinh | Vào trễ → không tính điểm danh đầu buổi (BR-2) |
| 3 | Giáo viên Star (video quay sẵn) phát nội dung bài giảng theo chương trình SGK Global Success | Buổi học diễn ra | GV Star là video quay sẵn, không phải dạy trực tiếp real-time |
| 4 | Học sinh trả lời câu hỏi tương tác trong lúc học | Hệ thống ghi nhận đúng/sai từng câu | |
| 5 | AI Voice khích lệ nếu trả lời đúng, động viên nếu trả lời sai | Phản hồi tức thời theo từng câu trả lời | Cả hai trường hợp đều có phản hồi |
| 6 | Hệ thống tổng hợp kết quả cuối buổi | Gán NLO cho từng học sinh có trả lời (bỏ qua học sinh không trả lời câu nào — BR-7) | |
| 7 | AI trợ giảng nhận xét kết quả học tập cụ thể của từng học sinh + nhắc BTVN Adaptive tương ứng | Nhận xét cá nhân hoá theo kết quả NLO vừa gán | Diễn ra **trước** điểm danh cuối buổi |
| 8 | Hệ thống ghi nhận điểm danh cuối buổi | Điểm danh cuối buổi = Có (nếu còn trong lớp tới cuối), lưu ảnh chụp | |
| 9 | Hệ thống ghi tín hiệu Gap Detection vào Mastery Profile | Cập nhật Mastery Profile của học sinh | |
| 10 | Buổi học kết thúc | | |

### Màn hình & thành phần chính
| Màn hình | Thành phần chính | Hành động → kết quả nghiệp vụ |
|----------|------------------|-------------------------------|
| Màn hình lớp học live | Video giáo viên (GV Star), danh sách học sinh trong lớp | Học sinh vào lớp → hệ thống điểm danh |
| Màn hình câu hỏi tương tác | Câu hỏi + các đáp án để chọn | Học sinh chọn đáp án → hệ thống báo đúng/sai ngay, AI Voice phản hồi |
| Màn hình tổng kết buổi học | Kết quả tổng hợp của học sinh trong buổi, nhận xét của AI trợ giảng | Hiển thị cho học sinh trước khi điểm danh cuối buổi |

> **Tạm thời** — PO ghi nhận có thể bổ sung thêm chi tiết màn hình sau (vd màn hình riêng cho việc điểm danh).

### Điểm ra (Exit Point)
Buổi học kết thúc với: (1) học sinh được điểm danh đầu/cuối buổi (trừ trường hợp vào trễ hoặc thoát hẳn trước khi kết thúc), (2) NLO đã được gán cho học sinh có trả lời câu hỏi trong buổi, (3) tín hiệu Gap Detection đã ghi vào Mastery Profile, (4) AI trợ giảng đã đưa nhận xét cuối buổi — sẵn sàng để các thành phần phía sau (BTVN Adaptive, AI Tutor 30 phút) đọc và cá nhân hoá.

### Edge Cases / Luồng lỗi & ngoại lệ
- Học sinh thoát khỏi lớp giữa buổi rồi quay lại → điểm danh đầu và cuối buổi vẫn tính đầy đủ (BR-3).
- Học sinh vào lớp trễ, không được điểm danh đầu buổi → vẫn được học và vẫn được gán NLO; hệ thống ghi nhận "vào trễ" để Parent Mode thông báo phụ huynh sau (BR-2).
- Học sinh không trả lời câu hỏi tương tác nào cả buổi → không gán được NLO; đánh dấu vào report buổi học của học sinh để Parent Mode thông báo phụ huynh sau (BR-7).
- LMS không trả được danh sách lớp/danh sách học sinh → học sinh không thể vào được lớp (BR-12).
- Giáo viên "thật" là video quay sẵn phát live cho học sinh — không có tình huống "giáo viên gặp sự cố, lớp học bị gián đoạn".

---

## Phase 3: Nhật ký làm rõ (Clarification Log)

### Vòng 1 — Edge cases
| # | Nhóm | Câu hỏi | PO trả lời |
|---|------|---------|------------|
| 1 | Edge case | Học sinh thoát khỏi lớp giữa buổi rồi quay lại xử lý ra sao? | Vẫn điểm danh đầy đủ đầu buổi và cuối buổi |
| 2 | Edge case | Học sinh vào trễ, không điểm danh đầu buổi — vẫn được gán NLO không? | Vào trễ không được điểm danh, vẫn được học và vẫn được gán NLO, ghi nhận vào trễ để thông báo phụ huynh sau |
| 3 | Edge case | Học sinh không trả lời câu hỏi nào cả buổi — hệ thống gán NLO thế nào? | Không gán được NLO, đánh dấu vào report buổi học để thông báo phụ huynh sau |
| 4 | Edge case | LMS không trả được danh sách lớp/học sinh — xử lý thế nào? | Học sinh sẽ không thể vào được lớp |
| 5 | Edge case | Giáo viên gặp sự cố, lớp học bị gián đoạn/huỷ giữa buổi — xử lý thế nào? | Giáo viên "thật" là video quay sẵn phát live — không có trường hợp này |

### Vòng 2 — Rule mâu thuẫn (phát sinh từ câu trả lời #5 ở Vòng 1)
| # | Nhóm | Câu hỏi | PO trả lời |
|---|------|---------|------------|
| 1 | Rule mâu thuẫn | Nếu bài giảng là video quay sẵn, "gọi tên", "khích lệ/động viên" thực hiện bằng cách nào? | Giả định AI lớp phủ tương tác (AI Voice); xác nhận qua bằng chứng `00_context/meeting-notes/2026-08-28-review-slide-concept-sale.md` (dòng 57-61) |
| 2 | Rule mâu thuẫn | Điểm danh đầu/cuối buổi — ai/cái gì thực hiện? | Cơ chế điểm danh dùng camera chụp lại học sinh (xác nhận qua cùng meeting note, dòng 52-55) |
| 3 | Rule mâu thuẫn | "GV Star" là vai trò gì trong vận hành thực tế? | GV Star chính là video quay sẵn, phát live cho học sinh |
| 4 | Edge case (bổ sung) | Khi học sinh trả lời SAI, AI Voice có phản hồi động viên không? | Có — khích lệ khi đúng, động viên khi sai (cả hai trường hợp đều có phản hồi) |

**Kết quả xử lý:** Đã sửa lại Context/Goal/Actor/Flow Steps ở Phase 1-2 cho đúng bản chất (GV Star = video quay sẵn + AI Voice, không phải giáo viên dạy live). Đã bổ sung entry "GV Star" vào `00_context/glossary.md`. Đã hoãn định nghĩa "Routing Engine" sang PRD liên quan (ngoài phạm vi).

### Mục chưa giải quyết
- None

---

## Phase 4: Business Rules

> ✅ PO xác nhận: Có

| Rule ID | Hành động/Trigger | Quy tắc | Điều kiện |
|---------|---------------------|---------------------|------------------------|
| BR-1 | Học sinh vào lớp đúng giờ | Hệ thống PHẢI ghi nhận điểm danh đầu buổi (kèm ảnh chụp học sinh) | Vào lớp trước/đúng giờ bắt đầu |
| BR-2 | Học sinh vào lớp trễ | Hệ thống PHẢI cho học sinh vào học và vẫn gán NLO bình thường, nhưng KHÔNG tính điểm danh đầu buổi; PHẢI ghi nhận việc vào trễ | Vào lớp sau giờ bắt đầu |
| BR-3 | Học sinh thoát khỏi lớp giữa buổi rồi quay lại | Hệ thống PHẢI vẫn tính điểm danh đầu và cuối buổi đầy đủ như bình thường | Thoát và quay lại trong cùng buổi học |
| BR-4 | Đầu buổi học, sau khi điểm danh | AI Voice (giọng GV Star) PHẢI gọi tên chào mừng từng học sinh đã điểm danh | Học sinh đã điểm danh đầu buổi |
| BR-5 | Học sinh trả lời đúng câu hỏi trắc nghiệm | AI Voice PHẢI gọi tên và khích lệ học sinh đó ngay lập tức | Câu trả lời đúng |
| BR-6 | Học sinh trả lời sai câu hỏi trắc nghiệm | AI Voice PHẢI động viên học sinh đó ngay lập tức | Câu trả lời sai |
| BR-7 | Học sinh không trả lời câu hỏi tương tác nào cả buổi | Hệ thống KHÔNG ĐƯỢC gán NLO cho học sinh đó; PHẢI đánh dấu vào report buổi học | Không có câu trả lời nào trong buổi |
| BR-8 | Cuối buổi học | Hệ thống PHẢI tổng hợp kết quả câu hỏi tương tác và gán NLO cho từng học sinh có trả lời | Trừ trường hợp BR-7 |
| BR-9 | Sau khi gán NLO cuối buổi | Hệ thống PHẢI ghi tín hiệu Gap Detection vào Mastery Profile của học sinh | Học sinh đã được gán NLO (BR-8) |
| BR-10 | Cuối buổi học | AI trợ giảng PHẢI nhận xét kết quả học tập cụ thể của từng học sinh và nhắc làm BTVN Adaptive tương ứng | Sau khi hệ thống tổng hợp kết quả (BR-8) |
| BR-11 | Cuối buổi học | Hệ thống PHẢI ghi nhận điểm danh cuối buổi (kèm ảnh chụp học sinh) | Học sinh còn tham gia tới cuối buổi |
| BR-12 | LMS không trả được danh sách học sinh của lớp | Hệ thống KHÔNG ĐƯỢC cho học sinh vào lớp | Lỗi/không lấy được dữ liệu từ LMS |

---

## Phase 5: Business Logic

> ✅ PO xác nhận: Có

| Rule ID | Logic nghiệp vụ (rẽ nhánh / công thức / điều kiện) | Thông báo/kết quả nghiệp vụ khi lỗi |
|---------|---------------------------------------------------|-------------------------------------|
| BR-1 | Thời điểm học sinh vào lớp ≤ giờ bắt đầu buổi → ghi điểm danh đầu buổi = Có, lưu ảnh chụp học sinh | — (happy path) |
| BR-2 | Thời điểm vào lớp > giờ bắt đầu buổi → điểm danh đầu buổi = Không; đánh dấu "vào trễ" kèm thời điểm vào; học sinh vẫn được vào học bình thường | Ghi "vào trễ" vào report buổi học (để Parent Mode xử lý thông báo phụ huynh sau) |
| BR-3 | Trạng thái điểm danh (đầu/cuối buổi) đã ghi KHÔNG bị huỷ/reset khi hệ thống phát hiện học sinh rời kết nối tạm thời rồi quay lại trong cùng buổi | — |
| BR-4 | Khi điểm danh đầu buổi = Có cho một học sinh → ghép tên học sinh vào đoạn audio chào mừng (giọng GV Star), phát ngay khi học sinh vào lớp | — |
| BR-5 | Mỗi lần học sinh chọn đáp án đúng → kích hoạt tức thời đoạn AI Voice: gọi tên + khích lệ | — |
| BR-6 | Mỗi lần học sinh chọn đáp án sai → kích hoạt tức thời đoạn AI Voice: động viên | — |
| BR-7 | Đếm số câu học sinh đã trả lời trong buổi; = 0 → không gán NLO cho học sinh đó (bỏ qua BR-8 với học sinh này) | Đánh dấu "không đủ dữ liệu gán NLO" vào report buổi học của học sinh (để Parent Mode thông báo phụ huynh sau) |
| BR-8 | Với học sinh có ≥1 câu trả lời: tổng hợp danh sách câu đúng/sai → map mỗi câu sang NLO tương ứng → gán kết quả NLO (đạt/chưa đạt) cho học sinh | — |
| BR-9 | Với các NLO được gán "chưa đạt" ở BR-8 → ghi thành tín hiệu Gap Detection, cộng dồn vào Mastery Profile hiện có của học sinh (không ghi đè lịch sử) | — |
| BR-10 | Dựa trên kết quả NLO vừa tổng hợp (BR-8) → AI trợ giảng sinh nhận xét cá nhân hoá (số câu đúng/sai, NLO còn yếu) + gợi ý BTVN Adaptive tương ứng đúng NLO đó | — |
| BR-11 | Tại thời điểm kết thúc buổi, nếu học sinh vẫn còn trong lớp → ghi điểm danh cuối buổi = Có, lưu ảnh chụp học sinh | Học sinh đã thoát hẳn trước khi kết thúc → không ghi điểm danh cuối buổi (không tính) |
| BR-12 | Gọi LMS lấy danh sách lớp thất bại (lỗi/timeout) → chặn học sinh vào lớp | Hiển thị thông báo lỗi cho học sinh: "Không thể vào lớp học lúc này, vui lòng thử lại sau" |

---

## Phase 6: Acceptance Criteria

> ✅ PO xác nhận: Có

| AC ID | Mô tả | Hành vi kỳ vọng | Bắt nguồn từ |
|-------|------------------------|---------------------------|--------------|
| AC-1 | Điểm danh đầu buổi đúng giờ | Học sinh vào lớp trước/đúng giờ bắt đầu → hệ thống ghi điểm danh đầu buổi = Có, lưu ảnh chụp học sinh | BR-1 |
| AC-2 | Vào lớp trễ vẫn học bình thường | Học sinh vào lớp sau giờ bắt đầu → vẫn được vào học, vẫn gán NLO, không tính điểm danh đầu buổi, hệ thống ghi nhận "vào trễ" | BR-2 |
| AC-3 | Thoát/quay lại giữa buổi không mất điểm danh | Học sinh thoát rồi quay lại trong cùng buổi → điểm danh đầu và cuối buổi vẫn tính đầy đủ như không rời lớp | BR-3 |
| AC-4 | AI Voice chào tên đầu buổi | Học sinh đã điểm danh đầu buổi → hệ thống phát đúng đoạn chào tên học sinh đó bằng giọng GV Star | BR-4 |
| AC-5 | AI Voice khích lệ khi đúng | Học sinh trả lời đúng một câu → AI Voice gọi tên + khích lệ ngay lập tức | BR-5 |
| AC-6 | AI Voice động viên khi sai | Học sinh trả lời sai một câu → AI Voice động viên ngay lập tức | BR-6 |
| AC-7 | Không gán NLO khi không có dữ liệu | Học sinh không trả lời câu nào cả buổi → không có NLO nào được gán, report buổi học đánh dấu "không đủ dữ liệu gán NLO" | BR-7 |
| AC-8 | Gán NLO đúng theo kết quả trả lời | Buổi học kết thúc, học sinh có ≥1 câu trả lời → NLO được gán đúng theo đúng/sai của các câu đã trả lời | BR-8 |
| AC-9 | Ghi Gap Detection vào Mastery Profile | Sau khi gán NLO → các NLO "chưa đạt" được cộng dồn vào Mastery Profile hiện có, không ghi đè lịch sử | BR-9 |
| AC-10 | AI trợ giảng nhận xét cuối buổi | Cuối buổi học → AI trợ giảng đưa nhận xét đúng theo kết quả học tập của từng học sinh + gợi ý BTVN Adaptive tương ứng | BR-10 |
| AC-11 | Điểm danh cuối buổi | Học sinh còn trong lớp tới lúc kết thúc → điểm danh cuối buổi = Có kèm ảnh; học sinh đã thoát hẳn trước đó → không ghi điểm danh cuối buổi | BR-11 |
| AC-12 | Chặn vào lớp khi LMS lỗi | LMS không trả được danh sách lớp/học sinh → học sinh không vào được lớp, nhận thông báo lỗi | BR-12 |

---

## Phase 7: Báo cáo kiểm chứng (Validation Report)

### Ma trận độ phủ (Coverage Matrix)
| Hành động Flow | Có Rule? | Có Logic? | Có AC? | Status |
|----------------|----------|-----------|--------|--------|
| 1. Học sinh vào lớp (gate LMS) | ✅ BR-12 | ✅ | ✅ AC-12 | OK |
| 2. Điểm danh đầu buổi (+ AI Voice chào tên) | ✅ BR-1/2/4 | ✅ | ✅ AC-1/2/4 | OK |
| 3. Giáo viên Star (video quay sẵn) dạy bài | — | — | — | OK (nội dung tĩnh, không cần rule) |
| 4. Học sinh trả lời câu hỏi | ✅ (ẩn trong BR-5/6/8) | ✅ | ✅ | OK |
| 5. AI Voice khích lệ/động viên theo đúng-sai | ✅ BR-5/6 | ✅ | ✅ AC-5/6 | OK |
| 6. Hệ thống tổng hợp kết quả, gán NLO | ✅ BR-7/8 | ✅ | ✅ AC-7/8 | OK |
| 7. AI trợ giảng nhận xét cuối buổi | ✅ BR-10 | ✅ | ✅ AC-10 | OK |
| 8. Điểm danh cuối buổi | ✅ BR-11 | ✅ | ✅ AC-11 | OK |
| 9. Ghi tín hiệu Gap Detection vào Mastery Profile | ✅ BR-9 | ✅ | ✅ AC-9 | OK |
| 10. Buổi học kết thúc | — | — | — | OK |

### Xung đột phát hiện
- None (mâu thuẫn "giáo viên dạy live" vs "video quay sẵn" đã được phát hiện và xử lý ở Phase 3, Vòng 2).

### Mục còn thiếu
- None

---

<!--
  NEXT STEPS:
  Khi Product Definition hoàn tất (Status: completed), chạy:
  /generate-prd 00_context/AICNew-01-big-class-plus.md
  để sinh PRD từ Product Definition này.
-->

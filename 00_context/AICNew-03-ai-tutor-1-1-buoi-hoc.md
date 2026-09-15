# AICNew-03 Product Definition — AI Tutor 1-1 · Buổi học chính khoá (45 phút)

> ⚠️ **Cách đọc tài liệu này:** khác với AICNew-01/AICNew-02 (có phiên khám phá trực tiếp với PO), tài liệu này được tổng hợp **trực tiếp từ tài liệu concept đã có** (slide Concept 3.1 bản "final" 2026-09-04 + đối chiếu meeting note liên quan), **CHƯA qua phiên hỏi-đáp trực tiếp với PO**. Mọi mục đánh dấu ❓ là **câu hỏi thật cần PO trả lời**, không phải câu trả lời đã có — khác với AICNew-01 nơi cột "PO trả lời" là câu trả lời thật đã ghi nhận.

---

## Metadata

| Field              | Value                          |
|--------------------|--------------------------------|
| **Ticket**         | AICNew-03                      |
| **Feature**        | AI Tutor 1-1 — Buổi học chính khoá (45 phút) |
| **Domain**         | ai-tutor                       |
| **PO**             | Đặng Ngọc Lân                  |
| **Created**        | 2026-09-10                     |
| **Status**         | completed (tổng hợp từ tài liệu — chưa qua phiên khám phá trực tiếp với PO) |
| **Completed Phase**| 7                               |

---

## Phase 0: Đồng bộ tri thức (Knowledge Sync)

### Khái niệm / dữ liệu nghiệp vụ liên quan
- **AI Tutor** — sản phẩm gia sư AI 1:1 độc lập, trả phí riêng (Concept 3.1), buổi 45 phút, 2 buổi chính khoá/tuần + 1 buổi chuyên sâu sau mỗi 4 buổi ("4+1"), phân theo trình độ đầu vào (`00_context/glossary.md`). **Khác với "AI Bổ trợ 30 phút"** (AICNew-02, thuộc Concept 1.2, chạy ngay sau Big Class Plus) — hai tên PHẢI phân biệt rõ.
- **NLO (Nano Learning Objective)** — đơn vị kiến thức nhỏ nhất, 1.473 NLO cho lớp 1-8.
- **Mastery Profile / Mastery Map** — hồ sơ năng lực học sinh theo NLO.
- **Routing Engine** — cơ chế chọn 1-2 NLO ưu tiên cao nhất cho mỗi buổi, công thức `priority = ppct_weight × (1−mastery) × prereq_boost`. Theo glossary: **◆ Pending BOD — chưa có PRD chính thức**, dùng chung bởi Big Class Plus, AI Bổ trợ 30 phút, AI Practice, AI Speak, Edupia Club — và nay cả AI Tutor 1-1.
- **Mastery Model** (Slide 17, `slide-content-concept-3.1-product-dev-2026-09-04-final.md`): `mastery_mới = mastery_cũ × decay + tín hiệu mới` — cập nhật **real-time sau mỗi tương tác**, không chỉ sau bài kiểm tra. Chưa có entry trong `00_context/glossary.md` — đề xuất bổ sung (xem NEW TERM DETECTION bên dưới).
- **GVCN** — đồng hành xuyên suốt AI Tutor 1-1 (Slide 14), nhưng cơ chế cụ thể là một thành phần/PRD riêng, ngoài phạm vi tài liệu này.
- **Edupia Tutor (1-1/1-4/1-6)** — sản phẩm gia sư người thật, khác phân khúc, **dễ nhầm tên** với "AI Tutor 1-1" (Concept 3.1) — glossary đã cảnh báo rủi ro đặt tên này, PRD cần nhắc lại rõ.

### Phần hệ thống / feature liên quan
- Đây là **thành phần chủ lực** của Concept 3.1 (Edupia AI Tutor 1-1) — buổi học chính khoá, phân biệt với "buổi chuyên sâu" (thứ 5, sau mỗi 4 buổi chính khoá — **chưa có mô tả cấu trúc nội dung** trong tài liệu nguồn, xem Phase 3).
- Nguồn: `03_product/concepts/slide-content-concept-3.1-product-dev-2026-09-04-final.md`, Slide 8-10 (Value story/USP), Slide 14-15 (cấu trúc tổng thể + buổi học), Slide 17 (Routing Engine/Mastery Model).
- **Thay thế tài liệu cũ**: bản slide nguồn tự ghi chú thay thế `concept-3-ai-tutor-1-1-2026-08-27.md` ("phương án kỹ thuật đã được thay thế 2026-09-03"). Coi tài liệu cũ đó và các dữ liệu liên quan (Level A/B/C/D, giá 390-450k) là **đã lỗi thời**, chỉ dùng làm bối cảnh lịch sử, không dùng làm căn cứ business rule ở đây (xem Phase 3, Vòng 1, mục Level A/B để thấy phần dư của cách gọi cũ vẫn còn sót lại ngay trong bản "final").
- Không thay thế/chồng lấn AICNew-01 (Big Class Plus) hay AICNew-02 (AI Bổ trợ 30 phút) — cả hai thuộc Concept 1.2, domain `ai-class-core` khác với `ai-tutor` ở đây.

### Rule / Logic có sẵn
- Chưa có PRD nào trong domain `ai-tutor` trước đây — đây là PRD đầu tiên của domain này, không có rule cũ cần tôn trọng.

### Chuẩn hoá thuật ngữ
| Thuật ngữ trong input | Thuật ngữ chuẩn (business-dictionary) |
|---|---|
| AI Tutor 1-1 | Đã có — `00_context/glossary.md` entry "AI Tutor", confirmed. |
| Routing Engine | Đã có — glossary, nhưng trạng thái **◆ Pending BOD**, giữ nguyên trạng thái pending trong PRD. |
| Mastery Model (`mastery_mới = mastery_cũ × decay + tín hiệu mới`) | **Thuật ngữ mới** — chưa có entry riêng trong glossary (glossary hiện chỉ có "Mastery Profile / Mastery Map", không mô tả công thức cập nhật). Đề xuất bổ sung entry "Mastery Model" — cần PO xác nhận (xem ❓ Q1 Phase 3). |
| iSpeak | Thuật ngữ đã dùng trong AICNew-01 (Big Class Plus) làm tên một dạng câu hỏi luyện nói trong buổi học, không phải entry glossary riêng — dùng nhất quán cách gọi đó ở đây (phân biệt với module "Edupia Speak/AI Speak" độc lập). |
| Level A / Level B | **THAY THẾ HOÀN TOÀN 2026-09-15** (xem Phase 3, Vòng 3, #7) — PO quyết định bỏ hẳn tên "Level A/B" (đã gây nhầm lẫn qua 2 lần chốt ngược nhau, xem lịch sử ở Vòng 3 #1) vì tự nó không giải thích nghĩa. Tên chính thức dùng từ nay: **"Nhóm A - Củng cố"** (trình độ yếu/trung bình, học giáo viên AI người Việt) và **"Nhóm B - Nâng cao"** (trình độ khá/giỏi, 1 buổi giáo viên AI người Việt + 1 buổi giáo viên AI bản xứ Anh/Mỹ) — đặt tên theo đúng mẫu "Nâng cao/Củng cố" đã dùng ở AICNew-02. ✅ **PO xác nhận tên "Nhóm B - Nâng cao" đúng** (2026-09-15). Toàn bộ BR/AC/UI trong tài liệu này từ nay dùng tên mới; KHÔNG dùng lại "Level A/B" để tránh khôi phục nhầm lẫn cũ. |

---

## Phase 1: Định nghĩa tính năng (Feature Definition)

> ⚠️ PO CHƯA xác nhận trực tiếp — nội dung dưới đây tổng hợp từ tài liệu, cần PO review.

### Bối cảnh (Context)
Nhu cầu học thêm tiếng Anh trực tuyến tăng nhanh (~20%/năm, ảnh hưởng TT29 đẩy thị trường online lên ~33%/năm), nhưng gia sư 1-1 người thật chi phí cao và khó mở rộng, trong khi phần lớn sản phẩm online hiện tại dạy đại trà — không biết chính xác học sinh yếu ở đâu. Concept 1.2 (Big Class Plus) đã giải quyết một phần bằng buổi học nhóm có gán NLO, nhưng bản chất vẫn là dạy đại trà cho nhiều học sinh cùng lúc. AI Tutor 1-1 đi xa hơn: một buổi học 1-kèm-1 thật sự, cá nhân hoá 100% nội dung theo Mastery Profile của từng học sinh, với chi phí chỉ bằng một phần nhỏ gia sư con người (390.000đ/tháng so với gia sư 1-1 truyền thống hàng triệu đồng/tháng).

### Tuyên bố vấn đề (Problem Statement)
Học sinh cần được vá đúng lỗ hổng kiến thức cá nhân trong một buổi học 1-1 thật sự (không phải học nhóm), nhưng gia sư con người quá đắt để duy trì đều đặn, còn các sản phẩm online đại trà không biết chính xác học sinh yếu ở đâu để dạy đúng chỗ.

### Mục tiêu (Goal)
Mỗi buổi học chính khoá 45 phút của AI Tutor 1-1 vừa dạy nội dung bám khung chương trình (SGK Global Success) ở Phần 1, vừa cá nhân hoá hoàn toàn phần luyện tập/hỏi-đáp ở Phần 2 theo đúng NLO học sinh đang yếu nhất (qua Routing Engine), chấm phát âm theo âm vị và cập nhật Mastery Profile theo thời gian thực — để mỗi buổi học đều "vá gọn" đúng lỗ hổng của riêng học sinh đó, không dạy đại trà.

### Actor
| Actor | Vai trò | Chính/Phụ |
|---|---|---|
| Học sinh | Tham gia buổi học, học nội dung Phần 1, trả lời/luyện nói ở Phần 2 | Primary |
| Giáo viên AI (phân theo Nhóm A - Củng cố / Nhóm B - Nâng cao) | Dạy nội dung Phần 1, đặt câu hỏi luyện nói Phần 2, phản hồi + giao bài tập Phần 3 | Primary |
| Routing Engine | Chọn 1-2 NLO ưu tiên cao nhất cho Phần 2 của buổi học đó (nền tảng chung, không phải actor giao diện) | Primary (hệ thống) |
| GVCN | Đồng hành xuyên suốt, theo dõi/báo cáo — cơ chế cụ thể ngoài phạm vi PRD này | Secondary |

### Phạm vi (In Scope)
- Buổi học chính khoá 1-1, 45 phút, 2 buổi/tuần, bám khung chương trình SGK Global Success.
- Phần 1 (20'): dạy nội dung theo slide (video hoạt hình học từ vựng + video hội thoại học ngữ pháp) bởi Giáo viên AI. ⚠️ **Đang brainstorm lại** — PO cần làm rõ có nên giữ video quay sẵn hay chuyển sang tương tác live thật (ảnh hưởng chi phí/tính khả thi kỹ thuật, xem Phase 3 Vòng 3 #2). Business Rule hiện tại (BR3) vẫn mô tả theo slide nguồn, chờ kết luận brainstorm.
- Phần 2 (20'): hỏi đáp & sửa lỗi qua iSpeak — Routing Engine chọn câu hỏi luyện nói theo đúng NLO học sinh đang yếu nhất; AI chấm điểm phát âm theo âm vị (thang 0-100/âm), phản hồi ngay trong buổi.
- Phần 3 (5'): tương tác – phản hồi tổng kết – giao bài tập về nhà (ngay sau buổi).
- Cập nhật Mastery Profile của học sinh theo Mastery Model, thời gian thực sau mỗi tương tác ở Phần 2 (không chỉ cuối buổi). *(PO xác nhận 2026-09-15: bản MVP/demo sẽ giả lập giá trị này, không cần công thức thật ngay — xem Phase 3 Vòng 3 #3.)*
- Phân bổ Giáo viên AI theo Nhóm A - Củng cố / Nhóm B - Nâng cao của học sinh (xem Chuẩn hoá thuật ngữ, Phase 3 Vòng 3 #1/#7).
- Giao diện buổi học có **2 camera** (Giáo viên AI + học sinh), giống layout học 1-1 thật — **PO xác nhận 2026-09-15**.
- Gamification trong buổi học (huy hiệu, thử thách, có thể gồm mini-game như bản concept cũ mô tả — Bắn cung, Đào vàng, Chém hoa quả, Đua xe...) — **PO xác nhận 2026-09-15 là có**, nhưng cơ chế/luật chơi cụ thể **chưa được định nghĩa** (xem Phase 3 Vòng 3 #6) — cần bổ sung Business Rule riêng trước khi PRD hoàn chỉnh.

### Ngoài phạm vi (Out of Scope)
- **Buổi chuyên sâu** (buổi thứ 5, sau mỗi 4 buổi chính khoá) — tài liệu nguồn chưa mô tả cấu trúc nội dung chi tiết. **PO định hướng 2026-09-15**: tham khảo mô hình rẽ nhánh **Nâng cao/Củng cố** đã dùng ở [AICNew-02](../04_delivery/specs/ai-class-core/ai-bo-tro-30-phut/AICNew-02-ai-bo-tro-30-phut.md) (AI Bổ trợ 30 phút, Concept 1.2) khi làm PRD riêng cho buổi chuyên sâu — không tự thiết kế mới từ đầu. Vẫn cần PRD/bổ sung riêng, ngoài phạm vi PRD buổi học chính khoá này.
- **Cơ chế chi tiết của Gamification** (luật chơi cụ thể từng mini-game, cách tính điểm/thưởng) — hướng có gamification đã được PO xác nhận (xem In Scope), nhưng luật chơi cụ thể chưa được định nghĩa, cần bổ sung riêng trước khi viết Business Rule đầy đủ.
- **Xây dựng cơ chế Routing Engine / Mastery Model** (thuật toán, ngưỡng decay...) — thuộc nền tảng chung Adaptive Learning Ecosystem, không phải việc của feature này. Feature này chỉ **tiêu thụ** kết quả Routing Engine trả về và **ghi** tín hiệu vào Mastery Profile theo Mastery Model.
- **AI Practice, AI Speak (nhập vai tình huống), Edupia Club, GVCN** — 4 thành phần còn lại của Concept 3.1 (Slide 14, 16), mỗi thành phần một ticket/PRD riêng.
- **Xác định Nhóm A/B đầu vào ban đầu** (bài kiểm tra phân loại trình độ khi học sinh mới bắt đầu) — feature này chỉ **tiêu thụ** kết quả nhóm đã có sẵn để chọn Giáo viên AI tương ứng, không định nghĩa cách xác định nhóm.
- **Nội dung 1.473 NLO (NLO Taxonomy)** — đã có sẵn.
- **Cấu trúc chi tiết và cách lưu trữ Mastery Profile xuyên suốt các thành phần** — thuộc nền tảng chung.

### User Story
- **Là một (As a)** phụ huynh có con học Edupia AI Tutor 1-1
- **Tôi muốn (I want to)** con được học 1-kèm-1 thật sự với giáo viên AI phù hợp trình độ, mỗi buổi đều luyện đúng chỗ con đang yếu (không lặp lại cái con đã biết)
- **Để (So that)** con vá đúng lỗ hổng kiến thức của riêng mình, với chi phí chỉ bằng một phần nhỏ gia sư người thật

### Phụ thuộc liên service *(mức nghiệp vụ)*
- Cần **Mastery Profile / Adaptive Learning** (nền tảng chung) đã tồn tại để Routing Engine đọc và để feature này ghi tín hiệu cập nhật vào.
- Cần **Routing Engine** (nền tảng chung, hiện ◆ Pending BOD) trả về đúng 1-2 NLO ưu tiên cho Phần 2 mỗi buổi.
- Cần **NLO Taxonomy** (1.473 đơn vị) đã có sẵn.
- Cần dữ liệu **Level đầu vào** của học sinh (từ đâu xác định — ngoài phạm vi, xem Out of Scope) để chọn đúng Giáo viên AI.
- Cần dịch vụ **Giáo viên AI** (giọng nói + hình ảnh nhân hoá theo Level, gồm cả giọng bản xứ Anh/Mỹ cho nhánh liên quan) và dịch vụ **chấm phát âm theo âm vị** đã sẵn sàng — năng lực kỹ thuật lõi, cần rà soát cùng đội kỹ thuật trước khi bàn giao dev chính thức.

---

## Phase 2: Định nghĩa User Flow

> ⚠️ PO CHƯA xác nhận trực tiếp.

### Điểm vào (Entry Point)
Học sinh vào buổi học chính khoá AI Tutor 1-1 đúng lịch đã đăng ký (2 buổi/tuần).

### Các bước của Flow
| Bước | Hành động | Trạng thái/Kết quả nghiệp vụ | Ghi chú |
|------|-----------|------------------------------|---------|
| 1 | Học sinh vào buổi học | Hệ thống xác định Nhóm A/B đầu vào của học sinh để chọn đúng Giáo viên AI | Nguồn dữ liệu nhóm: ngoài phạm vi (xem §1c) |
| 2 | Hệ thống ghép đúng Giáo viên AI theo Nhóm A - Củng cố / Nhóm B - Nâng cao | Giáo viên AI (hình ảnh + giọng nói) sẵn sàng cho buổi học | Ánh xạ nhóm→Giáo viên: **đã chốt**, xem Phase 3 Vòng 3 #7 |
| 3 | Phần 1 (20'): Giáo viên AI dạy theo slide (video hoạt hình từ vựng + video hội thoại ngữ pháp) | Nội dung bám khung chương trình SGK Global Success | ⚠️ Đang brainstorm lại có nên giữ video quay sẵn không (xem Phase 3 Vòng 3 #2) |
| 4 | Phần 2 (20'): Routing Engine chọn 1-2 NLO ưu tiên cao nhất của học sinh | Hệ thống có danh sách câu hỏi luyện nói (iSpeak) tương ứng NLO đó | |
| 5 | Học sinh trả lời câu hỏi luyện nói bằng giọng nói | Hệ thống chấm điểm phát âm theo âm vị (0-100/âm) | |
| 6 | Hệ thống phản hồi ngay kết quả chấm cho học sinh | Phản hồi tức thời trong buổi | |
| 7 | Hệ thống cập nhật Mastery Profile theo Mastery Model ngay sau mỗi lượt (real-time) | Mastery Profile phản ánh đúng kết quả vừa luyện | Không chờ tới cuối buổi mới ghi |
| 8 | Lặp bước 4-7 cho tới hết 20 phút Phần 2 | | Số lượt lặp cụ thể: chưa có nguồn, xem Phase 3 |
| 9 | Phần 3 (5'): Giáo viên AI phản hồi tổng kết buổi + giao bài tập về nhà | Bài tập về nhà tương ứng NLO vừa luyện, giao ngay sau buổi | |
| 10 | Buổi học kết thúc | | |

### Màn hình & thành phần chính
| Màn hình | Thành phần chính | Hành động → kết quả nghiệp vụ |
|----------|------------------|-------------------------------|
| Màn hình buổi học 1-1 (Phần 1 — dạy theo slide) | Video bài giảng (Giáo viên AI), khung 2 camera (Giáo viên AI + học sinh — đã PO xác nhận) | Học sinh vào buổi → hệ thống ghép Giáo viên AI theo Nhóm A/B |
| Màn hình buổi học 1-1 (Phần 2 — luyện nói iSpeak) | Câu hỏi luyện nói, icon mic, kết quả chấm theo âm vị | Học sinh nói → hệ thống chấm điểm + phản hồi ngay |
| Màn hình tổng kết buổi học (Phần 3) | Phản hồi tổng kết của Giáo viên AI, bài tập về nhà được giao | Hiển thị trước khi kết thúc buổi |

> *(AI đề xuất — chưa có Wireframe/Figma thật cho AI Tutor 1-1, xem "Giả định AI" ở PRD Appendix.)*

### Điểm ra (Exit Point)
Buổi học kết thúc với: (1) Phần 1-2-3 đã hoàn tất theo đúng thứ tự và mốc thời gian, (2) Mastery Profile của học sinh đã được cập nhật real-time theo kết quả luyện nói ở Phần 2, (3) bài tập về nhà tương ứng NLO vừa luyện đã được giao.

### Edge Cases / Luồng lỗi & ngoại lệ

> ❓ **Chưa giải quyết — cần PO xác nhận** (khác với AICNew-01, các case dưới đây KHÔNG có nguồn tài liệu mô tả cách xử lý; liệt kê ra để PO trả lời, không tự suy diễn thành Business Rule):
> 1. Học sinh vào trễ buổi học 1-1 → tính thế nào (có được rút ngắn Phần 1 để vẫn kết thúc đúng giờ, hay lùi giờ kết thúc)?
> 2. Học sinh mất kết nối/thoát giữa buổi rồi quay lại → xử lý ra sao (buổi học 1-1 có tạm dừng chờ hay tiếp tục chạy)?
> 3. Học sinh không nói được / mic lỗi ở Phần 2 (iSpeak) → có tính là "không trả lời" giống BR7 của Big Class Plus (AICNew-01) không, hay có cơ chế khác vì đây là 1-1 (không có nghĩa "làm chậm cả lớp")?
> 4. Nhóm A/B đầu vào của học sinh chưa được xác định (học sinh mới, chưa qua bài kiểm tra phân loại) → ghép Giáo viên AI mặc định nào?
> 5. Học sinh nghỉ một buổi chính khoá → buổi chuyên sâu (mốc "sau mỗi 4 buổi") có bị lùi theo không, hay tính theo lịch cố định?
> 6. Routing Engine không trả được NLO ưu tiên (lỗi/timeout) → Phần 2 xử lý thế nào (có nội dung dự phòng không)?

---

## Phase 3: Nhật ký làm rõ (Clarification Log)

### Vòng 1 — Xung đột dữ liệu phát hiện khi đối chiếu nguồn

| # | Nhóm | Vấn đề | Trạng thái |
|---|------|--------|-----------|
| 1 | Xung đột dữ liệu | **Ánh xạ Level → Giáo viên AI mâu thuẫn ngay trong cùng tài liệu nguồn (bản "final"):** Slide 8 ghi "Level B/C/D học giáo viên AI người Việt; Level A học thêm 1 buổi giáo viên AI bản xứ Anh/Mỹ" (Level A = trình độ cao hơn, có thêm giáo viên bản xứ). Slide 15 ghi ngược lại: "Level A (yếu/trung bình): giáo viên AI người Việt... Level B (khá/giỏi): 1 buổi giáo viên AI người Việt + 1 buổi giáo viên AI bản xứ" (Level A = trình độ thấp hơn). Đây có vẻ là phần dư sót lại từ phương án cũ (Level A/B/C/D, xem `concept-3-ai-tutor-1-1-2026-08-27.md` — đã bị thay thế) chưa được dọn hết khi rút gọn còn Level A/B. | ✅ **PO chốt 2026-09-10: Slide 15 đúng — Level A = yếu/trung bình (giáo viên AI người Việt); Level B = khá/giỏi (1 buổi giáo viên AI người Việt + 1 buổi giáo viên AI bản xứ Anh/Mỹ). Slide 8 là phần dư lỗi thời, không dùng.** |
| 2 | Xung đột dữ liệu | Giá bán: slide nguồn (final, Slide 8) ghi cố định **390.000đ/tháng**. Meeting note 2026-08-28 (trước bản final, mô tả "Concept 2: AI Tutor 1-1") ghi mức giá khảo sát **390.000đ - 450.000đ/tháng**. | ❓ **Đã có khả năng đây là do meeting note thuộc giai đoạn khảo sát giá trước khi chốt, còn slide final đã chốt 390k — cần PO xác nhận 390k là giá đã chốt cuối cùng, không phải khoảng khảo sát.** *(Không ảnh hưởng trực tiếp tới business rule của PRD này, chỉ ghi nhận để tránh dùng nhầm số liệu giá ở tài liệu khác.)* |
| 3 | Thông tin chưa đủ | Meeting note 2026-08-28 mô tả giao diện "chia khu vực: Cam học sinh, bảng tương tác thông minh, khung chat" và "AI Tutor có quyền kiểm soát mic của con, nghe con nói, sửa lỗi ngay bằng giọng nói", cùng gamification (Bắn cung, Đào vàng, Chém hoa quả, Đua xe...). Đây là mô tả của bản concept **trước** bản "final" 2026-09-04 (thuộc giai đoạn Level A/B/C/D đã bị thay thế) — không chắc còn đúng với bản final. | ❓ **Cần PO xác nhận các chi tiết UI/gamification này có còn áp dụng cho bản Concept 3.1 final hay đã bị bỏ cùng với phương án Level A/B/C/D.** Tài liệu PRD này **không** dùng các chi tiết đó làm Business Rule chính thức — chỉ liệt kê ở đây để tránh bỏ sót nếu PO xác nhận vẫn còn hiệu lực. |

### Vòng 2 — PO chốt trực tiếp (2026-09-10)

| # | Nhóm | Câu hỏi | PO trả lời |
|---|------|---------|------------|
| 1 | Rule mâu thuẫn (Vòng 1, #1) | Ánh xạ Level → Giáo viên AI: Slide 8 hay Slide 15 đúng? | **Level A = trình độ yếu/trung bình; Level B = trình độ khá/giỏi** (khớp Slide 15). Slide 8 lỗi thời, không dùng. |

> ⚠️ **SUPERSEDED bởi Vòng 3 #1 dưới đây** — khi đối chiếu tiếp với meeting note 2026-08-28 (đánh dấu "Thống nhất lựa chọn") và một xác nhận trực tiếp khác của PO ngày 2026-09-03 (đã lưu trong hệ thống trước đó), phát hiện cả hai đều nói **ngược lại** câu trả lời Vòng 2 này (Level A = khá/giỏi, không phải yếu/trung bình). Xem Vòng 3 #1 để biết kết luận cuối cùng — tài liệu này **không xoá** câu trả lời Vòng 2 để giữ lại lịch sử, nhưng **không dùng** nó làm căn cứ nữa.

### Vòng 3 — PO chốt bổ sung (2026-09-15, trả lời câu hỏi tổng hợp từ đối chiếu meeting note)

| # | Nhóm | Câu hỏi | PO trả lời |
|---|------|---------|------------|
| 1 | Rule mâu thuẫn (lịch sử 3 lớp) | Level A thật sự là khá/giỏi (theo xác nhận 03/09 + meeting note 28/08 + Slide 8) hay yếu/trung bình (theo Vòng 2, Slide 15)? | **"Xác nhận theo ngày 03/09"** — tức **Level A (cũ) = khá/giỏi**, khớp Slide 8 và meeting note 28/08; Vòng 2 (09/10, dựa Slide 15) là câu trả lời sai, không dùng nữa. **Đồng thời PO quyết định đổi hẳn sang tên mới "Nhóm A/B" (xem #7) để việc này không lặp lại** — tên mới không kế thừa nghĩa chữ cái từ "Level A/B" cũ (xem cảnh báo ở #7). |
| 2 | Thông tin chưa đủ (Vòng 1 #... mới) | Phần 1 (20') dùng video quay sẵn hay tương tác live thật? | **Chưa chốt — cần làm rõ và brainstorm thêm**, vì liên quan trực tiếp tới tính khả thi kỹ thuật và chi phí vận hành (AI live 1-1 thời gian thực tốn kém hơn nhiều so với phát video + AI Voice đè lên). BR3 giữ nguyên theo slide nguồn (video quay sẵn) cho tới khi có kết luận brainstorm. |
| 3 | Thông tin chưa đủ (Q2 PRD) | Giá trị `decay`/cách quy đổi tín hiệu Mastery Model dùng số nào? | **Bản MVP/demo sẽ giả lập (mock) giá trị này** — không chặn việc dựng demo. Vẫn cần giá trị thật từ đội thuật toán trước khi bàn giao dev sản xuất. |
| 4 | Thông tin chưa đủ (buổi chuyên sâu) | Cấu trúc buổi chuyên sâu (buổi thứ 5) nên dựa theo đâu? | **Tham khảo mô hình rẽ nhánh Nâng cao/Củng cố của AICNew-02** (AI Bổ trợ 30 phút, Concept 1.2) — không tự thiết kế mới. Vẫn cần một PRD riêng, đủ chi tiết mới viết được Business Rule. |
| 5 | Thông tin chưa đủ (giao diện) | Giao diện buổi học có camera riêng cho giáo viên AI không, hay chỉ có cam học sinh + bảng tương tác (theo meeting note 28/08)? | **Có camera giáo viên — 2 camera, đúng như buổi học 1-1 thật.** Slide 15 đúng, meeting note 28/08 (mô tả cũ hơn) không dùng cho chi tiết này. |
| 6 | Thông tin chưa đủ (gamification) | Gamification (Bắn cung, Đào vàng, Chém hoa quả, Đua xe... theo meeting note 28/08) có còn trong Concept 3.1 không? | **Có** — xác nhận gamification vẫn thuộc phạm vi. Cơ chế/luật chơi cụ thể của từng mini-game **chưa được định nghĩa**, cần bổ sung trước khi viết Business Rule đầy đủ (xem Out of Scope). |
| 7 | Đặt tên | Có nên đổi tên "Level A/B" (đã gây nhầm lẫn 2 lần) không, đổi thành gì? | **Có — đổi tên hẳn.** PO cho: **"Nhóm A - Củng cố"** (yếu/trung bình). ✅ **PO xác nhận thêm (2026-09-15): "Nhóm B - Nâng cao"** (khá/giỏi) đúng — không đổi tên khác. ⚠️ **Lưu ý quan trọng**: tên mới KHÔNG kế thừa nghĩa chữ cái từ "Level A/B" cũ — dưới hệ cũ (03/09, meeting note, Slide 8) "A" nghĩa là khá/giỏi; dưới hệ mới (tên tự giải thích) "Nhóm A" lại là yếu/trung bình. Trùng chữ cái là ngẫu nhiên do PO chọn ví dụ, không phải kế thừa. Từ nay đọc theo tên đầy đủ ("Nhóm A - Củng cố"/"Nhóm B - Nâng cao"), không suy luận riêng từ chữ cái. |

### Mục chưa giải quyết
- 6 edge case liệt kê ở Phase 2 (mục "Edge Cases / Luồng lỗi & ngoại lệ") — riêng edge case #4 nay đổi thành "Nhóm A/B chưa xác định".
- Phần 1 dùng video quay sẵn hay live thật — **đang brainstorm** (Vòng 3 #2), chưa có kết luận cuối.
- Cấu trúc chi tiết buổi chuyên sâu (buổi thứ 5) — đã có mô hình tham khảo (AICNew-02) nhưng chưa viết thành PRD cụ thể (Vòng 3 #4).
- Cơ chế/luật chơi cụ thể của gamification (Vòng 3 #6).
- Giá trị `decay` thật của Mastery Model (Vòng 3 #3 — không chặn demo, chỉ chặn bản dev sản xuất).
- ~~Xung đột ánh xạ Level/Nhóm→Giáo viên~~ — **đã chốt dứt điểm ở Vòng 3 #1 + #7**, không còn là mục chưa giải quyết.
- ~~Tên "Nhóm B - Nâng cao"~~ — **PO xác nhận đúng 2026-09-15**, không còn là mục chưa giải quyết.

---

## Phase 4: Business Rules

> ⚠️ PO CHƯA xác nhận trực tiếp toàn bộ, **trừ BR-1 (ánh xạ Nhóm A/B)** — đã chốt dứt điểm với PO 2026-09-15 (xem Phase 3, Vòng 3, #1/#7).

| Rule ID | Hành động/Trigger | Quy tắc | Điều kiện |
|---------|---------------------|---------------------|------------------------|
| BR-1 | Học sinh vào buổi học chính khoá | Hệ thống PHẢI ghép đúng Giáo viên AI theo nhóm trình độ đã có sẵn của học sinh: **Nhóm A - Củng cố (yếu/trung bình) → giáo viên AI người Việt** cho cả 2 buổi/tuần; **Nhóm B - Nâng cao (khá/giỏi) → 1 buổi giáo viên AI người Việt (ngữ pháp chuyên sâu) + 1 buổi giáo viên AI bản xứ Anh/Mỹ (luyện giao tiếp)** | Nhóm đã được xác định trước đó (ngoài phạm vi PRD này) |
| BR-2 | Bắt đầu buổi học | Hệ thống PHẢI chạy đúng thứ tự 3 phần: Phần 1 (20') → Phần 2 (20') → Phần 3 (5') | Buổi học chính khoá (không áp dụng cho buổi chuyên sâu — ngoài phạm vi) |
| BR-3 | Phần 1 | Giáo viên AI PHẢI dạy nội dung bám khung chương trình SGK Global Success (video hoạt hình từ vựng + video hội thoại ngữ pháp) | |
| BR-4 | Bắt đầu Phần 2 | Routing Engine PHẢI chọn 1-2 NLO ưu tiên cao nhất hiện tại của học sinh làm nội dung câu hỏi luyện nói | |
| BR-5 | Học sinh trả lời câu hỏi luyện nói (Phần 2) | Hệ thống PHẢI chấm điểm phát âm theo âm vị, thang 0-100 mỗi âm, và phản hồi ngay trong buổi | |
| BR-6 | Sau mỗi lượt chấm ở Phần 2 | Hệ thống PHẢI cập nhật Mastery Profile của học sinh theo Mastery Model, ngay lập tức (không chờ cuối buổi) | |
| BR-7 | Phần 3 | Giáo viên AI PHẢI đưa phản hồi tổng kết buổi và giao bài tập về nhà tương ứng NLO vừa luyện ở Phần 2 | |

> **Ghi chú:** thứ tự buổi nào (trong 2 buổi/tuần) dùng giáo viên người Việt và buổi nào dùng giáo viên bản xứ cho Level B — tài liệu nguồn không nêu cụ thể, PRD không tự đặt thứ tự (tránh suy diễn thêm ngoài phần PO đã chốt).

---

## Phase 5: Business Logic

> ⚠️ PO CHƯA xác nhận trực tiếp.

| Rule ID | Logic nghiệp vụ (rẽ nhánh / công thức / điều kiện) | Thông báo/kết quả nghiệp vụ khi lỗi |
|---------|---------------------------------------------------|-------------------------------------|
| BR-1 | Đọc nhóm trình độ của học sinh (nguồn dữ liệu ngoài phạm vi) → nếu Nhóm A - Củng cố: khởi tạo giáo viên AI người Việt cho buổi học; nếu Nhóm B - Nâng cao: khởi tạo giáo viên AI người Việt hoặc bản xứ theo đúng lịch xen kẽ 1-1 mỗi tuần (thứ tự cụ thể: chưa có nguồn) | Nhóm chưa xác định → xem edge case #4 (chưa giải quyết) |
| BR-2 | Đếm mốc thời gian buổi học: 0-20' = Phần 1, 20-40' = Phần 2, 40-45' = Phần 3 | — |
| BR-3 | Phát nội dung Phần 1 theo đúng tiến độ chương trình đã lên (không cá nhân hoá thứ tự bài — giống mọi học sinh cùng tiến độ) | — |
| BR-4 | Gọi Routing Engine với input = Mastery Profile hiện tại của học sinh → nhận về 1-2 NLO ưu tiên (công thức `priority = ppct_weight × (1−mastery) × prereq_boost`, thuộc nền tảng chung) → map NLO sang bộ câu hỏi luyện nói tương ứng | Routing Engine lỗi/timeout → xem edge case #6 (chưa giải quyết) |
| BR-5 | Học sinh nói câu trả lời → mô hình chấm phát âm phân tích theo từng âm vị trong câu → trả điểm 0-100 cho mỗi âm → tổng hợp hiển thị cho học sinh | Học sinh không nói được/mic lỗi → xem edge case #3 (chưa giải quyết) |
| BR-6 | Với mỗi âm/NLO vừa chấm ở BR-5: `mastery_mới = mastery_cũ × decay + tín hiệu mới` (giá trị `decay` và cách quy đổi điểm chấm âm vị thành "tín hiệu mới": **công thức gốc không nêu cụ thể**, chỉ nêu dạng tổng quát — cần đội kỹ thuật/thuật toán xác nhận trước khi bàn giao dev) → ghi đè giá trị mastery mới cho đúng NLO đó trong Mastery Profile | — |
| BR-7 | Tổng hợp danh sách NLO vừa luyện ở Phần 2 (kèm điểm) → Giáo viên AI sinh phản hồi tổng kết + đề xuất bài tập về nhà tương ứng đúng NLO đó | — |

> **Note BR-1:** Ánh xạ nhóm→Giáo viên đã được PO chốt dứt điểm 2026-09-15 (Phase 3, Vòng 3, #1 + #7): về mặt trình độ, nhóm yếu/trung bình khớp Slide 8 + meeting note 28/08 + xác nhận PO 03/09 (KHÔNG phải Slide 15 như Vòng 2 từng chốt tạm — xem cảnh báo SUPERSEDED ở Vòng 2). Tên gọi chính thức đã đổi thành "Nhóm A - Củng cố" / "Nhóm B - Nâng cao" để tránh nhầm với "Level A/B" cũ. Thứ tự cụ thể buổi nào trong tuần dùng giáo viên bản xứ (với Nhóm B) vẫn chưa có nguồn — không tự suy diễn thêm.
>
> **Note BR-6:** Đây là công thức duy nhất được cấp trong tài liệu nguồn (Slide 17) — nó mô tả *dạng* mô hình (exponential-decay-like), không phải giá trị `decay` cụ thể hay cách quy đổi điểm âm vị 0-100 thành "tín hiệu mới" trong công thức. Đây là chi tiết thuật toán thuộc nền tảng chung Adaptive Learning (ngoài phạm vi PRD này theo §1b), nhưng ghi lại ở đây vì Business Logic BR-6 cần tham chiếu tới nó.

---

## Phase 6: Acceptance Criteria

> ⚠️ PO CHƯA xác nhận trực tiếp.

| AC ID | Mô tả | Hành vi kỳ vọng | Bắt nguồn từ |
|-------|------------------------|---------------------------|--------------|
| AC-1 | Ghép đúng Giáo viên AI theo nhóm | Học sinh Nhóm A - Củng cố → ghép giáo viên AI người Việt; học sinh Nhóm B - Nâng cao → ghép giáo viên AI người Việt hoặc bản xứ theo đúng lịch xen kẽ 1-1 mỗi tuần | BR-1 |
| AC-2 | Đúng thứ tự và mốc thời gian 3 phần | Buổi học chạy đúng thứ tự Phần 1 (20') → Phần 2 (20') → Phần 3 (5') | BR-2 |
| AC-3 | Phần 1 bám chương trình | Nội dung Phần 1 đúng tiến độ khung chương trình SGK Global Success đã lên cho buổi đó | BR-3 |
| AC-4 | Routing Engine chọn đúng NLO ưu tiên | Đầu Phần 2 → hệ thống hiển thị câu hỏi luyện nói đúng NLO Routing Engine vừa chọn (1-2 NLO ưu tiên cao nhất theo Mastery Profile hiện tại) | BR-4 |
| AC-5 | Chấm điểm phát âm theo âm vị, phản hồi ngay | Học sinh nói câu trả lời → hệ thống trả điểm 0-100 cho từng âm và hiển thị ngay trong buổi (không trễ tới cuối buổi) | BR-5 |
| AC-6 | Cập nhật Mastery Profile real-time | Ngay sau mỗi lượt chấm ở Phần 2 → Mastery Profile của học sinh được cập nhật theo đúng công thức Mastery Model, không chờ tới cuối buổi | BR-6 |
| AC-7 | Phản hồi tổng kết + giao bài tập đúng NLO | Cuối buổi (Phần 3) → Giáo viên AI đưa phản hồi tổng kết và bài tập về nhà đúng NLO vừa luyện ở Phần 2 | BR-7 |

---

## Phase 7: Báo cáo kiểm chứng (Validation Report)

### Ma trận độ phủ (Coverage Matrix)
| Hành động Flow | Có Rule? | Có Logic? | Có AC? | Status |
|----------------|----------|-----------|--------|--------|
| 1-2. Ghép Giáo viên AI theo nhóm | ✅ BR-1 | ✅ | ✅ AC-1 | OK — ánh xạ nhóm đã PO chốt dứt điểm 2026-09-15 |
| 3. Phần 1 — dạy theo slide | ✅ BR-3 | ✅ | ✅ AC-3 | OK |
| 4-5. Phần 2 — Routing Engine chọn NLO, chấm phát âm | ✅ BR-4/5 | ✅ | ✅ AC-4/5 | OK |
| 6-7. Cập nhật Mastery Profile real-time | ✅ BR-6 | ✅ (dạng tổng quát) | ✅ AC-6 | ⚠️ OK nhưng giá trị `decay` cụ thể chưa có — cần kỹ thuật xác nhận |
| 8. Lặp Phần 2 tới hết giờ | — | — | — | ❓ Số lượt lặp cụ thể chưa có nguồn |
| 9. Phần 3 — phản hồi + giao bài | ✅ BR-7 | ✅ | ✅ AC-7 | OK |
| 10. Kết thúc buổi | — | — | — | OK |

### Xung đột phát hiện
- ~~Xung đột #1 (Phase 3, Vòng 1)~~: ánh xạ Level→Giáo viên AI mâu thuẫn giữa Slide 8 và Slide 15 — **đã giải quyết dứt điểm 2026-09-15** (Vòng 3 #1: Slide 8/meeting note/xác nhận 03-09 đúng, KHÔNG phải Slide 15; đồng thời đổi tên hẳn sang "Nhóm A/B" — xem Vòng 3 #7). Lưu ý: Vòng 2 (09-10) từng chốt tạm theo hướng ngược lại — đã bị supersede, không dùng.
- Xung đột #2 (giá khảo sát cũ) — không ảnh hưởng trực tiếp BR của PRD này, chỉ ghi nhận để tránh nhầm ở tài liệu khác.
- ~~Xung đột #3 (giao diện, gamification)~~: **đã làm rõ một phần 2026-09-15** — giao diện 2 camera đúng theo Slide 15 (Vòng 3 #5); gamification xác nhận có (Vòng 3 #6), nhưng cơ chế cụ thể vẫn thiếu — xem Mục còn thiếu.

### Mục còn thiếu
- Phần 1 dùng video quay sẵn hay live thật — **đang brainstorm** (Vòng 3 #2), ảnh hưởng chi phí/tính khả thi.
- Cấu trúc nội dung chi tiết buổi chuyên sâu (buổi thứ 5) — đã có mô hình tham khảo (AICNew-02 Nâng cao/Củng cố, Vòng 3 #4) nhưng chưa đủ chi tiết để viết BR.
- Cơ chế/luật chơi cụ thể của gamification (Vòng 3 #6).
- 6 edge case ở Phase 2 (vào trễ, mất kết nối, mic lỗi, nhóm chưa xác định, nghỉ buổi ảnh hưởng lịch buổi chuyên sâu, Routing Engine lỗi).
- Giá trị cụ thể `decay` trong Mastery Model và cách quy đổi điểm âm vị thành "tín hiệu mới" (BR-6) — **không chặn MVP/demo** (PO xác nhận sẽ mock, Vòng 3 #3), chỉ chặn bản dev sản xuất thật.
- Số lượt lặp câu hỏi cụ thể trong 20 phút Phần 2.
- ~~Tên "Nhóm B - Nâng cao"~~ — **PO xác nhận đúng 2026-09-15** (Vòng 3 #7), không còn thiếu.

> Các mục này được mang nguyên sang PRD dưới dạng "Giả định AI" / câu hỏi `[AI DRAFT]` ở Appendix, theo đúng quy tắc của `/generate-prd` khi Phase 7 còn mục chưa giải quyết — **không** tự bịa thêm để lấp đầy coverage.

---

<!--
  NEXT STEPS:
  Khi PO đã review Product Definition này (đặc biệt Xung đột #1), chạy:
  /generate-prd 00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md
  để sinh PRD từ Product Definition này.
-->

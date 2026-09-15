# Brainstorm — Kiến trúc kỹ thuật cho buổi học chính khoá AI Tutor 1-1 (AICNew-03)

> Đầu vào cho việc chốt **Giả định AI Q7** trong [PRD AICNew-03](../../../04_delivery/specs/ai-tutor/ai-tutor-1-1-buoi-hoc/AICNew-03-ai-tutor-1-1-buoi-hoc.md) (Phần 1 dùng video quay sẵn hay tương tác live thật). Hội tụ từ phiên trao đổi trực tiếp với PO ngày 2026-09-15, sau khi phát hiện 2 biên bản họp liên quan trực tiếp tới câu hỏi chi phí/khả thi:
> - `00_context/meeting-notes/2026-09-11-adaptive-learning-ai-tutor-strategy.md` — 2 kịch bản kỹ thuật chính thức của công ty (xem bên dưới)
> - `00_context/meeting-notes/2026-09-15-cogs-pl-feasibility-bod-report.md` — cấu trúc COGS, trần ngân sách AI, cảnh báo rủi ro chi phí

## Bối cảnh — 2 kịch bản chính thức công ty đã đặt tên (chưa chọn)

Công ty chưa chốt giữa Concept 1.2 (Plus) và Concept 3.1 (AI 1-on-1) — quyết định dự kiến tháng 10-11/2026 sau test-sale. Với riêng phần kỹ thuật AI Tutor, công ty đã đặt 2 kịch bản với mốc hoàn thành khác nhau:

| Kịch bản chính thức | Mô tả | Mốc hoàn thành |
|---|---|---|
| 1 — "Adaptive thông thường" | Buổi 30 phút: video quay sẵn/ghép nối + voiceover + "fake video khen ngợi đơn giản" | 03/2027 |
| 2 — "AI Tutor Real-time chuẩn" | Tương tác thời gian thực như gia sư thật | 06/2027 |

Ràng buộc tài chính đã chốt (biên bản 15/09): giá bán 400k/tháng (+150k so với 250k), chia 50-50-50 (Marketing/COGS/lợi nhuận). Khoản +50k COGS phải chia cho 4 mục (nội dung/quay dựng, GVCN, hạ tầng AI, vận hành lớp) — quy về 8 buổi/tháng → **trần chung ~6.000đ/buổi cho cả 4 mục** (không riêng AI). Cảnh báo rõ trong biên bản: *"Không được lạm dụng AI để tạo nội dung real-time... đắt hơn thuê giáo viên thật → lỗ nặng."* Công ty cũng đã tự POC nội bộ tính năng "AI Talk/Video Call" và tự chấm **7/10** — chưa đạt chuẩn hoàn thiện.

Câu hỏi cần trả lời: buổi học chính khoá AI Tutor 1-1 (45', cấu trúc Phần 1/2/3 theo Slide 15) nên đi theo hướng nào, và có phương án lai nào tối ưu hơn 2 kịch bản gốc không?

## 3 kịch bản đã brainstorm

### Kịch bản A — Hybrid 85/15, cá nhân hoá theo Mastery Profile

- Nội dung giảng (video/câu hỏi luyện nói) **quay sẵn, dùng chung** — nhưng việc **chọn** nội dung nào (theo NLO ưu tiên từ Routing Engine) là cá nhân hoá thật.
- Phần AI thật (15%): học sinh trả lời → STT + mô hình chấm âm vị (đã trưởng thành, không phải LLM) → ghi ngay vào Mastery Profile → **chọn** (không sinh mới) 1 trong vài phản hồi mẫu, dựa trên điểm vừa chấm + lịch sử Mastery Profile của đúng NLO đó.
- Không có hội thoại tự do — AI không cần "hiểu" nội dung tự do học sinh nói.
- Vị trí: gần **Kịch bản 1 chính thức**, nâng cấp bằng cá nhân hoá dữ liệu thật (không phải "fake video đơn giản").
- Rủi ro định vị: về bản chất tương tác gần giống Big Class Plus (AICNew-01) đã có — có thể yếu về USP "gia sư 1-1 thật".

### Kịch bản B — Giáo viên AI lip-sync xuyên suốt + cửa sổ tương tác mở

- Giáo viên AI hiện diện xuyên suốt buổi qua **video lip-sync** (không phải video người thật rời rạc) — nhưng **phần giảng bài là quay/gen sẵn, dùng chung cho mọi học sinh** (PO xác nhận — bản chất chi phí giống Kịch bản A).
- Đầu buổi: voice chào (cá nhân hoá tên, giống AI Voice ở Big Class Plus). Cuối buổi: voice nhận xét.
- Trong buổi: xen kẽ theo mốc cố định (vd sau mỗi 5/20 phút) → mở **cửa sổ tương tác** cho học sinh nói chuyện với giáo viên AI.
- **Nhánh đã chọn (PO xác nhận): phạm vi trả lời MỞ** — AI phải hiểu câu hỏi tự do trong 1 chủ đề rộng (có rào chắn nội dung), không phải bộ Q&A hữu hạn → cần LLM sinh câu trả lời mới + TTS + **lip-sync render real-time** cho đoạn trả lời.
- Vị trí: về bản chất kỹ thuật **chính là Kịch bản 2 chính thức**, chỉ giới hạn chủ đề được hỏi (không giảm được chi phí compute).
- Phụ thuộc trực tiếp năng lực "AI Talk" (7/10, chưa đạt chuẩn).
- USP mạnh nhất trong 3 kịch bản — đúng cảm giác "gia sư 1-1 thật".

### Kịch bản C — Giáo viên AI lip-sync xuyên suốt + cửa sổ tương tác đóng

- Giữ nguyên trải nghiệm hình ảnh của B (giáo viên AI hiện diện xuyên suốt, có vẻ đang hỏi-đáp thật).
- Nhưng thu hẹp phạm vi trả lời về **nhánh đóng**: bộ câu hỏi-trả lời **hữu hạn** được chuẩn bị + lip-sync **sẵn** cho từng clip trả lời. Khi học sinh hỏi → chỉ cần **nhận diện ý định** (intent matching, nhẹ) để khớp đúng clip, không sinh nội dung mới.
- Vị trí: "B mượn hình ảnh, A mượn kinh tế" — gần Kịch bản 1 nâng cấp, nhưng trải nghiệm hình ảnh phong phú hơn A.
- Đánh đổi: cần thiết kế **fallback rõ ràng** khi học sinh hỏi ngoài bộ đã chuẩn bị (im lặng lịch sự? mời hỏi lại? chuyển GVCN?) — chưa có lời giải.
- Chi phí sản xuất ban đầu cao hơn A (cần lip-sync nhiều clip trả lời dự kiến hơn) nhưng thấp hơn B nhiều.

## Bảng so sánh 3 kịch bản

| Tiêu chí | A — Hybrid 85/15 | B — Lip-sync, hội thoại mở | C — Lip-sync, hội thoại đóng |
|---|---|---|---|
| Phần giảng bài | Quay sẵn, dùng chung | Quay sẵn, dùng chung | Quay sẵn, dùng chung |
| Cơ chế tương tác | Câu hỏi cho sẵn → chấm điểm → chọn phản hồi mẫu | Hỏi tự do (có rào chắn chủ đề) → LLM sinh trả lời → TTS+lip-sync real-time | Hỏi tự do → nhận diện ý định → khớp 1 trong bộ Q&A hữu hạn đã lip-sync sẵn |
| Chi phí AI real-time/buổi | Thấp | **Cao — rủi ro vượt trần COGS** | Thấp — gần A |
| Phụ thuộc AI Talk (7/10) | Không | **Có, trực tiếp** | Không (chỉ cần intent matching, nhẹ hơn) |
| Rủi ro nội dung/an toàn | Thấp | Cao | Trung bình (cần fallback tốt) |
| USP "gia sư 1-1 thật" | Yếu hơn | Mạnh nhất | Mạnh — gần bằng B |
| Cá nhân hoá | Theo Mastery Profile (chọn nội dung/phản hồi) | Sâu nhất (hội thoại mở) | Trung bình (đúng ý định, trong bộ hữu hạn) |
| Chi phí sản xuất ban đầu | Trung bình | Cao nhất | Cao hơn A, thấp hơn B nhiều |
| Vị trí so với kịch bản chính thức | ~ Kịch bản 1 nâng cấp | **~ chính là Kịch bản 2** (thu hẹp chủ đề, không giảm cost) | ~ Kịch bản 1 nâng cấp trải nghiệm hình ảnh |
| Mốc thời gian khả thi | ~03/2027 | ~06/2027 | ~03/2027 (chậm hơn A một chút) |
| Trần COGS 6.000đ/buổi | Khả năng nằm trong trần | **Rủi ro cao vượt trần** | Khả năng nằm trong trần |

## Ước tính chi phí minh hoạ cho Kịch bản B (nhánh mở)

⚠️ **Đây là ước tính minh hoạ dùng đơn giá thị trường phổ biến, KHÔNG phải giá Edupia đã đàm phán với vendor.** Mục đích: xác định thành phần rủi ro chi phí lớn nhất, không phải chốt ngân sách. Số thật cần lấy từ đội Kiên (action item COGS đã giao trong biên bản 15/09).

**Giả định mô hình**: 5 cửa sổ tương tác/buổi, mỗi cửa sổ 1 lượt hỏi-đáp (học sinh nói ~15s, AI trả lời ~20s).

| Thành phần/lượt | Đơn giá thị trường (minh hoạ) | Chi phí/lượt |
|---|---|---|
| STT (15s) | ~$0.006-0.024/phút | ~$0.0015-0.006 |
| LLM (hiểu + soạn trả lời ngắn) | ~$0.002-0.02/lượt | ~$0.002-0.02 |
| TTS (~500 ký tự) | ~$0.000015/ký tự | ~$0.0075 |
| **Lip-sync render video (20s)** | ~$0.01-0.05/giây | **~$0.20-1.00** |

- **Có lip-sync real-time cho đoạn trả lời**: ~$0.21-1.03/lượt × 5 = **$1.05-5.15/buổi ≈ 26.000đ-129.000đ/buổi** — vượt xa trần 6.000đ/buổi, kể cả mức thấp nhất.
- **Không lip-sync (chỉ audio khi trả lời)**: ~$0.011-0.10/lượt × 5 = **$0.055-0.5/buổi ≈ 1.375đ-12.500đ/buổi** — mức thấp nằm gọn trong trần, mức cao vẫn có thể vượt tuỳ model LLM/TTS chọn.

**Kết luận quan trọng nhất**: **lip-sync render real-time cho đoạn trả lời là thành phần quyết định khả thi tài chính** — chiếm phần lớn chi phí, lớn hơn hẳn STT/LLM/TTS cộng lại. Nếu bỏ lip-sync real-time riêng cho đoạn trả lời (giáo viên AI ở tư thế tĩnh/animation nhẹ + chỉ có giọng lúc trả lời), chi phí có khả năng lọt vào trần COGS.

## Việc cần làm tiếp trước khi chốt kịch bản

1. Xin báo giá thật cho riêng hạng mục **lip-sync/avatar render real-time** từ đội Kiên — biến số rủi ro cao nhất.
2. Đánh giá phương án "trả lời chỉ có giọng, không lip-sync real-time" cho Kịch bản B như cách giảm rủi ro chi phí mà vẫn giữ phần lớn USP hội thoại mở.
3. Làm bảng COGS chi tiết cho cả 3 kịch bản (đã là action item chung của đội Sản phẩm, mốc "ngay sau họp" 15/09) — dùng bảng so sánh này làm input.
4. Thiết kế fallback cho Kịch bản C khi học sinh hỏi ngoài bộ Q&A đã chuẩn bị.
5. Đối chiếu lại với đội Kiên: năng lực "AI Talk" (7/10) có thể nâng lên đạt chuẩn trong khung thời gian test-sale tháng 10 không — quyết định trực tiếp tính khả thi của B.
6. Sau khi chọn hướng, cập nhật **Giả định AI Q7** của [PRD AICNew-03](../../../04_delivery/specs/ai-tutor/ai-tutor-1-1-buoi-hoc/AICNew-03-ai-tutor-1-1-buoi-hoc.md) và BR3/AC3 tương ứng.

## Nguồn tham khảo

- [PRD AICNew-03](../../../04_delivery/specs/ai-tutor/ai-tutor-1-1-buoi-hoc/AICNew-03-ai-tutor-1-1-buoi-hoc.md) — Giả định AI Q7
- [Product Definition AICNew-03](../../../00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md)
- [Biên bản 2026-09-11 — Chiến lược Adaptive Learning & AI Tutor](../../../00_context/meeting-notes/2026-09-11-adaptive-learning-ai-tutor-strategy.md)
- [Biên bản 2026-09-15 — COGS/P&L & Tính khả thi](../../../00_context/meeting-notes/2026-09-15-cogs-pl-feasibility-bod-report.md)
- [AICNew-01 Big Class Plus](../../../04_delivery/specs/ai-class-core/big-class-plus/AICNew-01-big-class-plus.md) — tham khảo cơ chế GV Star + AI Voice (tương tự Kịch bản A)
- [AICNew-02 AI Bổ trợ 30 phút](../../../04_delivery/specs/ai-class-core/ai-bo-tro-30-phut/AICNew-02-ai-bo-tro-30-phut.md) — tham khảo mô hình rẽ nhánh Nâng cao/Củng cố

# Product Glossary

Canonical definitions for Edupia product and domain terminology.
Source: Concept document T8/2026 — Edupia Class 4 Concept Final.

## Rules

- Do not silently redefine an existing term.
- When two documents use conflicting definitions, flag the conflict.
- Proposed terminology changes should be recorded as a product decision in `06_decisions/`.

## Terms

| Term | Definition | Status |
|---|---|---|
| **Edupia Class** | Sản phẩm học tiếng Anh trực tuyến phổ thông (mass) duy nhất của Educa. Giá 390k VND/tháng. Đây là tên chính thức duy nhất — không dùng "AI Class" hay "UniClass" thay thế. | Confirmed |
| **Edupia Club** | Nền tảng hoạt động bổ trợ có sẵn ở tất cả 4 concept — không phải điểm khác biệt riêng của bất kỳ concept nào. | Confirmed |
| **Big Class** | Buổi học trực tuyến nhóm có giáo viên thật dẫn lớp. Hiện tại: 2 buổi/tuần (C1/C2/C3), hoặc 3 buổi/tuần (C4). | Confirmed |
| **NLO** | Nano Learning Objective — đơn vị kiến thức nhỏ nhất trong taxonomy học tập. Edupia đang xây 1.473 NLO cho lớp 1-8. Cùng bậc độ lớn với ALEKS (~1.000), Carnegie MATHia (~700). | Confirmed |
| **Adaptive Learning** | Hệ thống tự động chẩn đoán lỗ hổng kiến thức của từng học sinh (Gap Detection) và điều hướng nội dung học phù hợp dựa trên NLO taxonomy. Đã thiết kế, chưa triển khai đại trà tính đến T8/2026. | Confirmed |
| **AI Tutor** | Module luyện tập 1-1 với AI sau Big Class. C3: 30 phút cố định. C4: vá lỗ hổng liên tục theo real-time gap detection. | Confirmed |
| **Mastery Profile / Mastery Map** | Bản đồ năng lực học sinh theo NLO, hiển thị cho phụ huynh qua Parent Mode. Phạm vi (chỉ AI Class Plus hay dùng chung Edupia Class) chờ quyết định BOD. | ◆ Pending BOD |
| **GVCN** | Giáo viên Chủ nhiệm — vai trò mở rộng trong C4, chủ động giao bài, theo sát tiến độ, xây lộ trình riêng cho học sinh. Tỷ lệ mục tiêu: 1 GVCN / 2.000 học sinh. Phân biệt với GVCN vai trò cơ bản (có sẵn ở C1/C2/C3 nhưng không chủ động). | Confirmed |
| **Parent Mode** | Tính năng báo cáo tiến bộ học tập cho phụ huynh. C3: Mastery Map. C4: Mastery Map + thông báo tình hình sau từng buổi + dashboard hỗ trợ GVCN quản lý 1:2.000. | Confirmed |
| **JTBD** | Jobs-to-be-Done — framework phân tích nhu cầu khách hàng theo 4 tầng: Chức năng, Cảm xúc, Xã hội, Thực dụng. | Confirmed |
| **Competitive Alternative** | Đối thủ thay thế thực sự của khách hàng — giải pháp họ dùng nếu không chọn Edupia Class (app miễn phí, gia sư, trung tâm offline, hoặc không làm gì). Khác với "đối thủ cạnh tranh" theo nghĩa thông thường. | Confirmed |
| **WTP** | Willingness-to-Pay — mức giá tối đa khách hàng sẵn sàng trả. Đo bằng phương pháp Van Westendorp trong khảo sát T9/2026. | Confirmed |
| **Van Westendorp** | Phương pháp nghiên cứu giá (Price Sensitivity Meter) dùng 4 câu hỏi để xác định vùng giá chấp nhận được. Được dùng trong khảo sát T9. | Confirmed |
| **Purchase Intent / Top-2-Box** | Chỉ số đo ý định mua trong khảo sát (thường là % trả lời "Chắc chắn mua" + "Có thể mua"). Cần đặt ngưỡng trước khảo sát T9. | ◆ Ngưỡng chưa chốt |
| **Product Growth Engine** | Vai trò chiến lược của Edupia Class trong Educa 2026-2028: động lực chính tăng trưởng người dùng, doanh thu và lợi nhuận. | Confirmed |
| **SA / SB** | Sales Argument / Sales Benefit — bảng luận điểm bán hàng dùng để đào tạo Telesale. Đặc biệt quan trọng với C4. | Confirmed |
| **Edupia Practice** | Module luyện tập bài tập (hiện có). Cần nâng cấp kho đề + AI Mocktest trong C1+. | Confirmed |
| **Edupia Speak** | Module luyện phát âm với AI chấm-chữa (hiện có). Cần nâng cấp độ chính xác model chấm trong C1+. | Confirmed |
| **STEAM** | Science, Technology, Engineering, Arts, Mathematics — nhóm môn học bổ trợ trong buổi thứ 3 của C2. | Confirmed |
| **KNS** | Kỹ năng sống — nhóm kỹ năng mềm trong buổi thứ 3 của C2 (cùng với STEAM). | Confirmed |
| **Tutor 1-4 / Tutor 1-1** | Sản phẩm cao cấp của Educa (gia sư nhóm nhỏ / cá nhân). Khác phân khúc với Edupia Class — không phải đối thủ nội bộ trực tiếp. | Confirmed |
| **UniClass** | Sản phẩm Educa có môn Toán. v1.0 (13/8): lý do C2 không thêm Toán là để tránh tự cạnh tranh với UniClass. ⚠ v2.0 (17/8): biến thể Concept 2.1 đảo ngược quyết định này có chủ đích (thêm Toán) — lý do kinh doanh cụ thể chưa được cung cấp, đang chờ BOD/Product bổ sung. Xem `00_context/product-brief-2026-08-13.md` mục 3.1. | ⚠ Quyết định gốc đang bị đảo ngược, chưa có lý do chính thức |
| **Gia sư AI 1:1 (Tutor AI)** | Concept 3 trong brief v2.0 (17/8) — hướng sản phẩm mới trong đó AI đóng vai trò "gia sư" chính cho học sinh (không chỉ hỗ trợ lớp học như Concept 1/2). Xây dựng từ nghiên cứu thị trường AI gia sư toàn cầu (`02_discovery/research/market-ai-tutor-landscape-concept5-2026-08-17/research.md`). 2 phương án kỹ thuật đề xuất: "AI Song Hành" (dual-teacher, AI giám sát liên tục) và "AI luyện hội thoại" (conversational practice). ⚠ **Rủi ro đặt tên:** tên gọi rất gần với **Tutor 1-1** (sản phẩm hiện có, xem dòng dưới) nhưng là hai sản phẩm khác nhau — Concept 3 là AI thuần, giá đại trà (390k); Tutor 1-1 là gia sư người thật, giá cao cấp. Cần đặt tên chính thức khác biệt rõ ràng trước khi đưa vào content bán hàng, tránh nhầm lẫn nội bộ lẫn với khách hàng. | ◆ Pending BOD — chưa có Pilot nội bộ, chưa chốt tên chính thức |
| **AI Song Hành** | Phương án kỹ thuật A của Concept 3 (Gia sư AI 1:1) — AI đảm nhiệm lớp giám sát/nhắc bài/phát hiện lỗ hổng liên tục theo thời gian thực xuyên suốt tuần, con người (GVCN) chỉ can thiệp khi AI leo thang ngoại lệ. Mô phỏng theo mẫu hình "dual-teacher" đã xác nhận vận hành thật ở TAL/Xueersi và Doushen (Trung Quốc) — xem `02_discovery/research/market-ai-tutor-landscape-concept5-2026-08-17/research.md`. Đề xuất như một hướng thay thế cho việc mở rộng đầu người GVCN ở tier 1.3. | ◆ Đề xuất, chưa Pilot |
| **Tutor 1-1** | Sản phẩm gia sư người thật hiện có của Educa, phân khúc cao cấp — cá nhân hóa cao (xem "Tutor 1-4 / Tutor 1-1" ở trên). ⚠ Từ v2.0 (17/8): cần phân biệt rõ với "Gia sư AI 1:1" (Concept 3, xem dòng trên) — tên gần giống nhau nhưng là 2 sản phẩm khác phân khúc. Concept 3 có rủi ro cannibalization với Tutor 1-1 chưa được đo lường — xem `00_context/product-brief-2026-08-13.md` mục 4.1. | Confirmed (sản phẩm hiện có) — điểm giao với Concept 3 đang ◆ Pending |
| **UniClass** | Sản phẩm Educa có môn Toán. Lý do C2 không thêm Toán: tránh tự cạnh tranh với UniClass. | Confirmed |

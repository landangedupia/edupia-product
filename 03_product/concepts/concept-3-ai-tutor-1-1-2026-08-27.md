# Concept 3 — Gia sư AI 1:1 (Edupia AI Tutor 1-1)

**Trạng thái:** 🟡 Bản nháp để Lân duyệt — tổng hợp từ tài liệu nguồn, chưa đưa lên slide.
**Ngày tổng hợp:** 2026-08-27
**Nguồn:** deck "GIỚI THIỆU SẢN PHẨM — EDUPIA AI TUTOR 1-1" của Khối Sản phẩm – Công nghệ (21 slide, 4 phần: 01. Bối cảnh & cơ hội → 02. Khách hàng mục tiêu → 03. Giải pháp → 04. Cấu trúc sản phẩm & mô tả tính năng).

**Quyết định của Lân (2026-08-27):**
- ✅ Hiện tại **chọn biến thể 3.1** (AI nhân hoá "giáo viên ngôi sao") làm hướng theo đuổi.
- ✅ **Tạm dùng tên "EDUPIA AI TUTOR 1-1"** — tên làm việc, tên đối ngoại chính thức vẫn cần chốt sau (rủi ro nhầm với "Edupia Tutor 1-1" người thật vẫn còn, xem §5-B).
- ✅ **Buổi 1-1 vừa adaptive vừa bám SGK:** các đơn vị kiến thức (NLO) đã được chia và bám sát chương trình SGK Global Success; trong khung đó, mỗi buổi cá nhân hoá theo Mastery Profile của từng học sinh.
- ✅ **AI Speak — bổ sung tính năng nói nhập vai theo tình huống** *(phát triển mới)*.
- ✅ **Edupia Club tích hợp với Mastery Profile** — thử thách bám NLO đang học, điểm ghi tín hiệu vào Mastery Profile (không còn là module tách biệt "giữ nguyên").

---

## 0. Concept 3 là gì (định vị trong khung 3 Concept)

Theo `00_context/meeting-notes/2026-08-21-concept-strategy-selection.md`, **Concept 3** = **chuyển đổi sang mô hình học tập mới với Giáo viên AI** (AI Character Teacher) — thay vì chỉ dùng AI hỗ trợ như Concept 1/2, AI đóng vai "gia sư" chính, trực tiếp tương tác và giảng dạy.

Trong tài liệu nội bộ, Concept 3 có 2 biến thể × 2 phương án kỹ thuật (bảng 2×2):
- **Biến thể 3.1** — AI nhân hoá "giáo viên ngôi sao" (neo niềm tin vào một nhân vật giáo viên cụ thể).
- **Biến thể 3.2** — mascot / gamification (không nhân hoá giáo viên).
- **Phương án A** — "AI Song Hành" (giám sát/nhắc bài/vá lỗ hổng liên tục cả tuần, GVCN can thiệp khi ngoại lệ).
- **Phương án B** — "AI luyện hội thoại".

**Deck này là hiện thực hoá của biến thể 3.1** (giáo viên ảo cá nhân hoá "Cô Hà Tú") — đã được Lân xác nhận là hướng đang chọn (2026-08-27). Phương án kỹ thuật trong deck là một phương án thứ 3 chưa có trong glossary: **Video Bank quay sẵn giáo viên thật (~85%) + cá nhân hoá qua Voice Cloning/Lip-Sync (~15%)**, buổi học 45 phút × 2 buổi/tuần. Xem §5 về việc đối chiếu với các phương án nội bộ.

**Thuật ngữ liên quan (đã có trong glossary):** [`Gia sư AI 1:1 (Tutor AI)`](../../00_context/glossary.md), [`AI Song Hành`](../../00_context/glossary.md), [`Tutor 1-1`](../../00_context/glossary.md), [`NLO`](../../00_context/glossary.md), [`Mastery Profile / Mastery Map`](../../00_context/glossary.md), [`Routing Engine`](concept-1.2-adaptive-learning-2026-08-27.md).

---

## 01 — Bối cảnh và cơ hội thị trường

- **Quy mô cầu:** tổng nhu cầu học thêm Tiếng Anh dự báo ~**3 tỷ USD vào 2030**. Học online tăng mạnh nhất ~**20%/năm**. Từ 2025, ảnh hưởng của **TT29** tiếp tục đẩy thị trường online nhanh hơn, ~**33%/năm**.
- **Sứ mệnh:** dùng công nghệ xoá nhoà khoảng cách điều kiện học tập — sản phẩm hiệu quả tương đương đào tạo chất lượng cao truyền thống nhưng giá thấp hơn, dễ tiếp cận hơn.
- **Vì sao AI Tutor 1-1 ra đời đúng thời điểm:**
  - Gia sư 1-1 con người chi phí cao, khó mở rộng — AI Tutor 1-1 giữ trải nghiệm cá nhân hoá với chi phí thấp hơn nhiều lần.
  - Phần lớn sản phẩm online hiện dạy đại trà, không biết chính xác học sinh yếu ở đâu — AI Tutor 1-1 vá đúng lỗ hổng theo Mastery Profile.
  - Xu hướng gia sư AI toàn cầu (Squirrel AI, ALEKS, Khanmigo) đã chứng minh mô hình chẩn đoán–định tuyến cá nhân hoá hiệu quả hơn dạy đại trà.

*Nguồn dẫn trong deck: dự án Adaptive Learning Ecosystem — BOD Deck.*

---

## 02 — Khách hàng mục tiêu

**Nhân khẩu học:**
- Phụ huynh: 30–45 tuổi, đã dùng AI Class / Big Class, thu nhập khá–tốt trở lên (~1,8 triệu/tháng+ — ⚠ đơn vị/mốc cần làm rõ, xem §5).
- Học sinh: lớp 1–8, đã học đại trà nhưng có lỗ hổng kiến thức rõ, cần chăm sóc riêng.
- Nhu cầu: chăm sóc riêng và cam kết tuyệt đối — không chấp nhận "học đại trà mãi không khá lên".

**Nỗi đau (Pain point):**
- "Con học lớp đông, không biết chính xác con yếu chỗ nào để kèm riêng."
- "Đã thử app/gia sư nhưng không chắc học có đúng chỗ hổng không."
- "Sợ con thua thiệt so với bạn nếu không có ai theo sát 1-1."
- "Muốn chăm sóc cao cấp nhưng gia sư con người quá đắt để duy trì đều."

**Các JTBD của khách hàng** *(bổ sung 2026-08-27; số % = tỷ lệ khách hàng mục tiêu — ⚠ nguồn/định nghĩa % cần xác nhận):*

| JTBD | % |
|---|---|
| Muốn con học giỏi tiếng Anh | 90% |
| Muốn con học với Giáo viên giỏi | 80% |
| Muốn con thích học, tự giác học | 70% |
| Muốn yên tâm giao phó con | 60% |
| Muốn con tự tin giao tiếp | 60% |

---

## 03 — Giải pháp

**Tên thương hiệu (trong deck):** EDUPIA AI TUTOR 1-1 — ⚠ trùng cấu trúc với "Edupia Tutor 1-1" (gia sư người thật), tên chính thức đối ngoại **chưa chốt**, xem §5.
**Tagline:** "Gia sư AI riêng — vá đúng lỗ hổng, không dạy đại trà."

**Value story:** buổi học 1-kèm-1 với "Cô Hà Tú" — giáo viên ảo cá nhân hoá (85% Video Bank quay sẵn của giáo viên thật + 15% cá nhân hoá qua Voice Cloning/Lip-Sync). Mỗi buổi 45 phút, Routing Engine chọn đúng 1–2 NLO học sinh đang yếu nhất — không dạy lại từ đầu, không dạy dàn trải. AI Practice, AI Speak và Edupia Club không tách biệt — cả 3 bám cùng NLO đang học và ghi cùng 1 Mastery Profile, dưới sự đồng hành của Giáo viên chủ nhiệm xuyên suốt.

### Selling Point (SA → SB → SE)

**SE — Cảm xúc khơi gợi** *(Selling Emotion, bổ sung 2026-08-27; nội dung suy ra từ pain point ở phần Khách hàng mục tiêu — cần telesale/marketing chốt lại lời thoại).*

| SA — Ưu điểm sản phẩm | SB — Lợi ích cảm nhận | SE — Cảm xúc khơi gợi |
|---|---|---|
| Buổi học 1-1, 45 phút/buổi với giáo viên ảo cá nhân hoá (85% quay sẵn + 15% Voice Cloning) | Con được học riêng như có gia sư thật, được gọi tên, nhận xét đúng vào bài của con | An tâm — con mình được quan tâm riêng, không bị bỏ lại giữa lớp đông |
| Routing Engine chọn đúng NLO đang yếu nhất mỗi buổi — không dạy đại trà | Con học đến đâu chắc đến đấy, không mất thời gian học lại cái đã biết | Tin rằng tiền đầu tư đi đúng chỗ — không lãng phí thời gian của con |
| iSpeak chấm phát âm theo âm vị, phản hồi ngay trong buổi học | Con luyện nói đều — phát âm tốt, không còn sợ nói sai | Tự hào khi con dám nói tiếng Anh trước người khác |
| AI Practice + AI Speak + Edupia Club cùng ghi 1 Mastery Profile với AI Tutor 1-1 | Phụ huynh không cần lo 4 hệ thống rời rạc — mọi tiến bộ dồn về 1 báo cáo | Nhẹ đầu — không phải tự ghép nối nhiều thứ rời rạc để hiểu con đang ở đâu |
| Giáo viên chủ nhiệm đồng hành, nhắc lịch, gọi điện báo kết quả | Bố mẹ yên tâm giao con cho Edupia, không phải tự đôn đốc từng buổi | Yên tâm giao con — có người lo thay, không phải ngày nào cũng đôn đốc |

### USP

> "Gia sư AI 1-kèm-1 **đầu tiên tại Việt Nam** vá đúng lỗ hổng kiến thức theo **dữ liệu thực (Mastery Profile)** — không phải học đại trà, chỉ với chi phí bằng một phần nhỏ gia sư con người."

| Cấu phần USP | Diễn giải |
|---|---|
| Vá đúng lỗ hổng theo dữ liệu thực | Routing Engine: `priority = ppct_weight × (1−mastery) × prereq_boost` — không chọn ngẫu nhiên, không dạy lại từ đầu |
| Đầu tiên tại Việt Nam | Kết hợp Video Bank cá nhân hoá (Voice Cloning/Lip-Sync) với chấm phát âm theo âm vị (kiểu ELSA) trong một buổi học 1-1 |
| Chi phí bằng một phần nhỏ gia sư con người | 390.000đ/tháng so với gia sư 1-1 truyền thống hàng triệu đồng/tháng, nhờ Video Bank tái sử dụng ở quy mô lớn |

### So sánh giải pháp trên thị trường

| Mong muốn | Gia sư con người | App tự học | AI Class (nhóm) | **AI Tutor 1-1** |
|---|---|---|---|---|
| Học với GV giỏi | Gia sư (chất lượng không đồng đều) | Không có giáo viên | GV trường quốc tế + AI | Giáo viên ảo cá nhân hoá 1-1 |
| Vá đúng lỗ hổng cá nhân | Tuỳ gia sư, không có dữ liệu | Không có | Theo lớp, chưa tới từng NLO | Routing Engine theo NLO cá nhân |
| Chấm phát âm | Chủ quan theo tai người dạy | Hiếm khi có | AI chấm trong lớp đông | AI chấm theo âm vị, riêng từng con |
| Chi phí/tháng | Vài triệu đồng | 60–200k | ~200k–800k | **390.000đ** |
| Ai theo sát tiến độ | Không ai ngoài gia sư | Không ai | Ban giáo vụ chung | GVCN + Mastery Profile riêng |

### Before & After

| BEFORE | AFTER |
|---|---|
| Con học lớp đông, không rõ đang yếu chỗ nào | Routing Engine xác định đúng NLO yếu nhất mỗi tuần, vá gọn từng lỗ hổng |
| Học phí gia sư 1-1 quá cao để duy trì đều đặn | 390.000đ/tháng — bằng một phần nhỏ chi phí gia sư con người |
| Con ngại nói, sợ phát âm sai không ai chỉnh ngay | iSpeak chấm phát âm theo âm vị, phản hồi ngay trong buổi học |
| Phụ huynh không biết con học gì, tiến bộ ra sao | Báo cáo Mastery Profile theo tuần qua GVCN |
| 4 hoạt động học rời rạc, không ai kết nối lại | AI Practice/Speak/Club cùng bám 1 NLO, cùng 1 Mastery Profile |

---

## 04 — Cấu trúc sản phẩm và mô tả tính năng

### Cấu trúc tổng thể

Nội dung cá nhân hoá theo **NLO Taxonomy (1.473 đơn vị)** — bám sát SGK Global Success.

| Cấu phần | Tần suất | Vai trò |
|---|---|---|
| **AI Tutor 1-1** | 2 buổi/tuần | Buổi học adaptive theo Mastery Profile, trong khung NLO đã chia bám sát SGK Global Success — nắm chắc ngữ pháp – từ vựng |
| **AI Practice** | Bài tập ôn luyện | Nâng cấp giống Concept 1.2 (Staircase + trộn NLO 40/40/20 + Mastery real-time) |
| **AI Speak** | Mỗi ngày luyện nói | Nâng cấp giống Concept 1.2 + **tính năng nói nhập vai theo tình huống** *(phát triển mới)* |
| **Edupia Club** | Hoạt động ngoại khoá | Rèn sự tự tin & kỹ năng xã hội — **tích hợp Mastery Profile** (thử thách bám NLO đang học) |
| **Giáo viên chủ nhiệm** | Xuyên suốt | Chăm sóc, hỗ trợ, theo dõi, báo cáo toàn bộ quá trình |

### AI Tutor 1-1 — buổi học 1-1 với giáo viên ảo cá nhân hoá

Tần suất 2 buổi/tuần, mỗi buổi **45 phút**:
- **Phần 1 (20'):** Dạy theo slide — video hoạt hình học từ vựng + video hội thoại học ngữ pháp.
- **Phần 2 (20'):** Hỏi đáp & sửa lỗi qua iSpeak — Routing Engine chọn câu theo đúng NLO đang yếu.
- **Phần 3 (5'):** Tương tác – phản hồi – nhắc bài tập về nhà.

- **Giáo viên ảo cá nhân hoá:** ~85% Video Bank quay sẵn của giáo viên thật + ~15% cá nhân hoá qua Voice Cloning và Lip-Sync theo tên, kết quả của từng học sinh.
- **Chấm phát âm theo âm vị:** AI chấm điểm 0–100 từng âm (mô phỏng kiểu ELSA), phản hồi ngay trong buổi học.
- **Buổi học adaptive nhưng bám SGK:** các NLO đã được chia và bám sát chương trình SGK Global Success; trong khung đó Routing Engine cá nhân hoá theo Mastery Profile của từng học sinh — không dạy đại trà, cũng không lệch khỏi tiến độ chương trình.
- Huy hiệu & thử thách ghi nhận tiến bộ theo thời gian thực; bài tập về nhà giao ngay sau mỗi buổi.
- Giao diện 2 camera kiểu học 1-1 thật — Cô Hà Tú + học sinh.

### AI Speak — luyện giao tiếp tình huống thật

Nâng cấp giống Concept 1.2 (bám NLO, ghi cùng Mastery Profile). **Bổ sung tính năng nói nhập vai theo tình huống — *phát triển mới* của Concept 3:**

- Không chấm ngữ pháp chặt — khuyến khích nói nhiều hơn nói đúng.
- Routing Engine chọn tình huống theo đúng NLO đang yếu nhất — bám cùng Mastery Profile với AI Tutor 1-1 và AI Practice.
- Học sinh **nhập vai tình huống thực tế** (làm quen bạn mới, đi mua sắm, đi du lịch...), tối đa 1 giờ luyện nói/ngày. *(phát triển mới)*
- Nút "Gợi ý câu trả lời" giúp học sinh chưa tự tin vẫn bắt đầu nói được. *(phát triển mới)*
- Cô Hà Tú nghe lại và nhận xét mỗi tuần — không phải hệ thống tách biệt.

### AI Practice — bài tập ôn luyện tăng cường

- Đề bài chuẩn hoá theo SGK Global Success, luyện lại nhiều lần.
- Tỷ lệ trộn NLO: 40% đang yếu · 40% vừa học tuần này · 20% ôn chống quên (spaced repetition).
- Staircase Difficulty: 2 câu đúng liên tiếp tăng cấp độ, 1 câu sai giảm ngay 1 cấp.
- Mỗi câu sai có giải thích lỗi cụ thể + cho phép làm lại để tự sửa.
- Mastery Profile cập nhật real-time — Cô Hà Tú theo dõi cùng lúc với buổi học 1-1.

### Edupia Club — câu lạc bộ hoạt động ngoại khoá

Giữ mô hình CLB đang chạy, **nhưng tích hợp với Mastery Profile** (xác nhận Lân 2026-08-27) — không còn là module ngoại khoá tách biệt:

- Mô hình CLB tại trường quốc tế — không phải hoạt động "cho vui" tách biệt.
- 4 chủ đề xoay vòng theo năm: Khám phá thế giới, Kỹ năng sống, STEM, Công nghệ AI.
- Nhiệm vụ tuần dẫn tới sự kiện tháng — thử thách tích điểm, livestream tương tác.
- **Thử thách từ vựng nhanh bám đúng NLO đang học ở AI Tutor 1-1 tuần đó.**
- **Điểm số cộng chung 1 bảng xếp hạng, cùng ghi tín hiệu vào Mastery Profile.**

### Phương pháp cá nhân hoá đằng sau AI Tutor 1-1

| Thành phần | Nội dung |
|---|---|
| NLO Taxonomy | 1.473 đơn vị kiến thức nhỏ nhất (Ngữ pháp, Từ vựng, Ngữ âm, Nghe, Nói, Đọc, Viết) — cùng bậc chi tiết với ALEKS/Carnegie MATHia |
| Mastery Model | `mastery_mới = mastery_cũ × decay + tín hiệu mới` — cập nhật real-time sau mỗi tương tác |
| Gap Detection Engine | Nhận tín hiệu từ Big Class + Quick Check để phát hiện đúng NLO đang yếu |
| Routing Engine | `priority = ppct_weight × (1−mastery) × prereq_boost` — chọn 1–2 NLO ưu tiên cao nhất/buổi |

*Nguồn dẫn trong deck: dự án Adaptive Learning Ecosystem — BOD Deck.*

### Bằng chứng & niềm tin (Reasons to believe)

1. **Nền tảng khoa học học tập:** active recall & spaced repetition (Roediger & Karpicke, 2006) — 2 kỹ thuật "utility" cao nhất trong 10 kỹ thuật học tập (Dunlosky và cộng sự, 2013).
2. **Nguyên tắc quản trị minh bạch:** Mastery Map chỉ phục vụ sư phạm, không dùng để ép bán — bài học trực tiếp từ thất bại quản trị của Byju's.
3. **Kiến trúc cùng nhóm với chuẩn quốc tế:** granularity NLO (1.473) cùng bậc ALEKS (~1.000) và Carnegie MATHia (~700).
4. **Cơ cấu chi phí minh bạch:** 390.000đ/tháng, giá vốn ~13% doanh thu — ⚠ deck ghi "công khai trong PRD"; nội bộ (PRFAQ) ghi biên chưa ước tính được, xem §5.

### Lộ trình triển khai

| Phase | Nội dung |
|---|---|
| Phase 0 | Chốt schema (2 tuần) |
| Phase 1 | Pilot Lớp 6 |
| Phase 2 | Mở rộng THCS |
| Phase 3 | Mở rộng Tiểu học |

---

## 5. Trạng thái xác thực & điểm cần lưu ý trước khi trình BOD

Deck này trình bày Concept 3 như **một sản phẩm gần như đã chốt** (có tên thương hiệu, tagline, USP, "đầu tiên tại Việt Nam", cơ cấu chi phí). Tài liệu nội bộ hiện tại coi Concept 3 là **◆ Pending BOD**. Lân đã chốt tạm 2 điểm (biến thể 3.1; tên làm việc "EDUPIA AI TUTOR 1-1" — xem đầu file); các điểm còn lại phải làm rõ:

### A. Deck trình như đã chốt — nội bộ thì chưa

| Điểm trong deck | Trạng thái thực theo tài liệu nội bộ |
|---|---|
| Chọn biến thể **3.1** (nhân hoá giáo viên "Cô Hà Tú") | ✅ **Lân xác nhận 2026-08-27: đang chọn 3.1.** Lưu ý để đối chiếu khi trình BOD: bản phản biện 2026-08-26 đề xuất loại 3.1 (chỉ giữ 3.2 mascot); PRFAQ đề xuất để khảo sát T9 đo niềm tin (nhân vật gốc vs mascot vs baseline) — nên chuẩn bị lập luận vì sao vẫn theo 3.1. |
| Phương án kỹ thuật = Video Bank quay sẵn + Voice Cloning/Lip-Sync, 45' × 2 buổi/tuần | Glossary chỉ có 2 phương án: "AI Song Hành" (giám sát liên tục cả tuần) và "AI luyện hội thoại". Đây là **phương án thứ 3 chưa được ghi nhận** — cần cập nhật glossary hoặc làm rõ. Ngoài ra glossary ghi AI Tutor "C3: 30 phút cố định" ≠ deck "45 phút". |
| "Giá vốn ~13% doanh thu — công khai trong PRD" | PRFAQ distillate: biên lợi nhuận **chưa ước tính được** (vòng lặp effort↔margin là *blocker*, cần phiên Product+Engineering+Finance, chưa có owner/ngày). Cần xác nhận PRD nào chứa con số 13% và ai đã duyệt. |
| Định vị: substitute rẻ cho gia sư con người (USP, bảng so sánh) | Câu hỏi "Concept 3 là substitute rẻ cho Edupia Tutor hay JTBD khác biệt (mở rộng noncustomer)" là **quyết định BOD chưa chốt**. Cannibalization với **cả họ Edupia Tutor (1-1/1-4/1-6)** chưa được đo lường. |
| Giá 390k, sản phẩm đứng riêng | Chưa chốt sản phẩm mới đứng riêng ở 390k hay nâng cấp tại chỗ tệp 250k hiện có. |
| Lộ trình "sẵn sàng cho Pilot Lớp 6" | **Zero Pilot nội bộ** cho Concept 3 tính đến nay — toàn bộ đứng trên bằng chứng thị trường ngoài. |

### B. Rủi ro pháp lý & đặt tên cần xử lý trước

- **Tên "EDUPIA AI TUTOR 1-1"** — ✅ Lân xác nhận 2026-08-27 **tạm dùng làm tên làm việc**. Vẫn còn rủi ro trùng cấu trúc "Edupia Tutor 1-1" (gia sư người thật, họ Edupia Tutor cao cấp) — glossary và `qa-prep-ai-class-new-2026-08-24.md` đánh dấu là rủi ro nhầm lẫn nội bộ lẫn khách hàng. **Tên đối ngoại chính thức vẫn cần chốt trước khi đưa vào content bán hàng.**
- **Voice Cloning / Lip-Sync giáo viên thật ("Cô Hà Tú", 85% Video Bank của GV thật):** PRFAQ có khuyến nghị thiết kế (chưa chốt) **nên dùng nhân vật gốc có thương hiệu thay vì clone giọng/hình ảnh một GV Edupia đang dạy** — tránh rủi ro quyền hình ảnh (án lệ Lovo Inc., luật digital-replica NY, ELVIS Act Tennessee). Cần Product + Pháp lý sign-off. **Cần làm rõ "Cô Hà Tú" là GV thật hay nhân vật gốc.**
- **Loại trừ cứng toàn Concept 3:** không dùng archetype "AI mô phỏng nhân cách/cảm xúc riêng biệt" cho trẻ em (tiền lệ Character.AI, 2 vụ kiện liên quan cái chết thiếu niên). "Cô Hà Tú" + giao diện 2 camera + "được gọi tên, nhận xét đúng vào bài" cần được kiểm tra để bảo đảm giữ nghiêm trong phạm vi **bài học có cấu trúc**.
- **Ranh giới AI ↔ nhân sự:** "Cô Hà Tú nghe lại AI Speak & nhận xét mỗi tuần" — nếu là GV thật thì phát sinh chi phí nhân sự (ảnh hưởng con số 13%); nếu là AI thì cần nói rõ. RTB #4 của chính deck yêu cầu "không mập mờ giữa AI thật và nhân sự".

### C. Số liệu cần kiểm chứng nguồn trước khi lên deck BOD

- "Nhu cầu học thêm Tiếng Anh ~3 tỷ USD vào 2030", "online +20%/năm", "TT29 đẩy online +33%/năm" — cần nguồn gốc.
- Thu nhập phụ huynh mục tiêu "~1,8 triệu/tháng+" — đơn vị/mốc không rõ (PRFAQ dùng hộ Tier 3/4 ~4,5 triệu/tháng). Có thể là lỗi gõ — cần làm rõ.
- Bảng chi phí đối thủ ("gia sư vài triệu", "app 60–200k", "AI Class ~200k–800k") — cần bảng giá gốc, không dùng ước lượng.
- Các benchmark toàn cầu dẫn lại từ Adaptive Learning BOD Deck (ALEKS ~1.000, Carnegie ~700, Squirrel AI...) — cùng lưu ý kiểm chứng như tài liệu Concept 1.2.

### D. Thuật ngữ mới chưa có trong glossary

Nếu chốt dùng, cần bổ sung vào `00_context/glossary.md`: *AI Tutor 1-1 (tên sản phẩm Concept 3 — nếu giữ), Cô Hà Tú, Video Bank cá nhân hoá, Voice Cloning / Lip-Sync, iSpeak (phân biệt với Edupia Speak/AI Speak), Staircase Difficulty, Gap Detection Engine, Persona Engine.*

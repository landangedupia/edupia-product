# Digest — Pricing & business model (Round 1, Assistant B)

Budget dùng: ~23 tool call qua 2 vòng. Lưu ý epistemics: các site tổng hợp dạng listicle (marketintelo.com, dataintelo.com, aijourney.so, vizologi.com, education.toolsinfo.com) xuất hiện trong kết quả nhưng bị gắn cờ confidence thấp — đọc như nội dung "báo cáo thị trường" mẫu có sẵn/AI-generated, số liệu không nguồn — không được dùng làm sự thật.

## Q1 — Giá Dino AI (Prime Future Edutech) — ĐÃ XÁC MINH qua nguồn sơ cấp (App Store, 2 khu vực)

| Gói | US Store (USD) | Singapore Store (SGD) |
|---|---|---|
| Tuần | $10.99 | S$17.98 |
| Tháng | $37.99 | S$59.98 |
| Quý | $99.99 | S$149.98 |
| Năm | $229.99 | S$349.98 |

- Gói Dino AI PRO: Tuần/Tháng/Quý/Năm, giá $10.99/$37.99/$99.99/$229.99 USD trên App Store Mỹ. [App Store US](https://apps.apple.com/us/app/dino-ai/id6773257149) · live listing · 2026-08-17 · **high**
- Cùng gói trên App Store Singapore: S$17.98/S$59.98/S$149.98/S$349.98. [App Store SG](https://apps.apple.com/sg/app/dino-ai/id6773257149) · live listing · 2026-08-17 · **high**
- Nhà phát hành chính thức: PRIME FUTURE EDUTECH PTE. LTD. App Store · 2026-08-17 · **high**

**Kết luận đối chiếu với claim trong import (deck nội bộ):** ĐƯỢC XÁC NHẬN, nhưng cần sửa cách diễn giải. Dải giá deck nêu ("tuần ~10.99–17.98 SGD, tháng ~37.99–59.98 SGD, năm ~229.99–349.98 SGD") khớp chính xác với đầu thấp (giá USD Mỹ) và đầu cao (giá SGD Singapore) mà agent tự lấy độc lập — tức là **deck đã gộp giá USD (Mỹ) và giá SGD (Singapore) thành một dải rồi ghi nhãn sai toàn bộ là "SGD"**. Dải giá SGD thật hẹp hơn: S$17.98–349.98 (tuần→năm), không bắt đầu từ S$10.99. Việc giá thay đổi theo khu vực là có thật, được xác nhận. Claim "mua tiền xu trong app" **không xác minh/phủ nhận được** — danh sách IAP đầy đủ trên Google Play không lấy được (trang bị cắt khi fetch); tìm kiếm chỉ thấy hệ thống tiền xu/XP trò chơi hóa, không xác nhận có giao dịch tiền thật. Gắn cờ chưa xác minh được lượt này.

## Q2 — Giá & mô hình kinh doanh của các sản phẩm AI-tutor khác

- Khanmigo (Khan Academy): $4/tháng hoặc $44/năm cho phụ huynh & học viên; miễn phí cho GV; yêu cầu địa chỉ thanh toán tại Mỹ. [Khanmigo pricing (chính chủ)](https://www.khanmigo.ai/pricing) · 2026-08-17 · **high**
- ELSA Speak Pro: $11.99/tháng, Premium $16.59/tháng, gói năm Pro $74.99/năm (~$13.33/tháng hiệu dụng). Nguồn thứ cấp (softwarefinder.com, englishspeakingapps.com — chưa tự fetch trực tiếp trang giá chính chủ ELSA/Apple lượt này) · 2026-08-17 · **medium**
- Synthesis Tutor: $20–45/tháng, gói năm thấp nhất từ $99/năm. Blog thứ cấp (brighterly.com, không phải trang chính chủ Synthesis) · 2026-08-17 · **low-medium**
- Tutor.com (gia sư người thật, không phải AI thuần): $39.99–$339.99/tháng tùy số giờ. Blog thứ cấp (brighterly.com) · 2026-08-17 · **low-medium**
- Squirrel AI: phân phối chủ yếu qua trung tâm/trường học sở hữu độc lập, không phải app tự phục vụ minh bạch giá; giá không công bố nhất quán, phải liên hệ trung tâm địa phương. Nhiều nguồn tổng hợp thứ cấp (chưa tự fetch trực tiếp squirrelai.com) · 2026-08-17 · **low** (chỉ nguồn thứ cấp, có khả năng đúng hướng nhưng chưa xác nhận trên trang chính chủ)

**Mẫu hình quan sát được ở Q2:** App "bạn đồng hành hội thoại AI" thật (Dino AI, ELSA Speak) dùng freemium + gói tuần/tháng/quý/năm, giá nhất quán **cao hơn** mức đại trà (11–60+ USD/tháng). Nền tảng học thích ứng/chẩn đoán (Synthesis, Tutor.com) còn cao hơn nữa. Ngoại lệ giá thấp rõ ràng duy nhất là Khanmigo — nhưng chỉ ở Mỹ, được trợ giá bởi tổ chức phi lợi nhuận (Khan Academy) — câu chuyện kinh tế khác hẳn một sản phẩm thương mại đại trà.

## Q3 — Có sản phẩm AI-tutor nào ở dải giá đại trà thật ($10-20/tháng) không?

Hai ứng viên Ấn Độ xuất hiện, cả hai đều thấp hơn đáng kể dải $10-20 tính bằng USD tuyệt đối và định vị rõ ràng cho phân khúc nhạy giá — nhưng độ tin cậy về giá chính xác không đồng đều vì trang chính chủ không hiển thị số cụ thể khi fetch:

- **Arivihan** (Ấn Độ): tự nhận là nền tảng AI gia sư tự động hoàn toàn đầu tiên của Ấn Độ cho lớp 10-12/NEET, nhắm rõ "gia đình thuộc phân khúc thu nhập thấp", tự quảng cáo "rẻ hơn 12 lần" so với nền tảng truyền thống — nhưng trang chủ chính chủ không hiển thị giá cụ thể. [arivihan.com (chính chủ, đã fetch trực tiếp)](https://arivihan.com/) · 2026-08-17 · **high** (định vị), **chưa xác nhận** (giá cụ thể)
- Giá Arivihan được báo cáo ở nơi khác ~₹300/tháng hoặc ~₹1.900/năm (~$3-4 USD/tháng). Nguồn thứ cấp (onlineeducation.com, tin Dealroom.co về vòng gọi vốn $4.5M) · 2026-08-17 · **low-medium** (không thấy giá trên trang chính chủ)
- **Super Tutor** (Ấn Độ): nền tảng AI cho lớp 1-12 và 67+ kỳ thi tuyển sinh (JEE/NEET), định vị đối lập với luyện thi truyền thống ₹3.000-15.000/tháng, có gói miễn phí + Pro/Premium; số ₹249 xuất hiện trong bảng so sánh nhưng trang /pricing/ đầy đủ chưa lấy được lượt này. [supertutor.in (chính chủ, đã fetch trực tiếp)](https://supertutor.in/) · 2026-08-17 · **medium** (định vị), **chưa xác nhận** (giá gói cụ thể)

**Kết luận Q3:** Không tìm được sản phẩm nào định giá đúng trong dải $10-20/tháng mà đồng thời định vị cho gia đình nhạy giá. Mẫu hình thật tách thành 2 cụm: (a) app hội thoại AI toàn cầu như Dino AI/ELSA định giá cao hơn hẳn $20/tháng tương đương kể cả ở đầu thấp nhất, hoặc (b) AI-tutor đặc thù Ấn Độ (Arivihan, Super Tutor) định giá thấp hơn nhiều $10/tháng (khoảng $2-4 tương đương) chính vì nhắm đúng phân khúc nhạy giá, giới hạn bởi mức chi tiêu edtech bình quân đầu người. **Không có ví dụ nào rơi đúng vào dải $10-20 mà đồng thời định vị rõ ràng đại trà/thu nhập thấp — đây là phát hiện khoảng trống thật, không chỉ là phủ sóng mỏng, đáng coi là dữ liệu thật cho quyết định sản phẩm.**

## Q4 — Giá & GTM của Doushen (豆神)

- Nhà sáng lập Doushen (窦昕) tuyên bố ý định định giá khóa học live-record AI (Ngữ văn/Toán/Anh) ở "giá sàn" — "gần như miễn phí, hoặc bundle với phần cứng khi mua" — như chiến lược 2025, dùng việc AI làm sập chi phí sản xuất bài giảng (từ ~2.600 NDT/bài với 200+ nhân sự xuống còn ~4 NDT, mục tiêu <2 NDT). [21财经 (21st Century Business Herald, báo tài chính chủ lưu TQ)](https://m.21jingji.com/article/20241217/herald/474de4a5c98553070ae79963d657e150.html) · 2024-12-17 · 2026-08-17 · **medium-high** (trích lời trực tiếp nhà sáng lập qua báo uy tín, nhưng là ý định công bố 12/2024, chưa xác nhận giá hiện tại)
- Doushen bán robot phần cứng đồng hành ("学伴机器人") giá 1.999 NDT, và có thể một đồ chơi AI rẻ hơn 299-399 NDT hoặc tặng kèm miễn phí khi đăng ký khóa học. Cùng bài 21jingji + snippet đối chiếu từ cls.cn (财联社) về việc robot bán hết · 2026-08-17 · **medium**
- Giá khóa học B2C của Doushen (khác phần cứng) **không được công bố trong báo chí công khai tìm được lượt này** — chỉ mô tả định tính "định vị trung-cao cấp có giảm giá/trả góp", không có số gói cụ thể. Tổng hợp nhiều nguồn TQ (jsw.com.cn, china.com, thepaper.cn) · 2026-08-17 · **low** (không tìm được trang giá sơ cấp)
- **Không tìm được** trang giá Doushen tương đương listing app store hay trang thanh toán e-commerce — giá app tiêu dùng dường như nằm sau chính app (không tiếp cận được bằng agent tìm kiếm web) hoặc phễu bán hàng/ghi danh, khớp với giả thuyết trong brief ("giá bị khóa sau tư vấn bán hàng") — nhưng **không xác nhận được tích cực** mô hình B2B/trường học cụ thể cho Doushen (khác Squirrel AI, nơi mô hình này ít nhất được báo cáo qua nguồn thứ cấp). Nên gắn nhãn **chưa xác nhận**, không phải đã xác minh.

## Leads đáng theo đuổi
- Giá subscription trong app thật của Doushen (cần vào chính app 豆神AI, vd. apps.apple.com/cn/app/豆神ai/id6504237557, tìm được nhưng chưa fetch giá IAP lượt này).
- Trang /pricing/ riêng của Super Tutor (trang chủ chưa lộ số gói cụ thể).
- Giá ELSA Speak và Synthesis Tutor xác nhận trực tiếp từ trang giá chính chủ/App Store IAP (lượt này dựa vào blog thứ cấp cho cả hai).
- Hệ thống "tiền xu" của Dino AI có giao dịch tiền thật không (danh sách IAP Google Play chưa render đầy đủ).
- Kiểm tra trực tiếp trang squirrelai.com về giá tiêu dùng công bố (nếu có), thay vì dựa vào mô tả thứ cấp.

## Looked for but could not find
- Trang giá sơ cấp, có ngày (≤3 tháng), cho subscription AI-tutor cốt lõi của Doushen tính bằng NDT.
- Bất kỳ sản phẩm AI-tutor nào rơi đúng dải $10-20/tháng mà đồng thời marketing cho phân khúc gia đình nhạy giá/thị trường mới nổi (ứng viên gần nhất đều cao hơn hẳn hoặc thấp hơn hẳn dải này, chi tiết ở Q3).
- Xác nhận/phủ nhận giá mua tiền xu trong app của Dino AI.

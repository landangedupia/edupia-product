# Intent — Concept 3: Gia sư AI 1:1 (định vị 390k)

> Đầu vào cho brief/PRD phát triển tiếp Concept 3 trong `00_context/product-brief-2026-08-13.md`. Kết quả hội tụ từ phiên brainstorming 2026-08-18 (facilitator mode, 5 kỹ thuật + converge 2 bước).

## Khung định vị

3 điểm trên trục giá × mức độ tương tác: **Edupia AI Class** (self-learning, rẻ nhất) — **Concept AI Tutor, 390k** (giữa) — **Edupia Tutor 1-4/1-6** (gia sư sống theo nhóm, đắt hơn).

Lưu ý thuật ngữ: trong phiên này, "Edupia Tutor" = gia sư sống dạy nhóm 1-4/1-6 trên ClassIn — **khác** với "Tutor 1-1 cá nhân hóa cao" từng nhắc ở product-brief trước đó. Cần làm rõ với các phiên/tài liệu khác trước khi tái sử dụng thuật ngữ.

## Câu hỏi trung tâm & tổng hợp cuối

Câu hỏi hội tụ: *"Làm sao xây một concept đủ niềm tin từ người dùng để win?"*

**Insight tổng hợp:** Lộ trình 3 giai đoạn (xem cụm A) không chỉ là lộ trình thay thế con người bằng AI — bản chất nó là một **lộ trình xây niềm tin**. Giai đoạn 1 để AI chứng minh mình đáng tin ở vai trò rủi ro thấp, đồng thời tích lũy chân dung dữ liệu. Cơ chế "GV xem dữ liệu AI trước buổi live" (SCAMPER-Combine) và "con người là chốt chặn cuối xác nhận output của AI" (SCAMPER-Reverse) là **cùng một cơ chế** — con người luôn đứng giữa AI và kết quả tới phụ huynh. Đây là hạ tầng niềm tin cần giữ xuyên suốt cả 3 giai đoạn, không phải bánh xe tập lái chỉ ở giai đoạn 1.

Hướng gỡ mâu thuẫn kinh tế TRIZ (dữ liệu/chân dung là tài sản riêng, cụm E) đồng thời giải bài toán niềm tin: càng nhiều dữ liệu/chân dung chính xác tích lũy, càng có bằng chứng cụ thể chống lại định kiến "không tin AI trong giáo dục". Nói cách khác, **cụm D/E thực chất phục vụ cụm C** — công thức niềm tin nằm sẵn trong cấu trúc 3-giai-đoạn + cơ chế người-xác-nhận-AI, không cần tính năng "gây niềm tin" tách riêng.

## Các hướng ưu tiên (xếp hạng theo impact, forced ranking)

### 1. Niềm tin & trải nghiệm phụ huynh (ưu tiên cao nhất)

- Niềm tin không đến từ việc AI "giả làm người" (học sinh vẫn nhận ra AI qua giọng nói/cách nói/tương tác — không giấu được hoàn toàn), mà từ việc AI đưa ra **quyết định đáng tin cậy, chính xác về kết quả học tập**, và nhận xét/gợi ý đúng cách học cho từng học sinh.
- Tiến bộ của học sinh phải được phụ huynh **nhìn thấy cụ thể**: qua chân dung học sinh, nhận xét, báo cáo do AI tạo ra — theo dõi liên tục, khác biệt rõ so với self-learning thuần túy (AI Class).
- Rào cản chính cần vượt: định kiến/chưa tin tưởng hoàn toàn vào AI, đặc biệt trong giáo dục.
- JTBD của phụ huynh: "thuê" AI Tutor làm thay vai trò đồng hành — học cùng con, giải đáp, theo dõi/nhắc nhở/động viên — việc họ muốn làm nhưng thiếu thời gian và chuyên môn.
- Khoảnh khắc tạo cảm giác "có người làm thay mình": khi phụ huynh nhận **cảnh báo/nhắc nhở chủ động** từ AI về tiến độ, chất lượng học tập, hoặc vấn đề con đang gặp — không phải tự vào xem báo cáo.

### 2. Kinh tế: giá & mâu thuẫn chi phí

- Có thể định giá 390k ngay từ Giai đoạn 1: so với self-learning thuần của AI Class, chỉ riêng việc bổ sung buổi học/tương tác với gia sư-AI đã là giá trị gia tăng đủ biện minh mức giá.
- Mâu thuẫn cốt lõi (TRIZ): độ sâu/chính xác của chân dung AI + mức độ AI thay được vai trò con người + tần suất/độ liên tục AI theo sát học sinh — càng cao thì chi phí xây dựng ban đầu và chi phí vận hành mỗi học sinh càng đắt, trong khi giá bán phải giữ ở 390k → áp lực trực tiếp lên biên lợi nhuận.
- Hướng gỡ ("thắng cả hai"): không chỉ dựa vào 390k/tháng để bù chi phí xây chân dung AI — coi **dữ liệu/chân dung người dùng thu thập được là nguồn giá trị riêng**, khấu hao chi phí đầu tư ban đầu qua toàn bộ vòng đời dữ liệu tích lũy, không chỉ qua giá thuê bao tháng (kết nối trực tiếp với cụm E).

### 3. Chân dung AI (persona engine)

- Tận dụng đội ngũ giáo viên đông đảo hiện có của Edupia Tutor để xây "chân dung" (persona) cho gia sư AI, thay vì tạo AI vô danh từ đầu.
- 3 yếu tố cụ thể lấy từ GV thật: **giọng nói, cách giảng bài, cách tương tác với học sinh**.
- Nguyên lý vận hành: nạp liên tục toàn bộ dữ liệu học tập của học sinh vào AI để xây "chân dung học sinh" theo thời gian, từ đó AI chủ động đưa gợi ý cho giáo viên — không chỉ là báo cáo tĩnh một lần.
- Đây là hạng mục đầu tư lớn nhất so với năng lực hiện có ở AI Class/Tutor: phải xây **cả hai** — chân dung người học VÀ chân dung giáo viên.

### 4. Mô hình vận hành / lộ trình sản phẩm

Lộ trình 3 giai đoạn (nền tảng của insight tổng hợp ở trên):

- **Giai đoạn 1:** AI đóng vai "trợ giảng" — hỗ trợ/tương tác liên tục với học sinh trong quá trình tự học (bài tập về nhà, tự ôn luyện), chưa thay thế gia sư online người thật. Cụ thể: AI đảm nhận (a) chấm-chữa bài sau buổi học, (b) tương tác liên tục với học sinh lúc tự học — giữ nguyên buổi học sống với GV thật.
- **Giai đoạn 2:** Gia sư AI trực tiếp dạy trong lớp học online; GV người thật đóng vai trợ giảng để hỗ trợ/giám sát.
- **Giai đoạn 3:** Gia sư AI chạy độc lập hoàn toàn trong lớp; có thể có "trợ giảng AI" khác hỗ trợ/giám sát chéo (không còn người thật).

Cơ chế xuyên suốt: trước mỗi buổi học sống, GV thật xem dữ liệu học tập mà AI đã thu thập/phân tích trong lúc học sinh tự học — buổi học được điều chỉnh dựa trên dữ liệu đó thay vì dạy chung chung. Một biến thể trình tự khác: đảo ngược vai trò truyền đạt — AI dạy kiến thức mới trước (học sinh học lại không giới hạn nếu chưa hiểu), con người là "chốt chặn" cuối: tương tác, giải đáp, khen thưởng, xác nhận chất lượng output của AI.

### 5. Giá trị phụ từ dữ liệu (ưu tiên thấp nhất, nhưng là đòn bẩy gỡ mâu thuẫn D)

- Chân dung học sinh làm cơ sở dữ liệu cho đội Sales tư vấn gói học phù hợp (thay vì tư vấn chung chung).
- Nếu học sinh tương tác với AI đủ sâu/liên tục, dữ liệu có thể giúp phát hiện **sớm** dấu hiệu tâm lý/hành vi — một hướng sản phẩm khác hẳn mục tiêu học tập ban đầu (ghi nhận như một khả năng mở, chưa phải cam kết sản phẩm).

## Khoảng trống / câu hỏi mở cần giải trước khi viết brief

- **Chưa có số liệu số học sinh/GV hiện tại của Edupia Tutor** — cần thiết để ước lượng mức tăng khả thi khi AI hỗ trợ GV phụ trách nhiều học sinh hơn. Liên hệ trực tiếp câu hỏi "Talktime GVCN thật" còn bỏ ngỏ ở product-brief v2.0 (tier 1.3).
- **Chưa xác định được thành phần nào có thể loại bỏ hẳn khỏi mô hình lớp học hiện tại** (kể cả ở quy trình sau buổi học) — thiếu thông tin về quy trình vận hành hiện tại của Edupia Tutor để trả lời.

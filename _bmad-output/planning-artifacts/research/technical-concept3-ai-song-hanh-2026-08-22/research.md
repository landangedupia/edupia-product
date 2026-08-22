---
title: 'technical research: Concept 3 (3.1×A "AI Song Hành") technical feasibility'
type: 'technical'
topic: 'Concept 3 (3.1×A "AI Song Hành") technical feasibility'
decision: 'Concept 3 (biến thể 3.1 × Phương án A) có khả thi về mặt kỹ thuật không, và với độ phức tạp/chi phí nào?'
source: 'run'
status: complete
preset: 'standard'
validation: 'normal'
created: '2026-08-22'
updated: '2026-08-22'
claims_verified: 19
claims_unverified: 8
claims_overturned: 3
claims_disputed: 1
---

# Nghiên cứu kỹ thuật: Tính khả thi của Concept 3 (3.1×A "AI Song Hành")

**Quyết định mà nghiên cứu này phục vụ:** Concept 3 (biến thể 3.1 × Phương án A) có khả thi về mặt kỹ thuật không, và với độ phức tạp/chi phí nào?

## Tóm tắt điều hành

**Kết luận ngắn gọn: Khả thi về mặt kỹ thuật, nhưng không đơn giản và không rẻ — và phần khó nhất không phải là công nghệ giọng nói.**

1. **Phần "dễ" đã chín muồi:** hạ tầng giọng nói + hội thoại thời gian thực đã đạt độ trưởng thành thương mại — độ trễ đủ tự nhiên cho hội thoại (Cartesia <90ms, OpenAI Realtime ~300ms, số liệu vendor tự công bố, chưa kiểm chứng độc lập) [20][22], hỗ trợ tiếng Việt xác nhận trực tiếp qua tài liệu chính thức của ElevenLabs, Cartesia, Google Cloud, cộng một lựa chọn nội địa (Vbee) đang vận hành ở quy mô sản xuất [60][61][62][64]. Build-vs-buy phần này có thể quyết định ngay (chi tiết: §4).

2. **Phần khó — "giám sát liên tục nhiều ngày + human-review theo chu kỳ tuần" — chưa có blueprint đã kiểm chứng ở bất kỳ đâu.** Sau 2 vòng nghiên cứu, không sản phẩm nào (K-12 hay lĩnh vực khác) đã triển khai đúng combo AI Song Hành cần: persona nhất quán + giám sát chủ động nhiều ngày + con người duyệt một lô dữ liệu **trước** mốc tiếp theo (khác escalation-theo-ngoại-lệ, pattern thực tế duy nhất tìm thấy) [14][21][48]. Đây là rủi ro R&D thật, không chỉ rủi ro thực thi — có thể là cơ hội first-mover thật (khớp phát hiện PRFAQ trước đó), có thể là dấu hiệu chưa ai làm được (chi tiết: §1, §2).

3. **Chi phí vận hành thực tế cao hơn cảm giác "chỉ là gọi API".** Character.AI mất ~2 năm tối ưu hạ tầng để đạt <$0,01/giờ hội thoại — **chỉ tính riêng hội thoại**, chưa cộng chấm bài/phát hiện lỗ hổng/persona [30]. Duolingo phải xây hẳn một nền tảng AI-agent nội bộ chỉ để chạy agent liên tục ổn định — ngay cả với hạ tầng ML trưởng thành [31]. Mức "<20 USD/tháng" khả thi cho hội thoại thuần túy, chưa có bằng chứng cho combo đầy đủ (chi tiết: §3).

4. **Rủi ro pháp lý/an toàn trẻ em giờ cụ thể, có deadline — không còn là rủi ro "danh mục chung chung".** Luật AI Việt Nam (134/2025/QH15, hiệu lực 1/3/2026, giáo dục gia hạn tới ~9/2027) cấm AI khai thác lỗ hổng trẻ em (Điều 7(2)(c)) và bắt buộc gắn nhãn audio giả giọng người thật (Điều 11(4)) [65] — trùng khớp tiền lệ toàn cầu (điều tra FTC [39], Character.AI/Google dàn xếp kiện tụng và rút tính năng chat mở dưới 18 tuổi [40]), củng cố quy định loại trừ "AI companion nhân cách hóa" đã có sẵn trong brief nội bộ (chi tiết: §5).

5. **Một con số cần sửa ngay:** "AI Duolingo chấm điểm nói khớp 92% với giáo viên" **không xác minh được và gần như sai**. Tài liệu kỹ thuật gốc Duolingo cho số khác, đáng tin hơn: ~85% đồng thuận, kappa 0,77 (máy-người) so với 0,68 (người-người) — AI đồng thuận **cao hơn cả mức người-người** [53][54]. Tin tốt hơn nếu dùng đúng số — loại bỏ "92%" khỏi mọi tài liệu downstream (chi tiết: §3).

**Cảnh báo lớn nhất:** phần lớn phát hiện "không tìm thấy sản phẩm nào làm X" là **thiếu bằng chứng trong ngân sách tìm kiếm**, không phải bằng chứng về sự bất khả thi — pattern kỹ thuật cho phần giám sát liên tục vẫn có thể tồn tại ở nơi không public (nội bộ một công ty Trung Quốc, một startup stealth) mà nghiên cứu này không tiếp cận được. Kết luận "greenfield" nên được đọc là "rủi ro cao + tiềm năng lợi thế cạnh tranh cao", không phải "không thể làm".

## Phạm vi & phương pháp

- **Loại nghiên cứu:** Technical (pack: `types/technical.md`), 5 mảng breadth-first, preset `standard` (3 subagent song song, 8 nguồn/vòng, tối đa 2 vòng), validation `normal`.
- **2 vòng đã chạy:** Vòng 1 khảo sát rộng cả 5 mảng; Vòng 2 (vòng cuối theo giới hạn `max_depth=2`) tập trung xác minh các khoảng trống/mâu thuẫn ưu tiên nhất từ vòng 1 (ELSA Speak, pattern HITL theo chu kỳ, độ chính xác chấm điểm, hỗ trợ tiếng Việt của vendor, khung pháp lý Việt Nam).
- **Xác minh:** mức `normal` — spot-check các claim mang tính quyết định tại thời điểm claim đó xuất hiện. 3 claim đã bị **overturned** (con số 92% Duolingo, tuyên bố Squirrel AI 24M-học-sinh không có nguồn gốc chính thống, phát hiện "không có vendor nào hỗ trợ tiếng Việt" của vòng 1) sau khi vòng 2 kiểm tra trực tiếp nguồn sơ cấp — đây là minh chứng quy trình xác minh hoạt động đúng, không phải lỗi.
- **Red-team pass:** không chạy (mặc định `off` ở validation `normal`).

---

## 1. Landscape & độ trưởng thành công nghệ

**Câu hỏi:** Công nghệ persona AI liên tục + giọng nói nhân bản + giám sát học tập chủ động đang ở mức trưởng thành nào?

Bức tranh trưởng thành **không đồng đều theo từng lớp**:

- **Persona + giọng nói thời gian thực: đã sản xuất, đã shipped.** Duolingo's "Lily" là một nhân vật AI có giọng nói video call thời gian thực, nhớ các cuộc gọi trước, sửa ngữ pháp trực tiếp — yêu cầu đầu tư thiết kế nhân vật có chủ đích (tuning tính cách, animation Rive đồng bộ giọng nói) [11]. Đây là bằng chứng "persona nhất quán + giọng nói + liên tục qua nhiều phiên" khả thi trong sản xuất hôm nay — **nhưng chỉ cho use case luyện hội thoại ngắn, chưa phải giám sát tự học cả tuần.**

- **Giám sát liên tục nhiều ngày + can thiệp chủ động: vẫn ở giai đoạn nghiên cứu, chưa phải pattern kỹ thuật đã giải quyết.** Bài báo arXiv tháng 5/2026 "Help Me, But Don't Track Me: Intervention Timing and Privacy Boundaries for Process-Aware AI Tutors" đóng khung chính xác vấn đề cốt lõi mà AI Song Hành cần (khi nào can thiệp, ranh giới giám sát/riêng tư) như **một bài toán thiết kế chưa có lời giải**, không phải một pattern kỹ thuật đã ổn định [14]. Một bài báo liên quan khác ("DeepTutor: Towards Agentic Personalized Tutoring", arXiv 2026) củng cố rằng "AI agent hành động tự chủ theo thời gian" vẫn là chủ đề nghiên cứu sống năm 2026, chưa phải pattern sản xuất đã chốt [15].

- **Tiền lệ sản phẩm hỗn hợp — có cả thành công và thất bại đáng chú ý.** Khanmigo (Khan Academy) *không* bị khai tử như một bài viết ban đầu (nghiên cứu tự phát hiện và sửa mâu thuẫn này) nhưng chỉ ~15% học sinh có quyền truy cập thực sự dùng đều đặn, buộc phải redesign toàn diện mùa hè 2026 — Khan Academy tự thừa nhận tương tác thiên về pattern thụ động ("IDK IDK") thay vì mối quan hệ bền vững mà một hệ thống persona cần [8][9]. Quizlet's Q-Chat — "AI tutor đầu tiên xây trên ChatGPT" — đã bị khai tử hoàn toàn sau 30/6/2025 theo tuyên bố chính thức của Quizlet; nguyên nhân "chi phí inference" chỉ có một nguồn phụ, chưa xác nhận [10].

- **Đối chiếu thị trường gần nhất — ELSA Speak (Việt Nam):** đây là sản phẩm cùng ngành, cùng thị trường gần nhất, và may mắn có một bài báo kỹ thuật sơ cấp thực sự (SLaTE 2023, tác giả chính là CTO ELSA) [42]. Kiến trúc lõi của ELSA là **tự xây, không phải wrapper API bên thứ ba**: ASR tùy chỉnh fine-tune trên 100+ giờ giọng nói non-native, module nhận diện giọng nói/ngữ pháp/từ vựng riêng, hạ tầng Kubernetes. Độ chính xác công bố: hệ số tương quan Pearson 0,897 với điểm IELTS (mẫu chỉ 50 bản ghi, tự đánh giá, chưa có kiểm chứng độc lập) [42]. **Quan trọng nhất: kiến trúc của ELSA — kể cả đối thủ gần nhất — là theo từng phiên (per-session), KHÔNG có bằng chứng giám sát chủ động nhiều ngày** — đúng loại tính năng cốt lõi mà AI Song Hành cần lại chưa xuất hiện ngay ở đối thủ cùng thị trường gần nhất.

- **Đối chiếu thị trường Việt Nam khác:** EduOne/OctoAI (hợp tác với Meta, chương trình "AI for Vietnam") là ví dụ persona AI luôn-bật gần nhất tại VN, đang mở rộng từ thí điểm 2024 lên quy mô tỉnh (Điện Biên, 17.000 giáo viên, 2025) hướng tới ra mắt toàn quốc Q1/2026 — nhưng tập trung hỗ trợ giáo viên/hướng dẫn bài học, chưa xác nhận giám sát hành vi học sinh cá nhân theo ngày [chỉ 1 nguồn tổng hợp, độ tin cậy trung bình].

**Kết luận mảng:** công nghệ nền (giọng nói, persona đơn phiên) đã sẵn sàng; cơ chế "giám sát liên tục + can thiệp chủ động" là phần R&D thật, chưa ai công khai đã giải quyết — kể cả tại thị trường Việt Nam.

---

## 2. Kiến trúc thực tế (Architecture patterns in practice)

**Câu hỏi:** Các sản phẩm AI-teacher-persona + human-in-the-loop thực tế dùng kiến trúc nào?

- **Persona AI phổ biến nhất là prompt-engineering trên LLM sẵn có, không phải fine-tuning.** Khanmigo và Duolingo's Lily đều xây persona bằng system prompt chi tiết (tính cách, phong cách nói, bối cảnh) đặt trên GPT-4 gốc, không phải model fine-tune riêng [1][2] (độ tin cậy trung bình — dựa trên snippet tìm kiếm, chưa fetch trực tiếp trang gốc). **Đây là tin tốt cho chi phí/effort ước tính ban đầu** — kiến trúc rẻ hơn nhiều so với việc fine-tune một model riêng.

- **Squirrel AI (Trung Quốc) là ngoại lệ kiến trúc — nhưng claim "24 triệu học sinh, model fine-tune riêng" KHÔNG xác minh được ngay cả ở nguồn sơ cấp của chính họ.** Sau khi fetch trực tiếp thông cáo báo chí chính thức của Squirrel AI (PR Newswire) ở vòng 2, tài liệu này **không hề tiết lộ chi tiết kiến trúc/dữ liệu huấn luyện** — chỉ có marketing năng lực (">90% độ chính xác nhận diện lỗi") [49]. Claim "Large Adaptive Model fine-tune trên 24M học sinh" vẫn chỉ xuất hiện ở nguồn tổng hợp/thứ cấp sau 2 vòng tìm kiếm — **không nên trích dẫn như sự thật đã xác lập.**

- **Yuanfudao (猿辅导, Trung Quốc) có mô tả kiến trúc cụ thể hơn (dù vẫn qua báo chí thương mại, chưa phải tài liệu kỹ thuật gốc):** kiến trúc "dual-model" (model tự phát triển + model nền tảng chung) cộng một lớp riêng biệt gọi là "chuỗi tư duy giảng dạy" (教学思维链) — được xây cùng giáo viên kỳ cựu để mã hóa chuyên môn sư phạm lên trên model nền, thay vì chỉ dựa vào model gốc [51]. Đây là tín hiệu hữu ích: **tách riêng lớp "chuyên môn sư phạm" khỏi lớp "model nền tảng" là một pattern kiến trúc thực tế đáng cân nhắc**, không chỉ là ý tưởng lý thuyết.

- **Human-in-the-loop trong thực tế là escalation-theo-ngoại-lệ, KHÔNG phải batch-review-theo-chu-kỳ mà thiết kế AI Song Hành cần.** Pattern thực tế tìm thấy (advising sinh viên đại học, không phải K-12): AI tự động gửi nhắc nhở trực tiếp cho học sinh **không cần con người duyệt trước**; con người chỉ vào cuộc khi có trường hợp ngoại lệ được escalate [6]. Sau 2 vòng tìm kiếm chuyên sâu, **pattern "AI hoạt động tự chủ cả tuần → con người duyệt một lô dữ liệu theo lịch TRƯỚC buổi học tiếp theo" chỉ tồn tại như một khuyến nghị thiết kế trong tài liệu kỹ thuật AI-agent nói chung (MindStudio: "gom các mục cần gắn cờ lại, để người duyệt xử lý trong một lượt mỗi ngày"), CHƯA có sản phẩm/triển khai thực tế nào được ghi nhận áp dụng đúng pattern này** [48]. Đây là kết luận nên báo cáo trung thực là "được thảo luận trong lý thuyết, chưa có ví dụ sản xuất được kiểm chứng" — không phải "không tồn tại" hay "đã được chứng minh".

- **Rủi ro vận hành đã ghi nhận của HITL ở quy mô lớn: "kiệt sức giám sát" (supervision fatigue).** Người duyệt không còn làm công việc tạo sinh nữa, nhưng phải giữ ý định gốc trong đầu khi audit khối lượng lớn output AI phần lớn đúng — được mô tả là *khó hơn về nhận thức*, không phải dễ hơn, so với công việc mà nó thay thế [4] (nguồn từ lĩnh vực liền kề — review code AI, không phải giáo dục — áp dụng như phép loại suy, không phải bằng chứng trực tiếp giáo dục).

**Kết luận mảng:** kiến trúc persona rẻ (prompt engineering) là khả thi cho phần giọng nói/tương tác; nhưng cơ chế human-review-theo-chu-kỳ-tuần mà thiết kế nội bộ đề xuất chưa có tiền lệ triển khai thực tế nào được tìm thấy — team cần tự thiết kế và validate, không dựa vào một blueprint có sẵn.

---

## 3. Thực tế triển khai (Implementation reality)

**Câu hỏi:** Effort, chi phí, và độ chính xác thực tế của việc build phần này là bao nhiêu?

- **Chi phí "rẻ" chỉ đạt được sau đầu tư kỹ thuật lớn, không phải mặc định của việc gọi API.** Character.AI đạt chi phí inference hội thoại dưới $0,01/giờ chỉ sau khi giảm 33 lần chi phí/đơn vị kể từ khi ra mắt 2022 — quá trình này mất khoảng 2 năm đầu tư kỹ thuật tối ưu hạ tầng (attention/KV-cache tùy chỉnh, hạ tầng GPU quy mô quốc tế) [30]. **Con số này chỉ tính riêng hội thoại thuần túy — chưa cộng chấm bài, phát hiện lỗ hổng kiến thức, hay truy xuất persona mà AI Song Hành cần thêm.** Khoảng cách giữa "chi phí LLM hội thoại thô" và "chi phí giám sát sư phạm liên tục đầy đủ" không được bất kỳ nguồn nào giải quyết trong nghiên cứu này — nên coi là câu hỏi mở cần ước tính riêng, không suy ra từ con số Character.AI.

- **"Giám sát liên tục" đòi hỏi đầu tư ở cấp nền tảng (platform), không phải một tính năng cộng thêm.** Duolingo phải xây hẳn một "nền tảng AI agent" nội bộ (lớp orchestration/observability/cost-gateway dùng chung) vì việc build agent AI bền vững, có thể đánh giá được — riêng lẻ cho từng tính năng — không bền vững về lâu dài [31]. Đây là bằng chứng trực tiếp: "giám sát liên tục + agent chủ động" ở quy mô sản xuất, ngay cả tại một công ty có hạ tầng ML trưởng thành, đòi hỏi đầu tư nền tảng riêng, không phải một tính năng gia tăng.

- **Sửa lại con số độ chính xác chấm điểm — quan trọng cho launch blocker đã xác định.** Claim phổ biến "AI Duolingo khớp 92% với giáo viên người" **không xác minh được ở bất kỳ đâu sau khi tìm kiếm trực tiếp và gần như là số sai**. Tài liệu kỹ thuật chính thức của Duolingo (Technical Manual + validity report — nguồn sơ cấp) cho con số khác, đáng tin hơn: với phần thi nói mở rộng (DET Extended Speaking Responses), AI ("Duo Speaking Scorer") đồng thuận với người chấm ~85% thời gian, hệ số Cohen's κ = 0,77 (máy-người) so với κ = 0,68 (người-người) — **tức là mức đồng thuận máy-người cao hơn cả mức đồng thuận người-người với nhau** [53][54]. Đây là tin tốt hơn về mặt kỹ thuật (AI grading khả thi ở mức tốt) nhưng khác đáng kể con số vẫn được lan truyền — **cần sửa "92%" thành "~85%, kappa 0,77" trong mọi tài liệu downstream.**

- **Nguyên nhân khả dĩ nhất cho lỗi chấm điểm hiện tại của Edupia Speak: bias theo accent.** Văn liệu 2025 ghi nhận rõ hệ thống ASR có tỷ lệ lỗi cao hơn đáng kể với người nói non-native (một số liệu được trích: ~44,2% tỷ lệ lỗi cho tiếng Anh giọng Nigeria) [56]. WhisperX kết hợp hậu xử lý GPT-4o được ghi nhận ổn định hơn ASR cloud thông thường cho giọng non-native [56]. **Không có nguồn nào trong nghiên cứu này kiểm thử cụ thể tiếng Anh giọng Việt** — đây là khoảng trống thật, nhưng văn liệu khiến accent-handling trở thành nguyên nhân gốc rễ khả dĩ nhất cho complaint hiện có, đáng ưu tiên điều tra trước khi launch Giai đoạn 1 (đúng như đã xác định là launch blocker).

- **AI grading có xu hướng lệch hệ thống — chấm thấp hơn người, không phải nhiễu ngẫu nhiên.** Một nghiên cứu ghi nhận GPT-4o chấm cao hơn người trong 6,2% trường hợp nhưng thấp hơn người trong 38,8% trường hợp [58]. Một tổng hợp 65 nghiên cứu (2022–2025) cho thấy mức đồng thuận LLM-người dao động rất rộng (0,30–0,80), phụ thuộc mạnh vào ngữ cảnh/rubric — **nghĩa là bất kỳ con số "độ chính xác X%" đơn lẻ nào (kể cả 92% lẫn 85%) đều cần đọc kèm ngữ cảnh cụ thể, không nên coi là hằng số phổ quát** [59].

**Kết luận mảng:** effort thực tế cho phần giám sát/agent liên tục là đầu tư nền tảng, không phải tính năng nhỏ; độ chính xác chấm điểm AI ở mức khả thi thương mại (~85% đồng thuận, tốt hơn con số đang lan truyền) nhưng accent bias là nguyên nhân khả dĩ nhất cho complaint hiện tại và cần một vòng kiểm thử riêng cho tiếng Anh giọng Việt trước khi coi launch blocker đã được giải quyết.

---

## 4. Build vs Buy — hạ tầng giọng nói & LLM thời gian thực

**Câu hỏi:** Vendor nào khả thi, chi phí bao nhiêu, có hỗ trợ tiếng Việt không?

- **Giá & độ trễ (đã xác minh qua trang chính thức vendor):** ElevenLabs TTS $0,05–0,10/1K ký tự; Conversational AI $0,08–0,16/phút [17]. OpenAI Realtime API ~$0,06–0,24/phút audio, độ trễ đầu-cuối ~300ms so với 600–1.100ms của pipeline STT→LLM→TTS truyền thống (số liệu do OpenAI công bố, đối chiếu 1 nguồn phái sinh thứ ba) [22][23]. Cartesia Sonic-3.6 tuyên bố độ trễ dưới 90ms (chưa kiểm chứng độc lập, chỉ là số liệu vendor tự công bố) [20].

- **Hỗ trợ tiếng Việt: đã ĐẢO NGƯỢC phát hiện ban đầu của vòng 1 sau khi kiểm tra trực tiếp tài liệu vendor.** Vòng 1 ban đầu không tìm thấy bằng chứng — nhưng đây là *thiếu bằng chứng*, không phải *bằng chứng phủ định*. Vòng 2 fetch trực tiếp tài liệu kỹ thuật gốc và xác nhận: **ElevenLabs liệt kê rõ tiếng Việt trong danh sách ngôn ngữ hỗ trợ Professional Voice Cloning** [60]; **API clone giọng của Cartesia có `vi` (Vietnamese) trong enum SupportedLanguage** — đây là tham số gắn trực tiếp vào lời gọi API, không phải trang marketing [61]; **Google Cloud (Dialogflow CX voice cloning) có `vi-VN` trong danh sách locale hỗ trợ** (lưu ý: đây là sản phẩm Dialogflow CX, khác với Cloud TTS custom-voice thông thường — hai bề mặt sản phẩm khác nhau, không nên gộp chung) [62]. PlayHT vẫn chưa xác nhận được cho tính năng clone giọng cụ thể [63].
  - **Câu hỏi chưa trả lời được (khác với "có hỗ trợ tiếng Việt không"):** liệu một giọng được clone từ người nói tiếng Việt có thể phát ra **tiếng Anh với accent tiếng Việt** hay không (thay vì bị chuẩn hóa về phát âm chuẩn) — không tài liệu vendor nào đề cập, cần thử nghiệm trực tiếp (hands-on trial), không thể trả lời qua tra cứu tài liệu.

- **Vendor nội địa đáng cân nhắc: Vbee (vbee.vn).** Một công ty Việt Nam vận hành voice cloning tiếng Việt ở quy mô sản xuất, được xây dựng vì lý do công khai: "các nền tảng TTS toàn cầu thường không nắm bắt được sắc thái phức tạp của tiếng Việt" [64]. Chạy trên hạ tầng Google Cloud (Cloud Run), báo cáo cải thiện tốc độ scale 800% sau khi chuyển sang serverless. **Đây là lựa chọn thay thế/dự phòng khả thi, độc lập với các vendor toàn cầu**, đáng một buổi demo/đánh giá trực tiếp.

- **Yêu cầu pháp lý/consent khi clone giọng:** ElevenLabs yêu cầu xác nhận click-through (Instant Voice Cloning) và một bước xác minh bổ sung (Professional Voice Cloning) [27] — đây là điều khoản chính thức, độ tin cậy cao. Riêng nhận định "cơ chế thực thi chủ yếu là tự khai báo + truy vết sau (traceability), không phải xác minh quyền sở hữu trước khi clone" chỉ đến từ một nguồn tổng hợp thứ cấp (margabagus.com), **chưa đối chiếu được với văn bản ToS gốc của ElevenLabs** — độ tin cậy thấp, cần xác minh lại trước khi dùng làm căn cứ quyết định. Nếu đúng, điều này **thiếu chặt chẽ** cho một quyết định có mức độ ảnh hưởng như clone giọng một giáo viên thật ở quy mô thương mại — dù đúng hay chưa, cần đọc trực tiếp Điều khoản dịch vụ hiện hành của vendor (không chỉ bản tóm tắt thứ cấp) trước khi cam kết.

**Kết luận mảng:** hạ tầng giọng nói tiếng Việt khả thi về mặt kỹ thuật qua cả vendor toàn cầu (ElevenLabs, Cartesia, Google) lẫn vendor nội địa (Vbee) — đây không còn là rào cản kỹ thuật chính. Rào cản còn lại là: (a) accent-retention khi clone (chưa trả lời được, cần thử nghiệm), (b) độ chặt chẽ pháp lý của quy trình consent khi clone giọng người thật.

---

## 5. Sức khỏe hệ sinh thái vendor & rủi ro pháp lý

**Câu hỏi:** Vendor có đủ bền vững cho cam kết sản phẩm nhiều năm không? Rủi ro pháp lý/quy định nào đang treo lơ lửng?

- **Sự bền vững tài chính của vendor KHÔNG đồng nghĩa với ổn định hợp đồng/API cho bên tích hợp — đây là "regret risk" cốt lõi cần nêu rõ trong quyết định.** ElevenLabs gọi vốn $500M Series D (Sequoia, định giá $11B, tháng 2/2026), doanh thu tăng từ $330M lên ~$500M ARR [34] — về tài chính rất mạnh. Nhưng **Điều khoản dịch vụ của chính ElevenLabs cho phép thay đổi giá đơn phương chỉ với 7 ngày báo trước**, và họ chủ động deprecate model/clone-ID theo lịch trình riêng ngay cả khi đang dẫn đầu thị trường [35][36]. Sức mạnh tài chính của vendor không bảo vệ bên tích hợp khỏi thay đổi hợp đồng bất lợi.

- **Tiền lệ cụ thể, có ngày tháng: một vendor voice-cloning tầm trung biến mất trong vòng 5 tháng.** PlayHT/PlayAI (~40.000 khách hàng, cùng tầm với ElevenLabs/Cartesia) bị Meta acquihire tháng 7/2025 và đóng cửa hoàn toàn 31/12/2025 — API ngừng hoạt động sớm hơn lịch công bố, không có công cụ export dữ liệu [37]. (Các chi tiết cụ thể hơn về tác động khách hàng — không hoàn tiền, không export — chỉ có nguồn từ trang marketing của đối thủ cạnh tranh giành khách hàng cũ, **chưa xác minh được qua nguồn trung lập** sau 2 vòng tìm kiếm — Trustpilot/G2 đều chặn fetch, Reddit không có kết quả — nên chỉ dùng sự kiện đóng cửa làm bằng chứng, không dùng chi tiết chưa kiểm chứng.)

- **Rủi ro danh mục cao nhất: quy định/pháp lý toàn cầu về AI companion nhắm vào trẻ vị thành niên đang siết chặt nhanh, và trực tiếp liên quan đến chính pattern "persona AI + giám sát liên tục" mà AI Song Hành đề xuất.** FTC (Mỹ) mở điều tra chính thức theo Mục 6(b) từ 11/9/2025 với 7 công ty lớn (Alphabet, Character Technologies, Instagram, Meta, OpenAI, Snap, X.AI), tập trung vào tác động tâm lý/cảm xúc lên trẻ vị thành niên và tuân thủ COPPA — đang mở, chưa kết thúc [39]. Google và Character.AI đang dàn xếp nhiều vụ kiện wrongful-death liên quan đến các vụ tự tử ở tuổi teen được cho là do chatbot AI persona góp phần gây ra; Character.AI đã **chủ động rút** tính năng chat mở cho người dùng dưới 18 tuổi (hiệu lực từ tháng 11/2025) như một biện pháp an toàn [40]. **Đây củng cố trực tiếp, bằng bằng chứng độc lập bên ngoài, quy tắc loại trừ cứng đã có sẵn trong brief nội bộ** ("không dùng archetype AI companion nhân cách hóa cho trẻ em") — không phải một rủi ro lý thuyết, mà một xu hướng pháp lý đang diễn ra thật, với hệ quả thực tế (rút tính năng) đã xảy ra ở một công ty lớn cùng loại công nghệ.

- **Việt Nam giờ đã có luật cụ thể, trực tiếp áp dụng — không còn là khoảng trống quy định.** Luật số 134/2025/QH15 (Luật Trí tuệ nhân tạo), thông qua 10/12/2025, hiệu lực **1/3/2026**, với **18 tháng gia hạn cho lĩnh vực giáo dục** (hạn tuân thủ đầy đủ ~9/2027) [65][67]. Đã kiểm tra trực tiếp văn bản luật (bản dịch tiếng Anh, LuatVietnam):
  - **Điều 7(2)(c):** cấm ứng dụng AI khai thác lỗ hổng của các nhóm được chỉ định — **trẻ em được nêu tên rõ ràng** — để gây hại.
  - **Điều 6(2)(b):** AI trong lĩnh vực giáo dục phải đảm bảo "phù hợp với đặc điểm lứa tuổi và sự phát triển của người học", không được gây tác động phân loại/đánh giá bất lợi cho người học.
  - **Điều 11(4):** bắt buộc gắn **"nhãn dễ nhận diện"** trên nội dung audio mô phỏng/tái tạo giọng nói của người thật — đây là **nghĩa vụ công bố cụ thể theo luật Việt Nam cho việc clone giọng nói**, trực tiếp áp dụng cho persona giáo viên AI. Điều 11(2) yêu cầu thêm việc đánh dấu máy-đọc-được (machine-readable) cho nội dung AI-generated nói chung.
  - Luật không có chế độ "dữ liệu sinh trắc học giọng nói" riêng — việc xử lý giọng nói như dữ liệu cá nhân sẽ rơi vào phạm vi Luật Bảo vệ dữ liệu cá nhân/Nghị định 356/2025 thay vì luật AI.

- **Khung bảo vệ dữ liệu cá nhân cũng đã thay đổi, hiệu lực từ 1/1/2026, siết chặt hơn đáng kể:** Luật số 91/2025/QH15 + Nghị định 356/2025/NĐ-CP thay thế hoàn toàn Nghị định 13/2023/NĐ-CP — đặt tên **dữ liệu trẻ em là một danh mục nhạy cảm riêng biệt**, cấm consent mặc định/tick sẵn, thêm yêu cầu chứng chỉ DPO và cơ chế thanh tra qua Cục An ninh mạng (A05) [66][68].

- **Bộ GD&ĐT (MOET) hiện chưa có lập trường về sản phẩm AI-tutor/persona thương mại** — chỉ có Công văn 7652/BGDĐT-GDPT (21/11/2025) thí điểm chương trình **giáo dục kiến thức về AI** cho học sinh (12/2025–5/2026) [69], không phải hướng dẫn/hạn chế cho sản phẩm bên thứ ba như AI Song Hành. Đây là khoảng trống quy định thật cho đúng danh mục sản phẩm này — nên đọc là "chưa có ai kiểm tra", không phải "được phép mặc nhiên".

**Kết luận mảng:** rủi ro nghiêm trọng nhất của toàn bộ nghiên cứu không nằm ở công nghệ mà ở đây — quy định pháp lý Việt Nam giờ đã cụ thể và có deadline (Điều 7(2)(c), Điều 11(4), Luật 91/2025), trùng khớp với một làn sóng pháp lý toàn cầu đang diễn ra thật (không phải giả định) nhắm đúng vào loại sản phẩm "AI persona + trẻ em". Cần đưa yêu cầu gắn nhãn AI-generated-voice và loại trừ archetype companion vào thiết kế Giai đoạn 1 ngay từ đầu, không phải bổ sung sau khi bị khiếu nại.

---

## Cross-dimension insights

- **Nghịch lý trung tâm của toàn bộ nghiên cứu:** phần công nghệ "khó nhìn" (giọng nói, độ trễ, hỗ trợ tiếng Việt) hóa ra **đã giải quyết**; phần nghe có vẻ "chỉ là quy trình vận hành" (con người duyệt dữ liệu AI theo tuần trước buổi học) hóa ra **chưa ai chứng minh đã làm được** ở bất kỳ đâu. Đội ngũ dễ đánh giá thấp rủi ro ở đúng phần này vì nó nghe "không kỹ thuật" — nhưng đây chính là phần cốt lõi quyết định trust mechanism của toàn bộ Concept 3 theo brief nội bộ.
- **Rủi ro pháp lý và rủi ro kỹ thuật cộng hưởng vào đúng một điểm:** nghĩa vụ gắn nhãn giọng nói AI theo Điều 11(4) không phải một ràng buộc pháp lý tách rời — nó tương tác trực tiếp với "persona-trust paradox" mà PRFAQ nội bộ đã xác định (A6): nếu phải gắn nhãn rõ ràng "đây là giọng AI mô phỏng", điều đó có thể làm suy yếu chính cơ chế "trust neo vào một giáo viên cụ thể" mà biến thể 3.1 dựa vào — một ràng buộc thiết kế mới, không chỉ compliance thuần túy.
- **Chi phí thực và độ chính xác thực đều tốt hơn/khác với con số đang lưu hành nội bộ và trên thị trường** — cả hai theo hướng cần cập nhật downstream: chi phí "rẻ" (Character.AI) chỉ đúng cho một phần nhỏ của hệ thống cần build; độ chính xác chấm điểm (85% kappa cao) thực ra tốt hơn con số 92% đang lan truyền nhưng đo bằng thước khác — cả hai đều cần truyền đạt lại chính xác cho BOD, không chỉ lấy nguyên số cũ.

## Bằng chứng trái chiều (Contrary evidence)

Không chạy red-team pass ở mức validation `normal` (mặc định `red_team=off`). Không có mục này.

## Khuyến nghị

1. **Tách rời quyết định "hạ tầng giọng nói" khỏi quyết định "cơ chế giám sát."** Phần giọng nói (build vs buy: ElevenLabs/Cartesia/Google/Vbee) có thể quyết định độc lập, nhanh — công nghệ đã sẵn sàng, chi phí đã rõ [17][20][22][60][61][62][64]. Không nên để phần này làm chậm quyết định tổng thể. *(Feeds: brief — feasibility section; roadmap — vendor selection)*

2. **Coi cơ chế "human-review theo chu kỳ tuần" là một hạng mục R&D/thiết kế cần prototype và test riêng, không phải một tính năng có thể ước tính effort như một API tích hợp thông thường.** Chưa có sản phẩm nào (kể cả ELSA Speak, đối thủ gần nhất) từng làm đúng combo này. *(Feeds: architecture spine — candidate paradigm cần tự thiết kế, không copy; roadmap risk — gắn buffer effort cao hơn ước tính ban đầu)*

3. **Ưu tiên điều tra accent bias làm nguyên nhân gốc cho launch blocker "sửa lỗi chấm điểm AI" trước khi coi đã giải quyết** — văn liệu chỉ ra đây là nguyên nhân khả dĩ nhất cho complaint hiện tại trên Edupia Speak, dù chưa có nghiên cứu nào kiểm thử cụ thể tiếng Anh giọng Việt [56]. *(Feeds: brief — launch blocker validation)*

4. **Sửa con số "92%" thành "~85% đồng thuận, kappa 0,77 (cao hơn mức người-người 0,68)" trong mọi tài liệu, slide, và trao đổi BOD sắp tới** — đây là sửa chữa dựa trên nguồn sơ cấp, không phải suy đoán. *(Feeds: mọi tài liệu downstream đang trích dẫn 92%)*

5. **Đưa yêu cầu gắn nhãn giọng nói AI (Điều 11(4), Luật 134/2025/QH15) và loại trừ archetype "AI companion nhân cách hóa" vào thiết kế UX/sản phẩm ngay từ Giai đoạn 1**, không chờ pháp lý duyệt sau — deadline tuân thủ giáo dục là ~9/2027 nhưng thiết kế nên compliant từ đầu để tránh phải redesign. *(Feeds: architecture spine — operational constraint; PRD input)*

6. **Đánh giá Vbee như một lựa chọn vendor giọng nói tiếng Việt song song với ElevenLabs/Cartesia**, đặc biệt nếu accent-retention (tiếng Anh giọng Việt) từ vendor toàn cầu không đạt kỳ vọng qua thử nghiệm trực tiếp. *(Feeds: roadmap — vendor shortlist)*

7. **Không dùng con số cost của Character.AI (<$0,01/giờ) làm cơ sở ước tính margin** — nó chỉ phản ánh phần hội thoại thuần túy sau 2 năm tối ưu hạ tầng, không phản ánh chi phí đầy đủ combo chấm bài + phát hiện lỗ hổng + giám sát liên tục mà AI Song Hành cần. Cần một ước tính chi phí riêng, không suy ra từ nguồn này. *(Feeds: A3 — vòng lặp effort↔margin trong PRFAQ, cần ước tính riêng chứ không mượn số từ nguồn ngoài)*

## Câu hỏi mở

| Câu hỏi | Cần gì để trả lời |
|---|---|
| Giọng clone tiếng Việt có giữ được accent khi phát tiếng Anh (thay vì bị chuẩn hóa) không? | Thử nghiệm trực tiếp (hands-on trial) với ElevenLabs/Cartesia/Vbee — không trả lời được qua tra cứu tài liệu |
| Chi phí đầy đủ (hội thoại + chấm bài + phát hiện lỗ hổng + persona) mỗi học sinh/tháng là bao nhiêu? | Ước tính kỹ thuật nội bộ (Product+Engineering+Finance) — không có tiền lệ công khai nào đủ đầy đủ để mượn số |
| AI grading có chính xác đủ cho tiếng Anh giọng Việt cụ thể không? | Kiểm thử nội bộ trên dữ liệu học sinh Việt Nam thực tế, không dựa vào văn liệu tiếng Anh/Nigeria chung chung |
| Pattern "batch-review-theo-tuần" có khả thi vận hành ở quy mô Edupia không (bao nhiêu học sinh/GVCN)? | Pilot nội bộ nhỏ trước khi cam kết roadmap đầy đủ — chưa có tiền lệ ngành để tham chiếu |
| Điều khoản dịch vụ hiện hành của vendor clone giọng có đủ chặt chẽ về consent cho việc clone giọng giáo viên thật ở quy mô thương mại không? | Đọc trực tiếp ToS hiện hành (không phải bản tóm tắt) + tư vấn pháp lý, đối chiếu Điều 11(4) Luật AI VN |
| Nghị định 356/2025 có yêu cầu cụ thể gì cho consent xử lý dữ liệu giọng nói trẻ em? | Đọc toàn văn nghị định từ cổng thông tin chính phủ (nghiên cứu này chỉ tiếp cận được qua nguồn luật thứ cấp) |

## Phụ lục nguồn

| # | Nguồn | Publisher | Ngày XB | Truy cập | Độ tin cậy |
|---|---|---|---|---|---|
| [1] | [Khanmigo GPT-4 explainer](https://www.techlearning.com/news/what-is-khanmigo-the-gpt-4-learning-tool-explained-by-sal-khan) | Tech & Learning | n/a | 2026-08-22 | Trung bình |
| [2] | [Duolingo chatbot language practice](https://blog.duolingo.com/chatbot-language-practice/) | Duolingo Blog | n/a | 2026-08-22 | Trung bình |
| [4] | [The Human-in-the-Loop is Tired](https://pydantic.dev/articles/the-human-in-the-loop-is-tired) | Pydantic | 2026-02-18 | 2026-08-22 | Cao |
| [6] | [AI Agents Nudge At-Risk Students](https://element451.com/blog/which-ai-agents-help-nudge-at-risk-students-toward-success) | Element451 | 2025-09-22 | 2026-08-22 | Trung bình |
| [8] | [RIP Khanmigo](https://danmeyer.substack.com/p/rip-khanmigo-and-edtech-industry) | Dan Meyer (Substack) | 2026-04 | 2026-08-22 | Trung bình |
| [9] | [Only 15% of students use Khanmigo](https://www.edtechinnovationhub.com/news/only-15-percent-of-students-with-access-to-khanmigo-actually-use-it-khan-academy-admits) | EdTech Innovation Hub | 2026-04 | 2026-08-22 | Trung bình |
| [10] | [Meet Q-Chat](https://quizlet.com/blog/meet-q-chat) | Quizlet (official) | 2025-06 | 2026-08-22 | Cao (sự kiện khai tử) |
| [11] | [Duolingo Lily video call](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life) | Rive.app | 2025-2026 | 2026-08-22 | Trung bình |
| [14] | [arXiv 2604.06178 — Process-aware AI tutors](https://arxiv.org/pdf/2604.06178) | arXiv preprint | 2026-05-05 | 2026-08-22 | Trung bình |
| [15] | [arXiv 2604.26962 — DeepTutor](https://arxiv.org/pdf/2604.26962) | arXiv preprint | 2026 | 2026-08-22 | Thấp (chưa fetch đầy đủ) |
| [17] | [ElevenLabs pricing](https://elevenlabs.io/pricing/api) | ElevenLabs (official) | 2026-08 | 2026-08-22 | Cao |
| [20] | [Cartesia Sonic-3.6](https://www.cartesia.ai/sonic) | Cartesia + MarkTechPost | 2026-08-18 | 2026-08-22 | Trung bình |
| [21] | [Event-Driven EdTech Development](https://6b.education/insight/event-driven-edtech-development-real-time-analytics-and-student-engagement-tracking/) | 6B Education | 2025-11-17 | 2026-08-22 | Trung bình |
| [22] | [OpenAI Realtime API](https://openai.com/index/introducing-the-realtime-api/) | OpenAI (official) | 2026 | 2026-08-22 | Trung bình |
| [23] | [OpenAI Realtime latency cut](https://www.techtimes.com/articles/319860/20260707/openai-realtime-api-cuts-voice-agent-latency-25-adds-reasoning-mini-model.htm) | TechTimes | 2026-07-07 | 2026-08-22 | Trung bình |
| [27] | [ElevenLabs Use Policy](https://elevenlabs.io/use-policy) | ElevenLabs (official) | 2026 | 2026-08-22 | Cao |
| [30] | [Optimizing AI inference at Character.AI](https://blog.character.ai/optimizing-ai-inference-at-character-ai/) | Character.AI Engineering Blog | 2024-06 | 2026-08-22 | Trung bình |
| [31] | [Duolingo production-ready AI agent platform](https://blog.duolingo.com/production-ready-ai-agent-platform/) | Duolingo Engineering Blog | 2026 | 2026-08-22 | Trung bình |
| [34] | [ElevenLabs raises $500M](https://techcrunch.com/2026/02/04/elevenlabs-raises-500m-from-sequioia-at-a-11-billion-valuation/) | TechCrunch | 2026-02-04 | 2026-08-22 | Cao |
| [35] | [ElevenLabs Terms of Use](https://elevenlabs.io/terms-of-use) | ElevenLabs (official) | 2026 | 2026-08-22 | Cao |
| [36] | [ElevenLabs changelog](https://elevenlabs.io/docs/changelog) | ElevenLabs (official) | 2026 | 2026-08-22 | Cao |
| [37] | [Meta acquires PlayAI](https://techcrunch.com/2025/07/13/meta-acquires-voice-startup-play-ai/) | TechCrunch | 2025-07-13 | 2026-08-22 | Cao |
| [39] | [FTC launches AI chatbot companion inquiry](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions) | FTC.gov (official) | 2025-09-11 | 2026-08-22 | Cao |
| [40] | [Google/Character.AI settle teen suicide suits](https://www.cnbc.com/2026/01/07/google-characterai-to-settle-suits-involving-suicides-ai-chatbots.html) | CNBC + Fortune | 2026-01-07/08 | 2026-08-22 | Cao |
| [42] | [ELSA Speech Analyzer (SLaTE 2023)](https://www.isca-archive.org/slate_2023/anguera23_slate.pdf) | ISCA Archive (Anguera et al., ELSA AI Research) | 2023-08 | 2026-08-22 | Cao (nguồn sơ cấp) |
| [48] | [Human-in-the-Loop Checkpoints for AI Agents](https://www.mindstudio.ai/blog/human-in-the-loop-checkpoints-ai-agents-full-autonomy) | MindStudio | 2026 | 2026-08-22 | Trung bình |
| [49] | [Squirrel AI LAM announcement](https://www.prnewswire.com/news-releases/squirrel-ai-debuts-enhanced-large-multimodal-adaptive-model-revolutionizing-its-educational-software-and-hardware-systems-302186596.html) | PR Newswire (Squirrel AI official) | 2026 | 2026-08-22 | Cao (nguồn sơ cấp, nhưng không có chi tiết kiến trúc) |
| [51] | [Yuanfudao Xiao Yuan AI](https://tech.chinadaily.com.cn/a/202504/17/WS680071c2a310e29a7c4a9b3f.html) | China Daily + QbitAI | 2025-04 | 2026-08-22 | Trung bình |
| [53] | [Duolingo English Test Technical Manual 2023](https://www.dpsdurgapur.com/wp-content/uploads/2024/05/duo-lingo-technical-mannual-2023.pdf) | Duolingo (official) | 2023 | 2026-08-22 | Cao (nguồn sơ cấp) |
| [54] | [Duolingo validity report](https://d23cwzsbkjbm45.cloudfront.net/media/resources/standards/validity.pdf) | Duolingo (official) | 2023 | 2026-08-22 | Cao (nguồn sơ cấp) |
| [56] | [Accents Still Confuse AI](https://www.medrxiv.org/) (medRxiv 2025.08.29.25333548) | medRxiv preprint | 2025-08-29 | 2026-08-22 | Trung bình |
| [58] | [arXiv 2406.16510 — LLMs in Student Assessment](https://arxiv.org/abs/2406.16510) | arXiv preprint | 2024 | 2026-08-22 | Trung bình |
| [59] | Agreement Between LLMs and Human Raters (research synthesis, 65 studies) | ResearchGate | 2025 | 2026-08-22 | Trung bình |
| [60] | [ElevenLabs PVC supported languages](https://elevenlabs.io/docs/help-center/product/voices/voice-cloning/what-languages-are-supported-with-professional-voice-cloning-pvc) | ElevenLabs (official) | 2026-08 | 2026-08-22 | Cao |
| [61] | [Cartesia Clone Voice API reference](https://docs.cartesia.ai/api-reference/voices/clone) | Cartesia (official) | 2026-08 | 2026-08-22 | Cao |
| [62] | [Google Cloud Dialogflow CX Voice Cloning](https://docs.cloud.google.com/dialogflow/cx/docs/concept/voice-cloning) | Google Cloud (official) | 2026-08 | 2026-08-22 | Cao |
| [63] | [PlayHT Models reference](https://docs.play.ht/reference/models) | PlayHT (official) | 2026-08 | 2026-08-22 | Trung bình |
| [64] | [Vbee hợp tác Google Cloud](https://vbee.vn/blog/news/vbee-hop-tac-voi-google-cloud/) | Vbee.vn + Cloud Ace | 2025 | 2026-08-22 | Trung bình |
| [65] | [Luật 134/2025/QH15 (Luật AI Việt Nam)](https://english.luatvietnam.vn/law-no-134-2025-qh15-dated-december-10-2025-of-the-national-assembly-on-artificial-intelligence-422299-doc1.html) | LuatVietnam (bản dịch chính thức) | 2025-12-10 | 2026-08-22 | Cao (nguồn sơ cấp, đã fetch trực tiếp) |
| [66] | [Nghị định 356/2025 so với 13/2023](https://luatvietnam.vn/dan-su/diem-moi-cua-nghi-dinh-356-2025-so-voi-nghi-dinh-13-2023-ve-bao-ve-du-lieu-ca-nhan-568-106269-article.html) | LuatVietnam | 2025-2026 | 2026-08-22 | Trung bình (nguồn thứ cấp pháp lý) |
| [67] | [Vietnam AI Law key takeaways](https://www.lexology.com/library/detail.aspx?g=4fe57b61-d316-41d3-b68d-a10ce201735a) | Lexology | 2026 | 2026-08-22 | Trung bình |
| [68] | [Vietnam draft PDP law overview](https://kpmg.com/vn/en/home/insights/2024/09/an-overview-of-vietnam-draft-personal-data-protection-law.html) | KPMG | 2024-09 | 2026-08-22 | Trung bình |
| [69] | [MOET Công văn 7652 — thí điểm AI trong GDPT](https://xaydungchinhsach.chinhphu.vn/trien-khai-thi-diem-noi-dung-giao-duc-ai-trong-giao-duc-pho-thong-huong-dan-va-yeu-cau-119251219161637445.htm) | Cổng thông tin Chính phủ | 2025-11-21 | 2026-08-22 | Cao (nguồn chính thức) |

_Ghi chú: một số nguồn hỗ trợ mức độ tin cậy thấp/trung bình hoặc các lead chưa theo đuổi xuất hiện đầy đủ trong các digest gốc (thư mục `digests/`, đặt tên theo mảng-vòng, ví dụ `landscape-r1-1.md`) nhưng không liệt kê lại ở phụ lục này để giữ súc tích — tra cứu digest tương ứng để có URL và ghi chú độ tin cậy đầy đủ cho các claim phụ không mang tính quyết định._

## Bản đồ độ mới (Staleness map)

Tính bằng `scripts/recon_kit.py staleness` theo ngưỡng độ mới của pack Technical (version/compatibility ≤ 1 tháng · ecosystem ≤ 6 tháng · landscape AI-adjacent ≤ 3 tháng · pattern ≤ 24 tháng).

- **14/26 claim trọng yếu đã qua hạn kiểm tra lại** tính đến 2026-08-22 — chủ yếu là các claim pháp lý/quy định (đã ban hành 6–8 tháng, ngưỡng ecosystem là 6 tháng) và các mốc landscape AI-adjacent (ngưỡng 3 tháng, biến động nhanh).
- **Cần kiểm tra lại sớm nhất:** giá & mức độ hỗ trợ ngôn ngữ của vendor (ElevenLabs/Cartesia/OpenAI Realtime) — ngưỡng 1 tháng cho pricing/version, đã qua hạn kể từ khi xuất bản.
- **Ổn định lâu nhất:** các claim kiến trúc/pattern (Khanmigo/Duolingo prompt-engineering, HITL supervision fatigue, Duolingo agent platform) — ngưỡng 24 tháng, còn hiệu lực tới 2028.
- Khuyến nghị: chạy lại một vòng **Refresh** riêng cho mảng Integration (giá vendor) và Ecosystem (quy định VN) trước khi trình BOD chính thức nếu khoảng cách thời gian vượt quá 4–6 tuần kể từ ngày nghiên cứu này (2026-08-22).

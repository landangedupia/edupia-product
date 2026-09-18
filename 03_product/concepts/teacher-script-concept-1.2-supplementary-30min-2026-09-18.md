# Script giả lập lời thoại Giáo viên AI — Concept 1.2: BUỔI HỌC BỔ TRỢ (30 phút)

**Trạng thái:** 🟡 Script giả lập (simulated) — DRAFT, cần chỉnh sửa thêm. Soạn theo cùng cấu trúc/văn phong với [`teacher-script-concept-1.2-my-favourite-things-2026-09-16.md`](teacher-script-concept-1.2-my-favourite-things-2026-09-16.md) (buổi chính khóa), áp vào luồng buổi bổ trợ (AI Tutor 1-1) đã dựng trong demo (`AIC2_NLO`, xem `04_delivery/specs/ai-class-core/big-class-plus/design-spec/ai-studio-prompt/demo/index.html`).
**Mục đích:** Làm mẫu lời thoại cho giáo viên AI/avatar "Teacher Jenny" khi dẫn buổi học bổ trợ 1-1, theo nhịp: Tổng kết mục tiêu buổi → Micro-lesson → **1 game gamification/NLO (~3 phút, thay cho 5 bài tập vi mô tĩnh cũ)** → Ăn mừng hoàn thành NLO → Tổng kết buổi bổ trợ. Số NLO trong buổi là biến số theo mastery profile + ngân sách 30 phút (xem "Lưu ý khi dùng" bên dưới).
**Đối chiếu:** `AIC2_NLO` (nội dung 4 NLO mẫu dùng cho trường hợp minh hoạ — 2 nhánh Củng cố "reinforce": Sports & "What's your favourite...?", 2 nhánh Mở rộng "advance": Describing Food & Trả lời có lý do "because"), `aic2-tts-copylist.txt` (bản lời thoại đã tách để tạo audio, cùng thư mục demo), [`teacher-script-concept-1.2-my-favourite-things-2026-09-16.md`](teacher-script-concept-1.2-my-favourite-things-2026-09-16.md).
**Ngày soạn:** 2026-09-18.

**Lưu ý khi dùng:**
- **Logic chọn số NLO/buổi (giữ đúng logic tài liệu concept, KHÔNG cố định):** Routing Engine xếp hàng NLO theo mastery profile — ưu tiên vá hết các NLO đang "hổng" (Củng cố/reinforce) trước, theo đúng thứ tự mastery % thấp nhất trước. Chỉ khi đã vá hết hàng đợi reinforce mà vẫn còn thời gian trong ngân sách 30 phút, buổi mới tiếp tục sang các NLO Mở rộng/nâng cao (advance).
- **Số liệu thời gian (2026-09-18):** 1 game ~3 phút; dẫn vào mỗi NLO 0:15; ăn mừng mỗi NLO 0:15; micro-lesson 3:00/NLO → mỗi NLO = 0:15+3:00+3:00+0:15 = **6:30**. Tổng kết ~3:30 (khung CTA/danh sách/chấm điểm/lời chào ~2:00 + nhận xét AI ~0:30 + dặn dò BTVN ~1:00). Intro 1:00.
- **Cập nhật 2026-09-18 — dùng đủ 4 NLO (2 vá + 2 mở rộng):** với các số liệu trên, tổng thời gian có lời thoại = intro (1:00) + 4×6:30 (26:00) + tổng kết (3:30) = **30:30** — vừa sát 30 phút, chỉ nhích hơn ~30 giây (coi như nằm trong biên độ "tốc độ trung bình" đã nêu, không cần vùng đệm riêng nữa). Đây là mức tối đa vừa khớp — **KHÔNG còn dư địa cho NLO thứ 5.**
- Bản script dưới đây minh hoạ lại đúng **1 trường hợp cụ thể**: học sinh mẫu còn hổng đúng 2 NLO (Sports, "What's your favourite...?") → vá hết 2 NLO này (mục 2-3, 13:00) → hết hàng đợi reinforce, còn dư đủ thời gian trong ngân sách 30 phút nên buổi tiếp tục mở rộng thêm cả 2 NLO advance có sẵn trong `AIC2_NLO` (Describing Food, Trả lời có lý do "because" — mục 4-5). Nếu học sinh thật có nhiều/ít hơn 2 NLO hổng, số NLO mỗi nhánh trong kịch bản thực tế sẽ khác — cấu trúc từng NLO (dẫn vào → micro-lesson 3 phút → 1 game 3 phút → ăn mừng) vẫn dùng lại được, chỉ lặp/cắt bớt số khối NLO cho khớp (mỗi NLO thêm/bớt = ±6:30, xem lại tổng có vượt 30 phút không).
- 🎮 **Về nội dung "game" (mục 2.3/3.3/4.3/5.3):** hình thức gamification cụ thể (kéo-thả, animation, mini-game tính giờ...) bạn đang làm demo riêng, CHƯA chốt — nên các mục này chỉ minh hoạ NỘI DUNG/kiến thức cần luyện (dùng lại đúng nội dung 5 câu hỏi tĩnh cũ, gộp thành 1 hoạt động ~3 phút), KHÔNG mô tả cơ chế chơi/luật game cụ thể. Cơ chế "chọn sai → hiện gợi ý → chọn lại đến khi đúng" (🔁, áp dụng cho MCQ tĩnh) có còn giữ nguyên trong game hay đổi thành cơ chế khác (vd: mất điểm/mất lượt) — CẦN CHỐT khi có demo game, sẽ ảnh hưởng lại thời gian ước tính 3 phút/game này. Vì kịch bản hiện đã dùng gần hết 30 phút (dư ~0), nếu game thực tế lâu hơn giả định hoặc học sinh cần chơi lại nhiều lượt, buổi RẤT dễ vượt quá 30 phút — không còn vùng đệm hấp thụ như các bản trước.
- ⚠️ **Lưu ý kỹ thuật:** code demo hiện tại (`computeAic2Track()`, dòng ~3762 `index.html`) chỉ chọn **1 nhánh duy nhất** (reinforce HOẶC advance) cho mỗi buổi (`state.aic2.nloList` chỉ có 2 NLO cố định của 1 nhánh), và bài luyện tập (`aic2SubmitMcq`, `aic2RenderExercise`...) vẫn là 5 bài tương tác tĩnh — chưa hiện thực đúng logic "vá hết hàng đợi reinforce rồi mới chuyển advance trong CÙNG 1 buổi, số lượng NLO co giãn theo thời gian" lẫn phần gamification mô tả ở trên — cần cập nhật lại cả Routing Engine và UI luyện tập của demo/PRD nếu muốn khớp đúng kịch bản này.
- Học sinh mẫu tên "Vân Anh" — đổi theo tên học sinh thật khi cá nhân hoá lời chào.
- Khác buổi chính khóa (1 giáo viên nói cho cả lớp theo timeline video cố định), buổi bổ trợ là **1-1, tự nhịp độ theo học sinh** — mốc thời gian dưới đây là kịch bản "tốc độ trung bình", thực tế buổi học sẽ dài/ngắn hơn 30 phút tuỳ học sinh chơi game nhanh/chậm hơn giả định 3 phút.

---

## 1. Mở đầu buổi bổ trợ — giới thiệu mục tiêu — 00:00–01:00

**[00:00]**
"Chào con! Cô là Jenny, cô sẽ đồng hành cùng con trong buổi học bổ trợ ngày hôm nay nhé."

**[00:15]**
"Hôm nay mình sẽ ôn lại 4 phần kiến thức: 2 phần con còn chưa thật chắc, và 2 phần con đã làm tốt rồi nên mình sẽ mở rộng thêm nhé."

**[00:30]**
*(Màn hình hiện thẻ "Nội dung bổ trợ": • Đang học — Từ vựng: Môn thể thao (Sports); • Tiếp theo — Ngữ pháp: Câu hỏi "What's your favourite...?"; sau khi qua từng phần, thẻ "Tiếp theo" sẽ cập nhật dần sang 2 phần Mở rộng phía sau)*
"Đầu tiên, mình sẽ ôn lại Từ vựng về Môn thể thao và cách hỏi "What's your favourite...?". Sau đó mình sẽ mở rộng thêm cách miêu tả món ăn yêu thích và cách trả lời có lý do nhé. Lần này mình sẽ luyện tập qua các mini-game cho vui hơn đó!"

**[00:45]**
"Con đã sẵn sàng chưa? Let's go!"

---

## 2. NLO 1 (Củng cố) — Từ vựng: Môn thể thao (Sports) — 01:00–07:30

### 2.1 Dẫn vào bài giảng ngắn — 01:00–01:15

**[01:00]**
"Chào Vân Anh, buổi trước chúng ta đã học phần "Từ vựng: Môn thể thao (Sports)". Buổi vừa rồi mình đã học tên 2 môn thể thao table tennis và football rồi, giờ mình ôn lại thật chắc nhé!"

### 2.2 Micro-lesson (bài giảng ngắn 3 phút) — 01:15–04:15

**[01:15]**
"Con hãy theo dõi bài giảng ngắn sau và ghi nhớ nội dung về "Sports" nhé!"

**[01:30–04:05]**
*(Giáo viên AI giảng lại, kiểu giao diện buổi chính khóa — ảnh minh hoạ 2 môn thể thao)*
"Table tennis (bóng bàn) và football (bóng đá) đều là môn thể thao (sport). Khi nói môn mình thích, dùng mẫu: "My favourite sport is + tên môn." Ví dụ: My favourite sport is table tennis."

**[04:05]**
"Con đã nhớ chưa nào? Nếu chắc rồi thì mình chuyển sang phần chơi game nhé — con cũng có thể bấm "Chuyển sang phần Luyện tập" bất cứ lúc nào nếu muốn qua sớm."

### 2.3 Luyện tập — 1 game gamification (~3 phút) — 04:15–07:15

**[04:15]**
"Bây giờ mình cùng chơi 1 trò chơi nhỏ để ôn lại từ vựng Sports nhé!"
*(Game ~3 phút — nội dung/kiến thức luyện tập giữ nguyên như 5 câu hỏi tĩnh trước đây, đóng gói thành 1 hoạt động chơi liên tục: nhận biết "table tennis" qua đặc điểm chơi trên bàn bằng vợt; phân biệt nghĩa tiếng Việt của "football"; điền đúng tên môn thể thao vào câu "My favourite sport is..."/"I like playing..."; và 1 phần hỏi-đáp mở "Con thích môn thể thao nào?". Cơ chế chơi cụ thể — kéo-thả/animation/tính giờ, cách xử lý khi chọn sai — CHƯA chốt, xem "Lưu ý khi dùng".)*

**[07:00]**
"Con chơi rất tốt! Con đã nhớ chắc từ vựng về môn thể thao rồi đó."

### 2.4 Ăn mừng hoàn thành NLO 1 — 07:15–07:30

**[07:15]**
*(Màn ăn mừng, 5 sao)*
"Chúc mừng! Con đã hoàn thành Từ vựng: Môn thể thao (Sports). Con đã hoàn thành rất tốt, giờ chúng ta sẽ chuyển sang phần tiếp theo nhé."

---

## 3. NLO 2 (Củng cố) — Ngữ pháp: Câu hỏi "What's your favourite...?" — 07:30–14:00

### 3.1 Dẫn vào bài giảng ngắn — 07:30–07:45

**[07:30]**
"Mình cùng ôn lại cách hỏi về sở thích nhé — đây là mẫu câu quan trọng nhất của bài học đó!"

### 3.2 Micro-lesson (bài giảng ngắn 3 phút) — 07:45–10:45

**[07:45]**
"Con hãy theo dõi bài giảng ngắn sau và ghi nhớ nội dung về "What's your favourite...?" nhé!"

**[08:00–10:35]**
"Hỏi sở thích ai đó, dùng: "What's your favourite + danh từ?" Trả lời: "It's + tên." Ví dụ: "What's your favourite colour? – It's pink.""

**[10:35]**
"Con đã nhớ mẫu câu chưa nào? Mình chuyển sang phần chơi game nhé."

### 3.3 Luyện tập — 1 game gamification (~3 phút) — 10:45–13:45

**[10:45]**
"Bây giờ mình cùng chơi 1 trò chơi nhỏ để ôn lại cách hỏi "What's your favourite...?" nhé!"
*(Game ~3 phút — nội dung giữ nguyên như 5 câu hỏi tĩnh trước đây: chọn đúng từ hỏi "What"; ghép "It's a sandwich" cho câu trả lời về "favourite food"; sắp đúng thứ tự câu hỏi "What's your favourite colour?"; điền "It's" khi trả lời về 1 sự vật; và 1 phần tự đặt câu hỏi-trả lời mở theo mẫu.)*

**[13:30]**
"Con chơi rất tốt! Con đã dùng đúng mẫu câu "What's your favourite...?" rồi đó."

### 3.4 Ăn mừng hoàn thành NLO 2 — 13:45–14:00

**[13:45]**
"Chúc mừng! Con đã hoàn thành Ngữ pháp: Câu hỏi "What's your favourite...?". Con đã hoàn thành rất tốt, giờ chúng ta sẽ chuyển sang phần tiếp theo nhé — con đã ôn lại chắc cả 2 phần rồi, giờ mình mở rộng thêm 2 phần con đã làm tốt nhé!"

---

## 4. NLO 3 (Mở rộng) — Đồ ăn & thức uống (Food & Drinks nâng cao) — 14:00–20:30

### 4.1 Dẫn vào bài giảng ngắn — 14:00–14:15

**[14:00]**
"Con làm rất tốt phần đồ ăn rồi! Giờ mình mở rộng thêm cách miêu tả món ăn mình thích nhé."

### 4.2 Micro-lesson (bài giảng ngắn 3 phút) — 14:15–17:15

**[14:15]**
"Con hãy theo dõi bài giảng ngắn sau và ghi nhớ nội dung về "Describing Food" nhé!"

**[14:30–17:05]**
"Miêu tả món ăn yêu thích, dùng mẫu: "My favourite food is + [món ăn] because + [lý do]." Ví dụ: "...because it's delicious.""

**[17:05]**
"Con đã nhớ mẫu câu chưa nào? Mình chuyển sang phần chơi game nhé."

### 4.3 Luyện tập — 1 game gamification (~3 phút) — 17:15–20:15

**[17:15]**
"Bây giờ mình cùng chơi 1 trò chơi nhỏ để luyện thêm cách miêu tả món ăn nhé!"
*(Game ~3 phút — nội dung giữ nguyên như 5 hoạt động trước đây: nói câu "My favourite food is pizza because it's delicious."; chọn đúng từ "delicious" diễn tả món ăn ngon; nói câu "I want to try a new sandwich next week."; tự đặt câu theo mẫu "I want to try..."; và nói câu "Eating breakfast every morning helps me feel energetic.")*

**[20:00]**
"Con chơi và nói rất tốt! Con đã miêu tả món ăn tự nhiên hơn nhiều rồi đó."

### 4.4 Ăn mừng hoàn thành NLO 3 — 20:15–20:30

**[20:15]**
"Chúc mừng! Con đã hoàn thành phần Mở rộng: Đồ ăn & thức uống. Con đã hoàn thành rất tốt, giờ mình mở rộng thêm 1 phần nữa nhé!"

---

## 5. NLO 4 (Mở rộng) — Ngữ pháp: Trả lời có lý do (because) — 20:30–27:00

### 5.1 Dẫn vào bài giảng ngắn — 20:30–20:45

**[20:30]**
"Giờ mình thử mở rộng thêm cách trả lời có lý do nhé, sẽ giúp câu trả lời của con hay hơn nhiều đó!"

### 5.2 Micro-lesson (bài giảng ngắn 3 phút) — 20:45–23:45

**[20:45]**
"Con hãy theo dõi bài giảng ngắn sau và ghi nhớ nội dung về "Because..." nhé!"

**[21:00–23:35]**
"Để giải thích lý do, dùng "because". Ví dụ: "It's a dolphin because it's very smart." Con có thể thêm lý do sau bất kỳ câu trả lời sở thích nào."

**[23:35]**
"Con đã nhớ mẫu câu chưa nào? Mình chuyển sang phần chơi game nhé."

### 5.3 Luyện tập — 1 game gamification (~3 phút) — 23:45–26:45

**[23:45]**
"Bây giờ mình cùng chơi 1 trò chơi nhỏ để luyện cách trả lời có lý do nhé!"
*(Game ~3 phút — nội dung giữ nguyên như 5 hoạt động trước đây: điền "because" vào câu "It's a dolphin ___ it's very smart."; chọn câu dùng lý do đúng cách ("I like pizza because it's tasty."); điền "because" vào câu về môn thể thao yêu thích; tự đặt 1 câu trả lời sở thích có dùng "because"; và nói câu "My favourite colour is pink because it's bright and cheerful.")*

**[26:30]**
"Con chơi rất tốt! Con đã biết dùng "because" để giải thích lý do rồi đó."

### 5.4 Ăn mừng hoàn thành NLO 4 — 26:45–27:00

**[26:45]**
*(Màn ăn mừng, 5 sao — hoàn thành cả 4/4 NLO của buổi)*
"Chúc mừng! Con đã hoàn thành phần Trả lời có lý do (because). Con đã hoàn thành cả 4 phần bổ trợ hôm nay rồi, giỏi quá!"

---

## 6. Tổng kết buổi bổ trợ — 27:00–30:30

**[27:00]**
*(Màn CTA "Xem tổng kết buổi bổ trợ")*
"Con đã hoàn thành hết cả 4 phần bổ trợ hôm nay rồi đó! Mình cùng xem lại kết quả nhé."

**[27:30]**
*(Màn Tổng kết — danh sách 4 NLO đã cải thiện)*
"Hôm nay con đã củng cố lại 2 phần: Từ vựng — Môn thể thao (Sports) và Ngữ pháp — Câu hỏi "What's your favourite...?"; đồng thời mở rộng thêm 2 phần: Miêu tả món ăn yêu thích và Trả lời có lý do (because). Cả 4 phần con đều đã làm rất tốt!"

**[28:00]**
*(Nhận xét AI trợ giảng — ~30s)*
"Con tiến bộ rõ nhất ở phần từ vựng thể thao, đã dùng đúng mẫu câu "What's your favourite...?", và biết miêu tả món ăn + giải thích lý do rất tự nhiên — con giỏi lắm!"

**[28:30]**
*(Giao bài tập về nhà — Homework card: "Giao đúng nội dung con vừa học trong buổi bổ trợ hôm nay")*
"Cô sẽ giao cho con thêm vài bài tập nhỏ về đúng 4 phần mình vừa học, con nhớ hoàn thành trước buổi học tiếp theo nhé."

**[29:30]**
"Con có thích buổi học bổ trợ hôm nay không? Đừng quên chấm điểm cho buổi học nhé!"

**[30:00]**
"Cảm ơn con đã học rất chăm chỉ hôm nay. Hẹn gặp lại con ở buổi học tiếp theo nhé! Goodbye, see you next time!"

*(Kết thúc lúc 30:30 — nhích hơn mốc 30:00 khoảng 30 giây, coi như nằm trong biên độ "tốc độ trung bình"; không còn vùng đệm riêng — xem "Lưu ý khi dùng" về rủi ro nếu game thực tế lâu hơn giả định.)*

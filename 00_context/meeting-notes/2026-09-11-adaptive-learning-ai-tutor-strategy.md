# BIÊN BẢN CUỘC HỌP: ĐỊNH HƯỚNG MÔ HÌNH GIÁO DỤC AI & CHIẾN LƯỢC ADAPTIVE LEARNING

**Ngày họp:** 11/09/2026
**Tài liệu gốc:** File ghi âm `11.09.26meeting.m4a`
**Chủ đề chính:** Đánh giá xu hướng EdTech quốc tế (Trung Quốc), định hướng phát triển mô hình Adaptive Learning & AI Tutor, giải pháp Hot-fix nâng cao tỷ lệ gia hạn và Lộ trình triển khai (Roadmap).

---

## I. THÔNG TIN CHUNG & THÀNH PHẦN THAM DỰ

### 1. Thành phần tham dự

* **Chủ trì / Định hướng chiến lược:** Anh/Sếp (Phụ trách chung) [1, 5, 22]
* **Nghiên cứu & POC Mô hình Adaptive:** Vân [5, 10, 18, 22]
* **Phụ trách Công nghệ (Tech POC):** Kiên [19, 22, 23, 26]
* **Phụ trách Sản phẩm / UI-UX App:** Lân [22, 23, 24, 25]
* **Phụ trách Học thuật:** Trang [6]
* **Thành viên phối hợp:** Linh [25]

---

## II. BỐI CẢNH THỊ TRƯỜNG EDTECH TRUNG QUỐC & BÀI HỌC KINH NGHIỆM

### 1. Tác động từ chính sách "Giảm kép" (Double Reduction - 2021)

* **Chính sách:** Chính phủ Trung Quốc ban hành cấm toàn bộ việc dạy thêm, học thêm [1].
* **Căn nguyên:** Các công ty EdTech đẩy mạnh quảng cáo tiêu cực (cho rằng giáo dục công lập không hiệu quả, nếu không học thêm sẽ không có tương lai), gây bức xúc cho lãnh đạo cấp cao [1].
* **Hệ quả:** Hàng loạt công ty EdTech tỷ USD bị càn quét và giảm giá trị vốn hóa nghiêm trọng [1].

### 2. Ba (03) hướng chuyển dịch chính của EdTech Trung Quốc

1. **Mô hình Adaptive Learning Question Bank (Điển hình: Squirrel AI / Squirrel):** Cho học sinh tự học theo lộ trình riêng được thiết kế bởi AI mà không cần giáo viên giảng trực tiếp [2]. Hệ thống dựa trên ngân hàng câu hỏi (Question bank), ngân hàng video (Video bank) và các điểm kiến thức (Learning outcomes / NNO) [2].
2. **Mô hình Thiết bị phần cứng (Hardware / Smart Devices):** Đóng gói trực tiếp sản phẩm học tập vào phần cứng như đèn bàn thông minh AI (giơ bài tập tự giải) hoặc máy tính bảng học tập (tích hợp khóa học self-paced) [3].
   * *Đánh giá thực tế tại Việt Nam:* Một số đơn vị đã làm như Robot PIK hoặc Máy tính bảng Masell (Mascom) [4]. Tuy nhiên, công ty đánh giá mảng thiết bị **"chưa thơm"** và số lượng bán ra trên thị trường chưa cao [4].
3. **Mô hình AI Tutor (Giáo viên AI 1-on-1):** Dùng AI giả dạng người dạy trực tiếp [3]. Trung Quốc rất mạnh trong việc render video AI mượt mà và cốt truyện hấp dẫn [3].

---

## III. ĐỊNH HƯỚNG CHIẾN LƯỢC SẢN PHẨM CỦA CÔNG TY

Công ty thống nhất không đi theo hướng thiết bị phần cứng mà tập trung vào **02 con đường chiến lược** [4, 5]:

1. **Adaptive Learning (Theo mô hình Squirrel AI)** [2, 5].
2. **AI Tutor 1-on-1 (Bên trong tích hợp cốt lõi Adaptive Learning)** [5].

```
                             ┌────────────────────────────────────────┐
                             │  ĐỊNH HƯỚNG SẢN PHẨM CÔNG TY KHẢ THI     │
                             └──────────────────┬─────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌──────────────────────────────┐                  ┌──────────────────────────────┐
        │   1. ADAPTIVE LEARNING       │                  │   2. AI TUTOR 1-ON-1          │
        │   - Lộ trình tự học riêng    │                  │   - Giảng dạy cá nhân hóa      │
        │   - Question & Video Bank    │                  │   - Tích hợp Adaptive core     │
        └──────────────────────────────┘                  └──────────────────────────────┘
```

### 1. Kiến trúc & Cơ chế vận hành Mô hình Adaptive Learning

* **Chuyển đổi tư duy:** Chuyển từ mô hình "Một cho tất cả" (One-size-fits-all) sang **Cá nhân hóa** (Personalization) [10].
  * *Mô hình cũ:* Giúp khoảng ~60% học sinh tiến bộ [10, 11].
  * *Mô hình Cá nhân hóa:* Kỳ vọng giúp thêm ~20% học sinh tiến bộ, nâng tổng tỷ lệ tiến bộ lên ~80% [10, 11].

* **Quy trình vá lỗ hổng kiến thức (Learning Flow):**
  1. **Big Class (Lớp học lớn):** Học sinh tham gia lớp học chung [14].
  2. **Quiz gán nhãn NNO:** Các câu hỏi quiz trên lớp được gán nhãn chính xác vào từng điểm kiến thức (NNO) [14].
  3. **Đánh giá mức độ thành thạo:** Dựa vào thời gian trả lời, tỷ lệ đúng/sai và thời lượng theo dõi bài học để xác định chính xác học sinh mạnh/yếu NNO nào [14, 15].
  4. **Mastery Map (Bản đồ xanh - đỏ - vàng):** Trực quan hóa năng lực học sinh (Ví dụ: Kiến thức Lớp 8 gồm 200 NNO trên tổng số 1,491 NNO toàn bộ) [15].
  5. **AI Tutor 1-on-1 vá lỗ hổng:** Ngay sau buổi Big Class, AI Tutor 1-on-1 sẽ nhảy vào giảng dạy cá nhân hóa để "vá" đúng các NNO học sinh chưa nắm vững [15].
  6. **Bài tập về nhà (Homework):** Tự động cá thể hóa theo đúng các điểm yếu cần rèn luyện [15].

* **Cơ chế Adaptive trong luyện tập (Duolingo Concept):**
  * Tự động điều chỉnh độ khó linh hoạt [16]. Ví dụ: Học sinh làm sai câu hỏi Level 3A (độ khó cao) sẽ được chuyển xuống câu Level 1B [16]. Nếu trả lời đúng liên tiếp 1B, hệ thống lại đưa học sinh tăng level trở lại [16].
  * **Mục tiêu:** Duy trì động lực học tập (Flow/Chuỗi học tập), không làm học sinh bị nản vì quá khó hay chán vì quá dễ [16].

* **Xây dựng Chương trình & Question Bank:**
  * **Nguyên tắc cốt lõi:** Phải đi từ **Chương trình chung của Bộ GD&ĐT** trước, sau đó mới bóc tách về chương trình của công ty và gắn vào từng Unit/Lesson [20]. Nếu làm ngược lại từ chương trình công ty sẽ bị lệch chuẩn [20].
  * **Tác động tới Phụ huynh:** Phụ huynh nhìn thấy rõ Bản đồ thành thạo (Mastery Map) của con [20, 21]. Công ty có thể cam kết rõ ràng về việc học sinh thành thạo các điểm kiến thức cụ thể thay vì cam kết chung chung đạt chuẩn A2 [21].
  * **Độc lập sản phẩm:** Ngân hàng câu hỏi (Question Bank) mới đợt này phục vụ hoàn toàn cho sản phẩm mới (AI Class), độc lập với dự án ôn thi cuối kỳ cũ của đội Tutor [18, 19].

### 2. Tiêu chuẩn Chất lượng & Mức độ Hoàn thiện (Completeness Standard)

* **Điểm chết của sản phẩm EdTech:** Mức độ hoàn thiện (Completeness) quyết định sự sống còn của sản phẩm [8, 9]. Rất nhiều sản phẩm tuyên bố làm được nhưng thất bại vì mức độ hoàn thiện quá kém [8, 9].
* **Đánh giá năng lực nội bộ (Ví dụ AI Talk / Video Call):** Hiện tại công ty đánh giá tính năng AI Talk mới chỉ đạt mức **7 điểm** [9]. Nếu sản phẩm chỉ đạt 2 điểm (trông giả chân, kịch bản không đọng lại) thì xem như thất bại (fail) [9].
* **Thử thách của AI Tutor Real-time:** Yêu cầu lớn nhất là độ mượt của tương tác Real-time (phản hồi tức thì), tạo cho học sinh cảm giác thật sự đang học 1-on-1 với gia sư thật [12, 22].

---

## IV. GIẢI PHÁP HOT-FIX VÀ MỤC TIÊU GIA HẠN (RENEWAL)

* **Bối cảnh:** Nguồn lực miễn phí (free) đã khai thác hết [6]. Việc tăng gia hạn là câu chuyện dài hạn, không thể có kết quả ngay trong 1 tháng [6].
* **Chiến lược Hot-fix (Xử lý nhanh trong 2 tháng):**
  1. **Xác định Metric trọng tâm nhất:** Ví dụ metric "Học sinh học đủ 6/8 buổi" (chiếm 8/10 điểm trọng số quyết định gia hạn) [6].
  2. **Phân tích Level 2:** Đào sâu nguyên nhân tại sao học sinh không học đủ 6/8 buổi (do thiếu lịch học, trải nghiệm bị vướng...) để đưa ra hành động khắc phục cụ thể [6, 7].
* **Phối hợp:** Phối hợp chặt chẽ với đầu học thuật (chị Trang) để đưa ra ý tưởng và nghiệm thu [6].

---

## V. KẾ HOẠCH THỜI GIAN (TIMELINE) & PHÂN CÔNG THỰC HIỆN

### 1. Lộ trình triển khai (Project Timeline)

| Thời gian | Mục tiêu / Đầu việc chính | Người phụ trách |
| :---- | :---- | :---- |
| **Tháng 09/2026** | • Khảo sát nhu cầu khách hàng [22]. • Nghiên cứu đối thủ cạnh tranh & Đề xuất phương án mô hình [21, 22]. • Tiến hành POC thử nghiệm công nghệ & năng lực nội bộ [7, 10, 22]. | Vân, Kiên, Lân [7, 22, 23] |
| **Tháng 10/2026** | • Thử nghiệm bán hàng (Test Sale) [22]. | Đội ngũ Sale [22] |
| **Tháng 11/2026** | • Tổng kết và đánh giá kết quả bán thử [22]. | Toàn đội [22] |
| **Tháng 12/2026** | • Lên phương án sản phẩm chi tiết & Xây dựng Roadmap [22]. | Ban dự án [22] |

### 2. Mục tiêu Hoàn thành Sản phẩm (Target Completion)

* **Kịch bản 1 - Tháng 03/2027:** Áp dụng nếu chọn mô hình **Adaptive thông thường** (Buổi học 30 phút gồm video quay sẵn/ghép nối + voiceover + fake video khen ngợi đơn giản để vá kiến thức) [22].
* **Kịch bản 2 - Tháng 06/2027:** Áp dụng nếu chọn mô hình **AI Tutor Real-time 1-on-1** chuẩn (Tương tác thời gian thực như gia sư thật) [22].

### 3. Phân công nhiệm vụ cụ thể (Action Items)

| Người phụ trách | Nhiệm vụ |
| :---- | :---- |
| **Vân** | • Nghiên cứu đối thủ cạnh tranh (Squirrel AI, v.v.) [21]<br>• Đề xuất phương án & POC Mô hình Adaptive Learning [10] |
| **Kiên** | • Chịu trách nhiệm chính về POC khả thi Công nghệ [22, 23] |
| **Lân** | • Phụ trách thiết kế UI/UX hiển thị Question Bank [23]<br>• Xây dựng trải nghiệm dạng Duolingo trong App [23] |
| **Lân & Linh** | • Tuyển 1-2 Cộng tác viên (CTV) là phụ huynh tri thức tại Trung Quốc có con trong độ tuổi học tập [24, 25]<br>• Mua tài khoản/dùng thử app EdTech Trung Quốc để trải nghiệm và đánh giá thực tế mô hình vận hành [24, 25] |

---

*Biên bản cuộc họp được tổng hợp tự động dựa trên nội dung trao đổi ghi âm trực tiếp.*

# BIÊN BẢN CUỘC HỌP (MEETING NOTES)

**Chủ đề:** Review Concept Demo 1.2 — Adaptive AI Class & Parent Dashboard
**Ngày họp:** 10/09/2026
**Mục tiêu:** Review feedback và hoàn thiện bản concept demo 1.2 trước khi đi khảo sát phụ huynh vào giữa tháng 9 [1].

---

## I. TỔNG QUAN BẢN CONCEPT DEMO 1.2

Bản concept demo 1.2 gồm 2 phần nội dung chính [1, 4]:

### 1. Buổi học chính khóa (Big Class Plus - 60 phút) [1]
- **Giao diện & Kịch bản**: Giữ nguyên giao diện và kịch bản học tập hiện tại [1].
- **Bổ sung mới**: Thêm tính năng điểm danh bằng hình ảnh đầu buổi (check-in) và cuối buổi (check-out) [1, 17, 20].
- **Hệ thống dữ liệu**: Các câu trả lời của học sinh được ghi nhận vào *Mastery Profile* để xác định lỗ hổng kiến thức (Gap Detection) và phục vụ học tập thích ứng (Adaptive Learning) [1].
- **Tổng kết buổi học**: Hiển thị bảng tổng kết từ dữ liệu *Mastery Profile* cho biết kiến thức đã tiếp thu và các phần còn yếu/hổng [1].

### 2. Buổi bổ trợ AI Teacher (AI Tutor - 30 phút) [1, 2]
Diễn ra ngay sau buổi học chính khóa [2]. Hệ thống tự động phân luồng học sinh dựa trên kết quả buổi chính [1, 2]:
- **Học sinh khá / giỏi**: Chuyển sang buổi 30 phút học mở rộng, nâng cao kiến thức [1, 2].
- **Học sinh yếu / hổng kiến thức**: Chuyển sang buổi 30 phút củng cố, vá lỗ hổng kiến thức [1, 2].
- **Cấu trúc bài học 30 phút**: Với mỗi đơn vị kiến thức nhỏ (Learning Objective - LO) bị hổng, học sinh xem video bài giảng ngắn (~3 phút), sau đó làm 5 câu hỏi/dạng bài luyện tập (MCQ, điền từ, speaking...) [2].
- **Bài tập về nhà thích ứng (Adaptive Homework)**: Giao bài tập về nhà dựa trên *Mastery Profile*, tập trung chính xác vào kiến thức cần củng cố [4].

---

## II. CHI TIẾT GÓP Ý VÀ THẢO LUẬN

### 1. Buổi bổ trợ AI Teacher (30 phút)
- **Quy tắc ưu tiên vá kiến thức (Priority Rules)**: Đối với học sinh hổng nhiều kiến thức (ví dụ 10 LOs), 30 phút không thể vá hết [3]. Cần thiết lập quy tắc ưu tiên các kiến thức cốt lõi trước, phần còn lại sẽ vá ở các buổi tiếp theo [3].
- **Nguồn video bài giảng 3 phút**: Ưu tiên cắt từ các video bài giảng thực tế của giáo viên có sẵn [7, 43, 44]. Khi bấm vào LO bị hổng, hệ thống phát đúng đoạn video tương ứng [27].
- **Quy định xem lại / học lại**:
  - Học sinh chỉ được phép **xem lại video bài giảng và kết quả** [38, 39, 40].
  - Không cho phép tương tác/học lại với AI để tối ưu chi phí vận hành [39, 40].
- **Tính linh hoạt & Quyền lựa chọn**: Thảo luận về việc cho phép học sinh tự chọn học kỹ năng thế mạnh hay bắt buộc hệ thống tự động điều hướng [33, 34, 36].
- **Game hóa**: Bổ sung các dạng bài tập game tương tác sinh động có sẵn trên CMS vào buổi học [40, 41].

### 2. Giao diện & Chế độ Phụ huynh (Parent Mode / Private Mode)
- **Phương thức truy cập**: Thay vì nhập mật khẩu phức tạp [4], đề xuất chuyển sang dạng **Short button / Webview trên Zalo** để phụ huynh thao tác nhanh gọn và học sinh không cảm thấy bị theo dõi [5].
- **Báo cáo học tập & Bản đồ năng lực (Mastery Map)**:
  - *Hạn chế*: Bản đồ kiểu ô vuông tham khảo từ Khan Academy bị đánh giá là rườm rà, quá nhiều chi tiết và không phù hợp trên ứng dụng di động (Mobile App) [5, 6, 8, 9].
  - *Đề xuất cải tiến*:
    1. **Tóm tắt bằng văn bản (Text Summary)**: Chuyển báo cáo thành văn bản ngắn gọn, giúp phụ huynh đọc hiểu trong 1 phút [19, 21]. Highlight các điểm sáng và thành tích tiến bộ [21, 22].
    2. **Biểu đồ mạng nhện (Radar Chart)**: Đánh giá tổng quan các kỹ năng chính (Từ vựng, Phát âm, Ngữ pháp, Nói...) theo thang điểm 0–10 thay cho việc liệt kê quá chi tiết [11, 47].
    3. **Nút hành động (Actionable Insights / CTA)**: Mọi chỉ số báo cáo phải đi kèm nút bấm hành động trực tiếp (ví dụ: phát hiện hổng phát âm -> gợi ý nút ấn đến bài luyện tập AI Speaking) [9, 10, 47].
- **Báo cáo điểm danh (Attendance Report)**: Phụ huynh đặc biệt quan tâm xem **ảnh check-in / check-out thực tế** của con [17, 20]. Đưa khung hiển thị ảnh lên vị trí dễ quan sát trên màn hình app [12, 17].
- **Kế hoạch học tập tiếp theo (Next Learning Plan)**: Tóm tắt định hướng mục tiêu (ví dụ: giúp con thành thạo giao tiếp hơn) kèm lộ trình gói học, tránh liệt kê quá chi tiết mã chuyên môn [23, 24].

---

## III. DANH SÁCH HÀNH ĐỘNG (ACTION ITEMS)
1. **Cập nhật Demo Concept 1.2**:
   - Cắt và chèn video bài giảng thực tế vào kịch bản demo [7, 43].
   - Tối ưu giao diện Mobile App: Đưa thông tin quan trọng (buổi học, báo cáo tóm tắt, ảnh check-in) lên vị trí ưu tiên phía trên [8, 12, 17].
   - Chuyển đổi Báo cáo phụ huynh sang dạng Text summary + Biểu đồ mạng nhện + Nút bấm hành động (CTA) [10, 11, 19].
2. **Kế hoạch khảo sát**: Hoàn thiện bản demo điều chỉnh để tiến hành khảo sát ý kiến phụ huynh vào giữa tháng 9 [1].

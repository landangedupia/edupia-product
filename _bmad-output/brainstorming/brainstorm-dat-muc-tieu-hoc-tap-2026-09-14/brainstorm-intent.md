# Intent: Đặt mục tiêu học tập — Demo Concept 1.2

## Job cần giải quyết
- Job cảm xúc (sống còn): phụ huynh cần thấy "lộ trình này phù hợp với con tôi" và "con sẽ thực sự tiến bộ" — đây là 2 điều quyết định phụ huynh có tin/ở lại hay không.
- Job chức năng (phương tiện): biết chính xác con cần học gì để đạt mục tiêu — chỉ có giá trị vì nó phục vụ 2 job cảm xúc trên.
- Đối thủ thật khi tính năng không tồn tại: gia sư riêng (đắt hơn) hoặc niềm tin mù quáng vào chương trình hiện tại.

## Luồng đã chốt (đảo ngược so với giả định ban đầu)
1. Hệ thống phân tích Mastery Profile (giả lập cho demo) và **tự đề xuất sẵn một mục tiêu khả thi** (VD: "con có thể đạt Speak 8 trong 10 tuần").
2. Phụ huynh **xác nhận hoặc chỉnh sửa** mục tiêu + mốc thời gian ngay trên UI Parent mode (không tách thành menu riêng) — đây là phần input tương tác thật.
3. Hệ thống chạy rule table (trục chính: **chênh lệch điểm số** giữa hiện tại và mục tiêu) để "diễn" ra:
   - Custom nội dung buổi bổ trợ (không đổi buổi chính khóa)
   - Suggest bài học cụ thể trong AI Practice / AI Speak
   - Với mỗi bài suggest: **ước lượng số buổi học cần để hoàn thành dựa trên lực học hiện tại của con** — đây là chi tiết tạo cảm giác "hệ thống hiểu con", không phải danh sách bài học chung chung.

## Phạm vi demo (MoSCoW)
**Must**
- Luồng đảo ngược: hệ thống đề xuất mục tiêu trước, phụ huynh xác nhận/chỉnh sửa
- Input tương tác thật trên UI (chọn/chỉnh mục tiêu + mốc thời gian)
- Output trung tâm: suggest bài AI Practice/AI Speak + lộ trình chi tiết theo thời gian, kèm ước lượng số buổi/bài theo lực học
- Rule table giả lập theo trục chênh lệch điểm số (thay cho engine AI thật)
- Tái dùng UI thật của AI Speak/AI Practice + UI Parent mode + design system hiện có

**Should**
- Hiển thị "còn X tuần đến mục tiêu" — gắn thông điệp gia hạn (tách riêng khỏi trải nghiệm cá nhân hóa cốt lõi, tránh loãng thông điệp)
- Gộp màn hình đặt mục tiêu vào ngay Parent mode

**Could**
- Custom chi tiết nội dung buổi bổ trợ
- Bằng chứng tiến bộ theo thời gian (biểu đồ lịch sử) — chưa có data thật

**Won't (ngoài phạm vi demo này)**
- Build engine AI thật tính lộ trình
- Thay đổi buổi học chính khóa

## Ghi chú quan trọng cho người dựng UI/PRD tiếp theo
- Phần "tính toán lộ trình" chỉ cần **trông** thật (rule table cứng phía sau + input tương tác thật ở UI) — không cần AI thật cho bản demo này.
- Ưu tiên hiển thị rõ mối liên kết giữa lực học hiện tại của con và số buổi/thời gian cần cho từng bài — đây là chi tiết thuyết phục nhất, ưu tiên hơn cả việc liệt kê đầy đủ nội dung bài học.
- Thông điệp gia hạn (số tuần còn lại) nên là một khối riêng, không trộn lẫn vào phần "lộ trình cá nhân hóa".

---
Nguồn: phiên brainstorm `.memlog.md` cùng thư mục — Job to Be Done → SCAMPER → Ship in 60 Minutes → One Feature Only → MoSCoW.

# Hiện trạng sản phẩm: Tính năng Edupia AI Class

Nguồn: `product_features_and_operations_AI_Class.md` (cập nhật 03-06-2026) và `product-features.md` (cập nhật 2026-05-28, bản trình bày lại — không có dữ kiện mới ngoài định dạng). Do người dùng cung cấp trực tiếp, chưa qua kiểm chứng thêm bởi Product — coi là **Fact** về trạng thái sản phẩm tại thời điểm cập nhật nêu trên.

**Lưu ý thuật ngữ:** theo `00_context/glossary.md` (cập nhật 2026-08-18), "Edupia AI Class" / "AI Class Plus" là tên gọi đồng nghĩa/nội bộ của cùng sản phẩm **Edupia Class**. Tài liệu nguồn dùng tên module "AI Practice", "AI Speak", "AI Club" — glossary dùng "Edupia Practice", "Edupia Speak", "Edupia Club" cho các module tương ứng. ✅ **Cập nhật 2026-08-20 (xác nhận từ user):** đây chỉ là cách gọi khác nhau giữa tài liệu vận hành và tài liệu concept, không phải đổi tên thương hiệu — cùng nói đến các tính năng như nhau.

Phạm vi: các tính năng hiện có cho luồng **Paid user**.

## 1. Các module học tập chính

- **AI Class (module cốt lõi):** lộ trình chính, 2 buổi học/tuần, video quay sẵn (không phải livestream, nhưng thiết kế để học sinh cảm nhận như học trực tiếp). Lớp ~14 học sinh. Câu hỏi tương tác dạng chọn đáp án trên màn hình, trả kết quả ngay lập tức, có bảng xếp hạng vinh danh trong từng buổi học. Bài tập về nhà (BTVN) chia 2 loại:
  - **Bài Thực hành** (3 bài con, làm tuần tự bắt buộc): Nhận biết · Thông hiểu · Vận dụng
  - **Bài Kỹ năng** (4 bài con): Nghe · Nói · Đọc · Viết
  - ✅ **Cập nhật 2026-09-09 (ảnh chụp màn hình thật, bài con "Nhận biết"):** mỗi bài con là một bộ câu hỏi **cố định** (không thấy dấu hiệu cá nhân hoá theo NLO/lỗ hổng) — ví dụ bài "Nhận biết" có 16 câu hỏi. Hành vi làm bài: học sinh **sửa được đáp án đã chọn** trong lúc đang làm; **báo điểm ngay sau khi nộp bài**; **làm lại được nhiều lần, không giới hạn số lượt**. Hệ thống có nhắc nhở khi học sinh chưa làm bài ("Đến giờ làm bài rồi!"), gợi ý có cơ chế nhắc theo lịch/thời điểm. → Xác nhận BTVN hiện tại là bộ đề tĩnh, chưa phải cơ chế cá nhân hoá — khác với "BTVN Adaptive" đang được thiết kế cho Concept 1.2 (xem `glossary.md` entry BTVN Adaptive, `◆ Chưa có PRD riêng`).
  - ✅ **Cập nhật 2026-09-09 (xác nhận từ user):** ngay sau khi nộp bài, học sinh xem được kết quả đúng/sai kèm giải thích từng câu. Nhưng ở lần truy cập lại sau đó, **không xem lại được** phần đúng/sai + giải thích này nữa — chỉ còn thấy trạng thái "Đã hoàn thành". → Kết quả chi tiết là dữ liệu **dùng một lần** (hiển thị ngay sau nộp bài), không được lưu lại làm lịch sử tra cứu cho học sinh.
  - ✅ **Cập nhật 2026-09-09 (xác nhận từ user):** Bài Thực hành có rule **làm tuần tự bắt buộc** — phải hoàn thành mức Nhận biết mới mở mức Thông hiểu, rồi mới tới Vận dụng (không cho nhảy cóc/làm song song). *(Đã sửa tên mức 2 từ "Thấu hiểu" — sai chính tả trong tài liệu nguồn gốc — thành "Thông hiểu", xác nhận từ user 2026-09-09.)*
- **AI Club (Nhà trường):** không gian giao lưu, phổ biến chương trình, tổ chức livestream, sân khấu để học sinh đăng bài (qua kiểm duyệt) khoe thành tích. Livestream là hoạt động nằm trong AI Club, không thuộc AI Class.
- **AI Practice:** kho luyện đề thực hành không giới hạn. Điểm nổi bật: Trợ giảng AI 1:1 giải thích cặn kẽ đáp án đúng/sai, giúp lấp lỗ hổng kiến thức.
- **AI Speak:** luyện nói qua game, luyện đọc truyện (AI Story), giao tiếp nhập vai (AI Avatar). Nổi bật module **Trạng Nguyên** — đấu trường phát âm tính điểm thời gian thực với hàng ngàn học sinh khác.

## 2. Hệ thống đánh giá & thi cử

- **Bài thi tháng:** 1 lần/tháng, dạng trả lời câu hỏi trắc nghiệm/lý thuyết.
- **Bài thi nói:** 1 lần/tháng, học sinh quay video nộp bài, AI chấm điểm tức thì. Có tính năng "nhắc chữ" (teleprompter, 3 tốc độ) giúp trẻ giảm áp lực khi thu hình.

## 3. Gamification (hệ thống tạo động lực)

3 loại đơn vị tích lũy **hoàn toàn độc lập**, không quy đổi chéo được cho nhau:

| Đơn vị | Cách nhận | Hiển thị |
|---|---|---|
| **Cúp** | Tham gia học, làm BTVN, chơi AI Speak | Section riêng |
| **Điểm** | Bài thi tháng, bài thi nói | Chỉ hiển thị khi làm bài thi tháng/nói |
| **Trứng (Blindbox)** | Rớt ngẫu nhiên — cơ chế "săn thưởng" (gacha) | Section riêng; đổi được đặc quyền: vào lớp sớm, nhắc bạn, làm BTVN, ... |

## 4. Quản lý đa hồ sơ & báo cáo

- **Multi-Profile:** phụ huynh giữ quyền quản trị tối cao, chuyển đổi hồ sơ giữa các con chỉ với 1 chạm. Dữ liệu học tập của từng con lưu độc lập trên cùng 1 tài khoản.

## Liên quan

- Vận hành (đội ngũ, công cụ, quy trình chăm sóc/sale, kênh báo cáo) → [current-state-operations.md](current-state-operations.md)
- Chân dung phụ huynh & lý do gia hạn/không gia hạn → [user-persona-parent-renewal.md](user-persona-parent-renewal.md)

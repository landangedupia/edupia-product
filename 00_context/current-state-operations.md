# Hiện trạng sản phẩm: Vận hành Edupia AI Class

Nguồn: `product_features_and_operations_AI_Class.md` (cập nhật 03-06-2026) và `product-features.md` (cập nhật 2026-05-28, bản trình bày lại — không có dữ kiện mới ngoài định dạng). Do người dùng cung cấp trực tiếp, chưa qua kiểm chứng thêm bởi Product — coi là **Fact** về trạng thái vận hành tại thời điểm cập nhật nêu trên.

Xem tính năng sản phẩm tại [current-state-product-features.md](current-state-product-features.md).

## 1. Đội ngũ & công cụ vận hành

Vận hành chia cho 6 bộ phận:

| Bộ phận | Vai trò chính |
|---|---|
| **Sản phẩm + Công nghệ** | Phát triển & cải thiện sản phẩm (app) |
| **Giáo vụ** | Chăm sóc học sinh; gửi Zalo tin nhắn hàng loạt; call chăm sóc tại các mốc |
| **Học thuật** | Nội dung, chương trình học |
| **Vận hành** | Call chăm sóc |
| **CSKH** | Nhận & giải đáp tin nhắn Zalo từ phụ huynh |
| **Sale** | Upsale, gia hạn sớm, gia hạn đúng |

Công cụ nội bộ:

| Tool | Vai trò |
|---|---|
| **LMS** (Learning Management System) | Quản lý học tập; nguồn dữ liệu tự động cho báo cáo học tập |
| **CMS** (Content Management System) | Quản lý nội dung |
| **CRM** (Customer Relationship Management) | Quản lý khách hàng, phễu sale |
| **CDP** (Customer Data Platform) | Trích xuất tình trạng đơn hàng từ CRM theo SĐT/profile ID |

> 1 SĐT của phụ huynh có thể liên kết nhiều profile ID của các con (mỗi học sinh = 1 profile ID riêng).

## 2. Phân phối báo cáo & kênh giao tiếp

- **Qua Zalo:** báo cáo học tập (thái độ học, kết quả bài thi tháng, bài thi nói) được trích xuất tự động từ LMS và gửi qua Zalo cho phụ huynh. Nhắc vào học, nhắc làm bài cũng gửi qua kênh này.
- **Hạn chế hiển thị:** báo cáo được đính kèm trên LMS cho nội bộ xem, nhưng **phụ huynh không xem lại được báo cáo này trên app** — chỉ nhận và xem qua Zalo.

## 3. Gói mua hàng

3 tháng · 6 tháng · 12 tháng · 24 tháng.

## 4. Quy trình chăm sóc (call) & sale

Quy trình gọi điện kết hợp chặt chẽ giữa Giáo vụ (chăm sóc) và Sale (bán hàng):

| Mốc thời gian | Hành động của Giáo vụ (Chăm sóc) | Hành động của Sale (Bán hàng) | Áp dụng |
|---|---|---|---|
| **D30 / D40** | Call sau 20–30 ngày học | Call Upsale sau 40 ngày học | Tất cả các gói |
| **D90** | Call sau ~90 ngày học | — | Gói 6M, 12M, 24M |
| **GHS** (Gia hạn sớm) | Call trước 4 tháng khi hết hạn | Call trước 3 tháng khi hết hạn | Gói 12M, 24M |
| **GHĐ** (Gia hạn đúng) | Call trước 1 tháng khi hết hạn | Call trong tháng hết hạn | Tất cả các gói |

**Quy trình GHĐ thực tế:** trước khi Sale gọi tư vấn, phụ huynh luôn được Giáo vụ gọi chăm sóc "làm ấm" (warm up) trước 10–30 ngày ở tất cả các mốc sale (Upsale, GHS, GHĐ). Sale chỉ gọi sau khi Giáo vụ đã warm up.

\# Product Decision Log



This document indexes important product decisions.



\## Decision Index



| ID | Date | Decision | Status | Document |

|---|---|---|---|---|

| D-2026-08-20-01 | 2026-08-20 | Tên module "AI Practice/AI Speak/AI Club" (tài liệu vận hành) và "Edupia Practice/Edupia Speak/Edupia Club" (glossary) chỉ là cách gọi khác nhau của cùng module — không phải đổi brand. | Confirmed | `00_context/glossary.md`, `00_context/current-state-product-features.md` |
| D-2026-09-12-01 | 2026-09-12 | Question Bank (hệ thống ngoài, PRD v2.1 T5/2026 của dự án "AI Content Agent — Smart Question Bank Generator") là cấu phần thuộc nền tảng chung Adaptive Learning (Concept 1.2) ở góc độ tiêu thụ. Xác nhận: (1) "LO" trong PRD đó = "NLO" trong glossary dự án này; (2) hành vi khi REJECT theo bản "CẬP NHẬT" trong chính PRD gốc — AI KHÔNG tự động gen lại câu, Học thuật chủ động tạo Production Order mới (các mô tả "auto re-gen" khác trong PRD gốc là lỗi thời); (3) mốc Go-Live 31/07/2026 đã qua hạn, ghi nhận là lịch sử, chưa có kế hoạch mới; (4) nhãn "CMS (AI Class · Tutor)" trong PRD Question Bank chính là hệ thống Edupia AI Class/AI Tutor — tức nền tảng của dự án này, không phải CMS bên thứ ba; quan hệ đúng: Routing Engine chọn NLO ưu tiên → tầng ứng dụng của dự án này dùng NLO đó filter `lo_code` gọi Question Bank API; (5) Lân chỉ ở vai trò tiêu thụ, không phải PO/decision-maker của hệ thống Question Bank. | Confirmed | `00_context/glossary.md`, `00_context/reference-ai-question-bank-prd-v2.1-2026-05.md` |
| D-2026-09-14-01 | 2026-09-14 | Chốt 2 câu hỏi phạm vi treo về Mastery Profile/Parent Mode (nêu ra khi phân tích tính năng Parent Mode cho Concept 1.2): (1) Mastery Profile dùng **chung cho các thành phần trong sản phẩm Edupia AI Class** (tiền thân của Edupia AI Class Plus) — không giới hạn riêng AI Class Plus/Concept 1.2, thay cho trạng thái "Pending BOD" trước đó; (2) phạm vi Parent Mode ở Concept 1.2 theo mô tả trong `00_context/AICNew-01-big-class-plus.md` (2026-09-05) — đã bao gồm gửi thông báo tới điện thoại phụ huynh, không chỉ Mastery Map như định nghĩa C3 gốc trong product-brief 08-13 — là **bản cập nhật mới nhất**, được ưu tiên áp dụng. Dashboard GVCN 1:2.000 vẫn thuộc riêng Concept 1.3. PRD riêng cho Parent Mode sẽ soạn sau, dựa trên phạm vi đã chốt ở đây. | Confirmed | `00_context/glossary.md`, `03_product/concepts/tong-hop-nhu-cau-jtbd-pain-point-concept-1.2-2026-09-14.md` |



\## Decision Rules



Important product decisions should be recorded

in `06\_decisions/adr/`.



Do not rewrite historical decisions.



If a decision is changed, create a new decision

and explicitly reference the previous one.


# Kế hoạch tháng 9/2026 — Dự án AI Class new

> Cập nhật lần cuối: 2026-09-14 — cập nhật trạng thái các mốc liên quan Concept 1.2 theo bằng chứng thực tế (meeting notes, commit demo, trạng thái PRD).

## Timeline

| Thời gian | Công việc | Trạng thái |
|---|---|---|
| 25/08/2026 | Bổ sung, update slide concept | Hoàn thành |
| 26/08/2026 | Họp concept với BOD | Hoàn thành |
| 11/09 – 15/09/2026 | Tìm kiếm contact khách hàng Trung Quốc | Chưa bắt đầu |
| **16/09/2026** | **Hoàn thành bản demo (MVP) cho Concept 1.2 (Edupia AI Class Plus) & Concept 3.1 (Edupia AI Tutor 1-1)** | Đang thực hiện |
| Trước 19/09/2026 *(◆ suy luận — khớp mốc khảo sát mới, chưa xác nhận riêng)* | Hoàn thiện bảng hỏi và phương án khảo sát | Chưa bắt đầu |
| Trước 19/09/2026 *(◆ suy luận — khớp mốc khảo sát mới, chưa xác nhận riêng)* | Xây dựng PRD cho Concept 1.2 & Concept 3.1 | Đang thực hiện |
| **19/09 – 19/10/2026** *(◆ ngày kết thúc suy luận theo độ dài ~1 tháng của mốc cũ — chưa xác nhận)* | **Thực hiện khảo sát** | Chưa bắt đầu |
| **01/11/2026** | **Chạy test bán** | Chưa bắt đầu |

## Ghi chú

- Bảng câu hỏi khảo sát phụ huynh (3 concept) đang ở [02_discovery/bang-cau-hoi-khao-sat-phu-huynh-3-concept-2026-08-25.md](../02_discovery/bang-cau-hoi-khao-sat-phu-huynh-3-concept-2026-08-25.md) — **vẫn theo cấu trúc 3-concept cũ, chưa viết lại theo Concept 1.2 vs 3.1** (xem `03_product/concepts/doi-chieu-gap-vpc-vs-concept-1.2-3.1-2026-09-04.md` mục 2c). Cần xử lý trước mốc 19/09.
- Bảng câu hỏi WTP 3 concept (bản trước) ở [02_discovery/survey-questionnaire-wtp-3-concept-2026-08-24.md](../02_discovery/survey-questionnaire-wtp-3-concept-2026-08-24.md).
- Đầu vào cho PRD & prototype Concept 1.2 / 3.1: 4 file slide content final (bản product-dev + bán hàng cho mỗi concept) ở [03_product/concepts/](../03_product/concepts/), khớp đúng bản pptx final 2026-09-04.
- Mốc test bán 01/11 trước đây chỉ xuất hiện trong ghi chú lộ trình rộng hơn (`00_context/.memlog.md`, entry 2026-08-19T11:00 — "T11 thu tiền thật + hoàn tiền/tặng tháng học"), lần đầu đưa vào bảng timeline của file này.
- PRD Big Class Plus (AICNew-01) hiện đang `BLOCKED` ở bước review (`/refine-prd`, 48 finding, 06/09) — 9/9 nhóm quyết định PO còn để trống trong [.agent/review/big-class-plus-findings-grouped.md](../.agent/review/big-class-plus-findings-grouped.md). Cần chốt trước khi mốc PRD trước 19/09 khả thi.
- **Trạng thái demo MVP (16/09) — Đang thực hiện, chưa xong:** Big Class Plus đã tích hợp video bài giảng thật + fix lỗi phát video HLS, dựng lại giao diện Micro-lesson khớp frame Figma buổi chính khóa (loạt commit 09–11/09); đã có bản demo dựng sẵn cho Big Class Plus, AI Tutor 1-1 (v1) và AI Practice (`04_delivery/specs/ai-class-core/big-class-plus/design-spec/ai-studio-prompt/demo*`). Feedback từ họp review demo 10/09 ([00_context/meeting-notes/2026-09-10-review-demo-concept-1-2.md](../00_context/meeting-notes/2026-09-10-review-demo-concept-1-2.md)) đã áp dụng một phần (video bài giảng thật) — phần Parent Mode/Mastery Map (text summary, radar chart, CTA) và game hóa bài tập chưa xác nhận đã lên demo hay chưa.
- **Trạng thái PRD (trước 19/09) — Đang thực hiện, chưa approved:** cả 4 PRD Concept 1.2/3.1 (AICNew-01 Big Class Plus, AICNew-02 AI bổ trợ 30 phút, AICNew-03 AI Tutor 1-1, AICNew-04 Parent Mode) đều đã có bản draft, PRD Parent Mode vừa cập nhật thêm 14/09. Tất cả vẫn ở `Status: draft`, chưa cái nào `approved`; riêng AICNew-01 còn đang `BLOCKED` như trên.

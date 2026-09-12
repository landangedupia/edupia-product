# [Reference] AI Question Bank — PRD v2.1 (PM/PO/BA Edition)

> **Nguồn:** PDF `AI question bank_d5b742f57b8643f480406a808369556a-120926-1654-540.pdf` (Lân cung cấp 2026-09-12).
> Google Doc gốc: https://docs.google.com/document/d/1W-B3kEPvsDzgxTBu8orBJdnQ6VMgmhdr_ADUToDZySI/edit
> Design UX UI: https://ai-question-bank-review.web.app/
> **Trạng thái tài liệu gốc:** DRAFT/REVIEW, v2.1, cập nhật Tháng 5/2026 — viết bởi PO/BA khác (dự án "AI Content Agent — Smart Question Bank Generator"), **không phải sản phẩm của quy trình SDD trong repo này**. Đây là bản tóm tắt tham khảo, giữ nguyên nội dung gốc — không chỉnh sửa/diễn giải thêm.

---

## 1. Vai trò trong bức tranh Concept 1.2

Lân xác nhận 2026-09-12: **Question Bank là một cấu phần thuộc nền tảng chung Adaptive Learning** của Concept 1.2 (cùng tầng với Mastery Profile / Gap Detection / Routing Engine — xem `00_context/AICNew-02-ai-bo-tro-30-phut.md`, `00_context/AICNew-03-ai-tutor-1-1-buoi-hoc.md`). Tài liệu này là PRD sẵn có cho hệ thống đó, do team khác (AI Content Agent) đã viết từ Tháng 5/2026 — **đi trước** các PRD AICNew-01/02/03 đang làm trong dự án hiện tại.

**Quan hệ đã xác nhận với Lân (2026-09-12):**
- Question Bank sinh + lưu trữ câu hỏi (text + media), gắn nhãn theo LO (=NLO), Grade, Bloom, dạng bài — là **hệ thống ngoài**, chỉ cung cấp nội dung qua API.
- Nhãn **"CMS (AI Class · Tutor)"** dùng trong Bước 6 của PRD Question Bank **chính là hệ thống Edupia AI Class/AI Tutor** — tức chính nền tảng Adaptive Learning mà dự án Concept 1.2/3.1 đang xây (Big Class Plus, BTVN Adaptive, AI Bổ trợ 30 phút, AI Tutor, AI Speak...), **không phải một CMS trung gian của bên thứ ba**.
- Vậy quan hệ đúng là: **Routing Engine (thuộc nền tảng của dự án này) chọn NLO ưu tiên → tầng ứng dụng (Big Class Plus/BTVN Adaptive/AI Bổ trợ 30 phút/AI Tutor/AI Speak...) dùng NLO đó làm filter (`lo_code`) gọi Question Bank API để lấy câu hỏi thật.** Đây là quan hệ nội bộ trong kiến trúc đang thiết kế, không phải suy luận giữa 2 hệ thống độc lập nữa.

## 2. Tóm tắt nội dung chính

### Bối cảnh & mục tiêu
- Tự động hoá sinh câu hỏi bằng AI (Human-in-the-Loop: AI sinh → Học thuật duyệt → CMS tiêu thụ), thay quy trình thủ công qua Excel.
- **V1:** Pilot 1.900 câu (Unit 1 × 9 khối lớp 1-9) → Full 5.000 câu (Khối 1-6: Unit 1-3; Khối 7-9: Unit 1-2). Mục tiêu năm 2026: 500.000 câu.
- Go-live V1: 31/07/2026 (tài liệu này lập trước khi dự án Concept 1.2 hiện tại bắt đầu — cần xác nhận tiến độ thực tế).

### 5+2 dạng bài (7 mã, 6 in-scope V1)
| Mã | Dạng bài | Scope V1 |
|---|---|---|
| AI_QB_01 | Completion-based Selection (MCQ) | IN SCOPE |
| AI_QB_02 | Response-based Selection (đoạn văn/nghe + câu hỏi) | **OUT OF SCOPE** |
| AI_QB_03 | Typing (điền từ) | IN SCOPE |
| AI_QB_04 | Matching (nối) | IN SCOPE |
| AI_QB_05 | Ordering (sắp xếp từ) | IN SCOPE |
| AI_QB_06 | Listen–Order (nghe sắp xếp) | IN SCOPE |
| AI_QB_07 | iSpeak (nói — chỉ gen text, CMS tự tạo game + chấm phát âm) | IN SCOPE |

Câu hỏi chùm (AI_QB_02 dạng phức hợp), tái sử dụng kho media Self-Learning cũ, query theo LO cấp cha/ông để gen câu hỏi (chỉ dùng hiển thị catalog) — đều **ngoài phạm vi V1**.

### Workflow 6 bước (end-to-end)
1. **Chuẩn bị Knowledge Base** (AI Engineer + Học thuật): nạp SGK, LO, Bloom, cấu trúc dạng bài.
2. **Tạo Production Order** (Academic Manager): cấu hình Grade/LO/Bloom/dạng bài/số lượng hoặc upload file số lượng → Order ID → Job Queue.
3. **AI sinh nội dung TEXT**: tra KB → sinh đề bài/đáp án/hint/explanation → gán metadata (LO cháu/con/cha, grade, Bloom).
4. **Kiểm tra & sinh Media** (MỚI): check kho media hiện có theo context câu hỏi → dùng lại nếu có, gen ảnh/audio mới nếu không → gắn Key Mapping Media → lưu status `IN_REVIEW`.
5. **Review & Duyệt** (Content Moderator/Học thuật): APPROVE / EDIT+APPROVE / REJECT (bắt buộc nhập lý do). **Khi REJECT: AI KHÔNG tự động gen lại** (đã cập nhật, khác với mô tả cũ ở US-009/AC US-009 nói "AI tự động gen lại" — **mâu thuẫn nội tại trong chính tài liệu gốc**, xem §4).
6. **CMS tiêu thụ qua API**: chỉ lấy câu `APPROVED`, dùng Key Mapping Media tra ảnh/audio.

### Vòng đời trạng thái câu hỏi
`IN_REVIEW` (AI vừa sinh, CMS không lấy được) → `APPROVED` (Học thuật duyệt, CMS lấy được) hoặc `REJECTED` (có lý do, CMS không lấy được).

### Functional Requirements (tóm tắt)
- **F1 Production Order**: tạo order (config hoặc upload Excel — giai đoạn này chưa làm UI, BE dựa file Excel), sinh Order ID, theo dõi trạng thái real-time, lịch sử order.
- **F2 AI Generation**: sinh text đúng cấu trúc dạng bài; gán metadata tự động; check/gen media; gắn Key Mapping Media; lưu `IN_REVIEW`.
- **F3 Review UI**: hiển thị đầy đủ (text+media+metadata+LO); APPROVE (<300ms); REJECT+lý do bắt buộc; EDIT+APPROVE inline; bộ lọc (trạng thái/grade/dạng bài/Bloom/LO/Order ID); phím tắt.
- **F4 Question Bank API**: RESTful, chỉ trả `APPROVED`; filter `lo_code/difficulty/question_type/grade/key_mapping_media`; không bao giờ trả `IN_REVIEW`/`REJECTED`; trả nội dung text iSpeak riêng.

### Media Quality Checklist (đáng chú ý cho các PRD tiêu thụ khác — AI Speak, Big Class Plus...)
- **Ảnh:** vuông 1:1, tối đa 512×512px, <100KB (khuyến nghị WebP), chủ thể chiếm 60-80% khung; phong cách 3D Pixar-style cho Tiểu học, photorealistic cho THCS+; guardrail: đơn nghĩa, không text rác, không lỗi ảo giác AI, an toàn văn hoá/chính trị/địa lý VN.
- **Audio:** monologue only trong scope T5-T8/2026 (dialogue 2 giọng chưa làm vì chưa có tiêu chí phân biệt khi nào dùng); .mp3/.wav, 128kbps, studio quality, tối thiểu 4 giọng (Nam/Nữ người lớn + Nam/Nữ trẻ em), bắt buộc kèm transcript khớp 100%.

### Stakeholders & rủi ro
- PO/BA/PM (GO/NO-GO), Học thuật (đặt hàng+duyệt), Team Công nghệ (pipeline+API+UI), QC, CMS Teams.
- Rủi ro chính: AI gen sai LO/cấu trúc (R1), media chất lượng thấp (R2), Học thuật quá tải review 1.900+3.100 câu (R3), cung cấp dữ liệu đầu vào chậm (R4), API contract đổi sau khi CMS tích hợp (R5).

### KPI V1
Pilot 1.900 câu gen+review+confirm trước gen hàng loạt; Tổng 5.000 câu APPROVED (mốc 1/8/2026); 95% đúng LO/cấu trúc; 100% media coverage; 90% auto re-gen success (⚠️ **lỗi thời** — Lân xác nhận 2026-09-12 hành vi đúng là bản "CẬP NHẬT": AI KHÔNG tự động gen lại khi REJECT, xem §4 #2. KPI này thuộc bản mô tả cũ, chưa được tác giả gốc sửa lại).

---

## 3. Nguồn dữ liệu Knowledge Base (tham khảo khi cần)

- SGK Global Success Student Book (Khối 1-9) — links Google Drive theo từng khối trong PDF gốc.
- Bộ câu hỏi có đủ thông tin: Tiểu học, THCS — links Google Drive.
- `[AI Question bank] Learning Objectives (LO) Khối 1-9` — **tên tài liệu khác** với `[AI Class] Learning Objectives (LO) Khối 1-6` được nhắc ở phần Production Order input — xem xung đột §4.
- Syllabus Edupia (full academic year).
- Tài liệu gốc Bloom's Taxonomy (Benjamin S. Bloom, 1956) + 2 tài liệu ứng dụng Bloom vào câu hỏi trắc nghiệm.
- Cấu trúc output các dạng bài: `AI_Question_Bank_PRD_UserStories` (Google Sheet).

---

## 4. Câu hỏi mở / xung đột — trạng thái sau trao đổi với Lân (2026-09-12)

1. ✅ **LO vs NLO.** Lân xác nhận: **cùng một khái niệm**. Đã cập nhật `00_context/glossary.md` (entry NLO + entry mới "Question Bank"). Lưu ý: 2 tên nguồn dữ liệu LO khác nhau trong tài liệu gốc ("[AI Question bank] Learning Objectives (LO) Khối 1-9" vs "[AI Class] Learning Objectives (LO) Khối 1-6") **chưa được giải thích cụ thể** — có thể chỉ là 2 phiên bản/thời điểm khác nhau của cùng 1 taxonomy, không nhất thiết là 2 hệ thống riêng. Không quan trọng để chặn công việc hiện tại, chỉ ghi nhận.
2. ✅ **Hành vi khi REJECT.** Lân xác nhận: **theo bản "CẬP NHẬT"** — AI KHÔNG tự động gen lại câu khi bị REJECT; Học thuật chủ động tạo lại Production Order. Các chỗ khác trong tài liệu gốc (Scope §4.1, US-009, AC US-009, KPI mục 14) mô tả hành vi cũ (auto re-gen) — coi là **lỗi thời, không dùng làm căn cứ**. Không tự sửa các đoạn quote gốc ở trên (giữ nguyên để đối chiếu), chỉ đánh dấu "lỗi thời" tại chỗ.
3. ✅ **Timeline đã qua hạn.** Lân: *"Ghi nhận tài liệu và chưa có kế hoạch mới"* — nghĩa là mốc Go-Live 31/07/2026 và các milestone liên quan **không còn được theo dõi/cập nhật**, không tự suy ra ngày mới. Coi các con số ngày tháng trong tài liệu này là **lịch sử**, không phải kế hoạch hiện hành.
4. ✅ **Quan hệ Question Bank ↔ Routing Engine/BTVN Adaptive/AI Practice.** Lân xác nhận 2026-09-12: nhãn "**CMS (AI Class · Tutor)**" ở Bước 6 chính là **hệ thống Edupia AI Class/AI Tutor** — tức chính nền tảng Adaptive Learning của dự án này (Big Class Plus, BTVN Adaptive, AI Bổ trợ 30 phút, AI Tutor, AI Speak...), không phải CMS trung gian của bên thứ ba. Vậy quan hệ đúng: **Routing Engine chọn NLO ưu tiên → tầng ứng dụng của chính dự án này dùng NLO đó làm filter `lo_code` gọi Question Bank API để lấy câu hỏi.** Đây là quan hệ nội bộ trong kiến trúc đang thiết kế, không còn là suy luận giữa 2 hệ thống độc lập.
5. ✅ **Vai trò của Lân.** Xác nhận: **chỉ tiêu thụ** (không phải PO/decision-maker của hệ thống Question Bank). Mọi quyết định thay đổi scope/behavior của Question Bank thuộc team "AI Content Agent" — Lân/PRD Adaptive Learning chỉ nên mô tả cách **tiêu thụ**, không đặt yêu cầu ngược lại hệ thống này.

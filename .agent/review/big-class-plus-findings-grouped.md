# Big Class Plus (AICNew-01) — Findings gom nhóm & trạng thái phiên làm việc

> Lưu để tiếp tục sau. File này tóm tắt trạng thái review PRD tại thời điểm **2026-09-06**,
> gom 48 finding thô từ `/refine-prd` (file gốc: [`big-class-plus-findings.yaml`](./big-class-plus-findings.yaml))
> thành 9 cụm theo vấn đề gốc, để PO quyết theo cụm thay vì từng dòng.

---

## Trạng thái phiên làm việc

- **Đang ở bước:** B4 — Soi PRD qua nhiều lăng kính (`/refine-prd`), **đã chạy xong phân tích**, **CHƯA áp fix**.
- **PRD nguồn:** `04_delivery/specs/ai-class-core/big-class-plus/AICNew-01-big-class-plus.md` — v1.1, status `draft`.
- **File findings thô (máy đọc):** `.agent/review/big-class-plus-findings.yaml` — 48 findings (9 critical, 24 major, 15 minor), `recommendation: BLOCKED`.
- **File này (gom nhóm, người đọc):** để PO quyết định theo từng nhóm bên dưới.
- **Bước tiếp theo khi quay lại:**
  1. Đọc từng nhóm bên dưới, quyết định phương án (ghi quyết định trực tiếp vào cột "Quyết định PO" hoặc trả lời cho Claude Code).
  2. Với mỗi finding đã quyết, cập nhật `status` tương ứng trong `big-class-plus-findings.yaml` (`accepted` / `modified` kèm suggestion mới / `rejected` / `needs_discussion` / `deferred`).
  3. Chạy `/refine-prd 04_delivery/specs/ai-class-core/big-class-plus/AICNew-01-big-class-plus.md --resume` để áp các quyết định đã `accepted`/`modified` vào PRD (PRD sẽ lên version mới, quay lại `draft`).
  4. Lặp lại `/refine-prd` (chạy delta, không cần `--full`) cho tới khi hết critical/major.
  5. Chốt bằng `/review-context {prd-file}` → PO tự đặt `Status: approved` → `/generate-bdd`.

---

## Nhóm A — Mô hình theo dõi trạng thái buổi học chưa thống nhất (8 finding)

**Vấn đề gốc:** Tài liệu mô tả buổi học vừa như một lớp học nhóm đồng bộ (mọi học sinh cùng một mốc giờ bắt đầu/kết thúc), vừa như một video mà mỗi học sinh có thể tạm dừng/xem lại riêng (tiến độ cá nhân). Từ đó, ranh giới giữa "rời kết nối tạm thời" và "thoát hẳn", và việc học sinh vào lớp sau khi buổi đã kết thúc, đều chưa có câu trả lời rõ ràng — vì chưa biết "kết thúc buổi" là một mốc chung hay mốc riêng từng em.

**Finding liên quan:** F004 🔴, F005 🔴, F015 🟡, F023 🟡, F029 🟡, F032 🟡, F038 🟢, F046 🟢

**Cần PO/kỹ thuật quyết:**
1. Buổi học có phát đồng bộ cho cả lớp (một mốc kết thúc chung), hay mỗi học sinh có tiến độ xem riêng?
2. Ngưỡng "thoát hẳn" là một mốc thời gian tuyệt đối (TBD phút không hoạt động) hay chỉ được xác định tại đúng lúc kết thúc buổi?
3. Học sinh cố vào lớp sau khi buổi đã kết thúc thì xử lý ra sao (chặn, hay cho xem lại và tính là gì)?

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm B — Report buổi học & Mastery Profile: dữ liệu ghi nhận chưa nhất quán (5 finding)

**Vấn đề gốc:** "Report buổi học" (bản ghi tổng hợp cho phụ huynh/vận hành) và việc ghi tín hiệu vào Mastery Profile có vài chỗ mâu thuẫn nội bộ: PRD ghi nhầm rằng việc "gán NLO" bị hoãn khi học sinh chưa có Mastery Profile (trong khi rule thật chỉ hoãn việc ghi tín hiệu lỗ hổng), và chưa rõ hệ thống kiểm tra "Mastery Profile có tồn tại" vào lúc nào trong buổi học.

**Finding liên quan:** F002 🔴, F006 🔴, F008 🔴, F018 🟡, F022 🟡

**Cần PO quyết:**
1. Xác nhận: gán NLO KHÔNG bị ảnh hưởng bởi việc Mastery Profile chưa tồn tại — chỉ việc ghi lỗ hổng bị hoãn (sửa lỗi diễn đạt trong Post-condition).
2. Thời điểm hệ thống kiểm tra Mastery Profile tồn tại: đầu buổi hay cuối buổi (lúc ghi lỗ hổng)? Nếu Mastery Profile được tạo giữa buổi, dữ liệu buổi đó có được ghi bù không?
3. Chốt danh sách đầy đủ các trường dữ liệu trong "Report buổi học" (bao gồm cả trường thời điểm vào trễ, và làm rõ NLO ghi trong report gồm cả đạt+chưa đạt hay chỉ chưa đạt).

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm C — Ranh giới & phụ thuộc với các cấu phần khác chưa khai đủ (5 finding)

**Vấn đề gốc:** Big Class Plus dựa vào nhiều năng lực/dữ liệu từ các cấu phần khác (BTVN Adaptive, ánh xạ câu hỏi↔NLO, hệ thống chụp ảnh, dịch vụ AI hình ảnh/giọng nói của AI trợ giảng) nhưng một số phụ thuộc này chưa được khai báo, và ranh giới trách nhiệm với BTVN Adaptive (PRD khác) đang mờ — logic chọn bài tập theo lỗ hổng đang nằm trong PRD này thay vì PRD BTVN Adaptive.

**Finding liên quan:** F003 🔴, F011 🟡, F012 🟡, F013 🟡, F014 🟡

**Cần PO quyết:**
1. BR10 chỉ nên "nhắc tồn tại BTVN" hay được phép "chọn đúng bài theo lỗ hổng" (chồng lấn phạm vi PRD BTVN Adaptive)?
2. Xác nhận nguồn ánh xạ câu hỏi↔NLO đã có sẵn hay cần xây mới (ảnh hưởng tiến độ prototype).
3. Bổ sung phụ thuộc còn thiếu vào §1c: hệ thống chụp ảnh học sinh, dịch vụ AI hình ảnh/giọng nói AI trợ giảng.

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm D — Nhánh lỗi/sự cố hệ thống chưa được xử lý (5 finding)

**Vấn đề gốc:** PRD chỉ định nghĩa rõ một nhánh lỗi (LMS không trả được danh sách lớp — BR12), nhưng bỏ ngỏ nhiều nhánh lỗi khác cùng mức độ nghiêm trọng: AI Voice/video GV Star gián đoạn giữa buổi, AI trợ giảng lỗi khi sinh nhận xét, LMS trả thành công nhưng thiếu tên một học sinh, và việc chụp ảnh điểm danh thất bại có được thử lại không.

**Finding liên quan:** F028 🟡, F030 🟡, F031 🟡, F033 🟡, F039 🟢

**Cần PO/kỹ thuật quyết:**
1. Buổi học có tiếp tục được không nếu AI Voice/video GV Star gián đoạn giữa chừng? Học sinh có được thông báo gì không?
2. Nếu AI trợ giảng lỗi khi sinh nhận xét, điểm danh cuối buổi có bị chặn theo không?
3. Bổ sung màn hình/thông báo lỗi còn thiếu ở §4 cho case LMS lỗi (hiện đang tham chiếu treo).

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm E — Case biên trong luồng trả lời câu hỏi, gán NLO & nhận xét cuối buổi (7 finding)

**Vấn đề gốc:** Các quy tắc lõi (gán NLO, phản hồi AI Voice, nhận xét AI trợ giảng) đã định nghĩa luồng chính, nhưng còn several case biên chưa có câu trả lời: học sinh trả lời một phần câu hỏi liên quan một NLO, một học sinh trả lời liên tiếp rất nhanh, có được đổi đáp án trước khi chốt không, học sinh có nhiều NLO chưa đạt cùng lúc thì gợi ý bài nào, và AI trợ giảng có vẫn nhận xét cho học sinh đã thoát hẳn không.

**Finding liên quan:** F007 🔴, F017 🟡, F024 🟡, F025 🟡, F026 🟡, F027 🟡, F048 🟢

**Cần PO quyết (đây đều là quyết định nghiệp vụ thuần, PO có thể chốt ngay):**
1. Học sinh trả lời một phần câu hỏi liên quan một NLO → NLO đó tính sao?
2. Ngưỡng đạt/chưa đạt khi một NLO qua nhiều câu (F017/Q3 — PRD đang tạm giả định "một câu sai là đủ") — xác nhận hay đổi?
3. Học sinh có nhiều NLO chưa đạt → gợi ý BTVN cho tất cả hay chỉ một (theo tiêu chí gì)?
4. AI trợ giảng có nhận xét cho học sinh đã thoát hẳn (để xem sau) không?

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm F — Acceptance Criteria chưa bám sát Business Rule (3 finding, thuần kỹ thuật viết tài liệu — không cần PO quyết nghiệp vụ)

**Vấn đề gốc:** AC10 và AC8 đang gộp chung nhiều nhánh outcome khác nhau của BR10/BR8 thành một câu mơ hồ; AC5/AC6 thiếu một nhánh test cho case "nhiều học sinh trả lời đồng thời" dù BR5/BR6 đã định nghĩa. Đây là lỗi viết tài liệu, sửa được ngay không cần PO quyết thêm gì mới.

**Finding liên quan:** F019 🟡, F020 🟡, F021 🟡

**Đề xuất:** Chấp nhận tất cả (`accepted`), áp thẳng khi `--resume`.

---

## Nhóm G — Success Metric & Priority còn thiếu (2 finding)

**Vấn đề gốc:** PRD phục vụ khảo sát T9 nhưng không có tiêu chí nào định nghĩa "thành công" là gì (cho cả buổi học lẫn cho đợt khảo sát), và không phân biệt priority giữa 14 AC/BR — mọi thứ đọc như thể mức độ quan trọng ngang nhau.

**Finding liên quan:** F009 🔴, F016 🟡

**Cần PO quyết:**
1. Chỉ số nào dùng để đánh giá "khảo sát T9 thành công" (vd ngưỡng WTP/purchase-intent)?
2. Priority của từng nhóm AC/BR — cái nào bắt buộc phải có cho demo, cái nào có thể tạm mock.

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm H — Thương hiệu/thuật ngữ chưa khớp glossary (4 finding)

**Vấn đề gốc:** Vài thuật ngữ trung tâm của PRD (quan hệ Big Class Plus với Big Class gốc, tên "Edupia AI Class Plus", khái niệm "Gap Detection") chưa có entry tường minh hoặc đủ rõ trong `00_context/glossary.md`. Đây là việc nên làm nhưng chủ yếu là cập nhật glossary, không sửa PRD nhiều.

**Finding liên quan:** F001 🔴, F040 🟢, F043 🟢, F047 🟢

**Cần PO xác nhận:**
1. Big Class Plus có bỏ hẳn đặc tính "giáo viên thật dẫn lớp" của Big Class gốc không? (đây là câu quan trọng nhất trong nhóm, ảnh hưởng định vị sản phẩm)
2. Bổ sung glossary: "Edupia AI Class Plus", "Gap Detection".

**Quyết định PO:** _(để trống, điền khi quyết)_

---

## Nhóm I — Dọn dẹp hình thức/tầng tài liệu (9 finding — phần lớn auto-fixable, không cần PO quyết nghiệp vụ)

**Vấn đề gốc:** Các câu ở tầng Scope/User Story đang lặp lại nguyên văn nội dung đã có ở Business Rule, một vài định nghĩa thuật ngữ bị nhét sai chỗ (Scope thay vì Note/glossary), một placeholder định lượng ("vài giây") không nhất quán format, danh sách Actor thiếu vài actor hệ thống, Screen 3 chưa nói rõ hiển thị cho vài case.

**Finding liên quan:** F010 🟡, F034 🟢, F035 🟢, F036 🟢, F037 🟢, F041 🟢, F042 🟢, F044 🟢, F045 🟢

**Đề xuất:** Chấp nhận tất cả (`accepted`), áp thẳng khi `--resume` — đa số đã đánh dấu `auto_fixable: true`.

---

## Tóm tắt độ ưu tiên xử lý đề xuất

| Thứ tự | Nhóm | Vì sao trước |
|---|---|---|
| 1 | H (chỉ câu hỏi "GV thật hay GV Star?") | Ảnh hưởng định vị sản phẩm — nên chốt sớm nhất |
| 2 | G (Success Metric) | Không có thì không biết khảo sát T9 đo gì |
| 3 | A (mô hình trạng thái buổi học) | Chi phối cách hiểu 6+ finding khác |
| 4 | B, C, D, E | Các quyết định nghiệp vụ cụ thể, độc lập tương đối với nhau |
| 5 | F, I | Dọn dẹp hình thức, có thể `--resume` ngay không cần PO ngồi họp |

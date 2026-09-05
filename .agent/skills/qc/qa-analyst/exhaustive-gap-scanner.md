---
version: 1.0
updated: 2026-08-25
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/exhaustive-gap-scanner.md
upstream_sha: b3f5aa112ec2fb93100d8945a3fa3d5fe904eb26
port_completeness: partial
---

# Exhaustive Gap Scanner — 5 chiều quét gap

Năm **lăng kính** để quét gap tài liệu. Mỗi lăng kính chỉ lo phần mình và **mù với các
lăng kính khác** — đó là điều làm độ phủ cao hơn một lượt đọc tuần tự, nơi phần cuối tài liệu
luôn bị lướt.

> **Bốn trong năm chiều đang BẬT** ở `/qc-analyze`: `D2` · `D3` · `D4` · `D5`*(thu hẹp)*.
> Chỉ `D1` tắt. File này khai *nội dung* các chiều; việc *chạy* chúng thuộc
> `steps/review-fanout.md`.

## Chiều nào đang bật

| Chiều | Trạng thái | Bằng chứng *(kiểm từng câu hỏi — xem `docs/plans/qc-implementation-log.md` §Kiểm chứng 31 câu hỏi)* |
|---|---|---|
| `D1` Luật nghiệp vụ | ⏸️ **tắt** | **4/5 câu đã có chỗ hỏi, và hỏi cụ thể hơn** — `business-rules.md` hỏi *"min/max · ký tự cho phép · trim · định dạng"* thay vì *"ngưỡng đã chốt chưa"* |
| `D2` Xử lý lỗi | ✅ **bật** | **4/6 câu KHÔNG AI HỎI** — không kỹ năng nào chuyên về *"hết số lần thử lại thì đi đâu"* |
| `D3` Giao diện | ✅ **bật** | **1/8 phủ tốt, 3 hở hẳn** — không ai đối chiếu chữ trên nút giữa các tài liệu |
| `D4` Dữ liệu & cấu hình | ✅ **bật** | **6/6 câu KHÔNG AI HỎI** — chiều đáng giá nhất |
| `D5` Đối chiếu chéo | ✅ **bật, THU HẸP** | **2/4 cặp đang hở** — cả hai dính `design-spec/`. Hai cặp còn lại đã có người làm → bỏ. Xem §Phạm vi ở D5 |

> **`D5` từng bị tắt, và đó là quyết định SAI.** Lý do tắt ban đầu — *"trùng nhiều"* — đúng một
> nửa: nó phủ **bốn** cặp tài liệu, và chỉ **hai** cặp đã có người làm. Hai cặp còn lại
> (`PRD ↔ design-spec/` và `bdd/ ↔ design-spec/`) **không ai đối chiếu nội dung**.
>
> Sai vì suy từ ấn tượng thay vì đếm danh sách. Bảng kiểm chứng 31 câu hỏi trong nhật ký là thứ
> đáng lẽ phải làm **trước** khi quyết.

> **Chi phí:** bật cả 5 (không thu hẹp) tốn ~5–6 lần token so với không bật. Cấu hình hiện tại —
> 3 chiều đầy đủ + `D5` thu hẹp — vào khoảng **~3,5 lần**. `D5` rẻ hơn một chiều thường vì nó chỉ
> so 2 cặp, và `design-spec/` thì trạm QC **đã đọc từ trước**.

## Cố ý KHÔNG port nửa còn lại

Bản upstream tự cài lại toàn bộ cơ chế fan-out bằng tay: một Coordinator kiểm kê tài liệu,
dựng SPAWN PLAN, gọi song song 5 agent, rồi consolidate + dedup + đánh ID.

Framework **đã có đúng cơ chế đó** ở `steps/review-fanout.md` — và bản của framework còn có
thêm hai thứ upstream không có: vòng **completeness-critic** lặp tới khi hai vòng liền không
sinh gì mới, và **agent cap** gom batch khi fan-out quá rộng.

Port cả phần điều phối = nuôi hai bản cài đặt của cùng một thứ, rồi chúng trôi khỏi nhau.
Nên file này **chỉ giữ phần nội dung** (5 mandate), phần điều phối để `review-fanout` lo.

*Ghi vào `port_completeness: partial` ở frontmatter — khi đồng bộ ngược sau này, đừng hiểu
phần thiếu là "ta cố ý xoá nội dung".*

---

## Ràng buộc nguồn *(áp cho cả 5 chiều)*

- Chỉ dùng **spec repo** (`{paths.specs_dir}`) làm evidence. KHÔNG dùng artifact nội bộ do
  chính pipeline sinh ra (`{paths.qc_dir}/**` — test-case, test-plan, file gap khác).
- **Bỏ qua** section **Change Log** · **Appendix** · **Giả định AI / AI Assumptions** trong mọi
  tài liệu. Evidence CHỈ lấy từ thân bài: AC · BR · UC · Wireframe · Screen Spec · Scenario.
- **KHÔNG bịa** endpoint, bảng, field, hay tài liệu không tồn tại.

---

## Năm chiều

Truyền vào `steps/review-fanout.md` làm `DIMENSIONS`. Chiều nào không có tài liệu đầu vào
tương ứng thì **bỏ hẳn** — không tạo gap rỗng, không nhắc tới nó trong output.

### D1 · Luật nghiệp vụ  *(⏸️ TẮT ở `/qc-analyze` — xem bảng trên)*
- Logic rẽ nhánh: điều kiện đã đủ chưa? Thiếu nhánh nào?
- Ngưỡng / ràng buộc: đã chốt số cụ thể hay còn để ngỏ?
- Ngoại lệ: trường hợp biên nào chưa được xử lý trong spec?
- Rule mâu thuẫn giữa các tài liệu?
- Chỗ nào người viết test **buộc phải giả định** vì spec không rõ?

### D2 · Xử lý lỗi  *(✅ bật)*
- Quá hạn (timeout) → hành vi là gì?
- Số lần thử lại đã spec chưa? Khoảng cách giữa các lần?
- Thử lại hết số lần → hệ thống làm gì?
- Hàng đợi lỗi: ai xử lý? Có cảnh báo cho người vận hành không?
- Với **từng loại lỗi**: màn nào hiện, người dùng làm được gì tiếp?
- Khôi phục: người dùng thử lại được không? Luồng đi tiếp hay bị chặn?

### D3 · Giao diện  *(✅ bật — bỏ hẳn nếu không có BDD / design-spec / wireframe)*
- **Trạng thái màn**: thiếu state nào? (đang tải · rỗng · lỗi · thành công · một phần · vô hiệu)
- **Chữ & nhãn**: text nút/tiêu đề/thông báo/gợi ý có nhất quán trong cùng tài liệu và **giữa**
  các tài liệu không?
- **Điều hướng**: từ mỗi màn, đi tiếp được đâu và quay lại được đâu? Đã spec đủ mọi đường chưa?
- **Kiểm tra & phản hồi**: rule validate đã spec? Thông báo lỗi/thành công đã có **nội dung
  cụ thể** chưa?
- **Trạng thái biên**: màn trống, danh sách rỗng, quá hạn, kết quả 0 — trải nghiệm thế nào?
- **UI đã bị gỡ**: component/popup/màn còn trong design-spec nhưng PRD/BDD đã bỏ?
- **Đa nền** *(nếu có)*: hành vi trên các nền/breakpoint có nhất quán không?
- **Tài nguyên hiển thị**: loại asset (animation/ảnh/video) và tiêu chí hiển thị đã xác định chưa?

### D4 · Dữ liệu & cấu hình  *(✅ bật — bỏ hẳn nếu không có bảng tính điểm / dữ liệu mẫu / cờ tính năng / spec môi trường)*
- Bảng điểm / rule tính toán / bảng ánh xạ: có **đủ dữ liệu để tự kiểm chứng kết quả tính** không?
- Dữ liệu mẫu: có ví dụ đủ để dựng môi trường test không?
- Cấu hình đổi **giữa lúc đang chạy** thì hành vi là gì? Chốt giá trị tại thời điểm nào?
- Phụ thuộc môi trường: service, hàng đợi, DB cần thiết đã được spec cho môi trường test chưa?
- Việc dựng dữ liệu có phụ thuộc thứ còn để ngỏ hoặc chưa làm không?
- Cờ tính năng: cờ nào ảnh hưởng hành vi cần test? Giá trị mặc định ở môi trường test là gì?

### D5 · Đối chiếu chéo tài liệu  *(✅ bật — THU HẸP còn 2 cặp, xem dưới)*

> **Nhiệm vụ của chiều này là PHÁT HIỆN cặp lệch + gắn HƯỚNG thô. KHÔNG tự chốt loại cuối** —
> việc phân loại và lọc báo-oan do `steps/gap-verify.md` làm (T5 xác định hướng, T3b xác định
> mâu thuẫn thật). Chiều này chỉ đưa bằng chứng *"X nói khác/thiếu/thừa so với Y"*.

#### PHẠM VI — chỉ hai cặp, không phải bốn

Bản upstream so **mọi cặp** tài liệu trong feature package. Ở framework, hai cặp đã có chỗ khác
làm — so lại là nhân đôi công việc và PO nhận hai câu hỏi cho một vấn đề.

| Cặp | Ở framework | |
|---|---|---|
| **PRD ↔ `design-spec/`** | **không ai so nội dung** — `/generate-bdd` chỉ kiểm `Built from PRD` (số phiên bản). Cùng phiên bản mà nội dung lệch thì lọt | ✅ **SO** |
| **`bdd/{platform}/` ↔ `design-spec/`** | không ai | ✅ **SO** |
| PRD ↔ `bdd/` | `/review-context` **B1** đã làm (AC/BR nào chưa có scenario) | ❌ bỏ |
| PRD · `bdd/` ↔ `tech-docs/` | `/qc-analyze` §Đối chiếu tài liệu kỹ thuật đã làm (6 mục) | ❌ bỏ |

> **Cả hai cặp SO đều dính `design-spec/`** — tức phần **Designer vẽ**. Đây là artifact duy nhất
> trong feature package mà **không tài liệu nào đối chiếu nội dung với nó**.
>
> `design-spec/` ≠ `tech-docs/`: cái đầu là *giao diện người dùng thấy*, cái sau là *hợp đồng hệ
> thống*. `tech-docs/` đã được phủ ở §Đối chiếu tài liệu kỹ thuật của `/qc-analyze`.

Trạm QC **đã đọc `design-spec/`** từ trước (nó nằm trong danh sách nguồn). Nên chiều này không
nạp thêm file nào — chỉ bắt nó **so** thay vì chỉ **đọc**.

#### Bốn hướng lệch

Lấy **PRD làm gốc**, đối chiếu **thân bài** (KHÔNG đọc Change Log):

| Hướng | Nghĩa | Ai xử lý |
|---|---|---|
| **THIẾU** *(design-spec < PRD)* | PRD có màn / trạng thái / hành vi mà `design-spec/` **không** mô tả | Designer bổ sung |
| **THỪA** *(design-spec > PRD)* | `design-spec/` **tự thêm** màn/nút/hành vi mà PRD không định nghĩa | **PO chốt**: giữ (rồi định nghĩa hệ quả vào PRD) hay gỡ |
| **MÂU THUẪN** | cùng một hành vi/giá trị/chữ nhưng hai tài liệu nói khác nhau | PO + Designer |
| **LỆCH-REF** | `design-spec/` trích số/tên BR·AC đã đổi nghĩa — mở đúng BR/AC đó trong PRD **hiện tại**: ref không còn, hoặc mang nghĩa khác | PO |

> **THIẾU vs THỪA phải phân biệt đúng** — đây là lỗi framing hay gặp nhất, và hai hướng xử lý
> **ngược nhau**. Gọi *"thiết kế thiếu"* trong khi thiết kế **thừa** là đặt sai đề bài cho cả PO
> lẫn Designer: một bên tưởng phải vẽ thêm, một bên đáng lẽ phải quyết giữ hay gỡ.

#### Với cặp `bdd/` ↔ `design-spec/` — soi gì

- Kịch bản test đi qua một **trạng thái màn** mà `design-spec/` không có (`loading`/`error`/`empty`)?
- Kịch bản test tác động lên một **thành phần giao diện** không có trong Component Inventory?
- `design-spec/` mô tả một **đường điều hướng** mà không kịch bản nào đi qua?

*(Chiều này chỉ chạy khi feature có `design-spec/`. Feature `system` không có → bỏ hẳn cặp này.)*

---

## Sau khi quét — BẮT BUỘC thẩm định

Fan-out càng rộng thì gap bịa càng nhiều: đây là cơ chế **đẩy recall**, tự nó không có gì
kéo precision. Chạy `steps/gap-verify.md` trên tập gap trước khi bàn giao — đó là nửa còn lại.

**Hai cách gọi, tuỳ lệnh:**

| Lệnh gọi có | Thẩm định chạy ở đâu |
|---|---|
| `VERIFY = on` | tự động ở `review-fanout` Phase 2.5 — dùng khi fan-out là **nguồn gap duy nhất** |
| `VERIFY = off` | lệnh gọi tự chạy `gap-verify` **sau khi gộp** — dùng khi còn nguồn gap khác |

`/qc-analyze` dùng cách thứ hai: gap đến từ **cả** 4 kỹ năng phân tích **và** fan-out, nên phải
gộp trước rồi mới thẩm định một lần. Thẩm định hai tập rời thì phép kiểm `T6` (*"hai gap cùng gốc
thì gộp lại"*) không bắt được trùng lặp chéo nguồn.

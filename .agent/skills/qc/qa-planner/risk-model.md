---
version: 1.0
updated: 2026-08-25
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/risk-acceptance-analyzer.md
upstream_sha: 5eca5091acd30e063d20b63f12b04e2d1c78ac83
port_completeness: partial
---

# Risk Model — cách tính mức rủi ro và dùng nó để chia độ sâu test

`test-plan.md` có **khung** bảng rủi ro (`§6`) nhưng không có **cách điền**. File này là cách điền.

Nạp cùng `test-plan.md` khi lập plan. Đầu ra không phải file riêng — nó điền vào `§6 Rủi ro`
và `§5 Tiêu chí Vào/Ra` của `TEST_PLAN.md`.

## Cố ý chỉ port một phần

Bản upstream (`risk-acceptance-analyzer`) có 5 phase. Ba phase bị **cố ý bỏ** vì trạm 1 đã làm rồi:

| Phase upstream | Vì sao không port |
|---|---|
| Test Conditions | trùng vai với `qa-analyst/spec-breakdown` + `business-rules` (trạm 1) |
| Ambiguity & Gap | trùng vai với `DOC_GAP` + `steps/gap-verify.md` (trạm 1) |
| Acceptance Criteria | trùng vai với `qa-analyst/acceptance-criteria` (trạm 1) |

Chỉ port **Phase 3 (Risk Register)** và **Phase 5 (Ưu tiên + Entry/Exit)** — hai phần trạm 2 sở hữu.

*Ghi `port_completeness: partial` ở frontmatter — lần đồng bộ sau đừng hiểu phần thiếu là
"ta cố ý xoá nội dung".*

---

## Bước 1 — Liệt kê rủi ro sản phẩm

Bảy nguồn rủi ro. Quét từng cái, không bỏ nguồn nào chỉ vì "feature này chắc không có":

| # | Nguồn | Dấu hiệu trong PRD/BR |
|---|---|---|
| 1 | **Logic phức tạp** | nhiều điều kiện AND/OR lồng nhau, bảng định tuyến, công thức tính |
| 2 | **Tiền / thanh toán** | giao dịch, hoàn tiền, mã giảm giá, hạn mức |
| 3 | **Dữ liệu nhạy cảm** | thông tin cá nhân, số điện thoại, thông tin định danh |
| 4 | **Tích hợp nhiều phần** | gọi dịch vụ khác, hàng đợi sự kiện, đồng bộ dữ liệu |
| 5 | **Code mới hoặc sửa nhiều** | feature xây mới, hoặc vùng vừa refactor |
| 6 | **Lịch sử lỗi cao** | vùng đã từng có bug — tra `{paths.bug_reports_dir}` cho UC/feature này |
| 7 | **Ảnh hưởng nhiều người dùng** | luồng chính mọi người đều đi qua, màn đăng nhập, trang chủ |

> Nguồn 6 là nguồn duy nhất **tra được bằng dữ liệu thật** trong framework — sổ bug nằm ở
> `{paths.bug_reports_dir}`. Đừng đoán "vùng này chắc ổn"; mở ra đếm.

## Bước 2 — Chấm mức cho từng rủi ro

Hai chiều, mỗi chiều ba mức:

- **Khả năng xảy ra** — Cao / Trung bình / Thấp
- **Mức thiệt hại nếu xảy ra** — Cao / Trung bình / Thấp

Nhân lại ra **P0 → P3**:

| Khả năng \ Thiệt hại | Cao | Trung bình | Thấp |
|---|:---:|:---:|:---:|
| **Cao** | **P0** | **P1** | P2 |
| **Trung bình** | **P1** | P2 | P3 |
| **Thấp** | P2 | P3 | P3 |

> **Chấm hai chiều riêng rồi mới nhân** — đừng chấm thẳng ra P0/P1 theo cảm tính. Hai chiều
> tách nhau là chỗ tranh luận trở nên cụ thể: *"cái này thiệt hại cao nhưng khả năng thấp"*
> là một câu nói được, còn *"cái này P1"* thì không cãi được, chỉ tin hoặc không tin.

## Bước 3 — Dùng mức rủi ro để chia **độ sâu** test

Đây là chỗ bảng rủi ro trả lại giá trị. Không có bước này thì nó chỉ là một bảng trang trí.

| Mức | Test sâu tới đâu | Tự động hoá |
|---|---|---|
| **P0** | nhiều kỹ thuật cùng lúc: phân lớp tương đương + giá trị biên + bảng quyết định + chuyển trạng thái | ✅ ưu tiên — cả kiểm thử hồi quy |
| **P1** | hai kỹ thuật trở lên, phủ đủ nhánh chính + nhánh lỗi | ✅ nếu ổn định |
| **P2** | một kỹ thuật, phủ luồng thuận + một nhánh lỗi tiêu biểu | tuỳ |
| **P3** | danh sách kiểm tay, không cần test case đầy đủ | ❌ |

**Thứ tự chạy:** rủi ro cao **và** phụ thuộc thấp làm trước — không phải "P0 làm hết rồi mới tới P1".
Một P0 đang chờ gap chặn thì không chạy được; làm P1 sẵn sàng trước là đúng.

**Tháp test:** end-to-end tự động **chỉ** cho luồng P0/P1 trọng yếu. E2E cho P2/P3 là đắt và giòn —
tiền không đáng.

## Bước 4 — Điền Entry / Exit theo rủi ro

`test-plan.md §5` đã có khung. Rủi ro làm nó cụ thể hơn:

- **Entry** — mọi gap 🔴 chặn đã `Answered`; **và** mọi rủi ro P0 đã có ít nhất một cách giảm thiểu ghi rõ.
- **Exit** — phủ 100% vùng P0 · không còn defect mở ở vùng P0/P1 · tỉ lệ pass đạt ngưỡng đã khai.

> **Rủi ro P0 không có cách giảm thiểu = chưa đủ điều kiện bắt đầu.** Ghi ra một rủi ro rồi
> không nói làm gì với nó là ghi cho có.

---

## Điền vào `TEST_PLAN.md §6`

| Rủi ro | Nguồn (1–7) | Khả năng | Thiệt hại | Mức | Giảm thiểu (loại test + kỹ thuật) |
|---|---|---|---|---|---|
| … | 2 · tiền | Cao | Cao | **P0** | functional/api + giá trị biên; e2e luồng thanh toán |

Mỗi dòng rủi ro phải **trỏ được về BR-xx hoặc GAP-xx** đã có ở `REQUIREMENT_ANALYSIS.md` /
`DOC_GAP.md` — rủi ro không neo vào yêu cầu nào là rủi ro tự nghĩ ra.

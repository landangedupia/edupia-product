# AICNew-04 Product Definition — Parent Mode

> ⚠️ **Ghi chú phạm vi (PO xác nhận 2026-09-14):** tài liệu này phục vụ **PRD cho bản demo** của Concept 1.2 — sẽ được phân tích bổ sung lại khi concept được chốt chính thức. Một số mục (đánh dấu ❓/`[AI DRAFT]`) được PO chủ động để ngỏ, xử lý sau ở `/refine-prd` khi có quyết định chính thức, không phải bỏ sót.
>
> Khác với AICNew-03 (tổng hợp từ tài liệu, chưa qua phiên hỏi-đáp trực tiếp), tài liệu này **có phiên khám phá trực tiếp với PO** (giống AICNew-01/02) — mọi mục "PO xác nhận" là câu trả lời thật đã ghi nhận qua hội thoại 2026-09-14.
>
> ✏️ **Tu chỉnh sau khi dựng Figma (2026-09-14, cùng ngày):** PO đổi cơ chế cổng xác thực ở Phase 2/4/5 — thay thử thách "đọc số — viết chữ" bằng 2 phương thức: mật khẩu phụ huynh (riêng, khác mật khẩu học sinh) hoặc OTP qua SĐT/Zalo. Thay đổi này **mâu thuẫn với câu trả lời đã chốt ở Phase 3, Vòng 1, #3** ("dùng chung cổng xác thực với học sinh, không có luồng thiết lập riêng") vì mật khẩu phụ huynh cần một luồng thiết lập lần đầu — xem câu hỏi mới trong Phase 7. PRD (`04_delivery/specs/parent-mode/parent-mode/AICNew-04-parent-mode.md`) đã cập nhật lên v1.1 phản ánh thay đổi này.

---

## Metadata

| Field              | Value                          |
|--------------------|--------------------------------|
| **Ticket**         | AICNew-04                      |
| **Feature**        | Parent Mode                    |
| **Domain**         | parent-mode                    |
| **PO**             | Đặng Ngọc Lân                  |
| **Created**        | 2026-09-14                     |
| **Status**         | completed                      |
| **Completed Phase**| 7                               |

---

## Phase 0: Đồng bộ tri thức (Knowledge Sync)

### Khái niệm / dữ liệu nghiệp vụ liên quan
- **Parent Mode** — tính năng báo cáo tiến bộ học tập + thông báo cho phụ huynh (`00_context/glossary.md`). Phạm vi vừa được cập nhật 2026-09-14: ở Concept 1.2 đã bao gồm cả gửi thông báo tới điện thoại phụ huynh, không chỉ Mastery Map như định nghĩa C3 gốc trong product-brief 08-13 (xem `D-2026-09-14-01`, `06_decisions/decision-log.md`).
- **Mastery Profile / Mastery Map** — bản đồ năng lực học sinh theo NLO. Phạm vi vừa được chốt 2026-09-14: dùng **chung cho các thành phần trong sản phẩm Edupia AI Class** (tiền thân của Edupia AI Class Plus), không giới hạn riêng AI Class Plus/Concept 1.2 (`D-2026-09-14-01`).
- **NLO (Nano Learning Objective)**, **GVCN**, **Report buổi học** — xem `00_context/glossary.md`.
- **Report buổi học** (định nghĩa đầy đủ ở `AICNew-01-big-class-plus.md` §1d): gồm trạng thái điểm danh đầu/cuối buổi, cờ "vào trễ", danh sách NLO đã gán, cờ "không đủ dữ liệu gán NLO", cờ "Mastery Profile chưa khởi tạo", cờ "thiếu ảnh điểm danh" — đây là **input chính** cho Parent Mode.

### Phần hệ thống / feature liên quan
- `AICNew-01` (Big Class Plus) và `AICNew-02` (AI Bổ trợ 30 phút) đều ghi rõ "Parent Mode ngoài phạm vi, thuộc PRD riêng" — AICNew-04 là PRD đó.
- Design-spec demo cũ `04_delivery/specs/ai-class-core/big-class-plus/design-spec/ai-studio-prompt/ai-studio-prompt-big-class-plus.md` mô tả cổng xác thực + layout Parent Mode ban đầu (dạng bảng ô vuông Mastery Map) — **một phần đã lỗi thời** theo feedback họp `00_context/meeting-notes/2026-09-10-review-demo-concept-1-2.md` (đề xuất đổi sang text summary + radar chart, ưu tiên hiển thị ảnh điểm danh, thêm CTA hành động, đổi cổng xác thực sang short button/Zalo webview).
- Nguồn tổng hợp nhu cầu/JTBD/pain point phụ huynh: `03_product/concepts/tong-hop-nhu-cau-jtbd-pain-point-concept-1.2-2026-09-14.md`.

### Rule / Logic có sẵn
- `AICNew-01-UC1-BR2`, `BR7`: report buổi học PHẢI ghi cờ "vào trễ" và cờ "không đủ dữ liệu gán NLO" để Parent Mode xử lý thông báo — Parent Mode chỉ tiêu thụ các cờ này, không tự định nghĩa lại.
- Ảnh học sinh (check-in/out) cần chính sách bảo mật dữ liệu riêng (thời hạn lưu, phạm vi truy cập, đồng ý phụ huynh) — theo ghi chú trong `AICNew-01-big-class-plus.md`, **chưa được định nghĩa ở bất kỳ PRD nào**. Parent Mode phụ thuộc chính sách này nhưng không tự quyết định.

### Chuẩn hoá thuật ngữ
Không phát hiện thuật ngữ mới — toàn bộ thuật ngữ dùng trong input đã có entry trong `00_context/glossary.md`.

---

## Phase 1: Định nghĩa tính năng (Feature Definition)

> ✅ PO xác nhận trực tiếp 2026-09-14.

### Bối cảnh (Context)
Đây là PRD tách riêng cho Parent Mode trong Concept 1.2, vì `AICNew-01` và `AICNew-02` đều ghi "Parent Mode ngoài phạm vi, thuộc PRD riêng". Phụ huynh hiện chưa có kênh xem báo cáo học tập của con một cách dễ hiểu, kịp thời.

### Tuyên bố vấn đề (Problem Statement)
Phụ huynh không biết chính xác con học có hiệu quả không, không thấy ảnh điểm danh, và (nếu có báo cáo) báo cáo quá chung chung, không có gợi ý hành động cụ thể.

### Mục tiêu (Goal)
Phụ huynh mở Parent Mode → trong khoảng 1 phút hiểu được tình hình điểm danh + tiến bộ học tập của con, có gợi ý hành động cụ thể (CTA), và được chủ động báo khi có sự kiện cần biết — không phải tự vào xem mới biết.

### Actor
| Actor | Vai trò | Chính/Phụ |
|---|---|---|
| Phụ huynh | Qua cổng xác thực, xem báo cáo điểm danh/tiến bộ, nhận gợi ý hành động, nhận thông báo | Primary |
| Học sinh | Bị ảnh hưởng gián tiếp (dữ liệu của mình được hiển thị cho phụ huynh xem) — không thao tác trong Parent Mode | Secondary |

*(GVCN không phải actor của PRD này — dashboard hỗ trợ GVCN quản lý 1:2.000 thuộc riêng Concept 1.3, xem Out of Scope.)*

### Phạm vi (In Scope)
- Cổng xác thực phụ huynh (parental gate) để vào Parent Mode.
- Báo cáo điểm danh: ảnh check-in/check-out, trạng thái "vào trễ".
- Báo cáo tiến bộ học tập (Mastery Map) dạng dễ hiểu (tóm tắt văn bản + biểu đồ tổng quan kỹ năng).
- Gợi ý hành động cụ thể (CTA) đi kèm mỗi chỉ số báo cáo.
- Kế hoạch học tập tiếp theo (định hướng mục tiêu + lộ trình, không liệt kê mã chuyên môn).
- Thông báo chủ động tới phụ huynh (vào trễ, thiếu ảnh điểm danh, không đủ dữ liệu gán NLO, kết thúc buổi bổ trợ AI Tutor 30 phút).

### Ngoài phạm vi (Out of Scope)
- **Dashboard hỗ trợ GVCN quản lý 1:2.000** — thuộc Concept 1.3.
- **Cơ chế ghi report buổi học / dữ liệu Mastery Profile gốc** — thuộc `AICNew-01`/`AICNew-02`.
- **Chính sách lưu trữ/bảo mật ảnh học sinh** — cần Product/Pháp lý xác lập riêng; Parent Mode chỉ tiêu thụ, không tự quyết định.
- **Tài khoản/đăng nhập riêng cho phụ huynh** — PO xác nhận (Phase 3): giữ nguyên phương án hiện tại (truy cập qua tài khoản học sinh), việc "tách giao diện Parent Mode hoàn toàn riêng" là **định hướng tương lai**, chưa phải quyết định cho ticket này.
- **Trường hợp một phụ huynh có nhiều con dùng chung tài khoản** — PO chủ động tạm hoãn, chưa xử lý ở PRD này.
- **Trường hợp phụ huynh không dùng Zalo/không có smartphone** — PO để ngỏ, chưa xử lý ở PRD này.

### User Story
- **Là một (As a)** phụ huynh
- **Tôi muốn (I want to)** xem báo cáo điểm danh và tiến bộ học tập của con một cách dễ hiểu, kèm gợi ý hành động cụ thể
- **Để (So that)** tôi yên tâm rằng việc học của con đang hiệu quả, mà không cần tự kèm hay tự đánh giá

### Phụ thuộc liên service *(mức nghiệp vụ)*
- Cần "report buổi học" (điểm danh, cờ vào trễ, NLO đã gán, ảnh check-in/out) từ `AICNew-01`.
- Cần kết quả buổi bổ trợ AI Tutor 30 phút từ `AICNew-02`.
- Cần Mastery Profile/NLO từ nền tảng Adaptive Learning dùng chung toàn Edupia AI Class (theo `D-2026-09-14-01`).
- Cần chính sách lưu trữ ảnh học sinh từ Pháp lý — hiện **chưa có**.

---

## Phase 2: Định nghĩa User Flow

> ✅ PO xác nhận trực tiếp 2026-09-14.

### Điểm vào (Entry Point)
Hai kênh **song song**: (a) menu "Tài khoản" trong app học của con → "Chế độ dành cho phụ huynh" → cổng xác thực (như demo cũ); (b) liên kết ngắn qua Zalo (webview), không cần mật khẩu phức tạp. Cả hai kênh đều dẫn vào cùng một cổng xác thực và cùng một Parent Mode — **không** có tài khoản/đăng nhập riêng cho phụ huynh (Phase 3, Vòng 1 đã xác nhận: giao diện vẫn nhúng trong tài khoản học sinh).

### Các bước của Flow
| Bước | Hành động | Trạng thái/Kết quả nghiệp vụ | Ghi chú |
|---|---|---|---|
| 1 | Phụ huynh mở lối vào Parent Mode (menu "Tài khoản" hoặc liên kết Zalo) | Chuyển tới cổng xác thực | Cả hai kênh song song |
| 2 | Qua cổng xác thực phụ huynh | Đúng → vào Parent Mode · Sai → ở lại, cho thử lại không giới hạn số lần | Dùng chung phiên đăng nhập tài khoản học sinh, không có bước thiết lập riêng |
| 3 | Xem màn tổng quan | Thấy báo cáo điểm danh buổi gần nhất + tóm tắt tiến bộ | |
| 4 | Xem báo cáo tiến bộ chi tiết | Thấy tóm tắt văn bản + biểu đồ tổng quan kỹ năng, kèm gợi ý hành động | |
| 5 | Bấm vào gợi ý hành động (CTA) | Hệ thống hiển thị lời nhắc để phụ huynh nhắc con thực hiện — **không phải** phụ huynh tự thao tác bài luyện thay con | PO xác nhận: Parent Mode tách biệt với giao diện học của con |
| 6 | Xem kế hoạch học tập tiếp theo | Thấy định hướng mục tiêu + lộ trình gói học | |
| 7 | Nhận thông báo chủ động | Phụ huynh biết sự kiện (vào trễ, thiếu ảnh điểm danh...) mà không cần tự mở app | Kênh thông báo cụ thể — mức kỹ thuật, để `/generate-tech-docs` |
| 8 | Thoát Parent Mode | Quay lại tài khoản/màn học của con, không cần xác thực lại trong cùng phiên | |

### Màn hình & thành phần chính
| Màn hình | Thành phần chính | Hành động → kết quả nghiệp vụ |
|---|---|---|
| Cổng xác thực phụ huynh | Thử thách xác thực (đọc số — viết chữ) | Nhập đúng → vào Parent Mode; sai → thử lại không giới hạn |
| Parent Mode — Tổng quan | Ảnh check-in/out, tóm tắt điểm danh, tóm tắt tiến bộ | Bấm mục → xem chi tiết tương ứng |
| Báo cáo tiến bộ chi tiết | Tóm tắt văn bản, biểu đồ tổng quan kỹ năng (radar), nút CTA | Bấm CTA → hiển thị lời nhắc hành động cho phụ huynh |
| Kế hoạch học tập tiếp theo | Tóm tắt mục tiêu + lộ trình gói học | Chỉ xem, không có thao tác khác |

### Điểm ra (Exit Point)
Phụ huynh thoát Parent Mode, quay lại màn học của con; không cần xác thực lại trong cùng phiên đăng nhập (PO xác nhận giữ hành vi như demo cũ).

### Edge Cases / Luồng lỗi & ngoại lệ

✅ PO xác nhận trực tiếp:
1. Nhập sai thử thách xác thực → **không giới hạn** số lần thử lại.
2. Report buổi học chưa có (buổi chưa diễn ra / lỗi ghi nhận) → hiển thị **"chưa có báo cáo"**.
3. Report buổi học có cờ "thiếu ảnh điểm danh" → hiển thị **"con chưa điểm danh"** tại vị trí tương ứng.
4. Mastery Profile chưa khởi tạo/chưa đủ dữ liệu → hiển thị **"chưa đủ dữ liệu để đánh giá kết quả học tập của con, hãy khuyến khích con học thêm nhiều bài để hệ thống đánh giá kết quả"**.
5. Phụ huynh có nhiều con dùng chung tài khoản → **tạm hoãn**, không xử lý ở PRD này (xem Out of Scope).
6. Phụ huynh không dùng Zalo/không có smartphone → **để ngỏ**, phân tích thêm sau (xem Out of Scope).

---

## Phase 3: Nhật ký làm rõ (Clarification Log)

### Vòng 1 — PO chốt trực tiếp (2026-09-14)

| # | Nhóm | Câu hỏi | PO trả lời |
|---|---|---|---|
| 1 | Rule mâu thuẫn | "Tách riêng giao diện" (PO nhắc tới khi trả lời CTA) có mâu thuẫn với Phase 1 (cổng xác thực để vào Parent Mode **trong** tài khoản con) — Parent Mode vẫn nhúng trong tài khoản con (chỉ đổi tông màu) hay là điểm đến hoàn toàn riêng? | **Tạm thời phương án giao diện vẫn từ tài khoản học sinh → truy cập Parent Mode như cũ.** "Tách giao diện riêng" là định hướng đang cân nhắc, chưa phải quyết định cho ticket này. |
| 2 | Out-of-scope mơ hồ | Nếu hướng "tách riêng" được chọn sau này, AICNew-04 có bao gồm thiết kế tài khoản/đăng nhập riêng cho phụ huynh không? | Không — giữ nguyên phạm vi theo cổng gate hiện tại (cùng câu trả lời #1). |
| 3 | Edge case còn thiếu | Có luồng "lần đầu thiết lập" Parent Mode (khai báo số điện thoại, tạo mã riêng...) hay dùng cơ chế cố định có sẵn? | **Dùng chung cổng xác thực với học sinh** — không có luồng thiết lập riêng cho phụ huynh. |

### Mục chưa giải quyết
- None. *(Các mục "nhiều con dùng chung tài khoản" và "không dùng Zalo/không smartphone" — PO đã quyết định tạm hoãn/để ngỏ, ghi ở Out of Scope, không phải mục chưa giải quyết theo nghĩa chặn tiến độ.)*

✅ **CHECKPOINT 3: Không còn mục tồn đọng**

---

## Phase 4: Business Rules

> ✅ PO xác nhận trực tiếp 2026-09-14.

| Rule ID | Hành động/Trigger | Quy tắc | Điều kiện |
|---------|---------------------|---------------------|------------------------|
| BR-1 | Phụ huynh bấm lối vào Parent Mode (từ "Tài khoản" hoặc liên kết Zalo) | Hệ thống PHẢI yêu cầu qua cổng xác thực phụ huynh trước khi hiển thị bất kỳ nội dung Parent Mode nào | Áp dụng cho cả hai kênh vào |
| BR-2 | Qua cổng xác thực | PHẢI cho phụ huynh chọn 1 trong 2 phương thức: nhập mật khẩu phụ huynh (riêng, khác mật khẩu học sinh), hoặc nhận mã OTP qua SĐT/Zalo đã đăng ký. Vẫn dùng chung phiên đăng nhập của tài khoản học sinh để vào Parent Mode sau khi qua cổng (✏️ đổi 2026-09-14, thay cho thử thách "đọc số — viết chữ" ở bản gốc) | |
| BR-3 | Nhập sai mật khẩu phụ huynh | Hệ thống PHẢI cho thử lại, KHÔNG giới hạn số lần | |
| BR-11 | Chọn nhận mã OTP | PHẢI gửi mã tới đúng SĐT/Zalo đã đăng ký, cho phụ huynh nhập mã để xác thực (✏️ mới 2026-09-14) | ⚠️ Giới hạn/thời hạn mã, số lần thử sai, cơ chế gửi lại — chưa chốt, xem Phase 7 |
| BR-4 | Qua cổng xác thực thành công | Chuyển vào Parent Mode; PHẢI KHÔNG yêu cầu xác thực lại nếu phụ huynh thoát rồi vào lại trong cùng phiên đăng nhập | |
| BR-5 | Buổi học chưa diễn ra hoặc report buổi học lỗi ghi nhận | Parent Mode PHẢI hiển thị "chưa có báo cáo" | Thay vì báo cáo trống/gây hiểu lầm |
| BR-6 | Report buổi học có cờ "thiếu ảnh điểm danh" | Parent Mode PHẢI hiển thị "con chưa điểm danh" tại đúng vị trí (đầu hoặc cuối buổi) | |
| BR-7 | Mastery Profile chưa khởi tạo/chưa đủ dữ liệu | Parent Mode PHẢI hiển thị "chưa đủ dữ liệu để đánh giá kết quả học tập của con", kèm khuyến khích con học thêm bài để hệ thống có đủ dữ liệu đánh giá | KHÔNG hiển thị Mastery Map trống hoặc gây hiểu lầm |
| BR-8 | Hiển thị mỗi chỉ số trong báo cáo tiến bộ | PHẢI đi kèm một gợi ý hành động (CTA); CTA là lời nhắc để phụ huynh nhắc con, KHÔNG phải hành động phụ huynh tự làm thay con | |
| BR-9 | Có sự kiện cần thông báo (vào trễ, thiếu ảnh điểm danh, không đủ dữ liệu gán NLO, kết thúc buổi bổ trợ AI Tutor 30') | Hệ thống PHẢI gửi thông báo chủ động tới phụ huynh | Không yêu cầu phụ huynh tự mở Parent Mode mới biết |
| BR-10 | Hiển thị Kế hoạch học tập tiếp theo | PHẢI ở dạng tóm tắt mục tiêu + lộ trình gói học | KHÔNG liệt kê mã đơn vị kiến thức (NLO) chi tiết |
| BR-12 | Hiển thị màn Tổng quan (✏️ mới 2026-09-14) | PHẢI tổ chức thành 3 zone (Điểm danh / Tóm tắt tiến bộ / Gợi ý lộ trình học tập), mỗi zone có 1 CTA dẫn tới trang chi tiết tương ứng | |
| BR-13 | Phụ huynh bấm CTA "Xem lịch sử điểm danh" (✏️ mới 2026-09-14) | Màn Lịch sử điểm danh PHẢI liệt kê các buổi học gần đây kèm trạng thái điểm danh đầu/cuối buổi mỗi buổi | |
| BR-14 | Hiển thị zone Tóm tắt tiến bộ (✏️ mới 2026-09-14) | PHẢI so sánh kết quả hiện tại với buổi học gần nhất cho từng kỹ năng (tăng/giảm/không đổi) | ⚠️ Phụ thuộc dữ liệu snapshot theo từng buổi — chưa xác nhận, xem Phase 7 |

> **Note BR-9:** hành vi khi gửi thông báo **thất bại** (thử lại / bỏ qua / chỉ hiển thị lại khi phụ huynh tự mở Parent Mode) **chưa được PO chốt** — PO quyết định xử lý sau ở `/refine-prd` vì tài liệu này phục vụ bản demo, sẽ được phân tích bổ sung khi concept chính thức được chốt (xem Phase 7).
>
> **Note BR-2 (✏️ 2026-09-14):** Mật khẩu phụ huynh là thông tin xác thực riêng, cần một luồng **thiết lập lần đầu** — điều này **mâu thuẫn với câu trả lời đã chốt ở Phase 3, Vòng 1, #3** ("dùng chung cổng xác thực với học sinh, không có luồng thiết lập riêng"). Chưa giải quyết, xem Phase 7.

---

## Phase 5: Business Logic

> ✅ PO xác nhận trực tiếp 2026-09-14 (trừ nhánh lỗi của BR-9, xem Note BR-9 ở Phase 4).

| Rule ID | Logic nghiệp vụ (rẽ nhánh / công thức / điều kiện) | Thông báo/kết quả nghiệp vụ khi lỗi |
|---------|---------------------------------------------------|-------------------------------------|
| BR-1 | Dù vào từ kênh nào (menu "Tài khoản" hay liên kết Zalo), luôn chuyển hướng qua cổng xác thực trước, không có đường tắt bỏ qua | — |
| BR-2 | Hiển thị 2 tab chọn phương thức (Mật khẩu / OTP); vẫn dùng chung phiên đăng nhập của tài khoản học sinh để vào Parent Mode sau khi qua cổng | Chưa đăng nhập tài khoản học sinh → không cho vào Parent Mode, quay về màn đăng nhập học sinh trước |
| BR-3 | Nhập sai mật khẩu → cho nhập lại ngay, không đếm số lần, không khoá | "Mật khẩu chưa đúng, thử lại" |
| BR-11 | Chọn tab OTP → hiển thị 2 lựa chọn nơi nhận (SĐT/Zalo, che một phần số) → gửi mã tới nơi được chọn → cho nhập mã để xác thực | ❓ **[AI DRAFT]** thời hạn mã, số lần thử sai, cơ chế gửi lại mã — chưa có nguồn, xem Phase 7 |
| BR-4 | Giữ trạng thái "đã qua xác thực" trong suốt phiên đăng nhập của tài khoản học sinh | — |
| BR-5 | Report buổi học của buổi tương ứng không tồn tại hoặc bị đánh dấu lỗi ghi nhận → hiển thị trạng thái riêng cho đúng buổi đó, các buổi khác không bị ảnh hưởng | "Buổi học này chưa có báo cáo" |
| BR-6 | Report buổi học mang cờ "thiếu ảnh điểm danh" (đầu hoặc cuối buổi, theo `AICNew-01`) → thay vị trí ảnh bằng thông điệp, không chặn phần còn lại của báo cáo | "Con chưa điểm danh {đầu buổi/cuối buổi}" |
| BR-7 | Cờ "Mastery Profile chưa khởi tạo" hoặc chưa đủ dữ liệu (theo `AICNew-01`/`AICNew-02`) → thay toàn bộ khối Mastery Map bằng thông điệp khuyến khích, không hiển thị biểu đồ/số liệu rỗng | "Chưa đủ dữ liệu để đánh giá kết quả học tập của con — khuyến khích con học thêm bài để hệ thống có đủ dữ liệu đánh giá" |
| BR-8 | Với mỗi chỉ số đã có dữ liệu trong Mastery Map, xác định gợi ý hành động theo kỹ năng yếu nhất và gắn kèm ngay dưới chỉ số đó | Không xác định được gợi ý phù hợp → ẩn CTA cho chỉ số đó, không hiển thị CTA rỗng |
| BR-9 | Report buổi học/kết quả buổi bổ trợ ghi nhận một cờ sự kiện, hoặc buổi bổ trợ AI Tutor 30' kết thúc → kích hoạt gửi thông báo tới phụ huynh của học sinh đó | ❓ **[AI DRAFT] Q1 — chưa giải quyết:** nếu thông báo không gửi được — hệ thống thử gửi lại, bỏ qua, hay chỉ hiển thị lại khi phụ huynh tự mở Parent Mode lần sau? PO quyết định xử lý sau (xem Phase 7). |
| BR-10 | Kế hoạch học tập tiếp theo tổng hợp từ mục tiêu hiện tại + gói học đang theo, diễn đạt thành câu tóm tắt nghiệp vụ, không tham chiếu mã NLO | — |
| BR-12 | Với mỗi zone, gắn CTA dẫn đúng màn: Điểm danh → Lịch sử điểm danh; Tóm tắt tiến bộ → Báo cáo chi tiết; Gợi ý lộ trình → Kế hoạch học tập tiếp theo | — |
| BR-13 | Truy vấn danh sách report buổi học gần đây (nguồn `AICNew-01`) theo thứ tự buổi gần nhất trước, hiển thị trạng thái điểm danh mỗi buổi | Buổi thiếu ảnh điểm danh → áp dụng lại thông điệp của BR-6 |
| BR-14 | So sánh điểm/Mastery của buổi hiện tại với snapshot của buổi gần nhất trước đó cho từng kỹ năng, suy ra chiều hướng (tăng/giảm/không đổi) | ❓ **[AI DRAFT] Q8 — chưa giải quyết:** hệ thống có lưu snapshot điểm/Mastery theo từng buổi không, hay chỉ có trạng thái Mastery hiện tại (cộng dồn)? Cần xác nhận với `AICNew-01`/`AICNew-02`/nền tảng Adaptive Learning. |

---

## Phase 6: Acceptance Criteria

> ✅ PO xác nhận trực tiếp 2026-09-14.

| AC ID | Mô tả | Hành vi kỳ vọng | Bắt nguồn từ |
|-------|------------------------|---------------------------|--------------|
| AC-1 | Vào Parent Mode luôn qua cổng xác thực | Từ menu "Tài khoản" hoặc liên kết Zalo, hệ thống luôn hiển thị cổng xác thực trước khi cho xem nội dung Parent Mode | BR-1 |
| AC-2 | Cổng xác thực có 2 phương thức | Phụ huynh chọn nhập mật khẩu phụ huynh hoặc nhận OTP qua SĐT/Zalo | BR-2 |
| AC-3 | Nhập sai mật khẩu được thử lại không giới hạn | Nhập sai → hiển thị thông báo lỗi và cho nhập lại ngay, không khoá | BR-3 |
| AC-12 | Chọn OTP → gửi đúng nơi đã chọn | Hiển thị 2 lựa chọn SĐT/Zalo (che một phần số), gửi mã, cho nhập mã để xác thực | BR-11 |
| AC-4 | Không yêu cầu xác thực lại trong cùng phiên | Thoát rồi vào lại Parent Mode trong cùng phiên đăng nhập → không hiện lại cổng xác thực | BR-4 |
| AC-5 | Buổi học chưa có report → hiển thị đúng trạng thái | Buổi chưa diễn ra/lỗi ghi nhận → hiển thị "Buổi học này chưa có báo cáo" thay vì trống/sai | BR-5 |
| AC-6 | Thiếu ảnh điểm danh → hiển thị đúng thông điệp | Vị trí ảnh thiếu hiển thị "Con chưa điểm danh {đầu buổi/cuối buổi}"; phần còn lại của báo cáo vẫn hiển thị bình thường | BR-6 |
| AC-7 | Mastery Profile chưa đủ dữ liệu → hiển thị thông điệp khuyến khích | Chưa khởi tạo/chưa đủ dữ liệu → hiển thị thông điệp khuyến khích học thêm, không hiện biểu đồ/số liệu trống | BR-7 |
| AC-8 | Mỗi chỉ số có dữ liệu đi kèm gợi ý hành động | Chỉ số có dữ liệu → hiện CTA tương ứng kỹ năng yếu nhất; chỉ số không xác định được gợi ý → không hiện CTA rỗng | BR-8 |
| AC-9 | Sự kiện quan trọng kích hoạt thông báo chủ động | Có cờ vào trễ/thiếu ảnh điểm danh/không đủ dữ liệu gán NLO, hoặc kết thúc buổi bổ trợ AI Tutor 30' → phụ huynh nhận thông báo mà không cần tự mở Parent Mode | BR-9 |
| AC-10 | Kế hoạch học tập tiếp theo ở dạng tóm tắt nghiệp vụ | Màn hiển thị tóm tắt mục tiêu + lộ trình, không hiện mã NLO | BR-10 |
| AC-11 | Trải nghiệm tổng thể đúng User Story | Qua cổng xác thực → phụ huynh thấy điểm danh, tóm tắt tiến bộ, CTA, kế hoạch tiếp theo trong một luồng liền mạch, không cần tự đánh giá | BR-1…BR-10 |
| AC-13 | Màn Tổng quan có đúng 3 zone + CTA | Mỗi zone (Điểm danh/Tóm tắt tiến bộ/Gợi ý lộ trình) có 1 CTA dẫn đúng màn chi tiết tương ứng | BR-12 |
| AC-14 | Lịch sử điểm danh liệt kê đúng | Danh sách buổi gần đây, mỗi dòng có trạng thái điểm danh đầu/cuối buổi | BR-13 |
| AC-15 | Zone Tóm tắt tiến bộ có so sánh | Mỗi kỹ năng hiển thị chiều hướng thay đổi so với buổi gần nhất | BR-14 |

---

## Phase 7: Báo cáo kiểm chứng (Validation Report)

### Ma trận độ phủ (Coverage Matrix)
| Hành động Flow | Có Rule? | Có Logic? | Có AC? | Status |
|---|---|---|---|---|
| 1. Mở lối vào Parent Mode | ✅ BR-1 | ✅ | ✅ AC-1 | OK |
| 2. Qua cổng xác thực (Mật khẩu) | ✅ BR-2,3,4 | ✅ | ✅ AC-2,3,4 | OK |
| 2b. Qua cổng xác thực (OTP) | ✅ BR-11 | ⚠️ một phần | ✅ AC-12 | GAP — thời hạn/số lần/gửi lại mã chưa chốt |
| 3. Xem tổng quan điểm danh | ✅ BR-5,6 | ✅ | ✅ AC-5,6 | OK |
| 4. Xem báo cáo tiến bộ chi tiết | ✅ BR-7 | ✅ | ✅ AC-7 | OK |
| 5. Bấm CTA hành động | ✅ BR-8 | ✅ | ✅ AC-8 | OK |
| 6. Xem kế hoạch học tập tiếp theo | ✅ BR-10 | ✅ | ✅ AC-10 | OK |
| 7. Nhận thông báo chủ động | ✅ BR-9 | ⚠️ một phần | ✅ AC-9 | GAP — nhánh lỗi gửi thất bại chưa chốt |
| 8. Thoát Parent Mode | ✅ BR-4 | ✅ | ✅ AC-4 | OK |
| 9. Zone + CTA trên Tổng quan (✏️ mới) | ✅ BR-12 | ✅ | ✅ AC-13 | OK |
| 10. Xem lịch sử điểm danh (✏️ mới) | ✅ BR-13 | ✅ | ✅ AC-14 | OK |
| 11. So sánh tiến bộ với buổi gần nhất (✏️ mới) | ✅ BR-14 | ⚠️ một phần | ✅ AC-15 | GAP — phụ thuộc dữ liệu snapshot theo buổi chưa xác nhận |

### Xung đột phát hiện
- Xung đột "tách giao diện riêng" vs "cổng xác thực trong tài khoản con" (Phase 3, Vòng 1, #1) — **đã giải quyết**: PO chốt giữ nguyên phương án nhúng trong tài khoản học sinh; "tách riêng" là định hướng tương lai, không áp dụng cho ticket này.

### Mục còn thiếu
- **BR-9 (GAP)**: hành vi khi gửi thông báo thất bại — PO quyết định xử lý sau (`Q1 — [AI DRAFT]`), vì tài liệu này phục vụ bản demo, sẽ được phân tích bổ sung khi concept chính thức được chốt.
- **BR-2 (GAP mới, ✏️ 2026-09-14)**: mật khẩu phụ huynh cần luồng thiết lập lần đầu, mâu thuẫn với quyết định trước đó (Phase 3, Vòng 1, #3) rằng không có luồng thiết lập riêng — PO cần chốt luồng thiết lập ở đâu/khi nào, và có bắt buộc hay có thể chỉ dùng OTP.
- **BR-11 (GAP mới, ✏️ 2026-09-14)**: thời hạn hiệu lực mã OTP, số lần nhập sai tối đa, cơ chế/thời gian chờ gửi lại mã — chưa có nguồn, chưa chốt.
- **BR-14 (GAP mới, ✏️ 2026-09-14, Q8)**: so sánh tiến bộ với buổi gần nhất cần dữ liệu snapshot điểm/Mastery theo từng buổi — chưa xác nhận `AICNew-01`/`AICNew-02`/nền tảng Adaptive Learning có lưu dữ liệu này không.
- Chính sách lưu trữ/bảo mật ảnh học sinh (check-in/out) — chưa có, phụ thuộc Pháp lý (§1c).
- Phụ huynh nhiều con dùng chung tài khoản — PO tạm hoãn (Out of Scope).
- Phụ huynh không dùng Zalo/không có smartphone — PO để ngỏ (Out of Scope).
- Định hướng "Parent Mode tách giao diện riêng" — ghi nhận là định hướng tương lai, chưa phải quyết định; cần theo dõi vì có thể ảnh hưởng lớn tới kiến trúc PRD khi được chốt chính thức.

> Các mục này được mang nguyên sang PRD dưới dạng "Giả định AI" / câu hỏi `[AI DRAFT]` ở Appendix, theo đúng quy tắc của `/generate-prd` khi Phase 7 còn mục chưa giải quyết — **không** tự bịa thêm để lấp đầy coverage.

---

<!--
  NEXT STEPS:
  Khi PO đã review Product Definition này, chạy:
  /generate-prd 00_context/AICNew-04-parent-mode.md
  để sinh PRD từ Product Definition này.
-->

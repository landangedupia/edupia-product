# Prompt dựng Demo — Big Class Plus / Edupia AI Class Plus

> Dùng chung được cho cả **Google AI Studio** và **Figma Make** — nội dung prompt không phụ
> thuộc công cụ. Xem mục "Lưu ý riêng khi dùng Figma Make" ở cuối file.
>
> Copy toàn bộ phần trong khối code bên dưới, dán vào công cụ bạn chọn.
> Đính kèm 5 ảnh tham chiếu cùng lúc (đã tải sẵn trong thư mục `references/`):
> - `design-system-ref-lich-hoc.png` — **Màn 0: Lịch học** (điểm vào flow)
> - `screen1-lop-hoc-live.png` — **Màn 1: Lớp học live** (mặc định, chưa có câu hỏi)
> - `screen-mcq-question.png` — Màn 1, state câu hỏi trắc nghiệm (MCQ)
> - `screen-ispeak-question.png` — Màn 1, state câu hỏi luyện nói (iSpeak)
> - `screen2-tong-ket-buoi-hoc.png` — **Màn 2: Tổng kết buổi học**
>
> **Đính kèm thêm 2 ảnh bạn vừa chụp/paste từ Figma cá nhân** (tôi chưa lưu được vào
> `references/` vì đây là ảnh dán trực tiếp trong chat, không phải file — bạn tự lưu lại và
> đính kèm cùng lúc):
> - Ảnh màn "Thử nói lại lần nữa" (state thất bại của Kiểm tra mic, có linh vật Gà Pea)
> - Ảnh màn "Điểm danh thành công" (video preview + tin nhắn thoại "Cô Hà Tú")
>
> Lưu ý: **Bài tập nhóm** và **AI Speak (hội thoại)** chưa có ảnh chụp — chỉ có mô tả bằng lời
> ở dưới. Nói rõ với AI Studio/Figma Make là 2 phần này dựng theo mô tả text, giữ đúng tinh
> thần design system chung (màu/font/bo góc) từ các ảnh đã đính kèm.

---

```
Bạn là một frontend engineer. Hãy dựng một WEB APP DEMO tương tác (không cần backend thật,
dùng mock data/script cố định) mô phỏng TRỌN VẸN MỘT LƯỢT trải nghiệm học của "Big Class Plus"
— sản phẩm học tiếng Anh online Edupia AI Class. Đây là bản demo dùng để khảo sát cảm nhận
phụ huynh — ưu tiên ĐÚNG THỊ GIÁC (màu sắc, bố cục, typography, component) và ĐÚNG TRÌNH TỰ
FLOW hơn là logic nghiệp vụ đầy đủ.

═══════════════════════════════════════════════════════════════
YÊU CẦU QUAN TRỌNG NHẤT — GIỮ ĐÚNG DESIGN SYSTEM HIỆN CÓ
═══════════════════════════════════════════════════════════════
Tôi đính kèm 5 ảnh chụp từ Figma thật của sản phẩm (2 màn chưa có ảnh sẽ mô tả bằng lời,
xem phần "BÀI TẬP NHÓM" và "AI SPEAK" bên dưới). HÃY BÁM SÁT PIXEL-LEVEL vào các ảnh này:
bố cục, khoảng cách, bo góc, màu sắc, kiểu chữ, icon, shadow. KHÔNG tự sáng tạo lại UI theo
phong cách khác. Với 2 phần không có ảnh, suy luận hợp lý dựa trên phần còn lại của hệ thống
thiết kế đã thấy trong các ảnh, KHÔNG bịa ra một style hoàn toàn khác.

Design tokens chính xác cần dùng (không xấp xỉ):
- Màu chính (Primary/500): #0876B1
- Màu nhấn nhạt (Primary/50): #ECFBFF · (Primary/100): #C6EDFB
- Màu cảnh báo (Warning/500): #F5B30B · (Warning/100 nền badge): #FEF2C7
- Neutral/900 (heading): #111827 · Neutral/700 (text chính): #374151
- Neutral/500 (text phụ): #6B7280 · Neutral/100 (nền nhạt): #F3F4F6 · Neutral/50: #F9FAFB
- Trắng: #FFFFFF
- Font: Poppins (Medium/SemiBold/Regular tuỳ chỗ, xem ảnh) — nếu không load được Poppins,
  dùng font sans-serif tròn trịa gần giống (vd Inter/Nunito) làm fallback
- Heading màn hình: 24px/32px, Medium, letter-spacing âm nhẹ (~-2%)
- Bo góc chuẩn: 16-20px cho card lớn, 8-12px cho badge/button nhỏ
- Shadow card: đổ bóng mềm, nhẹ (không đổ bóng gắt/cứng)

═══════════════════════════════════════════════════════════════
BỐI CẢNH SẢN PHẨM
═══════════════════════════════════════════════════════════════
Big Class Plus là buổi học nhóm trực tuyến, 2 buổi/tuần, bám chương trình SGK Global Success.
Mỗi buổi: phát video bài giảng của giáo viên (gọi là "GV Star" — video quay sẵn, KHÔNG phải
giáo viên dạy live), có AI Voice chào tên/khích lệ/động viên học sinh, có 4 DẠNG câu hỏi
tương tác xen giữa bài giảng, và kết thúc bằng màn tổng kết nhận xét kết quả học tập.

Ngoài buổi học chính, demo này còn mô phỏng thêm 2 thành phần khác của sản phẩm (Concept 1.2 —
Edupia AI Class Plus):
- **AI Tutor**: ngay sau mỗi buổi Big Class Plus, học sinh nào cũng được kèm riêng 30 phút
  1-1 với gia sư AI — phân theo chân dung năng lực (khá giỏi được nâng cao/mở rộng, trung
  bình/yếu được vá lỗ hổng vừa phát hiện), kết thúc bằng nhận xét + giao bài tập về nhà.
- **Parent Mode**: chế độ dành riêng cho phụ huynh, truy cập qua mục "Tài khoản" sau khi qua
  một cổng xác thực đơn giản — cho phép xem tiến bộ học tập của con (Mastery Map) và lịch sử
  điểm danh các buổi học.

═══════════════════════════════════════════════════════════════
TOÀN BỘ FLOW CẦN DỰNG (theo đúng thứ tự — đây là yêu cầu quan trọng nhất)
═══════════════════════════════════════════════════════════════

  Màn 0: Lịch học
      │  (bấm vào 1 buổi học trong danh sách)
      │                                    ⇢ (nhánh phụ, không bắt buộc theo thứ tự) Bấm
      │                                       "Tài khoản" → "Chế độ dành cho phụ huynh" →
      │                                       Cổng xác thực phụ huynh → Màn Parent Mode
      │                                       (xem mục riêng cuối phần Màn 0)
      ▼
  Chuyển cảnh: "Truy cập buổi học" (loading ngắn)
      │
      ▼
  Màn Kiểm tra thiết bị (2 bước: Kiểm tra mic → Kiểm tra camera)
      │
      ▼
  Màn Điểm danh ĐẦU buổi (video preview + lời chào AI Voice, có nút "Vào lớp học ngay")
      │
      ▼
  Màn 1: Lớp học live — Xem bài giảng
      │  (video phát vài giây, rồi lần lượt xen 4 dạng câu hỏi)
      ├─ Câu hỏi 1: Trắc nghiệm (MCQ)
      ├─ Câu hỏi 2: Luyện nói đơn (iSpeak)
      ├─ Câu hỏi 3: Bài tập nhóm (nhiều pha)
      ├─ Câu hỏi 4: Luyện nói hội thoại (AI Speak)
      │  (bấm nút demo "Kết thúc buổi học")
      ▼
  Màn Điểm danh CUỐI buổi (video preview + lời chào tạm biệt AI Voice)
      ▼
  Màn 2: Nhận xét / Tổng kết buổi học
      │  (bấm nút demo "Bắt đầu 30 phút cùng Gia sư AI")
      ▼
  Màn 3: AI Tutor — Kèm riêng 30 phút (hội thoại 1-1 với gia sư AI, phân theo chân dung năng lực)
      │  (bấm nút demo "Kết thúc phiên Gia sư AI")
      ▼
  Hoàn tất demo (hiện màn cảm ơn ngắn hoặc quay lại Màn 0)

── MÀN 0: LỊCH HỌC (xem design-system-ref-lich-hoc.png) ──

Layout: sidebar trái cố định (logo "AI Class", menu: Nhà trường / AI Practise / AI Speak /
Tài khoản), vùng nội dung chính bên phải gồm: header trên cùng (điểm thưởng, chuông thông
báo, avatar + "Hi, [Tên]"), tiêu đề "Lịch học" + bộ lọc tuần học, danh sách card buổi học
(mỗi card: avatar giáo viên, "Buổi N - Thứ X", khung giờ học, đếm ngược thời gian còn lại,
tên bài học, 3 icon phụ Tài liệu/Nhận xét/Video), khối "Bài tập phải làm" phía dưới, banner
"Nhiệm vụ bắt buộc" bên phải.

Hành vi: card buổi học SẮP đến giờ hiển thị đếm ngược; khi đến trước giờ học 5 phút, card đó
đổi nút thành "Vào học" màu Primary — bấm vào đó để bắt đầu flow (mock: không cần chờ đếm
ngược thật, cho phép bấm "Vào học" ngay để demo nhanh).

⚠️ Mục "Tài khoản" trong sidebar trái CHƯA có ảnh Figma tham chiếu cho bản demo này — tôi sẽ
gửi bổ sung ảnh giao diện thật của mục này sau. Trong lúc chưa có ảnh, cứ dựng một trang
"Tài khoản" đơn giản (avatar, tên, vài mục cài đặt placeholder) theo đúng tinh thần design
system chung, miễn có đủ 1 mục quan trọng sau:

── NHÁNH PHỤ: "TÀI KHOẢN" → CHẾ ĐỘ DÀNH CHO PHỤ HUYNH ──
Trong trang "Tài khoản", thêm một mục/nút riêng biệt, nổi bật: **"Chế độ dành cho phụ huynh"**
(icon khoá hoặc icon phụ huynh, tách biệt khỏi các mục cài đặt của học sinh). Bấm vào đó →
hiện CỔNG XÁC THỰC PHỤ HUYNH (dạng "parental gate" — ngăn trẻ nhỏ tự bấm vào được):
- Hiện một dãy 3-4 chữ số dưới dạng CHỮ VIẾT (vd "Bốn — Bảy — Hai"), không hiện số thật
- Một ô input số bên dưới + bàn phím số ảo (hoặc input thường), nút "Xác nhận"
- Phụ huynh phải tự đọc chữ và gõ đúng dãy số tương ứng (vd gõ "472") mới qua được
- Nhập sai → rung nhẹ ô input + thông báo đỏ ngắn "Chưa đúng, thử lại"; demo: sau 1 lần nhập
  sai, tự động cho qua ở lần nhập tiếp theo (bất kỳ số nào) để tránh kẹt flow demo
- Qua cổng → chuyển sang MÀN PARENT MODE

── MÀN PARENT MODE (KHÔNG có ảnh — dựng theo mô tả, giữ đúng tông màu/component chung) ──
Layout: vẫn giữ sidebar trái nhưng đổi nhãn để phân biệt rõ đang ở chế độ phụ huynh (vd thêm
badge nhỏ "Chế độ phụ huynh" cạnh logo, đổi tông màu nhấn nhẹ sang Neutral để không lẫn với
giao diện học sinh). Nội dung chính gồm:
- **Mastery Map**: bảng/thẻ hiển thị tiến bộ học tập của con theo từng đơn vị kiến thức
  (NLO), dùng ngôn ngữ dễ hiểu thay vì thuật ngữ kỹ thuật — mock 4-5 dòng kiến thức, mỗi dòng
  có nhãn mức độ dạng "Con đang ở mức HIỂU (chưa tới VẬN DỤNG)" kèm thanh tiến trình màu theo
  mức độ (Primary/Warning/Neutral tuỳ mức)
- **Lịch sử điểm danh**: danh sách các buổi học gần đây, mỗi dòng có tên buổi, ngày giờ, và 2
  badge nhỏ "✓ Điểm danh đầu buổi" / "✓ Điểm danh cuối buổi" (mock dữ liệu cố định vài buổi)
- Nút "Quay lại" ở góc màn để thoát Parent Mode, trở về trang "Tài khoản" ban đầu (không cần
  xác thực lại)

── CHUYỂN CẢNH: TRUY CẬP BUỔI HỌC ──
Sau khi bấm "Vào học" → hiện màn loading ngắn (~1-2s, spinner + text "Đang vào lớp học...").

── MÀN KIỂM TRA THIẾT BỊ (2 bước) ──
Layout: card trắng bo góc lớn, căn giữa nền có hoạ tiết nhạt (pattern các icon học tập mờ).
Góc trên trái: step indicator ngang gồm 2 mốc tròn nối bằng đường kẻ — mốc 1 "Kiểm tra mic",
mốc 2 "Kiểm tra camera" (mốc đang active tô đặc màu Primary có số trắng, mốc chưa tới là
vòng tròn viền, số màu Neutral). Góc trên phải: nút pill viền xanh "🎧 Liên hệ hỗ trợ", hiện
tooltip nhỏ khi hover/mặc định vài giây đầu: "Mẹ và bé cần Trợ lý kỹ thuật giúp một tay không?"

  Bước 1 — Kiểm tra mic:
  Tiêu đề lớn kèm icon trạng thái + text: mặc định "🎤 Nói thử xem nào" (icon mic màu Primary).
  Dưới tiêu đề: câu hướng dẫn ngắn, và một ô/thẻ nền xám nhạt hiển thị TO, ĐẬM một từ mẫu để
  đọc (vd "Hello"). Bên dưới: linh vật hoạt hình (gà con "Gà Pea") — trạng thái mặc định đang
  chờ lắng nghe (mắt mở, tư thế tỉnh táo).
  Học sinh bấm nút mic (hoặc tự demo bằng nút "Giả lập nói") → mock kết quả luân phiên demo
  (không cần nhận diện giọng nói thật):
    - THÀNH CÔNG (tình huống chính): icon đổi thành ✅ xanh lá, tiêu đề đổi "Tuyệt vời!" hoặc
      tương tự, Gà Pea chuyển sang dáng vui vẻ/nhảy múa → tự động chuyển sang Bước 2 sau ~1s
    - THẤT BẠI (case demo phụ, để minh hoạ, có thể bỏ qua nếu không đủ thời gian): icon đổi
      thành ❌ đỏ, tiêu đề đổi "Thử nói lại lần nữa", câu phụ "Gà Pea chưa nghe rõ! Bé ghé sát
      micro và đọc thật to lại nhé!", Gà Pea chuyển dáng ngủ gật (zzz). Hai nút bên dưới: nút
      chính (fill Primary) "Thử lại lần nữa", nút phụ (outline) "Vào học mà không có mic" (bỏ
      qua kiểm tra, đi thẳng sang Bước 2).

  Bước 2 — Kiểm tra camera:
  Layout tương tự Bước 1 (đổi mốc 2 thành active), nội dung đổi thành kiểm tra hình ảnh từ
  camera thay vì giọng nói (vd tiêu đề "Cười lên nào 📸", hướng dẫn học sinh nhìn vào camera).
  Cùng 2 nhánh kết quả THÀNH CÔNG/THẤT BẠI theo đúng pattern Bước 1 (nút phụ đổi thành "Vào
  học mà không có camera"). THÀNH CÔNG → chuyển sang Màn Điểm danh đầu buổi.

── MÀN ĐIỂM DANH ĐẦU BUỔI ──
Layout: cùng card trắng bo góc + nền hoạ tiết như Màn Kiểm tra thiết bị (bỏ step indicator vì
đã qua bước đó), giữ nút "🎧 Liên hệ hỗ trợ" góc trên. Icon ✅ xanh lá + tiêu đề "Điểm danh
thành công". Bên dưới: khung video call lớn, bo góc, viền Primary — hiển thị camera preview
(placeholder: nền tối trơn hoặc ảnh/emoji khuôn mặt học sinh, KHÔNG cần webcam thật). Dưới
khung video: một khối tin nhắn thoại dạng "audio message" — icon loa nhỏ bên trái + text lời
thoại của giáo viên AI bên trong khung bo góc nhạt màu, dạng: `🔊 Cô Hà Tú: "Chào [Tên] nhé!
Chào mừng con đã vào lớp đúng giờ! Cô Hà Tú rất vui được gặp con hôm nay!"` (tên học sinh lấy
từ mock user đang đăng nhập). Dưới cùng: nút lớn fill Primary "Vào lớp học ngay" — bấm để
chuyển sang Màn 1 (KHÔNG tự động chuyển, phải bấm nút).

⚠️ Học sinh vào TRỄ (case demo phụ, có thể bỏ qua nếu không đủ thời gian): bỏ qua toàn bộ
Màn Kiểm tra thiết bị + Màn Điểm danh đầu buổi (BR2) — chuyển thẳng vào Màn 1 kèm badge nhỏ
"Vào lớp trễ".

── MÀN 1: LỚP HỌC LIVE (xem screen1-lop-hoc-live.png cho trạng thái mặc định) ──

Layout: toàn màn (fullscreen), không có sidebar chính.
- Vùng trung tâm: video giáo viên đang giảng (dùng placeholder video hoặc ảnh tĩnh + badge
  "● LIVE" giả lập), camera các nhóm học sinh nhỏ xếp quanh (dùng avatar/ảnh placeholder)
- Panel bên phải: "Bảng thông tin lớp học" có 2 tab: "Thảo luận lớp" (chat chung) / "Chat 1-1
  với trợ giảng" (có chấm đỏ báo tin chưa đọc) — có thể thu gọn/mở rộng
- Thanh điều khiển cố định đáy màn hình: nút mic, nút thả reaction/emoji (giữ 1s hiện bảng
  emoji) — đây cũng là nơi các dạng câu hỏi bên dưới sẽ "mọc" ra khi giáo viên mở câu hỏi
- Nút thoát lớp: ẩn mặc định, hiện khi bấm vào màn hình, tự ẩn sau 3 giây

Kịch bản trong Màn 1 (script cố định, tự động chạy tuần tự, có nút "Bỏ qua/Tiếp theo" ở góc
để tua nhanh cho mục đích demo):

  Bước 1 — Xem bài giảng: video phát vài giây, AI Voice hiện text toast "Chào [Tên]! Chúc con
  buổi học vui vẻ" (giả lập, không cần TTS thật).

  Bước 2 — CÂU HỎI 1: Trắc nghiệm (MCQ) — xem screen-mcq-question.png
  Bộ 4 đáp án A/B/C/D hiện ngay TRÊN thanh điều khiển đáy màn (không phải popup/overlay
  riêng). Chọn 1 đáp án → đáp án sáng lên (viền/nền Primary), 3 đáp án còn lại đổ màu xám,
  nút "Nộp bài" mở khoá. Sau khi nộp → hiện kết quả, kèm câu AI Voice khích lệ/động viên
  (toast text, giống kiểu toast chào tên ở Bước 1, câu thoại đổi ngẫu nhiên trong 2-3 mẫu
  cố định mỗi loại):
    - Đúng: badge/toast xanh dương "Chính xác!" + câu AI Voice khích lệ (vd "Giỏi quá!",
      "Con làm tốt lắm!")
    - Sai: badge/toast "Chưa chính xác" + câu AI Voice động viên nhẹ nhàng, không chê bai
      (vd "Không sao, cố lên câu sau nhé!")
  Sau kết quả, tự động quay lại video bài giảng vài giây rồi chuyển Bước 3.

  Bước 3 — CÂU HỎI 2: Luyện nói đơn (iSpeak) — xem screen-ispeak-question.png
  Icon mic tự động active khi vào câu hỏi, học sinh bấm để giả lập ghi âm (animation sóng
  lan toả quanh icon mic), bấm lại để dừng → hiện kết quả dạng thang điểm: "Đạt 75%" /
  "Đạt 50%" / "Đạt 25%" / "Không đạt" (mỗi mức có màu badge khác nhau, tông ấm/lạnh theo
  mức độ tốt-xấu), kèm câu AI Voice khích lệ/động viên tương ứng mức điểm (vd 75%: "Phát âm
  tốt lắm!"; 50-25%: "Khá hơn rồi đó, cố thêm chút nữa!"; Không đạt: "Không sao, luyện thêm
  chút xíu là được!"). Sau kết quả, quay lại video rồi chuyển Bước 4.

  Bước 4 — CÂU HỎI 3: Bài tập nhóm (KHÔNG có ảnh — dựng theo mô tả, giữ đúng tông màu/
  component của các ảnh khác) — luồng nhiều pha:
    a. Nhân vật hướng dẫn hoạt hình (mascot vui nhộn) xuất hiện góc màn, nhắc luật ngắn gọn
       trong ~3s (rút gọn từ 10s thật để demo nhanh), có nút "Sẵn sàng" → bấm xong đổi thành
       "Đã sẵn sàng" kèm đếm ngược nhỏ
    b. Pha "Thảo luận nhóm": khung chat bên phải tự chuyển thành "Thảo luận nhóm" (khoá, học
       sinh không gửi tin nhắn được), đếm ngược rút gọn còn ~5s (thay vì 90s thật)
    c. Pha "Điền đáp án": hiện các ô nhập màu xanh để bấm chọn/điền, đếm ngược rút gọn ~5s
       (thay vì 60s thật)
    d. Kết quả: hiển thị điểm nhóm (mock: điểm nhóm = trung bình điểm 4 thành viên demo)
       kèm câu AI Voice khích lệ/động viên theo mức điểm nhóm (điểm cao → khen cả nhóm;
       điểm thấp → động viên nhẹ nhàng, không chê bai)
    Sau kết quả, quay lại video rồi chuyển Bước 5.

  Bước 5 — CÂU HỎI 4: Luyện nói hội thoại AI Speak (KHÔNG có ảnh — dựng theo mô tả):
    a. Nhân vật hướng dẫn giới thiệu ngắn: tình huống + mục tiêu bài học (~3s, rút gọn),
       giao vai cho học sinh lượt 1
    b. Chuyển sang giao diện "Trò chuyện với AI": khung chat hiển thị lời thoại AI, học sinh
       bấm mic để "trả lời" (giả lập, không cần nhận diện giọng nói thật) hoặc gõ chữ, có nút
       xem gợi ý câu trả lời
    c. Khi AI "đang nói/phản hồi", bộ điều khiển tạm khoá (giảm opacity, không bấm được) —
       giả lập bằng delay ngắn ~1-2s kèm animation 3 chấm nháy
    d. Sau 2 lượt hội thoại ngắn (mock, câu thoại cố định sẵn) → hiện màn "Nhận xét" ngắn
       theo tình huống vừa luyện (vd "Nhận xét: Đến cửa hàng sách"), nội dung nhận xét cũng
       là câu khích lệ/động viên theo mức độ hoàn thành hội thoại (không chỉ mô tả tình huống)
    Sau đó, hiện nút demo "Kết thúc buổi học" nổi bật ở giữa màn.

  Bước 6 — Bấm "Kết thúc buổi học" → chuyển sang Màn 2.

── MÀN 2: NHẬN XÉT / TỔNG KẾT BUỔI HỌC (xem screen2-tong-ket-buoi-hoc.png) ──

Layout: khối nội dung căn giữa màn hình gồm 2 phần cạnh nhau — hình minh hoạ/nhân vật bên
trái (ảnh placeholder vui nhộn, phong cách hoạt hình trẻ em), khối kết quả bên phải.
Khối kết quả lặp lại theo từng kỹ năng đã luyện trong buổi (map đúng theo 4 câu hỏi vừa làm
ở Màn 1, ví dụ: "TRẮC NGHIỆM: X/10", "PHÁT ÂM: X/10", "BÀI TẬP NHÓM: X/10", "HỘI THOẠI: X/10"),
MỖI kỹ năng có:
  - Điểm số dạng "X/10" (heading lớn, đậm) — TÍNH TỪ kết quả học sinh vừa chọn/thao tác ở
    từng câu hỏi tương ứng tại Màn 1 (mock logic đơn giản: đúng/đạt cao → điểm cao)
  - Một câu nhận xét ngắn, giọng điệu thay đổi theo mức điểm:
      8-10 điểm → câu khen ngợi nhiệt tình (vd "Đỉnh cao trí tuệ luôn!", "Sắp thành siêu sao rồi!")
      5-7 điểm  → câu khích lệ tích cực (vd "Tớ thấy cậu có tố chất, đừng dừng lại nhé!")
      0-4 điểm  → câu động viên nhẹ nhàng, không chê bai (vd "Cố gắng lần sau nhé, tớ tin
                  cậu làm được!")

TRƯỚC KHI vào Màn 2, chèn thêm MÀN ĐIỂM DANH CUỐI BUỔI — giữ NGUYÊN layout của Màn Điểm danh
đầu buổi (card trắng, icon ✅ "Điểm danh thành công", khung video preview, khối tin nhắn thoại
"🔊 Cô Hà Tú: ...", nút lớn Primary) nhưng KHÔNG đi qua lại bước Kiểm tra thiết bị (đã xác
nhận từ đầu buổi), và đổi nội dung phù hợp lúc kết thúc: tiêu đề có thể giữ "Điểm danh thành
công", câu thoại đổi thành lời tạm biệt/khen ngợi, vd `🔊 Cô Hà Tú: "Con đã học rất chăm chỉ
hôm nay! Cô Hà Tú rất tự hào về con, hẹn gặp lại ở buổi sau nhé!"`, nút đổi thành "Xem kết quả
buổi học" → bấm để chuyển sang Màn 2. Sau đó tại Màn 2, vẫn giữ thêm badge/dòng nhỏ "✓ Đã điểm
danh đủ buổi học" như một xác nhận tổng kết (mock: demo luôn coi học sinh ở lại tới hết buổi
nên luôn đi qua bước điểm danh cuối buổi này — không cần dựng nhánh thoát sớm cho bản demo).

Cuối Màn 2, dưới khối kết quả theo kỹ năng, thêm nút CTA nổi bật "Bắt đầu 30 phút cùng Gia sư
AI" (màu Primary, cỡ lớn) → chuyển sang Màn 3.

── MÀN 3: AI TUTOR — KÈM RIÊNG 30 PHÚT (KHÔNG có ảnh — dựng theo mô tả, giữ đúng tông màu/
component chung; đây là hội thoại 1-1 mock ĐẦY ĐỦ, không phải màn giới thiệu rút gọn) ──

Layout: giao diện dạng "phòng học 1-1" khác Màn 1 — bỏ camera nhóm học sinh (vì giờ chỉ có 1
học sinh + AI), giữ tinh thần fullscreen + bo góc/shadow/token như các màn khác. Trung tâm là
khung chat/hội thoại lớn (giống pattern khung chat đã dùng ở AI Speak Bước 5), avatar "Gia sư
AI" (mascot hoặc icon robot thân thiện) ở đầu mỗi lượt thoại AI, avatar học sinh ở lượt học
sinh. Thanh dưới cùng: ô nhập chat + icon mic + nút gợi ý câu trả lời (tái dùng đúng component
đã mô tả ở AI Speak).

Kịch bản Màn 3 (script cố định, tự động chạy tuần tự, có nút "Bỏ qua/Tiếp theo" để tua nhanh):

  a. Màn chờ ngắn (~1-2s): "Đang chuẩn bị nội dung riêng cho con..." — mock việc hệ thống
     phân luồng theo chân dung năng lực dựa trên điểm Màn 2 vừa xong: NẾU điểm trung bình 4
     kỹ năng ở Màn 2 ≥ 7/10 → luồng "Nâng cao — Mở rộng kiến thức"; NẾU < 7/10 → luồng
     "Củng cố — Vá lỗ hổng" (mock logic đơn giản, hiện rõ badge nhỏ cho biết đang ở luồng nào,
     vd "🌟 Nâng cao & Mở rộng" hoặc "🔧 Củng cố kiến thức").

  b. Gia sư AI mở lời chào theo đúng luồng đã chọn ở bước a (2 bộ câu thoại cố định khác nhau
     cho 2 luồng, vd luồng Nâng cao: "Con làm rất tốt buổi vừa rồi! Giờ mình học thêm phần
     nâng cao nhé"; luồng Củng cố: "Buổi vừa rồi có vài chỗ mình cần ôn lại thêm, cùng làm cho
     chắc nhé"), rồi đặt 1 câu hỏi/bài tập ngắn liên quan.

  c. Học sinh trả lời: bấm mic để giả lập nói (animation sóng âm quanh icon, giống iSpeak)
     HOẶC gõ chữ vào ô nhập rồi gửi; có nút "Xem gợi ý" hiện gợi ý câu trả lời mẫu nếu học sinh
     bấm (không bắt buộc dùng).

  d. Trong lúc "AI đang phản hồi": bộ điều khiển tạm khoá (giảm opacity), hiện animation 3
     chấm nháy trong khung chat (~1-2s), sau đó Gia sư AI trả lời + nhận xét ngắn theo câu trả
     lời học sinh vừa gửi (mock: luôn phản hồi tích cực, câu chữ đổi theo luồng Nâng cao/Củng
     cố).

  e. Lặp lại bước c–d thêm 1 lượt nữa (tổng 2 lượt hỏi-đáp, giống độ dài AI Speak ở Bước 5) —
     câu hỏi lượt 2 khác câu hỏi lượt 1 (mock cố định theo luồng).

  f. Kết thúc phiên: Gia sư AI tổng kết ngắn (1-2 câu, giọng điệu khích lệ/động viên tuỳ luồng)
     + hiện thẻ "Bài tập về nhà được giao" (mock: 1 card nhỏ ghi tên bài tập cố định, kèm icon
     sách) — đây là điểm nối với BTVN Adaptive, KHÔNG cần dựng màn làm bài tập thật.
     Sau đó hiện nút demo "Kết thúc phiên Gia sư AI" nổi bật giữa màn.

  g. Bấm "Kết thúc phiên Gia sư AI" → hiện màn cảm ơn ngắn (vd "Cảm ơn bạn đã trải nghiệm demo
     Big Class Plus!") có nút "Quay lại Lịch học" để vòng lại Màn 0, khép kín flow demo.

═══════════════════════════════════════════════════════════════
YÊU CẦU KỸ THUẬT
═══════════════════════════════════════════════════════════════
- Một single-page web app (React hoặc HTML/CSS/JS thuần đều được), chạy được ngay trong
  preview của AI Studio
- Toàn bộ dữ liệu/logic là MOCK/SCRIPT CỐ ĐỊNH trong code — không cần gọi API thật, không
  cần AI thật (không cần tích hợp giọng nói/nhận diện thật)
- Toàn bộ flow chính (Màn 0 → Chuyển cảnh → Điểm danh đầu buổi → Màn 1 với 4 câu hỏi tuần tự
  → Điểm danh cuối buổi → Màn 2 → Màn 3 AI Tutor → màn cảm ơn) phải ĐI ĐƯỢC HẾT bằng click
  chuột, không được kẹt ở giữa chừng — đây là tiêu chí quan trọng nhất. Nhánh phụ "Tài khoản
  → Chế độ dành cho phụ huynh → Parent Mode" cũng phải bấm vào/thoát ra được trọn vẹn, nhưng
  không bắt buộc phải đi qua để hoàn thành flow chính
- Nên có nút "Tua nhanh/Bỏ qua" nhỏ ở góc màn hình trong suốt flow, để người xem demo có thể
  nhảy nhanh qua các đoạn chờ nếu cần (phục vụ chạy demo trực tiếp trước phụ huynh)
- Ưu tiên desktop viewport (~1440px) để khớp đúng ảnh tham chiếu — không bắt buộc responsive
  mobile cho bản demo này
- Có thể dùng ảnh/icon placeholder (unsplash, hoặc hình khối màu + emoji) cho video/avatar/
  camera học sinh/mascot — KHÔNG cần video call thật
- Transition giữa các state/màn hình nên mượt (fade/slide nhẹ), không cần phức tạp

Hãy hỏi lại tôi nếu cần làm rõ thêm chi tiết nào trước khi bắt đầu dựng.
```

---

## Ghi chú khi dùng

- Đây là **flow đầy đủ** (Lịch học → truy cập buổi học → 4 dạng câu hỏi tuần tự → tổng kết)
  theo đúng yêu cầu — không còn scope-cut như bản trước.
- Đã bổ sung **điểm danh đầu/cuối buổi** (BR1, BR4, BR11) và **AI Voice khích lệ/động viên
  khi đúng/sai** cho cả 4 dạng câu hỏi (BR5, BR6) — theo đúng Design Spec
  `AICNew-01-design-spec-web-big-class-plus.md`, 2 phần này có trong spec nhưng bị rút gọn
  ở bản prompt trước.
- 2 dạng câu hỏi **Bài tập nhóm** và **AI Speak** chưa có ảnh Figma đính kèm (chỉ mô tả text)
  — nếu AI Studio dựng sai tinh thần 2 phần này, gửi tôi lại kết quả để tôi lấy thêm screenshot
  Figma cho đúng phần đó.
- Các mốc thời gian thật (90s thảo luận, 60s điền đáp án, 10s giới thiệu) đã được **rút gọn**
  trong prompt để phù hợp tốc độ demo trực tiếp — không phải sai lệch so với sản phẩm thật.
- **Mở rộng phạm vi demo (bổ sung theo yêu cầu)**: đã thêm **Parent Mode** (nhánh phụ từ mục
  "Tài khoản") và **Màn 3 — AI Tutor 30 phút**. Khác với 5 màn Big Class Plus gốc, 2 phần này
  **hoàn toàn CHƯA có Figma frame** — nội dung tính năng lấy từ tài liệu concept (`03_product/
  concepts/slide-content-concept-1.2-product-dev-2026-09-04-final.md`, Slide 16 & 19), còn UI
  cụ thể là do tôi suy diễn theo tinh thần design system chung. Coi đây là **bản dựng thăm dò
  (prototype)** cho 2 phần này — cần review với Designer/PO trước khi dùng làm tư liệu chính
  thức, và nên thay bằng ảnh Figma thật ngay khi có (đặc biệt mục "Tài khoản" bạn sẽ gửi ảnh
  bổ sung, và cơ chế cổng xác thực phụ huynh nên đối chiếu lại với PRD/Design Spec thật của
  Parent Mode khi có).
- **Sửa lại điểm danh theo ảnh Figma thật bạn gửi**: điểm danh KHÔNG phải bấm nút "Chụp ảnh"
  chủ động như bản trước — mà đi qua **2 bước Kiểm tra thiết bị (mic → camera)** trước, rồi
  tự động vào màn xác nhận (video preview + lời thoại giáo viên AI, có nút "Vào lớp học ngay"
  để chủ động qua màn kế, không tự chuyển). Tên giáo viên AI dùng **"Cô Hà Tú"** theo đúng yêu
  cầu của bạn — dù trước đây ghi nhận đây là cơ chế đã thay thế ở Concept 3, bạn đã xác nhận
  giữ nguyên tên này riêng cho bản demo Big Class Plus.
- Công cụ dựng (AI Studio/Figma Make) có thể cần 1-2 vòng chỉnh sửa thêm (sau khi xem preview
  đầu tiên) để khớp đúng màu sắc/khoảng cách/đúng thứ tự flow — cứ dán lại đúng ảnh tham chiếu
  và nói rõ chỗ nào chưa khớp, hoặc quay lại đây để tôi viết lại đoạn prompt tương ứng.

## Lưu ý riêng khi dùng Figma Make

- Figma Make chạy ngay trong Figma nên **có thể dán trực tiếp frame thật** (Ctrl+C ở file
  design gốc → Ctrl+V vào canvas Figma Make) thay vì chỉ đính kèm PNG — vector/text sẽ giữ
  fidelity cao hơn ảnh chụp phẳng. Nếu làm được, ưu tiên cách này cho 5 màn đã có frame thật
  (Lịch học, Lớp học live, MCQ, iSpeak, Tổng kết); 2 phần chưa có ảnh (Bài tập nhóm, AI Speak)
  vẫn cần mô tả text như trong prompt.
- Nếu Figma Make hỗ trợ nhận diện thư viện team đang mở, có thể nhắc thêm trong prompt:
  "Dùng đúng component/token từ thư viện **(Final_Vanh10/6) Edupia Design System 2025**
  đang có trong file" — để nó ưu tiên tái dùng component thật thay vì tự tạo mới.
- Figma Make tạo ra một file/frame kết quả riêng trong Figma — nhớ đặt tên rõ ràng (vd
  "Demo Big Class Plus — Figma Make") để không lẫn với file design gốc hay file cá nhân
  đang gặp vấn đề quyền truy cập trước đó.

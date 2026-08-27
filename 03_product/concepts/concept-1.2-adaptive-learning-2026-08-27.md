# Concept 1.2 — Đầu tư tầng công nghệ AI (Adaptive Learning Ecosystem)

**Trạng thái:** 🟡 Bản nháp để Lân duyệt — tổng hợp từ tài liệu nguồn, chưa chốt, chưa đưa lên slide.
**Ngày tổng hợp:** 2026-08-27
**Nguồn:** bộ slide "DỰ ÁN ADAPTIVE LEARNING ECOSYSTEM" của Khối Sản phẩm – Công nghệ (23 slide, 4 phần: I. Thế giới đang làm gì → II. Bài học → III. Phương án Edupia → IV. Triển khai).

---

## 0. Concept 1.2 là gì (định vị trong khung 3 Concept)

Theo `00_context/meeting-notes/2026-08-21-concept-strategy-selection.md`, **Concept 1** = giữ nguyên cấu trúc sản phẩm hiện tại (Big Class + AI Practice + AI Speak + Edupia Club + GVCN) và nâng cấp theo 3 lựa chọn:

- **Option 1.1** — Nâng cấp chất lượng học liệu.
- **Option 1.2** — **Đầu tư tầng công nghệ AI**: chẩn đoán học tập, cá nhân hóa lộ trình, thuật toán tối ưu hóa dữ liệu (bao trùm cả nâng cấp của 1.1).
- **Option 1.3** — Nâng cấp tương tác con người (GVCN cố định, chủ động giao bài, mục tiêu 1:2.000).

Trong deck BOD phải trình đúng là **Option 1.2 thuộc Concept 1**, không phải một concept ngang hàng. (Scorecard nội bộ 2026-08-15 gọi cấu phần này là "C3 — Nâng cấp mạnh AI".)

**Tài liệu này làm rõ nội dung kỹ thuật – triển khai của Option 1.2** — "tầng công nghệ AI" đó cụ thể gồm gì: kiến trúc, khối lượng nội dung, lộ trình, đội ngũ, KPI, các quyết định BOD phải chốt.

**Thuật ngữ liên quan (đã có trong glossary):** [`NLO`](../../00_context/glossary.md), [`Adaptive Learning`](../../00_context/glossary.md), [`AI Tutor`](../../00_context/glossary.md), [`Mastery Profile / Mastery Map`](../../00_context/glossary.md), [`Parent Mode`](../../00_context/glossary.md).

---

## PHẦN I — Thế giới đang làm gì (benchmark)

Benchmark 30+ công ty EdTech tại 12+ thị trường (Trung Quốc, Ấn Độ, Indonesia, Hàn Quốc, Nhật Bản, Trung Đông, Châu Âu, Mỹ Latinh).

### Bối cảnh — vì sao cần Adaptive Learning bây giờ

| Vấn đề hiện tại | Diễn giải |
|---|---|
| Cá nhân hóa còn hời hợt | Big Class dạy đại trà; học sinh yếu ở điểm khác nhau nhưng nhận cùng nội dung, cùng tốc độ. |
| Không đo được lỗ hổng thật | GV đánh giá cảm tính qua điểm tổng — không biết chính xác học sinh yếu ở đâu. |
| TLGH phụ thuộc niềm tin | Phụ huynh cần bằng chứng tiến bộ cụ thể, đo lường được để gia hạn. |
| Đối thủ toàn cầu đã đi trước | Squirrel AI, Riiid, atama+, Alef Education đã chứng minh mô hình chẩn đoán chi tiết. |

### Ma trận 16 công ty tiêu biểu

| Công ty | Nước | Phương pháp luận | Đơn vị nhỏ nhất | Mô hình KD |
|---|---|---|---|---|
| Squirrel AI | TQ | Knowledge Graph + MCM | >10K knowledge point (xác nhận) | B2C + trung tâm |
| ALEKS | Mỹ | Knowledge Space Theory | Knowledge item (~1.000) | B2B2C academic |
| Carnegie MATHia | Mỹ | Bayesian Knowledge Tracing | Knowledge Component (~700/lớp) | In-school bổ trợ |
| Duolingo | Mỹ | DKT + Half-life Regression | Skill/lexeme | Freemium |
| Embibe | Ấn Độ | Knowledge Graph + BKT/DKT | Concept (93.659+) | B2C + B2G |
| Byju's | Ấn Độ | Marketing (chưa kiểm chứng) | "Concept" (100.000, PR) | B2C — **SỤP ĐỔ** |
| Ruangguru | Indonesia | Branching video (Adapto) | Không công bố | B2C+B2B+offline — **SỐNG** |
| Zenius | Indonesia | ZenCore laddering + IRT | 100 level/3 nhánh | Thuần B2C — **ĐÓNG CỬA** |
| Riiid/Santa | Hàn Quốc | Transformer SAINT/SAINT+ | 293 skills (EdNet) | B2C→B2B, lỗ lũy kế |
| atama+ | Nhật Bản | AI chẩn đoán + nano-step | Nano-step (700M+ lượt) | B2B2C qua juku |
| Alef Education | UAE | Knowledge Graph + IRT + NLP | Bite-sized LO | B2G — **IPO $514M** |
| Century Tech | Anh | KT + cognitive science | Nugget | B2B trường |
| GoStudent | Áo | Marketplace + AI hỗ trợ nhẹ | — | B2C 1-1 người thật |
| Khan Academy | Mỹ | Mastery learning + Khanmigo | Skill | Phi lợi nhuận |
| **Edupia** | **VN** | **NLO Taxonomy + Mastery + Routing** | **NLO (~1.473, taxonomy rõ)** | **AI Class Plus / AI Tutor 1-1** |

### 3 mẫu hình lặp lại xuyên 12 thị trường

1. **Granularity hội tụ về "micro".** NLO ~1.473 cùng bậc ALEKS (~1.000) / Carnegie (~700) — **không cần chạy đua** như Squirrel AI (>10K).
2. **Công nghệ giỏi không cứu mô hình KD tồi.** Riiid (AUC 0.79, SoftBank rót $175tr) vẫn lỗ ₩116,4 tỷ · Zenius (nội dung tốt) vẫn đóng cửa · Byju's sụp đổ −85% định giá.
3. **B2G là con đường ít khai thác.** Alef: IPO $514M, vốn hóa $2,57 tỷ · Qubena: 2.300+ trường công Nhật · Ruangguru: sống nhờ B2B + chính phủ.

### Kết luận Phần I — Edupia đang ở đâu

- Granularity đã đúng tầm — cùng bậc ALEKS/Carnegie, đã kiểm chứng hiệu quả toàn cầu.
- Khoảng trống thị trường: chưa đối thủ nào có adaptive engine granular cho **tiếng Anh K-12** ở Ấn Độ/Indonesia/MENA.
- Cơ hội nâng cấp kỹ thuật: mô hình attention (SAINT) đã chứng minh vượt DKT/BKT **+3,61% AUC** (peer-reviewed).
- Cần học bài học governance & đa dạng hóa kênh để không lặp lại Byju's/Zenius/Riiid.

---

## PHẦN II — Bài học áp dụng trực tiếp (benchmark → quyết định thiết kế)

| Phát hiện từ nghiên cứu (Phần I) | Quyết định thiết kế Edupia (Phần III) |
|---|---|
| atama+ (Nhật): chia nhỏ +10,7% → hiệu quả +17,2%, theo quy trình **động** dựa dữ liệu | NLO tách nhỏ **khi Gap Detection phát hiện tắc nghẽn** — không cố định trước như Squirrel AI |
| Riiid (Hàn): Transformer SAINT+ vượt DKT/BKT +3,61% AUC | Roadmap R&D: thử nghiệm attention-based KT **song song** BKT/DKT khi đủ dữ liệu |
| Squirrel AI: 3 vòng duyệt bắt buộc, con người dẫn dắt AI tối ưu | Pipeline Question/Video Bank: seed người viết → AI sinh biến thể → **duyệt 3 vòng** |
| Byju's/Zenius/Riiid: công nghệ tốt vẫn sụp nếu quản trị / mô hình KD sai | Nguyên tắc Governance: Mastery Map **phục vụ sư phạm, không phục vụ áp lực bán hàng** |
| Alef/Qubena/Ruangguru: B2G/B2B giúp sống sót qua khủng hoảng B2C | Roadmap: **pilot kênh B2G** (Sở GD-ĐT / trường công) song song AI Class Plus B2C |

---

## PHẦN III — Phương án triển khai Edupia

### Tầm nhìn: NLO xuyên suốt 8 điểm chạm hành trình học sinh

| # | Điểm chạm | Vai trò |
|---|---|---|
| 1 | Big Class | GV Star gán NLO |
| 2 | AI Tutor 1-1 | Vá lỗ hổng 30' |
| 3 | BTVN Adaptive | 20 câu vừa sức |
| 4 | Luyện tập / Mocktest | Theo NLO chuẩn |
| 5 | Mastery Map | Bản đồ nắm vững |
| 6 | Báo cáo Phụ huynh | Dịch sang ngôn ngữ dễ hiểu |
| 7 | Đánh giá 3–6 tháng | Khóa cải thiện |
| 8 | Báo cáo Sale | Cross-sell có căn cứ |

> Cả 8 bước **đọc/ghi vào cùng 1 Mastery Profile duy nhất** — xuyên suốt mọi sản phẩm Edupia.

### Nền tảng: NLO — đơn vị đo lường nhỏ nhất

**NLO (Nano Learning Objective):** đơn vị kiến thức/kỹ năng nhỏ, đo lường độc lập, dạy trọn trong 10–15 phút, theo dõi mastery riêng biệt.

*Ví dụ — phân rã "Thì hiện tại đơn" (Lớp 3) thành 6 NLO:* Khẳng định → Chia động từ → Phủ định → Câu hỏi Yes/No → Wh-question → Ngữ cảnh sử dụng.

Mỗi NLO có `prerequisite_nlo_ids` — đồ thị mà Routing Engine dùng để chọn đúng NLO cần vá.

Thuộc tính NLO: **Skill** (Ngữ pháp / Từ vựng / Ngữ âm / Nghe / Nói / Đọc / Viết) · **Mức độ** (Mức 1-2-3 theo TT27, hoặc Biết–Hiểu–Vận dụng theo CV7991) · **Độ khó** (Easy / Medium / Hard).

### Kết quả đã có: 1.473 NLO — khung Tiếng Anh Lớp 1–8

Mở rộng từ 601 NLO gốc bằng dữ liệu Unit thật (Global Success).

| Skill | Số NLO |
|---|---|
| Ngữ pháp | 191 |
| Từ vựng | 1.036 |
| Ngữ âm | 49 |
| Nghe | 31 |
| Nói | 127 |
| Đọc | 20 |
| Viết | 19 |
| **Tổng** | **1.473** |

Phân bổ theo cấp: Lớp 1–2 (Làm quen) 80 · Lớp 3–5 (TH) 604 · Lớp 6–8 (THCS) 789 — cùng bậc ALEKS (~1.000).

### Nguồn dữ liệu & an toàn bản quyền

- **Yêu cầu cần đạt — TT32/2018:** văn bản pháp quy công khai, gốc pháp lý cho toàn bộ NLO.
- **Dữ liệu Unit tham khảo:** tên Unit, số từ vựng, ngữ pháp trọng tâm — từ tài liệu ôn tập công khai, **cần đối chiếu sách in**.

**Nguyên tắc bất di bất dịch:**
- KHÔNG sao chép ngữ liệu SGK — chỉ dùng tên Unit / chủ đề / số liệu tổ chức.
- Câu hỏi & video do Edupia tự sản xuất từ seed người viết; AI chỉ sinh biến thể.
- Mọi dòng dữ liệu tham khảo gắn cờ "cần xác nhận" — cần đối chiếu sách in.

### Kiến trúc hệ thống: Mastery Model → Gap Detection → Routing Engine

| Tầng | Nội dung |
|---|---|
| **NLO Taxonomy** | 1.473 NLO, schema chuẩn, prerequisite graph |
| **Mastery Model** | `mastery = mastery_cũ × decay + tín hiệu mới` · Gatekeeper ≥90% · WeakNLOSet <70% |
| **Gap Detection Engine** | Big Class + Quick Check sinh signal realtime |
| **Routing Engine** | `priority = ppct_weight × (1 − mastery) × prereq_boost` · Top 1–2 NLO/buổi AI Tutor 1-1 |

**Hạ tầng:** Realtime — Redis (mastery vector) · Lịch sử — PostgreSQL · AI-assisted tagging & sinh nội dung — Claude API. Sẵn sàng thử nghiệm attention-based KT (SAINT) khi đủ dữ liệu.

### Content Engine

**Question Bank — 1.000.000 câu hỏi.** Phân bổ theo đặc điểm NLO (không chia đều): Ngữ pháp + Từ vựng ~490K · Nghe ~155K · Đọc ~100K · Ngữ âm ~49K · Viết ~19K · Nói ~76K lượt · Dự phòng/Mock exam ~110K.
Pipeline: Seed người viết → Claude API sinh biến thể → **Duyệt 3 vòng** → Publish.

**Video Bank — ~900 video (KHÔNG 1:1 với NLO).** 1 video mini-lesson 2–3 phút dạy trọn 1 **nhóm** khái niệm liên quan — granularity video luôn **thấp hơn** granularity đo lường (NLO). ≈760 video lõi + ~150–200 biến thể track → ~900–950 thực tế cần quay. Ngân sách 3.000 dư làm buffer.

### Cấu phần mới: BTVN Adaptive — Staircase Difficulty

Routing Engine chọn NLO (tầng buổi học); bổ sung thuật toán chọn **độ khó câu tiếp theo** trong lúc học sinh đang làm (tầng item).

**Thuật toán Staircase:** Bắt đầu ở E → đúng 2 câu liên tiếp: tăng 1 bậc (E→M→H) → sai 1 câu: giảm ngay 1 bậc.
**Trộn NLO trong 1 buổi BTVN:** 40% NLO đang yếu · 40% NLO mới học gần đây · 20% NLO cũ (ôn chống quên).

### Giao tiếp giá trị: Mastery Map → Báo cáo Phụ huynh

| Dữ liệu nội bộ (thô) | Hiển thị phụ huynh |
|---|---|
| `GS-L6-GRA-0034` · `mastery_value: 0.62` · `muc_do_cv7991: "Hiểu"` | "Con đang ở mức HIỂU (chưa tới VẬN DỤNG) phần Thì hiện tại hoàn thành — đúng chuẩn Thông tư 22, khớp học bạ ở trường." |

Nguồn dịch: bảng mapping TT27 ↔ CV7991 ↔ Bloom — dùng **chiều ngược**.

**Tách bạch 2 loại tín hiệu:** Mastery hằng ngày (nhiễu) ≠ Đánh giá 3–6 tháng chính thức (đề riêng, đáng tin) — nền tảng cho Khóa cải thiện gắn TLGH60.

---

## PHẦN IV — Triển khai

### Governance — niềm tin là tài sản phải bảo vệ

Mastery Map và báo cáo đánh giá **KHÔNG được tinh chỉnh để phục vụ mục tiêu bán hàng** — bài học trực tiếp từ Byju's: "diagnostic test" biến thành công cụ ép bán đã hủy hoại niềm tin toàn ngành.

| ✓ Được phép | ✕ Không được phép |
|---|---|
| Sale dùng kết quả đánh giá **chính thức** làm căn cứ tư vấn | Tự ý hạ ngưỡng "yếu" để tạo áp lực mua khóa cải thiện |
| Cross-sell dựa trên Mastery Profile xuyên sản phẩm | Dùng mastery hằng ngày (nhiễu) làm căn cứ chốt sale |
| Báo cáo Sale dùng **cùng bộ số** với báo cáo phụ huynh | Tạo 2 phiên bản báo cáo khác nhau cho Sale và phụ huynh |

### Lộ trình theo giai đoạn (mỗi Phase có GATE review CTO + Academic Lead)

| Phase | Nội dung | Thời lượng |
|---|---|---|
| **Phase 0** — Chốt khung | Schema, mapping mức độ, preset ma trận đề | 2 tuần |
| **Phase 1** — Pilot Lớp 6 | ≥50 NLO, đo năng suất thật + quay thử 20–30 video | — |
| **Phase 2** — Mở rộng THCS | Lớp 7-8-9 theo năng suất đo được | — |
| **Phase 3** — Mở rộng Tiểu học | Lớp 5→1, template riêng (Macmillan) | — |
| **Phase 4** — B2G pilot + Calibration | Sở GD-ĐT / trường công (bài học Alef/Qubena) + hiệu chỉnh ngưỡng liên tục | — |

### Nguồn lực — đội ngũ

| Vai trò | Nhiệm vụ |
|---|---|
| Học thuật | Viết seed item + kịch bản video, duyệt 3 vòng — **nút thắt năng suất, cần đo ở Pilot** |
| Academic Lead | Chốt mapping mức độ, ngưỡng mastery, duyệt cuối trước publish |
| Data Engineer | Schema, pipeline Redis/PostgreSQL, Routing/Mastery Service |
| Đội Production | Quay/dựng ~900 video mini-lesson 2–3 phút |

**Quy mô:** 1.000.000 câu hỏi (QB) · ~900–950 video thực tế cần quay (VB) · 65.000 học sinh — đủ mật độ dữ liệu tin cậy.

### KPI thành công

| KPI | Mục tiêu | Ghi chú |
|---|---|---|
| Backlog NLO yếu | Giảm ròng sau 60 ngày dùng đều đặn | Chỉ số cảnh báo sớm — mới |
| Độ chính xác Staircase | Giữ tỷ lệ đúng 70–80% trong phiên BTVN | Calibrate sau pilot |
| Sai lệch mastery hằng ngày ↔ chính thức | Theo dõi liên tục | Xây baseline trước |
| Tỉ lệ gia hạn sau khóa cải thiện | So sánh nhóm dùng vs không dùng | Liên kết dữ liệu TLGH60 |

### 5 quyết định cần BOD chốt trước Sprint 1

| # | Câu hỏi |
|---|---|
| Q1 | Mastery Profile mở rộng sang Class Premium/Tutor ngay, hay chỉ AI Class Plus trước? |
| Q2 | Chu kỳ đánh giá chính thức: 3 tháng hay 6 tháng — khác nhau theo TH/THCS? |
| Q3 | Cơ chế audit nào đảm bảo Sale không lách nguyên tắc Governance? |
| Q4 | Ngân sách Pilot Lớp 6 (Học thuật + Production) — phê duyệt khi nào? |
| Q5 | Có triển khai pilot kênh B2G (Sở GD-ĐT / trường công) song song B2C không? |

**Next step (theo slide nguồn):** Phê duyệt Phase 0 (2 tuần) → khởi động Pilot Lớp 6.

---

## 5. Trạng thái xác thực nội dung

**Đã có, kiểm chứng được nội bộ:**
- 1.473 NLO đã phân rã cho Tiếng Anh Lớp 1–8 (mở rộng từ 601 gốc). Phân bổ theo skill/cấp như bảng Phần III.
- Kiến trúc Mastery Model → Gap Detection → Routing Engine đã thiết kế (chưa triển khai đại trà — khớp entry `Adaptive Learning` trong glossary).

**Giả định / chưa validate:**
- Năng suất viết seed item + kịch bản video của đội Học thuật (nút thắt) — chỉ đo được ở Pilot Lớp 6.
- Staircase giữ được tỷ lệ đúng 70–80% — cần calibrate sau pilot.
- Kênh B2G khả thi với Edupia — chưa có pilot, chưa có quan hệ Sở GD-ĐT được xác nhận.
- Các con số benchmark toàn cầu (AUC Riiid, IPO Alef, "+3,61% AUC" SAINT, "+10,7%→+17,2%" atama+…) lấy từ slide nguồn — cần đối chiếu tài liệu gốc trước khi lên deck BOD.

**Thuật ngữ mới trong tài liệu này chưa có trong glossary** — nếu chốt dùng cần thêm vào `00_context/glossary.md`: *NLO Taxonomy, Mastery Model, Gap Detection Engine, Routing Engine, Staircase Difficulty / BTVN Adaptive, Question Bank, Video Bank, Gatekeeper, WeakNLOSet, TLGH60*.

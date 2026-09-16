# Kịch bản 60 phút — Adaptive Learning × Mastery Profile (bản ĐÓNG — cost-safe)

> Viết lại từ bản gốc PO cung cấp 2026-09-15 (kịch bản mở, AI Teacher suy luận tự do). Giữ nguyên toàn bộ khung sư phạm/vòng lặp Adaptive Learning — chỉ đổi cơ chế 3 điểm rủi ro chi phí cao (AI Teacher Intervention, 2 Interaction checkpoint, iSpeak) từ **mở** (AI hiểu/sinh nội dung tự do — về bản chất là Kịch bản 2 "AI Tutor Real-time chuẩn") sang **đóng** (chọn/chạm + thang gợi ý soạn sẵn theo từng dạng lỗi — cùng họ với Kịch bản A/C đã phân tích, xem [brainstorm-intent.md](./brainstorm-intent.md)).
>
> ⚠️ **Chưa giải quyết — cần chốt riêng**: thời lượng 60 phút ở đây khác với cấu trúc 45 phút đã chốt trong PRD AICNew-03 (theo Slide 15). Bản này **chưa** thay thế PRD AICNew-03 — coi là bản phân tích/đối chiếu độc lập cho tới khi có quyết định rõ ràng.
>
> ✅ **2026-09-16 — đã có bản retime 45 phút**: xem [kich-ban-45-phut-adaptive-ban-dong-v1.md](./kich-ban-45-phut-adaptive-ban-dong-v1.md) — cắt 15 phút, giữ nguyên toàn bộ 9 bước và cơ chế đóng, chỉ đổi mốc thời gian. Bản 60 phút này vẫn giữ lại làm tài liệu gốc/tham khảo đầy đủ ví dụ-thoại của từng bước.

---

## 1. Mục tiêu

Thiết kế một tiết học tiếng Anh 60 phút theo cơ chế:

> **Mastery Profile → Adaptive Learning → Learning Activities → Learning Data → Update Mastery Profile → Adaptive Learning**

Mục tiêu không chỉ là hoàn thành một lesson, mà giúp hệ thống:

- Hiểu năng lực hiện tại của từng học sinh.
- Xác định NLO cần ưu tiên.
- Cá nhân hóa nội dung và độ khó.
- Phát hiện điểm yếu trong quá trình học.
- Can thiệp đúng thời điểm — **bằng thang gợi ý soạn sẵn**, không cần AI hiểu ngôn ngữ tự do.
- Đo lại năng lực sau buổi học.
- Cập nhật Mastery Profile để quyết định bước học tiếp theo.

---

## 2. Core Learning Loop

```text
                  ┌─────────────────┐
                  │ MASTERY PROFILE │
                  │  Học sinh đang  │
                  │      ở đâu?     │
                  └────────┬────────┘
                           ↓
                  ┌─────────────────┐
                  │ ADAPTIVE        │
                  │ LEARNING        │
                  │ Cần học gì tiếp?│
                  └────────┬────────┘
                           ↓
                  ┌─────────────────┐
                  │ LEARNING        │
                  │ ACTIVITIES      │
                  └────────┬────────┘
                           ↓
        ┌──────────────────────────────────┐
        │                                  │
      VIDEO             QUIZ          AI TEACHER
        │            (đóng — trắc      (đóng — thang
        │             nghiệm/chạm)      gợi ý soạn sẵn)
        └─────────────────┼────────────────┘
                          ↓
                  iSPEAK (đóng — chấm
                  âm vị + nội dung theo
                  khung câu có sẵn)
                          ↓
                  LEARNING DATA
                          ↓
                  ┌─────────────────┐
                  │ MASTERY UPDATE  │
                  └────────┬────────┘
                           ↓
                    NEXT LEARNING
```

---

## 3. Ví dụ Lesson

### Chủ đề

**Healthy Habits**

### Skill

**Reading**

### NLO mục tiêu

```text
NLO 1: Vocabulary in Context
NLO 2: Identify Main Idea
NLO 3: Identify Supporting Details
NLO 4: Make Logical Inference
```

### 4 Learning Components

```text
1. Video Lesson       — quay/dựng sẵn, có nhánh theo mastery (xem §16)
2. Quiz / Practice    — trắc nghiệm/chạm chọn câu trong bài (đóng)
3. AI Teacher         — thang gợi ý soạn sẵn theo dạng lỗi (đóng)
4. iSpeak             — chấm âm vị + nội dung theo khung câu (đóng)
```

---

## 4. Mastery Profile trước buổi học

*(Không đổi so với bản gốc — phần này không có rủi ro chi phí, chỉ là đọc dữ liệu.)*

### Student A

```text
Reading

Vocabulary in Context       82%
Main Idea                   55%
Supporting Details          81%
Logical Inference           38%
```

### AI Diagnosis

```text
Strength:  Vocabulary, Supporting Details
Weakness:  Main Idea, Logical Inference

Priority NLO:
1. Main Idea
2. Logical Inference
```

### Adaptive Decision

```text
→ Tăng thời lượng luyện Main Idea
→ Giữ Vocabulary ở mức vừa phải
→ Sau Main Idea sẽ kiểm tra khả năng Inference
→ Chuẩn bị sẵn thang gợi ý Main Idea + Inference (không cần AI Teacher "sẵn sàng ứng biến")
```

---

## 5. Kịch bản 60 phút

### 00:00–05:00 — Adaptive Retrieval *(không đổi — đã là trắc nghiệm đóng)*

**Mục tiêu:** Kích hoạt kiến thức cũ và kiểm tra nhanh trạng thái hiện tại.

**System đọc:** Mastery Profile + Learning History + Recent Performance → chọn 3-5 câu Retrieval trắc nghiệm phù hợp.

**Ví dụ** (Student A yếu Main Idea):

```text
Q1. What is the main idea of this short paragraph?      [trắc nghiệm 4 đáp án]
Q2. Which sentence best summarizes the paragraph?        [trắc nghiệm 4 đáp án]
Q3. Which information is a supporting detail?             [trắc nghiệm 4 đáp án]
```

**System Response:** `Q1 ✓  Q2 ✗  Q3 ✓`

**Adaptive Decision:**

```text
Nếu tiếp tục sai Main Idea → không chuyển ngay nội dung mới, tăng mức hỗ trợ ở Teaching
Nếu làm tốt                → giảm giải thích cơ bản, tăng challenge
```

**Data Output:** `Main Idea: 55% → cập nhật confidence theo evidence`

---

### 05:00–12:00 — Adaptive Video Lesson #1 *(không đổi cơ chế — chỉ lưu ý chi phí sản xuất, xem §16)*

**NLO:** Vocabulary in Context

Student A đã khá (82%) → hệ thống phát **nhánh video rút gọn** (recap ngắn + ví dụ khó hơn), không dạy lại từ đầu.

**Learning Flow:** Context → Key Vocabulary → Example → Contextual Meaning → Quick Check (trắc nghiệm)

**Adaptive Rule:**

```text
IF mastery >= threshold   → phát nhánh video "Short recap + harder example"
IF mastery is medium      → phát nhánh video "Standard lesson"
IF mastery < threshold    → phát nhánh video "Additional explanation + simpler example"
```

> Cả 3 nhánh là **video quay/dựng sẵn từ trước** cho mỗi NLO — hệ thống chỉ *chọn* đúng nhánh, không sinh nội dung mới theo thời gian thực.

---

### 12:00–17:00 — Interaction 1: Check Understanding *(ĐỔI SANG ĐÓNG)*

**Mục tiêu:** Kiểm tra học sinh đã hiểu kiến thức vừa dạy chưa — diagnostic sensor đầu tiên.

**Bước 1 — trắc nghiệm nghĩa từ** *(không đổi, vốn đã đóng)*:

```text
The word "exhausted" is closest in meaning to:
A. excited   B. very tired   C. angry   D. hungry
```

**Bước 2 — "chỉ ra bằng chứng" (ĐỔI: từ câu hỏi mở → chạm chọn câu trong bài):**

> ~~Which sentence in the passage helps you understand the word? (trả lời tự do)~~
> **Chạm vào câu trong đoạn văn mà con nghĩ giúp hiểu nghĩa từ "exhausted".** Đoạn văn hiển thị dạng có thể chạm từng câu; hệ thống đã gắn sẵn câu nào là "bằng chứng đúng" khi soạn đề (distractor/evidence tagging lúc viết Question Bank) — so khớp trực tiếp, không cần AI hiểu câu trả lời tự do.

**System phân tích** *(không đổi ý nghĩa — chỉ đổi nguồn tín hiệu, từ "hiểu câu trả lời tự do" sang "so khớp lựa chọn"):*

```text
Can identify meaning?     → theo kết quả trắc nghiệm Bước 1
Can use context?          → theo câu đã chạm ở Bước 2 có khớp câu bằng chứng đúng không
Can identify evidence?    → như trên
```

**Adaptive Decision:** *(không đổi)*

```text
Nếu hiểu (đúng cả 2 bước)     → Continue
Nếu chưa chắc (đúng 1/2 bước) → Reinforcement (phát thêm 1 ví dụ ngắn quay sẵn)
Nếu yếu rõ (sai cả 2 bước)    → Remediation (phát nhánh video giải thích lại)
```

---

### 17:00–25:00 — Adaptive Video Lesson #2 *(không đổi cơ chế — cùng lưu ý §16)*

**NLO:** Identify Main Idea (ưu tiên vì mastery đang thấp)

**Learning Flow:** What is a Main Idea? → Example → Worked Example → How to find Main Idea → Common traps

**Nhánh theo mastery** *(video quay sẵn theo từng nhánh, không sinh mới):*

```text
Student A (Main Idea = 55%) → nhánh "nhiều worked example"
Student B (Main Idea = 88%) → nhánh "Implicit Main Idea + Longer Passage" (bỏ qua phần cơ bản)
```

---

### 25:00–32:00 — Interaction 2: Guided Practice *(ĐỔI SANG ĐÓNG)*

**Mục tiêu:** Kiểm tra học sinh đã *dùng được* kiến thức chưa (khó hơn Interaction 1).

**Bước 1 — đọc đoạn văn mới, chọn Main Idea** *(trắc nghiệm, không đổi):*

```text
What is the main idea of the passage?   A. ...  B. ...  C. ...  D. ...
```

**Bước 2 — "chọn chi tiết ủng hộ" (ĐỔI: từ câu hỏi mở → trắc nghiệm chọn câu ủng hộ đúng):**

> ~~Which detail best supports your answer? (trả lời tự do)~~
> **Trong 4 câu trích từ đoạn văn dưới đây, câu nào ủng hộ tốt nhất đáp án con vừa chọn?** [4 lựa chọn câu trích, đã gắn sẵn đúng/sai lúc soạn đề]

**System thu thập evidence** *(không đổi ý nghĩa, đổi nguồn — từ chấm câu trả lời mở sang so khớp lựa chọn):*

```text
Main Idea:          Q1 ✓   Q2 ✗
Supporting Detail:  Q3 ✓   Q4 ✓
```

**AI Diagnosis** *(kết luận suy ra từ bảng đúng/sai trên — quy tắc if-then, không cần AI "hiểu" gì thêm):*

```text
Đúng nhiều câu Supporting Detail, sai câu phân biệt Main Idea vs Detail
→ Học sinh biết tìm chi tiết ủng hộ, nhưng nhầm Main Idea với Supporting Detail
```

**Adaptive Decision:** *(không đổi)*

```text
→ Không tăng độ khó Main Idea ngay
→ Cần thêm scaffold
→ Kích hoạt thang gợi ý AI Teacher (xem bước tiếp theo)
```

---

### 32:00–40:00 — AI Teacher Intervention *(ĐỔI SANG ĐÓNG — thay đổi lớn nhất)*

**Mục tiêu:** Hỗ trợ đúng NLO học sinh đang nhầm, theo nguyên tắc không đưa đáp án ngay — **nhưng không cần AI Teacher hiểu/suy luận tự do trên câu trả lời của học sinh.**

**Cơ chế mới — "Thang gợi ý theo dạng lỗi" (Hint Ladder by Misconception Tag):**

Khi soạn Question Bank, mỗi phương án nhiễu (distractor) của câu trắc nghiệm được **gắn sẵn nhãn dạng lỗi** (misconception tag) — vd với câu Main Idea, đáp án B tương ứng lỗi "chọn nhầm 1 chi tiết ủng hộ làm ý chính". Khi học sinh chọn sai đáp án B ở Interaction 2, hệ thống **đã biết ngay** dạng lỗi mà không cần AI phân tích câu trả lời tự do:

```text
Học sinh chọn đáp án B (sai) → misconception_tag = "detail_as_main_idea" (gắn sẵn lúc soạn đề)
→ Hệ thống phát đúng nhánh Hint Ladder đã soạn sẵn cho dạng lỗi này (không phải sinh mới)
```

**Thang gợi ý soạn sẵn cho dạng lỗi "detail_as_main_idea":**

```text
Bậc 1 — Hint (giọng AI Voice, câu thoại có sẵn):
"Con thử đọc lại câu đầu tiên và câu cuối cùng của đoạn văn xem chúng đang nói về ý gì chung nhé."

Bậc 2 — Guided question (trắc nghiệm phụ, không phải câu hỏi mở):
"Câu con chọn (B) có nhắc tới TOÀN BỘ đoạn văn, hay chỉ MỘT phần nhỏ?"
  → [Toàn bộ đoạn văn] / [Chỉ một phần nhỏ]  (đáp án đúng: "chỉ một phần nhỏ")

Bậc 3 — Worked Example (video/hình ảnh quay sẵn):
Phát đoạn giải thích mẫu có sẵn: so sánh 1 Main Idea thật và 1 Supporting Detail dễ nhầm,
dùng đúng kiểu văn bản/chủ đề đã luyện.

Bậc 4 — Explanation (text/voice soạn sẵn):
"Main Idea phải bao trùm được cả đoạn văn. Supporting Detail chỉ là 1 ví dụ/bằng chứng nhỏ
cho Main Idea đó. Con thử chọn lại nhé." → quay lại câu hỏi gốc để học sinh chọn lại.
```

> Học sinh **không cần nói/gõ câu trả lời tự do** ở bất kỳ bậc nào — mọi tương tác đều là chọn trắc nghiệm hoặc chạm câu trong đoạn văn. AI Voice chỉ **phát lại** các câu thoại đã soạn sẵn theo đúng dạng lỗi được gắn nhãn từ trước — giống hệt cơ chế AI Voice khích lệ/động viên đã dùng ở Big Class Plus (AICNew-01), chỉ khác là có 4 bậc leo thang thay vì 1 câu.

**Nếu học sinh chọn lại vẫn sai sau Bậc 4** → hệ thống đánh dấu NLO này "cần GVCN hỗ trợ thêm" (escalate con người), **không cố sinh thêm nội dung AI mới**.

**Data Output:**

```text
Student knows:      Supporting details
Student struggles:  Phân biệt main idea vs supporting detail (dạng lỗi cụ thể: "detail_as_main_idea")
```

> So với bản gốc, phần "Nguyên tắc" (Question → Hint → Scaffold → Student reasoning → Feedback) **vẫn giữ được ý nghĩa sư phạm** — chỉ khác "Student reasoning" giờ là **chọn trắc nghiệm/chạm câu** thay vì giải thích bằng lời, nên AI không cần hiểu ngôn ngữ tự do ở bước này.

---

### 40:00–48:00 — Adaptive Challenge *(không đổi cơ chế — vốn đã đóng, trắc nghiệm với độ khó/scaffold khác nhau)*

**Mục tiêu:** Kiểm tra khả năng vận dụng độc lập — không có explanation trước.

**Adaptive Difficulty:**

```text
Mastery thấp      → Passage ngắn, explicit clues, scaffold
Mastery trung bình → Passage chuẩn, limited clues
Mastery cao       → Passage dài hơn, implicit main idea, distractor mạnh
```

**Student A** (Main Idea 68%, Inference 45%) → hệ thống chọn: Main Idea *medium difficulty*, Inference *scaffolded difficulty*.

**Mục tiêu kiểm chứng:** Học sinh thực sự Master hay chỉ làm đúng nhờ được hỗ trợ? — trả lời được ngay từ kết quả trắc nghiệm (đúng/sai + có dùng scaffold hay không), không cần thêm cơ chế mở.

---

### 48:00–55:00 — iSpeak *(ĐỔI SANG ĐÓNG — thu hẹp phạm vi nội dung, giữ chấm âm vị thật)*

**Mục tiêu:** Chuyển kiến thức Reading sang khả năng sử dụng ngôn ngữ nói — **nhưng ràng buộc trong khung câu có sẵn**, thay vì chấm tự do hoàn toàn.

**Task (ĐỔI: từ hỏi mở → khung câu + lựa chọn nội dung):**

> ~~Tell me one healthy habit and explain why it is important. (nói tự do hoàn toàn)~~
>
> **Bước 1 — chọn nội dung** (trắc nghiệm/chạm, không phải nghĩ ra tự do):
> "Chọn 1 thói quen lành mạnh con muốn nói tới:" → [Exercise] / [Sleep early] / [Eating vegetables] / [Drinking water]
>
> **Bước 2 — nói theo khung câu có sẵn** (điền vào chỗ trống bằng giọng nói, không phải tự soạn câu):
> "I think **___(thói quen đã chọn)___** is a healthy habit because it helps you **___(chọn 1 trong 2-3 lý do gợi ý sẵn)___**."

**iSpeak đánh giá — chỉ giữ phần đã có công nghệ trưởng thành (Kịch bản A):**

```text
Pronunciation  → chấm âm vị 0-100/âm (mô hình chuyên biệt, đã dùng ở Phần 2 buổi chính khoá)
Content match  → so khớp đúng thói quen + đúng lý do đã CHỌN (không phải chấm ngữ nghĩa tự do)
```

> **Bỏ khỏi bản MVP:** chấm Grammar/Fluency/Vocabulary tự do trên câu nói mở — đây là đánh giá ngữ nghĩa/ngữ pháp mở, cần mô hình mạnh + rủi ro chi phí cao, để dành cho giai đoạn "Kịch bản 2 AI Tutor Real-time chuẩn" (mốc 06/2027) khi năng lực AI Talk nội bộ vượt ngưỡng 7/10 hiện tại.

**AI Feedback** (chọn từ thư viện câu phản hồi theo dải điểm phát âm, giống Big Class Plus):

```text
Điểm cao   → "Phát âm tốt lắm, câu của con rất rõ ràng!"
Điểm khá   → "Khá hơn rồi đó, chú ý lại âm 'exercise' nhé!"
Điểm thấp  → "Không sao, mình luyện thêm chút xíu là được!"
```

Học sinh được retry 1-2 lần (không đổi).

**Data Output:** `Speaking evidence (điểm âm vị) + Content match (đúng khung câu đã chọn) → cập nhật Mastery Profile`

---

### 55:00–60:00 — Mastery Update & Next Best Learning *(không đổi — vốn đã đóng)*

**Exit Ticket:** 3 câu trắc nghiệm ngắn (Vocabulary, Main Idea, Inference).

---

## 6. Mastery Profile sau buổi học

```text
                    BEFORE     AFTER

Vocabulary            82%       86%
Main Idea             55%       68%
Supporting Details    81%       84%
Logical Inference     38%       45%
```

### AI Learning Summary

```text
Today:
✓ Vocabulary: Good
✓ Supporting Details: Strong
↑ Main Idea: Improving
→ Inference: Needs more practice
```

---

## 7. Next Best Learning

```text
NEXT BEST LEARNING
1. 10 phút luyện Logical Inference
2. 5 câu Main Idea
3. 1 Reading Challenge
4. Retry iSpeak
```

---

## 8. Quy tắc Adaptive Learning *(không đổi — không phụ thuộc mở/đóng)*

### Rule 1 — Điều chỉnh nội dung
```text
IF NLO mastery thấp → tăng exposure
IF NLO mastery cao  → giảm repetition
```

### Rule 2 — Điều chỉnh độ khó
```text
IF correct + fast + confident     → increase difficulty
IF correct but slow/uncertain     → maintain difficulty + scaffold
IF repeated errors                → decrease difficulty + remediation
```

### Rule 3 — Điều chỉnh mức hỗ trợ (giờ là Hint Ladder soạn sẵn, xem §5 mục 32:00-40:00)
```text
No support → Hint → Scaffold (guided question) → Worked Example → Explanation
```

### Rule 4 — Không chỉ dựa vào điểm
```text
Accuracy + Response Time + Attempt Count + Hint Usage + Error Pattern
+ Misconception Tag (thay cho "AI Teacher Interaction" tự do)
+ iSpeak Performance (điểm âm vị + content match, thay cho chấm tự do)
```

---

## 9. Vai trò của từng thành phần

| Component | Vai trò | Cơ chế (đóng — cost-safe) |
|---|---|---|
| **Mastery Profile** | Hiểu học sinh đang ở đâu | Đọc dữ liệu, không tốn AI real-time |
| **Adaptive Learning** | Quyết định học gì tiếp theo | Rule if-then trên dữ liệu Mastery Profile |
| **Video** | Teach / Explain | Quay/dựng sẵn theo nhánh mastery (§16 nêu chi phí sản xuất) |
| **Quiz** | Measure / Diagnose / Practice | Trắc nghiệm + chạm chọn câu trong bài, có gắn nhãn dạng lỗi từ lúc soạn đề |
| **AI Teacher** | Intervene / Scaffold / Personalize | Thang gợi ý 4 bậc soạn sẵn theo dạng lỗi (misconception tag), không suy luận tự do |
| **iSpeak** | Apply / Measure Speaking | Chấm âm vị (mô hình chuyên biệt) + so khớp nội dung theo khung câu đã chọn |
| **Mastery Update** | Cập nhật trạng thái học sinh | Ghi theo kết quả đóng ở trên |

---

## 10. Product Value Proposition *(không đổi)*

> **Mỗi hoạt động học đều tạo dữ liệu để AI hiểu năng lực của từng học sinh. Từ đó AI tự điều chỉnh nội dung, độ khó và cách hỗ trợ trong suốt quá trình học.**

## One-line positioning *(không đổi)*

> **Mastery Profile giúp AI biết "con đang ở đâu" → Adaptive Learning quyết định "con cần học gì tiếp theo" → AI Teacher giúp "con vượt qua điểm yếu như thế nào".**

---

## 11. Ghi chú thiết kế — vì sao đổi mở → đóng, và cái giá phải trả

### Lý do đổi

1. **Trần COGS đã chốt** (biên bản 15/09): ngân sách COGS tăng thêm ~6.000đ/buổi (chia sẻ 4 khoản: nội dung, GVCN, hạ tầng AI, vận hành lớp) — cảnh báo rõ "không lạm dụng AI real-time generation, đắt hơn thuê giáo viên thật → lỗ nặng".
2. **Bản gốc có 5 điểm chạm cần AI hiểu ngôn ngữ tự do** (2 Interaction, AI Teacher Intervention 8 phút, Adaptive Challenge liên quan, iSpeak 4 tiêu chí mở) — tổng ~25-30 phút/60 phút cần compute AI thật, vượt xa tỷ lệ 15% từng tính cho Kịch bản B.
3. **Năng lực nội bộ (AI Talk) mới đạt 7/10** (biên bản 11/09) — chưa đạt chuẩn hoàn thiện công ty tự đặt cho tương tác thời gian thực chất lượng cao.

### Cái giá phải trả khi chuyển sang đóng

- **Mất khả năng xử lý câu trả lời/giải thích thực sự tự do của học sinh** — mọi chẩn đoán giờ dựa vào lựa chọn đã được gắn nhãn trước (misconception tagging lúc soạn đề), không phát hiện được lỗi tư duy nằm ngoài các dạng đã lường trước.
- **Chấm Speaking chỉ còn phát âm + khớp nội dung theo khung câu** — mất khả năng đánh giá Grammar/Fluency/khả năng diễn đạt tự do, vốn là giá trị khác biệt lớn của bản gốc.
- **Tăng gánh nặng cho đội Học thuật/Content**: cần soạn trước bộ Hint Ladder theo từng dạng lỗi phổ biến cho mỗi NLO, và gắn nhãn misconception cho từng distractor khi viết Question Bank — việc mà bản mở không cần (AI tự suy luận tại chỗ).
- **Video cần nhiều nhánh hơn** (§16 bản gốc) — chi phí sản xuất nội dung tăng, dù không phải chi phí AI real-time.

### Khuyến nghị dùng khi nào

- Dùng **bản đóng này** cho giai đoạn MVP/demo/khảo sát gần (khớp mốc Kịch bản 1 "Adaptive thông thường", ~03/2027, và ngân sách COGS hiện tại).
- Giữ **bản gốc (mở)** làm đặc tả mục tiêu dài hạn cho **Kịch bản 2 "AI Tutor Real-time chuẩn"** (~06/2027), triển khai khi năng lực AI Talk nội bộ vượt ngưỡng hoàn thiện và có ngân sách COGS cao hơn (giá bán/gói cao cấp hơn).

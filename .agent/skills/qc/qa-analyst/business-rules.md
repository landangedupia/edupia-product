---
version: 1.0
updated: 2026-08-25
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/business-rules.md
upstream_sha: 0d5f01257c30182d1c98835303640775d360a3da
---

# Business Rules — Trích xuất luật nghiệp vụ

Trích xuất và liệt kê toàn bộ business rule, điều kiện và ràng buộc từ yêu cầu.

## Khi nào trigger
- "liệt kê business rule cho [X]" / "feature này có luật nghiệp vụ gì"
- Sau spec-breakdown, khi cần làm rõ logic điều kiện trước khi thiết kế TC
- Feature có nhiều điều kiện AND/OR, phân quyền, tính toán, giới hạn

## Khi KHÔNG trigger
- Cần bóc tách tổng thể spec → dùng spec-breakdown
- Cần luồng dữ liệu → dùng data-flow
- Cần phân tích rủi ro / lập test plan → thuộc qa-planner (skill test-plan)

---

## Phase 1 — Quét

1. Đọc spec đã bóc tách (output của spec-breakdown) hoặc tài liệu gốc.
2. Quét tìm: điều kiện ("nếu… thì…"), ràng buộc field, giới hạn (min/max, rate limit),
   quy tắc phân quyền, công thức tính, quy tắc trạng thái, default value.
3. **Checklist ràng buộc field — kiểm tra TẤT CẢ field (kể cả tuỳ chọn / optional):**
   - [ ] `minlength` / `maxlength` — PRD có nêu không? Nếu không → GAP (MISSING)
   - [ ] Ký tự được phép — chữ, số, tiếng Việt có dấu, ký tự đặc biệt, khoảng trắng?
   - [ ] Trim khoảng trắng đầu/cuối — có hay không?
   - [ ] Format đặc biệt — email, SĐT, ngày tháng, v.v.
   > ⚠️ **Field tuỳ chọn (optional) vẫn phải kiểm tra đủ 4 mục trên.** "Không bắt buộc nhập" KHÔNG đồng nghĩa với "không có ràng buộc". Đây là nguồn gốc hay bị bỏ sót khi phân tích.

4. **Checklist đặc biệt — hay bị bỏ sót khi đọc BDD/PRD:**

   **a. Routing table — đọc cả 2 chiều:**
   - [ ] Với MỖI rule "nếu đủ điều kiện → bỏ qua / nếu thiếu → vào": đánh dấu cả 2 nhánh cần test
   - [ ] Routing table N loại tài khoản × M màn → duyệt từng ô, không bỏ dòng nào

   **b. Liệt kê hết variant:**
   - [ ] Spec đề cập nhiều provider/platform/giá trị liệt kê (Google/Facebook, Lớp 1-6...)? → ghi từng variant ra
   - [ ] Với mỗi variant: behavior hoặc content có khác nhau không? Nếu có → đánh dấu cần TC riêng

   **c. Telemetry/event analytics:**
   - [ ] Liệt kê TẤT CẢ event name được nhắc trong BDD/PRD cho UC này
   - [ ] Với mỗi event: trigger khác nhau? → cần TC riêng
   - [ ] Có field nhạy cảm (SĐT, PII) KHÔNG ĐƯỢC vào event? → cần TC verify âm riêng

   **d. Privacy/security assertions âm:**
   - [ ] Spec có nói "KHÔNG ghi", "KHÔNG hiển thị", "chỉ đọc", "KHÔNG vào event"? → ghi ra, cần TC riêng
   - [ ] "Read-only + che X/hiện Y" → 2 TC riêng: (1) hiển thị đúng che/hiện, (2) không chỉnh sửa được

   **e. Validation kế thừa từ UC/AC khác:**
   - [ ] Spec có reference "chuẩn hoá theo ACx", "logic tương tự UCy", "validation như màn Z"? → đọc UC/AC đó
   - [ ] Liệt kê TẤT CẢ scenario normalization của UC nguồn chưa có trong UC hiện tại

   **f. AC có sub-cases:**
   - [ ] Mỗi AC dạng "(1)...→...; (2)...→...; (3)...→..." → đếm số sub-cases, mỗi sub-case 1 TC

---

## Phase 2 — Cấu trúc hoá

Mỗi rule ghi dưới dạng bảng:

| ID | Rule | Điều kiện | Kết quả | Nguồn | Ghi chú/Ưu tiên |
|---|---|---|---|---|---|
| BR-01 | … | … | … | spec §x | … |

Phân loại rule:
- VALIDATION: ràng buộc input (định dạng, bắt buộc, độ dài, range).
- AUTHORIZATION: ai được làm gì.
- CALCULATION: công thức, làm tròn, đơn vị.
- STATE: điều kiện chuyển trạng thái hợp lệ vs cấm.
- LIMIT: rate limit, quota, concurrent.

Với rule có nhiều điều kiện kết hợp → gợi ý dựng **Decision Table** (đầu vào cho qa-designer).

---

## Output

Ghi vào **mục Business Rules** của `{qc_artifact_dir}REQUIREMENT_ANALYSIS.md`
(KHÔNG tạo file riêng — qc-analyze chỉ trả 2 file: `REQUIREMENT_ANALYSIS.md` + `DOC_GAP.md`):

- Bảng business rule có ID (BR-xx) để TC trace ngược về.
- Gợi ý các rule cần Decision Table / BVA khi sang qa-designer.

Rule MÂU THUẪN / KHÔNG RÕ → ghi vào `{qc_artifact_dir}DOC_GAP.md`
(loại CONTRADICTORY / AMBIGUOUS, cột "Ảnh hưởng" trỏ BR-xx).

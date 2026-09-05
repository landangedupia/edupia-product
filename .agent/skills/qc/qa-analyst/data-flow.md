---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/data-flow.md
upstream_sha: fc0fc3d0f8010e3fb266c16b132eff1b23641a8f
---

# Data Flow — Phân tích luồng dữ liệu

Phân tích luồng dữ liệu, input/output, state và điểm tích hợp của feature.

## Khi nào trigger
- "phân tích data flow cho [X]" / "dữ liệu đi qua đâu"
- Feature có nhiều bước, qua nhiều màn hình/API/DB, hoặc tích hợp Kafka/service khác
- Cần xác định điểm tích hợp trước khi thiết kế integration/e2e TC

## Khi KHÔNG trigger
- Chỉ cần bóc tách spec tổng quan → dùng spec-breakdown
- Chỉ cần luật nghiệp vụ → dùng business-rules
- Thiết kế integration TC → dùng qa-designer/integration

---

## Phase 1 — Lập bản đồ

Với mỗi luồng nghiệp vụ, xác định:
1. ĐIỂM BẮT ĐẦU: actor/sự kiện kích hoạt + dữ liệu đầu vào.
2. CÁC CHẶNG: UI → API → service → DB → message queue → service ngoài.
3. BIẾN ĐỔI: dữ liệu được tạo/sửa/xoá/validate ở mỗi chặng.
4. ĐIỂM KẾT THÚC: output, side-effect (email, notification, audit log).

---

## Phase 2 — Mô tả

Thể hiện luồng dạng bước tuần tự hoặc sơ đồ text:

```
[User submit form]
   → POST /api/... (payload: ...)
   → Service validate (rule BR-xx)
   → DB insert bảng X
   → Kafka topic Y (event Z)
   → UI hiển thị kết quả / trạng thái
```

Đánh dấu cho mỗi chặng:
- INTEGRATION POINT (nơi cần integration test).
- STATE CHANGE (dữ liệu/trạng thái thay đổi → cần verify + cleanup).
- FAILURE POINT (nơi có thể lỗi: timeout, validation fail, partial commit).

---

## Output

Ghi vào **mục Data Flow** của `{qc_artifact_dir}REQUIREMENT_ANALYSIS.md`
(KHÔNG tạo file riêng — qc-analyze chỉ trả 2 file: `REQUIREMENT_ANALYSIS.md` + `DOC_GAP.md`):

- Sơ đồ/list luồng dữ liệu cho mỗi kịch bản chính.
- Danh sách integration point + state change + failure point.
- Gợi ý loại test cần cho từng điểm (gui-feature / integration / e2e) khi sang qa-designer.
- Dữ liệu/trạng thái cần chuẩn bị & cleanup → đầu vào fixture cho qa-runner.

Chặng nào luồng/hành vi chưa rõ (vd lỗi xử lý ra sao, retry, partial commit) →
ghi vào `{qc_artifact_dir}DOC_GAP.md` (loại MISSING / OPEN QUESTION).

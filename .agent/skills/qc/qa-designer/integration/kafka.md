---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Integration Kafka (Message/Event)

Skill **tự chứa** để viết TC tích hợp qua Kafka: producer phát event đúng, consumer xử lý
đúng, đảm bảo ordering/idempotency/retry. Chỉ cần load file này.

## Khi nào trigger
- Action sinh event Kafka (vd tạo ticket → phát event sang service/CRM); verify topic/payload/thứ tự/khử trùng

## Khi KHÔNG trigger
- Tích hợp đồng bộ qua API → `integration/api` · verify DB → `integration/db`

---

## Format file TC (bắt buộc)
- Metadata **list**: Title · Feature · Priority · Status(Draft) · Author(AI) · Tags · **Trace** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)` (không có → `⚠️ Chưa có Business Rule`) · **🚫 Block** `[GAP-xx](DOC_GAP.md)`.
- **Test Data** dạng list (payload) · **Steps** `[Action]`/`[Verify]` · **Expected** 1 bullet nêu **topic + field payload / hành vi consumer**.
- Cuối file: Trace matrix + bảng TC block · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- **Message/event:** verify topic, key, payload schema, điều kiện phát.
- **Ordering & idempotency:** thứ tự theo key, message trùng/out-of-order.
- **Error/Retry:** consumer lỗi → retry/DLQ.

## Phase 1 — Clarify
Topic/key/payload + điều kiện phát (khi nào phát/không) · consumer xử lý gì + side-effect + idempotent ·
yêu cầu ordering · xử lý trùng/out-of-order/lỗi (retry, DLQ).

## Phase 2 — Write
Nhóm TC: phát đúng topic+payload (happy) → điều kiện không phát → consumer xử lý đúng → message trùng (idempotent)
→ out-of-order → consumer lỗi → retry/DLQ → ordering theo key. Setup/teardown consumer test.
Mỗi TC bám Format; trace BR; gap chặn → 🚫 Block.

## Output
File TC trong `{qc_artifact_dir}test-cases/`. Mỗi TC ghi topic, key, payload cần verify + hành vi consumer. Bàn giao `qa-reviewer`.

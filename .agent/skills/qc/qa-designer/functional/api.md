---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
---

# Test Case — Functional API (không qua UI)

Skill **tự chứa** để viết TC kiểm thử một API endpoint ở mức chức năng (request → response).
Chỉ cần load file này.

## Khi nào trigger
- "viết test case cho API [method] [path]" — verify contract, validation, mã lỗi của endpoint

## Khi KHÔNG trigger
- Test qua giao diện → `functional/gui-screen`/`gui-feature`
- Luồng dữ liệu API ↔ DB/service khác → `integration/api` · message/event → `integration/kafka`

---

## Format file `TC_<FEATURE>.md` (bắt buộc)
- 1 file/feature · mỗi TC **1 concept** · metadata **list** (không bảng/emoji): Title · Feature ·
  Priority(P0/P1/P2) · Status(Draft) · Author(AI) · Tags · Trace · 🚫 Block(nếu có).
- **Trace:** `[BR-xx](REQUIREMENT_ANALYSIS.md#3-business-rules)`; không có BR → `⚠️ Chưa có Business Rule`.
- **🚫 Block:** TC phụ thuộc gap vẫn viết đủ + `[GAP-xx](DOC_GAP.md) — lý do`.
- **Test Data:** dạng **list** (request cụ thể: method/path/headers/body). **Steps:** `[Action]`/`[Verify]`.
  **Expected:** 1 bullet nêu rõ **status code + field response cần chốt** (không ✅/❌).
- Cuối file: **Trace matrix** (BR↔TC, ⚠️ TC thiếu BR) + **bảng TC bị block** · bỏ nội dung gạch ngang.

## Kỹ thuật áp dụng
- Mỗi field request → **EP** (phân vùng valid/invalid) + **BVA** (biên độ dài/giá trị).
- Tổ hợp điều kiện (auth × param × state) → **Decision Table**.

## Phase 1 — Clarify
Endpoint (method/path/auth/role/content-type) · request (path/query/body schema: field, kiểu, bắt buộc, ràng buộc) ·
response (schema thành công + các mã lỗi 4xx/5xx + body lỗi) · side-effect (nếu cần verify → cân nhắc `integration/api`).

## Phase 2 — Write
- Nhóm TC: happy (200 + schema đúng) → validation (400 từng field, dùng EP/BVA) → auth (401/403)
  → not found (404) → edge (payload lớn, ký tự đặc biệt, rate limit).
- Mỗi TC bám khối Format; Expected ghi status code + phần body verify; trace BR; gap chặn → 🚫 Block.

## Output
File TC (`TC_<FEATURE>_API.md` hoặc gộp trong file feature) trong `{qc_artifact_dir}test-cases/`.
In bảng TC + Trace matrix. Bàn giao `qa-reviewer`.

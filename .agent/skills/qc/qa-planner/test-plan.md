---
version: 1.0
updated: 2026-06-11
ported_from: ui-automation-testing
upstream_path: skills/qa-tc-analyst/test-plan.md
upstream_sha: f259b4d123c565a42ba6c6ec96980a8e4c66284f
---

# Lập Test Plan

Tổng hợp **output của qa-analyst** thành **Test Plan** cho một feature — tức **một plan cho cả
(PRD × nền)**, các UC là các hàng bên trong.

**Đầu vào (bắt buộc, chỉ 2 nguồn — đúng 2 file qa-analyst trả ra):**
1. `{qc_artifact_dir}REQUIREMENT_ANALYSIS.md` — chức năng, BR-xx, AC-xx, data flow của **mọi UC
   trong phạm vi**, kèm mục *Mâu thuẫn chéo UC* (qa-analyst).
2. `{qc_artifact_dir}DOC_GAP.md` — bảng gap 11 cột `GAP-UC{N}-{nnn}`, mức độ, gap Blocker, và
   bảng *Phạm vi phân tích* (qa-analyst). **Lọc cột `UC`** khi cần phần của một UC cụ thể.

## Khi nào trigger
- "lập test plan cho [Feature]" / "viết test plan"
- Sau khi qa-analyst xong (đã có REQUIREMENT_ANALYSIS + DOC_GAP)
- Trước khi qa-designer thiết kế chi tiết TC — test plan là khung định hướng

## Khi KHÔNG trigger
- Chưa có REQUIREMENT_ANALYSIS / DOC_GAP → chạy qa-analyst trước
- Thiết kế test case chi tiết (.Test.md) → dùng qa-designer
- Bóc tách yêu cầu/spec, lập danh sách gap → dùng qa-analyst

---

## Phase 1 — Thu thập đầu vào

1. Đọc `REQUIREMENT_ANALYSIS.md`: nắm chức năng, các BR-xx và AC-xx, data flow,
   integration/failure point.
2. Đọc `DOC_GAP.md`: lấy danh sách gap, đặc biệt **gap Blocker còn Open** → đây là
   nguồn cho cột "Phụ thuộc" và cho Entry criteria.
3. Map mỗi nhóm BR sang **layer test** của qa-designer: functional/gui-screen,
   gui-feature, api, integration, e2e/journey, non-functional.
4. **Bỏ qua nội dung gạch ngang** (đã loại ở qa-analyst) — không đưa vào plan.

---

## Phase 2 — Lập Test Plan

Điền đủ template bên dưới. Nguyên tắc:
- Mỗi **vùng test** map về BR-xx cụ thể, gắn **Layer + Loại test + Priority + ước lượng TC**;
  hiển thị **rule chi tiết** ngay trong bảng (cột riêng, dùng `<br>` cho nhiều rule).
- **Priority theo rủi ro suy ra từ BR + gap:** core function / logic định tuyến / sinh
  mã / tiền-dữ liệu = P0.
- Vùng/journey còn phụ thuộc **gap Blocker** → ghi rõ cột "Phụ thuộc" (GAP#); Entry
  criteria yêu cầu đóng các gap đó trước khi thiết kế TC.
- Liệt kê **E2E journey** đầy đủ (mỗi journey: tiền điều kiện, kết quả/định tuyến kỳ
  vọng, BR, phụ thuộc, priority) + bộ **verify point chung** sau submit.
- Mục Rủi ro: **nạp `risk-model.md`** — quét đủ 7 nguồn, chấm khả năng × thiệt hại → P0–P3,
  rồi dùng mức đó chia độ sâu test. Đừng chấm thẳng ra P0/P1 theo cảm tính.

---

## Output — Template `TEST_PLAN.md`

Đặt tại `{qc_artifact_dir}TEST_PLAN.md`:

```markdown
# Test Plan – <TICKET-ID> <Tên feature> / <nền>

| Trường | Giá trị |
|---|---|
| Feature / Project / Module | `<TICKET-ID>` — … |
| Nền (platform) | `<web \| app \| system>` |
| UC trong phạm vi | `<UC-ID>` · `<UC-ID>` … (`⏸ chưa xét`: `<UC-ID>`) |
| Người lập | qa-planner |
| Ngày / Phiên bản | … |
| Nguồn | REQUIREMENT_ANALYSIS · DOC_GAP |

## 1. Mục tiêu
Mục tiêu test của feature (1–3 câu).

## 2. Phạm vi
- **In scope:** chức năng/BR được test, **theo từng UC** (`<UC-ID>`: …).
- **Out of scope:** phần để tài liệu/feature khác; nội dung gạch ngang đã loại; và **UC
  `⏸ Chưa xét`** (BDD chưa `approved`) — liệt kê rõ mã UC + lý do. *Không ghi ra thì một UC bị
  bỏ trông giống một UC không có gì để test.*

## 3. Test items theo vùng & độ ưu tiên
Bảng — mỗi vùng kèm rule chi tiết + metadata:

| # | UC | Vùng test | Rule chi tiết | Layer (qa-designer) | Loại test | Pri | Ước lượng |
|---|---|---|---|---|---|---|---|
| ① | `<UC-ID>` | <vùng> | **BR-xx:** … <br>**BR-yy:** … | functional/gui-screen | Functional/Negative | P0 | n |
| … | … | … | … | … | … | … | … |

*Cột `UC` bắt buộc — một plan phủ nhiều UC, không có nó thì không ai biết vùng test nào của UC nào.*

> Tổng ước lượng sơ bộ: ~N test case (+ E2E).

### 3.1 Danh sách E2E đầy đủ
Verify points chung (sau Submit): V1 tạo thành công · V2 mã/ID đúng · V3 hiển thị danh
sách · V4… · Trục bao phủ: <các chiều tổ hợp>.

| ID | Journey | Tiền điều kiện | Kết quả kỳ vọng | BR | Phụ thuộc | Pri |
|---|---|---|---|---|---|---|
| E2E-XX-01 | … | … | … | BR-… | GAP# | P0 |

## 4. Cách tiếp cận (Test approach)
Kỹ thuật áp dụng: EP+BVA, Decision Table (cho logic điều kiện), state/lookup,
integration, negative/exploratory; tự động hoá theo `CLAUDE.md` (Playwright + pytest-playwright + Trace + pytest-html).

## 5. Tiêu chí Vào / Ra
- **Entry (chấm theo TỪNG UC, không chấm cả PRD):** gap 🔴 Blocker của **UC đó** (lọc cột `UC`
  trong DOC_GAP) đã Answered; doc phụ thuộc sẵn sàng; môi trường + tài khoản role.
  Ghi `Ready`/`Blocked` cho mỗi UC — blocker ở UC3 không dừng thiết kế test UC1.
- **Exit:** pass P0=100%, P1≥95%; không còn defect Blocker/Critical; mọi BR/AC được trace; báo cáo pytest-html + Playwright Trace.

## 6. Rủi ro (risk-based)
| Rủi ro | Nguồn | Khả năng | Thiệt hại | Mức | Giảm thiểu |
(cách chấm mức + 7 nguồn rủi ro + cách dùng mức để chia độ sâu test: xem `risk-model.md`)

## 7. Dữ liệu & Môi trường
Tài khoản các role, dữ liệu mẫu (biên/edge), môi trường staging.

## 8. Deliverables
Test case `.Test.md`, script Playwright/pytest + Page Object, báo cáo pytest-html + Playwright Trace.

## 9. Lịch trình (milestone phụ thuộc gap)
| Mốc | Điều kiện | Trạng thái |
M0 phân tích → M1 đóng gap → M2 thiết kế TC → M3 review TC → M4 chạy → M5 review script.

## 10. Trạng thái hiện tại
Blocked/Ready + phần có thể làm sớm (không phụ thuộc gap Blocker).
```

Kết thúc bằng: tóm tắt số vùng test + tổng TC ước lượng + trạng thái (Ready/Blocked dựa
trên gap Blocker còn Open) và gợi ý bước kế tiếp (bàn giao qa-designer khi đã Ready).

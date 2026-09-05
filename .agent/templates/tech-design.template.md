<!--
  ════════════════════════════════════════════════════════════════════════════
  TEMPLATE: Tài liệu Thiết kế Kỹ thuật (per-PRD, full-stack, gộp)
  Dùng bởi: /generate-tech-docs
  ════════════════════════════════════════════════════════════════════════════

  MÔ HÌNH PHẠM VI
  - MỘT tài liệu cho mỗi PRD (không phải per-UC). Nó bao phủ MỌI use case của PRD
    trong một thiết kế full-stack gộp: backend (API, mô hình dữ liệu, DB) VÀ client
    (component, state, tích hợp API) đặt cạnh nhau, nối bằng sequence diagram xuyên
    tầng. Đây là "bản vẽ thi công" mà bất kỳ dev nào mở ra để implement cả feature.
  - ĐẦU VÀO là các file BDD của PRD (web/ · app/ · system/), KHÔNG phải văn xuôi PRD.
    PRD chỉ nạp để lấy bối cảnh Overview/Goals/Actors.

  TĂNG DẦN / APPEND
  - Khi BDD mới được thêm vào cùng PRD về sau, tài liệu này được MỞ RỘNG, không sinh
    lại: thêm section + sequence diagram của UC mới, cập nhật ma trận Độ phủ UC (§10)
    và Changelog. KHÔNG bao giờ đè nội dung có sẵn hay chỉnh tay.

  QUY TẮC ĐIỀN
  - Thay MỌI placeholder {…} bằng nội dung thật. Xoá các comment hướng dẫn.
  - THUẬT NGỮ: tuân 100% từ điển dự án (specs/domain-knowledge/business-dictionary.md).
    Giá trị status/enum → core-entities.md (Enum Registry). Entity → core-entities.md.
  - Giữ code/DTO/DB mẫu theo idiom stack của dự án (xem stack-profile của module đang
    dùng). Snippet C#/Angular bên dưới chỉ MANG TÍNH MINH HOẠ — thay bằng stack thật.
  - Section không áp dụng cho PRD này: GIỮ heading và viết "N/A — {lý do}" thay vì
    xoá, để cấu trúc luôn nhất quán, dễ đoán.
  - Mọi sequence diagram / API / rule phải truy vết được về một scenario: tham chiếu
    id SC (vd UC1-SC3) mà nó phục vụ.
-->

# {Feature Area} — Tài liệu Thiết kế Kỹ thuật: {PRD Title}

<!-- Khối @trace (cấp PRD). ucs = mọi UC mà doc này phủ; nối thêm id khi thêm UC. GIỮ NGUYÊN key @trace.* — máy đọc. -->
---
@trace.id: {TICKET-ID}
@trace.domain: {domain}
@trace.prd: {TICKET-ID}
@trace.ucs: {TICKET-ID}-UC1, {TICKET-ID}-UC2{, …}
@trace.service: {service — từ header BDD @trace.service}
@trace.module: {module liên quan — vd dotnet, angular}
@trace.platforms: {system | web | app | webview | … — tuỳ thư mục BDD nào tồn tại}
@trace.bdd_versions: {MAP theo từng platform — số nhiều, KHÁC @trace.bdd_version (scalar) của .feature — vd system=1.5, web=1.9, app=1.7; chỉ platform có mặt. Mỗi feature mang bdd_version riêng; đừng gộp về một số.}
@trace.api_source: {existing | —}
@trace.revision: 1
@trace.status: draft
@trace.generated_at: {YYYY-MM-DD}
---

> **Tài liệu liên quan:** {link các PRD / tech-design anh em mà doc này phụ thuộc, vd [OTHER-TICKET](../{other-slug}/tech-docs/{OTHER-TICKET}-tech-design.md)}. Xoá nếu không có.

## 1. Tổng quan (Overview)

<!-- 2–4 câu: feature làm gì, ai dùng, hình dạng kỹ thuật cốt lõi (nguồn dữ liệu,
     side effect chính). Nêu rõ dữ liệu đến từ đâu (DB vs API ngoài) và thao tác ghi
     chính. Nguồn: PRD + system BDD. -->

{Feature làm gì, tác nhân chính, và cơ chế kỹ thuật cốt lõi. Nêu rõ dữ liệu nào được
sở hữu (DB) vs lấy live (API ngoài), và thao tác ghi chính.}

### Mục tiêu (Goals)

<!-- Liệt kê mục tiêu kỹ thuật — suy từ mục tiêu PRD, diễn đạt thành thứ hệ thống
     phải đảm bảo. -->

- {Mục tiêu 1}
- {Mục tiêu 2}

### Tác nhân nghiệp vụ (Business Actors)

| Tác nhân | Mô tả | Kênh |
|-------|-------------|---------|
| {Actor} | {vai trò & quyền} | {đường vào, vd App → Widget → Portal → API} |

---

## 2. Tổng quan Kiến trúc (Architecture Overview)

### 2.1 Kiến trúc tổng thể (High-level Architecture)

<!-- ASCII (hoặc mermaid) topology thể hiện các hệ thống feature này chạm tới:
     client → gateway → service(s) → data store / API ngoài. Chỉ giữ các component
     mà PRD NÀY thực sự dùng. Nguồn: architecture.md / project-context.yaml (services, stack). -->

```
{Sơ đồ ASCII hoặc mermaid các component feature này chạm tới}
```

> **Lưu ý:** {chỉ ra dữ liệu nào lấy live từ API ngoài vs lưu trong DB sở hữu, và lớp cache + TTL nếu có.}

### 2.2 Mẫu giao tiếp (Communication Patterns)

| Mẫu | Dùng cho | Phạm vi (UC/SC) |
|---------|-------|---------------|
| {Client → Gateway → API} | {auth / action} | {UC1} |
| {API → API ngoài} | {lấy gì, cache TTL} | {UC1-SC…} |

---

## 3. Mô hình Dữ liệu (Data Model)

<!-- Nguồn: core-entities.md (entity sở hữu) + mệnh đề Then của BDD (state) + PRD.
     Phân biệt entity SỞ HỮU (trong DB) với model NGUỒN-API (lấy live, không lưu).
     Chỉ liệt kê field mà PRD này đọc hoặc ghi. -->

### 3.1 Thiết kế Entity (Entity Design)

#### {EntityName} ({DB entity | POCO nguồn-API})

{Một dòng: nó biểu diễn gì, và được lưu hay lấy live.}

| Field | Kiểu | Dùng trong {TICKET-ID} |
|-------|------|----------------------|
| `{field}` | `{type}` | {feature này dùng thế nào — đọc/ghi, SC nào} |

<!-- Lặp lại cho mỗi entity. Nếu feature có chuyển trạng thái đáng kể, thêm bảng/sơ đồ
     state nhỏ như dưới. -->

**Chuyển trạng thái (nếu có):**

```
{state A}:  {điều kiện}  → {kết quả / tín hiệu UI}
{state B}:  {điều kiện}  → {kết quả}
```

**Ràng buộc:**
- {invariant enforce ở tầng application/DB, vd đúng một primary cho mỗi tenant}

### 3.2 Quan hệ Entity (Entity Relationships)

```
{sơ đồ quan hệ — cardinality, khoá join, field nào read-only vs sở hữu}
```

### 3.3 Ranh giới Nguồn dữ liệu (Data Source Boundaries)

<!-- Phát biểu gọn PRD NÀY đọc gì vs ghi gì, và cái gì được uỷ thác nơi khác.
     Chống lem phạm vi. -->

**Phạm vi {TICKET-ID}: {ĐỌC … / GHI …}.**

| Trách nhiệm | Trong phạm vi? | Do ai xử lý |
|----------------|-----------|-----------|
| {đọc list đã gộp} | ✅ Có | {endpoint / service} |
| {ghi cờ X} | ✅ Có | {service} |
| {dữ liệu gốc} | ❌ Read-only | {API ngoài + cache} |
| {mối lo module khác} | ❌ Không | {module/team} |

### 3.4 Multi-tenant & Sharding

<!-- Chỉ khi dự án multi-tenant. Nếu không, viết "N/A — single tenant". -->

- {khoá tenant trên entity, cách ly bằng query-filter, phân giải shard — từ architecture.md}

---

## 4. Hợp đồng API (API Contracts)

<!-- Contract backend. Greenfield: thiết kế endpoint từ scenario BDD. Brownfield
     (@trace.api_source = existing): reverse-document API đang chạy as-is và ghi chú
     gap so với kỳ vọng BDD. Đánh dấu REUSE vs NEW rõ ràng.
     PRD CHỈ-CLIENT (không có BDD system/ — feature này không sở hữu backend): ĐỪNG
     bịa contract BE. §4.1 khi đó liệt kê các endpoint mà client TIÊU THỤ (ngoài /
     bên thứ ba / của team khác / có sẵn), đánh dấu "consumed (external)",
     reverse-document từ mệnh đề Then của BDD client + PRD; chỉ điền §4.2/§4.3 nếu
     biết shape. Nếu feature không gọi mạng gì cả → viết "N/A — client-only, no backend".
     §4.5.4 ánh xạ method client tới bất cứ gì §4.1 liệt kê (hoặc không có). -->


### 4.1 Endpoints

```
{METHOD} {/path}          # NEW | REUSE ({nguồn}) — {mục đích một dòng}
```

### 4.2 Model Request/Response (Request/Response Models)

<!-- Thể hiện shape DTO theo idiom của stack. Ghi rõ field nào đến từ DB vs API ngoài. -->

```{lang}
{định nghĩa DTO kèm comment nguồn từng field}
```

### 4.3 Validation & Mã lỗi (Validation & Error Codes)

**Quy tắc validation:**

```{lang}
{quy tắc validation, theo idiom stack (vd FluentValidation / class-validator)}
```

| Code | HTTP Status | Mô tả | Trace |
|------|-------------|-------------|-------|
| `{ERROR_CODE}` | {4xx/5xx} | {khi nào phát sinh} | {UC1-SC…} |

### 4.4 Logic Handler (endpoint chính)

<!-- Với các thao tác ghi không tầm thường, viết rõ các bước có thứ tự (validation →
     transaction → commit/rollback → return). Giữ sequence diagram và code khớp nhau. -->

**{HandlerName}:**
1. {bước}
2. {bước — ranh giới transaction nếu có}

### 4.5 Ánh xạ Component UI (UI Component Mapping) — {platform} ({framework})

<!-- Thiết kế CLIENT, NHÓM THEO PLATFORM: một section "### 4.5 … — {platform}" cho mỗi
     platform client có trong BDD (một nhóm web, một nhóm app). ĐỪNG đặt tên heading
     này theo màn hình — màn hình/UC nằm ở các sub-block bên dưới.
     Bên trong một nhóm platform:
       • §4.5.1 Cây Component — lặp sub-block theo màn hình/UC:
         "#### 4.5.1.x {Screen} — {UC}". Một PRD nhiều màn hình/UC → nhiều sub-block
         trong CÙNG nhóm platform (không bao giờ tạo nhóm 4.5 thứ hai cho cùng platform).
       • §4.5.2–§4.5.5 — tương tự theo màn hình/UC ở chỗ chúng khác nhau.
       • §4.5.6 Test Selectors — MỘT bảng dùng chung cho cả nhóm platform; cột
         "Phục vụ SC" mang (UC · SC) để consumer per-UC lọc row của mình.
     Append: platform mới → nhóm "### 4.5 — {platform}" mới; màn hình/UC mới trong
     platform đã có → thêm sub-block + row vào §4.5.6 (đừng lặp nhóm).
     Bỏ hẳn §4.5 với PRD backend-only. -->

> **Nguồn:** {file Figma + node id, từ design-spec}
> **Stack:** {framework, state primitive, thư viện component}
> <!-- @figma.url: {url figma cấp node} -->

#### 4.5.1 Cây Component (Component Hierarchy) — {Screen} ({UC})

<!-- Lặp sub-block này theo màn hình/UC trong nhóm platform này (4.5.1.a, 4.5.1.b …). -->

```
{cây component — container vs presentational, con có điều kiện}
```

#### 4.5.2 Ánh xạ file Component (Component File Mapping)

| Component | Path | Loại | Trách nhiệm |
|-----------|------|------|---------|
| `{Component}` | `{path}` | {Feature/Child} | {trách nhiệm} |

#### 4.5.3 Quản lý State (State Management) ({state primitive})

<!-- Shape state suy từ mệnh đề Then của System BDD + shape response từ §4.2.
     Thể hiện giá trị dẫn xuất/tính toán và input của chúng. -->

```{lang}
{khai báo state kèm comment nguồn (mỗi cái map tới field BDD / field BE nào)}
```

#### 4.5.4 Tầng tích hợp API (API Integration Layer — port/adapter)

<!-- Cấu hình modal/route + bản đồ tích hợp API: mỗi method service client → một
     endpoint THẬT từ §4.1 (đừng bịa endpoint). Lỗi → state UI theo từng SC.
     Bảng này là thứ /generate-code --phase=integration đọc để wire adapter thật. -->

| Method client | Endpoint (§4.1) | Map request | Response → model | Lỗi → UI |
|---------------|-----------------|-------------|------------------|-----------|
| {svc.getX()} | {GET /…} | {params} | {DTO → ViewModel} | {4xx → state/toast} |

#### 4.5.5 Ánh xạ Figma → Design System

| Element Figma | Class/token design system | Ghi chú |
|---------------|---------------------------|-------|
| {element} | {class / token} | {size, màu, state} |

#### 4.5.6 Test Selectors — id element cho phần tử có action (hợp đồng QC)

<!-- Test-id ổn định cho mỗi element tương tác để QC định vị trực tiếp (không scan
     runtime). Quy ước: {uc-lower}-{screen}-{element}-{type}; ĐỪNG nhúng số scenario.
     Attribute theo platform: web data-testid · RN testID · Flutter Key/Semantics ·
     iOS accessibilityIdentifier. Dùng lại CÙNG giá trị id trên web/app cho cùng một
     element logic.
     MỘT bảng dùng chung cho cả nhóm platform (phủ mọi màn hình/UC của platform này).
     Cột "Phục vụ SC" mang (UC · SC) để consumer per-UC (generate-code / qc) lọc row
     của mình qua §10. Nhóm §4.5 này vốn đã theo platform, nên platform là ngầm định
     (khối web → web · SC). -->

| Test-ID | Element | Component (§4.5.1.x) | Action | Phục vụ SC (UC · SC) |
|---------|---------|----------------------|--------|---------------------|
| `{uc}-{screen}-{element}-{type}` | {Nút submit} | {Component} | {submit} | {UC1 · SC1, UC1 · SC3} |

---

## 5. Luồng chính (Key Flows — Sequence Diagrams)

<!-- MỘT mermaid sequence diagram cho mỗi scenario đáng kể. Participant xuyên tầng:
     component client → service → API → API ngoài → DB.
     ⚠ id SC chỉ duy nhất trong phạm vi (UC × platform): `{UC}-SC1` ở `system` và
     `{UC}-SC1` ở `web` là HAI scenario KHÁC nhau. Nên gom luồng vào các LANE PLATFORM
     (5.A system · 5.B web · 5.C app) và LUÔN ghi kèm platform với SC, vd
     "(web · UC1-SC1)". Đừng bao giờ viết "UC1-SC1" trơ ở đây — mơ hồ.
     Chỉ đưa các lane có BDD tồn tại trong PRD này. -->

### 5.A Luồng System

<!-- Một diagram cho mỗi scenario system-BDD. Bỏ lane này nếu không có BDD system/. -->

#### 5.A.1 {tên} (system · {UC}-SC…)

```mermaid
sequenceDiagram
    participant {A} as {Actor}
    {…}
```

### 5.B Luồng Web

<!-- Một diagram cho mỗi scenario web-BDD. Bỏ lane này nếu không có BDD web/. -->

#### 5.B.1 {tên} (web · {UC}-SC…)

```mermaid
sequenceDiagram
    {…}
```

### 5.C Luồng App

<!-- Một diagram cho mỗi scenario app-BDD. Bỏ lane này nếu không có BDD app/. -->

#### 5.C.1 {tên} (app · {UC}-SC…)

```mermaid
sequenceDiagram
    {…}
```

<!-- Đánh số trong từng lane: 5.A.1, 5.A.2 … / 5.B.1 … / 5.C.1 …. Với scenario mà
     hiệu ứng lấn sang module khác, ghi "(covered by {OTHER-UC})". -->

**Điểm tích hợp chính (bảng tuỳ chọn cho mỗi luồng):**

| Bước | Chuyển trạng thái | Verify bởi (platform · SC) |
|------|------------------|-----------------------------|
| {bước} | {trước → sau} | {web · UC1-SC…} |

---

## 6. Điểm tích hợp (Integration Points)

| Tích hợp | Chiều | Phương thức | Mô tả |
|-------------|-----------|--------|-------------|
| {Client → API} | Outbound (client) | {REST/Bearer} | {gì} |
| {API → Ngoài} | Outbound (server) | {REST + header} | {gì, cache TTL} |

### 6.1 Event Bus / Messaging

<!-- Event Kafka/queue mà feature này produce/consume. "N/A — no events" nếu không có. -->

{events, hoặc N/A}

### 6.2 Phụ thuộc Cross-Service (Cross-Service Dependencies)

| Service phụ thuộc | Cần gì | Contract | Trạng thái |
|-------------------|---------------|----------|--------|
| {service} | {cần} | {endpoint} | {✅ Có / ⚠️ pending} |

---

## 7. Bảo mật & Phân quyền (Security & Authorization)

### 7.1 Xác thực (Authentication)

{Luồng auth + loại token/TTL. Nguồn: auth PRD + rule dự án.}

### 7.2 Quy tắc Phân quyền (Authorization Rules)

| Action | Role/quyền yêu cầu | Mô tả | Trace |
|--------|--------------------------|-------------|-------|
| {action} | {role} | {enforce thế nào, ở đâu} | {UC1-SC… / ngoài phạm vi} |

---

## 8. Xử lý lỗi & Trường hợp biên (Error Handling & Edge Cases)

<!-- Một row cho mỗi scenario lỗi / biên / âm trong BDD. Phải khớp với mã lỗi §4.3
     và các sequence diagram lỗi §5. -->

| Scenario | Chiến lược | Chi tiết | Trace |
|----------|----------|---------|-------|
| {điều kiện} | {cách xử lý} | {hành vi, message, side effect} | {UC1-SC…, BR…} |

---

## 9. Quyết định Thiết kế (Design Decisions)

<!-- Cái "vì sao" đằng sau các lựa chọn không hiển nhiên, kèm phương án đã cân nhắc.
     Nguồn: alternatives/assumptions của PRD + lập luận lúc sinh. Đây là thứ giúp
     reviewer tin tưởng thiết kế. -->

| # | Quyết định | Lý do | Phương án đã cân nhắc |
|---|----------|-----------|-------------------------|
| 1 | **{quyết định}** | {vì sao} | {phương án — vì sao loại} |

### Ánh xạ NFR → Thiết kế (NFR-to-Design Mapping)

| Nhóm NFR | Yêu cầu PRD | Quyết định thiết kế |
|--------------|-----------------|-----------------|
| {vd Cách ly multi-tenant} | {yêu cầu} | {cơ chế} |

---

## 10. Độ phủ UC (UC Coverage)

<!-- ĐIỂM NEO ĐỂ APPEND **và là MỤC LỤC cho consumer per-UC**. Mọi UC của PRD có một
     row; mọi scenario map tới (các) section thiết kế nó.
     - /generate-tech-docs dùng nó để phát hiện cái gì đã phủ vs còn thiếu.
     - /generate-code, /map-testids, /qc-* làm việc trên MỘT UC của doc cấp-PRD — chúng
       tra UC này Ở ĐÂY trước để định vị scenario của nó → các section/lane-§5 (và do đó
       các endpoint §4.1 mà luồng §5 của nó gọi) thuộc về nó. Đừng lấy
       endpoint/section của UC khác.
     ⚠ Độ phủ scenario khoá theo (platform, SC) vì id SC lặp giữa các platform —
     cột Platform để phân biệt. -->

| UC | Feature | Platforms | Section phủ | Trạng thái |
|----|---------|-----------|------------------|--------|
| {TICKET-ID}-UC1 | {title} | {system, web, app, webview…} | §… | ✅ Covered |

### Độ phủ Scenario UC1

<!-- Một row cho mỗi (platform, SC). Cùng số SC ở platform khác nhau = scenario khác
     nhau → row riêng. -->

| Platform | Scenario | Section | Business rule |
|----------|----------|---------|---------------|
| system | {UC}-SC1: {tên} | §5.A.1 | {BR…} |
| web | {UC}-SC1: {tên} | §4.5 (web), §5.B.1 | {BR…} |

<!-- Lặp một khối scenario-coverage cho mỗi UC. -->

---

## 11. Cross-cutting & Giả định (Tham chiếu ngoài phạm vi)

<!-- Các mối lo upstream mà PRD này PHỤ THUỘC VÀO nhưng không implement (cổng admin,
     UI downstream ở module khác, snapshot đơn hàng…). Giữ để có bối cảnh liên team.
     Tham chiếu UC/team sở hữu + doc. Nguồn: out-of-scope của PRD + ghi chú BR
     "out of scope" trong BDD. -->

### 11.1 {Mối lo}

> {Trích câu BDD/PRD đã scope nó ra ngoài.}

{Giải thích ranh giới + một sequence diagram tham chiếu nếu hữu ích.}

**Sở hữu bởi:** {team / module}. Xem {link}.

---

## 12. GAP Register — ẩn số thiết kế chưa chốt

<!--
  Mọi [GAP: Gn] / [ASSUMPTION: An] đánh dấu inline trong doc PHẢI có đúng MỘT dòng ở đây
  (và ngược lại — không marker mồ côi, không dòng thừa). Đây là sổ quản lý vòng đời ẩn số.

  - Loại:
      • nội tại      — BE tự quyết (đóng: BE điền giá trị, thay marker)
      • cross-service — cần team/partner khác (đóng: qua T7 sign-off của owner)
      • spec-defect  — BDD/PRD sai/thiếu (KHÔNG tự đóng: escalate PO sửa .feature/PRD → regen; xem §9 Conflict)
  - Severity:
      • 🔴 blocker    — code BẮT BUỘC phải có mới đúng → CHẶN approve
      • 🟢 non-blocker — đoán tạm chạy được, chỉ cần confirm → không chặn
    (Nhãn GAP/ASSUMPTION KHÔNG tự quyết severity — một ASSUMPTION vẫn có thể là blocker nếu đoán sai sẽ vỡ.)
  - Status: open → resolved (owner điền giá trị thật → thay marker inline → bump @trace.revision).

  GATE: còn ≥1 🔴 blocker ở trạng thái `open` → @trace.status KHÔNG được lên `approved`
        (giữ `in-review`) → generate-code bị chặn. Cùng pattern design-spec giữ `draft` khi còn ❌ Missing.
-->

| id | Dùng ở (§) | Điều chưa biết | Loại | Owner confirm | Severity | Status | Đóng thế nào |
|----|-----------|----------------|------|---------------|----------|--------|--------------|
| G1 | {§4.3} | {shape lỗi khi partner từ chối} | cross-service | {team-payment} | 🔴 blocker | open | {T7 sign-off — owner cung cấp contract} |
| A1 | {§4.1} | {timeout mặc định 30s} | nội tại | {BE lead} | 🟢 non-blocker | open | {BE xác nhận, thay giá trị} |

> Nếu doc **không có** ẩn số nào → ghi "Không có — mọi thiết kế đều có nguồn." **KHÔNG** bịa dòng để lấp trống.

---

## Tham chiếu Thiết kế Figma (Figma Design References)

<!-- @figma.url: {url figma cấp node cho mỗi màn hình} -->
- {Screen}: [Figma — {frame}]({url})
- Exported: {YYYY-MM-DD}

---

## Changelog

| Revision | Ngày | Thay đổi |
|----------|------|---------|
| 1 | {YYYY-MM-DD} | Sinh lần đầu từ BDD {TICKET-ID} (v{bdd_version}): {liệt kê UC đã phủ} |
<!-- Khi append: thêm một row cho mỗi lần mở rộng, vd "2 | {ngày} | Thêm UC3 (§5.9, §10) từ BDD mới v{n}" -->

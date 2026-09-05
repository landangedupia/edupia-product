---
last_verified: {{YYYY-MM-DD}}
verified_by: {{AUTHOR}}
---

# {{SYSTEM_NAME}} — Bối cảnh Kiến trúc (Architecture Context)

> Nguồn chân lý duy nhất (single source of truth) về kiến trúc hệ thống — phục vụ cả bối cảnh sinh code (AI agents) lẫn các vấn đề vận hành (triển khai, CI/CD, NFR).
>
> HƯỚNG DẪN DÙNG TEMPLATE:
> - Điền các `{{PLACEHOLDER}}`, xoá comment hướng dẫn (`<!-- ... -->`) sau khi điền.
> - Không cần điền tay: nên chạy `/generate-architecture` để tự hút từ config/tài liệu/code + phỏng vấn, rồi con người verify.
>
> PHÂN TẦNG (tier) — mỗi mục có marker `<!-- tier: core|conditional|ops -->`:
> - **core** — luôn điền. Kiến trúc nền mà mọi feature cần.
> - **conditional** — chỉ giữ nếu hệ thống thực sự có (multi-tenant, message bus, sharding…). Không dùng → để dạng STUB hoặc xoá hẳn.
> - **ops** — vận hành, chỉ để người đọc. AI **KHÔNG** nạp khi sinh code/tech-design.
>
> ĐIỀN DẦN: không phải điền hết một lần. Mục chưa làm để dạng STUB rồi lấp sau bằng `/generate-architecture --section=<slug>`:
> ```
> ## Multi-tenant  <!-- tier: conditional --> <!-- status: stub -->
> > ⏳ Chưa tài liệu hoá. Chạy `/generate-architecture --section=multi-tenant` khi cần, hoặc điền tay.
> ```

<!-- ════════════════════ CORE (luôn điền) ════════════════════ -->

## Công nghệ sử dụng (Tech Stack)  <!-- tier: core -->

| Tầng | Công nghệ | Phiên bản / Ghi chú |
|---|---|---|
| Backend | {{BACKEND_TECH}} | {{VERSION}} |
| Frontend | {{FRONTEND_TECH}} | {{VERSION}} |
| ORM / Truy cập dữ liệu | {{ORM}} | {{VERSION}} |
| Database | {{DATABASE}} | {{PRIMARY_STORE_NOTE}} |
| Caching | {{CACHE}} | {{CACHE_NOTE}} |
| Event Bus / Messaging | {{MESSAGING}} | {{MESSAGING_NOTE}} |
| API Gateway | {{GATEWAY}} | {{GATEWAY_NOTE}} |
| Kiểm thử | {{TEST_STACK}} | {{TEST_NOTE}} |
<!-- Thêm/bớt dòng theo thực tế. Cột Ghi chú nên ghi ràng buộc cụ thể AI cần biết (vd: "dùng cho mọi màn hình list", "thư viện private wrapper"). -->

## Các tầng kiến trúc (Architecture Layers)  <!-- tier: core -->

Kiểu kiến trúc: `{{ARCH_STYLE}}`  <!-- vd: Layered / Clean / Hexagonal / Component-based -->

```
{{LAYER_DIAGRAM}}
```
<!-- Ví dụ Clean Architecture:
┌──────────────────────────────────────┐
│  Presentation   │  Controllers, Middleware
├──────────────────────────────────────┤
│  Application    │  Use Cases, DTOs, Interfaces
├──────────────────────────────────────┤
│  Domain         │  Entities, Value Objects, Events
├──────────────────────────────────────┤
│  Infrastructure │  ORM, Cache, Messaging
└──────────────────────────────────────┘
-->

### Chiều phụ thuộc
- {{OUTER}} → {{MIDDLE}} → {{INNER}} ← {{INFRASTRUCTURE}}
- {{INNER_LAYER}} có **zero** phụ thuộc ngoài.
- Infrastructure hiện thực các interface do Application/Domain định nghĩa.
- Tầng trong KHÔNG được phụ thuộc tầng ngoài.

## Quy ước đặt tên  <!-- tier: core -->

| Thành phần | Quy ước | Ví dụ |
|---|---|---|
| Entity | {{ENTITY_CONV}} | {{EXAMPLE}} |
| Value Object | {{VO_CONV}} | {{EXAMPLE}} |
| Interface | {{INTERFACE_CONV}} | {{EXAMPLE}} |
| Use Case Command | {{COMMAND_CONV}} | {{EXAMPLE}} |
| Use Case Query | {{QUERY_CONV}} | {{EXAMPLE}} |
| Handler | {{HANDLER_CONV}} | {{EXAMPLE}} |
| DTO | {{DTO_CONV}} | {{EXAMPLE}} |
| Controller | {{CONTROLLER_CONV}} | {{EXAMPLE}} |
| DI Extension | {{DI_EXT_CONV}} | {{EXAMPLE}} |
| Class test | {{TEST_CLASS_CONV}} | {{EXAMPLE}} |
| Method test | {{TEST_METHOD_CONV}} | {{EXAMPLE}} |

> Quy ước đặt tên của frontend / từng repo → xem `.ai-project-guide.md` tương ứng.

## Định dạng response API chuẩn  <!-- tier: core -->

```{{LANG}}
// Thành công
{{SUCCESS_WRAPPER}}
→ {{SUCCESS_JSON_SHAPE}}

// Thất bại
{{FAILURE_WRAPPER}}
→ {{FAILURE_JSON_SHAPE}}
```

## Quy ước API  <!-- tier: core -->

| Khía cạnh | Quy ước |
|---|---|
| Base URL | {{BASE_URL}} |
| Versioning | {{VERSIONING}}  <!-- vd: URL path /v1/, theo header, query param --> |
| Đặt tên URL | {{URL_NAMING}}  <!-- vd: kebab-case --> |
| Phân trang | {{PAGINATION}}  <!-- vd: ?page=1&pageSize=20 → meta{...} --> |
| Lọc | {{FILTERING}} |
| Sắp xếp | {{SORTING}} |
| Định dạng ngày | {{DATE_FORMAT}}  <!-- vd: ISO 8601 --> |
| Ngừng hỗ trợ (Deprecation) | {{DEPRECATION_POLICY}} |

### Các endpoint chính theo service  <!-- [TUỲ CHỌN] -->

| Service | Endpoints |
|---|---|
| {{SERVICE}} | {{ENDPOINTS}} |

> Tài liệu API đầy đủ: {{API_DOCS_LOCATION}}  <!-- vd: /swagger cho mỗi service -->

## Quy ước Database  <!-- tier: core -->

- **Migration**: {{MIGRATION_STRATEGY}}  <!-- vd: code-first mỗi service -->
- **Đặt tên**: {{DB_NAMING}}  <!-- vd: PascalCase cho entity, snake_case cho cột -->
- **Soft Delete**: {{SOFT_DELETE_RULE}}
- **Cột audit**: {{AUDIT_COLUMNS}}  <!-- vd: CreatedAt NOT NULL, ModifiedAt nullable -->
- **Xử lý đồng thời**: {{CONCURRENCY_MECHANISM}}  <!-- vd: ROWVERSION / optimistic lock -->
- **Quy ước ID**: {{PK_TYPE}}  <!-- vd: bigint (không dùng Guid) -->

### Quy ước Migration  <!-- [TUỲ CHỌN] khi dùng SQL migration thủ công -->
- **Vị trí**: {{MIGRATION_LOCATION}}
- **Đặt tên**: {{MIGRATION_NAMING}}  <!-- vd: V{YYYYMMDD}_{NN}_{description}.sql -->
- **Tính idempotent**: {{IDEMPOTENCY_RULE}}  <!-- vd: dùng guard IF NOT EXISTS -->

<!-- ════════════════════ CONDITIONAL (chỉ giữ nếu hệ thống có) ════════════════════ -->

## Luồng dữ liệu tổng quan  <!-- tier: conditional -->

<!-- Mô tả 1-2 câu bản chất luồng dữ liệu của hệ thống (vd: "hệ tổng hợp dữ liệu: master data ở hệ ngoài, config/transaction ở DB local, gộp tại runtime"). -->
{{DATA_FLOW_SUMMARY}}

```
{{DATA_FLOW_DIAGRAM}}
```
<!-- Vẽ ASCII: Clients → Gateway → Services → điểm composition ở Application → Infrastructure (API ngoài / DB / cache / bus).
     Ghi rõ phương thức auth của từng client và các điểm composition quan trọng. -->

### Phân loại nguồn dữ liệu  <!-- [TUỲ CHỌN] khi dữ liệu đến từ nhiều nguồn (API ngoài + DB local) -->

| Dữ liệu | Nguồn | Cách truy cập | Caching |
|---|---|---|---|
| {{DATA}} | {{SOURCE}} | {{PATH}} | {{TTL_OR_DASH}} |

### Giao tiếp giữa các service  <!-- [TUỲ CHỌN] khi multi-service -->

```
{{SERVICE_A}}  ──{{PROTOCOL}}──▶ {{SERVICE_B}}   ({{VIA_CLIENT}})
```

> **Endpoint nội bộ** ({{INTERNAL_ROUTE_PREFIX}}): {{INTERNAL_AUTH_MECHANISM}} — vd: header shared-secret + IP whitelist. Xem §Luồng Xác thực.

## Repositories & Hướng dẫn nền tảng  <!-- tier: conditional -->  <!-- chỉ giữ nếu là hệ multi-repo -->

| Repository | Stack | Platform Guide |
|---|---|---|
| `{{repo-name}}/` | {{STACK_SUMMARY}} | `{{repo-name}}/.ai-project-guide.md` |

> **Cấu trúc thư mục, scan path, quy ước namespace, code pattern** → xem `.ai-project-guide.md` của từng repo.
> File này tập trung vào **kiến trúc cắt ngang** dùng chung cho mọi repo.

## Phân loại Entity  <!-- tier: conditional -->  <!-- khi hệ thống tích hợp dữ liệu từ hệ ngoài -->

Entity được chia thành các nhóm sau. Mọi code, tài liệu, và BDD spec PHẢI dùng các thuật ngữ này nhất quán.

| Nhóm | Thuật ngữ | Lưu ở DB? | ORM quản lý? | Truy cập qua | Ví dụ |
|---|---|---|---|---|---|
| **DB Entity** | `[entity] entity` | CÓ | CÓ | {{DB_REPO_INTERFACE}} | {{EXAMPLES}} |
| **Model nguồn-API** | `[entity] model` | KHÔNG | KHÔNG — POCO/DTO | {{API_SERVICE_INTERFACE}} | {{EXAMPLES}} |
| **Projection Entity** | `[entity] projection` | CÓ | CÓ | {{PROJECTION_REPO}} | {{EXAMPLES}} |

**Quy tắc:**
- Model nguồn-API KHÔNG có bảng DB, KHÔNG migration — là POCO/DTO được populate từ API ngoài.
- {{ID_RULE}}  <!-- vd: Model nguồn-API Id = external ID; DB entity Id = tự sinh -->
- {{PROJECT_SPECIFIC_RULE}}

## Phân loại truy cập dữ liệu — Ranh giới các tầng  <!-- tier: conditional -->  <!-- khi gộp dữ liệu nhiều nguồn (API ngoài + DB) -->

Cách các tầng truy cập dữ liệu và ranh giới giữa chúng:

```
{{ACCESS_TREE}}
```
<!-- Ví dụ:
Handler / Controller
  ├── IProductCatalogService (Application — điểm gộp DUY NHẤT)
  │     ├── IProductService (Infrastructure — API ngoài)
  │     └── IDisplayConfigRepository (Infrastructure — DB)
  └── IOrderRepository (Infrastructure — DB, inject trực tiếp)
-->

| Tầng | Mục đích | Sở hữu | Ví dụ |
|---|---|---|---|
| **{{API_SERVICE_LAYER}}** (Infrastructure) | Gọi API ngoài; tự quản cache/retry/circuit-breaker/mapping | Model nguồn-API | {{EXAMPLES}} |
| **{{DB_REPO_LAYER}}** (Infrastructure) | Thao tác DB local; repository pattern chuẩn | DB entity | {{EXAMPLES}} |
| **{{APP_SERVICE_LAYER}}** (Application) | Gộp dữ liệu nhiều nguồn; điểm composition duy nhất | Domain object đã enrich | {{EXAMPLES}} |
| **{{HANDLER_LAYER}}** (Presentation/Application) | Điều phối use-case; mapping request→response | — | {{EXAMPLES}} |

**Quy tắc Injection (BẮT BUỘC tuân theo):**
1. {{RULE_1}}  <!-- vd: Service gọi API ngoài chỉ inject vào Application Service, KHÔNG inject thẳng vào Handler -->
2. {{RULE_2}}
3. {{RULE_3}}

## Trách nhiệm của từng service  <!-- tier: conditional -->  <!-- khi multi-service -->

| Service | Domain | Trách nhiệm chính |
|---|---|---|
| {{SERVICE}} | {{DOMAIN}} | {{RESPONSIBILITIES}} |

## Mô hình đăng ký DI  <!-- tier: conditional -->

Mỗi feature đăng ký dependency qua extension method / module:
```{{LANG}}
{{DI_REGISTRATION_EXAMPLE}}
```

## Mô hình Multi-tenant  <!-- tier: conditional -->  <!-- khi một hệ thống phục vụ nhiều khách hàng/chi nhánh, dữ liệu tách riêng -->

Mọi entity (trừ {{GLOBAL_ENTITIES}}) PHẢI có `{{TENANT_KEY}}`. {{ISOLATION_MECHANISM}} đảm bảo cách ly:
```{{LANG}}
{{QUERY_FILTER_EXAMPLE}}
```

Truy cập tenant context qua: `{{TENANT_CONTEXT_ACCESSOR}}`  <!-- các field: TenantId, AppId, UserId... -->

## Phân giải định danh — External ID vs Internal ID  <!-- tier: conditional -->  <!-- khi tích hợp hệ ngoài có ID riêng -->

Hệ thống tích hợp với {{EXTERNAL_SYSTEM}}. Mỗi entity ngoài có ID riêng, **KHÔNG trùng** với internal ID. Hai hệ ID này phải luôn được phân biệt rõ.

| | DB Entity (local) | Model nguồn-API (ngoài) |
|---|---|---|
| **`Id`** | {{INTERNAL_ID_RULE}} (tự sinh) | Gán từ response hệ ngoài — KHÔNG tự sinh |
| **`ExternalId`** | Lưu ID hệ ngoài để tham chiếu chéo | Không áp dụng — `Id` chính là external ID |

### Quy tắc bắt buộc
1. {{RULE_1}}  <!-- vd: DB Entity Id luôn tự sinh, TUYỆT ĐỐI KHÔNG gán external ID vào Id -->
2. {{RULE_2}}
3. {{RULE_3}}

### Anti-pattern (CẤM)
```{{LANG}}
// ❌ SAI — {{ANTIPATTERN_DESC}}
{{BAD_EXAMPLE}}

// ✅ ĐÚNG
{{GOOD_EXAMPLE}}
```

## API Gateway  <!-- tier: conditional -->

| Trách nhiệm | Chi tiết |
|---|---|
| Xác minh chữ ký / auth | {{DETAIL}} |
| Rate limiting | {{DETAIL}} |
| Xử lý CORS | {{DETAIL}} |
| Định tuyến request | {{DETAIL}} |
| Cân bằng tải | {{DETAIL}} |
| IP whitelist | {{DETAIL}} |

**Nguyên tắc thiết kế:** Stateless, không chứa business logic, scale ngang được.

## Chiến lược Caching  <!-- tier: conditional -->

**Mô hình**: {{CACHE_PATTERN}}  <!-- vd: Cache-Aside (read-through) -->
**Định dạng key**: {{KEY_FORMAT}}  <!-- vd: {entity}:{tenantId}:{id} -->

| Loại dữ liệu | TTL | Cách invalidate |
|---|---|---|
| {{DATA}} | {{TTL}} | {{INVALIDATION}} |

## Event Bus  <!-- tier: conditional -->

> **Trạng thái:** {{STATUS}}  <!-- vd: đã cấp hạ tầng nhưng chưa implement / đã chạy production -->

**Nguyên tắc thiết kế:**
- {{PARTITIONING}}  <!-- vd: partition theo TenantId để đảm bảo thứ tự trong mỗi tenant -->
- {{DELIVERY_GUARANTEE}}  <!-- vd: at-least-once + theo dõi idempotency -->
- {{DLQ_RETRY}}  <!-- vd: DLQ {topic}.dlq, retry 3 lần với exponential backoff -->

## Sharding  <!-- tier: conditional -->

- {{SHARD_STRATEGY}}  <!-- vd: mô hình Shard Registry + cache -->
- {{SHARD_RESOLVER}}  <!-- vd: IShardResolver: cache → Registry DB → tự gán -->

## Feature Toggle  <!-- tier: conditional -->

Hệ thống dùng {{FEATURE_TOGGLE_TOOL}} cho feature flag lúc runtime.

| Điều kiện | Hành vi |
|---|---|
| Toggle bị tắt | {{BEHAVIOR}}  <!-- thường: fail-open / cho phép -->|
| Lỗi khi đánh giá | {{BEHAVIOR}}  <!-- thường: fail-open để sự cố không khoá user -->|
| Flag trả về false | {{BEHAVIOR}} |

## Luồng Xác thực  <!-- tier: conditional -->

### {{AUTH_METHOD}}  <!-- vd: JWT Bearer / API Key (HMAC) / OAuth2 / Token Exchange -->

```
{{AUTH_FLOW_STEPS}}
```
<!-- Liệt kê tuần tự các bước middleware xử lý: extract → verify → resolve → build context.
     Nếu có nhiều luồng auth (S2S, browser, internal), mô tả từng luồng. -->

**Quy tắc chính:**
- {{AUTH_RULE_1}}
- {{AUTH_RULE_2}}

**Middleware pipeline:**
```
{{ROUTE_PATTERN}}  → {{MIDDLEWARE_OR_BYPASS}}
{{HEALTH_ROUTE}}   → bypass (health probe)
```

<!-- ════════════════════ OPS (chỉ người đọc — AI không nạp khi sinh code) ════════════════════ -->

## Observability (Khả năng quan sát)  <!-- tier: ops -->

### Ghi log (Logging)
- Thư viện: {{LOGGING_LIB}}
- Định dạng: {{LOG_FORMAT}}  <!-- vd: Compact JSON -->
- Sink: {{LOG_SINKS}}  <!-- vd: file xoay vòng theo ngày, giữ 30 ngày; console chỉ khi dev -->
- **Correlation ID**: {{CORRELATION_MECHANISM}}  <!-- vd: X-Correlation-Id đẩy vào log context -->
- Mức log: {{LOG_LEVELS}}

### Metrics  <!-- [TUỲ CHỌN] -->

| Metric | Loại | Mô tả |
|---|---|---|
| {{METRIC}} | {{TYPE}} | {{DESC}} |

### Distributed Tracing  <!-- [TUỲ CHỌN] -->
- {{TRACING_TOOL}} — {{PROPAGATION_SCOPE}}  <!-- vd: OpenTelemetry, propagate qua HTTP + messaging -->

### Health Check
```{{LANG}}
{{HEALTH_CHECK_REGISTRATION}}
```
- `{{LIVENESS_ROUTE}}` — liveness (chỉ tự kiểm tra)
- `{{READINESS_ROUTE}}` — readiness (phụ thuộc: DB + cache + bus)

## Triển khai & DevOps  <!-- tier: ops -->

### Chiến lược môi trường

| Môi trường | Mục đích | Hạ tầng |
|---|---|---|
| Development | {{PURPOSE}} | {{INFRA}} |
| Staging | {{PURPOSE}} | {{INFRA}} |
| Production | {{PURPOSE}} | {{INFRA}} |

### CI/CD Pipeline
```
{{PIPELINE_STAGES}}
```
<!-- vd: Code Push → Build → Unit Test → Integration Test → Docker Build → Push Registry → Deploy Staging → Smoke → Duyệt tay → Production -->

### Quản lý cấu hình

| Loại cấu hình | Lưu ở | Ví dụ |
|---|---|---|
| App Settings | {{STORAGE}} | {{EXAMPLE}} |
| Secrets | {{SECRET_STORE}} | {{EXAMPLE}}  <!-- secret production TUYỆT ĐỐI KHÔNG commit vào repo -->|
| Biến môi trường | {{ENV_STORE}} | {{EXAMPLE}} |

## Chiến lược kiểm thử  <!-- tier: ops -->

| Cấp độ | Phạm vi | Công cụ |
|---|---|---|
| Unit Test | {{SCOPE}} | {{TOOLS}} |
| Integration Test | {{SCOPE}} | {{TOOLS}} |
| Functional Test | {{SCOPE}} | {{TOOLS}} |
| Load Test | {{SCOPE}} | {{TOOLS}} |

- Đặt tên: {{TEST_NAMING}}  <!-- vd: MethodName_Scenario_ExpectedResult -->
- {{CI_TEST_RULE}}  <!-- vd: CI chạy unit + integration mỗi PR -->

## Yêu cầu phi chức năng (NFR)  <!-- tier: ops -->

| Yêu cầu | Mục tiêu |
|---|---|
| Khả năng mở rộng | {{TARGET}} |
| Tính sẵn sàng | {{TARGET}}  <!-- vd: SLA uptime 99.9% -->|
| Triển khai | {{TARGET}}  <!-- vd: zero-downtime, rolling update -->|
| Tính nhất quán | {{TARGET}} |
| Độ trễ | {{TARGET}}  <!-- vd: API p95 < 200ms -->|
| Thông lượng | {{TARGET}} |
| Lưu trữ dữ liệu | {{TARGET}} |
| Sao lưu | {{TARGET}} |

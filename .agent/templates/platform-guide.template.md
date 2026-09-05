# Platform Guide — {{SERVICE_NAME}}

> Guide này cung cấp context mà Claude dùng khi làm việc trong service/repository NÀY.
> Giữ ngắn gọn và đúng sự thật. Cập nhật khi kiến trúc hoặc domain model thay đổi.
> Tham chiếu: CLAUDE.md cho chuẩn toàn dự án. File này phủ context riêng của service.

---

# §1. Service Overview

**Tên service**: {{SERVICE_NAME}}
**Mục đích**: {{ONE_SENTENCE_PURPOSE}}
**Bounded context**: {{BOUNDED_CONTEXT}}  # vd: "Sở hữu toàn bộ logic vòng đời order. KHÔNG sở hữu payment hay inventory."
**Team**: {{TEAM_NAME}}
**Repository**: {{REPO_URL}}

Trách nhiệm chính:
- {{RESPONSIBILITY_1}}
- {{RESPONSIBILITY_2}}
- {{RESPONSIBILITY_3}}

Service này KHÔNG xử lý:
- {{OUT_OF_SCOPE_1}}  # vd: "Xử lý payment → xem payment-service"
- {{OUT_OF_SCOPE_2}}

---

# §2. Domain Model

Các entity chính và quan hệ của chúng:

```
{{ENTITY_1}} (aggregate root)
  ├── {{CHILD_ENTITY_1}} (value object / child entity)
  └── {{CHILD_ENTITY_2}}

{{ENTITY_2}}
  └── references {{ENTITY_1}} by ID
```

**{{ENTITY_1}}**:
- Field chính: {{KEY_FIELDS}}
- Vòng đời status: {{STATUS_1}} → {{STATUS_2}} → {{STATUS_3}}
- Business rule: {{KEY_RULE_1}}

**{{ENTITY_2}}**:
- Field chính: {{KEY_FIELDS}}
- Quan hệ: {{RELATIONSHIP_DESCRIPTION}}

---

# §3. Common Patterns

Các pattern riêng của service này (bổ sung cho chuẩn toàn dự án trong CLAUDE.md):

## {{PATTERN_NAME_1}}
```
// Khi nào dùng: {{USE_CASE}}
// Ví dụ:
{{CODE_EXAMPLE}}
```

## {{PATTERN_NAME_2}}
```
// Khi nào dùng: {{USE_CASE}}
// Ví dụ:
{{CODE_EXAMPLE}}
```

---

# §4. Integration Points

## Upstream Dependencies (service này gọi các bên dưới)

| Service / System | Cái ta gọi   | Protocol | Auth |
|------------------|--------------|----------|------|
| {{UPSTREAM_1}}   | {{WHAT}}     | REST/gRPC/Event | {{AUTH_METHOD}} |
| {{UPSTREAM_2}}   | {{WHAT}}     | REST/gRPC/Event | {{AUTH_METHOD}} |

## Downstream Consumers (các bên dưới gọi ta hoặc tiêu thụ event của ta)

| Consumer | Cái họ dùng   | Protocol |
|----------|---------------|----------|
| {{DOWNSTREAM_1}} | {{WHAT}} | REST/Event |
| {{DOWNSTREAM_2}} | {{WHAT}} | REST/Event |

## Event phát ra (Produced)

| Tên event | Trigger | Tóm tắt payload |
|------------|---------|-----------------|
| {{EVENT_1}} | {{WHEN}} | {{PAYLOAD_FIELDS}} |
| {{EVENT_2}} | {{WHEN}} | {{PAYLOAD_FIELDS}} |

## Event tiêu thụ (Consumed)

| Tên event | Từ service | Ta làm gì với nó |
|------------|-------------|-------------------|
| {{EVENT_1}} | {{SOURCE}} | {{HANDLER_ACTION}} |

---

# §5. Known Constraints

## Ràng buộc hiệu năng (Performance)
- {{PERF_CONSTRAINT_1}}  # vd: "Endpoint danh sách order phải phản hồi < 200ms cho tới 1000 order"
- {{PERF_CONSTRAINT_2}}

## Ràng buộc business rule
- {{BUSINESS_CONSTRAINT_1}}  # vd: "Không thể huỷ order sau khi đã ship"
- {{BUSINESS_CONSTRAINT_2}}

## Phụ thuộc bên ngoài (External)
- {{EXTERNAL_DEP_1}}  # vd: "Cần inventory-service sẵn sàng để tạo order"
- {{EXTERNAL_DEP_2}}

## Technical Debt đã biết
- {{TECH_DEBT_1}}  # vd: "OrderItem.price bị nhân bản từ catalog — đồng bộ qua job hằng đêm"

---

# §6. Directory Structure

```
{{SERVICE_ROOT}}/
├── {{SOURCE_DIR}}/              # Code nguồn chính
│   ├── {{LAYER_1}}/             # vd: controller/ hoặc handler/
│   │   └── {{EXAMPLE_FILE}}
│   ├── {{LAYER_2}}/             # vd: service/ hoặc usecase/
│   │   └── {{EXAMPLE_FILE}}
│   ├── {{LAYER_3}}/             # vd: repository/ hoặc repo/
│   │   └── {{EXAMPLE_FILE}}
│   └── {{LAYER_4}}/             # vd: model/ hoặc domain/
│       └── {{EXAMPLE_FILE}}
├── {{TEST_DIR}}/                # Test phản chiếu cấu trúc src
├── specs/                       # File BDD feature
│   └── bdd/
│       └── {{DOMAIN}}/
│           └── {{UC-ID}}-{{slug}}.feature
└── {{CONFIG_FILE}}              # vd: application.yaml / appsettings.json
```

**Convention chính của repo này:**
- {{CONVENTION_1}}  # vd: "Mọi DTO nằm trong package api/, không trộn với domain model"
- {{CONVENTION_2}}  # vd: "Integration test nằm ở src/test/java/.../integration/ với @Tag(\"integration\")"

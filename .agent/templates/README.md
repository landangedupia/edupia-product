# templates/ — build-time skeletons

> **Nếu bạn đang mở thư mục này ở `.agent/templates/` trong một project: sửa file ở đây KHÔNG có tác dụng.**

## Vì sao

Các skeleton trong thư mục này được `{{include}}` **nướng cứng vào file lệnh lúc `npm run build`**:

```
templates/feature.template
      ↓ {{include:templates/feature.template}}  ← bin/build.js, thay thế văn bản lúc build
commands/generate-bdd.md
      ↓ copy vào core/ → mirror sang .agent/
.agent/commands/generate-bdd.md        ← LỆNH THẬT SỰ CHẠY (đã chứa sẵn skeleton)
.agent/templates/feature.template      ← bản tham khảo, KHÔNG lệnh nào đọc
```

Không lệnh nào đọc một path template lúc chạy. `paths.feature_template` / `paths.prd_template` từng tồn tại trong `project-context.yaml` nhưng chưa bao giờ có tác dụng — đã được gỡ bỏ (xem `GAPS.md` G9).

**Thêm nữa:** `.agent/` là vùng bị ghi đè. `/update-framework` chạy `npx … --init`, và `--init` copy `core/` → `.agent/` **vô điều kiện** (`bin/index.js` → `installCore`). File duy nhất được giữ lại là `.agent/project-context.yaml`. Nên mọi chỉnh sửa ở `.agent/templates/` sẽ **biến mất** ở lần nâng cấp kế tiếp — từ v0.4.2 thì không còn im lặng: bản cũ được lưu vào `.agent/.overwritten-{version}-{date}/` và được liệt kê ra (`GAPS.md` G24). Nhưng vẫn phải áp lại bằng tay mỗi version, nên đây không phải chỗ để đặt thay đổi.

---

## Ngoại lệ: `ci/` và `hooks/` — template để COPY RA, không phải để build

Hai thư mục này **không** giống phần còn lại của `templates/`. Chúng không được `{{include}}` vào lệnh nào, và **không** được đọc lúc chạy. Chúng là file **hoàn chỉnh, dùng ngay**, chờ một người copy ra khỏi `.agent/`:

| File | Copy tới | Làm gì |
|---|---|---|
| `ci/trace-gate.yml` | `.github/workflows/` của project | Chặn PR khi trace có cờ 🔴 (`--gate-trace`) |
| `hooks/pre-push` | `.git/hooks/pre-push` (rồi `chmod +x`) | Chặn push khi sổ trace hỏng cấu trúc (`--lint-trace`) |

```bash
# từ gốc project
mkdir -p .github/workflows && cp .agent/templates/ci/trace-gate.yml .github/workflows/
cp .agent/templates/hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```

**Phải copy RA, không dùng tại chỗ** — vì đúng cái lý do cả file README này nói: `.agent/` bị ghi đè mỗi lần nâng cấp, và `.git/hooks/` thì git không bao giờ chạy từ chỗ khác. Copy ra rồi thì chúng là file của project: sửa tuỳ ý, nâng cấp framework không đụng tới.

Vì sao chúng tồn tại → `GAPS-v3.md` G39: framework phát hiện được một lớp lỗi mà build xanh + test xanh không thấy, nhưng trước đó việc phát hiện phụ thuộc vào có người tự nguyện chạy một lệnh chat. Hai file này là chỗ nó chặn bằng máy.

## Muốn đổi cấu trúc artifact sinh ra thì làm gì

Sửa file trong **repo framework** rồi build lại:

```bash
# trong repo sdd-framework
vim templates/feature.template          # hoặc prd.template.md, tech-design.template.md, …
npm run build                           # inline lại vào commands/*.md + core/ + .agent/
```

Rồi phát hành version mới; project chạy `/update-framework` để nhận.

## File nào ở đây đi vào đâu

| Template | Được include vào | Trở thành |
|---|---|---|
| `feature.template` | `commands/generate-bdd.tmpl` | mỗi file `.feature` |
| `prd.template.md` | `commands/generate-prd.tmpl` | mỗi PRD |
| `tech-design.template.md` | `commands/generate-tech-docs.tmpl` | tech-doc gộp / PRD |
| `design-spec.template.md` | `commands/generate-design-spec.tmpl` | design-spec / platform |
| `architecture.template.md` | `commands/generate-architecture.tmpl` | tài liệu kiến trúc |
| `product-definition.template.md` | `commands/define-product.tmpl` | product definition |
| `platform-guide.template.md` | (tham khảo) | — |
| `project-context.yaml` | **không** include — được copy thẳng làm file config khởi tạo | `.agent/project-context.yaml` |
| `ci/trace-gate.yml` | **không** include — người dùng copy ra | `.github/workflows/trace-gate.yml` |
| `hooks/pre-push` | **không** include — người dùng copy ra | `.git/hooks/pre-push` |

> Lưu ý `project-context.yaml` là ngoại lệ duy nhất: nó **được** copy ra làm file thật của project, và **được bảo vệ** khỏi ghi đè khi nâng cấp (chỉ tạo nếu chưa tồn tại).

<!--
  File này là nguồn của .agent/README.md: build.js copy AGENT_README.md (gốc repo
  framework) → core/README.md, rồi `--init` cài thành .agent/README.md.
  Muốn sửa nội dung: sửa AGENT_README.md TRONG REPO FRAMEWORK rồi `npm run build`.
  Bản nằm trong .agent/ bị ghi đè mỗi lần nâng cấp — chính là điều nó đang nói.
-->

# `.agent/` — framework files (SINH RA, đừng sửa)

> Thư mục này do SDD Framework cài vào. `/update-framework` (thực chất là `npx @educa-corp/sdd-framework --init`) **copy `core/` → `.agent/` vô điều kiện** mỗi lần nâng cấp.

## Sửa được cái gì

| Đường dẫn | Sửa được? | Ghi chú |
|---|:---:|---|
| `.agent/project-context.yaml` | ✅ **Có** | **Đây là file cấu hình của bạn.** Được bảo vệ: `--init` chỉ tạo nếu chưa tồn tại, không bao giờ ghi đè. |
| `.agent/project-lessons.md` | ✅ Có | Do `/learn` quản lý. Không nằm trong `core/` nên nâng cấp không đụng tới. |
| `.agent/review/` | ✅ Có | File findings của `/review-context`, `/refine-prd`, `/review-tech-docs`. Không nằm trong `core/`. |
| `.agent/commands/` | ❌ Không | Sinh từ `commands/*.tmpl` của repo framework |
| `.agent/steps/` `rules/` `skills/` `hooks/` | ❌ Không | Copy từ repo framework |
| `.agent/templates/` | ❌ Không | **Cả bản tham khảo cũng không được đọc lúc chạy** — skeleton đã nướng cứng vào `.agent/commands/*.md` lúc build. Xem `.agent/templates/README.md`. |
| `.agent/modules/{module}/` | ❌ Không | Stack profile — đây là chỗ hay bị sửa nhất, và cũng là chỗ mất nhiều nhất khi nâng cấp |

## Nếu bạn đã sửa gì trong vùng ❌

Từ v0.4.2, `--init` **phát hiện và cứu** các file đó:

- Bản cũ được copy sang `.agent/.overwritten-{version}-{YYYYMMDD}/` giữ nguyên cây thư mục
- Danh sách file bị ghi đè được in ra ngay sau bước cài
- `.agent/.install-manifest.json` ghi hash của đúng những gì lần cài trước đã ghi — nhờ đó lệnh phân biệt được **bạn sửa file** với **framework tự đổi file giữa hai version** (một phép so nội dung thuần sẽ flag cả hai, và mỗi lần nâng cấp lại báo oan hàng chục file)

## Nâng cấp cũng GỠ file, không chỉ thêm

Từ v0.5.1, `--init` gỡ những file framework **không còn ship** — trước đó nó chỉ copy, nên một
lệnh bị bỏ ở version mới nằm lại trong `.agent/commands/` và `.claude/commands/` **vĩnh viễn**:
vẫn hiện trong menu `/`, vẫn chạy được, vẫn mang logic version cũ, kể cả khi framework đã bỏ nó
*vì nó sai*.

Một file chỉ bị gỡ khi **cả ba** đúng:

1. có trong manifest lần cài trước → do framework đặt vào, không phải bạn tạo
2. không còn trong bản mới → framework đã bỏ
3. hash khớp manifest → **còn nguyên bản**, gỡ đi không mất gì

Đúng (1)+(2) mà **bạn đã sửa** file đó → **giữ lại** + backup + báo ra. Thà để lại một file lạc
còn hơn xoá thứ ai đó đã bỏ công viết.

`.claude/commands/` cũng được quản như vậy — cộng thêm: nếu project bạn **đã có sẵn** một slash
command trùng tên (`/debug`, `/sync`, `/learn` là những cái hay trùng), bản cũ của nó được backup
vào `.agent/.overwritten-{YYYYMMDD}-shortcuts/` và bạn được báo, thay vì bị đè im lặng.

Nên thêm vào `.gitignore` của project:

```gitignore
.agent/.overwritten-*/
.agent/.install-manifest.json
```

## Muốn thay đổi framework một cách bền vững

Sửa trong **repo framework** rồi phát hành:

```bash
# trong repo sdd-framework
vim commands/generate-bdd.tmpl      # hoặc steps/, rules/, modules/, templates/
npm run build                        # inline {{include}} → commands/*.md → core/ → .agent/
```

Rồi bump version + publish; project chạy `/update-framework` để nhận.

Nếu thay đổi chỉ đúng cho **một** project (quy ước riêng của repo đó), chỗ đúng để đặt là:
- `CLAUDE.md` — kiến trúc, layer, coding standard *(mọi lệnh đọc)*
- `.agent/project-context.yaml` — path, tech stack, routing service
- `.agent/project-lessons.md` — guardrail tích luỹ qua `/learn`

Ba chỗ đó đều **không** bị nâng cấp ghi đè.

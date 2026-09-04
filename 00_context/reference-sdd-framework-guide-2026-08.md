# Sổ tay Framework Spec-Driven cho PO/BA

> **Nguồn:** Tài liệu đào tạo nội bộ · Phòng Sản phẩm · https://manager-freetrial-development.web.app/so-tay-framework
> **Framework:** v0.18.8 · **Repo mẫu:** `D:\free-trial-spec` · **Chế độ:** PO Spec repo — chỉ tài liệu, không chứa code
> **Cập nhật gốc:** 14/08/2026 · **Lưu đầy đủ vào kho kiến thức:** 2026-09-04

---

## Mục lục

- [00 — Claude Code là gì](#00--claude-code-là-gì)
- [01 — Framework này là cái gì](#01--framework-này-là-cái-gì)
- [02 — Cài đặt máy và framework](#02--cài-đặt-máy-và-framework)
- [03 — Bản đồ dây chuyền](#03--bản-đồ-dây-chuyền)
- [04 — Trước mỗi phiên làm việc](#04--trước-mỗi-phiên-làm-việc)
- [05 — Bảy bước làm một tính năng](#05--bảy-bước-làm-một-tính-năng)
- [06 — Ba luật viết tài liệu](#06--ba-luật-viết-tài-liệu)
- [07 — Đọc bảng vấn đề](#07--đọc-bảng-vấn-đề)
- [08 — Version và độ lệch tài liệu](#08--version-và-độ-lệch-tài-liệu)
- [09 — Bảng tra lệnh nhanh](#09--bảng-tra-lệnh-nhanh)
- [10 — Cạm bẫy thường gặp](#10--cạm-bẫy-thường-gặp)
- [11 — Bài tập thực hành](#11--bài-tập-thực-hành)
- [Phụ lục — Từ điển thuật ngữ](#phụ-lục--từ-điển-thuật-ngữ)

---

## 00 — Claude Code là gì

Dành cho người chưa từng dùng Claude Code (người đã quen có thể nhảy sang mục 01).

### Nó là cái gì
Claude Code là trợ lý AI làm việc **ngay trong thư mục tài liệu**: tự đọc file có sẵn, tự ghi file mới vào đúng chỗ — không cần copy/paste qua lại như chat AI thông thường.

Giao diện là một ô chat, gõ tiếng Việt bình thường. Điểm khác biệt: có sẵn bộ **câu lệnh viết tắt** bắt đầu bằng `/` — chính là framework mà sổ tay này nói tới.

Ba cách dùng Claude Code: ứng dụng Claude Client, tiện ích VS Code, hoặc dòng lệnh. Sổ tay chọn **dòng lệnh chạy trong VS Code** (vừa chat vừa thấy file thay đổi, vẫn giữ sự linh hoạt của terminal). Lý do đầy đủ ở mục 02.

### Sáu thao tác đủ để bắt đầu

| Muốn làm gì | Làm thế nào |
|---|---|
| Gọi một câu lệnh | Gõ `/` trong ô chat, danh sách hiện ra; gõ thêm để lọc (vd `/def` → `/define-product`) |
| Chỉ một file cụ thể | Gõ `@` rồi tên file, chọn từ gợi ý |
| Trả lời câu hỏi | Gõ câu trả lời rồi Enter; câu hỏi Có/Không thì gõ đúng `Y` hoặc `N` |
| Dừng giữa chừng | Bấm `Esc` — dừng ngay, gì chưa ghi thì không bị ghi |
| Đổi model | Gõ `/model`, chọn trong danh sách. Khuyên dùng **Opus** |
| Bắt đầu việc mới hoàn toàn | Gõ `/clear` để xoá hội thoại cũ, tránh lẫn thông tin giữa các tính năng |

### Hai chỗ để gõ lệnh, đừng nhầm
Mỗi khối lệnh trong sổ tay có nhãn ghi rõ:

- **`Gõ trong Claude Code`** → gõ vào **ô chat** Claude Code (vd `/define-product`). Đây là công việc hằng ngày.
- **`Gõ trong cửa sổ dòng lệnh`** → gõ vào **terminal** của máy (Menu Terminal → New Terminal trong VS Code). Chủ yếu dùng lúc cài đặt ban đầu; sau đó hằng ngày chỉ gõ `claude` để mở phiên làm việc.

### Nó có tự ý sửa tài liệu không?
**Không.** Trước khi ghi/sửa file, nó luôn dừng lại hỏi xác nhận — với lệnh framework, nó còn tóm tắt sẽ làm gì, động vào file nào, rồi chờ gõ `Y`. Ngoài ra mọi tài liệu được quản lý bằng **git** (lưu lịch sử), nên lỡ ghi rồi vẫn có thể quay lại bản trước.

### 4 thuật ngữ gặp liên tục
- **Repo** — thư mục dự án chứa toàn bộ tài liệu của team, có lịch sử chỉnh sửa.
- **Findings** — bảng liệt kê vấn đề AI phát hiện sau khi soi tài liệu (mỗi dòng: mức độ nặng nhẹ + đề xuất sửa).
- **Sổ theo dõi (trace)** — file ghi từng kịch bản kiểm thử đã làm tới đâu (đã có code chưa, đã test chưa).
- **BDD** — cách viết kịch bản kiểm thử bằng câu tiếng Việt thường (không phải mã lệnh), để PO/dev/tester cùng đọc được.

---

## 01 — Framework này là cái gì

Đây là **quy trình viết tài liệu sản phẩm đóng gói thành các câu lệnh AI** — không phải "AI viết tài liệu hộ". Kinh nghiệm về PRD tốt, độ phủ kịch bản kiểm thử, các lỗi hay gặp... được viết thành hướng dẫn cho AI đọc trước mỗi lần làm việc.

**Framework không nghĩ hộ phần nghiệp vụ**: nó hỏi, kiểm tra tính nhất quán, nhắc chỗ còn hở — nhưng quyết định sản phẩm hoạt động thế nào vẫn là việc của PO. Mọi cổng ký duyệt bắt buộc có chữ ký người thật.

### Ba thành phần (trong thư mục ẩn `.agent/`)

| Thành phần | Nằm ở đâu | Vai trò |
|---|---|---|
| **Bộ lệnh** | `.agent/commands/` | 30 lệnh `/...` phủ vòng đời từ khám phá tới kiểm thử tự động. PO/BA chỉ cần dùng ~8 lệnh trong số đó. |
| **Bộ luật** | `.agent/rules/`, `.agent/steps/`, `CLAUDE.md` gốc repo | Quy tắc mọi lệnh phải tuân theo: xin xác nhận trước khi ghi file, không để thuật ngữ kỹ thuật lọt vào tài liệu nghiệp vụ, báo cáo đúng ngôn ngữ người dùng đang gõ. |
| **Trí nhớ dự án** | `specs/domain-knowledge/`, `.agent/project-context.yaml` | Từ điển nghiệp vụ, danh mục thực thể, danh sách domain, đường dẫn chuẩn. Nạp vào đầu mỗi lệnh trước khi viết. |

### Nhịp 4 thì chung của mọi lệnh

| Thì | Tên gọi | Bạn thấy gì |
|---|---|---|
| 1 | **Kiểm tra model** | Khối `MODEL CHECK` khuyên dùng Opus. Đang chạy Opus → `Y`; model nhỏ hơn vẫn muốn tiếp → `S` (chấp nhận rủi ro chất lượng thấp hơn). |
| 2 | **Nạp bối cảnh** | Khối `[CTX LOADED]` tóm tắt: từ điển có bao nhiêu thuật ngữ chuẩn/cấm, danh mục thực thể, file quan trọng nào thiếu. Thấy báo thiếu → dừng xử lý trước khi đi tiếp. |
| 3 | **Checkpoint** | Tóm tắt "sẽ làm gì / ghi file nào / phạm vi tới đâu" + câu hỏi `Tiếp tục? (Y/N)`. Chưa gõ `Y` thì chưa file nào bị động tới. |
| 4 | **Báo cáo cuối** | 4 dòng: trạng thái (thành công/cảnh báo), danh sách file tạo/sửa, vị trí hiện tại trên dây chuyền, gợi ý lệnh kế tiếp (`Next`) kèm tham số mẫu. |

> **Mẹo:** không cần thuộc thứ tự các lệnh — cứ đọc dòng `Next` ở cuối mỗi báo cáo là biết lệnh kế tiếp hợp lý.

### So sánh: thủ công vs. framework

| Việc | Thủ công trước đây | Với framework |
|---|---|---|
| Bắt đầu tài liệu | File trắng / copy PRD cũ, mỗi người một kiểu | Trả lời câu hỏi theo trình tự, cấu trúc tự hình thành, đồng bộ toàn phòng |
| Khám phá tính năng | Họp, ghi biên bản tự do; chỗ thiếu chỉ lộ ra khi dev hỏi lại | Hỏi vặn có hệ thống ngay tại buổi khám phá; câu chưa trả lời thì không cho qua phần sau |
| Giữ thuật ngữ nhất quán | Dễ lệch giữa các tài liệu, phát hiện muộn | Từ điển nạp trước mỗi lần viết; từ khai tử tự thay, từ mới bị hỏi để bổ sung |
| Rà soát tài liệu | Nhờ đồng nghiệp đọc, chất lượng phụ thuộc người rảnh | Ba góc nhìn đọc song song + lặp vòng tự hỏi tới khi hết sót |
| Đối chiếu tiêu chí/quy tắc | Dò bằng mắt, dễ sót | Máy kiểm chéo hai chiều, báo ngay chỗ lệch |
| Ra kịch bản kiểm thử | QC tự nghĩ, không rõ độ phủ | Sinh thẳng từ PRD, luật bắt buộc mỗi tiêu chí/quy tắc/thành phần đều có ≥1 kịch bản |
| Khi PRD thay đổi | Báo miệng/chat, dễ lệch tài liệu liên quan | Mỗi tài liệu con ghi phiên bản PRD gốc; máy tự so và báo lỗi thời |
| Theo dõi tiến độ | Hỏi ước lượng | Bảng độ phủ theo từng kịch bản |
| Nhớ lý do quyết định cũ | Rải rác trong chat/trí nhớ, mất khi người nghỉ | Lưu trong biên bản khám phá + nhật ký thay đổi, nằm trong repo |

### Cái gì không thay đổi
Vẫn phải hiểu người dùng, cân nhắc đánh đổi, quyết định sản phẩm hoạt động thế nào, đọc lại tài liệu trước khi ký. Framework chỉ lấy đi phần cơ học: nhớ template, dò đối chiếu, phát hiện chỗ sót, canh tài liệu lỗi thời.

### Cái giá phải trả
- **Không nhảy cóc được** — muốn có PRD phải qua buổi khám phá đầy đủ, framework chặn cứng.
- **Buổi đầu chậm hơn** — tính năng đầu tốn thời gian hơn cách cũ (vừa làm vừa học quy ước); từ tính năng thứ hai thì nhanh hơn.
- **Phải tôn trọng quy ước đặt tên** — giữ cho các tài liệu tìm thấy nhau (chi tiết ở mục 03).

---

## 02 — Cài đặt máy và framework

### Phần một — Cài đặt máy (làm một lần, ~30 phút)

Năm thứ cần có: **Claude Client** (khởi động mọi thứ), **Git** (lưu lịch sử), **VS Code** (xem/sửa file), **Claude CLI** (Claude Code chạy trong dòng lệnh — dùng hằng ngày), **hai tiện ích VS Code**.

> **Điều kiện tiên quyết:** cần **tài khoản Claude trả phí** (Pro/Max/Team/Enterprise). Tài khoản miễn phí **không** dùng được Claude Code — xin cấp trước khi cài.

**Bước 1 — Cài Claude Client**
Tải tại `claude.com/download`, cài, đăng nhập bằng tài khoản trả phí. Bước duy nhất phải tự tải file.

**Bước 2 — Mở tab Claude Code, cài Git khi được nhắc**
Trong Claude Client → tab Claude Code → nó báo thiếu Git kèm link `git-scm.com/downloads`. Cài, giữ nguyên mọi mặc định (Next hết).
> ⚠️ **Cạm bẫy:** Claude Client chỉ dò Git **một lần lúc khởi động**. Cài Git xong phải **tắt hẳn** (không phải thu nhỏ) rồi mở lại app, nếu không nó vẫn báo thiếu Git.

**Bước 3 — Nhờ Claude Code cài VS Code hộ**
Gõ trong Claude Code: `Cài VS Code lên máy hộ tôi` → nó tự nhận hệ điều hành, xin phép, gõ `Y`, đợi vài phút.

**Bước 4 — Nhờ cài Claude CLI**
Gõ trong Claude Code: `Cài Claude Code CLI lên máy hộ tôi`. Đây là bản dòng lệnh — cách làm việc hằng ngày từ mục 04. Cài một lần, tự cập nhật ngầm.

*Vì sao chọn bản dòng lệnh (3 lý do):*
1. Tương tác linh hoạt — vừa gõ lệnh `/`, vừa chat tự do, vừa chen ngang.
2. Gọn một cửa sổ — chat + file + kết quả lệnh nằm cạnh nhau trong VS Code.
3. **Đổi tài khoản giữa chừng không mất nội dung chat** — hết lượt dùng thì gõ `/login`, đổi tài khoản, hội thoại vẫn còn nguyên.

Tự cài thay vì nhờ:
- Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
- Mac (Terminal): `curl -fsSL https://claude.ai/install.sh | bash`

> ⚠️ **Cạm bẫy:** đừng gõ nhầm CMD — dòng nhắc có chữ `PS` mới là PowerShell. Nếu báo `'irm' is not recognized` nghĩa là đang ở CMD.

**Bước 5 — Mở VS Code, đăng nhập Claude**
Terminal → New Terminal → gõ `claude` → đăng nhập qua trình duyệt (lần đầu). Lần sau gõ `claude` là vào thẳng.
> **Lưu ý:** Claude Code làm việc trên thư mục đang mở trong VS Code. Từ khi có repo, **luôn mở đúng thư mục gốc của repo** rồi mới gõ `claude`.

**Bước 6 — Cài hai tiện ích VS Code**
`Ctrl+Shift+X` (Windows) / `Cmd+Shift+X` (Mac) để mở ngăn tiện ích:

| Tìm với từ khoá | Để làm gì |
|---|---|
| **Pytest BDD** (nhà phát hành `vtenentes`) | Tô màu, soi lỗi cú pháp file kịch bản `.feature` |
| **SDD Board** (nhà phát hành `EducaCorp`) | Review Board (duyệt findings bằng UI thay vì sửa YAML tay) + Living Documentation (bảng theo dõi độ phủ) |

Cài nhanh qua terminal:
```
code --install-extension vtenentes.bdd
code --install-extension educacorp.sdd-board
```

**Kiểm tra cuối cùng** (4 dòng trong Terminal VS Code):
```
git --version      → git version 2.51.0        (bước 2)
code --version     → 1.105.0                   (bước 3)
claude --version   → 2.1.232 (Claude Code)     (bước 4)
claude doctor      → bảng tự chẩn đoán, dùng khi có trục trặc
```
Số phiên bản cụ thể không quan trọng, miễn có số hiện ra.

---

### Phần hai — Lấy repo tài liệu về

#### Tình huống A — Tham gia repo đã có sẵn framework (đa số mọi người)
Repo đã dựng sẵn, framework đã commit cùng tài liệu → **không cần chạy bộ cài đặt**.

```
git clone <đường-dẫn-repo>
cd <thư-mục-repo>
code .
```

Trong VS Code vừa mở: Terminal → New Terminal → gõ `claude` **ngay tại thư mục gốc repo**, rồi kiểm tra 3 dấu hiệu:

| Kiểm tra cái gì | Đạt là thế nào |
|---|---|
| File `.agent/FRAMEWORK_VERSION` | Tồn tại, có số phiên bản (vd `0.18.8`). Không có → chưa cài framework, chuyển sang Tình huống B. |
| Gõ `/` trong Claude Code | Hiện gợi ý các lệnh quen thuộc (`/define-product`, `/generate-prd`...) |
| Tiện ích VS Code | Chuột phải vào file findings trong `.agent/review/` → thấy tuỳ chọn mở bằng Review Board |

> ⚠️ **Lỗi hay gặp nhất:** mở Claude Code ở thư mục con thay vì thư mục gốc repo → mọi đường dẫn hỏng, lệnh báo không tìm thấy gì. Luôn mở đúng thư mục gốc, không ngoại lệ.

#### Tình huống B — Dựng repo tài liệu mới từ đầu
Cần thêm **Node.js kèm npm** (chạy được `npx`) — chưa có thì nhờ Claude Code cài hộ như bước 3–4 ở trên.

**Bước B.1 — Chạy bộ cài đặt**
```
npx @educa-corp/sdd-framework --init --umbrella
```
- Bỏ cờ `--umbrella` nếu là repo một sản phẩm / repo chỉ chứa tài liệu phòng sản phẩm: `npx @educa-corp/sdd-framework --init`.
- Lệnh init làm 5 việc: chép framework vào `.agent/` (commands, steps, rules, hooks, templates, skills, modules); cài cấu hình Claude Code vào `.claude/`; sinh `.agent/project-context.yaml`; cài module stack đã chọn; tạo `CLAUDE.md` gốc (+ overlay theo service nếu umbrella).
- Cần mạng và quyền truy cập npm.

> ⚠️ **Cạm bẫy — tên gói đã đổi:** gói cũ `@edupia-tutor/spec-driven-docs@latest` không còn là bản mới nhất → dùng `@educa-corp/sdd-framework`. File `.agent/commands/update-framework.md` trong repo Free Trial hiện tại vẫn ghi tên gói cũ — thuộc phần bị ghi đè khi nâng cấp, **đừng sửa tay**, tự đúng sau lần nâng cấp tới.

**Bước B.2 — Khởi tạo cấu trúc dự án**
Mở Claude Code tại thư mục gốc, chạy: `/setup-ai-first`

Lệnh hỏi loại dự án:

| Lựa chọn | Chọn khi nào |
|---|---|
| 1 — Single-service | Repo có cả tài liệu lẫn code một sản phẩm/nền tảng (team dev nhỏ) |
| 2 — Umbrella | Repo bao ngoài nhiều repo con của các service khác nhau (hỏi thêm đường dẫn repo tài liệu chung + danh sách service) |
| **3 — PO Spec repo** | **Lựa chọn của phòng sản phẩm.** Repo chỉ chứa tài liệu, không code chạy được. Tạo cấu trúc gọn hơn, sinh `CLAUDE.md` tối giản. |

Sau đó hỏi tiếp **danh sách domain nghiệp vụ** — trả lời cẩn thận vì danh sách này theo dự án rất lâu: mỗi PRD về sau đều phải khai một domain nằm trong danh sách này, và team dev dựa vào đúng cái tên đó để định tuyến tài liệu tới đúng service. Đặt tên không nhất quán ở bước này sẽ gây rối về sau và rất khó sửa.

Kết thúc, lệnh tạo bộ khung thư mục cùng hai file nghiệp vụ: `specs/domain-knowledge/business-dictionary.md` và `specs/domain-knowledge/core-entities.md`. Riêng `CLAUDE.md` và `.agent/project-context.yaml` thì bước B.1 đã sinh sẵn, ở đây lệnh chỉ mở ra kiểm tra và bổ sung chứ không tạo lại. Cả bốn file lúc này còn nhiều chỗ trống đánh dấu bằng ngoặc nhọn — điền nốt thông tin thật của dự án trước khi bắt đầu viết tính năng đầu tiên.

**Bước B.3 — Commit ngay lần đầu**
```
git add . && git commit -m "chore: khởi tạo framework spec-driven"
```
Commit ngay từ đầu để về sau mỗi lần nâng cấp framework còn so được thay đổi. Hai tiện ích VS Code đã cài ở bước 6 phần trên, không phải cài lại theo từng repo.

#### Nâng cấp framework về sau
```
/update-framework
```
Đọc số phiên bản đang cài, hỏi npm bản mới nhất, chỉ nâng cấp khi thực sự có bản mới hơn. Trước khi ghi đè, kiểm tra còn thay đổi chưa commit trong `.agent/` không — nếu còn thì dừng, yêu cầu commit hoặc cất tạm trước.

**Ranh giới ghi đè và bảo toàn khi nâng cấp:**

| | Nội dung |
|---|---|
| **Bị ghi đè (làm mới hoàn toàn)** | Toàn bộ file lệnh, các bước dùng chung, bộ luật, hooks, template, kỹ năng, module và số phiên bản trong `.agent/`, cộng phần cấu hình Claude Code trong `.claude/`. Đừng sửa tay các file này. |
| **Được giữ nguyên (an toàn)** | `.agent/project-context.yaml`, `CLAUDE.md`, toàn bộ `specs/` (kể cả từ điển nghiệp vụ, danh mục thực thể), thư mục sổ trace `.trace/`. |

**Phân biệt hai lệnh dễ nhầm:** `/sync` kéo về nội dung dự án mới nhất và làm mới bảng theo dõi — chạy hằng ngày. `/update-framework` nâng cấp chính bộ công cụ — thỉnh thoảng mới chạy, khi có phiên bản mới.

---

## 03 — Bản đồ dây chuyền

Một tính năng đi qua **chín chặng** trước khi lên sản phẩm. **PO và BA sở hữu bốn chặng đầu**; từ chặng thứ năm trở đi là địa phận của dev và QC.

```
Khám phá  → /define-product

PRD       → /generate-prd → /review-context → /refine-prd → /review-context

Design Spec → /generate-design-spec

BDD       → /generate-bdd → /review-context

Tech Design → /generate-tech-docs        [Dev sở hữu]

Code        → /generate-code            [Dev sở hữu]

Dev tự kiểm → /dev-gen-test → /dev-run-test   [Dev sở hữu]

QC           → /generate-tests → /run-tests → /report-bug   [QC sở hữu]

Rà độ phủ    → /validate-traces
```

PO/BA: bạn chạy lệnh, bạn ký duyệt. Dev/QC: bạn chỉ đọc kết quả.

### Tài liệu để lại sau mỗi chặng

Tài liệu xếp **theo loại trước, theo domain sau** — mọi PRD của cả công ty nằm chung trong `specs/prd/`, bên dưới mới chia theo domain; mọi kịch bản nằm chung trong `specs/bdd/`, v.v. Mỗi lệnh chỉ phải dò đúng một nhánh cây thư mục khi tìm tài liệu bước trước.

Hệ quả: tài liệu của **một** tính năng nằm rải ở nhiều nhánh, không gom vào một chỗ. Thứ buộc chúng lại với nhau là **mã tính năng lặp trong tên file**.

Ví dụ có thật, tính năng onboarding (mã FEAT-01):
```
specs/
├── product-definition/  FEAT-01-onboarding.md            ← biên bản buổi khám phá
├── urd/onboarding/FEAT-01-onboarding/
│                        FEAT-01-URD-2-presurvey-segmentation.md
├── brd/onboarding/FEAT-01-onboarding/
│                        FEAT-01-BRD-2-presurvey-segmentation.md
├── prd/onboarding/      FEAT-01-PRD-2-presurvey-segmentation.md   ← PRD
├── design-spec/onboarding/
│                        FEAT-01-UC4-design-spec-app.md
│                        FEAT-01-UC4-design-spec-web.md
├── bdd/onboarding/
│   ├── system/          FEAT-01-UC4-segment-survey.feature   ← kịch bản backend
│   ├── web/             FEAT-01-UC4-segment-survey.feature   ← kịch bản web
│   └── app/             FEAT-01-UC4-segment-survey.feature   ← kịch bản app
├── tech-docs/onboarding/
│                        FEAT-01-UC4-tech-design.md       ← phần này dev viết
└── domain-knowledge/    business-dictionary.md, core-entities.md

.trace/                  FEAT-01-UC4-system.tsv, FEAT-01-UC4-web.tsv   ← sổ theo dõi độ phủ
.agent/review/           FEAT-01-PRD-2-presurvey-segmentation-findings.yaml  ← kết quả review
```

**URD và BRD** ghi tầng trên của PRD (URD = yêu cầu nhìn từ phía người dùng; BRD = nhìn từ phía kinh doanh) — hữu ích để trả lời "vì sao lại làm thế này". **Chưa có lệnh framework nào sinh ra hai loại này** — viết bằng bộ kỹ năng riêng, không phải chặng bắt buộc.

### Ba quy ước đặt tên (bắt buộc — máy dò tên file theo khuôn mẫu, không đọc hiểu nội dung)

**Quy ước 1 — Tên rút gọn của tính năng**
Lấy tên tính năng, bỏ dấu, viết thường, nối bằng gạch ngang:
```
Tên tính năng:  Khảo sát phân nhóm trước khi học
Tên rút gọn:    presurvey-segmentation
```
Xuất hiện trong tên file của MỌI tài liệu thuộc tính năng — các bước sau chép nguyên văn, không tự nghĩ tên khác.

**Quy ước 2 — Tên file PRD**
Một tính năng lớn tách thành **nhiều PRD đánh số**, mỗi PRD gom một nhóm use case đi liền mạch. Tên file = mã tính năng + chữ PRD + số thứ tự + tên rút gọn:
```
Đúng:  FEAT-01-PRD-2-presurvey-segmentation.md
Sai:   prd.md
Sai:   FEAT-01-presurvey.md              ← thiếu chữ PRD và số thứ tự
Sai:   PRD-FEAT-01-2-presurvey.md        ← sai thứ tự các phần
```
Nguyên tắc tách PRD: **mỗi PRD nên là một mảng nghiệp vụ có thể duyệt và bàn giao độc lập**. Tách quá nhỏ → họp duyệt vụn vặt; gom quá to → mỗi lần sửa một chỗ phải tăng version cả khối.

**Quy ước 3 — Cách đánh số quy tắc nghiệp vụ**
Mã ghép 4 phần: mã tính năng + số PRD + số use case + số quy tắc:
```
FEAT-01-PRD-2-UC1-BR3
└─ FEAT-01     tính năng onboarding
   └─ PRD-2    PRD số 2, phần khảo sát phân nhóm
      └─ UC1   use case số 1 trong PRD đó
         └─ BR3  quy tắc thứ ba
```
**Số quy tắc đếm liên tục từ đầu tới cuối một PRD**, không quay về số 1 khi sang use case mới:
```
Use case 1  →  BR1, BR2
Use case 2  →  BR3, BR4       ✔ đúng — đếm tiếp
Use case 2  →  BR1, BR2       ✘ sai  — quay về đếm lại từ đầu
```
Lý do: nếu đếm lại thì trong cùng PRD sẽ có nhiều quy tắc cùng mang số 1, gây nhầm khi họp. Bộ đếm chỉ chạy liên tục trong phạm vi một PRD — sang PRD-3 thì đếm lại từ BR1.

---

## 04 — Trước mỗi phiên làm việc

4 việc mất ~5 phút, tiết kiệm cả buổi sửa chữa:

| Việc | Vì sao cần |
|------|-----------|
| **1** Mở Claude Code đúng tại thư mục gốc của repo | Điều kiện để framework tìm thấy file cấu hình và đường dẫn chuẩn. Mở nhầm thư mục con → mọi lệnh hỏng, thông báo lỗi không nói rõ nguyên nhân. |
| **2** Chuyển sang model Opus bằng `/model` | Phân tích PRD dài, đối chiếu chéo use case, soi chỗ thiếu đòi hỏi suy luận sâu; model nhỏ hơn dễ bỏ sót tình huống biên mà bạn không biết là đã bỏ sót. |
| **3** Kiểm tra đang đứng ở nhánh git nào | Nhiều PO cùng làm trên một repo. Đứng nhầm nhánh dễ ghi đè tài liệu người khác đang viết dở. |
| **4** Xác định domain của tính năng | Domain quyết định tài liệu nằm thư mục nào, team dev nào nhận. Chỉ chọn trong danh sách đã khai lúc khởi tạo — với repo Free Trial là bảy giá trị: `onboarding`, `learning`, `segment`, `chatbot`, `home-ai-native`, `tracking`, `report-bgv`. |

### Đừng đốt cháy giai đoạn
Có sẵn mô tả chi tiết không đồng nghĩa đã khám phá xong — phần lớn chỗ hở chỉ lộ ra khi bị hỏi vặn ở bước khám phá. Framework không cho đi tắt: lệnh sinh PRD có cổng chặn cứng, biên bản khám phá chưa đủ 7 phase thì dừng hẳn.

---

## 05 — Bảy bước làm một tính năng

*(Phần trọng tâm của sổ tay — trả lời trực tiếp "làm PRD như thế nào")*

### B1 — Khám phá tính năng
**PO chủ trì**

```
Gõ trong Claude Code
/define-product
```

**Mục đích:** biến ý tưởng thành biên bản có cấu trúc. Vận hành như phỏng vấn: AI hỏi từng câu, đợi trả lời xong mới hỏi tiếp. Đừng gộp trả lời nhiều câu — chính nhịp hỏi chậm lôi ra được chỗ tưởng đã rõ mà chưa rõ.

**AI hỏi mã ticket + tên tính năng, sau đó chạy 8 phase:**

- **Phase 0** (AI tự làm): quét dự án liệt kê khái niệm/tính năng liên quan, lập bảng chuẩn hoá thuật ngữ. Từ mới lặp ≥2 lần → ghi lại để hỏi ở phase 3.
- **Phase 1** — 8 câu định nghĩa tính năng: bối cảnh, vấn đề, mục tiêu nghiệp vụ, vai trò tham gia, phạm vi làm, **phạm vi không làm**, user story, **phụ thuộc liên service** (dữ liệu/năng lực cần từ team khác). *(Đây là 2 câu hay bị trả lời qua loa nhất nhưng quan trọng nhất.)*
- **Phase 2** — luồng người dùng: điểm bắt đầu, từng bước, danh sách màn hình (thành phần + hành động chính), điểm kết thúc, tình huống hỏng ngoài luồng thuận lợi.
- **Phase 3** — hỏi vặn lại chỗ còn hở. **Phase chặn**: còn mục chưa giải quyết thì không sang phase sau.
- **Phase 4–6** — suy ra business rule, business logic, acceptance criteria. AI soạn, bạn đọc và duyệt từng bảng.
- **Phase 7** — dựng ma trận độ phủ: mỗi hành động trong luồng đã có rule/logic/tiêu chí nghiệm thu chưa. Còn ô trống là còn việc.

**Chuẩn bị:** trả lời 8 câu phase 1 bằng lời nghiệp vụ thuần.

**Kết quả:** ghi vào `specs/product-definition/`. Họp bị cắt ngang → cứ để đó, file lưu số phase đã xong; buổi sau chạy lại lệnh, chọn file cũ, tiếp tục từ phase kế tiếp.

> **Câu nên hỏi thêm cho mọi tính năng trong buổi học:** nếu học sinh thoát khỏi lớp rồi quay lại giữa buổi, tương tác này xử lý ra sao — làm lại từ đầu hay giữ nguyên trạng thái? Framework không tự hỏi câu này (đặc thù dự án), nhưng bỏ sót đã nhiều lần khiến phải viết lại PRD sau khi dev đã làm.

---

### B2 — Sinh PRD
**AI soạn · PO duyệt**

```
Gõ trong Claude Code
/generate-prd specs/product-definition/FEAT-01-onboarding.md
```
(Gõ `@` rồi chọn file thay vì gõ tay đường dẫn.)

**Cổng chặn:** biên bản khám phá phải đủ 7/7 phase, nếu chưa thì lệnh dừng và yêu cầu quay lại.

**AI hỏi 3 câu:**
- **Tên PO** (chỉ hỏi nếu biên bản để trống).
- **Link tracker** — có ticket Jira thật thì dán vào, không thì để trống. AI không bao giờ tự ghép URL Jira từ mã ticket.
- **Nguồn API** — chọn 1 trong 3: *Đã có sẵn* (API đang chạy, contract cố định) / *Làm mới* (tự thiết kế từ đầu) / *Đối tác làm song song* (bên ngoài đang phát triển cùng lúc, contract chưa chốt). Chỉ chọn loại, không cần gõ chi tiết contract.

**Kết quả:** file PRD phiên bản **1.0**, trạng thái **draft**, đặt trong gói tính năng theo domain. Cấu trúc: bảng thông tin đầu tài liệu → tổng quan (user story, phạm vi, phụ thuộc liên service) → tiêu chí nghiệm thu → use case kèm bảng business rule 3 cột → hướng dẫn giao diện (sơ đồ luồng, khung màn hình) → phụ lục → nhật ký thay đổi.

---

### B3 — Kiểm chuẩn và cấu trúc PRD
**AI kiểm · PO quyết**

```
Gõ trong Claude Code
/review-context specs/prd/onboarding/FEAT-01-PRD-2-presurvey-segmentation.md
```

Kiểm tài liệu có đúng chuẩn/nhất quán không: thuật ngữ, mơ hồ, mâu thuẫn PRD khác, đủ phần bắt buộc.

**Trình tự 4 nhịp (thứ tự quan trọng):**
```
/generate-prd  →  /review-context  →  /refine-prd  →  /review-context
                     dọn chuẩn         soi nghiệp vụ       chốt
                                       (lặp tới khi sạch)
```

**Vì sao kiểm chuẩn trước, soi nghiệp vụ sau:** PRD vừa sinh còn lổn nhổn (từ chưa chuẩn, thiếu khung, câu mơ hồ). Soi nghiệp vụ ngay trên bản đó thì phần lớn vấn đề trả về chỉ là lỗi hình thức. Dọn chuẩn trước → danh sách vấn đề sau ngắn hơn và mục nào cũng là vấn đề nghiệp vụ thật.

**Năm nhóm kiểm tra:**

| Nhóm | Kiểm cái gì | Bắt lỗi gì |
|---|---|---|
| **P1** Thuật ngữ | Từ cấm trong từ điển, cùng khái niệm gọi 2 tên khác nhau, thuật ngữ kỹ thuật lọt vào văn nghiệp vụ |
| **P2** Mơ hồ | Định lượng không kiểm chứng được ("nhanh", "hợp lý"), câu không rõ ai làm, tiêu chí chỉ tả luồng thuận lợi bỏ luồng lỗi, tiêu chí ôm cơ chế xử lý, tiêu chí lặp lại đúng nội dung business rule |
| **P3** Xung đột giữa PRD | PRD này mâu thuẫn quy tắc đã chốt ở PRD khác cùng domain — luôn mức **critical**, bắt buộc người quyết |
| **P4** Đủ cấu trúc | Thiếu section bắt buộc, use case thiếu dòng liệt kê tiêu chí liên quan, tiêu chí không trỏ về rule nào, chỗ trống chưa điền, khai API "đã có sẵn" mà thiếu bảng contract |
| **P5** Tiêu chí riêng | Gõ thêm yêu cầu riêng sau đường dẫn file, nó kiểm theo yêu cầu đó |

**Hai cách áp sửa:**

| Cờ | Dùng khi |
|---|---|
| `--fix` | Áp ngay lỗi máy sửa an toàn (thay từ cấm, thêm khung thiếu, bổ sung nhãn) — không cần duyệt từng cái. Lượt đầu nên dùng cờ này. |
| `--resume` | Chỉ áp mục đã đọc và đánh dấu chấp nhận — dùng cho phần cần người cân nhắc (vd 2 PRD mâu thuẫn, bỏ cái nào). |

**Kết luận 3 mức:** `BLOCKED` (còn vấn đề nghiêm trọng) / `NEEDS_REVISION` (hết nghiêm trọng, còn vấn đề vừa) / `APPROVED` (sạch cả hai). Ở bước này **chưa cần APPROVED**, chỉ cần hết mức nghiêm trọng — lượt chốt (cuối B4) mới cần sạch hẳn.

---

### B4 — Soi PRD qua ba lăng kính
**AI soi · PO quyết** — bước tốn chất xám nhất, quyết định chất lượng PRD

```
Gõ trong Claude Code
/refine-prd specs/prd/onboarding/FEAT-01-PRD-2-presurvey-segmentation.md
```

Khác B3: B3 kiểm hình thức, B4 soi **nội dung nghiệp vụ** — thiếu/mơ hồ/mâu thuẫn tới mức dev không làm được không.

**Cơ chế:** chia việc thành nhiều lượt đọc song song, mỗi lượt đúng một góc nhìn + một use case:

- **Lăng kính DEV** — business rule/logic đủ rõ để triển khai chưa, nhánh lỗi có bỏ ngỏ không, quy tắc có mâu thuẫn không.
- **Lăng kính SA** — luồng thông suốt trên cả domain không, quan hệ thực thể có bỏ trống không, vòng đời trạng thái nhất quán không, quy tắc ai-được-làm-gì đã rõ chưa.
- **Lăng kính PO** — phạm vi đã khoanh gọn chưa, ưu tiên có rõ không, phạm vi có dấu hiệu phình ra không.

Cả 3 lăng kính viết bằng ngôn ngữ nghiệp vụ (kể cả DEV) — chỉ ra chỗ nghiệp vụ thiếu/mơ hồ sẽ chặn triển khai, không đề xuất giải pháp kỹ thuật.

**Vòng phê bình độ đầy đủ:** sau soi song song, chạy thêm vòng tự hỏi "còn sót gì không", lặp tới khi 2 lượt liên tiếp không moi thêm được gì. Vì vậy chạy lại lệnh này thường ra 0 — đã hội tụ ngay lần đầu.

**Kết quả:** file findings trong `.agent/review/` (chi tiết cách đọc → [mục 07](#07--đọc-bảng-vấn-đề)).

**Khi findings ra quá nhiều — đừng duyệt từng mục.** Với PRD lớn có thể ra vài chục mục; duyệt tuần tự khiến mệt dần và không thấy bức tranh chung — thực tế nhiều findings quy về 3-4 chỗ hở gốc. Thay vào đó gõ:

```
Gõ trong Claude Code
Hãy tìm phương án gom Issue theo nhóm và giải quyết theo nhóm. Hãy trình bày rành mạch rõ ràng với ngôn ngữ thuần nghiệp vụ, no tech. Đề xuất phương án xử lý cụ thể và để tôi duyệt trước khi apply.
```
4 vế của câu này: gom theo nhóm (quyết ở tầng vấn đề) → giải quyết theo nhóm (1 quyết định đóng cả cụm) → ngôn ngữ thuần nghiệp vụ (đọc được, mang ra họp được) → duyệt trước khi apply (không tự ý sửa PRD). Chốt nhóm nào thì bảo áp vào các mục thuộc nhóm ấy trong file findings, rồi mới chạy lệnh áp bên dưới.

**Áp các quyết định vào PRD:**
```
Gõ trong Claude Code
/refine-prd {đường-dẫn-prd} --resume
```
Áp mọi mục đã chấp nhận/sửa, tự tăng version, thêm dòng nhật ký, đưa trạng thái về lại **draft** (cố ý — tài liệu sửa thì phải đọc/duyệt lại).

**Từ lần chạy thứ 2:** tự so version hiện tại với lần review trước — PRD chưa đổi thì báo không có gì để soi, PRD đã đổi thì chỉ soi phần đã đổi. Ép quét toàn bộ: thêm `--full`.

**Lặp** vòng đọc findings → quyết từng mục → chạy lại `--resume` cho tới khi hết vấn đề nghiêm trọng/vừa, hoặc PRD không đổi nữa.

**Chốt lại bằng một lượt kiểm chuẩn nữa:**
```
Gõ trong Claude Code
/review-context {đường-dẫn-prd}
```
Vì các vòng soi vừa rồi có thể làm lệch chuẩn lại (thuật ngữ mới, rule mới mâu thuẫn PRD khác, tiêu chí mới quên trỏ rule).

**Đây mới là cổng ký duyệt** — chỉ ký khi lượt chốt này ra `APPROVED` hoặc sạch hoàn toàn mức nghiêm trọng. Lượt chốt lôi ra vấn đề mới thì quay lại `/refine-prd` thêm vòng rồi chốt lại — chuyện bình thường.

---

### B5 — Ký duyệt PRD
**Chỉ PO — làm bằng tay, không có lệnh**

Mở file PRD, tự sửa ô trạng thái:
```
| **Status**    | draft     |      →      | **Status**    | approved  |
```

AI **không bao giờ** tự đặt trạng thái đã duyệt dù PRD sạch findings tới đâu — đây là chữ ký của bạn, mở khoá 2 bước tiếp theo. Mỗi lần PRD bị sửa qua lệnh áp findings, trạng thái tự rơi về draft — không có đường tắt.

---

### B6 — Sinh Design Spec
**Chỉ tính năng có màn hình**

```
Gõ trong Claude Code
/generate-design-spec {đường-dẫn-prd}
```
Tính năng thuần backend → lệnh tự dừng, báo không áp dụng, nhảy thẳng sang B7.

**AI hỏi:** trích danh sách màn hình từ PRD, xác nhận đủ chưa → hỏi **link Figma cho từng màn một**.

**Chuẩn bị link Figma đúng cách:** link phải trỏ tới khung hình cụ thể (chuột phải → copy link to selection trong Figma), không phải link cả file — link file trần sẽ bị từ chối vì AI không đọc được bố cục thật, sẽ phải bịa. Màn chưa có thiết kế → gõ `none`, spec vẫn sinh nhưng đánh dấu thiếu, cả tài liệu giữ trạng thái nháp tới khi bổ sung đủ link.

**Kết quả:** file Design Spec trong gói tính năng, ghi rõ dựng từ PRD phiên bản nào (để đối chiếu độ lệch sau này).

**Ranh giới PRD vs Design Spec:** PRD nói màn hình có gì và bấm ra kết quả nghiệp vụ gì; Design Spec nói màn hình trông thế nào (màu sắc, khoảng cách, chuyển động, trạng thái tải/rỗng/lỗi). Viết màu sắc vào PRD là sai chỗ — framework tự bắt và nhắc chuyển.

---

### B7 — Sinh bộ kịch bản BDD rồi review
**PO chốt outline**

```
Gõ trong Claude Code
/generate-bdd {đường-dẫn-prd}
```
Sau đó:
```
/review-context {đường-dẫn-file-feature}
```

**Kịch bản BDD trông như thế nào** — viết bằng câu tiếng Việt thường, 3 phần Cho trước / Khi / Thì:
```
Kịch bản: Học sinh chưa kiếm được cúp nào thì đứng cuối bảng xếp hạng lớp
  Cho trước   buổi học thử đang diễn ra và lớp đã có đủ 15 bạn học giả lập
  Khi         học sinh chưa kiếm được cúp nào trong buổi
  Thì         bảng xếp hạng hiển thị học sinh ở vị trí cuối cùng
```
Cho trước = bối cảnh có sẵn; Khi = việc xảy ra; Thì = kết quả quan sát được. AI sinh từ PRD, bạn đọc và chỉnh.

**AI hỏi:**
1. Bộ kịch bản dành cho nền tảng nào — web / app / hệ thống (bản hệ thống tổng hợp từ web+app, hoặc sinh thẳng từ PRD nếu thuần backend).
2. **Câu quan trọng:** trước khi ghi file, trình bày **bản phác thảo** — danh sách kịch bản gom nhóm theo chủ đề, kèm chỉ dẫn kịch bản nào phủ tiêu chí nào — hỏi đã đúng chưa, cần thêm bớt gì.

> **Đây là điểm can thiệp rẻ nhất của cả quy trình.** Sửa ở bản phác thảo chỉ tốn một câu nói; sửa sau khi file đã sinh phải chạy lại cả vòng review. Nên đọc kỹ bản phác thảo thay vì đồng ý cho xong.

**Cổng cảnh báo (mềm, vẫn qua được nhưng có rủi ro):** PRD chưa duyệt → cảnh báo. Design Spec chưa duyệt hoặc đã lỗi thời so với PRD → cảnh báo tương tự.

PRD lớn (>3 use case hoặc >300 dòng): AI tự chia mỗi use case một lượt xử lý song song rồi gộp — không cần làm gì thêm.

**Review lại bộ kịch bản** — vẫn `/review-context` nhưng trỏ vào file kịch bản; tự nhận diện loại tài liệu và chuyển bộ kiểm riêng: mỗi AC/BR đã có ≥1 kịch bản phủ chưa, thuật ngữ, 10 luật viết kịch bản, độ phủ so với khung màn hình PRD, đủ thông tin đầu file, mỗi kịch bản đã khẳng định đủ hệ quả quan sát được chưa.

**Hai luật độ phủ hay làm review trượt:**
1. Mỗi thành phần/hành động trong khung màn hình PRD đều phải có ≥1 kịch bản.
2. Mỗi AC và mỗi BR (tới từng gạch đầu dòng logic con) phải có ≥1 kịch bản.

Thiếu một dòng là chặn → **chất lượng phần khung màn hình bạn viết trong PRD quyết định trực tiếp chất lượng bộ kịch bản kiểm thử sau này.**

---

### Sau bước bảy thì sao
Bàn giao cho dev (sinh tài liệu kỹ thuật → sinh code) và QC (chạy bộ lệnh kiểm thử riêng). Phần việc PO chuyển sang theo dõi: dùng `/validate-traces` để biết từng kịch bản đã làm tới đâu (chi tiết → [mục 09](#09--bảng-tra-lệnh-nhanh)).

---

## 06 — Ba luật viết tài liệu

Nguồn gốc phần lớn findings. Nắm được thì PRD qua review gần như sạch từ lần đầu.

### Luật 1 — Viết đúng tầng
Mỗi loại nội dung có đúng một chỗ ở. Nhét sai tầng là lỗi phổ biến và khó tự nhận ra nhất — câu văn vẫn đọc hợp lý, chỉ là nằm nhầm chỗ.

| Tầng | Chứa gì | Không được chứa gì |
|---|---|---|
| **Phạm vi** | Ranh giới ticket, mỗi dòng một câu ngắn làm gì/không làm gì | Cơ chế xử lý, định nghĩa thuật ngữ |
| **Tiêu chí nghiệm thu** | Một kết quả quan sát/kiểm chứng được + tham chiếu business rule | Số lần thử lại, thời gian chờ, tên trạng thái nội bộ, chi tiết nhánh lỗi |
| **Business rule/logic** | Toàn bộ cơ chế: điều kiện, công thức, nhánh rẽ, thông báo lỗi | Tên giao thức, tên bảng dữ liệu, cấu trúc kỹ thuật |
| **Design Spec** | Màu sắc, khoảng cách, chuyển động, trạng thái tải/rỗng/lỗi | Quy tắc nghiệp vụ (thuộc PRD) |
| **Tài liệu kỹ thuật** | Contract, tên trường, mã lỗi (dev sở hữu) | — |

**Ví dụ — Viết sai tầng:**
> AC3: Khi gửi báo cáo thất bại, hệ thống thử lại ba lần cách nhau năm giây, quá mười lăm giây thì bỏ và ghi trạng thái lỗi gửi vào bản ghi buổi học. *(P2 · major — ôm cơ chế xử lý; sửa cơ chế phải sửa 2 chỗ)*

**Viết đúng tầng:**
> AC3: Gửi báo cáo thất bại thì phụ huynh vẫn thấy buổi học ở trạng thái đã hoàn thành, và báo cáo được đánh dấu là chưa gửi được. *(BR: LESS-15-UC2-BR7)*
> — số lần thử lại/thời gian chờ nằm trong BR7; AC chỉ giữ phần quan sát được + trỏ sang nơi chứa cơ chế.

### Luật 2 — Nói tiếng nghiệp vụ

| Nhóm | Loại từ | Framework xử lý |
|---|---|---|
| **1** | Thao tác/triển khai kỹ thuật (hiển thị lại kiểu kỹ thuật, hết time-out, click, redirect, disable) | Diễn đạt lại bằng lời nghiệp vụ giữ nguyên nghĩa |
| **2** | Chi tiết hình ảnh (loading icon, animation, màu sắc, font, layout px) | Gỡ khỏi PRD, ghi nhận để đưa vào Design Spec |
| **3** | Chi tiết phía sau (tên giao thức, path service, mã trạng thái, tên bảng/cột) | Gỡ hẳn khỏi PRD (thuộc tài liệu kỹ thuật). Ngoại lệ: phụ lục ghi contract đã tồn tại khi khai API "đã có sẵn" |
| **4** | Ẩn dụ dữ liệu (cờ, trường, giá trị, trả về) | Xét theo ngữ cảnh — thay bằng tên nghiệp vụ nếu đang đứng thay trạng thái đã có tên riêng; giữ nguyên nếu bản thân là khái niệm nghiệp vụ thật ("giá trị đơn hàng") |

**Mẹo tự kiểm:** tự hỏi "khái niệm này đã có tên nghiệp vụ chưa" thay vì "từ này có bị cấm không". Có mục trong từ điển → dùng đúng tên đó; chưa có → dấu hiệu nên bổ sung từ điển.

### Luật 3 — Nối tiêu chí với quy tắc, cả hai chiều

**Chiều đi** — cuối mỗi AC ghi kèm mã quy tắc quy định nó: `AC3: ... (BR: LESS-15-UC2-BR7)`

**Chiều về** — use case liệt kê tiêu chí mình chịu trách nhiệm: `#### LESS-15-UC2: Gửi báo cáo cho phụ huynh` → `Các tiêu chí liên quan: AC3, AC4`

**Vì sao cần cả hai chiều:** máy gom tất cả AC ghi mã quy tắc thuộc UC2, so với danh sách UC2 tự khai — 2 danh sách phải trùng khít. Lệch nghĩa là 1 trong 2 bên sai (quên ghi mã, hoặc khai nhầm) — máy chỉ báo lệch, không đoán bên nào đúng. Lợi ích thật sự: khi 1 quy tắc đổi, lần theo mã ra ngay AC nào/kịch bản nào phải sửa theo.

**Quy ước nhỏ:** khi PRD nhắc ticket khác, viết dạng link bấm được: `[LESS-15](../bao-cao-hoc-tap/LESS-15-bao-cao-hoc-tap.md)` thay vì để mã trần.

---

## 07 — Đọc bảng vấn đề

Hai lệnh soi tài liệu **không tự sửa gì** — chỉ ghi findings rồi chờ bạn quyết định. Cơ chế 3 nhịp: máy phân tích → người duyệt → máy áp sửa.

### Nằm ở đâu, mở bằng gì
File văn bản thường trong `.agent/review/`, tên theo tính năng.
- **Cách dễ:** chuột phải → mở bằng Review Board (giao diện danh sách, bấm vào mục nhảy thẳng tới dòng PRD liên quan, chọn quyết định bằng nút).
- **Cách thủ công:** mở bằng VS Code, sửa chữ — giữ nguyên khoảng trắng thụt lề, chỉ thay phần sau dấu hai chấm.

### Một mục findings gồm gì
```yaml
- id: "F007"
  lens: "DEV"                    ← lăng kính nào phát hiện ra
  severity: "major"              ← mức nghiêm trọng
  section: "§2. Acceptance Criteria"
  uc_id: "FEAT-01-PRD-2-UC1"
  quote: "khảo sát được tính lại mỗi lần vào lại"   ← trích nguyên văn
  finding: "Chưa nói rõ khi học sinh bỏ dở khảo sát rồi vào lại thì..."
  suggestion: "Bổ sung business rule nêu rõ..."
  resolution_edge_cases:         ← nếu chốt phương án này thì có thể phát sinh gì
    - "..."
  auto_fixable: false
  status: "pending"              ← DÒNG DUY NHẤT BẠN SỬA
```

### Bảy trạng thái

| Trạng thái | Ý nghĩa và hệ quả |
|---|---|
| `pending` | Mặc định = chưa đọc. Cuối buổi duyệt không nên còn mục nào ở đây. |
| `accepted` | Đồng ý đề xuất AI — lệnh áp sửa dùng nguyên văn đề xuất |
| `modified` | Không đồng ý hoàn toàn, tự sửa lại nội dung ô đề xuất — lệnh áp sửa dùng bản đã sửa |
| `rejected` | Bác bỏ — không áp, không hiện lại ở lần review sau |
| `needs_discussion` | Có 2 phương án loại trừ lẫn nhau, cần người chọn — **chặn lệnh áp sửa** cho tới khi chốt |
| `deferred` | Cố ý hoãn — không chặn, bỏ qua lượt này |
| `applied` | Máy tự đặt sau khi áp xong — không tự gõ bằng tay |

> Bảng dài vài chục mục → đừng duyệt tuần tự, dùng cách gom nhóm ở [B4 mục 05](#05--bảy-bước-làm-một-tính-năng).

**Phần đáng đọc nhất:** với vấn đề mức nghiêm trọng/vừa, AI ghi sẵn mục *phân tích hệ quả bậc hai* — chốt theo phương án này thì phát sinh gì, va chạm quy tắc nào, lộ trạng thái biên nào. Đây là phần cho thấy hậu quả **trước khi** ký — hay bị lướt qua nhất, đừng lướt.

### Phân biệt hai lệnh review

| | `/refine-prd` | `/review-context` |
|---|---|---|
| **Soi cái gì** | Nội dung nghiệp vụ thiếu/mơ hồ/mâu thuẫn | Đúng chuẩn, đủ cấu trúc, nhất quán thuật ngữ |
| **Tự sửa được không** | Không — mọi phát hiện là phán đoán nghiệp vụ, bắt buộc qua người | Có, với lỗi hình thức máy sửa an toàn |
| **Chạy khi nào** | Sau khi `/review-context` dọn xong hình thức, lặp lại sau mỗi sửa lớn | 2 lượt: ngay sau sinh PRD (dọn chuẩn) + lượt chốt trước khi ký |

---

## 08 — Version và độ lệch tài liệu

Tài liệu xếp nhiều tầng, tầng sau dựng trên tầng trước. Vấn đề: tầng trước đổi, tầng sau không tự biết. Giải pháp: mỗi tài liệu ghi lại nó dựng từ **phiên bản nào** của tài liệu gốc.

**Ví dụ:** PRD ở v1.2 → sinh bộ kịch bản, file kịch bản ghi "sinh từ PRD v1.2". PRD sửa lên v1.3, file kịch bản vẫn ghi v1.2 (không bị động tới). Lần sau chạy lệnh sinh kịch bản, nó so 2 số, thấy lệch → mở nhật ký thay đổi PRD xem đã đổi gì → báo kèm 3 lựa chọn: cập nhật phần bị ảnh hưởng / sinh lại toàn bộ / tạm huỷ xem xét thêm.

**Những chỗ framework tự đối chiếu phiên bản:**

| Tài liệu | Ghi lại điều gì | Khi lệch thì sao |
|---|---|---|
| Design Spec | Dựng từ PRD version nào | Hiện danh sách thay đổi, hỏi: cập nhật phần ảnh hưởng / sinh lại toàn bộ / huỷ |
| File kịch bản BDD | Sinh từ PRD version nào | Trích nhật ký thay đổi từ version cũ, hỏi 3 lựa chọn tương tự. Nhật ký mơ hồ → khuyên sinh lại toàn bộ |
| File findings | Version lúc soi và version đã áp tới | PRD bị sửa ngoài tầm theo dõi → tự quét lại toàn bộ thay vì chỉ phần đổi |
| Sổ trace | Version PRD và version kịch bản | Lệnh rà độ phủ gắn cờ báo tài liệu nguồn đã đi trước code |

### Quy tắc tăng số phiên bản
- **Tăng số phụ** (1.2→1.3): làm rõ câu chữ, bổ sung tình huống biên, tinh chỉnh diễn đạt.
- **Tăng số chính** (1.3→2.0): thêm/bỏ use case, tái cấu trúc phạm vi, đổi business rule phá vỡ cái cũ.
- Mỗi lần tăng số phải kèm **dòng nhật ký ghi rõ use case, tiêu chí, quy tắc nào bị ảnh hưởng** — ghi chung chung ("cập nhật nội dung") là vô dụng, khiến lần sinh lại sau không biết sửa chỗ nào và framework phải khuyên sinh lại toàn bộ.
- Bảng nhật ký trong PRD chỉ giữ 5 bản gần nhất, bản cũ hơn dồn sang file lưu trữ riêng.

> ⚠️ **Cạm bẫy nguy hiểm, khó phát hiện:** tăng số phiên bản mà không thực sự sửa nội dung tương ứng — mọi tài liệu phía sau tin vào con số đó, một con số sai khiến cả chuỗi ngầm lệch nhau mà không ai biết.

---

## 09 — Bảng tra lệnh nhanh

### Lệnh trong dây chuyền chính

| Lệnh | Dùng khi nào | Kết quả để lại |
|---|---|---|
| `/define-product` | Bắt đầu tính năng mới | Biên bản khám phá 7 phase trong `product-definition/` |
| `/generate-prd {file}` | Biên bản khám phá đã hoàn thành | PRD v1.0, trạng thái draft |
| `/review-context {prd}` | Ngay sau khi có PRD, và lặp lại để chốt trước khi ký | File findings về chuẩn/cấu trúc, kết luận 3 mức |
| `/refine-prd {prd}` | Sau khi đã dọn chuẩn ở lệnh trên | File findings từ 3 lăng kính, mức khuyến nghị chung |
| `/refine-prd {prd} --resume` | Đã duyệt xong findings | PRD được sửa, version tăng, trạng thái về draft |
| `/generate-design-spec {prd}` | PRD đã duyệt, tính năng có màn hình | Design Spec kèm link Figma từng màn |
| `/generate-bdd {prd}` | PRD đã duyệt (+ Design Spec đã duyệt nếu có màn hình) | File kịch bản theo nền tảng, kèm sổ trace |
| `/review-context {feature}` | Sau khi sinh kịch bản | File findings về độ phủ, cách viết kịch bản |

### Lệnh dùng khi có việc phát sinh

| Lệnh | Dùng khi nào | Kết quả để lại |
|---|---|---|
| `/validate-traces` | Muốn biết tính năng đã làm/kiểm thử tới đâu | Bảng độ phủ theo kịch bản: `UNTRACKED` (chưa có code) / `DRIFT` (tài liệu đổi sau code) / `GAP` (có code chưa kiểm thử) / `OK` (đầy đủ) |
| `/learn "…"` | AI vừa lặp lại đúng 1 lỗi đã nhắc trước đó | Quy tắc chặn ghi vào file bài học dự án, tự nạp vào đầu mọi lệnh sau |
| `/propose-scenario {UC}` | Tester phát hiện kịch bản còn thiếu | Đề xuất trong thư mục feedback, hoặc yêu cầu thay đổi PRD nếu vấn đề ở tầng nghiệp vụ |
| `/report-bug` | Cần ghi nhận lỗi gắn với AC bị vi phạm | Báo cáo lỗi trong feedback, liên kết ngược về AC/kịch bản liên quan |

---

## 10 — Cạm bẫy thường gặp

| Cạm bẫy | Vì sao xảy ra và cách tránh |
|---|---|
| **Nhảy thẳng vào sinh PRD** | Có sẵn mô tả chi tiết dễ tạo cảm giác đã khám phá xong — nhưng phần lớn chỗ hở chỉ lộ ở phase 3 khi bị hỏi vặn. Đi đủ 7 phase, thường chỉ tốn thêm 20 phút. |
| **Duyệt bản phác thảo kịch bản cho xong** | Đây là điểm can thiệp rẻ nhất quy trình — đọc kỹ, thêm bớt ngay tại đó thay vì để sinh file rồi mới phát hiện thiếu và phải chạy lại cả vòng review. |
| **Tin vào nhãn ghi phiên bản** | Nhãn có thể đúng trong khi nội dung đã lệch (ai đó sửa tay quên cập nhật nhật ký). Khi rà độ lệch, so toàn bộ nội dung chứ không chỉ phần được báo đã đổi. |
| **Sửa xong tin là đã xong** | Bản sửa hay lộ ra vấn đề mới ở chỗ khác — đó là lý do có phần phân tích hệ quả bậc hai. Sau khi áp findings, chạy lại review một lượt nữa. |
| **Sửa thẳng tài liệu do người khác viết** | Gây xung đột khi gộp nhánh, mất công sức người khác. Đúng cách: viết ghi chú trong tài liệu đó, hoặc mở yêu cầu thay đổi trong feedback, rồi báo người sở hữu. |
| **Sửa PRD đã có code chỉ vì đổi cách gọi tên** | Mở sổ trace của use case xem đã có code chưa — nếu có, mỗi lần đổi chữ là 1 vòng cập nhật cho cả dev lẫn QC. Gom lại đổi 1 lần, không sửa lắt nhắt. |

**Nguyên tắc nền của cả sổ tay:** Framework không quyết thay bạn — nó hỏi đúng chỗ, chặn ở điểm dễ sai, giữ các tầng tài liệu khớp nhau. Phần khó nhất — sản phẩm nên hoạt động thế nào và vì sao — hoàn toàn thuộc về PO. Mọi cổng ký duyệt bắt buộc chữ ký người thật, cố tình không tự động hoá.

---

## 11 — Bài tập thực hành

Bài tập cuối buổi đào tạo, ~90 phút cho 1 tính năng nhỏ:

| Chặng | Việc cần làm | Coi là đạt khi |
|---|---|---|
| **1** | Chọn 1 tính năng nhỏ có thật (1-2 use case) | Nói được vấn đề + mục tiêu nghiệp vụ trong 3 câu, không cần mở tài liệu |
| **2** | Chạy buổi khám phá tới hết phase 7 | Biên bản hoàn thành, ma trận độ phủ không còn ô trống |
| **3** | Sinh PRD | Đủ bảng thông tin, phần phụ thuộc liên service, ≥1 use case kèm bảng business rule |
| **4** | Chạy soi 3 lăng kính, duyệt findings, áp sửa | Mọi mục có trạng thái chủ đích, không còn mục mặc định |
| **5** | Chạy kiểm chất lượng và sửa tới khi sạch | Đạt mức đã duyệt, hoặc cần chỉnh sửa nhưng không còn vấn đề nghiêm trọng |
| **6** | Tự tay đặt trạng thái đã duyệt | Đã đọc lại toàn bộ PRD trước khi ký, không ký theo quán tính |
| **7** | Sinh bộ kịch bản, sửa bản phác thảo ≥1 chỗ | Nêu được lý do nghiệp vụ cho chỗ đã sửa |

**Nộp lại:** đường dẫn gói tính năng vừa tạo + câu trả lời: trong cả vòng vừa rồi, chỗ nào framework bắt được lỗi mà tự đọc bạn đã không nhận ra? (Câu trả lời này thường đáng thảo luận chung nhất — chỉ ra điểm mù chung của cả nhóm.)

---

## Phụ lục — Từ điển thuật ngữ

### Từ về công cụ và cách làm việc

| Từ | Nghĩa |
|---|---|
| **Repo** | Thư mục dự án chứa toàn bộ tài liệu của team, kèm lịch sử chỉnh sửa |
| **Git** | Công cụ lưu lịch sử chỉnh sửa — xem ai sửa gì lúc nào, quay lại bản cũ khi cần |
| **Commit** | Một lần "chốt sổ" thay đổi vừa làm, kèm mô tả ngắn |
| **Nhánh** | Bản làm việc song song, sửa mà không ảnh hưởng bản chính cho tới khi xong |
| **Cửa sổ dòng lệnh** | Terminal — chỉ cần dùng 1 lần lúc cài đặt |
| **npx** | Lệnh chạy công cụ cài đặt mà không cần cài sẵn |
| **Model** | Phiên bản trí tuệ AI đang dùng — bản mạnh suy luận sâu hơn nhưng chậm/tốn hơn. Khuyên dùng Opus khi viết tài liệu |

### Từ về tài liệu và quy trình

| Từ | Nghĩa |
|---|---|
| **Biên bản khám phá** | Kết quả buổi hỏi đáp đầu tiên (7 phần, từ bối cảnh tới ma trận độ phủ) — nguyên liệu sinh PRD |
| **PRD** | Tài liệu yêu cầu sản phẩm: làm gì, cho ai, theo quy tắc nào, nghiệm thu ra sao — tài liệu trung tâm |
| **Use case** | Một tình huống sử dụng trọn vẹn, có người thực hiện, điều kiện trước, kết quả sau |
| **Tiêu chí nghiệm thu (AC)** | Kết quả quan sát được, dùng phán định tính năng đạt hay chưa |
| **Quy tắc nghiệp vụ (BR)** | Điều hệ thống bắt buộc phải/không được làm, kèm điều kiện áp dụng |
| **BDD** | Cách viết kịch bản kiểm thử bằng câu tiếng Việt thường theo khuôn Cho trước–Khi–Thì |
| **Kịch bản (SC)** | Một tình huống kiểm thử cụ thể trong tài liệu BDD |
| **Design Spec** | Tài liệu mô tả giao diện — chỉ có với tính năng có màn hình |
| **Findings** | Bảng liệt kê vấn đề AI phát hiện, mỗi mục có mức nặng nhẹ + đề xuất sửa, bạn quyết nhận hay bỏ |
| **Sổ theo dõi (trace)** | File ghi trạng thái từng kịch bản: đã có code chưa, đã kiểm thử chưa, tài liệu có lệch không |
| **Gói tính năng** | Thư mục gom tất cả tài liệu của một tính năng (minh hoạ ở mục 03) |
| **Domain** | Mảng nghiệp vụ tính năng thuộc về — quyết định tài liệu nằm đâu, team dev nào nhận |
| **Từ điển nghiệp vụ** | File liệt kê thuật ngữ chuẩn + từ không dùng nữa — AI nạp trước mỗi lần viết |

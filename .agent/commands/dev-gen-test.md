# /dev-gen-test — Sinh Dev Self-Check Tests

> **Scope — dev self-check (smoke), không phải bộ test chính thức.** Các test này để
> dev nhanh chóng kiểm chứng code mình sinh ra so với các BDD scenario. Đây là một
> self-check của dev, **không** phải bộ test authoritative của QC/dev-team (cái đó có
> flow riêng, implement ở nơi khác). Kết quả hiện lên dashboard Living Docs như một tín hiệu
> **dev self-test** để QC thấy dev đã tự chạy check của mình.

## Gate
# Gate — Quy trình vào chuẩn cho mọi lệnh

Mọi lệnh PHẢI chạy gate này trước khi thực thi phần logic riêng của nó.

## Bước 0 — Kiểm tra chế độ Sub-Agent

Trước tiên, kiểm tra xem `$ARGUMENTS` có phải là payload JSON từ một orchestrator hay không:

1. Thử parse `$ARGUMENTS` dưới dạng JSON.
2. Nếu parse thành công **và** chứa `"_agent_mode": true`:
   - **Bỏ qua hoàn toàn Bước 1, 2 và 3 của Gate này.**
   - Đặt target file = `payload.target_file`
   - Đặt loaded context = `payload.context` (KHÔNG chạy context-loader.md)
   - Đặt phạm vi UC = `payload.uc_id` (chỉ xử lý UC này)
   - Đặt line range = `payload.uc_section` (chỉ đọc đúng section đó của PRD)
   - Đặt dimension = `payload.dimension` nếu có (lệnh review per-UC: chỉ review đúng lăng kính này)
   - Đi thẳng tới phần logic riêng của lệnh.
3. Nếu `$ARGUMENTS` không phải JSON hoặc không có `_agent_mode` → tiếp tục sang Bước 1 (chế độ thường).

## Bước 0-B — Ghi nhận Model *(KHÔNG chặn)*

*Bỏ qua nếu `_agent_mode: true` (sub-agent — orchestrator đã ghi nhận rồi).*

Ghi lại **model mà bạn — agent đang chạy lệnh này — thực sự đang dùng**, rồi mang nó vào
dòng `Model:` của report cuối (xem `report-footer`). Nếu bạn biết mình **không** phải một
model Opus, gắn thêm cảnh báo ngay ở dòng đó.

**KHÔNG hỏi người dùng. KHÔNG chờ. KHÔNG dừng.**

> **Vì sao bước này từng là prompt chặn, và vì sao bỏ (GAPS-v3 G41):** bản cũ hiện khối
> `⚙️ MODEL CHECK` rồi chờ `Y/S/N`. Ba vấn đề cùng chỉ một hướng:
> **(1)** nó hỏi người dùng thứ mà **agent đã biết chính xác**;
> **(2)** câu trả lời **không kiểm chứng được** — gõ `Y` xong vẫn đang chạy Haiku thì không
> gì phát hiện;
> **(3)** **cả `Y` lẫn `S` đều đi tiếp** — cách duy nhất để nó dừng là tự nguyện gõ `N`.
> Tức nó **không chặn được ai**, mà tốn một lần chặn ở **mọi** lệnh. Một feature đi hết
> pipeline dùng 20 lệnh; 30/32 lệnh chạy gate. Hai mươi lần bấm cho một tín hiệu tự-khai
> không kiểm chứng được — và chính cái giá đó làm mòn CHECKPOINT ở Bước 3, cổng có giá trị thật.
>
> Khai báo trong report **mạnh hơn** hỏi: đúng nguồn (agent, không phải người), và nằm
> **cạnh kết quả** để cân nhắc, thay vì nằm trước khi có kết quả để bấm cho xong.

**Vẫn khuyến nghị Opus:** phân tích spec, review kiến trúc và sinh code đòi hỏi suy luận sâu;
model nhỏ hơn dễ bỏ sót edge case và vi phạm kiến trúc. Đổi: `/model` → chọn Opus.

## Bước 1 — Xác định Target File

0. **Tách cờ trước khi resolve target.** `$ARGUMENTS` có thể lẫn các `--flag` (vd `--phase=integration`, `--comment`, `--fix`). **Loại bỏ mọi token bắt đầu bằng `--`** ra khỏi phần dùng để tìm target — chỉ giữ phần path/UC-ID/ticket. (Các flag đó do phần logic riêng của lệnh parse ở bước sau, KHÔNG phải tên file.)
1. Nếu `$ARGUMENTS` (đã tách cờ) được cung cấp và trỏ tới một file tồn tại → dùng trực tiếp làm target.
2. Nếu `$ARGUMENTS` là một **UC-ID / ticket ID / tên rút gọn** (không có path) → phân giải thành file bằng cách glob theo bố cục feature-package. `{prd-slug}` lúc này **chưa biết**, nên dùng wildcard `*` cho segment đó, và `**` đệ quy dưới `bdd/` để phủ hết các thư mục con theo platform (`bdd/web/`, `bdd/app/`, `bdd/system/`):
   - **Lệnh BDD** (target là `.feature`): `{specs_dir}/{domain}/*/bdd/**/{UC-ID}*.feature` — hoặc `{specs_dir}/*/*/bdd/**/{UC-ID}*.feature` nếu domain cũng chưa biết. Nếu lệnh ngụ ý một platform/scope cụ thể (vd: system tech-doc cần BDD `system/`), ưu tiên kết quả trong thư mục con platform đó.
   - **Lệnh PRD** (target là file PRD `{TICKET-ID}-{prd-slug}.md` — file `.md` duy nhất ở gốc feature folder, cạnh `bdd/`): `{specs_dir}/{domain}/*/{TICKET-ID}*.md` nếu biết TICKET-ID; nếu không, `{specs_dir}/{domain}/*/*.md` (khớp feature folder có id tương ứng), hoặc `{specs_dir}/*/*/*.md` nếu domain cũng chưa biết. *(Glob `*/*.md` ở cấp gốc folder chỉ khớp PRD — tech-docs/design-spec `.md` nằm sâu hơn trong thư mục con.)*
   - **Lệnh tech-docs** — target là tech-doc **gộp cấp PRD** `{TICKET-ID}-tech-design.md` (MỘT doc phủ nhiều UC; danh sách UC nằm ở `@trace.ucs`). Vì tên file mang `{TICKET-ID}` chứ **không** mang `{UC-ID}`, phải tách trước khi glob:
     - `$ARGUMENTS` là **UC-ID** (`{TICKET-ID}-UC{N}`) → lấy `{TICKET-ID}` = phần **trước** `-UC`, rồi glob `{specs_dir}/{domain}/*/tech-docs/{TICKET-ID}-tech-design.md`.
     - `$ARGUMENTS` là **TICKET-ID** → glob trực tiếp như trên.
     - Chưa biết domain → `{specs_dir}/*/*/tech-docs/{TICKET-ID}-tech-design.md`.
     - Vẫn không khớp → glob rộng `{specs_dir}/*/*/tech-docs/*tech-design*.md` rồi liệt kê để người dùng chọn.
     *(Đừng glob `{UC-ID}*-tech-design*.md` — nó nở thành `FT-001-UC1*-tech-design*.md` và **không bao giờ** khớp `FT-001-tech-design.md`.)*
   - **Lệnh design-spec**: `{specs_dir}/{domain}/*/design-spec/{TICKET-ID}*.md`.

   Khi một file khớp: đặt nó làm target **và** ghi lại `domain` + `prd_slug` từ path của nó (theo quy tắc trích xuất trong `context-loader.md` Bước 1 — `prd_slug` = segment đầu tiên sau `{specs_dir}/{domain}/`). Mọi path mà lệnh đọc/ghi về sau (BDD/tech-docs/design-spec/trace cùng cấp) đều dùng **`prd_slug` đã phân giải đó**, nên tất cả artifact nằm chung một feature package. Nếu nhiều file khớp (vd: nhiều platform), chọn theo platform/scope của lệnh hoặc liệt kê ra và hỏi.
3. Nếu `$ARGUMENTS` rỗng hoặc không tìm thấy file khớp:
   - Liệt kê các file trong thư mục liên quan của lệnh này (vd: `specs/*/*/*.md` — file PRD ở gốc mỗi feature folder — cho lệnh PRD, `specs/*/*/bdd/**/*.feature` cho lệnh BDD).
   - Hiển thị danh sách cho người dùng và hỏi: "Bạn muốn làm việc với file nào? (Nhập số thứ tự hoặc tên file)"
   - Chờ người dùng chọn rồi mới tiếp tục.

## Bước 2 — Chạy Context Loader

Nạp toàn bộ context của dự án bằng cách làm theo quy trình trong `steps/context-loader.md`.
Lưu toàn bộ context đã nạp vào bộ nhớ để dùng xuyên suốt phiên làm việc của lệnh.

## Bước 3 — CHECKPOINT

*Bỏ qua nếu `_agent_mode: true`.*

### 3a — Lệnh này có phải chặn không?

| Mức | Lệnh nào | `--yes` bỏ qua được? |
|---|---|:---:|
| **Không chặn** | Lệnh read-only: `/review-code` · `/validate-traces` · `/debug` · `/review-context` · `/review-tech-docs` | — (vốn không có) |
| **Chặn thường** | Mọi lệnh sinh/sửa artifact | ✅ |
| **Chặn CỨNG** | Ghi đè file đã tồn tại · `--resume` áp findings · migrate · prune | ❌ **không bao giờ** |

`--yes` trong `$ARGUMENTS` → bỏ qua CHECKPOINT mức *chặn thường*. (Bước 1 đã tách mọi token
`--` khỏi phần resolve target, nên cờ này không ảnh hưởng việc tìm file.) Mở đường chạy
headless: `claude -p "/generate-code UC1 --yes"`.

> **KHÔNG tự suy mức từ bảng này.** Mỗi lệnh **tự khai** mức của nó ở một dòng `*Checkpoint: …*`
> ngay dưới `## Gate` của chính nó — đọc dòng đó, đừng suy diễn. Bảng trên chỉ giải thích ba mức
> **nghĩa là gì**.
> Nguồn máy đọc: `bin/trace-schema.json` → `gate.checkpoint_levels`; `self-check` **R11** fail
> build nếu nhãn trong file lệnh lệch với schema, hoặc nếu một lệnh `hard`/`none` thiếu nhãn.
> *(Lệnh không có dòng nào = mức **chặn thường**, mặc định.)*

> **Mức *không chặn* là thực thi đúng miễn trừ mà `rules/workflow.md` đã cấp từ trước** —
> trước G41 file đó viết *"read-only commands may skip CHECKPOINT"* còn gate thì luôn đòi.
> Hai file cùng được nạp vào mọi lệnh mà nói ngược nhau; agent theo cái nào là tuỳ lúc.

### 3b — In gì

**KHÔNG lặp lại những gì `[CTX LOADED]` vừa in.** Recap của context-loader (Bước 7) đã hiện
Stack · Platform · Layers · CLAUDE.md · Dict · Entities · Lessons · Service · Status ngay phía
trên. CHECKPOINT chỉ thêm **một** thông tin mới là `Target`.

**Mọi thứ sạch** — recap báo `Status: FULL`, không cờ nào bật → in đúng hai dòng:

```
CHECKPOINT — Target: {resolved file path}
Tiếp tục? (Y/N)
```

**Có bất thường** → thêm một dòng cho **mỗi** trạng thái, nặng nhất lên đầu:

```
CHECKPOINT
🔴 Service  : unresolved — {lý do context-loader đã ghi}
⚠️ CLAUDE.md: service overlay THIẾU — dùng root (code sinh ra có thể sai stack)
⚠️ Target   : resolve bằng wildcard — {n} file khớp, chọn {file}
⚠️ Module   : not configured — code sinh ra sẽ dùng default
   Status   : PARTIAL — thiếu: {danh sách}
   Target   : {resolved file path}
Tiếp tục? (Y/N)
```

### 3c — Cờ nào bật, cờ nào KHÔNG

Mỗi dòng ⚠️/🔴 phải ứng với một trạng thái **context-loader đã tính rồi** — không phát minh
điều kiện mới, chỉ mang thứ đang bị giấu lên chỗ người dùng phải quyết định:

| Bật cờ khi | Nguồn | Mức |
|---|---|:---:|
| `active_service = unresolved` | context-loader Bước 2b/2c/Fallback | 🔴 |
| `Status = MINIMAL` | recap Bước 7 | 🔴 |
| `Status = PARTIAL` | recap Bước 7 | ⚠️ |
| CLAUDE.md thiếu, hoặc service overlay thiếu | context-loader Bước 3 | ⚠️ |
| Target resolve qua wildcard, hoặc nhiều file khớp mà lệnh tự chọn | Bước 1 ở trên | ⚠️ |
| `module` không cấu hình | recap Bước 7 | ⚠️ |

**KHÔNG bật cờ cho:** `Lessons: chưa có` · `Dict: missing` · `Entities: missing`. Đó là
*"dự án chưa điền"*, không phải *"có gì đó sai"* — chúng ở lại trong recap.

> **Nguyên tắc một câu:** cờ dành cho thứ **framework không chắc chắn hoặc đã phải đoán**,
> không dành cho thứ **người dùng chưa làm**. Đẩy hết mọi thứ lên thì CHECKPOINT lại đầy như
> cũ, và ta quay về đúng chỗ xuất phát: một cổng luôn giống nhau thì bị lướt qua.

### 3d — Chờ trả lời

- "Y" → tiếp tục sang các bước riêng của lệnh.
- "N" → dừng, hỏi người dùng muốn thay đổi gì.
- Có `--yes` và mức *chặn thường* → coi như "Y", **nhưng vẫn IN khối CHECKPOINT** nếu có cờ
  🔴/⚠️ (không chặn ≠ không báo — người đọc log sau này vẫn cần thấy).


*Lưu ý: Với lệnh này, target ở Bước 1 là một UC-ID hoặc path file `.feature`. Tìm file feature tại `{paths.specs_dir}/{domain}/*/bdd/**/{UC-ID}-*.feature` (glob khớp xuyên các PRD — filename gồm hậu tố slug) và các file implementation gắn tag `@trace.implements={UC-ID}`.*

## Context
**BẮT BUỘC — đọc `.agent/steps/context-loader.md` và thực thi TOÀN BỘ quy trình trong đó**,
rồi mới tiếp tục phần bên dưới.

Bỏ qua bước này thì `{paths.*}`, `{tech_stack.*}`, `{conventions.*}`, guardrail từ
`project-lessons`, và routing service (chế độ umbrella) đều **chưa được phân giải** — mọi
placeholder bên dưới sẽ rỗng và lệnh sẽ đọc/ghi sai chỗ.

---

## Service Detection

Đọc `@trace.service` và `@trace.module` từ header file feature.

| Điều kiện | Hành động |
|---|---|
| `@trace.module` có mặt | Dùng làm `active_module` |
| `@trace.module` vắng | Dùng `tech_stack.module` từ project-context.yaml |
| `@trace.service` có mặt | Lưu làm `active_service` |
| `@trace.service` vắng | Dùng domain của `{UC-ID}` làm fallback |

**Phân loại platform type:**

| Platform | Modules |
|---|---|
| `backend` | `java-spring`, `golang`, `dotnet`, `php-laravel`, `context-engineering` |
| `web-frontend` | `react`, `nextjs`, `vue`, `nuxt`, `angular` |
| `mobile` | `flutter`, `react-native`, `ios-swiftui`, `android-compose` |

---

## CHECKPOINT — Test Plan

Trước khi sinh, quét file feature tìm scenario và các file implementation tìm class/function. Hiện:

```
Test Plan — {UC-ID} ({active_module})
──────────────────────────────────────
Platform   : {backend | web-frontend | mobile}
Scenarios  : {N} scenario từ file .feature
Impl files : {danh sách file gắn tag @trace.implements={UC-ID}}

Test cần sinh:
  {danh sách riêng theo platform — xem template bên dưới}

Proceed? (Y/N)
```

Chờ "Y" rõ ràng trước khi sinh.

---

## Generate

### Nếu `platform_type = backend`

#### java-spring

```java
// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=unit
class {Resource}ServiceImplTest {
    @Mock {Repository} {repository};
    @InjectMocks {Resource}ServiceImpl service;

    // methodName_whenValid_shouldReturnExpected()
    //   Given — mock repository returns data
    //   When  — call service method
    //   Then  — assert result matches expected

    // methodName_whenNotFound_shouldThrowException()
    //   Given — mock returns Optional.empty()
    //   When & Then — assertThrows({NotFoundException}.class, ...)
}

// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=integration
@WebMvcTest({Resource}Controller.class)
class {Resource}ControllerTest {
    @MockBean {Facade | Service} facade;

    // endpoint_shouldReturn200WhenValid()
    // endpoint_shouldReturn400WhenInvalid()
    // endpoint_shouldReturn404WhenNotFound()
    // endpoint_shouldReturn401WhenUnauthenticated()
}
```

Rules:
- Unit test: mock ở layer Repository, test logic Service
- Integration test: mock ở layer Facade/Service, chỉ test HTTP contract
- Không bao giờ mock class đang được test
- Theo naming: `methodName_whenCondition_shouldOutcome` (từ CLAUDE.md §6)

#### golang

```go
// @trace.verifies={UC-ID}
// Unit: table-driven tests for service layer
func Test{Resource}Service_{Method}(t *testing.T) {
    tests := []struct {
        name    string
        input   {InputType}
        want    {OutputType}
        wantErr bool
    }{
        {"valid input", ..., ..., false},
        {"not found", ..., nil, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) { ... })
    }
}

// @trace.verifies={UC-ID}
// Integration: HTTP handler tests using httptest
func Test{Resource}Handler_{Endpoint}(t *testing.T) {
    // setup router, mock service, fire request
    // assert status code and response body
}
```

#### dotnet

```csharp
// @trace.verifies={UC-ID}
// Unit: xUnit + Moq
public class {Resource}ServiceTests {
    private readonly Mock<I{Repository}> _repoMock = new();
    private readonly {Resource}Service _sut;

    [Fact]
    public async Task {Method}_WhenValid_Returns{Expected}() { }

    [Fact]
    public async Task {Method}_WhenNotFound_ThrowsNotFoundException() { }
}

// @trace.verifies={UC-ID}
// Integration: WebApplicationFactory
public class {Resource}ControllerTests : IClassFixture<WebApplicationFactory<Program>> {
    [Fact]
    public async Task {Endpoint}_Returns200_WhenValid() { }

    [Fact]
    public async Task {Endpoint}_Returns400_WhenInvalid() { }
}
```

#### php-laravel

```php
// @trace.verifies={UC-ID}
// Unit: PHPUnit
class {Resource}ServiceTest extends TestCase {
    public function test_{method}_when_valid_should_return_expected(): void { }
    public function test_{method}_when_not_found_should_throw(): void { }
}

// @trace.verifies={UC-ID}
// Feature: Laravel HTTP tests
class {Resource}ControllerTest extends TestCase {
    use RefreshDatabase;
    public function test_{endpoint}_returns_200_when_valid(): void {
        $response = $this->getJson('/api/{resource}');
        $response->assertStatus(200)->assertJsonStructure([...]);
    }
}
```

#### context-engineering

Kiểm tra `tech_stack.language` từ project-context.yaml để chọn đúng cú pháp test:

**Nếu language = Python** (mặc định):

```python
# @trace.verifies={UC-ID}
# @trace.test_type=unit
# Unit: test prompt orchestration functions

import pytest
from unittest.mock import patch, MagicMock

class Test{Resource}Prompt:
    # test_{function}_when_valid_input_should_return_expected_output()
    #   Given — mock LLM client returns controlled response
    #   When  — call prompt function with valid input
    #   Then  — assert output matches expected structure/content

    # test_{function}_when_llm_unavailable_should_raise()
    #   Given — mock LLM client raises connection error
    #   When & Then — assert specific exception is raised

    # test_{function}_trace_assertions()
    #   Given — run function with trace capture enabled
    #   Then  — assert @trace.implements tag present in function definition
    #           assert output conforms to expected schema

    def test_{function}_when_valid_should_return_expected(self, mock_llm):
        # Arrange
        mock_llm.complete.return_value = "{expected response}"
        # Act
        result = {function}(input={test_input})
        # Assert
        assert result == {expected_output}
        mock_llm.complete.assert_called_once_with(...)

    def test_{function}_when_invalid_input_should_raise(self):
        with pytest.raises({ExpectedError}):
            {function}(input=None)
```

**Nếu language = TypeScript / JavaScript** (Node.js LangChain.js, v.v.):

```typescript
// @trace.verifies={UC-ID}
// @trace.test_type=unit
import { jest } from '@jest/globals'

describe('{Resource}Prompt', () => {
  const mockLlm = { complete: jest.fn() }

  it('{scenario description}', async () => {
    mockLlm.complete.mockResolvedValue('{expected response}')
    const result = await {function}({ input: '{test_input}', llm: mockLlm })
    expect(result).toEqual({expected_output})
    expect(mockLlm.complete).toHaveBeenCalledWith(expect.objectContaining({ ... }))
  })

  it('throws when input is invalid', async () => {
    await expect({function}({ input: null, llm: mockLlm })).rejects.toThrow('{ExpectedError}')
  })
})
```

**Nếu language = Java** (LangChain4j, v.v.): dùng JUnit 5 + Mockito, cùng pattern như unit test java-spring ở trên — mock interface `ChatLanguageModel`.

Rules:
- Mock LLM client ở boundary — không bao giờ gọi LLM thật trong unit test
- Validate input schema và output schema riêng biệt
- Mỗi scenario trong `.feature` map sang một test function
- Dùng parameterized test cho nhiều biến thể input

---

### Nếu `platform_type = web-frontend`

#### react / nextjs / vue / nuxt / angular

```typescript
// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=component

// Component tests (Vitest + Testing Library)
describe('{ComponentName}', () => {
  it('renders correctly when data is loaded', () => {
    render(<{ComponentName} {...props} />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => { })

  it('shows error message on API failure', () => { })

  it('calls handler when user interacts', async () => {
    await userEvent.click(screen.getByRole('button', { name: '...' }))
    expect(mockHandler).toHaveBeenCalledWith(...)
  })
})

// @trace.verifies={UC-ID}
// @trace.test_type=e2e

// E2E tests (Playwright or Cypress — use whichever is in project)
test('{scenario from .feature}', async ({ page }) => {
  await page.goto('/{route}')
  await page.getByRole('button', { name: '...' }).click()
  await expect(page.getByText('...')).toBeVisible()
})
```

Rules:
- Một file component test cho mỗi component liên quan tới UC
- Một file E2E test cho mỗi UC, phủ happy path + các error scenario chính
- Mock API call ở network layer (MSW hoặc cy.intercept), không phải ở component props
- Dùng accessible query (`getByRole`, `getByLabelText`) — tránh `getByTestId` trừ khi cần
- Mỗi test map đúng một scenario trong file `.feature`

---

### Nếu `platform_type = mobile`

#### flutter

```dart
// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=widget

// Widget tests
group('{FeatureName} widget tests', () {
  testWidgets('renders correctly when state is loaded', (tester) async {
    await tester.pumpWidget(MaterialApp(home: {Widget}()));
    await tester.pumpAndSettle();
    expect(find.text('...'), findsOneWidget);
  });

  testWidgets('shows loading indicator while fetching', (tester) async { });
  testWidgets('shows error widget on failure', (tester) async { });
  testWidgets('calls handler on tap', (tester) async {
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();
    verify(() => mockBloc.add({Event}())).called(1);
  });
});

// @trace.verifies={UC-ID}
// @trace.test_type=integration
// Integration test (flutter_test / integration_test package)
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('{scenario from .feature}', (tester) async {
    app.main();
    await tester.pumpAndSettle();
    // Navigate, interact, assert
  });
}
```

#### react-native

```typescript
// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=component

// Jest + React Native Testing Library
describe('{ComponentName}', () => {
  it('{scenario description}', () => {
    const { getByText, getByRole } = render(<{ComponentName} {...props} />)
    expect(getByText('...')).toBeTruthy()
  })

  it('calls navigation on button press', () => {
    const mockNavigate = jest.fn()
    const { getByRole } = render(<{ComponentName} navigation={{ navigate: mockNavigate }} />)
    fireEvent.press(getByRole('button'))
    expect(mockNavigate).toHaveBeenCalledWith('...')
  })
})
```

#### ios-swiftui

```swift
// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=unit

// XCTest — ViewModel unit tests
@MainActor
final class {Feature}ViewModelTests: XCTestCase {
    var sut: {Feature}ViewModel!
    var mockRepo: Mock{Repository}!

    override func setUp() async throws {
        mockRepo = Mock{Repository}()
        sut = {Feature}ViewModel(repository: mockRepo)
    }

    func test_{method}_whenValid_shouldUpdate{State}() async throws {
        // Given
        mockRepo.stub{Method}Result = {expected}
        // When
        await sut.{method}()
        // Then
        XCTAssertEqual(sut.{state}, {expected})
    }

    func test_{method}_whenError_shouldSetErrorState() async throws { }
}
```

#### android-compose

```kotlin
// @trace.verifies={UC-ID}
// @trace.service={active_service}
// @trace.test_type=unit

// Unit test — ViewModel
class {Feature}ViewModelTest {
    @get:Rule val mainDispatcherRule = MainDispatcherRule()
    private val mockRepo: {Repository} = mockk()
    private lateinit var sut: {Feature}ViewModel

    @Before fun setup() { sut = {Feature}ViewModel(mockRepo) }

    @Test fun `{method} when valid should emit success state`() = runTest {
        coEvery { mockRepo.{method}(any()) } returns Result.success({data})
        sut.{method}({input})
        assertEquals(UiState.Success({data}), sut.uiState.value)
    }
}

// @trace.verifies={UC-ID}
// @trace.test_type=ui

// UI test — Compose
@HiltAndroidTest
class {Feature}ScreenTest {
    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)
    @get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()

    @Test fun {scenario}_displaysExpectedUi() {
        composeRule.onNodeWithText("...").assertIsDisplayed()
        composeRule.onNodeWithContentDescription("...").performClick()
        composeRule.onNodeWithText("...").assertIsDisplayed()
    }
}
```

---

## Checklist

**Mọi platform:**
- [ ] `@trace.verifies` trên mỗi test class / test group
- [ ] `@trace.service` trên mỗi test class / test group
- [ ] Mỗi scenario trong file `.feature` có ≥ 1 test tương ứng
- [ ] Phủ happy path
- [ ] Phủ các scenario error / edge case chính

**Chỉ backend:**
- [ ] Mock đúng layer (Repository trong unit test, Facade/Service trong controller test)
- [ ] Không gọi DB thật trong unit test
- [ ] Test naming theo `methodName_whenCondition_shouldOutcome` (CLAUDE.md §6)

**Chỉ Frontend / Mobile:**
- [ ] Không hardcode delay (`sleep`, `setTimeout`) trong test — dùng `waitFor` / `pumpAndSettle`
- [ ] Dùng accessible query (role, label) không phải selector phụ thuộc implementation
- [ ] Mock API call ở network layer, không phải ở component level

---

## Write Trace State

Sau khi sinh tất cả file test, cập nhật **sổ của platform đang test** `{paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv` (`{platform}` = platform của code/`.feature` đang test) — với mỗi scenario, tìm row có sẵn theo `sc_id` và cập nhật:

| Cột | Giá trị |
|--------|-------|
| `test_count` | số test method phủ SC này |
| `test_classes` | tên test class / describe-block, ngăn cách bởi dấu phẩy |
| `dev_selftest` | `not_run` (test giờ đã tồn tại nhưng chưa chạy — `/dev-run-test` set pass/fail) |
| `last_updated` | hôm nay `YYYY-MM-DD` |

Giữ nguyên mọi cột khác (gồm `dev_selftest_at`, do `/dev-run-test` sở hữu, và `qc_status`/`qc_run_at`, do `/qc-run-test` sở hữu).

---

## Refresh Panel Mirror
# Làm mới panel mirror của Living Docs *(local)*

> **Hai vị trí, HAI TÊN KHÁC NHAU — đọc trước khi sửa gì ở đây.**
>
> | Đường dẫn | Vai trò | Git |
> |---|---|---|
> | `{paths.trace_dir}` (`.trace/` hoặc `{spec_source}/.trace/`) | **AUTHORITATIVE** — TSV + `trace-history.jsonl`. Không regenerate được. | **PHẢI commit** |
> | `./.trace-mirror/` ở gốc workspace hiện tại | **MIRROR** — bản sao tiện cho panel VS Code. Sinh lại được bất cứ lúc nào. | **Luôn gitignore** |
>
> Trước v0.4.3 cả hai đều tên `.trace`, nên một luật gitignore theo tên có thể **xoá sạch sổ gốc**
> khi dev mở thẳng spec repo làm workspace (lúc đó hai path bằng nhau). Hai tên khác nhau làm
> luật git đọc được bằng mắt và **không còn ca nhập nhằng nào**: `.trace-mirror/` không bao giờ
> commit, `.trace/` không bao giờ gitignore.

## Khi nào CÓ mirror

Mirror chỉ tồn tại khi **`{paths.trace_dir}` nằm NGOÀI workspace hiện tại** — panel đọc từ workspace đang mở nên cần một bản sao ở đây.

| Tình huống | `{paths.trace_dir}` | Có mirror? |
|---|---|---|
| Single-service | `./.trace` — **trong** workspace | ❌ Không. Panel đọc thẳng `.trace/trace-report.json`. Bỏ qua cả file này. |
| Dev mở thẳng **spec repo** | `./.trace` — **trong** workspace | ❌ Không. Như trên. |
| Umbrella + `spec_source`, dev đứng ở umbrella hoặc service submodule | `{spec_source}/.trace` — **ngoài** workspace | ✅ Có |
| Umbrella legacy (không `spec_source`) | `.trace` theo từng service | ✅ Có |

Quy tắc một dòng: **phân giải `panel_mirror = ./.trace-mirror` ở gốc workspace hiện tại; nếu `{paths.trace_dir}` đã nằm trong workspace này thì bỏ qua toàn bộ bước mirror.**

---

Sau khi cập nhật TSV authoritative tại `{paths.trace_dir}`:

**Khi `setup.spec_source` được đặt (trace gộp — trường hợp phổ biến):**
`{paths.trace_dir}` phân giải về `{spec_source}/.trace` — vị trí authoritative duy nhất.
Lệnh này chạy từ `service_root`, nên thao tác ghi là **liên-repo vào spec submodule**;
commit/push spec submodule cho lần cập nhật trace (giống như `feedback/`).

1. Phân giải `panel_mirror = ./.trace-mirror` tại **gốc workspace hiện tại**.
2. Nếu `{paths.trace_dir}` **không** nằm trong workspace hiện tại, copy mỗi
   `{UC-ID}-{platform}.tsv` vừa cập nhật → `{panel_mirror}/{UC-ID}-{platform}.tsv` (tạo thư mục; ghi đè).
   Không namespace theo service — chỉ có một bộ trace; service sở hữu được mang ở
   **cột `service` (cột 23)** của chính từng row, do `/generate-bdd` ghi từ `@trace.service`.
3. **KHÔNG copy `trace-history.jsonl`.** Nó là dữ liệu tích luỹ, không phải thứ sinh lại được —
   nhân bản nó ra một thư mục gitignore là tạo hai lịch sử lệch nhau rồi mất bản thật.

**Legacy (không có `spec_source` — trace theo service):**
Copy mỗi `{UC-ID}-{platform}.tsv` vừa cập nhật → `{panel_mirror}/{service-name}/{UC-ID}-{platform}.tsv`
(namespace theo `active_service`).

Cách này giữ panel Living Docs của workspace đang mở luôn mới **giữa các lần sync** — nó chỉ là
một **mirror tiện lợi cục bộ**. File `trace-report.json` đã merge (canonical, trong
`{spec_source}/.living-docs/`) được build lại bởi `/sync` hoặc `/validate-traces`. Với các lệnh
được orchestrate, làm việc này một lần trong orchestrator sau khi tất cả sub-agent trả về — không phải
bên trong từng sub-agent.


---

## Output

**Đọc `.agent/steps/report-footer.md`** và áp đúng khuôn footer trong đó (Status Badge ·
Output Artifacts · Next) cho report cuối, kèm khối bên dưới.

```
/dev-gen-test Hoàn tất — {UC-ID} ({active_module})
  ✅ {TestClass1} ({N} tests)
  ✅ {TestClass2} ({N} tests)
Trace: {paths.trace_dir}/{domain}/{prd-slug}/{UC-ID}-{platform}.tsv updated
Next: /dev-run-test {UC-ID}

📊 Living Docs: chạy /validate-traces (hoặc /sync) để push trace này lên dashboard spec-module.
```

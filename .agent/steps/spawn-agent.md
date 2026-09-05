# Pattern điều phối Sub-Agent

Dùng bởi các lệnh nặng khi target vượt ngưỡng phức tạp.
Session chính trở thành một **orchestrator nhẹ** — chỉ điều phối.
Mỗi đơn vị công việc chạy trong sub-agent riêng với context window mới.

---

## Ngưỡng phức tạp

| Tín hiệu | Ngưỡng | Hành động |
|--------|-----------|--------|
| Số UC trong PRD | > 3 UC | spawn 1 agent cho mỗi UC |
| Độ dài PRD | > 300 dòng | spawn agent bất kể số UC |

Nếu vượt **một trong hai** ngưỡng → chuyển sang chế độ orchestration.

---

## Các bước của Orchestrator (session chính)

### Bước A — Dựng context gọn

Chỉ trích xuất những gì sub-agent cần — KHÔNG truyền nguyên CLAUDE.md hay nguyên business-dictionary:

```json
{
  "project_name": "{project.name}",
  "tech_stack": {
    "language":       "{tech_stack.language}",
    "framework":      "{tech_stack.framework}",
    "build_tool":     "{tech_stack.build_tool}",
    "test_framework": "{tech_stack.test_framework}",
    "database":       "{tech_stack.database}",
    "module":         "{tech_stack.module}"
  },
  "conventions": {
    "build_command":  "{conventions.build_command}",
    "commit_format":  "{conventions.commit_format}"
  },
  "paths": {
    "specs_dir":     "{paths.specs_dir}",
    "trace_dir":     "{paths.trace_dir}",
    "tech_docs_dir": "{paths.tech_docs_dir}"
  },
  "architecture_summary": "<3-5 gạch đầu dòng: thứ tự layer + quy tắc chính>",
  "domains": ["{domain1}", "{domain2}"],
  "banned_terms": ["{term1}", "{term2}"]
}
```

### Bước B — Trích danh sách UC

Quét PRD target tìm các heading `#### {TICKET-ID}-UC{N}:`.
Dựng list: `[ { uc_id, uc_name, line_start, line_end } ]`

### Bước C — Công bố kế hoạch

```
Phát hiện độ phức tạp cao — {N} UC / {L} dòng trong {prd_file}
Đang spawn {N} sub-agent (1 cho mỗi UC)...
  Agent 1 → {TICKET-ID}-UC1: {tên UC}
  Agent 2 → {TICKET-ID}-UC2: {tên UC}
  ...
```

### Bước D — Spawn một sub-agent cho mỗi UC

Dựng payload và gọi Agent tool cho từng UC:

```json
{
  "_agent_mode": true,
  "command":         "generate-bdd",
  "uc_id":           "{TICKET-ID}-UC{N}",
  "target_file":     "{đường dẫn tuyệt đối tới PRD hoặc feature file}",
  "uc_section":      { "line_start": {N}, "line_end": {N} },
  "context":         { "<context gọn từ Bước A>" },
  "active_platform": "{web|app|system — platform orchestrator đã chọn ở Platform Selection}",
  "design_coverage": { "<Screen States + AC-UI behavioral orchestrator đã trích ở 'Design Spec — Gate & Load' (B1); rỗng nếu BE / không có design-spec>" }
}
```

> **Truyền state orchestrator đã phân giải (quan trọng):** orchestrator (session chính) đã chạy các Guard + chọn platform + nạp design-spec MỘT LẦN *trước* khi spawn. Phải kèm `active_platform` và `design_coverage` vào payload để sub-agent áp đúng (đặc biệt phủ Screen States + AC-UI cho FE/App). KHÔNG kèm → sub-agent sinh BDD thiếu phần design (PRD lớn mất B1).

> **Phạm vi lệnh**: Chỉ `/generate-bdd` khởi động chế độ orchestration. `/generate-code` và `/dev-gen-test` có thể chạy như sub-agent (chúng tôn trọng `_agent_mode: true` từ Gate Bước 0), nhưng không spawn thêm sub-agent — phạm vi của chúng vốn đã là một UC duy nhất.

Serialize JSON này và truyền làm `$ARGUMENTS` khi gọi lệnh sub-agent.

### Bước E — Thu thập và merge kết quả

Mỗi sub-agent trả về:
```json
{
  "uc_id":         "{TICKET-ID}-UC{N}",
  "files_created": ["path/to/file1", "path/to/file2"],
  "status":        "success | error",
  "errors":        []
}
```

Merge vào một report duy nhất (theo định dạng report-footer.md).
Nếu có sub-agent lỗi → liệt kê rõ ràng và đề xuất chạy lại riêng UC đó.

---

## Điểm vào của Sub-Agent (các lệnh được gọi)

Khi `gate.md Bước 0` phát hiện `_agent_mode: true`:

1. Parse toàn bộ payload từ `$ARGUMENTS`
2. **Bỏ qua context-loader.md** — dùng trực tiếp `payload.context`
3. **Chỉ giới hạn ở `payload.uc_id`** — không xử lý các UC khác trong file
4. Chỉ đọc section PRD giữa `payload.uc_section.line_start` và `line_end`
5. **Dùng state orchestrator đã phân giải:** `active_platform` = `payload.active_platform`; `design_coverage` = `payload.design_coverage`. **KHÔNG chạy lại** các Guard (PRD approved / Design-Spec) hay tự nạp lại design-spec / hỏi platform — orchestrator đã làm một lần ở session chính.
6. Thực thi logic thường của lệnh cho riêng UC này (dùng `design_coverage` từ payload để phủ Screen States + AC-UI)
7. Trả về JSON kết quả có cấu trúc (định dạng Bước E ở trên)

---

## Tiết kiệm Context Window

| Chế độ | Nạp gì mỗi session |
|------|------------------------|
| Single session (≤ 3 UC) | Full context + full PRD + tất cả UC |
| Orchestrator | Context gọn + chỉ các heading UC |
| Mỗi sub-agent | Context gọn + **chỉ 1 section UC** |

PRD càng lớn, mức tiết kiệm trên mỗi sub-agent càng nhiều.

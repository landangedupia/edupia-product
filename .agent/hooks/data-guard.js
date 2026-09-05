#!/usr/bin/env node
/**
 * data-guard.js — Claude Code PreToolUse Hook
 *
 * Chặn AI đọc/ghi/thực thi trên file nhạy cảm (credential, secret, private key, .env…).
 *
 * Cài: copy vào project + đăng ký trong .claude/settings.json
 * (mẫu: hooks/settings.json — hoặc dùng `npx @educa-corp/sdd-framework --hooks`)
 *
 * Exit code:
 *   0 = cho phép
 *   2 = chặn cứng (Claude Code hiểu mã này là block)
 *
 * ── VÌ SAO BẢN NÀY KHÁC BẢN ĐẦU (GAPS-v3 G42) ────────────────────────────────
 *
 * Bản đầu có ba lỗi độc lập; hai trong số đó chặn đúng công việc mà framework tồn
 * tại để làm, và cái còn lại làm lời hứa bảo mật không đúng:
 *
 *   (a) matcher thiếu `Grep` — `Grep` với output_mode:"content" trên `.env` TRẢ VỀ
 *       nội dung file và không đi qua hook. Nên câu "AI will be blocked from reading
 *       .env" là sai.
 *   (b) pattern soi CẢ PATH, không neo. `/password/i` khớp
 *       `specs/auth/forgot-password/UC1.feature` và `src/auth/PasswordResetController.java`
 *       ⇒ một framework sinh code từ spec KHÔNG LÀM NỔI feature auth khi bật hook
 *       của chính nó.
 *   (c) Bash soi cả command string ⇒ `git commit -m "feat: password reset UC1"` bị
 *       chặn — đúng câu commit mà các lệnh hướng dẫn chạy ở cuối pipeline.
 *
 * Cả hai đường đều dẫn tới cùng một kết cục: người dùng TẮT HOOK, và mất luôn phần
 * bảo vệ thật. Một guard bị tắt bảo vệ bằng không.
 *
 * ── MÔ HÌNH MỚI ──────────────────────────────────────────────────────────────
 *
 * Secret sống trong file CẤU HÌNH/DỮ LIỆU, không sống trong file MÃ NGUỒN.
 * `secrets.json` là kho bí mật; `PasswordResetController.java` là code.
 * Nên pattern chung (secret/credential/password/token/api-key) chỉ áp cho file
 * KHÔNG phải mã nguồn. Pattern cứng (.env, .pem, .key…) áp cho mọi file.
 * Cộng thêm allowlist thư mục làm việc của framework (specs/, .trace/, docs/…).
 */

// ── Thư mục làm việc của framework — không bao giờ chứa secret thật ───────────
// Tên feature ("forgot-password", "api-key-rotation") hay khớp pattern chung, và
// đây chính là chỗ ca (b) nổ. Cho qua TRƯỚC khi soi.
const SAFE_DIR_PREFIXES = [
  'specs/', '.trace/', '.trace-mirror/', '.living-docs/',
  'docs/', '.agent/', 'feedback/', '.claude/',
];

// ── Đuôi file MÃ NGUỒN — pattern chung không áp ───────────────────────────────
// Một file .java/.ts/.dart tên gì đi nữa cũng là code, không phải kho secret.
// (Pattern CỨNG bên dưới vẫn áp — nhưng .pem/.key không nằm trong danh sách này.)
const CODE_EXT = new Set([
  'java', 'kt', 'kts', 'scala', 'groovy',
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'vue', 'svelte',
  'py', 'go', 'rs', 'rb', 'php', 'cs', 'fs', 'vb',
  'swift', 'm', 'mm', 'dart', 'c', 'h', 'cpp', 'hpp', 'cc',
  'sql', 'graphql', 'proto', 'feature', 'md', 'mdx', 'txt',
  'html', 'css', 'scss', 'less', 'tsv', 'csv',
]);

// ── Pattern CỨNG — áp cho mọi file, soi TÊN FILE ─────────────────────────────
const SENSITIVE_NAME_HARD = [
  /^\.env$/i,
  /^\.env\./i,
  /\.env$/i,

  /\.key$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.jks$/i,
  /\.keystore$/i,
  /^id_rsa$/i,
  /^id_ed25519$/i,

  /^application-(prod|production|staging)\.(yml|yaml|properties)$/i,
  /^appsettings\.(Production|Staging)\.json$/i,
  /^database\.yml$/i,
  /^master\.key$/i,
  /^oauth-private\.key$/i,
  /^credentials$/i,
  /^\.npmrc$/i,
  /^\.pypirc$/i,
  /^\.netrc$/i,
];

// ── Pattern CHUNG — chỉ áp cho file KHÔNG phải mã nguồn, soi TÊN FILE ────────
const SENSITIVE_NAME_SOFT = [
  /secret/i,
  /credential/i,
  /password/i,
  /passwd/i,
  /private[_-]?key/i,
  /api[_-]?key/i,
  /access[_-]?token/i,
  /auth[_-]?token/i,
];

// ── Pattern THƯ MỤC — soi cả path ────────────────────────────────────────────
const SENSITIVE_DIR = [
  /(^|\/)secrets?\//i,
  /(^|\/)\.secrets?\//i,
  /(^|\/)\.ssh\//i,
  /(^|\/)\.aws\//i,
  /(^|\/)\.gnupg\//i,
];

// ── Lệnh bash nguy hiểm bất kể path ──────────────────────────────────────────
const SENSITIVE_BASH = [
  /\bprintenv\b/i,
  /\benv\b\s*(\||$)/i,
  /kubectl\s+get\s+secrets?\b[^|]*-o\s*(yaml|json)/i,
  /\baws\s+secretsmanager\s+get-secret-value/i,
  /\bgcloud\s+secrets\s+versions\s+access/i,
  /\bvault\s+(read|kv\s+get)\b/i,
  // `docker inspect` KHÔNG chặn cả cụm (lệnh debug thường dùng) — chỉ chặn khi nó
  // thực sự moi Env ra. Bản đầu chặn cả cụm và đó là ma sát không đổi lấy gì.
  /docker\s+inspect[^|]*\.Config\.Env/i,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(p) {
  return String(p).replace(/\\/g, '/').replace(/^\.\//, '');
}

function extOf(base) {
  const i = base.lastIndexOf('.');
  return i > 0 ? base.slice(i + 1).toLowerCase() : '';
}

function isSensitivePath(filePath) {
  if (!filePath) return false;
  const p = normalize(filePath);

  // Vùng làm việc của framework — spec/trace/doc không chứa secret thật, và tên
  // feature ở đó hay khớp pattern chung. Bỏ cả tiền tố tuyệt đối trước khi so.
  const relish = p.replace(/^([a-zA-Z]:)?\/+/, '');
  if (SAFE_DIR_PREFIXES.some(d => relish.startsWith(d) || relish.includes('/' + d))) return false;

  if (SENSITIVE_DIR.some(re => re.test(p))) return true;

  const base = p.split('/').pop() || '';
  if (SENSITIVE_NAME_HARD.some(re => re.test(base))) return true;

  // Pattern chung: bỏ qua mã nguồn. Đây là chỗ bản đầu chặn PasswordResetController.java.
  if (CODE_EXT.has(extOf(base))) return false;
  return SENSITIVE_NAME_SOFT.some(re => re.test(base));
}

/**
 * Tách các token TRÔNG GIỐNG PATH ra khỏi một command line.
 * Bản đầu soi cả chuỗi lệnh nên `git commit -m "feat: password reset"` bị chặn.
 */
function pathishTokens(command) {
  return String(command)
    .split(/[\s;|&()<>]+/)
    .map(t => t.replace(/^["']|["']$/g, ''))
    .filter(t => t && !t.startsWith('-') && /[\/.]/.test(t) && !/^-{1,2}/.test(t));
}

function block(reason, detail) {
  console.error(`\n🔒 DATA GUARD — BLOCKED\n${reason}`);
  if (detail) console.error(detail);
  console.error('\nCần giá trị cấu hình? Mô tả thứ bạn cần mà KHÔNG đưa secret thật;');
  console.error('dùng placeholder trong code sinh ra.');
  console.error('Nghĩ đây là chặn nhầm? Vùng specs/ .trace/ docs/ .agent/ luôn được cho qua,');
  console.error('và file mã nguồn (.java/.ts/.dart…) không bị pattern chung đụng tới.\n');
  process.exit(2);
}

// ── Main ─────────────────────────────────────────────────────────────────────

let rawInput = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { rawInput += chunk; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(rawInput);
  } catch {
    // Fail-open CÓ CHỦ Ý: hook parse lỗi mà chặn hết thì làm cả project đứng máy.
    // Nhưng không im lặng — im lặng là cách một guard chết mà không ai biết.
    console.error('⚠️  data-guard: không parse được input hook — CHO QUA (fail-open).');
    process.exit(0);
  }

  const tool = input.tool_name || '';
  const arg  = input.tool_input || {};

  switch (tool) {
    case 'Read':
    case 'Write':
    case 'Edit':
    case 'NotebookEdit': {
      const f = arg.file_path || arg.notebook_path || '';
      if (isSensitivePath(f)) block(`Thao tác ${tool} trên file nhạy cảm: ${f}`);
      break;
    }

    // Grep ĐỌC ĐƯỢC NỘI DUNG (output_mode: "content"). Thiếu nhánh này thì mọi thứ
    // ở trên chỉ là cửa trước, còn cửa sau mở toang — chính là lỗi (a) của G42.
    case 'Grep': {
      const target = arg.path || '';
      if (target && isSensitivePath(target)) {
        block(`Grep nhắm vào path nhạy cảm: ${target}`);
      }
      if (arg.glob && isSensitivePath(String(arg.glob).replace(/\*/g, 'x'))) {
        block(`Grep dùng glob nhắm vào file nhạy cảm: ${arg.glob}`);
      }
      // Đang đi TÌM chính chuỗi secret — chặn kèm lý do khác hẳn.
      if (arg.pattern && /\b(BEGIN [A-Z ]*PRIVATE KEY|aws_secret_access_key|sk-[A-Za-z0-9]{16,})/i
          .test(String(arg.pattern))) {
        block(`Grep đang tìm chính giá trị bí mật: ${String(arg.pattern).slice(0, 40)}…`);
      }
      break;
    }

    case 'Bash': {
      const cmd = arg.command || '';
      if (SENSITIVE_BASH.some(re => re.test(cmd))) {
        block(`Lệnh moi secret: ${cmd.slice(0, 120)}`);
      }
      // CHỈ soi token trông giống path — không soi cả chuỗi lệnh (lỗi (c) của G42).
      const hit = pathishTokens(cmd).find(isSensitivePath);
      if (hit) block(`Lệnh bash chạm file nhạy cảm: ${hit}`, `   (trong: ${cmd.slice(0, 120)})`);
      break;
    }
  }

  process.exit(0);
});

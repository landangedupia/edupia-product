# Phaser Game — Scenes, Prefabs, Domain Logic & WebView Bridge Patterns

Stack: **Phaser 3 + TypeScript + Vite**, packaged to run from `file://` inside an **Android/iOS WebView**.
Core ideas:
- **Scenes orchestrate**, **domain modules do the math** (pure TS, no Phaser → unit-testable in Node).
- **Integration = Approach A**: the game calls the **backend directly over HTTP**, using a token the
  host app (Flutter) injects via `window.GAME_CONFIG`. The native bridge is **thin** — only
  `onReady()` / `onClose()` (back/X → Flutter pops the WebView). No game data crosses the bridge.
- `vite base: './'` so the built bundle loads over `file://`; `plugin-legacy` for old WebViews.
- `eruda` debug console loads **only** with `?debug=1`.

Examples use a **Gold Miner** game (swinging hook grabs gold; heavier gold retracts slower).

## Vite config — WebView-ready build

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  base: './',                       // REQUIRED: relative paths so dist/ works from file://
  build: {
    target: 'es2015',
    assetsInlineLimit: 4096,
  },
  plugins: [
    legacy({                        // old Android WebView support (toggle per min-SDK)
      targets: ['Android >= 5', 'Chrome >= 40'],
      polyfills: true,              // pulls core-js
      renderLegacyChunks: true,
    }),
  ],
});
```

## Bootstrap — `index.html` + `main.ts`

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover" />
    <title>Gold Miner</title>
    <style>html,body{margin:0;height:100%;background:#1a1a2e;overflow:hidden}#game{width:100%;height:100%}</style>
  </head>
  <body>
    <div id="game"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```typescript
// src/main.ts — mount debug console (if ?debug=1), then start Phaser
import Phaser from 'phaser';
import { gameConfig } from './config/game-config';
import { maybeLoadDebugConsole } from './debug/eruda';

async function bootstrap() {
  await maybeLoadDebugConsole();          // eruda only when ?debug=1
  new Phaser.Game(gameConfig);
}

bootstrap();
```

```typescript
// src/config/game-config.ts
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { UIScene } from '../scenes/UIScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,                      // WebGL with Canvas fallback
  parent: 'game',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,              // fit WebView, keep aspect
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene, UIScene],
};
```

## Scenes — one responsibility each

```typescript
// src/scenes/PreloadScene.ts — load every asset once, show a progress bar
import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    const bar = this.add.rectangle(480, 270, 0, 20, 0xc9a227);
    this.load.on('progress', (p: number) => { bar.width = 400 * p; });

    this.load.image('bg', 'assets/bg.png');
    this.load.image('gold', 'assets/gold.png');
    this.load.atlas('miner', 'assets/miner.png', 'assets/miner.json');
    this.load.audio('grab', 'assets/grab.mp3');
  }

  create() { this.scene.start('MenuScene'); }
}
```

```typescript
// src/scenes/GameScene.ts — orchestrates; heavy math lives in src/domain/
import Phaser from 'phaser';
import { Hook } from '../objects/Hook';
import { Gold } from '../objects/Gold';
import { rollSpawn } from '../domain/spawn';
import { calcScore } from '../domain/scoring';
import { EventBus } from '../bridge/event-bus';
import { SPAWN_TABLE } from '../config/constants';

// @trace.implements=GAME-UC1-SC1
// @trace.source=specs/game/swing-hook/bdd/GAME-UC1.feature
export class GameScene extends Phaser.Scene {
  private hook!: Hook;
  private golds!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private rng = new Phaser.Math.RandomDataGenerator(['gold-miner']);

  constructor() { super('GameScene'); }

  create() {
    this.add.image(480, 270, 'bg');
    this.scene.launch('UIScene');                 // HUD overlay runs in parallel

    this.hook = new Hook(this, 480, 60);
    this.golds = this.physics.add.group();
    this.spawnField();

    // Arcade overlap does the collision — no hand-rolled loop
    this.physics.add.overlap(this.hook.tip, this.golds, (_tip, goldObj) => {
      this.hook.grab(goldObj as Gold);
    });

    this.input.on('pointerdown', () => this.hook.drop());
    this.input.keyboard?.on('keydown-SPACE', () => this.hook.drop());
  }

  update(_t: number, dtMs: number) {
    const dt = dtMs / 1000;
    const banked = this.hook.update(dt);          // returns a Gold when fully retracted, else null
    if (banked) {
      this.score += calcScore(banked.value);      // pure domain fn
      EventBus.emit('score-changed', this.score); // → UIScene + native bridge
      banked.destroy();
    }
  }

  private spawnField() {
    for (const spot of rollSpawn(SPAWN_TABLE, this.rng)) {  // deterministic given rng
      this.golds.add(new Gold(this, spot.x, spot.y, spot.size));
    }
  }
}
```

## Game Objects (prefabs) — self-contained Phaser subclasses

```typescript
// src/objects/Gold.ts
import Phaser from 'phaser';

export class Gold extends Phaser.Physics.Arcade.Sprite {
  readonly value: number;
  readonly weight: number;

  constructor(scene: Phaser.Scene, x: number, y: number, size: number) {
    super(scene, x, y, 'gold');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDisplaySize(size, size);
    this.value = size * 3;
    this.weight = size / 32;         // heavier → slower retract (classic mechanic)
  }
}
```

```typescript
// src/objects/Hook.ts — swing → extend → retract state machine
import Phaser from 'phaser';
import { Gold } from './Gold';
import { retractSpeed } from '../domain/hook-physics';
import { SWING_SPEED, HOOK_SPEED } from '../config/constants';

type HookState = 'swing' | 'extend' | 'retract';

export class Hook extends Phaser.GameObjects.Container {
  readonly tip: Phaser.GameObjects.Zone;   // arcade body used for overlap
  private angle = 0;
  private dir = 1;
  private length = 0;
  private state: HookState = 'swing';
  private grabbed: Gold | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.tip = scene.add.zone(x, y, 16, 16);
    scene.physics.add.existing(this.tip);
  }

  drop() { if (this.state === 'swing') this.state = 'extend'; }

  grab(gold: Gold) {
    if (this.state !== 'extend' || this.grabbed) return;
    this.grabbed = gold;
    this.state = 'retract';
  }

  /** @returns the banked Gold when fully retracted, else null */
  update(dt: number): Gold | null {
    if (this.state === 'swing') {
      this.angle += SWING_SPEED * this.dir * dt;
      if (Math.abs(this.angle) > 1.3) this.dir *= -1;
    } else if (this.state === 'extend') {
      this.length += HOOK_SPEED * dt;
      if (this.length > 520) this.state = 'retract';
    } else {
      this.length -= retractSpeed(HOOK_SPEED, this.grabbed?.weight ?? 1) * dt;
      if (this.length <= 0) {
        this.length = 0;
        this.state = 'swing';
        const banked = this.grabbed;
        this.grabbed = null;
        this.syncTip();
        return banked;
      }
    }
    this.syncTip();
    return null;
  }

  private syncTip() {
    this.tip.setPosition(this.x + Math.sin(this.angle) * this.length,
                         this.y + Math.cos(this.angle) * this.length);
    this.grabbed?.setPosition(this.tip.x, this.tip.y);
  }
}
```

## Domain logic — PURE TypeScript, zero Phaser (unit-testable)

```typescript
// src/domain/hook-physics.ts
// Heavier gold retracts slower. Pure math → trivially testable.
export function retractSpeed(baseSpeed: number, weight: number): number {
  return baseSpeed / Math.max(weight, 0.1);
}
```

```typescript
// src/domain/scoring.ts
export function calcScore(goldValue: number, comboMultiplier = 1): number {
  return Math.round(goldValue * comboMultiplier);
}
```

```typescript
// src/domain/spawn.ts — inject the RNG so spawns are deterministic in tests
export interface SpawnSpot { x: number; y: number; size: number; }
export interface SpawnRow  { count: number; sizes: number[]; band: [number, number]; }

export interface Rng { between(min: number, max: number): number; pick<T>(arr: T[]): T; }

export function rollSpawn(table: SpawnRow[], rng: Rng): SpawnSpot[] {
  const spots: SpawnSpot[] = [];
  for (const row of table) {
    for (let i = 0; i < row.count; i++) {
      spots.push({
        x: rng.between(60, 900),
        y: rng.between(row.band[0], row.band[1]),
        size: rng.pick(row.sizes),
      });
    }
  }
  return spots;
}
```

## Integration model — **Approach A** (game calls backend directly)

```
Flutter app                          WebView (this game)
───────────                          ───────────────────
inject window.GAME_CONFIG   ───────▶ host-config.ts (read + validate)
{ apiBase, token, userId }                │
                                          ▼
                             api/client.ts  ──HTTP+Bearer──▶  Backend
                             loadData()  / submitResult()  ◀──────────
                                          │
back / X pressed  ◀──onClose()── native-bridge.ts (window control only)
Navigator.pop()
```

- **Data** (load + submit result) goes over **HTTP straight from the game**, authorized by the token Flutter injected.
- **The native bridge is thin**: it only tells Flutter *"I'm ready"* and *"close me"*. No game data crosses it.

## Host config — Flutter injects it before load

```typescript
// src/contracts/game-contract.ts — the native window-control surface (control only, no data)
export interface GameContract {
  onReady(): void;   // boot succeeded — Flutter may hide its splash
  onClose(): void;   // back / X pressed — Flutter pops the WebView route
}

/** Injected by Flutter into the WebView BEFORE the bundle loads. */
export interface HostConfig {
  apiBase: string;        // e.g. https://api.edupia.vn
  token: string;          // Bearer token owned by the app
  userId: string;
  sessionId: string;
}

declare global {
  interface Window {
    // Android JS interface OR flutter_inappwebview handler — abstracted in native-bridge.ts
    Android?: { postMessage(json: string): void };
    flutter_inappwebview?: { callHandler(name: string, ...args: unknown[]): Promise<unknown> };
    GAME_CONFIG?: HostConfig;
  }
}
```

```typescript
// src/config/host-config.ts — read once, validate, fail loudly if missing
import type { HostConfig } from '../contracts/game-contract';
import { bridge } from '../bridge/native-bridge';

export function readHostConfig(): HostConfig {
  const cfg = window.GAME_CONFIG;
  const ok = cfg && cfg.apiBase && cfg.token;
  if (!ok) {
    console.error('[host-config] missing GAME_CONFIG — cannot reach backend');
    bridge.onClose();                         // bail back to the app instead of a broken game
    throw new Error('Missing HostConfig');
  }
  return cfg!;
}

// Dev fallback: run `vite` in a plain browser with a .env-driven config
export function readHostConfigDev(): HostConfig {
  return window.GAME_CONFIG ?? {
    apiBase: import.meta.env.VITE_API_BASE ?? 'http://localhost:8080',
    token: import.meta.env.VITE_DEV_TOKEN ?? 'dev-token',
    userId: 'dev', sessionId: 'dev',
  };
}
```

## API client — direct fetch with the injected token (Approach A)

```typescript
// src/contracts/api.dto.ts — typed backend contracts
export interface GameDataDto { level: number; spawnSeed: number; timeLimit: number; highScore: number; }
export interface ResultDto  { sessionId: string; finalScore: number; goldGrabbed: number; durationMs: number; }
export interface SubmitAck  { accepted: boolean; newHighScore: boolean; }
```

```typescript
// src/api/client.ts — one fetch wrapper; token from HostConfig
import type { HostConfig } from '../contracts/game-contract';

export function createApiClient(cfg: HostConfig) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${cfg.apiBase}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.token}`,   // token owned by the Flutter app
        ...(init.headers ?? {}),
      },
    });
    if (res.status === 401) throw new ApiError('unauthorized', 401);
    if (!res.ok) throw new ApiError(`http_${res.status}`, res.status);
    return res.json() as Promise<T>;
  }
  return { request };
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
```

```typescript
// src/api/game.api.ts — the two calls this game needs
import type { ApiClient } from './client';               // typeof createApiClient return
import type { GameDataDto, ResultDto, SubmitAck } from '../contracts/api.dto';

export function createGameApi(client: ReturnType<typeof import('./client').createApiClient>) {
  return {
    // @trace.implements=GAME-UC4-SC1  (load data for the game)
    // @trace.source=specs/game/load-data/bdd/GAME-UC4.feature
    loadData: (userId: string) =>
      client.request<GameDataDto>(`/v1/gold-miner/data?userId=${encodeURIComponent(userId)}`),

    // @trace.implements=GAME-UC5-SC1  (submit result to server)
    // @trace.source=specs/game/submit-result/bdd/GAME-UC5.feature
    submitResult: (dto: ResultDto) =>
      client.request<SubmitAck>('/v1/gold-miner/result', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  };
}
```

## Thin native bridge — window control only (ready + close)

```typescript
// src/bridge/native-bridge.ts — abstracts flutter_inappwebview / Android JS interface
import type { GameContract } from '../contracts/game-contract';

class NativeBridge implements GameContract {
  private post(type: string, payload: unknown = {}) {
    // flutter_inappwebview (preferred): Flutter registers a JS handler
    if (window.flutter_inappwebview) {
      void window.flutter_inappwebview.callHandler(type, payload);
    } else if (window.Android) {                          // webview_flutter JavaScriptChannel
      window.Android.postMessage(JSON.stringify({ type, payload }));
    } else {
      console.debug('[bridge:no-native]', type, payload); // plain browser dev
    }
  }
  onReady() { this.post('onReady'); }
  onClose() { this.post('onClose'); }   // Flutter side: Navigator.pop() → back to app screen
}

export const bridge: GameContract = new NativeBridge();
```

> **Flutter side (reference, `flutter_inappwebview`)** — inject config + handle close:
> ```dart
> initialUserScripts: UnmodifiableListView([
>   UserScript(
>     source: "window.GAME_CONFIG = ${jsonEncode(config)};",
>     injectionTime: UserScriptInjectionTime.AT_DOCUMENT_START, // before bundle runs
>   ),
> ]),
> onWebViewCreated: (c) {
>   c.addJavaScriptHandler(handlerName: 'onClose', callback: (_) { Navigator.pop(context); });
>   c.addJavaScriptHandler(handlerName: 'onReady', callback: (_) => hideSplash());
> },
> ```

## Wiring it together — Boot & Preload scenes

```typescript
// src/scenes/BootScene.ts — read host config, build API, then preload
import Phaser from 'phaser';
import { readHostConfig } from '../config/host-config';
import { createApiClient } from '../api/client';
import { createGameApi } from '../api/game.api';
import { bridge } from '../bridge/native-bridge';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    const cfg = readHostConfig();                    // throws + onClose() if invalid
    const api = createGameApi(createApiClient(cfg));
    this.registry.set('cfg', cfg);                   // share across scenes via registry
    this.registry.set('api', api);
    bridge.onReady();
    this.scene.start('PreloadScene');
  }
}
```

```typescript
// src/scenes/PreloadScene.ts (create) — load game data over HTTP, then start the game
async create() {
  const api = this.registry.get('api');
  const cfg = this.registry.get('cfg');
  try {
    const data = await api.loadData(cfg.userId);     // direct backend call (Approach A)
    this.scene.start('GameScene', { data });
  } catch (e) {
    console.error('loadData failed', e);
    this.scene.start('MenuScene', { offline: true }); // graceful fallback
  }
}
```

```typescript
// GameScene — on game over, submit the result straight to the backend
private async endGame() {
  const api = this.registry.get('api');
  const cfg = this.registry.get('cfg');
  try {
    await api.submitResult({
      sessionId: cfg.sessionId,
      finalScore: this.score,
      goldGrabbed: this.grabbedCount,
      durationMs: this.time.now,
    });
  } catch (e) {
    console.error('submitResult failed', e);          // optionally queue for retry
  }
  this.scene.start('GameOverScene', { score: this.score });
}
```

## Event bus — game ↔ HUD without hard scene references

```typescript
// src/bridge/event-bus.ts
import Phaser from 'phaser';
export const EventBus = new Phaser.Events.EventEmitter();
// GameScene:  EventBus.emit('score-changed', score)
// UIScene:    EventBus.on('score-changed', (s) => this.scoreText.setText(`Score: ${s}`))
```

## Debug console — eruda, only with `?debug=1`

```typescript
// src/debug/eruda.ts — lazy import keeps eruda out of the normal bundle path
export async function maybeLoadDebugConsole(): Promise<void> {
  if (new URLSearchParams(location.search).get('debug') !== '1') return;
  const eruda = (await import('eruda')).default;   // dynamic import → its own chunk
  eruda.init();
}
```

## Unit Test — domain logic under Vitest (no Phaser, no browser)

```typescript
// tests/hook-physics.test.ts
// @trace.verifies=GAME-UC1
// @trace.test_type=unit
import { describe, it, expect } from 'vitest';
import { retractSpeed } from '../src/domain/hook-physics';

describe('retractSpeed', () => {
  it('is slower for heavier gold', () => {
    expect(retractSpeed(320, 2)).toBeLessThan(retractSpeed(320, 1));
  });
  it('clamps tiny weights to avoid divide blow-up', () => {
    expect(Number.isFinite(retractSpeed(320, 0))).toBe(true);
  });
});
```

```typescript
// tests/spawn.test.ts — deterministic thanks to an injected RNG
// @trace.verifies=GAME-UC0
// @trace.test_type=unit
import { describe, it, expect } from 'vitest';
import { rollSpawn, type Rng } from '../src/domain/spawn';

const fixedRng: Rng = { between: (min) => min, pick: (arr) => arr[0] };

describe('rollSpawn', () => {
  it('produces one spot per count across all rows', () => {
    const spots = rollSpawn([{ count: 3, sizes: [32], band: [200, 400] }], fixedRng);
    expect(spots).toHaveLength(3);
    expect(spots[0]).toEqual({ x: 60, y: 200, size: 32 });
  });
});
```

## Unit Test — API client (Approach A) with mocked fetch

```typescript
// tests/game-api.test.ts
// @trace.verifies=GAME-UC5
// @trace.test_type=unit
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '../src/api/client';
import { createGameApi } from '../src/api/game.api';

const cfg = { apiBase: 'https://api.test', token: 'tkn', userId: 'u1', sessionId: 's1' };

beforeEach(() => vi.restoreAllMocks());

describe('submitResult', () => {
  it('POSTs to the result endpoint with the Bearer token from HostConfig', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ accepted: true, newHighScore: false }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const api = createGameApi(createApiClient(cfg));
    const ack = await api.submitResult({ sessionId: 's1', finalScore: 120, goldGrabbed: 4, durationMs: 30000 });

    expect(ack.accepted).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/v1/gold-miner/result');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tkn');
  });

  it('throws ApiError(401) when the token is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));
    const api = createGameApi(createApiClient(cfg));
    await expect(api.loadData('u1')).rejects.toMatchObject({ status: 401 });
  });
});
```

## Smoke Test — Playwright: stub host config + intercept backend

```typescript
// tests/e2e/play.spec.ts
// @trace.verifies=GAME-UC0
// @trace.test_type=integration
import { test, expect } from '@playwright/test';

test('boots with injected config, loads data, closes on back', async ({ page }) => {
  // Emulate what Flutter injects BEFORE the bundle runs
  await page.addInitScript(() => {
    (window as any).GAME_CONFIG = {
      apiBase: 'https://api.test', token: 'tkn', userId: 'u1', sessionId: 's1',
    };
  });
  // No real server needed — intercept the direct backend calls (Approach A)
  await page.route('**/v1/gold-miner/data*', (r) =>
    r.fulfill({ json: { level: 1, spawnSeed: 42, timeLimit: 60, highScore: 0 } }));
  await page.route('**/v1/gold-miner/result', (r) =>
    r.fulfill({ json: { accepted: true, newHighScore: true } }));

  await page.goto('http://localhost:4173/');          // vite preview
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.locator('#game').click();                // start / drop the hook
  await expect(page.locator('#hud-score')).toHaveText(/Score: \d+/);
});
```

/**
 * OffscreenCanvas + Worker renderer.
 * All matrix logic runs off the main thread.
 * Falls back to null if OffscreenCanvas/Worker not supported.
 */

export interface WorkerHandle {
  postScroll(y: number): void;
  postGravity(wells: { x: number; y: number; width: number; height: number; strength: number }[]): void;
  cleanup(): void;
}

export function createMatrixWorker(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): WorkerHandle | null {
  if (
    typeof OffscreenCanvas === "undefined" ||
    !canvas.transferControlToOffscreen ||
    (canvas as any).__transferred
  ) {
    return null;
  }

  // Once we call transferControlToOffscreen, the main thread can no longer
  // use this canvas — so we MUST succeed from here or the canvas is dead.
  (canvas as any).__transferred = true;
  const offscreen = canvas.transferControlToOffscreen();
  const blob = new Blob(
    [`(${workerMain.toString()})()`],
    { type: "application/javascript" },
  );
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);

  worker.onerror = () => {};

  worker.postMessage(
    { type: "init", canvas: offscreen, width, height },
    [offscreen],
  );

  return {
    postScroll(y) { worker.postMessage({ type: "scroll", y }); },
    postGravity(wells) { worker.postMessage({ type: "gravity", wells }); },
    cleanup() {
      worker.terminate();
      URL.revokeObjectURL(url);
    },
  };
}

// ---------------------------------------------------------------------------
// Self-contained worker function — converted to string via .toString()
// No imports allowed. Everything the hot path needs is defined inline.
// ---------------------------------------------------------------------------
function workerMain() {
  // === Helpers ===
  const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!%";
  const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // === Drawing (green palette) ===
  function drawCharGreen(
    ctx: OffscreenCanvasRenderingContext2D,
    x: number, y: number, char: string, size: number, brightness: number,
  ) {
    if (brightness <= 0.02 || size < 4) return;
    const alpha = clamp(brightness, 0, 1);
    if (brightness > 0.9) {
      ctx.fillStyle = `rgba(220, 255, 220, ${alpha})`;
    } else if (brightness > 0.6) {
      ctx.fillStyle = `rgba(100, 220, 100, ${alpha})`;
    } else if (brightness > 0.3) {
      ctx.fillStyle = `rgba(${Math.floor(20 + brightness * 40)}, ${Math.floor(80 + brightness * 140)}, ${Math.floor(20 + brightness * 40)}, ${alpha})`;
    } else {
      ctx.fillStyle = `rgba(${Math.floor(10 + brightness * 30)}, ${Math.floor(40 + brightness * 100)}, ${Math.floor(10 + brightness * 30)}, ${alpha})`;
    }
    ctx.font = `bold ${Math.round(size)}px monospace`;
    ctx.fillText(char, x, y);
  }

  // === Atlas ===
  const SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
  const BRIGHT_LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const CELL = 28;
  const NUM_CHARS = CHARSET.length;
  const NUM_SIZES = SIZES.length;
  const NUM_BRIGHTS = BRIGHT_LEVELS.length;
  const TOTAL = NUM_CHARS * NUM_SIZES * NUM_BRIGHTS;
  const COLS = Math.ceil(Math.sqrt(TOTAL));

  function createAtlas() {
    const atlasW = COLS * CELL;
    const atlasH = Math.ceil(TOTAL / COLS) * CELL;
    const atlas = new OffscreenCanvas(atlasW, atlasH);
    const actx = atlas.getContext("2d", { alpha: true })!;
    actx.textBaseline = "middle";
    actx.textAlign = "center";
    actx.globalAlpha = 1;

    const charIdx: Record<string, number> = {};
    for (let i = 0; i < NUM_CHARS; i++) charIdx[CHARSET[i]] = i;

    const ax = new Uint16Array(TOTAL);
    const ay = new Uint16Array(TOTAL);

    let idx = 0;
    for (let ci = 0; ci < NUM_CHARS; ci++) {
      for (let si = 0; si < NUM_SIZES; si++) {
        for (let bi = 0; bi < NUM_BRIGHTS; bi++) {
          const col = idx % COLS;
          const row = (idx / COLS) | 0;
          ax[idx] = col * CELL;
          ay[idx] = row * CELL;
          drawCharGreen(
            actx as any,
            col * CELL + CELL / 2,
            row * CELL + CELL / 2,
            CHARSET[ci], SIZES[si], BRIGHT_LEVELS[bi],
          );
          idx++;
        }
      }
    }

    return function blit(
      ctx: OffscreenCanvasRenderingContext2D,
      x: number, y: number, char: string, size: number, brightness: number,
    ) {
      if (brightness <= 0.02 || size < 4) return;
      const ci = charIdx[char];
      if (ci === undefined) return;
      const si = Math.min(NUM_SIZES - 1, Math.max(0, Math.round((clamp(size, 4, 24) - 4) / 2)));
      const bi = Math.min(NUM_BRIGHTS - 1, Math.max(0, Math.round(clamp(brightness, 0.1, 1.0) * 10) - 1));
      const i = ci * (NUM_SIZES * NUM_BRIGHTS) + si * NUM_BRIGHTS + bi;
      ctx.drawImage(atlas, ax[i], ay[i], CELL, CELL, (x - CELL / 2) | 0, (y - CELL / 2) | 0, CELL, CELL);
    };
  }

  // === Tunnel Effect ===
  function tunnelEffect(
    pAngle: number, pSpeed: number, pPhase: number,
    time: number, w: number, h: number,
  ) {
    const cx = w / 2, cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const cycleLen = 1.4;
    const rawDepth = 0.18 * pSpeed * time + pPhase * cycleLen;
    const depth = rawDepth % cycleLen;
    const dist = depth * maxR;
    const trailStep = maxR * 0.025;
    return {
      x: cx + Math.cos(pAngle) * dist,
      y: cy + Math.sin(pAngle) * dist,
      size: 6 + 18 * clamp(depth, 0, 1),
      brightness: 0.85,
      trailDx: -Math.cos(pAngle) * trailStep,
      trailDy: -Math.sin(pAngle) * trailStep,
      trailSizeDelta: -0.6,
    };
  }

  // === Gravity ===
  function createGravityCalc(radius: number) {
    return function getOffset(
      x: number, y: number,
      wells: { x: number; y: number; width: number; height: number; strength: number }[],
    ) {
      let brightness = 0;
      for (let i = 0; i < wells.length; i++) {
        const well = wells[i];
        if (well.strength < 0.01) continue;
        const nx = Math.max(well.x, Math.min(x, well.x + well.width));
        const ny = Math.max(well.y, Math.min(y, well.y + well.height));
        const dx = nx - x, dy = ny - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) { brightness = Math.max(brightness, 0.7 * well.strength); continue; }
        if (dist > radius) continue;
        const proximity = 1 - dist / radius;
        brightness = Math.max(brightness, proximity * proximity * 0.3 * well.strength);
      }
      return brightness;
    };
  }

  // === State ===
  let scrollY = 0;
  let wells: { x: number; y: number; width: number; height: number; strength: number }[] = [];

  // === Main ===
  (self as any).onmessage = (e: MessageEvent) => {
    const msg = e.data;

    if (msg.type === "scroll") {
      scrollY = msg.y;
      return;
    }
    if (msg.type === "gravity") {
      wells = msg.wells;
      return;
    }
    if (msg.type !== "init") return;

    const canvas: OffscreenCanvas = msg.canvas;
    const width: number = msg.width;
    const height: number = msg.height;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    canvas.width = width;
    canvas.height = height;

    // Config
    const TRAIL_LENGTH = 20;
    const CHAR_TICK_RATE = 1.5;
    const OPACITY = 0.5;
    const FADE_START = 0.2;
    const FADE_DUR = 1.2;
    const GRAV_RADIUS = 120;

    const cellSize = 18;
    const numCols = Math.ceil(width / cellSize);
    const numParticles = Math.max(numCols * 4, 200);

    // Create particles
    const angles = new Float64Array(numParticles);
    const speeds = new Float64Array(numParticles);
    const phases = new Float64Array(numParticles);
    const charBuffers: string[][] = [];
    const lastCharTick = new Float64Array(numParticles);

    for (let i = 0; i < numParticles; i++) {
      angles[i] = (i / numParticles) * Math.PI * 2;
      speeds[i] = 0.7 + Math.random() * 0.6;
      phases[i] = Math.random();
      charBuffers.push(Array.from({ length: TRAIL_LENGTH }, () => randomChar()));
    }

    const blit = createAtlas();
    const getGravBrightness = createGravityCalc(GRAV_RADIUS);

    let lastTime = performance.now();
    const startTime = lastTime;

    const loop = () => {
      requestAnimationFrame(loop);

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) return;

      const elapsed = (now - startTime) / 1000;
      const fade = clamp((elapsed - FADE_START) / FADE_DUR, 0, 1);
      if (fade <= 0) return;

      ctx.globalAlpha = fade * OPACITY;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";



      for (let i = 0; i < numParticles; i++) {
        const frame = tunnelEffect(angles[i], speeds[i], phases[i], elapsed, width, height);
        if (frame.brightness <= 0) continue;

        const charTick = Math.floor(elapsed * speeds[i] * CHAR_TICK_RATE);
        if (charTick !== lastCharTick[i]) {
          lastCharTick[i] = charTick;
          for (let j = 0; j < TRAIL_LENGTH; j++) {
            charBuffers[i][j] = randomChar();
          }
        }

        for (let t = TRAIL_LENGTH - 1; t >= 0; t--) {
          const sx = frame.x + frame.trailDx * t;
          const sy = frame.y + frame.trailDy * t;
          if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;

          const sSize = Math.max(4, frame.size + frame.trailSizeDelta * t);
          let sBright = frame.brightness * (1 - t / TRAIL_LENGTH);
          if (sBright < 0.05) continue;

          if (wells.length > 0) {
            sBright = clamp(sBright + getGravBrightness(sx, sy, wells), 0, 1);
          }

          blit(ctx as any, sx, sy, charBuffers[i][t], sSize, sBright);
        }
      }

      ctx.globalAlpha = 1;
    };

    requestAnimationFrame(loop);
  };
}

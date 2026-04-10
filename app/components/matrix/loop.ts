import { clamp } from "./helpers";

export interface LoopConfig {
  fadeStart: number;
  fadeDur: number;
  opacity: number;
  maxDt: number;
}

export const DEFAULT_LOOP_CONFIG: LoopConfig = {
  fadeStart: 0.2,
  fadeDur: 1.2,
  opacity: 0.5,
  maxDt: 0.1,
};

export interface LoopState {
  elapsed: number;
  dt: number;
  fade: number;
}

export function runLoop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: LoopConfig,
  onTick: (state: LoopState) => void,
): () => void {
  let animId: number;
  let lastTime = performance.now();
  const startTime = lastTime;
  const frameTimes = new Float64Array(120);
  let frameIdx = 0;

  const loop = () => {
    animId = requestAnimationFrame(loop);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > config.maxDt) return;

    const elapsed = (now - startTime) / 1000;
    const fade = clamp((elapsed - config.fadeStart) / config.fadeDur, 0, 1);
    if (fade <= 0) return;

    ctx.globalAlpha = fade * config.opacity;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const tickStart = performance.now();
    onTick({ elapsed, dt, fade });
    const tickMs = performance.now() - tickStart;

    // Log average frame time every 120 frames (~2s)
    frameTimes[frameIdx % 120] = tickMs;
    frameIdx++;
    if (frameIdx % 120 === 0) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / 120;
      console.log(`[matrix] avg tick: ${avg.toFixed(2)}ms (${(1000 / (avg + 1)).toFixed(0)} theoretical fps)`);
    }

    ctx.globalAlpha = 1;
  };

  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}

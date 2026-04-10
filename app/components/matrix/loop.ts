import { clamp } from "./helpers";

export interface LoopConfig {
  fadeStart: number;
  fadeDur: number;
  opacity: number;
  maxDt: number;
  adaptiveFps: boolean;
}

export const DEFAULT_LOOP_CONFIG: LoopConfig = {
  fadeStart: 0.2,
  fadeDur: 1.2,
  opacity: 0.5,
  maxDt: 0.1,
  adaptiveFps: false,
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

  // Adaptive fps: track frame times, skip frames if device is struggling
  let skipNext = false;
  let slowFrames = 0;
  let totalFrames = 0;

  const loop = () => {
    animId = requestAnimationFrame(loop);

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > config.maxDt) return;

    // Adaptive: if >40% of recent frames are slow, render every other frame
    if (config.adaptiveFps) {
      totalFrames++;
      if (dt > 0.018) slowFrames++; // >18ms = missing 60fps
      if (totalFrames >= 60) {
        skipNext = slowFrames / totalFrames > 0.4;
        slowFrames = 0;
        totalFrames = 0;
      }
      if (skipNext && totalFrames % 2 === 0) return;
    }

    const elapsed = (now - startTime) / 1000;
    const fade = clamp((elapsed - config.fadeStart) / config.fadeDur, 0, 1);
    if (fade <= 0) return;

    ctx.globalAlpha = fade * config.opacity;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    onTick({ elapsed, dt, fade });

    ctx.globalAlpha = 1;
  };

  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}

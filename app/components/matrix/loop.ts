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

    onTick({ elapsed, dt, fade });

    ctx.globalAlpha = 1;
  };

  animId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animId);
}

import { Particle, Effect, GravityWell } from "./types";
import { randomChar, clamp } from "./helpers";
import { createGravityCalculator } from "./gravity";

export interface ParticleConfig {
  trailLength: number;
  charTickRate: number;
  cellSize: number;
}

export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  trailLength: 20,
  charTickRate: 1.5,
  cellSize: 18,
};

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  char: string, size: number, brightness: number,
) => void;

export interface GravityState {
  wells: GravityWell[];
  getOffset: ReturnType<typeof createGravityCalculator>;
}

export interface ParticlePool {
  particles: Particle[];
  charBuffers: string[][];
  lastCharTick: Float64Array;
}

export function createParticlePool(
  numCols: number,
  numParticles: number,
  config: ParticleConfig,
): ParticlePool {
  const particles: Particle[] = [];
  const charBuffers: string[][] = [];
  const lastCharTick = new Float64Array(numParticles);

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      index: i,
      angle: (i / numParticles) * Math.PI * 2,
      col: i < numCols * 3 ? i % numCols : -1,
      speed: 0.7 + Math.random() * 0.6,
      phase: Math.random(),
    });
    charBuffers.push(Array.from({ length: config.trailLength }, () => randomChar()));
  }

  return { particles, charBuffers, lastCharTick };
}

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  pool: ParticlePool,
  config: ParticleConfig,
  effect: Effect,
  elapsed: number,
  width: number,
  height: number,
  drawFn: DrawFn,
  gravity: GravityState | null,
): void {
  const { particles, charBuffers, lastCharTick } = pool;
  const { trailLength, charTickRate } = config;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const frame = effect(p, elapsed, width, height);
    if (frame.brightness <= 0) continue;

    const charTick = Math.floor(elapsed * p.speed * charTickRate);
    if (charTick !== lastCharTick[i]) {
      lastCharTick[i] = charTick;
      for (let j = 0; j < trailLength; j++) {
        charBuffers[i][j] = randomChar();
      }
    }

    for (let t = trailLength - 1; t >= 0; t--) {
      const sx = frame.x + frame.trailDx * t;
      const sy = frame.y + frame.trailDy * t;
      if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;

      const sSize = Math.max(4, frame.size + frame.trailSizeDelta * t);
      let sBright = frame.brightness * (1 - t / trailLength);
      if (sBright < 0.05) continue;

      if (gravity) {
        const grav = gravity.getOffset(sx, sy, gravity.wells);
        sBright = clamp(sBright + grav.brightness, 0, 1);
      }

      drawFn(ctx, sx, sy, charBuffers[i][t], sSize, sBright);
    }
  }
}

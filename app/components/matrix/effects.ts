import { Effect, ParticleFrame, Particle, ZERO_FRAME } from "./types";
import { clamp, lerp } from "./helpers";

// =============================================================================
// Effects
// =============================================================================

const tunnelEffect: Effect = (p, time, w, h) => {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const cycleLen = 1.4;
  const rawDepth = 0.18 * p.speed * time + p.phase * cycleLen;
  const depth = rawDepth % cycleLen;
  const dist = depth * maxR;
  const x = cx + Math.cos(p.angle) * dist;
  const y = cy + Math.sin(p.angle) * dist;
  const trailStep = maxR * 0.025;

  return {
    x, y,
    size: 6 + 18 * clamp(depth, 0, 1),
    brightness: clamp(0.6 + depth * 0.4, 0, 1),
    trailDx: -Math.cos(p.angle) * trailStep,
    trailDy: -Math.sin(p.angle) * trailStep,
    trailSizeDelta: -0.6,
  };
};

const globeEffect: Effect = (p, time, w, h) => {
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(w, h) * 0.28;
  const theta = p.angle;
  const phi = p.phase * Math.PI;
  const sx = Math.sin(phi) * Math.cos(theta);
  const sy = Math.cos(phi);
  const sz = Math.sin(phi) * Math.sin(theta);
  const rotSpeed = 0.5;
  const cosR = Math.cos(time * rotSpeed);
  const sinR = Math.sin(time * rotSpeed);
  const rx = sx * cosR + sz * sinR;
  const ry = sy;
  const rz = -sx * sinR + sz * cosR;

  if (rz > 0.15) return ZERO_FRAME;

  return {
    x: cx + rx * radius,
    y: cy + ry * radius * 0.9,
    size: 10 + 6 * clamp(-rz, 0, 1),
    brightness: clamp(-rz * 1.3, 0, 1) * 0.9,
    trailDx: rx * 3,
    trailDy: ry * 3,
    trailSizeDelta: -0.3,
  };
};

const rainEffect: Effect = (p, time, w, h) => {
  if (p.col < 0) return ZERO_FRAME;
  const cellSize = 18;
  const numRows = Math.ceil(h / cellSize);
  const trailLen = 20;
  const totalDist = numRows + trailLen;
  const rps = totalDist / 6;
  const rawY = p.speed * rps * time + p.phase * totalDist;
  const headRow = (rawY % totalDist) - trailLen;

  return {
    x: p.col * cellSize + cellSize / 2,
    y: headRow * cellSize + cellSize / 2,
    size: cellSize,
    brightness: 0.85,
    trailDx: 0,
    trailDy: -cellSize,
    trailSizeDelta: 0,
  };
};

const spiralEffect: Effect = (p, time, w, h) => {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const cycleLen = 1.4;
  const rawDepth = 0.14 * p.speed * time + p.phase * cycleLen;
  const depth = rawDepth % cycleLen;
  const rotatedAngle = p.angle + time * 0.3;
  const dist = depth * maxR;
  const x = cx + Math.cos(rotatedAngle) * dist;
  const y = cy + Math.sin(rotatedAngle) * dist;
  const trailStep = maxR * 0.025;
  const cos = Math.cos(time * 0.3), sin = Math.sin(time * 0.3);
  const baseDx = -Math.cos(p.angle) * trailStep;
  const baseDy = -Math.sin(p.angle) * trailStep;

  return {
    x, y,
    size: 6 + 18 * clamp(depth, 0, 1),
    brightness: clamp(depth * depth * 1.2, 0, 1),
    trailDx: baseDx * cos - baseDy * sin,
    trailDy: baseDx * sin + baseDy * cos,
    trailSizeDelta: -0.6,
  };
};

const cascadeEffect: Effect = (p, time, w, h) => {
  const cx = w / 2;
  const cycleLen = 1.6;
  const rawT = 0.2 * p.speed * time + p.phase * cycleLen;
  const t = rawT % cycleLen;
  const y = t * t * h * 0.5;
  const spread = (Math.cos(p.angle) * 0.5) * t * w * 0.4;
  const x = cx + spread;

  return {
    x, y,
    size: 10 + 10 * clamp(t, 0, 1),
    brightness: clamp((1 - t / cycleLen) * 1.2, 0, 1),
    trailDx: -spread * 0.04,
    trailDy: -t * h * 0.04,
    trailSizeDelta: -0.3,
  };
};

const convergeEffect: Effect = (p, time, w, h) => {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const cycleLen = 1.4;
  const rawDepth = 0.18 * p.speed * time + p.phase * cycleLen;
  const depth = 1.0 - (rawDepth % cycleLen) / cycleLen;
  const dist = depth * maxR;
  const x = cx + Math.cos(p.angle) * dist;
  const y = cy + Math.sin(p.angle) * dist;
  const trailStep = maxR * 0.025;

  return {
    x, y,
    size: 6 + 18 * clamp(depth, 0, 1),
    brightness: clamp((1 - depth) * (1 - depth) * 1.5, 0, 1),
    trailDx: Math.cos(p.angle) * trailStep,
    trailDy: Math.sin(p.angle) * trailStep,
    trailSizeDelta: 0.4,
  };
};

export const effects = {
  tunnel: tunnelEffect,
  globe: globeEffect,
  rain: rainEffect,
  spiral: spiralEffect,
  cascade: cascadeEffect,
  converge: convergeEffect,
};

// =============================================================================
// Combinators
// =============================================================================

export function blend(a: Effect, b: Effect, t: number): Effect {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return (p, time, w, h) => {
    const fa = a(p, time, w, h);
    const fb = b(p, time, w, h);
    return {
      x: lerp(fa.x, fb.x, t),
      y: lerp(fa.y, fb.y, t),
      size: lerp(fa.size, fb.size, t),
      brightness: lerp(fa.brightness, fb.brightness, t),
      trailDx: lerp(fa.trailDx, fb.trailDx, t),
      trailDy: lerp(fa.trailDy, fb.trailDy, t),
      trailSizeDelta: lerp(fa.trailSizeDelta, fb.trailSizeDelta, t),
    };
  };
}

export function transform(
  effect: Effect,
  fn: (frame: ParticleFrame, p: Particle, time: number, w: number, h: number) => ParticleFrame,
): Effect {
  return (p, time, w, h) => fn(effect(p, time, w, h), p, time, w, h);
}

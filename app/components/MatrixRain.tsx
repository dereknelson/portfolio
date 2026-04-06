import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";

// =============================================================================
// Helpers
// =============================================================================

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!%";
const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// Particle System Types
// =============================================================================

/** Immutable identity of a particle — assigned once at creation. */
export interface Particle {
  index: number;
  angle: number;   // radial identity for tunnel/spiral effects (0..2π)
  col: number;     // column identity for rain (-1 = no column, fades out in rain)
  speed: number;   // base speed multiplier (0.7..1.3)
  phase: number;   // random offset for staggering (0..1)
}

/** Output of an Effect for one particle at one instant. */
export interface ParticleFrame {
  x: number;
  y: number;
  size: number;
  brightness: number;
  trailDx: number;         // x offset per trail segment (head → tail direction)
  trailDy: number;         // y offset per trail segment
  trailSizeDelta: number;  // size change per trail segment (negative = shrinking)
}

/**
 * An Effect is a pure function that computes a particle's visual state
 * from its identity + elapsed time + canvas dimensions.
 * No side effects, no internal state — fully composable.
 */
export type Effect = (p: Particle, time: number, w: number, h: number) => ParticleFrame;

/**
 * A SceneDirector maps scroll position + time to the active Effect.
 * This is how the consumer choreographs transitions.
 */
export type SceneDirector = (
  scrollY: number,
  time: number,
  w: number,
  h: number,
) => Effect;

// =============================================================================
// Easings
// =============================================================================

export const easings = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  smoothstep: (t: number) => t * t * (3 - 2 * t),
};

// =============================================================================
// Effects Library
// =============================================================================

const ZERO_FRAME: ParticleFrame = {
  x: -200, y: -200, size: 0, brightness: 0,
  trailDx: 0, trailDy: 0, trailSizeDelta: 0,
};

/**
 * Tunnel — radial rays from a central vanishing point.
 * Characters spawn at center and fly outward with perspective scaling.
 */
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
    brightness: clamp(depth * depth * 1.2, 0, 1),
    trailDx: -Math.cos(p.angle) * trailStep,
    trailDy: -Math.sin(p.angle) * trailStep,
    trailSizeDelta: -0.6,
  };
};

/**
 * Rain — classic vertical falling columns.
 * Only particles with a column assignment (col >= 0) are visible.
 */
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

/**
 * Spiral — tunnel with a rotating frame of reference.
 * Same radial structure but the entire field slowly rotates.
 */
const spiralEffect: Effect = (p, time, w, h) => {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  const cycleLen = 1.4;
  const rawDepth = 0.14 * p.speed * time + p.phase * cycleLen;
  const depth = rawDepth % cycleLen;

  // Rotate the whole field over time
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

/**
 * Cascade — characters fall outward from center like a fountain,
 * spreading horizontally as they descend.
 */
const cascadeEffect: Effect = (p, time, w, h) => {
  const cx = w / 2;
  const cycleLen = 1.6;
  const rawT = 0.2 * p.speed * time + p.phase * cycleLen;
  const t = rawT % cycleLen;

  // Vertical: accelerate downward (gravity feel)
  const y = t * t * h * 0.5;
  // Horizontal: spread based on angle, increasing with fall distance
  const spread = (Math.cos(p.angle) * 0.5) * t * w * 0.4;
  const x = cx + spread;

  const brightness = clamp((1 - t / cycleLen) * 1.2, 0, 1);

  return {
    x, y,
    size: 10 + 10 * clamp(t, 0, 1),
    brightness,
    trailDx: -spread * 0.04,
    trailDy: -t * h * 0.04,
    trailSizeDelta: -0.3,
  };
};

/**
 * Converge — all characters pull inward toward center.
 * Reverse of tunnel; characters spawn at edges and collapse inward.
 */
const convergeEffect: Effect = (p, time, w, h) => {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  const cycleLen = 1.4;
  const rawDepth = 0.18 * p.speed * time + p.phase * cycleLen;
  const depth = 1.0 - (rawDepth % cycleLen) / cycleLen; // invert: 1→0

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
  rain: rainEffect,
  spiral: spiralEffect,
  cascade: cascadeEffect,
  converge: convergeEffect,
};

// =============================================================================
// Combinators
// =============================================================================

/** Linearly interpolate between two effects. */
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

/** Apply an arbitrary transformation to an effect's output. */
export function transform(
  effect: Effect,
  fn: (frame: ParticleFrame, p: Particle, time: number, w: number, h: number) => ParticleFrame,
): Effect {
  return (p, time, w, h) => fn(effect(p, time, w, h), p, time, w, h);
}

// =============================================================================
// Gravity Effect (Post-processor)
// =============================================================================

export interface GravityWell {
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
}

export interface GravityConfig {
  radius: number;
  pullStrength: number;
  surfaceFlowStrength: number;
  maxOffset: number;
  smoothing: number;
}

export const DEFAULT_GRAVITY_CONFIG: GravityConfig = {
  radius: 300,
  pullStrength: 60,
  surfaceFlowStrength: 25,
  maxOffset: 160,
  smoothing: 0.12,
};

function nearestPointOnRect(
  px: number, py: number,
  rx: number, ry: number, rw: number, rh: number,
) {
  return { nx: clamp(px, rx, rx + rw), ny: clamp(py, ry, ry + rh) };
}

export function createGravityCalculator(config: GravityConfig) {
  const { radius, pullStrength, surfaceFlowStrength, maxOffset } = config;

  return function getGravityOffset(
    x: number, y: number, wells: GravityWell[],
  ): { dx: number; dy: number; brightness: number } {
    let dx = 0, dy = 0, brightness = 0;

    for (const well of wells) {
      if (well.strength < 0.01) continue;

      const { nx, ny } = nearestPointOnRect(x, y, well.x, well.y, well.width, well.height);
      const toSurfX = nx - x, toSurfY = ny - y;
      const dist = Math.sqrt(toSurfX * toSurfX + toSurfY * toSurfY);

      if (dist < 1) {
        dy += surfaceFlowStrength * well.strength * 0.5;
        brightness = Math.max(brightness, 0.85 * well.strength);
        continue;
      }
      if (dist > radius) continue;

      const dirX = toSurfX / dist, dirY = toSurfY / dist;
      const proximity = 1 - dist / radius;
      const pull = proximity * proximity * proximity * well.strength * pullStrength;

      dx += dirX * pull;
      dy += dirY * pull;

      if (proximity > 0.4) {
        const flow = (proximity - 0.4) / 0.6;
        dy += flow * flow * surfaceFlowStrength * well.strength;
      }

      brightness = Math.max(brightness, proximity * proximity * well.strength);
    }

    const offsetDist = Math.sqrt(dx * dx + dy * dy);
    if (offsetDist > maxOffset) {
      dx = (dx / offsetDist) * maxOffset;
      dy = (dy / offsetDist) * maxOffset;
    }
    return { dx, dy, brightness };
  };
}

// =============================================================================
// Drawing
// =============================================================================

function drawChar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, char: string, size: number, brightness: number,
) {
  if (brightness <= 0.02 || size < 4) return;
  const alpha = clamp(brightness, 0, 1);

  if (brightness > 0.9) {
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  } else if (brightness > 0.6) {
    ctx.shadowColor = "#0f0";
    ctx.shadowBlur = 4;
    ctx.fillStyle = `rgba(170, 255, 170, ${alpha})`;
  } else if (brightness > 0.3) {
    ctx.shadowBlur = 2;
    ctx.fillStyle = `rgba(0, ${Math.floor(100 + brightness * 155)}, 0, ${alpha})`;
  } else {
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(0, ${Math.floor(50 + brightness * 100)}, 0, ${alpha})`;
  }

  ctx.font = `bold ${Math.round(size)}px monospace`;
  ctx.fillText(char, x, y);
}

// =============================================================================
// Component
// =============================================================================

const TRAIL_LENGTH = 20;
const OPACITY = 0.5;
const CHAR_TICK_RATE = 1.5;

const defaultScene: SceneDirector = () => rainEffect;

interface MatrixRainProps {
  gravityWells?: GravityWell[];
  enableGravity?: boolean;
  gravityConfig?: Partial<GravityConfig>;
  debug?: boolean;
  /** Scene director: maps (scrollY, time, w, h) → active Effect */
  scene?: SceneDirector;
  /** Current scroll position in pixels */
  scrollY?: number;
}

export function MatrixRain({
  gravityWells = [],
  enableGravity = true,
  gravityConfig = {},
  debug = false,
  scene,
  scrollY = 0,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowDimensions();

  // All reactive values go through refs — read in animation loop, no re-init
  const gravityWellsRef = useRef(gravityWells);
  gravityWellsRef.current = gravityWells;
  const enableGravityRef = useRef(enableGravity);
  enableGravityRef.current = enableGravity;
  const sceneRef = useRef(scene ?? defaultScene);
  sceneRef.current = scene ?? defaultScene;
  const scrollRef = useRef(scrollY);
  scrollRef.current = scrollY;
  const configRef = useRef({ ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig });
  configRef.current = { ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig };

  useEffect(() => {
    if (Platform.OS !== "web" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Particle count: enough for dense tunnel, column-assigned subset for rain
    const cellSize = 18;
    const numCols = Math.ceil(width / cellSize);
    const numParticles = Math.max(numCols * 4, 200);

    // Create particles
    const particles: Particle[] = [];
    const charBuffers: string[][] = [];
    const gravOffsets: { x: number; y: number }[][] = [];
    const lastCharTick = new Float64Array(numParticles);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        index: i,
        angle: (i / numParticles) * Math.PI * 2,
        col: i < numCols ? i : -1,
        speed: 0.7 + Math.random() * 0.6,
        phase: Math.random(),
      });
      charBuffers.push(Array.from({ length: TRAIL_LENGTH }, () => randomChar()));
      gravOffsets.push(Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 })));
    }

    let animId: number;
    let lastTime = performance.now();
    const startTime = lastTime;

    const loop = () => {
      animId = requestAnimationFrame(loop);

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) return; // skip if tab was backgrounded

      const elapsed = (now - startTime) / 1000;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const currentEffect = sceneRef.current(scrollRef.current, elapsed, width, height);
      const wells = gravityWellsRef.current;
      const gravEnabled = enableGravityRef.current;
      const config = configRef.current;
      const getGravityOffset = createGravityCalculator(config);

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        const frame = currentEffect(p, elapsed, width, height);

        if (frame.brightness <= 0) continue;

        // Randomize chars periodically
        const charTick = Math.floor(elapsed * p.speed * CHAR_TICK_RATE);
        if (charTick !== lastCharTick[i]) {
          lastCharTick[i] = charTick;
          for (let j = 0; j < TRAIL_LENGTH; j++) {
            charBuffers[i][j] = randomChar();
          }
        }

        // Draw trail segments (tail first, head last for correct overlap)
        for (let t = TRAIL_LENGTH - 1; t >= 0; t--) {
          const sx = frame.x + frame.trailDx * t;
          const sy = frame.y + frame.trailDy * t;

          if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;

          const sSize = Math.max(4, frame.size + frame.trailSizeDelta * t);
          let sBright = frame.brightness * (1 - t / TRAIL_LENGTH);

          let drawX = sx, drawY = sy;

          if (gravEnabled && wells.length > 0) {
            const grav = getGravityOffset(sx, sy, wells);
            gravOffsets[i][t].x += (grav.dx - gravOffsets[i][t].x) * config.smoothing;
            gravOffsets[i][t].y += (grav.dy - gravOffsets[i][t].y) * config.smoothing;
            drawX += gravOffsets[i][t].x;
            drawY += gravOffsets[i][t].y;
            sBright = clamp(sBright + grav.brightness, 0, 1);
          } else {
            gravOffsets[i][t].x *= 0.95;
            gravOffsets[i][t].y *= 0.95;
            drawX += gravOffsets[i][t].x;
            drawY += gravOffsets[i][t].y;
          }

          drawChar(ctx, drawX, drawY, charBuffers[i][t], sSize, sBright);
        }
      }

      ctx.shadowBlur = 0;

      if (debug && wells.length > 0) {
        for (const well of wells) {
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.strokeRect(well.x, well.y, well.width, well.height);
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [width, height]);

  if (Platform.OS !== "web") return null;

  return (
    <View style={[styles.container, { opacity: OPACITY }]} pointerEvents="none">
      <canvas
        ref={canvasRef as any}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});

export default MatrixRain;

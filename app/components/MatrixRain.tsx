import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  // Appearance
  opacity: 0.45,
  trailLength: 28,

  // Rain mode (default)
  secondsToTraverseScreen: 6,
  rowsPerTick: 8,
  speedEntropy: 0.3,
};

// =============================================================================
// Helpers
// =============================================================================

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!%";
const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// =============================================================================
// Gravity Effect (Composable Module)
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

/**
 * Nearest point on an axis-aligned rectangle to a given point.
 */
function nearestPointOnRect(
  px: number, py: number,
  rx: number, ry: number, rw: number, rh: number
): { nx: number; ny: number } {
  return {
    nx: clamp(px, rx, rx + rw),
    ny: clamp(py, ry, ry + rh),
  };
}

/**
 * Creates a gravity calculator that pulls characters toward the card
 * surface from ALL directions. Characters accumulate on and flow along
 * card edges, getting brighter as they approach — like the Smith effect.
 */
export function createGravityCalculator(config: GravityConfig) {
  const { radius, pullStrength, surfaceFlowStrength, maxOffset } = config;

  return function getGravityOffset(
    x: number,
    y: number,
    wells: GravityWell[]
  ): { dx: number; dy: number; brightness: number } {
    let dx = 0;
    let dy = 0;
    let brightness = 0;

    for (const well of wells) {
      if (well.strength < 0.01) continue;

      // Find nearest point on the card rectangle
      const { nx, ny } = nearestPointOnRect(
        x, y, well.x, well.y, well.width, well.height
      );

      // Vector from character toward the nearest surface point
      const toSurfX = nx - x;
      const toSurfY = ny - y;
      const dist = Math.sqrt(toSurfX * toSurfX + toSurfY * toSurfY);

      // Character is inside the card — flow downward along surface
      if (dist < 1) {
        dy += surfaceFlowStrength * well.strength * 0.5;
        brightness = Math.max(brightness, 0.85 * well.strength);
        continue;
      }

      if (dist > radius) continue;

      // Normalized direction toward surface
      const dirX = toSurfX / dist;
      const dirY = toSurfY / dist;

      // Proximity: 1 at surface, 0 at radius edge
      const proximity = 1 - dist / radius;

      // Pull strength increases sharply near the surface (cubic falloff)
      const pullFactor = proximity * proximity * proximity;
      const pull = pullFactor * well.strength * pullStrength;

      dx += dirX * pull;
      dy += dirY * pull;

      // Surface flow: once close, characters also drift downward along edges
      // This creates the "streaming down the surface" look
      if (proximity > 0.4) {
        const flowAmount = (proximity - 0.4) / 0.6; // 0 at 0.4, 1 at 1.0
        dy += flowAmount * flowAmount * surfaceFlowStrength * well.strength;
      }

      // Brightness: characters glow as they approach the surface
      const glow = proximity * proximity * well.strength;
      brightness = Math.max(brightness, glow);
    }

    // Clamp offset
    const offsetDist = Math.sqrt(dx * dx + dy * dy);
    if (offsetDist > maxOffset) {
      dx = (dx / offsetDist) * maxOffset;
      dy = (dy / offsetDist) * maxOffset;
    }

    return { dx, dy, brightness };
  };
}

// =============================================================================
// Shared Drawing
// =============================================================================

function drawChar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, char: string, size: number, brightness: number
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
// Rain Mode (vertical columns with gravity)
// =============================================================================

function initRainMode(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  gravityWellsRef: React.MutableRefObject<GravityWell[]>,
  enableGravityRef: React.MutableRefObject<boolean>,
  config: GravityConfig,
  debug: boolean
) {
  const cellSize = 18;
  const numCols = Math.ceil(w / cellSize);
  const numRows = Math.ceil(h / cellSize);
  const totalDistance = numRows + CONFIG.trailLength;
  const rowsPerSecond = totalDistance / CONFIG.secondsToTraverseScreen;
  const getGravityOffset = createGravityCalculator(config);

  interface Particle {
    col: number;
    y: number;
    speed: number;
    lastTickRow: number;
    chars: string[];
    offsets: { x: number; y: number }[];
  }

  const particles: Particle[] = [];
  for (let col = 0; col < numCols; col++) {
    particles.push({
      col,
      y: Math.random() * (numRows + CONFIG.trailLength),
      speed: 1 + (Math.random() - 0.5) * 2 * CONFIG.speedEntropy,
      lastTickRow: 0,
      chars: Array.from({ length: CONFIG.trailLength }, () => randomChar()),
      offsets: Array.from({ length: CONFIG.trailLength }, () => ({ x: 0, y: 0 })),
    });
  }

  return function tick(deltaSeconds: number) {
    const wells = gravityWellsRef.current;
    const gravityEnabled = enableGravityRef.current;

    for (const p of particles) {
      p.y += rowsPerSecond * deltaSeconds * p.speed;

      const tickRow = Math.floor(p.y / CONFIG.rowsPerTick);
      if (tickRow !== p.lastTickRow) {
        p.lastTickRow = tickRow;
        for (let j = 0; j < CONFIG.trailLength; j++) {
          p.chars[j] = randomChar();
        }
      }

      if (p.y > numRows + CONFIG.trailLength) {
        p.y = -CONFIG.trailLength;
        p.speed = 1 + (Math.random() - 0.5) * 2 * CONFIG.speedEntropy;
      }

      const headRow = Math.floor(p.y);
      const baseX = p.col * cellSize + cellSize / 2;

      for (let t = CONFIG.trailLength - 1; t >= 0; t--) {
        const row = headRow - t;
        if (row < 0 || row >= numRows) continue;

        const baseY = row * cellSize + cellSize / 2;
        let brightness = 1 - t / CONFIG.trailLength;

        if (gravityEnabled && wells.length > 0) {
          const gravity = getGravityOffset(baseX, baseY, wells);
          p.offsets[t].x += (gravity.dx - p.offsets[t].x) * config.smoothing;
          p.offsets[t].y += (gravity.dy - p.offsets[t].y) * config.smoothing;
          brightness = clamp(brightness + gravity.brightness, 0, 1);
        } else {
          p.offsets[t].x *= 0.95;
          p.offsets[t].y *= 0.95;
        }

        drawChar(ctx, baseX + p.offsets[t].x, baseY + p.offsets[t].y, p.chars[t], cellSize, brightness);
      }
    }

    // Debug
    if (debug && wells.length > 0) {
      for (const well of wells) {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(well.x, well.y, well.width, well.height);
      }
    }
  };
}

// =============================================================================
// Parallax Mode (radial hallway effect)
// =============================================================================

const PARALLAX = {
  numRays: 200,
  trailLength: 12,
  minDepth: 0.02,          // spawn close to vanishing point
  maxDepth: 1.4,           // overshoot past screen edge for clean exit
  baseSpeed: 0.15,         // base depth-per-second
  speedEntropy: 0.4,
  accelPower: 2.5,         // perspective acceleration exponent
  minSize: 6,
  maxSize: 24,
  tickInterval: 0.08,      // seconds between char randomization
};

function initParallaxMode(
  ctx: CanvasRenderingContext2D,
  w: number, h: number
) {
  const cx = w / 2;
  const cy = h / 2;
  // Max distance from center to a corner — defines depth=1
  const maxRadius = Math.sqrt(cx * cx + cy * cy);

  interface Ray {
    angle: number;       // radians — direction from vanishing point
    depth: number;       // 0 = at vanishing point, 1 = at screen edge
    speed: number;       // base speed multiplier
    chars: string[];
    lastTick: number;    // timestamp of last char shuffle
  }

  const rays: Ray[] = [];
  for (let i = 0; i < PARALLAX.numRays; i++) {
    rays.push({
      angle: Math.random() * Math.PI * 2,
      depth: PARALLAX.minDepth + Math.random() * (PARALLAX.maxDepth - PARALLAX.minDepth),
      speed: 1 + (Math.random() - 0.5) * 2 * PARALLAX.speedEntropy,
      chars: Array.from({ length: PARALLAX.trailLength }, () => randomChar()),
      lastTick: 0,
    });
  }

  return function tick(deltaSeconds: number) {
    const dirX = new Float64Array(PARALLAX.numRays);
    const dirY = new Float64Array(PARALLAX.numRays);

    for (let i = 0; i < rays.length; i++) {
      const r = rays[i];
      dirX[i] = Math.cos(r.angle);
      dirY[i] = Math.sin(r.angle);

      // Accelerate with depth (perspective: things move faster as they approach)
      const accel = Math.pow(Math.max(r.depth, 0.01), PARALLAX.accelPower);
      r.depth += PARALLAX.baseSpeed * r.speed * accel * deltaSeconds;

      // Randomize chars periodically
      r.lastTick += deltaSeconds;
      if (r.lastTick > PARALLAX.tickInterval) {
        r.lastTick = 0;
        for (let j = 0; j < PARALLAX.trailLength; j++) {
          r.chars[j] = randomChar();
        }
      }

      // Respawn when past screen edge
      if (r.depth > PARALLAX.maxDepth) {
        r.depth = PARALLAX.minDepth + Math.random() * 0.05;
        r.angle = Math.random() * Math.PI * 2;
        r.speed = 1 + (Math.random() - 0.5) * 2 * PARALLAX.speedEntropy;
        dirX[i] = Math.cos(r.angle);
        dirY[i] = Math.sin(r.angle);
      }

      // Draw trail (older segments are closer to center / smaller)
      for (let t = PARALLAX.trailLength - 1; t >= 0; t--) {
        const trailDepth = r.depth - t * 0.03;
        if (trailDepth < 0) continue;

        const dist = trailDepth * maxRadius;
        const px = cx + dirX[i] * dist;
        const py = cy + dirY[i] * dist;

        // Off-screen cull
        if (px < -30 || px > w + 30 || py < -30 || py > h + 30) continue;

        // Perspective size: small at center, large at edges
        const size = PARALLAX.minSize + (PARALLAX.maxSize - PARALLAX.minSize) * trailDepth;

        // Brightness: dim near vanishing point, bright near edges
        // Trail fade: head is brightest
        const depthBrightness = trailDepth * trailDepth;
        const trailFade = 1 - t / PARALLAX.trailLength;
        const brightness = depthBrightness * trailFade;

        drawChar(ctx, px, py, r.chars[t], size, brightness);
      }
    }
  };
}

// =============================================================================
// Main Component
// =============================================================================

interface MatrixRainProps {
  /** Array of gravity wells that bend the matrix around them */
  gravityWells?: GravityWell[];
  /** Enable/disable the gravity effect entirely */
  enableGravity?: boolean;
  /** Custom gravity configuration */
  gravityConfig?: Partial<GravityConfig>;
  /** Show debug visualization of gravity wells */
  debug?: boolean;
  /** Render mode: "rain" (default) or "parallax" (hallway effect) */
  mode?: "rain" | "parallax";
}

export function MatrixRain({
  gravityWells = [],
  enableGravity = true,
  gravityConfig = {},
  debug = false,
  mode = "rain",
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowDimensions();
  const gravityWellsRef = useRef(gravityWells);
  const enableGravityRef = useRef(enableGravity);

  const config = { ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig };

  useEffect(() => {
    gravityWellsRef.current = gravityWells;
  }, [gravityWells]);

  useEffect(() => {
    enableGravityRef.current = enableGravity;
  }, [enableGravity]);

  useEffect(() => {
    if (Platform.OS !== "web" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Initialize the appropriate render mode
    const tickFn = mode === "parallax"
      ? initParallaxMode(ctx, width, height)
      : initRainMode(ctx, width, height, gravityWellsRef, enableGravityRef, config, debug);

    let animationId: number;
    let lastTime = performance.now();

    const loop = () => {
      animationId = requestAnimationFrame(loop);
      const now = performance.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      tickFn(deltaSeconds);

      ctx.shadowBlur = 0;
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);

  }, [width, height, mode, config.radius, config.pullStrength, config.maxOffset, config.smoothing, debug]);

  if (Platform.OS !== "web") return null;

  return (
    <View style={[styles.container, { opacity: CONFIG.opacity }]} pointerEvents="none">
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

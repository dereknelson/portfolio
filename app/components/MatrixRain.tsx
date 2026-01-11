import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  // Appearance
  opacity: 0.3,
  trailLength: 20,

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
  orbitalStrength: number;
  pullStrength: number;
  maxOffset: number;
  smoothing: number;
}

export const DEFAULT_GRAVITY_CONFIG: GravityConfig = {
  radius: 200,
  orbitalStrength: 40,
  pullStrength: 15,
  maxOffset: 80,
  smoothing: 0.08,
};

/**
 * Creates a gravity offset calculator for the orbital wrap effect.
 * Streams curve around the left edge of gravity wells.
 */
export function createGravityCalculator(config: GravityConfig) {
  const { radius, orbitalStrength, pullStrength, maxOffset } = config;

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

      // Gravity point at left edge of the well
      const edgeX = well.x;
      const centerY = well.y + well.height / 2;

      // Only affect streams to the LEFT of the edge
      if (x > edgeX + 50) continue;

      // Vector from edge to character
      const fromEdgeX = x - edgeX;
      const fromEdgeY = y - centerY;
      const dist = Math.sqrt(fromEdgeX * fromEdgeX + fromEdgeY * fromEdgeY);

      if (dist > radius || dist < 15) continue;

      // Normalized directions
      const radialX = fromEdgeX / dist;
      const radialY = fromEdgeY / dist;
      const tangentX = -radialY;
      const tangentY = radialX;

      const normalizedDist = dist / radius;

      // Orbital: strongest at middle distances
      const orbitalFalloff = Math.sin(normalizedDist * Math.PI);
      const orbitalAmount = orbitalFalloff * well.strength * orbitalStrength;

      // Pull: only at outer edges, zero near center
      const pullFalloff = Math.pow(normalizedDist, 0.5) * (1 - normalizedDist);
      const pullAmount = pullFalloff * well.strength * pullStrength;

      dx += tangentX * orbitalAmount - radialX * pullAmount;
      dy += tangentY * orbitalAmount - radialY * pullAmount;

      brightness = Math.max(brightness, pullFalloff * well.strength * 0.6);
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
}

export function MatrixRain({
  gravityWells = [],
  enableGravity = true,
  gravityConfig = {},
  debug = false,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowDimensions();
  const gravityWellsRef = useRef(gravityWells);
  const enableGravityRef = useRef(enableGravity);

  // Merge custom config with defaults
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

    const cellSize = 18;
    const numCols = Math.ceil(width / cellSize);
    const numRows = Math.ceil(height / cellSize);

    const totalDistance = numRows + CONFIG.trailLength;
    const rowsPerSecond = totalDistance / CONFIG.secondsToTraverseScreen;

    // Create gravity calculator
    const getGravityOffset = createGravityCalculator(config);

    // ===================
    // Particles
    // ===================
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

    // ===================
    // Drawing
    // ===================
    function drawChar(x: number, y: number, char: string, size: number, brightness: number) {
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

    // ===================
    // Debug Drawing
    // ===================
    function drawDebug(wells: GravityWell[]) {
      for (const well of wells) {
        const edgeX = well.x;
        const centerY = well.y + well.height / 2;

        // Gravity point
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(edgeX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();

        // Radius arc
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(edgeX, centerY, config.radius, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();

        // Well bounds
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(well.x, well.y, well.width, well.height);
      }
    }

    // ===================
    // Animation
    // ===================
    let animationId: number;
    let lastTime = performance.now();

    const tick = () => {
      animationId = requestAnimationFrame(tick);

      const now = performance.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      // Clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const wells = gravityWellsRef.current;
      const gravityEnabled = enableGravityRef.current;

      // Update and draw particles
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

          // Apply gravity effect if enabled
          if (gravityEnabled && wells.length > 0) {
            const gravity = getGravityOffset(baseX, baseY, wells);

            p.offsets[t].x += (gravity.dx - p.offsets[t].x) * config.smoothing;
            p.offsets[t].y += (gravity.dy - p.offsets[t].y) * config.smoothing;

            brightness = clamp(brightness + gravity.brightness, 0, 1);
          } else {
            // Decay offsets when gravity is disabled
            p.offsets[t].x *= 0.95;
            p.offsets[t].y *= 0.95;
          }

          drawChar(baseX + p.offsets[t].x, baseY + p.offsets[t].y, p.chars[t], cellSize, brightness);
        }
      }

      ctx.shadowBlur = 0;

      // Debug visualization
      if (debug && wells.length > 0) {
        drawDebug(wells);
      }
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);

  }, [width, height, config.radius, config.orbitalStrength, config.pullStrength, config.maxOffset, config.smoothing, debug]);

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

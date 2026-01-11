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

  // 3D Warp mode
  warp: {
    fov: 500,
    zSpeed: 10,
  },
};

// =============================================================================
// Helpers
// =============================================================================

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!%";
const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// =============================================================================
// Component
// =============================================================================

interface CardBounds {
  x: number;        // Left edge screen position
  y: number;        // Top edge screen position
  width: number;
  height: number;
  strength: number; // 0-1, how strong the gravitational effect
  velocityX: number; // Horizontal velocity (pixels per frame)
  velocityY: number; // Vertical velocity (pixels per frame)
}

interface MatrixRainProps {
  warpIntensity?: number;
  cardBounds?: CardBounds[]; // Cards that bend the matrix around them
}

export function MatrixRain({ warpIntensity = 0, cardBounds = [] }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowDimensions();
  const warpIntensityRef = useRef(warpIntensity);
  const cardBoundsRef = useRef(cardBounds);

  useEffect(() => {
    warpIntensityRef.current = warpIntensity;
  }, [warpIntensity]);

  useEffect(() => {
    cardBoundsRef.current = cardBounds;
  }, [cardBounds]);

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

    // Rain speed calculation
    const totalDistance = numRows + CONFIG.trailLength;
    const rowsPerSecond = totalDistance / CONFIG.secondsToTraverseScreen;

    // Radial zoom burst config
    const BURST_RADIUS = 500; // Large radius for the zoom effect
    const BURST_STRENGTH = 50; // How far characters get pushed
    const MAX_OFFSET = 80; // Maximum displacement

    // ===================
    // Particles - one per column for rain
    // ===================
    interface Particle {
      col: number;
      y: number;
      speed: number;
      lastTickRow: number;
      chars: string[];
      offsets: { x: number; y: number }[]; // Per-character offsets
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

    // Calculate radial zoom burst effect - characters stream OUTWARD from gravity center
    function getGravityOffset(x: number, y: number): { dx: number; dy: number; brightness: number } {
      let dx = 0;
      let dy = 0;
      let brightness = 0;

      for (const card of cardBoundsRef.current) {
        if (card.strength < 0.01) continue;

        // Gravity center is at card position (left or right side of screen)
        const centerX = card.x + card.width / 2;
        const centerY = card.y + card.height / 2;

        // Vector FROM center TO character (for outward push)
        const distX = x - centerX;
        const distY = y - centerY;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist > BURST_RADIUS || dist < 20) continue;

        // Radial direction (normalized) - pointing outward from center
        const radialX = distX / dist;
        const radialY = distY / dist;

        // Zoom burst: push characters OUTWARD along radial line
        // Effect is stronger further from center (perspective zoom)
        const normalizedDist = dist / BURST_RADIUS;

        // Quadratic falloff from edges, peaks in middle distance
        const distanceFactor = normalizedDist * (1 - normalizedDist * 0.5);
        const pushStrength = distanceFactor * card.strength * BURST_STRENGTH;

        dx += radialX * pushStrength;
        dy += radialY * pushStrength;

        // Brightness boost - brighter near center (the "light source")
        const brightnessFalloff = Math.pow(1 - normalizedDist, 2);
        brightness = Math.max(brightness, brightnessFalloff * card.strength * 0.6);
      }

      // Clamp offset
      const offsetDist = Math.sqrt(dx * dx + dy * dy);
      if (offsetDist > MAX_OFFSET) {
        dx = (dx / offsetDist) * MAX_OFFSET;
        dy = (dy / offsetDist) * MAX_OFFSET;
      }

      return { dx, dy, brightness };
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

      // Update and draw particles
      for (const p of particles) {
        // Update position - always falling down
        p.y += rowsPerSecond * deltaSeconds * p.speed;

        // Character tick
        const tickRow = Math.floor(p.y / CONFIG.rowsPerTick);
        if (tickRow !== p.lastTickRow) {
          p.lastTickRow = tickRow;
          for (let j = 0; j < CONFIG.trailLength; j++) {
            p.chars[j] = randomChar();
          }
        }

        // Reset when past bottom
        if (p.y > numRows + CONFIG.trailLength) {
          p.y = -CONFIG.trailLength;
          p.speed = 1 + (Math.random() - 0.5) * 2 * CONFIG.speedEntropy;
        }

        const headRow = Math.floor(p.y);
        const baseX = p.col * cellSize + cellSize / 2;

        // Draw trail with gravity effect
        for (let t = CONFIG.trailLength - 1; t >= 0; t--) {
          const row = headRow - t;
          if (row < 0 || row >= numRows) continue;

          const baseY = row * cellSize + cellSize / 2;
          let brightness = 1 - t / CONFIG.trailLength;

          // Apply gravity - calculate offset based on current position
          const gravity = getGravityOffset(baseX, baseY);

          // Smoothly interpolate offset
          const targetX = gravity.dx;
          const targetY = gravity.dy;
          p.offsets[t].x += (targetX - p.offsets[t].x) * 0.15;
          p.offsets[t].y += (targetY - p.offsets[t].y) * 0.15;

          // Apply brightness boost near gravity well
          brightness = clamp(brightness + gravity.brightness, 0, 1);

          // Draw at offset position
          drawChar(baseX + p.offsets[t].x, baseY + p.offsets[t].y, p.chars[t], cellSize, brightness);
        }
      }

      ctx.shadowBlur = 0;
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);

  }, [width, height]);

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

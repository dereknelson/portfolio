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
    const centerX = width / 2;
    const centerY = height / 2;

    // Rain speed calculation
    const totalDistance = numRows + CONFIG.trailLength;
    const rowsPerSecond = totalDistance / CONFIG.secondsToTraverseScreen;

    // ===================
    // Particles - one per column for rain
    // ===================
    interface Particle {
      col: number;
      y: number;           // Row position (fractional)
      speed: number;
      lastTickRow: number;
      chars: string[];
    }

    const particles: Particle[] = [];
    for (let col = 0; col < numCols; col++) {
      particles.push({
        col,
        y: Math.random() * (numRows + CONFIG.trailLength),
        speed: 1 + (Math.random() - 0.5) * 2 * CONFIG.speedEntropy,
        lastTickRow: 0,
        chars: Array.from({ length: CONFIG.trailLength }, () => randomChar()),
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

    // Project for warp effect - transforms rain position toward center
    function getWarpOffset(x: number, y: number, intensity: number) {
      const dx = x - centerX;
      const dy = y - centerY;
      const pushStrength = intensity * 0.5;

      return {
        x: x + dx * pushStrength,
        y: y + dy * pushStrength,
        scale: 1 + intensity * 0.5,
      };
    }

    // Apply gravitational effect around card bounds
    // Streams near the card are pulled toward its edges (no centering)
    function applyCardGravity(
      x: number,
      y: number
    ): { x: number; y: number; brightness: number } {
      let finalX = x;
      let finalY = y;
      let brightnessBoost = 0;

      for (const card of cardBoundsRef.current) {
        if (card.strength < 0.01) continue;

        const cardLeft = card.x;
        const cardRight = card.x + card.width;
        const cardTop = card.y;
        const cardBottom = card.y + card.height;

        // Large influence zone around the card (scales with strength)
        const influenceRange = 200 + 300 * card.strength;

        // Is the point near the card at all?
        const nearLeft = x > cardLeft - influenceRange && x < cardLeft;
        const nearRight = x > cardRight && x < cardRight + influenceRange;
        const nearTop = y > cardTop - influenceRange && y < cardTop;
        const nearBottom = y > cardBottom && y < cardBottom + influenceRange;
        const withinHorizontal = x >= cardLeft && x <= cardRight;
        const withinVertical = y >= cardTop && y <= cardBottom;

        let pullX = 0;
        let pullY = 0;
        let effect = 0;

        // Streams to the LEFT of card - pull right toward card
        if (nearLeft && (withinVertical || nearTop || nearBottom)) {
          const dist = cardLeft - x;
          const falloff = 1 - dist / influenceRange;
          effect = Math.max(effect, falloff);
          pullX += falloff * falloff * 100 * card.strength;
        }

        // Streams to the RIGHT of card - pull left toward card
        if (nearRight && (withinVertical || nearTop || nearBottom)) {
          const dist = x - cardRight;
          const falloff = 1 - dist / influenceRange;
          effect = Math.max(effect, falloff);
          pullX -= falloff * falloff * 100 * card.strength;
        }

        // Streams ABOVE card - pull down toward card
        if (nearTop && withinHorizontal) {
          const dist = cardTop - y;
          const falloff = 1 - dist / influenceRange;
          effect = Math.max(effect, falloff);
          pullY += falloff * falloff * 60 * card.strength;
        }

        // Streams BELOW card - pull up toward card
        if (nearBottom && withinHorizontal) {
          const dist = y - cardBottom;
          const falloff = 1 - dist / influenceRange;
          effect = Math.max(effect, falloff);
          pullY -= falloff * falloff * 60 * card.strength;
        }

        finalX += pullX;
        finalY += pullY;
        brightnessBoost = Math.max(brightnessBoost, effect * card.strength * 0.5);
      }

      return { x: finalX, y: finalY, brightness: brightnessBoost };
    }

    // ===================
    // Animation
    // ===================
    let animationId: number;
    let lastTime = performance.now();
    let currentWarpIntensity = 0;
    let elapsedTime = 0;

    const tick = () => {
      animationId = requestAnimationFrame(tick);

      const now = performance.now();
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;
      elapsedTime += deltaSeconds;

      // Smooth warp intensity transition
      const targetWarp = warpIntensityRef.current;
      currentWarpIntensity = lerp(currentWarpIntensity, targetWarp, 0.05);

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

        // Draw trail
        for (let t = CONFIG.trailLength - 1; t >= 0; t--) {
          const row = headRow - t;
          if (row < 0 || row >= numRows) continue;

          const baseY = row * cellSize + cellSize / 2;
          let brightness = 1 - t / CONFIG.trailLength;

          // Apply gravitational effect around card bounds
          const gravity = applyCardGravity(baseX, baseY);
          brightness = clamp(brightness + gravity.brightness, 0, 1);

          drawChar(gravity.x, gravity.y, p.chars[t], cellSize, brightness);
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

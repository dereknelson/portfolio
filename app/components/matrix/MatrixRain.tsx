import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { Particle, SceneDirector, GravityWell, GravityConfig } from "./types";
import { randomChar, clamp } from "./helpers";
import { effects } from "./effects";
import { createGravityCalculator, DEFAULT_GRAVITY_CONFIG } from "./gravity";
import { drawChar } from "./drawing";

const TRAIL_LENGTH = 20;
const OPACITY = 0.5;
const CHAR_TICK_RATE = 1.5;
const FADE_START = 0.2;
const FADE_DUR = 1.2;

const defaultScene: SceneDirector = () => effects.rain;

interface MatrixRainProps {
  gravityWellsRef?: React.RefObject<GravityWell[]>;
  enableGravity?: boolean;
  gravityConfig?: Partial<GravityConfig>;
  debug?: boolean;
  scene?: SceneDirector;
  scrollYRef?: React.RefObject<number>;
}

export function MatrixRain({
  gravityWellsRef: externalGravityRef,
  enableGravity = true,
  gravityConfig = {},
  debug = false,
  scene,
  scrollYRef: externalScrollRef,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowDimensions();

  const internalGravityRef = useRef<GravityWell[]>([]);
  const gravityRef = externalGravityRef ?? internalGravityRef;
  const enableGravityRef = useRef(enableGravity);
  enableGravityRef.current = enableGravity;
  const sceneRef = useRef(scene ?? defaultScene);
  sceneRef.current = scene ?? defaultScene;
  const internalScrollRef = useRef(0);
  const scrollRef = externalScrollRef ?? internalScrollRef;
  const configRef = useRef({ ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig });
  configRef.current = { ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig };

  useEffect(() => {
    if (Platform.OS !== "web" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

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
        col: i < numCols * 3 ? i % numCols : -1,
        speed: 0.7 + Math.random() * 0.6,
        phase: Math.random(),
      });
      charBuffers.push(Array.from({ length: TRAIL_LENGTH }, () => randomChar()));
      gravOffsets.push(Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 })));
    }

    let animId: number;
    let lastTime = performance.now();
    const startTime = lastTime;
    const getGravityOffset = createGravityCalculator(configRef.current);

    const loop = () => {
      animId = requestAnimationFrame(loop);

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.1) return;

      const elapsed = (now - startTime) / 1000;

      // Canvas-driven fade — no React re-renders
      const fade = clamp((elapsed - FADE_START) / FADE_DUR, 0, 1);
      if (fade <= 0) return;

      ctx.globalAlpha = fade * OPACITY;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const currentEffect = sceneRef.current(scrollRef.current, elapsed, width, height);
      const wells = gravityRef.current;
      const gravEnabled = enableGravityRef.current;
      const smoothing = configRef.current.smoothing;

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

        // Draw trail segments (tail first, head last)
        for (let t = TRAIL_LENGTH - 1; t >= 0; t--) {
          const sx = frame.x + frame.trailDx * t;
          const sy = frame.y + frame.trailDy * t;
          if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) continue;

          const sSize = Math.max(4, frame.size + frame.trailSizeDelta * t);
          let sBright = frame.brightness * (1 - t / TRAIL_LENGTH);
          let drawX = sx, drawY = sy;

          if (gravEnabled && wells.length > 0) {
            const grav = getGravityOffset(sx, sy, wells);
            sBright = clamp(sBright + grav.brightness, 0, 1);
          }

          drawChar(ctx, drawX, drawY, charBuffers[i][t], sSize, sBright);
        }
      }

      ctx.globalAlpha = 1;
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
    <View style={styles.container} pointerEvents="none">
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

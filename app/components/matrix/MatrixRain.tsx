import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { SceneDirector, GravityWell, GravityConfig } from "./types";
import { effects } from "./effects";
import { createGravityCalculator, DEFAULT_GRAVITY_CONFIG } from "./gravity";
import { drawCharGreen } from "./drawing";
import { createAtlasDrawFn } from "./atlas";
import { runLoop, DEFAULT_LOOP_CONFIG, LoopConfig } from "./loop";
import { clamp } from "./helpers";
import {
  createParticlePool,
  renderParticles,
  DEFAULT_PARTICLE_CONFIG,
  ParticleConfig,
  DrawFn,
} from "./particles";

const defaultScene: SceneDirector = () => effects.tunnel;

interface MatrixRainProps {
  gravityWellsRef?: React.RefObject<GravityWell[]>;
  enableGravity?: boolean;
  gravityConfig?: Partial<GravityConfig>;
  loopConfig?: Partial<LoopConfig>;
  particleConfig?: Partial<ParticleConfig>;
  drawFn?: DrawFn;
  debug?: boolean;
  scene?: SceneDirector;
  scrollYRef?: React.RefObject<number>;
}

export function MatrixRain({
  gravityWellsRef: externalGravityRef,
  enableGravity = true,
  gravityConfig = {},
  loopConfig = {},
  particleConfig = {},
  drawFn = drawCharGreen,
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
  const gravConfigRef = useRef({ ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig });
  gravConfigRef.current = { ...DEFAULT_GRAVITY_CONFIG, ...gravityConfig };
  const drawFnRef = useRef(drawFn);
  drawFnRef.current = drawFn;
  const debugRef = useRef(debug);
  debugRef.current = debug;
  const tiltRef = useRef({ x: 0, y: 0 });

  // Gyroscope parallax — shift tunnel center based on device tilt
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const PARALLAX_RANGE = 80; // max px offset
    const SMOOTHING = 0.1;
    let baseGamma: number | null = null;
    let baseBeta: number | null = null;

    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // Capture initial orientation as "center"
      if (baseGamma === null) { baseGamma = e.gamma; baseBeta = e.beta; }
      const dx = clamp((e.gamma - baseGamma!) / 30, -1, 1) * PARALLAX_RANGE;
      const dy = clamp((e.beta - baseBeta!) / 30, -1, 1) * PARALLAX_RANGE;
      // Smooth
      tiltRef.current.x += (dx - tiltRef.current.x) * SMOOTHING;
      tiltRef.current.y += (dy - tiltRef.current.y) * SMOOTHING;
    };

    // iOS 13+ requires permission
    const doe = DeviceOrientationEvent as any;
    if (typeof doe.requestPermission === "function") {
      doe.requestPermission().then((r: string) => {
        if (r === "granted") window.addEventListener("deviceorientation", handler);
      }).catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handler);
    }

    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || !canvasRef.current) return;
    const canvas = canvasRef.current;

    // Detect mobile: reduce workload to save battery
    const isMobile = width < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    // Main thread rendering with atlas (1.8ms/tick — well within 16ms budget)
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const pConfig = {
      ...DEFAULT_PARTICLE_CONFIG,
      ...particleConfig,
      ...(isMobile && { trailLength: 12 }),
    };
    const lConfig = {
      ...DEFAULT_LOOP_CONFIG,
      ...loopConfig,
      ...(isMobile && { adaptiveFps: true }), // drop to 30fps if device is struggling
    };
    const numCols = Math.ceil(width / pConfig.cellSize);
    const numParticles = isMobile
      ? Math.max(numCols * 4, 200)
      : Math.max(numCols * 6, 300);
    const pool = createParticlePool(numCols, numParticles, pConfig);
    const getGravityOffset = createGravityCalculator(gravConfigRef.current);
    const atlasDraw = createAtlasDrawFn(drawFnRef.current);

    return runLoop(ctx, width, height, lConfig, ({ elapsed }) => {
      const baseEffect = sceneRef.current(scrollRef.current, elapsed, width, height);
      const tx = tiltRef.current.x;
      const ty = tiltRef.current.y;

      // Apply parallax: shift all particle positions by tilt offset
      const effect = (tx === 0 && ty === 0) ? baseEffect : (
        (p: any, time: number, w: number, h: number) => {
          const f = baseEffect(p, time, w, h);
          return { ...f, x: f.x + tx, y: f.y + ty };
        }
      );

      const wells = gravityRef.current;
      const gravState = enableGravityRef.current && wells.length > 0
        ? { wells, getOffset: getGravityOffset }
        : null;

      renderParticles(ctx, pool, pConfig, effect, elapsed, width, height, atlasDraw, gravState);

      if (debugRef.current && wells.length > 0) {
        for (const well of wells) {
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.strokeRect(well.x, well.y, well.width, well.height);
        }
      }
    });
  }, [width, height]);

  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <canvas
        ref={canvasRef as any}
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          willChange: "transform",
        }}
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

import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";

// Characters ordered by visual density (sparse → dense)
const CHARS = " .:-=+*#%@";

interface AsciiSphereProps {
  size?: number;
}

export function AsciiSphere({ size = 360 }: AsciiSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const charSize = 10;
    const cols = Math.floor(size / (charSize * 0.6));
    const rows = Math.floor(size / charSize);
    const sphereRadius = Math.min(cols, rows) * 0.42;

    // Buffers
    const zBuffer = new Float64Array(cols * rows);
    const output = new Array(cols * rows);
    const brightness = new Float64Array(cols * rows);

    let animId: number;
    const startTime = performance.now();

    const loop = () => {
      animId = requestAnimationFrame(loop);

      const elapsed = (performance.now() - startTime) / 1000;

      // Rotation angles
      const rotY = elapsed * 0.6;
      const rotX = elapsed * 0.25;
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // Clear buffers
      zBuffer.fill(-Infinity);
      output.fill(" ");
      brightness.fill(0);

      // Light direction (normalized)
      const lx = 0, ly = -0.5, lz = -1;
      const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
      const nlx = lx / lLen, nly = ly / lLen, nlz = lz / lLen;

      // Sample sphere surface
      const thetaSteps = 120;
      const phiSteps = 60;

      for (let t = 0; t < thetaSteps; t++) {
        const theta = (t / thetaSteps) * Math.PI * 2;
        const cosT = Math.cos(theta), sinT = Math.sin(theta);

        for (let p = 0; p < phiSteps; p++) {
          const phi = (p / phiSteps) * Math.PI;
          const cosP = Math.cos(phi), sinP = Math.sin(phi);

          // Sphere point (unit sphere)
          const sx = sinP * cosT;
          const sy = cosP;
          const sz = sinP * sinT;

          // Rotate around Y axis
          const rx1 = sx * cosY + sz * sinY;
          const ry1 = sy;
          const rz1 = -sx * sinY + sz * cosY;

          // Rotate around X axis
          const rx = rx1;
          const ry = ry1 * cosX - rz1 * sinX;
          const rz = ry1 * sinX + rz1 * cosX;

          // Normal is same as point for unit sphere
          const nx = rx, ny = ry, nz = rz;

          // Only render front-facing
          if (nz > 0.05) continue;

          // Project to screen
          const screenX = Math.floor(cols / 2 + rx * sphereRadius);
          const screenY = Math.floor(rows / 2 + ry * sphereRadius * 0.5);

          if (screenX < 0 || screenX >= cols || screenY < 0 || screenY >= rows) continue;

          const idx = screenY * cols + screenX;

          // Z-buffer test
          if (rz > zBuffer[idx]) continue;
          zBuffer[idx] = rz;

          // Lighting: dot product of normal with light direction
          const dot = -(nx * nlx + ny * nly + nz * nlz);
          const lum = Math.max(0, dot);

          // Map luminance to character
          const charIdx = Math.floor(lum * (CHARS.length - 1));
          output[idx] = CHARS[Math.min(charIdx, CHARS.length - 1)];
          brightness[idx] = lum;
        }
      }

      // Render to canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.clearRect(0, 0, size, size);
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.font = `bold ${charSize}px monospace`;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          const char = output[idx];
          if (char === " ") continue;

          const b = brightness[idx];
          const px = x * charSize * 0.6;
          const py = y * charSize;

          if (b > 0.7) {
            ctx.shadowColor = "rgb(96, 165, 250)";
            ctx.shadowBlur = 6;
            ctx.fillStyle = `rgba(200, 220, 255, ${0.6 + b * 0.4})`;
          } else if (b > 0.4) {
            ctx.shadowColor = "rgb(96, 165, 250)";
            ctx.shadowBlur = 3;
            ctx.fillStyle = `rgba(96, 165, 250, ${0.5 + b * 0.5})`;
          } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + b * 0.5})`;
          }

          ctx.fillText(char, px, py);
        }
      }
      ctx.shadowBlur = 0;
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [size]);

  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.container}>
      <canvas
        ref={canvasRef as any}
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AsciiSphere;

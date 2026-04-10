import { clamp } from "./helpers";

export function drawChar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, char: string, size: number, brightness: number,
) {
  if (brightness <= 0.02 || size < 4) return;
  const alpha = clamp(brightness, 0, 1);

  if (brightness > 0.9) {
    ctx.fillStyle = `rgba(220, 255, 220, ${alpha})`;
  } else if (brightness > 0.6) {
    ctx.fillStyle = `rgba(100, 220, 100, ${alpha})`;
  } else if (brightness > 0.3) {
    ctx.fillStyle = `rgba(${Math.floor(20 + brightness * 40)}, ${Math.floor(80 + brightness * 140)}, ${Math.floor(20 + brightness * 40)}, ${alpha})`;
  } else {
    ctx.fillStyle = `rgba(${Math.floor(10 + brightness * 30)}, ${Math.floor(40 + brightness * 100)}, ${Math.floor(10 + brightness * 30)}, ${alpha})`;
  }

  ctx.font = `bold ${Math.round(size)}px monospace`;
  ctx.fillText(char, x, y);
}

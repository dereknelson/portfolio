import { clamp } from "./helpers";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  char: string, size: number, brightness: number,
) => void;

function setupChar(ctx: CanvasRenderingContext2D, size: number, brightness: number): number | null {
  if (brightness <= 0.02 || size < 4) return null;
  ctx.font = `bold ${Math.round(size)}px monospace`;
  return clamp(brightness, 0, 1);
}

export const drawCharGreen: DrawFn = (ctx, x, y, char, size, brightness) => {
  const alpha = setupChar(ctx, size, brightness);
  if (alpha === null) return;

  if (brightness > 0.9) {
    ctx.fillStyle = `rgba(220, 255, 220, ${alpha})`;
  } else if (brightness > 0.6) {
    ctx.fillStyle = `rgba(100, 220, 100, ${alpha})`;
  } else if (brightness > 0.3) {
    ctx.fillStyle = `rgba(${Math.floor(20 + brightness * 40)}, ${Math.floor(80 + brightness * 140)}, ${Math.floor(20 + brightness * 40)}, ${alpha})`;
  } else {
    ctx.fillStyle = `rgba(${Math.floor(10 + brightness * 30)}, ${Math.floor(40 + brightness * 100)}, ${Math.floor(10 + brightness * 30)}, ${alpha})`;
  }
  ctx.fillText(char, x, y);
};

export const drawCharAmber: DrawFn = (ctx, x, y, char, size, brightness) => {
  const alpha = setupChar(ctx, size, brightness);
  if (alpha === null) return;

  if (brightness > 0.9) {
    ctx.fillStyle = `rgba(255, 240, 200, ${alpha})`;
  } else if (brightness > 0.6) {
    ctx.fillStyle = `rgba(245, 180, 60, ${alpha})`;
  } else if (brightness > 0.3) {
    ctx.fillStyle = `rgba(${Math.floor(120 + brightness * 100)}, ${Math.floor(60 + brightness * 100)}, ${Math.floor(10 + brightness * 20)}, ${alpha})`;
  } else {
    ctx.fillStyle = `rgba(${Math.floor(80 + brightness * 80)}, ${Math.floor(30 + brightness * 60)}, ${Math.floor(5 + brightness * 15)}, ${alpha})`;
  }
  ctx.fillText(char, x, y);
};

export const drawCharBlue: DrawFn = (ctx, x, y, char, size, brightness) => {
  const alpha = setupChar(ctx, size, brightness);
  if (alpha === null) return;

  if (brightness > 0.9) {
    ctx.fillStyle = `rgba(220, 235, 255, ${alpha})`;
  } else if (brightness > 0.6) {
    ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
  } else if (brightness > 0.3) {
    ctx.fillStyle = `rgba(${Math.floor(30 + brightness * 66)}, ${Math.floor(80 + brightness * 85)}, ${Math.floor(150 + brightness * 100)}, ${alpha})`;
  } else {
    ctx.fillStyle = `rgba(${Math.floor(20 + brightness * 50)}, ${Math.floor(40 + brightness * 80)}, ${Math.floor(100 + brightness * 100)}, ${alpha})`;
  }
  ctx.fillText(char, x, y);
};

// Default export for backward compat
export const drawChar = drawCharGreen;

import { CHARSET, clamp } from "./helpers";
import type { DrawFn } from "./particles";

const SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
const BRIGHT_LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const CELL = 28;

const NUM_CHARS = CHARSET.length;
const NUM_SIZES = SIZES.length;
const NUM_BRIGHTS = BRIGHT_LEVELS.length;
const TOTAL = NUM_CHARS * NUM_SIZES * NUM_BRIGHTS;
const COLS = Math.ceil(Math.sqrt(TOTAL));

/**
 * Pre-renders every char/size/brightness combo into a single bitmap atlas.
 * Returns a DrawFn that uses ctx.drawImage (5-10x faster than fillText).
 */
export function createAtlasDrawFn(sourceDraw: DrawFn): DrawFn {
  const atlasW = COLS * CELL;
  const atlasH = Math.ceil(TOTAL / COLS) * CELL;

  const atlas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(atlasW, atlasH)
      : (() => {
          const c = document.createElement("canvas");
          c.width = atlasW;
          c.height = atlasH;
          return c;
        })();

  const actx = (atlas as HTMLCanvasElement).getContext("2d", {
    alpha: true,
  }) as CanvasRenderingContext2D;
  actx.textBaseline = "middle";
  actx.textAlign = "center";
  actx.globalAlpha = 1;

  // Char → index lookup
  const charIdx: Record<string, number> = {};
  for (let i = 0; i < NUM_CHARS; i++) charIdx[CHARSET[i]] = i;

  // Atlas positions (flat Uint16Arrays for cache-friendly access)
  const ax = new Uint16Array(TOTAL);
  const ay = new Uint16Array(TOTAL);

  // Pre-render every combo
  let idx = 0;
  for (let ci = 0; ci < NUM_CHARS; ci++) {
    for (let si = 0; si < NUM_SIZES; si++) {
      for (let bi = 0; bi < NUM_BRIGHTS; bi++) {
        const col = idx % COLS;
        const row = (idx / COLS) | 0;
        ax[idx] = col * CELL;
        ay[idx] = row * CELL;
        sourceDraw(
          actx,
          col * CELL + CELL / 2,
          row * CELL + CELL / 2,
          CHARSET[ci],
          SIZES[si],
          BRIGHT_LEVELS[bi],
        );
        idx++;
      }
    }
  }

  // Fast blit — no fillText, no font changes, no color string building
  return (ctx, x, y, char, size, brightness) => {
    if (brightness <= 0.02 || size < 4) return;

    const ci = charIdx[char];
    if (ci === undefined) return;

    const si = Math.min(
      NUM_SIZES - 1,
      Math.max(0, Math.round((clamp(size, 4, 24) - 4) / 2)),
    );
    const bi = Math.min(
      NUM_BRIGHTS - 1,
      Math.max(0, Math.round(clamp(brightness, 0.1, 1.0) * 10) - 1),
    );

    const i = ci * (NUM_SIZES * NUM_BRIGHTS) + si * NUM_BRIGHTS + bi;

    ctx.drawImage(
      atlas as CanvasImageSource,
      ax[i],
      ay[i],
      CELL,
      CELL,
      (x - CELL / 2) | 0,
      (y - CELL / 2) | 0,
      CELL,
      CELL,
    );
  };
}

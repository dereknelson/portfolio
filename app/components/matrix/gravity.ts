import { GravityWell, GravityConfig } from "./types";
import { clamp } from "./helpers";

export const DEFAULT_GRAVITY_CONFIG: GravityConfig = {
  radius: 120,
  pullStrength: 15,
  surfaceFlowStrength: 8,
  maxOffset: 30,
  smoothing: 0.12,
};

function nearestPointOnRect(
  px: number, py: number,
  rx: number, ry: number, rw: number, rh: number,
) {
  return { nx: clamp(px, rx, rx + rw), ny: clamp(py, ry, ry + rh) };
}

export function createGravityCalculator(config: GravityConfig) {
  const { radius, pullStrength, surfaceFlowStrength, maxOffset } = config;

  return function getGravityOffset(
    x: number, y: number, wells: GravityWell[],
  ): { dx: number; dy: number; brightness: number } {
    let dx = 0, dy = 0, brightness = 0;

    for (const well of wells) {
      if (well.strength < 0.01) continue;

      const { nx, ny } = nearestPointOnRect(x, y, well.x, well.y, well.width, well.height);
      const toSurfX = nx - x, toSurfY = ny - y;
      const dist = Math.sqrt(toSurfX * toSurfX + toSurfY * toSurfY);

      if (dist < 1) {
        dy += surfaceFlowStrength * well.strength * 0.5;
        brightness = Math.max(brightness, 0.7 * well.strength);
        continue;
      }
      if (dist > radius) continue;

      const dirX = toSurfX / dist, dirY = toSurfY / dist;
      const proximity = 1 - dist / radius;
      const pull = proximity * proximity * proximity * well.strength * pullStrength;

      dx += dirX * pull;
      dy += dirY * pull;

      if (proximity > 0.4) {
        const flow = (proximity - 0.4) / 0.6;
        dy += flow * flow * surfaceFlowStrength * well.strength;
      }

      // Glow: particles brighten as they approach card surfaces
      brightness = Math.max(brightness, proximity * proximity * 0.3 * well.strength);
    }

    const offsetDist = Math.sqrt(dx * dx + dy * dy);
    if (offsetDist > maxOffset) {
      dx = (dx / offsetDist) * maxOffset;
      dy = (dy / offsetDist) * maxOffset;
    }
    return { dx, dy, brightness };
  };
}

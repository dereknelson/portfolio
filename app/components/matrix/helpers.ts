export const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!%";
export const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easings = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  smoothstep: (t: number) => t * t * (3 - 2 * t),
};

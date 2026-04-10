/** Immutable identity of a particle — assigned once at creation. */
export interface Particle {
  index: number;
  angle: number;
  col: number;
  speed: number;
  phase: number;
}

/** Output of an Effect for one particle at one instant. */
export interface ParticleFrame {
  x: number;
  y: number;
  size: number;
  brightness: number;
  trailDx: number;
  trailDy: number;
  trailSizeDelta: number;
}

export type Effect = (p: Particle, time: number, w: number, h: number) => ParticleFrame;

export type SceneDirector = (
  scrollY: number,
  time: number,
  w: number,
  h: number,
) => Effect;

export interface GravityWell {
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
}

export interface GravityConfig {
  radius: number;
  pullStrength: number;
  surfaceFlowStrength: number;
  maxOffset: number;
  smoothing: number;
}

export const ZERO_FRAME: ParticleFrame = {
  x: -200, y: -200, size: 0, brightness: 0,
  trailDx: 0, trailDy: 0, trailSizeDelta: 0,
};

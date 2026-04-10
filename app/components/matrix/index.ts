export { MatrixRain } from "./MatrixRain";
export { effects, blend, transform } from "./effects";
export { easings } from "./helpers";
export { createGravityCalculator, DEFAULT_GRAVITY_CONFIG } from "./gravity";
export { runLoop, DEFAULT_LOOP_CONFIG } from "./loop";
export { createParticlePool, renderParticles, DEFAULT_PARTICLE_CONFIG } from "./particles";
export { drawChar, drawCharGreen, drawCharAmber, drawCharBlue } from "./drawing";
export { createAtlasDrawFn } from "./atlas";
export type {
  Particle,
  ParticleFrame,
  Effect,
  SceneDirector,
  GravityWell,
  GravityConfig,
} from "./types";
export type { LoopConfig, LoopState } from "./loop";
export type { ParticleConfig, ParticlePool, DrawFn } from "./particles";

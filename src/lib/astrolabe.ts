export const RING_COUNT = 10;

export type RingDef = {
  incl: number;
  node: number;
  radius: number;
  speed: number;
};

export const RINGS: RingDef[] = [
  { incl: 0.34, node: 0.0, radius: 1.62, speed: 0.16 },
  { incl: -0.52, node: 0.63, radius: 1.79, speed: -0.13 },
  { incl: 0.92, node: 1.26, radius: 1.96, speed: 0.19 },
  { incl: -0.22, node: 1.89, radius: 2.13, speed: -0.15 },
  { incl: 0.58, node: 2.52, radius: 2.3, speed: 0.12 },
  { incl: 1.18, node: 3.15, radius: 2.47, speed: -0.18 },
  { incl: -0.78, node: 3.78, radius: 2.64, speed: 0.14 },
  { incl: 0.16, node: 4.41, radius: 2.81, speed: -0.11 },
  { incl: -1.06, node: 5.04, radius: 2.98, speed: 0.17 },
  { incl: 0.72, node: 5.67, radius: 3.15, speed: -0.14 },
];

export const EXPLODE_GAP = 0.34;
export const EXPLODE_RADIAL = 0.4;
export const EXPLODE_FLATTEN = 0.55;

export type Quality = "high" | "medium" | "low";

export const QUALITY_PARTICLES: Record<Quality, number> = {
  high: 24000,
  medium: 12000,
  low: 6000,
};

export const sceneState = {
  openTarget: 0,
  open: 0,
  focusTarget: -1,
  focus: -1,
  focusStrength: 0,
  pointerNdc: { x: 0, y: 0 },
  pointerWorld: { x: 0, y: 0, z: 0 },
  rotY: 0,
  rotX: 0,
  dragVelY: 0,
  dragVelX: 0,
  dragging: false,
  scatterStart: -1e9,
  ready: false,
  reducedMotion: false,
};

export function pulseScatter() {
  sceneState.scatterStart = performance.now();
}

type FocusListener = () => void;
const focusListeners = new Set<FocusListener>();

export function setSceneFocus(index: number) {
  if (sceneState.focusTarget === index) return;
  sceneState.focusTarget = index;
  focusListeners.forEach((l) => l());
}

export function subscribeFocus(listener: FocusListener) {
  focusListeners.add(listener);
  return () => {
    focusListeners.delete(listener);
  };
}

export function getFocusSnapshot() {
  return sceneState.focusTarget;
}

export function scatterEnvelope(now: number) {
  const t = (now - sceneState.scatterStart) / 900;
  if (t < 0 || t > 1) return 0;
  return Math.sin(t * Math.PI);
}

export function detectQuality(): Quality {
  if (typeof navigator === "undefined") return "medium";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const coarse =
    typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  if (coarse || cores <= 4 || mem <= 3) return "low";
  if (cores <= 8 || mem <= 4) return "medium";
  return "high";
}

export function webglAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

export type SceneParams = {
  speed: number;
  density: 0 | 1 | 2;
  glow: number;
  spread: number;
  distance: number;
  spin: boolean;
};

export const DEFAULT_PARAMS: SceneParams = {
  speed: 1,
  density: 1,
  glow: 0.75,
  spread: 1,
  distance: 8.4,
  spin: true,
};

export const DENSITY_COUNTS = [6000, 12000, 24000] as const;

// Mutable mirror read inside useFrame; snapshot object drives React subscribers.
export const sceneParams: SceneParams = { ...DEFAULT_PARAMS };

let paramsSnapshot: SceneParams = { ...DEFAULT_PARAMS };
const paramListeners = new Set<() => void>();

function emitParams() {
  Object.assign(sceneParams, paramsSnapshot);
  paramListeners.forEach((l) => l());
}

export function setSceneParam<K extends keyof SceneParams>(key: K, value: SceneParams[K]) {
  paramsSnapshot = { ...paramsSnapshot, [key]: value };
  emitParams();
}

export function resetSceneParams() {
  paramsSnapshot = { ...DEFAULT_PARAMS };
  emitParams();
}

export function randomizeSceneParams() {
  const round = (n: number, step: number) => Math.round(n / step) * step;
  paramsSnapshot = {
    speed: round(0.35 + Math.random() * 1.5, 0.05),
    density: paramsSnapshot.density,
    glow: round(0.25 + Math.random() * 1.05, 0.05),
    spread: round(0.4 + Math.random() * 1.1, 0.05),
    distance: round(6.8 + Math.random() * 3.6, 0.1),
    spin: Math.random() > 0.25,
  };
  emitParams();
}

export function subscribeParams(listener: () => void) {
  paramListeners.add(listener);
  return () => {
    paramListeners.delete(listener);
  };
}

export function getParamsSnapshot() {
  return paramsSnapshot;
}
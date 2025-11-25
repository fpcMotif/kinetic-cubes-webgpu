import type {
  CameraConfig,
  ControlsConfig,
  HemisphereLightConfig,
  InstancedMeshConfig,
  LightConfig,
  RendererConfig,
  ThemeConfig,
} from "@/types/three";

export const RENDERER_CONFIG: RendererConfig = {
  alpha: true,
  antialias: true,
};

export const CAMERA_CONFIG: CameraConfig = {
  fov: 50,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 100,
  position: [5, 5, 5],
};

export const CONTROLS_CONFIG: ControlsConfig = {
  target: [0, -1, 0],
  enableDamping: true,
  dampingFactor: 0.05,
};

export const DIRECTIONAL_LIGHT_CONFIG: LightConfig = {
  color: "white",
  intensity: 5,
  position: [5, 5, 5],
  castShadow: true,
  shadowNormalBias: 0.03,
  shadowMapSize: 2048,
};

export const HEMISPHERE_LIGHT_CONFIG: HemisphereLightConfig = {
  skyColor: "lightskyblue",
  groundColor: "red",
  intensity: 3,
};

export const INSTANCED_MESH_CONFIG: InstancedMeshConfig = {
  size: 2,
  instancesPerSide: 13,
};

export const COLOR_THEMES: ThemeConfig = {
  normal: {
    primary: "#2563eb", // blue
    secondary: "#fbbf24", // amber
  },
  retro: {
    primary: "#666", // gray
    secondary: "#fff", // white
  },
};

export const RESIZE_DEBOUNCE_MS = 333;

export const RESIZE_BRIGHTNESS_TRANSITION = {
  dimmed: 0,
  normal: 1,
};

// TSL Animation Constants
export const TSL_ANIMATION = {
  timeMultiplier: Math.PI * 4,
  scaleRandomFactor: 0.2,
  scaleBase: 1,
  sizeMultiplier: 0.5,
  roughnessBase: 0.1,
  roughnessVariation: 0.4,
};

import type React from "react";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type * as THREE from "three/webgpu";
import type { WebGPURenderer } from "three/webgpu";

export type RendererConfig = {
  alpha: boolean;
  antialias: boolean;
};

export type CameraConfig = {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  position: [number, number, number];
};

export type ControlsConfig = {
  target: [number, number, number];
  enableDamping: boolean;
  dampingFactor: number;
};

export type LightConfig = {
  color: string;
  intensity: number;
  position: [number, number, number];
  castShadow: boolean;
  shadowNormalBias: number;
  shadowMapSize: number;
};

export type HemisphereLightConfig = {
  skyColor: string;
  groundColor: string;
  intensity: number;
};

export type InstancedMeshConfig = {
  size: number;
  instancesPerSide: number;
};

export type ColorTheme = {
  primary: string;
  secondary: string;
};

export type ThemeConfig = {
  normal: ColorTheme;
  retro: ColorTheme;
};

export type SceneElements = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
};

export type RendererResult = {
  renderer: WebGPURenderer | null;
  error: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
};

export type ResizeHandlerConfig = {
  containerRef: React.RefObject<HTMLDivElement>;
  renderer: WebGPURenderer | null;
  camera: THREE.PerspectiveCamera | null;
  debounceMs: number;
};

import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { WebGPURenderer } from "three/webgpu";
import * as THREE from "three/webgpu";
import {
  CAMERA_CONFIG,
  CONTROLS_CONFIG,
  DIRECTIONAL_LIGHT_CONFIG,
  HEMISPHERE_LIGHT_CONFIG,
} from "@/config/scene";
import type { SceneElements } from "@/types/three";

export const useThreeScene = (
  renderer: WebGPURenderer | null
): SceneElements | null => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!renderer) {
      return;
    }

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Create Camera
    const camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );
    camera.position.set(...CAMERA_CONFIG.position);
    cameraRef.current = camera;

    // Create Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CONTROLS_CONFIG.target);
    controls.enableDamping = CONTROLS_CONFIG.enableDamping;
    controls.dampingFactor = CONTROLS_CONFIG.dampingFactor;
    controlsRef.current = controls;

    // Create Directional Light
    const directionalLight = new THREE.DirectionalLight(
      DIRECTIONAL_LIGHT_CONFIG.color,
      DIRECTIONAL_LIGHT_CONFIG.intensity
    );
    directionalLight.position.set(...DIRECTIONAL_LIGHT_CONFIG.position);
    directionalLight.castShadow = DIRECTIONAL_LIGHT_CONFIG.castShadow;
    directionalLight.shadow.normalBias =
      DIRECTIONAL_LIGHT_CONFIG.shadowNormalBias;
    directionalLight.shadow.mapSize.width =
      DIRECTIONAL_LIGHT_CONFIG.shadowMapSize;
    directionalLight.shadow.mapSize.height =
      DIRECTIONAL_LIGHT_CONFIG.shadowMapSize;
    scene.add(directionalLight);

    // Create Hemisphere Light
    const hemisphereLight = new THREE.HemisphereLight(
      HEMISPHERE_LIGHT_CONFIG.skyColor,
      HEMISPHERE_LIGHT_CONFIG.groundColor,
      HEMISPHERE_LIGHT_CONFIG.intensity
    );
    scene.add(hemisphereLight);

    return () => {
      controlsRef.current?.dispose();
    };
  }, [renderer]);

  if (!(sceneRef.current && cameraRef.current && controlsRef.current)) {
    return null;
  }

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    controls: controlsRef.current,
  };
};

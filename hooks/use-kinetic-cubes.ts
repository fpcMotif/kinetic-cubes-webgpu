import { useEffect, useRef } from "react";
import * as TSL from "three/tsl";
import * as THREE from "three/webgpu";
import {
  COLOR_THEMES,
  INSTANCED_MESH_CONFIG,
  TSL_ANIMATION,
} from "@/config/scene";

export const useKineticCubes = (
  scene: THREE.Scene | null,
  isRetro: boolean
): THREE.InstancedMesh | null => {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    if (!scene) {
      return;
    }

    const { size, instancesPerSide } = INSTANCED_MESH_CONFIG;
    const instancesCount = instancesPerSide ** 2;

    // Create Geometry and Material
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhysicalNodeMaterial();
    const mesh = new THREE.InstancedMesh(geometry, material, instancesCount);

    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.position.set(
      (instancesPerSide / -2 + 0.5) * size,
      0,
      (instancesPerSide / -2 + 0.5) * size
    );

    // TSL Logic
    const instanceIndex = TSL.instanceIndex;
    const iIndex = instanceIndex.toFloat();

    const fac1d = iIndex.div(instancesCount);
    const fac2d_x = iIndex.mod(instancesPerSide).div(instancesPerSide);
    const fac2d_y = TSL.floor(iIndex.div(instancesPerSide)).div(
      instancesPerSide
    );

    // Animation Time
    const t = TSL.time.add(fac1d.mul(TSL_ANIMATION.timeMultiplier));

    // Rotation
    const rotation = new THREE.Euler(t, t, t);

    // Scale Logic (Wave effect)
    const scaleHash = TSL.hash(instanceIndex);
    const scaleBase = scaleHash
      .mul(TSL_ANIMATION.scaleRandomFactor)
      .add(TSL_ANIMATION.scaleBase);
    const wave = TSL.sin(t)
      .abs()
      .mul(scaleBase)
      .mul(size * TSL_ANIMATION.sizeMultiplier)
      .add(
        TSL.cos(t)
          .abs()
          .mul(scaleBase)
          .mul(size * TSL_ANIMATION.sizeMultiplier)
      );

    // Position Offset
    const offset = TSL.vec3(
      fac2d_x.mul(size * instancesPerSide),
      wave,
      fac2d_y.mul(size * instancesPerSide)
    );

    // Apply to Material
    material.positionNode = TSL.rotate(
      TSL.positionLocal.mul(scaleBase),
      rotation
    ).add(offset);
    material.normalNode = TSL.transformNormalToView(
      TSL.rotate(TSL.normalLocal.mul(scaleBase), rotation)
    );

    // Color based on isRetro prop
    const colorTheme = isRetro ? COLOR_THEMES.retro : COLOR_THEMES.normal;
    material.colorNode = TSL.mix(
      TSL.color(colorTheme.secondary),
      TSL.color(colorTheme.primary),
      TSL.sin(t).mul(0.5).add(0.5)
    );

    material.roughnessNode = TSL.float(TSL_ANIMATION.roughnessBase).add(
      TSL.hash(instanceIndex).mul(TSL_ANIMATION.roughnessVariation)
    );

    scene.add(mesh);
    meshRef.current = mesh;

    return () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, isRetro]);

  return meshRef.current;
};

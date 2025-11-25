import type React from "react";
import { useEffect } from "react";
import {
  useKineticCubes,
  usePostProcessing,
  useResizeHandler,
  useThreeScene,
  useWebGPURenderer,
} from "@/hooks";

type SceneContainerProps = {
  isRetro: boolean;
};

const SceneContainer: React.FC<SceneContainerProps> = ({ isRetro }) => {
  // Initialize WebGPU Renderer
  const { renderer, error, containerRef } = useWebGPURenderer();

  // Setup Scene, Camera, and Controls
  const sceneElements = useThreeScene(renderer);

  // Create Kinetic Cubes with TSL Animation
  useKineticCubes(sceneElements?.scene ?? null, isRetro);

  // Setup Post Processing (AO)
  const postProcessing = usePostProcessing(
    renderer,
    sceneElements?.scene ?? null,
    sceneElements?.camera ?? null
  );

  // Handle Window Resize
  useResizeHandler(containerRef, renderer, sceneElements?.camera ?? null);

  // Animation Loop
  useEffect(() => {
    if (!(renderer && postProcessing && sceneElements)) {
      return;
    }

    renderer.setAnimationLoop(() => {
      sceneElements.controls.update();
      postProcessing.render();
    });

    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [renderer, postProcessing, sceneElements]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-8 text-center text-white">
        <div>
          <h2 className="mb-4 font-bold text-2xl text-red-500">
            Initialization Failed
          </h2>
          <p className="mx-auto max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full transition-[filter] duration-300 ease-out"
      ref={containerRef}
      style={{ filter: "brightness(1)" }}
    />
  );
};

export default SceneContainer;

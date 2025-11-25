import { useEffect, useRef } from "react";
import { ao } from "three/examples/jsm/tsl/display/GTAONode.js";
import * as TSL from "three/tsl";
import type * as THREE from "three/webgpu";
import type { WebGPURenderer } from "three/webgpu";
import { PostProcessing } from "three/webgpu";

export const usePostProcessing = (
  renderer: WebGPURenderer | null,
  scene: THREE.Scene | null,
  camera: THREE.PerspectiveCamera | null
): PostProcessing | null => {
  const postProcessingRef = useRef<PostProcessing | null>(null);

  useEffect(() => {
    if (!(renderer && scene && camera)) {
      return;
    }

    const postProcessing = new PostProcessing(renderer);
    const pass = TSL.pass(scene, camera);

    // Configure MRT (Output Color + Normal in View Space) for AO
    pass.setMRT(
      TSL.mrt({
        output: TSL.output,
        normal: TSL.normalView,
      })
    );

    const outputTexture = pass.getTextureNode("output");
    const depthTexture = pass.getTextureNode("depth");
    const normalTexture = pass.getTextureNode("normal");

    // Ambient Occlusion
    const aoPass = ao(depthTexture, normalTexture, camera);
    const aoNode = aoPass.getTextureNode();

    // Combine AO with scene output
    postProcessing.outputNode = outputTexture.mul(aoNode);

    postProcessingRef.current = postProcessing;

    return () => {
      // Cleanup if needed
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera]);

  return postProcessingRef.current;
};

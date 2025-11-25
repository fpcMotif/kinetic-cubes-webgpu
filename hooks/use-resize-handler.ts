import type React from "react";
import { useEffect, useRef } from "react";
import type * as THREE from "three/webgpu";
import type { WebGPURenderer } from "three/webgpu";
import {
  RESIZE_BRIGHTNESS_TRANSITION,
  RESIZE_DEBOUNCE_MS,
} from "@/config/scene";

export const useResizeHandler = (
  containerRef: React.RefObject<HTMLDivElement>,
  renderer: WebGPURenderer | null,
  camera: THREE.PerspectiveCamera | null
): void => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!(containerRef.current && renderer && camera)) {
      return;
    }

    const handleResize = () => {
      if (!containerRef.current) {
        return;
      }
      const { innerWidth, innerHeight } = window;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };

    const onResize = () => {
      if (containerRef.current) {
        containerRef.current.style.filter = `brightness(${RESIZE_BRIGHTNESS_TRANSITION.dimmed})`;
      }
      handleResize();
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.filter = `brightness(${RESIZE_BRIGHTNESS_TRANSITION.normal})`;
        }
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", onResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timerRef.current);
    };
  }, [containerRef, renderer, camera]);
};

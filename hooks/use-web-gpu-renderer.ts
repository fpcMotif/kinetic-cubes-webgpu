import { useEffect, useRef, useState } from "react";
import { WebGPURenderer } from "three/webgpu";
import { RENDERER_CONFIG } from "@/config/scene";
import type { RendererResult } from "@/types/three";

export const useWebGPURenderer = (): RendererResult => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGPURenderer | null>(null);
  const [renderer, setRenderer] = useState<WebGPURenderer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initRenderer = async () => {
      if (!containerRef.current) {
        return;
      }

      try {
        const newRenderer = new WebGPURenderer(RENDERER_CONFIG);
        await newRenderer.init();

        if (!mounted) {
          newRenderer.dispose();
          return;
        }

        rendererRef.current = newRenderer;
        newRenderer.setPixelRatio(window.devicePixelRatio);
        newRenderer.setSize(window.innerWidth, window.innerHeight);
        newRenderer.shadowMap.enabled = true;
        containerRef.current.appendChild(newRenderer.domElement);
        setRenderer(newRenderer);
      } catch (err: unknown) {
        console.error("WebGPU Init Error:", err);
        if (mounted) {
          setError(
            "WebGPU is not supported or enabled in this browser. Please try Chrome Canary or enable WebGPU flags."
          );
        }
      }
    };

    initRenderer();

    return () => {
      mounted = false;
      const currentRenderer = rendererRef.current;
      if (currentRenderer) {
        currentRenderer.setAnimationLoop(null);
        currentRenderer.domElement?.parentNode?.removeChild(
          currentRenderer.domElement
        );
        currentRenderer.dispose();
        rendererRef.current = null;
        setRenderer(null);
      }
    };
  }, []);

  return {
    renderer,
    error,
    containerRef,
  };
};

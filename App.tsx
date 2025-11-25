import { Info, Layers, Zap } from "lucide-react";
import type React from "react";
import { useState } from "react";
import SceneContainer from "@/components/scene-container";

const App: React.FC = () => {
  const [showUI, setShowUI] = useState(true);
  const [retroMode, setRetroMode] = useState(true);

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${retroMode ? "bg-[#ccc]" : "bg-gray-900"}`}
    >
      {/* Background Pattern logic handled via CSS in component or absolute div here */}
      {retroMode && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            background:
              "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 32px 32px",
          }}
        />
      )}

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10">
        <SceneContainer isRetro={retroMode} />
      </div>

      {/* UI Overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${showUI ? "opacity-100" : "opacity-0"}`}
      >
        {/* Header */}
        <header className="pointer-events-auto absolute top-0 left-0 p-6">
          <div className="max-w-sm rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-black/60">
            <h1 className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text font-bold text-3xl text-transparent tracking-tight">
              MotionBlur/AO
            </h1>
            <p className="mt-2 text-gray-600 text-sm leading-relaxed dark:text-gray-300">
              A WebGPU kinetic sculpture featuring procedural TSL animation,
              GTAO (Ambient Occlusion), and velocity-based Motion Blur.
            </p>
            <div className="mt-4 flex items-center gap-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Powered by Three.js WebGPU</span>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="-translate-x-1/2 pointer-events-auto absolute bottom-8 left-1/2">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-2 py-2 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/90">
            <button
              className={`rounded-full p-3 transition-all duration-300 ${retroMode ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}`}
              onClick={() => setRetroMode(!retroMode)}
              title="Toggle Retro Background"
              type="button"
            >
              <Layers className="h-5 w-5" />
            </button>
            <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <div className="px-4 font-medium text-gray-500 text-xs">
              Drag to Rotate • Scroll to Zoom
            </div>
          </div>
        </div>
      </div>

      {/* Toggle UI Button (Always Visible) */}
      <button
        className="pointer-events-auto absolute top-6 right-6 z-30 rounded-full bg-white/20 p-3 text-gray-800 backdrop-blur-md transition-all hover:bg-white/40 dark:text-white"
        onClick={() => setShowUI(!showUI)}
        type="button"
      >
        <Info className="h-6 w-6" />
      </button>
    </div>
  );
};

export default App;

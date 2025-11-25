import React, { useState } from 'react';
import SceneContainer from './components/SceneContainer';
import { Camera, Layers, Info, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [showUI, setShowUI] = useState(true);
  const [retroMode, setRetroMode] = useState(true);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${retroMode ? 'bg-[#ccc]' : 'bg-gray-900'}`}>
      
      {/* Background Pattern logic handled via CSS in component or absolute div here */}
      {retroMode && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            background: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 32px 32px'
          }}
        />
      )}

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10">
        <SceneContainer isRetro={retroMode} />
      </div>

      {/* UI Overlay */}
      <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <header className="absolute top-0 left-0 p-6 pointer-events-auto">
          <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10 max-w-sm">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-amber-500 tracking-tight">
              MotionBlur/AO
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              A WebGPU kinetic sculpture featuring procedural TSL animation, GTAO (Ambient Occlusion), and velocity-based Motion Blur.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Powered by Three.js WebGPU</span>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-2 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setRetroMode(!retroMode)}
              className={`p-3 rounded-full transition-all duration-300 ${retroMode ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'}`}
              title="Toggle Retro Background"
            >
              <Layers className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <div className="px-4 text-xs font-medium text-gray-500">
              Drag to Rotate • Scroll to Zoom
            </div>
          </div>
        </div>
      </div>

      {/* Toggle UI Button (Always Visible) */}
      <button 
        onClick={() => setShowUI(!showUI)}
        className="absolute top-6 right-6 z-30 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-gray-800 dark:text-white transition-all pointer-events-auto"
      >
        <Info className="w-6 h-6" />
      </button>

    </div>
  );
};

export default App;

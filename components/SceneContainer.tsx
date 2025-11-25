import React, { useEffect, useRef, useState } from 'react';
// We import from 'three' which is mapped to three.webgpu.js in index.html
import * as THREE from 'three'; 
// Alias THREE as $ for TSL nodes, as three.webgpu.js exports everything in one namespace
const $ = THREE; 

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { motionBlur } from 'three/addons/tsl/display/MotionBlur.js';

interface SceneContainerProps {
  isRetro: boolean;
}

// ----------------------------------------------------------------------------
// Custom TSL Helpers to replicate YCW_tsl_x functionality locally
// ----------------------------------------------------------------------------

/**
 * Calculates Normalized Device Coordinate (NDC) displacement (velocity) 
 * for Motion Blur by comparing current frame position to previous frame position.
 */
const ndc_displacement2d = (pass: any, camera: THREE.Camera) => {
  // Previous ViewProjection Matrix logic
  // Since TSL is stateless per frame, we need a way to store the previous matrix.
  // We use a uniform that we manually update in the render loop.
  const previousViewProjectionMatrix = $.uniform(new THREE.Matrix4());
  
  // Hook into the render loop to update this uniform
  // @ts-ignore - attaching custom data to the camera for the render loop to find
  camera.userData.previousViewProjectionMatrix = previousViewProjectionMatrix; 
  
  // Current position in World Space (reconstructed from depth)
  const depth = pass.getTextureNode('depth');
  const uv = $.uv();
  
  // Reconstruct clip space position
  // Z in clip space: depth * 2 - 1 (if depth is 0..1)
  // For WebGPU, depth might be reversed or 0..1 depending on config, usually standard here.
  const clipPositionCurrent = $.vec4(
    uv.x.mul(2).sub(1),
    uv.y.mul(2).sub(1),
    depth, // Assuming standard depth
    1.0
  );

  // Reconstruct World Position
  // We need the inverse ViewProjection of the current camera. 
  // $.cameraViewProjectionMatrix is standard TSL.
  const worldPosition = $.cameraViewProjectionMatrix.inverse().mul(clipPositionCurrent);
  const worldPos = worldPosition.div(worldPosition.w);

  // Reproject World Position using PREVIOUS Matrix
  const clipPositionPrevious = previousViewProjectionMatrix.mul(worldPos);
  
  // Calculate Velocity (Displacement in NDC)
  // Use reprojected previous position vs current clip position
  const ndcPrevious = clipPositionPrevious.div(clipPositionPrevious.w);
  const ndcCurrent = clipPositionCurrent.div(clipPositionCurrent.w);

  return ndcCurrent.xy.sub(ndcPrevious.xy);
};

const SceneContainer: React.FC<SceneContainerProps> = ({ isRetro }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGPURenderer;
    let timer: ReturnType<typeof setTimeout>;

    const init = async () => {
      try {
        // 1. Setup Renderer
        renderer = new THREE.WebGPURenderer({ alpha: true, antialias: true });
        await renderer.init();
        
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        containerRef.current?.appendChild(renderer.domElement);

        // 2. Setup Scene & Camera
        const scene = new THREE.Scene();
        scene.background = null; 

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(5, 5, 5);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, -1, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // 3. Lights
        const light0 = new THREE.DirectionalLight('white', 5);
        light0.position.set(5, 5, 5);
        light0.castShadow = true;
        light0.shadow.normalBias = 0.03;
        // Improve shadow quality
        light0.shadow.mapSize.width = 2048;
        light0.shadow.mapSize.height = 2048;
        scene.add(light0);

        scene.add(new THREE.HemisphereLight('lightskyblue', 'red', 3));

        // 4. Instanced Mesh with TSL
        const size = 2;
        const instances_per_side = 13;
        const instances_count = instances_per_side ** 2;
        
        const geom = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshPhysicalNodeMaterial();
        const mesh = new THREE.InstancedMesh(geom, mat, instances_count);
        
        mesh.frustumCulled = false;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        // Center the grid
        mesh.position.set(
          (instances_per_side / -2 + 0.5) * size, 
          0, 
          (instances_per_side / -2 + 0.5) * size
        );
        scene.add(mesh);

        // --- TSL Logic Start ---
        
        // Safe TSL Node Access
        // Access 'instanceIndex' as an attribute if the helper is not directly available on $
        const instanceIndex = $.instanceIndex || $.attribute('instanceIndex', 'uint');
        
        // Helper to convert to float safely if needed, though usually .toFloat() works on uint nodes
        const iIndex = instanceIndex.toFloat();

        // Calculate grid factors based on instance index
        const fac1d = iIndex.div(instances_count);
        const fac2d_x = instanceIndex.mod(instances_per_side).toFloat().div(instances_per_side);
        const fac2d_y = instanceIndex.div(instances_per_side).toFloat().div(instances_per_side);

        // Animation Time
        // Use 'timerLocal' if available (r170+), otherwise 'time'. 
        const timeNode = $.timerLocal ? $.timerLocal() : $.time;
        const t = timeNode.add(fac1d.mul(Math.PI, 4));

        // Rotation
        const rotation = new THREE.Euler(t, t, t);

        // Scale Logic (Wave effect)
        const scaleHash = $.hash(instanceIndex); // Randomness
        const scaleBase = scaleHash.mul(0.2).add(1);
        const wave = $.sin(t).abs().mul(scaleBase, size / 2)
                       .add($.cos(t).abs().mul(scaleBase, size / 2));
        
        // Position Offset
        const offset = $.vec3(
          fac2d_x.mul(size, instances_per_side), // x grid
          wave,                                  // y wave height
          fac2d_y.mul(size, instances_per_side)  // z grid
        );

        // Apply to Material
        // Important: .mul(scaleBase) scales the local vertex position
        // $.rotate handles rotation logic. If it fails, check imports.
        mat.positionNode = $.rotate($.positionLocal.mul(scaleBase), rotation).add(offset);
        
        // Recalculate normals for correct lighting after rotation
        mat.normalNode = $.transformNormalToView($.rotate($.normalLocal.mul(scaleBase), rotation));
        
        // Color Gradient
        mat.colorNode = $.mix($.color('#fbbf24'), $.color('#2563eb'), $.sin(t).mul(0.5).add(0.5));
        
        // Roughness variation
        mat.roughnessNode = $.float(0.1).add($.hash(instanceIndex).mul(0.4));

        // --- TSL Logic End ---

        // 5. Post Processing
        const pp = new THREE.PostProcessing(renderer);
        
        // Create a render pass of the scene
        // If $.pass is undefined, ensure you are using a recent three.webgpu.js build
        const pass = $.pass(scene, camera);
        
        // Configure MRT (Output Color + Normal in View Space) for AO
        pass.setMRT($.mrt({ 
          output: $.output, 
          normal: $.normalView 
        }));

        // Get displacement (velocity) for motion blur
        // Note: The mul(5) exaggerates the effect
        const disp = ndc_displacement2d(pass, camera);
        
        const outputTexture = pass.getTextureNode('output');
        const depthTexture = pass.getTextureNode('depth');
        const normalTexture = pass.getTextureNode('normal');

        // Ambient Occlusion
        // ao(depth, normal, camera)
        const aoNode = ao(depthTexture, normalTexture, camera).r;

        // Combine Motion Blur + AO
        // motionBlur(color, velocity)
        pp.outputNode = motionBlur(outputTexture, disp.mul(2.0)).mul(aoNode);


        // 6. Handle Resize & Epilepsy Prevention
        const handleResize = () => {
          if (!containerRef.current) return;
          const { innerWidth, innerHeight } = window;
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(innerWidth, innerHeight, false); // false = do not update style
          camera.aspect = innerWidth / innerHeight;
          camera.updateProjectionMatrix();
        };

        const onResize = () => {
          // Dim screen during resize to prevent flashing artifacts
          if (containerRef.current) {
             containerRef.current.style.filter = `brightness(0)`;
          }
          handleResize();
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.style.filter = `brightness(1)`;
            }
          }, 333);
        };

        window.addEventListener('resize', onResize);
        handleResize();

        // 7. Render Loop
        // We need a persistent matrix for the velocity calculation
        const currentViewProjection = new THREE.Matrix4();
        const previousViewProjection = new THREE.Matrix4();

        renderer.setAnimationLoop(() => {
          controls.update();

          // TSL Hack: Update the previous matrix uniform manually
          // The `ndc_displacement2d` helper we made attaches the uniform to camera.userData
          // @ts-ignore
          const prevMatrixUniform = camera.userData.previousViewProjectionMatrix;
          
          if (prevMatrixUniform) {
            // Update the uniform value with the matrix from the LAST frame
            prevMatrixUniform.value.copy(previousViewProjection);
          }

          // Calculate Current Matrix for NEXT frame usage
          camera.updateMatrixWorld();
          currentViewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
          
          // Render the post processing stack
          pp.render(scene, camera);

          // Save current as previous for the next frame
          previousViewProjection.copy(currentViewProjection);
        });

      } catch (err: any) {
        console.error("WebGPU Init Error:", err);
        setError("WebGPU is not supported or enabled in this browser. Please try Chrome Canary or enable WebGPU flags.");
      }
    };

    init();

    return () => {
      // Cleanup
      window.removeEventListener('resize', () => {});
      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      }
    };
  }, []); // Run once on mount

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black text-white p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-red-500">Initialization Failed</h2>
          <p className="max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full transition-[filter] duration-300 ease-out"
      style={{ filter: 'brightness(1)' }}
    />
  );
};

export default SceneContainer;
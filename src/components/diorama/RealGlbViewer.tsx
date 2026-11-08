"use client";

import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Center,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  onHotspotClick: (roomId: string) => void;
  selectedRoom: string | null;
}

function KananGlbHouseModel({ onHotspotClick, selectedRoom }: ModelProps) {
  // Cargar modelo optimizado con fallback seguro de Draco
  const { scene } = useGLTF(
    "/models/kanan-house-opt.glb",
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );
  const modelRef = useRef<THREE.Group>(null);

  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = Math.max(mat.roughness || 0.4, 0.3);
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <group ref={modelRef} dispose={null}>
      <Center top>
        <primitive object={scene} scale={2.5} />
      </Center>
    </group>
  );
}

useGLTF.preload(
  "/models/kanan-house-opt.glb",
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);

export function RealGlbViewer({
  onSelectRoom,
  selectedRoom,
}: {
  onSelectRoom: (roomId: string) => void;
  selectedRoom: string | null;
}) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [25, 25, 25],
          zoom: 70,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.2} color="#FFFBF5" />
        <directionalLight position={[15, 25, 15]} intensity={2.0} castShadow />
        <directionalLight position={[-15, 12, -10]} intensity={0.8} color="#D7E8F7" />

        <Suspense fallback={null}>
          <KananGlbHouseModel
            onHotspotClick={onSelectRoom}
            selectedRoom={selectedRoom}
          />
          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.6}
            scale={12}
            blur={2.0}
            far={6}
          />
          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minZoom={35}
          maxZoom={120}
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>

      {/* OVERLAY HTML ESTABLE DE HOTSPOTS (100% libre de errores DOM removeChild) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        {/* Contenedor relativo centrado sobre la maqueta */}
        <div className="relative w-[340px] sm:w-[460px] md:w-[540px] aspect-square">
          {/* 1. Hotspot: La Recámara (Arriba Izquierda) */}
          <div className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              type="button"
              onClick={() => onSelectRoom("colchones")}
              className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                selectedRoom === "colchones"
                  ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
                  : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
              <span>La Recámara</span>
            </button>
          </div>

          {/* 2. Hotspot: La Sala (Abajo Izquierda) */}
          <div className="absolute top-[64%] left-[26%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              type="button"
              onClick={() => onSelectRoom("salas")}
              className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                selectedRoom === "salas"
                  ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
                  : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
              <span>La Sala</span>
            </button>
          </div>

          {/* 3. Hotspot: Comedor y Tapete (Centro) */}
          <div className="absolute top-[66%] left-[54%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              type="button"
              onClick={() => onSelectRoom("tapetes")}
              className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                selectedRoom === "tapetes"
                  ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
                  : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
              <span>Comedor y Tapete</span>
            </button>
          </div>

          {/* 4. Hotspot: Vestiduras Auto (Derecha) */}
          <div className="absolute top-[58%] left-[78%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              type="button"
              onClick={() => onSelectRoom("autos")}
              className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                selectedRoom === "autos"
                  ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
                  : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
              <span>Vestiduras Auto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

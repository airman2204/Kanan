"use client";

import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Center,
  Environment,
  Html,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  onHotspotClick: (roomId: string) => void;
  selectedRoom: string | null;
}

function KananGlbHouseModel({ onHotspotClick, selectedRoom }: ModelProps) {
  const { scene } = useGLTF("/models/kanan-house.glb");
  const modelRef = useRef<THREE.Group>(null);

  // Optimizar materiales del modelo para que reaccionen con iluminación fotorrealista de estudio
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = Math.max(mat.roughness, 0.35);
          mat.envMapIntensity = 1.2;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return (
    <group ref={modelRef} dispose={null}>
      <Center top>
        <primitive object={scene} scale={2.8} />
      </Center>

      {/* 1. Hotspot: La Recámara (Planta Alta) */}
      <Html position={[-1.3, 3.2, 0.4]} center distanceFactor={14}>
        <button
          type="button"
          onClick={() => onHotspotClick("colchones")}
          className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
            selectedRoom === "colchones"
              ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
              : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
          <span>La Recámara</span>
        </button>
      </Html>

      {/* 2. Hotspot: La Sala de Estar (Planta Baja Izquierda) */}
      <Html position={[-1.2, 0.9, 0.8]} center distanceFactor={14}>
        <button
          type="button"
          onClick={() => onHotspotClick("salas")}
          className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
            selectedRoom === "salas"
              ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
              : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
          <span>La Sala</span>
        </button>
      </Html>

      {/* 3. Hotspot: El Comedor (Planta Baja Centro) */}
      <Html position={[0.7, 0.8, 0.8]} center distanceFactor={14}>
        <button
          type="button"
          onClick={() => onHotspotClick("tapetes")}
          className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
            selectedRoom === "tapetes"
              ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
              : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
          <span>Comedor y Tapete</span>
        </button>
      </Html>

      {/* 4. Hotspot: El Auto (Exterior Derecha) */}
      <Html position={[2.2, 0.9, 0.5]} center distanceFactor={14}>
        <button
          type="button"
          onClick={() => onHotspotClick("autos")}
          className={`px-3 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
            selectedRoom === "autos"
              ? "bg-[#1D71B5] text-white border-white ring-4 ring-cyan-300 scale-110"
              : "bg-white/95 text-[#0F2438] border-[#36A6DE] hover:scale-105"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#36A6DE] animate-ping" />
          <span>Vestiduras Auto</span>
        </button>
      </Html>
    </group>
  );
}

useGLTF.preload("/models/kanan-house.glb");

export function RealGlbViewer({
  onSelectRoom,
  selectedRoom,
}: {
  onSelectRoom: (roomId: string) => void;
  selectedRoom: string | null;
}) {
  return (
    <Canvas
      shadows
      // CÁMARA ORTOGRÁFICA ISOMÉTRICA EXACTA AL RENDER DE ESTUDIO
      orthographic
      camera={{
        position: [20, 20, 20],
        zoom: 75,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    >
      {/* Iluminación de Estudio Fotográfico Cálido */}
      <ambientLight intensity={1.1} color="#FFFBF5" />

      {/* Luz Principal (Key Light) desde arriba a la derecha con sombras suaves */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#FFF9ED"
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
      </directionalLight>

      {/* Luz de Relleno Azulada Kanan (Fill Light) para sombras suaves */}
      <directionalLight position={[-15, 12, -10]} intensity={0.9} color="#D7E8F7" />

      {/* Luz de rebote cálida desde el piso */}
      <directionalLight position={[0, -10, 10]} intensity={0.3} color="#FFE4C4" />

      <Suspense
        fallback={
          <Html center>
            <div className="flex flex-col items-center gap-3 text-cyan-300">
              <div className="w-12 h-12 rounded-2xl border-4 border-[#36A6DE] border-t-transparent animate-spin" />
              <span className="text-xs font-heading font-bold text-white bg-black/60 px-4 py-2 rounded-xl">
                Cargando render isométrico...
              </span>
            </div>
          </Html>
        }
      >
        <KananGlbHouseModel
          onHotspotClick={onSelectRoom}
          selectedRoom={selectedRoom}
        />

        {/* Sombras suaves de contacto bajo la maqueta arquitectónica */}
        <ContactShadows
          position={[0, -0.05, 0]}
          opacity={0.65}
          scale={12}
          blur={1.8}
          far={6}
          color="#1A2838"
        />

        {/* Mapa de Entorno de Estudio Difuso */}
        <Environment preset="apartment" />
      </Suspense>

      {/* Controles Orbitales Suaves */}
      <OrbitControls
        enablePan={false}
        minZoom={40}
        maxZoom={120}
        dampingFactor={0.06}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  );
}

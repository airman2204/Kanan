"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Center,
  Environment,
  Html,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  onHotspotClick: (roomId: string) => void;
  selectedRoom: string | null;
}

function KananGlbHouseModel({ onHotspotClick, selectedRoom }: ModelProps) {
  // Carga del modelo GLB generado en Meshy
  const { scene } = useGLTF("/models/kanan-house.glb");
  const modelRef = useRef<THREE.Group>(null);

  return (
    <group ref={modelRef} dispose={null}>
      <Center>
        <primitive object={scene} scale={2.2} />
      </Center>

      {/* Hotspots interactivos posicionados en el espacio 3D */}
      {/* 1. La Sala */}
      <Html position={[-1.2, 0.4, 0.8]} center distanceFactor={12}>
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

      {/* 2. La Recámara / Colchones */}
      <Html position={[-1.1, 1.9, 0.7]} center distanceFactor={12}>
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
          <span>Colchones</span>
        </button>
      </Html>

      {/* 3. El Comedor / Tapetes */}
      <Html position={[0.8, 0.5, 0.8]} center distanceFactor={12}>
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
          <span>Tapetes y Sillas</span>
        </button>
      </Html>

      {/* 4. Cochera / Autos */}
      <Html position={[1.8, 0.6, 1.1]} center distanceFactor={12}>
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
          <span>Vestiduras Autos</span>
        </button>
      </Html>
    </group>
  );
}

// Pre-cargar modelo para agilidad
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
      camera={{ position: [5.5, 4.5, 6.5], fov: 42 }}
      className="w-full h-full cursor-grab active:cursor-grabbing"
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 10]} intensity={2.0} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={1.0} color="#36A6DE" />
      <pointLight position={[0, 4, 0]} intensity={1.5} color="#FFFFFF" />

      <Suspense
        fallback={
          <Html center>
            <div className="flex flex-col items-center gap-3 text-cyan-300">
              <div className="w-12 h-12 rounded-2xl border-4 border-[#36A6DE] border-t-transparent animate-spin" />
              <span className="text-xs font-heading font-bold text-white bg-black/60 px-3 py-1 rounded-xl">
                Cargando tu modelo .GLB de Meshy...
              </span>
            </div>
          </Html>
        }
      >
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
          <KananGlbHouseModel
            onHotspotClick={onSelectRoom}
            selectedRoom={selectedRoom}
          />
        </Float>
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enablePan={true}
        minDistance={4}
        maxDistance={14}
        dampingFactor={0.08}
        autoRotate={false}
      />
    </Canvas>
  );
}

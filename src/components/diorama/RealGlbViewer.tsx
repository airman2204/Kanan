"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
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

// Subcomponente individual para cada perrito con su pose y herramienta específica
function SpecificPup({
  modelUrl,
  position,
  rotation = [0, 0, 0],
  scale = 0.28,
  onClick,
}: {
  modelUrl: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}) {
  const { scene } = useGLTF(
    modelUrl,
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );
  const pupRef = useRef<THREE.Group>(null);

  // Asegurar que reciba y emita sombras
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group
      ref={pupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <primitive object={scene} />
    </group>
  );
}

function KananGlbHouseModel({ onHotspotClick, selectedRoom }: ModelProps) {
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
      {/* 1. Casa Cozy Blue Isométrica */}
      <Center top>
        <primitive object={scene} scale={2.5} />
      </Center>

      {/* 2. LOS 4 PERRITOS DIRECTAMENTE EN EL SUELO DE CADA HABITACIÓN */}
      {/* A) En la Sala (planta baja izquierda, junto a los sillones azules) */}
      <SpecificPup
        modelUrl="/models/pup-vacuum-opt.glb"
        position={[-0.45, 0.1, 0.45]}
        rotation={[0, 0.4, 0]}
        scale={0.24}
        onClick={() => onHotspotClick("salas")}
      />

      {/* B) En la Recámara (planta alta, al lado de la cama matrimonial) */}
      <SpecificPup
        modelUrl="/models/pup-magnifier-opt.glb"
        position={[-0.45, 1.35, -0.1]}
        rotation={[0, 0.5, 0]}
        scale={0.22}
        onClick={() => onHotspotClick("colchones")}
      />

      {/* C) En el Comedor (planta baja centro-derecha, junto a la mesa y sillas de madera) */}
      <SpecificPup
        modelUrl="/models/pup-carpet-opt.glb"
        position={[0.35, 0.1, 0.45]}
        rotation={[0, -0.3, 0]}
        scale={0.23}
        onClick={() => onHotspotClick("tapetes")}
      />

      {/* D) En la Cochera / Auto (planta baja extrema derecha, junto a la puerta del coche) */}
      <SpecificPup
        modelUrl="/models/pup-spray-opt.glb"
        position={[1.15, 0.1, 0.85]}
        rotation={[0, -0.6, 0]}
        scale={0.24}
        onClick={() => onHotspotClick("autos")}
      />
    </group>
  );
}

// Pre-cargar todos los modelos optimizados
useGLTF.preload(
  "/models/kanan-house-opt.glb",
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);
useGLTF.preload(
  "/models/pup-vacuum-opt.glb",
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);
useGLTF.preload(
  "/models/pup-magnifier-opt.glb",
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);
useGLTF.preload(
  "/models/pup-carpet-opt.glb",
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);
useGLTF.preload(
  "/models/pup-spray-opt.glb",
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
          toneMappingExposure: 1.15,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.25} color="#FFFBF5" />
        <directionalLight position={[15, 25, 15]} intensity={2.2} castShadow />
        <directionalLight position={[-15, 12, -10]} intensity={0.9} color="#D7E8F7" />

        <Suspense fallback={null}>
          <KananGlbHouseModel
            onHotspotClick={onSelectRoom}
            selectedRoom={selectedRoom}
          />
          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.65}
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

      {/* Hotspots temporales desactivados según solicitud */}
    </div>
  );
}

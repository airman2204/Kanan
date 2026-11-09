"use client";

import React, { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Center,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

interface DioramaScrollerProps {
  progress: number; // 0 a 1
  isMobile: boolean;
  onSelectRoom: (roomId: string) => void;
  selectedRoom: string | null;
}

// Configuración de los Waypoints de Cámara cinemática estilo Apple
// Progreso: 0 = Vista General | 0.25 = Sala | 0.50 = Recámara | 0.75 = Comedor | 1.0 = Auto/Cochera
const WAYPOINTS_DESKTOP = [
  // 0. Inicio (Vista isométrica general completa y monumental)
  {
    target: [0, 0.4, 0],
    camPos: [24, 22, 24],
    zoom: 170,
  },
  // 1. Sala (Zoom a planta baja frontal izquierda)
  {
    target: [-1.1, 0.3, 0.6],
    camPos: [15, 14, 18],
    zoom: 240,
  },
  // 2. Recámara (Zoom elevado al segundo piso, cama king)
  {
    target: [-0.9, 1.85, -0.3],
    camPos: [16, 21, 15],
    zoom: 250,
  },
  // 3. Comedor (Zoom al centro planta baja)
  {
    target: [-0.1, 0.3, 0.45],
    camPos: [14, 15, 17],
    zoom: 240,
  },
  // 4. Auto / Cochera (Zoom exterior derecha)
  {
    target: [1.8, 0.3, 0.8],
    camPos: [18, 14, 16],
    zoom: 235,
  },
  // 5. Final: Alejamiento triunfal mostrando toda la casa limpia
  {
    target: [0, 0.4, 0],
    camPos: [25, 24, 25],
    zoom: 165,
  },
];

// Controlador de Cámara cinemática suave sincronizado con Scroll
function CameraScrollRig({ progress }: { progress: number }) {
  const currentPos = useRef(new THREE.Vector3(24, 22, 24));
  const currentTarget = useRef(new THREE.Vector3(0, 0.4, 0));
  const currentZoom = useRef(170);

  useFrame((state, delta) => {
    // Interpolar entre los waypoints según el progress (0 a 1)
    const points = WAYPOINTS_DESKTOP;
    const totalSegments = points.length - 1;
    const scaled = Math.min(Math.max(progress * totalSegments, 0), totalSegments);
    const index = Math.floor(scaled);
    const nextIndex = Math.min(index + 1, totalSegments);
    const subProgress = scaled - index;

    // Suavizado cúbico easeInOut
    const ease =
      subProgress < 0.5
        ? 2 * subProgress * subProgress
        : 1 - Math.pow(-2 * subProgress + 2, 2) / 2;

    const pA = points[index];
    const pB = points[nextIndex];

    const targetPos = new THREE.Vector3(
      pA.camPos[0] + (pB.camPos[0] - pA.camPos[0]) * ease,
      pA.camPos[1] + (pB.camPos[1] - pA.camPos[1]) * ease,
      pA.camPos[2] + (pB.camPos[2] - pA.camPos[2]) * ease
    );

    const targetLookAt = new THREE.Vector3(
      pA.target[0] + (pB.target[0] - pA.target[0]) * ease,
      pA.target[1] + (pB.target[1] - pA.target[1]) * ease,
      pA.target[2] + (pB.target[2] - pA.target[2]) * ease
    );

    const targetZoomVal = pA.zoom + (pB.zoom - pA.zoom) * ease;

    // Damping suave a 60 FPS
    const lerpFactor = Math.min(delta * 4.5, 1);
    currentPos.current.lerp(targetPos, lerpFactor);
    currentTarget.current.lerp(targetLookAt, lerpFactor);
    currentZoom.current = THREE.MathUtils.lerp(currentZoom.current, targetZoomVal, lerpFactor);

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentTarget.current);
    if ((state.camera as THREE.OrthographicCamera).isOrthographicCamera) {
      const orthoCam = state.camera as THREE.OrthographicCamera;
      orthoCam.zoom = currentZoom.current;
      orthoCam.updateProjectionMatrix();
    }
  });

  return null;
}

// Subcomponente individual para cada perrito con su pose y herramienta específica
function SpecificPup({
  modelUrl,
  position,
  rotation = [0, 0, 0],
  scale = 0.32,
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

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group
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

// Modelo 3D Condicional (Desktop Completa con 4 Perritos O Modelo Especializado Móvil)
function ScrollyDioramaScene({
  isMobile,
  onSelectRoom,
}: {
  isMobile: boolean;
  onSelectRoom: (roomId: string) => void;
}) {
  const modelUrl = isMobile
    ? "/models/kanan-mobile-opt.glb"
    : "/models/kanan-house-opt.glb";

  const { scene } = useGLTF(
    modelUrl,
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );
  const houseRef = useRef<THREE.Group>(null);

  useEffect(() => {
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
    <group ref={houseRef} dispose={null}>
      {/* 1. Casa Base */}
      <Center top>
        <primitive object={scene} scale={isMobile ? 4.2 : 4.5} />
      </Center>

      {/* 2. Perritos Especializados (En Desktop, o si el modelo móvil es modular) */}
      {!isMobile && (
        <>
          {/* Sala */}
          <SpecificPup
            modelUrl="/models/pup-vacuum-opt.glb"
            position={[-1.25, 0.1, 0.65]}
            rotation={[0, 0.5, 0]}
            scale={0.34}
            onClick={() => onSelectRoom("salas")}
          />
          {/* Recámara */}
          <SpecificPup
            modelUrl="/models/pup-magnifier-opt.glb"
            position={[-1.0, 1.88, -0.4]}
            rotation={[0, 0.6, 0]}
            scale={0.32}
            onClick={() => onSelectRoom("colchones")}
          />
          {/* Comedor */}
          <SpecificPup
            modelUrl="/models/pup-carpet-opt.glb"
            position={[-0.15, 0.1, 0.5]}
            rotation={[0, -0.2, 0]}
            scale={0.32}
            onClick={() => onSelectRoom("tapetes")}
          />
          {/* Cochera */}
          <SpecificPup
            modelUrl="/models/pup-spray-opt.glb"
            position={[1.85, 0.1, 0.85]}
            rotation={[0, -0.65, 0]}
            scale={0.34}
            onClick={() => onSelectRoom("autos")}
          />
        </>
      )}
    </group>
  );
}

// Pre-carga de modelos
useGLTF.preload("/models/kanan-house-opt.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
useGLTF.preload("/models/kanan-mobile-opt.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
useGLTF.preload("/models/pup-vacuum-opt.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
useGLTF.preload("/models/pup-magnifier-opt.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
useGLTF.preload("/models/pup-carpet-opt.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
useGLTF.preload("/models/pup-spray-opt.glb", "https://www.gstatic.com/draco/versioned/decoders/1.5.7/");

export function DioramaScroller({
  progress,
  isMobile,
  onSelectRoom,
  selectedRoom,
}: DioramaScrollerProps) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [24, 22, 24],
          zoom: 170,
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
        <ambientLight intensity={1.3} color="#FFFBF5" />
        <directionalLight position={[15, 25, 15]} intensity={2.2} castShadow />
        <directionalLight position={[-15, 12, -10]} intensity={0.9} color="#D7E8F7" />

        <Suspense fallback={null}>
          <ScrollyDioramaScene isMobile={isMobile} onSelectRoom={onSelectRoom} />
          <CameraScrollRig progress={progress} />
          <ContactShadows
            position={[0, -0.05, 0]}
            opacity={0.65}
            scale={14}
            blur={2.0}
            far={6}
          />
          <Environment preset="apartment" />
        </Suspense>

        {/* OrbitControls suave si el usuario quiere mover un poco con mouse */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}

"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";

const C = {
  phone: "#1a1a1a",
  phoneEdge: "#2a2a2a",
  screen: "#0d0d0d",
  brand: "#10b981",
  brandGlow: "#34d399",
  card: "#1c1c1e",
  cardBorder: "#2c2c2e",
  muted: "#8e8e93",
};

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.12) * 0.12;
    state.camera.position.y = 0.05 + Math.sin(t * 0.18) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function OrderNotificationCard() {
  return (
    <div className="w-[168px] select-none rounded-2xl border border-white/10 bg-[#1c1c1e]/95 p-3.5 shadow-2xl backdrop-blur-xl sm:w-[190px]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-white" aria-hidden>
            <path
              d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="20" r="1.2" fill="currentColor" />
            <circle cx="17" cy="20" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13px] font-semibold leading-tight text-white">Order placed</p>
          <p className="mt-0.5 text-[11px] text-[#8e8e93]">Payment confirmed</p>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="hero-progress-bar h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
      </div>
    </div>
  );
}

function PhoneMockup({ lite }: { lite?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.35) * (lite ? 0.12 : 0.18);
    groupRef.current.rotation.x = Math.sin(t * 0.28) * 0.04 - 0.08;
  });

  const w = lite ? 1.35 : 1.55;
  const h = lite ? 2.75 : 3.15;
  const depth = 0.12;

  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={lite ? 0.2 : 0.35}>
      <group ref={groupRef}>
        {/* Phone body */}
        <RoundedBox args={[w, h, depth]} radius={0.14} smoothness={6}>
          <meshStandardMaterial color={C.phone} roughness={0.25} metalness={0.65} />
        </RoundedBox>

        {/* Side buttons */}
        <mesh position={[w / 2 + 0.01, 0.35, 0]}>
          <boxGeometry args={[0.02, 0.22, 0.04]} />
          <meshStandardMaterial color={C.phoneEdge} roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Screen bezel */}
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <planeGeometry args={[w - 0.14, h - 0.14]} />
          <meshStandardMaterial color={C.screen} roughness={0.9} />
        </mesh>

        {/* Dynamic island */}
        <mesh position={[0, h / 2 - 0.22, depth / 2 + 0.008]}>
          <capsuleGeometry args={[0.055, 0.2, 4, 12]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>

        {/* Screen glow */}
        <mesh position={[0, 0, depth / 2 + 0.003]}>
          <planeGeometry args={[w - 0.2, h - 0.35]} />
          <meshBasicMaterial color={C.brand} transparent opacity={0.03} />
        </mesh>

        {/* Notification — HTML overlay on screen */}
        <Html
          transform
          occlude
          distanceFactor={lite ? 2.2 : 2.6}
          position={[0, h / 2 - 0.72, depth / 2 + 0.02]}
          style={{ pointerEvents: "none" }}
        >
          <OrderNotificationCard />
        </Html>

        {/* Ambient screen reflection */}
        <mesh position={[-0.15, 0.4, depth / 2 + 0.006]}>
          <planeGeometry args={[0.35, 1.2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.025} />
        </mesh>

        {/* Ground glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2 - 0.15, 0]}>
          <circleGeometry args={[lite ? 0.9 : 1.1, 32]} />
          <meshBasicMaterial color={C.brand} transparent opacity={0.12} />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingParcel({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + delay;
    ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.08;
    ref.current.rotation.y = t * 0.4;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.18, 0.14, 0.14]} />
      <meshStandardMaterial color="#c9a66b" roughness={0.6} emissive={C.brand} emissiveIntensity={0.08} />
    </mesh>
  );
}

function Scene({ lite }: { lite?: boolean }) {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#d1fae5" />
      <pointLight position={[0, 1, 3]} intensity={0.5} color={C.brandGlow} distance={10} />
      <pointLight position={[-2, -1, 2]} intensity={0.2} color="#6366f1" distance={8} />

      <PhoneMockup lite={lite} />

      {!lite && (
        <>
          <FloatingParcel position={[-1.4, 0.6, -0.3]} delay={0} />
          <FloatingParcel position={[1.5, -0.2, -0.5]} delay={1.2} />
        </>
      )}
    </>
  );
}

function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.8, 1.6, 0.1]} />
      <meshStandardMaterial color={C.phone} roughness={0.5} transparent opacity={0.4} />
    </mesh>
  );
}

export function HeroPhone3DScene({
  className,
  lite = false,
}: {
  className?: string;
  lite?: boolean;
}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, lite ? 4.2 : 3.8], fov: lite ? 40 : 36 }}
        dpr={lite ? [1, 1.25] : [1, 2]}
        gl={{ antialias: !lite, alpha: true, powerPreference: lite ? "default" : "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<SceneLoader />}>
          <Scene lite={lite} />
        </Suspense>
      </Canvas>
    </div>
  );
}

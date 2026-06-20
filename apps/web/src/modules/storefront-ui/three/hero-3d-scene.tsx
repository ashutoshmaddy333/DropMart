"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Line } from "@react-three/drei";
import * as THREE from "three";

/** Brand-aligned palette — warm, retail-grade, not cartoon */
const C = {
  kraft: "#c9a66b",
  kraftDark: "#a8844a",
  kraftLight: "#e8d5b5",
  brand: "#10b981",
  brandDark: "#059669",
  white: "#f8fafc",
  slate: "#64748b",
  slateDark: "#334155",
  pin: "#ef4444",
  label: "#fefce8",
};

function DeliveryPackage() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={ref} position={[0, 0, 0]}>
        <RoundedBox args={[1.35, 1, 1]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color={C.kraft} roughness={0.65} metalness={0.02} />
        </RoundedBox>
        {/* Packing tape */}
        <mesh position={[0, 0.02, 0.51]}>
          <boxGeometry args={[1.36, 0.14, 0.02]} />
          <meshStandardMaterial color={C.kraftLight} roughness={0.5} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.02, -0.51]}>
          <boxGeometry args={[1.36, 0.14, 0.02]} />
          <meshStandardMaterial color={C.kraftLight} roughness={0.5} transparent opacity={0.85} />
        </mesh>
        {/* Shipping label */}
        <mesh position={[0, -0.15, 0.52]}>
          <boxGeometry args={[0.55, 0.35, 0.02]} />
          <meshStandardMaterial color={C.label} roughness={0.4} />
        </mesh>
        <mesh position={[0.12, -0.08, 0.535]}>
          <boxGeometry args={[0.22, 0.04, 0.005]} />
          <meshStandardMaterial color={C.slate} roughness={0.5} />
        </mesh>
        <mesh position={[-0.1, -0.18, 0.535]}>
          <boxGeometry args={[0.18, 0.04, 0.005]} />
          <meshStandardMaterial color={C.slate} roughness={0.5} transparent opacity={0.5} />
        </mesh>
        {/* Delivered badge */}
        <mesh position={[0.42, 0.28, 0.52]}>
          <circleGeometry args={[0.12, 24]} />
          <meshStandardMaterial color={C.brand} roughness={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

function PaperBag() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08 + 0.35;
  });

  return (
    <Float speed={1} rotationIntensity={0.06} floatIntensity={0.2}>
      <group ref={ref} position={[-1.75, 0.15, 0.15]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.75, 0.85, 0.45]} />
          <meshStandardMaterial color={C.kraftLight} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.77, 0.06, 0.47]} />
          <meshStandardMaterial color={C.kraftDark} roughness={0.6} />
        </mesh>
        <mesh position={[-0.2, 0.48, 0]} rotation={[0, 0, 0.15]}>
          <torusGeometry args={[0.14, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color={C.kraftDark} roughness={0.5} />
        </mesh>
        <mesh position={[0.2, 0.48, 0]} rotation={[0, 0, -0.15]}>
          <torusGeometry args={[0.14, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color={C.kraftDark} roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function DeliveryVan() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.35;
    ref.current.position.x = 1.85 + Math.sin(t) * 0.06;
  });

  return (
    <Float speed={0.9} rotationIntensity={0.04} floatIntensity={0.15}>
      <group ref={ref} position={[1.85, -0.45, 0]} rotation={[0, -0.45, 0]}>
        {/* Cargo */}
        <RoundedBox args={[0.95, 0.55, 0.6]} radius={0.04} smoothness={3} position={[0.15, 0.12, 0]}>
          <meshStandardMaterial color={C.white} roughness={0.25} metalness={0.05} />
        </RoundedBox>
        {/* Brand stripe */}
        <mesh position={[0.15, 0.12, 0.31]}>
          <boxGeometry args={[0.96, 0.1, 0.01]} />
          <meshStandardMaterial color={C.brand} roughness={0.3} />
        </mesh>
        {/* Cabin */}
        <RoundedBox args={[0.38, 0.42, 0.55]} radius={0.04} smoothness={3} position={[-0.52, 0.08, 0]}>
          <meshStandardMaterial color={C.slateDark} roughness={0.3} metalness={0.1} />
        </RoundedBox>
        {/* Wheels */}
        {([-0.35, 0.45] as const).map((x) =>
          ([-0.22, 0.22] as const).map((z) => (
            <group key={`${x}-${z}`} position={[x, -0.18, z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.11, 0.07, 20]} />
                <meshStandardMaterial color={C.slateDark} roughness={0.6} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.11, 0.028, 8, 20]} />
                <meshStandardMaterial color={C.slate} roughness={0.5} />
              </mesh>
            </group>
          ))
        )}
      </group>
    </Float>
  );
}

function GeoPin({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial color={C.pin} roughness={0.35} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.14, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.09, 0.18, 4]} />
        <meshStandardMaterial color={C.pin} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.2, 32]} />
        <meshStandardMaterial color={C.brand} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function MiniParcel({
  position,
  scale = 1,
  delay = 0,
}: {
  position: [number, number, number];
  scale?: number;
  delay?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + delay;
    ref.current.position.y = position[1] + Math.sin(t * 0.7) * 0.05;
    ref.current.rotation.y = t * 0.15;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <RoundedBox args={[0.35, 0.28, 0.28]} radius={0.03} smoothness={3}>
        <meshStandardMaterial color={C.kraft} roughness={0.6} />
      </RoundedBox>
    </group>
  );
}

function DeliveryRoute() {
  const points = useRef<THREE.Vector3[]>(
    Array.from({ length: 48 }, (_, i) => {
      const angle = (i / 47) * Math.PI * 1.2 - Math.PI * 0.3;
      const r = 2.1;
      return new THREE.Vector3(Math.cos(angle) * r, -0.6 + Math.sin(angle) * 0.15, Math.sin(angle) * r * 0.4);
    })
  ).current;

  return (
    <Line
      points={points}
      color={C.brand}
      lineWidth={1}
      transparent
      opacity={0.25}
      dashed
      dashSize={0.08}
      gapSize={0.06}
    />
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#ecfdf5" />
      <pointLight position={[0, 2, 4]} intensity={0.4} color={C.brand} distance={14} />

      <DeliveryRoute />
      <DeliveryPackage />
      <PaperBag />
      <DeliveryVan />

      <GeoPin position={[-1.05, 1.55, 0.2]} />
      <GeoPin position={[1.15, 1.35, -0.3]} />

      <MiniParcel position={[-0.9, -0.85, 0.7]} scale={0.9} delay={0} />
      <MiniParcel position={[0.75, 1.05, 0.5]} scale={0.75} delay={1.5} />
      <MiniParcel position={[1.4, 0.5, -0.5]} scale={0.65} delay={2.8} />

      {/* Soft ground shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>
    </>
  );
}

function SceneLoader() {
  return (
    <Float speed={0.6} floatIntensity={0.15}>
      <RoundedBox args={[0.7, 0.55, 0.55]} radius={0.05} smoothness={3}>
        <meshStandardMaterial color={C.kraft} roughness={0.6} transparent opacity={0.5} />
      </RoundedBox>
    </Float>
  );
}

export function Hero3DScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.15, 5.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<SceneLoader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

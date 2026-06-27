"use client";

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Line } from "@react-three/drei";
import * as THREE from "three";

const C = {
  kraft: "#c9a66b",
  kraftDark: "#a8844a",
  kraftLight: "#e8d5b5",
  brand: "#10b981",
  brandGlow: "#34d399",
  brandDark: "#059669",
  white: "#f8fafc",
  slate: "#64748b",
  slateDark: "#334155",
  pin: "#ef4444",
  label: "#fefce8",
  warehouse: "#1e293b",
  roof: "#0f172a",
};

/** Dropship route: supplier warehouse → hub → delivery van → customer */
const DROPSHIP_PATH: [number, number, number][] = [
  [-2.35, 0.55, 0.35],
  [-1.2, 1.15, 0.55],
  [-0.15, 0.75, 0.25],
  [0.95, 0.35, 0.05],
  [1.85, -0.15, -0.35],
  [2.35, -0.35, -0.55],
];

function CameraRig({ lite }: { lite?: boolean }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sway = lite ? 0.08 : 0.18;
    state.camera.position.x = Math.sin(t * 0.18) * sway;
    state.camera.position.y = 0.2 + Math.sin(t * 0.22) * 0.06;
    state.camera.lookAt(0, 0.05, 0);
  });
  return null;
}

function WarehouseHub() {
  const stackRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!stackRef.current) return;
    stackRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
  });

  return (
    <group position={[-2.35, -0.55, 0.35]}>
      {/* Main warehouse */}
      <RoundedBox args={[1.15, 0.75, 0.85]} radius={0.04} smoothness={3} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={C.warehouse} roughness={0.45} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.9]} />
        <meshStandardMaterial color={C.roof} roughness={0.55} />
      </mesh>
      {/* Loading dock */}
      <mesh position={[0, -0.22, 0.44]}>
        <boxGeometry args={[0.7, 0.35, 0.06]} />
        <meshStandardMaterial color={C.slateDark} roughness={0.5} />
      </mesh>
      {/* Brand accent */}
      <mesh position={[0, 0.1, 0.43]}>
        <boxGeometry args={[1.16, 0.12, 0.02]} />
        <meshStandardMaterial color={C.brand} roughness={0.35} emissive={C.brand} emissiveIntensity={0.15} />
      </mesh>
      {/* Inventory stack */}
      <group ref={stackRef} position={[0.75, -0.05, 0.15]}>
        {([0, 1, 2] as const).map((i) => (
          <RoundedBox
            key={i}
            args={[0.32, 0.26, 0.26]}
            radius={0.025}
            smoothness={2}
            position={[i * 0.05, i * 0.28, 0]}
          >
            <meshStandardMaterial color={C.kraft} roughness={0.6} />
          </RoundedBox>
        ))}
      </group>
      <pointLight position={[0, 0.8, 0.5]} intensity={0.35} color={C.brandGlow} distance={3} />
    </group>
  );
}

function CustomerDoorstep() {
  return (
    <group position={[2.35, -0.65, -0.55]}>
      <RoundedBox args={[0.55, 0.45, 0.45]} radius={0.03} smoothness={2} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={C.white} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.42, 0.28, 4]} />
        <meshStandardMaterial color={C.brandDark} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, 0.24]}>
        <boxGeometry args={[0.14, 0.22, 0.02]} />
        <meshStandardMaterial color={C.kraftDark} roughness={0.5} />
      </mesh>
      {/* Delivered package on doorstep */}
      <RoundedBox args={[0.28, 0.22, 0.22]} radius={0.02} smoothness={2} position={[0.35, -0.12, 0.2]}>
        <meshStandardMaterial color={C.kraft} roughness={0.55} />
      </RoundedBox>
      <GeoPin position={[0, 0.75, 0.1]} />
    </group>
  );
}

function DropshipFlowPackage() {
  const ref = useRef<THREE.Group>(null);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(DROPSHIP_PATH.map((p) => new THREE.Vector3(...p))),
    [],
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * 0.12) % 1;
    const pos = curve.getPoint(t);
    const ahead = curve.getPoint((t + 0.03) % 1);
    ref.current.position.copy(pos);
    ref.current.lookAt(ahead);
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[0.38, 0.3, 0.3]} radius={0.03} smoothness={3}>
        <meshStandardMaterial
          color={C.kraft}
          roughness={0.5}
          emissive={C.brand}
          emissiveIntensity={0.12}
        />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.16]}>
        <boxGeometry args={[0.39, 0.08, 0.02]} />
        <meshStandardMaterial color={C.brand} roughness={0.3} />
      </mesh>
    </group>
  );
}

function DropshipNetwork({ lite }: { lite?: boolean }) {
  const mainPath = useMemo(
    () => DROPSHIP_PATH.map((p) => new THREE.Vector3(...p)),
    [],
  );

  const branchPaths = useMemo(() => {
    if (lite) return [];
    return [
      [
        new THREE.Vector3(-2.35, 0.55, 0.35),
        new THREE.Vector3(-1.8, 1.4, -0.2),
        new THREE.Vector3(-0.8, 1.6, -0.4),
      ],
      [
        new THREE.Vector3(0.95, 0.35, 0.05),
        new THREE.Vector3(1.4, 0.9, 0.35),
        new THREE.Vector3(1.85, -0.15, -0.35),
      ],
    ];
  }, [lite]);

  return (
    <>
      <Line
        points={mainPath}
        color={C.brandGlow}
        lineWidth={lite ? 1.5 : 2}
        transparent
        opacity={0.55}
        dashed
        dashSize={0.1}
        gapSize={0.06}
      />
      {!lite &&
        branchPaths.map((pts, i) => (
          <Line
            key={i}
            points={pts}
            color={C.brand}
            lineWidth={1}
            transparent
            opacity={0.2}
            dashed
            dashSize={0.06}
            gapSize={0.08}
          />
        ))}
    </>
  );
}

function DeliveryPackage() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={ref} position={[0, 0.1, 0]}>
        <RoundedBox args={[1.35, 1, 1]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color={C.kraft} roughness={0.65} metalness={0.02} />
        </RoundedBox>
        <mesh position={[0, 0.02, 0.51]}>
          <boxGeometry args={[1.36, 0.14, 0.02]} />
          <meshStandardMaterial color={C.kraftLight} roughness={0.5} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -0.15, 0.52]}>
          <boxGeometry args={[0.55, 0.35, 0.02]} />
          <meshStandardMaterial color={C.label} roughness={0.4} />
        </mesh>
        <mesh position={[0.42, 0.28, 0.52]}>
          <circleGeometry args={[0.12, 24]} />
          <meshStandardMaterial color={C.brand} roughness={0.35} emissive={C.brand} emissiveIntensity={0.2} />
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
    ref.current.position.x = 0.95 + Math.sin(t) * 0.08;
  });

  return (
    <Float speed={0.9} rotationIntensity={0.04} floatIntensity={0.15}>
      <group ref={ref} position={[0.95, -0.35, 0.05]} rotation={[0, -0.35, 0]}>
        <RoundedBox args={[0.95, 0.55, 0.6]} radius={0.04} smoothness={3} position={[0.15, 0.12, 0]}>
          <meshStandardMaterial color={C.white} roughness={0.25} metalness={0.05} />
        </RoundedBox>
        <mesh position={[0.15, 0.12, 0.31]}>
          <boxGeometry args={[0.96, 0.1, 0.01]} />
          <meshStandardMaterial color={C.brand} roughness={0.3} emissive={C.brand} emissiveIntensity={0.1} />
        </mesh>
        <RoundedBox args={[0.38, 0.42, 0.55]} radius={0.04} smoothness={3} position={[-0.52, 0.08, 0]}>
          <meshStandardMaterial color={C.slateDark} roughness={0.3} metalness={0.1} />
        </RoundedBox>
        {([-0.35, 0.45] as const).map((x) =>
          ([-0.22, 0.22] as const).map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.18, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.07, 16]} />
              <meshStandardMaterial color={C.slateDark} roughness={0.6} />
            </mesh>
          )),
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
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={C.pin} roughness={0.35} emissive={C.pin} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color={C.pin} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.18, 24]} />
        <meshStandardMaterial color={C.brand} transparent opacity={0.4} />
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

function GeoGrid({ lite }: { lite?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.04;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
      <ringGeometry args={[1.2, lite ? 2.2 : 2.8, 48]} />
      <meshBasicMaterial color={C.brand} transparent opacity={0.06} wireframe />
    </mesh>
  );
}

function Scene({ lite }: { lite?: boolean }) {
  return (
    <>
      <CameraRig lite={lite} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#ecfdf5" />
      <pointLight position={[0, 2, 4]} intensity={0.45} color={C.brand} distance={14} />

      <GeoGrid lite={lite} />
      <DropshipNetwork lite={lite} />

      <WarehouseHub />
      <CustomerDoorstep />
      <DropshipFlowPackage />
      <DeliveryPackage />
      <DeliveryVan />

      {!lite && (
        <>
          <GeoPin position={[-0.8, 1.45, 0.15]} />
          <MiniParcel position={[-0.5, -0.75, 0.65]} scale={0.85} delay={0} />
          <MiniParcel position={[1.2, 0.85, 0.4]} scale={0.7} delay={1.5} />
        </>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <circleGeometry args={[lite ? 1.4 : 1.8, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.14} />
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

export function Hero3DScene({
  className,
  lite = false,
}: {
  className?: string;
  lite?: boolean;
}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.2, lite ? 5.8 : 5.2], fov: lite ? 42 : 38 }}
        dpr={lite ? [1, 1.25] : [1, 2]}
        gl={{
          antialias: !lite,
          alpha: true,
          powerPreference: lite ? "default" : "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<SceneLoader />}>
          <Scene lite={lite} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Alias for dropshipping hero usage */
export const HeroDropshipScene = Hero3DScene;

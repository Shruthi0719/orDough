import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Brownie stack layout ──────────────────────────────────────────────────
// 6 brownies: 3 on the bottom row, 2 on the middle row, 1 on top.
// Each has a slight random rotation and scale to look hand-stacked.
const BROWNIE_LAYERS: Array<{
  x: number; y: number; z: number;
  rotY: number; scaleX: number; scaleZ: number;
}> = [
  // Bottom row — 3 brownies side by side
  { x: -1.10, y: -1.30, z:  0.10, rotY:  0.08, scaleX: 1.00, scaleZ: 1.00 },
  { x:  0.05, y: -1.30, z: -0.12, rotY: -0.05, scaleX: 1.02, scaleZ: 0.98 },
  { x:  1.12, y: -1.30, z:  0.08, rotY:  0.10, scaleX: 0.98, scaleZ: 1.01 },
  // Middle row — 2 brownies offset over the gaps below
  { x: -0.54, y: -0.52, z:  0.05, rotY: -0.12, scaleX: 1.01, scaleZ: 0.99 },
  { x:  0.60, y: -0.52, z: -0.08, rotY:  0.09, scaleX: 0.99, scaleZ: 1.02 },
  // Top — 1 brownie centred
  { x:  0.04, y:  0.28, z:  0.00, rotY:  0.15, scaleX: 1.00, scaleZ: 1.00 },
];

// Chocolate drip blobs — squashed spheres on brownie edges
const DRIPS: Array<{ x: number; y: number; z: number; s: number }> = [
  { x:  0.55, y:  0.05, z:  0.42, s: 0.14 },
  { x: -0.40, y:  0.02, z:  0.44, s: 0.11 },
  { x:  0.15, y: -0.02, z: -0.44, s: 0.13 },
  { x: -0.90, y: -0.82, z:  0.42, s: 0.10 },
  { x:  0.22, y: -0.80, z:  0.43, s: 0.12 },
  { x:  1.05, y: -0.80, z: -0.40, s: 0.09 },
  { x: -0.55, y: -0.60, z: -0.40, s: 0.13 },
  { x:  0.68, y: -0.58, z:  0.38, s: 0.10 },
  { x: -1.10, y: -0.90, z:  0.00, s: 0.08 },
  { x:  1.15, y: -0.88, z:  0.05, s: 0.09 },
];

// Glossy fudge puddles on the top surface of each brownie
const TOP_GLOSSES: Array<{ x: number; y: number; z: number }> = [
  { x:  0.05, y:  0.43, z:  0.00 },
  { x: -0.54, y: -0.35, z:  0.00 },
  { x:  0.60, y: -0.35, z:  0.00 },
];

function BrownieStack() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Y-axis only — stack never tilts, always readable
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.28;
      // Gentle vertical float
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.55) * 0.12;
    }
  });

  // Brownie slab dimensions
  const W = 1.02; // width
  const H = 0.55; // height (fudgy thickness)
  const D = 0.88; // depth

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>

      {/* ── Brownie slabs ─────────────────────────────────────────── */}
      {BROWNIE_LAYERS.map((b, i) => (
        <group
          key={`brownie-${i}`}
          position={[b.x, b.y, b.z]}
          rotation={[0, b.rotY, 0]}
        >
          {/* Main body — deep espresso dark chocolate */}
          <mesh castShadow receiveShadow scale={[b.scaleX, 1, b.scaleZ]}>
            <boxGeometry args={[W, H, D]} />
            <meshStandardMaterial
              color="#6B3322"
              roughness={0.82}
              metalness={0.04}
            />
          </mesh>

          {/* Top crust — slightly lighter, cracked surface texture */}
          <mesh
            position={[0, H / 2 - 0.01, 0]}
            scale={[b.scaleX * 0.98, 1, b.scaleZ * 0.98]}
          >
            <boxGeometry args={[W * 0.98, 0.06, D * 0.98]} />
            <meshStandardMaterial
              color="#4a1f0e"
              roughness={0.92}
              metalness={0.0}
            />
          </mesh>

          {/* Glossy chocolate glaze pooled on top surface */}
          <mesh
            position={[0, H / 2 + 0.03, 0]}
            scale={[b.scaleX * 0.88, 1, b.scaleZ * 0.88]}
          >
            <boxGeometry args={[W * 0.88, 0.04, D * 0.88]} />
            <meshStandardMaterial
              color="#8B4513"
              roughness={0.12}
              metalness={0.35}
            />
          </mesh>

          {/* Crack line on front face */}
          <mesh position={[0, 0, D / 2 + 0.001]}>
            <boxGeometry args={[W * 0.85, 0.03, 0.01]} />
            <meshStandardMaterial color="#3a1508" roughness={1.0} />
          </mesh>
          {/* Crack line on back face */}
          <mesh position={[0, 0, -(D / 2 + 0.001)]}>
            <boxGeometry args={[W * 0.85, 0.03, 0.01]} />
            <meshStandardMaterial color="#3a1508" roughness={1.0} />
          </mesh>
        </group>
      ))}

      {/* ── Chocolate drip blobs on edges ─────────────────────────── */}
      {DRIPS.map((d, i) => (
        <mesh key={`drip-${i}`} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[d.s, 14, 10]} />
          <meshStandardMaterial
            color="#7a3010"
            roughness={0.16}
            metalness={0.28}
          />
        </mesh>
      ))}

      {/* ── Glossy fudge puddles on top surfaces ──────────────────── */}
      {TOP_GLOSSES.map((g, i) => (
        <mesh
          key={`gloss-${i}`}
          position={[g.x, g.y, g.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.28 + i * 0.04, 24]} />
          <meshStandardMaterial
            color="#9B5523"
            roughness={0.12}
            metalness={0.30}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* ── Chocolate drizzle streaks across the top brownie ──────── */}
      <mesh position={[0.05, 0.60, 0.10]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.62, 0.03, 0.06]} />
        <meshStandardMaterial color="#9B5523" roughness={0.14} metalness={0.25} />
      </mesh>
      <mesh position={[-0.12, 0.60, -0.08]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.50, 0.03, 0.05]} />
        <meshStandardMaterial color="#9B5523" roughness={0.14} metalness={0.25} />
      </mesh>
      <mesh position={[0.20, 0.60, -0.20]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.04]} />
        <meshStandardMaterial color="#9B5523" roughness={0.14} metalness={0.25} />
      </mesh>

    </group>
  );
}

// ─── Floating cocoa particles ──────────────────────────────────────────────
function FlourParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.position.y = (state.clock.elapsedTime * 0.1) % 10;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        opacity={0.35}
        size={0.045}
        color="#EBCDB7"
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

// ─── Canvas ────────────────────────────────────────────────────────────────
export default function ThreeHero() {
  const [lost, setLost] = useState(false);
  if (lost) return null;

  return (
    <Canvas
      // Slightly above and in front — sees the full stack from ~30° above,
      // matching the perspective of the reference brownie photo
      camera={{ position: [0, 2.2, 8], fov: 38 }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => setLost(true));
      }}
    >
      {/* Strong warm ambient so brownies are never fully dark */}
      <ambientLight intensity={1.8} color="#EBCDB7" />

      {/* Key light — upper front-right, bright warm spotlight on the stack */}
      <pointLight position={[3, 5, 4]} color="#FFD4A0" intensity={18} />

      {/* Fill light — left side, prevents the shadow side going black */}
      <pointLight position={[-4, 3, 3]} color="#EBCDB7" intensity={8} />

      {/* Front fill — directly in front, lifts the facing surfaces */}
      <pointLight position={[0, 1, 6]} color="#FFE8C8" intensity={6} />

      {/* Rim light — warm caramel glow on edges from behind */}
      <pointLight position={[0, -1, -4]} color="#957662" intensity={4} />

      <BrownieStack />
      <FlourParticles />
    </Canvas>
  );
}

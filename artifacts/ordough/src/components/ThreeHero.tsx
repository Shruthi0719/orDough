import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Brownie stack ─────────────────────────────────────────────────────────
// 6 brownies arranged like the reference photo:
// 3 on the bottom row, 2 on the middle, 1 on top.
// Each is a slightly imperfect box — different rotY and minor scale variation
// to look hand-cut and hand-stacked, not machine-stamped.
//
// COLORS chosen from real brownie photography:
//   Body:  #3B1A0A  — very dark roasted chocolate (not red, not black)
//   Crust: #5C2E0E  — slightly lighter cracked top surface
//   Glaze: #6B3812  — glossy fudge drizzle (low roughness + metalness)
//
// NO spheres, NO drip blobs. Just the boxes, a crust layer, and a glaze strip.

const BROWNIE_COLOR   = "#3B1A0A"; // dark chocolate body
const CRUST_COLOR     = "#5C2E0E"; // top crust, slightly lighter
const GLAZE_COLOR     = "#7A4518"; // glossy top glaze

// [x, y, z, rotY (radians), scaleX, scaleZ]
const LAYERS = [
  // Bottom row — three brownies
  { x: -1.12, y: -1.00, z:  0.08, ry:  0.06, sx: 1.00, sz: 1.00 },
  { x:  0.02, y: -1.00, z: -0.10, ry: -0.04, sx: 1.01, sz: 0.98 },
  { x:  1.14, y: -1.00, z:  0.07, ry:  0.09, sx: 0.99, sz: 1.01 },
  // Middle row — two brownies sitting across the gaps
  { x: -0.56, y: -0.32, z:  0.04, ry: -0.11, sx: 1.00, sz: 0.99 },
  { x:  0.58, y: -0.32, z: -0.06, ry:  0.08, sx: 1.00, sz: 1.01 },
  // Top — one brownie
  { x:  0.02, y:  0.36, z:  0.00, ry:  0.13, sx: 1.00, sz: 1.00 },
];

// Brownie slab dimensions (width × height × depth)
const W = 1.05; // width of one brownie
const H = 0.50; // thickness (fudgy, not too thin)
const D = 0.90; // depth

function SingleBrownie({
  x, y, z, ry, sx, sz,
}: {
  x: number; y: number; z: number;
  ry: number; sx: number; sz: number;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, ry, 0]}>

      {/* Main body — deep dark chocolate */}
      <mesh scale={[sx, 1, sz]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial
          color={BROWNIE_COLOR}
          roughness={0.88}
          metalness={0.03}
        />
      </mesh>

      {/* Top crust — slightly lighter, sits on top of body */}
      <mesh position={[0, H * 0.5 - 0.005, 0]} scale={[sx * 0.97, 1, sz * 0.97]}>
        <boxGeometry args={[W * 0.97, 0.055, D * 0.97]} />
        <meshStandardMaterial
          color={CRUST_COLOR}
          roughness={0.94}
          metalness={0.0}
        />
      </mesh>

      {/* Glossy glaze strip — pooled chocolate on the top surface */}
      {/* Irregular shape: two overlapping flat boxes at slight angles */}
      <mesh position={[0.04, H * 0.5 + 0.038, 0.02]} rotation={[0, 0.08, 0]} scale={[sx * 0.78, 1, sz * 0.72]}>
        <boxGeometry args={[W * 0.78, 0.028, D * 0.72]} />
        <meshStandardMaterial
          color={GLAZE_COLOR}
          roughness={0.10}
          metalness={0.30}
        />
      </mesh>
      <mesh position={[-0.06, H * 0.5 + 0.036, -0.05]} rotation={[0, -0.12, 0]} scale={[sx * 0.55, 1, sz * 0.50]}>
        <boxGeometry args={[W * 0.55, 0.026, D * 0.50]} />
        <meshStandardMaterial
          color={GLAZE_COLOR}
          roughness={0.10}
          metalness={0.28}
        />
      </mesh>

      {/* Cut-edge crack line — front face, horizontal mid seam */}
      <mesh position={[0, -0.02, D * 0.5 + 0.001]}>
        <boxGeometry args={[W * 0.88, 0.022, 0.008]} />
        <meshStandardMaterial color="#1a0804" roughness={1.0} metalness={0.0} />
      </mesh>
      {/* Cut-edge crack line — back face */}
      <mesh position={[0, -0.02, -(D * 0.5 + 0.001)]}>
        <boxGeometry args={[W * 0.88, 0.022, 0.008]} />
        <meshStandardMaterial color="#1a0804" roughness={1.0} metalness={0.0} />
      </mesh>
      {/* Cut-edge crack line — left face */}
      <mesh position={[-(W * 0.5 + 0.001), -0.02, 0]}>
        <boxGeometry args={[0.008, 0.022, D * 0.88]} />
        <meshStandardMaterial color="#1a0804" roughness={1.0} metalness={0.0} />
      </mesh>
      {/* Cut-edge crack line — right face */}
      <mesh position={[W * 0.5 + 0.001, -0.02, 0]}>
        <boxGeometry args={[0.008, 0.022, D * 0.88]} />
        <meshStandardMaterial color="#1a0804" roughness={1.0} metalness={0.0} />
      </mesh>

    </group>
  );
}

// Chocolate drizzle lines across the top brownie only
// Thin flat boxes that look like poured chocolate streams
function TopDrizzle() {
  const topY = 0.36 + H * 0.5 + 0.055;
  return (
    <group position={[0.02, topY, 0]} rotation={[0, 0.13, 0]}>
      <mesh position={[ 0.08, 0,  0.05]} rotation={[0,  0.25, 0]}>
        <boxGeometry args={[0.58, 0.022, 0.055]} />
        <meshStandardMaterial color={GLAZE_COLOR} roughness={0.08} metalness={0.32} />
      </mesh>
      <mesh position={[-0.14, 0, -0.08]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[0.44, 0.022, 0.048]} />
        <meshStandardMaterial color={GLAZE_COLOR} roughness={0.08} metalness={0.32} />
      </mesh>
      <mesh position={[ 0.18, 0, -0.18]} rotation={[0,  0.55, 0]}>
        <boxGeometry args={[0.30, 0.022, 0.040]} />
        <meshStandardMaterial color={GLAZE_COLOR} roughness={0.08} metalness={0.32} />
      </mesh>
    </group>
  );
}

function BrownieStack() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow Y-axis rotation only — stack never tilts or tumbles
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      // Gentle float
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.10;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {LAYERS.map((b, i) => (
        <SingleBrownie key={i} {...b} />
      ))}
      <TopDrizzle />
    </group>
  );
}

// ─── Floating cocoa dust particles ────────────────────────────────────────
function FlourParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 180;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.position.y = (state.clock.elapsedTime * 0.08) % 10;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        opacity={0.30}
        size={0.042}
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
      // Camera sits above and slightly in front — you see the full stack
      // from ~25° above, like looking at brownies on a plate
      camera={{ position: [0, 2.5, 8.5], fov: 36 }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => setLost(true));
      }}
    >
      {/* Warm ambient — enough to see all faces, not blow out the colours */}
      <ambientLight intensity={2.2} color="#EBCDB7" />

      {/* Key light — upper front-right, warm, creates the bright glaze highlight */}
      <pointLight position={[4, 6, 5]}   color="#FFD4A0" intensity={22} />

      {/* Left fill — stops the shadow side going flat black */}
      <pointLight position={[-5, 3, 3]}  color="#EBCDB7" intensity={10} />

      {/* Front fill — lifts the facing surfaces */}
      <pointLight position={[0, 1, 7]}   color="#FFE8C8" intensity={8}  />

      {/* Rim — warm caramel edge glow from behind */}
      <pointLight position={[0, -2, -5]} color="#957662" intensity={5}  />

      <BrownieStack />
      <FlourParticles />
    </Canvas>
  );
}
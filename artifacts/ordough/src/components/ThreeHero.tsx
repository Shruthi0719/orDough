import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const SPRINKLE_COLORS = [
  "#79A3C3",
  "#79A3C3",
  "#79A3C3",
  "#D2E2EC",
  "#D2E2EC",
  "#EBCDB7",
  "#957662",
] as const;

function RotatingCupcake() {
  const cupcakeRef = useRef<THREE.Group>(null);
  const sprinkles = useMemo(
    () =>
      Array.from({ length: 68 }, (_, index) => {
        const angle = (index / 68) * Math.PI * 2 + (index % 5) * 0.07;
        const height = 0.4 + Math.random() * 0.9; // on cake body and frosting
        const radius = height > 0.8 ? 0.5 - (height - 0.8) * 0.2 : 0.8; // narrower at top
        const length = index % 6 === 0 ? 0.16 : 0.23;

        return {
          color: SPRINKLE_COLORS[index % SPRINKLE_COLORS.length],
          length,
          position: [
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius,
          ] as [number, number, number],
          rotation: [
            0.62 + (index % 4) * 0.08,
            0.18 + (index % 3) * 0.1,
            angle + (index % 2 ? 0.55 : -0.35),
          ] as [number, number, number],
        };
      }),
    [],
  );

  useFrame((state) => {
    if (cupcakeRef.current) {
      cupcakeRef.current.rotation.x = state.clock.elapsedTime * 0.16;
      cupcakeRef.current.rotation.y = state.clock.elapsedTime * 0.28;
      cupcakeRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={cupcakeRef} position={[0, 0, 0]}>
      {/* Base / wrapper */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[1, 0.8, 1, 32]} />
        <meshStandardMaterial color="#957662" roughness={0.9} />
      </mesh>
      {/* Cake body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.8, 32]} />
        <meshStandardMaterial color="#EBCDB7" roughness={0.85} />
      </mesh>
      {/* Frosting swirl */}
      {Array.from({ length: 5 }, (_, i) => {
        const radius = 0.9 - i * 0.08;
        const y = 0.4 + i * 0.08;
        const rotZ = i * 0.2;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[0, 0, rotZ]}>
            <torusGeometry args={[radius, 0.05, 16, 32]} />
            <meshStandardMaterial color="#D2E2EC" metalness={0.05} roughness={0.3} />
          </mesh>
        );
      })}
      {/* Frosting peak */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#D2E2EC" metalness={0.05} roughness={0.3} />
      </mesh>
      {sprinkles.map((sprinkle, index) => (
        <mesh key={index} position={sprinkle.position} rotation={sprinkle.rotation}>
          <boxGeometry args={[sprinkle.length, 0.06, 0.055]} />
          <meshStandardMaterial color={sprinkle.color} roughness={0.45} emissive={sprinkle.color} emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function FlourParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
  }

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
        opacity={0.4}
        size={0.05}
        color="#D2E2EC"
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function ThreeHero() {
  const [lost, setLost] = useState(false);

  if (lost) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => setLost(true));
      }}
    >
      <ambientLight intensity={0.48} color="#D2E2EC" />
      <pointLight position={[2.5, 2.5, 3]} color="#EBCDB7" intensity={2.25} />
      <pointLight position={[-2, -2, -2]} color="#79A3C3" intensity={1.05} />
      <RotatingCupcake />
      <FlourParticles />
    </Canvas>
  );
}

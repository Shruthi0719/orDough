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

function RotatingDoughnut() {
  const doughnutRef = useRef<THREE.Group>(null);
  const sprinkles = useMemo(
    () =>
      Array.from({ length: 68 }, (_, index) => {
        const angle = (index / 68) * Math.PI * 2 + (index % 5) * 0.07;
        const tubeAngle = 0.3 + ((index * 29) % 132) * (Math.PI / 180);
        const radius = 1.48 + 0.27 * Math.cos(tubeAngle);
        const length = index % 6 === 0 ? 0.16 : 0.23;

        return {
          color: SPRINKLE_COLORS[index % SPRINKLE_COLORS.length],
          length,
          position: [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0.31 + 0.21 * Math.sin(tubeAngle),
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
    if (doughnutRef.current) {
      doughnutRef.current.rotation.x = state.clock.elapsedTime * 0.16;
      doughnutRef.current.rotation.y = state.clock.elapsedTime * 0.28;
      doughnutRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={doughnutRef} position={[0, 0, 0]}>
      <mesh>
        <torusGeometry args={[1.5, 0.43, 48, 140]} />
        <meshStandardMaterial color="#957662" roughness={0.86} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <torusGeometry args={[1.5, 0.28, 36, 140]} />
        <meshStandardMaterial color="#D2E2EC" roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.21]} scale={[1.01, 1.01, 1]}>
        <torusGeometry args={[1.5, 0.18, 24, 100]} />
        <meshStandardMaterial color="#79A3C3" roughness={0.5} metalness={0.01} transparent opacity={0.72} />
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
      <RotatingDoughnut />
      <FlourParticles />
    </Canvas>
  );
}

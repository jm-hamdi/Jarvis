import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { SystemState } from "../../types/events";

interface OrbProps { state: SystemState }

const STATE_COLORS: Record<SystemState, string> = {
  OPTIMAL:        "#22D3EE",
  "UNDER ATTACK": "#EF4444",
  RECOVERING:     "#F59E0B",
  RECOVERED:      "#22C55E",
};

function WireframeSphere({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.3; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.5, 16, 12]} />
      <meshBasicMaterial color={color} wireframe opacity={0.35} transparent />
    </mesh>
  );
}

function Particles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(600);
    for (let i = 0; i < 600; i++) arr[i] = (Math.random() - 0.5) * 6;
    return arr;
  }, []);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y -= delta * 0.05; });
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial size={0.03} color={color} transparent opacity={0.6} />
    </Points>
  );
}

function Ring({ radius, color, speed = 0.5, tilt = Math.PI / 4 }: { radius: number; color: string; speed?: number; tilt?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * speed; });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 4, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

export default function CoreOrb({ state }: OrbProps) {
  const color = STATE_COLORS[state];
  return (
    <div className="panel h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 3]} color={color} intensity={2} />
          <WireframeSphere color={color} />
          <Ring radius={2.2} color={color} speed={0.4} tilt={Math.PI / 5} />
          <Ring radius={2.6} color={color} speed={-0.25} tilt={-Math.PI / 6} />
          <Particles color={color} />
        </Canvas>
      </div>

      {/* Overlay text */}
      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        <span
          className="font-orbitron font-black tracking-[0.3em]"
          style={{ fontSize: 42, color, textShadow: `0 0 30px ${color}` }}
        >
          JARVIS
        </span>
        <span className="font-rajdhani text-[14px] tracking-[0.25em] text-text-sec mt-1">AI CORE</span>
        <span className="font-orbitron text-[11px] tracking-widest text-text-off mt-0.5">v3.0.0</span>
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
          <span className="font-rajdhani text-[13px] tracking-widest" style={{ color }}>{state}</span>
        </div>
      </div>

      {/* Ellipse base */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        style={{
          width: 180, height: 20,
          borderRadius: "50%",
          border: `1px solid ${color}40`,
          background: `radial-gradient(ellipse, ${color}12 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

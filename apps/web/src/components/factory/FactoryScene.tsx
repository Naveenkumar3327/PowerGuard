'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Grid, Html, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Machine } from '@powerguard/shared-types';

const MACHINE_POSITIONS: [number, number, number][] = [
  [-4.5, 0, -1.5], [-1.5, 0, -1.5], [1.5, 0, -1.5], [4.5, 0, -1.5],
  [-4.5, 0, 2], [-1.5, 0, 2], [1.5, 0, 2], [4.5, 0, 2],
];

function statusColor(status: string) {
  if (status === 'FAULT') return '#ef7774';
  if (status === 'MAINTENANCE') return '#eabf72';
  if (status === 'RUNNING') return '#8ad6a2';
  return '#62d9e8';
}

function MachineUnit({ machine, position, selected, onSelect }: {
  machine: Machine;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.Mesh>(null);
  const color = statusColor(machine.status);
  const shape = machine.type?.toLowerCase() || '';
  const width = shape.includes('compressor') || shape.includes('pump') ? 1.25 : 1.55;

  useFrame(({ clock }) => {
    if (lamp.current && machine.status === 'FAULT') {
      const pulse = 0.55 + Math.sin(clock.elapsedTime * 2.8) * 0.22;
      (lamp.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };

  return (
    <group ref={group} position={position} onClick={handleClick} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
      <mesh position={[0, 0.09, 0]} receiveShadow>
        <boxGeometry args={[2.45, 0.12, 1.8]} />
        <meshStandardMaterial color={selected ? '#253d43' : '#17232a'} roughness={0.82} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[width, 1.2, 1.1]} />
        <meshStandardMaterial color={selected ? '#32464a' : '#27343a'} roughness={0.54} metalness={0.62} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[width * 0.72, 0.12, 0.92]} />
        <meshStandardMaterial color="#75838a" roughness={0.45} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.82, 0.57]}>
        <boxGeometry args={[width * 0.55, 0.48, 0.035]} />
        <meshStandardMaterial color="#10191e" emissive={color} emissiveIntensity={selected ? 0.23 : 0.07} />
      </mesh>
      <mesh ref={lamp} position={[width * 0.35, 1.62, -0.25]}>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={machine.status === 'FAULT' ? 0.6 : 0.26} />
      </mesh>
      <mesh position={[-width * 0.28, 1.53, 0.12]}>
        <cylinderGeometry args={[0.035, 0.035, 0.3, 8]} />
        <meshStandardMaterial color="#a5b2b7" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.18, 40]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.75 : 0.3} />
      </mesh>
      <Html position={[0, 2.05, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={`min-w-[105px] border px-2 py-1 text-center backdrop-blur ${selected ? 'border-cyan-200/50 bg-[#071116]/95' : 'border-white/10 bg-[#071116]/85'}`}>
          <div className="font-mono text-[9px] tracking-wider" style={{ color }}>{machine.machineId} · {machine.status}</div>
          <div className="mt-0.5 max-w-[130px] truncate font-sans text-[10px] text-slate-200">{machine.name}</div>
          <div className="mt-1 font-mono text-[9px] text-cyan-100">{machine.powerKw.toFixed(1)} kW · {machine.loadPercentage.toFixed(0)}%</div>
        </div>
      </Html>
      <mesh position={[0, 0.18, 0.78]}>
        <boxGeometry args={[0.46, 0.08, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.13} />
      </mesh>
    </group>
  );
}

function EnergyRoute({ target, speed, color }: { target: [number, number, number]; speed: number; color: string }) {
  const particle = useRef<THREE.Mesh>(null);
  const points = useMemo(() => [new THREE.Vector3(0, 0.28, -3.3), new THREE.Vector3(0, 0.28, -2.2), new THREE.Vector3(target[0], 0.28, -0.65), new THREE.Vector3(target[0], 0.28, target[2])], [target]);

  useFrame(({ clock }) => {
    if (!particle.current) return;
    const progress = (clock.elapsedTime * speed * 0.08) % 1;
    const curve = new THREE.CatmullRomCurve3(points);
    particle.current.position.copy(curve.getPoint(progress));
  });

  return <>
    <Line points={points} color={color} transparent opacity={0.18} lineWidth={1} />
    <mesh ref={particle}>
      <sphereGeometry args={[0.045, 8, 6]} />
      <meshBasicMaterial color={color} />
    </mesh>
  </>;
}

function FocusCamera({ selectedId, machines, controlsRef }: { selectedId: string | null; machines: Machine[]; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const desiredCamera = useRef(new THREE.Vector3(0, 8.5, 12));

  useEffect(() => {
    const index = machines.findIndex((machine) => machine.machineId === selectedId);
    const position: [number, number, number] = index >= 0
      ? MACHINE_POSITIONS[index % MACHINE_POSITIONS.length]
      : [0, 0, 0];
    target.current.set(...position);
    desiredCamera.current.set(target.current.x, target.current.y + (index >= 0 ? 4.8 : 8.5), target.current.z + (index >= 0 ? 6.5 : 12));
  }, [selectedId, machines]);

  useFrame(() => {
    camera.position.lerp(desiredCamera.current, 0.035);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(target.current, 0.045);
      controls.update();
    }
  });
  return null;
}

export default function FactoryScene({ machines, selectedId, onSelect }: {
  machines: Machine[];
  selectedId: string | null;
  onSelect: (machineId: string) => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 8.5, 12], fov: 40 }} frameloop={reducedMotion ? 'demand' : 'always'} shadows={!reducedMotion} gl={{ antialias: false, powerPreference: 'low-power' }}>
      <color attach="background" args={['#080e13']} />
      <fog attach="fog" args={['#080e13', 15, 27]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 9, 5]} intensity={2.2} color="#c7e2e4" castShadow={!reducedMotion} />
      <pointLight position={[0, 3.5, -3.3]} intensity={18} distance={10} color="#62d9e8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[22, 17]} />
        <meshStandardMaterial color="#0b1319" roughness={0.95} metalness={0.18} />
      </mesh>
      <Grid position={[0, 0.015, 0]} args={[20, 16]} cellSize={1} cellThickness={0.6} cellColor="#233640" sectionSize={4} sectionThickness={1} sectionColor="#31505a" fadeDistance={18} infiniteGrid={false} />
      <mesh position={[0, 0.16, -3.3]}>
        <boxGeometry args={[1.8, 0.28, 1.1]} />
        <meshStandardMaterial color="#27383e" metalness={0.65} roughness={0.45} />
      </mesh>
      <Html position={[0, 0.65, -3.3]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className="border border-cyan-200/20 bg-[#081116]/90 px-3 py-1.5 text-center"><div className="font-mono text-[9px] tracking-widest text-cyan-100">MAIN DISTRIBUTION</div><div className="mt-0.5 font-mono text-[8px] text-slate-500">400V · 3-PHASE</div></div>
      </Html>
      {machines.map((machine, index) => {
        const position = MACHINE_POSITIONS[index % MACHINE_POSITIONS.length];
        return <group key={machine.machineId}>
          <EnergyRoute target={position} speed={Math.max(0.5, machine.loadPercentage / 40)} color={statusColor(machine.status)} />
          <MachineUnit machine={machine} position={position} selected={selectedId === machine.machineId} onSelect={() => onSelect(machine.machineId)} />
        </group>;
      })}
      <FocusCamera selectedId={selectedId} machines={machines} controlsRef={controlsRef} />
      <OrbitControls ref={controlsRef} makeDefault enableDamping={!reducedMotion} dampingFactor={0.08} minDistance={7} maxDistance={20} maxPolarAngle={Math.PI / 2.05} target={[0, 0, 0]} />
    </Canvas>
  );
}
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface CyberCoreProps {
  primary: string;
  secondary: string;
}

function CoreShape({ primary, secondary }: { primary: string, secondary: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 64]} />
        <MeshDistortMaterial
          color={primary}
          emissive={primary}
          emissiveIntensity={0.5}
          radius={1}
          roughness={0.2}
          metalness={0.8}
          distort={0.4}
          speed={2}
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      
      {/* Inner Glowing Core */}
      <mesh scale={0.8}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={secondary}
          emissive={secondary}
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export default function CyberCore({ primary, secondary }: CyberCoreProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color={primary} />
        <pointLight position={[-10, -10, -10]} intensity={1} color={secondary} />
        
        <CoreShape primary={primary} secondary={secondary} />
        
        <Environment preset="night" />
        
        {/* Soft shadow underneath */}
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.5} 
          scale={10} 
          blur={2.5} 
          far={5} 
          color={primary} 
        />
      </Canvas>
    </div>
  );
}

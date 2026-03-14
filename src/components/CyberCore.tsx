import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// A single floating envelope/data packet
function Envelope({ position, rotation, color, speed }: { position: [number, number, number], rotation: [number, number, number], color: string, speed: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      // Very slow drift upwards or downwards and slight rotation
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 1.5;
      meshRef.current.rotation.x += 0.001 * speed;
      meshRef.current.rotation.y += 0.002 * speed;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} position={position} rotation={rotation}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.8, 0.1]} /> {/* Envelope Shape */}
          <meshPhysicalMaterial 
            color="#0a0a0a"
            emissive={color}
            emissiveIntensity={0.4}
            transparent={true}
            opacity={0.4}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Glowing inner line indicating "data" */}
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[1.0, 0.05]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingEmails() {
  // Generate random envelopes once
  const envelopes = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 20, // X spread
        (Math.random() - 0.5) * 15, // Y spread
        (Math.random() - 0.5) * 10 - 5 // Z spread (push mostly back)
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      color: i % 3 === 0 ? '#00f2fe' : (i % 2 === 0 ? '#00ffaa' : '#ff6b6b'),
      speed: Math.random() * 0.5 + 0.1 // Very slow speed (0.1 to 0.6)
    }));
  }, []);

  return (
    <>
      {envelopes.map(env => (
        <Envelope key={env.id} {...env} />
      ))}
    </>
  );
}

export default function CyberCore() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-60">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {/* Subtle lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[0, 10, 10]} angle={0.4} penumbra={1} intensity={1} color="#00f2fe" />
        <pointLight position={[5, -5, -5]} intensity={0.5} color="#00ffaa" />
        
        <FloatingEmails />
        
        <Environment preset="city" />
        
        {/* Soft shadow floor to ground the elements */}
        <ContactShadows 
          position={[0, -5, 0]} 
          opacity={0.3} 
          scale={30} 
          blur={3} 
          far={10} 
          color="#000000" 
        />
      </Canvas>
    </div>
  );
}

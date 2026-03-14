import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, MeshTransmissionMaterial, Sparkles, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "motion/react";

function GlassCard({ position, rotation, delay }: any) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + delay) * 0.4;
      mesh.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.2 + delay) * 0.1;
      mesh.current.rotation.y = rotation[1] + Math.cos(state.clock.elapsedTime * 0.2 + delay) * 0.1;
    }
  });

  return (
    <mesh position={position} rotation={rotation} ref={mesh} castShadow>
      <boxGeometry args={[3, 2, 0.05]} />
      <MeshTransmissionMaterial 
        backside
        samples={4}
        thickness={0.5}
        chromaticAberration={0.1}
        anisotropy={0.2}
        distortion={0.2}
        distortionScale={0.5}
        temporalDistortion={0.2}
        color="#ffffff"
        transmission={1}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function GlowingCore() {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (outer.current && inner.current) {
      outer.current.rotation.y += 0.005;
      outer.current.rotation.x += 0.005;
      inner.current.rotation.y -= 0.01;
      inner.current.rotation.z -= 0.01;
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      inner.current.scale.set(scale, scale, scale);
    }
  });
  
  return (
    <group>
      {/* Outer Wireframe */}
      <mesh ref={outer}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#a855f7" 
          emissiveIntensity={2} 
          wireframe 
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Inner Solid Core */}
      <mesh ref={inner}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#60a5fa" 
          emissiveIntensity={4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

export default function ThreeVisualization() {
  return (
    <section className="py-32 relative h-[800px] overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 14], fov: 35 }} gl={{ antialias: false }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.1} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={3} color="#c084fc" />
          <pointLight position={[-10, -10, -10]} intensity={2} color="#38bdf8" />
          <pointLight position={[0, 5, -5]} intensity={2} color="#818cf8" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <GlowingCore />
          </Float>
          
          {/* Ethereal Particles */}
          <Sparkles count={300} scale={12} size={2} speed={0.4} opacity={0.4} color="#e879f9" />
          <Sparkles count={200} scale={10} size={3} speed={0.2} opacity={0.2} color="#38bdf8" />
          
          <GlassCard position={[-3.5, 1.5, 2]} rotation={[0.2, 0.5, 0]} delay={0} />
          <GlassCard position={[3.5, -1.5, 1]} rotation={[-0.2, -0.5, 0]} delay={1} />
          <GlassCard position={[0, 2.5, -2]} rotation={[0.5, 0, 0.2]} delay={2} />
          <GlassCard position={[-2.5, -2.5, -1]} rotation={[-0.5, 0.2, -0.2]} delay={3} />

          <Environment preset="city" />
          <ContactShadows position={[0, -5, 0]} opacity={0.6} scale={40} blur={2.5} far={6} color="#8b5cf6" />
          
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.2} 
              mipmapBlur 
              intensity={1.5} 
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none z-10" />

      <div className="container mx-auto px-6 relative z-20 pointer-events-none flex justify-center md:justify-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md text-center md:text-left bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/[0.05]"
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
            The core of <br/><span className="text-gradient-primary">intelligence.</span>
          </h2>
          <p className="text-xl text-muted font-light">
            Watch as our AI engine processes thousands of data points in real-time, sorting the signal from the noise with absolute precision.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, MeshTransmissionMaterial, Sparkles, Float, Text3D, Center, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "motion/react";

const FONT_URL = "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json";

function GlassEnvelope({ position, rotation, delay }: any) {
  const mesh = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + delay) * 0.4;
      mesh.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.2 + delay) * 0.1;
      mesh.current.rotation.y = rotation[1] + Math.cos(state.clock.elapsedTime * 0.2 + delay) * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={mesh}>
      <RoundedBox args={[3.2, 2.2, 0.2]} radius={0.05} smoothness={4} castShadow>
        <MeshTransmissionMaterial 
          backside samples={4} thickness={0.8} chromaticAberration={0.15}
          anisotropy={0.3} distortion={0.2} distortionScale={0.5} temporalDistortion={0.1}
          color="#e0f2fe" transmission={1} roughness={0.1}
          clearcoat={1} clearcoatRoughness={0.1} ior={1.5}
        />
      </RoundedBox>
      {/* Etched Glass / Glowing lines representing envelope folds */}
      <mesh position={[0, 0, 0.11]} rotation={[0, 0, -Math.PI / 2]}>
         <cylinderGeometry args={[0.015, 0.015, 3, 8]} />
         <meshStandardMaterial emissive="#38bdf8" emissiveIntensity={2} color="#00f2fe" transparent opacity={0.6}/>
      </mesh>
      <mesh position={[-0.8, -0.4, 0.11]} rotation={[0, 0, -Math.PI / 5]}>
         <cylinderGeometry args={[0.015, 0.015, 1.8, 8]} />
         <meshStandardMaterial emissive="#38bdf8" emissiveIntensity={2} color="#00f2fe" transparent opacity={0.6}/>
      </mesh>
      <mesh position={[0.8, -0.4, 0.11]} rotation={[0, 0, Math.PI / 5]}>
         <cylinderGeometry args={[0.015, 0.015, 1.8, 8]} />
         <meshStandardMaterial emissive="#38bdf8" emissiveIntensity={2} color="#00f2fe" transparent opacity={0.6}/>
      </mesh>
    </group>
  );
}

function MetallicAtSymbol({ position, rotation, delay }: any) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.5;
      group.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.15;
      group.current.rotation.y = rotation[1] + Math.cos(state.clock.elapsedTime * 0.3 + delay) * 0.15;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={group}>
      <Center>
        <Text3D 
          font={FONT_URL}
          size={2.5}
          height={0.4}
          curveSegments={32}
          bevelEnabled
          bevelThickness={0.06}
          bevelSize={0.04}
          bevelSegments={8}
          castShadow
        >
          @
          <meshPhysicalMaterial 
            metalness={1} 
            roughness={0.15} 
            color="#00ffaa"
            emissive="#00ffaa"
            emissiveIntensity={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2.5}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function DiamondShield({ position, rotation, delay }: any) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.3;
      group.current.rotation.x = rotation[0] + state.clock.elapsedTime * 0.4;
      group.current.rotation.y = rotation[1] + state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={group}>
      <mesh castShadow>
        <octahedronGeometry args={[1.5, 0]} />
        <MeshTransmissionMaterial 
          samples={4} thickness={1.5} chromaticAberration={0.4}
          anisotropy={0.5} distortion={0.3} color="#c084fc"
          transmission={0.95} roughness={0.05} clearcoat={1} ior={1.8}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} color="#a855f7" emissive="#7e22ce" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

function HoveringSphere({ position, rotation, delay }: any) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 + delay) * 0.6;
      group.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.2 + delay) * 0.1;
      group.current.rotation.y = rotation[1] + Math.cos(state.clock.elapsedTime * 0.4 + delay) * 0.2;
    }
  });

  return (
    <group position={position} rotation={rotation} ref={group}>
      <mesh castShadow>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial 
          metalness={1} 
          roughness={0.05} 
          color="#38bdf8"
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={3}
        />
      </mesh>
    </group>
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
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      inner.current.scale.set(scale, scale, scale);
    }
  });
  
  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#00f2fe" emissive="#00f2fe" emissiveIntensity={1.5} 
          wireframe transparent opacity={0.6}
        />
      </mesh>
      
      <mesh ref={inner}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial 
          color="#ffffff" emissive="#ffffff" emissiveIntensity={2}
          roughness={0.1} metalness={0.5} clearcoat={1}
        />
      </mesh>
    </group>
  );
}

export default function ThreeVisualization() {
  return (
    <section className="py-32 relative h-[800px] overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 14], fov: 35 }} 
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
        >
          <color attach="background" args={['#020202']} />
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} intensity={5} color="#c084fc" />
          <pointLight position={[-10, -10, -10]} intensity={3} color="#38bdf8" />
          <pointLight position={[0, 8, -5]} intensity={4} color="#00ffaa" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <GlowingCore />
          </Float>
          
          <Sparkles count={400} scale={14} size={1.5} speed={0.5} opacity={0.5} color="#00f2fe" />
          <Sparkles count={200} scale={10} size={2.5} speed={0.3} opacity={0.3} color="#00ffaa" />
          
          {/* Hyper-realistic floating elements */}
          <GlassEnvelope position={[-4, 2, 2.5]} rotation={[0.2, 0.4, 0.1]} delay={0} />
          <MetallicAtSymbol position={[4, -1.5, 1.5]} rotation={[-0.1, -0.4, 0.2]} delay={1} />
          <DiamondShield position={[0.5, 3.5, -2]} rotation={[0.4, 0.2, 0.2]} delay={2} />
          <HoveringSphere position={[-3.5, -3, -1]} rotation={[-0.5, 0.3, -0.2]} delay={3} />

          <Environment preset="city" />
          <ContactShadows position={[0, -5, 0]} opacity={0.8} scale={40} blur={2.5} far={6} color="#8b5cf6" />
          
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.5} 
              mipmapBlur 
              intensity={1.2} 
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-transparent to-[#020202] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-transparent to-[#020202] pointer-events-none z-10" />

      <div className="container mx-auto px-6 relative z-20 pointer-events-none flex justify-center md:justify-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md text-center md:text-left bg-black/40 backdrop-blur-xl p-10 rounded-[2rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00f2fe] to-[#00ffaa] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,242,254,0.4)] md:mx-0 mx-auto">
             <div className="w-5 h-5 border-2 border-black rounded-sm transform rotate-45"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-white drop-shadow-md">
            The core of <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] to-[#00ffaa]">intelligence.</span>
          </h2>
          <p className="text-lg text-white/70 font-light leading-relaxed">
            Watch as our AI engine processes thousands of data points in real-time, sorting the signal from the noise with absolute precision.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

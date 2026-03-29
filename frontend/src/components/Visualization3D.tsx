 'use client'
 
 import { Canvas } from '@react-three/fiber'
 import { Float } from '@react-three/drei'
 import { motion } from 'framer-motion'
 
 function EmailCard({ position, color }: { position: [number, number, number]; color: string }) {
   return (
     <Float speed={2} rotationIntensity={0.5} floatIntensity={0.7}>
       <mesh position={position}>
         <boxGeometry args={[1.6, 1, 0.1]} />
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
       </mesh>
     </Float>
   )
 }
 
 export default function Visualization3D() {
   return (
     <section className="py-24" id="visuals">
       <div className="mx-auto max-w-6xl px-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center"
         >
           <p className="text-sm uppercase tracking-[0.2em] text-white/50">3D Visualization</p>
           <h2 className="mt-4 text-4xl font-semibold text-white">A living inbox, in motion</h2>
           <p className="mt-4 text-white/70">
             Watch clutter float away as Inbox Copilot clears your Gmail in real time.
           </p>
         </motion.div>
 
         <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8">
           <div className="relative h-[360px]">
             <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
               <ambientLight intensity={0.6} />
               <pointLight position={[4, 4, 4]} intensity={1.2} color="#38bdf8" />
               <EmailCard position={[-2, 1, 0]} color="#38bdf8" />
               <EmailCard position={[1.6, -0.3, -0.6]} color="#a855f7" />
               <EmailCard position={[0.2, -1.4, -1]} color="#22c55e" />
               <EmailCard position={[-0.6, 0.2, 0.4]} color="#f97316" />
             </Canvas>
             <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
           </div>
         </div>
       </div>
     </section>
   )
 }

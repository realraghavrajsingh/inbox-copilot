 'use client'
 
 import { motion } from 'framer-motion'
 import { Canvas } from '@react-three/fiber'
 import { Float } from '@react-three/drei'
 import Link from 'next/link'
 
 function FloatingMail({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
   return (
     <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
       <mesh position={position} rotation={rotation}>
         <boxGeometry args={[1.6, 1, 0.1]} />
         <meshStandardMaterial color="#0ea5e9" emissive="#22d3ee" emissiveIntensity={0.4} />
       </mesh>
     </Float>
   )
 }
 
 function HeroVisual() {
   return (
     <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
       <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
       <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
         <ambientLight intensity={0.6} />
         <pointLight position={[4, 4, 4]} intensity={1.2} color="#38bdf8" />
         <FloatingMail position={[-1.8, 0.6, 0]} rotation={[0.2, -0.6, 0.1]} />
         <FloatingMail position={[1.6, -0.2, -0.5]} rotation={[0.1, 0.8, -0.1]} />
         <FloatingMail position={[0.2, 1.4, -1]} rotation={[0.2, 0.4, 0.2]} />
       </Canvas>
       <div className="absolute bottom-6 left-6 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80 shadow-xl">
         AI sorting in progress…
       </div>
     </div>
   )
 }
 
 export default function Hero() {
   return (
     <section className="relative overflow-hidden pb-24 pt-10">
       <div className="absolute inset-0 -z-10">
         <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />
         <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${(i * 8 + 10) % 90}%`,
                top: `${(i * 13 + 12) % 80}%`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>
       </div>
 
       <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
         <div className="flex items-center gap-3 text-white">
           <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/10">
             <img src="/logo.png" alt="Inbox Copilot" className="h-full w-full object-cover" />
           </div>
           <span className="text-lg font-semibold">Inbox Copilot</span>
         </div>
         <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
           <a href="#features" className="hover:text-white">Features</a>
           <a href="#how" className="hover:text-white">How it Works</a>
           <a href="#pricing" className="hover:text-white">Pricing</a>
           <a href="#security" className="hover:text-white">Security</a>
         </div>
         <Link
           href="/login"
           className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
         >
           Connect Gmail
         </Link>
       </nav>
 
       <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
         <motion.div
           initial={{ opacity: 0, y: 24 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
         >
           <p className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
             AI-First Gmail Cleanup
           </p>
           <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
             Your AI Copilot for a Clean Gmail Inbox
           </h1>
           <p className="mt-6 max-w-xl text-lg text-white/70">
             Automatically find spam, old emails, and thousands of unread messages eating your Gmail storage.
           </p>
           <div className="mt-8 flex flex-wrap gap-4">
             <Link
               href="/login"
               className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-cyan-500/30 transition hover:-translate-y-0.5"
             >
               Connect Gmail
             </Link>
             <button className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-base text-white/80 transition hover:bg-white/10">
               Watch Demo
             </button>
           </div>
           <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
             <span>• No credit card required</span>
             <span>• Google OAuth secure</span>
             <span>• Privacy-first processing</span>
           </div>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 24 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
         >
           <HeroVisual />
         </motion.div>
       </div>
     </section>
   )
 }

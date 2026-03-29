 'use client'
 
 import { motion } from 'framer-motion'
 import { ShieldCheck, ScanLine, Sparkles, CheckCircle2 } from 'lucide-react'
 
 const steps = [
   { icon: ShieldCheck, title: 'Connect Gmail securely', desc: 'Google OAuth keeps your account protected.' },
   { icon: ScanLine, title: 'Inbox Copilot scans', desc: 'AI maps clutter, spam, and storage drains.' },
   { icon: Sparkles, title: 'AI identifies junk', desc: 'Smart categories surface what to clean.' },
   { icon: CheckCircle2, title: 'Clean in one click', desc: 'Bulk delete and archive instantly.' },
 ]
 
 export default function HowItWorks() {
   return (
     <section className="py-24" id="how">
       <div className="mx-auto max-w-6xl px-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center"
         >
           <p className="text-sm uppercase tracking-[0.2em] text-white/50">How it works</p>
           <h2 className="mt-4 text-4xl font-semibold text-white">A clean inbox in four steps</h2>
         </motion.div>
 
         <div className="relative mt-12 grid gap-6 md:grid-cols-4">
           <div className="absolute left-1/2 top-6 hidden h-0.5 w-[70%] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-cyan-500/40 md:block" />
           {steps.map((step, idx) => {
             const Icon = step.icon
             return (
               <motion.div
                 key={step.title}
                 initial={{ opacity: 0, y: 16 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: idx * 0.05 }}
                 className="glass-card relative rounded-3xl p-6 text-center"
               >
                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                   <Icon size={22} />
                 </div>
                 <h3 className="text-base font-semibold text-white">{step.title}</h3>
                 <p className="mt-2 text-sm text-white/60">{step.desc}</p>
               </motion.div>
             )
           })}
         </div>
       </div>
     </section>
   )
 }

 'use client'
 
 import { motion } from 'framer-motion'
 import { Brain, Trash, Filter, Gauge, Calendar, Lock } from 'lucide-react'
 
 const features = [
   { icon: Brain, title: 'AI Email Detection', desc: 'Models trained on Gmail patterns spot junk fast.' },
   { icon: Trash, title: 'Bulk Delete Emails', desc: 'Remove thousands of messages with one click.' },
   { icon: Filter, title: 'Smart Filters', desc: 'Segment senders by intent and frequency.' },
   { icon: Gauge, title: 'Storage Analyzer', desc: 'See what’s consuming Gmail storage.' },
   { icon: Calendar, title: 'Email Timeline', desc: 'Track clutter trends over time.' },
   { icon: Lock, title: 'Privacy First', desc: 'We never store email content.' },
 ]
 
 export default function Features() {
   return (
     <section className="py-24" id="features">
       <div className="mx-auto max-w-6xl px-6">
         <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
           <div>
             <p className="text-sm uppercase tracking-[0.2em] text-white/50">Features</p>
             <h2 className="mt-4 text-4xl font-semibold text-white">Everything you need to hit inbox zero</h2>
           </div>
           <p className="max-w-md text-sm text-white/60">
             Built for speed, privacy, and control — without the Gmail chaos.
           </p>
         </div>
 
         <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {features.map((feature, idx) => {
             const Icon = feature.icon
             return (
               <motion.div
                 key={feature.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: idx * 0.05 }}
                 className="group glass-card rounded-3xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-white/20"
               >
                 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                   <Icon size={22} />
                 </div>
                 <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                 <p className="mt-2 text-sm text-white/60">{feature.desc}</p>
               </motion.div>
             )
           })}
         </div>
       </div>
     </section>
   )
 }

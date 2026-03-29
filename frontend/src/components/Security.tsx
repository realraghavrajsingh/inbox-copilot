 'use client'
 
 import { motion } from 'framer-motion'
 import { ShieldCheck, Lock, EyeOff, Key } from 'lucide-react'
 
 const items = [
   { icon: ShieldCheck, title: 'Google OAuth', desc: 'Secure, industry-standard authentication.' },
   { icon: EyeOff, title: 'No email content stored', desc: 'We never save message bodies.' },
   { icon: Lock, title: 'Read-only access', desc: 'You approve every deletion.' },
   { icon: Key, title: 'Encrypted processing', desc: 'Data encrypted in transit and at rest.' },
 ]
 
 export default function Security() {
   return (
     <section className="py-24" id="security">
       <div className="mx-auto max-w-6xl px-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center"
         >
           <p className="text-sm uppercase tracking-[0.2em] text-white/50">Security</p>
           <h2 className="mt-4 text-4xl font-semibold text-white">Built for trust</h2>
         </motion.div>
 
         <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           {items.map((item) => {
             const Icon = item.icon
             return (
               <motion.div
                 key={item.title}
                 initial={{ opacity: 0, y: 16 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="glass-card rounded-3xl p-6 text-center"
               >
                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                   <Icon size={22} />
                 </div>
                 <h3 className="text-base font-semibold text-white">{item.title}</h3>
                 <p className="mt-2 text-xs text-white/60">{item.desc}</p>
               </motion.div>
             )
           })}
         </div>
       </div>
     </section>
   )
 }

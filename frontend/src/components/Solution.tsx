 'use client'
 
 import { motion } from 'framer-motion'
 import { Sparkles, Trash2, Inbox, Layers, Database } from 'lucide-react'
 
 const solutions = [
   { icon: Sparkles, title: 'AI Spam Detection', desc: 'Find spam and suspicious senders instantly.' },
   { icon: Trash2, title: 'Bulk Email Cleaner', desc: 'Delete thousands of emails in seconds.' },
   { icon: Inbox, title: 'Unread Email Finder', desc: 'Surface old unread emails you forgot.' },
   { icon: Layers, title: 'Smart Categories', desc: 'Auto-label by intent and sender patterns.' },
   { icon: Database, title: 'Storage Cleaner', desc: 'Free space by removing large email chains.' },
 ]
 
 export default function Solution() {
   return (
     <section className="py-24" id="solution">
       <div className="mx-auto max-w-6xl px-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
         >
           <p className="text-sm uppercase tracking-[0.2em] text-white/50">The Solution</p>
           <h2 className="mt-4 text-4xl font-semibold text-white">
             Inbox Copilot Fixes It In Seconds
           </h2>
         </motion.div>
 
         <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {solutions.map((item) => {
             const Icon = item.icon
             return (
               <motion.div
                 key={item.title}
                 initial={{ opacity: 0, y: 16 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="group glass-card rounded-3xl p-6 transition hover:-translate-y-1 hover:border-white/20"
               >
                 <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                   <Icon size={22} />
                 </div>
                 <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                 <p className="mt-2 text-sm text-white/60">{item.desc}</p>
               </motion.div>
             )
           })}
         </div>
       </div>
     </section>
   )
 }

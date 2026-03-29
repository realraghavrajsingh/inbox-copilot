 'use client'
 
import { motion, useMotionValue, animate, useMotionValueEvent } from 'framer-motion'
import { useEffect, useState } from 'react'
 
 function Counter({ value, suffix }: { value: number; suffix?: string }) {
   const count = useMotionValue(0)
  const [display, setDisplay] = useState('0')
 
   useEffect(() => {
     const controls = animate(count, value, { duration: 1.6, ease: 'easeOut' })
     return controls.stop
   }, [count, value])

  useMotionValueEvent(count, 'change', (latest) => {
    setDisplay(String(Math.round(latest)))
  })
 
   return (
     <motion.span className="text-3xl font-semibold text-white">
      {display}
       {suffix}
     </motion.span>
   )
 }
 
 export default function Problem() {
   return (
     <section className="py-24" id="problem">
       <div className="mx-auto max-w-6xl px-6">
         <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
           >
             <p className="text-sm uppercase tracking-[0.2em] text-white/50">The Problem</p>
             <h2 className="mt-4 text-4xl font-semibold text-white">
               Your Inbox Is Out of Control
             </h2>
             <p className="mt-4 text-white/70">
               Gmail wasn’t built for modern email volume. Important messages are buried beneath
               promotions, spam, and unread noise.
             </p>
           </motion.div>
 
           <div className="grid gap-6 sm:grid-cols-3">
             {[
               { label: 'Unread emails', value: 20000, suffix: '+' },
               { label: 'Spam & junk', value: 6400, suffix: '+' },
               { label: 'Storage used', value: 92, suffix: '%' },
             ].map((item) => (
               <motion.div
                 key={item.label}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="glass-card rounded-3xl p-6 text-center shadow-xl"
               >
                 <Counter value={item.value} suffix={item.suffix} />
                 <p className="mt-2 text-sm text-white/60">{item.label}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </div>
     </section>
   )
 }

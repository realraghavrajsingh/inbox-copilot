 'use client'
 
 import { motion } from 'framer-motion'
 
 const testimonials = [
   {
     quote: 'I deleted 35,000 emails in 30 seconds. Inbox Copilot is magic.',
     name: 'Ava Morgan',
     role: 'Founder, Loomly',
   },
   {
     quote: 'We saved 12GB of Gmail storage across our team in a single afternoon.',
     name: 'Jordan Lee',
     role: 'Ops Lead, Spline',
   },
   {
     quote: 'The AI categories are so accurate it feels like a concierge for my inbox.',
     name: 'Priya Shah',
     role: 'Product Manager',
   },
 ]
 
 export default function Testimonials() {
   return (
     <section className="py-24" id="testimonials">
       <div className="mx-auto max-w-6xl px-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
         >
           <p className="text-sm uppercase tracking-[0.2em] text-white/50">Testimonials</p>
           <h2 className="mt-4 text-4xl font-semibold text-white">Loved by inbox-heavy teams</h2>
         </motion.div>
 
         <div className="mt-10 grid gap-6 md:grid-cols-3">
           {testimonials.map((item) => (
             <motion.div
               key={item.name}
               initial={{ opacity: 0, y: 16 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="glass-card rounded-3xl p-6"
             >
               <p className="text-base text-white/80">"{item.quote}"</p>
               <div className="mt-6">
                 <p className="text-sm font-semibold text-white">{item.name}</p>
                 <p className="text-xs text-white/50">{item.role}</p>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   )
 }

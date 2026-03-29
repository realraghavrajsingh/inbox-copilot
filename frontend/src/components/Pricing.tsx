 'use client'
 
 import { motion } from 'framer-motion'
 import { Check } from 'lucide-react'
 
 const plans = [
   {
     name: 'Free',
     price: '$0',
     desc: 'Perfect for a quick cleanup',
     features: ['1,000 deletions', 'Spam detection', 'Basic analytics'],
   },
   {
     name: 'Pro',
     price: '$12',
     desc: 'For power Gmail users',
     features: ['Unlimited deletions', 'AI categories', 'Priority scans'],
     highlight: true,
   },
   {
     name: 'Lifetime',
     price: '$149',
     desc: 'One-time payment, lifetime value',
     features: ['Everything in Pro', 'Lifetime updates', 'VIP support'],
   },
 ]
 
 export default function Pricing() {
   return (
     <section className="py-24" id="pricing">
       <div className="mx-auto max-w-6xl px-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="text-center"
         >
           <p className="text-sm uppercase tracking-[0.2em] text-white/50">Pricing</p>
           <h2 className="mt-4 text-4xl font-semibold text-white">Choose your cleanup plan</h2>
         </motion.div>
 
         <div className="mt-12 grid gap-6 md:grid-cols-3">
           {plans.map((plan) => (
             <motion.div
               key={plan.name}
               initial={{ opacity: 0, y: 16 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className={`rounded-3xl p-6 ${plan.highlight ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30' : 'glass-card'}`}
             >
               <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
               <p className="mt-2 text-3xl font-semibold text-white">{plan.price}</p>
               <p className="mt-2 text-sm text-white/60">{plan.desc}</p>
               <ul className="mt-6 space-y-3 text-sm text-white/70">
                 {plan.features.map((feature) => (
                   <li key={feature} className="flex items-center gap-2">
                     <Check size={16} className="text-cyan-300" />
                     {feature}
                   </li>
                 ))}
               </ul>
               <button className="mt-6 w-full rounded-2xl bg-white/10 py-3 text-sm text-white transition hover:bg-white/20">
                 Choose plan
               </button>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   )
 }

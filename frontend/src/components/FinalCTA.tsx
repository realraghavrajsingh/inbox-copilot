 import Link from 'next/link'
 
 export default function FinalCTA() {
   return (
     <section className="py-24">
       <div className="mx-auto max-w-6xl px-6">
         <div className="glass-card rounded-3xl px-8 py-12 text-center">
           <h2 className="text-4xl font-semibold text-white">
             Take Back Control of Your Gmail Inbox
           </h2>
           <p className="mt-4 text-white/70">
             Clean Gmail in seconds, free up storage, and stay focused on what matters.
           </p>
           <div className="mt-8 flex flex-wrap justify-center gap-4">
             <Link
               href="/login"
               className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-cyan-500/30 transition hover:-translate-y-0.5"
             >
               Connect Gmail
             </Link>
             <Link
               href="/login"
               className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-base text-white/80 transition hover:bg-white/10"
             >
               Start Free
             </Link>
           </div>
         </div>
       </div>
     </section>
   )
 }

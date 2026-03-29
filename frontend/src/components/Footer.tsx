 import Link from 'next/link'
 
 export default function Footer() {
   return (
     <footer className="border-t border-white/10 py-10">
       <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
         <div className="flex items-center gap-3 text-white">
           <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/10">
             <img src="/logo.png" alt="Inbox Copilot" className="h-full w-full object-cover" />
           </div>
           <span className="font-semibold">Inbox Copilot</span>
         </div>
         <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
           <Link href="#features" className="hover:text-white">Features</Link>
           <Link href="#pricing" className="hover:text-white">Pricing</Link>
           <Link href="#security" className="hover:text-white">Security</Link>
           <Link href="#testimonials" className="hover:text-white">Testimonials</Link>
         </div>
         <p className="text-xs text-white/40">© 2026 Inbox Copilot. All rights reserved.</p>
       </div>
     </footer>
   )
 }

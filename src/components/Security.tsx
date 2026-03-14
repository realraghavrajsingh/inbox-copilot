import { motion } from "motion/react";
import { ShieldCheck, LockKeyhole, EyeOff } from "lucide-react";

export default function Security() {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              Bank-grade security.<br />
              <span className="text-gradient">Zero compromises.</span>
            </h2>
            <p className="text-xl text-muted mb-12 font-light">
              We built Inbox Copilot with privacy at its core. We never read, store, or sell your email content.
            </p>
            
            <div className="space-y-8">
              {[
                { icon: <ShieldCheck className="w-6 h-6 text-white" />, title: "Verified by Google", text: "Passed strict Google OAuth security assessments." },
                { icon: <EyeOff className="w-6 h-6 text-white" />, title: "Metadata Only", text: "We only analyze headers, never the body of your emails." },
                { icon: <LockKeyhole className="w-6 h-6 text-white" />, title: "Encrypted", text: "All data in transit and at rest is fully encrypted." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-1">{item.title}</h4>
                    <p className="text-muted">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="aspect-square rounded-full border border-white/[0.05] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />
              <div className="w-3/4 h-3/4 rounded-full border border-white/[0.1] flex items-center justify-center relative animate-[spin_30s_linear_infinite]">
                <div className="w-1/2 h-1/2 rounded-full border border-white/[0.15] flex items-center justify-center animate-[spin_20s_linear_infinite_reverse]">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/[0.2] backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                    <LockKeyhole className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

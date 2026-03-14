import { motion } from "motion/react";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section className="py-32 relative" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-md"
          >
            <span className="text-sm font-medium text-purple-400 tracking-wide">100% Free Access</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Simple pricing. <span className="text-gradient">Infinite value.</span>
          </h2>
          <p className="text-xl text-muted">DigitalClarity is currently in open beta and completely free for all users.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-[1px] rounded-3xl bg-gradient-to-b from-[#00f2fe] to-[#00ffaa]"
          >
            <div className="h-full w-full bg-[#020202] rounded-[calc(1.5rem-1px)] p-8 md:p-12 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2fe]/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center mb-10 border-b border-white/10 pb-10">
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-white">Freemium Beta</h3>
                  <p className="text-muted max-w-xs">Gain full control of your digital hygiene without spending a dime.</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-light tracking-tight text-white">$0</span>
                    <span className="text-muted font-medium uppercase tracking-widest text-sm">forever</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                {["Unlimited email scanning", "AI sender categorization", "Bulk email deletion", "Secure local processing", "No ads or trackers", "Complete privacy control"].map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#00ffaa]" />
                    </div>
                    <span className="text-white/80 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#00f2fe] to-[#00ffaa] text-black hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] hover:scale-[1.02]">
                Start Cleaning Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

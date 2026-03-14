import { motion } from "motion/react";
import { Lock, ScanSearch, BrainCircuit, Sparkles } from "lucide-react";

const steps = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Connect Gmail",
    desc: "Securely connect via Google OAuth. Read-only access."
  },
  {
    icon: <ScanSearch className="w-6 h-6" />,
    title: "Copilot Scans",
    desc: "We analyze your inbox metadata without reading content."
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "AI Analysis",
    desc: "Identifies spam, junk, and old emails automatically."
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "One-Click Clean",
    desc: "Review suggestions and clean your inbox instantly."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            How It Works
          </motion.h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary mb-6 relative z-10 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

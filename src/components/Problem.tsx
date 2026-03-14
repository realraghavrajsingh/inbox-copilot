import { motion } from "motion/react";

export default function Problem() {
  return (
    <section className="py-32 relative border-y border-white/[0.05] bg-white/[0.01]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {[
            { count: "20k+", label: "Unread Emails", desc: "Average inbox clutter" },
            { count: "4.5k", label: "Spam Messages", desc: "Bypassing standard filters" },
            { count: "98%", label: "Storage Full", desc: "Paying for unnecessary space" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="pt-8 md:pt-0 flex flex-col items-center"
            >
              <h3 className="text-5xl md:text-6xl font-medium tracking-tighter mb-4 text-gradient">{item.count}</h3>
              <p className="text-lg font-medium text-white/90 mb-2">{item.label}</p>
              <p className="text-muted text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

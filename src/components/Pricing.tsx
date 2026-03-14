import { motion } from "motion/react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for a quick spring cleaning.",
    features: ["Scan up to 5,000 emails", "Basic AI categorization", "Delete up to 500 emails/mo"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    desc: "For professionals with busy inboxes.",
    features: ["Unlimited email scanning", "Advanced AI spam detection", "Unlimited bulk deletion", "Storage analyzer"],
    cta: "Get Pro",
    popular: true
  }
];

export default function Pricing() {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Simple pricing. <span className="text-gradient">Infinite value.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-[1px] rounded-3xl ${plan.popular ? 'bg-gradient-to-b from-purple-500 to-indigo-500' : 'bg-white/[0.08]'}`}
            >
              <div className="h-full w-full bg-black rounded-[calc(1.5rem-1px)] p-8 flex flex-col relative overflow-hidden">
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-8">
                    <div className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
                      Most Popular
                    </div>
                  </div>
                )}
                <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                <p className="text-muted mb-8 h-10">{plan.desc}</p>
                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-medium tracking-tight">{plan.price}</span>
                  <span className="text-muted">/{plan.period}</span>
                </div>
                
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${plan.popular ? 'bg-white text-black hover:scale-[1.02]' : 'bg-white/[0.05] text-white hover:bg-white/[0.1]'}`}>
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

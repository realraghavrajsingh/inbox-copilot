import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I deleted 35,000 emails in 30 seconds. Inbox Copilot is magic.",
    author: "Sarah Jenkins",
    role: "Product Manager",
    avatar: "https://picsum.photos/seed/sarah/100/100"
  },
  {
    quote: "Finally, an app that actually understands what is spam and what is a newsletter I want to read.",
    author: "David Chen",
    role: "Software Engineer",
    avatar: "https://picsum.photos/seed/david/100/100"
  },
  {
    quote: "Freed up 12GB of Google Drive storage without having to pay for an upgrade. Highly recommended.",
    author: "Elena Rodriguez",
    role: "Freelance Designer",
    avatar: "https://picsum.photos/seed/elena/100/100"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            Loved by Thousands
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-6 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-lg font-medium mb-8 leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-semibold">{t.author}</h4>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

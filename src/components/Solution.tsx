import { motion } from "motion/react";
import { ShieldAlert, Trash2, Search, Inbox, HardDrive } from "lucide-react";

const solutions = [
  {
    icon: <ShieldAlert className="w-6 h-6" />,
    title: "AI Spam Detection",
    description: "Our AI identifies sneaky promotional emails and newsletters that bypass standard filters."
  },
  {
    icon: <Trash2 className="w-6 h-6" />,
    title: "Bulk Email Cleaner",
    description: "Delete thousands of emails at once based on sender, date, or category with a single click."
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Unread Email Finder",
    description: "Instantly surface all unread emails hiding deep in your archives and mark them as read or delete."
  },
  {
    icon: <Inbox className="w-6 h-6" />,
    title: "Smart Categories",
    description: "Automatically group emails by receipts, travel, newsletters, and personal."
  },
  {
    icon: <HardDrive className="w-6 h-6" />,
    title: "Storage Cleaner",
    description: "Find emails with massive attachments and free up gigabytes of Google Drive storage."
  }
];

export default function Solution() {
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
            Inbox Copilot Fixes It <span className="text-gradient">In Seconds</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {solutions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`glass-card p-6 border border-white/10 hover:border-primary/50 transition-colors ${i === 3 ? 'lg:col-span-2' : ''} ${i === 4 ? 'lg:col-span-1' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

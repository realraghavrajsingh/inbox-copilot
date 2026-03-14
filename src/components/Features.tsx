import { motion } from "motion/react";
import { Brain, Shield, Zap, BarChart } from "lucide-react";

export default function Features() {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
            Engineered for <span className="text-gradient-primary">efficiency.</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl font-light mx-auto md:mx-0">
            Every feature is designed to save you time and keep your inbox pristine, automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[300px]">
          {/* Large Bento Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-1 glass-panel rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <Brain className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-2xl font-medium mb-2">Neural Spam Detection</h3>
              <p className="text-muted max-w-md">Our proprietary models analyze metadata patterns to catch 99.9% of promotional clutter before you even see it.</p>
            </div>
            {/* Abstract visual */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full" />
          </motion.div>

          {/* Tall Bento Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 md:row-span-2 glass-panel rounded-3xl p-8 flex flex-col relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="w-8 h-8 text-blue-400 mb-4 relative z-10" />
            <h3 className="text-2xl font-medium mb-2 relative z-10">One-Click Bulk Clean</h3>
            <p className="text-muted mb-8 relative z-10">Delete thousands of emails instantly. No more paginating through hundreds of pages.</p>
            
            <div className="flex-1 w-full bg-black/50 rounded-xl border border-white/[0.05] p-4 flex flex-col gap-3 mt-auto relative overflow-hidden z-10">
               <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent z-10" />
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-8 w-full bg-white/[0.05] rounded flex items-center px-3 gap-3">
                   <div className="w-4 h-4 rounded bg-white/10" />
                   <div className="h-2 flex-1 bg-white/10 rounded" />
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Small Bento Boxes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Shield className="w-8 h-8 text-emerald-400 mb-4 relative z-10" />
            <div className="relative z-10">
              <h3 className="text-xl font-medium mb-2">Privacy First</h3>
              <p className="text-muted text-sm">We never read your email content. All processing is done on metadata.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-3xl p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BarChart className="w-8 h-8 text-pink-400 mb-4 relative z-10" />
            <div className="relative z-10">
              <h3 className="text-xl font-medium mb-2">Storage Insights</h3>
              <p className="text-muted text-sm">Visualize what's eating your Google Drive quota and reclaim it.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

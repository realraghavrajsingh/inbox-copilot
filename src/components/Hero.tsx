import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Search, Inbox, Star, Send } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface HeroProps {
  onLogin?: (token: string) => void;
}

const emailsData = [
  { id: 1, sender: "Google Cloud", subject: "Your invoice for March is ready", snippet: "View your statement online...", time: "10:42 AM", dateValue: 5, unread: true },
  { id: 2, sender: "GitHub", subject: "[GitHub] Please verify your device", snippet: "A new sign-in was detected...", time: "9:15 AM", dateValue: 4, unread: true },
  { id: 3, sender: "Stripe", subject: "Payment received: $49.00", snippet: "You received a new payment from...", time: "Yesterday", dateValue: 3, unread: false },
  { id: 4, sender: "Vercel", subject: "Deployment successful", snippet: "Your project has been deployed to...", time: "Yesterday", dateValue: 2, unread: false },
  { id: 5, sender: "Figma", subject: "Sarah left a comment", snippet: "Can we make the logo bigger?...", time: "Mar 10", dateValue: 1, unread: false },
];

export default function Hero({ onLogin }: HeroProps) {
  const [sortBy, setSortBy] = useState<'date' | 'sender'>('date');

  const handleConnectGmail = () => {
    if (window.google) {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        alert("Please set VITE_GOOGLE_CLIENT_ID in your .env file to use Google Login.");
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://mail.google.com/ https://www.googleapis.com/auth/gmail.settings.basic',
        callback: (response: any) => {
          if (response.access_token && onLogin) {
            onLogin(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } else {
      alert("Google Identity Services failed to load. Please check your internet connection and try again.");
    }
  };

  const sortedEmails = [...emailsData].sort((a, b) => {
    if (sortBy === 'date') {
      return b.dateValue - a.dateValue;
    } else {
      return a.sender.localeCompare(b.sender);
    }
  });

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
      
      {/* Spotlight */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white/90 tracking-wide">Introducing Inbox Copilot 2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[7rem] font-medium tracking-tighter leading-[0.9] mb-8 max-w-5xl"
        >
          <span className="text-gradient">Zero inbox.</span><br />
          <span className="text-gradient-primary">Zero effort.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-muted mb-12 max-w-2xl font-light tracking-tight"
        >
          The AI-powered email assistant that automatically clears spam, archives the old, and organizes what matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button onClick={handleConnectGmail} className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
            Connect Gmail <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => {
            const el = document.getElementById('pricing');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} className="w-full sm:w-auto px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-all duration-300 backdrop-blur-md">
            View Pricing
          </button>
        </motion.div>
      </div>
      
      {/* Premium Gmail-like UI Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto mt-24 relative z-20"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-30 pointer-events-none" />
        
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-t-2xl border border-white/[0.15] border-b-0 bg-[#0a0a0a] overflow-hidden relative shadow-[0_-20px_80px_rgba(139,92,246,0.2)] flex flex-col">
          
          {/* Browser/App Top Bar */}
          <div className="h-12 border-b border-white/[0.1] flex items-center px-4 justify-between bg-[#111111]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex-1 max-w-md mx-4">
              <div className="h-7 w-full bg-white/[0.05] rounded-md border border-white/[0.05] flex items-center px-3">
                <Search className="w-3 h-3 text-white/40 mr-2" />
                <span className="text-xs text-white/40 font-medium">Search in mail</span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 shadow-inner" />
          </div>

          {/* App Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 md:w-56 border-r border-white/[0.05] p-3 hidden sm:flex flex-col gap-1 bg-[#0a0a0a]">
               <div className="px-3 py-2 bg-white/[0.08] rounded-md flex items-center gap-3 text-white/90">
                 <Inbox className="w-4 h-4" /> <span className="text-sm font-medium">Inbox</span>
                 <span className="ml-auto text-xs bg-white/10 text-white/90 px-2 py-0.5 rounded-full">2</span>
               </div>
               <div className="px-3 py-2 rounded-md flex items-center gap-3 text-white/50 hover:bg-white/[0.04] transition-colors">
                 <Star className="w-4 h-4" /> <span className="text-sm">Starred</span>
               </div>
               <div className="px-3 py-2 rounded-md flex items-center gap-3 text-white/50 hover:bg-white/[0.04] transition-colors">
                 <Send className="w-4 h-4" /> <span className="text-sm">Sent</span>
               </div>
               
               <div className="mt-6 mb-2 px-3 text-xs font-semibold text-white/30 uppercase tracking-wider">Smart Views</div>
               <div className="px-3 py-2 rounded-md flex items-center gap-3 text-purple-400 bg-purple-500/[0.05] border border-purple-500/20 shadow-[inset_0_0_10px_rgba(139,92,246,0.05)]">
                 <Sparkles className="w-4 h-4" /> <span className="text-sm font-medium">Copilot Clean</span>
               </div>
            </div>

            {/* Email List */}
            <div className="flex-1 flex flex-col bg-[#050505] relative">
              {/* Toolbar */}
              <div className="h-12 border-b border-white/[0.05] flex items-center px-4 gap-4">
                 <div className="w-4 h-4 rounded border border-white/20" />
                 <div className="w-4 h-4 rounded bg-white/10" />
                 <div className="w-4 h-4 rounded bg-white/10" />
                 <div className="w-px h-4 bg-white/10 mx-2" />
                 <div className="w-4 h-4 rounded bg-white/10" />
                 
                 <div className="ml-auto flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.05]">
                   <button 
                     onClick={() => setSortBy('date')}
                     className={`text-xs px-3 py-1 rounded-md transition-colors ${sortBy === 'date' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                   >
                     Date
                   </button>
                   <button 
                     onClick={() => setSortBy('sender')}
                     className={`text-xs px-3 py-1 rounded-md transition-colors ${sortBy === 'sender' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                   >
                     Sender
                   </button>
                 </div>
              </div>
              
              {/* Emails */}
              <div className="flex-1 flex flex-col relative">
                {sortedEmails.map((email) => (
                  <motion.div 
                    layout 
                    key={email.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`h-12 w-full flex items-center px-4 gap-4 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer ${email.unread ? 'bg-white/[0.03]' : ''}`}
                  >
                    <div className={`w-4 h-4 rounded border ${email.unread ? 'border-white/40' : 'border-white/20'} shrink-0`} />
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                      <Star className={`w-3.5 h-3.5 ${email.unread ? 'text-white/20' : 'text-white/10'}`} />
                    </div>
                    <div className={`w-32 truncate text-sm ${email.unread ? 'text-white font-medium' : 'text-white/60'}`}>{email.sender}</div>
                    <div className="flex-1 truncate text-sm flex items-center gap-2">
                      <span className={email.unread ? 'text-white/90 font-medium' : 'text-white/60'}>{email.subject}</span>
                      <span className="text-white/30 hidden md:inline-block">- {email.snippet}</span>
                    </div>
                    <div className={`text-xs w-16 text-right ${email.unread ? 'text-white/90 font-medium' : 'text-white/40'}`}>{email.time}</div>
                  </motion.div>
                ))}
              </div>

              {/* AI Copilot Overlay Toast */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 glass-panel px-4 py-2.5 rounded-full flex items-center gap-3 shadow-[0_10px_40px_rgba(139,92,246,0.3)] border border-purple-500/30 bg-[#0a0a0a]/80 backdrop-blur-xl z-40"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-white/90 whitespace-nowrap">AI removed 1,240 spam emails</span>
                <button className="ml-2 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors text-white">Undo</button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

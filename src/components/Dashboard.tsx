import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScanSearch, 
  Trash2, 
  Ban, 
  ShieldCheck, 
  LogOut,
  Mail,
  Loader2,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { scanInbox, deleteSpecificEmails, blockAndPurge, getUserProfile, SenderData, EMAIL_CATEGORIES } from '../utils/gmail';
import CyberCore from './CyberCore';
import PricingModal from './PricingModal';

const THEMES = {
  cyan: { name: 'Cyan Theme', primary: '#00f2fe', secondary: '#00ffaa' },
  purple: { name: 'Neon Purple', primary: '#9D4EDD', secondary: '#f72585' },
  green: { name: 'Matrix Green', primary: '#06D6A0', secondary: '#38b000' },
  red: { name: 'Crimson Red', primary: '#FF6B6B', secondary: '#ff9f1c' }
};

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusMsg, setScanStatusMsg] = useState("");
  
  const [senders, setSenders] = useState<SenderData[]>([]);
  const [limit, setLimit] = useState<number>(1000);
  const [category, setCategory] = useState<string>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>('cyan');
  const t = THEMES[activeTheme];

  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [expandedSender, setExpandedSender] = useState<string | null>(null);
  const [totalDeleted, setTotalDeleted] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    getUserProfile(token).then(p => {
       setProfile(p);
       if (p?.emailAddress) {
         const stored = localStorage.getItem(`inbox-copilot-deleted-${p.emailAddress}`);
         if (stored) setTotalDeleted(parseInt(stored, 10));
       }
    });
  }, [token]);

  const updateDeletedCount = (count: number) => {
    setTotalDeleted(prev => {
      const next = prev + count;
      if (profile?.emailAddress) {
        localStorage.setItem(`inbox-copilot-deleted-${profile.emailAddress}`, next.toString());
      }
      return next;
    });
  };

  const handleScan = async (scanLimit: number) => {
    setIsScanning(true);
    setScanProgress(0);
    setSenders([]);
    setSelectedEmails(new Set());
    
    try {
      const results = await scanInbox(token, scanLimit, (prog, msg) => {
        setScanProgress(prog);
        setScanStatusMsg(msg);
      });
      setSenders(results);
      setCurrentPage(1); // Reset to first page after scan
    } catch (err: any) {
      alert(err.message || 'An error occurred while scanning emails.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteSender = async (senderEmail: string, emailIds: string[]) => {
    if (totalDeleted >= 1000) {
       setShowPricingModal(true);
       return;
    }
    if (!confirm(`Are you sure you want to delete ${emailIds.length} emails from ${senderEmail}?`)) return;
    
    setScanStatusMsg(`Deleting ${emailIds.length} emails...`);
    setIsScanning(true);
    try {
      const deleted = await deleteSpecificEmails(token, emailIds);
      updateDeletedCount(deleted);
      setSenders(prev => prev.filter(s => s.email !== senderEmail));
      if (expandedSender === senderEmail) setExpandedSender(null);
    } catch(e) {
      console.error(e);
      alert("Failed to delete emails.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleBlockSender = async (senderEmail: string) => {
    if (totalDeleted >= 1000) {
       setShowPricingModal(true);
       return;
    }
    if (!confirm(`Are you sure you want to BLOCK ${senderEmail} and delete all their existing emails?`)) return;
    
    setScanStatusMsg(`Blocking ${senderEmail}...`);
    setIsScanning(true);
    try {
      const deleted = await blockAndPurge(token, senderEmail);
      updateDeletedCount(deleted);
      setSenders(prev => prev.filter(s => s.email !== senderEmail));
      if (expandedSender === senderEmail) setExpandedSender(null);
    } catch(e) {
      console.error(e);
      alert("Failed to block sender.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (totalDeleted >= 1000) {
       setShowPricingModal(true);
       return;
    }
    const list = Array.from(selectedEmails);
    if (list.length === 0) return;
    
    // gather all email ids from selected senders
    const allIdsToPurge: string[] = [];
    senders.forEach(s => {
       if (list.includes(s.email)) {
          allIdsToPurge.push(...s.emails.map(e => e.id));
       }
    });

    if (!confirm(`Are you sure you want to delete ${allIdsToPurge.length} emails from ${list.length} senders?`)) return;

    setScanStatusMsg(`Deleting ${allIdsToPurge.length} emails...`);
    setIsScanning(true);
    try {
      let deletedCount = 0;
      // Depending on API throughput, we could call deleteSpecificEmails for all of them
      deletedCount = await deleteSpecificEmails(token, allIdsToPurge);
      
      updateDeletedCount(deletedCount);
      setSenders(prev => prev.filter(s => !list.includes(s.email)));
      setSelectedEmails(new Set());
    } catch(e) {
      console.error(e);
      alert("Failed to run bulk deletion.");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelectSender = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedEmails(next);
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === filteredSenders.length && filteredSenders.length > 0) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredSenders.map(s => s.email)));
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setCurrentPage(1); // Reset page on category change
    setSelectedEmails(new Set()); // Clear selections to avoid confusion
  }

  // Filter Data
  const filteredSenders = category === 'all' 
    ? senders 
    : senders.filter(s => s.category === category);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSenders.length / ITEMS_PER_PAGE);
  const paginatedSenders = filteredSenders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const totalEmailsScanned = senders.reduce((acc, curr) => acc + curr.count, 0);
  const selectedEmailCount = senders.filter(s => selectedEmails.has(s.email)).reduce((acc, curr) => acc + curr.count, 0);
  const mbSaved = ((totalDeleted * 50) / 1024).toFixed(1);

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden">
      {/* 3D CyberCore Background Component */}
      <CyberCore primary={t.primary} secondary={t.secondary} />

      {/* Background Decor & Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-grid bg-grid-fade opacity-10 pointer-events-none z-0" />
      
      {/* Professional Dashboard Header */}
      <header className="h-20 bg-black/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,242,254,0.05)] flex items-center justify-between px-8 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center p-0.5" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.secondary})`, boxShadow: `0 0 20px ${t.primary}4D` }}>
            <div className="w-full h-full bg-black/80 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" style={{ color: t.primary }}/>
            </div>
          </div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase m-0 flex items-center gap-2" style={{ filter: `drop-shadow(0 0 10px ${t.primary}80)` }}>
             <span className="font-bold">Digital</span>Clarity
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl">
             <select 
               value={activeTheme} 
               onChange={(e) => setActiveTheme(e.target.value as keyof typeof THEMES)}
               className="bg-transparent text-xs font-bold text-white/70 outline-none cursor-pointer border-none"
             >
               {Object.entries(THEMES).map(([key, val]) => (
                 <option key={key} value={key} className="bg-black text-white">{val.name}</option>
               ))}
             </select>
             <div className="w-px h-4 bg-white/20 mx-1" />
             <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold" style={{ background: `linear-gradient(to top right, ${t.primary}, ${t.secondary})`, boxShadow: `0 0 15px ${t.primary}66` }}>
               {profile?.emailAddress ? profile.emailAddress[0].toUpperCase() : 'U'}
             </div>
             <div>
               <div className="text-sm font-bold leading-tight text-white/90">{profile?.emailAddress?.split('@')[0] || 'User'}</div>
               <div className="text-xs text-[#00f2fe] flex items-center gap-1.5 font-medium tracking-wide">
                 <div className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06D6A0] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06D6A0] shadow-[0_0_8px_#06D6A0]"></span>
                 </div>
                 Secure Session
               </div>
             </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,107,107,0.1)] hover:shadow-[0_0_20px_rgba(255,107,107,0.3)]"
          >
            <LogOut className="w-4 h-4" /> Revoke Access & Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8 z-10 relative">
        
        {/* Top Control Panel */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-[#00f2fe]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
           <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00f2fe]/10 rounded-full blur-[80px] pointer-events-none" />
           
           <h2 className="text-white text-xl font-medium mb-6 flex items-center gap-3 tracking-wide">
             <ScanSearch className="w-6 h-6 text-[#00f2fe] drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]" /> 
             Deep Scan Initialization
           </h2>

           <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 w-full">
                <label className="text-xs text-white/50 uppercase tracking-widest font-medium mb-2 block">
                  Scan Depth: {limit} Emails
                </label>
                <input 
                  type="range" min="100" max="5000" step="100" value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full accent-[#00f2fe] bg-white/10 h-2 rounded-full appearance-none outline-none"
                  disabled={isScanning}
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                 <button 
                   onClick={() => handleScan(500)} disabled={isScanning}
                   className="flex-1 md:w-32 py-2.5 rounded-lg border border-[#00f2fe]/30 bg-white/5 hover:bg-[#00f2fe]/10 transition-colors font-bold uppercase text-sm tracking-wide disabled:opacity-50"
                 >
                   Quick Scan
                 </button>
                 <button 
                   onClick={() => handleScan(limit)} disabled={isScanning}
                   className="flex-1 md:w-40 py-2.5 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#00ffaa] text-black hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all transform hover:-translate-y-0.5 font-bold uppercase text-sm tracking-wide disabled:opacity-50 disabled:transform-none"
                 >
                   Deep Scan
                 </button>
              </div>
           </div>

           {/* Progress Bar */}
           {isScanning && (
             <div className="mt-6">
                <div className="flex justify-between text-xs mb-1 text-white/70">
                   <span>{scanStatusMsg}</span>
                   <span>{Math.round(scanProgress * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[#00f2fe] to-[#00ffaa] transition-all duration-300" style={{ width: `${scanProgress * 100}%` }} />
                </div>
             </div>
           )}
        </div>

        {/* Intelligence Board */}
        {!isScanning && senders.length > 0 && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: "Total Emails", val: totalEmailsScanned, glow: "rgba(0,242,254,0.3)" },
                 { label: "Unique Senders", val: senders.length, glow: "rgba(0,255,170,0.3)" },
                 { label: "Emails Purged", val: totalDeleted, glow: "rgba(255,107,107,0.3)" },
                 { label: "Space Freed (MB)", val: mbSaved, glow: "rgba(157,78,221,0.3)" }
               ].map((stat, i) => (
                 <div key={i} className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center hover:border-white/30 hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-[40px] transition-all duration-500 group-hover:blur-[50px]" style={{ backgroundColor: stat.glow.replace('0.3', '0.6') }} />
                    <div className="text-xs text-white/50 uppercase tracking-widest mb-2 relative z-10 font-medium">{stat.label}</div>
                    <div className="text-4xl font-light text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] relative z-10">
                      {stat.val}
                    </div>
                 </div>
               ))}
            </div>

            {/* Bulk Actions Panel */}
            <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
               <div className="flex items-center gap-3">
                 <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[#00f2fe] hover:text-[#00ffaa] bg-[#00f2fe]/10 px-3 py-1.5 rounded border border-[#00f2fe]/20">
                    {selectedEmails.size === filteredSenders.length && filteredSenders.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span className="text-sm font-bold uppercase">Select All</span>
                 </button>
                 <div className="text-sm text-white/80">
                   <strong>{selectedEmails.size}</strong> senders selected ({selectedEmailCount} emails)
                 </div>
               </div>

               {selectedEmails.size > 0 && (
                 <button onClick={handleBulkDelete} className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg uppercase text-sm tracking-wider hover:shadow-[0_0_15px_rgba(255,107,107,0.5)] transition-all">
                   <Trash2 className="w-4 h-4 inline mr-2 -mt-0.5" /> Delete {selectedEmailCount} Emails
                 </button>
               )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
               <button 
                 onClick={() => handleCategoryChange('all')}
                 className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-bold transition-all border ${category === 'all' ? 'bg-[#00f2fe] text-black border-[#00f2fe]' : 'bg-white/5 text-white/80 border-white/20 hover:border-[#00f2fe]'}`}
               >
                 All ({senders.length})
               </button>
               {Object.values(EMAIL_CATEGORIES).map(cat => {
                 if (cat.name.includes("Unknown")) return null;
                 const key = Object.keys(EMAIL_CATEGORIES).find(k=>EMAIL_CATEGORIES[k].name === cat.name)!;
                 const count = senders.filter(s => s.category === key).length;
                 const isSelected = category === key;
                 return (
                   <button 
                     key={cat.name}
                     onClick={() => handleCategoryChange(key)}
                     className={`flex-1 min-w-[120px] py-2 rounded-lg text-sm font-bold transition-all border flex justify-center items-center gap-2 ${isSelected ? 'bg-[#00f2fe] text-black border-[#00f2fe]' : 'bg-white/5 text-white/80 border-white/20 hover:border-[#00f2fe]'}`}
                   >
                     {cat.icon} {count}
                   </button>
                 )
               })}
            </div>

            {/* Pagination Controls - TOP */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
                 <button 
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   className="px-4 py-1.5 rounded bg-white/10 hover:bg-[#00f2fe]/20 hover:text-[#00f2fe] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white transition-colors text-sm font-bold"
                 >
                    &larr; Prev
                 </button>
                 <div className="text-sm font-medium text-white/70">
                    Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                 </div>
                 <button 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   className="px-4 py-1.5 rounded bg-white/10 hover:bg-[#00f2fe]/20 hover:text-[#00f2fe] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white transition-colors text-sm font-bold"
                 >
                    Next &rarr;
                 </button>
              </div>
            )}

            {/* Senders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max min-h-[500px]">
              <AnimatePresence mode="popLayout">
                {paginatedSenders.map(sender => {
                  const isExpanded = expandedSender === sender.email;
                  const isSelected = selectedEmails.has(sender.email);
                  
                  return (
                    <motion.div 
                      key={sender.email}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-xl backdrop-blur-md border-l-4 overflow-hidden transition-all ${isSelected ? 'bg-white/10 shadow-[0_0_20px_rgba(0,242,254,0.15)]' : 'bg-black/60 hover:-translate-y-1'}`}
                      style={{ borderLeftColor: sender.categoryColor, borderTop: `1px solid ${isSelected ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`, borderRight: `1px solid ${isSelected ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`, borderBottom: `1px solid ${isSelected ? '#00f2fe' : 'rgba(255,255,255,0.1)'}` }}
                    >
                      {/* Sender Card Header */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-start gap-4 w-[75%] text-white">
                              <button onClick={() => toggleSelectSender(sender.email)} className="mt-1 text-white/30 hover:text-[#00f2fe] transition-colors shrink-0">
                                 {isSelected ? <CheckSquare className="w-5 h-5 text-[#00f2fe] drop-shadow-[0_0_5px_#00f2fe]" /> : <Square className="w-5 h-5" />}
                              </button>
                              <div>
                                <div className="truncate font-semibold text-lg flex items-center gap-2 mb-1 drop-shadow-md">
                                  {sender.categoryIcon} {sender.fullName.replace(/"/g, '').split('<')[0] || sender.email.split('@')[0]}
                                </div>
                                <div className="text-xs text-white/40 truncate font-mono">{sender.email}</div>
                              </div>
                           </div>
                           <div className="bg-white/5 px-4 py-1.5 rounded-full text-sm font-bold border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                              {sender.count} <Mail className="w-3.5 h-3.5 inline mb-0.5 opacity-50 ml-1"/>
                           </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6 pl-9 mt-4">
                           <span className="text-xs px-3 py-1.5 rounded-md font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ backgroundColor: `${sender.categoryColor}30`, color: sender.categoryColor, border: `1px solid ${sender.categoryColor}50` }}>
                              {sender.categoryName}
                           </span>
                           <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono bg-black/50 px-2 py-1 rounded">{sender.dateRange}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 mt-2">
                           <button 
                             onClick={() => setExpandedSender(isExpanded ? null : sender.email)}
                             className="py-1.5 rounded bg-white/5 border border-white/10 hover:border-[#00f2fe] text-xs font-bold uppercase text-white/80 hover:text-[#00f2fe] transition-colors flex items-center justify-center gap-1"
                           >
                              View {isExpanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                           </button>
                           <button 
                             onClick={() => handleDeleteSender(sender.email, sender.emails.map(e => e.id))}
                             className="py-1.5 rounded bg-red-500/10 border border-red-500/30 hover:bg-red-500/30 text-xs font-bold uppercase text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-1"
                           >
                              <Trash2 className="w-3 h-3"/> Delete
                           </button>
                           <button 
                             onClick={() => handleBlockSender(sender.email)}
                             className="py-1.5 rounded bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-bold uppercase text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-1"
                           >
                              <Ban className="w-3 h-3"/> Block
                           </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 bg-black/40 p-5 max-h-[350px] overflow-y-auto styled-scrollbar"
                        >
                          <h4 className="text-xs font-bold text-[#00f2fe] uppercase tracking-wider mb-3">Recent Emails from {sender.email}</h4>
                          <div className="space-y-2">
                             {sender.emails.slice(0, 10).map(em => (
                               <div key={em.id} className="bg-white/5 p-2 rounded border border-white/5 hover:border-white/20">
                                  <div className="flex justify-between items-start mb-1">
                                    <div className="font-semibold text-sm text-white/90 truncate mr-2 w-[75%]">{em.subject}</div>
                                    <div className="text-[10px] text-white/40 font-mono mt-0.5">{em.date}</div>
                                  </div>
                                  <div className="text-xs text-white/40 truncate">{em.snippet}</div>
                               </div>
                             ))}
                             {sender.emails.length > 10 && (
                               <div className="text-center text-xs text-white/30 italic pt-2">
                                 + {sender.emails.length - 10} more emails not shown
                               </div>
                             )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            
            {/* Pagination Controls - BOTTOM */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md mt-4">
                 <button 
                   disabled={currentPage === 1}
                   onClick={() => {
                     setCurrentPage(p => Math.max(1, p - 1));
                     window.scrollTo({ top: 300, behavior: 'smooth' });
                   }}
                   className="px-4 py-1.5 rounded bg-white/10 hover:bg-[#00f2fe]/20 hover:text-[#00f2fe] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white transition-colors text-sm font-bold"
                 >
                    &larr; Prev Page
                 </button>
                 <div className="text-sm font-medium text-white/70">
                    Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                 </div>
                 <button 
                   disabled={currentPage === totalPages}
                   onClick={() => {
                     setCurrentPage(p => Math.min(totalPages, p + 1));
                     window.scrollTo({ top: 300, behavior: 'smooth' });
                   }}
                   className="px-4 py-1.5 rounded bg-white/10 hover:bg-[#00f2fe]/20 hover:text-[#00f2fe] disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white transition-colors text-sm font-bold"
                 >
                    Next Page &rarr;
                 </button>
              </div>
            )}

            {filteredSenders.length === 0 && (
              <div className="text-center p-12 bg-white/5 rounded-xl border border-white/10 mt-4">
                 <ShieldCheck className="w-12 h-12 text-[#00f2fe] mx-auto mb-4 opacity-50" />
                 <h3 className="text-xl font-bold text-white/80">Inbox looks clear here!</h3>
                 <p className="text-sm text-white/40 mt-2">No senders found for this category.</p>
              </div>
            )}
          </>
        )}

        {/* Initial Empty State */}
        {!isScanning && senders.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/5 border border-white/10 rounded-2xl mt-8">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00f2fe] to-[#00ffaa] flex items-center justify-center shadow-[0_0_40px_rgba(0,242,254,0.3)] mb-6">
                <Mail className="w-10 h-10 text-black" />
             </div>
             <h2 className="text-2xl font-bold mb-2">Ready to Analyze Your Inbox?</h2>
             <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
               Click the Deep Scan button above to securely analyze your email history. We'll categorize your senders and help you purge unwanted emails instantly.
             </p>
          </div>
        )}

      </main>

      {showPricingModal && (
        <PricingModal 
          onClose={() => setShowPricingModal(false)}
          deletedCount={totalDeleted}
        />
      )}
    </div>
  );
}

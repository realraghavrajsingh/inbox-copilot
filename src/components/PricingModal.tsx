import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Check } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
  deletedCount: number;
}

export default function PricingModal({ onClose, deletedCount }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'infinite' | null>(null);

  const plans = [
    {
      id: 'pro',
      name: "Pro Cleaner",
      price: "₹99",
      amount: "99",
      limit: "+10,000 Emails",
      features: ["Delete up to 10,000 more emails", "Priority Support", "Advanced AI categorizer"],
    },
    {
      id: 'infinite',
      name: "Infinite Clear",
      price: "₹299",
      amount: "299",
      limit: "Unlimited",
      features: ["Unlimited email deletion forever", "Priority Support", "Advanced AI categorizer"],
    }
  ];

  const upiId = "raghav.raj.singh30@okicici";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 p-2 rounded-full z-10 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center border-b border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-[#00f2fe]/10 to-[#00ffaa]/10 pointer-events-none" />
           <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#00f2fe]/20 rounded-full blur-[80px] pointer-events-none" />
           <h2 className="text-3xl font-bold mb-3 text-white relative z-10 drop-shadow-md">You've hit the Free Limit!</h2>
           <p className="text-white/70 max-w-lg mx-auto relative z-10">
             You have successfully wiped <strong>{deletedCount.toLocaleString()}</strong> emails for free. To permanently delete more emails and keep your inbox pristine, please upgrade below. Scanning remains free forever.
           </p>
        </div>

        <div className="p-8 overflow-y-auto flex-1 styled-scrollbar">
           {selectedPlan ? (
             <div className="flex flex-col items-center justify-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  Scan to Pay <span className="text-[#00ffaa]">{plans.find(p=>p.id===selectedPlan)?.price}</span>
                </h3>
                <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,255,170,0.2)]">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${upiId}&pn=DigitalClarity&cu=INR&am=${plans.find(p=>p.id===selectedPlan)?.amount}`} 
                    size={220} 
                  />
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 mb-2 font-mono text-sm text-[#00f2fe]">
                  {upiId}
                </div>
                <p className="text-white/40 text-xs mb-8">Scan with Google Pay, PhonePe, Paytm, or any UPI app.</p>
                
                <div className="flex gap-4 w-full max-w-sm">
                  <button onClick={() => setSelectedPlan(null)} className="flex-1 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-semibold">
                    Back
                  </button>
                  <button onClick={() => {
                      alert("Payment verification is pending. Please contact support with a screenshot of your payment to unlock your account immediately.");
                      onClose();
                  }} className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#00ffaa] text-black font-bold hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all">
                    I Have Paid
                  </button>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
               {plans.map((plan) => (
                 <div key={plan.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative flex flex-col hover:border-[#00f2fe]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,242,254,0.1)] transition-all cursor-pointer group" onClick={() => setSelectedPlan(plan.id as any)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00f2fe]/0 to-[#00ffaa]/0 group-hover:from-[#00f2fe]/5 group-hover:to-[#00ffaa]/5 rounded-2xl transition-all pointer-events-none" />
                    
                    <div className="mb-6 relative z-10">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-light text-white">{plan.price}</span>
                        <span className="text-sm text-white/40 uppercase tracking-widest font-bold">one-time</span>
                      </div>
                      <div className="inline-block px-3 py-1 rounded bg-[#00ffaa]/10 text-[#00ffaa] text-xs font-bold tracking-widest uppercase border border-[#00ffaa]/20">{plan.limit}</div>
                    </div>
                    
                    <ul className="flex-1 space-y-3 mb-8 relative z-10">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                           <Check className="w-4 h-4 text-[#00f2fe] shrink-0 mt-0.5" />
                           {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button className="w-full py-3 rounded-xl font-bold bg-white/10 group-hover:bg-[#00f2fe] group-hover:text-black transition-colors text-white relative z-10">
                      Select Plan
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

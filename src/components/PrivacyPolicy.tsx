import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020202] text-white py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide mb-8 text-[#00ffaa] drop-shadow-[0_0_10px_rgba(0,255,170,0.3)]">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-white/80 leading-relaxed font-light">
          <p>
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Introduction</h2>
          <p>
            DigitalClarity ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your information is collected, used, and disclosed by DigitalClarity when you access or use our services.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Information We Collect</h2>
          <p>
            We collect the following information from you through Google OAuth authentication:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Basic Account Information:</strong> Your email address and public profile picture for user identification.</li>
            <li><strong>Gmail API Data:</strong> Subject lines, sender email addresses, snippets, and email identifiers (IDs) solely for the purpose of categorizing your inbox and facilitating bulk deletion.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. How We Use Your Information</h2>
          <p>
            DigitalClarity uses your information **strictly** to provide the core functionality of our application:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>To display your email senders and statistics on the Intelligence Board dashboard.</li>
            <li>To execute the deletion or blocking commands you explicitly authorize via the application interface.</li>
          </ul>
          <p className="font-bold text-[#00ffaa] mt-4 p-4 border border-[#00ffaa]/30 bg-[#00ffaa]/5 rounded-xl">
            Important Note on Data Storage: DigitalClarity is a client-side visualization and management tool. We DO NOT store, sell, or permanently cache your emails, email contents, or credentials on any external servers. All operations are performed securely between your browser and the Google APIs.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Google API Services Usage Data Policy Compliance</h2>
          <p>
            DigitalClarity's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#00ffaa] hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Revoking Access</h2>
          <p>
            You can revoke DigitalClarity's access to your Gmail account at any time. This can be done directly from the application's "Revoke Access & Sign Out" button, or by managing your third-party connections in your Google Account security settings.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
          </p>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm">
            <p>If you have any questions about this Privacy Policy, please contact us at raghav.spring3@gmail.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

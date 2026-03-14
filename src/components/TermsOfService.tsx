import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#020202] text-white py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-5xl font-light tracking-wide mb-8 text-[#00f2fe] drop-shadow-[0_0_10px_rgba(0,242,254,0.3)]">
          Terms of Service
        </h1>
        <div className="space-y-6 text-white/80 leading-relaxed font-light">
          <p>
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the DigitalClarity ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
          <p>
            DigitalClarity provides an AI-powered email management and digital hygiene tool. We use Google OAuth to securely scan your inbox, categorize senders, and allow you to selectively or bulk delete emails to reclaim storage space.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. User Responsibilities</h2>
          <p>
            You are responsible for safely maintaining your Google Account credentials. DigitalClarity acts on your explicit authorization to manage and delete emails. We are not responsible for any emails unintentionally deleted during the use of our bulk-action tools. Proceed with caution when purging data.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Google API Services Usage Data Policy</h2>
          <p>
            DigitalClarity's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#00ffaa] hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall DigitalClarity or its creators be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm">
            <p>If you have any questions about these Terms, please contact us at raghav.spring3@gmail.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

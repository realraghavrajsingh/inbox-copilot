/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import ThreeVisualization from "./components/ThreeVisualization";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Security from "./components/Security";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (e) {
        console.error("Failed to revoke token on Google's end", e);
      }
    }
    setAccessToken(null);
  };

  if (accessToken) {
    return <Dashboard token={accessToken} onLogout={handleLogout} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Hero onLogin={(token) => setAccessToken(token)} />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <ThreeVisualization />
      <Testimonials />
      <Pricing />
      <Security />
      <FinalCTA onLogin={(token) => setAccessToken(token)} />
      <Footer />
    </main>
  );
}

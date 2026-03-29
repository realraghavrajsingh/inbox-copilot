import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import Solution from '@/components/Solution'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import Visualization3D from '@/components/Visualization3D'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import Security from '@/components/Security'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="cosmic-bg">
        <div className="stars" />
      </div>
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <Visualization3D />
      <Testimonials />
      <Pricing />
      <Security />
      <FinalCTA />
      <Footer />
    </main>
  )
}

import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { SocialProof } from './components/SocialProof'
import { KeyStats } from './components/KeyStats'
import { SavingsBreakdown } from './components/SavingsBreakdown'
import { HowItWorks } from './components/HowItWorks'
import { ROITimeline } from './components/ROITimeline'
import { IndustryComparison } from './components/IndustryComparison'
import { CustomerResults } from './components/CustomerResults'
import { Calculator } from './components/Calculator'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

export function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <KeyStats />
        <SavingsBreakdown />
        <HowItWorks />
        <ROITimeline />
        <IndustryComparison />
        <CustomerResults />
        <Calculator />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

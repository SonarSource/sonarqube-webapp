import { useInView } from '../hooks/useInView'

export function FinalCTA() {
  const { ref, isVisible } = useInView(0.15)

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sonar-ink via-[#1a0030] to-sonar-ink" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-sonar-blue/10 blur-[120px]" />
      </div>

      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`max-w-2xl mx-auto text-center section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight text-white mb-6">
            Start measuring your savings today
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
            Join 10,000+ organizations that use SonarQube to ship better code faster.
            See your real cost savings within the first scan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.sonarsource.com/products/sonarqube/downloads/"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg
                font-display font-semibold text-[15px] tracking-cta uppercase
                bg-white text-sonar-ink
                hover:bg-sonar-blue-light transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Free Trial
            </a>
            <a
              href="#calculator"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg
                font-display font-semibold text-[15px] tracking-cta uppercase
                bg-transparent text-white border-2 border-white/30
                hover:border-white/60 transition-all duration-200"
            >
              Calculate Your ROI
            </a>
          </div>

          <p className="text-sm text-white/40 mt-6">
            Free forever for open source. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}

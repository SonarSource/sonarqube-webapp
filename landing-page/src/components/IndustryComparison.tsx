import { useInView } from '../hooks/useInView'

const INDUSTRIES = [
  { name: 'Financial Services', savings: 1680 },
  { name: 'Healthcare', savings: 1540 },
  { name: 'Technology', savings: 1200 },
  { name: 'Retail / E-Commerce', savings: 980 },
  { name: 'Manufacturing', savings: 860 },
  { name: 'Government', savings: 720 },
]

export function IndustryComparison() {
  const { ref, isVisible } = useInView(0.15)
  const maxSavings = INDUSTRIES[0].savings

  return (
    <section className="py-24 md:py-32 bg-sonar-section-alt">
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            Savings across industries
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Average annual savings per 100 developers, based on aggregated
            data from SonarQube deployments worldwide.
          </p>
        </div>

        <div
          className={`max-w-3xl mx-auto space-y-5 section-fade-in ${isVisible ? 'visible' : ''}`}
          style={{ transitionDelay: '200ms' }}
        >
          {INDUSTRIES.map((ind, i) => {
            const pct = (ind.savings / maxSavings) * 100
            return (
              <div
                key={ind.name}
                className="flex items-center gap-4"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease-out ${i * 80 + 300}ms, transform 0.5s ease-out ${i * 80 + 300}ms`,
                }}
              >
                <div className="w-44 md:w-52 shrink-0">
                  <span className="text-sm font-medium text-sonar-ink">
                    {ind.name}
                  </span>
                </div>
                <div className="flex-1 h-10 rounded-lg bg-white border border-sonar-blue-border/30 overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center justify-end px-4 transition-all duration-1000 ease-out"
                    style={{
                      width: isVisible ? `${pct}%` : '0%',
                      background: 'linear-gradient(90deg, #126ED3, #0F63BF)',
                      transitionDelay: `${i * 80 + 500}ms`,
                    }}
                  >
                    <span className="text-sm font-display font-bold text-white whitespace-nowrap">
                      ${(ind.savings / 1000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-sonar-muted mt-8 max-w-lg mx-auto">
          Based on median values. Actual savings vary by deployment size, code
          complexity, and organizational practices. Breach cost multipliers
          sourced from IBM/Ponemon Cost of a Data Breach Report 2025.
        </p>
      </div>
    </section>
  )
}

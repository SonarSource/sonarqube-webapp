import { useInView } from '../hooks/useInView'

const CATEGORIES = [
  {
    name: 'Developer Productivity',
    percentage: 42,
    amount: '$504K',
    description: 'Time saved from early bug detection and reduced debugging cycles',
    color: '#126ED3',
  },
  {
    name: 'Security Incident Prevention',
    percentage: 31,
    amount: '$372K',
    description: 'Avoided breach costs, compliance penalties, and incident response',
    color: '#290042',
  },
  {
    name: 'Reduced Technical Debt',
    percentage: 18,
    amount: '$216K',
    description: 'Lower maintenance burden and faster feature delivery',
    color: '#0C5DB5',
  },
  {
    name: 'Quality & Reliability',
    percentage: 9,
    amount: '$108K',
    description: 'Fewer production incidents, reduced downtime, better SLAs',
    color: '#69809B',
  },
]

export function SavingsBreakdown() {
  const { ref, isVisible } = useInView(0.15)

  return (
    <section className="py-24 md:py-32">
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            Where the savings come from
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Cost reductions are distributed across four key dimensions,
            each validated by independent research and real customer data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Donut chart */}
          <div
            className={`flex justify-center section-fade-in ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: '150ms' }}
          >
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0
                  const gap = 2
                  const circumference = Math.PI * 140
                  return CATEGORIES.map((cat, i) => {
                    const dashLength =
                      (cat.percentage / 100) * circumference - gap
                    const dashOffset = -offset
                    offset += (cat.percentage / 100) * circumference
                    return (
                      <circle
                        key={cat.name}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="24"
                        strokeDasharray={`${dashLength} ${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transitionDelay: `${i * 200 + 300}ms`,
                        }}
                      />
                    )
                  })
                })()}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="stat-number text-4xl gradient-text">$1.2M</div>
                <div className="text-sm text-sonar-muted font-medium">
                  avg. annual savings
                </div>
              </div>
            </div>
          </div>

          {/* Category list */}
          <div className="space-y-5">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-start gap-4 p-5 rounded-xl bg-white border border-sonar-blue-border/30 card-hover"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(24px)',
                  transition: `opacity 0.5s ease-out ${i * 100 + 400}ms, transform 0.5s ease-out ${i * 100 + 400}ms`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h4 className="font-semibold text-sonar-ink text-[15px]">
                      {cat.name}
                    </h4>
                    <div className="text-right shrink-0">
                      <span className="font-display font-bold text-lg text-sonar-ink">
                        {cat.amount}
                      </span>
                      <span className="text-sm text-sonar-muted ml-1.5">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-sonar-muted leading-relaxed">
                    {cat.description}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-sonar-blue-light overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: isVisible ? `${cat.percentage}%` : '0%',
                        backgroundColor: cat.color,
                        transitionDelay: `${i * 100 + 600}ms`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

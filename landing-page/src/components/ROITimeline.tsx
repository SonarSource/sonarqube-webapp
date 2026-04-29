import { useInView } from '../hooks/useInView'

const TIMELINE_DATA = [
  { month: 'Month 1', savings: 15, cost: 100, label: 'Setup & onboarding' },
  { month: 'Month 3', savings: 45, cost: 100, label: 'Early detection begins' },
  { month: 'Month 6', savings: 120, cost: 100, label: 'Break-even point' },
  { month: 'Year 1', savings: 280, cost: 100, label: 'Full pipeline integration' },
  { month: 'Year 2', savings: 520, cost: 100, label: 'Compound savings' },
  { month: 'Year 3', savings: 840, cost: 100, label: 'Mature clean code culture' },
]

export function ROITimeline() {
  const { ref, isVisible } = useInView(0.15)

  return (
    <section
      id="roi-timeline"
      className="py-24 md:py-32 bg-sonar-section-alt"
    >
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            ROI that compounds over time
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Most organizations break even within 6 months. By year 3,
            the average return exceeds 8x the total cost of ownership.
          </p>
        </div>

        {/* Visual timeline chart */}
        <div
          className={`bg-white rounded-2xl border-2 border-sonar-blue-border/40 p-8 md:p-12 section-fade-in ${
            isVisible ? 'visible' : ''
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Chart */}
          <div className="space-y-6">
            {TIMELINE_DATA.map((point, i) => {
              const maxSavings = TIMELINE_DATA[TIMELINE_DATA.length - 1].savings
              const savingsPct = (point.savings / maxSavings) * 100
              const costPct = (point.cost / maxSavings) * 100
              const isBreakEven = point.savings >= point.cost && (i === 0 || TIMELINE_DATA[i - 1].savings < TIMELINE_DATA[i - 1].cost)

              return (
                <div key={point.month} className="group">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-20 md:w-24 text-right">
                      <span className="text-sm font-semibold text-sonar-ink">
                        {point.month}
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      {/* Cost bar (background) */}
                      <div className="absolute inset-y-0 left-0 h-full flex items-center">
                        <div
                          className="h-3 rounded-full bg-sonar-ink/8 transition-all duration-1000 ease-out"
                          style={{
                            width: isVisible ? `${costPct}%` : '0%',
                            transitionDelay: `${i * 150 + 400}ms`,
                          }}
                        />
                      </div>
                      {/* Savings bar */}
                      <div className="relative h-10 flex items-center">
                        <div
                          className="h-6 rounded-full transition-all duration-1000 ease-out relative"
                          style={{
                            width: isVisible ? `${savingsPct}%` : '0%',
                            transitionDelay: `${i * 150 + 400}ms`,
                            background:
                              point.savings >= point.cost
                                ? 'linear-gradient(90deg, #126ED3, #0F63BF)'
                                : '#B7D3F2',
                          }}
                        >
                          {isBreakEven && (
                            <div className="absolute -right-2 -top-8 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sonar-blue text-white">
                                Break-even
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-28 md:w-36 text-right">
                      <span className="text-sm font-semibold text-sonar-ink">
                        ${point.savings}K
                      </span>
                      <span className="text-xs text-sonar-muted ml-1">
                        saved
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 md:w-24" />
                    <span className="text-xs text-sonar-muted">{point.label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-sonar-blue-border/30">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2.5 rounded-full bg-gradient-to-r from-sonar-blue to-sonar-blue-gradient" />
              <span className="text-xs font-medium text-sonar-muted">
                Cumulative savings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2.5 rounded-full bg-sonar-ink/8" />
              <span className="text-xs font-medium text-sonar-muted">
                Total cost of ownership
              </span>
            </div>
          </div>
        </div>

        {/* Callout cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <ROICard
            period="First Year"
            roi="387%"
            description="Even including onboarding and ramp-up costs"
            visible={isVisible}
            delay={600}
          />
          <ROICard
            period="By Year 2"
            roi="5.2x"
            description="Compound effect as code quality baseline rises"
            visible={isVisible}
            delay={700}
          />
          <ROICard
            period="By Year 3"
            roi="8.4x"
            description="Clean code culture prevents defects at the source"
            visible={isVisible}
            delay={800}
          />
        </div>
      </div>
    </section>
  )
}

function ROICard({
  period,
  roi,
  description,
  visible,
  delay,
}: {
  period: string
  roi: string
  description: string
  visible: boolean
  delay: number
}) {
  return (
    <div
      className="bg-white rounded-card border-2 border-sonar-blue-border/40 p-6 text-center card-hover"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      <div className="text-sm font-medium text-sonar-muted uppercase tracking-cta mb-2">
        {period}
      </div>
      <div className="stat-number text-4xl gradient-text mb-2">{roi}</div>
      <div className="text-sm text-sonar-muted">{description}</div>
    </div>
  )
}

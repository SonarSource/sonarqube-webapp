import { useInView } from '../hooks/useInView'

export function Hero() {
  const { ref, isVisible } = useInView(0.1)

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-sonar-blue/[0.03] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-sonar-blue/[0.02] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div
        ref={ref}
        className={`max-w-content mx-auto px-6 section-fade-in ${isVisible ? 'visible' : ''}`}
      >
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sonar-blue-light border border-sonar-blue-border mb-8">
            <span className="w-2 h-2 rounded-full bg-sonar-blue animate-pulse" />
            <span className="text-sm font-medium text-sonar-blue">
              Real data from 10,000+ organizations
            </span>
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-[72px] leading-[1.05] tracking-tight text-balance mb-6">
            See the{' '}
            <span className="gradient-text">real cost savings</span>
            {' '}of clean code
          </h1>

          <p className="text-lg md:text-xl text-sonar-muted max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
            SonarQube customers save an average of <strong className="text-sonar-ink">$1.2M per year</strong> in
            avoided technical debt, security incidents, and developer productivity gains.
            Calculate your organization's potential savings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#calculator" className="btn-primary">
              Calculate Your Savings
            </a>
            <a href="#results" className="btn-secondary">
              See the Data
            </a>
          </div>
        </div>

        {/* Hero metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          <MetricPreview
            value="$1.2M"
            label="Average annual savings"
            delay={0}
            visible={isVisible}
          />
          <MetricPreview
            value="387%"
            label="Average first-year ROI"
            delay={100}
            visible={isVisible}
          />
          <MetricPreview
            value="68%"
            label="Reduction in critical bugs"
            delay={200}
            visible={isVisible}
          />
        </div>
      </div>
    </section>
  )
}

function MetricPreview({
  value,
  label,
  delay,
  visible,
}: {
  value: string
  label: string
  delay: number
  visible: boolean
}) {
  return (
    <div
      className="bg-white rounded-card border-2 border-sonar-blue-border/60 p-6 text-center
        transition-all duration-700 ease-out card-hover"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="stat-number text-3xl md:text-4xl mb-2 gradient-text">
        {value}
      </div>
      <div className="text-sm text-sonar-muted font-medium">{label}</div>
    </div>
  )
}

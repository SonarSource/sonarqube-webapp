import { useInView } from '../hooks/useInView'
import { useCountUp } from '../hooks/useCountUp'

export function KeyStats() {
  const { ref, isVisible } = useInView(0.2)

  const savings = useCountUp(1.2, isVisible, 2200, '$', 'M', 1)
  const hours = useCountUp(12400, isVisible, 2400, '', '', 0)
  const roi = useCountUp(387, isVisible, 2000, '', '%', 0)
  const vulns = useCountUp(94, isVisible, 1800, '', '%', 0)

  return (
    <section id="results" className="py-24 md:py-32">
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            Results that speak for themselves
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Aggregated data from over 10,000 SonarQube deployments reveals
            consistent, measurable impact across industries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            value={savings}
            label="Average annual savings per organization"
            description="From avoided rework, faster delivery, and prevented incidents"
            icon={<DollarIcon />}
            visible={isVisible}
            delay={0}
          />
          <StatCard
            value={hours}
            label="Developer hours saved per year"
            description="Time redirected from debugging to building new features"
            icon={<ClockIcon />}
            visible={isVisible}
            delay={100}
          />
          <StatCard
            value={roi}
            label="Average first-year return on investment"
            description="Including license costs, deployment, and team onboarding"
            icon={<TrendIcon />}
            visible={isVisible}
            delay={200}
          />
          <StatCard
            value={vulns}
            label="Vulnerabilities caught before production"
            description="Security issues identified and resolved during development"
            icon={<ShieldIcon />}
            visible={isVisible}
            delay={300}
          />
        </div>
      </div>
    </section>
  )
}

function StatCard({
  value,
  label,
  description,
  icon,
  visible,
  delay,
}: {
  value: string
  label: string
  description: string
  icon: React.ReactNode
  visible: boolean
  delay: number
}) {
  return (
    <div
      className="relative bg-white rounded-card border-2 border-sonar-blue-border/50 p-8 card-hover group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      <div className="w-12 h-12 rounded-xl bg-sonar-blue-light flex items-center justify-center mb-5 group-hover:bg-sonar-blue/10 transition-colors">
        {icon}
      </div>
      <div className="stat-number text-4xl mb-3 gradient-text">{value}</div>
      <div className="font-semibold text-sonar-ink text-[15px] leading-snug mb-2">
        {label}
      </div>
      <div className="text-sm text-sonar-muted leading-relaxed">
        {description}
      </div>
    </div>
  )
}

function DollarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#126ED3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#126ED3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TrendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#126ED3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#126ED3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

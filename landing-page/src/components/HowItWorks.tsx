import { useInView } from '../hooks/useInView'

const STEPS = [
  {
    number: '01',
    title: 'Analyze your codebase',
    description:
      'SonarQube scans your code during development and CI/CD, identifying bugs, vulnerabilities, and code smells before they reach production.',
    icon: <ScanIcon />,
  },
  {
    number: '02',
    title: 'Quantify the impact',
    description:
      'Each issue is mapped to real-world cost data: estimated fix time, security breach potential, and production incident probability from industry benchmarks.',
    icon: <CalculateIcon />,
  },
  {
    number: '03',
    title: 'See your savings grow',
    description:
      'Track cumulative savings in real-time as your team resolves issues early. The longer you use SonarQube, the more your clean code baseline compounds.',
    icon: <GrowthIcon />,
  },
]

export function HowItWorks() {
  const { ref, isVisible } = useInView(0.15)

  return (
    <section className="py-24 md:py-32">
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            How we calculate your savings
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Our methodology is grounded in industry research from IBM, Ponemon Institute,
            and real production data from thousands of deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-sonar-blue-border via-sonar-blue to-sonar-blue-border" />

          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="relative text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease-out ${i * 150}ms, transform 0.6s ease-out ${i * 150}ms`,
              }}
            >
              {/* Icon circle */}
              <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-white border-2 border-sonar-blue-border flex items-center justify-center mb-6 group">
                <div className="text-sonar-blue">{step.icon}</div>
              </div>

              {/* Step number */}
              <div className="text-xs font-display font-bold text-sonar-blue uppercase tracking-cta mb-3">
                Step {step.number}
              </div>

              <h3 className="font-display font-bold text-xl text-sonar-ink mb-3">
                {step.title}
              </h3>

              <p className="text-sm text-sonar-muted leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ScanIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" opacity="0.5" />
    </svg>
  )
}

function CalculateIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="12" y2="14" />
      <line x1="8" y1="18" x2="10" y2="18" />
    </svg>
  )
}

function GrowthIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

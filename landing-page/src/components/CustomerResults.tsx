import { useInView } from '../hooks/useInView'

const TESTIMONIALS = [
  {
    quote:
      "SonarQube paid for itself within the first quarter. We caught a critical SQL injection vulnerability that our previous tools missed entirely.",
    author: 'Sarah Chen',
    role: 'VP of Engineering',
    company: 'FinTech Series-C',
    metric: '$2.1M saved in Year 1',
    industry: 'Financial Services',
    team: '120 developers',
  },
  {
    quote:
      "The developer productivity gains alone justified the investment. Our team spends 40% less time on code reviews and debugging production issues.",
    author: 'Marcus Rivera',
    role: 'CTO',
    company: 'Healthcare SaaS',
    metric: '12,000 hours saved annually',
    industry: 'Healthcare',
    team: '85 developers',
  },
  {
    quote:
      "We went from 3 security incidents per quarter to zero in 8 months. The cost savings dashboard made it easy to show the board our ROI.",
    author: 'Priya Patel',
    role: 'Director of Security',
    company: 'Enterprise Retail',
    metric: '94% fewer vulnerabilities',
    industry: 'Retail',
    team: '200+ developers',
  },
]

export function CustomerResults() {
  const { ref, isVisible } = useInView(0.1)

  return (
    <section className="py-24 md:py-32 bg-sonar-section-alt">
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            Hear from engineering leaders
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Teams across industries are using SonarQube to quantify their
            investment in code quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              className="bg-white rounded-2xl border-2 border-sonar-blue-border/40 p-8 flex flex-col card-hover"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease-out ${i * 120}ms, transform 0.6s ease-out ${i * 120}ms`,
              }}
            >
              {/* Metric badge */}
              <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-sonar-blue-light border border-sonar-blue-border text-sm font-semibold text-sonar-blue mb-6">
                {t.metric}
              </div>

              {/* Quote */}
              <blockquote className="text-[15px] text-sonar-ink leading-relaxed mb-8 flex-1">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="border-t border-sonar-blue-border/30 pt-5">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sonar-blue to-sonar-ink flex items-center justify-center text-white font-display font-bold text-sm">
                    {t.author
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-sonar-ink">
                      {t.author}
                    </div>
                    <div className="text-xs text-sonar-muted">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-sonar-muted">
                  <span>{t.industry}</span>
                  <span className="w-1 h-1 rounded-full bg-sonar-muted/40" />
                  <span>{t.team}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

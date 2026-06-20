import { useInView } from '../hooks/useInView'

const STATS = [
  { value: '400K+', label: 'Organizations worldwide' },
  { value: '40+', label: 'Languages supported' },
  { value: '5B+', label: 'Lines scanned daily' },
  { value: '#1', label: 'Code quality platform' },
]

export function SocialProof() {
  const { ref, isVisible } = useInView(0.2)

  return (
    <section className="py-14 bg-sonar-section-alt border-y border-sonar-blue-border/30">
      <div
        ref={ref}
        className={`max-w-content mx-auto px-6 section-fade-in ${isVisible ? 'visible' : ''}`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity 0.5s ease-out ${i * 100}ms, transform 0.5s ease-out ${i * 100}ms`,
              }}
            >
              <div className="font-display font-bold text-2xl md:text-3xl text-sonar-ink mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-sonar-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

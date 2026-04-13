import { useState, useMemo } from 'react'
import { useInView } from '../hooks/useInView'

const INDUSTRIES = [
  { label: 'Financial Services', breachMultiplier: 1.4 },
  { label: 'Healthcare', breachMultiplier: 1.6 },
  { label: 'Technology', breachMultiplier: 1.0 },
  { label: 'Retail / E-Commerce', breachMultiplier: 0.9 },
  { label: 'Manufacturing', breachMultiplier: 0.85 },
  { label: 'Government', breachMultiplier: 0.8 },
  { label: 'Other', breachMultiplier: 1.0 },
]

export function Calculator() {
  const { ref, isVisible } = useInView(0.1)

  const [developers, setDevelopers] = useState(50)
  const [hourlyRate, setHourlyRate] = useState(85)
  const [industryIdx, setIndustryIdx] = useState(2) // Technology default
  const [linesOfCode, setLinesOfCode] = useState(500) // in thousands

  const results = useMemo(() => {
    const industry = INDUSTRIES[industryIdx]

    // Developer productivity savings
    // ~5 hours/dev/month saved via early detection, fewer reviews
    const hoursSaved = developers * 5 * 12
    const productivitySavings = hoursSaved * hourlyRate

    // Security savings (based on industry breach cost data)
    // Average: prevented 2 incidents/year worth ~$120K each, scaled by industry
    const securitySavings = Math.round(
      2 * 120000 * industry.breachMultiplier * (developers / 50),
    )

    // Technical debt reduction
    // ~0.3 hours per KLOC per month in reduced maintenance
    const debtSavings = Math.round(linesOfCode * 0.3 * 12 * hourlyRate)

    const totalSavings =
      productivitySavings + securitySavings + debtSavings
    // Enterprise license + infrastructure: ~$150/dev/month
    const licenseCost = developers * 150 * 12
    const roi = Math.round((totalSavings / licenseCost - 1) * 100)

    return {
      totalSavings,
      productivitySavings,
      securitySavings,
      debtSavings,
      hoursSaved,
      licenseCost,
      roi,
      paybackMonths: Math.max(1, Math.round((licenseCost / totalSavings) * 12)),
    }
  }, [developers, hourlyRate, industryIdx, linesOfCode])

  return (
    <section id="calculator" className="py-24 md:py-32">
      <div ref={ref} className="max-w-content mx-auto px-6">
        <div
          className={`text-center mb-16 section-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-tight mb-4">
            Calculate your savings
          </h2>
          <p className="text-lg text-sonar-muted max-w-2xl mx-auto">
            Enter your team details to see a personalized estimate of
            what SonarQube could save your organization.
          </p>
        </div>

        <div
          className={`bg-white rounded-2xl border-2 border-sonar-blue-border/50 overflow-hidden section-fade-in ${
            isVisible ? 'visible' : ''
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Input side */}
            <div className="p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-sonar-blue-border/30">
              <h3 className="font-display font-bold text-lg text-sonar-ink mb-8">
                Your organization
              </h3>

              <div className="space-y-7">
                <SliderInput
                  label="Number of developers"
                  value={developers}
                  onChange={setDevelopers}
                  min={5}
                  max={500}
                  step={5}
                  format={(v) => v.toString()}
                />
                <SliderInput
                  label="Avg. hourly developer rate (USD)"
                  value={hourlyRate}
                  onChange={setHourlyRate}
                  min={30}
                  max={200}
                  step={5}
                  format={(v) => `$${v}`}
                />
                <SliderInput
                  label="Codebase size (KLOC)"
                  value={linesOfCode}
                  onChange={setLinesOfCode}
                  min={50}
                  max={5000}
                  step={50}
                  format={(v) => `${v.toLocaleString()}K`}
                />

                <div>
                  <label className="block text-sm font-semibold text-sonar-ink mb-2">
                    Industry
                  </label>
                  <select
                    value={industryIdx}
                    onChange={(e) => setIndustryIdx(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-lg border-2 border-sonar-blue-border/60 bg-white text-sm text-sonar-ink
                      focus:border-sonar-blue focus:outline-none focus:ring-2 focus:ring-sonar-blue/10 transition-all"
                  >
                    {INDUSTRIES.map((ind, i) => (
                      <option key={ind.label} value={i}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results side */}
            <div className="p-8 md:p-10 bg-gradient-to-br from-sonar-section-alt to-white">
              <h3 className="font-display font-bold text-lg text-sonar-ink mb-8">
                Your estimated annual savings
              </h3>

              {/* Hero number */}
              <div className="mb-8">
                <div className="stat-number text-5xl md:text-6xl gradient-text">
                  {formatCurrency(results.totalSavings)}
                </div>
                <div className="text-sm text-sonar-muted mt-2">
                  Estimated first-year savings
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mb-8">
                <BreakdownRow
                  label="Developer productivity"
                  amount={results.productivitySavings}
                  percentage={Math.round(
                    (results.productivitySavings / results.totalSavings) * 100,
                  )}
                  color="#126ED3"
                />
                <BreakdownRow
                  label="Security incident prevention"
                  amount={results.securitySavings}
                  percentage={Math.round(
                    (results.securitySavings / results.totalSavings) * 100,
                  )}
                  color="#290042"
                />
                <BreakdownRow
                  label="Technical debt reduction"
                  amount={results.debtSavings}
                  percentage={Math.round(
                    (results.debtSavings / results.totalSavings) * 100,
                  )}
                  color="#0C5DB5"
                />
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-4 p-5 rounded-xl bg-white border border-sonar-blue-border/30">
                <div>
                  <div className="text-2xl font-display font-bold text-sonar-ink">
                    {results.roi}%
                  </div>
                  <div className="text-xs text-sonar-muted">First-year ROI</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-sonar-ink">
                    {results.paybackMonths} mo
                  </div>
                  <div className="text-xs text-sonar-muted">Payback period</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-sonar-ink">
                    {results.hoursSaved.toLocaleString()}
                  </div>
                  <div className="text-xs text-sonar-muted">Hours saved / year</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-sonar-ink">
                    {formatCurrency(results.licenseCost)}
                  </div>
                  <div className="text-xs text-sonar-muted">
                    Est. annual license
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <a
                  href="https://www.sonarsource.com/products/sonarqube/downloads/"
                  className="btn-primary w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Free Trial
                </a>
                <p className="text-xs text-sonar-muted text-center mt-3">
                  No credit card required. See savings with your own code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  format: (v: number) => string
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-semibold text-sonar-ink">{label}</label>
        <span className="text-sm font-display font-bold text-sonar-blue">
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sonar-blue
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(18,110,211,0.3)]
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-sonar-blue
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(18,110,211,0.3)]
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #126ED3 0%, #126ED3 ${percentage}%, #E8EFF7 ${percentage}%, #E8EFF7 100%)`,
          }}
        />
      </div>
    </div>
  )
}

function BreakdownRow({
  label,
  amount,
  percentage,
  color,
}: {
  label: string
  amount: number
  percentage: number
  color: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-sonar-muted">{label}</span>
        </div>
        <span className="text-sm font-semibold text-sonar-ink">
          {formatCurrency(amount)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-sonar-blue-light overflow-hidden ml-[18px]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`
  }
  return `$${value}`
}

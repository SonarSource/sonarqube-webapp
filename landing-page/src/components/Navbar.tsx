import { useState, useEffect } from 'react'
import { SonarLogo } from './SonarLogo'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_#B7D3F2]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group text-sonar-blue">
          <SonarLogo size={28} />
          <span className="font-display font-bold text-lg text-sonar-ink">
            Sonar
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#results"
            className="text-sm font-medium text-sonar-muted hover:text-sonar-ink transition-colors"
          >
            Results
          </a>
          <a
            href="#roi-timeline"
            className="text-sm font-medium text-sonar-muted hover:text-sonar-ink transition-colors"
          >
            ROI
          </a>
          <a
            href="#calculator"
            className="text-sm font-medium text-sonar-muted hover:text-sonar-ink transition-colors"
          >
            Calculator
          </a>
          <a
            href="#calculator"
            className="btn-primary !py-2.5 !px-6 !text-[13px]"
          >
            Calculate Your ROI
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1.5">
            <span
              className={`block h-0.5 bg-sonar-ink transition-transform duration-200 ${
                mobileOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-sonar-ink transition-opacity duration-200 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 bg-sonar-ink transition-transform duration-200 ${
                mobileOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-sonar-blue-border px-6 py-4 space-y-3">
          <a
            href="#results"
            className="block text-sm font-medium text-sonar-muted"
            onClick={() => setMobileOpen(false)}
          >
            Results
          </a>
          <a
            href="#roi-timeline"
            className="block text-sm font-medium text-sonar-muted"
            onClick={() => setMobileOpen(false)}
          >
            ROI
          </a>
          <a
            href="#calculator"
            className="block text-sm font-medium text-sonar-muted"
            onClick={() => setMobileOpen(false)}
          >
            Calculator
          </a>
          <a
            href="#calculator"
            className="btn-primary w-full !text-[13px] mt-2"
            onClick={() => setMobileOpen(false)}
          >
            Calculate Your ROI
          </a>
        </div>
      )}
    </nav>
  )
}


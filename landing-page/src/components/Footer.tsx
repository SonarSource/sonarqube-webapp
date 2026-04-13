export function Footer() {
  return (
    <footer className="bg-white border-t border-sonar-blue-border/30 py-12">
      <div className="max-w-content mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 24C8 15.163 15.163 8 24 8"
                stroke="#126ED3"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M8 18C8 12.477 12.477 8 18 8"
                stroke="#126ED3"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M8 12C8 9.791 9.791 8 12 8"
                stroke="#126ED3"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
            </svg>
            <span className="font-display font-bold text-sm text-sonar-ink">
              Sonar
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-sonar-muted">
            <span>Clean Code. Clean Slate.</span>
            <span className="w-1 h-1 rounded-full bg-sonar-muted/30" />
            <span>&copy; {new Date().getFullYear()} SonarSource SA</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://www.sonarsource.com/terms/"
              className="text-xs text-sonar-muted hover:text-sonar-blue transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </a>
            <a
              href="https://www.sonarsource.com/privacy/"
              className="text-xs text-sonar-muted hover:text-sonar-blue transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </div>
        </div>

        <p className="text-center text-[11px] text-sonar-muted/60 mt-8">
          Savings estimates are based on aggregated data and industry benchmarks.
          Actual results vary by organization. Sources include IBM/Ponemon Cost of
          a Data Breach Report, Boehm's Software Engineering Economics, and
          anonymized SonarQube deployment data.
        </p>
      </div>
    </footer>
  )
}

/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { Link } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import type { SecurityCategory } from '../api/cost-savings-api';
import { formatBenchmark } from '../utils/format';
import { CalculationTooltip } from './CalculationTooltip';
import { ComplianceBadge, extractFrameworkName } from './ComplianceBadge';
import { SourceAttribution } from './SourceAttribution';

interface Props {
  category: SecurityCategory;
  projectKeys?: string[];
}

/**
 * Narrative cards follow a three-part structure:
 * 1. What SonarQube found — in plain language, not CWE codes
 * 2. What it costs the industry — IBM/Ponemon benchmark with citation
 * 3. Why it matters here — connected to user's context
 *
 * CWE codes appear in a secondary detail row for technical users.
 */
function NarrativeCard({ category, projectKeys }: Props) {
  const { formatMessage } = useIntl();
  const severityEntries = Object.entries(category.severityBreakdown).filter(
    ([, count]) => count > 0,
  );

  // Deduplicate compliance framework names for badge display
  const uniqueFrameworks = [
    ...new Set((category.complianceFrameworks ?? []).map((fw) => extractFrameworkName(fw))),
  ];

  // Build drill-down link to issues view filtered by this security category
  const issuesUrl = buildIssuesUrl(category.categoryKey, projectKeys);

  // Determine accent color from highest severity present
  const accentColor = getAccentColor(severityEntries);

  return (
    <div
      className="sw-rounded-lg sw-border sw-border-solid sw-overflow-hidden"
      style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
    >
      <div className="sw-p-4">
        {/* Category header with issue count and OWASP tag */}
        <div className="sw-flex sw-items-center sw-justify-between sw-mb-2">
          <div className="sw-flex sw-items-center sw-gap-2">
            <span className="sw-font-semibold sw-text-base">{category.category}</span>
            {category.owasp && (
              <span className="sw-rounded sw-bg-gray-100 sw-px-1.5 sw-py-0.5 sw-text-xs sw-font-medium">
                {category.owasp}
              </span>
            )}
          </div>
          <span className="sw-rounded-full sw-bg-red-100 sw-px-2.5 sw-py-0.5 sw-text-sm sw-font-medium sw-text-red-800">
            {category.issueCount} {formatMessage({ id: 'cost_savings.issues_found' })}
          </span>
        </div>

        {/* Narrative text — the core of the card */}
        <p className="sw-text-sm sw-mb-3">{category.narrative}</p>

        {/* Benchmark highlight box */}
        <div className="sw-rounded sw-bg-gray-50 sw-px-3 sw-py-2 sw-mb-3">
          <div className="sw-flex sw-items-center sw-gap-1">
            <span className="sw-text-lg sw-font-bold">
              {formatBenchmark(category.industryBenchmarkCost)}
            </span>
            <CalculationTooltip content={formatMessage({ id: 'cost_savings.tooltip.benchmark' })} />
          </div>
          <SourceAttribution sources={[category.benchmarkSource]} />
        </div>

        {/* Severity + compliance + drill-down row */}
        <div className="sw-flex sw-items-center sw-flex-wrap sw-gap-2">
          {severityEntries.map(([severity, count]) => (
            <SeverityBadge count={count} key={severity} severity={severity} />
          ))}

          {uniqueFrameworks.length > 0 && (
            <>
              <span className="sw-text-gray-300">|</span>
              {uniqueFrameworks.map((fw) => (
                <ComplianceBadge framework={fw} key={fw} />
              ))}
            </>
          )}

          {issuesUrl && (
            <>
              <span className="sw-text-gray-300">|</span>
              <Link to={issuesUrl}>{formatMessage({ id: 'cost_savings.view_issues' })}</Link>
            </>
          )}
        </div>
      </div>

      {/* Technical detail footer: CWE IDs */}
      {category.cwe.length > 0 && (
        <div
          className="sw-px-4 sw-py-2 sw-text-xs sw-bg-gray-50"
          style={{ color: 'var(--echoes-color-text-subdued)' }}
        >
          {category.cwe.join(' · ')}
        </div>
      )}
    </div>
  );
}

const SEVERITY_ORDER = ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'];
const ACCENT_COLORS: Record<string, string> = {
  BLOCKER: '#dc2626',
  HIGH: '#ea580c',
  LOW: '#9ca3af',
  MEDIUM: '#d97706',
};

function getAccentColor(severityEntries: [string, number][]): string {
  for (const sev of SEVERITY_ORDER) {
    if (severityEntries.some(([s]) => s === sev)) {
      return ACCENT_COLORS[sev] ?? '#9ca3af';
    }
  }
  return '#9ca3af';
}

interface SeverityBadgeProps {
  count: number;
  severity: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  BLOCKER: 'sw-bg-red-200 sw-text-red-800',
  HIGH: 'sw-bg-orange-100 sw-text-orange-800',
  LOW: 'sw-bg-gray-100 sw-text-gray-700',
  MEDIUM: 'sw-bg-yellow-100 sw-text-yellow-800',
};

function SeverityBadge({ severity, count }: SeverityBadgeProps) {
  const colors = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.MEDIUM;
  return (
    <span className={`sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-medium ${colors}`}>
      {count} {severity}
    </span>
  );
}

function buildIssuesUrl(categoryKey: string, projectKeys?: string[]): string | undefined {
  if (!categoryKey) {
    return undefined;
  }
  const params = new URLSearchParams({
    resolved: 'false',
    types: 'VULNERABILITY',
    sonarsourceSecurity: categoryKey,
  });
  if (projectKeys && projectKeys.length > 0) {
    params.set('projects', projectKeys.join(','));
  }
  return `/issues?${params.toString()}`;
}

export { NarrativeCard };

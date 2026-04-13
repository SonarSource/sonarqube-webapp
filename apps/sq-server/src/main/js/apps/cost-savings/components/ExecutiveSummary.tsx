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

import {
  Button,
  ButtonIcon,
  ButtonVariety,
  Heading,
  IconGear,
  Select,
  toast,
} from '@sonarsource/echoes-react';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import type { CostSummary, Period } from '../api/cost-savings-api';
import { formatBenchmark, formatCurrency } from '../utils/format';
import { ExportButton } from './ExportButton';
import { SummaryNarrative } from './SummaryNarrative';
import { ValueDonutChart } from './ValueDonutChart';

interface Props {
  onOpenConfig: () => void;
  onOpenMethodology: () => void;
  onPeriodChange: (period: Period) => void;
  period: Period;
  projectKeys?: string[];
  projectScopeSelector?: ReactNode;
  summary: CostSummary;
}

const PERIOD_OPTIONS: Array<{ label: string; value: Period }> = [
  { label: 'Last Month', value: 'month' },
  { label: 'Last Quarter', value: 'quarter' },
  { label: 'Last 12 Months', value: 'year' },
  { label: 'All Time', value: 'all' },
];

const DONUT_COLORS = {
  maintainability: '#16a34a',
  reliability: '#2563eb',
  security: '#dc2626',
};

function ExecutiveSummary({
  summary,
  period,
  onPeriodChange,
  onOpenConfig,
  onOpenMethodology,
  projectScopeSelector,
  projectKeys,
}: Props) {
  const { formatMessage } = useIntl();
  const {
    timeSavings,
    resolvedIssueCount,
    configured,
    projectCount,
    vulnerabilityCategoryCount,
    remediationBreakdown,
    periodStart,
    periodEnd,
    companyProfile,
    industryBreachBenchmark,
    savingsMode,
  } = summary;

  const totalDollars = Math.abs(timeSavings.total.dollars);
  const isNegative = timeSavings.total.netNewDebt;
  const isEstimated = savingsMode === 'estimated';

  // Dynamic donut label based on whether savings are measured or estimated
  const donutLabel = isEstimated
    ? formatMessage({ id: 'cost_savings.estimated_savings.estimated' })
    : formatMessage({ id: 'cost_savings.estimated_savings.measured' });

  return (
    <div className="sw-rounded-lg sw-border sw-border-solid sw-p-6">
      {/* Unconfigured notice */}
      {!configured && (
        <div className="sw-mb-4 sw-rounded sw-bg-blue-50 sw-p-3 sw-text-sm">
          {formatMessage({ id: 'cost_savings.defaults_banner' })}
        </div>
      )}

      {/* Single-scan estimation banner */}
      {isEstimated && (
        <div className="sw-mb-4 sw-rounded sw-p-3 sw-text-sm sw-flex sw-items-start sw-gap-2 sw-bg-amber-50">
          <span className="sw-inline-flex sw-items-center sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-medium sw-bg-amber-100 sw-text-amber-800 sw-shrink-0">
            {formatMessage({ id: 'cost_savings.confidence.estimated' })}
          </span>
          <span>{formatMessage({ id: 'cost_savings.single_scan_banner' })}</span>
        </div>
      )}

      {/* Header row: title + controls */}
      <div className="sw-flex sw-items-center sw-justify-between sw-mb-2 sw-relative sw-z-10">
        <Heading as="h1" className="sw-typo-lg-semibold">
          {formatMessage({ id: 'cost_savings.page' })}
        </Heading>

        <div className="sw-flex sw-items-center sw-gap-2 sw-flex-wrap">
          <Select
            data={PERIOD_OPTIONS}
            isNotClearable
            onChange={(value) => {
              if (value) {
                onPeriodChange(value as Period);
              }
            }}
            value={period}
          />
          {projectScopeSelector}
          <ButtonIcon
            Icon={IconGear}
            ariaLabel={formatMessage({ id: 'cost_savings.settings' })}
            onClick={onOpenConfig}
            variety={ButtonVariety.DefaultGhost}
          />
          <Button onClick={onOpenMethodology} variety={ButtonVariety.Default}>
            {formatMessage({ id: 'cost_savings.methodology' })}
          </Button>
          <Button
            onClick={() => {
              const url = `${window.location.origin}/cost_savings/summary`;
              navigator.clipboard.writeText(url).then(() => {
                toast.success({
                  description: formatMessage({ id: 'cost_savings.summary_link_copied' }),
                  duration: 'short',
                });
              });
            }}
            variety={ButtonVariety.Default}
          >
            {formatMessage({ id: 'cost_savings.share_summary' })}
          </Button>
          <ExportButton period={period} summary={summary} />
        </div>
      </div>

      {/* Period date range */}
      <div className="sw-text-sm sw-mb-6" style={{ color: 'var(--echoes-color-text-subdued)' }}>
        {periodStart} — {periodEnd}
        {isEstimated && period !== 'all' && (
          <span className="sw-ml-2 sw-italic">
            {formatMessage({ id: 'cost_savings.single_scan_period_note' })}
          </span>
        )}
      </div>

      {/* Donut chart: dimension breakdown */}
      {!isNegative && (
        <div className="sw-py-6 sw-mb-6 sw-border-b sw-border-solid">
          <ValueDonutChart
            centerLabel={donutLabel}
            centerValue={formatCurrency(totalDollars)}
            segments={[
              {
                color: DONUT_COLORS.security,
                label: formatMessage({ id: 'cost_savings.security' }),
                value: Math.abs(timeSavings.security.dollars),
              },
              {
                color: DONUT_COLORS.reliability,
                label: formatMessage({ id: 'cost_savings.reliability' }),
                value: Math.abs(timeSavings.reliability.dollars),
              },
              {
                color: DONUT_COLORS.maintainability,
                label: formatMessage({ id: 'cost_savings.maintainability' }),
                value: Math.abs(timeSavings.maintainability.dollars),
              },
            ]}
          />
        </div>
      )}

      {/* Net new debt warning */}
      {isNegative && (
        <div className="sw-rounded sw-bg-red-50 sw-p-4 sw-mb-6 sw-text-center">
          <div className="sw-text-3xl sw-font-bold sw-text-red-600">
            {formatCurrency(totalDollars)}
          </div>
          <div className="sw-text-sm sw-mt-1">
            {formatMessage({ id: 'cost_savings.net_new_debt' })}
          </div>
        </div>
      )}

      {/* Investment vs. Return comparison */}
      {!isNegative && remediationBreakdown && (
        <CostComparison
          productionCost={totalDollars}
          remediationCost={remediationBreakdown.totalCost}
        />
      )}

      {/* Key stats */}
      <div className="sw-flex sw-justify-center sw-gap-10 sw-py-4 sw-mb-4">
        <KeyStat
          label={formatMessage({ id: 'cost_savings.stat.issues_resolved' })}
          value={resolvedIssueCount.toLocaleString()}
        />
        <KeyStat
          label={formatMessage({ id: 'cost_savings.stat.projects' })}
          value={projectCount.toLocaleString()}
        />
        {vulnerabilityCategoryCount > 0 && (
          <KeyStat
            label={formatMessage({ id: 'cost_savings.stat.vuln_categories' })}
            value={vulnerabilityCategoryCount.toLocaleString()}
          />
        )}
        {companyProfile.hourlyRate > 0 && (
          <KeyStat
            label={formatMessage({ id: 'cost_savings.stat.hourly_rate' })}
            value={`$${companyProfile.hourlyRate}/hr`}
          />
        )}
      </div>

      {/* Industry context — factual benchmark, not a savings claim */}
      {vulnerabilityCategoryCount > 0 && industryBreachBenchmark > 0 && (
        <div
          className="sw-rounded sw-bg-gray-50 sw-p-3 sw-mb-4 sw-text-sm"
          style={{ color: 'var(--echoes-color-text-subdued)' }}
        >
          {formatMessage(
            { id: 'cost_savings.industry_context.benchmark' },
            {
              industry: companyProfile.industry,
              cost: formatBenchmark(industryBreachBenchmark),
            },
          )}
        </div>
      )}

      {/* Narrative for email / board use */}
      <SummaryNarrative period={period} projectKeys={projectKeys} summary={summary} />
    </div>
  );
}

interface CostComparisonProps {
  productionCost: number;
  remediationCost: number;
}

function CostComparison({ remediationCost, productionCost }: CostComparisonProps) {
  const { formatMessage } = useIntl();
  const netValue = productionCost - remediationCost;
  const maxBar = Math.max(remediationCost, productionCost);

  return (
    <div className="sw-rounded sw-border sw-border-solid sw-p-4 sw-mb-6">
      <div className="sw-text-sm sw-font-semibold sw-mb-3">
        {formatMessage({ id: 'cost_savings.comparison.title' })}
      </div>

      <div className="sw-flex sw-flex-col sw-gap-3">
        {/* Fix cost now */}
        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1">
            <span>{formatMessage({ id: 'cost_savings.comparison.fix_now' })}</span>
            <span className="sw-font-semibold">{formatCurrency(remediationCost)}</span>
          </div>
          <div className="sw-h-4 sw-bg-gray-100 sw-rounded sw-overflow-hidden">
            <div
              className="sw-h-full sw-bg-blue-400 sw-rounded"
              style={{ width: `${maxBar > 0 ? (remediationCost / maxBar) * 100 : 0}%` }}
            />
          </div>
          <div
            className="sw-text-xs sw-mt-0.5"
            style={{ color: 'var(--echoes-color-text-subdued)' }}
          >
            {formatMessage({ id: 'cost_savings.comparison.fix_now_detail' })}
          </div>
        </div>

        {/* Production cost */}
        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1">
            <span>{formatMessage({ id: 'cost_savings.comparison.production_cost' })}</span>
            <span className="sw-font-semibold">{formatCurrency(productionCost)}</span>
          </div>
          <div className="sw-h-4 sw-bg-gray-100 sw-rounded sw-overflow-hidden">
            <div
              className="sw-h-full sw-bg-red-400 sw-rounded"
              style={{ width: `${maxBar > 0 ? (productionCost / maxBar) * 100 : 0}%` }}
            />
          </div>
          <div
            className="sw-text-xs sw-mt-0.5"
            style={{ color: 'var(--echoes-color-text-subdued)' }}
          >
            {formatMessage({ id: 'cost_savings.comparison.production_cost_detail' })}
          </div>
        </div>

        {/* Net value */}
        <div className="sw-border-t sw-pt-3">
          <div className="sw-flex sw-justify-between sw-items-center">
            <span className="sw-text-sm sw-font-bold">
              {formatMessage({ id: 'cost_savings.comparison.net_value' })}
            </span>
            <span className="sw-text-lg sw-font-bold sw-text-green-700">
              {formatCurrency(netValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeyStatProps {
  label: string;
  value: string;
}

function KeyStat({ value, label }: KeyStatProps) {
  return (
    <div className="sw-text-center">
      <div className="sw-text-xl sw-font-bold">{value}</div>
      <div className="sw-text-xs" style={{ color: 'var(--echoes-color-text-subdued)' }}>
        {label}
      </div>
    </div>
  );
}

export { ExecutiveSummary };

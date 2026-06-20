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
  maintainability: '#0C5DB5',
  reliability: '#290042',
  security: '#126ED3',
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
    <div
      className="sw-overflow-hidden"
      style={{
        borderRadius: 12,
        border: '2px solid rgba(183, 211, 242, 0.6)',
      }}
    >
      {/* Hero header area */}
      <div
        className="sw-p-8"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF4FC 50%, #F7F9FC 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(18, 110, 211, 0.03)',
            pointerEvents: 'none',
          }}
        />

        {/* Unconfigured notice */}
        {!configured && (
          <div
            className="sw-mb-5 sw-p-3 sw-text-sm sw-flex sw-items-center sw-gap-2"
            style={{
              borderRadius: 8,
              backgroundColor: '#EEF4FC',
              border: '1px solid #B7D3F2',
              color: '#126ED3',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#126ED3',
                flexShrink: 0,
              }}
            />
            {formatMessage({ id: 'cost_savings.defaults_banner' })}
          </div>
        )}

        {/* Single-scan estimation banner */}
        {isEstimated && (
          <div
            className="sw-mb-5 sw-p-3 sw-text-sm sw-flex sw-items-start sw-gap-2"
            style={{
              borderRadius: 8,
              backgroundColor: 'rgb(255, 251, 235)',
              border: '1px solid rgb(253, 230, 138)',
            }}
          >
            <span
              className="sw-inline-flex sw-items-center sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-medium sw-shrink-0"
              style={{ backgroundColor: 'rgb(254, 243, 199)', color: 'rgb(146, 64, 14)' }}
            >
              {formatMessage({ id: 'cost_savings.confidence.estimated' })}
            </span>
            <span>{formatMessage({ id: 'cost_savings.single_scan_banner' })}</span>
          </div>
        )}

        {/* Header row: title + controls */}
        <div
          className="sw-flex sw-items-center sw-justify-between sw-mb-2"
          style={{ position: 'relative', zIndex: 20 }}
        >
          <h1
            className="sw-font-bold"
            style={{
              fontSize: 28,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: '#290042',
            }}
          >
            {formatMessage({ id: 'cost_savings.page' })}
          </h1>

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
        <div
          className="sw-text-sm sw-mb-8"
          style={{ color: '#69809B', position: 'relative', zIndex: 0 }}
        >
          {periodStart} — {periodEnd}
          {isEstimated && period !== 'all' && (
            <span className="sw-ml-2 sw-italic">
              {formatMessage({ id: 'cost_savings.single_scan_period_note' })}
            </span>
          )}
        </div>

        {/* Donut chart: dimension breakdown */}
        {!isNegative && (
          <div
            className="sw-py-8 sw-mb-8"
            style={{
              position: 'relative',
              zIndex: 0,
              borderBottom: '1px solid rgba(183, 211, 242, 0.4)',
            }}
          >
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
          <div
            className="sw-p-6 sw-mb-8 sw-text-center"
            style={{ borderRadius: 12, backgroundColor: 'rgb(254, 242, 242)' }}
          >
            <div className="sw-font-bold" style={{ fontSize: 36, color: '#dc2626' }}>
              {formatCurrency(totalDollars)}
            </div>
            <div className="sw-text-sm sw-mt-2" style={{ color: '#69809B' }}>
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
      </div>

      {/* Key stats section */}
      <div className="sw-px-8 sw-py-6" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="sw-grid sw-grid-cols-4 sw-gap-6">
          <KeyStat
            icon={
              <svg
                fill="none"
                height="20"
                stroke="#126ED3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
            label={formatMessage({ id: 'cost_savings.stat.issues_resolved' })}
            value={resolvedIssueCount.toLocaleString()}
          />
          <KeyStat
            icon={
              <svg
                fill="none"
                height="20"
                stroke="#126ED3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
              </svg>
            }
            label={formatMessage({ id: 'cost_savings.stat.projects' })}
            value={projectCount.toLocaleString()}
          />
          {vulnerabilityCategoryCount > 0 && (
            <KeyStat
              icon={
                <svg
                  fill="none"
                  height="20"
                  stroke="#126ED3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
              label={formatMessage({ id: 'cost_savings.stat.vuln_categories' })}
              value={vulnerabilityCategoryCount.toLocaleString()}
            />
          )}
          {companyProfile.hourlyRate > 0 && (
            <KeyStat
              icon={
                <svg
                  fill="none"
                  height="20"
                  stroke="#126ED3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="20"
                >
                  <line x1="12" x2="12" y1="1" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              label={formatMessage({ id: 'cost_savings.stat.hourly_rate' })}
              value={`$${companyProfile.hourlyRate}/hr`}
            />
          )}
        </div>
      </div>

      {/* Bottom section: context + narrative */}
      <div className="sw-px-8 sw-py-6">
        {/* Industry context */}
        {vulnerabilityCategoryCount > 0 && industryBreachBenchmark > 0 && (
          <div
            className="sw-p-4 sw-mb-4 sw-text-sm"
            style={{
              borderRadius: 8,
              backgroundColor: '#EEF4FC',
              color: '#69809B',
              border: '1px solid rgba(183, 211, 242, 0.4)',
            }}
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
    <div
      className="sw-p-5 sw-mb-8"
      style={{
        borderRadius: 12,
        border: '1px solid rgba(183, 211, 242, 0.4)',
        backgroundColor: 'white',
      }}
    >
      <div className="sw-font-semibold sw-mb-4" style={{ color: '#290042', fontSize: 15 }}>
        {formatMessage({ id: 'cost_savings.comparison.title' })}
      </div>

      <div className="sw-flex sw-flex-col sw-gap-4">
        {/* Fix cost now */}
        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1.5">
            <span style={{ color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.comparison.fix_now' })}
            </span>
            <span className="sw-font-semibold" style={{ color: '#126ED3' }}>
              {formatCurrency(remediationCost)}
            </span>
          </div>
          <div
            className="sw-overflow-hidden"
            style={{ height: 6, borderRadius: 3, backgroundColor: '#EEF4FC' }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #126ED3, #0F63BF)',
                width: `${maxBar > 0 ? (remediationCost / maxBar) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="sw-text-xs sw-mt-1" style={{ color: '#69809B' }}>
            {formatMessage({ id: 'cost_savings.comparison.fix_now_detail' })}
          </div>
        </div>

        {/* Production cost */}
        <div>
          <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1.5">
            <span style={{ color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.comparison.production_cost' })}
            </span>
            <span className="sw-font-semibold" style={{ color: '#290042' }}>
              {formatCurrency(productionCost)}
            </span>
          </div>
          <div
            className="sw-overflow-hidden"
            style={{ height: 6, borderRadius: 3, backgroundColor: '#EEF4FC' }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(90deg, #290042, #290042)',
                width: `${maxBar > 0 ? (productionCost / maxBar) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="sw-text-xs sw-mt-1" style={{ color: '#69809B' }}>
            {formatMessage({ id: 'cost_savings.comparison.production_cost_detail' })}
          </div>
        </div>

        {/* Net value */}
        <div style={{ borderTop: '1px solid rgba(183, 211, 242, 0.4)', paddingTop: 12 }}>
          <div className="sw-flex sw-justify-between sw-items-center">
            <span className="sw-text-sm sw-font-bold" style={{ color: '#290042' }}>
              {formatMessage({ id: 'cost_savings.comparison.net_value' })}
            </span>
            <span
              className="sw-font-bold"
              style={{
                fontSize: 20,
                background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatCurrency(netValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KeyStatProps {
  icon?: ReactNode;
  label: string;
  value: string;
}

function KeyStat({ value, label, icon }: KeyStatProps) {
  return (
    <div
      className="sw-p-4 sw-text-center"
      style={{
        borderRadius: 12,
        backgroundColor: 'white',
        border: '2px solid rgba(183, 211, 242, 0.5)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {icon && (
        <div
          className="sw-mx-auto sw-mb-3 sw-flex sw-items-center sw-justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#EEF4FC',
          }}
        >
          {icon}
        </div>
      )}
      <div
        className="sw-font-bold sw-mb-1"
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {value}
      </div>
      <div className="sw-text-xs sw-font-medium" style={{ color: '#69809B' }}>
        {label}
      </div>
    </div>
  );
}

export { ExecutiveSummary };

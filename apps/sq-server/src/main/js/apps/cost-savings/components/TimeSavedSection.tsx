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

import { Heading, Link, Spinner, Tooltip } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { AdvancedTimeline } from '~sq-server-commons/components/charts/AdvancedTimeline';
import type { Chart } from '~sq-server-commons/types/types';
import type { CostSummary, MonthlyTrend, Period } from '../api/cost-savings-api';
import { useTrendsQuery } from '../hooks/useCostSavings';
import { formatCurrency } from '../utils/format';
import { ConfidenceBadge } from './ConfidenceBadge';
import { MaturityCurve } from './MaturityCurve';
import { SourceAttribution } from './SourceAttribution';

interface Props {
  period: Period;
  projectKeys?: string[];
  summary: CostSummary;
}

const PERIOD_MONTHS: Record<Period, number> = {
  all: 36,
  month: 1,
  quarter: 3,
  year: 12,
};

const DIMENSION_QUALITY_MAP: Record<string, string> = {
  Maintainability: 'MAINTAINABILITY',
  Reliability: 'RELIABILITY',
  Security: 'SECURITY',
};

function buildDimensionIssuesUrl(quality: string, projectKeys?: string[]): string {
  const params = new URLSearchParams({
    resolved: 'false',
    impactSoftwareQualities: quality,
  });
  if (projectKeys && projectKeys.length > 0) {
    params.set('projects', projectKeys.join(','));
  }
  return `/issues?${params.toString()}`;
}

/**
 * Transforms monthly trend data into a cumulative ChartSerie for AdvancedTimeline.
 * Each point = sum of all previous months' savings (area chart feel).
 */
function buildCumulativeSeries(monthly: MonthlyTrend[]): Chart.Serie[] {
  let cumulative = 0;
  const data = monthly.map((m) => {
    cumulative += m.dollars;
    return {
      x: new Date(m.month + '-15'),
      y: cumulative,
    };
  });

  return [
    {
      data,
      name: 'cumulative-savings',
      translatedName: 'Cumulative Savings',
      type: 'CURRENCY',
    },
  ];
}

/**
 * Builds a dashed overlay series for period-over-period comparison.
 * Shifts previous period data to align on the same x-axis dates as current.
 */
function buildComparisonSeries(
  currentMonthly: MonthlyTrend[],
  previousMonthly: MonthlyTrend[],
): Chart.Serie | undefined {
  if (previousMonthly.length === 0) {
    return undefined;
  }

  let cumulative = 0;
  const data = previousMonthly.map((m, i) => {
    cumulative += m.dollars;
    // Align x-axis with current period dates
    const currentDate =
      i < currentMonthly.length
        ? new Date(currentMonthly[i].month + '-15')
        : new Date(m.month + '-15');
    return {
      x: currentDate,
      y: cumulative,
    };
  });

  return {
    data,
    name: 'previous-period',
    translatedName: 'Previous Period',
    type: 'CURRENCY',
  };
}

function formatYTick(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return formatCurrency(num);
}

function TimeSavedSection({ summary, period, projectKeys }: Props) {
  const { formatMessage } = useIntl();
  const months = PERIOD_MONTHS[period];
  const isEstimated = summary.savingsMode === 'estimated';
  const { data: trends, isLoading: trendsLoading } = useTrendsQuery(months, projectKeys);

  // Fetch previous period for comparison overlay
  const { data: previousTrends } = useTrendsQuery(months * 2, projectKeys);

  const { series, comparisonSeries } = useMemo(() => {
    if (!trends || trends.monthly.length === 0) {
      return { comparisonSeries: undefined, series: [] };
    }

    const currentSeries = buildCumulativeSeries(trends.monthly);

    // Build comparison from the first half of the double-period fetch
    let comparison: Chart.Serie | undefined;
    if (previousTrends && previousTrends.monthly.length > months) {
      const previousHalf = previousTrends.monthly.slice(0, months);
      comparison = buildComparisonSeries(trends.monthly, previousHalf);
    }

    return { comparisonSeries: comparison, series: currentSeries };
  }, [trends, previousTrends, months]);

  const allSeries = useMemo(() => {
    const result = [...series];
    if (comparisonSeries) {
      result.push(comparisonSeries);
    }
    return result;
  }, [series, comparisonSeries]);

  return (
    <div className="sw-p-6">
      <div className="sw-flex sw-items-center sw-gap-2 sw-mb-4">
        <Heading as="h2" className="sw-typo-semibold">
          {formatMessage({ id: 'cost_savings.time_saved.title' })}
        </Heading>
        <ConfidenceBadge level={isEstimated ? 'estimated' : 'high'} />
      </div>

      <p className="sw-text-sm sw-mb-4">
        {formatMessage({ id: 'cost_savings.time_saved.description' })}
      </p>

      {summary.issuesPerKLoc > 0 && (
        <div className="sw-rounded sw-bg-gray-50 sw-p-3 sw-mb-4 sw-inline-block">
          <span className="sw-text-lg sw-font-bold">{summary.issuesPerKLoc}</span>
          <span className="sw-text-sm sw-ml-1">
            {formatMessage({ id: 'cost_savings.time_saved.issues_per_kloc' })}
          </span>
          <SourceAttribution
            sources={[formatMessage({ id: 'cost_savings.time_saved.issues_per_kloc_source' })]}
          />
        </div>
      )}

      {/* Dimension breakdown table with drill-down links */}
      <div className="sw-mb-6">
        <table className="sw-w-full">
          <thead>
            <tr className="sw-text-left sw-text-sm sw-font-medium">
              <th className="sw-pb-2">{formatMessage({ id: 'cost_savings.dimension' })}</th>
              <th className="sw-pb-2 sw-text-right">
                {formatMessage({ id: 'cost_savings.hours' })}
              </th>
              <th className="sw-pb-2 sw-text-right">
                <Tooltip
                  content={formatMessage({
                    id: 'cost_savings.time_saved.savings_includes_multiplier',
                  })}
                >
                  <span className="sw-cursor-help sw-border-b sw-border-dashed">
                    {formatMessage({ id: 'cost_savings.savings' })}
                  </span>
                </Tooltip>
              </th>
              <th className="sw-pb-2 sw-text-right">
                {formatMessage({ id: 'cost_savings.multiplier' })}
              </th>
            </tr>
          </thead>
          <tbody>
            <DimensionRow
              dollars={summary.timeSavings.security.dollars}
              hours={summary.timeSavings.security.hours}
              issuesUrl={buildDimensionIssuesUrl('SECURITY', projectKeys)}
              multiplier="30x"
              name={formatMessage({ id: 'cost_savings.security' })}
              netNewDebt={summary.timeSavings.security.netNewDebt}
            />
            <DimensionRow
              dollars={summary.timeSavings.reliability.dollars}
              hours={summary.timeSavings.reliability.hours}
              issuesUrl={buildDimensionIssuesUrl('RELIABILITY', projectKeys)}
              multiplier="5x"
              name={formatMessage({ id: 'cost_savings.reliability' })}
              netNewDebt={summary.timeSavings.reliability.netNewDebt}
            />
            <DimensionRow
              dollars={summary.timeSavings.maintainability.dollars}
              hours={summary.timeSavings.maintainability.hours}
              issuesUrl={buildDimensionIssuesUrl('MAINTAINABILITY', projectKeys)}
              multiplier="5x"
              name={formatMessage({ id: 'cost_savings.maintainability' })}
              netNewDebt={summary.timeSavings.maintainability.netNewDebt}
            />
          </tbody>
        </table>
      </div>

      {/* Cumulative area chart with AdvancedTimeline */}
      <div>
        <Heading as="h3" className="sw-typo-semibold sw-mb-3">
          {formatMessage({ id: 'cost_savings.trends.title' })}
        </Heading>
        <Spinner isLoading={trendsLoading}>
          {allSeries.length > 0 &&
          allSeries[0].data.length > 0 &&
          allSeries[0].data.some((d) => d.y !== 0) ? (
            <AdvancedTimeline
              formatYTick={formatYTick}
              height={200}
              metricType="INT"
              series={allSeries}
              showAreas
              width={700}
            />
          ) : (
            <div className="sw-rounded sw-bg-gray-50 sw-p-6 sw-text-center">
              <p className="sw-text-sm" style={{ color: 'var(--echoes-color-text-subdued)' }}>
                {formatMessage({ id: 'cost_savings.trends.empty' })}
              </p>
            </div>
          )}
        </Spinner>

        {/* Maturity Curve — projected value over time */}
        <MaturityCurve currentSavings={summary.timeSavings.total.dollars} />
      </div>
    </div>
  );
}

interface DimensionRowProps {
  dollars: number;
  hours: number;
  issuesUrl: string;
  multiplier: string;
  name: string;
  netNewDebt: boolean;
}

function DimensionRow({
  name,
  hours,
  dollars,
  multiplier,
  netNewDebt,
  issuesUrl,
}: DimensionRowProps) {
  const { formatMessage } = useIntl();
  const colorClass = netNewDebt ? 'sw-text-red-600' : '';

  return (
    <tr className="sw-border-t">
      <td className="sw-py-2">
        <Link to={issuesUrl}>{name}</Link>
      </td>
      <td className={`sw-py-2 sw-text-right ${colorClass}`}>{Math.abs(hours).toLocaleString()}</td>
      <td className={`sw-py-2 sw-text-right sw-font-semibold ${colorClass}`}>
        {formatCurrency(Math.abs(dollars))}
      </td>
      <td className="sw-py-2 sw-text-right sw-text-sm">{multiplier}</td>
    </tr>
  );
}

export { TimeSavedSection };

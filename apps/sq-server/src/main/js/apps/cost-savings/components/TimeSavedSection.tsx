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

import { Link, Spinner, Tooltip } from '@sonarsource/echoes-react';
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
    <div className="sw-p-8">
      <div className="sw-flex sw-items-center sw-gap-3 sw-mb-3">
        <h2 className="sw-font-bold" style={{ fontSize: 20, color: '#290042' }}>
          {formatMessage({ id: 'cost_savings.time_saved.title' })}
        </h2>
        <ConfidenceBadge level={isEstimated ? 'estimated' : 'high'} />
      </div>

      <p className="sw-text-sm sw-mb-6" style={{ color: '#69809B', lineHeight: 1.6 }}>
        {formatMessage({ id: 'cost_savings.time_saved.description' })}
      </p>

      {summary.issuesPerKLoc > 0 && (
        <div
          className="sw-p-4 sw-mb-6 sw-inline-flex sw-items-center sw-gap-2"
          style={{
            borderRadius: 10,
            backgroundColor: '#EEF4FC',
            border: '1px solid #B7D3F2',
          }}
        >
          <span
            className="sw-font-bold"
            style={{
              fontSize: 22,
              background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {summary.issuesPerKLoc}
          </span>
          <span className="sw-text-sm" style={{ color: '#290042' }}>
            {formatMessage({ id: 'cost_savings.time_saved.issues_per_kloc' })}
          </span>
          <SourceAttribution
            sources={[formatMessage({ id: 'cost_savings.time_saved.issues_per_kloc_source' })]}
          />
        </div>
      )}

      {/* Dimension breakdown table with drill-down links */}
      <div
        className="sw-mb-8"
        style={{
          borderRadius: 12,
          border: '1px solid rgba(183, 211, 242, 0.4)',
          overflow: 'hidden',
        }}
      >
        <table className="sw-w-full">
          <thead>
            <tr
              className="sw-text-left sw-text-sm sw-font-semibold"
              style={{ backgroundColor: '#F7F9FC' }}
            >
              <th className="sw-py-3 sw-px-5" style={{ color: '#290042' }}>
                {formatMessage({ id: 'cost_savings.dimension' })}
              </th>
              <th className="sw-py-3 sw-px-5 sw-text-right" style={{ color: '#290042' }}>
                {formatMessage({ id: 'cost_savings.hours' })}
              </th>
              <th className="sw-py-3 sw-px-5 sw-text-right" style={{ color: '#290042' }}>
                <Tooltip
                  content={formatMessage({
                    id: 'cost_savings.time_saved.savings_includes_multiplier',
                  })}
                >
                  <span className="sw-cursor-help" style={{ borderBottom: '1px dashed #B7D3F2' }}>
                    {formatMessage({ id: 'cost_savings.savings' })}
                  </span>
                </Tooltip>
              </th>
              <th className="sw-py-3 sw-px-5 sw-text-right" style={{ color: '#290042' }}>
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
        <h3 className="sw-font-bold sw-mb-4" style={{ fontSize: 18, color: '#290042' }}>
          {formatMessage({ id: 'cost_savings.trends.title' })}
        </h3>
        <Spinner isLoading={trendsLoading}>
          {allSeries.length > 0 &&
          allSeries[0].data.length > 0 &&
          allSeries[0].data.some((d) => d.y !== 0) ? (
            <div
              className="sw-p-4"
              style={{
                borderRadius: 12,
                border: '1px solid rgba(183, 211, 242, 0.4)',
              }}
            >
              <AdvancedTimeline
                formatYTick={formatYTick}
                height={200}
                metricType="INT"
                series={allSeries}
                showAreas
                width={700}
              />
            </div>
          ) : (
            <div
              className="sw-p-6 sw-text-center"
              style={{
                borderRadius: 12,
                backgroundColor: '#F7F9FC',
              }}
            >
              <p className="sw-text-sm" style={{ color: '#69809B' }}>
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
  return (
    <tr style={{ borderTop: '1px solid rgba(183, 211, 242, 0.3)' }}>
      <td className="sw-py-3 sw-px-5">
        <Link to={issuesUrl}>{name}</Link>
      </td>
      <td
        className="sw-py-3 sw-px-5 sw-text-right"
        style={{ color: netNewDebt ? '#dc2626' : '#290042' }}
      >
        {Math.abs(hours).toLocaleString()}
      </td>
      <td
        className="sw-py-3 sw-px-5 sw-text-right sw-font-semibold"
        style={{ color: netNewDebt ? '#dc2626' : '#126ED3' }}
      >
        {formatCurrency(Math.abs(dollars))}
      </td>
      <td className="sw-py-3 sw-px-5 sw-text-right sw-text-sm">
        <span
          className="sw-inline-flex sw-items-center sw-rounded-full sw-px-2 sw-py-0.5 sw-text-xs sw-font-semibold"
          style={{ backgroundColor: '#EEF4FC', color: '#126ED3' }}
        >
          {multiplier}
        </span>
      </td>
    </tr>
  );
}

export { TimeSavedSection };

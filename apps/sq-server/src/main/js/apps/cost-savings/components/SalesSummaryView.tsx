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

import { Heading, Spinner } from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { AdvancedTimeline } from '~sq-server-commons/components/charts/AdvancedTimeline';
import type { Chart } from '~sq-server-commons/types/types';
import type { MonthlyTrend } from '../api/cost-savings-api';
import {
  useCostSummaryQuery,
  useSecurityDetailQuery,
  useTrendsQuery,
} from '../hooks/useCostSavings';
import { formatBenchmark, formatCurrency } from '../utils/format';

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

function SalesSummaryView() {
  const { formatMessage } = useIntl();
  const { data: summary, isLoading: summaryLoading } = useCostSummaryQuery('year');
  const { data: securityDetail } = useSecurityDetailQuery();
  const { data: trends, isLoading: trendsLoading } = useTrendsQuery(12);

  const series = useMemo(() => {
    if (!trends || trends.monthly.length === 0) {
      return [];
    }
    return buildCumulativeSeries(trends.monthly);
  }, [trends]);

  const topCategories = useMemo(() => {
    if (!securityDetail?.categories) {
      return [];
    }
    return [...securityDetail.categories].sort((a, b) => b.issueCount - a.issueCount).slice(0, 3);
  }, [securityDetail]);

  const title = formatMessage({ id: 'cost_savings.summary.title' });

  return (
    <div className="sw-max-w-[800px] sw-mx-auto sw-p-8">
      <Helmet defer={false} title={title} />

      <style>{`
        @media print {
          nav, header, footer, .global-footer { display: none !important; }
          .sw-max-w-\\[800px\\] { max-width: none; padding: 0; }
        }
      `}</style>

      <Spinner isLoading={summaryLoading}>
        {summary && (
          <>
            {/* Hero: estimated savings as primary, industry context as secondary */}
            <div className="sw-text-center sw-mb-8">
              <Heading as="h1" className="sw-typo-lg-semibold sw-mb-2">
                {formatMessage({ id: 'cost_savings.summary.headline' })}
              </Heading>
              <div className="sw-text-5xl sw-font-bold sw-text-green-700">
                {formatCurrency(Math.abs(summary.timeSavings.total.dollars))}
              </div>
              <div className="sw-text-lg sw-mt-2">
                {formatMessage({ id: 'cost_savings.headline' })}
              </div>
              {summary.industryBreachBenchmark > 0 && summary.vulnerabilityCategoryCount > 0 && (
                <div
                  className="sw-mt-4 sw-text-sm"
                  style={{ color: 'var(--echoes-color-text-subdued)' }}
                >
                  {formatMessage(
                    { id: 'cost_savings.industry_context.benchmark' },
                    {
                      industry: summary.companyProfile.industry,
                      cost: formatBenchmark(summary.industryBreachBenchmark),
                    },
                  )}
                </div>
              )}
            </div>

            {/* Dimension breakdown */}
            <div className="sw-mb-8">
              <Heading as="h2" className="sw-typo-semibold sw-mb-3">
                {formatMessage({ id: 'cost_savings.summary.breakdown' })}
              </Heading>
              <div className="sw-flex sw-justify-around">
                <SummaryDimension
                  label={formatMessage({ id: 'cost_savings.security' })}
                  savings={summary.timeSavings.security.dollars}
                />
                <SummaryDimension
                  label={formatMessage({ id: 'cost_savings.reliability' })}
                  savings={summary.timeSavings.reliability.dollars}
                />
                <SummaryDimension
                  label={formatMessage({ id: 'cost_savings.maintainability' })}
                  savings={summary.timeSavings.maintainability.dollars}
                />
              </div>
            </div>

            {/* Trend chart */}
            <div className="sw-mb-8">
              <Heading as="h2" className="sw-typo-semibold sw-mb-3">
                {formatMessage({ id: 'cost_savings.trends.title' })}
              </Heading>
              <Spinner isLoading={trendsLoading}>
                {series.length > 0 && series[0].data.length > 0 && (
                  <AdvancedTimeline
                    formatYTick={(v) => formatCurrency(typeof v === 'string' ? parseFloat(v) : v)}
                    height={200}
                    metricType="INT"
                    series={series}
                    showAreas
                    width={700}
                  />
                )}
              </Spinner>
            </div>

            {/* Top 3 vulnerability categories */}
            {topCategories.length > 0 && (
              <div>
                <Heading as="h2" className="sw-typo-semibold sw-mb-3">
                  {formatMessage({ id: 'cost_savings.summary.top_vulnerabilities' })}
                </Heading>
                <div className="sw-flex sw-flex-col sw-gap-3">
                  {topCategories.map((cat) => (
                    <div
                      className="sw-flex sw-justify-between sw-items-center sw-rounded sw-border sw-border-solid sw-p-3"
                      key={cat.categoryKey}
                    >
                      <div>
                        <div className="sw-font-semibold">{cat.category}</div>
                        <div className="sw-text-sm">
                          {cat.issueCount}{' '}
                          {formatMessage({ id: 'cost_savings.summary.issues_found' })}
                        </div>
                      </div>
                      <div className="sw-text-right">
                        <div className="sw-font-semibold">
                          {formatCurrency(cat.industryBenchmarkCost)}
                        </div>
                        <div
                          className="sw-text-xs"
                          style={{ color: 'var(--echoes-color-text-subdued)' }}
                        >
                          {formatMessage({ id: 'cost_savings.industry_benchmark' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              className="sw-text-center sw-mt-8 sw-pt-4 sw-border-t sw-text-xs"
              style={{ color: 'var(--echoes-color-text-subdued)' }}
            >
              {formatMessage({ id: 'cost_savings.summary.footer' })}
            </div>
          </>
        )}
      </Spinner>
    </div>
  );
}

interface SummaryDimensionProps {
  label: string;
  savings: number;
}

function SummaryDimension({ label, savings }: SummaryDimensionProps) {
  return (
    <div className="sw-text-center">
      <div className="sw-text-2xl sw-font-bold sw-text-green-700">
        {formatCurrency(Math.abs(savings))}
      </div>
      <div className="sw-text-sm sw-mt-1">{label}</div>
    </div>
  );
}

export { SalesSummaryView };

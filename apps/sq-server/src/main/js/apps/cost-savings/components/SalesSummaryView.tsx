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

import { Spinner } from '@sonarsource/echoes-react';
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
    <div className="sw-mx-auto sw-p-10" style={{ maxWidth: 860 }}>
      <Helmet defer={false} title={title} />

      <style>{`
        @media print {
          nav, header, footer, .global-footer { display: none !important; }
        }
      `}</style>

      <Spinner isLoading={summaryLoading}>
        {summary && (
          <>
            {/* Hero: estimated savings as primary, industry context as secondary */}
            <div
              className="sw-text-center sw-mb-10 sw-py-12 sw-px-8"
              style={{
                borderRadius: 16,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF4FC 50%, #F7F9FC 100%)',
                border: '2px solid rgba(183, 211, 242, 0.5)',
              }}
            >
              <h1 className="sw-font-bold sw-mb-4" style={{ fontSize: 24, color: '#290042' }}>
                {formatMessage({ id: 'cost_savings.summary.headline' })}
              </h1>
              <div
                className="sw-font-bold"
                style={{
                  fontSize: 56,
                  background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                {formatCurrency(Math.abs(summary.timeSavings.total.dollars))}
              </div>
              <div className="sw-mt-3" style={{ fontSize: 18, color: '#69809B' }}>
                {formatMessage({ id: 'cost_savings.headline' })}
              </div>
              {summary.industryBreachBenchmark > 0 && summary.vulnerabilityCategoryCount > 0 && (
                <div className="sw-mt-5 sw-text-sm" style={{ color: '#69809B' }}>
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
            <div className="sw-mb-10">
              <h2 className="sw-font-bold sw-mb-5" style={{ fontSize: 22, color: '#290042' }}>
                {formatMessage({ id: 'cost_savings.summary.breakdown' })}
              </h2>
              <div className="sw-grid sw-grid-cols-3 sw-gap-5">
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
            <div className="sw-mb-10">
              <h2 className="sw-font-bold sw-mb-5" style={{ fontSize: 22, color: '#290042' }}>
                {formatMessage({ id: 'cost_savings.trends.title' })}
              </h2>
              <Spinner isLoading={trendsLoading}>
                {series.length > 0 && series[0].data.length > 0 && (
                  <div
                    className="sw-p-5"
                    style={{
                      borderRadius: 12,
                      border: '1px solid rgba(183, 211, 242, 0.4)',
                    }}
                  >
                    <AdvancedTimeline
                      formatYTick={(v) => formatCurrency(typeof v === 'string' ? parseFloat(v) : v)}
                      height={200}
                      metricType="INT"
                      series={series}
                      showAreas
                      width={700}
                    />
                  </div>
                )}
              </Spinner>
            </div>

            {/* Top 3 vulnerability categories */}
            {topCategories.length > 0 && (
              <div>
                <h2 className="sw-font-bold sw-mb-5" style={{ fontSize: 22, color: '#290042' }}>
                  {formatMessage({ id: 'cost_savings.summary.top_vulnerabilities' })}
                </h2>
                <div className="sw-flex sw-flex-col sw-gap-4">
                  {topCategories.map((cat) => (
                    <div
                      className="sw-flex sw-justify-between sw-items-center sw-p-5"
                      key={cat.categoryKey}
                      style={{
                        borderRadius: 12,
                        border: '2px solid rgba(183, 211, 242, 0.5)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <div>
                        <div
                          className="sw-font-semibold"
                          style={{ color: '#290042', fontSize: 16 }}
                        >
                          {cat.category}
                        </div>
                        <div className="sw-text-sm sw-mt-1" style={{ color: '#69809B' }}>
                          {cat.issueCount}{' '}
                          {formatMessage({ id: 'cost_savings.summary.issues_found' })}
                        </div>
                      </div>
                      <div className="sw-text-right">
                        <div
                          className="sw-font-bold"
                          style={{
                            fontSize: 18,
                            background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {formatCurrency(cat.industryBenchmarkCost)}
                        </div>
                        <div className="sw-text-xs sw-mt-0.5" style={{ color: '#69809B' }}>
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
              className="sw-text-center sw-mt-10 sw-pt-5 sw-text-xs"
              style={{ color: '#69809B', borderTop: '1px solid rgba(183, 211, 242, 0.4)' }}
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
    <div
      className="sw-text-center sw-p-5"
      style={{
        borderRadius: 12,
        border: '2px solid rgba(183, 211, 242, 0.5)',
        backgroundColor: 'white',
      }}
    >
      <div
        className="sw-font-bold sw-mb-1"
        style={{
          fontSize: 26,
          background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {formatCurrency(Math.abs(savings))}
      </div>
      <div className="sw-text-sm sw-font-medium" style={{ color: '#69809B' }}>
        {label}
      </div>
    </div>
  );
}

export { SalesSummaryView };

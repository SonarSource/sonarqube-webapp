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
import { useIntl } from 'react-intl';
import { useBenchmarksQuery, useConfigurationQuery } from '../hooks/useCostSavings';
import { formatCurrency } from '../utils/format';

interface Props {
  industry: string;
  totalSavings: number;
}

function IndustryBenchmark({ totalSavings, industry }: Props) {
  const { formatMessage } = useIntl();
  const { data: benchmarks, isLoading: benchmarksLoading } = useBenchmarksQuery();
  const { data: config } = useConfigurationQuery();

  const isOptedIn = config?.telemetryOptIn === true;

  if (!isOptedIn) {
    return (
      <div className="sw-rounded sw-bg-gray-50 sw-p-4 sw-text-sm sw-text-center">
        {formatMessage({ id: 'cost_savings.benchmark.opt_in_prompt' }, { industry })}
      </div>
    );
  }

  const industryAvg = benchmarks?.avgSavingsByIndustry[industry] ?? 0;
  const maxValue = Math.max(totalSavings, industryAvg, 1);

  return (
    <div className="sw-rounded sw-border sw-border-solid sw-p-4">
      <Heading as="h3" className="sw-typo-semibold sw-mb-3">
        {formatMessage({ id: 'cost_savings.benchmark.title' })}
      </Heading>

      <Spinner isLoading={benchmarksLoading}>
        <div className="sw-mb-3 sw-text-sm">
          {formatMessage(
            { id: 'cost_savings.benchmark.description' },
            {
              industry,
              industryAvg: formatCurrency(industryAvg),
              savings: formatCurrency(totalSavings),
            },
          )}
        </div>

        {/* Horizontal bar comparison */}
        <div className="sw-flex sw-flex-col sw-gap-3">
          <BenchmarkBar
            color="var(--echoes-color-icon-accent)"
            label={formatMessage({ id: 'cost_savings.benchmark.your_savings' })}
            maxValue={maxValue}
            value={totalSavings}
          />
          <BenchmarkBar
            color="var(--echoes-color-icon-subdued)"
            label={formatMessage({ id: 'cost_savings.benchmark.industry_avg' }, { industry })}
            maxValue={maxValue}
            value={industryAvg}
          />
        </div>

        {benchmarks && (
          <div className="sw-text-xs sw-mt-3" style={{ color: 'var(--echoes-color-text-subdued)' }}>
            {formatMessage(
              { id: 'cost_savings.benchmark.based_on' },
              { count: benchmarks.totalCustomers },
            )}
          </div>
        )}
      </Spinner>
    </div>
  );
}

interface BenchmarkBarProps {
  color: string;
  label: string;
  maxValue: number;
  value: number;
}

function BenchmarkBar({ label, value, maxValue, color }: BenchmarkBarProps) {
  const widthPercent = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0;

  return (
    <div>
      <div className="sw-flex sw-justify-between sw-text-sm sw-mb-1">
        <span>{label}</span>
        <span className="sw-font-semibold">{formatCurrency(value)}</span>
      </div>
      <div className="sw-h-6 sw-rounded sw-bg-gray-100 sw-overflow-hidden">
        <div
          className="sw-h-full sw-rounded sw-transition-all"
          style={{
            backgroundColor: color,
            width: `${widthPercent}%`,
          }}
        />
      </div>
    </div>
  );
}

export { IndustryBenchmark };

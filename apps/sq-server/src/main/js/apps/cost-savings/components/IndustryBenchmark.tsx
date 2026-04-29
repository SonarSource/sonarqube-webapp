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
      <div
        className="sw-p-5 sw-text-sm sw-text-center"
        style={{
          borderRadius: 12,
          backgroundColor: '#F7F9FC',
          color: '#69809B',
        }}
      >
        {formatMessage({ id: 'cost_savings.benchmark.opt_in_prompt' }, { industry })}
      </div>
    );
  }

  const industryAvg = benchmarks?.avgSavingsByIndustry[industry] ?? 0;
  const maxValue = Math.max(totalSavings, industryAvg, 1);

  return (
    <div
      className="sw-p-5"
      style={{
        borderRadius: 12,
        border: '2px solid rgba(183, 211, 242, 0.5)',
      }}
    >
      <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 18, color: '#290042' }}>
        {formatMessage({ id: 'cost_savings.benchmark.title' })}
      </h3>

      <Spinner isLoading={benchmarksLoading}>
        <div className="sw-mb-4 sw-text-sm" style={{ color: '#69809B', lineHeight: 1.6 }}>
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
        <div className="sw-flex sw-flex-col sw-gap-4">
          <BenchmarkBar
            color="linear-gradient(90deg, #126ED3, #0F63BF)"
            label={formatMessage({ id: 'cost_savings.benchmark.your_savings' })}
            maxValue={maxValue}
            value={totalSavings}
          />
          <BenchmarkBar
            color="#69809B"
            label={formatMessage({ id: 'cost_savings.benchmark.industry_avg' }, { industry })}
            maxValue={maxValue}
            value={industryAvg}
          />
        </div>

        {benchmarks && (
          <div className="sw-text-xs sw-mt-4" style={{ color: '#69809B' }}>
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
      <div className="sw-flex sw-justify-between sw-text-sm sw-mb-2">
        <span style={{ color: '#290042' }}>{label}</span>
        <span className="sw-font-semibold" style={{ color: '#126ED3' }}>
          {formatCurrency(value)}
        </span>
      </div>
      <div
        className="sw-overflow-hidden"
        style={{ height: 8, borderRadius: 4, backgroundColor: '#EEF4FC' }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 4,
            background: color,
            width: `${widthPercent}%`,
            transition: 'width 1s ease-out',
          }}
        />
      </div>
    </div>
  );
}

export { IndustryBenchmark };

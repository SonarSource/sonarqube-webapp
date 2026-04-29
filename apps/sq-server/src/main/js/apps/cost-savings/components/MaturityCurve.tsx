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
import { useIntl } from 'react-intl';
import { AdvancedTimeline } from '~sq-server-commons/components/charts/AdvancedTimeline';
import type { Chart } from '~sq-server-commons/types/types';
import { useBenchmarksQuery, useConfigurationQuery } from '../hooks/useCostSavings';
import { formatCurrency } from '../utils/format';

interface Props {
  currentSavings: number;
}

function MaturityCurve({ currentSavings }: Props) {
  const { formatMessage } = useIntl();
  const { data: benchmarks, isLoading } = useBenchmarksQuery();
  const { data: config } = useConfigurationQuery();

  const isOptedIn = config?.telemetryOptIn === true;

  const { series, markers } = useMemo(() => {
    if (!benchmarks?.maturityCurve) {
      return { markers: [], series: [] };
    }

    const y1 = benchmarks.maturityCurve.year1 ?? 0;
    const y2 = benchmarks.maturityCurve.year2 ?? 0;
    const y3 = benchmarks.maturityCurve.year3 ?? 0;

    const now = new Date();
    const year1Date = new Date(now.getFullYear(), 0, 15);
    const year2Date = new Date(now.getFullYear() + 1, 0, 15);
    const year3Date = new Date(now.getFullYear() + 2, 0, 15);

    const projectedSeries: Chart.Serie[] = [
      {
        data: [
          { x: year1Date, y: y1 },
          { x: year2Date, y: y2 },
          { x: year3Date, y: y3 },
        ],
        name: 'maturity-curve',
        translatedName: formatMessage({ id: 'cost_savings.maturity.projected' }),
        type: 'CURRENCY',
      },
    ];

    // "You are here" indicator — find closest position on the curve
    const markerList = [
      { label: 'Y1', value: y1 },
      { label: 'Y3', value: y3 },
      { label: formatMessage({ id: 'cost_savings.maturity.you' }), value: currentSavings },
    ];

    return { markers: markerList, series: projectedSeries };
  }, [benchmarks, currentSavings, formatMessage]);

  if (!isOptedIn) {
    return null;
  }

  const y1 = benchmarks?.maturityCurve?.year1 ?? 0;
  const y3 = benchmarks?.maturityCurve?.year3 ?? 0;

  return (
    <div
      className="sw-p-5 sw-mt-6"
      style={{
        borderRadius: 12,
        border: '2px solid rgba(183, 211, 242, 0.5)',
      }}
    >
      <h3 className="sw-font-bold sw-mb-3" style={{ fontSize: 18, color: '#290042' }}>
        {formatMessage({ id: 'cost_savings.maturity.title' })}
      </h3>

      <Spinner isLoading={isLoading}>
        <p className="sw-text-sm sw-mb-4" style={{ color: '#69809B', lineHeight: 1.6 }}>
          {formatMessage(
            { id: 'cost_savings.maturity.description' },
            {
              current: formatCurrency(currentSavings),
              y1: formatCurrency(y1),
              y3: formatCurrency(y3),
            },
          )}
        </p>

        {series.length > 0 && series[0].data.length > 0 && (
          <div
            className="sw-p-4"
            style={{
              borderRadius: 10,
              border: '1px solid rgba(183, 211, 242, 0.3)',
            }}
          >
            <AdvancedTimeline
              formatYTick={(v) => formatCurrency(typeof v === 'string' ? parseFloat(v) : v)}
              height={180}
              metricType="INT"
              series={series}
              showAreas
              width={700}
            />
          </div>
        )}

        {/* Marker legend */}
        <div className="sw-flex sw-justify-center sw-gap-8 sw-mt-4">
          {markers.map((m) => (
            <div
              className="sw-text-center sw-px-4 sw-py-2"
              key={m.label}
              style={{
                borderRadius: 8,
                backgroundColor: '#F7F9FC',
              }}
            >
              <div className="sw-text-xs sw-font-semibold" style={{ color: '#290042' }}>
                {m.label}
              </div>
              <div
                className="sw-text-sm sw-font-bold"
                style={{
                  background: 'linear-gradient(135deg, #126ED3 0%, #290042 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {formatCurrency(m.value)}
              </div>
            </div>
          ))}
        </div>
      </Spinner>
    </div>
  );
}

export { MaturityCurve };

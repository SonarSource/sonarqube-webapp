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
    <div className="sw-rounded sw-border sw-border-solid sw-p-4 sw-mt-4">
      <Heading as="h3" className="sw-typo-semibold sw-mb-3">
        {formatMessage({ id: 'cost_savings.maturity.title' })}
      </Heading>

      <Spinner isLoading={isLoading}>
        <p className="sw-text-sm sw-mb-3">
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
          <AdvancedTimeline
            formatYTick={(v) => formatCurrency(typeof v === 'string' ? parseFloat(v) : v)}
            height={180}
            metricType="INT"
            series={series}
            showAreas
            width={700}
          />
        )}

        {/* Marker legend */}
        <div className="sw-flex sw-justify-center sw-gap-6 sw-mt-3 sw-text-xs">
          {markers.map((m) => (
            <div className="sw-text-center" key={m.label}>
              <div className="sw-font-semibold">{m.label}</div>
              <div>{formatCurrency(m.value)}</div>
            </div>
          ))}
        </div>
      </Spinner>
    </div>
  );
}

export { MaturityCurve };

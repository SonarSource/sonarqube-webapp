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

import { Card, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { DonutChart } from '~shared/components/charts/DonutChart';
import { ChartLegend, ChartLegendItem } from './ChartLegend';

const DONUT_SIZE = 176;
const DONUT_THICKNESS = 28;

interface Props {
  description: string;
  segments: ChartLegendItem[];
  title: string;
}

export function DonutChartCard({ description, segments, title }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const total = segments.reduce((acc, segment) => acc + segment.value, 0);

  return (
    <Card className="sw-min-w-0">
      <Card.Header description={description} title={title} />
      <Card.Body>
        <div className="sw-flex sw-items-center sw-gap-6">
          <div
            className="sw-relative sw-shrink-0"
            style={{ height: DONUT_SIZE, width: DONUT_SIZE }}
          >
            <DonutChart
              aria-label={title}
              data={segments.map((segment) => ({ fill: segment.color, value: segment.value }))}
              height={DONUT_SIZE}
              padAngle={0.03}
              thickness={DONUT_THICKNESS}
              width={DONUT_SIZE}
            />
            <div className="sw-absolute sw-inset-0 sw-flex sw-flex-col sw-items-center sw-justify-center">
              <Text isHighlighted size={TextSize.Large}>
                {total}
              </Text>
              <Text isSubtle size={TextSize.Small}>
                {formatMessage({ id: 'onboarding_dashboard.charts.total' })}
              </Text>
            </div>
          </div>

          <ChartLegend items={segments} />
        </div>
      </Card.Body>
    </Card>
  );
}

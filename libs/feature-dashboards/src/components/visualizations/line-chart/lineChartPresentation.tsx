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

import { RatingBadge, RatingBadgeRating, Text } from '@sonarsource/echoes-react';
import type { ReactNode } from 'react';
import { formatDashboardMeasure } from '~adapters/helpers/dashboard-measures';
import { MetricType } from '~shared/types/metrics';

/** From this magnitude up, Y-axis and hover use compact notation (e.g. 250k) so labels fit the widget. */
const LINE_CHART_COMPACT_NUMBER_THRESHOLD = 1_000_000;

export function formatYAxisTick(tick: number, isMetricRating: boolean): string {
  if (isMetricRating) {
    return formatDashboardMeasure(tick, MetricType.Rating);
  }

  if (!Number.isInteger(tick)) {
    return formatDashboardMeasure(tick, MetricType.Float);
  }

  if (Math.abs(tick) >= LINE_CHART_COMPACT_NUMBER_THRESHOLD) {
    return formatDashboardMeasure(tick, MetricType.ShortInteger);
  }

  return formatDashboardMeasure(tick, MetricType.Integer);
}

export function formatDotValue(value: number, isMetricRating: boolean): ReactNode {
  if (isMetricRating) {
    return (
      <RatingBadge
        rating={formatDashboardMeasure(value, MetricType.Rating) as RatingBadgeRating}
        size="sm"
      />
    );
  }

  const formatted =
    Math.abs(value) >= LINE_CHART_COMPACT_NUMBER_THRESHOLD
      ? formatDashboardMeasure(value, MetricType.ShortInteger)
      : formatDashboardMeasure(value, MetricType.Integer);

  return <Text isHighlighted>{formatted}</Text>;
}

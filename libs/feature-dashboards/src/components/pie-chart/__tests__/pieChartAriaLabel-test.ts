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

import type { IntlShape } from 'react-intl';
import { numberFormatter } from '~shared/helpers/measures';
import type { PieChartSegment } from '../../../types/visualization';
import { buildPieChartAriaLabel } from '../pieChartAriaLabel';

/** Serialises id + interpolation values so we can assert exactly which keys/values are passed. */
const formatMessage = ((descriptor: { id: string }, values?: Record<string, unknown>): string =>
  values
    ? `${descriptor.id}::${Object.entries(values)
        .map(([key, value]) => `${key}=${value}`)
        .join('|')}`
    : descriptor.id) as IntlShape['formatMessage'];

const segments: PieChartSegment[] = [
  { color: '#000', count: 25, label: 'High', percentage: '50', value: 'HIGH' },
  { color: '#111', count: 15, label: 'Medium', percentage: '30', value: 'MEDIUM' },
];

describe('buildPieChartAriaLabel', () => {
  const segmentLabel = (segment: PieChartSegment) =>
    `project_dashboard.widget.pie_chart.aria_label.segment::count=${numberFormatter(
      segment.count,
    )}|label=${segment.label}|percentage=${segment.percentage}`;

  it('composes the metric title with a per-segment data breakdown', () => {
    const result = buildPieChartAriaLabel(formatMessage, { segments, title: 'Security issues' });

    expect(result).toBe(
      `project_dashboard.widget.pie_chart.aria_label::breakdown=${segmentLabel(
        segments[0],
      )}, ${segmentLabel(segments[1])}|title=Security issues`,
    );
  });

  it('preserves segment order and joins segments with a comma', () => {
    const result = buildPieChartAriaLabel(formatMessage, { segments, title: 'Security issues' });

    expect(result.indexOf('label=High')).toBeLessThan(result.indexOf('label=Medium'));
    expect(result).toContain(`${segmentLabel(segments[0])}, ${segmentLabel(segments[1])}`);
  });
});

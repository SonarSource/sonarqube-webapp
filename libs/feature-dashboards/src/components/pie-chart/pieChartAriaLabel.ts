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
import type { PieChartSegment } from '../../types/visualization';

type FormatMessage = IntlShape['formatMessage'];

interface PieChartAriaLabelInput {
  segments: PieChartSegment[];
  title: string;
}

/**
 * Builds a meaningful text alternative for a pie chart: the localised metric title followed by a
 * per-segment data breakdown (label, count and percentage), so assistive technologies get both the
 * short identifier and an equivalent textual summary of the data.
 */
export function buildPieChartAriaLabel(
  formatMessage: FormatMessage,
  { segments, title }: Readonly<PieChartAriaLabelInput>,
): string {
  const breakdown = segments
    .map((segment) =>
      formatMessage(
        { id: 'project_dashboard.widget.pie_chart.aria_label.segment' },
        {
          count: numberFormatter(segment.count),
          label: segment.label,
          percentage: segment.percentage,
        },
      ),
    )
    .join(', ');

  return formatMessage(
    { id: 'project_dashboard.widget.pie_chart.aria_label' },
    { breakdown, title },
  );
}

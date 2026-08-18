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
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import {
  PieChartFilter,
  PieChartHotspotFilter,
  PieChartIssueFilter,
  PieChartWidgetProps,
} from '../../types/dashboard-widget';
import { CodeScope } from '../../types/widget-common';
import { buildLabeledSegment } from '../../utils/filterLineSegments';
import { getPieChartSliceLabelMessageId } from './utils';

export const PIE_ISSUE_FILTER_TO_SOFTWARE_QUALITY: Record<PieChartIssueFilter, SoftwareQuality> = {
  [PieChartIssueFilter.Security]: SoftwareQuality.Security,
  [PieChartIssueFilter.Reliability]: SoftwareQuality.Reliability,
  [PieChartIssueFilter.Maintainability]: SoftwareQuality.Maintainability,
};

export const HOTSPOT_FILTER_MESSAGE_ID: Record<PieChartHotspotFilter, string> = {
  [PieChartHotspotFilter.ToReview]: 'hotspot.filters.status.TO_REVIEW',
  [PieChartHotspotFilter.Fixed]: 'hotspot.filters.status.FIXED',
  [PieChartHotspotFilter.Safe]: 'hotspot.filters.status.SAFE',
};

export function isPieChartIssueFilter(filter: PieChartFilter): filter is PieChartIssueFilter {
  return (
    filter === PieChartIssueFilter.Security ||
    filter === PieChartIssueFilter.Reliability ||
    filter === PieChartIssueFilter.Maintainability
  );
}

export function isPieChartHotspotFilter(filter: PieChartFilter): filter is PieChartHotspotFilter {
  return (
    filter === PieChartHotspotFilter.ToReview ||
    filter === PieChartHotspotFilter.Fixed ||
    filter === PieChartHotspotFilter.Safe
  );
}

export type HotspotIssueCountStatus = 'FIXED' | 'SAFE' | 'TO_REVIEW';

export function mapPieChartHotspotFilterToIssueCountStatuses(
  filter: PieChartFilter,
): HotspotIssueCountStatus[] | undefined {
  if (!isPieChartHotspotFilter(filter)) {
    return undefined;
  }

  switch (filter) {
    case PieChartHotspotFilter.ToReview:
      return ['TO_REVIEW'];
    case PieChartHotspotFilter.Fixed:
      return ['FIXED'];
    case PieChartHotspotFilter.Safe:
      return ['SAFE'];
    default: {
      const exhaustiveCheck: never = filter;
      return exhaustiveCheck;
    }
  }
}

type BuildArgs = Pick<PieChartWidgetProps, 'filter' | 'metric' | 'slice'> & {
  isPortfolioDashboard: boolean;
  scope: CodeScope;
};

/** Returns fully-localised filter-line segment strings for the pie-chart widget header. */
export function getPieChartFilterLineSegments(
  formatMessage: IntlShape['formatMessage'],
  { filter, isPortfolioDashboard, metric, scope, slice }: Readonly<BuildArgs>,
): string[] {
  const segments: string[] = [formatMessage({ id: `dashboard_widget.codescope.${scope}` })];

  if (filter && isPieChartIssueFilter(filter)) {
    segments.push(
      buildLabeledSegment(
        formatMessage,
        'dashboard.add_widget_modal.apply_filters_section.select.software_quality.label',
        [`software_quality.${PIE_ISSUE_FILTER_TO_SOFTWARE_QUALITY[filter]}`],
      ),
    );
  } else if (filter && isPieChartHotspotFilter(filter)) {
    segments.push(
      buildLabeledSegment(
        formatMessage,
        'dashboard.add_widget_modal.apply_filters_section.pie_filter.label',
        [HOTSPOT_FILTER_MESSAGE_ID[filter]],
      ),
    );
  }

  segments.push(
    buildLabeledSegment(formatMessage, 'dashboard.add_widget_modal.define_widget.slice_by', [
      getPieChartSliceLabelMessageId({ isPortfolioDashboard, metric, slice }),
    ]),
  );

  return segments;
}

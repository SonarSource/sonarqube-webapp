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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { getPieChartFacetCounts } from '~shared/helpers/pieChart';
import { useLanguagesQuery } from '~shared/queries/languages';
import { FILTERABLE_CODE_ISSUE_STATUSES } from '~shared/types/issues';
import { useComponent } from '../../context/componentContext/withComponentContext';
import {
  aggregateSmallSegments,
  CodeScope,
  formatPercentage,
  formatPieChartSegmentLabel,
  getSegmentColor,
  PieChartIssueSlice,
  PieChartMetric,
  sortSegments,
  supportsOrganizationPieChartIssueHistory,
  type PieChartWidget,
} from '../../helpers/dashboard-widget-data';
import {
  resolveIssueSearchFiltersForMode,
  resolvePieChartFilterSoftwareQuality,
} from '../../helpers/dashboard-widget-mode';
import { unsupportedDashboardWidgetAdapter } from '../../helpers/unsupported-dashboard-widget-adapter';
import { useIssuesSearchQuery } from '../../queries/issues';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import type { DashboardPieChartSegment } from '../../types/dashboard-widget-adapter-types';
import { useCurrentBranchQuery } from './branch';

const MIN_SEGMENT_PERCENT = 1;

function isLanguageIssuePieChart(widget: PieChartWidget): boolean {
  return (
    widget.metric === PieChartMetric.IssueCount &&
    widget.scope !== CodeScope.New &&
    widget.slice === PieChartIssueSlice.Languages
  );
}

function buildIssueSearchQuery(
  widget: PieChartWidget,
  projectKey: string,
  branchLike: Parameters<typeof getBranchLikeQuery>[0],
  isStandardMode: boolean,
) {
  const impactSoftwareQuality = resolvePieChartFilterSoftwareQuality(widget.filter);

  return {
    componentKeys: projectKey,
    facets: widget.slice,
    issueStatuses: FILTERABLE_CODE_ISSUE_STATUSES.join(','),
    ps: 1,
    sinceLeakPeriod: false,
    ...resolveIssueSearchFiltersForMode({ impactSoftwareQuality }, isStandardMode),
    ...getBranchLikeQuery(branchLike),
  };
}

function countsToSegments(
  counts: Record<string, number>,
  widget: PieChartWidget,
  languages: Record<string, { name: string }> | undefined,
  formatMessage: (descriptor: { id: string }) => string,
  isStandardMode = false,
): DashboardPieChartSegment[] {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  const sortedEntries = sortSegments(entries, widget.slice, widget.metric);
  const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return [];
  }

  return aggregateSmallSegments(sortedEntries, total).map(([value, count], index) => {
    const rawPercentage = (count / total) * 100;

    return {
      color: getSegmentColor(value, index, widget.slice),
      count,
      label: formatPieChartSegmentLabel(
        value,
        formatMessage,
        widget.metric,
        widget.slice,
        {
          languages,
        },
        isStandardMode,
      ),
      percentage: formatPercentage(rawPercentage),
      value,
      visualCount:
        rawPercentage < MIN_SEGMENT_PERCENT && rawPercentage > 0
          ? (total * MIN_SEGMENT_PERCENT) / 100
          : undefined,
    };
  });
}

export function projectPieChartUsesSearchData(widget: Readonly<PieChartWidget>): boolean {
  if (widget.metric === PieChartMetric.LineCount) {
    return false;
  }
  return !supportsOrganizationPieChartIssueHistory(widget.metric, widget.slice);
}

export function useProjectPieChartSegmentsSearchQuery(
  widget: Readonly<PieChartWidget>,
  projectKey: string | undefined,
): { error: unknown; isPending: boolean; segments: DashboardPieChartSegment[] } {
  const { formatMessage } = useIntl();
  const { component } = useComponent();
  const isSupported = isLanguageIssuePieChart(widget);
  const branchQuery = useCurrentBranchQuery(isSupported ? component : undefined);
  const modeQuery = useStandardExperienceModeQuery({ enabled: isSupported && Boolean(projectKey) });
  const languagesQuery = useLanguagesQuery({
    enabled: isSupported && Boolean(projectKey),
  });
  const issueQuery = useIssuesSearchQuery(
    buildIssueSearchQuery(widget, projectKey ?? '', branchQuery.data, modeQuery.data === true),
    {
      enabled:
        isSupported &&
        Boolean(projectKey) &&
        !branchQuery.isPending &&
        !modeQuery.isPending &&
        modeQuery.error == null,
    },
  );

  const segments = useMemo(
    () =>
      isSupported
        ? countsToSegments(
            getPieChartFacetCounts(issueQuery.data?.facets, widget.slice),
            widget,
            languagesQuery.data,
            formatMessage,
            modeQuery.data === true,
          )
        : [],
    [formatMessage, isSupported, issueQuery.data, languagesQuery.data, modeQuery.data, widget],
  );

  if (!isSupported) {
    return unsupportedDashboardWidgetAdapter();
  }

  return {
    error: modeQuery.error ?? branchQuery.error ?? issueQuery.error ?? languagesQuery.error,
    isPending:
      modeQuery.isPending ||
      branchQuery.isPending ||
      issueQuery.isPending ||
      languagesQuery.isPending,
    segments,
  };
}

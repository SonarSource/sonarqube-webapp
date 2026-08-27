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
import { useIntl, type IntlShape } from 'react-intl';
import { useLanguagesQuery } from '~shared/queries/languages';
import { MetricKey } from '~shared/types/metrics';
import {
  aggregateSmallSegments,
  CodeScope,
  DEFAULT_ISSUE_IMPACTS,
  formatPercentage,
  formatPieChartSegmentLabel,
  getDisplayedPieChartSegmentValues,
  getSegmentColor,
  HistoryRange,
  isQualityGateStatusWidget,
  issueCountHistoryToPieCounts,
  lineChartSinceDate,
  lineCountMeasureKeys,
  mapPieChartToIssueHistoryParams,
  organizationMeasuresToLineCountPieData,
  organizationsHistoryStartDateWithRetentionBuffer,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  portfolioMeasuresLatestRecord,
  qualityGateCounts,
  sortSegments,
  tryQualityGateDistributionMessageId,
  type PieChartWidget,
} from '../../helpers/dashboard-widget-data';
import {
  resolveIssueHistoryDistributionKeyForMode,
  resolveIssueHistoryFiltersForMode,
  resolveIssueHistorySliceForMode,
  resolvePieChartFilterSoftwareQuality,
} from '../../helpers/dashboard-widget-mode';
import { unsupportedDashboardWidgetAdapter } from '../../helpers/unsupported-dashboard-widget-adapter';
import {
  useDashboardIssueCountHistoryQuery,
  useDashboardMeasuresHistoryQuery,
} from '../../queries/dashboard-history';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import type {
  DashboardEntityType,
  DashboardPieChartSegment,
} from '../../types/dashboard-widget-adapter-types';
import { usePortfolioRulesMetadataOrganization } from './portfolio-widget-organization-data';
import { useWidgetMetricMetadataQuery } from './widget-metric-metadata';
import { useDashboardRuleLabels, type DashboardRuleLabelsEntity } from './widget-rule-metadata';

const MIN_SEGMENT_PERCENT = 1;
const EMPTY_COUNTS: Record<string, number> = {};

type OrganizationPieChartQueryState = Readonly<{
  counts: Record<string, number>;
  error: unknown;
  isPending: boolean;
}>;

type PieChartQueryRequirements = Readonly<{
  isLineCountChart: boolean;
  isQualityGateStatusChart: boolean;
  needsLanguageMetadata: boolean;
  needsRulesMetadata: boolean;
}>;

function getPieChartQueryRequirements(
  widget: PieChartWidget,
  entityType: DashboardEntityType,
): PieChartQueryRequirements {
  const isLineCountChart = widget.metric === PieChartMetric.LineCount;
  return {
    isLineCountChart,
    isQualityGateStatusChart: entityType === 'PORTFOLIO' && isQualityGateStatusWidget(widget),
    needsLanguageMetadata: isLineCountChart && widget.slice === PieChartLineSlice.Language,
    needsRulesMetadata:
      widget.metric === PieChartMetric.IssueCount && widget.slice === PieChartIssueSlice.Rules,
  };
}

function resolveOrganizationPieChartQueryState(
  args: Readonly<{
    isIssuePiePending: boolean;
    isLineCountChart: boolean;
    isQualityGatePending: boolean;
    isQualityGateStatusChart: boolean;
    isRulesMetadataPending: boolean;
    issueCounts: Record<string, number> | undefined;
    issueError: unknown;
    issueMetadataError: boolean;
    languageMetadataPending: boolean;
    lineCountData: Record<string, number>;
    lineCountPending: boolean;
    lineCountError: unknown;
    qualityGateCounts: Record<string, number> | undefined;
    qualityGateError: unknown;
  }>,
): OrganizationPieChartQueryState {
  if (args.isQualityGateStatusChart) {
    return {
      counts: args.qualityGateCounts ?? EMPTY_COUNTS,
      error: args.qualityGateError,
      isPending: args.isQualityGatePending,
    };
  }

  if (args.isLineCountChart) {
    return {
      counts: args.lineCountData,
      error: args.lineCountError,
      isPending: args.lineCountPending || args.languageMetadataPending,
    };
  }

  return {
    counts: args.issueCounts ?? EMPTY_COUNTS,
    error:
      args.issueError ??
      (args.issueMetadataError ? new Error('Unable to load pie chart metadata') : null),
    isPending: args.isIssuePiePending || args.isRulesMetadataPending,
  };
}

type PieCountsToSegmentsArgs = Readonly<{
  counts: Record<string, number>;
  formatMessage: IntlShape['formatMessage'];
  isQualityGateStatusChart: boolean;
  languages: Record<string, { name: string }> | undefined;
  metric: string;
  rules: Record<string, { name: string }> | undefined;
  slice: string;
}>;

function pieCountsToSegments(args: PieCountsToSegmentsArgs): DashboardPieChartSegment[] {
  const { counts, formatMessage, isQualityGateStatusChart, languages, metric, rules, slice } = args;
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  const sortedEntries = sortSegments(entries, slice, metric);
  const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0);
  if (total === 0) {
    return [];
  }

  return aggregateSmallSegments(sortedEntries, total).map(
    ([value, count], index): DashboardPieChartSegment => {
      const rawPercentage = (count / total) * 100;
      const qualityGateMessageId = isQualityGateStatusChart
        ? tryQualityGateDistributionMessageId(value)
        : undefined;
      const label =
        qualityGateMessageId === undefined
          ? formatPieChartSegmentLabel(value, formatMessage, metric, slice, {
              languages,
              rules,
            })
          : formatMessage({ id: qualityGateMessageId });

      return {
        color: getSegmentColor(value, index, slice),
        count,
        label,
        percentage: formatPercentage(rawPercentage),
        value,
        visualCount:
          rawPercentage < MIN_SEGMENT_PERCENT && rawPercentage > 0
            ? (total * MIN_SEGMENT_PERCENT) / 100
            : undefined,
      };
    },
  );
}

function shouldFailPieChartAdapter(widget: PieChartWidget): boolean {
  const isSupportedMetric =
    widget.metric === PieChartMetric.IssueCount ||
    widget.metric === PieChartMetric.LineCount ||
    widget.metric === PieChartMetric.ProjectCount;

  return (
    !isSupportedMetric ||
    (widget.metric === PieChartMetric.IssueCount &&
      (widget.scope === CodeScope.New ||
        widget.slice === PieChartIssueSlice.CleanCodeAttributeCategories ||
        widget.slice === PieChartIssueSlice.Languages))
  );
}

function getDashboardRuleLabelsEntity(
  entityType: DashboardEntityType,
  isResolvingOrganization: boolean,
  organization: string | undefined,
  portfolioOrganization: string | undefined,
): DashboardRuleLabelsEntity {
  return entityType === 'PORTFOLIO'
    ? {
        isResolvingOrganization,
        organization: portfolioOrganization,
        type: 'PORTFOLIO',
      }
    : { organization: organization ?? '', type: 'PROJECT' };
}

function resolvePieChartHistoryParams(
  canonicalHistoryParams: ReturnType<typeof mapPieChartToIssueHistoryParams>,
  filter: string,
  metric: string,
  isStandardMode: boolean,
) {
  if (canonicalHistoryParams === null || metric !== PieChartMetric.IssueCount) {
    return canonicalHistoryParams;
  }

  const { impacts, issueTypes, sliceBy, statuses, ...sharedParams } = canonicalHistoryParams;
  return {
    ...sharedParams,
    sliceBy: resolveIssueHistorySliceForMode(sliceBy, isStandardMode),
    ...resolveIssueHistoryFiltersForMode(
      { impacts, issueTypes, statuses },
      {
        isStandardMode,
        softwareQuality: resolvePieChartFilterSoftwareQuality(filter),
      },
    ),
  };
}

function isPieChartIssueQueryEnabled(
  args: Readonly<{
    enabled: boolean;
    hasEntityId: boolean;
    hasHistoryParams: boolean;
    isModeResolved: boolean;
    isQualityGateStatusChart: boolean;
    isUnsupported: boolean;
    needsExperienceMode: boolean;
  }>,
): boolean {
  return (
    args.enabled &&
    args.hasEntityId &&
    args.hasHistoryParams &&
    !args.isQualityGateStatusChart &&
    !args.isUnsupported &&
    (!args.needsExperienceMode || args.isModeResolved)
  );
}

function resolvePieChartResult(
  args: Readonly<{
    enabled: boolean;
    error: unknown;
    isModePending: boolean;
    isPending: boolean;
    isUnsupported: boolean;
    modeError: unknown;
    needsExperienceMode: boolean;
    segments: DashboardPieChartSegment[];
  }>,
): {
  error: unknown;
  isPending: boolean;
  segments: DashboardPieChartSegment[];
} {
  if (args.isUnsupported) {
    return unsupportedDashboardWidgetAdapter();
  }
  const needsMode = args.enabled && args.needsExperienceMode;
  const modeFailed = needsMode && args.modeError != null;
  return {
    error: needsMode ? (args.modeError ?? args.error) : args.error,
    // A mode failure permanently disables the issue query, which then reports
    // isPending forever. Once the mode has definitively errored, stop
    // reporting pending so the error state can be surfaced instead.
    isPending: modeFailed ? false : (needsMode && args.isModePending) || args.isPending,
    segments: args.segments,
  };
}

function getPieChartMeasuresHistoryStartDate(entityType: DashboardEntityType): string {
  return entityType === 'PORTFOLIO'
    ? organizationsHistoryStartDateWithRetentionBuffer()
    : lineChartSinceDate(HistoryRange.LastMonth);
}

export function useOrganizationPieChartData(
  args: Readonly<{
    enabled?: boolean;
    entity: Readonly<{ entityId: string; entityType: DashboardEntityType }>;
    organization?: string;
    projectKey?: string;
    widget: unknown;
  }>,
): {
  error: unknown;
  isPending: boolean;
  segments: DashboardPieChartSegment[];
} {
  const { enabled = true, entity, organization, widget: unknownWidget } = args;
  const widget = unknownWidget as PieChartWidget;
  const { entityId, entityType } = entity;
  const { formatMessage } = useIntl();
  const isUnsupported = shouldFailPieChartAdapter(widget);
  const needsExperienceMode = widget.metric === PieChartMetric.IssueCount && !isUnsupported;
  const modeQuery = useStandardExperienceModeQuery({
    enabled: enabled && needsExperienceMode,
  });
  const isModeResolved = !modeQuery.isPending && modeQuery.error == null;
  const isStandardMode = modeQuery.data ?? true;
  const { isLineCountChart, isQualityGateStatusChart, needsLanguageMetadata, needsRulesMetadata } =
    getPieChartQueryRequirements(widget, entityType);
  const canonicalHistoryParams = useMemo(
    () =>
      mapPieChartToIssueHistoryParams({
        entityId,
        entityType,
        filter: widget.filter,
        metric: widget.metric,
        slice: widget.slice,
      }),
    [entityId, entityType, widget.filter, widget.metric, widget.slice],
  );
  const canonicalSliceBy = canonicalHistoryParams?.sliceBy;
  const historyParams = useMemo(
    () =>
      resolvePieChartHistoryParams(
        canonicalHistoryParams,
        widget.filter,
        widget.metric,
        isStandardMode,
      ),
    [canonicalHistoryParams, isStandardMode, widget.filter, widget.metric],
  );
  const issueQuery = useDashboardIssueCountHistoryQuery(
    historyParams === null
      ? {
          entityId,
          entityType,
          impacts: [...DEFAULT_ISSUE_IMPACTS],
          sliceBy: 'SEVERITY',
          startDate: organizationsHistoryStartDateWithRetentionBuffer(),
          statuses: ['OPEN'],
        }
      : {
          ...historyParams,
          startDate: organizationsHistoryStartDateWithRetentionBuffer(),
        },
    {
      enabled: isPieChartIssueQueryEnabled({
        enabled,
        hasEntityId: Boolean(entityId),
        hasHistoryParams: Boolean(historyParams),
        isModeResolved,
        isQualityGateStatusChart,
        isUnsupported,
        needsExperienceMode,
      }),
      refetchOnWindowFocus: false,
      select: (response) => ({
        counts: issueCountHistoryToPieCounts(
          response.issueCountHistory.map((day) => ({
            ...day,
            distribution: day.distribution.map((entry) => ({
              ...entry,
              key: resolveIssueHistoryDistributionKeyForMode(
                entry.key,
                canonicalSliceBy,
                isStandardMode,
              ),
            })),
          })),
        ),
      }),
    },
  );

  const lineCountKeys = useMemo(() => lineCountMeasureKeys(widget.scope), [widget.scope]);
  const measuresHistoryStartDate = getPieChartMeasuresHistoryStartDate(entityType);
  const metricMetadataQuery = useWidgetMetricMetadataQuery({
    enabled: enabled && isQualityGateStatusChart && !isUnsupported,
  });
  const hasQualityGateDistributionMetric =
    metricMetadataQuery.data?.[MetricKey.releasability_rating_distribution] !== undefined;
  const lineCountQuery = useDashboardMeasuresHistoryQuery(
    {
      entityId,
      entityType,
      metricKeys: lineCountKeys,
      startDate: measuresHistoryStartDate,
    },
    {
      enabled: enabled && isLineCountChart && Boolean(entityId) && !isUnsupported,
      refetchOnWindowFocus: false,
      select: (response) => portfolioMeasuresLatestRecord(response.measuresHistory),
    },
  );
  const qualityGateQuery = useDashboardMeasuresHistoryQuery(
    {
      entityId,
      entityType,
      metricKeys: [MetricKey.releasability_rating_distribution],
      startDate: measuresHistoryStartDate,
    },
    {
      enabled:
        enabled &&
        isQualityGateStatusChart &&
        Boolean(entityId) &&
        !isUnsupported &&
        hasQualityGateDistributionMetric,
      refetchOnWindowFocus: false,
      select: (response) => ({
        counts: qualityGateCounts(portfolioMeasuresLatestRecord(response.measuresHistory)),
      }),
    },
  );
  const languagesQuery = useLanguagesQuery({
    enabled: enabled && needsLanguageMetadata && !isUnsupported,
  });
  const { isLoading: isResolvingOrganization, organization: portfolioOrganization } =
    usePortfolioRulesMetadataOrganization(entityId, {
      enabled: enabled && entityType === 'PORTFOLIO' && needsRulesMetadata && !isUnsupported,
    });
  const issueCounts = issueQuery.data?.counts;
  const ruleKeys = useMemo(
    () =>
      needsRulesMetadata && issueCounts !== undefined
        ? getDisplayedPieChartSegmentValues(issueCounts, widget.slice, widget.metric)
        : [],
    [issueCounts, needsRulesMetadata, widget.metric, widget.slice],
  );
  const rulesQuery = useDashboardRuleLabels({
    enabled: enabled && needsRulesMetadata && !isUnsupported,
    entity: getDashboardRuleLabelsEntity(
      entityType,
      isResolvingOrganization,
      organization,
      portfolioOrganization,
    ),
    ruleKeys,
  });

  const lineCountData = useMemo(
    () =>
      isLineCountChart && !isQualityGateStatusChart
        ? organizationMeasuresToLineCountPieData(lineCountQuery.data, widget.slice, widget.scope)
            .counts
        : EMPTY_COUNTS,
    [isLineCountChart, isQualityGateStatusChart, lineCountQuery.data, widget.scope, widget.slice],
  );
  const {
    counts: selectedCounts,
    error,
    isPending,
  } = resolveOrganizationPieChartQueryState({
    isIssuePiePending: issueQuery.isPending,
    isLineCountChart,
    isQualityGatePending:
      metricMetadataQuery.isPending ||
      (hasQualityGateDistributionMetric && qualityGateQuery.isPending),
    isQualityGateStatusChart,
    isRulesMetadataPending: needsRulesMetadata && rulesQuery.isPending,
    issueCounts,
    issueError: issueQuery.error,
    issueMetadataError: rulesQuery.isError,
    languageMetadataPending: needsLanguageMetadata && languagesQuery.isPending,
    lineCountData,
    lineCountPending: lineCountQuery.isPending,
    lineCountError: lineCountQuery.error,
    qualityGateCounts: qualityGateQuery.data?.counts,
    qualityGateError: metricMetadataQuery.error ?? qualityGateQuery.error,
  });

  const segments = useMemo(() => {
    return pieCountsToSegments({
      counts: selectedCounts,
      formatMessage,
      isQualityGateStatusChart,
      languages: languagesQuery.data,
      metric: widget.metric,
      rules: rulesQuery.rulesByKey,
      slice: widget.slice,
    });
  }, [
    formatMessage,
    isQualityGateStatusChart,
    languagesQuery.data,
    rulesQuery.rulesByKey,
    selectedCounts,
    widget.metric,
    widget.slice,
  ]);

  return resolvePieChartResult({
    enabled,
    error,
    isModePending: modeQuery.isPending,
    isPending,
    isUnsupported,
    modeError: modeQuery.error,
    needsExperienceMode,
    segments,
  });
}

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
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricKey, MetricType } from '~shared/types/metrics';
import {
  PieChartFilter,
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  type PieChartWidgetProps,
} from '../../types/dashboard-widget';
import {
  type IssueCountStatus,
  type IssueSeverity,
  type IssueType,
  ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE,
  ORGANIZATION_ISSUE_COUNT_SEVERITIES,
  type OrganizationIssueImpactQueryValue,
  PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES,
} from '../../types/organization-issue-count-history';
import {
  organizationIssueImpactQueryValuesForSoftwareQualities,
  PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS,
} from '../../utils/organizationIssueCountHistoryUtils';
import { mapPieChartHotspotFilterToIssueCountStatuses } from '../pie-chart/pieChartFilterLineSegments';
import { getPieChartMetricLabel, getPieChartTitle } from '../pie-chart/pieChartHeaderText';
import { isQualityGateStatusWidget } from '../pie-chart/utils';

export interface PortfolioPieChartSegmentDefinition {
  label: string;
  value: string;
}

export interface ProjectIssueCountsDrilldownRequest {
  impacts?: OrganizationIssueImpactQueryValue[];
  issueTypes?: IssueType[];
  ruleKeys?: string[];
  severities?: IssueSeverity[];
  statuses?: IssueCountStatus[];
}

interface ProjectMeasuresDrilldownRequest {
  metricKey: string;
  metricValue?: string;
}

interface PortfolioDashboardDrilldownDescriptorBase {
  metricLabel: string;
  segmentLabel: string;
  valueType: 'number' | 'string';
  widgetTitle: string;
}

export type PortfolioDashboardIssueDrilldownDescriptor =
  PortfolioDashboardDrilldownDescriptorBase & {
    kind: 'issue-counts';
    request: ProjectIssueCountsDrilldownRequest;
  };

export type PortfolioDashboardMeasureDrilldownDescriptor =
  PortfolioDashboardDrilldownDescriptorBase & {
    kind: 'computed-measures';
    numericFormatMetricType?: MetricType;
    request: ProjectMeasuresDrilldownRequest;
    stringValueFormatMetricType?: MetricType;
  };

export type PortfolioDashboardDrilldownDescriptor =
  PortfolioDashboardIssueDrilldownDescriptor | PortfolioDashboardMeasureDrilldownDescriptor;

const PROJECT_ISSUE_TYPE_BY_FILTER: Partial<Record<PieChartIssueFilter, IssueType>> = {
  [PieChartIssueFilter.Maintainability]: 'CODE_SMELL',
  [PieChartIssueFilter.Reliability]: 'BUG',
  [PieChartIssueFilter.Security]: 'VULNERABILITY',
};

function isPieChartIssueFilter(filter: PieChartFilter): filter is PieChartIssueFilter {
  return Object.values(PieChartIssueFilter).includes(filter as PieChartIssueFilter);
}

function getSoftwareQualityForIssueFilter(filter: PieChartFilter): SoftwareQuality | null {
  if (!isPieChartIssueFilter(filter)) {
    return null;
  }

  if (filter === PieChartIssueFilter.Security) {
    return SoftwareQuality.Security;
  }
  if (filter === PieChartIssueFilter.Reliability) {
    return SoftwareQuality.Reliability;
  }
  return SoftwareQuality.Maintainability;
}

function getPieChartIssueCountScopeRequest(
  filter: PieChartFilter,
  statuses: IssueCountStatus[],
): ProjectIssueCountsDrilldownRequest {
  const quality = getSoftwareQualityForIssueFilter(filter);
  if (quality !== null) {
    return {
      impacts: organizationIssueImpactQueryValuesForSoftwareQualities([quality]),
      statuses,
    };
  }

  return {
    impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS],
    statuses,
  };
}

function toRawSegmentValue(label: string): string {
  return label.trim().replaceAll(/\s+/g, '_').toUpperCase();
}

export function normalizePortfolioRuleKey(candidate: string): string | null {
  const match = /^([\w.]+):(S\d+)$/i.exec(candidate.trim());
  if (!match) {
    return null;
  }

  return `${match[1].toLowerCase()}:${match[2].toUpperCase()}`;
}

export function resolvePortfolioDrilldownSegmentValue(
  label: string,
  segments: PortfolioPieChartSegmentDefinition[] | undefined,
): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return trimmed;
  }

  const byLabel = segments?.find((segment) => segment.label === trimmed);
  if (byLabel) {
    return byLabel.value;
  }

  const byValue = segments?.find(
    (segment) => segment.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byValue) {
    return byValue.value;
  }

  return normalizePortfolioRuleKey(trimmed) ?? toRawSegmentValue(trimmed);
}

function parseIssueCountSeverityFromSegmentValue(segmentValue: string): IssueSeverity | null {
  const normalized = segmentValue.trim().toUpperCase();
  return ORGANIZATION_ISSUE_COUNT_SEVERITIES.includes(normalized as IssueSeverity)
    ? (normalized as IssueSeverity)
    : null;
}

function hotspotReviewSegmentToProjectIssueCountsFilters(
  segmentValue: string,
): Pick<ProjectIssueCountsDrilldownRequest, 'statuses'> {
  const normalized = segmentValue.trim().toUpperCase();
  if (normalized === 'TO_REVIEW') {
    return { statuses: ['TO_REVIEW'] };
  }
  if (normalized === 'FIXED' || normalized === 'SAFE') {
    return { statuses: [normalized] };
  }
  return { statuses: [segmentValue as IssueCountStatus] };
}

function issueCountSeveritiesForProjectIssueCountsQuery(segmentValue: string): IssueSeverity[] {
  const key = segmentValue.trim().toUpperCase();
  const hotspotReviewPriorityToIssueCountSeverity: Record<string, IssueSeverity> = {
    HIGH_PRIORITY: 'HIGH',
    MEDIUM_PRIORITY: 'MEDIUM',
    LOW_PRIORITY: 'LOW',
  };
  const fromHotspotPriority = hotspotReviewPriorityToIssueCountSeverity[key];
  if (fromHotspotPriority !== undefined) {
    return [fromHotspotPriority];
  }
  const parsed = parseIssueCountSeverityFromSegmentValue(key);
  return parsed === null ? [key as IssueSeverity] : [parsed];
}

function getPieChartAllImpactSeveritiesIssueCountRequest(
  filter: PieChartFilter,
): ProjectIssueCountsDrilldownRequest {
  const quality = getSoftwareQualityForIssueFilter(filter);
  if (quality !== null) {
    return {
      impacts: organizationIssueImpactQueryValuesForSoftwareQualities([quality]),
      statuses: ['OPEN'],
    };
  }

  return { statuses: ['OPEN'] };
}

function getPieChartImpactSeveritiesIssueCountRequest(
  filter: PieChartFilter,
  issueType: IssueType | undefined,
  segmentValue: string,
): ProjectIssueCountsDrilldownRequest {
  const quality = getSoftwareQualityForIssueFilter(filter);
  if (quality !== null) {
    const severity = parseIssueCountSeverityFromSegmentValue(segmentValue);
    return {
      impacts:
        severity === null
          ? organizationIssueImpactQueryValuesForSoftwareQualities([quality])
          : [`${quality}:${severity}`],
      statuses: ['OPEN'],
    };
  }

  return {
    issueTypes: issueType === undefined ? undefined : [issueType],
    severities: issueCountSeveritiesForProjectIssueCountsQuery(segmentValue),
    statuses: ['OPEN'],
  };
}

function getImpactSoftwareQuality(value: string): SoftwareQuality | null {
  switch (value) {
    case SoftwareQuality.Security:
    case SoftwareQuality.Reliability:
    case SoftwareQuality.Maintainability:
      return value;
    default:
      return null;
  }
}

function getUnfilteredDescriptor(
  widget: PieChartWidgetProps,
  metricLabel: string,
  widgetTitle: string,
): PortfolioDashboardDrilldownDescriptor | null {
  if (isQualityGateStatusWidget(widget)) {
    return {
      kind: 'computed-measures',
      metricLabel,
      request: { metricKey: MetricKey.alert_status },
      segmentLabel: '',
      stringValueFormatMetricType: MetricType.Level,
      valueType: 'string',
      widgetTitle,
    };
  }

  if (widget.metric === PieChartMetric.HotspotCount) {
    return {
      kind: 'issue-counts',
      metricLabel,
      request: {
        issueTypes: [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES],
        statuses: mapPieChartHotspotFilterToIssueCountStatuses(widget.filter),
      },
      segmentLabel: '',
      valueType: 'number',
      widgetTitle,
    };
  }

  if (widget.metric !== PieChartMetric.IssueCount) {
    return null;
  }

  const issueType = isPieChartIssueFilter(widget.filter)
    ? PROJECT_ISSUE_TYPE_BY_FILTER[widget.filter]
    : undefined;
  let request: ProjectIssueCountsDrilldownRequest;
  switch (widget.slice) {
    case PieChartIssueSlice.ImpactSeverities:
      request = getPieChartAllImpactSeveritiesIssueCountRequest(widget.filter);
      break;
    case PieChartIssueSlice.IssueStatuses: {
      const quality = getSoftwareQualityForIssueFilter(widget.filter);
      request =
        quality === null
          ? {
              issueTypes: issueType === undefined ? undefined : [issueType],
              statuses: [...ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE],
            }
          : {
              impacts: organizationIssueImpactQueryValuesForSoftwareQualities([quality]),
              statuses: [...ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE],
            };
      break;
    }
    case PieChartIssueSlice.ImpactSoftwareQualities:
    case PieChartIssueSlice.Rules:
      request = getPieChartIssueCountScopeRequest(widget.filter, ['OPEN']);
      break;
    case PieChartIssueSlice.CleanCodeAttributeCategories:
    case PieChartIssueSlice.Languages:
    case PieChartHotspotSlice.ReviewPriority:
    case PieChartHotspotSlice.ReviewStatus:
    case PieChartHotspotSlice.SecurityCategory:
    case PieChartLineSlice.Language:
    case PieChartLineSlice.Coverage:
    case PieChartLineSlice.Duplications:
    case PieChartProjectSlice.Status:
    default:
      return null;
  }

  return {
    kind: 'issue-counts',
    metricLabel,
    request,
    segmentLabel: '',
    valueType: 'number',
    widgetTitle,
  };
}

function getHotspotDescriptor(
  widget: PieChartWidgetProps,
  segmentValue: string,
  base: PortfolioDashboardDrilldownDescriptorBase,
): PortfolioDashboardIssueDrilldownDescriptor | null {
  const statuses = mapPieChartHotspotFilterToIssueCountStatuses(widget.filter);
  const filterRequest = statuses ? { statuses } : {};
  let request: ProjectIssueCountsDrilldownRequest;

  switch (widget.slice as PieChartHotspotSlice) {
    case PieChartHotspotSlice.ReviewPriority:
      request = {
        issueTypes: [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES],
        severities: issueCountSeveritiesForProjectIssueCountsQuery(segmentValue),
        ...filterRequest,
      };
      break;
    case PieChartHotspotSlice.ReviewStatus:
      request = {
        issueTypes: [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES],
        ...hotspotReviewSegmentToProjectIssueCountsFilters(segmentValue),
      };
      break;
    case PieChartHotspotSlice.SecurityCategory:
      request = {
        issueTypes: [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES],
        ruleKeys: [segmentValue],
        ...filterRequest,
      };
      break;
    default:
      return null;
  }

  return { ...base, kind: 'issue-counts', request };
}

function getIssueDescriptor(
  widget: PieChartWidgetProps,
  segmentValue: string,
  base: PortfolioDashboardDrilldownDescriptorBase,
): PortfolioDashboardIssueDrilldownDescriptor | null {
  const issueType = isPieChartIssueFilter(widget.filter)
    ? PROJECT_ISSUE_TYPE_BY_FILTER[widget.filter]
    : undefined;
  const quality = getSoftwareQualityForIssueFilter(widget.filter);

  switch (widget.slice) {
    case PieChartIssueSlice.ImpactSeverities:
      return {
        ...base,
        kind: 'issue-counts',
        request: getPieChartImpactSeveritiesIssueCountRequest(
          widget.filter,
          issueType,
          segmentValue,
        ),
      };
    case PieChartIssueSlice.IssueStatuses:
      return {
        ...base,
        kind: 'issue-counts',
        request:
          quality === null
            ? {
                issueTypes: issueType === undefined ? undefined : [issueType],
                statuses: [segmentValue as IssueCountStatus],
              }
            : {
                impacts: organizationIssueImpactQueryValuesForSoftwareQualities([quality]),
                statuses: [segmentValue as IssueCountStatus],
              },
      };
    case PieChartIssueSlice.ImpactSoftwareQualities: {
      const impactSoftwareQuality = getImpactSoftwareQuality(segmentValue);
      if (impactSoftwareQuality === null) {
        return null;
      }
      const severities: SoftwareImpactSeverity[] = [
        SoftwareImpactSeverity.Blocker,
        SoftwareImpactSeverity.High,
        SoftwareImpactSeverity.Medium,
        SoftwareImpactSeverity.Low,
        SoftwareImpactSeverity.Info,
      ];
      return {
        ...base,
        kind: 'issue-counts',
        request: {
          impacts: severities.map(
            (severity) =>
              `${impactSoftwareQuality}:${severity}` as OrganizationIssueImpactQueryValue,
          ),
          statuses: ['OPEN'],
        },
      };
    }
    case PieChartIssueSlice.Rules:
      return {
        ...base,
        kind: 'issue-counts',
        request: {
          ...getPieChartIssueCountScopeRequest(widget.filter, ['OPEN']),
          ruleKeys: [segmentValue],
        },
      };
    case PieChartIssueSlice.CleanCodeAttributeCategories:
    case PieChartIssueSlice.Languages:
    case PieChartHotspotSlice.ReviewPriority:
    case PieChartHotspotSlice.ReviewStatus:
    case PieChartHotspotSlice.SecurityCategory:
    case PieChartLineSlice.Language:
    case PieChartLineSlice.Coverage:
    case PieChartLineSlice.Duplications:
    case PieChartProjectSlice.Status:
    default:
      return null;
  }
}

export function getPortfolioPieChartDrilldownDescriptor(args: {
  formatMessage: IntlShape['formatMessage'];
  segmentLabel?: string;
  segments?: PortfolioPieChartSegmentDefinition[];
  widget: PieChartWidgetProps;
}): PortfolioDashboardDrilldownDescriptor | null {
  const { formatMessage, segmentLabel, segments, widget } = args;
  const widgetTitle = getPieChartTitle(formatMessage, { ...widget, isPortfolioDashboard: true });
  const metricLabel = getPieChartMetricLabel(formatMessage, {
    ...widget,
    isPortfolioDashboard: true,
  });

  if (!segmentLabel?.trim()) {
    return getUnfilteredDescriptor(widget, metricLabel, widgetTitle);
  }

  const segmentValue = resolvePortfolioDrilldownSegmentValue(segmentLabel, segments);
  const base = { metricLabel, segmentLabel, valueType: 'number' as const, widgetTitle };
  if (isQualityGateStatusWidget(widget)) {
    return {
      ...base,
      kind: 'computed-measures',
      request: { metricKey: MetricKey.alert_status, metricValue: segmentValue },
      stringValueFormatMetricType: MetricType.Level,
      valueType: 'string',
    };
  }

  if (widget.metric === PieChartMetric.HotspotCount) {
    return getHotspotDescriptor(widget, segmentValue, base);
  }
  if (widget.metric === PieChartMetric.IssueCount) {
    return getIssueDescriptor(widget, segmentValue, base);
  }
  return null;
}

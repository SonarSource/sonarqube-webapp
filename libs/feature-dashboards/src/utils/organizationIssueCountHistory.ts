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

import {
  isPieChartIssueFilter,
  mapPieChartHotspotFilterToIssueCountStatuses,
  PIE_ISSUE_FILTER_TO_SOFTWARE_QUALITY,
} from '../components/pie-chart/pieChartFilterLineSegments';
import {
  PieChartFilter,
  PieChartHotspotSlice,
  PieChartIssueSlice,
  PieChartLineSlice,
  PieChartMetric,
  PieChartProjectSlice,
  PieChartSlice,
} from '../types/dashboard-widget';
import {
  EntityType,
  GetIssueCountHistoryParams,
  IssueCountSliceBy,
  IssueCountStatus,
  ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE,
  PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES,
  type IssueCountSnapshotParams,
} from '../types/organization-issue-count-history';
import type { OrganizationsIssueCountHistoryDay } from '../types/organization-line-chart-history';
import {
  organizationIssueImpactQueryValuesForSoftwareQualities,
  PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS,
} from './organizationIssueCountHistoryUtils';

export function issueCountHistoryToPieCounts(
  history: OrganizationsIssueCountHistoryDay[] | undefined,
): Record<string, number> {
  if (!history?.length) {
    return {};
  }
  const latest = history.reduce(
    (a, b) => (Date.parse(a.date) > Date.parse(b.date) ? a : b),
    history[0],
  );
  return Object.fromEntries(
    latest.distribution.filter((e) => Number(e.value) > 0).map((e) => [e.key, e.value]),
  );
}

export function mapPieChartToIssueHistoryParams(args: {
  entityId: string;
  entityType: EntityType;
  filter: PieChartFilter;
  metric: PieChartMetric;
  slice: PieChartSlice;
}): IssueCountSnapshotParams | null {
  const { entityId, entityType, filter, metric, slice } = args;

  if (metric === PieChartMetric.LineCount || metric === PieChartMetric.ProjectCount) {
    return null;
  }

  const base: IssueCountSnapshotParams = {
    entityId,
    entityType,
  };

  if (metric === PieChartMetric.HotspotCount) {
    const hotspotSliceBy = mapHotspotSliceToSliceBy(slice);
    if (hotspotSliceBy === null) {
      return null;
    }
    const statuses = mapPieChartHotspotFilterToIssueCountStatuses(filter);

    return {
      ...base,
      issueTypes: [...PORTFOLIO_SECURITY_HOTSPOT_ISSUE_TYPES],
      sliceBy: hotspotSliceBy,
      statuses,
    };
  }

  if (metric !== PieChartMetric.IssueCount) {
    return null;
  }

  const sliceBy = mapIssueSliceToSliceBy(slice);
  if (sliceBy === null) {
    return null;
  }

  const statuses: IssueCountStatus[] =
    slice === PieChartIssueSlice.IssueStatuses
      ? [...ORGANIZATION_CODE_ISSUE_COUNT_STATUSES_FOR_STATUS_SLICE]
      : ['OPEN'];

  return {
    ...base,
    ...mapIssueFilterToHistoryParams(filter),
    statuses,
    sliceBy,
  };
}

function mapIssueFilterToHistoryParams(
  filter: PieChartFilter,
): Pick<GetIssueCountHistoryParams, 'impacts'> {
  if (isPieChartIssueFilter(filter)) {
    return {
      impacts: organizationIssueImpactQueryValuesForSoftwareQualities([
        PIE_ISSUE_FILTER_TO_SOFTWARE_QUALITY[filter],
      ]),
    };
  }
  return { impacts: [...PORTFOLIO_DEFAULT_CODE_ISSUE_IMPACTS] };
}

/**
 * Whether issue/hotspot pie slices can use `/organizations/issue-count-history`.
 * Project dashboards may still use legacy APIs when this returns true but the slice
 * needs different semantics (e.g. hotspot `SecurityCategory` is RULE_KEY here, not OWASP category).
 */
export function supportsOrganizationPieChartIssueHistory(
  metric: PieChartMetric,
  slice: PieChartSlice,
): boolean {
  if (metric === PieChartMetric.HotspotCount) {
    return mapHotspotSliceToSliceBy(slice) !== null;
  }
  if (metric === PieChartMetric.IssueCount) {
    return mapIssueSliceToSliceBy(slice) !== null;
  }
  return false;
}

function mapIssueSliceToSliceBy(slice: PieChartSlice): IssueCountSliceBy | null {
  switch (slice) {
    case PieChartIssueSlice.ImpactSeverities:
      return 'SEVERITY';
    case PieChartIssueSlice.IssueStatuses:
      return 'STATUS';
    case PieChartIssueSlice.ImpactSoftwareQualities:
      return 'SOFTWARE_QUALITY';
    case PieChartIssueSlice.Rules:
      return 'RULE_KEY';
    case PieChartIssueSlice.CleanCodeAttributeCategories:
    case PieChartIssueSlice.Languages:
    case PieChartHotspotSlice.ReviewPriority:
    case PieChartHotspotSlice.ReviewStatus:
    case PieChartHotspotSlice.SecurityCategory:
    case PieChartLineSlice.Language:
    case PieChartLineSlice.Coverage:
    case PieChartLineSlice.Duplications:
    case PieChartProjectSlice.Status:
      return null;
    default:
      return null;
  }
}

function mapHotspotSliceToSliceBy(slice: PieChartSlice): IssueCountSliceBy | null {
  switch (slice) {
    // Portfolio org issue-count-history: hotspot STATUS dimension (TO_REVIEW / FIXED / SAFE — not resolutions).
    case PieChartHotspotSlice.ReviewStatus:
      return 'STATUS';
    case PieChartHotspotSlice.ReviewPriority:
      return 'SEVERITY';
    case PieChartHotspotSlice.SecurityCategory:
      return 'RULE_KEY';
    case PieChartIssueSlice.ImpactSoftwareQualities:
    case PieChartIssueSlice.ImpactSeverities:
    case PieChartIssueSlice.CleanCodeAttributeCategories:
    case PieChartIssueSlice.IssueStatuses:
    case PieChartIssueSlice.Languages:
    case PieChartIssueSlice.Rules:
    case PieChartLineSlice.Language:
    case PieChartLineSlice.Coverage:
    case PieChartLineSlice.Duplications:
    case PieChartProjectSlice.Status:
    default:
      return null;
  }
}

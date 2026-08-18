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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import {
  PieChartHotspotSlice,
  PieChartIssueFilter,
  PieChartIssueSlice,
  PieChartMetric,
} from '../../types/dashboard-widget';
import {
  issueCountHistoryToPieCounts,
  mapPieChartToIssueHistoryParams,
  supportsOrganizationPieChartIssueHistory,
} from '../organizationIssueCountHistory';
import { organizationIssueImpactQueryValuesForSoftwareQualities } from '../organizationIssueCountHistoryUtils';

describe('organizationPieChartIssueHistory', () => {
  it('maps supported issue slices to issue-count-history params', () => {
    expect(
      mapPieChartToIssueHistoryParams({
        entityId: 'entity-1',
        entityType: 'PORTFOLIO',
        filter: '',
        metric: PieChartMetric.IssueCount,
        slice: PieChartIssueSlice.ImpactSeverities,
      }),
    ).toEqual(
      expect.objectContaining({
        entityId: 'entity-1',
        entityType: 'PORTFOLIO',
        sliceBy: 'SEVERITY',
        statuses: ['OPEN'],
      }),
    );
  });

  it('maps security issue filters to organization impacts', () => {
    expect(
      mapPieChartToIssueHistoryParams({
        entityId: 'entity-1',
        entityType: 'PORTFOLIO',
        filter: PieChartIssueFilter.Security,
        metric: PieChartMetric.IssueCount,
        slice: PieChartIssueSlice.ImpactSeverities,
      }),
    ).toEqual(
      expect.objectContaining({
        impacts: organizationIssueImpactQueryValuesForSoftwareQualities([SoftwareQuality.Security]),
      }),
    );
  });

  it('returns null for slices without an organization dimension', () => {
    expect(
      mapPieChartToIssueHistoryParams({
        entityId: 'entity-1',
        entityType: 'PORTFOLIO',
        filter: '',
        metric: PieChartMetric.IssueCount,
        slice: PieChartIssueSlice.Languages,
      }),
    ).toBeNull();
  });

  it('converts the latest history day into pie counts', () => {
    expect(
      issueCountHistoryToPieCounts([
        {
          date: '2026-01-01',
          distribution: [
            { key: 'HIGH', value: 0 },
            { key: 'LOW', value: 3 },
          ],
        },
        {
          date: '2026-02-01',
          distribution: [
            { key: 'HIGH', value: 2 },
            { key: 'LOW', value: 1 },
          ],
        },
      ]),
    ).toEqual({ HIGH: 2, LOW: 1 });
  });

  it('reports organization support per metric and slice', () => {
    expect(
      supportsOrganizationPieChartIssueHistory(PieChartMetric.IssueCount, PieChartIssueSlice.Rules),
    ).toBe(true);
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.HotspotCount,
        PieChartHotspotSlice.SecurityCategory,
      ),
    ).toBe(true);
    expect(
      supportsOrganizationPieChartIssueHistory(
        PieChartMetric.IssueCount,
        PieChartIssueSlice.Languages,
      ),
    ).toBe(false);
  });
});

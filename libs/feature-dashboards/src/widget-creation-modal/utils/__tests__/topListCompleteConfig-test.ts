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
import { MetricKey } from '~shared/types/metrics';
import { DashboardMetricType, RichMetricKey } from '../../../types/dashboard-widget';
import {
  CodeScope,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
} from '../../../types/widget-common';
import {
  buildDashboardMetricForTopList,
  isTopListLimitValue,
  isTopListRankByValue,
  topListConfigFromDashboardMetric,
} from '../topListCompleteConfig';

describe('topListCompleteConfig', () => {
  it('buildDashboardMetricForTopList maps to rich issues metric', () => {
    expect(
      buildDashboardMetricForTopList({
        impactSoftwareQuality: SoftwareQuality.Security,
      }),
    ).toEqual({
      measureFilters: { impactSoftwareQuality: SoftwareQuality.Security },
      metricKey: RichMetricKey.Issues,
      type: DashboardMetricType.Rich,
    });
  });

  it('isTopListLimitValue accepts 5, 10, and 15 only', () => {
    expect(isTopListLimitValue(5)).toBe(true);
    expect(isTopListLimitValue(10)).toBe(true);
    expect(isTopListLimitValue(15)).toBe(true);
    expect(isTopListLimitValue(7)).toBe(false);
  });

  it('topListConfigFromDashboardMetric falls back to default limit when value is invalid', () => {
    expect(
      topListConfigFromDashboardMetric(
        buildDashboardMetricForTopList(undefined),
        TopListRankBy.Rule,
        CodeScope.Overall,
        99,
      ).limit,
    ).toBe(TopListLimit.Five);
  });

  it('isTopListRankByValue accepts rule only', () => {
    expect(isTopListRankByValue(TopListRankBy.Rule)).toBe(true);
    expect(isTopListRankByValue('rule')).toBe(true);
    expect(isTopListRankByValue('language')).toBe(false);
  });

  it('topListConfigFromDashboardMetric restores modal config with persisted limit', () => {
    expect(
      topListConfigFromDashboardMetric(
        buildDashboardMetricForTopList(undefined),
        TopListRankBy.Rule,
        CodeScope.Overall,
        TopListLimit.Five,
      ),
    ).toMatchObject({
      complete: true,
      limit: TopListLimit.Five,
      metric: TopListMetric.IssueCount,
      rankBy: TopListRankBy.Rule,
      scope: CodeScope.Overall,
    });
  });

  it('topListConfigFromDashboardMetric ignores measure filters on raw metrics', () => {
    expect(
      topListConfigFromDashboardMetric(
        { metricKey: MetricKey.ncloc, type: DashboardMetricType.Raw },
        TopListRankBy.Rule,
        CodeScope.Overall,
        TopListLimit.Ten,
      ),
    ).toMatchObject({
      complete: true,
      limit: TopListLimit.Ten,
      measureFilters: undefined,
      metric: TopListMetric.IssueCount,
      rankBy: TopListRankBy.Rule,
    });
  });

  it('topListConfigFromDashboardMetric marks config incomplete when rank-by is missing', () => {
    expect(
      topListConfigFromDashboardMetric(
        buildDashboardMetricForTopList(undefined),
        null,
        CodeScope.Overall,
        TopListLimit.Five,
      ),
    ).toMatchObject({
      complete: false,
      rankBy: null,
    });
  });
});

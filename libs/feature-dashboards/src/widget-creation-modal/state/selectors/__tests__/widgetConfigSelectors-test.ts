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

import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { IssueStatus, type CompleteWidgetConfig } from '../../../../types/dashboard-widget';
import {
  CodeScope,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
} from '../../../../types/widget-common';
import { buildDashboardMetricForTopList } from '../../../utils/topListCompleteConfig';
import type { WidgetConfigState } from '../../widgetConfigTypes';
import { extractCompleteConfig, initializeFromConfig } from '../widgetConfigSelectors';

describe('widgetConfigSelectors TopList', () => {
  const completeTopListState: WidgetConfigState = {
    selectedType: VisualizationType.TopList,
    configs: {
      [VisualizationType.TopList]: {
        complete: true,
        limit: TopListLimit.Five,
        measureFilters: { issueStatus: IssueStatus.Open },
        metric: TopListMetric.IssueCount,
        rankBy: TopListRankBy.Rule,
        scope: CodeScope.Overall,
      },
    },
  };

  it('extractCompleteConfig returns top list output when config is complete', () => {
    expect(extractCompleteConfig(completeTopListState)).toEqual({
      widgetType: VisualizationType.TopList,
      limit: TopListLimit.Five,
      metric: buildDashboardMetricForTopList({ issueStatus: IssueStatus.Open }),
      rankBy: TopListRankBy.Rule,
      scope: CodeScope.Overall,
    });
  });

  it('extractCompleteConfig returns null when rankBy is missing', () => {
    const state: WidgetConfigState = {
      selectedType: VisualizationType.TopList,
      configs: {
        [VisualizationType.TopList]: {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: undefined,
          metric: TopListMetric.IssueCount,
          rankBy: null,
          scope: CodeScope.Overall,
        },
      },
    };

    expect(extractCompleteConfig(state)).toBeNull();
  });

  it('initializeFromConfig round-trips a complete top list widget', () => {
    const completeConfig = {
      widgetType: VisualizationType.TopList,
      limit: TopListLimit.Ten,
      metric: buildDashboardMetricForTopList({
        impactSoftwareQuality: SoftwareQuality.Security,
        impactSeverities: [SoftwareImpactSeverity.Blocker],
        issueStatus: IssueStatus.Open,
      }),
      rankBy: TopListRankBy.Rule,
      scope: CodeScope.New,
    };

    const state = initializeFromConfig(completeConfig);

    expect(state.selectedType).toBe(VisualizationType.TopList);
    expect(state.configs[VisualizationType.TopList]).toMatchObject({
      complete: true,
      limit: TopListLimit.Ten,
      measureFilters: {
        impactSoftwareQuality: SoftwareQuality.Security,
        impactSeverities: [SoftwareImpactSeverity.Blocker],
        issueStatus: IssueStatus.Open,
      },
      metric: TopListMetric.IssueCount,
      rankBy: TopListRankBy.Rule,
      scope: CodeScope.New,
    });
    expect(extractCompleteConfig(state)).toEqual(completeConfig);
  });

  it('initializeFromConfig clears invalid rankBy', () => {
    const state = initializeFromConfig({
      widgetType: VisualizationType.TopList,
      limit: TopListLimit.Five,
      metric: buildDashboardMetricForTopList(undefined),
      rankBy: 'not-a-rank-by',
      scope: CodeScope.Overall,
    } as unknown as CompleteWidgetConfig);

    expect(state.configs[VisualizationType.TopList]?.rankBy).toBeNull();
    expect(state.configs[VisualizationType.TopList]?.complete).toBe(false);
  });
});

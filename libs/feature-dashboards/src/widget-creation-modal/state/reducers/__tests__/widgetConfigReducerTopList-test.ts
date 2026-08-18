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

import { IssueStatus } from '../../../../types/dashboard-widget';
import {
  CodeScope,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  VisualizationType,
} from '../../../../types/widget-common';
import type { WidgetConfigState } from '../../widgetConfigTypes';
import {
  handleSetTopListLimit,
  handleSetTopListMeasureFilters,
  handleSetTopListMetric,
  handleSetTopListRankBy,
  topListConfigAfterScopeChange,
} from '../widgetConfigReducerTopList';

describe('widgetConfigReducerTopList', () => {
  const baseState: WidgetConfigState = {
    selectedType: VisualizationType.TopList,
    configs: {
      [VisualizationType.TopList]: {
        complete: false,
        limit: TopListLimit.Five,
        measureFilters: { issueStatus: IssueStatus.Open },
        metric: null,
        rankBy: null,
        scope: CodeScope.Overall,
      },
    },
  };

  it('topListConfigAfterScopeChange keeps measure filters when scope is not New', () => {
    expect(
      topListConfigAfterScopeChange(
        {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: { issueStatus: IssueStatus.Open },
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
        CodeScope.Overall,
      ),
    ).toMatchObject({
      scope: CodeScope.Overall,
      measureFilters: { issueStatus: IssueStatus.Open },
    });
  });

  it('topListConfigAfterScopeChange keeps issue status when scope is New', () => {
    expect(
      topListConfigAfterScopeChange(
        {
          complete: true,
          limit: TopListLimit.Five,
          measureFilters: { issueStatus: IssueStatus.Open },
          metric: TopListMetric.IssueCount,
          rankBy: TopListRankBy.Rule,
          scope: CodeScope.Overall,
        },
        CodeScope.New,
      ),
    ).toMatchObject({
      scope: CodeScope.New,
      measureFilters: { issueStatus: IssueStatus.Open },
    });
  });

  it('handleSetTopListMeasureFilters updates filters when top list is selected', () => {
    const next = handleSetTopListMeasureFilters(baseState, {
      measureFilters: { issueStatus: IssueStatus.Accepted },
      type: 'SET_TOP_LIST_MEASURE_FILTERS',
    });

    expect(next.configs[VisualizationType.TopList]?.measureFilters).toEqual({
      issueStatus: IssueStatus.Accepted,
    });
  });

  it('handleSetTopListMetric completes config when metric and rank-by are set', () => {
    let state = handleSetTopListMetric(baseState, {
      metric: TopListMetric.IssueCount,
      type: 'SET_TOP_LIST_METRIC',
    });
    state = handleSetTopListRankBy(state, {
      rankBy: TopListRankBy.Rule,
      type: 'SET_TOP_LIST_RANK_BY',
    });

    expect(state.configs[VisualizationType.TopList]).toMatchObject({
      complete: true,
      metric: TopListMetric.IssueCount,
      rankBy: TopListRankBy.Rule,
    });
  });

  it('handleSetTopListLimit updates limit', () => {
    const next = handleSetTopListLimit(baseState, {
      limit: TopListLimit.Ten,
      type: 'SET_TOP_LIST_LIMIT',
    });

    expect(next.configs[VisualizationType.TopList]?.limit).toBe(TopListLimit.Ten);
  });

  it('ignores top list actions when another visualization is selected', () => {
    const pieState: WidgetConfigState = {
      selectedType: VisualizationType.PieChart,
      configs: {},
    };

    expect(
      handleSetTopListLimit(pieState, { limit: TopListLimit.Ten, type: 'SET_TOP_LIST_LIMIT' }),
    ).toBe(pieState);
    expect(
      handleSetTopListMetric(pieState, {
        metric: TopListMetric.IssueCount,
        type: 'SET_TOP_LIST_METRIC',
      }),
    ).toBe(pieState);
    expect(
      handleSetTopListRankBy(pieState, {
        rankBy: TopListRankBy.Rule,
        type: 'SET_TOP_LIST_RANK_BY',
      }),
    ).toBe(pieState);
    expect(
      handleSetTopListMeasureFilters(pieState, {
        measureFilters: { issueStatus: IssueStatus.Open },
        type: 'SET_TOP_LIST_MEASURE_FILTERS',
      }),
    ).toBe(pieState);
  });
});

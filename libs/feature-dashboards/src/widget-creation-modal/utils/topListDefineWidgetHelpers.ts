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
  TOP_LIST_UI_LIMIT_OPTIONS,
  TopListLimit,
  TopListMetric,
  TopListRankBy,
  type TopListLimitValue,
} from '../../types/widget-common';
import { isTopListLimitValue } from './topListCompleteConfig';

export function buildTopListMetricSelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
): Array<{ label: string; value: (typeof TopListMetric)[keyof typeof TopListMetric] }> {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.issue_count',
      }),
      value: TopListMetric.IssueCount,
    },
  ];
}

export function buildTopListRankBySelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
): Array<{ label: string; value: (typeof TopListRankBy)[keyof typeof TopListRankBy] }> {
  return [
    {
      label: formatMessage({
        id: 'dashboard.top_list.column.rank_by.rule',
      }),
      value: TopListRankBy.Rule,
    },
  ];
}

const TOP_LIST_LIMIT_MESSAGE_ID: Record<TopListLimitValue, string> = {
  [TopListLimit.Five]: 'dashboard.add_widget_modal.define_widget.top_list.limit.five',
  [TopListLimit.Ten]: 'dashboard.add_widget_modal.define_widget.top_list.limit.ten',
  [TopListLimit.Fifteen]: 'dashboard.add_widget_modal.define_widget.top_list.limit.fifteen',
};

export function topListLimitFromSelectValue(value: string): TopListLimitValue | null {
  const limit = Number(value);
  return isTopListLimitValue(limit) ? limit : null;
}

export function buildTopListLimitSelectOptions(
  formatMessage: (descriptor: { id: string }) => string,
): Array<{ label: string; value: string }> {
  return TOP_LIST_UI_LIMIT_OPTIONS.map((value) => ({
    label: formatMessage({ id: TOP_LIST_LIMIT_MESSAGE_ID[value] }),
    value: String(value),
  }));
}

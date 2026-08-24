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
  TopListMetric,
  TopListRankBy,
  type TopListMetricValue,
  type TopListRankByValue,
} from '../../../types/widget-common';

const RANK_BY_COLUMN_MESSAGE_ID: Record<TopListRankByValue, string> = {
  [TopListRankBy.Rule]: 'dashboard.top_list.column.rank_by.rule',
};

const METRIC_COLUMN_MESSAGE_ID: Record<TopListMetricValue, string> = {
  [TopListMetric.IssueCount]: 'dashboard.top_list.column.metric.issue_count',
};

const TOP_LIST_TREND_COLUMN_MESSAGE_ID = 'dashboard.top_list.column.trend';

function getTopListColumnHeaderMessageIds(
  rankBy: TopListRankByValue,
  metric: TopListMetricValue,
): {
  metricColumnMessageId: string;
  rankByColumnMessageId: string;
  trendColumnMessageId: string;
} {
  return {
    metricColumnMessageId: METRIC_COLUMN_MESSAGE_ID[metric],
    rankByColumnMessageId: RANK_BY_COLUMN_MESSAGE_ID[rankBy],
    trendColumnMessageId: TOP_LIST_TREND_COLUMN_MESSAGE_ID,
  };
}

export function getTopListColumnHeaders(
  rankBy: TopListRankByValue,
  metric: TopListMetricValue,
  formatMessage: (descriptor: { id: string }) => string,
): {
  metric: string;
  rankBy: string;
  trend: string;
} {
  const messageIds = getTopListColumnHeaderMessageIds(rankBy, metric);

  return {
    metric: formatMessage({ id: messageIds.metricColumnMessageId }),
    rankBy: formatMessage({ id: messageIds.rankByColumnMessageId }),
    trend: formatMessage({ id: messageIds.trendColumnMessageId }),
  };
}

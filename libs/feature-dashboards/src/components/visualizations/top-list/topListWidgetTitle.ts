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
import type { MeasureFilters } from '../../../types/dashboard-widget';
import {
  TopListMetric,
  TopListRankBy,
  type TopListLimitValue,
  type TopListRankByValue,
} from '../../../types/widget-common';
import { getMeasureFilterTitle } from '../../widget-header/widgetHeaderText';

const RANK_BY_TITLE_MESSAGE_ID: Record<TopListRankByValue, string> = {
  [TopListRankBy.Rule]: 'dashboard.top_list.title.rank_by.rule',
};

const METRIC_TITLE_MESSAGE_ID: Record<(typeof TopListMetric)[keyof typeof TopListMetric], string> =
  {
    [TopListMetric.IssueCount]: 'dashboard.top_list.title.metric.issue_count',
  };

export interface GetTopListWidgetTitleParams {
  limit: TopListLimitValue;
  measureFilters?: MeasureFilters;
  rankBy: TopListRankByValue;
}

/** Returns a fully-localised widget title string. */
export function getTopListWidgetTitle(
  formatMessage: IntlShape['formatMessage'],
  { limit, measureFilters, rankBy }: Readonly<GetTopListWidgetTitleParams>,
): string {
  const metric = [
    getMeasureFilterTitle(formatMessage, measureFilters),
    formatMessage({ id: METRIC_TITLE_MESSAGE_ID[TopListMetric.IssueCount] }),
  ]
    .filter(Boolean)
    .join(' ');

  return formatMessage(
    { id: 'dashboard.top_list.widget_title' },
    {
      limit,
      metric,
      rankBy: formatMessage({ id: RANK_BY_TITLE_MESSAGE_ID[rankBy] }),
    },
  );
}

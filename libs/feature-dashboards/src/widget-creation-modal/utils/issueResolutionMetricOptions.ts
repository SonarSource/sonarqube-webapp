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

import { IntlShape } from 'react-intl';
import { IssueResolutionStatistic } from '../../types/organization-issue-resolution-history';
import { type MetricGroup, type MetricOption } from '../../types/widget-common';

export function buildIssueResolutionMetricItems(
  formatMessage: IntlShape['formatMessage'],
): MetricOption[] {
  return [
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.resolved_issues',
      }),
      value: IssueResolutionStatistic.ResolvedIssues,
    },
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.mttr',
      }),
      value: IssueResolutionStatistic.MTTR,
    },
    {
      label: formatMessage({
        id: 'dashboard.add_widget_modal.define_widget.metric.recent_mttr',
      }),
      value: IssueResolutionStatistic.RecentMTTR,
    },
  ];
}

export function appendIssueResolutionOptions(
  groups: MetricGroup[],
  formatMessage: IntlShape['formatMessage'],
  issuesGroupLabel: string,
): MetricGroup[] {
  const issueResolutionItems = buildIssueResolutionMetricItems(formatMessage);

  return groups.map((group) =>
    group.group === issuesGroupLabel
      ? { ...group, items: [...group.items, ...issueResolutionItems] }
      : group,
  );
}

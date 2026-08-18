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
import { MetricKey } from '~shared/types/metrics';
import { IssueResolutionStatistic } from '../../../types/organization-issue-resolution-history';
import {
  appendIssueResolutionOptions,
  buildIssueResolutionMetricItems,
} from '../issueResolutionMetricOptions';

function createIntlStub(): IntlShape {
  return {
    formatMessage: ({ id }: { id: string }) => id,
  } as IntlShape;
}

describe('buildIssueResolutionMetricItems', () => {
  it('returns resolved issues, MTTR, and recent MTTR options in that order', () => {
    const items = buildIssueResolutionMetricItems(createIntlStub().formatMessage);

    expect(items.map((i) => i.value)).toEqual([
      IssueResolutionStatistic.ResolvedIssues,
      IssueResolutionStatistic.MTTR,
      IssueResolutionStatistic.RecentMTTR,
    ]);
  });

  it('uses the resolved_issues message key for the first item label', () => {
    const items = buildIssueResolutionMetricItems(createIntlStub().formatMessage);

    expect(items[0]?.label).toBe('dashboard.add_widget_modal.define_widget.metric.resolved_issues');
  });

  it('uses the mttr message key for the second item label', () => {
    const items = buildIssueResolutionMetricItems(createIntlStub().formatMessage);

    expect(items[1]?.label).toBe('dashboard.add_widget_modal.define_widget.metric.mttr');
  });

  it('uses the recent_mttr message key for the third item label', () => {
    const items = buildIssueResolutionMetricItems(createIntlStub().formatMessage);

    expect(items[2]?.label).toBe('dashboard.add_widget_modal.define_widget.metric.recent_mttr');
  });
});

describe('appendIssueResolutionOptions', () => {
  it('appends issue-resolution options to the requested group in their defined order', () => {
    const groups = [
      {
        group: 'Issues',
        items: [{ label: 'Issue count', value: MetricKey.violations }],
      },
      {
        group: 'Security',
        items: [{ label: 'Security hotspots', value: MetricKey.security_hotspots }],
      },
    ];

    const result = appendIssueResolutionOptions(groups, createIntlStub().formatMessage, 'Issues');

    expect(result[0]?.items.map((item) => item.value)).toEqual([
      MetricKey.violations,
      IssueResolutionStatistic.ResolvedIssues,
      IssueResolutionStatistic.MTTR,
      IssueResolutionStatistic.RecentMTTR,
    ]);
    expect(result[1]).toEqual(groups[1]);
  });

  it('leaves all groups unchanged when the requested group is absent', () => {
    const groups = [
      {
        group: 'Security',
        items: [{ label: 'Security hotspots', value: MetricKey.security_hotspots }],
      },
    ];

    expect(appendIssueResolutionOptions(groups, createIntlStub().formatMessage, 'Issues')).toEqual(
      groups,
    );
  });
});

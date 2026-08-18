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

import { TopListLimit } from '../../../types/widget-common';
import {
  buildTopListLimitSelectOptions,
  buildTopListMetricSelectOptions,
  buildTopListRankBySelectOptions,
  topListLimitFromSelectValue,
} from '../topListDefineWidgetHelpers';

describe('buildTopListLimitSelectOptions', () => {
  const formatMessage = (descriptor: { id: string }) => descriptor.id;

  it('returns only UI-enabled limit options', () => {
    expect(buildTopListLimitSelectOptions(formatMessage)).toEqual([
      {
        label: 'dashboard.add_widget_modal.define_widget.top_list.limit.five',
        value: '5',
      },
    ]);
  });

  it('buildTopListMetricSelectOptions returns issue count', () => {
    expect(buildTopListMetricSelectOptions(formatMessage)).toEqual([
      {
        label: 'dashboard.add_widget_modal.define_widget.metric.issue_count',
        value: 'issueCount',
      },
    ]);
  });

  it('buildTopListRankBySelectOptions returns rule rank-by', () => {
    expect(buildTopListRankBySelectOptions(formatMessage)).toEqual([
      {
        label: 'dashboard.top_list.column.rank_by.rule',
        value: 'rule',
      },
    ]);
  });

  it('topListLimitFromSelectValue parses valid limits and rejects invalid values', () => {
    expect(topListLimitFromSelectValue('5')).toBe(TopListLimit.Five);
    expect(topListLimitFromSelectValue('10')).toBe(TopListLimit.Ten);
    expect(topListLimitFromSelectValue('not-a-number')).toBeNull();
    expect(topListLimitFromSelectValue('7')).toBeNull();
  });
});

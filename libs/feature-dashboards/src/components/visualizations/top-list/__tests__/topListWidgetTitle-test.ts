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
import { TopListLimit, TopListRankBy } from '../../../../types/widget-common';
import { getTopListWidgetTitle } from '../topListWidgetTitle';

/** Minimal formatMessage stub that handles value interpolation. */
const formatMessage = ((descriptor: { id: string }, values?: Record<string, unknown>): string => {
  if (values) {
    return [descriptor.id, ...Object.values(values)].join('.');
  }
  return descriptor.id;
}) as IntlShape['formatMessage'];

describe('getTopListWidgetTitle', () => {
  it('returns the fully-localised widget title string', () => {
    const title = getTopListWidgetTitle(formatMessage, {
      limit: TopListLimit.Five,
      rankBy: TopListRankBy.Rule,
    });

    expect(title).toBe(
      'dashboard.top_list.widget_title.5.dashboard.top_list.title.metric.issue_count.dashboard.top_list.title.rank_by.rule',
    );
  });
});

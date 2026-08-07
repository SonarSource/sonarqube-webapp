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

import type { ComponentProps } from 'react';
import { renderWithContext } from '../../../helpers/test-utils';
import { byRole } from '../../../helpers/testSelector';
import { IssuesFilteredResultsAnnouncement } from '../IssuesFilteredResultsAnnouncement';

type Props = ComponentProps<typeof IssuesFilteredResultsAnnouncement>;

const EMPTY_MESSAGE = '​';

const ui = {
  announcement: byRole('status'),
};

it('announces nothing while loading, regardless of filter or total', () => {
  renderIssuesFilteredResultsAnnouncement({ loading: true, isFiltered: true, total: 0 });

  expect(ui.announcement.get()).toHaveTextContent(EMPTY_MESSAGE);
});

it('announces nothing when results are not filtered', () => {
  renderIssuesFilteredResultsAnnouncement({ loading: false, isFiltered: false, total: 5 });

  expect(ui.announcement.get()).toHaveTextContent(EMPTY_MESSAGE);
});

it('announces the empty state when the filtered results are empty', () => {
  renderIssuesFilteredResultsAnnouncement({ loading: false, isFiltered: true, total: 0 });

  expect(ui.announcement.get()).toHaveTextContent('no_results_search no_results_search.2');
});

it('announces the result count when filtered results are found', () => {
  renderIssuesFilteredResultsAnnouncement({ loading: false, isFiltered: true, total: 12 });

  expect(ui.announcement.get()).toHaveTextContent('issues.x_results_found');
});

function renderIssuesFilteredResultsAnnouncement(props: Partial<Props> = {}) {
  return renderWithContext(
    <IssuesFilteredResultsAnnouncement isFiltered loading={false} total={0} {...props} />,
  );
}

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

import { Table } from '@sonarsource/echoes-react';
import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import {
  PortfolioProjectBreakdownRow,
  PortfolioProjectBreakdownTable,
} from '../PortfolioProjectBreakdownTable';

// Use the real lodash `debounce` (with timers) instead of the global immediate
// pass-through mock, so we can exercise the actual debounce/cancel timing.
// (`jest.mock` is hoisted above the imports by babel-jest.)
jest.mock('lodash', () => jest.requireActual<typeof import('lodash')>('lodash'));

// Mirrors SEARCH_DEBOUNCE_DELAY in the component (not exported); advance past it.
const PAST_DEBOUNCE_DELAY = 500;

const ROWS: PortfolioProjectBreakdownRow[] = [
  { branchId: 'b1', branchName: null, projectKey: 'p1', projectName: 'Project One' },
];

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

/**
 * Mimics how the table is used in real pages: `projectQuery` is controlled (URL-derived) and the
 * callbacks are fresh inline arrows on every render — exactly what triggers the debounce-cancel
 * regression. `onSort` flips the sort direction, which re-renders the parent mid-debounce.
 */
function ControlledBreakdownTable({
  onQuerySettled,
  onSortClicked,
}: Readonly<{
  onQuerySettled: (query: string | undefined) => void;
  onSortClicked: () => void;
}>) {
  const [projectQuery, setProjectQuery] = useState<string | undefined>('Sonar');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  return (
    <PortfolioProjectBreakdownTable
      getRowUrl={() => '/project'}
      isLoading={false}
      isProjectSearchWithNoMatches={false}
      loadingLabel="loading"
      metricLabel="Issues"
      noResultsText="no results"
      onPageChange={jest.fn()}
      onProjectQueryChange={(query) => {
        onQuerySettled(query);
        setProjectQuery(query);
      }}
      onSort={() => {
        onSortClicked();
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      }}
      page={1}
      projectNameLabel="Project"
      projectQuery={projectQuery}
      renderValueCell={(_row, url) => <Table.CellLink to={url}>42</Table.CellLink>}
      rows={ROWS}
      searchPlaceholder="Search"
      sortDirection={sortDirection}
      tableLabel="Breakdown"
      totalPages={1}
    />
  );
}

it('keeps the pending search when sorting before the debounce settles', () => {
  const onQuerySettled = jest.fn();
  const onSortClicked = jest.fn();
  renderWithRouter(
    <ControlledBreakdownTable onQuerySettled={onQuerySettled} onSortClicked={onSortClicked} />,
  );

  const searchbox = screen.getByRole('searchbox');
  expect(searchbox).toHaveValue('Sonar');

  // Replace the query, then immediately sort — before the debounce window elapses. The sort click
  // re-renders the parent with fresh callback identities, which previously cancelled the pending
  // search and left the URL/results on the stale query.
  fireEvent.change(searchbox, { target: { value: 'Server' } });
  fireEvent.click(screen.getByRole('button', { name: 'Issues' }));

  act(() => {
    jest.advanceTimersByTime(PAST_DEBOUNCE_DELAY);
  });

  // Both actions survive: the latest query is applied and the sort fired once...
  expect(onSortClicked).toHaveBeenCalledTimes(1);
  expect(onQuerySettled).toHaveBeenCalledTimes(1);
  expect(onQuerySettled).toHaveBeenCalledWith('Server');
  // ...and the input still agrees with the applied query — no mismatch/snap-back.
  expect(searchbox).toHaveValue('Server');
});

it('settles the debounced search when typing without sorting', () => {
  const onQuerySettled = jest.fn();
  const onSortClicked = jest.fn();
  renderWithRouter(
    <ControlledBreakdownTable onQuerySettled={onQuerySettled} onSortClicked={onSortClicked} />,
  );

  const searchbox = screen.getByRole('searchbox');
  fireEvent.change(searchbox, { target: { value: 'Server' } });

  // Still debounced, not fired yet.
  expect(onQuerySettled).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(PAST_DEBOUNCE_DELAY);
  });

  expect(onQuerySettled).toHaveBeenCalledTimes(1);
  expect(onQuerySettled).toHaveBeenCalledWith('Server');
  expect(searchbox).toHaveValue('Server');
});

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

import { screen } from '@testing-library/react';
import { mockIssue } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Issue } from '~sq-server-commons/types/types';
import IssuesList from '../IssuesList';

jest.mock('~sq-server-commons/components/issue/Issue', () => ({
  __esModule: true,
  default: ({ issue }: { issue: Issue }) => <li data-testid="issue">{issue.key}</li>,
}));

jest.mock('../ComponentBreadcrumbs', () => ({
  __esModule: true,
  default: ({ issue }: { issue: Issue }) => <div data-testid="breadcrumb">{issue.component}</div>,
}));

it('does not merge non-consecutive issues for the same component into one group', () => {
  const issues = [
    mockIssue(false, { key: 'issue-1', component: 'fileA' }),
    mockIssue(false, { key: 'issue-2', component: 'fileB' }),
    mockIssue(false, { key: 'issue-3', component: 'fileA' }),
  ];

  renderIssuesList({ issues });

  expect(screen.getAllByTestId('breadcrumb').map((el) => el.textContent)).toEqual([
    'fileA',
    'fileB',
    'fileA',
  ]);
  expect(screen.getAllByTestId('issue').map((el) => el.textContent)).toEqual([
    'issue-1',
    'issue-2',
    'issue-3',
  ]);
});

it('merges consecutive issues for the same component into one group', () => {
  const issues = [
    mockIssue(false, { key: 'issue-1', component: 'fileA' }),
    mockIssue(false, { key: 'issue-2', component: 'fileA' }),
    mockIssue(false, { key: 'issue-3', component: 'fileB' }),
  ];

  renderIssuesList({ issues });

  expect(screen.getAllByTestId('breadcrumb').map((el) => el.textContent)).toEqual([
    'fileA',
    'fileB',
  ]);
  expect(screen.getAllByTestId('issue').map((el) => el.textContent)).toEqual([
    'issue-1',
    'issue-2',
    'issue-3',
  ]);
});

function renderIssuesList(overrides: Partial<React.ComponentProps<typeof IssuesList>> = {}) {
  return renderComponent(
    <IssuesList
      branchLike={undefined}
      checked={[]}
      component={undefined}
      issues={[]}
      onIssueChange={jest.fn()}
      onIssueCheck={jest.fn()}
      onIssueSelect={jest.fn()}
      onPopupToggle={jest.fn()}
      openPopup={undefined}
      selectedIssue={undefined}
      {...overrides}
    />,
  );
}

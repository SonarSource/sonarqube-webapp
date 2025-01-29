/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { Outlet, Route } from 'react-router-dom';
import { mockComponent } from '~sq-server-shared/helpers/mocks/component';
import { mockCurrentUser } from '~sq-server-shared/helpers/testMocks';
import {
  renderApp,
  renderAppWithComponentContext,
} from '~sq-server-shared/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-shared/types/features';
import { Component } from '~sq-server-shared/types/types';
import { NoticeType } from '~sq-server-shared/types/users';
import IssuesApp from './components/IssuesApp';
import { projectIssuesRoutes } from './routes';

export function renderIssueApp(
  currentUser = mockCurrentUser({
    dismissedNotices: {
      [NoticeType.ISSUE_GUIDE]: true,
      [NoticeType.ISSUE_NEW_STATUS_AND_TRANSITION_GUIDE]: true,
    },
  }),
  featureList: Feature[] = [],
  navigateTo?: string,
) {
  return renderApp('issues', <IssuesApp />, {
    currentUser,
    featureList,
    navigateTo,
  });
}

export function renderProjectIssuesApp(
  navigateTo?: string,
  overrides?: Partial<Component>,
  currentUser = mockCurrentUser({
    dismissedNotices: {
      [NoticeType.ISSUE_GUIDE]: true,
      [NoticeType.ISSUE_NEW_STATUS_AND_TRANSITION_GUIDE]: true,
    },
  }),
  featureList = [Feature.BranchSupport],
) {
  return renderAppWithComponentContext(
    'project/issues',
    () => (
      <Route
        element={
          <div data-guiding-id="issue-5">
            <Outlet />
          </div>
        }>
        {projectIssuesRoutes()}
      </Route>
    ),
    { navigateTo, currentUser, featureList },
    { component: mockComponent(overrides) },
  );
}

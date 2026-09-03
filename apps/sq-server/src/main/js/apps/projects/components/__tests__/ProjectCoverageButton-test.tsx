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

import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { byRole, byTestId, byText } from '~shared/helpers/testSelector';
import UsersServiceMock from '~sq-server-commons/api/mocks/UsersServiceMock';
import { dismissNotice } from '~sq-server-commons/api/users';
import { mockLoggedInUser } from '~sq-server-commons/helpers/testMocks';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { CurrentUser, NoticeType } from '~sq-server-commons/types/users';
import ProjectCoverageButton from '../ProjectCoverageButton';

const usersHandler = new UsersServiceMock();

beforeEach(() => {
  jest.clearAllMocks();
  usersHandler.reset();
});

const ui = {
  button: byRole('link', { name: 'projects.coverage' }),
  tourTitle: byText('projects.coverage.spotlight.title'),
  closeButton: byRole('button', { name: 'projects.coverage.spotlight.close' }),
  currentPathname: byTestId('current-pathname'),
};

it('does not render for a non-admin user', () => {
  renderProjectCoverageButton(mockLoggedInUser());

  expect(ui.button.query()).not.toBeInTheDocument();
  expect(ui.tourTitle.query()).not.toBeInTheDocument();
});

it('shows the button and opens the tour for a system admin', async () => {
  renderProjectCoverageButton(mockLoggedInUser({ permissions: { global: ['admin'] } }));

  expect(await ui.button.find()).toHaveAttribute('href', '/admin/onboarding-dashboard');
  expect(ui.tourTitle.get()).toBeInTheDocument();
});

it('does not open the tour once already dismissed by this user', async () => {
  renderProjectCoverageButton(
    mockLoggedInUser({
      dismissedNotices: { [NoticeType.PROJECT_COVERAGE_TOUR]: true },
      permissions: { global: ['admin'] },
    }),
  );

  expect(await ui.button.find()).toBeInTheDocument();
  expect(ui.tourTitle.query()).not.toBeInTheDocument();
});

it('dismisses the tour forever without navigating when clicking Close', async () => {
  const user = userEvent.setup();
  renderProjectCoverageButton(mockLoggedInUser({ permissions: { global: ['admin'] } }));

  await user.click(await ui.closeButton.find());

  expect(dismissNotice).toHaveBeenCalledWith(NoticeType.PROJECT_COVERAGE_TOUR);
  expect(ui.tourTitle.query()).not.toBeInTheDocument();
  expect(ui.currentPathname.get()).toHaveTextContent(/^\/$/);
  expect(await ui.button.find()).toHaveAttribute('href', '/admin/onboarding-dashboard');
});

it('dismisses the tour forever when clicking the button itself', async () => {
  const user = userEvent.setup();
  renderProjectCoverageButton(mockLoggedInUser({ permissions: { global: ['admin'] } }));

  await user.click(await ui.button.find());

  expect(dismissNotice).toHaveBeenCalledTimes(1);
  expect(dismissNotice).toHaveBeenCalledWith(NoticeType.PROJECT_COVERAGE_TOUR);
  expect(ui.currentPathname.get()).toHaveTextContent('/admin/onboarding-dashboard');
});

function CurrentPathname() {
  const { pathname } = useLocation();

  return <div data-testid="current-pathname">{pathname}</div>;
}

function renderProjectCoverageButton(currentUser: CurrentUser) {
  return renderComponent(
    <>
      <ProjectCoverageButton currentUser={currentUser} />
      <CurrentPathname />
    </>,
    '/',
    { currentUser },
  );
}

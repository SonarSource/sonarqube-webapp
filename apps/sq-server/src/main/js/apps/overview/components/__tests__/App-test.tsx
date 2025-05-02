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

import { screen, waitFor } from '@testing-library/react';
import { ComponentQualifier } from '~shared/types/component';
import { getScannableProjects } from '~sq-server-shared/api/components';
import BranchesServiceMock from '~sq-server-shared/api/mocks/BranchesServiceMock';
import ComputeEngineServiceMock from '~sq-server-shared/api/mocks/ComputeEngineServiceMock';
import CurrentUserContextProvider from '~sq-server-shared/context/current-user/CurrentUserContextProvider';
import {
  mockBranch,
  mockMainBranch,
  mockPullRequest,
} from '~sq-server-shared/helpers/mocks/branch-like';
import { mockComponent } from '~sq-server-shared/helpers/mocks/component';
import { mockTask } from '~sq-server-shared/helpers/mocks/tasks';
import { mockCurrentUser, mockLoggedInUser } from '~sq-server-shared/helpers/testMocks';
import { renderComponent } from '~sq-server-shared/helpers/testReactTestingUtils';
import { getProjectTutorialLocation } from '~sq-server-shared/helpers/urls';
import { TaskStatuses, TaskTypes } from '~sq-server-shared/types/tasks';
import { App } from '../App';

jest.mock('~sq-server-addons/index', () => ({
  addons: { branches: { PullRequestOverview: () => 'PullRequestOverview' } },
}));

jest.mock('~sq-server-shared/api/components', () => ({
  ...jest.requireActual('~sq-server-shared/api/components'),
  getScannableProjects: jest.fn().mockResolvedValue({ projects: [] }),
}));

jest.mock('~sq-server-shared/context/available-features/withAvailableFeatures', () => ({
  useAvailableFeatures: () => ({ hasFeature: () => true }),
}));

jest.mock('~sq-server-shared/helpers/urls', () => ({
  ...jest.requireActual('~sq-server-shared/helpers/urls'),
  getProjectTutorialLocation: jest.fn().mockResolvedValue({ pathname: '/tutorial' }),
}));

const handlerBranches = new BranchesServiceMock();
const handlerCe = new ComputeEngineServiceMock();

beforeEach(() => {
  handlerBranches.reset();
  handlerCe.reset();
});

it('should render Empty Overview for Application with no analysis', async () => {
  renderApp({ component: mockComponent({ qualifier: ComponentQualifier.Application }) });

  await appLoaded();

  expect(await screen.findByText('provisioning.no_analysis.application')).toBeInTheDocument();
});

it('should render Empty Overview on main branch with no analysis', async () => {
  renderApp({}, mockCurrentUser());

  await appLoaded();

  expect(
    await screen.findByText('provisioning.no_analysis_on_main_branch.main'),
  ).toBeInTheDocument();
});

it('should redirect to tutorial when the user can scan a project that has no analysis yet', async () => {
  handlerBranches.emptyBranchesAndPullRequest();
  handlerBranches.addBranch(mockMainBranch());

  jest
    .mocked(getScannableProjects)
    .mockResolvedValueOnce({ projects: [{ key: 'my-project', name: 'MyProject' }] });

  renderApp({}, mockLoggedInUser());

  await appLoaded();

  await waitFor(() => {
    expect(getProjectTutorialLocation).toHaveBeenCalled();
  });
});

it('should render Empty Overview on main branch with multiple branches with bad configuration', async () => {
  renderApp({ branchLikes: [mockBranch(), mockBranch()] });

  await appLoaded();

  expect(
    await screen.findByText(
      'provisioning.no_analysis_on_main_branch.bad_configuration.main.branches.main_branch',
    ),
  ).toBeInTheDocument();
});

it('should not render for portfolios and subportfolios', () => {
  const rtl = renderApp({
    component: mockComponent({ qualifier: ComponentQualifier.Portfolio }),
  });
  expect(rtl.container).toBeEmptyDOMElement();

  rtl.unmount();

  renderApp({
    component: mockComponent({ qualifier: ComponentQualifier.Portfolio }),
  });
  expect(rtl.container).toBeEmptyDOMElement();
});

describe('Permission provisioning', () => {
  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('should render warning when permission is sync for github', async () => {
    handlerCe.addTask(
      mockTask({
        componentKey: 'my-project',
        type: TaskTypes.GithubProjectPermissionsProvisioning,
        status: TaskStatuses.InProgress,
      }),
    );

    renderApp();

    jest.runOnlyPendingTimers();
    expect(
      await screen.findByText('provisioning.permission_synch_in_progress.alm.github'),
    ).toBeInTheDocument();

    handlerCe.clearTasks();
    handlerCe.addTask(
      mockTask({
        componentKey: 'my-project',
        type: TaskTypes.GithubProjectPermissionsProvisioning,
        status: TaskStatuses.Success,
      }),
    );

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(
        screen.queryByText('provisioning.permission_synch_in_progress.alm.github'),
      ).not.toBeInTheDocument();
    });
  });

  it('should render warning when permission is sync for gitlab', async () => {
    handlerCe.addTask(
      mockTask({
        componentKey: 'my-project',
        type: TaskTypes.GitlabProjectPermissionsProvisioning,
        status: TaskStatuses.InProgress,
      }),
    );

    renderApp();

    jest.runOnlyPendingTimers();
    expect(
      await screen.findByText('provisioning.permission_synch_in_progress.alm.gitlab'),
    ).toBeInTheDocument();

    handlerCe.clearTasks();
    handlerCe.addTask(
      mockTask({
        componentKey: 'my-project',
        type: TaskTypes.GitlabProjectPermissionsProvisioning,
        status: TaskStatuses.Success,
      }),
    );

    jest.runOnlyPendingTimers();

    await waitFor(() => {
      expect(
        screen.queryByText('provisioning.permission_synch_in_progress.alm.gitlab'),
      ).not.toBeInTheDocument();
    });
  });
});

describe('Add-ons', () => {
  it('should display the PullRequestOverview component when available', async () => {
    handlerBranches.emptyBranchesAndPullRequest();
    handlerBranches.addBranch({ ...mockMainBranch(), ...mockPullRequest() });

    renderApp({}, mockLoggedInUser());

    await waitFor(() => {
      expect(screen.getByText('PullRequestOverview')).toBeInTheDocument();
    });
  });

  it('should not display the PullRequestOverview component when not available', async () => {
    jest.doMock('~sq-server-addons/index', () => ({
      addons: {},
    }));

    handlerBranches.emptyBranchesAndPullRequest();
    handlerBranches.addBranch({ ...mockMainBranch(), ...mockPullRequest() });

    renderApp({}, mockLoggedInUser());

    await waitFor(() => {
      expect(screen.queryByText('PullRequestOverview')).not.toBeInTheDocument();
    });
  });
});

const appLoaded = async () => {
  await waitFor(() => {
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });
};

function renderApp(props = {}, userProps = {}) {
  return renderComponent(
    <CurrentUserContextProvider currentUser={mockCurrentUser({ isLoggedIn: true, ...userProps })}>
      <App component={mockComponent()} {...props} />
    </CurrentUserContextProvider>,
    '/?id=my-project',
  );
}

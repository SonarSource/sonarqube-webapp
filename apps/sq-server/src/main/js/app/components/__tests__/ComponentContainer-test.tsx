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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { Route } from 'react-router-dom';
import * as withRouter from '~shared/components/hoc/withRouter';
import { byRole, byTestId, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier, Visibility } from '~shared/types/component';
import { HttpStatus } from '~shared/types/request';
import { validateProjectAlmBinding } from '~sq-server-commons/api/alm-settings';
import { getBranches, getPullRequests } from '~sq-server-commons/api/branches';
import { getTasksForComponent } from '~sq-server-commons/api/ce';
import { getComponentData } from '~sq-server-commons/api/components';
import { MeasuresServiceMock } from '~sq-server-commons/api/mocks/MeasuresServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { getComponentNavigation } from '~sq-server-commons/api/navigation';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import {
  mockBranch,
  mockMainBranch,
  mockPullRequest,
} from '~sq-server-commons/helpers/mocks/branch-like';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockTask } from '~sq-server-commons/helpers/mocks/tasks';
import { renderAppRoutes, renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { getProjectUrl, getPullRequestUrl } from '~sq-server-commons/helpers/urls';
import { withBranchLikes, WithBranchLikesProps } from '~sq-server-commons/queries/branch';
import { Feature } from '~sq-server-commons/types/features';
import { TaskStatuses, TaskTypes } from '~sq-server-commons/types/tasks';
import { Component } from '~sq-server-commons/types/types';
import handleRequiredAuthorization from '../../utils/handleRequiredAuthorization';
import ComponentContainer, { isSameBranch } from '../ComponentContainer';

const settingsHandler = new SettingsServiceMock();
const measuresHandler = new MeasuresServiceMock();

jest.mock('~sq-server-commons/api/ce', () => ({
  getTasksForComponent: jest.fn().mockResolvedValue({ queue: [] }),
}));

jest.mock('~sq-server-commons/api/components', () => ({
  getComponentData: jest
    .fn()
    .mockResolvedValue({ component: { name: 'component name', analysisDate: '2018-07-30' } }),
}));

jest.mock('~sq-server-commons/queries/mode', () => ({
  useStandardExperienceModeQuery: jest.fn(() => ({
    data: { mode: 'STANDARD_EXPERIENCE', modified: false },
  })),
}));

jest.mock('~sq-server-commons/api/navigation', () => ({
  getComponentNavigation: jest.fn().mockResolvedValue({
    breadcrumbs: [{ key: 'portfolioKey', name: 'portfolio', qualifier: 'VW' }],
    key: 'portfolioKey',
  }),
}));

jest.mock('~sq-server-commons/api/branches', () => ({
  getBranches: jest.fn(),
  getPullRequests: jest.fn(),
}));

jest.mock('~sq-server-commons/api/alm-settings', () => ({
  validateProjectAlmBinding: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../utils/handleRequiredAuthorization', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('~shared/components/hoc/withRouter', () => ({
  __esModule: true,
  ...jest.requireActual('~shared/components/hoc/withRouter'),
}));

const ui = {
  projectTitle: byText('MyProject'),
  projectText: byText('project'),
  portfolioTitle: byText('component name'),
  portfolioText: byText(/portfolio/i),
  overviewPageLink: byText('overview.page'),
  issuesPageLink: byText('issues.page'),
  hotspotsPageLink: byText('layout.security_hotspots'),
  measuresPageLink: byText('layout.measures'),
  codePageLink: byText('code.page'),
  activityPageLink: byText('project_activity.page'),
  projectInfoLink: byText('project.info.title'),
  dashboardNotFound: byText('dashboard.project.not_found'),
  goBackToHomePageLink: byRole('link', { name: 'go_back_to_homepage' }),
};

beforeEach(() => {
  settingsHandler.reset();
  measuresHandler.reset();
  jest.mocked(getBranches).mockReset();
  jest.mocked(getPullRequests).mockReset();
  jest.mocked(getBranches).mockResolvedValue([mockBranch()]);
  jest.mocked(getPullRequests).mockResolvedValue([mockPullRequest({ target: 'dropped-branch' })]);
});

afterEach(() => {
  jest.clearAllMocks();
});

function createManuallyResolvedPromise<T>() {
  let resolvePromise: (value: T) => void = () => undefined;

  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolve: resolvePromise };
}

it('should render the component nav correctly for portfolio', async () => {
  renderComponentContainerAsComponent();
  expect(await ui.portfolioTitle.find()).toBeInTheDocument();

  expect(getInteractiveElement(ui.issuesPageLink.get())).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&id=portfolioKey',
  );

  expect(getInteractiveElement(ui.measuresPageLink.get())).toHaveAttribute(
    'href',
    '/component_measures?id=portfolioKey',
  );
  expect(getInteractiveElement(ui.activityPageLink.get())).toHaveAttribute(
    'href',
    '/project/activity?id=portfolioKey',
  );

  await waitFor(() => {
    expect(getTasksForComponent).toHaveBeenCalledWith('portfolioKey');
  });
});

it('should render the component nav correctly for projects', async () => {
  const component = mockComponent({
    breadcrumbs: [{ key: 'project', name: 'Project', qualifier: ComponentQualifier.Project }],
    key: 'project-key',
    analysisDate: '2018-07-30',
  });

  jest
    .mocked(getComponentNavigation)
    .mockResolvedValueOnce({} as unknown as Awaited<ReturnType<typeof getComponentNavigation>>);

  jest
    .mocked(getComponentData)
    .mockResolvedValueOnce({ component } as unknown as Awaited<
      ReturnType<typeof getComponentData>
    >);

  renderComponentContainerAsComponent();
  expect(await ui.projectTitle.find()).toBeInTheDocument();
  expect(getInteractiveElement(ui.overviewPageLink.get())).toHaveAttribute(
    'href',
    '/dashboard?id=project-key',
  );

  expect(getInteractiveElement(ui.issuesPageLink.get())).toHaveAttribute(
    'href',
    '/project/issues?issueStatuses=OPEN%2CCONFIRMED&id=project-key',
  );

  expect(getInteractiveElement(ui.hotspotsPageLink.get())).toHaveAttribute(
    'href',
    '/security_hotspots?id=project-key',
  );
  expect(getInteractiveElement(ui.measuresPageLink.get())).toHaveAttribute(
    'href',
    '/component_measures?id=project-key',
  );
  expect(getInteractiveElement(ui.codePageLink.get())).toHaveAttribute(
    'href',
    '/code?id=project-key',
  );
  expect(getInteractiveElement(ui.activityPageLink.get())).toHaveAttribute(
    'href',
    '/project/activity?id=project-key',
  );
  expect(getInteractiveElement(ui.projectInfoLink.get())).toHaveAttribute(
    'href',
    '/project/information?id=project-key',
  );
});

it('should be able to change component', async () => {
  const user = userEvent.setup();
  renderComponentContainer();
  expect(await screen.findByText('This is a test component')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'change component' })).toBeInTheDocument();

  expect(byTestId('sidebar-navigation-wrapper').byText('component name').get()).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'change component' }));

  expect(
    byTestId('sidebar-navigation-wrapper').byText('new component name').get(),
  ).toBeInTheDocument();
});

it('should show component not found if it does not exist', async () => {
  jest
    .mocked(getComponentNavigation)
    .mockRejectedValueOnce(new Response(null, { status: HttpStatus.NotFound }));

  renderComponentContainer();

  expect(await ui.dashboardNotFound.find()).toBeInTheDocument();
  expect(ui.goBackToHomePageLink.get()).toBeInTheDocument();
});

it('should show component not found if target branch is not found for fixing pull request', async () => {
  renderComponentContainer('?id=foo&fixedInPullRequest=1001');

  expect(await ui.dashboardNotFound.find()).toBeInTheDocument();
});

it('should wait for the fixed pull request target branch before rendering children', async () => {
  const targetBranch = mockMainBranch({ name: 'main' });
  const projectBreadcrumb = { key: 'foo', name: 'Foo', qualifier: ComponentQualifier.Project };

  const mainNavigation = {
    breadcrumbs: [projectBreadcrumb],
    key: 'foo',
  } as Awaited<ReturnType<typeof getComponentNavigation>>;

  const mainComponent = {
    ancestors: [],
    component: mockComponent({
      breadcrumbs: [projectBreadcrumb],
      key: 'foo',
      name: 'main component',
    }),
  } as Awaited<ReturnType<typeof getComponentData>>;

  const targetNavigation =
    createManuallyResolvedPromise<Awaited<ReturnType<typeof getComponentNavigation>>>();

  const targetComponent =
    createManuallyResolvedPromise<Awaited<ReturnType<typeof getComponentData>>>();

  jest.mocked(getBranches).mockResolvedValueOnce([targetBranch]);

  jest
    .mocked(getPullRequests)
    .mockResolvedValueOnce([mockPullRequest({ key: '1001', target: targetBranch.name })]);

  jest
    .mocked(getComponentNavigation)
    // initial navigation
    .mockResolvedValueOnce(mainNavigation)
    // target-branch navigation
    .mockReturnValueOnce(targetNavigation.promise);

  jest
    .mocked(getComponentData)
    // initial component data
    .mockResolvedValueOnce(mainComponent)
    // initial project component data
    .mockResolvedValueOnce(mainComponent)
    // target-branch component data
    .mockReturnValueOnce(targetComponent.promise)
    // target-branch project component data
    .mockResolvedValueOnce(mainComponent);

  renderComponentContainer('?id=foo&fixedInPullRequest=1001');

  await waitFor(() => {
    expect(getComponentNavigation).toHaveBeenCalledWith({
      branch: targetBranch.name,
      component: 'foo',
      pullRequest: undefined,
    });
  });

  // the target-branch component data is still pending, so the child route must not render yet
  expect(screen.queryByText('This is a test component')).not.toBeInTheDocument();

  targetNavigation.resolve({
    ...mainNavigation,
    branch: targetBranch.name,
  });

  targetComponent.resolve({
    ancestors: [],
    component: mockComponent({
      analysisDate: '2018-01-01',
      breadcrumbs: [projectBreadcrumb],
      key: 'foo',
      name: 'target branch component',
    }),
  } as Awaited<ReturnType<typeof getComponentData>>);

  const testComponent = await screen.findByText('This is a test component');

  expect(testComponent).toBeInTheDocument();
  expect(testComponent).toHaveTextContent('target branch component');
});

it('should keep rendering children when the fixed pull request branch is refetched', async () => {
  const targetBranch = mockMainBranch({ name: 'main' });
  const projectBreadcrumb = { key: 'foo', name: 'Foo', qualifier: ComponentQualifier.Project };
  const pullRequests = [mockPullRequest({ key: '1001', target: targetBranch.name })];

  const branchRefetch = createManuallyResolvedPromise<Awaited<ReturnType<typeof getBranches>>>();

  const mainNavigation = {
    branch: targetBranch.name,
    breadcrumbs: [projectBreadcrumb],
    key: 'foo',
  } as Awaited<ReturnType<typeof getComponentNavigation>>;

  const mainComponent = {
    ancestors: [],
    component: mockComponent({
      analysisDate: '2018-01-01',
      breadcrumbs: [projectBreadcrumb],
      key: 'foo',
      name: 'main component',
    }),
  } as Awaited<ReturnType<typeof getComponentData>>;

  jest
    .mocked(getBranches)
    .mockResolvedValue([targetBranch])
    .mockResolvedValueOnce([targetBranch])
    .mockReturnValueOnce(branchRefetch.promise);

  jest.mocked(getPullRequests).mockResolvedValue(pullRequests);

  jest.mocked(getComponentNavigation).mockResolvedValueOnce(mainNavigation);

  jest
    .mocked(getComponentData)
    .mockResolvedValueOnce(mainComponent)
    .mockResolvedValueOnce(mainComponent);

  renderComponentContainerWithBranchAwareChild('?id=foo&fixedInPullRequest=1001');

  expect(await screen.findByText('branch fetching')).toBeInTheDocument();
  expect(screen.getByText('This is a branch-aware test component')).toBeInTheDocument();

  branchRefetch.resolve([targetBranch]);

  expect(await screen.findByText('branch ready')).toBeInTheDocument();
});

describe('getTasksForComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should reload the component after task progress finished', async () => {
    jest
      .mocked(getTasksForComponent)
      .mockResolvedValueOnce({
        queue: [{ id: 'foo', status: TaskStatuses.InProgress, type: TaskTypes.ViewRefresh }],
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>)
      .mockResolvedValueOnce({
        queue: [],
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    renderComponentContainer();

    // getComponentNavigation is called imidiately after the component is mounted
    expect(getComponentNavigation).toHaveBeenCalledTimes(1);

    jest.runOnlyPendingTimers();

    // we check that setTimeout is not yet set, because it requires getComponentNavigation to finish first (as a microtask)
    expect(jest.getTimerCount()).toBe(0);

    // First round, a pending task in the queue. This should trigger the setTimeout.
    // We need waitFor because getComponentNavigation is not done yet and it is waiting to be run as a microtask
    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    // getTasksForComponent updated the tasks, which triggers the setTimeout
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    // we run the timer to trigger the next getTasksForComponent call
    jest.runOnlyPendingTimers();

    // Second round, the queue is now empty. This should trigger the component to reload.
    expect(getTasksForComponent).toHaveBeenCalledTimes(2);

    // Since the set of tasks is changed the component fetching is triggered
    // we need waitFor because getTasksForComponent is triggered, but not yet done, and it is waiting to be run as a microtask
    await waitFor(() => {
      expect(getComponentNavigation).toHaveBeenCalledTimes(2);
    });

    // since waitFor waited for all microtasks and state changes getTasksForComponent was called as well because of component change.
    expect(getTasksForComponent).toHaveBeenCalledTimes(3);

    // Make sure the timeout was cleared. It should not be called again.
    expect(jest.getTimerCount()).toBe(0);
  });

  it('should reload the component after task progress finished, and moves straight to current', async () => {
    jest.mocked(getComponentData).mockResolvedValueOnce({
      component: { key: 'bar' },
    } as unknown as Awaited<ReturnType<typeof getComponentData>>);

    jest
      .mocked(getTasksForComponent)
      .mockResolvedValueOnce({ queue: [] } as unknown as Awaited<
        ReturnType<typeof getTasksForComponent>
      >)
      .mockResolvedValueOnce({
        queue: [],
        current: { id: 'foo', status: TaskStatuses.Success, type: TaskTypes.AppRefresh },
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    renderComponentContainer();

    // getComponentNavigation is called imidiately after the component is mounted
    expect(getComponentNavigation).toHaveBeenCalledTimes(1);

    // First round, no tasks in queue. This should trigger the setTimeout.
    // We need waitFor because getComponentNavigation is not done yet and it is waiting to be run as a microtask
    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    // Despite the fact that we don't have any tasks in the queue, the component.analysisDate is undefined, so we trigger setTimeout
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    jest.runOnlyPendingTimers();

    // Second round, nothing in the queue, BUT a success task is current. This
    // means the queue was processed too quick for us to see, and we didn't see
    // any pending tasks in the queue. So we immediately load the component again.
    expect(getTasksForComponent).toHaveBeenCalledTimes(2);

    // Since the set of tasks is changed the component fetching is triggered
    // we need waitFor because getTasksForComponent is triggered, but not yet done, and it is waiting to be run as a microtask
    await waitFor(() => {
      expect(getComponentNavigation).toHaveBeenCalledTimes(2);
    });

    // Make sure the timeout was cleared
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);

    // The status API call will be called 1 final time after the component is
    // fully loaded, so the total will be 3.
    expect(getTasksForComponent).toHaveBeenCalledTimes(3);
  });

  it('should only fully load a non-empty component once', async () => {
    jest.mocked(getComponentData).mockResolvedValueOnce({
      component: { key: 'bar', analysisDate: '2019-01-01' },
    } as unknown as Awaited<ReturnType<typeof getComponentData>>);

    jest.mocked(getTasksForComponent).mockResolvedValueOnce({
      queue: [],
      current: { id: 'foo', status: TaskStatuses.Success, type: TaskTypes.Report },
    } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    renderComponentContainer();

    expect(getComponentNavigation).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    // Since the component has analysisDate, and the queue is empty, the setTimeout will not be triggered
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);
    expect(getTasksForComponent).toHaveBeenCalledTimes(1);
  });

  it('should only fully reload a non-empty component if there was previously some task in progress', async () => {
    jest.mocked(getComponentData).mockResolvedValueOnce({
      component: { key: 'bar', analysisDate: '2019-01-01' },
    } as unknown as Awaited<ReturnType<typeof getComponentData>>);

    jest
      .mocked(getTasksForComponent)
      .mockResolvedValueOnce({
        queue: [{ id: 'foo', status: TaskStatuses.InProgress, type: TaskTypes.AppRefresh }],
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>)
      .mockResolvedValueOnce({
        queue: [],
        current: { id: 'foo', status: TaskStatuses.Success, type: TaskTypes.AppRefresh },
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    renderComponentContainer();

    // First round, a pending task in the queue. This should trigger a reload of the
    // status endpoint.
    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    expect(jest.getTimerCount()).toBeGreaterThan(0);
    jest.runOnlyPendingTimers();

    // Second round, nothing in the queue, and a success task is current. This
    // implies the current task was updated, and previously we displayed some information
    // about a pending task. This new information must prompt the component to reload
    // all data.
    expect(getTasksForComponent).toHaveBeenCalledTimes(2);

    // The component was correctly re-loaded.
    await waitFor(() => {
      expect(getComponentNavigation).toHaveBeenCalledTimes(2);
    });

    // Make sure the timeout was cleared.
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);

    // The status API call will be called 1 final time after the component is
    // fully loaded, so the total will be 3.
    expect(getTasksForComponent).toHaveBeenCalledTimes(3);
  });
});

describe('redirects', () => {
  it('should redirect if the user has no access', async () => {
    jest
      .mocked(getComponentNavigation)
      .mockRejectedValueOnce(new Response(null, { status: HttpStatus.Forbidden }));

    renderComponentContainer();

    await waitFor(() => {
      expect(handleRequiredAuthorization).toHaveBeenCalled();
    });
  });

  it('should redirect to portfolio when using dashboard path', async () => {
    renderComponentContainer('dashboard?id=foo', '/dashboard');

    // The component should redirect from /dashboard to /portfolio route
    // We need to wait for the navigation breadcrumb
    expect(await ui.portfolioText.find()).toBeInTheDocument(); // breadcrumb link text + route div
  });

  it('should fix broken query parameters from GH UI', async () => {
    renderComponentContainer('?id=foo&pullRequest=4?pr=123', '/dashboard');

    expect(await screen.findByText('This is a test component')).toBeInTheDocument();
    expect(ui.dashboardNotFound.query()).not.toBeInTheDocument();
  });

  it('should remove the branch query parameter when branch supoort is not enabled', async () => {
    renderComponentContainer('?id=foo&branch=branch2', '/', []);

    expect(getComponentData).toHaveBeenCalledWith({
      branch: undefined,
      component: 'foo',
      pullRequest: undefined,
    });

    expect(await screen.findByText('main branch')).toBeInTheDocument();
  });
});

it.each([
  [ComponentQualifier.Application],
  [ComponentQualifier.Portfolio],
  [ComponentQualifier.SubPortfolio],
])(
  'should not care about PR decoration settings for %s',
  async (componentQualifier: ComponentQualifier) => {
    const component = mockComponent({
      breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier: componentQualifier }],
    });

    jest
      .mocked(getComponentNavigation)
      .mockResolvedValueOnce({} as unknown as Awaited<ReturnType<typeof getComponentNavigation>>);

    jest
      .mocked(getComponentData)
      .mockResolvedValueOnce({ component } as unknown as Awaited<
        ReturnType<typeof getComponentData>
      >);

    renderComponentContainer();

    await waitFor(() => {
      expect(validateProjectAlmBinding).not.toHaveBeenCalled();
    });
  },
);

it('should return expected results from isSameBranch', () => {
  expect(isSameBranch(mockTask())).toBe(true);
  expect(isSameBranch(mockTask({ branch: 'branch' }), 'branch')).toBe(true);
  expect(isSameBranch(mockTask({ pullRequest: 'pr' }), undefined, 'pr')).toBe(true);
});

describe('tutorials', () => {
  it('should redirect to project main branch dashboard from tutorials when receiving new related scan report', async () => {
    const componentKey = 'foo-component';

    jest.mocked(getComponentData).mockResolvedValue({
      ancestors: [],
      component: {
        key: componentKey,
        name: 'component name',
        qualifier: ComponentQualifier.Project,
        visibility: Visibility.Public,
      },
    });

    jest
      .mocked(getTasksForComponent)
      .mockResolvedValueOnce({ queue: [] })
      .mockResolvedValue({
        queue: [{ status: TaskStatuses.InProgress, type: TaskTypes.Report }],
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    const mockedReplace = jest.fn();

    jest.spyOn(withRouter, 'useRouter').mockReturnValue({
      replace: mockedReplace,
      push: jest.fn(),
      navigate: jest.fn(),
      searchParams: new URLSearchParams(),
      setSearchParams: jest.fn(),
    });

    renderComponentContainer(`tutorials?id=${componentKey}`, '/');

    jest.useFakeTimers();

    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    expect(mockedReplace).not.toHaveBeenCalled();

    // Since component.analysisDate is undefined we trigger setTimeout
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    jest.runOnlyPendingTimers();
    expect(getTasksForComponent).toHaveBeenCalledTimes(2);

    // Since we have condition (component.analysisDate is undefined) that will lead to endless loop,
    // it is easier to enable realTimers to avoid act() warnings.
    jest.useRealTimers();

    // getTasksForComponent is called but not finished yet, so we need to wait for it to finish
    await waitFor(() => {
      expect(mockedReplace).toHaveBeenCalledWith(getProjectUrl(componentKey));
    });
  });

  it('should redirect to project branch dashboard from tutorials when receiving new related scan report', async () => {
    const componentKey = 'foo-component';
    const branchName = 'fooBranch';

    jest.mocked(getComponentData).mockResolvedValue({
      ancestors: [],
      component: {
        key: componentKey,
        name: 'component name',
        qualifier: ComponentQualifier.Project,
        visibility: Visibility.Public,
      },
    });

    jest
      .mocked(getTasksForComponent)
      .mockResolvedValueOnce({ queue: [] })
      .mockResolvedValue({
        queue: [{ branch: branchName, status: TaskStatuses.InProgress, type: TaskTypes.Report }],
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    const mockedReplace = jest.fn();

    jest.spyOn(withRouter, 'useRouter').mockReturnValue({
      replace: mockedReplace,
      push: jest.fn(),
      navigate: jest.fn(),
      searchParams: new URLSearchParams(),
      setSearchParams: jest.fn(),
    });

    jest.useFakeTimers();

    renderComponentContainer(`tutorials?id=${componentKey}`, '/');

    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    expect(mockedReplace).not.toHaveBeenCalled();

    // Since component.analysisDate is undefined we trigger setTimeout
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    jest.runOnlyPendingTimers();
    expect(getTasksForComponent).toHaveBeenCalledTimes(2);

    // Since we have condition (component.analysisDate is undefined) that will lead to endless loop,
    // it is easier to enable realTimers to avoid act() warnings.
    jest.useRealTimers();

    // getTasksForComponent is called but not finished yet, so we need to wait for it to finish
    await waitFor(() => {
      expect(mockedReplace).toHaveBeenCalledWith(getProjectUrl(componentKey, branchName));
    });
  });

  it('should redirect to project pull request dashboard from tutorials when receiving new related scan report', async () => {
    const componentKey = 'foo-component';
    const pullRequestKey = 'fooPR';

    jest.mocked(getComponentData).mockResolvedValue({
      ancestors: [],
      component: {
        key: componentKey,
        name: 'component name',
        qualifier: ComponentQualifier.Project,
        visibility: Visibility.Public,
      },
    });

    jest
      .mocked(getTasksForComponent)
      .mockResolvedValueOnce({ queue: [] })
      .mockResolvedValue({
        queue: [
          { pullRequest: pullRequestKey, status: TaskStatuses.InProgress, type: TaskTypes.Report },
        ],
      } as unknown as Awaited<ReturnType<typeof getTasksForComponent>>);

    const mockedReplace = jest.fn();

    jest.spyOn(withRouter, 'useRouter').mockReturnValue({
      replace: mockedReplace,
      push: jest.fn(),
      navigate: jest.fn(),
      searchParams: new URLSearchParams(),
      setSearchParams: jest.fn(),
    });

    jest.useFakeTimers();

    renderComponentContainer(`tutorials?id=${componentKey}`, '/');

    await waitFor(() => {
      expect(getTasksForComponent).toHaveBeenCalledTimes(1);
    });

    expect(mockedReplace).not.toHaveBeenCalled();

    // Since component.analysisDate is undefined we trigger setTimeout
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    jest.runOnlyPendingTimers();
    expect(getTasksForComponent).toHaveBeenCalledTimes(2);

    // Since we have condition (component.analysisDate is undefined) that will lead to endless loop,
    // it is easier to enable realTimers to avoid act() warnings.
    jest.useRealTimers();

    // getTasksForComponent is called but not finished yet, so we need to wait for it to finish
    await waitFor(() => {
      expect(mockedReplace).toHaveBeenCalledWith(getPullRequestUrl(componentKey, pullRequestKey));
    });
  });
});

function renderComponentContainerAsComponent() {
  return renderComponent(<ComponentContainer />, '/?id=foo', {
    featureList: [Feature.BranchSupport],
  });
}

function renderComponentContainer(
  navigateTo = '?id=foo',
  path = '/',
  features = [Feature.BranchSupport],
) {
  renderAppRoutes(
    path,
    () => (
      <Route element={<ComponentContainer />}>
        <Route element={<TestComponent />} path="*" />
        <Route element={<div>portfolio</div>} path="portfolio" />
        <Route element={<div>project</div>} path="dashboard" />
      </Route>
    ),
    {
      navigateTo,
      featureList: features,
    },
  );
}

function renderComponentContainerWithBranchAwareChild(navigateTo = '?id=foo') {
  renderAppRoutes(
    '/',
    () => (
      <Route element={<ComponentContainer />}>
        <Route element={<BranchAwareTestComponent />} path="*" />
      </Route>
    ),
    {
      featureList: [Feature.BranchSupport],
      navigateTo,
    },
  );
}

function TestComponent() {
  const { component, onComponentChange } = useContext(ComponentContext);
  const { query } = withRouter.useLocation();

  return (
    <div>
      This is a test component
      <span>{component?.name}</span>
      <span>{query.branch ?? 'main branch'}</span>
      <button
        onClick={() => {
          onComponentChange(
            mockComponent({
              name: 'new component name',
              breadcrumbs: [
                { key: 'portfolioKey', name: 'portfolio', qualifier: ComponentQualifier.Portfolio },
              ],
            }),
          );
        }}
        type="button"
      >
        change component
      </button>
    </div>
  );
}

interface BranchAwareTestComponentInnerProps extends WithBranchLikesProps {
  component?: Component;
}

function BranchAwareTestComponentInner({
  isFetchingBranch,
}: Readonly<BranchAwareTestComponentInnerProps>) {
  return (
    <div>
      <span>This is a branch-aware test component</span>

      <span>{isFetchingBranch ? 'branch fetching' : 'branch ready'}</span>
    </div>
  );
}

const BranchAwareTestComponentWithBranchLikes = withBranchLikes(BranchAwareTestComponentInner);

function BranchAwareTestComponent() {
  const { component } = useContext(ComponentContext);

  return <BranchAwareTestComponentWithBranchLikes component={component} />;
}

/* eslint-disable testing-library/no-node-access -- The standalone sidebar is aria-hidden. */
function getInteractiveElement(element: HTMLElement) {
  // The standalone sidebar is aria-hidden, so role queries cannot reach its interactive parent.
  const interactiveElement = element.closest('a, button');
  if (interactiveElement === null) {
    throw new Error('Expected navigation label to have an interactive parent');
  }
  return interactiveElement;
}
/* eslint-enable testing-library/no-node-access */

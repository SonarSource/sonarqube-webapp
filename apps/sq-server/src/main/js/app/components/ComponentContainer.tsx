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

import { Layout, Spinner } from '@sonarsource/echoes-react';
import { differenceBy } from 'lodash';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Navigate, Outlet } from 'react-router-dom';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { CenteredLayout } from '~design-system';
import { useLocation, useRouter } from '~shared/components/hoc/withRouter';
import { isFile, isPortfolioLike } from '~shared/helpers/component';
import { isDefined } from '~shared/helpers/types';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { HttpStatus } from '~shared/types/request';
import { getTasksForComponent } from '~sq-server-commons/api/ce';
import { getComponentData } from '~sq-server-commons/api/components';
import { getComponentNavigation } from '~sq-server-commons/api/navigation';
import {
  useAvailableFeatures,
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import { ComponentContext } from '~sq-server-commons/context/componentContext/ComponentContext';
import { getPortfolioUrl, getProjectUrl, getPullRequestUrl } from '~sq-server-commons/helpers/urls';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { Branch } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { Task, TaskStatuses, TaskTypes } from '~sq-server-commons/types/tasks';
import { Component } from '~sq-server-commons/types/types';
import handleRequiredAuthorization from '../utils/handleRequiredAuthorization';
import ComponentContainerNotFound from './ComponentContainerNotFound';
import { ComponentNav } from './nav/component/ComponentNav';
import {
  LegacyComponentNav,
  LegacyComponentNavCompatibleWithNewLayout,
} from './nav/component/legacy/ComponentNav';

const FETCH_STATUS_WAIT_TIME = 3000;

function ComponentContainer({ hasFeature }: Readonly<WithAvailableFeaturesProps>) {
  const watchStatusTimer = React.useRef<number>();
  const legacyComponentNavAnchor = React.useRef<Element | null>(); // undefined means it wansn't loaded yet, if not found it will be null
  const oldTasksInProgress = React.useRef<Task[]>();
  const oldCurrentTask = React.useRef<Task>();
  const {
    query: { id: key, branch, pullRequest, fixedInPullRequest },
    pathname,
  } = useLocation();
  const router = useRouter();
  const intl = useIntl();
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();

  const [component, setComponent] = React.useState<Component>();
  const [projectComponent, setProjectComponent] = React.useState<Component>();
  const [currentTask, setCurrentTask] = React.useState<Task>();
  const [tasksInProgress, setTasksInProgress] = React.useState<Task[]>();
  const [loading, setLoading] = React.useState(true);
  const [isPending, setIsPending] = React.useState(false);
  const { data: branchLike, isFetching } = useCurrentBranchQuery(
    fixedInPullRequest ? component : undefined,
  );

  const componentWithTags = React.useMemo(() => {
    return component
      ? {
          tags: projectComponent?.tags ?? [],
          ...component,
        }
      : undefined;
  }, [component, projectComponent]);

  /* If we have no branch support, redirect to main branch */
  React.useEffect(() => {
    if (!hasFeature(Feature.BranchSupport) && isDefined(branch)) {
      router.setSearchParams((params) => {
        params.delete('branch');
        return params;
      });
    }
  }, [branch, hasFeature, router]);

  //prefetch isStandardExperienceMode
  useStandardExperienceModeQuery();

  const isInTutorials = pathname.includes('tutorials');

  const fetchComponent = React.useCallback(
    async (branchName?: string) => {
      // Only show loader if we're changing components
      if (component?.key !== key) {
        setLoading(true);
      }
      let projectComponentWithQualifier;
      let componentWithQualifier;

      const targetBranch = hasFeature(Feature.BranchSupport)
        ? ((branch ?? branchName) as string | undefined)
        : undefined;

      try {
        const [nav, { component }, { component: projComponent }] = await Promise.all([
          getComponentNavigation({ component: key, branch: targetBranch, pullRequest }),
          getComponentData({ component: key, branch: targetBranch, pullRequest }),
          getComponentData({ component: key }),
        ]);

        componentWithQualifier = addQualifier({ ...nav, ...component });
        projectComponentWithQualifier = addQualifier({
          ...nav,
          ...projComponent,
        });
      } catch (e) {
        if (e instanceof Response && e.status === HttpStatus.Forbidden) {
          handleRequiredAuthorization();
        }
      } finally {
        setComponent(componentWithQualifier);
        setProjectComponent(projectComponentWithQualifier);
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, branch, pullRequest],
  );

  const fetchStatus = React.useCallback(
    async (componentKey: string) => {
      try {
        const { current, queue } = await getTasksForComponent(componentKey);
        const newCurrentTask = getCurrentTask(current, branch, pullRequest, isInTutorials);
        const pendingTasks = getReportRelatedPendingTasks(
          queue,
          branch,
          pullRequest,
          isInTutorials,
        );
        const newTasksInProgress = getInProgressTasks(pendingTasks);

        const isPending = pendingTasks.some((task) => task.status === TaskStatuses.Pending);

        setIsPending(isPending);
        setCurrentTask(newCurrentTask);
        setTasksInProgress(newTasksInProgress);
      } catch {
        // noop
      }
    },
    [branch, isInTutorials, pullRequest],
  );

  const handleComponentChange = React.useCallback(
    (changes: Partial<Component>) => {
      if (!component) {
        return;
      }

      if (changes.tags && projectComponent) {
        setProjectComponent({
          ...projectComponent,
          tags: changes.tags,
        });
      }

      setComponent({ ...component, ...changes });
    },
    [component, projectComponent],
  );

  React.useEffect(() => {
    if (key) {
      fetchComponent();
    }
  }, [key, fetchComponent]);

  // Fetch status when component has changed
  React.useEffect(() => {
    if (component) {
      fetchStatus(component.key);
    }
  }, [component, fetchStatus]);

  // Refetch status when tasks in progress/current task have changed
  // Or refetch component based on computeHasUpdatedTasks
  React.useEffect(() => {
    // Stop here if tasks are not fetched yet
    if (!tasksInProgress) {
      return;
    }

    const tasks = tasksInProgress ?? [];
    const hasUpdatedTasks = computeHasUpdatedTasks(
      oldTasksInProgress.current,
      tasks,
      oldCurrentTask.current,
      currentTask,
      component,
    );

    if (isInTutorials && hasUpdatedTasks) {
      const { branch: branchName, pullRequest: pullRequestKey } = currentTask ?? tasks[0];
      // coerce to string since RawQuery values are any type
      // this could probably be done better farther above in the code
      const projectKey = key as string;

      let url;
      if (pullRequestKey !== undefined) {
        url = getPullRequestUrl(projectKey, pullRequestKey);
      } else if (branchName !== undefined) {
        url = getProjectUrl(projectKey, branchName);
      } else {
        url = getProjectOverviewUrl(projectKey);
      }

      router.replace(url);
    }

    if (needsAnotherCheck(hasUpdatedTasks, component, tasks)) {
      // Refresh the status as long as there are tasks in progress or no analysis
      window.clearTimeout(watchStatusTimer.current);

      watchStatusTimer.current = window.setTimeout(() => {
        fetchStatus(component?.key ?? '');
      }, FETCH_STATUS_WAIT_TIME);
    } else if (hasUpdatedTasks) {
      fetchComponent();
    }

    oldCurrentTask.current = currentTask;
    oldTasksInProgress.current = tasks;
  }, [
    component,
    currentTask,
    fetchComponent,
    fetchStatus,
    isInTutorials,
    key,
    router,
    tasksInProgress,
  ]);

  // Refetch component when a new branch is analyzed
  React.useEffect(() => {
    if (branchLike?.analysisDate && !component?.analysisDate) {
      fetchComponent();
    }
  }, [branchLike, component, fetchComponent]);

  // Refetch component when target branch for fixing pull request is fetched
  React.useEffect(() => {
    const branch = branchLike as Branch;

    if (fixedInPullRequest && !isFetching && branch && component?.branch !== branch.name) {
      fetchComponent(branch.name);
    }
  }, [fetchComponent, component, branchLike, fixedInPullRequest, isFetching]);

  // Redirects
  React.useEffect(() => {
    /*
     * There used to be a redirect from /dashboard to /portfolio which caused issues.
     * Links should be fixed to not rely on this redirect, but:
     * This is a fail-safe in case there are still some faulty links remaining.
     */
    if (pathname.includes('dashboard') && component && isPortfolioLike(component.qualifier)) {
      router.replace(getPortfolioUrl(component.key));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component]);

  // Clear timer on unmount
  React.useEffect(() => {
    return () => {
      window.clearTimeout(watchStatusTimer.current);
      watchStatusTimer.current = undefined;
    };
  }, []);

  // Set portal anchor on mount
  React.useEffect(() => {
    legacyComponentNavAnchor.current = document.querySelector('#component-nav-portal');
  }, []);

  const isInProgress = tasksInProgress && tasksInProgress.length > 0;

  const componentProviderProps = React.useMemo(
    () => ({
      component: componentWithTags,
      currentTask,
      isInProgress,
      isPending,
      onComponentChange: handleComponentChange,
      fetchComponent,
    }),
    [
      componentWithTags,
      currentTask,
      isInProgress,
      isPending,
      handleComponentChange,
      fetchComponent,
    ],
  );

  // Show not found component when, after loading:
  // - component is not found
  // - target branch is not found (for pull requests fixing issues in a branch)
  if (!loading && (!component || (fixedInPullRequest && !isFetching && !branchLike))) {
    return <ComponentContainerNotFound isPortfolioLike={pathname.includes('portfolio')} />;
  }

  // TODO drop this once project scope migration is done
  const isLegacyLayout = legacyComponentNavAnchor.current !== null;
  if (isLegacyLayout) {
    return (
      <>
        <Helmet
          defer={false}
          titleTemplate={intl.formatMessage(
            { id: 'page_title.template.with_instance' },
            { project: component?.name ?? '' },
          )}
        />
        {component &&
          !isFile(component.qualifier) &&
          legacyComponentNavAnchor.current &&
          /* Use a portal to fix positioning until we can fully review the layout */
          createPortal(
            <LegacyComponentNav
              component={component}
              isInProgress={isInProgress}
              isPending={isPending}
            />,
            legacyComponentNavAnchor.current,
          )}
        {loading ? (
          <CenteredLayout>
            <Spinner className="sw-mt-10" />
          </CenteredLayout>
        ) : (
          <ComponentContext.Provider value={componentProviderProps}>
            <Outlet />
          </ComponentContext.Provider>
        )}
      </>
    );
  }

  return (
    <>
      <Helmet
        defer={false}
        titleTemplate={intl.formatMessage(
          { id: 'page_title.template.with_instance' },
          { project: component?.name ?? '' },
        )}
      />
      {frontEndEngineeringEnableSidebarNavigation && component && !isFile(component.qualifier) && (
        <ComponentNav component={component} />
      )}
      <Layout.ContentGrid>
        {!frontEndEngineeringEnableSidebarNavigation &&
          component &&
          !isFile(component.qualifier) && (
            <LegacyComponentNavCompatibleWithNewLayout
              component={component}
              isInProgress={isInProgress}
              isPending={isPending}
            />
          )}
        {loading ? (
          <Layout.PageGrid>
            <Layout.PageContent>
              <Spinner className="sw-mt-10" />
            </Layout.PageContent>
          </Layout.PageGrid>
        ) : (
          <ComponentContext.Provider value={componentProviderProps}>
            <Outlet />
          </ComponentContext.Provider>
        )}
      </Layout.ContentGrid>
    </>
  );
}

function addQualifier(component: Component) {
  return {
    ...component,
    qualifier: component.breadcrumbs[component.breadcrumbs.length - 1].qualifier,
  };
}

function needsAnotherCheck(
  hasUpdatedTasks: boolean,
  component: Component | undefined,
  newTasksInProgress: Task[],
) {
  return (
    !hasUpdatedTasks && component && (newTasksInProgress.length > 0 || !component.analysisDate)
  );
}

export function isSameBranch(
  task: Pick<Task, 'branch' | 'pullRequest'>,
  branch?: string,
  pullRequest?: string,
) {
  if (!branch?.length && !pullRequest?.length) {
    return !task.branch && !task.pullRequest;
  }

  if (pullRequest?.length) {
    return pullRequest === task.pullRequest;
  }

  return branch === task.branch;
}

function getCurrentTask(
  current?: Task,
  branch?: string,
  pullRequest?: string,
  canBeDifferentBranchLike = false,
) {
  if (!current || !isReportRelatedTask(current)) {
    return undefined;
  }

  return current.status === TaskStatuses.Failed ||
    canBeDifferentBranchLike ||
    isSameBranch(current, branch, pullRequest)
    ? current
    : undefined;
}

function getReportRelatedPendingTasks(
  pendingTasks: Task[],
  branch?: string,
  pullRequest?: string,
  canBeDifferentBranchLike = false,
) {
  return pendingTasks.filter(
    (task) =>
      isReportRelatedTask(task) &&
      (canBeDifferentBranchLike || isSameBranch(task, branch, pullRequest)),
  );
}

function getInProgressTasks(pendingTasks: Task[]) {
  return pendingTasks.filter((task) => task.status === TaskStatuses.InProgress);
}

function isReportRelatedTask(task: Task) {
  return [TaskTypes.AppRefresh, TaskTypes.Report, TaskTypes.ViewRefresh].includes(task.type);
}

function computeHasUpdatedTasks(
  tasksInProgress: Task[] | undefined,
  newTasksInProgress: Task[],
  currentTask: Task | undefined,
  newCurrentTask: Task | undefined,
  component: Component | undefined,
) {
  const progressHasChanged = Boolean(
    tasksInProgress &&
      (newTasksInProgress.length !== tasksInProgress.length ||
        differenceBy(newTasksInProgress, tasksInProgress, 'id').length > 0),
  );

  const currentTaskHasChanged = Boolean(
    (!currentTask && newCurrentTask) ||
      (currentTask && newCurrentTask && currentTask.id !== newCurrentTask.id),
  );

  if (progressHasChanged) {
    return true;
  } else if (currentTaskHasChanged && component) {
    // We return true if:
    // - there was no prior analysis date (means this is an empty project, and
    //   a new analysis came in)
    // - OR, there was a prior analysis date (non-empty project) AND there were
    //   some tasks in progress before
    return (
      Boolean(!component.analysisDate) || Boolean(component.analysisDate && tasksInProgress?.length)
    );
  }
  return false;
}

export default function ContainerWithRedirects() {
  const { hasFeature } = useAvailableFeatures();
  const { pathname, search } = useLocation();

  // GH UI adds extra query params in a breaking format like '?param1=value1?ghPrId=123'
  // we remove gh pr key and everything after it
  const splitParams = search.split('?');
  if (splitParams[2]) {
    return <Navigate replace to={{ pathname, search: splitParams[1] }} />;
  }

  return <ComponentContainer hasFeature={hasFeature} />;
}

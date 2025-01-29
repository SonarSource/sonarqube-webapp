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

import { Spinner, Text } from '@sonarsource/echoes-react';
import { debounce } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { Banner, LargeCenteredLayout, PageContentFontWrapper } from '~design-system';
import {
  cancelAllTasks,
  cancelTask as cancelTaskAPI,
  getActivity,
  getStatus,
  getTypes,
} from '~sq-server-shared/api/ce';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import ListFooter from '~sq-server-shared/components/controls/ListFooter';
import Suggestions from '~sq-server-shared/components/embed-docs-modal/Suggestions';
import withComponentContext from '~sq-server-shared/context/componentContext/withComponentContext';
import { toShortISO8601String } from '~sq-server-shared/helpers/dates';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { translate } from '~sq-server-shared/helpers/l10n';
import { parseAsDate } from '~sq-server-shared/helpers/query';
import { withRouter } from '~sq-server-shared/sonar-aligned/components/hoc/withRouter';
import { Location, RawQuery, Router } from '~sq-server-shared/sonar-aligned/types/router';
import { Task, TaskStatuses, TaskTypes } from '~sq-server-shared/types/tasks';
import { Component, Paging } from '~sq-server-shared/types/types';
import { CURRENTS, DEBOUNCE_DELAY, DEFAULT_FILTERS, PAGE_SIZE } from '../constants';
import { Query, mapFiltersToParameters, updateTask } from '../utils';
import Header from './Header';
import Search from './Search';
import Stats from './Stats';
import Tasks from './Tasks';

interface Props {
  component?: Component;
  location: Location;
  router: Router;
}

interface State {
  failingCount: number;
  loading: boolean;
  pagination: Paging;
  pendingCount: number;
  pendingTime?: number;
  tasks: Task[];
  types?: string[];
}

export class BackgroundTasksApp extends React.PureComponent<Props, State> {
  loadTasksDebounced: () => void;
  mounted = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      pagination: { pageIndex: 1, pageSize: PAGE_SIZE, total: 0 },
      failingCount: 0,
      loading: true,
      pendingCount: 0,
      tasks: [],
    };
    this.loadTasksDebounced = debounce(this.loadTasks, DEBOUNCE_DELAY);
  }

  componentDidMount() {
    this.mounted = true;

    getTypes().then(
      (types) => {
        this.setState({ types });
        this.loadTasks();
      },
      () => {},
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.component !== this.props.component ||
      prevProps.location !== this.props.location
    ) {
      this.loadTasksDebounced();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  stopLoading = () => {
    if (this.mounted) {
      this.setState({ loading: false });
    }
  };

  loadMoreTasks = () => {
    const { pagination } = this.state;
    this.loadTasks(pagination.pageIndex + 1);
  };

  loadTasks = (page = 1) => {
    this.setState({ loading: true });

    const status = this.props.location.query.status || DEFAULT_FILTERS.status;
    const taskType = this.props.location.query.taskType || DEFAULT_FILTERS.taskType;
    const currents = this.props.location.query.currents || DEFAULT_FILTERS.currents;
    const minSubmittedAt =
      this.props.location.query.minSubmittedAt || DEFAULT_FILTERS.minSubmittedAt;
    const maxExecutedAt = this.props.location.query.maxExecutedAt || DEFAULT_FILTERS.maxExecutedAt;
    const query = this.props.location.query.query || DEFAULT_FILTERS.query;

    const filters = { status, taskType, currents, minSubmittedAt, maxExecutedAt, query };
    const parameters = mapFiltersToParameters(filters);

    if (this.props.component) {
      parameters.component = this.props.component.key;
    }

    parameters.p = page;
    parameters.ps = PAGE_SIZE;

    Promise.all([getActivity(parameters), getStatus(parameters.component)]).then(
      ([{ tasks: newTasks, paging }, { failing, pending, pendingTime }]) => {
        if (this.mounted) {
          this.setState(({ tasks }) => ({
            failingCount: failing,
            loading: false,
            pendingCount: pending,
            pendingTime,
            tasks: page === 1 ? newTasks : [...tasks, ...newTasks],
            pagination: paging,
          }));
        }
      },
      this.stopLoading,
    );
  };

  handleFilterUpdate = (nextState: Partial<Query>) => {
    const nextQuery: RawQuery = { ...this.props.location.query, ...nextState };

    // remove defaults
    Object.keys(DEFAULT_FILTERS).forEach((key: keyof typeof DEFAULT_FILTERS) => {
      if (nextQuery[key] === DEFAULT_FILTERS[key]) {
        delete nextQuery[key];
      }
    });

    if (nextQuery.minSubmittedAt) {
      nextQuery.minSubmittedAt = toShortISO8601String(nextQuery.minSubmittedAt);
    }

    if (nextQuery.maxExecutedAt) {
      nextQuery.maxExecutedAt = toShortISO8601String(nextQuery.maxExecutedAt);
    }

    this.props.router.push({
      pathname: this.props.location.pathname,
      query: nextQuery,
    });
  };

  handleCancelTask = (task: Task) => {
    this.setState({ loading: true });

    return cancelTaskAPI(task.id).then((nextTask) => {
      if (this.mounted) {
        this.setState((state) => ({
          tasks: updateTask(state.tasks, nextTask),
          loading: false,
        }));
      }
    }, this.stopLoading);
  };

  handleFilterTask = (task: Task) => {
    this.handleFilterUpdate({ query: task.componentKey });
  };

  handleShowFailing = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    this.handleFilterUpdate({
      ...DEFAULT_FILTERS,
      status: TaskStatuses.Failed,
      currents: CURRENTS.ONLY_CURRENTS,
    });
  };

  handleCancelAllPending = () => {
    this.setState({ loading: true });

    cancelAllTasks().then(() => {
      if (this.mounted) {
        this.loadTasks();
      }
    }, this.stopLoading);
  };

  isFailedTaskWithProjectDataReload = () => {
    const { tasks } = this.state;
    return tasks.some((task) => {
      return task.status === TaskStatuses.Failed && task.type === TaskTypes.IssueSync;
    });
  };

  render() {
    const { component, location } = this.props;
    const { loading, pagination, types, tasks } = this.state;

    const status = location.query.status || DEFAULT_FILTERS.status;
    const taskType = location.query.taskType || DEFAULT_FILTERS.taskType;
    const currents = location.query.currents || DEFAULT_FILTERS.currents;
    const minSubmittedAt = parseAsDate(location.query.minSubmittedAt);
    const maxExecutedAt = parseAsDate(location.query.maxExecutedAt);
    const query = location.query.query ?? '';

    return (
      <LargeCenteredLayout id="background-tasks">
        <PageContentFontWrapper className="sw-my-4 sw-typo-default">
          <Suggestions suggestion={DocLink.BackgroundTasks} />
          <Helmet defer={false} title={translate('background_tasks.page')} />
          <Spinner isLoading={!types}>
            <Header component={component} />
            {this.isFailedTaskWithProjectDataReload() && (
              <Banner className="sw-mt-8" variant="warning">
                <Text>
                  <FormattedMessage
                    id="background_tasks.retry_failed_tasks"
                    values={{
                      link: (text) => (
                        <DocumentationLink
                          shouldOpenInNewTab
                          to={DocLink.BackgroundTasksReIndexingSingleProject}>
                          {text}
                        </DocumentationLink>
                      ),
                    }}
                  />
                </Text>
              </Banner>
            )}
            <Stats
              component={component}
              failingCount={this.state.failingCount}
              onCancelAllPending={this.handleCancelAllPending}
              onShowFailing={this.handleShowFailing}
              pendingCount={this.state.pendingCount}
              pendingTime={this.state.pendingTime}
            />

            <Search
              component={component}
              currents={currents}
              loading={loading}
              maxExecutedAt={maxExecutedAt}
              minSubmittedAt={minSubmittedAt}
              onFilterUpdate={this.handleFilterUpdate}
              onReload={this.loadTasksDebounced}
              query={query}
              status={status}
              taskType={taskType}
              types={types ?? []}
            />

            <Tasks
              component={component}
              onCancelTask={this.handleCancelTask}
              onFilterTask={this.handleFilterTask}
              tasks={tasks}
            />

            <ListFooter
              count={tasks.length}
              loadMore={this.loadMoreTasks}
              loading={loading}
              pageSize={pagination.pageSize}
              total={pagination.total}
            />
          </Spinner>
        </PageContentFontWrapper>
      </LargeCenteredLayout>
    );
  }
}

export default withComponentContext(withRouter(BackgroundTasksApp));

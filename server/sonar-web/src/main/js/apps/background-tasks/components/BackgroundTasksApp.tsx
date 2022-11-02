/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
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
import { debounce } from 'lodash';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  cancelAllTasks,
  cancelTask as cancelTaskAPI,
  getActivity,
  getStatus,
  getTypes,
} from '../../../api/ce';
import withComponentContext from '../../../app/components/componentContext/withComponentContext';
import ListFooter from '../../../components/controls/ListFooter';
import Suggestions from '../../../components/embed-docs-modal/Suggestions';
import { Location, Router, withRouter } from '../../../components/hoc/withRouter';
import { toShortNotSoISOString } from '../../../helpers/dates';
import { translate } from '../../../helpers/l10n';
import { parseAsDate } from '../../../helpers/query';
import { Task, TaskStatuses } from '../../../types/tasks';
import { Component, Paging, RawQuery } from '../../../types/types';
import '../background-tasks.css';
import { CURRENTS, DEBOUNCE_DELAY, DEFAULT_FILTERS } from '../constants';
import { mapFiltersToParameters, Query, updateTask } from '../utils';
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

const PAGE_SIZE = 100;

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
      () => {}
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
      this.stopLoading
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
      nextQuery.minSubmittedAt = toShortNotSoISOString(nextQuery.minSubmittedAt);
    }

    if (nextQuery.maxExecutedAt) {
      nextQuery.maxExecutedAt = toShortNotSoISOString(nextQuery.maxExecutedAt);
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

  handleShowFailing = () => {
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

  render() {
    const { component } = this.props;
    const { loading, pagination, types, tasks } = this.state;

    if (!types) {
      return (
        <div className="page page-limited">
          <i className="spinner" />
        </div>
      );
    }

    const status = this.props.location.query.status || DEFAULT_FILTERS.status;
    const taskType = this.props.location.query.taskType || DEFAULT_FILTERS.taskType;
    const currents = this.props.location.query.currents || DEFAULT_FILTERS.currents;
    const minSubmittedAt = parseAsDate(this.props.location.query.minSubmittedAt);
    const maxExecutedAt = parseAsDate(this.props.location.query.maxExecutedAt);
    const query = this.props.location.query.query || '';

    return (
      <div className="page page-limited">
        <Suggestions suggestions="background_tasks" />
        <Helmet defer={false} title={translate('background_tasks.page')} />
        <Header component={component} />

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
          types={types}
        />

        <Tasks
          component={component}
          loading={loading}
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
      </div>
    );
  }
}

export default withComponentContext(withRouter(BackgroundTasksApp));

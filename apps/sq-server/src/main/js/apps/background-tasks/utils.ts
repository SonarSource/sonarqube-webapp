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

import { toShortISO8601String } from '~sq-server-commons/helpers/dates';
import { ActivityRequestParameters, Task, TaskStatuses } from '~sq-server-commons/types/tasks';
import { ALL_TYPES, CURRENTS, STATUSES } from './constants';

export interface Query {
  currents: string;
  maxExecutedAt?: Date;
  minSubmittedAt?: Date;
  query: string;
  status: string;
  taskType: string;
}

export function updateTask(tasks: Task[], newTask: Task) {
  return tasks.map((task) => (task.id === newTask.id ? newTask : task));
}

export function mapFiltersToParameters(filters: Partial<Query> = {}) {
  const parameters: ActivityRequestParameters = {};

  if (filters.status === STATUSES.ALL) {
    parameters.status = [
      TaskStatuses.Pending,
      TaskStatuses.InProgress,
      TaskStatuses.Success,
      TaskStatuses.Failed,
      TaskStatuses.Canceled,
    ].join();
  } else if (filters.status === STATUSES.ALL_EXCEPT_PENDING) {
    parameters.status = [
      TaskStatuses.InProgress,
      TaskStatuses.Success,
      TaskStatuses.Failed,
      TaskStatuses.Canceled,
    ].join();
  } else {
    parameters.status = filters.status;
  }

  if (filters.taskType !== ALL_TYPES) {
    parameters.type = filters.taskType;
  }

  if (filters.currents !== CURRENTS.ALL) {
    parameters.onlyCurrents = true;
  }

  if (filters.minSubmittedAt) {
    parameters.minSubmittedAt = toShortISO8601String(filters.minSubmittedAt);
  }

  if (filters.maxExecutedAt) {
    parameters.maxExecutedAt = toShortISO8601String(filters.maxExecutedAt);
  }

  if (filters.query) {
    parameters.q = filters.query;
  }

  return parameters;
}

/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
// @flow
import { getJSON, postJSON, post } from '../helpers/request';
import throwGlobalError from '../app/utils/throwGlobalError';

/*::
type GetProjectActivityResponse = {
  analyses: Array<Object>,
  paging: {
    total: number,
    pageIndex: number,
    pageSize: number
  }
};
*/

/*::
type GetProjectActivityOptions = {
  project: string,
  category?: ?string,
  p?: ?number,
  ps?: ?number
};
*/

export function getProjectActivity(
  data /*: GetProjectActivityOptions */
) /*: Promise<GetProjectActivityResponse> */ {
  return getJSON('/api/project_analyses/search', data).catch(throwGlobalError);
}

/*::
type CreateEventResponse = {
  analysis: string,
  key: string,
  name: string,
  category: string,
  description?: string
};
*/

export function createEvent(
  analysis /*: string */,
  name /*: string */,
  category /*: ?string */,
  description /*: ?string */
) /*: Promise<CreateEventResponse> */ {
  const data /*: Object */ = { analysis, name };
  if (category) {
    data.category = category;
  }
  if (description) {
    data.description = description;
  }
  return postJSON('/api/project_analyses/create_event', data).then(r => r.event, throwGlobalError);
}

export function deleteEvent(event /*: string */) /*: Promise<*> */ {
  return post('/api/project_analyses/delete_event', { event }).catch(throwGlobalError);
}

export function changeEvent(
  event /*: string */,
  name /*: ?string */,
  description /*: ?string */
) /*: Promise<CreateEventResponse> */ {
  const data /*: Object */ = { event };
  if (name) {
    data.name = name;
  }
  if (description) {
    data.description = description;
  }
  return postJSON('/api/project_analyses/update_event', data).then(r => r.event, throwGlobalError);
}

export function deleteAnalysis(analysis /*: string */) /*: Promise<*> */ {
  return post('/api/project_analyses/delete', { analysis }).catch(throwGlobalError);
}

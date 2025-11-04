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

import { throwGlobalError } from '~adapters/helpers/error';
import { getJSON } from '~adapters/helpers/request';
import { axiosClient } from '~shared/helpers/axios-clients';
import { Paging } from '~shared/types/paging';
import { HttpStatus } from '~shared/types/request';
import { parseJSON, post } from '../helpers/request';
import { IdentityProvider } from '../types/types';
import {
  ChangePasswordResults,
  CurrentUser,
  HomePage,
  NoticeType,
  RestUserDetailed,
} from '../types/users';

const USERS_ENDPOINT = '/api/v2/users-management/users';

export function getCurrentUser(): Promise<CurrentUser> {
  return getJSON('/api/users/current', undefined, { bypassRedirect: true });
}

export function dismissNotice(notice: NoticeType) {
  return post('/api/users/dismiss_notice', { notice }).catch(throwGlobalError);
}

export function changePassword(data: {
  login: string;
  password: string;
  previousPassword?: string;
}) {
  return post('/api/users/change_password', data).catch(async (response: Response) => {
    if (response.status === HttpStatus.BadRequest) {
      const { result } = (await parseJSON(response)) as { result: ChangePasswordResults };

      return Promise.reject<ChangePasswordResults>(result);
    }

    return throwGlobalError(response);
  });
}

export function getIdentityProviders(): Promise<{
  identityProviders: IdentityProvider[];
}> {
  return getJSON('/api/users/identity_providers').catch(throwGlobalError) as Promise<{
    identityProviders: IdentityProvider[];
  }>;
}

export function getUsers(data: {
  active?: boolean;
  groupId?: string;
  'groupId!'?: string;
  managed?: boolean;
  pageIndex?: number;
  pageSize?: number;
  q: string;
  sonarLintLastConnectionDateFrom?: string;
  sonarLintLastConnectionDateTo?: string;
  sonarQubeLastConnectionDateFrom?: string;
  sonarQubeLastConnectionDateTo?: string;
}) {
  return axiosClient.get<{ page: Paging; users: RestUserDetailed[] }>(USERS_ENDPOINT, {
    params: data,
  });
}

export function postUser(data: {
  email?: string;
  login: string;
  name: string;
  password?: string;
  scmAccounts: string[];
}) {
  return axiosClient.post<RestUserDetailed>(USERS_ENDPOINT, data);
}

export function updateUser(
  id: string,
  data: Partial<Pick<RestUserDetailed, 'email' | 'name' | 'scmAccounts'>>,
) {
  return axiosClient.patch<RestUserDetailed>(`${USERS_ENDPOINT}/${id}`, data);
}

export function deleteUser({ id, anonymize }: { anonymize?: boolean; id: string }) {
  return axiosClient.delete(`${USERS_ENDPOINT}/${id}`, { params: { anonymize } });
}

export function setHomePage(homepage: HomePage): Promise<void | Response> {
  return post('/api/users/set_homepage', homepage).catch(throwGlobalError);
}

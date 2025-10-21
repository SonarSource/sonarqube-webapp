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

import { getGlobalSettingsUrl } from '../../../helpers/urls';
import { CallbackStateApp } from '../../../types/state-callback-handler';
import { getStateCallbackRedirectTo } from '../state-callback-handler';
import { getBaseUrl } from '../system';

describe('getStateCallbackRedirectTo', () => {
  it('should return navigation object to home page when no state is provided', () => {
    const searchParams = `?code=42`;

    const navigation = getStateCallbackRedirectTo(new URLSearchParams(searchParams));

    expect(navigation).toEqual({ pathname: getBaseUrl() });
  });

  it('should not navigate when app parameter is UNKNOWN', () => {
    const stateObject = btoa(JSON.stringify({ app: 'other', orgId: 'id' }));

    const navigation = getStateCallbackRedirectTo(
      new URLSearchParams(`?state=${stateObject}&code=123`),
    );

    expect(navigation.pathname).toEqual(getBaseUrl());
  });

  it('should navigate to the JIRA organization configuration page when app parameter is "jira"', () => {
    const stateObject = btoa(JSON.stringify({ app: CallbackStateApp.Jira }));
    const searchParams = `?state=${stateObject}&code=42`;

    const navigation = getStateCallbackRedirectTo(new URLSearchParams(searchParams));

    expect(navigation.pathname).toEqual(getGlobalSettingsUrl('jira').pathname);
    const navigationSearchParams = new URLSearchParams(navigation.search);
    expect(navigationSearchParams.get('category')).toEqual('jira');
    expect(navigationSearchParams.get('state')).toEqual(stateObject);
    expect(navigationSearchParams.get('code')).toEqual('42');
  });
});

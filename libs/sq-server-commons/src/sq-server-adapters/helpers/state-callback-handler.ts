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

import { Path } from 'react-router-dom';
import { isStringDefined } from '~shared/helpers/types';
import { getGlobalSettingsUrl } from '../../helpers/urls';
import { CallbackStateApp, CallbackStateBase } from '../../types/state-callback-handler';
import { getBaseUrl } from './system';

export function getStateCallbackRedirectTo(searchParams: URLSearchParams): Partial<Path> {
  const state = searchParams.get('state');

  if (!isStringDefined(state)) {
    return { pathname: getBaseUrl() };
  }

  const stateObj = JSON.parse(atob(state)) as CallbackStateBase;

  switch (stateObj.app) {
    case CallbackStateApp.Jira: {
      return getGlobalSettingsUrl('jira', Object.fromEntries(searchParams.entries()));
    }
    default: {
      return { pathname: getBaseUrl() };
    }
  }
}

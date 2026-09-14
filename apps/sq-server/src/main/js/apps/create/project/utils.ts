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

import { Location } from '~shared/types/router';
import { PROJECT_KEY_INVALID_CHARACTERS } from '~sq-server-commons/helpers/projects';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import {
  CallbackStateApp,
  GithubProjectImportCallbackState,
} from '~sq-server-commons/types/state-callback-handler';

export function tokenExistedBefore(error?: string) {
  return !error?.includes('is missing');
}

export function getSanitizedProjectKey(projectKey: string) {
  return projectKey.trim().replace(PROJECT_KEY_INVALID_CHARACTERS, '-');
}

export function isProjectSetupDone(location: Location) {
  return location.query?.setncd === 'true';
}

export function getAlmKey(location: Location) {
  return location.query.mode as AlmKeys;
}

// Decodes redirectToGithub's `state` param back into location.query. Returns whether it matched.
export function resolveGithubProjectImportState(location: Location): boolean {
  const { state } = location.query;
  if (typeof state !== 'string' || state === '') {
    return false;
  }

  let decoded: GithubProjectImportCallbackState | null;
  try {
    decoded = JSON.parse(atob(state)) as GithubProjectImportCallbackState | null;
  } catch {
    return false;
  }

  // JSON.parse can succeed on valid-but-non-object payloads (e.g. atob('bnVsbA==') === 'null'),
  // and typeof null === 'object', so both must be checked before reading decoded.app below.
  if (decoded === null || typeof decoded !== 'object') {
    return false;
  }

  if (decoded.app !== CallbackStateApp.GithubProjectImport) {
    return false;
  }

  location.query.mode = decoded.mode;
  location.query.dopSetting = decoded.dopSetting;
  if (decoded.mono) {
    location.query.mono = 'true';
  }
  if (decoded.redirect) {
    location.query.redirect = decoded.redirect;
  }
  delete location.query.state;
  return true;
}

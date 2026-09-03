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

import { http } from 'msw';
import { AbstractServiceMock } from '~shared/api/mocks/AbstractServiceMock';
import { AlmKeys } from '../../types/alm-settings';
import {
  PermissionCheckResource,
  PermissionCheckStatus,
  PermissionChecksResponse,
} from '../../types/dop-translation';

export interface PermissionChecksServiceData {
  /** Response for GET /api/v2/dop-translation/permission-checks[?project=...] */
  response: PermissionChecksResponse;
}

/**
 * Mock for the DevOps Platform permission-check endpoint (SONAR-31626). Default response is a
 * single SUFFICIENT GitHub check so consumers that gate on "no DOP binding" or "DOP misconfigured"
 * render the happy path without extra setup. Override via `setResponse` for the specific tests
 * that assert warning/disabled behavior.
 */
export class PermissionChecksServiceMock extends AbstractServiceMock<PermissionChecksServiceData> {
  static readonly defaultCheck: PermissionCheckResource = {
    key: 'github-config',
    type: AlmKeys.GitHub,
    status: PermissionCheckStatus.Sufficient,
  };

  /** A GitLab check bound with a Project/Group Access Token instead of a Personal Access Token. */
  static readonly unsupportedTokenTypeCheck: PermissionCheckResource = {
    key: 'gitlab-config',
    type: AlmKeys.GitLab,
    status: PermissionCheckStatus.UnsupportedTokenType,
  };

  static readonly defaultData: PermissionChecksServiceData = {
    response: { permissionChecks: [PermissionChecksServiceMock.defaultCheck] },
  };

  constructor(initialData: PermissionChecksServiceData = PermissionChecksServiceMock.defaultData) {
    super(initialData);
  }

  setResponse = (response: PermissionChecksResponse) => {
    this.data.response = response;
  };

  handlers = [
    http.get('/api/v2/dop-translation/permission-checks', () => this.ok(this.data.response)),
  ];
}

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
import { HttpStatus } from '~shared/types/request';
import { UserBindingType } from '../../types/integrations';
import { USER_BINDINGS_ENDPOINT_PATH } from '../integrations';

export interface IntegrationsServiceData {}

export const INVALID_CODE = 'invalid_code';

export class IntegrationsServiceMock extends AbstractServiceMock<IntegrationsServiceData> {
  handlers = [
    /*
     * User bindings
     */
    http.post(USER_BINDINGS_ENDPOINT_PATH, async ({ request }) => {
      const body = (await request.json()) as { bindingData: Record<string, unknown>; type: string };
      const { type, bindingData } = body;

      switch (type) {
        case UserBindingType.Slack: {
          const { code } = bindingData as { code: string };

          if (code === INVALID_CODE) {
            return this.errorsWithStatus(HttpStatus.BadRequest, 'Invalid code');
          }

          return this.ok({ bindingData: { appId: 'app-id', teamId: 'team-id' }, type });
        }
        default:
          return this.errorsWithStatus(HttpStatus.BadRequest, 'Incorrect user binding type');
      }
    }),
  ];
}

export const integrationsServiceDefaultDataset: IntegrationsServiceData = {};
